#  

> **Note:** Updated copy of the original PRD (`TAHARI-ISSUE-12397474592-cropped-video.md`), kept so the original scope can still be referenced. The diagnosis changed during the work — this version reflects what the issue actually was and what shipped.

## Background:

 **Reported issue:** On some product pages (e.g. Colette Knit Shorts), photos in the image gallery are cropped at the top — cutting off the models' heads.

 **Why it happens (plain English):** The gallery forces every photo into the same shape. To decide that shape it was using the *widest* image in the set. So when one image is a different shape than the rest (e.g. a slightly wider photo mixed in with tall ones), it makes the whole gallery short, and the taller photos get their tops and bottoms cut off to fit.

 **What we changed (plain English):** The gallery now shapes itself to the *tallest* image by default, so no photo loses its top or bottom. A new theme setting also lets a merchant choose how the gallery is shaped for a product. The existing video behaviour (keeping shoes/feet visible in vertical videos) is unchanged.

> **On the original diagnosis:** This was first thought to be a small CSS issue — a rule that pushed images to the bottom. That rule only controlled *which edge* got cut, not *whether* cropping happened, so it wasn't the real cause. The real cause and fix are in **Technical Details**.

 

## Necessary Info (Design/Documentation):

-  **Affected surface:** PDP product gallery on the Mosaic / Grid layouts.

-  **No new design needed** — the goal is to stop the unwanted cropping. The vertical-video behaviour from Ticket 38 (Monday doc [18415270754](https://roswellstudios-company.monday.com/docs/18415270754)) must be preserved.

-  **Files touched:** `assets/product.css`, `sections/product.liquid`, `snippets/product.liquid` (and `snippets/media.liquid`, which reads the shared value).

 

## Objective / Acceptance Criteria:

 Scope limited to the default **Preserve full height** (tallest) setting on Mosaic / Grid PDPs — enough to confirm the reported issue is fixed and the previous logic was not reverted. Do not need to exercise the "Match first image" or "Preserve full width" options here.

|  **#** |  **Item** |  **Notes** |  **Dev** |  QA |
| --- | --- | --- | --- | --- |
|  1 |  Grid PDP with mixed-ratio images (one image wider than the rest, e.g. Colette Knit Shorts): uniform portrait photos display full height with no top/bottom cropping; only the wider outlier image trims on the left/right |  Issue fixed. Test desktop and mobile. Example: https://www.elietahari.com/products/knit-short-e4034206-black |   |   |
|  2 |  Static (non-video) images on a grid PDP use the default centered `object-position` — tops are not cut off / not bottom-anchored |  Issue fixed. Test desktop and mobile. Example: https://www.elietahari.com/products/knit-short-e4034206-black |   |   |
|  3 |  Grid PDP containing a vertical video: the video keeps `object-position: bottom center`, and its shape is unaffected by the tallest calculation (videos are excluded from the ratio) |  Prior logic preserved (Ticket 38). Test desktop and mobile. **Note:** confirmed on the preview theme that no live product currently has a video taller than the image box — even the "full-length video" products below have **2:3 (0.67) videos** that match the image box, so they do not crop top/bottom and the bottom-center anchor is not exercised. The tall-video crop could only be verified by hard-coding a test video during dev; it cannot be reproduced on a live PDP today. Use these to confirm a video simply renders correctly in a grid gallery: https://www.elietahari.com/collections/new-arrivals-xx/products/brooke-silk-charmeuse-lace-trim-cami-in-bitter-chocolate · https://www.elietahari.com/collections/new-arrivals-xx/products/brooke-silk-charmeuse-lace-trim-skirt-in-bitter-chocolate |   |   |
|  4 |  Grid PDP where every image already shares one ratio (uniform set): no cropping; renders the same as before the change |  Prior logic preserved (no regression). Test desktop and mobile. Example: https://www.elietahari.com/products/olivia-fluid-crepe-slim-pant-in-lemon-silk |   |   |
|  5 |  Any grid PDP — all grid cells share one uniform height (single `--pdp-media-height-ratio`); no gaps or letterboxing between slides |  Prior logic preserved (731309e intact). Test desktop and mobile. Example: https://www.elietahari.com/products/knit-short-e4034206-black |   |   |

## Technical Details:

*For engineers — the full root cause, the change, and how it was verified. Non-technical readers can stop at the Background above.*

### Root cause

The gallery sizes every slide to **one shared shape** via the `--pdp-media-height-ratio` CSS variable (set in `snippets/product.liquid`, consumed in `snippets/media.liquid`); every image is `object-fit: cover`, so any image whose ratio differs from that shape is cropped to fill. The original logic (commit `731309e`) set the shared shape to the image with the **widest aspect ratio** (largest width ÷ height — not the largest pixel dimensions).

On Colette Knit Shorts, six photos were a uniform 2:3 (0.667) but one asset — `powershort.png`, 1200×1566 (0.766) — had a wider aspect ratio despite being physically smaller in pixels. Having the widest aspect ratio, it produced a short container, so the six 2:3 photos overflowed vertically and cropped **top/bottom**. `object-position: bottom center` (added in `b49239f` for Ticket 38's vertical videos, via a selector that also hit images) only decided the crop landed on the top. A product with all-uniform images (Olivia pant) showed no cropping — confirming the outlier mechanism.

### The change (branch `TAHARI-ISSUE-12397474592-cropped-video`)

1. **`fix` `44e127e` — `assets/product.css`:** scope `object-position: bottom center` to `.product__media video` only (remove the `.product__photo .image-wrapper--cover img` half of the combined selector). Static images fall back to centered. Necessary, but on its own only re-centers the crop — it does not stop it.

2. **`feat` `081e698` — `sections/product.liquid` + `snippets/product.liquid`:** add a **Grid gallery shape** section setting (Mosaic / Grid layouts only) that chooses which image sets the shared shape:
   - **Preserve full height** *(default)* — tallest aspect ratio among the images; nothing crops top/bottom, images with a wider aspect ratio crop on the sides.
   - **Match first image** — the first image's aspect ratio.
   - **Preserve full width** — original behaviour; widest aspect ratio among the images, images with a taller aspect ratio crop top/bottom.

   Non-grid layouts (Stacked, Thumbnails) keep the original widest-image behaviour untouched. Videos are excluded from the ratio calc, so a vertical video still crops top/bottom and keeps its `bottom center` anchor.

### Verification

Confirmed on the dev theme via Chrome that `--pdp-media-height-ratio` dropped from `0.766` (widest) to `0.67` (tallest): the six 2:3 photos render with no top/bottom crop, and only the wider outlier trims on its sides. Also confirmed every live product's videos are 2:3 (0.67) and match the image box — the tall-video crop only reproduced with a hard-coded test video (see AC #3).

 

## Bugs from QA:

 TBD

 

## Clarifying Questions:
