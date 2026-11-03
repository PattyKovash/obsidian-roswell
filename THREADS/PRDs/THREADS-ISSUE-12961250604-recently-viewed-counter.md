---
monday_id: 12961250604
project_key: THREADS
authored: 2026-09-16
---

## Background:

-  The live (pre-upgrade) theme displayed a "recently viewed" counter on product cards and the PDP. On product cards, `blocks/swatches.liquid` read the `custom.view_count` metafield and showed "X RECENTLY VIEWED" when count > 9. On the PDP, `blocks/_product-details.liquid` contained an inline script that tracked views via `qa.wpweb.co.in`, incremented/decremented counts per session, and polled every 10 seconds for a live count.

-  The Dwell 4.1.4 upgrade dropped all three touch-points (swatches badge, PDP script, and the `snippets/text.liquid` hook div). None of the view counter code survived the upgrade.

-  Note: this is distinct from the `recently-viewed-products.js` localStorage system that powers the predictive search empty state — that feature is intact in the upgraded theme and is unrelated to the view counter.

## Necessary Info (Design/Documentation):

-  No new design. Reimplements the same visual treatment from the live theme.

-  The third-party endpoint `qa.wpweb.co.in/social-threads/view-counter.php` is the data source for real-time PDP tracking. The `custom.view_count` Shopify metafield is the data source for product card badges (presumably synced by the same service).

-  Brand red `#e51a4e` and Red Hat Display font match the old implementation.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Product cards show "X RECENTLY VIEWED" badge when `custom.view_count` > 10. |  Controlled by theme setting "Show recently viewed counter on product cards". |  Done |   |
|  2 |  Theme settings expose color and text size for the product card badge. |  Under Theme settings > Product cards > View counter. |  Done |   |
|  3 |  PDP has a "View counter" block available in the product details section. |  Merchants add it via the theme editor block picker. |  Done |   |
|  4 |  PDP block tracks views via `qa.wpweb.co.in` — increments on load (once per session), decrements on unload, polls every 10s. |  Same behavior as old theme, debug logs removed. |  Done |   |
|  5 |  PDP block settings expose alignment, color, and text size. |  Per-block settings in the theme editor. |  Done |   |
|  6 |  View counter block is also available in the product card block list. |  Registered in `_product-card.liquid` schema. |  Done |   |
|  7 |  Product inventory block has alignment setting. |  Defaults to left instead of hardcoded center. |  Done |   |
|  8 |  View counter block added to all product templates (default, final-sale, preorder). |  Same settings: `color_palette.color1`, `12px`. Positioned after review, before price. |  Done |   |

## Dev Notes:

-  **New file:** `blocks/view-counter.liquid` — standalone block with the tracking script and counter display. Registered as a `@theme` block with presets in the "Product" category.

-  **Modified:** `blocks/swatches.liquid` — added the metafield-based view count badge below swatches, gated by `settings.show_view_count_on_cards`. Styles merged into the existing `{% stylesheet %}` block (Liquid only allows one per file).

-  **Modified:** `blocks/_product-details.liquid` — added `view-counter` to the schema block list.

-  **Modified:** `blocks/_product-card.liquid` — added `view-counter` to the schema block list.

-  **Modified:** `config/settings_schema.json` — added three settings under Product cards: `show_view_count_on_cards` (checkbox), `view_count_color` (color), `view_count_text_size` (text input for px/rem).

-  **Modified:** `blocks/product-inventory.liquid` — added `text_alignment` setting for alignment control (left/center/right). Defaults to left.

-  **Modified:** `templates/product.final-sale.json` and `templates/product.preorder.json` — added `view_counter_zVYQqq` block matching the default template configuration.

-  The old implementation injected `#viewsCounterRTEA` via `snippets/text.liquid` — a hack that coupled the counter to the text block. The new approach uses a dedicated block, so the counter is self-contained and independently positionable.

-  All `console.log("[DEBUG]...")` statements from the old implementation have been removed.

## Implementation Notes:

Commits `33fff83` and `a323ae2` on `develop/feature/THREADS-12961250604-recently-viewed`. PR #35.

## Testing Notes:

### Where to look

-  **Product cards:** Any collection page (`/collections/shop-all`). The badge only appears on products where the `custom.view_count` metafield value exceeds 10.
-  **PDP:** Any product page — add the "View counter" block via the theme editor.

### What to check

1. Toggle "Show recently viewed counter on product cards" in theme settings — badge appears/disappears on collection pages.
2. Change the color and text size settings — verify they apply to the badge.
3. On PDP, add the View counter block — verify it shows the count and updates in real time.
4. Open a product in a new session — verify the count increments (check network tab for `qa.wpweb.co.in` calls).
5. Close/navigate away — verify the decrement beacon fires (network tab, `sendBeacon`).
6. Verify no console debug logs appear (the old `[DEBUG]` statements should be gone).
7. Mobile: verify the badge renders correctly on phone-width screens.
