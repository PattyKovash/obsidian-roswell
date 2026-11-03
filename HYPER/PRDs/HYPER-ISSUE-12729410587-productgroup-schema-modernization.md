
## Background:

-  Follow-up to [HYPER-ISSUE-12590958582](https://roswellstudios-company.monday.com/boards/4922048779/pulses/12590958582?term=12590958582&termColumns=XQAAAAKXAAAAAAAAAABBKoKDkbUy4tOTJ-hBR2p_SBZRguErBBvHFyJ0Madc_PGmx9-PoGdNwCFEFNpwn_sUNt7qlPF2LdYUGckBDUl7NfczX5-rOjXUwbzOoo2CwiSbfURCmqyI8trLvc6xM-lnwD2zhRblJkCYbj9OS_3-Q1eyhAGotvZ7X__hhHgA) (the GSC duplicate-schema fix). While reviewing that issue, the theme's product schema was found to always render as `@type: Product`, even for products with multiple sizes/colors — the older, less-specific schema.org shape. Since 2024, Google's recommended format for variant products is `@type: ProductGroup`.

-  Goal: modernize the theme's product schema to `ProductGroup` for multi-variant products so Google can correctly group size/color variants under one listing.

## Necessary Info (Design/Documentation):

-  Single source file: `snippets/microdata-schema.liquid`.

-  Reference: [Google — Product Variant Structured Data](https://developers.google.com/search/docs/appearance/structured-data/product-variants). `variesBy` only recognizes a fixed axis list (`color`, `size`, `material`, `pattern`, `suggestedAge`, `suggestedGender`) — option names outside that list have no structured equivalent.

-  No design work needed — schema/SEO markup only, not visible to shoppers.

## Constraints / Scope:

-  In scope: the `Product`/`ProductGroup` block on product pages only.

-  The competing schema (duplicate `brand`/`aggregateRating`) noted in HYPER-ISSUE-12590958582 stays as-is until that ticket ships and Okendo's snippet is turned off — not addressed here.

-  Out of scope: the visible on-page star rating widget (`product-rating.liquid`) — still reads a different data source than the schema block.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Products with more than one variant emit `@type: ProductGroup` instead of the previous flat `Product`. |  [Southwest](https://hyperlitemountaingear.com/products/southwest), [Junction](https://hyperlitemountaingear.com/products/junction), [Aero 28](https://hyperlitemountaingear.com/products/aero-28), [20-Degree Mummy Bag](https://hyperlitemountaingear.com/products/20-degree-mummy-bag), [Pods](https://hyperlitemountaingear.com/products/pods), [Camera Pod](https://hyperlitemountaingear.com/products/camera-pod), [Versa Fanny Pack](https://hyperlitemountaingear.com/products/versa-fanny-pack) |  ✅ |   |
|  2 |  Products with exactly one variant continue to emit the flat `@type: Product`. |  [CrossPeak 1](https://hyperlitemountaingear.com/products/crosspeak-1), [Bottle Pocket](https://hyperlitemountaingear.com/products/bottle-pocket), [Inside Pack Pocket](https://hyperlitemountaingear.com/products/inside-pack-pocket), [Trail Wallet](https://hyperlitemountaingear.com/products/trail-wallet), [Essential Umbrella](https://hyperlitemountaingear.com/products/essential-backpacking-umbrella) |  ✅ |   |
|  3 |  Each variant appears under `hasVariant` with its own SKU, GTIN/MPN, image, and price — no GTIN shared across variants. |  [Southwest](https://hyperlitemountaingear.com/products/southwest) (28 variants, all unique), [Junction](https://hyperlitemountaingear.com/products/junction), [Camera Pod](https://hyperlitemountaingear.com/products/camera-pod) |  ✅ |   |
|  4 |  `variesBy` correctly lists size/color, including option names like "Torso Length" that aren't literally "Size". |  [Southwest](https://hyperlitemountaingear.com/products/southwest) & [Junction](https://hyperlitemountaingear.com/products/junction) ("Torso Length"), [20-Degree Mummy Bag](https://hyperlitemountaingear.com/products/20-degree-mummy-bag) (literal "Size"), [Aero 28](https://hyperlitemountaingear.com/products/aero-28) / [Versa Fanny Pack](https://hyperlitemountaingear.com/products/versa-fanny-pack) (color) |  ✅ |   |
|  5 |  Option names with no schema.org equivalent (e.g. "Volume") aren't asserted as a structured property but remain visible in the variant name. |  [Southwest](https://hyperlitemountaingear.com/products/southwest), [Junction](https://hyperlitemountaingear.com/products/junction) |  ✅ |   |
|  6 |  `brand` and `aggregateRating` appear once at the group level — not duplicated per variant. |  All Item 1 products |  ✅ |   |
|  7 |  All schema validates with 0 errors on Google's Rich Results Test and the schema.org validator. |  All 12 products in Items 1-2, full live page tested on Google's Rich Results Test; Southwest also confirmed 0 errors/warnings on the schema.org validator (full page) |  ✅ |   |
|  8 |  No regression to `BreadcrumbList`/`Organization` schema on the same page. |  Same runs as Item 7 |  ✅ |   |

## Dev Notes:

-  `snippets/microdata-schema.liquid`, product branch (~line 121). Type switch: `ProductGroup` when `product.variants.size > 1`, else the existing flat `Product` block (unchanged).

-  `variesBy` size synonyms reuse the theme's existing list from `snippets/product-form.liquid` line 5 (`'size, pack size, torso length'`), so this matches how the rest of the theme already treats sizing.

-  Each `hasVariant` entry reuses the per-variant GTIN logic already fixed in HYPER-ISSUE-12590958582 (`variant.barcode`, not `product.selected_or_first_available_variant.barcode`).

## Implementation Notes:

-  `variesBy` values are full schema.org URIs (e.g. `https://schema.org/size`), not plain text.

-  Unmapped options (e.g. "Volume") are left out of `variesBy` but still appear in each variant's `name` string (e.g. "40L / Extra Sm / White").

-  `productGroupID` = `product.id`. Group-level `image` is a full `ImageObject`; each `hasVariant` image is a plain URL string, matching Google's example format.

## Testing Notes:

-  Verified on a dev preview theme via Playwright, confirming `window.Shopify.theme.id` before trusting page content.

-  Validated using each tool's code-input mode, pasting each product's actual full page source (not just the JSON-LD) to confirm no regression anywhere on the page. On Southwest this correctly surfaced all 28 variants as valid Merchant listing items, not a trimmed sample.

-  Google's Rich Results Test and the schema.org validator needed different workarounds for full-page-sized input (both documented in the aed4life pattern doc referenced above).

## Bugs from QA:

-  TBD

## Clarifying Questions:
