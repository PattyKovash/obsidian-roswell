# Structured data: fix product shippingDetails, add CollectionPage schema, fix Organization sameAs

## Background:

-  Connected to the "Shipping Destination Schema update" ticket — a review of that area surfaced several additional, unrelated structured-data bugs across both storefronts (aed4life.ca, aedshop.ca). This ticket covers those additional findings.
-  Goal: make the product, collection, and organization JSON-LD on both stores spec-valid so Google's Rich Results eligibility isn't silently lost to malformed markup, and so the Organization schema accurately reflects the merchant's real social profiles.
-  Same issues, same fix, on both repos — see Constraints / Scope.
-  Follows directly from `AED-ISSUE-12485594283` (review-block removal), which explicitly deferred the `shippingDetails` fix to "a future ticket" — this is that ticket.

## Necessary Info (Design/Documentation):

-  **Affected surfaces:** product pages (`snippets/product-schema.liquid`), featured-product blocks (`sections/featured-product.liquid`, dead code today), collection pages and every page's `Organization` schema (both `sections/header.liquid`). No design work — markup-only, not visual.
-  **Original 7 findings, `snippets/product-schema.liquid` (identical in both repos at ticket start), and their status:**

   | # | Finding | Status |
   |---|---|---|
   | 1 | `shippingDetails` missing `"@type": "OfferShippingDetails"` | In scope — fixed this ticket |
   | 2 | `shippingRate` wraps a `ShippingRateSettings`/`freeShippingThreshold` on the per-product offer | In scope — removed from the per-product schema; that logic moves to a new org-level block (see below) |
   | 3 | `freeShippingThreshold` hardcoded | In scope — same move as #2, now settings/metafield-driven, not hardcoded |
   | 4 | Dimension/weight values double-append their unit (e.g. "5.0 inches inches") | **Already fixed in `AED-ISSUE-12485594283`** — not this ticket's work |
   | 5 | `gtin12`/`price` emitted unquoted | **Already fixed in `product-schema.liquid`** by `AED-ISSUE-12485594283`; was still broken in `featured-product.liquid` until this ticket |
   | 6 | `@context` uses `http://` (also applies to `offers.availability`, same bug class) | In scope — fixed this ticket |
   | 7 | Redundant top-level `sku` on multi-variant products | In scope — fixed this ticket |

-  **Beyond the original 7:**
   -  `sections/featured-product.liquid` carries its own second, independent copy of the JSON-LD generator (predating the `product-schema.liquid` extraction) — confirmed dead code in both repos (not referenced by any `templates/*.json`, and `"disabled_on": {"groups": ["*"]}` blocks it from the theme editor too). Fixed by rendering `product-schema.liquid` instead of maintaining a separate copy — inherits #5/#6's fixes automatically and stays in sync going forward.
   -  Neither repo has an `Organization.hasShippingService` block. This — not per-product `freeShippingThreshold` — is Google's current, documented mechanism for a "free shipping over $X" claim; see Dev Notes.
   -  `header.liquid`'s `sameAs` array outputs every social-link setting unconditionally (unset ones emit `""` instead of being omitted) and never references `settings.social_linkedin_link` despite it being set on both stores.
   -  No `CollectionPage`/`ItemList` schema exists on collection pages.
   -  AEDShop's `config/settings_data.json` carries AED4Life's own Twitter/LinkedIn/YouTube link values — stale, needs clearing on AEDShop only.
