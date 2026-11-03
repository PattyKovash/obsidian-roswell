#  

## Background:

 A previous ticket ([Monday doc 18415270754](https://roswellstudios-company.monday.com/docs/18415270754)) fixed vertical 9×16 video cropping on the PDP by setting `object-position: bottom center` so models' feet/shoes remain visible. That change ([commit ](https://github.com/roswell-studios/Elie_Tahari_TAHARI_2026/pull/35/changes/b49239f2107bcebc7a0eb454795fcea0231d0fe5)[`b49239f`](https://github.com/roswell-studios/Elie_Tahari_TAHARI_2026/pull/35/changes/b49239f2107bcebc7a0eb454795fcea0231d0fe5)) was applied using a combined CSS selector that inadvertently targets all product gallery images in addition to videos. As a result, every static product photo on the PDP is now bottom-anchored — cropping the top of horizontal and square images — rather than centering as before.

 

## Necessary Info (Design/Documentation):

-  **Affected surface:** PDP product gallery (main viewer + thumbnails), plus any page using the `section-products-image` section.

-  **Root cause:** `assets/product.css` ~line 434 uses a combined selector that groups the product image class and the video element together under the same `object-position` rule. The rule should apply only to video.

-  **No new design needed** — restoring the default centered position for static images is the goal. The video-specific `object-position` behaviour from Ticket 38 must be preserved.

-  **Reference file:** `assets/product.css`

 

## Objective / Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  QA |
| --- | --- | --- | --- | --- |
|  1 |  On the PDP, static product images (non-video) use the default `object-position` (center) and are not bottom-cropped |   |   |   |
|  2 |  On the PDP, 9×16 vertical videos retain `object-position: bottom center` — feet and shoes must remain visible.
 Ideal if no cropping of head or feet on any breakpoint. However, if cropping, occurs, bottom align so outfit plus shoes are not cropped. Ok to have model's head cropped. |   |   |   |
|  3 |  Tested on desktop and mobile |   |   |   |

## Dev Notes:

### Fix 1 — `assets/product.css` ~line 434 (PRIMARY)

 The combined selector was used to avoid repeating `object-position`, but it incorrectly applies the video-only rule to all product images.

 

 **Current code (~line 434):**

 

```css
.product__photo .image-wrapper--cover img,
.product__media video {
  object-position: bottom center;
}

```

 

 **Proposed change — split into two independent rules:**

 

```css
.product__media video {
  object-position: bottom center;
}

```

 

 Remove the `.product__photo .image-wrapper--cover img` selector entirely. Static product images will fall back to their default (`object-position: center`, inherited from `object-fit: cover` behaviour in the theme base styles).

 

 

## Implementation Notes:

 TBD

 

## Bugs from QA:

 TBD

 

## Clarifying Questions: