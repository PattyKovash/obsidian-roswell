---
monday_id: 12961256086
project_key: THREADS
authored: 2026-09-15
---

## Background:

-  The live theme applied the brand accent color (#e51a4e) to pagination link text, outline, and focus ring via hardcoded hex values. The 4.1.4 upgrade reverted these to the stock `var(--color-foreground)`, making pagination links neutral-colored instead of brand-colored.

-  The old approach violated theme convention — hardcoded hex breaks color-scheme switching. The fix restores the visual intent using the theme's own variable system.

-  A secondary finding: `snippets/pagination.liquid` is an orphaned duplicate of `pagination-controls.liquid`, never rendered anywhere.

## Necessary Info (Design/Documentation):

-  No design. This restores the visual treatment the live site uses, properly tokenized.

-  Affects any page with paginated content (collections, blog, search results).

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Pagination page number links render in the brand red color, not the default foreground/text color. |  Matches live theme's visual intent. |  Done |   |
|  2 |  Focus ring on pagination links uses the same brand red. |  Keyboard-nav accessibility check. |  Done |   |
|  3 |  Current page indicator remains white text on a dark pill (stock behavior). |  `var(--color-background)` unchanged. |  Done |   |
|  4 |  Sale price styling still renders in brand red. |  `--color-sale-price` now aliases `--color-brand-accent`; no visual change. |  Done |   |

## Dev Notes:

-  Introduced `--color-brand-accent: #e51a4e` in `assets/base.css` at `:root`. The existing `--color-sale-price` now aliases it (`var(--color-brand-accent)`) so both pagination and sale pricing share one source of truth.

-  Three CSS properties changed in `snippets/pagination-controls.liquid`:

|  **Selector** |  **Property** |  **Before** |  **After** |
| --- | --- | --- | --- |
|  `.pagination__link` |  `color` |  `var(--color-foreground)` |  `var(--color-brand-accent)` |
|  `.pagination__link` |  `outline-color` |  `var(--color-foreground)` |  `var(--color-brand-accent)` |
|  `.pagination__link:focus-visible` |  `outline` |  `2px solid var(--color-foreground)` |  `2px solid var(--color-brand-accent)` |

-  `.pagination__link--current` keeps `color: var(--color-background)` — it needs to contrast against the foreground-colored pill behind it. No change needed.

-  `snippets/pagination.liquid` is confirmed orphaned (zero `render 'pagination'` calls in the theme). Left in place — removal is a separate cleanup task, not a migration concern.

## Implementation Notes:

Commit `2c3f2b6` on `develop/feature/THREADS-12961256086-pagination`.

## Testing Notes:

### Where to look

Any collection page with enough products to paginate (24+ items). The "All" collection at `/collections/all` is the easiest target.

### What to check

1. Page number links are brand red, not black/foreground-colored.
2. Hovering a page number shows the subtle background highlight (stock behavior, unchanged).
3. Current page number is white text on a dark pill (unchanged from stock).
4. Tab through pagination links — focus ring should be brand red.
5. On mobile: pagination still collapses to show fewer page numbers (stock responsive behavior, unchanged).
6. Navigate to `/cart` and confirm sale prices still render in brand red (regression check on the `--color-sale-price` alias).
