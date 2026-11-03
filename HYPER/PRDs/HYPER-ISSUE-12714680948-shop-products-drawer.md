---
monday_id: 12714680948
project_key: HYPER
authored: 2026-09-22
---

## Background:

- Roswell recommended an experience that makes related products within a blog article more prominent and easy to shop. The current inline product carousel (`[[related_products]]` token in `main-article.liquid`) is functional but low-visibility — readers scroll past it. A drawer-based "shop the look" pattern keeps products accessible without leaving the article.

- Client approved the approach: a sticky trigger button + right-side product drawer, with quick-view integration matching the existing ajax cart drawer pattern.

## Necessary Info (Design/Documentation):

- **Metafield source:** `article.metafields.custom.related_products` — a list of product references. Already populated on blog posts. The section will use a `product_list` schema setting connected via **dynamic sources**, making it reusable on any template (article, page, collection, etc.).

- **Existing unused section:** `sections/product_recommendations.liquid` references `article.metafields.custom.product_recommendations` — a metafield that is **not defined** on any article. This section is dead weight in the article template. Not modified by this ticket.

- **Drawer pattern:** Uses the theme's existing `DrawerContent` web component (extends `OpenableElement`, `assets/theme.js:4649`). The base `.drawer` CSS class provides a 400px max-width right-side panel, flush to the screen edge — the same narrow drawer used by the ajax cart. No new drawer infrastructure needed.

- **Quick-view integration:** Product cards trigger `quick-buy-drawer` (desktop) or `quick-buy-popover` (mobile), same as `shop-the-look.liquid` and cart YMAL. On desktop, the quick-add drawer pushes the product list drawer left. On mobile, quick-add slides up from bottom.

- **Figma for sticky trigger:** [Hyperlite Landing Pages — node 985-6577](https://www.figma.com/design/BXui0qAUrqXUoZtKzd5cSg/Hyperlite-Landing-Pages?node-id=985-6577&m=dev) — client chose the **text option**.

- **Trigger settings (from client):** display scroll delay, background color, text color, button text, optional icon upload.

## Constraints / Scope:

- **Reusable section** — not hardcoded to blog articles. Works on any template via dynamic sources.
- **Web components throughout** — extends theme's existing `DrawerContent`/`OpenableElement` hierarchy.
- The existing inline `[[related_products]]` carousel in `main-article.liquid` is **not modified**.
- The existing `sections/shop-the-look.liquid` (image hotspot dots) is **not modified or renamed**.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
|---|---|---|---|---|
| 1 | Section named "Shop products drawer" is available in the theme editor and can be added to any template (article, page, collection, etc.) | | ✅ | |
| 2 | Section accepts a product list via a `product_list` setting that supports Shopify dynamic sources (e.g. `article.metafields.custom.related_products`) | | ✅ | |
| 3 | A sticky trigger button appears fixed to the viewport after a configurable scroll delay | | ✅ | |
| 4 | Trigger button settings are configurable in the theme editor: display scroll delay, background color, text color, button text, and optional icon upload | | ✅ | |
| 5 | Clicking the trigger opens a product list drawer that slides in from the right, flush to the screen edge (no inset/gap) — same width as the ajax cart drawer | | ✅ | |
| 6 | The drawer displays product cards with image, title, price, and a quick-view / add-to-cart action | | ✅ | |
| 7 | Clicking a product's quick-view on desktop opens a quick-add drawer that slides in from the right, pushing the product list drawer further left | | ✅ | |
| 8 | Clicking a product's quick-view on mobile opens a quick-add drawer that slides up from the bottom (matching the ajax cart mobile pattern) while the product list drawer stays as-is | | ✅ | |
| 9 | The drawer closes via close button, overlay click, or Escape key | | ✅ | |
| 10 | When no products are in the list (empty metafield / no dynamic source connected), the trigger button does not render | | ✅ | |
| 11 | The section renders product cards using the existing `product-item` snippet for visual consistency with the rest of the theme | | ✅ | |
| 12 | The existing inline `[[related_products]]` carousel in `main-article.liquid` is not modified by this ticket | | ✅ | |

## Dev Notes:

> File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing.

- **Drawer base class:** `DrawerContent` (`assets/theme.js:4649`) extends `OpenableElement` (`assets/theme.js:1388`). Provides focus trapping via `createFocusTrap`, `open`/close attribute toggling, body scroll lock (`document.documentElement.classList.toggle("lock-all")`), overlay click-to-close, and `href`-based lazy loading. Our `<shop-products-drawer>` extends `DrawerContent`.

- **Drawer CSS:** Base `.drawer` class (`assets/theme.css:4219`) = `width: 89vw; max-width: 400px; position: fixed; right: 0; top: 0; height: 100%`. Flush to screen edge. Uses `translateX(100%)` → `translateX(0)` transition. The `drawer--large` modifier bumps to 500px (cart drawer) — we use the base, not `--large`.

- **Product cards:** Use `{%- render 'product-item' -%}` snippet, same as `main-article.liquid:36` and `shop-the-look.liquid:392+`. Quick-buy integration is built into `product-item` — renders `quick-buy-drawer` (desktop) and `quick-buy-popover` (mobile) with `href` for lazy content fetch.

- **Sticky trigger pattern:** No existing sticky trigger component exists. Closest precedent is the sticky audio player in `article.json` (uses `IntersectionObserver` + `position: fixed` + `is-visible` class toggle). Build as a `<shop-products-trigger>` custom element with `connectedCallback` setting up a scroll listener with configurable delay.

- **Desktop quick-view stacking:** When a `quick-buy-drawer` opens inside our drawer, the product list drawer needs to shift left by the quick-buy drawer's width. Listen for `openable-element:open` / `openable-element:close` events on child `quick-buy-drawer` elements and apply a CSS transform.

- **Mobile quick-view:** On mobile, `quick-buy-popover` already slides up from bottom by default (built into the theme). The product list drawer stays as-is. No special mobile handling needed beyond what the theme already provides.

- **Dynamic sources schema:** Use `type: "product_list"` in section schema settings. Shopify 2.0 dynamic sources let merchants connect this to any metafield of type `list.product_reference`.

## Implementation Notes:

- TBD (post-execution)

## Testing Notes:

- TBD (post-execution)

## Bugs from QA:

- TBD

## Clarifying Questions:

- None — all questions resolved during scoping.
