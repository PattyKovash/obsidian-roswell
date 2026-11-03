# Product schema: remove Testimonial-fed review block

## Background:

-  TBD

## Necessary Info (Design/Documentation):

-  [https://roswellstudios-company.monday.com/boards/18418818134/pulses/12457902459](https://roswellstudios-company.monday.com/boards/18418818134/pulses/12457902459)

-  **Issue:** The product-schema JSON-LD includes a hardcoded `review` field on most products, even when no review is displayed on the page.

-  **Cause:** Each affected product has a `Testimonial` metafield (present in both pinned and unpinned metafields) whose value matches the author name shown in the schema. This metafield appears to be feeding into `product-schema.liquid`.

-  **Note: **The products not impacted have a BLANK Testimonial metafield.

-  **Scope:** Audited AEDs by brand. Affects nearly every product across all brands (ZOLL, Philips, Cardiac Science, HeartSine, Stryker, Defibtech, Encore). [aed4life.ca](http://aed4life.ca) does not have this issue (no `Testimonial` metafield under unpinned metafields there).

-  **Ask:** Please investigate `product-schema.liquid` and stop it from pulling the `Testimonial` metafield into the `review` field. Metafield itself can stay — just remove it from the schema output.

 

 **Exceptions (not affected):**

-  Philips HeartStart FRx Construction and Workplace Safety Kit

-  LIFEPAK CR2 Bilingual (Cellular model)

-  LIFEPAK CR2 Bilingual (Cellular model) – Complete Package

-  AED Summer Cottage Rental

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3098526159/image-from-clipboard.png)

## Constraints / Scope:

-  **IN scope:** `sections/main-product.liquid` in both theme repos (`AEDShop_AED`, `AED4LIFE_AED`) — the product JSON-LD block only.

-  **OUT of scope:** Deleting or editing the Testimonial metafield/metaobject data in Shopify admin. Displaying testimonials on the product page. The `shippingDetails` structure in the same schema block (separately malformed — future ticket).

-  Both stores get the same fix. The theme code was byte-identical here before this ticket, but the metafield **key differs per store** — see Implementation Notes.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | No product page on aedshop.ca or aed4life.ca emits `review`, `reviewRating`, or `reviewBody` inside the `#product-schema` JSON-LD block. | | | |
| 2 | The Testimonial metafield and its metaobject entries remain intact and unchanged in Shopify admin on both stores (`custom.upgrade_text` on AEDShop, `custom.testimonial` on AED4Life). | | | |
| 3 | The `#product-schema` block parses as valid JSON on both stores regardless of product values — including edge cases (non-numeric or leading-zero barcodes, populated `awards`, dimension values with/without a unit). | | | |
| 4 | Product pages still emit `offers` and `description` in the schema — removing the review does not cost Rich Result eligibility, which `offers` satisfies. | | | |
| 5 | Only `sections/main-product.liquid` is modified in each repo. No locale, config, or template files change. | | | |

## Dev Notes:

-  **File:** `sections/main-product.liquid` — the `{% liquid %}` preamble (~line 144) and the `<script type="application/ld+json" id="product-schema">` block that follows (~line 169). There is no `product-schema.liquid` snippet in either repo despite the ticket's wording.

-  **Remove this block entirely** (key is `custom.upgrade_text` on AEDShop, `custom.testimonial` on AED4Life):

```liquid
{%- if product.metafields.custom.upgrade_text.value.count > 0 -%}
  {% assign review = product.metafields.custom.upgrade_text.value | first %}
  "review": {
    "author" : { "@type": "Person", "name": "{{ review.author_name }}" },
    "description" : "{{ review.description }}",
    "reviewRating": { "ratingValue" : {{ review.star }} }
  },
{%- endif -%}
```

-  **Gotcha — comma invariant.** Every optional key in this blob carries its own trailing comma and `"description"` is always emitted last. Any edit must preserve that or the whole schema breaks.

-  **Convention:** the theme uses `{% liquid %}` multi-line blocks for control flow — build values in the preamble, keep the JSON body thin.

## Implementation Notes:

-  **The review block is gone from both repos.** Metafields untouched. A comment at the removal site explains why, so it doesn't get wired back in.

-  **Metafield key divergence between the two stores** — the reason the ticket's "aed4life.ca does not have this issue" reading was misleading:

| | AED4Life (`7ddd97`) | AEDShop (`2e7d7b-3`) |
|---|---|---|
| Product metafield holding the testimonial list | `custom.testimonial` | `custom.upgrade_text` |
| Admin display name | "Testimonial" | "Testimonial" |
| Metaobject definition (identical) | type `upgrade_text` | type `upgrade_text` |

   The metaobject definition is identical on both stores (fields `review`, `star`, `description`, `author_name`). Only the **product metafield key** differs. AED4Life *does* have a Testimonial metafield — the theme just read `upgrade_text`, which doesn't exist there, so the review block was dead code rather than absent. Live counts (first 250 products): **198** AEDShop products emitted a review; **0** on AED4Life. Note the naming collision: `upgrade_text` is both AEDShop's metafield key and both stores' metaobject type, and both metafield display names are "Testimonial" — three things, two names. Grepping the theme for "testimonial" finds nothing.

-  **Metafields the product schema reads.** All are **product**-level metafields (`product.metafields.*`). The schema no longer reads the Testimonial metafield (`custom.testimonial` on AED4Life / `custom.upgrade_text` on AEDShop) — it stays in the store, unreferenced. `depth` reads key `length` (not `depth`); `global.*` is the legacy standard namespace, so these may appear under Shopify standard/dimension metafields in admin rather than the custom list. **Is Configured / Metafield columns are for QA to confirm each code reference matches the store definition.**

**aed4life.ca — store `7ddd97`:**

| Schema property | Metafield in code (namespace.key) | Is Configured | Metafield (confirm in store) |
|---|---|---|---|
| `depth` | `global.length` | | |
| `width` | `global.width` | | |
| `height` | `global.height` | | |
| `awards` | `custom.awards` | | |

**aedshop.ca — store `2e7d7b-3`:**

| Schema property | Metafield in code (namespace.key) | Is Configured | Metafield (confirm in store) |
|---|---|---|---|
| `depth` | `global.length` | | |
| `width` | `global.width` | | |
| `height` | `global.height` | | |
| `awards` | `custom.awards` | | |

-  **General schema hardening, unrelated to the review.** The schema was built by string concatenation with several values interpolated unsafely, so it could produce **invalid JSON depending on a product's values (or lack of values)** — not on every product, but wherever the data hit an edge case. These were corrected so the output is valid regardless of data:
   - Barcodes emitted unquoted — broke on non-numeric SKUs or leading-zero barcodes. Now `| json`-quoted.
   - Testimonial text interpolated raw inside quotes — broke on any newline. (Now moot: the review block is removed.)
   - `awards` array emitted no commas between items and none after `]` — would break wherever the metafield is populated. Now comma-separated.
   - Dimension metafields double-appended the unit (`"5.0 inches inches"`) when the stored value already carried it. Now appended only when absent.

   Because the failures are value-dependent, no per-product "broken list" is included — a validator may pass a given product today and fail it after a data edit. The fix removes the possibility rather than patching specific products.

-  **Why removal rather than repointing AED4Life to its own key:** the testimonials are about the business, not the product they hang off (e.g. a customer-service testimonial marked up as a review of "Canadian PlusTrac Professional 1 Year", a software subscription), and none of the text is rendered on the product page. Google requires structured data to be "a true representation of the page content" and not mark up content invisible to readers — manual-action eligible. Reference: [Review snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#guidelines), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). If the merchant wants review stars, the testimonials must first be displayed on the page, and be about the product.

## Testing Notes:

-  **Verified on the AED4Life dev theme** (`?preview_theme_id=188159066414`) by parsing `#product-schema` on the first 250 products: valid JSON on every product, **0 reviews emitted**, `offers` and `description` intact. A pre-fix spot-check found products on both stores emitting invalid schema from the value-dependent bugs described in Implementation Notes; the fix removes that possibility rather than patching specific products.

-  **Scan scope caveat:** checks covered the **first 250 products per store only** (Shopify `products.json?limit=250` page cap — pagination was not run). Each catalog is larger (~521 products on AED4Life). A full-catalog re-scan (paginated) is recommended before sign-off.

-  **QA check:** open a few products (especially ones with non-numeric/leading-zero barcodes), view source, and paste the contents of `<script id="product-schema">` into a JSON validator. It should parse, contain no `review` key, and still contain `offers`. Note strict JSON validators are stricter than Google's Rich Results Test, which tolerates some malformed input — use a strict validator to catch the value-dependent breakage.

-  The `awards` fix could not be verified against live data — no product in the first 250 scanned has the `custom.awards` metafield populated. It was verified by rendering the template against synthetic multi-award input.

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  Does the merchant want product reviews displayed on product pages (which would make review markup legitimate), or are these testimonials intended only for the homepage/testimonials section? Removal is correct either way; this only decides whether a follow-up ticket is needed.
