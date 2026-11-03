#  

## Background:

Title: Competing schema blocks causing errors, flagged in Google Search Console

Urgency: Medium

There are two separate competing schema blocks for the same product.

- **A `Product` schema** with its own `brand {name}` and `aggregateRating {ratingValue, reviewCount, worstRating, bestRating}`
- **A separate `ProductGroup` schema** with its own `brand {name}` and `aggregateRating {ratingValue, ratingCount}`

Google is seeing one page with two `brand` declarations and two `aggregateRating` objects. This is a known Shopify conflict: the theme (or a reviews app) is hand-coding a full Product schema that duplicates what Shopify now auto-generates.

**This would be fixed within the theme code.**

The culprit is `snippets/microdata-schema.liquid`, lines 121–186. It's a manually-coded Product JSON-LD block that renders on every product page (via `{% render 'microdata-schema' %}` in `theme.liquid`).

Inside it:

- Lines 160–168 hardcode an `aggregateRating` pulled from `product.metafields.reviews.rating`.
- Lines 169–172 hardcode a `brand` object from `product.vendor`.

The snippet's header comment notes why this is duplicated: **"Starting from Focal 11.2, we are using the structured_data built-in filter to ensure Shopify can keep it up to date without requiring theme upgrade... it is no longer managed at the theme level."** It seems that the native `structured_data` filter is never actually called anywhere in this theme — only mentioned in the comment. So the theme never finished migrating off the legacy manual block, and it's now running alongside Shopify's platform-level automatic schema (the `ProductGroup` block found live on the page), both writing `brand` and `aggregateRating`.

## Necessary Info (Design/Documentation):

**Suggested fix (please double-check this is the best path forward):** delete lines 160–172 (the `aggregateRating` conditional block and the `brand` object) from `microdata-schema.liquid`. Leave the rest of that Product block intact — the `offers` array carries GTIN/MPN/price data per variant that's genuinely useful for merchant listings and isn't guaranteed to be in Shopify's native schema, so it shouldn't be touched. Removing just those two fields lets Shopify's automatic schema be the sole source of brand and rating data, which clears the duplicate errors without losing anything else.

_After change is implemented, we will double-check with Google's Rich Results Test and then we can "Validate Fix" within GSC._

## Objective/Acceptance Criteria:

- TBD

## Dev Notes:

### Findings:

- **The duplicate is coming from Okendo** (our reviews app). Okendo automatically injects its own schema block into every product page in addition to the one already built into our theme. This is a documented Okendo feature — an SEO toggle that's on by default — not a theme bug on its own.

- **This can be switched off in Okendo's app settings** (Reviews → Settings → Widget → "Include SEO Rich Snippets"): https://reviews.okendo.io/admin/#/reviews-settings/widget

  - Turning this off resolves the competing schema issue. However, it may not resolve potential stale reviews data currently referenced in `snippets/microdata-schema.liquid`. See below.

- The theme's schema currently pulls star-rating/review-count data from product metafields:

  ```liquid
  {%- if product.metafields.reviews.rating.value != blank and product.metafields.reviews.rating_count.value > 0 -%}
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "{{ product.metafields.reviews.rating.value }}",
      "reviewCount": "{{ product.metafields.reviews.rating_count.value }}",
      "worstRating": "{{ product.metafields.reviews.rating.value.scale_min }}",
      "bestRating": "{{ product.metafields.reviews.rating.value.scale_max }}"
    },
  {%- endif -%}
  ```

  - This metafield **does not** align with Okendo docs about which metafield Okendo populates. There are unstructured metafield definitions that match Okendo's documented product metafields.
  - We need to confirm which metafield to use: the Okendo-namespaced metafields, or whether some automation is keeping `product.metafields.reviews.rating` in sync with Okendo data. `product.metafields.reviews.rating` seems to be from the Shop app — I don't think the two would sync up.
  - The code in our theme that reads this field was **last updated in October 2024** — while Okendo-related code and settings elsewhere in the theme have been touched more recently. That gap is a signal (not proof) that this field may not be receiving fresh updates and could be stale.
  - **Recommended next step:** confirm which metafield should be used.

### Recommendation:

Keep the product schema living in our own theme code, so we retain full control over it rather than depending on a third-party app's output. Do this in phases rather than one big rewrite:

1. **Phase 1 — Fix the immediate duplicate + confirm data source.** Turn off Okendo's competing schema block. Update our theme's schema so its star-rating data is confirmed to pull from a reliably-updated source (whichever field we confirm is actually being kept current).

2. **Phase 2 — Modernize the schema format.** Google now has a newer, preferred format for describing products that come in multiple options (sizes, colors, etc.), called `ProductGroup`. Our theme's schema currently uses the older, single-item format. Once Phase 1 is stable, update our theme's code to match this newer recommended format.
   - [Shopify's official change announcing this newer format](https://shopify.dev/changelog/liquid-structured_data-filter-supports-productgroup)
   - [Shopify's documentation on the underlying tool](https://shopify.dev/docs/api/liquid/filters/structured_data)

### Additional bugs found (recommend fixing in the same pass):

While reviewing the schema code, we found two real, live data-accuracy bugs in how our theme lists product variants (sizes/colors) for Google:

- **Every size/color option is reported with the same product code (GTIN), instead of the correct one for that specific option.** Confirmed live on the Southwest pack — all 28 size/color combinations showed the identical code, which isn't accurate for search or shopping listings.

- **The "price valid until" date is always showing today's date**, instead of a real future date. This is caused by a setting in the code that was never actually filled in, so it silently defaults to "right now" every time the page loads.

  - `days_product_price_valid_until` is never defined in the code:
    ```liquid
    "priceValidUntil": "{{ 'now' | date: '%s' | plus: days_product_price_valid_until | date: '%Y-%m-%d' }}",
    ```
  - **Recommendation: remove this field rather than fix the missing value.** Google lists `priceValidUntil` as optional/recommended, not required — including for products on sale. Since these are standard variant prices (not time-limited promotions), there's no real expiration date to communicate, so deleting the field is both correct and less work than defining one. Leaving it as-is is actually worse than removing it: Google's own guidance says a listing may stop displaying if this date is in the past, and because the bug always resolves to "today," it's effectively always expired by the time Google re-crawls the page.

Neither of these bugs is the cause of the Google Search Console error, but they're feeding incorrect data to Google/Shopping today and are low-effort to fix alongside the main change.

## Bugs from QA:

- TBD

## Clarifying Questions:

- TBD
