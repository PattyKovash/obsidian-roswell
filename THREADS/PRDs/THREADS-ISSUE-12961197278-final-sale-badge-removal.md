---
monday_id: 12961197278
project_key: THREADS
authored: 2026-09-11
---

## Background:

-  Part of the Dwell 3.4.0 → 4.1.4 theme upgrade. The live theme shows custom badges on product cards: FINAL SALE, Limited Stock, St Exclusive, and Best Seller, beyond Shopify's own Sold out and Sale badges.

-  The client reviewed these and asked to drop one of them: *"Do not carry over 'FINAL SALE' custom badge, keep ST EXCLUSIVE, LIMITED STOCK"* (ST18d).

-  The upgrade separately broke how all of these badges reach the page, so the client's instruction cannot be satisfied by deletion alone. Both halves are covered here.

## Necessary Info (Design/Documentation):

-  No new design. Badge styling and placement are unchanged.

-  Surface: product cards, wherever they appear — collection pages, search results, and any product card block.

-  The custom badge markup lives in `snippets/product-card-badges.liquid`. That file is entirely custom: it is absent from both `clean/dwell-3.4.0` and `clean/dwell-4.1.4`, so every tag it reads is a Social Threads convention rather than Shopify behavior.

-  **The custom badges do not render today.** On `develop/_candidate` the snippet has no callers — theme-check reports `OrphanedSnippet` for it. `blocks/_product-card-gallery.liquid` now carries stock 4.1.4's own inline badge markup, which covers Sold out and Sale only. Removing FINAL SALE therefore has no visible effect until the snippet is wired back up.

-  Consequence for the client's instruction: ST EXCLUSIVE and LIMITED STOCK are currently missing from the storefront. Keeping them, as asked, means restoring the render call — not leaving things as they are.

-  The tag `finalsale` has a second, unrelated consumer: the `_Final Sale` cart line-item property restored under ticket `THREADS-12961466499`. That property must survive this ticket.

## Constraints / Scope:

-  Only the FINAL SALE badge is removed. Sold out, Sale, Limited Stock, St Exclusive, and Best Seller all stay.

-  Nothing in `blocks/buy-buttons.liquid`, `snippets/quick-add.liquid`, or `snippets/cart-products.liquid` is touched.

