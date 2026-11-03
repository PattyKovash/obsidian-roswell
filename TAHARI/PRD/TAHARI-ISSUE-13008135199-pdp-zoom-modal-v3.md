---
monday_id: 13008135199
project_key: TAHARI
authored: 2026-09-11
---

## Background:

-  Raised by the client: the mobile PDP zoom is hard to use. Controls disappear while zoomed, and swiping inside the zoom navigates away to another product instead of moving within the images.

-  The complaint is against the **published** theme, which still runs the legacy PhotoSwipe zoom. The redesign's replacement component (`<gallery-zoom-modal>`) already addresses part of it on the candidate theme — see Necessary Info.

## Necessary Info (Design/Documentation):

-  Affected surface: PDP gallery zoom only, both breakpoints. One component: `<gallery-zoom-modal>` in `snippets/main-product-gallery.liquid` + `assets/main-product-gallery.{js,css}`.

-  The accidental-product-swipe half of the complaint is **already resolved** on the redesign branch. Mobile zoom was briefly horizontal one-at-a-time (2026-08-28) and was reverted to the vertical stack on 2026-09-08; the horizontal rules are commented out in place in `assets/main-product-gallery.css`. No work required for it here — item 11 in the table is a regression guard, not new build.

-  The zoom modal contains **images only** — `zoom_media = media_list | where: 'media_type', 'image'`. Videos and 3D models are excluded, consistent with the gallery section.

-  The magnifier icon button (`data-gallery-zoom-trigger`) is rendered only under `{%- if zoom_desktop -%}`. It is a desktop affordance; there is no equivalent trigger button on mobile, where the entry point is tapping an image.

-  Current entry behaviour at both breakpoints is two steps: tap/click a gallery image opens the modal showing the unzoomed vertical stack, then tap/click a stack image to magnify. This ticket makes the first tap land directly in the magnified view.

-  No Figma frame exists for the mobile zoom modal — it reuses the desktop frame (node `917:6568`, "D PDP - Zoom") with tightened spacing. The new unmagnify control has no design: its box matches the existing close button and its icon is derived from the existing zoom-in magnifier. Flagged for visual review, not blocking.

-  Constraint background for this component is in the vault: `04-engineering/patterns/pdp-zoom-modal.md`.

## Constraints / Scope:

-  In scope: entry behaviour (direct-to-magnified) and the new unmagnify control, at both breakpoints.

-  Out of scope: the legacy PhotoSwipe zoom and every surface still using it (`snippets/product.liquid`, `snippets/media.liquid`, `sections/section-featured-product.liquid`). `assets/zoom.js` and `assets/photoswipe.js` are not touched.

-  Out of scope: reintroducing horizontal paging on mobile, and a merchant-facing toggle between vertical and horizontal (scoped at 1.5–2.5 hours on 2026-09-08 and not taken).

-  The close (X) control is unchanged. It is already absolutely positioned inside a `position: fixed` parent at a higher `z-index` than the magnified layer, so it does not scroll away or get covered.

-  Assumption: "immediate zoom on first tap" means the magnified view, not a larger stack image. Confirmed with the requester at authoring time.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  On mobile (≤767px), tapping any PDP gallery image opens the zoom modal with that image already magnified — no second tap required. |   |  ✅ |   |
|  2 |  On desktop (≥768px), clicking any PDP gallery image opens the zoom modal with that image already magnified, positioned on the point clicked — clamped at the image edges, and centred on any axis where the magnified image is smaller than the viewport (so wide windows centre rather than follow the click). |   |  ✅ |   |
|  3 |  On desktop, the magnifier icon button opens the zoom modal already magnified on the active slide's image, centred. When the active slide is a video or 3D model (both excluded from the modal), it opens magnified on the first image. |   |  ✅ |   |
|  4 |  While magnified, an unmagnify icon control is visible at both breakpoints; activating it returns to the vertical image stack without closing the modal. |   |  ✅ |   |
|  5 |  The unmagnify control is not visible on the stack layer. |   |  ✅ |   |
|  6 |  From the stack, tapping or clicking an image still magnifies it, and the unmagnify control reappears. |   |  ✅ |   |
|  7 |  The close (X) control closes the modal from either layer and returns focus to the gallery element that opened it. |   |  ✅ |   |
|  8 |  Exiting magnification — by the unmagnify control, by tapping the image, or by Escape — collapses back toward the image actually on screen: the stack image in every case, including when the modal was opened directly into the magnified view. |   |  ✅ |   |
|  9 |  Escape backs out one layer at a time: magnified → stack → closed. |   |  ✅ |   |
|  10 |  The unmagnify control has an accessible name, is reachable by Tab within the modal, and responds to both Enter and Space. |   |  ✅ |   |
|  10b |  While magnified, Tab does not reach the stack images behind the overlay; on exit, focus lands on the stack image that was being viewed. |   |  ✅ |   |
|  11 |  Mobile zoom remains a vertical image stack; scrolling it never navigates to another product. |   |  ✅ |   |

