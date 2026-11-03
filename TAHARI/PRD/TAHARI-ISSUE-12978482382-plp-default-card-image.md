---
monday_id: 12978482382
project_key: TAHARI
authored: 2026-09-04
---

## Background:

Elie Tahari wants the PLP to show flat lay images by default when a shopper lands on it. The `Model | Product` toggle must still work from there.

Today the grid always starts on Model and there is no way to change that.

## Necessary Info (Design/Documentation):

- Affected surfaces: collection pages (`Collection products` section), search results (`Search` section).
- Flat lay images are resolved from product media whose alt text is the literal string `alt:ghost`, falling back to the second product image. Products with neither keep showing the featured image.
- The toggle is a runtime JS attribute swap (`assets/collection-model-switcher.js`), scoped to `closest('collection-component')`, so it only works in the collection and search grids.
- Grid cards come from one shared snippet, `snippets/product-grid-item.liquid`.

## Constraints / Scope:

**In scope**
- Landing on flat lay, server-rendered so there is no post-load swap.


**Out of scope**
- Persisting the shopper's toggle choice across refresh. A refresh returns the grid to the default. This matches current live behavior, so no action. Investigated 2026-09-04; assessment recorded in `../vault/04-engineering/patterns/product-card-image-modes.md`.
- Other sections that render product cards. They keep showing Model.


## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
| 1 | Landing on a collection page shows flat lay images on product cards, painted on first load with no flash or swap. |  | ✅ |  |
| 2 | The `Model \| Product` toggle switches all cards to model images, and back to flat lay, with the correct button shown as active. |  | ✅ |  |
| 3 | The hover slider's first slide matches the visible card image, so hovering away and back never reveals the other shot. This is the live behavior when Product is selected. |  | ✅ |  |
| 4 | Cards appended by infinite scroll match the shopper's current toggle selection, not the page default, in both modes. |  | ✅ |  |
| 5 | Cards returned by a filter re-render match the shopper's current toggle selection, in both modes, and the toggle keeps its state. |  | ✅ |  |
| 6 | Products with no `alt:ghost` media and no second image keep showing the featured image and are unaffected by the toggle. |  | ✅ |  |
| 7 | Behavior checked on mobile and desktop |  | ✅ |  |
| 8 | With the setting on Model, both surfaces behave identically to current production. |  | ✅ |  |

## Dev Notes:

The state is rendered server-side, not swapped in by JS on load. The JS approach was rejected: the non-visible image is `loading="lazy"` inside a `display:none` wrapper, so swapping on load flashes and leaves the discarded image as the LCP resource.

**Pre-existing issue, not addressed here**

On a fresh load the hidden donor images are still downloaded, roughly doubling first-screen card image requests. `display:none` does not reliably suppress `loading="lazy"`. This is in production today and is unavoidable while the toggle needs both shots present. Needs its own ticket; likely fix is rendering the donor at a reduced width.

## Implementation Notes:

- Added a setting to the `Collection products` and `Search` sections settings to control default layout in grid. Client only requested PLP; however, for consistency I added it to both since there was time left in the original estimate.
- The state is rendered server-side, not swapped in by JS on load. The JS approach was rejected: the non-visible image is `loading="lazy"` inside a `display:none` wrapper, so swapping on load flashes and leaves the discarded image as the LCP resource.
- Mechanism writeup: `../vault/04-engineering/patterns/product-card-image-modes.md`.

## Testing Notes:

Use a collection with products carrying genuine `alt:ghost` media, not only the `product.media[1]` fallback. Run each at 375px and 1440px.

**Setting on Product**
1. Load the PLP. Cards show flat lay immediately, no flash, Product button active.
2. Toggle to Model, then scroll to load another page. New cards must arrive as Model, not flat lay. Main regression risk.
3. Apply a filter while in Model mode. Same expectation.
4. Toggle back to Product, hover a card and return to start. The flat lay shot stays.
5. Repeat 1 and 2 on search results.

**Setting on Model (regression)**
6. Load the PLP. Cards show model images, Model button active.
7. Rapid scroll several pages, then toggle to Product and back. No duplicates, no cards stuck in either state.
8. Apply a filter in each mode.

**Fallback**
9. Find a product with a single image. It shows its featured image in both modes.

## Bugs from QA:

TBD

## Clarifying Questions:

None.
