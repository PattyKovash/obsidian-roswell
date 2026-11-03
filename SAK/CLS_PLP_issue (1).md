## Collection page CLS investigation (01 Jul 2026)

### Codebase: `theme_export__www-thesak-com-rs-release-sak-v2026-25sunbudz__01JUL2026-0402pm`

Exported 01 Jul 2026, 4:02pm. Theme: `sak-v2026-25sunbudz` (release channel).
SearchSpring is enabled for collection pages (`settings.ss_enable`).

**Context.** Investigated the Cumulative Layout Shift (CLS) score on a PLP /
collection page (the default `templates/collection.json`, e.g. the women's
handbags collection). Lighthouse **Mobile** total CLS = **0.430** (target
< 0.1). Desktop run timed out; mobile is the worse case anyway.

**Lighthouse "Layout shift culprits":**

| Element | Shift score | Notes |
|---|---|---|
| Total | 0.430 | |
| `...__collection_description_8Wrheb` | **0.384** | The collection description block (renders **below** the product grid). Biggest offender by far — ~89% of total. |
| `ss__has-results grid-outer` (SearchSpring product grid) | 0.046 | The grid tiles settling in. |

**Root cause — confirmed.** When SearchSpring is enabled, the grid section
renders **empty** containers that SearchSpring fills client-side. See
`sections/collection.liquid` in this export:

```html
<!-- line 218 -->
<div class="{{ collection_sidebar_class }}" id="searchspring-sidebar" style="min-height: 100vh;"></div>
<!-- line 262 -->
<div id="searchspring-content" style="min-height: 100vh;"></div>
```

That reserves only **one viewport** of height. A real collection grid on
mobile is several screens tall, so when SearchSpring injects the product
tiles the container grows well past 100vh and **pushes everything below it
down** — including the collection description, which sits directly beneath
the grid in the section order (`hero → section-columns ×4 → subcollections →
main/collection → collection-description → …`). That downward displacement is
the 0.384; the grid tiles settling inside the container is the 0.046.

**`100vh` is identical on mobile and desktop.** Both lines are the same
hardcoded **inline** style — not responsive. `100vh` scales to each device's
viewport (shorter on a phone, taller on desktop) but is still only **one
screen tall** on either, and is **not tied to the grid's real height**.

**Why the reservation should differ per breakpoint.** The grid's true height
differs by device because columns-per-row differ, so the same product count
produces very different row counts:
- Desktop: `section.settings.grid`, default **3** per row (range 2–6)
- Mobile: `section.settings.grid_mobile`, **1 or 2** per row
- Tablet: `columns_medium` (3, or 2 when desktop is 2/4), `columns_small` (2)

Example, 36-product first page: desktop ≈ 12 rows, mobile@2-col ≈ 18 rows,
mobile@1-col ≈ 36 rows. Mobile's grid is far taller — which is why **mobile
CLS (0.430) is the worse case**. A correct reservation must be **taller on
mobile than on desktop**, sized to `rows × card height` at each breakpoint.
Card height = product image (global `settings.product_grid_aspect_ratio`) +
the title/price/swatch block beneath it.

