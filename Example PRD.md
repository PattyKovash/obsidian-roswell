---
monday_id: 697645142
project_key: TAHARI
authored: 2026-06-05
---

## Background:

-  Raised by the client on Sprint Call – June 04 ([Fathom @38:46](https://fathom.video/calls/697645142?timestamp=2326.37)): adding products to cart shows some thumbnails as "ghosts," others as model shots. Client wants the cart to always show the **model image**.

-  Confirmed on the call: the **model image is always the first / main image** of the product ([Fathom @39:18](https://fathom.video/calls/697645142?timestamp=2358.48)).

-  Root cause: the cart renders `line_item.image`, which resolves to the **variant's** image when one is set, otherwise the product's featured image — producing inconsistent thumbnails depending on which variant was added.

-  Decision: use the product's **first (featured) image** always, falling back to the variant/line-item image only if the product has no image.

## Necessary Info (Design/Documentation):

-  Client product structure: each **color is its own product** (colors aren't variants); each product's variants are **sizes only**; color products are linked via a metafield. The **first image of each product is the model image**.

-  No new design required — same styling and layout.

-  Surfaces: cart page + cart drawer (same partial). **Checkout is out of scope** — see Constraints / Scope.

-  Current state: no explicit fallback exists today. The cart relies on `line_item.image`, which already falls back to the product's featured image when the variant has none — but that's Shopify's default behavior, not something the theme codes for. This ticket adds explicit first-image-then-variant-image logic.

## Constraints / Scope:

-  Applies to the **cart only** (cart page + cart drawer). Does not change the checkout image.

-  Carrying the image through to checkout requires a separate ticket (custom checkout extension via Cart Transform), or the client can update the variant image directly — no dev work needed for that path.

-  Assumes all products follow the convention that the first image is the model image. Products that don't (e.g. first image is a ghost/product-only shot) are out of scope — a merchandising/content issue, not a theme bug.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  The cart thumbnail shows the product's first/featured image (the model image), per client convention. |   |   |   |
|  2 |  For a product with only size variants (no variant image), the cart shows the product's first (model) image. |   |   |   |
|  3 |  For a product with a variant-specific image assigned, the cart still shows the product's first image, not the variant image. |   |   |   |
|  4 |  When the product has no featured image, the cart falls back to the variant / line-item image. |   |   |   |
|  5 |  When no image is available at all, the cart renders the existing `image--empty` empty state (no broken image). |   |   |   |
|  6 |  Applies to both the cart page and the cart drawer. |   |   |   |
|  7 |  No visual/layout regression: matches live, correct product link. |   |   |   |
|  8 |  Scoped to the cart only — checkout is explicitly not addressed by this ticket (see Constraints / Scope). |   |   |   |

## Dev Notes:

## Testing Notes:

-  TBD (post-execution)

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  Does the client need the model image to carry through to checkout? If yes, that's a separate ticket (checkout extension via Cart Transform) or the client can update the variant image directly — confirm which path before scoping.
