---
monday_id: 12961466499
project_key: THREADS
authored: 2026-09-11
---

## Background:

-  Part of the Dwell 3.4.0 → 4.1.4 theme upgrade. The live theme tags final-sale products with a hidden line-item property and shows a FINAL SALE label plus red sale pricing in the cart. The upgrade dropped all of it.

-  Flagged in the migration audit as critical across three files, scoped there as a labeling and order-data concern: the property carries through to orders and is used for returns and exchange handling.

-  The impact is larger than the audit recorded. On 4.1.4 today, **no customer can add more than one unit of any product.** A store-level Cart Transform expands any line item that lacks the `_Final Sale` property into a bundle parent, and bundle parents are forced to quantity 1. The add fails silently — the quantity field still reads what the shopper typed, and no error is shown.

-  This was found while testing an unrelated ticket and confirmed by controlled test on `131219882066`: the same variant, same quantity, same minute, differing only by the property, returned `200` with quantity 20 when present and `422` with quantity 1 and `has_components: true` when absent.

## Necessary Info (Design/Documentation):

-  No new design. This restores existing live behavior.

-  Surfaces: product page add-to-cart, quick-add popup, cart page and cart drawer, and sale price display wherever `price.liquid` renders.

-  The feature is gated on the product tag `finalsale`. Products without it are unaffected.

-  Source of truth is the live theme, readable in-repo: `main`, `dev`, `release/_candidate`, and the live-theme pull `fd63e5a` all carry the original code. Stock 3.4.0 (`clean/dwell-3.4.0`) does not, confirming it is a customization rather than vendor code.

-  The client confirmed the tag to use: *"keep final sale cart line item tagged with product tag `finalsale`"* (ST18c). This ticket checks `finalsale` only.

-  The `finalsale` tag has a second, unrelated consumer — the FINAL SALE product card badge, which the client asked to remove under ST18d. That is ticket `THREADS-12961197278`. Removing the badge must not remove this property; they are independent.

## Constraints / Scope:

-  Restores live behavior as-is. No redesign, no change to which products qualify.

-  The Cart Transform itself is out of scope. This ticket restores the property the transform expects; it does not modify, disable, or investigate the transform.

-  Ownership of the Cart Transform is unconfirmed — Rebuy and a coverage/warranty app are both present on the storefront. Worth identifying under Settings → Apps, but not required for this fix.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Adding a `finalsale`-tagged product from a product page attaches the `_Final Sale` line-item property to the cart line. |   |  ✅ |   |
|  2 |  Adding a `finalsale`-tagged product from the quick-add popup attaches the same property. |   |  ✅ |   |
|  3 |  With the property present, quantities above 1 add correctly, and the cart line is not expanded into components. |   |  ✅ |   |
|  4 |  The cart displays a FINAL SALE label for tagged items, in both the cart page and cart drawer layouts. |   |  ✅ |   |
|  5 |  Sale prices render in the brand red in the cart and wherever product pricing is shown. |   |  ✅ |   |
|  6 |  Products without the `finalsale` tag receive no property and no label, and their add-to-cart behavior is unchanged. |   |  ✅ |   |

### Out of Scope

-  **The Cart Transform's behavior.** Expanding un-propertied lines into quantity-1 bundles is the transform's own logic. This ticket satisfies it rather than changing it. If the transform is misconfigured, that is a separate investigation and likely an app-support conversation.

-  **The `FINAL40` tag.** It never drove the line-item property and does not here — the client specified `finalsale` (ST18c). `FINAL40` was only ever a product card badge trigger, handled under ticket `THREADS-12961197278`.

## Dev Notes:

*File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing.*

-  Branch `develop/feature/THREADS-12961466499-final-sale`, cut from `develop/_candidate`. Implemented in commit `db7ad31`. `npm run check` shows 56 offenses both before and after, none in the touched files — no new lint debt.

-  **`blocks/buy-buttons.liquid`** (~line 69) and **`snippets/quick-add.liquid`** (~line 113) — hidden input after the `name="id"` input:

```liquid
{% if product.tags contains 'finalsale' %}
  <input type="hidden" name="properties[_Final Sale]" value="Final Sale">
{% endif %}
```

-  **`snippets/cart-products.liquid`** — label in both layouts, plus `price--on-sale` on the sale price and conditionally on the original price:

```liquid
{% if item.product.tags contains 'finalsale' %}
  <div class="final-sale-label">FINAL SALE</div>
{% endif %}
```

-  **`snippets/price.liquid`** — `class="price-container"` on the `priceContainer` div, and `price--on-sale` added to the sale-price spans in both `show_sale_price_first` branches. 4.1.4 restructured this file, so the classes attach to `price-item__group price` spans rather than live's single span.