## Dev Notes:

*File paths and line numbers reflect a review at authoring time — confirm before implementing. Full reasoning for every constraint below lives in `04-engineering/patterns/pdp-zoom-modal.md`; this section is orientation only.*

### Direct-to-magnified entry (items 1, 2, 3)

-  All three entry points funnel through `openZoomFor()` (`assets/main-product-gallery.js` ~120) and the trigger handler (~154), both calling `zoomModal.open(index)`. Give `open()` an `opts` argument and have it chain into `openViewer()` when `opts.magnify` is set.

-  Pass the originating event through so desktop keeps its click-point focal. `sizeViewer()` (~954) already centres on mobile, and callers with no pointer (keyboard, trigger button) fall back to centre — nothing extra needed for either.

### Collapse rect — the non-obvious part (item 8)

-  Grow-from and collapse-into are **different rects** on the direct path: it grows from the PDP gallery image that was clicked, but exits to the stack image behind the overlay. `collapsedTransform()` (~882) cached one rect for both. Split it — pass the origin rect for the grow, measure `magnifiedFrom` live for the collapse. Keep `translate3d` and the exact transform function list, or the tween interpolates as matrices.

### Unmagnify control (items 4, 5, 6)

-  New `<button data-gallery-zoom-unmagnify>` in `snippets/main-product-gallery.liquid`, **before** the close button (it sits left of the X; focus order follows visual order). Wire in `connectedCallback` to `closeViewer(true)`. Real `<button>`, so Enter/Space are free.

-  Shown via `display: none` / `flex` off the existing `is-magnified` class. `display`, not `visibility` — it can't be reverted by a descendant.

-  Fade it with `tweenControls()` in JS, not a CSS transition. These controls are siblings of `__viewer`, so the viewer's own opacity tween doesn't carry them; a CSS transition leaves them at full opacity through the whole collapse and fades after, which reads as a late pop.

-  `z-index: 2` to clear the viewer's `1`. Position is merchant-set — see block settings below.

### Keyboard and screen reader (items 10, 10a–10c)

-  **Tab escapes the dialog.** `trapFocus` (`assets/theme.dev.js` ~353) only guards its `first`/`last` snapshot; the viewer is last in the DOM and `tabindex="-1"`, so it is neither, and the snapshot is stale by the time the modal is magnified. Handle Tab in the modal's own keydown instead, cycling viewer → unmagnify → close.

-  Guard the existing Enter/Space handler against button targets, or it swallows the controls' own activation once they're reachable.

-  `body.inert` on the stack while magnified — otherwise Tab and screen readers walk images hidden behind the overlay. Clear it **before** the `focus()` in `closeViewer`'s `finish()`; `focus()` no-ops on an inert node.

-  Focus rings gate on the theme's `body.is-focused`, not `:focus-visible` — focus is restored programmatically on exit, which `:focus-visible` routinely refuses to match.

-  Add `products.product.zoom_out` to **all six** locale files. The other five carry `products.product.zoom`, so an en-only key announces "Translation missing".

-  **Not addressed:** SC 2.5.7 Dragging Movements (AA) on the magnified layer. Pre-existing, needs a product call.

### Icon and cursors

-  No magnifier-with-minus exists. Derive `snippets/icon-zoom-minus.liquid` from `icon-zoom-in.liquid` by dropping the plus's vertical segment (`M7.66078 5.57144V9.75001`). Named `-minus` to stay distinct from `assets/icon-zoom-out.svg`, the plain `−` cursor.

-  Keep it stroked. A solid fill needs `fill` on the `.icon` element, not the path — `theme.css`'s `.icon path { fill: inherit }` beats a path-level attribute and renders it invisible.