**Ruled out.** The `data-aos="hero"` fade/slide animation on the
"Text columns with images" sections (`section-columns.liquid` →
`snippets/multicolumn.liquid`) is **NOT** a CLS contributor — it animates
only `opacity` + `transform: translateY`, and transform/opacity motion is
excluded from CLS by definition. (Removing it could still help LCP/main-thread,
but that's a separate concern.)

**Design constraint to preserve.** The collection description is intentionally
placed at the **bottom** of the grid. `sections/collection-description.liquid`
has a deliberate fade-in (`@keyframes collectionDescFadeIn`, `opacity:0` +
`animation-delay` from the `fade_in_delay` setting, default 800ms). Its purpose
is to prevent a flash where the description briefly appears near the top of the
page before the (empty, 100vh) grid fills in and pushes it down. Any fix must
keep the description at the bottom and avoid reintroducing that flash.

### The two fixes (either addresses the known CLS; Fix 1 is the real one)

**Fix 1 — SearchSpring: reserve the grid's real height (root-cause fix).**
Make the reserved space match the true grid height so nothing grows after
first paint. In `sections/collection.liquid`, `#searchspring-content`
(line 262) and `#searchspring-sidebar` (line 218) currently reserve a flat
inline `min-height: 100vh` that is identical on mobile and desktop.

*Option 1a — Skeleton placeholder tiles (recommended; handles mobile/desktop
automatically).* Server-render placeholder cards inside `#searchspring-content`
— same count as SearchSpring's default page size, same markup/aspect ratio as
the real product cards — that SearchSpring replaces in place. A size-neutral
swap → zero shift. Fixes both the 0.384 and the 0.046.
- **Why this solves mobile vs desktop with no separate math:** the skeleton
  tiles sit in the theme's existing responsive product grid, which already
  reflows columns per breakpoint via the CSS vars set in `collection.liquid`
  (`--COLUMNS`, `--COLUMNS-MEDIUM`, `--COLUMNS-SMALL`, `--COLUMNS-MOBILE`).
  So the reserved block is automatically ~12 rows tall on desktop and ~18–36
  rows on mobile — correct at every width, because CSS does the row math.
- Remove the inline `min-height: 100vh` once skeletons hold the space.
- Give the skeleton cards the same aspect-ratio wrapper as
  `snippets/product-grid-item.liquid` (image ratio = global
  `settings.product_grid_aspect_ratio`) plus a fixed-height text block, so
  each skeleton = real card height.

*Option 1b — Per-breakpoint `min-height` (cheaper, approximate).* Replace the
flat inline `100vh` with **separate values per breakpoint** in a `{% style %}`
block, since mobile needs a taller reservation than desktop:
- Compute per breakpoint: `reserved = ceil(page_size / columns) × card_height`
  where `columns` = desktop `grid` (≈3), mobile `grid_mobile` (1–2), etc., and
  `card_height` = image height (from `product_grid_aspect_ratio`) + text block.
- Example shape (numbers illustrative — dev to calibrate against real cards):
  ```css
  #searchspring-content { min-height: 320vh; }               /* mobile default (1–2 col, many rows) */
  @media (min-width:750px){ #searchspring-content{ min-height:220vh; } } /* tablet */
  @media (min-width:990px){ #searchspring-content{ min-height:180vh; } } /* desktop (3+ col, fewer rows) */
  ```
- Trade-off vs 1a: it's an estimate, so it can slightly over/under-reserve if
  page size or card height changes. Skeletons (1a) stay correct automatically.

- Bonus (either option): if space is fully reserved from paint, the description
  never flashes at the top, so the collection-description fade may become
  unnecessary.
- Needs from the team: SearchSpring default **page size** (results per page).
  Card aspect ratio comes from the global theme setting
  `settings.product_grid_aspect_ratio`.

**Fix 2 — Description: gate the reveal to the grid, not a fixed 800ms timer.**
Non-SearchSpring; preserves the current design (description at bottom, hidden
until the grid is in). Today the description is `opacity:0` and fades in on a
blind ~800ms timer. Invisible elements don't count toward CLS — but once the
fade completes (~1.2s) the description is visible, and if the grid is **still
loading past that point** (common on mobile/slow networks) the description is
now visible *while* it's being pushed → that's what gets scored.
- **Fix:** keep the description invisible until SearchSpring signals the grid
  is actually rendered, then reveal it — instead of a fixed timer. Hook
  SearchSpring Snap's result event, or use a `MutationObserver`/`ResizeObserver`
  on `#searchspring-content` and reveal once it stops resizing. The description
  then only ever becomes visible at its final position, so its movement is
  never counted.
- Lives entirely in `sections/collection-description.liquid` + a small JS hook;
  no SearchSpring config change.
- **Breakpoint-agnostic:** because it waits for the actual grid-rendered
  signal (not a size), it works identically on mobile and desktop — no
  per-breakpoint values needed, unlike Fix 1b.
- Trade-off: this **masks** the shift (layout still physically moves; the
  moving element is just kept invisible so it doesn't score) and does **not**
  fix the 0.046 grid-settle. It's a hardened version of the existing band-aid.

**Recommendation:** Fix 1 stops the reflow at the source and cleans up both
culprits — do this if SearchSpring page size / card dimensions are known.
Fall back to Fix 2 if reserving exact grid height proves impractical.

Status as of 01 Jul 2026: findings handed to the dev team; not yet implemented.
