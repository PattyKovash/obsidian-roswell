## Background:

- Raised by the client (see original ticket HYPER-12116959537). A logic conflict exists between Intuitive Shipping and the Roswell/Shopify discount function: when a sitewide sale beats a Pro member's tier discount, Shopify correctly drops the Pro function and applies the retail sale — but Intuitive Shipping reads only the static customer account tag (e.g. `outdoor-pro`) and still withholds the "Free Shipping Over $300" rate, even though the customer is now effectively purchasing as a retail customer.

- Root cause: Intuitive Shipping's "Free Shipping Over $300" scenario uses a static customer-tag exclusion. It cannot see which discount actually won at checkout, so it penalizes tagged customers regardless of the active discount type.

- Decision: implement a **Shopify Delivery Customization Function** (`cart.delivery-options.transform.run`) that hides specified delivery options based on configurable thresholds: cart total, per-line-item percent discount, customer tags, and an optional date window. Configuration is stored as a metafield and managed via the GraphiQL app (no admin UI in Phase 1).

- The function lives at `extensions/rs-dc-hide-by-tag-percent-threshold/` in the HYPER_CE_EXT repo. It is built in Rust, targets the `cart.delivery-options.transform.run` API, and reads its config from a delivery customization metafield at namespace `$roswell:dc`, key `config`.

## Necessary Info (Design/Documentation):