-  Assumption, flagged: the client's "keep ST EXCLUSIVE, LIMITED STOCK" is read as an instruction to have those badges visible on the storefront, which requires restoring the render call. If they only meant "don't delete the code," the render-call work drops out of scope. See Clarifying Questions.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  No product card shows a FINAL SALE badge, including products tagged `FINAL40` and products tagged `finalsale`. |  Tested against both tags.<br><br>**`FINAL40`** — [admin product list](https://admin.shopify.com/store/social-threads/products?savedViewId=174760689746&query=tag%3A%22FINAL40%22+sales_channel_ids%3A%227307952210%22&order=inventory_total+desc&selectedColumns=IMAGE%2CTITLE%2CSTATUS%2CINVENTORY%2CCATEGORY%2CSALES_CHANNEL_COUNT%2CCATALOGS%2CPRODUCT_TYPE%2CVENDOR) · [/collections/sale](https://www.shopsocialthreads.com/collections/sale) → [Olivaceous Lexi Dress](https://www.shopsocialthreads.com/products/olivaceous-lexi-dress?variant=41134617264210) · [/collections/bag-straps](https://www.shopsocialthreads.com/collections/bag-straps) → [Tube Strap](https://www.shopsocialthreads.com/products/tube-strap)<br><br>**`finalsale`** — [admin product list](https://admin.shopify.com/store/social-threads/products?savedViewId=174760689746&query=tag%3A%22finalsale%22+sales_channel_ids%3A%227307952210%22&order=inventory_total+desc&selectedColumns=IMAGE%2CTITLE%2CSTATUS%2CINVENTORY%2CCATEGORY%2CSALES_CHANNEL_COUNT%2CCATALOGS%2CPRODUCT_TYPE%2CVENDOR) · [/collections/sale](https://www.shopsocialthreads.com/collections/sale) → [RD Style Crochet Pants](https://www.shopsocialthreads.com/products/rd-style-crochet-pants) |  ✅ |   |
|  2 |  Product cards render the custom badge set on collection and search pages. The badges survived the upgrade rather than being lost to stock 4.1.4's reduced Sold out / Sale set. |  Built by extending stock 4.1.4's own badge block in `blocks/_product-card-gallery.liquid` rather than restoring the old render call — the custom snippet depended on `badge_sold_out_color_scheme` and `badge_sale_color_scheme`, both removed in 4.1.4, so restoring it as-is would have emitted an empty `color-` class. The superseded snippet was deleted. |  ✅ |   |
|  3 |  Only one badge renders per product card, following the documented precedence order. A product qualifying for several shows the highest one. |  Precedence table and worked examples in Testing Notes.<br><br>**Verified by code equivalence, not live test.** At time of writing no Online Store product was tagged `stexclusive` *and* carried a compare-at price, so the masking case could not be observed. Confirmed against the live chain instead: Sale sits above St Exclusive in both versions, so such a product shows **Sale** on both. |  ✅ |   |
|  4 |  **Sold out** renders when every variant is unavailable, and takes precedence over all other badges. |  Confirmed on the correct products, matching live. |  ✅ |   |
|  5 |  **Sale** renders when the product has a compare-at price above its price and is in stock. |  This is where `finalsale` and `FINAL40` products now land, since they are discounted.<br><br>**Verified by code equivalence, not live test.** At time of writing no Online Store product carried a compare-at price *without* also being tagged `finalsale` or `FINAL40`, so the plain Sale case could not be isolated. Confirmed against the live chain: with FINAL SALE removed, a discounted product resolves to Sale in both versions. Live's condition carries a redundant `and product.available` — unreachable as false inside the `elsif` chain, since Sold out is evaluated first. |  ✅ |   |
|  6 |  **Limited Stock** renders when inventory is tracked and 1–9 units remain in total across all variants. |  Confirmed. Note the count is summed across variants, not per size — see Testing Notes. |  ✅ |   |
|  7 |  **St Exclusive** renders when the product is tagged `stexclusive`, and is not masked by a higher badge. |  Confirmed on the correct products, matching live. |  ✅ |   |
|  8 |  **Best Seller** renders when the product is tagged `bestseller`, and is not masked by a higher badge. |  **Kept, but not currently reachable.** No product in the Online Store sales channel carries the `bestseller` tag, so the branch cannot fire today. Same tag string as live, so it has been unreachable there too — pre-existing, not a regression. Decision: leave the branch in place for future use rather than delete it as dead code. Logic verified by equivalence with the live chain; it will render once products are tagged. |  ✅ |   |
|  9 |  Adding a `finalsale`-tagged product to cart still attaches the `_Final Sale` line-item property. |  Confirmed. Regression guard only — the property itself is delivered under `THREADS-12961466499` and was not touched here. |  ✅ |   |
|  10 |  A product tagged `finalsale` or `FINAL40` follows the standard badge precedence rather than getting a special case. In practice it shows **Sale**, since final-sale products are discounted. |  Decided: the rendered badge follows the existing logic, no exclusion added. Returns messaging is unaffected — it lives in the `product.final-sale` and `collection.final-sale` template copy, not the badge. |  ✅ |   |

### Out of Scope

-  **The `_Final Sale` cart line-item property.** Same `finalsale` tag, different consumer, delivered under `THREADS-12961466499`. Criterion 3 above exists only to confirm this ticket does not disturb it.

## Dev Notes:

*File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing.*

-  Branch `develop/feature/THREADS-12961197278-final-sale-badge`, cut from `develop/_candidate` at `fd92419`. Badge removal committed as `be0e966`. `npm run check` reports 56 offenses / 38 errors / 18 warnings both before and after — no new lint debt.

-  **Criteria 1–3, done.** In `snippets/product-card-badges.liquid`, removed the `is_final_sale` assignment block and the `{%- elsif is_final_sale -%}` branch that rendered the badge. The trigger was:

```liquid
{%- if product.tags contains 'FINAL40' or product.tags contains 'finalsale' -%}
  {%- assign is_final_sale = true -%}
{%- endif -%}
```

  A comment was left in its place recording the client direction and warning that `finalsale` still drives the cart line-item property, so nobody removes that in a later pass.