-  Stroke width is viewBox- and size-relative: `icon-cancel` is a 24 viewBox at 30px / `0.75`; this is a 17 viewBox at 24px, so `0.67` matches its weight. Recompute if either changes.

-  Cursors become magnifiers via a new `--ICON-ZOOM-MINUS` and the existing `--ICON-ZOOM-IN`, read only in `main-product-gallery.css`. Additive — the legacy PhotoSwipe sections keep `--ICON-ZOOM-OUT`/`--ICON-ZOOM-PLUS`.

### Block settings

-  `zoom_out_icon_top` / `zoom_out_icon_right` on the gallery block (`sections/main-product.liquid`), free text so the merchant supplies the unit. They write `--zoom-unmagnify-top/right` onto the modal; defaults `5px` / `52px` repeat as CSS fallbacks.

### Not affected

-  `assets/theme.js` (Broadcast build) is never edited. The commented horizontal-paging block stays commented (item 11).

## Implementation Notes:

-  **Entry**: `open(index, opts)` chains into `openViewer()` when `opts.magnify` is set. All three entry points pass it. Desktop passes the click event so the focal point is the clicked point; keyboard and the magnifier button pass none and centre.

-  **New files**: `snippets/icon-zoom-minus.liquid` (inline icon, derived from `icon-zoom-in.liquid`), `assets/icon-zoom-minus.svg` (cursor twin).

-  **New block settings** on `gallery` (`sections/main-product.liquid`): `zoom_out_icon_top` / `zoom_out_icon_right`, free text so any CSS length works. Default `52px` / `4px` — stacked below the X. The defaults exist in three places that must stay in agreement: the schema, the Liquid fallback, and the CSS custom-property fallback.

-  **New locale key** `products.product.zoom_out`, added to all six locale files.

-  **Cursors**: new `--ICON-ZOOM-MINUS` on the viewer; stack items repointed to the existing `--ICON-ZOOM-IN`. Both read only in `main-product-gallery.css`. `--ICON-ZOOM-PLUS` and `assets/icon-zoom-plus.svg` now have no consumers — left in place, not deleted.

-  **Keyboard/AT**: Tab handled in the modal's own keydown (the theme's `trapFocus` never fired for the viewer); `body.inert` on the stack while magnified; focus rings gate on `body.is-focused`; every gallery image is a tab stop with Flickity's `aria-hidden` cleared from content slides.

-  **Focus rings are pseudo-elements, not outlines** — an absolutely positioned `<img>` paints over a real outline. This is the single most counter-intuitive thing in the change; see the pattern doc.

-  Commits: `a1c1b2d`, `e6c2f39`, `62c18e9`, `f5d3239`. Full reasoning in `04-engineering/patterns/pdp-zoom-modal.md` and the 2026-09-11 entries in `02-decisions/decisions.md`.

## Testing Notes:

-  Test on the RC/dev theme with `?preview_theme_id=` in the URL — the myshopify domain redirects to the primary domain and drops the parameter.

-  **Dismiss the Consentmo cookie banner first.** It steals the tab order at the gallery and will grab focus mid-test, which invalidates any keyboard result.

-  Keyboard: Tab from the last thumbnail should reach all four gallery images in turn, each announcing "Zoom: … — image N of M", then the magnifier button. Enter on any image opens the modal already zoomed on that image. While zoomed, Tab cycles viewer → zoom out → close and never leaves the dialog. Escape backs out one layer at a time.

-  Focus rings only appear in keyboard mode (`body.is-focused`), so they will not show if you click into the gallery with a mouse first — that is intended.

-  **Not covered by Dev sign-off, needs QA attention:**
   -  Mobile beyond the focus ring — the mobile stage is a separate `<slider-component>`, so desktop passing does not imply mobile passing. Tap-to-zoom, the unmagnify control, and stack scrolling all need a real device.
   -  The collapse animation (item 8): watch that exiting magnification animates back toward the stack image, not off toward nothing.
   -  Item 3's video/3D-model fallback — needs a product with video media; the product used for dev testing has four images and no video.
   -  Wide viewports (≥2000px): desktop magnifies to 1:1 natural size, so past roughly the image's own width it centres rather than filling. Expected, and the pattern doc records that shipping `cover` here was a real bug once.

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  None. Breakpoint scope, unmagnify behaviour and control visibility, tap-to-exit retention, and the icon choice were all confirmed with the requester at authoring time.