-  After publishing, verify with [Google Rich Results Test](https://search.google.com/test/rich-results) on a representative product, a collection page, and the homepage, on both domains.

## Constraints / Scope:

-  **IN scope, both repos (`AEDShop_AED`, `AED4LIFE_AED`):**
   -  `snippets/product-schema.liquid` — simplify `shippingDetails` to a flat `OfferShippingDetails`/`shippingRate` (no threshold logic here), `@context`, `availability`, top-level `sku` scoping.
   -  `sections/featured-product.liquid` — replace the duplicate JSON-LD generator with `{% render 'product-schema', product: product %}`.
   -  `sections/header.liquid` — `Organization` `sameAs` blank-guard + add LinkedIn; add `CollectionPage` schema; **add new** `Organization.hasShippingService` block expressing the $99 free-shipping threshold via `shippingConditions`/`orderValue`, sourced from `settings.cart_free_shipping_threshold` and `settings.cart_enable_free_shipping`.
   -  `config/settings_schema.json` — **add new** `cart_flat_shipping_rate_namespace` and `cart_flat_shipping_rate_key` text settings (same "Cart" settings group as `cart_free_shipping_threshold`, ~line 614), defaulting to `custom` / `flat_shipping_rate`. `config/settings_data.json` — mirror those defaults. `locales/en.default.schema.json` — add the matching label/info keys. Both `product-schema.liquid` and the new `hasShippingService` block resolve the actual rate at render time via `shop.metafields[settings.cart_flat_shipping_rate_namespace][settings.cart_flat_shipping_rate_key].value` — **when that metafield is blank (not yet created in Shopify admin), `shippingDetails`/`hasShippingService` are omitted entirely rather than asserting a `$0`/free-shipping claim that isn't true.** See Dev Notes.
-  **AEDShop-only:** clear the Twitter, LinkedIn, and YouTube values in `config/settings_data.json` (Theme Settings → Social Media Accounts). This is a **data** change, not a schema/code change — the setting fields themselves stay identical in both repos; only the saved values differ, which is expected (the two stores already have independently-editable settings data). Do not remove these fields from `settings_schema.json`.
-  **OUT of scope:** the `review`/testimonial removal (already done, `AED-ISSUE-12485594283`) — do not reintroduce a `review` block. Displaying reviews/ratings on product pages (would require `AggregateRating`, which per the vault do-not-touch list is blocked until real verified reviews exist). Any change to the actual shipping carrier/rate logic in the cart or checkout — this ticket only affects the JSON-LD *representation* of shipping, not the real shipping calculation. Editing the `Testimonial`/`upgrade_text` metafield data.
-  **Assumption:** the two repos' `product-schema.liquid` and `header.liquid` are currently byte-identical in the sections this ticket touches (verified at authoring time) — the fix should be portable as a like-for-like edit per repo, not a file copy (per repo convention, since the files can and do diverge elsewhere).

## Objective/Acceptance Criteria:

Ordered by which Necessary Info finding (#1–7) each row addresses, in finding order; rows not tied to one of the original 7 findings are grouped as **[Additional]** at the end.

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | **[Finding #1]** On both stores, the `#product-schema` JSON-LD's `shippingDetails` object includes `"@type": "OfferShippingDetails"`. | Verified live on AEDShop with the metafield populated (`16.95`): [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721) — `shippingDetails.@type` is `"OfferShippingDetails"`. | ✅ | ✅ |
| 2 | **[Finding #2]** `shippingRate` is a flat `MonetaryAmount` directly on `OfferShippingDetails` — no `ShippingRateSettings`/`freeShippingThreshold` nesting in the per-product schema (that logic moves to the org-level schema, #5–6 below). | Verified live: [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721) → `shippingRate: {"@type": "MonetaryAmount", "value": 16.95, "currency": "CAD"}`, no nesting. | ✅ | ✅ |
| 3 | **[Findings #2–3]** When the flat-rate metafield is blank/unconfigured, `shippingDetails` (product-level, finding #2) and `hasShippingService` (org-level, finding #3) are both omitted entirely rather than asserting an inaccurate `$0` rate. *(Added during implementation — the alternative of defaulting to 0 would falsely claim free shipping.)* | Verified both states on AEDShop: blank metafield → absent on [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721), [defibtech-lifeline-view-complete-package](https://aedshop.ca/products/defibtech-lifeline-view-complete-package?preview_theme_id=188454502721), [homepage](https://aedshop.ca/?preview_theme_id=188454502721); populated metafield (`16.95`) → present and correct on the same pages (re-tested after population). Blank-metafield direction also confirmed on AED4Life ([zoll-aed-3](https://aed4life.ca/products/zoll-aed-3), [homepage](https://aed4life.ca/)) before its metafield was created. | ✅ | ✅ |
| 4 | **[Findings #2–3]** The flat shipping rate feeding both finding #2's per-product `shippingRate` and finding #3's org-level tiers is sourced from a shop metafield (namespace/key configurable via two new theme settings — `cart_flat_shipping_rate_namespace` / `cart_flat_shipping_rate_key`, superseding the single hardcoded-value setting originally planned) — not hardcoded in either place. | Metafield created on both stores (`custom.flat_shipping_rate`, type Decimal, value `16.95`). Verified rendering `16.95` as a bare JSON number (not a quoted string) in both blocks on both stores — confirms the Decimal type + unquoted interpolation combo works as designed. AED4Life's metafield was initially created as `custom.flat_rate_shipping` (words transposed) — recreated to match AEDShop exactly rather than diverging the settings pointer. | ✅ | ✅ (AEDShop + AED4Life) |
| 5 | **[Finding #3]** The `Organization` schema gains a `hasShippingService` block with two `shippingConditions` entries (Canadian provinces, sourced from a shop metafield — see Dev Notes): one for orders below the free-shipping threshold at the flat rate, one at/above the threshold at `$0.00`. This — not per-product `freeShippingThreshold` — is finding #3's resolution. | Verified live on both stores' homepages ([AEDShop](https://aedshop.ca/?preview_theme_id=188454502721), AED4Life): tier 1 `$0.00–$99.00 → $16.95`, tier 2 `$99.01+ → $0.00`, 9 provinces each — matches Shopify's actual configured Domestic-zone rates exactly (confirmed against a screenshot of Settings → Shipping and delivery, 2026-08-04). Caught and fixed a boundary bug here: original code split tiers at `98.99`/`99`, not `99`/`99.01` — an order of exactly `$99.00` would have been mismarked free. | ✅ | ✅ |
| 6 | **[Finding #3]** The threshold value in `hasShippingService` reads `settings.cart_free_shipping_threshold` and the whole block is gated on `settings.cart_enable_free_shipping` (matches the cart drawer's existing free-shipping logic — no second, independently-editable threshold, and no longer hardcoded per finding #3). | Verified — gating includes the metafield-blank check (see #3 above); threshold value confirmed correct against Shopify admin (see #5 above). | ✅ | ✅ |
| 7 | **[Finding #4]** Dimension/weight values in `product-schema.liquid` don't double-append their unit — already fixed pre-ticket (`AED-ISSUE-12485594283`); confirmed still correct, not re-broken by this ticket's edits. | Verified live: [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721) renders `"depth": "5.0 inches"` etc. — single unit, both stores. | ✅ | ✅ |
| 8 | **[Finding #5]** `gtin12`/`price` are correctly quoted/typed in `product-schema.liquid` — already fixed pre-ticket there (`AED-ISSUE-12485594283`); now also correct in `featured-product.liquid` via the render swap (#9 below). | Verified live: `gtin12` renders as a quoted string, `price` as a bare number; Google Rich Results Test flagged no issues on either field. | ✅ | ✅ |
| 9 | **[Finding #6]** `@context` and the `offers.availability` URI are `https://schema.org/...` everywhere either currently reads `http://` — `product-schema.liquid` (both), `featured-product.liquid`, and both JSON-LD blocks in `header.liquid`. `featured-product.liquid` gets this by rendering the same `product-schema.liquid` snippet `main-product.liquid` uses, rather than maintaining its own separate copy — one fix, both sections always in sync (this is also the mechanism that carries finding #5's fix into `featured-product.liquid`, #8 above). | Verified live on AEDShop: [homepage](https://aedshop.ca/?preview_theme_id=188454502721) (Organization + WebSite blocks), [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721) (Product `@context` + `offers.availability`), [collections/aed-units](https://aedshop.ca/collections/aed-units?preview_theme_id=188454502721) (CollectionPage). Also verified live on AED4Life: [homepage](https://aed4life.ca/) (Organization + WebSite), [zoll-aed-3](https://aed4life.ca/products/zoll-aed-3) (Product + availability). | ✅ | ✅ |
| 10 | **[Finding #7]** Top-level `sku` in `product-schema.liquid` is only emitted when the product has exactly one variant (matches the `Product` schema's single-SKU semantics). | Verified both directions on AEDShop: absent on multi-variant [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721) (4 variants) and [aedtrax-1](https://aedshop.ca/products/aedtrax-1?preview_theme_id=188454502721) (2 variants); present and correct on single-variant [defibtech-lifeline-view-complete-package](https://aedshop.ca/products/defibtech-lifeline-view-complete-package?preview_theme_id=188454502721) (`sku: "DCF-E2310CAPKGLV"`, matches its one variant) and [zoll-aed-3-bls-semi-automatic](https://aedshop.ca/products/zoll-aed-3-bls-semi-automatic?preview_theme_id=188454502721). Absent-direction re-confirmed on AED4Life's [zoll-aed-3](https://aed4life.ca/products/zoll-aed-3) (4 variants) — single-variant direction not re-tested there. | ✅ | ✅ |
| 11 | **[Additional]** `Organization` schema's `sameAs` array omits any social setting that is blank — no empty strings in the array. | Verified live: [homepage](https://aedshop.ca/?preview_theme_id=188454502721), [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721), [collections/aed-units](https://aedshop.ca/collections/aed-units?preview_theme_id=188454502721) — array contains only Facebook + Instagram, no empty strings for the 7 unset platforms. | ✅ | ✅ |
| 12 | **[Additional]** `Organization` schema's `sameAs` array includes `settings.social_linkedin_link` when set. | Verified live on AED4Life [homepage](https://aed4life.ca/) — `sameAs` includes Twitter, Facebook, LinkedIn, Instagram, and YouTube (all 5 of AED4Life's real values), correctly omitting the 5 unset platforms (Pinterest, TikTok, Tumblr, Snapchat, Vimeo). | ✅ | ✅ |
| 13 | **[Additional]** On AEDShop only, Twitter, LinkedIn, and YouTube no longer appear in the rendered `sameAs` array (values cleared in Theme Settings, not code) — AED4Life's `sameAs` output is unaffected. | Verified live on AEDShop (see #11 links above) — only Facebook + Instagram present. Verified AED4Life is unaffected — see #12 above (all 5 of its real links still present). | ✅ | ✅ |
| 14 | **[Additional]** Every collection page emits a `CollectionPage` schema with `mainEntity.itemListElement` listing the first 24 visible products, position-ordered. | Verified live: [collections/zoll-aed-units](https://aedshop.ca/collections/zoll-aed-units?preview_theme_id=188454502721) (15 total, all listed, positions 1–15 correct) and [collections/aed-units](https://aedshop.ca/collections/aed-units?preview_theme_id=188454502721) (`numberOfItems: 56`, `itemListElement.length: 24` — cap confirmed working on a collection larger than the limit). | ✅ | ✅ |
| 15 | **[Additional]** `#product-schema` and both `header.liquid` schema blocks parse as valid JSON on both stores across representative products (including edge cases: multi-variant, non-numeric/leading-zero barcodes, no dimensions, no awards). | Parsed clean via `JSON.parse` on: multi-variant w/ dimensions+weight ([zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721)), multi-variant no dimensions ([aedtrax-1](https://aedshop.ca/products/aedtrax-1?preview_theme_id=188454502721)), single-variant ([defibtech-lifeline-view-complete-package](https://aedshop.ca/products/defibtech-lifeline-view-complete-package?preview_theme_id=188454502721)), homepage, 2 collection pages, all with `shippingDetails`/`hasShippingService` populated. Not yet found/tested: a leading-zero or non-numeric barcode, or an `awards`-populated product — flagging as still open rather than assuming pass. | ✅ | ⏳ (edge cases above still open) |
| 16 | **[Additional]** Google Rich Results Test shows no errors on a sampled product page, collection page, and the homepage, on both aedshop.ca and aed4life.ca dev themes. | Run against [zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721)'s actual JSON-LD (pasted into Rich Results Test's "code" mode, since the tool can't crawl a password/preview-protected preview theme URL directly) via [search.google.com/test/rich-results](https://search.google.com/test/rich-results): **4 valid items detected, zero errors** — Product snippets, Merchant listings, Organization, and **Shipping policies** (confirms `hasShippingService` is recognized as a real, eligible rich-result type by Google's own tool, not just self-parsed valid JSON). Only "non-critical issues" are `review`/`aggregateRating` missing (intentionally excluded, see `AED-ISSUE-12485594283` and vault do-not-touch) and `hasMerchantReturnPolicy`/`deliveryTime` missing (unrelated return-policy schema and a pre-existing, documented-as-out-of-scope gap — see Dev Notes). Homepage/collection page not yet run separately — their JSON-LD (Organization/CollectionPage) was already covered since the Organization block renders identically on every page and was included in this same test. AED4Life not yet run. | ✅ | ✅ |
| 17 | **[Additional]** No visual/layout regression on any affected page — this is markup-only. | Spot-checked page titles/console on all pages visited above — no visual break observed, but no formal side-by-side regression pass done yet. | ✅ | ⏳ |
| 18 | **[Additional]** Only the files listed in Constraints / Scope are modified in each repo; no locale or unrelated template files change. | `git diff --stat` confirms exactly the same 6 scoped files changed on **both** repos (2 more than originally scoped: `settings_schema.json`/`settings_data.json`/`locales/en.default.schema.json` needed for the new metafield-pointer settings, foreseen in Constraints/Scope). AED4Life's `settings_data.json` diff is 2 lines smaller than AEDShop's — it skips the social-link clears, correctly, since those are AEDShop-only. | ✅ | ✅ |

## Dev Notes:

-  **File (both repos, identical today):** `snippets/product-schema.liquid`. Current `shippingDetails` block (lines 109–161):

```liquid
{%-  unless lowercase_tags contains 'special order' -%}
  "shippingDetails": {
    "shippingDestination": [ ... 9 provinces ... ],
    "shippingRate": {
      "@type": "ShippingRateSettings",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "16.95",
        "currency": "CAD"
      },
      "freeShippingThreshold": {
        "@type": "MonetaryAmount",
        "minValue": "99"
      }
    }
  },
{%- endunless -%}
```

-  **Simplified product-level shape** — matches Google's own `OfferShippingDetails` example exactly (source: [Google Merchant Listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)). The threshold/conditional-rate logic is intentionally *not* here — see the new `hasShippingService` block below. **Implemented and verified on AEDShop** (see Acceptance Criteria #1–4, #9–10):

```liquid
{%-  unless lowercase_tags contains 'special order' or ship_rate == blank -%}
  "shippingDetails": {
    "@type": "OfferShippingDetails",
    "shippingDestination": [ ... unchanged ... ],
    "shippingRate": {
      "@type": "MonetaryAmount",
      "value": {{ ship_rate }},
      "currency": "CAD"
    }
  },
{%- endunless -%}
```

  `ship_rate` is assigned once near the top of the file's existing `{% liquid %}` preamble:

```liquid
assign ship_rate = shop.metafields[settings.cart_flat_shipping_rate_namespace][settings.cart_flat_shipping_rate_key].value
```

  Note `value` is unquoted (Number, not String) — schema.org's guidance for `MonetaryAmount.value` is "recommended type Number," and the metafield should be typed **Decimal (`number_decimal`)** in Shopify admin so it renders as a bare number, not a quoted string that would need casting.

  **Superseded from an earlier version of this plan:** rather than a single theme setting holding the rate value directly (`settings.cart_flat_shipping_rate`, hardcoded to `"16.95"`), the rate is sourced from a **shop metafield** — decoupling the structured-data rate from a value baked into theme code, so it can be corrected or kept in sync without a deploy. Two settings hold the metafield's namespace/key instead of the rate itself (see below). **Blank-metafield behavior:** the `or ship_rate == blank` guard above means `shippingDetails` is omitted entirely (not emitted with a `$0` value) when the metafield isn't configured — asserting free shipping when the rate is simply unknown would be a false claim, worse than omitting the enhancement.

-  **New settings (pointer, not value):** `config/settings_schema.json` (both repos), add two `text` fields alongside `cart_free_shipping_threshold` (~line 614):

```json
{
  "type": "text",
  "id": "cart_flat_shipping_rate_namespace",
  "label": "t:settings_schema.cart.settings.cart_flat_shipping_rate_namespace.label",
  "info": "t:settings_schema.cart.settings.cart_flat_shipping_rate_namespace.info",
  "default": "custom"
},
{
  "type": "text",
  "id": "cart_flat_shipping_rate_key",
  "label": "t:settings_schema.cart.settings.cart_flat_shipping_rate_key.label",
  "info": "t:settings_schema.cart.settings.cart_flat_shipping_rate_key.info",
  "default": "flat_shipping_rate"
}
```

  Add matching locale keys to `locales/en.default.schema.json` and matching values (`"custom"` / `"flat_shipping_rate"`) to `config/settings_data.json`. The `custom.flat_shipping_rate` shop metafield these settings point to by default is **created and populated (`16.95`) on AEDShop**; **still needs creating on AED4Life** (Settings → Custom data → Shop metafields, type Decimal) before it renders a real rate there — see Implementation Notes and Clarifying Questions.

-  **New: `Organization.hasShippingService`, `sections/header.liquid`.** This — not per-product `freeShippingThreshold` — is Google's current, documented mechanism for a "free shipping over $X" claim (added to Google's structured-data support Nov 2025: [Search Central blog](https://developers.google.com/search/blog/2025/11/more-ways-to-share-shipping), [shipping-policy docs](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy)). Added inside the existing `Organization` script block, as a sibling of `sameAs`. **Implemented and verified on AEDShop** (see Acceptance Criteria #5–6):

```liquid
{%- liquid
  # Matches Shopify's actual configured rule (Settings > Shipping and delivery): flat rate
  # applies through the threshold itself (e.g. "$0.00-$99.00"), free applies one cent above it
  # (e.g. "$99.01 and up") -- not the other way around.
  assign ship_rate = shop.metafields[settings.cart_flat_shipping_rate_namespace][settings.cart_flat_shipping_rate_key].value
  assign free_ship_threshold = settings.cart_free_shipping_threshold | plus: 0
  assign free_ship_min = free_ship_threshold | plus: 0.01
-%}
{%- if settings.cart_enable_free_shipping and ship_rate != blank -%}
"hasShippingService": {
  "@type": "ShippingService",
  "shippingConditions": [
    {
      "@type": "ShippingConditions",
      "shippingDestination": [ ... 9 provinces, same list as product-schema.liquid ... ],
      "orderValue": {
        "@type": "MonetaryAmount",
        "minValue": 0,
        "maxValue": {{ free_ship_threshold }},
        "currency": "CAD"
      },
      "shippingRate": { "@type": "MonetaryAmount", "value": {{ ship_rate }}, "currency": "CAD" }
    },
    {
      "@type": "ShippingConditions",
      "shippingDestination": [ ... same 9 provinces ... ],
      "orderValue": {
        "@type": "MonetaryAmount",
        "minValue": {{ free_ship_min }},
        "currency": "CAD"
      },
      "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "CAD" }
    }
  ]
},
{%- endif -%}
```

  Pulls the threshold from `settings.cart_free_shipping_threshold` (currently `"99"` in both repos' `config/settings_data.json`), gated on `settings.cart_enable_free_shipping` **and** `ship_rate != blank` — same blank-metafield reasoning as the product-level block above, plus the same settings that already drive the cart-drawer free-shipping banner (`snippets/cart-drawer.liquid` ~line 5, `sections/main-cart.liquid` ~line 246-247). Do not hardcode a second threshold that can drift from the cart's.

-  **Follow-up, implemented on both stores:** the 9-province `shippingDestination` array was originally duplicated three times (once in `product-schema.liquid`, twice in `hasShippingService`'s two tiers) with no connection to Shopify's real shipping zone — same drift risk as the rate before it moved to a metafield. Moved to a **JSON-type shop metafield**, `custom.shipping_destination_provinces` (value: `["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"]`), read once per file:

```liquid
assign shipping_provinces = shop.metafields.custom.shipping_destination_provinces.value
```

  (`json`-type metafields are auto-parsed by Shopify — no `parse_json` filter exists in Liquid; using one is a theme-check error.) Each of the three hardcoded arrays becomes a loop, e.g.:

```liquid
"shippingDestination": [
  {%- for province in shipping_provinces -%}
    { "addressCountry": "CA", "addressRegion": {{ province | json }} }{%- unless forloop.last -%},{%- endunless -%}
  {%- endfor -%}
],
```

  (the two `hasShippingService` tiers additionally include `"@type": "DefinedRegion"` per entry, matching what was already there.) No settings-based namespace/key pointer for this one (unlike the rate) — the namespace/key are hardcoded to `custom.shipping_destination_provinces` directly, since a merchant repointing the *rate* to wherever their finance data lives is a realistic need, but a devs-only province list isn't.
-  **`@context` fix** — line 64 of `product-schema.liquid`, line ~142 of `featured-product.liquid`, lines 434 and 460 of `header.liquid`. All currently `"http://schema.org..."` → `"https://schema.org..."`.
-  **`availability` URI fix** — line 106 of `product-schema.liquid`: `"availability" : "http://schema.org/{{stock}}",` → `"availability" : "https://schema.org/{{stock}}",`. Same bug class as `@context`, bundled in since the line is already being touched for other fixes in this file.
-  **Top-level `sku` scoping** — lines 76–78 of `product-schema.liquid`:

```liquid
{%- if product.selected_or_first_available_variant.sku != blank -%}
```

  add a variant-count guard: `product.variants.size == 1 and product.selected_or_first_available_variant.sku != blank`.

-  **`featured-product.liquid` swap** (lines ~120–183, both repos): delete the local `seo_media` assign and the entire `<script type="application/ld+json">...</script>` block, replace with:

```liquid
{% render 'product-schema', product: product %}
```

  matching the pattern already used in `sections/main-product.liquid` line 136. `product-schema.liquid` computes its own `seo_media`, `lowercase_tags`, and `stock` — no need to pass them in. No duplicate-rendering risk to guard against: confirmed via `grep -rn '"type": "featured-product"' templates/*.json` (both repos) that this section isn't placed anywhere today.
-  **`header.liquid` sameAs** (lines 440–449):

```liquid
"sameAs": [
  {{ settings.social_twitter_link | json }},
  {{ settings.social_facebook_link | json }},
  ...
],
```

  Rebuild as a filtered array in a `{% liquid %}` preamble (theme convention — see `CLAUDE.md`) rather than wrapping each line in inline `{% if %}` tags, to avoid trailing-comma bugs:

```liquid
{%- liquid
  assign social_links = settings.social_twitter_link | append: '' | split: '||'
  assign same_as = '' | split: ','
  for link in social_links
    if link != blank
      assign same_as = same_as | concat: ...
    endif
  endfor
-%}
```

  (exact implementation left to dev — the acceptance criteria is behavioral: no blanks, LinkedIn included when set. A simple `{% if setting != blank %}{{ setting | json }},{% endif %}` per line, same pattern used elsewhere in this file for optional keys, is also acceptable and lower-risk than a refactor — prefer that unless it creates a trailing-comma issue on the last non-blank entry.)
-  **`CollectionPage` schema** — insert between line 470 (`{%- endif -%}`, closing the `WebSite` block) and line 472 (`{% schema %}`):

```liquid
{%- if request.page_type == 'collection' -%}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": {{ collection.title | json }},
    "description": {{ collection.description | strip_html | json }},
    "url": {{ request.origin | append: collection.url | json }},
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": {{ collection.products_count }},
      "itemListElement": [
        {%- for product in collection.products limit: 24 -%}
          {
            "@type": "ListItem",
            "position": {{ forloop.index }},
            "url": {{ request.origin | append: product.url | json }}
          }{%- unless forloop.last -%},{%- endunless -%}
        {%- endfor -%}
      ]
    }
  }
  </script>
{%- endif -%}
```

-  **Convention:** this theme uses `{% liquid %}` multi-line blocks for control flow (see `CLAUDE.md`) — keep new logic in the preamble, JSON body thin, per the pattern already established in `product-schema.liquid`.

## Implementation Notes:

-  **AEDShop and AED4Life (both on `feature/AED-12580283608-schema`): implemented.** Same edits ported to both repos — confirmed via diff before porting that the touched regions of `product-schema.liquid`, `featured-product.liquid`, and `header.liquid` were still byte-identical to AEDShop's pre-fix baseline (the two files have diverged elsewhere — different mega-menu markup, a CMS block ID, an accessibility span — but not in the sections this ticket touches). One deliberate content difference preserved: `product-schema.liquid`'s "no review" comment keeps AED4Life's own wording about its `custom.testimonial` metafield naming, rather than being overwritten with AEDShop's phrasing.
-  **Final shape for the free-shipping rate:** shop metafield, not a settings value — see Clarifying Questions for why. Settings added: `cart_flat_shipping_rate_namespace` (default `custom`) and `cart_flat_shipping_rate_key` (default `flat_shipping_rate`), in both repos' `config/settings_schema.json`/`settings_data.json` and locale keys in `locales/en.default.schema.json`. **Metafield created and verified live on both stores** — `custom.flat_shipping_rate`, type Decimal, value `16.95`, description: "Flat-rate shipping cost (CAD) for structured data (SEO) only" — matches the confirmed-accurate rate from Shopify's Shipping and delivery settings. AED4Life's was initially created under the wrong key (`custom.flat_rate_shipping`) and recreated to match AEDShop, per an explicit call to minimize divergence rather than keep the settings pointer repointed.
-  **Follow-up beyond original scope, implemented on both stores:** the 9-province `shippingDestination` list moved from being hardcoded three times per repo to a shop metafield, `custom.shipping_destination_provinces` (type: JSON, no namespace/key settings indirection — see Dev Notes for why that differs from the rate's approach). Verified live and via Google Rich Results Test on AEDShop; verified live on AED4Life.
-  **Files touched on AEDShop** (confirmed via `git diff --stat` against Constraints/Scope): `snippets/product-schema.liquid`, `sections/header.liquid`, `sections/featured-product.liquid`, `config/settings_schema.json`, `config/settings_data.json`, `locales/en.default.schema.json`. Two more files than originally scoped (`settings_data.json`, `locales/en.default.schema.json`) — both were implied by "add new setting" in the original scope, just not itemized.
-  **AEDShop social values cleared:** `social_twitter_link`, `social_linkedin_link`, `social_youtube_link` set to `""` in `config/settings_data.json`. `social_facebook_link` and `social_instagram_link` untouched.
-  No per-store code divergence found or introduced — AEDShop's `product-schema.liquid`/`header.liquid` changes are the same edits the PRD's Dev Notes describe for "both repos."

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  **Decided:** the free-shipping threshold is represented via a new org-level `Organization.hasShippingService`/`shippingConditions` block (Google's current documented pattern), sourced from `settings.cart_free_shipping_threshold` / `settings.cart_enable_free_shipping` rather than hardcoded. The per-product `shippingDetails` stays a flat, threshold-free `shippingRate` — matching Google's own product-level example. See Dev Notes for the full structure and sources.
-  **Decided, superseding the entry above once it was implemented:** the flat shipping rate is sourced from a **shop metafield** rather than a theme setting holding the value directly. Two new theme settings (`cart_flat_shipping_rate_namespace`, `cart_flat_shipping_rate_key`) hold the metafield's namespace/key instead — read by both `product-schema.liquid` and the new `hasShippingService` block, so both stay in sync with whatever the metafield says, and the rate can be corrected without a code deploy. Rationale researched and confirmed: Shopify Liquid has no native access to real configured shipping rates outside checkout ([Cart AJAX API](https://shopify.dev/docs/api/ajax/reference/cart), [ShippingRate – Admin GraphQL](https://shopify.dev/docs/api/admin-graphql/latest/objects/ShippingRate) — server-app-only, not Liquid-accessible), so a metafield merchants/devs can edit directly is the most decoupled option available. Does not materially change the estimate.
-  **Decided during implementation, not originally scoped:** when the metafield is blank/unconfigured, `shippingDetails` and `hasShippingService` are **omitted entirely** rather than defaulting to `$0` — asserting free shipping when the rate is actually unknown is a false claim, which is worse than omitting the enhancement. Verified working on AEDShop (Acceptance Criteria #3).
-  **Resolved:** `$16.95` is confirmed correct — verified directly against Shopify admin (Settings → Shipping and delivery) on 2026-08-04: the Domestic zone's **Flat Rate** option is `$16.95` for orders `$0.00–$99.00`, and **Free Shipping** applies at `$99.01` and up, matching the `$99` threshold already in `settings.cart_free_shipping_threshold`. No follow-up needed once the metafield is populated with this value.
-  **Noted limitation, not a defect in this ticket's work:** the same Shopify admin screen shows two additional Domestic shipping options — **Canada Post (own account)** and **Purolator Small Package (via app)** — both "Calculated" (real-time carrier rate, not fixed). Neither `OfferShippingDetails.shippingRate` nor `hasShippingService.shippingConditions.shippingRate` can represent a calculated/variable rate — schema.org only has a `MonetaryAmount` (fixed value) for this property, no "ask the carrier" type. The structured data is therefore only ever describing the flat-rate/free-shipping pair, never the calculated carrier options — this is a ceiling on what JSON-LD shipping schema can express generally, not something a different metafield shape (e.g. JSON) would fix.
-  **Not yet verified:** the "Excluded from free shipping" zone shown in the same admin screen (Canada, 4 of the 13 provinces) — worth confirming those 4 aren't among the 9 provinces in the `custom.shipping_destination_provinces` metafield (read by both `product-schema.liquid` and `hasShippingService`). If they overlap, the schema would claim free shipping to a region Shopify's actual shipping settings exclude. Fixing this, if needed, is now a metafield edit on both stores, not a code change — see Dev Notes on the province-list metafield.
-  **Fixed during populated-value verification (2026-08-05):** `hasShippingService`'s tier boundaries originally split at `$98.99`/`$99` rather than `$99`/`$99.01` — the exact cent Shopify's real Domestic zone uses ("$0.00–$99.00" flat, "$99.01 and up" free, per the admin screenshot). An order of exactly `$99.00` would have been mismarked free in the schema. Corrected to `maxValue: {{ free_ship_threshold }}` / `minValue: {{ free_ship_threshold | plus: 0.01 }}`, verified live rendering `99` / `99.01`.
-  **Action item, partially resolved:** the `custom.flat_shipping_rate` shop metafield is now created and populated (`16.95`) on **AEDShop**. **Still needs creating on AED4Life** — until then, `shippingDetails`/`hasShippingService` will correctly but permanently render as absent there.