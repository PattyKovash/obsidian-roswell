## Background:

BaubleBar needed a way to apply a configurable shipping discount at checkout for employees and affiliates. Two eligibility mechanisms were required: a discount code substring match (so a shared code like `BBEMP-SUMMER` triggers the discount for any code containing `BBEMP`, case-insensitive; multiple match strings can be configured) and a Shopify customer tag check (so tagged buyers receive the discount automatically without entering a code). Either gate can be used alone or both can be required simultaneously.

The native Shopify discount UI does not support custom gating logic, configurable discount amounts, or delivery option targeting from within the admin discount settings page. Checkout Blocks did not have a gating based on discount code entered either. A custom Shopify Discount Function and UI extension was required.

---

## Necessary Info (Design/Documentation):

- **Affected surface:** Shopify Admin → Discounts → Create discount. The function appears as a selectable discount type. Configuration UI renders inline on the create/edit page — no separate app page.
- **Combination settings are a Shopify platform constraint:** the function cannot observe codes entered for discounts not configured to stack with shipping discounts. This is not a bug — it is how Shopify populates `enteredDiscountCodes`. Merchant setup instructions must call this out explicitly.
- **No new design required:** UI uses native Shopify admin Polaris web components rendered via the `s-function-settings` extension.
- **Client-facing setup guide:** `obs-roswell/BAUBAR/How to Configure the Employee Shipping Discount.md`
- **App:** CE extension (baublebar-ext / baublebar-ext-staging)

---

## Constraints / Scope:

