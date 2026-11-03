# TAHARI-ISSUE-12397474592 — PDP Video Crop Fix Affecting All Images

## Background:

A previous ticket ([Ticket 38 / Monday doc 18415270754](https://roswellstudios-company.monday.com/docs/18415270754)) fixed vertical 9×16 video cropping on the PDP by setting `object-position: bottom center` so models' feet/shoes remain visible. That change ([commit `b49239f`](https://github.com/roswell-studios/Elie_Tahari_TAHARI_2026/pull/35/changes/b49239f2107bcebc7a0eb454795fcea0231d0fe5)) was applied using a combined CSS selector that inadvertently targets all product gallery images in addition to videos. As a result, every static product photo on the PDP is now bottom-anchored — cropping the top of horizontal and square images — rather than centering as before.

## Necessary Info (Design/Documentation):

- **Affected surface:** PDP product gallery (main viewer + thumbnails).
- **Root cause:** `assets/product.css` ~line 434 uses a combined selector that groups the product image class and the video element together under the same `object-position` rule. The rule should apply only to video.
- **No new design needed** — restoring the default centered position for static images is the goal. The video-specific `object-position` behaviour from Ticket 38 must be preserved.
- **Reference file:** `assets/product.css`

## Objective / Acceptance Criteria:

| # | Item | Notes | Dev |
|---|---|---|---|
| 1 | On the PDP, static product images (non-video) use the default `object-position` (center) and are not bottom-cropped | | |
| 2 | On the PDP, 9×16 vertical videos retain `object-position: bottom center` — feet and shoes must remain visible; head crop is acceptable | | |
| 3 | Tested on desktop and mobile at the product URL that previously reproduced the issue | | |
| 4 | No regressions in the thumbnail strip | | |

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

> **Do not touch** any other rule in `assets/product.css`.

---

### Files allowed to change:
- `assets/product.css`

### Files that must NOT be changed:
- `assets/theme.css` (Broadcast distribution)
- `assets/theme.js` / `assets/theme.dev.js`
- Any snippet or section

---

### QA test URL:
- RC preview: `https://www.elietahari.com/?preview_theme_id=152782930057`
- Test product: `https://www.elietahari.com/products/aurora-halterneck-maxi-dress-2?preview_theme_id=152782930057`

## Estimation Notes:

**Hours Estimate:** 1–2 hrs | **Confidence:** 🟢 High — single-line CSS selector removal; risk is in verifying no regression

**Subtask Breakdown:**
- Remove overly broad selector from `assets/product.css`: 15 min
- QA static images on PDP (desktop + mobile): 30–45 min
- QA video cropping preserved (desktop + mobile): 30–45 min

**Assumptions / Risks:**
- No other rule in the theme re-applies `object-position` to product images in a way that would mask or conflict with the fix

## Implementation Notes:

TBD

## Bugs from QA:

TBD

## Clarifying Questions:

None — the commit `b49239f` confirms the only change from Ticket 38 was in `assets/product.css`. Scope is limited to reversing the overly broad selector in that file.
