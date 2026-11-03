---
monday_id: 12962803069
project_key: TAHARI
authored: 2026-09-15
---

## Background:

- Client wants the header to be transparent on mobile for templates where it's already enabled via the existing per-template settings (`transparent_home`, `transparent_collection`, etc.). Client specifically wants homepage. Desktop header stays exactly as-is.

- The Broadcast theme's existing transparent header settings are desktop-oriented. This ticket adds a mobile-specific toggle that extends that transparency to mobile for the same templates. If a transparent logo is uploaded, it swaps on mobile too.

- On collection (PLP) pages, the client wants the desktop header and filter bar behavior to stay the same. On mobile only, the filter/sort bar should hide when the user scrolls down and slide back in when they scroll up. Header stays transparent on scroll-down, turns white on scroll-up.

- Client needs flexibility on both behaviors, so we're adding internal toggle settings for each. If disabled, everything functions as stock Broadcast.

## Necessary Info (Design/Documentation):

- **Base theme:** Broadcast v8.1.0. The existing transparent header mechanism uses `data-header-transparent` on `<body>`, `.section-overlay-header` CSS selectors, and `.js__header__stuck` class to kill transparency on stick.

- **Broadcast's scroll system:** A global `theme:scroll` event fires with `{up, down, position}` detail, RAF-throttled. The `HeaderComponent` custom element in `theme.dev.js` consumes it for sticky behavior via `initSticky()`, `onScroll()`, `stickSimple()`/`unstickSimple()`.

- **Filter bar:** `.collection__nav` is `position: sticky` with `top: calc(var(--header-height)...)` when header is sticky.

- **Logo swap:** The theme already supports two logo images: `.logo__img--color` (regular) and `.logo__img--transparent` (overlay), controlled by `.header__logo--has-transparent` class. A transparent logo must be uploaded in the header section settings for the swap to happen.

- **Mobile breakpoint:** `max-width: 749px` is the theme's mobile breakpoint, used consistently across Broadcast.

- No new Figma design required. This is a behavior/UX change, not a visual redesign.

## Constraints / Scope:

- **Mobile only.** Both features are gated behind `@media (max-width: 749px)` in CSS and `matchMedia('(max-width: 749px)')` in JS. Desktop is completely untouched.

- **PLP scroll behavior applies to collection pages only.** Gated by `template contains 'collection'` in Liquid. Non-collection pages are unaffected.

- **Two independent settings.** Enabling the transparent header does not require the PLP scroll behavior, and vice versa. Either can be toggled independently.

- **Both settings live in the header section** (not the collection section) for simpler cross-section coordination with the header's existing transparent header settings and logo swap logic.

- **No transparent logo required.** If no transparent logo is uploaded, the regular logo stays on the transparent background. The CSS only swaps logos when `.header__logo--has-transparent` exists.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
|---|---|---|---|---|
| 1 | Setting `enable_mobile_transparent_header` exists as a checkbox in the header section schema, default off. | | ✅ | |
| 2 | Setting `enable_plp_scroll_filter` exists as a checkbox in the header section schema, default off. | | ✅ | |
| 3 | When both settings are off, all behavior is stock Broadcast with no regressions. | | ✅ | |
| 4 | Mobile transparent header: header background is transparent on mobile for templates where a per-template transparent setting is enabled (e.g., `transparent_home`). | | ✅ | |
| 5 | Mobile transparent header: if a transparent logo is uploaded, the header swaps to it on mobile. | | ✅ | |
| 6 | Mobile transparent header: if no transparent logo is uploaded, the regular logo displays on the transparent background. | | ✅ | |
| 7 | Mobile transparent header: desktop header is completely unchanged regardless of the setting. | | ✅ | |
| 8 | PLP scroll-down on mobile: filter/sort bar hides (scrolls away naturally, no jump or reflow). | | ✅ | |
| 9 | PLP scroll-down on mobile: header stays visible and transparent. | | ✅ | |
| 10 | PLP scroll-up on mobile: filter bar slides back in smoothly (CSS keyframe animation). | | ✅ | |
| 11 | PLP scroll-up on mobile: header gets white background and swaps back to color logo. | | ✅ | |
| 12 | PLP scroll behavior: desktop collection pages are unchanged. | | ✅ | |
| 13 | PLP scroll behavior: micro-scrolls under 10px do not trigger direction changes (debounce threshold). | | ✅ | |
| 14 | PLP scroll behavior: resizing viewport past 749px cleans up body classes (no stale mobile state leaking to desktop). | | ✅ | |
| 15 | Non-collection pages are unaffected by the PLP scroll setting. | | ✅ | |
| 16 | Both settings are independent: enabling one does not require or affect the other. | | ✅ | |

### Out of Scope

- Desktop header changes of any kind.
- Changing the existing per-template transparent header settings (`transparent_home`, `transparent_collection`, etc.).
- PLP scroll behavior on non-collection pages.

## Dev Notes:

*File paths, line numbers, and code below reflect a review at authoring time. Confirm they still hold before implementing.*

**Four files touched, no new sections or snippets needed.**

### 1. `sections/header.liquid` (settings, data attributes, Liquid variables)

- **Schema settings** (~lines 982-998): Two new checkboxes under a "Mobile transparent header" header group, placed after the existing per-template transparent checkboxes (`transparent_page`, `transparent_product_page`).