-  **Criterion 4, not started.** `blocks/_product-card-gallery.liquid` (~lines 9–25) currently holds stock 4.1.4's inline badge markup, handling only Sold out and Sale. On the live theme that markup was commented out and replaced with:

```liquid
{% render 'product-card-badges', product: closest.product %}
```

  Restoring that call brings back Limited Stock, St Exclusive, and Best Seller. It will not bring back FINAL SALE, which is the intended outcome. Note the snippet takes a `settings` parameter as well as `product` — check the signature against the live call before wiring it, since the two may not match.

-  **Criterion 5, needs a decision first.** The badge chain in `snippets/product-card-badges.liquid` (~lines 46–70) is an exclusive `if`/`elsif` — first match wins, one badge per card. Order is Sold out → Sale → Limited Stock → St Exclusive → Best Seller. FINAL SALE previously sat second, ahead of Sale. With it gone, a `finalsale` product that also has `compare_at_price > price` now matches the **Sale** branch instead. That is a silent behavior change, not a no-op, and it is why criterion 5 is written as an acceptance criterion rather than assumed.

-  Related audit row: `blocks/_product-card-gallery.liquid`, category "Product Card Badges", `porting_status = NEEDS PORTING (fully dropped)`, 0% preserved, `needs_review = TRUE`, estimated 0.5–1.0 dev / 0.25 QA. That estimate covers the render-call restoration in criterion 4; the badge removal itself was a few minutes.

## Implementation Notes:

## Testing Notes:

### Badge precedence — only one badge ever shows per product card

The badges are a first-match-wins chain. A product can qualify for several and will still show only the **highest** one. This is the same order the live theme used.

|  **Order** |  **Badge** |  **Shows when** |
| --- | --- | --- |
|  1 |  Sold out |  Every variant is unavailable |
|  2 |  Sale |  The product has a compare-at price higher than its price (and is in stock) |
|  3 |  Limited Stock |  Inventory is tracked and **1–9 units remain in total across all variants** |
|  4 |  St Exclusive |  Product is tagged `stexclusive` |
|  5 |  Best Seller |  Product is tagged `bestseller` |

### What this means when checking a product

Work down the list and stop at the first row that is true — that is the badge you should see. If you expected a lower badge and got a higher one, the higher condition is winning, and that is correct behavior rather than a bug.

Worked examples:

-  Tagged `stexclusive`, on sale → shows **Sale**, not St Exclusive. Sale is higher.
-  Tagged `stexclusive`, in stock, full price, 40 units → shows **St Exclusive**.
-  Tagged `stexclusive`, in stock, full price, 6 units left → shows **Limited Stock**. Limited Stock is higher.
-  Tagged `bestseller` and `stexclusive` → shows **St Exclusive**. Best Seller is last.
-  Sold out and on sale → shows **Sold out**.
-  No badge at all → the product matched none of the five.

### Two things that surprise people

-  **Limited Stock counts every variant added together, not per size.** A product with 8 sizes holding 1 unit each totals 8, so it shows Limited Stock even though no single size is close to selling out. Conversely a product with 12 units in one size will not show it.

-  **Best Seller currently cannot appear.** No product in the Online Store sales channel is tagged `bestseller`. The branch is present and correct but unreachable, and it uses the same tag on the live theme, so it has been unreachable there too. Not a regression — see Clarifying Questions.

### FINAL SALE

There is no FINAL SALE badge anymore, by design (ST18d). A product tagged `FINAL40` or `finalsale` now falls to whichever row it matches next — in practice **Sale**, since final-sale products are discounted. The `finalsale` tag still attaches the `_Final Sale` cart line-item property, which is separate and unaffected.

## Bugs from QA:

TBD

## Clarifying Questions:

-  ~~Should a discounted final-sale product show the generic Sale badge, or no badge at all?~~ **Resolved:** the rendered badge follows the existing precedence — no special case for final-sale products. They show Sale.

-  ~~Is the Best Seller badge still wanted?~~ **Resolved:** keep the branch. No product in the Online Store sales channel carries the `bestseller` tag today, so it cannot render — the same is true on the live theme, so this is pre-existing rather than caused by the upgrade. Left in place for future use rather than removed as dead code. It will render as soon as products are tagged; if merchandising is using a different tag string, that is a content fix, not a code change.
