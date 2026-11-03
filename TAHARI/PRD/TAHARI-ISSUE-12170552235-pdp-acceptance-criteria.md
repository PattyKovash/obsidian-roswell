# PDP Acceptance Criteria (TAHARI-12170552235)

Living checklist for the new PDP's four components, matching the PRD-style
acceptance-criteria tables (see `pdp-03-variant-picker.md` /
`pdp-04-buy-box-actions.md` / `pdp-05-sticky-add-to-cart-bar.md` for the
per-PRD versions this rolls up). High-level functionality/styling only —
for implementation detail see `TAHARI-ISSUE-12170552235-pdp-qa-punchlist.md`.

**Last updated:** 2026-08-05

## Test Products

| Product | What it covers |
|---|---|
| [shldr-detail-dress-e706d515-black](https://www.elietahari.com/products/shldr-detail-dress-e706d515-black) | Color option with unusual casing |
| [judith-blouse](https://www.elietahari.com/products/judith-blouse) | Multiple colors, sale price, mix of sold-out and available sizes |
| [amina-fluid-crepe-halter-top-in-lemon-silk](https://www.elietahari.com/products/amina-fluid-crepe-halter-top-in-lemon-silk?variant=46818108932233) | Sibling-color product |

---

## 1. Variant Picker

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Desktop shows Color as swatch chips and Size as a boxed grid, matching Figma. |   |  ✅ |  ✅ Judith Blouse, Amina |
|  2 |  Mobile shows a compact "Size / Colour" trigger row that opens a picker panel, matching Figma. |   |  ✅ |  ✅ All three test products |
|  3 |  Selecting a size or color updates the page (price, availability, image) the same way on mobile and desktop. |   |  ✅ |  ✅ |
|  4 |  Sold-out sizes/colors are visually muted and distinguishable from a currently-selected value. |   |  ✅ |  ✅ Judith Blouse |
|  5 |  The selected value is clearly indicated (underline) on both desktop and mobile. |   |  ✅ |  ✅ |
|  6 |  Sibling-color products link out to the other product instead of swapping in place; native-color products swap in place. |   |  ✅ |  ✅ Amina (sibling) |
|  7 |  Size Chart opens correctly from both desktop and mobile. |   |  ✅ |  ✅ |
|  8 |  Color option renders correctly regardless of how the option is named/capitalized in Shopify. |  Was broken on shldr-detail-dress specifically — Color option didn't show up on mobile at all. |  ✅ |  ✅ Fixed and re-verified |
|  9 |  Size selection boxes stay a reasonable, tappable size on all mobile/tablet widths, not just standard phone widths. |   |  ✅ |  ✅ |

---

## 2. Buy Box (Add to Bag / Buy Now / Sold Out / Notify Me)

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Buy buttons match the Figma design on both desktop and mobile. |   |  ✅ |  ✅ Judith Blouse |
|  2 |  Clicking "Add to Bag" adds the item to the cart without a page reload. |   |  ✅ |  ✅ |
|  3 |  Clicking "Buy Now" adds the selected item to cart, then goes straight to checkout — anything already in the cart is preserved, not replaced. |   |  ✅ |  ✅ |
|  4 |  When sold out, a disabled "Sold Out" indicator and a "Notify Me" button show instead of Add to Bag/Buy Now. |   |  ✅ |  ✅ Judith Blouse |
|  5 |  "Notify Me" opens a form with the email field ready to fill in immediately. |   |  ✅ |  ✅ |
|  6 |  Notify Me panel looks and behaves the same way on mobile and desktop. |  Desktop redesigned to match mobile's styling and to close via the same drag-handle gesture. |  ✅ |  ✅ |
|  7 |  A failed add-to-cart shows a clear error message for either button. |   |  ✅ |   |
|  8 |  Switching between Available and Sold Out states doesn't produce a jarring flash. |  Improved but not perfect — parked for now pending further design direction. |  ⚠️ |  ⚠️ Partial |
|  9 |  Something clearly indicates the page is working while a size/color selection is being processed. |  New: a brief, subtle dim while the selection updates. |  ✅ |  ✅ |
|  10 |  Add to Bag's loading animation looks the same everywhere the button appears (main form, both sticky bars). |   |  ✅ |  ✅ |

---

## 3. Sticky Add-to-Cart Bar — Desktop

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Bar is hidden on page load, appears once the main buy box scrolls out of view, and hides again scrolling back up. |   |  ✅ |  ✅ |
|  2 |  Bar shows thumbnail, product name, size/colour, price, and working Add to Bag/Buy Now (or Sold Out/Notify Me). |   |  ✅ |  ✅ |
|  3 |  Bar updates immediately if the shopper changes size/color while it's visible. |   |  ✅ |  ✅ |
|  4 |  Add to Bag/Buy Now behavior is intentional and documented, not accidentally different from the main form. |  Currently set to scroll to the top of the page first rather than add directly — this is an explicit, adjustable choice, not a bug. |  ✅ |  ✅ |
|  5 |  Add to Bag's loading animation matches the main form's button. |  Still a simplified placeholder — on hold, not prioritized yet. |  ⚠️ |   |

---

## 4. Sticky Add-to-Cart Bar — Mobile

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Bar appears only once the in-page buy box scrolls out of view, and hides again scrolling back up (same behavior as desktop). |  Rebuilt 2026-08-05 — previously always visible from page load, which didn't match intent. |  ✅ |  ✅ |
|  2 |  Bar renders as one combined row (Size/Colour on the left, Add to Bag/Buy Now or Sold Out/Notify Me squares on the right), matching Figma. |   |  ✅ |  ✅ |
|  3 |  The in-page (non-sticky) buy box looks identical to the sticky version, not a separately-styled variant. |   |  ✅ |  ✅ |
|  4 |  Bar sizing/position holds correctly across different phone/tablet screen heights. |  Previous version only looked correct at one specific screen height. |  ✅ |  ✅ 390×700, 390×844, 390×950 |
|  5 |  Size/Colour picker opens and stays in sync whether triggered from the in-page row or the sticky bar. |   |  ✅ |  ✅ |
|  6 |  Bar sits above the site's bottom icon nav with no gap or overlap, and page content below reserves space so nothing is hidden behind it. |   |  ✅ |  ✅ |
|  7 |  Add to Bag's loading animation matches the main form's button. |   |  ✅ |  ✅ |
|  8 |  Third-party popups (e.g. PushOwl) don't overlap the bar. |   |  ✅ |  ✅ |
