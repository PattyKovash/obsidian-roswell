---
monday_id: 12961252647
project_key: THREADS
authored: 2026-09-15
---

## Background:

-  The 4.1.4 theme upgrade dropped several styling customizations from the old 3.4.0 theme. The audit identified 5 items under the "Migrate/Remediate Styling" category (ST14a-e, ST18i) covering brand colors, font sizing, text alignment, app integration CSS, and product grid overrides.

-  Some of these were already resolved by prior migration work. This PRD covers the full scope — what was already done, what was ported in this pass, and what remains as QA-only.

## Necessary Info (Design/Documentation):

-  No design. All items restore the visual treatment of the live site or adapt third-party app styling for the new theme structure.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Dev** | **QA** |
| --- | --- | --- | --- |
| 1 | Sale price styling — sale price spans use brand red | ✅ | |
| 2 | Cart font-size scale — cart total, subtotal, and line-item price sizing | ✅ | |
| 3 | Sale price color — discounted prices render in brand accent | ✅ | |
| 4 | Final sale label styling | ✅ | |
| 5 | Product grid zoom-out overrides — hide card details in zoom-out view | ✅ | |
| 6 | Pagination overrides — continuous gray bar layout with brand colors | ✅ | |
| 7 | View counter styling — **reopened**, markup now exists (`.collection-view-count` in `blocks/swatches.liquid`, plus a separate `.view-counter` block) | | |
| 8 | Quick-add modal price alignment — left-aligned to match old theme | ✅ | |
| 9 | Rebuy Smart Cart drawer suppression — hide native cart drawer when Rebuy is open | ✅ | |

### Additional Styling Updates

| **#** | **Item** | **Dev** | **QA** |
| --- | --- | --- | --- |
| 10 | More payment options link color — added customizer color picker setting, defaults to brand pink | ✅ | |
| 11 | Protection modal background — white background on product protection modal | ✅ | |
| 12 | Swym wishlist icon positioning — heart icons on product grid cards | ✅ | |
| 13 | Close button size — increased across all modals and drawers to match old theme | ✅ | |
| 14 | Search modal close button size — increased to match other close buttons | ✅ | |
| 15 | Search border width — added customizer setting, defaults to 0 (no border) | ✅ | |
| 16 | Cart bubble colors — set via existing customizer settings (bubble_style: custom) | ✅ | |

## Dev Notes:

-  Commits on `develop/feature/THREADS-12961256086-pagination`:
   - `bcb4770` — more payment options link color setting, price alignment revert
   - `aea2548` — protection modal, Swym positioning, close button size, search border width setting
   - `33dcebc` — search modal close button size

-  The more payment options link color was missed by the original audit because 4.1.4 refactored `blocks/accelerated-checkout.liquid` into `snippets/buy-buttons-styles.liquid`, and the file-by-file diffing methodology couldn't catch stock code dropped during file reorganization. A follow-up audit of all refactored file pairs confirmed this was the only such gap.

-  The Rebuy suppression uses `!important` deliberately — Rebuy's own JS manipulates inline styles, so specificity alone isn't reliable. The old theme used the same approach.

-  The `#cart-drawer` element in 4.1.4 is a `<theme-drawer>` custom element (not a plain `<div>` like the old `#CartDrawer`). `display: none !important` still works on custom elements.

-  Close button SVG changed between theme versions: `icon-close.svg` went from 14x14 viewBox with stroke-based paths to 16x16 viewBox with a fill-based path. The CSS size bump from `--icon-size-xs` to `--icon-size-sm` compensates for the denser fill rendering.

-  `{% stylesheet %}` blocks in Liquid are statically compiled and do not process Liquid output tags (`{{ }}`). Any CSS variables that need to read theme settings must be defined in an inline `<style>` tag instead.

## Testing Notes:

### Quick-add modal (item 8)

1. Navigate to any collection page
2. Click the quick-add button on any product card
3. Confirm the price in the modal is left-aligned
4. Check on mobile viewport too

### More payment options link (item 10)

1. Navigate to any PDP
2. Confirm the "More payment options" link below the buy buttons is pink (#e51a4e)
3. In customizer, navigate to product form > accelerated checkout block settings
4. Change the link color and confirm it updates

### Rebuy Smart Cart (item 9)

1. Add a product to cart so the Rebuy Smart Cart drawer opens
2. Confirm only the Rebuy drawer is visible — the native theme cart drawer should not appear behind or alongside it
3. Close the Rebuy drawer and open the native cart drawer (cart icon) — confirm it still works normally when Rebuy isn't open

### Close buttons (items 13–14)

1. Open the search modal — confirm the close X is appropriately sized
2. Open a quick-add modal — confirm the close X matches
3. Open the cart drawer — confirm close X
4. Compare visually against old theme close buttons

### Search border (item 15)

1. Open search modal — confirm no visible border on the search input by default
2. In customizer, go to Theme settings > Search > Border width
3. Set to 1–4px and confirm the border appears

### Swym wishlist (item 12)

1. Navigate to a collection page with Swym enabled
2. Confirm wishlist heart icons appear correctly positioned on product cards (top area of card)
3. Check resource list items if applicable

### Protection modal (item 11)

1. Open the product protection modal on a PDP
2. Confirm the modal has a white background
