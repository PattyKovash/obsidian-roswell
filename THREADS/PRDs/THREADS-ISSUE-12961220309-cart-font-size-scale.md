---
monday_id: 12961220309
project_key: THREADS
authored: 2026-09-15
---

## Background:

-  The live theme defines a set of cart font-size variables and uses three of them to size the cart totals. The 4.1.4 upgrade dropped the definitions but kept the three usages.

-  The result is a live bug on the upgraded theme: those three sizes point at variables that no longer exist, so the text silently falls back to an inherited size. The order total renders no larger than the label beside it.

## Necessary Info (Design/Documentation):

-  No design. This restores the sizes the live site already uses.

-  Affects the `/cart` page only. Rebuy Smart Cart is the ajax cart on this store and uses its own markup and styling, so it is unaffected either way.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  On the cart page, the **order total amount** renders clearly larger than the "Estimated total" label beside it. |  Desktop 20px, mobile 18px. |  ✅ |   |
|  2 |  The **"Estimated total" label** and the **subtotal / discount rows** above it render at the small text size. |  14px, both viewports. |  ✅ |   |
|  3 |  The **Beam nonprofit picker**, which sits inside the subtotal block, renders at the small text size with no layout break. |  14px on mobile. |  ✅ |   |
|  4 |  On phones the order total steps down one size from desktop. |  20px → 18px below 750px. |  ✅ |   |
|  5 |  **Individual line item prices** in the cart render at the same size as live, not smaller. |  Separate from the dangling references — stock 4.1.4 deliberately reduced this one. |  ✅ |   |

## Dev Notes:

*Reflects a review at authoring time — confirm before implementing.*

-  All four changes, and what each one sizes on screen:

|  **File : line** |  **Selector** |  **On screen** |
| --- | --- | --- |
|  `snippets/cart-summary.liquid:396` |  `.cart-totals__original-container` + all descendants |  Subtotal / discount rows, and the Beam picker nested inside them |
|  `snippets/cart-summary.liquid:405` |  `.cart-totals__total-label` |  The "Estimated total" label |
|  `snippets/cart-summary.liquid:409` |  `.cart-totals__total-value` |  The order total figure (steps down below 750px) |
|  `snippets/cart-products.liquid:723` |  `.cart-items__price` |  Each line item's price |

-  The first three are commit `76c5234`, the fourth `880c7c9`.

-  Live defined 7 of these variables but only ever used 3 (`sm`, `md`, `xl`). The unused four — `2xs`, `xs`, `lg`, `2xl` — were not recreated. A search for `--cart-font-size--` should return **zero** results on this branch; it returns 11 across 3 files on the live theme.

-  The variables were pure aliases of `--font-size--*` with no overrides anywhere, so resolving the references renders identically to live. Only 3 of the 7 were ever used; the other 4 are not recreated.

-  On live these variables were scoped to `.cart-page`, which the theme's own drawer never had — so they were already broken there. Moot in practice: that drawer does not render on this store.

-  Commit `880c7c9` is a second, different fix. Of the three variables live actually used, two (`sm`, `xl`) were dangling references in `cart-summary.liquid`. The third, `md`, sized `.cart-items__price` — and there stock 4.1.4 had **deliberately** set `--font-size--sm`, making line item prices smaller than live. Not a dangling reference, a vendor change. Restored to `--font-size--md` to match live; the rest of that rule was already identical.

## Implementation Notes:

## Testing Notes:

### Where to look on the page

Everything is on the **cart page** (`/cart`). Nothing to check elsewhere — Rebuy's ajax cart uses its own styling, and the theme's own drawer does not render on this store.

Go to `/cart` with at least one item, ideally one that is discounted so the strikethrough rows appear.

**In the totals block at the bottom:**

|  **What you're looking at** |  **Should be** |
| --- | --- |
|  The big **order total** figure, beside "Estimated total" |  Clearly the largest text in the block |
|  The **"Estimated total"** label itself |  Small — noticeably smaller than the figure next to it |
|  The **subtotal / discount rows** above the total |  Small, same size as the label |
|  The **Beam nonprofit picker** ("choose your impact") |  Small, same size as the rows around it, no overflow or wrapping oddity |

**In the item list above it:**

|  **What you're looking at** |  **Should be** |
| --- | --- |
|  The **price on each line item**, right-hand side |  Medium — a step larger than the totals labels below, matching live |

**The failure this fixes** looked like: the order total rendering at the same size as its label, so nothing stood out as the amount due. If you see that, the fix has not applied.

**Check mobile first**, then desktop — the order total is the one element that deliberately differs between them.

### Measured results

Verified on `131192324178`, mobile then desktop.

|  **Element** |  **Mobile (390)** |  **Desktop (1200)** |
| --- | --- | --- |
|  Order total amount |  18px |  20px |
|  "Estimated total" label |  14px |  14px |
|  Subtotal / discount rows |  14px |  14px |
|  Beam nonprofit picker |  14px |  — |

The sizes above are what the live theme renders — the variables were pure aliases, so resolving them reproduces live exactly.

Screenshot (mobile cart totals): `THREADS/screenshots/cart-totals-mobile-390.png`

Rebuy's ajax cart uses its own selectors (`rebuy-cart__flyout-subtotal*`) — none of the theme's cart-totals classes are present there, so it is out of scope.

## Bugs from QA:

TBD

## Clarifying Questions:

None.
