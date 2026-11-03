---
monday_id: 13175307071
project_key: TAHARI
authored: 2026-10-22
---

## Background:

-  Use [nosto/_candidate](https://github.com/roswell-studios/Elie_Tahari_TAHARI_2026/tree/nosto/_candidate) branch to branch off of for development for theme code changes.

-  Use [Elie_Tahari_TAHARI_Nosto](https://github.com/roswell-studios/Elie_Tahari_TAHARI_Nosto) repo for Nosto elements

-  Use [RS: nosto/_candidate [DO NOT DELETE]](https://www.elietahari.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=157709861001) for testing and previews.

-  Kick off ticket doc:

   -  [https://roswellstudios-company.monday.com/boards/4922048779/pulses/13175307071?doc_id=18433464639](https://roswellstudios-company.monday.com/boards/4922048779/pulses/13175307071?doc_id=18433464639)

-  Elie Tahari is replacing Shopify's own search, predictive search dropdown and collection filtering with Nosto (Personalized Search, Category Merchandising, Product Recommendations, Onsite Content Personalization), per the Nosto SOW (start 2026-09-30, go-live target 2026-11-11).

-  The SOW requires the Nosto implementation to replicate the current live site's look and behaviour unless alternative designs are provided.

## Necessary Info (Design/Documentation):

-  No new design. The live theme is the spec; the BaubleBar Nosto build is implementation reference only.

## Constraints / Scope:

## Objective/Acceptance Criteria:

### Autocomplete

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Typing in the header search opens the Nosto dropdown; Shopify's predictive search does not render. |   |  ✅ |   |
|  2 |  The dropdown layout matches live: Suggestions (query suggestions, then collections), the "Search for "{query}"" button, and Products. |   |  ✅ |   |
|  3 |  The matched part of each query suggestion is highlighted like live (white italic on black). |   |  ✅ |   |
|  4 |  Product columns match live at each width: 4 at 990px and up, 3 at 750–989px, 2 at 480–749px, 1 below 480px. |   |   |   |
|  5 |  Product cards are the theme's search card: image, Sale badge, title, sale and compare-at price, colour count. |   |  ✅ |   |
|  6 |  Selecting a query suggestion opens the search results page for that query. |   |   |   |
|  7 |  Selecting a collection opens that collection. |   |   |   |
|  8 |  Selecting a product opens its product page. |   |   |   |
|  9 |  Pressing Enter or the "Search for" button opens the search results page for the typed query. |   |   |   |
|  10 |  Arrow keys move through the dropdown items, Enter opens the highlighted item, and Escape closes the dropdown. |   |   |   |
|  11 |  On mobile, search opened from the mobile bar shows the same dropdown and behaviour. |   |   |   |
|  12 |  Clearing the input or closing search hides the dropdown. |   |   |   |
|  13 |  A query with no matches opens the dropdown with only the "Search for "{query}"" button, like live. |   |  ✅ |   |
|  14 |  The RS: Nosto Settings header search options turn suggestions, collections, popular searches and the "Search for" button on and off, and set the product count. |   |   |   |
|  15 |  Dropdown copy appears in each store language. |   |   |   |
|  16 |  Autocomplete searches and clicks are recorded in Nosto (visible in the Nosto debug toolbar). |   |   |   |
|  17 |  A query that matches products but no suggestions shows only the Products group, full width, with up to 10 products (4 columns on desktop, 1 on mobile) and the "Search for" button, like live. |   |   |   |

### Search results page

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  The search template renders the RS: Nosto search section, and its caption, toolbar (Filters, Sort, Model \| Product) and grid match live in layout and styling at 1440px and 390px; the Search section stays in the template, disabled. |   |  ✅ |   |
|  2 |  The Sort button shows "Relevance" by default, like live, and the chosen option after a change. |   |  ✅ |   |
|  3 |  Product columns, pagination style and products per page follow RS: Nosto Settings → Search page. |   |   |   |
|  4 |  Cards render the theme's product card (images, badges, sale pricing, colour count, quick add). |   |  ✅ |   |
|  5 |  The grid's loading state matches live; where live has none, Nosto's loading state mimics live's look. |   |   |   |
|  6 |  Each card's loading state matches live; where live has none, Nosto's mimics live's look. |   |   |   |
|  7 |  Card images are as sharp as live at 1x and 2x pixel density, including slider images after advancing. |   |   |   |
|  8 |  Back, forward and reload keep the query, filters, sort and loaded page. |   |   |   |
|  9 |  A query with no matches keeps the caption ("No results found for…") and toolbar, and the grid shows "Sorry, there are no products here."; the Filters drawer says "No filters available for this collection". |   |  ✅ |   |
|  10 |  Search results are recorded in Nosto (visible in the Nosto debug toolbar). |   |   |   |
|  11 |  When filters leave no results, the caption, toolbar and filter drawer (chips, Reset) stay, and the grid shows "Sorry, there are no products here." with no Reset button, like live. |   |  ✅ |   |
|  12 |  The Sort button and list match live in size and spacing at 1440px and 390px, with "Relevance" marked active by default. |   |  ✅ |   |
|  13 |  The RS: Nosto search section's padding, colour scheme and default card image settings apply when changed in the theme editor. |   |   |   |

### Filters (search and collection pages)

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  The Filters button, drawer (width, background), heading with active count, group headings, value rows, chips, Clear Filters, Reset and View N items match live in size, type and spacing. |   |  ✅ |   |
|  2 |  Facets appear in live's order: Product type, Price, Color, Size (set in Nosto Admin). |   |   |   |
|  3 |  Size values show live's grouped labels in live's order (e.g. "XS (0-2)"), set via Nosto Admin merged values. |   |   |   |
|  4 |  Filter values show no product counts by default; RS: Nosto Settings → Filters → Show product counts turns them on. |   |  ✅ |   |
|  5 |  Colour values with a Nosto Admin colour or image show the theme's swatch (square or circle per theme setting); values without one show the theme's empty swatch. |   |  ✅ |   |
|  6 |  The Price filter matches live: slider from $0 to the highest price in the current results, with "$" From and To inputs that fill while dragging and apply a typed value. |   |  ✅ |   |
|  7 |  The toolbar Filters button shows no count when filters are applied, like live. |   |  ✅ |   |
|  8 |  Filter chips and "More options" use live's line height (25px chip height). |   |  ✅ |   |
|  9 |  Selecting a value updates results, chips, the drawer count and "View N items" without a page reload; the drawer stays open. |   |  ✅ |   |
|  10 |  Removing a chip, Clear Filters and Reset each update results like live. |   |   |   |
|  11 |  Filters work and match live on mobile. |   |   |   |
|  12 |  Price chips format amounts like live (e.g. "$5,000 - $798"). |   |  ✅ |   |

### Collection page (default template)

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  The default collection template renders the RS: Nosto collection section (toolbar, filters, grid through Nosto); the Collection products section stays in the template, disabled. |   |  ✅ |   |
|  2 |  The toolbar (Filters, Sort, Model \| Product) and grid match live in layout and styling at 1440px. |   |  ✅ |   |
|  3 |  The toolbar and grid match live on tablet and mobile. |   |  ✅ |   |
|  4 |  Pagination, product columns and products per page follow RS: Nosto Settings → Collection page; defaults match live (infinite scroll, 4 / 2 columns, 22 per page). |   |  ✅ |   |
|  5 |  The Sort button reads "Sort" until a sort is chosen, like live; Nosto's default order is labelled "Featured". |   |  ✅ |   |
|  6 |  Infinite scroll loads the next 22 products as the shopper reaches the end of the grid, with no duplicates or gaps, at 1440px and 390px. |   |  ✅ |   |
|  7 |  The grid's loading state matches live; where live has none, Nosto's mimics live's look. |   |   |   |
|  8 |  Each card's loading state matches live; where live has none, Nosto's mimics live's look. |   |   |   |
|  9 |  Card images are as sharp as live at 1x and 2x pixel density, including slider images after advancing. |   |  ✅ |   |
|  10 |  Collection product order is Nosto's merchandised order, set in Nosto Admin (it does not import Shopify's manual order). |   |   |   |
|  11 |  Scrolling through 5 pages triggers no Cloudflare 429 responses from card requests. |   |   |   |
|  12 |  Back, forward and reload keep filters, sort and scroll position. |   |   |   |
|  13 |  Collection views are recorded in Nosto as category pages. |   |   |   |
|  14 |  Editorial tiles from Nosto Onsite Content placements appear at their set position and span the set rows and columns. |   |   |   |
|  15 |  When filters leave no results, the toolbar and filter drawer stay, and the grid shows "Sorry, there are no products here." with a Reset button that clears the filters, like live. |   |  ✅ |   |
|  16 |  The Sort button and list match live in size and spacing; no option is marked active until a sort is chosen. |   |  ✅ |   |
|  17 |  The RS: Nosto collection section's padding, colour scheme and default card image settings apply when changed in the theme editor. |   |   |   |

### Recommendation carousels

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Recommendation carousels use the theme's layout and product card, matching the homepage Featured collection carousel and the PDP Product recommendations carousel (title, card size, spacing, arrows / scrolling) at 1440px and 390px. Placements to be confirmed (SOW: homepage, product page, 404, category pages, cart drawer). |   |   |   |
|  2 |  No recommendation carousel appears in the no-results states (autocomplete, search results page, collection filtered to zero), matching live. |   |  ✅ |   |
|  3 |  When a campaign returns no real products (empty, or Nosto's mock placeholders), the carousel section is hidden entirely: no heading, no padding, no empty space. |   |   |   |
|  4 |  Carousel card images load lazily at normal priority; carousels in the first three sections of a template load straight away, lower ones only when about one screen away. |   |  ✅ |   |
|  5 |  A carousel's appearance animates like native Broadcast sections. |   |   |   |
|  6 |  Carousels cause no measurable layout shift (CLS) as they fill, on the homepage, PDP and collection page at 1440px and 390px. |   |   |   |

## Nosto Admin Configurations:

|  **#** |  **Item** |  **Notes** |  **Status** |  **Assigned to** |
| --- | --- | --- | --- | --- |
|  1 |  Configure sort options. |   |  To do |   |
|  2 |  Configure filter order to match live: Product type, Price, Color, Size (Facet manager → pin / reorder). |   |  To do |   |
|  3 |  Group Size facet values to match live's Search & Discovery groups and order, e.g. "XS (0-2)" (Facet manager → Merge facet values). |  "XS (0-2)" merged as a test. |  In progress |   |
|  4 |  Decide whether the Nosto multi-currency app embed is needed. With it on, recommendations return mock products (no USD variation / exchange rates on the account); dynamic product cards already render the market's currency through Shopify (market availability assumed, not yet testable). Plan for this project: leave it disabled. |  Asked in the 2026-10-23 Nosto message. |  Waiting on Nosto |   |

## Dev Notes:

-  File paths below reflect a review at authoring time (2026-10-22). Confirm they still hold before implementing.

-  **Previewing Nosto code:** run `npm run nosto:dev` in the Nosto repo and open the store with `?nostodebug=true` and Preview on. Theme changes: `shopify theme dev` on the theme repo. Always pass `preview_theme_id` and confirm `window.Shopify.theme.id`.

-  **Mount points:** `snippets/rs-nosto-results.liquid` (search and collection; collection branch in `sections/collection.liquid`), `snippets/header-search-popdown.liquid` (dropdown). Settings reach Nosto as data attributes, read in `src/lib/themeSettings.ts`.

-  **Cards:** dynamic cards fetch the theme's own card HTML per product (`sections/api-nosto-product-card.liquid`, `-mini`); `src/shared/ProductCard.tsx`. Card `sizes` comes from the theme's card snippet; the theme's formula underestimates the rendered card width on both live and Nosto (303px vs 347px at 1440).

-  **Filters:** `src/shared/filters/` (drawer, terms facet, swatches, range facet, chips). Price (`RangeFacet.tsx`): slider from 0 to Nosto's max for the current results; unfiltered, `useRange` reports the results' own min/max, so an end counts as filtered only when it differs from them.

-  **Editorial tiles (planned):** dynamic Nosto placements with IDs prefixed `plp-grid`, found with `api.placements.getPlacements()`, injected with `api.placements.injectCampaigns()`; position and span from data attributes on the campaign HTML; placed by `src/lib/gridTiles.ts`.

## Implementation Notes:

-  TBD (post-execution)

## Testing Notes:

-  TBD (post-execution)

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  Can a Nosto Onsite Content campaign use a dynamic placement limited to one category (for per-collection tiles)? (Nosto)

-  Does live keep the clicked filter group open after a selection in a real browser? Playwright showed it collapsing.

-  When filters leave no results, Nosto returns only the facet doing the filtering (e.g. Price), so Color / Size / Product type disappear from the drawer until the filter is loosened; live keeps every group with zero-count values greyed out. Acceptable, or should the drawer keep the last facets it had?

-  Infinite scroll: Nosto records the pages loaded in the URL (`?p=4`), so reload and Back return with every loaded product; live's URL never changes and reload starts at the first 22. Keep Nosto's behaviour or match live?