**In scope:**
- Discount code substring match gate (case-insensitive, list of match strings, any-match)
- Buyer tag gate (case-sensitive, any-match via Shopify's `hasAnyTag`)
- Configurable discount type (percentage or fixed amount) and value
- Delivery option filtering by title contains (case-sensitive substring)
- Discount UI for all configurable fields

---

---

## Dev Notes:

- Use `Option<T>` for any config field that may be absent from the saved JSON — typed (non-Option) fields throw a deserialization error when the key is missing.
- `hasAnyTag(tags: $buyerTags)` requires `[extensions.input.variables]` in the toml; buyer tags are injected as a GraphQL variable at query time, not read from the metafield at function runtime.
- Use `DeliveryGroupTarget` (by group ID) when targeting all options — avoids iterating individual option handles.
- Vitest: `runFunction` from `@shopify/shopify-function-test-helpers` tries to load `dist/index.wasm` (base64-encoded build artifact) as a binary and fails. Use `shopify app function run --json` via `execSync` instead. Reference pattern: `HYPER_CE_EXT/extensions/rs-dc-hide-by-tag-percent-threshold/tests/default.test.js`.
- Required scopes: `write_discounts`, `read_discounts` (triggers OAuth re-auth on next deploy).

---

## Implementation Notes:

**Handles and metafield**

- Shopify API version: `2026-04`
- Function target: `cart.delivery-options.discounts.generate.run`
- Function handle: `dc-shipping-by-tag-code`
- UI extension handle: `dcui-shipping-by-tag-code`
- Config metafield: namespace `$roswell:dc-shipping-by-tag-code`, key `config`, type `json`
- Buyer tag evaluation: `hasAnyTag(tags: $buyerTags)` — Shopify evaluates the boolean; the function reads the result only

**Key files**

| File | Purpose |
|---|---|
| `extensions/dc-shipping-by-tag-code/src/cart_delivery_options_discounts_generate_run.rs` | Function logic |
| `extensions/dc-shipping-by-tag-code/src/cart_delivery_options_discounts_generate_run.graphql` | Input query |
| `extensions/dc-shipping-by-tag-code/shopify.extension.toml` | Extension config; `[extensions.input.variables]` injects `$buyerTags` |
| `extensions/dc-shipping-by-tag-code/tests/default.test.js` | 25 Vitest fixture tests |
| `extensions/dc-shipping-by-tag-code/tests/fixtures/` | 25 JSON fixture files (a1–h1, b7–b8) |
| `extensions/dcui-shipping-by-tag-code/src/DiscountFunctionSettings.jsx` | Admin UI extension |

**Config struct**

```rust
#[derive(Deserialize, Default)]
#[shopify_function(rename_all = "camelCase")]
pub struct Configuration {
    pub discount_code_matches: Vec<String>,       // case-insensitive (both sides uppercased), any-of-list check against entered codes
    pub buyer_tags: Vec<String>,
    pub discount_type: Option<String>,               // "percentage" | "fixed" — absent defaults to percentage
    pub discount_value: Option<f64>,                 // absent defaults to 100
    pub delivery_option_matches: Option<Vec<String>>, // absent or empty = all options
}
```

**Input query**

```graphql
query Input($buyerTags: [String!]) {
  enteredDiscountCodes { code }
  cart {
    deliveryGroups {
      id
      deliveryOptions { handle title }
    }
    buyerIdentity {
      customer { hasAnyTag(tags: $buyerTags) }
    }
  }
  discount {
    metafield(namespace: "$roswell:dc-shipping-by-tag-code", key: "config") {
      jsonValue
    }
  }
}
```

**Targeting logic**

- `option_matches.is_empty()` → one `DeliveryGroupTarget` per group (all options discounted)
- `option_matches` non-empty → all matching `DeliveryOptionTarget` handles collected into one candidate's `targets` array; no operations returned if no handle matches

**UI metafield save format**

```json
{
  "discountCodeMatches": ["BBEMP"],
  "buyerTags": ["Employee", "Affiliate"],
  "discountType": "percentage",
  "discountValue": 100,
  "deliveryOptionMatches": []
}
```

`deliveryOptionMatches` saves as `[]` when scope is All; the function treats `[]` and absent identically.

---

## Acceptance Criteria / Test Coverage:

Run automated tests from `extensions/dc-shipping-by-tag-code/`:

```
npm test
```

25 fixture tests, all passing. Scenarios requiring manual testing are noted below the tables.

| # | Scenario | metafield | discountCodeMatches | buyerTags | Expected | Dev |
|---|---|---|---|---|---|---|
| A1 | No metafield | null | — | — | No discount | ✅ |
| A2 | Both eligibility fields empty | present | `[]` | `[]` | No discount | ✅ |

| # | Scenario | discountCodeMatches | Entered codes | buyerTags | hasAnyTag | Expected | Dev |
|---|---|---|---|---|---|---|---|
| B1 | Code and tag both match (full config) | `["BBEMP"]` | `BBEMP-employee123` | `["employee"]` | true | 100% discount on all options | ✅ |
| B2 | Code does not match | `["BBEMP"]` | `SALE10` | `["employee"]` | true | No discount | ✅ |
| B3 | No codes entered | `["BBEMP"]` | `[]` | `["employee"]` | true | No discount | ✅ |
| B4 | Case-insensitive — lowercase match string matches Shopify-uppercased code | `["rs-test"]` | `RS-TEST-ORDER-2026` | `[]` | — | 100% discount | ✅ |
| B5 | Code-only config — code matches, no tag gate | `["BBEMP"]` | `BBEMP-employee123` | `[]` | false | 100% discount | ✅ |
| B6 | Substring — match string found mid-code | `["BBEMP"]` | `RS-BBEMP-TEST` | `[]` | — | 100% discount | ✅ |
| B7 | Multiple entered codes — second code contains match string | `["BBEMP"]` | `RS-TEST-ORDER-2026`, `BBEMP-EMPLOYEE123` | `[]` | — | 100% discount | ✅ |
| B8 | Multiple match strings — first needle misses, second matches | `["NOMATCH", "BBEMP"]` | `BBEMP-TEST` | `[]` | — | 100% discount | ✅ |

| # | Scenario | discountCodeMatches | Entered codes | buyerTags | hasAnyTag | Expected | Dev |
|---|---|---|---|---|---|---|---|
| C1 | Tag-only config — buyer has matching tag | `[]` | `[]` | `["employee"]` | true | 100% discount | ✅ |
| C2 | Buyer does not have matching tag | `["BBEMP"]` | `BBEMP-employee123` | `["employee"]` | false | No discount | ✅ |
| C3 | Guest checkout — no account | `["BBEMP"]` | `BBEMP-employee123` | `["employee"]` | null | No discount | ✅ |
| C4 | `buyerIdentity` absent | `["BBEMP"]` | `BBEMP-employee123` | `["employee"]` | null | No discount | ✅ |
| C5 | Wrong tag casing on real account | `[]` | `[]` | `["Employee"]` | — | No discount | |

| # | Scenario | deliveryOptionMatches | Delivery options | Expected | Dev |
|---|---|---|---|---|---|
| D1 | No filter configured | absent / `[]` | `["Standard Shipping"]` | DeliveryGroup target — all options | ✅ |
| D2 | Match string in title; non-matching excluded | `["Standard"]` | `["Standard Shipping", "Express Shipping"]` | "Standard Shipping" targeted only | ✅ |
| D3 | No option title matches | `["Standard"]` | `["Express Shipping"]` | No discount | ✅ |
| D4 | Case-sensitive — lowercase match vs title-case option | `["standard"]` | `["Standard Shipping"]` | No discount | ✅ |
| D5 | One match string matches multiple titles | `["Standard"]` | `["Standard (5-7 Business Days)", "Expedited (2-3 Business Days)", "TikTok Standard"]` | Both Standard options in one candidate | ✅ |
| D6 | Multiple match strings; unmatched option excluded | `["Standard", "Express"]` | `["Standard Shipping", "Express Shipping", "Ground Shipping"]` | Standard and Express targeted; Ground excluded | ✅ |
| D7 | Non-matched options remain undiscounted | `["Standard"]` | `["Standard Shipping", "Express Shipping"]` | "Standard Shipping" only | ✅ |

| # | Scenario | discountType | discountValue | Expected | Dev |
|---|---|---|---|---|---|
| E1 | Fixed amount | `"fixed"` | `10` | $10 fixed discount | ✅ |
| E2 | Explicit percentage below 100% | `"percentage"` | `50` | 50% discount | ✅ |
| E3 | No type or value — defaults to 100% | absent | absent | 100% (free shipping) | ✅ |
| E4 | Type absent, value present — treated as percentage | absent | `75` | 75% discount | ✅ |

**F — Native Discount Eligibility (Shopify-owned, manual only)**

| # | Scenario | Expected | Dev |
|---|---|---|---|
| F1 | Discount scoped to specific customers — ineligible buyer | Discount not available at checkout | |
| F2 | Discount scoped to customer segment — buyer outside segment | Discount not available at checkout | |

**G — Combination Settings (manual only)**

| # | Scenario | Expected | Dev |
|---|---|---|---|
| G1 | Code's discount not set to combine with shipping | `enteredDiscountCodes` empty — no discount | |
| G2 | Code's discount set to combine with shipping | Code visible to function — discount applies | |
| G3 | Employee discount not set to combine with code's type | no discount | |

**H — Integration**

| # | Scenario | discountCodeMatches | buyerTags | discountType | deliveryOptionMatches | Expected | Dev |
|---|---|---|---|---|---|---|---|
| H1 | Multiple delivery groups — no option filter | `["BBEMP"]` | `[]` | percentage / 100 | `[]` | One operation per group | ✅ |
| H2 | End-to-end: code + tag + combination settings correct | `["BBEMP"]` | `["Employee"]` | percentage / 100 | `[]` | All options free | |
| H3 | End-to-end: combination settings missing | `["BBEMP"]` | `["Employee"]` | percentage / 100 | `[]` | No discount | |
| H4 | End-to-end: fixed discount + specific filter + code | `["BBEMP"]` | `[]` | fixed / 2 | `["Standard"]` | $2 off Standard only | |

### Scenarios requiring manual test

The following cannot be replicated via function fixtures. All require a real checkout session on staging.

1. **C5** — Buyer tag case-sensitivity: `hasAnyTag` is evaluated by Shopify's GraphQL engine; a real customer account with a mismatched-case tag confirms Shopify enforces this correctly
2. **F1–F3** — Native discount eligibility: Shopify evaluates customer scoping, segments, and usage limits before the function runs; the function is never called for ineligible buyers
3. **G1–G3** — Combination settings: whether Shopify populates `enteredDiscountCodes` based on admin-configured combination settings requires real discounts and a real checkout
4. **H2–H4** — End-to-end integration: component behaviors are covered by automated tests; full checkout session confirms the complete merchant and buyer experience

---

## Bugs from QA:

TBD

---

## Clarifying Questions:

None outstanding. Feature is implemented, tested, and documented.
