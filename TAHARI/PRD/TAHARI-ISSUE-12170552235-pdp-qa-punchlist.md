# PDP QA Punch List (TAHARI-12170552235)

Running record of bugs/polish items found during live QA of the new PDP (variant
picker, buy box, buy-box drawer, block-settings refactor, sticky bars), across
PRD-03/04/05 and the block-settings ticket. Update status here as items are
picked up and resolved — this is the single source of truth for what's
open/done, not the individual PRD docs.

Legend: ✅ Done · 🟡 Partial / needs a decision · 🔲 Open, not started · ⚠️ Flag for review

---

## Batch 1 — found during live QA of variant picker / buy-box drawer (2026-07-31 – 2026-08-03)

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Mobile color trigger/desktop showed product photo instead of flat swatch | ✅ Done | Fixed as part of the native-option + `available_colors` rebuild |
| 2 | Concern Size might be sibling-scoped data | ✅ Resolved | Investigated, not a bug — `skip_native_color_option` never matched "Size" |
| 3 | Only 1 grey swatch shown on Amina, wrong color source | ✅ Done | Root cause: `theme.sibling_products` metafield chain wasn't the real mechanism; switched to native Color option + `available_colors` |
| 4 | Swatch/link showed "Foam" while standing on Lemon Silk | ✅ Done | Same fix as #3 |
| 5 | Extend the legacy section's color logic to mobile screens | ✅ Done | Mobile trigger (flat chip) + drawer (photo cards) rebuilt on native option + `available_colors` |
| 6 | Color drawer photo cards rendered at different sizes | ✅ Done | Root cause: unreset native `<button>` padding on unselected cards; unified all to `<button>` |
| 7 | Drawer active-state (is-selected) didn't update after a selection | ✅ Done | `updateDrawerSelection()` patches the static `<template>` so reopening reflects the real state |
| 8 | Trigger row updated only after the drawer closed (perceived lag) | ✅ Done | Sync now happens synchronously at click time, not via the async `variantChange` broadcast |
| 9 | Size drawer: min height / 3-per-row boxes / font size vs Figma | ✅ Done | Matches node 1117-15214 |
| 10 | Hide close (X) on mobile Size/Colour panels | ✅ Done | Scoped via `data-buy-box-drawer-panel` attribute |
| 11 | Size chart trigger didn't work on mobile | ✅ Done | Independent `<popup-component>` per viewport; DOM-relocation approach was tried first and broke desktop, corrected |
| 12 | Handle width, border-radius, heading/chart-link font sizes, mobile-first content padding | ✅ Done | `assets/buy-box-drawer.css` |
| 13 | Size chart trigger broke desktop position (regression from fixing #11) | ✅ Done | Fixed via a self-contained duplicate popup-component instead of relocating the desktop one |
| 14 | Not following the `/pdp-verify` loop consistently | ✅ Acknowledged | Process corrected — deploy + live comparison after every fix from this point on |
| 15 | Block-settings: gallery standard settings, block-order fix, 3-way column select, price block | ✅ Done | Implemented on `develop/feature/TAHARI-ISSUE-12551865291-block-settings`, merged into buy-box branch and pdp-combined, deployed |
| 16 | Merge block-settings work back into buy-box branch | ✅ Done | Clean merge, no conflicts |
| 17 | `attachDrawerPanels`/`shopify:section:load` gap | ✅ Done | See Batch 2 item 1 below |
| 18 | `.main-product-variant-picker__color-image` hardcoded aspect ratio gap | ✅ Done | See Batch 2 item 12 below |

---

## Batch 2 — 13-item cleanup pass (2026-08-04), smallest → largest lift

Worked by a subagent on `develop/feature/TAHARI-ISSUE-12551877753-pdp-buy-box-actions`,
merged into `pdp-combined`, deployed to theme `155392376969` after each item.

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Remove uppercase class on Size Chart trigger text | ✅ Done | CSS override scoped to `.main-product-variant-picker`, shared liquid file untouched |
| 2 | Notify Me panel text should be left-aligned (mobile & desktop) | ✅ Not a bug | Already left-aligned on both viewports |
| 3 | Notify Me panel has an X close button (shouldn't) | ✅ Done | Fix was applied unconditionally (both viewports) — **Patty clarified 2026-08-04: desktop's Notify Me panel SHOULD keep the X, only mobile hides it** (unlike Size/Color, which are mobile-only drawers to begin with, Notify Me's panel is shared across both viewports). See new item 21 below |
| 4 | Notify Me input placement (mobile & desktop) — should sit above the button | ✅ Done | Fixed a CSS specificity bug (`.klaviyo-bis.is-open .klaviyo-bis__field` in theme.css was silently winning over our rule) |
| 5 | Notify Me text alignment (mobile & desktop) | ✅ Not a bug | Duplicate of #2 above |
| 6 | Mobile form doesn't match Figma (node 1117-15181) | 🟡 Partial | Sold Out/Notify Me buttons resized to 102×102, right-aligned, matching Figma. **Not done:** merging `variant_picker` + `buy_buttons` into one flex row — architectural change, deferred (see "Open decisions" below) |
| 7 | Desktop product form missing selected color name label | ✅ Done | Restored "Colour : Name" by scoping the value-hide rule to `.radio__legend--size` instead of blanket-hiding |
| 8 | No selected-state underline on color swatch (desktop & mobile) | ✅ Done (corrected twice, 2026-08-04) | **Original "not a bug" call was wrong — Patty caught it.** First fix attempt shrunk the swatch's own color fill (`background-size: 100% calc(100% - 4px)`) to make room for a border-bottom — this broke swatch sizing/parity with the legacy form (a second bug Patty caught immediately). **Correct fix**: theme.css already has a working mechanism for exactly this — `.swatch__button--square ::after` (a class our swatches already carry) renders a 1px line at `bottom: -5px`, entirely below the swatch box, never overlapping its fill. The only actual bug was our own `display: none` on that `::after`, suppressing it outright. Removed that suppression, reverted the swatch fill/border-bottom hack entirely — swatch is now pixel-identical to the legacy form again, underline visible regardless of swatch color (verified on Black specifically) |
| 22 | `.main-product-variant-picker .radio__legend__link` had a redundant `color` override fighting `.text-grey` | ✅ Done | Found alongside #8 above — `.text-grey` (already conditionally applied in the shared `size_chart_content` markup) is the correct Figma grey; our own `color: var(--text-a50, var(--text))` was overriding it unnecessarily. Removed. |
| 9 | Desktop size text size doesn't match Figma | ✅ Done | 16px, hardcoded (this theme's root is 14px, not the usual 16px — no rem token lands exactly on 16px) |
| 10 | Mobile selected size text size doesn't match Figma | ✅ Done | Same fix as #9 |
| 11 | Remove uppercase class on Size Chart trigger text | ✅ Done | Duplicate of Batch 2 #1 |
| 12 | Desktop size chart text size + missing underline | ✅ Done | |
| 13 | Badges block margin/padding settings don't work (wrong element) | ✅ Done | Legacy `block-padding` class was overriding the new standard settings; added a `skip_legacy_padding` param so the two legacy callers (`api-product-upsell.liquid`, `snippets/product.liquid`) are unaffected |

---

## New items found this session, not yet actioned

| # | Item | Status | Notes |
|---|---|---|---|
| 14 | Desktop size chart drawer's X (close button) needs to sit on the right | ✅ Done | `theme.css` moves `.size-guide-drawer .drawer__close` to the left specifically on desktop (`min-width: 750px`) — a base-theme override for the stock size-guide's right-side-panel layout elsewhere on the site. Overrode it back to the right, scoped to `.main-product .size-guide-drawer .drawer__close` so other pages using the same shared class are unaffected. |
| 15 | `product-title.liquid` likely has the same legacy `block-padding` bug as badges did | ✅ Done | Confirmed live by Patty (Brooke skirt, DevTools showing `.block-padding`'s 16px margin-bottom fallback winning over a margin_bottom: 0 setting). Same fix as badges (#13): added `skip_legacy_padding` param to `snippets/product-title.liquid`, new section passes `true`, two legacy callers (`api-product-upsell.liquid`, `product.liquid`) unaffected. Verified live: `margin-bottom` now computes to `0px`. |
| 16 | Mobile form: merge `variant_picker` + `buy_buttons` into one flex row per Figma | ✅ Resolved | Stale — the real architectural question behind Batch 2 #6, resolved 2026-08-04 (see "Open decisions" #2 below): the mobile sticky bar shipped separately, and its always-fixed row fuses `variant_picker` + `buy_buttons` visually per Figma without needing to merge the two in-flow blocks themselves. No separate fix needed. |
| 17 | `.color-image` aspect-ratio fallback untested for products with no native color option | ✅ Verified unreachable with current catalog (2026-08-04) | Sampled 15+ diverse products across the catalog (different naming conventions, collections, price points) - every single one has a native `Color`/`COLOR` option, even single-value ones. `skip_native_color_option` (referenced only in a comment, mentioned as the scenario that would trigger the fallback) has zero actual implementation anywhere in the codebase - it's not a real, wired-up mechanism. The fallback code itself (anchor to `product.featured_media.preview_image` when `native_color_option == nil`) looks correct and defensively reasonable, but can't be verified against real data because no product in the current catalog lacks a native Color option. Re-check if a colorless-option product is ever added to the store. |
| 18 | Sticky bar (mobile): Add to Bag/Buy Now button sizes must match Figma | ✅ Done | Extended the existing `--soldout` 102×102 square treatment in `main-product-buy-buttons.css` to `--available` too, per confirmed Figma node 1117:15108 (`RTEarArQVMHyU8ZuXFWfKr` file). See "Mobile sticky bar" section below for the full correction. |
| 19 | Desktop sticky bar: variant summary text missing a space ("XL,Creme" vs Figma's "XS, Solar Amber") | ✅ Done | Small text-formatting nit, found during live verification, not yet fixed |
| 20 | Selected-state text color for out-of-stock Size options should stay the sold-out color, not turn black | ✅ Done | Fixed by removing `color: var(--text)` from the new section's `input:checked ~ label` rule (`assets/main-product.css`), matching the legacy section's own rule exactly (which only ever sets `border-bottom-color`). Verified live on Judith Blouse's sold-out `Black / XL` variant (`?variant=44405905948809`): selected+sold-out now shows `rgb(131, 107, 85)` (the sold-out color), same as the other unselected sold-out sizes; an available unselected size still shows black. |
| 21 | Notify Me panel's X close button should only be hidden on mobile, not desktop | ✅ Done | Split into two rules in `assets/buy-box-drawer.css`: Size/Colour (mobile-only drawers to begin with) keep the unconditional hide; Notify Me's hide is now wrapped in `@media (max-width: 749px)` only, so desktop keeps its X. |
| 23 | Badges shouldn't be uppercase on the new section | ✅ Done | Added an `uppercase` param to `snippets/product-page-badges.liquid` (defaults `true`); new section passes `uppercase: false`, legacy callers (`api-product-upsell.liquid`, `product.liquid`) pass nothing and keep uppercase. Note: Liquid's `\| default:` can't be used for this — it treats explicit `false` the same as "not passed" — so the param is resolved via an explicit `== false` check instead. |
| 24 | `--FONT-SIZE-BADGE` undefined, badge text had no explicit font-size | ✅ Done | Pre-existing gap, not specific to the new section (`theme.css`'s `.badge-box` reads it, nothing site-wide ever defined it — legacy section's badge still falls back to the unstyled `14px` default). Defined it scoped to `.main-product` only, using `--font-body-small` (0.875rem = 12.25px on this theme's 14px root) as the closest existing token to Figma's 12px. |
| 25 | Price block margin/padding settings didn't work | ✅ Done | Same legacy `block-padding` bug as badges (#13) and title (#15) — `snippets/product-price.liquid` had a hardcoded `block-padding` class overriding the new block-settings margin/padding controls. Added the same `skip_legacy_padding` param, passed `true` only from `sections/main-product.liquid`; the other two legacy callers (`api-product-upsell.liquid`, `product.liquid`) unaffected. Note: the price block's `data-section-id` is `price_FgpAWp` (a generated block id), not the literal `price` type name like the other singleton blocks (variant_picker/buy_buttons/badges/title) — don't assume literal-type-name ids apply uniformly across every block type. Verified live on Judith Blouse: `margin-bottom` computes to `0px`, `block-padding` class no longer present. |

---

## Desktop sticky add-to-cart bar (PRD-05, Monday 12551904249)

Built on `develop/feature/TAHARI-ISSUE-12551904249-pdp-sticky-bar`, merged into
`pdp-combined`, deployed to `155392376969`. Note: the original PRD-05 doc is
**stale** — it scoped desktop out and proposed an `IntersectionObserver`
trigger; actual implementation reuses `cart-bar.js`'s real scroll-math trigger
and is desktop-only per direct request.

- ✅ Bar renders correctly: thumbnail, title, size/colour summary, price, real
  Add to Bag / Buy Now / Sold Out / Notify Me components (no duplicate cart logic)
- ✅ Show/hide trigger verified live via `getBoundingClientRect()` — matches
  `.main-product__form` scrolling out of view
- ✅ Price now shows after a `price` block was added to the live product template
- ✅ Grey top border removed — done directly by Patty 2026-08-04
- ✅ Button text vertical centering — done directly by Patty 2026-08-04
- ✅ Text spacing — done directly by Patty 2026-08-04
- ✅ Add to Bag/Buy Now misalignment (heights, gap, "Buy Now" wrapping) — done
  directly by Patty 2026-08-04
- ⚠️ Add to Bag's loading-spinner treatment on the sticky bar is a simplified
  stand-in, not pixel-identical to the main button's (flagged by the builder,
  not yet revisited)
- ⚠️ Variant-summary gating extended to also check `variant_picker`'s presence
  (reasoned addition beyond the literal brief — confirm this matches intent)
- 🔲 **Open (found 2026-08-04):** the sticky bar's Add to Bag button should
  have the same add-to-cart animation/feedback as the main product form's
  Add to Bag button (currently a simplified stand-in per the loading-spinner
  note above — likely the same underlying fix as that item, needs confirming).

## Mobile sticky bar (built 2026-08-04, CSS-only) — ⚠️ SUPERSEDED, architectural rework under discussion

**Do not treat the CSS-only build below as final — it's under active reconsideration, discussion only so far, nothing built yet.** Patty identified a real robustness gap after the build shipped: the current approach makes the two `.main-product__block-wrapper` rows `position: fixed` unconditionally (always fixed, never scroll-triggered), which only looks right because the Figma mockup happens to be built against one specific viewport height (~805px, independently calculated by Patty) where the gallery + content height exactly fills the screen above the fixed bar. On taller viewports, page content visibly "peeks" above the bar on load; on shorter viewports, the bar can overlap/cover the gallery — confirmed live that the gallery's height is purely `aspect-ratio`-derived (width-based, via `padding-top: calc(1 / var(--aspect-ratio) * 100%)`), completely independent of viewport height, so there's no CSS-only way to guarantee it always lines up.

Two approaches discussed, no decision/build yet:
1. **Toggle-fixed-in-place**: keep the same elements, JS-toggle a class switching between static/fixed on scroll (like the desktop bar's show/hide trigger), with a hardcoded-height placeholder (the sticky treatment is a fixed 102px, not content-variable, so no JS measurement needed) to prevent layout shift when the rows leave flow. ~3–4 hours, but blocked on an unresolved Figma question (what does "in-flow, not-yet-stuck" look like — no such state currently exists in Figma).
2. **Separate dedicated mobile sticky component** (Patty's own proposed alternative, explicitly rejecting the placeholder pattern — "What if we did similar to desktop sticky... just have a separate mobile sticky form and not do a placeholder?"): mirror the already-proven desktop `<main-product-sticky-bar>` pattern exactly — a permanently-fixed separate component that never contributes to document flow (so zero layout-shift risk), pointing at the same shared `product_form_id`/`buy_box_drawer_id` by attribute reference rather than duplicating Liquid logic (same technique the desktop bar already uses for its Buy Buttons half). Robustly handles arbitrary title/price text wrapping with no viewport-height assumptions. One flagged, not-yet-verified detail: whether `main-product-variant-picker.js`'s `updateTriggerDisplay`/`updateDrawerSelection` assume a single trigger instance (`querySelector`) and would need extending to `querySelectorAll` for a second synced trigger. AI-implemented estimate given (not a work order): ~45min–1.5hr for a clean pass, ~2hr worst case given this session's track record of first-pass corrections on similar work.

**Priority update (2026-08-04):** Patty wants the mobile sticky rework done BEFORE the desktop sticky bar's Add to Bag animation parity (#29) — this is the piece she's most concerned about getting right, not desktop.

**Revert-point question, resolved 2026-08-04:** Patty asked whether the current CSS-only always-fixed approach could be kept in place (e.g. as a fallback toggle) alongside whichever new architecture gets built, in case the client wants "always sticky" back later. Recommendation given: don't dual-maintain both live — the new dedicated-component approach and the current always-fixed CSS would physically compete for the same screen space (two things trying to occupy the bottom of the viewport), so keeping both wired up risks them fighting each other, and every future change to "the mobile sticky bar" would need applying twice to stay in sync for a low-probability revert. Instead, tagged the current commit as a clean, easy-to-reach revert/rebuild reference point: **git tag `pdp-mobile-sticky-css-only-2026-08-04`** on commit `2e81620` (local tag only, not pushed) — captures the CSS-only always-fixed implementation exactly as it stands before the rework begins. If the rework needs to be undone or rebuilt from, check out or diff against this tag rather than reconstructing the CSS-only approach from memory.

**Do not start building either rework option without explicit go-ahead** — same "assess, don't execute" posture as items #38/#39 above. The section below documents what's live today (still functioning, just not the final architecture).

Per assessment on 2026-08-04: `variant_picker` and `buy_buttons` currently
render as two independent blocks; the row itself needs to be **always
fixed/out-of-flow** (not scroll-triggered like the desktop bar — confirmed via
Figma prototype screenshots showing the row still pinned after scrolling deep
into cross-sell content).

**Revised approach (course-corrected from the original "build a new
component" plan, approved by Patty — "give that a try first"):** rather than
duplicating a new mobile-only component (as the desktop sticky bar needed),
`position: fixed` was applied directly to the two EXISTING sibling
`.main-product__block-wrapper` divs (`[data-section-id="variant_picker"]` and
`[data-section-id="buy_buttons"]`) in `assets/main-product.css`. No new
markup or JS — `main-product-buy-buttons.liquid` already has a single
mobile/desktop-shared markup, so this was a pure CSS repositioning.

- ✅ Both rows pinned to the bottom of the viewport on load, stay pinned
  through scroll (verified live at 390×844 on Judith Blouse, scrolled into
  "You may also like")
- ✅ Rows stack correctly with no gap/overlap (Size/Colour trigger row above,
  Add to Bag/Buy Now below) — flush at the measured boundary
- ✅ **Found + fixed a real conflict:** the theme's own fixed mobile icon nav
  (`header-dropdown.css` `.mobile__bar`, z-index 2300, live on every mobile
  page) was painting on top of the new bar since both were pinned to
  `bottom: 0`. Fixed by offsetting both rows with `var(--mobile-bar-height)`
  — the same CSS var `cart-bar.css` already uses for this exact purpose on
  the legacy PDP, set globally by core theme JS (`theme.dev.js`). Not
  specific to this feature — any new fixed-bottom mobile element on this
  theme needs to account for `--mobile-bar-height`.
- ✅ `--mobile-sticky-bar-height` (own var, 134px, measured live) reserved via
  `body.template-product`'s own `padding-bottom` (summed with the existing
  `--mobile-bar-height`) — moved here from an earlier footer.css-only pass,
  which only protected the footer and left "You may also like"
  recommendations between main-product and the footer exposed to overlap
- ✅ Size drawer still opens/functions correctly from the fixed trigger (no
  regression to the `<buy-box-drawer>` clone-per-open mechanism, since only
  positioning CSS changed, not DOM/JS wiring)
- ⚠️ **Found + fixed a serious, session-wide regression (2026-08-04, caught
  live by Patty via screenshot):** `assets/main-product.css` silently crossed
  Shopify's 15,360-byte inline-asset limit (`render 'stylesheet'` inlines via
  `inline_asset_content` for early-index sections). Past the limit, Shopify
  replaces the inline `<style>` with an HTML comment error and renders NONE
  of the file's CSS — not just the new sticky-bar rules, but every fix made
  to this file all session (swatch underline, OOS color, badge font-size,
  etc.). Fixed by trimming a verbose comment block; file is back under the
  limit with a ~700-byte buffer. This is a recurring risk for this specific
  file going forward — watch its byte size (`wc -c assets/main-product.css`)
  after any addition, since it fails **silently** (no console error, no
  build failure) rather than loudly.
- ⚠️ **Corrected (2026-08-04, Patty caught it live): first pass didn't match
  Figma at all.** The first CSS-only build stacked the trigger row and the
  Add to Bag/Buy Now row vertically (two independent fixed rows, ~84px +
  ~48px), with Add to Bag/Buy Now stretched full-width per the buy-box's
  default mobile shape. Never actually pulled the real Figma node before
  building it — just assumed reusing the in-flow rows as-is would work once
  pinned. Patty pushed back: *"I don't understand how you think you can
  group and styling to match the figma with how the components are
  structured."* Pulled the real node (1117:15108/1117:15182,
  `RTEarArQVMHyU8ZuXFWfKr` file — a **different Figma file key** than the
  one in CLAUDE.md's canonical link, confirmed by Patty): it's **ONE fused
  102px-tall row**, not two stacked rows — Size/Colour triggers fill the
  remaining left width, Add to Bag/Buy Now (or Sold Out/Notify me) are two
  flush **102×102 fixed squares** on the right (same treatment
  `buy-box-actions--soldout` already had — a prior comment explicitly said
  "don't widen this to --available without a confirmed node"; this is that
  confirmation). Re-verified live against the corrected CSS: value.
- ✅ Re-implemented to match: both `.main-product__block-wrapper` fixed rows
  now share the same `bottom` offset (not stacked) and are width-split
  `calc(100% - 204px)` / `204px` so two independently-fixed sibling divs
  read as one fused row with no DOM changes. Extended the 102×102 square
  treatment in `main-product-buy-buttons.css` from `--soldout` to also
  cover `--available`. Fixed a height-percentage chain break (`.main-product-variant-picker`,
  the direct parent of the trigger row, had no explicit height, so
  `height: 100%` on the trigger row resolved to `auto` instead of the
  intended 78px) so Size/Colour labels pin to the top and values pin to the
  bottom of the row, matching Figma's `justify-between` exactly. Verified
  live at 390×844 on Judith Blouse: row height 102px, both squares 102×102,
  trigger label at y=684 (12px from row top), trigger value bottom at
  y=762 (12px from row bottom).
- 🔲 Still not fully pixel-verified (border/background details, any
  hover/active states) — this pass fixed the structural mismatch; a finer
  Figma-comparison pass may still surface small nits.

---

## New items found 2026-08-04 (sticky bar polish), not yet actioned

| # | Item | Status | Notes |
|---|---|---|---|
| 26 | Sold Out text color | ✅ Done (three-part correction, 2026-08-04) | Started as one item, turned out to be **three separate elements** with the same wrong-token mistake, caught progressively by Patty live: (1) the Size option labels' disabled/sold-out color (`main-product.css`, `.radio__button input.sold-out + label` etc.) and (2) the mobile Size drawer's boxed sold-out items (`.main-product-variant-picker__drawer-size-item.is-sold-out`) both needed `var(--text-a35)` (35%-alpha black, confirmed via DevTools against `theme.css:10477`'s real disabled-radio-label color, a real pre-existing var from `snippets/head.liquid:352`) instead of `var(--COLOR-SOLD-TEXT)` (`#836b55`, wrong token) — these two are fixed and correct. (3) The "Sold Out" **indicator button** (`.buy-box-actions--soldout .btn--outline`, in the main buy box + sticky bar) is a *different* Figma node (1117:15182) that specs plain black text — my first pass incorrectly applied the same `--text-a35` fix there too; **reverted back to black** (simply removed the override, since the shared `.btn--outline` base rule already sets `color: #000`). Also found + fixed a regression from the `--text-a35` change: a size that's both `.is-selected` AND `.is-sold-out` (shopper picked it before it sold out) had unreadable dark-grey-on-solid-black text — added `.is-selected.is-sold-out { color: var(--bg); }` so selected always wins. **Fourth catch (still 2026-08-04):** even after reverting to black, the Sold Out button still visually looked grey — root cause was `theme.css:5206`'s theme-wide `.btn[disabled] { opacity: 0.5; }` fading the real `<button disabled data-soldout-indicator>`, unrelated to color at all. Figma's node specs fully-opaque text, so added `opacity: 1` scoped to `.buy-box-actions--soldout .btn--outline` / `.main-product-sticky-bar__actions-soldout .btn--outline` (both places), leaving the theme-wide disabled-dimming behavior untouched everywhere else. Verified live: Sold Out button `color: rgb(0,0,0)`, `opacity: 1`; Size labels/drawer items `rgba(0,0,0,0.35)`; selected+sold-out drawer item `rgb(253,250,249)` on black. |
| 27 | Small gap between mobile sticky form and the mobile menu/icon bar | ✅ Done | Root cause confirmed via `getBoundingClientRect()`: `.mobile__bar`'s real rendered height is fractional (69.5px), but `--mobile-bar-height` (set by core theme JS) rounds to a whole px (70px) — the 0.5px mismatch left page content peeking through. Fixed by overlapping 1px (`bottom: calc(var(--mobile-bar-height, 0px) - 1px)` in `assets/main-product.css`), imperceptible visually. Verified live: sticky bar bottom (775) now past `.mobile__bar` top (774.5), no gap. |
| 28 | Add/remove a class on `<html>` when the product form is sticky (mobile + desktop) | ✅ Done | Added a self-contained IIFE to `assets/theme.dev.js` toggling `has-sticky-product-form` on `<html>`. Mobile: unconditional whenever `.main-product__block-wrapper[data-section-id="buy_buttons"]` exists below 767.98px (mobile sticky bar isn't gated by `enable_sticky_bar`, unlike the desktop bar, so couldn't just read that component's own state for both cases). Desktop: tracks `<main-product-sticky-bar>`'s own `.is-visible` class via a `document.body`-level `MutationObserver` (not a reference to the specific element) so it keeps working after `product-info.js`'s view-transition DOM swap on a product-color change, rather than ending up watching a detached node. Verified live: `true` on mobile load, `false` on desktop before scroll, `true` after scrolling past the form, `false` again scrolling back up. |
| 29 | Add to Bag animation parity | Desktop 🔲 Open, Mobile ✅ Already satisfied (verified 2026-08-05) | Originally one item covering both sticky bars — split per Patty's decision: **Desktop — holding off for now**, deprioritized behind the mobile sticky bar rework; desktop's animation work can follow once #38's attribute-flag approach is actually built. **Mobile — checked live, no gap exists.** Mobile's Add to Bag/Buy Now renders from the exact same shared markup as the main form's button (`snippets/main-product-buy-buttons.liquid` - one block for both viewports), driven by the same viewport-agnostic `theme.dev.js` add-to-cart pipeline (`ProductForm.onSubmitHandler` -> `cartAddEvent`/`addToCart` -> `.is-loading`/`.is-added` toggles), with the spinner/success classes centered via a size-agnostic `theme.css` rule that needs no per-breakpoint override. Verified live at 390x844 with an artificially delayed `/cart/add` fetch: spinner renders correctly centered in the mobile 102x102 square, not cut off or mispositioned. The "simplified stand-in" note predates this shared-markup build (PRD-04, buy-box-actions) - no code change needed. |
| 30 | Available ⇄ Sold Out transition flash | 🔲 Open | Switching sold-out → available is smooth, but available → sold-out has a noticeable flash as the buttons swap. Needs investigation into whatever's asymmetric between the two directions (likely a missing transition/fade on one of the two `display` toggles in `main-product-buy-buttons.css` / `main-product-sticky-bar.css`'s `.variant--soldout` / `.is-soldout` swap). |
| 31 | Mobile sticky bar's Size/Colour arrow icon (`icon-variant-picker-arrow.liquid`) still looks fuzzy at 10px | ✅ Done | Original hypothesis (fractional x-position from variable-width label text) turned out not to be the real cause — the icon has no vertical strokes, so x-position had negligible visual impact; confirmed via a reverted JS pixel-snapping experiment that changed the x-position but left the blur unchanged. Actual root cause: the SVG's horizontal shaft sits exactly on a pixel boundary (`y=5` in a `viewBox="0 0 10 10"`) with a 1px stroke centered on it, straddling two pixel rows at 50% coverage each, rendering as flat gray instead of solid black — regardless of x-position. `shape-rendering="crispEdges"` was tested live (pixel-diffed against baseline) and made zero difference for this stroke type — ruled out. Fixed by shifting the path's y-coordinates by `+0.5` in `snippets/icon-variant-picker-arrow.liquid` to center the shaft on a whole pixel row. Verified live: shaft renders solid black `(0,0,0)` on both Size and Colour triggers (different label widths, same fix). No CSS touched. |
| 32 | `snippets/icon-variant-picker-arrow.liquid` doesn't follow the theme's icon prop convention | ✅ Done | Matched `icon-zoom-in.liquid`'s pattern: `prop_width`/`prop_height` (default `10`, this icon's native size), `prop_color` (default `'currentColor'`), `prop_class`, `prop_attrs`. No caller currently passes any of these, so output is byte-identical to before — verified live. |
| 33 | `product__title` had extra inherited spacing on top of its own block margin setting | ✅ Done | `theme.css`'s shared `h1`-`h6` rule hardcodes `margin: 0.5em 0`, stacking on top of the new section's own `margin_top`/`margin_bottom` block settings — no setting value could ever fully zero out the title's spacing. Added `.main-product .product__title { margin: 0; }` to `assets/main-product.css`, scoped to the new section only; legacy callers (`product.liquid`, `api-product-upsell.liquid`) keep the theme default. |
| 34 | PushOwl's `.pushowl-simple-toast` widget overlapped the PDP sticky bars | ✅ Done | Added an override to `assets/theme.css` (confirmed NOT a build artifact — no SCSS/build tooling in this repo, file isn't minified, safe to hand-edit; see CLAUDE.md Gotcha 10). Site-wide floor: `bottom` never lower than the mobile sticky bar's own height + 8px gap. On product pages specifically (via the new `html.has-sticky-product-form` class, item 28): sits above the mobile icon nav height + PDP sticky bar height + 8px gap. Needed `!important` — PushOwl injects its own `<style>` at runtime, after `theme.css`, so equal specificity alone loses on source order. Verified live: `110px` on homepage, `180px` on PDP mobile (70 + 102 + 8). |
| 35 | Colour drawer heading (16px) didn't match Size drawer heading (used to be a different, smaller token) | ✅ Done | Both are Figma nodes 1117-15203/1117-15214, confirmed identical spec: 16px, 0.16px tracking. Added a shared `.main-product-variant-picker__drawer-heading` typography class in `assets/main-product.css`, applied to both headings in `snippets/main-product-variant-picker.liquid` (each panel keeps its own wrapper class for layout/margin - Size's wrapper still handles the flex row with the Size Chart link). Verified live: both compute to `16px` / `0.16px` letter-spacing. |
| 36 | Colour drawer's `min-height` didn't match Size drawer's (440px) | ✅ Done | Both Figma nodes (1117-15203/1117-15214) are fixed 375×440 frames, but only Size's `.buy-box-drawer__content` had a `min-height: 440px` rule — Colour had none, so it only ever reached whatever height its (usually shorter) content produced. Extended the same selector in `assets/buy-box-drawer.css` to cover both panels. Notify Me (1117-15227, also 375×440) already reaches the same total through its own panel-level `min-height` (`.klaviyo-bis--panel`, 376px) — already correct, untouched. Verified live: both Size and Colour drawer content now measure exactly `440px`. |
| 37 | Mobile trigger's Colour swatch (`.main-product-variant-picker__trigger-value--swatch`) is being cut off, no visible underline | ✅ Done (2026-08-04, second pass) | First pass (aspect-ratio 45/21 → 45/27 in commit `0f6a20d`) fixed the crop but not the actual bug — Patty caught it live: after aligning the sizing, the underline disappeared entirely and the top of the "XS" size value and the top of the swatch no longer lined up, unlike Figma. Root cause found by pulling the real Figma structure (nodes 1117:15108/1117:15182, file `RTEarArQVMHyU8ZuXFWfKr`): Figma doesn't draw the underline flush against the swatch's bottom edge — it's a *separate* 1px line, 4px below a 27px-tall swatch, inside a fixed 32px-tall box (27 + 4 + 1 = 32). The old CSS baked a `border-bottom` directly onto the swatch element with no gap, which put the swatch's own top at the wrong height relative to the Size trigger's text-centered value box and left no room for a visible separate underline. Rebuilt `.main-product-variant-picker__trigger-value--swatch` in `assets/main-product.css` to match Figma's actual box model: explicit `height: 32px`, `flex-direction: column`, `gap: 4px`, swatch child fixed at `45×27`, underline drawn as a separate `::after` (`45×1px`, `background: var(--text)`) instead of a border. `main-product.css` now 12,649 bytes, still comfortably under the 15,360-byte limit. |

---

## ⚠️ DO NOT INDEPENDENTLY EXECUTE — estimate/discussion only (2026-08-04)

Both items below are **level-of-effort questions, not work orders.** Patty wants an estimate/discussion before either is built. Do not start implementation on either without that discussion happening first.

| # | Item | Notes |
|---|---|---|
| 38 | LOE: desktop sticky bar's Add to Bag/Buy Now scroll-up-to-form instead of adding directly | Should match the legacy PDP section's own sticky bar behavior exactly (`assets/cart-bar.js`'s `data-cart-bar-scroll` handler calls `scrollToTop()`, which scrolls to `variant-selects`/the form rather than submitting in place) — the new PDP's `main-product-sticky-bar.js` currently submits directly via the real `.main-product__form`/`buy-now-button`, no scroll-to-form behavior at all. Ask specifically: what's the LOE to add a **setting** toggling between "add directly" (current behavior) vs. "scroll up to form" (legacy behavior) on desktop, given the real add/buy-now wiring already works like the main form. **Blocks item #29 (Add to Bag animation parity)** — hold that off too until this is decided, since which behavior ships changes what "the same animation" even means for the sticky bar's Add to Bag button. **Assessment given 2026-08-04 (discussion only, not built):** the legacy `cart-bar.js` scroll-to-form behavior is NOT a merchant toggle — it's an automatic per-product decision keyed off `product.has_only_default_variant` (single-variant products submit directly; multi-variant products scroll to the form instead, presumably because the sticky bar has no room to show variant selectors itself). The new sticky bar's architecture may not even have the problem this solves, since it already shares the real form/variant-picker wiring rather than being a size-constrained standalone bar — worth confirming that premise still holds before building anything. **Decision made 2026-08-04 (revised from "build a merchant setting" — ready to action later, still not yet built):** Patty's reasoning — the desktop sticky bar's "add directly" functionality is ~95% already built; if the client later wants scroll-to-form instead, rebuilding it from scratch would be wasted work. Rather than a full `settings_schema.json` toggle (theme-editor UI, more surface area), keep the existing "add directly" code path fully intact and gate it behind a single hardcoded Liquid attribute (e.g. `data-cta-behavior="direct"` on the sticky bar's root markup in `sections/main-product-sticky-bar.liquid`), with `main-product-sticky-bar.js`'s click handler branching on that attribute — `"direct"` does what it does today, anything else calls a `scrollToTop()`-style function mirroring `cart-bar.js`'s existing pattern. Flipping behavior later is a one-line attribute-value change + redeploy, no settings UI, no re-implementation. AI-implemented estimate: ~20–30min clean pass, ~45min worst case. **Built and verified 2026-08-05:** added `data-cta-behavior` (`"direct"`/`"scroll"`) to `<main-product-sticky-bar>`'s root markup in `snippets/main-product-sticky-bar.liquid`, defaulting to `"direct"` — regression-checked live that the default is byte-for-byte unchanged from before (Add to Bag still adds to cart normally). Also added a click listener to the sticky bar's Buy Now button, which previously had none (only a form `submit` listener via `buy-now-button.js`), so the branch has something to hook into. One refinement beyond the original plan: rather than mirroring `cart-bar.js`'s (misleadingly-named) `scrollToTop()` — which actually scrolls to the form/variant-selects position, not the literal page top — Patty asked for the real page top instead, so `scrollToForm()` now just calls `window.scrollTo({ top: 0, behavior: 'smooth' })`. Verified live with the attribute flipped to `"scroll"`: Add to Bag/Buy Now no longer add to cart or submit, and scroll to the literal top of the page. **Patty decided to ship with `"scroll" as the actual default`, not `"direct"`** — `data-cta-behavior="scroll"` is the live shipped value; `"direct"` (submit in place) remains available as the fallback/alternate value for a future flip. ✅ Done. |
| 39 | LOE: Notify Me drawer slides in from the bottom of the product form on desktop (not the current right-panel style) | Would not match mobile's exact min-height (440px, items #35/#36) since the desktop form panel is a different size/shape than a mobile bottom sheet — but everything else (layout, heading, input placement, styling) would stay the same as the mobile Notify Me drawer. Currently desktop's `<buy-box-drawer>` Notify Me panel uses the shared `.product-modal`/`.drawer__inner` right-panel treatment (see `assets/buy-box-drawer.css`'s `@media (min-width: 750px)` handle-hiding rule) — this would need its own desktop-specific slide-from-bottom-of-form positioning instead. |

---

## New items found 2026-08-04 (evening pass), fixed same session

| # | Item | Status | Notes |
|---|---|---|---|
| 40 | Price block's `margin_top`/`margin_top_mobile` setting was completely inert | ✅ Done (corrected twice) | Root cause: `.main-product__form .main-product__block-wrapper` (a reset added in commit `93fd3954`, intentionally zeroing the generic 24px block-gap default for badges/title/variant_picker/buy_buttons/price, plus a `.main-product__media` counterpart for gallery in `e6c0237c`) has specificity 0-2-0, while the per-block `[data-section-id]` override `rs-section-settings` emits has only 0-1-0 — the reset always won regardless of what the merchant set, for **every block in the form/media bucket**, not just price. First fix attempt bumped the per-block selector to `.main-product__block-wrapper[data-section-id]` (0-2-0) to tie and win on source order — worked, but then tried an even more "robust" `:where()`-zeroed version of the reset that over-corrected: it made the reset lose to the *base* `.main-product__block-wrapper` class default too, breaking the 24px-removal for every block with no explicit setting (blank badges/title/variant_picker/buy_buttons/gallery all jumped to 24px margin-top - caught live by Patty via screenshot). **Correct fix, matching an already-existing precedent** (`.main-product__block-wrapper--accordion`, commit `e64c4da`, which solves the identical problem for accordion rows without any of these issues): replaced the two-class descendant reset with single-class modifier selectors (`.main-product__block-wrapper--form`, `--media`) at the same 0-1-0 tier as the per-block override, emitted from `sections/main-product.liquid`'s existing `wrapper_class` logic. Reverted the per-block selector back to its original bare form. Verified live: badges/title/variant_picker/buy_buttons/gallery all `0px` (default), price `-2px` (explicit setting wins), accordion `16px` (unaffected, already worked). |
| 41 | Color swatch row (e.g. "Creme") sat 1px outside its container on the left | ✅ Done (later simplified) | `.main-product-variant-picker .radio__buttons`'s `margin: 3px 0 0 -1px` exists to collapse adjacent 1px borders between the **Size grid's** bordered boxes (paired with each `.radio__button`'s own `-1px -1px` margin, from the original commit `559cfcf`) — but `.radio__buttons` is a shared container class with the borderless Color swatches row too, which inherited the same unwanted 1px leftward shift with no compensating benefit. First fix: a more-specific override scoping the swatches row's margin back to 0. **Patty then asked directly why the -1px existed at all** — live test confirmed the Size grid no longer has any left/right/top borders (Batch 2's underline-only correction removed them), only a conditional `border-bottom`, so the -1px border-collapse trick has nothing left to collapse — it was actively causing the identical 1px overlap on the Size grid too, just invisible with no border to reveal it (confirmed live: removing it made every button flush edge-to-edge, zero overlap/gap, vs. a 1px overlap with it in place). Patty removed both the container (`.radio__buttons`) and per-item (`.radio__button`) `-1px` margins entirely rather than keep the narrower per-swatches override — simpler and correct, since nothing needs it anymore. |
| 42 | Notify Me styling (`justify-content: flex-start`, `--btn-left`/`--btn-top`/`--BTN-FONT-WEIGHT`) was applied to the wrong element | ✅ Done | Was applied to `[data-buy-box-drawer-open='notify']` — the **outer trigger square** (88×88/102×102) that opens the drawer — when Patty wanted it on the **drawer content's real button**, `[data-klaviyo-bis-btn]` inside `<klaviyo-bis-form>`. Removed the override from both outer-trigger copies (main buy box + sticky bar — the outer square already looked correct without it, governed by the shared square-button rules), added it once to `.klaviyo-bis--panel [data-klaviyo-bis-btn]` in `main-product-buy-buttons.css` (single shared drawer instance, no sticky-bar duplicate needed). Verified live: drawer content button now `justify-content: flex-start`, `padding: 15px 16px`, `font-weight: 500`; outer trigger square unaffected. |
| 43 | Color/Size selector spacing (`.selector-wrapper + .selector-wrapper`) needed to match Figma | ✅ Done | `--form-margin` (global 24px, `theme.css:11983`) drives `.radio__fieldset`/`.select__fieldset`'s own 12px top+bottom padding — stacking two adjacent fieldsets (Color, Size) gave 24px, more than Figma's 12px. Zeroed the fieldset padding and replaced it with a single `.main-product-variant-picker .selector-wrapper + .selector-wrapper { padding-top: 12px; }`, scoped to the new PDP only — `.selector-wrapper`/`.radio__fieldset` are otherwise unscoped in `theme.css` and shared with the legacy PDP (`product.liquid`) and PLP quickview modal (`api-product-upsell.liquid`) via the same `product-variant-picker.liquid` snippet, so an unscoped rule would have leaked into both. Verified live: exactly `12px` gap between the swatch row and the "Size" label; legacy/quickview unaffected (guaranteed by the ancestor-class scoping, not just tested). |

---

## New items found 2026-08-04 (late evening pass), not yet actioned

| # | Item | Status | Notes |
|---|---|---|---|
| 44 | `.product__price--sale` takes up more vertical space than plain `.product__price` — the gap between price and title is only correct for one of the two states | ✅ Done (two-part fix) | Root cause: `theme.css`'s `.product__final-sale-wrap` hardcodes `min-height: 30px` so the row still reserves space for a "Final sale" tooltip even before/without one - this inflated the sale-price row taller than the plain-price row, and its own `align-items: center` then pushed the shorter price text down inside that inflated box (throwing off the title gap). First pass (`align-items: flex-start` on `.product__price`) fixed the title gap but broke price↔"FINAL SALE" alignment with each other - caught live via screenshot. Real issue: price text (font-body-medium, 14px) and "FINAL SALE" (font-body-small, 12.25px) are different font sizes sharing the row; box-top or box-center alignment doesn't line up their actual text since the two fonts don't share the same line-height-to-cap-height ratio. Fixed with `align-items: baseline` on `.main-product .product__price` (plus overriding `.product__sale`'s hardcoded `align-self: flex-start` from `theme.css` to `baseline` so it doesn't fight the parent), and kept `.main-product .product__final-sale-wrap { min-height: 0; }` to fix the row-height/title-gap part. Verified live: title-to-price gap now `-1px` on both the sale product (Judith Blouse) and no-sale product (Amina), and "FINAL SALE" sits on the price line in a screenshot comparison. |

---

## Open decisions needed from Patty

1. ~~**Item 3 (Batch 2):** confirm the Notify Me X-button removal was actually
   correct~~ — Resolved: desktop keeps the X, only mobile hides it (see item 21).
2. ~~**Item 16:** how to handle `variant_picker` + `buy_buttons` sharing one row
   on mobile~~ — Resolved 2026-08-04: mobile sticky bar is confirmed not being
   dropped, so the in-flow mismatch will be hidden on mobile once it ships.
   No separate fix needed.
3. ~~**Legacy `main` section:** disabled/enabled~~ — back to enabled on
   `pdp-combined` as of 2026-08-04 (not something done in this session's git
   history — noticed re-enabled live, presumably via the theme editor).
4. 🔲 **main-product.css auto-inline-by-section-index:** `snippets/stylesheet.liquid`
   (pre-existing Broadcast base theme logic, not written for this project)
   auto-inlines any stylesheet rendered from a template's first two sections
   (`section.location == 'template' and section.index <= 2`) to avoid a
   render-blocking request for above-the-fold content. `main-product` is
   section index 1 on the product template, so `main-product.css` always
   gets inlined via `inline_asset_content` — which Shopify caps at 15,360
   bytes. The file crossed that limit this session (see the "Mobile sticky
   bar" section above) and silently stopped applying entirely, with no
   error. Needs a decision: force it external (`async: true`) to remove the
   ceiling, split it into a core file (inlined) + a secondary file (async)
   for lower-priority additions, or keep it inlined and just monitor byte
   size (`wc -c assets/main-product.css`) after every edit going forward.