- **Function repo:** [https://github.com/roswell-studios/HYPER_CE_EXT](https://github.com/roswell-studios/HYPER_CE_EXT) — branch `feature/HYPER-ISSUE-12116959537-delivery-customization`.

- **Staging app:** [Hyper staging app](https://dev.shopify.com/dashboard/129344656/apps/344560730113), installed on the [Hyperlite staging store](https://admin.shopify.com/store/hyperlite-staging). 

- **Production app** (active functions installed): [https://dev.shopify.com/dashboard/129344656/apps/343484006401](https://dev.shopify.com/dashboard/129344656/apps/343484006401). Will deploy once UAT passed.

- **Metafield surface:** namespace `$roswell:dc`, key `config`, type `json` on the function node. Set via the GraphiQL app on the staging store. Roswell can use CLI or discount create UI to run Graphql query & mutations.

- **Shopify limitation:** Delivery customization functions cannot see the name, code, or source app of a discount. The function infers whether the pro discount is active by comparing `line.cost.totalAmount` (line total after line-level discounts are applied) against `line.cost.subtotalAmount` (pre-discount line total). Shopify's `totalAmount` naturally excludes order-level discount codes — only line-targeted discounts reduce it. An effective per-line discount strictly above the configured threshold is assumed to be pro pricing.

## Constraints / Scope:

- **In scope:** the Rust delivery customization function, its GraphQL input query, build config, and fixture test suite.

- **Out of scope (Phase 1):** an embedded admin UI for configuring the delivery customization. Configuration is done manually via GraphiQL. A future ticket will add the UI.

- **Out of scope:** modifying Intuitive Shipping scenarios directly. This function is a parallel Shopify-native layer — it does not replace or require changes to Intuitive Shipping.

- **Files this ticket may touch:**
  - `extensions/rs-dc-hide-by-tag-percent-threshold/src/cart_delivery_options_transform_run.rs`
  - `extensions/rs-dc-hide-by-tag-percent-threshold/src/cart_delivery_options_transform_run.graphql`
  - `extensions/rs-dc-hide-by-tag-percent-threshold/shopify.extension.toml`
  - `extensions/rs-dc-hide-by-tag-percent-threshold/tests/fixtures/*.json`

- **Files this ticket must NOT touch:** discount-by-tag function, admin UI extension, Prisma schema, any route files.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** |
|---|---|---|---|
| 1 | When no metafield is configured on the delivery customization, the function returns no operations and no delivery options are hidden. | | ✅ |
| 2 | When `targetStrings` is an empty array `[]`, the function returns no operations regardless of all other configuration or cart state. | | ✅ |
| 3 | When the current shop local time is before the configured `startDateTime`, the function returns no operations. | | ✅ |
| 4 | When the current shop local time is at or past the configured `endDateTime`, the function returns no operations. | | ✅ |
| 5 | When sentinel datetimes are used (`1970-01-01T00:00:00` start / `2099-12-31T23:59:59` end), the function is always active and hides matched delivery options on every qualifying checkout. | | ✅ |
| 6 | When `startDateTime` is the sentinel `1970-01-01T00:00:00` and a real `endDateTime` is set, the function is active for any checkout occurring before that end date. | | ✅ |
| 7 | When only `startDateTime` is configured (no `endDateTime` in the metafield), the function is active for any checkout occurring after that start date. The GraphQL query defaults `endDateTime` to `2099-12-31T23:59:59`. | | ✅ |
| 8 | Date/time fields stored in the metafield config are evaluated against the shop's local time via `shop.localTime.dateTimeAfter` / `dateTimeBefore` — verify on staging that a checkout within the configured window is affected and one outside it is not. | | ✅ |
| 9 | When `customerTags` is not configured (null or absent from the metafield), the function applies threshold logic to all checkouts regardless of customer identity or login state. | | ✅ |
| 10 | When `customerTags` is configured and the logged-in customer has at least one tag matching the configured list, the function proceeds to threshold checks. | | ✅ |
| 11 | When `customerTags` is configured and the logged-in customer has no matching tag, the function returns no operations. | | ✅ |
| 12 | When `customerTags` is configured and the buyer is a guest (unauthenticated, no customer account), the function returns no operations. | | ✅ |
| 13 | When `customerTags` is configured and `buyerIdentity` is entirely absent (null, not merely unauthenticated), the function returns no operations. | | ✅ |
| 14 | When `cartThreshold` is configured and the cart subtotal is strictly below it, the function returns no operations. | | ✅ |
| 15 | When `cartThreshold` is configured and the cart subtotal exactly equals the threshold value, the condition is met (>= behavior) and the function proceeds. | | ✅ |
| 16 | When `cartThreshold` is not configured, the function proceeds to percent threshold checks regardless of cart total. | | ✅ |
| 17 | When `percentThreshold` is not configured, the function hides all delivery options matching `targetStrings` whenever all prior gates pass — no per-line-item discount check is required. | | ✅ |
| 18 | When `percentThreshold` is configured and at least one cart line item's effective discount (`(subtotalAmount - totalAmount) / subtotalAmount * 100`, rounded to 2dp) is strictly above the threshold, the function hides matched delivery options. A line exactly at the threshold rounds to the threshold value and does not trigger hiding — assumed to be the sitewide rate. | | ✅ |
| 19 | When `percentThreshold` is configured and a line item has both a line-level discount and an order-level discount code, `totalAmount` reflects only the line-level portion — Shopify does not include order-level codes in `totalAmount`. The order-level discount is automatically excluded from the threshold calculation. | | ✅ |
| 20 | When `percentThreshold` is configured and every line item's effective discount (via `totalAmount`) is at or below the threshold, the function returns no operations. | | ✅ |
| 21 | When `percentThreshold` is configured but the cart has no line items, the function returns no operations (`.any()` on an empty iterator returns false). | | ✅ |
| 22 | When the cart has multiple line items and at least one has an effective discount strictly above the percent threshold, all delivery options matching `targetStrings` are hidden. | | ✅ |
| 23 | When no delivery option title contains any configured `targetString` as a substring, the function returns no operations and no options are hidden. | | ✅ |
| 24 | When multiple `targetStrings` are configured and multiple delivery options each match a different string, every matched option is hidden in a single response. | | ✅ |
| 25 | Title matching is case-sensitive: a `targetString` that differs from the delivery option title only in letter casing does not produce a match. | | ✅ |
| 26 | Title matching uses substring containment: a `targetString` that is a partial substring of a longer delivery option title still triggers a hide operation for that option. | | ✅ |
| 27 | Full integration scenario: an `outdoor-pro`-tagged customer, cart subtotal ≥ $300, with at least one line item discounted strictly above 15% at the line level, within an active date window → "Free Shipping Over $300" is hidden and "Standard Shipping" remains visible. | | ✅ |
| 28 | A retail customer (authenticated, no matching tag) with an otherwise qualifying cart (≥ cart threshold, > percent threshold, active date window) does NOT have the free shipping option hidden when `customerTags` is configured. | |✅ |
| 29 | When `devMode` is `true` and the buyer is an authenticated customer with the `rs-dev` tag, the function runs through its full logic and hides matched delivery options. | | ✅ |
| 30 | When `devMode` is `true` and the buyer is a guest (not authenticated), the function returns no operations. | | ✅ |
| 31 | When `devMode` is `true` and the buyer is authenticated but does not have the `rs-dev` tag, the function returns no operations. | | ✅ |
| 32 | When `devMode` is `false` or absent, the dev-mode gate is bypassed entirely and all customers are subject to the normal function logic (no `rs-dev` tag required). | | ✅ |
| 33 | All seven configuration fields (`targetStrings`, `cartThreshold`, `percentThreshold`, `customerTags`, `startDateTime`, `endDateTime`, `devMode`) can be set and updated on the staging store via the GraphiQL app without re-deploying the extension — changes take effect on the next checkout. | |✅ |
| 34 | Delivery options that do not match any configured `targetString` remain visible in checkout even when the function hides other options in the same delivery group. | | ✅ |
| 35 | Multi-line cart where Shopify applies the sitewide sale rate (15%) to all line items because it beats the pro discount — effective discount on every line rounds to exactly the threshold → no options hidden. | Test setup: 1 tent + 1 pack (qty 1 each), pro-member tagged. Shopify applies 15% sitewide to both because it's the higher discount. The function should allow free shipping. | ✅ |
| 36 | Multi-line cart where Shopify applies the pro discount to at least one line item because it beats the sitewide rate — effective discount on that line is strictly above the threshold → matched options hidden. | Test setup: 1 tent + 2 packs (qty 1 tent, 2 packs), pro-member tagged. Shopify determines the pro discount is greater on the pack line. The function should hide free shipping. Note: qty affects which discount Shopify applies — the function itself only checks the resulting line discount percentage, not qty. | ✅ |

## Dev Notes:

- **Extension handle:** `rs-dc-hide-by-tag-percent-threshold`
- **API target:** `cart.delivery-options.transform.run` (API version `2026-04`)
- **Metafield:** namespace `$roswell:dc`, key `config`, type `json`

- **Key files:**
  - Main logic: `extensions/rs-dc-hide-by-tag-percent-threshold/src/cart_delivery_options_transform_run.rs`
  - GraphQL input query: `extensions/rs-dc-hide-by-tag-percent-threshold/src/cart_delivery_options_transform_run.graphql`
  - Extension config: `extensions/rs-dc-hide-by-tag-percent-threshold/shopify.extension.toml`
  - Fixture tests: `extensions/rs-dc-hide-by-tag-percent-threshold/tests/fixtures/*.json` (34 fixtures)

- **Build & test:**
  ```bash
  cd extensions/rs-dc-hide-by-tag-percent-threshold
  npx vitest run      # runs all fixture-based unit tests
  bash build.sh       # compiles to WASM for deploy
  ```

- **Configuration shape** (metafield `jsonValue`):
  ```json
  {
    "targetStrings": ["Free Shipping Over $300"],
    "cartThreshold": 300.0,
    "percentThreshold": 15.0,
    "customerTags": ["outdoor-pro", "wholesale", "pro-member", "hyper-pro"],
    "startDateTime": "2026-06-01T00:00:00",
    "endDateTime": "2026-07-31T23:59:59",
    "devMode": false
  }
  ```
  All fields except `targetStrings` are optional. `startDateTime` and `endDateTime` may be omitted from the config JSON — the GraphQL query defaults to `"1970-01-01T00:00:00"` and `"2099-12-31T23:59:59"` respectively, which means the function is always active. Include them only when you need a specific date window.

- **Date/time handling:** `startDateTime` and `endDateTime` are passed as GraphQL variables to `shop.localTime.dateTimeAfter` / `dateTimeBefore`. The comparison happens in the shop's local timezone — store the times in whatever local time you intend, not UTC-shifted.

- **Dev mode gate** (lines 32–43 of `cart_delivery_options_transform_run.rs`): when `devMode: true`, the function short-circuits unless the buyer is both authenticated AND has the customer tag `rs-dev`. This allows safe testing on staging/production without affecting real customers.

- **Cart threshold calculation:** sums `line.cost.subtotalAmount` per line — the pre-discount line total from Shopify. This matches Intuitive Shipping's "Total" calculation, so a $499 item discounted down to $299 still counts as $499 toward the threshold.

- **Percent threshold calculation:** uses `(subtotalAmount - totalAmount) / subtotalAmount * 100.0` per line. `totalAmount` is the line total after line-level discounts — Shopify automatically excludes order-level discount codes from it. Result is rounded to 2 decimal places before comparing to avoid floating-point representation errors — e.g. `224.55 / 1497.0 * 100` evaluates to slightly above `15.0` in f64 even though the math is exactly 15%; without rounding this incorrectly triggers hiding. Check is strictly above (`>`): a line exactly at the threshold is assumed to be at the sitewide rate, not pro pricing. Lines with zero or negative subtotal are skipped. Uses `.any()` — one qualifying line triggers hiding.

- **Deploy to staging:**
  ```bash
  npm run deploy   # targets staging app — confirm shopify.app.toml points at staging before running
  ```

## Bugs from QA:

- TBD

## Clarifying Questions:

- For QA item 8 (date window on staging): what date range should be configured in the staging metafield for the initial QA pass — should it span today's date, or should the tester configure it ad hoc?
- For QA items 27–28 (integration test with real discount): the client noted this requires an active automatic sitewide discount running simultaneously with the delivery customization function. Should QA create a manual automatic discount on staging for this test, or will dev set one up?
- Is the `rs-dev` customer tag (`devMode` gate) already present on any staging customer accounts, or does QA need to add it manually before testing items 29–31?