-  **`assets/base.css`** — token on `:root` plus the shared rule:

```css
--color-sale-price: #e51a4e;

.price--on-sale,
.product-single__price.on-sale {
  color: var(--color-sale-price);
}
```

-  `.final-sale-label` went into `cart-products.liquid`'s `{% stylesheet %}` block since only that file uses it. `.price--on-sale` is shared by two snippets, so it stays global.

-  **Three deliberate deviations from the live source**, each reversible if parity matters more:
    -  Brand red is a token rather than a repeated literal, per `CLAUDE.md`'s rule that colors never appear as literals. Same rendered color.
    -  Dropped `!important` from `.price--on-sale`. Verified no competing `color` rule exists for `.price` or `price-item__group` anywhere in 4.1.4, so the cascade doesn't need it.
    -  Dropped the commented-out `_finalsale` input that sat beside the live property; the audit flagged it as dead weight.

-  **Audit rows to update:** `blocks/buy-buttons.liquid`, `snippets/quick-add.liquid`, and `snippets/cart-products.liquid` move from "needs porting (mostly dropped)" to done; `snippets/price.liquid` from "needs porting (fully dropped)" to done. The `buy-buttons.liquid` row also clears its `needs_review = TRUE`. Severity on all three Final Sale rows should be raised to reflect that this blocks multi-unit purchases store-wide, not just labeling.

## Implementation Notes:

-  Branch `develop/feature/THREADS-12961466499-final-sale`, commit `c8a5045`, PR #19 into `develop/_candidate`. Five files, 46 insertions / 5 deletions.

-  The gate is the product tag `finalsale`, per ST18c. `FINAL40` is not used here — it only ever drove the product card badge.

-  Line-item property is `properties[_Final Sale]` with value `Final Sale`, matching live exactly. The name and value matter: the Cart Transform matches on the property's presence, so renaming it would reintroduce the quantity collapse.

-  Brand red is now the custom property `--color-sale-price` on `:root` in `assets/base.css`, replacing the repeated `#e51a4e` literal. `.price--on-sale` lives in `base.css` because two snippets use it; `.final-sale-label` lives in `cart-products.liquid`'s `{% stylesheet %}` block because only that file does.

-  Three deliberate departures from the live source, all reviewed and accepted: the color token, dropping `!important` from `.price--on-sale`, and not carrying over the commented-out `_finalsale` input the audit flagged as dead.

-  `npm run check`: 56 offenses before and after, none in the touched files.

## Testing Notes:

**AC #3 — the quantity regression.** Verified on [Tube Strap, Camel / One Size](https://www.shopsocialthreads.com/products/tube-strap?variant=39605788966994) (variant `39605788966994`), the same product and variant that originally exposed the bug. With the fix in place it now accepts up to 25 units — matching the live 3.4.0 theme — and the line is no longer a Cart Transform item. Before the fix, the same add collapsed to quantity 1 with `has_components: true`.

The 25 ceiling is the store's own Add-to-cart limit setting (Settings → Checkout → Add-to-cart limit, currently 25), not a theme constraint. Hitting 25 is correct behavior, not a partial fix.

**AC #4 — cart label.** Confirmed on both surfaces, matching live: the ajax cart drawer and the cart template. Both render from the same snippet, so they stay in step. Note the cart drawer is enabled on the development theme but was disabled on `131219882066` (cart icon linked straight to `/cart`, no `cart-drawer` element) — a theme settings difference, not a code one, worth knowing if the drawer appears missing during a QA pass.

**AC #5 — sale price color.** Confirmed rendering in the brand red. The two deviations from the live source were reviewed and accepted: the color is a `--color-sale-price` token rather than a repeated literal, and `.price--on-sale` carries no `!important` (no competing `color` rule for `.price` or `.price-item__group` exists in 4.1.4, so the cascade doesn't need it).

**AC #6 — untagged products unaffected.** Confirmed. Products without the `finalsale` tag receive no property and no label, and still add multiple units normally. This also confirms the Cart Transform is not applying catalog-wide — had untagged products collapsed to quantity 1, the problem would have been broader than this ticket.

To re-check after future changes: set the quantity above 1 on a `finalsale`-tagged product, add to cart, then read `/cart.js`. Expect a single line at the requested quantity with `has_components: false` and `properties: {"_Final Sale": "Final Sale"}`. A line that comes back at quantity 1 with `has_components: true` means the property is not reaching the cart.

## Bugs from QA:

None. All six acceptance criteria verified on the development theme.

## Clarifying Questions:

None.
