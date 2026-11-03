
## Background:

- Matt built a custom "How to Measure" sizing widget (torso graphic, simplified steps, video link, interactive torso-length calculator) on the Junction PDP by hand-pasting HTML/CSS/JS directly into the `accentuate.content` metafield via Matrixify. He shared it and asked: "there's quite a bit of code that I had to dump into that metafield to make this work. Maybe you can suggest a more optimal way of executing this across all our packs? I'll also have a unique version of this to place on the Aero and Pemi PDPs."

- The original leading option — content authored once on a page, rendered as a side drawer, fetched dynamically per PDP — was presented to the client. After discussion, the client felt the dev cost/setup wasn't justified given how they intend to use it and how many products it'll touch. **Decision: continue authoring per-product content via Matrixify into the `accentuate.content` metafield, same as today.** Roswell will instead assess and optimize the existing markup/render path.

- This ticket covers that optimization: defer the metafield content's CSS/JS so it only loads when a shopper actually opens the drawer (not on every PDP load), and give Matt/ops a lighter-weight, reusable way to author size-guide content going forward — without losing the ability to drop in fully custom markup when a product genuinely needs it.

## Necessary Info (Design/Documentation):

- **Affected surfaces:** PDP "How to Measure" / size chart drawer (desktop) and popover (mobile), driven by `product.metafields.accentuate.content` (namespace `accentuate`, keys `popup_image`/`popup_title`/`content` — confirmed identical across all 15 product templates in the repo).
- **Scale:** 166 products have `accentuate.content` populated (44 Active, 68 Archived, 53 Draft, 1 Unlisted). Of the 44 active: 36 (82%) are plain RTE text (no CSS/JS at all — already "clean"), 7 ship a static `<style>` block with heavy `!important` use, and 1 (Junction) ships a full interactive JS calculator.
- **Current-state performance issue:** the metafield content — CSS, JS, and all — currently renders inline into every PDP's initial page HTML unconditionally, regardless of whether the shopper ever opens the drawer. The theme's own `<drawer-content>`/`<popover-content>` custom elements already support lazy content-fetch via an `href` attribute (`OpenableElement._load()` in `assets/theme.js`) — proven working precedent already in this theme via Quick Buy (`snippets/product-item.liquid`, `QuickBuyDrawer extends DrawerContent`). The size-chart-metafield drawer simply wasn't using that existing mechanism.
- **Two unrelated size-calculator code paths were found during this work, not to be confused:**
  1. The metafield-driven one this ticket optimizes (Junction today; Pemi/Aero to follow per Matt's ask).
  2. A separate, hardcoded, dead-triggered calculator for the `aero-28` product specifically, living directly in `sections/main-product.liquid` (~L283-414), with its own different chest+torso 2D lookup (S/M/L only) and no visible trigger button in the current code (`document.getElementById('openSizeModal')` has no matching element). Out of scope for this ticket; flagged for awareness.
- **No new design required** — this is a rendering/architecture change, not a visual one. Existing drawer/popover styling is unchanged.
- Full technical write-up and content audit: vault `03-pm/issues/ISSUE-024.md` and `02-decisions/decisions.md` (2026-08-06 entry).

## Constraints / Scope:

- **In scope:** deferred loading of the metafield drawer/popover content; a shared, reusable content-authoring system (default skeleton + data attributes + optional custom `<template>` + full custom-markup escape hatch) so Matt/ops don't need to hand-author full HTML/CSS/JS per product going forward.
- **Out of scope:** building a dynamic-fetch/page-as-drawer content system (explicitly declined by client, see Background). Rewriting the separate page-based `size_chart_page` mechanism (lower-risk, unaffected by this work). The `aero-28` legacy hardcoded calculator (flagged, not touched).
- **Content-side migration** (re-authoring the 8 non-RTE products' Matrixify content onto the new shared system) is a content-ops task for Matt/ops, not a code change, and can happen incrementally after this ships — the 36 plain-RTE products need no content changes at all.
- **Assumption:** products using the interactive calculator variant share the same general torso-measurement UX (single input, unit toggle, tiered result) — a product needing a fundamentally different measurement input (e.g. Aero's legacy calculator's chest+torso combo) would need the custom-`<template>` escape hatch, not the default skeleton, to represent that.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
|---|---|---|---|---|
| 1 | The default size widget (just a plain `<hmg-size-widget class="hmg-sizer-std"></hmg-size-widget>`, no custom content) looks and works the same as Junction's live "How to Measure" drawer. | https://hyperlitemountaingear.com/products/rs-test | ✅ |  |
| 2 | A custom widget layout (a `<template>` inside `<hmg-size-widget>`) still calculates sizes correctly. | https://hyperlitemountaingear.com/products/rs-test-1 | ✅ |  |
| 3 | Existing drawer content (not yet updated to the new widget) renders the same as it does on the live site today. | Spot-checked: `aero-28`, `junction`, `pemi-15`, `topo-logo-hoodie` | ✅ |  |
| 4 | "How to Measure" inside Quick Buy (product grid, and cart "You may also like") opens and works correctly. | https://hyperlitemountaingear.com/collections/rs-test | ✅ |  |
| 5 | The size guide's images/styles/scripts only load once "How to Measure" is clicked, not on page load. | https://hyperlitemountaingear.com/products/rs-test | ✅ |  |
| 6 | If content fails to load, the shopper sees a "Try Again" message instead of a blank or broken drawer. | https://hyperlitemountaingear.com/products/rs-test | ✅ |  |

### Out of Scope

- Dynamic-fetch/page-rendered-as-drawer content system (declined by client on cost grounds).
- Rewriting the page-based `size_chart_page` mechanism.
- The `aero-28` legacy hardcoded chest+torso calculator in `sections/main-product.liquid`.
- ~~Quick Buy~~ — **now in scope, see AC #20/#21.** Originally excluded, then reverted back in after live testing found the shell/`href`-based redesign left Quick Buy's nested size-guide drawer permanently empty (a regression from Quick Buy's prior, already-imperfect behavior). `data-load-assets="true"` added to all 6 Quick Buy render sites; `data-load-asset` added to `size-guide-elements.js`'s own script tag so the custom element registers correctly when it arrives via Quick Buy's `innerHTML`.
- Content-side Matrixify re-authoring of existing non-RTE products onto the new shared system (follow-up, content-ops owned) — **including the now-required one-time `data-load-asset` marker addition to Junction's `<script>` tag specifically**, needed to restore its calculator (see AC #6/#13).
- Client-facing "Size Guide Content Guide" documentation (follow-up, written after this ships and is tested) — needs to document the `data-load-asset` marker requirement explicitly, since it's now load-bearing rather than automatic.

## Dev Notes:

- **New alt templates** — `templates/product.size-chart-metafield-drawer.json` / `-popover.json` (`layout: false`, `main-product` section, `variant_picker` block only), mirroring the existing `templates/product.quick-buy-drawer.json` pattern.
- **`sections/main-product.liquid`** — new `template.suffix == 'size-chart-metafield-drawer'/'-popover'` branch (the pre-existing `unless template.suffix contains 'quick-buy'` was restructured to `if/elsif/else` to fit it in) rendering only the size-guide fragment: title, content, image, a `<link>` to `size-guide.css`, a `<script src>` for `size-guide-widget.js`, and the shared default `<template>` (via `{% render 'hmg-size-widget-default-template' %}`).
- **`snippets/product-form.liquid`** (~L1104-1112) — the metafield drawer/popover markup is now empty `<size-guide-drawer href="...?view=size-chart-metafield-drawer">` / `<size-guide-popover href="...?view=size-chart-metafield-popover">` instead of eager inline content, plus a conditional `<script src="size-guide-elements.js">` gated on `found_size_option_metafield`.
- **`assets/size-guide-elements.js`** (new) — `<size-guide-drawer>`/`<size-guide-popover>` custom elements extending the theme's `DrawerContent`/`PopoverContent`, each guarded with `customElements.get(...)` before `define()`. Trivial subclasses — no `_load()` override needed; they exist only so `OpenableElement._load()`'s `querySelector(this.tagName.toLowerCase())` fetch stays unambiguous (a generic `<drawer-content>` tag could match the wrong instance if more than one is present). Script re-execution lives centrally in `custom.js` (see below), not duplicated here.
- **`assets/custom.js`** — monkey-patches the shared `OpenableElement.prototype._load` (not each subclass individually) so `<script>` tags inserted via `.innerHTML` can be made to execute. Opt-in, single mode, pure marker-based: a container needs `data-load-assets="true"`; within it, only `<script data-load-asset>`/`<link rel="stylesheet" data-load-asset>` tags are processed — nothing else the fragment contains is touched. **Only `<size-guide-drawer>`/`<size-guide-popover>` (`snippets/product-form.liquid`) carry this attribute.** External scripts already present elsewhere in the document (matched by `src`) are deduped, not re-fetched; `<link>` tags get the same dedup treatment (they don't need re-execution — unlike `<script>`, they're not inert via `innerHTML` — but can still pile up as redundant DOM nodes). Promise-based, awaited by `_load()` — a drawer doesn't finish "opening" until any scripts it depends on have actually finished loading, not just been requested.
  - **This is a content-authoring convention, not an automatic compatibility shim.** Content that wants its `<script>` to run once deferred-loaded has to carry the marker — full stop, no blanket/unmarked fallback.
  - **Quick Buy is explicitly not extended to support this at all** (see Out of Scope). The shared patch technically exists on the base class every drawer inherits from, but Quick Buy's render sites carry no `data-load-assets` attribute, so it's a no-op there — functionally untouched.
  - **`LibraryLoader`** (Focal's existing dynamic-script-loading utility, `assets/theme.js:2509-2577`, used for Flickity/PhotoSwipe/QR/model-viewer) was evaluated and deliberately not used here — it loads a *named external file* from code that's already running; it has no mechanism for arbitrary `<script>` content embedded in fetched HTML.
- **`assets/size-guide-widget.js`** (new) — `<hmg-size-widget>` custom element (Junction's calculator, extracted out of the metafield). Three authoring tiers, resolved in `_ensureMarkup()`: (1) attributes only → clones the built-in default `<template>`, scoped-looked-up via the widget's nearest `<size-guide-drawer>`/`<size-guide-popover>` ancestor, not `document.getElementById` (a PLP quick-add grid can load more than one product's fragment/template copy into the DOM at once); (2) a `<template>` child → cloned in, `<template>` removed after; (3) direct children, no wrapper → used as-is (Junction's current, unmigrated shape). `sizes` is read per-instance from an attribute (JSON), not a page-global — a `window.RS.sizeGuide.sizes` global was tried and rejected during dev because it breaks on a PLP quick-add grid where multiple products' widgets can load into the DOM at once. `_renderSizeBar()` builds the size-bar/ticks from the resolved `sizes` table.
- **`snippets/hmg-size-widget-default-template.liquid`** (new) — the built-in default skeleton, generic pack-agnostic torso-measurement copy, overridable via `sizes`/`video-url`/`measurement-image`/`fit-images` attributes.
- **`assets/size-guide.css`** (new) — shared `.hmg-size-guide__*` class contract for the static (non-interactive) content tier, plus Junction's existing `.hmg-sizer-std`/`.hmg-std-*` widget styles (extracted from the metafield's inline `<style>` block, not yet reconciled with the generic classes).
- **`window.RS.helpers`** — `toInches`/`cmRound`/`formatDualUnitRange` added following the existing convention from `assets/rs-helpers.js`, defined inside `size-guide-widget.js` (not `rs-helpers.js` itself) so they stay conditionally loaded rather than joining the sitewide bundle.
- Reference content examples (not committed, local only): `size-guide-reference-junction.html` (tier 3), `size-guide-reference-tier1-example.html` (tier 1), `size-guide-reference-aero-28.html` (tier 1, real 3-tier data sourced from Aero 28's live variant option), `size-guide-reference-pemi-15-tier2.html` (tier 2 — Pemi measures chest, not torso, so it needs a custom `<template>` rather than the generic default skeleton).

## Implementation Notes:

- Size-guide CSS/JS/content now load only when the drawer/popover is opened, not on every PDP load.
- New `<hmg-size-widget>` component — three ways to author content (attributes only, custom `<template>`, or fully custom markup) — see `HYPER-size-guide-content-guide.md`.
- Junction's calculator needs a one-time content update (`data-load-asset` on its `<script>` tag) to work again — not done yet, content-ops task.
- Fixed a pre-existing live bug: the size-guide calculator never worked inside Quick Buy (PLP and cart "You may also like") — it does now.
- Failed content loads (bad network, rate limits) show a "Try Again" message instead of a blank drawer or crash.
- Fixed a pre-existing bug: `accentuate.popup_image` can hold a file reference (not just a URL string), which was rendering as a broken image.

### Detailed dev verification (internal reference)

Item-by-item checks run during development. Not meant for QA — the Acceptance Criteria above is the QA-facing checklist.

| **#** | **Item** | **Notes** |
|---|---|---|
| 1 | No size-guide CSS/JS loads on PDP page load — only after "How to Measure" is clicked. | https://hyperlitemountaingear.com/products/rs-test |
| 2 | `size-guide-elements.js` only loads for products with size-guide content configured. | https://hyperlitemountaingear.com/products/rs-test-1 (content cleared) |
| 3 | Opening the drawer fetches content once; reopening doesn't re-fetch. | https://hyperlitemountaingear.com/products/rs-test |
| 4 | "How to Measure" only shows when content + a qualifying variant option both exist (existing logic, unchanged). | Shows next to a "Torso" option if one exists; otherwise next to "Volume", "Size", or a "Chest" option. Requires `accentuate.content` populated. `snippets/product-form.liquid` ~L173-196. |
| 5 | Plain HTML content with no custom CSS/JS (the 36-product common case) renders correctly, no regression. | https://hyperlitemountaingear.com/products/aero-28 |
| 6 | Junction's unmigrated content renders unchanged. Its calculator needs a one-time `data-load-asset` marker added to its `<script>` tag to work again — a deliberate content update, not a bug. | https://hyperlitemountaingear.com/products/junction |
| 7 | Attribute-only content clones the default skeleton and calculates correctly. | https://hyperlitemountaingear.com/products/rs-test |
| 8 | Custom `<template>` content gets full calculator behavior; the `<template>` tag doesn't stay in the live DOM. | https://hyperlitemountaingear.com/products/rs-test-1 |
| 8a | A plain `<link rel="stylesheet">` in content loads and applies — no marker needed. | https://hyperlitemountaingear.com/products/rs-test-1 |
| 9 | Size-bar segments generate from each instance's own data, not hardcoded. | https://hyperlitemountaingear.com/products/rs-test |
| 10 | Calculated size/range/description are correct at boundary and mid-range inputs, in/cm. | https://hyperlitemountaingear.com/products/rs-test |
| 11 | An open-ended top/bottom size tier returns a consistent result anywhere in that range. | https://hyperlitemountaingear.com/products/rs-test |
| 12 | A `<script data-load-asset>` executes once loaded; an unmarked one doesn't. | https://hyperlitemountaingear.com/products/junction |
| 13 | No new console errors on any tested PDP. |  |
| 14 | A duplicate external script (same `src` already on the page) isn't re-fetched. | Tested via `junction` then `pemi-15` Quick Buy, same page — https://hyperlitemountaingear.com/collections/rs-test |
| 15 | Content using only legacy classes (no data attributes) still works via fallback selectors. | https://hyperlitemountaingear.com/products/rs-test |
| 16 | A product with its own `<style>` block renders/applies correctly, unmigrated. | https://hyperlitemountaingear.com/products/pemi-15 |
| 17 | A product with independently-named classes sharing our `hmg-` prefix doesn't collide with ours. | https://hyperlitemountaingear.com/products/topo-logo-hoodie |
| 18 | Quick Buy opens the size-guide drawer and calculator correctly, on PLP and in cart recommendations. | https://hyperlitemountaingear.com/collections/rs-test |
| 19 | A failed content fetch shows a retry message instead of crashing or leaving a blank drawer; Try Again genuinely retries. | https://hyperlitemountaingear.com/products/rs-test |
| 20 | `accentuate.popup_image` resolves correctly whether it holds a plain URL string or a file reference. | https://hyperlitemountaingear.com/products/aero-28 (string), https://hyperlitemountaingear.com/products/rs-test (file reference) |

## Testing Notes:

- Manually tested via Playwright against dev preview themes (`187360182317`, then `187329314861`) and a test product (`rs-test`), plus Junction directly.
- Test product setup gotcha: the "How to Measure" trigger requires BOTH `accentuate.content` populated AND a variant option name matching torso/volume/chest/size (`snippets/product-form.liquid` ~L126, ~L181-191) — a simple no-option test product won't show the trigger even with content set.
- Shopify's theme-preview mode is tied to the session cookie server-side — navigating without `?preview_theme_id=` in an already-previewing browser session does NOT reliably show the true published theme (confirmed via `window.Shopify.theme.role`/`.id`); don't trust that as a way to check production behavior without a genuinely fresh/incognito session.
- Real bug caught and fixed during this round of testing: the external-script dedup check in `custom.js` initially compared a script's `src` against the whole document *before* the original tag was replaced, so it always matched itself and silently skipped every re-execution (nothing ever actually ran). Fixed by excluding the tag being processed from that check. Worth noting since it produced no error — it just silently did nothing, only caught by explicitly checking `customElements.get(...)` after the fact rather than assuming success.
- Final state confirmed live: Junction's content displays correctly, its calculator is inert pending a content-side marker update, and Quick Buy is functionally untouched.
- Spot-checked three additional existing, unmigrated products live: `aero-28` (plain RTE), `pemi-15` (static `<style>` block), `topo-logo-hoodie` (colliding `hmg-` class prefix) — all render correctly, no new console errors.
- Tier 2 (custom `<template>`) has only been verified via synthetic DOM injection, not real `accentuate.content` — pending a manual metafield update on a test product (AC #8).
- Content updates required as a direct result of this design: **Junction's live `<script>` tag needs `data-load-asset` added to restore its calculator** — not yet done, tracked as a follow-up (see Out of Scope).

## Bugs from QA:

- TBD

## Clarifying Questions:

- How many total products does Matt expect to eventually roll this out to, and are Aero/Pemi's own size tables/measurement types confirmed, or should Roswell propose based on their existing variant option data (as done for the Aero 28 example in this ticket)?
- Should the content-side Matrixify migration (moving the 7 static-styled + Junction onto the new shared system) be its own follow-up ticket, or tracked as a sub-task here once this ships?