```json
{
  "type": "checkbox",
  "id": "enable_mobile_transparent_header",
  "label": "Enable mobile transparent header",
  "info": "Makes the header background transparent on mobile. If a transparent logo is uploaded above, it will be used.",
  "default": false
},
{
  "type": "checkbox",
  "id": "enable_plp_scroll_filter",
  "label": "Hide filter bar on scroll down (mobile)",
  "info": "Collection pages: hides the filter/sort bar when scrolling down and slides it back in on scroll up. Header stays transparent on scroll down, turns white on scroll up.",
  "default": false
}
```

- **Liquid variables** (~lines 41-47): Read the settings and detect collection template.

```liquid
assign mobile_transparent_header = section.settings.enable_mobile_transparent_header
assign plp_scroll_filter = section.settings.enable_plp_scroll_filter
assign is_collection_template = false
if template contains 'collection'
  assign is_collection_template = true
endif
```

- **Logo condition** (~line 243): Expanded `has_transparent_logo` to include mobile transparent header so the logo swap markup renders even when the desktop transparent header is off for a given template.

```liquid
{%- if transparent_header or mobile_transparent_header -%}
  {%- assign has_transparent_logo = true -%}
{%- endif -%}
```

- **Data attributes on `<header-component>`** (~lines 545-549): Conditional `data-mobile-transparent-header` and `data-plp-scroll-header` attributes. The PLP attribute is only added on collection templates.

- **CSS loading** (~line 528): Conditionally renders `mobile-transparent-header.css` when the setting is on.

### 2. `assets/mobile-transparent-header.css` (new file, 19 lines)

Mobile-only CSS wrapped in `@media (max-width: 749px)`. Sets `--bg: var(--TRANSPARENT)` on the header. If `.header__logo--has-transparent` is present (meaning a transparent logo was uploaded), hides `.logo__img--color` and shows `.logo__img--transparent` with a 0.6s ease transition.

### 3. `assets/collections.css` (~lines 251-298)

All additions inside an existing `@media (max-width: 749px)` block:

- **Scroll-down:** `.plp-header--scrolling-down .collection__nav { top: -200px; }` makes the sticky nav never reach its stick threshold, so it scrolls away naturally without layout reflow. The header gets transparent overrides via `--bg: var(--TRANSPARENT)` on the stuck header.

- **Scroll-up:** `.plp-header--scrolling-up .collection__nav` uses a `plp-nav-slide-in` keyframe animation (0.3s, ease-out-cubic) for smooth re-entry. The header gets `--bg: var(--COLOR-MENU-BG)` (white). Logo swaps back to color variant.

- The `top: -200px` technique avoids the layout jump that `position: relative` or `translateY(-100%)` caused during testing. The element stays sticky but its threshold is unreachable.

### 4. `assets/theme.dev.js` (~lines 3646, 3803-3850)

New methods on `HeaderComponent`:

- `initPlpScrollHeader()` (~line 3803): Guards on `data-plp-scroll-header` attribute. Sets up `matchMedia('(max-width: 749px)')` query and subscribes to `theme:scroll`.

- `onPlpScroll(e)` (~line 3813): Reads `{up, down, position}` from the scroll event. Applies a 10px threshold before toggling direction to prevent jank on micro-scrolls. Toggles `plp-header--scrolling-down` / `plp-header--scrolling-up` body classes. When viewport is wider than 749px, cleans up both classes immediately.

- Cleanup in `disconnectedCallback`: removes the `theme:scroll` listener.

### Architecture note

The JS handler toggles body classes (`plp-header--scrolling-down`, `plp-header--scrolling-up`) rather than directly manipulating styles. CSS handles the visual changes. This keeps the JS minimal and the visual behavior inspectable/debuggable from DevTools. Body-level classes were chosen over element-level because both the header and the collection nav (separate sections in the DOM) need to respond to the same scroll direction.

## Implementation Notes:

- **Settings location:** Both settings are in `sections/header.liquid` schema, under a "Mobile transparent header" header group (~line 982).
- **Dev settings file:** `sections/group-header.json` has both set to `true` for dev/preview.
- **Branch:** `feature/TAHARI-12962803069-transparent-logo`
- **Key commits:**
  - `fe3fa63` initial feature implementation
  - `93277e9` decouple mobile transparent header from per-template settings
  - `5722b8d` dev settings (group-header.json)
  - `862367d` split into two independent settings
  - `376cf4e` revert CLAUDE.md changes (context belongs in vault)

## Testing Notes:

- **Mobile transparent header:** Enable `enable_mobile_transparent_header` in the theme editor. Ensure per-template settings are enabled for the pages you want to test (e.g., `transparent_home` for HP). On mobile viewport (< 750px), verify the header background is transparent on those templates. If a transparent logo image is uploaded in the header settings, confirm the logo swaps. If no transparent logo is uploaded, confirm the regular logo stays. Confirm templates without a per-template setting enabled do not get a transparent header. Switch to desktop viewport and confirm no change.

- **PLP scroll behavior:** Enable `enable_plp_scroll_filter` in the theme editor. Navigate to any collection page on mobile viewport. Scroll down slowly: filter/sort bar should disappear smoothly, header should stay transparent. Scroll up: filter bar should slide in from above, header should turn white with color logo. Micro-scrolls (tiny back-and-forth) should not cause flickering. Resize to desktop: filter bar should return to normal sticky behavior, no leftover body classes.

- **Both off:** Disable both settings. Confirm stock Broadcast behavior on all pages.

- **Independent toggling:** Enable only one setting at a time, confirm no side effects from the other being off.

## Bugs from QA:

TBD

## Clarifying Questions:

None.
