---
monday_id: 13008054312
project_key: TAHARI
authored: 2026-09-16
---

## Background:

On mobile, swiping on homepage carousels (e.g. Featured Collection) navigates through a single product's images instead of to the next product. The inner per-card image carousel captures the touch gesture, preventing the outer product slider from responding. Additionally, the Featured Collection section lacks a model/product image toggle that other sections already have.

## Necessary Info (Design/Documentation):

- Affects all surfaces rendering product cards inside a slider on mobile: homepage (Featured Collection, Products with Image), PDP (YMAL), and other slider sections (tab collections, shop the look, recently viewed, multicolumn, collection block).
- PLP product cards are in a grid layout on mobile (not a slider), so they are unaffected.
- The "Products with Image" section already has a `card_image_mode` setting (Model / Product) that was the pattern to follow for Featured Collection.
- Ghost/product images are identified by the `alt:ghost` media tag.

## Constraints / Scope:

- **In scope:** Disable per-card image swiping on mobile inside any product card slider. Add `card_image_mode` toggle to Featured Collection section.
- **Out of scope:** Single-item slider exemption (allowing image swiping when only 1 card is in the slider) deferred until client requests. PLP behavior unchanged.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | Featured Collection section displays a "Product card image" setting in theme editor with Model (default) and Product options | | ✅ | |
| 2 | When set to Product, Featured Collection cards show the `alt:ghost` tagged image as the primary image | | ✅ | |
| 3 | When set to Model (or unchanged), cards show the on-model featured image (no change from current behavior) | | ✅ | |
| 4 | On mobile, swiping horizontally on any homepage product card slider navigates between products, not between a single product's images | Featured Collection, Products with Image (Silk Edit) | ✅ | |
| 5 | On mobile, any current sliders with product cards sections on the PDP suppress per-card image swiping, horizontal swipe navigates between products | Product Recommendations (YMAL) | ✅ | |
| 6 | On mobile, all other slider surfaces also suppress per-card image swiping | Tab Collections, Shop the Look, Recently Viewed, Multicolumn. For now test currently used sections on HP | ✅ | |
| 7 | On desktop, hover image navigation (prev/next arrows, image cycling on hover) works normally on all slider surfaces | | ✅ | |
| 8 | PLP product cards retain per-card image swiping on mobile (grid layout, not a slider) | | ✅ | |

## Dev Notes:

File paths, line numbers, and code below reflect a review at authoring time. Confirm they still hold before implementing.

**Files changed:**

- `sections/section-collection.liquid` -- Added `card_image_mode` select setting to schema (Model/Product, default Model). Passes `card_image_mode: section.settings.card_image_mode` to the `render 'product-grid-item'` call. Mirrors the existing pattern from `snippets/brick-products.liquid` / `sections/section-products-image.liquid`.

- `assets/theme.css` (line ~11909) -- Added a mobile media query rule alongside existing `hover-images` touch styles:

```css
@media screen and (max-width: 749px) {
  .grid--mobile-slider hover-images,
  .grid--slider hover-images {
    display: none;
  }
}
```

This hides the `<hover-images>` custom element (the inner per-card image carousel) on mobile when inside any slider grid. The primary product image lives in a separate sibling element (`product-item__bg[data-product-image-default]`) and remains visible. Desktop is unaffected by the media query.

**Why `theme.css` and not a section file or `collections.css`:** The rule must apply globally across all pages. Section-scoped `{% style %}` blocks only render on pages containing that section. `collections.css` only loads on collection/search pages, missing PDP (YMAL).

## Implementation Notes:

- Branch: `feature/TAHARI-13008054312-mobile-slider-sections`
- `card_image_mode` setting defaults to `model`, matching pre-existing behavior.
- The CSS rule targets both `.grid--mobile-slider` (sections with a mobile-only slider layout) and `.grid--slider` (sections that are always sliders, like YMAL).

## Testing Notes:

- **Homepage:** Verify Featured Collection and Products with Image sections. On mobile, horizontal swipe should move between product cards. On desktop, hover arrows should cycle through product images.
- **PDP:** Navigate to any product page. Scroll to YMAL section. On mobile, horizontal swipe should move between recommended products.
- **PLP:** Navigate to any collection. On mobile, verify per-card image swiping still works (cards are in a grid, not a slider).
- **Theme editor:** Open Featured Collection section settings. Verify "Product card image" dropdown appears with Model/Product options. Toggle to Product and confirm ghost images display.

## Bugs from QA:

TBD

## Clarifying Questions:

None.
