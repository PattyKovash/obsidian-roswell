## Background:

- Flagged during the SEO engagement (out of that scope, but noted). The **"Sort by" dropdown on collection pages does nothing** — selecting Price low-to-high, Alphabetical, Best selling, etc. never changes the product order. Confirmed on `https://aed4life.ca/collections/aed-units` and appears to affect all collection pages.
- This is a **UX/merchandising bug, not an SEO ranking issue**. It does not currently harm SEO (the page's products are fully server-rendered and crawlable on load), but customers cannot reorder products, which hurts findability and conversion.
- Why it happens: this template does not render one big product list. It renders products **grouped per vendor** (Complete Packages, ZOLL, Philips, Cardiac Science, Stryker, HeartSine, Defibtech, ACLS, Training), each group pulled in its own default order. The sort control was never wired to those grouped blocks.

## Necessary Info (Design/Documentation):

- Affected surface: collection pages using the grouped/vendor template (e.g. `/collections/aed-units`).
- **No new design required** — keep the current grouped layout and styling.
- Current state: the grid is built server-side and shows products in a fixed order. A partial AJAX sort mechanism already exists in the theme but points at the wrong target, so it never takes effect.
- **Assumption:** one sort control applies the chosen sort **within each vendor group** (e.g. "Price low-to-high" reorders products inside ZOLL, inside Philips, etc.). Groups stay in their current order; only products inside each group re-sort. Confirm in Clarifying Questions.

## Constraints / Scope:

- **IN scope:** make the existing "Sort by" control actually re-sort products within each vendor group, using the order Shopify returns (so every option — including Best selling — is correct).
- **OUT of scope:** changing the grouped layout into a single flat product list, or changing which groups appear / their order.
- **No-dev alternative (client decision):** if the client does not need sorting on these grouped pages, we can simply **hide the "Sort by" control** (~1 hr) instead of building the fix. Cheaper, but customers lose the ability to sort.
- **SEO guardrail:** the fix must keep the current server-rendered products on initial load and must **not** create new crawlable `?sort_by=` URLs (sort happens in-place without a page reload). This preserves current SEO health.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | On a grouped collection page (e.g. `/collections/aed-units`), selecting a "Sort by" option re-orders the products **inside each vendor group** to match the selected sort. | | | |
| 2 | "Price, low to high" and "Price, high to low" correctly order products by price within each group. | | | |
| 3 | Alphabetical (A–Z / Z–A) correctly orders products by title within each group. | | | |
| 4 | "Best selling" orders products by Shopify's best-selling order within each group (i.e. the order comes from Shopify, not computed in the theme). | | | |
| 5 | The vendor groups themselves stay in their current order and headings; only the products inside each group re-sort. | | | |
| 6 | Sorting happens in place with no full page reload and **without adding a crawlable `?sort_by=` URL** to the page. | | | |
| 7 | On first page load, products are still server-rendered and visible without JavaScript (no SEO/crawlability regression). | | | |
| 8 | The dropdown's selected label updates to the chosen option after sorting. | | | |
| 9 | No visual or layout regression: card markup, spacing, and group layout match current live. | | | |

### Root cause

- The visible grid is server-rendered by `snippets/collection-collects.liquid`, which loops each vendor sub-collection's products in default order and never reads `sort_by`:
  - `snippets/collection-collects.liquid` ~lines 26–33 (repeated at ~53–60, ~84–91):
    ```liquid
    <div class="grid_2 products" data-collection="{{ sub_sub_link.url }}">
      {% assign products = collection.products %}
      {% for product in products %}
        <div class="grid-item">
          {% render 'product-card', product: product, collection: collection, add_to_cart: true %}
        </div>
      {% endfor %}
    </div>
    ```
- The AJAX sort loop **already exists but is broken.** `assets/filters.js` → `SortingDropdown.ajaxSorting()` (~lines 713–756) already iterates every `.products[data-collection]` group and fetches that collection with `sort_by` via the Section Rendering API — the intended per-group approach. Two defects stop it working:
  1. **Hardcoded, template-instance-specific section id** at `assets/filters.js:717` — `var productsSectionId = "template--23544405492033__main-collection";` — won't resolve when fetching other vendor collections, so the swap returns nothing usable.
  2. **No dedicated section** that returns *just* the sorted grid matching the `grid_2 products` / `product-card` markup. `sections/main-collection.liquid` is close but carries its own wrapper + settings (`products_count: 9`, pagination) that don't match the grouped view.

### Option 3 — implementation plan (fetch Shopify-sorted payload per group)

Sorting must come from Shopify, not theme-side `| sort` (see Best-selling gotcha). Steps:

1. **Add a dedicated fetch-target section** `sections/collection-group-products.liquid` that renders **only** the inner grid for the current collection, reusing the exact card markup so output is pixel-identical. Shopify auto-sorts `collection.products` when `?sort_by=` is on the requested URL:
   ```liquid
   {% for product in collection.products %}
     <div class="grid-item">
       {% render 'product-card', product: product, collection: collection, add_to_cart: true %}
     </div>
   {% endfor %}
   {% schema %}{ "name": "Collection Group Products" }{% endschema %}
   ```
2. **Make the section reachable by the Section Rendering API for each vendor collection.** The API can only render a `section_id` that exists in the requested URL's template. The vendor sub-collections (zoll, philips, cardiac-science-aed-units, …) render via `templates/collection.json`, so add this section to that template's `sections`/`order` so `/collections/<vendor>?section_id=<id>` resolves. Keep it visually inert on normal page load (it is only used as a fetch target) — e.g. render nothing when the request isn't a section-render call, or hide its on-page output via the group markup it duplicates. **Validate on the live store which template each vendor collection actually uses** (assigned in Shopify admin, not in the repo) before finalizing — see Clarifying Questions.
3. **Replace the hardcoded id in `ajaxSorting()`** (`assets/filters.js` ~lines 713–756). Current:
   ```js
   var productsSectionId = "template--23544405492033__main-collection";
   // ...
   fetch(`${collection}?section_id=${productsSectionId}&${searchParams}`)
   ```
   Change to fetch the new section per group (`section_id=collection-group-products`, or the resolved JSON-template id from step 2). Keep the existing per-group `innerHTML` swap, dropdown-label update, lazyload re-init, and `updateURLState`/`updatePagination` calls (~lines 730–753) as-is. Confirm the swap targets each group's own `.products[data-collection]` container (the loop already does this).
4. **Leave the initial server render in `collection-collects.liquid` untouched** — products still render on load (satisfies AC #6/#7); only the sort *interaction* changes.
5. **Verify** each sort option (price asc/desc, A–Z, Z–A, best selling) reorders products inside every group, groups stay put, no reload, no new crawlable `?sort_by=` URL, and card layout matches live.

### Performance
- Each sort change fires one fetch **per vendor group** (~9 on `aed-units`). Keep the existing `forEach` fetch loop **concurrent** (do not convert to sequential/awaited requests); groups swap in independently as each response returns.
- Only fetch when the sort value actually changes; skip re-fetching if the selected option is unchanged.
- Show a lightweight loading state on each group while its swap is pending (each group returns its full product list, so the DOM re-render can be sizable on large groups).
- Deeper optimizations (caching sorted payloads, debouncing, lazy-fetching offscreen groups, per-group pagination) are **out of scope** unless QA surfaces real lag.

### Scope boundaries
- **MAY touch:** `assets/filters.js`; add `sections/collection-group-products.liquid`; add that section to the relevant collection template JSON(s).
- **MUST NOT:** restructure `snippets/collection-collects.liquid`'s grouping/layout, change which groups render, or re-sort products in Liquid.

### Gotchas
- **Best selling:** do NOT re-sort in Liquid with `| sort`. Best-selling order and tie-breaking only come out correct when Shopify returns the sorted list for the fetched collection URL — this is why the fetch approach is required.
- **Section Rendering API constraint:** a `section_id` only resolves if that section is part of the requested URL's template (step 2). This is the main thing to validate live; if a vendor collection uses a different template, the section must be added there too.
- **Unrelated bug seen nearby (separate ticket):** `assets/base.js:254` throws because `.search-dropdown-close` is never rendered in any template — breaks the search dropdown close button, not sorting. Log separately.

## Bugs from QA:

- TBD

## Clarifying Questions:

- Confirm the intended behavior: one "Sort by" that re-sorts **within each vendor group** (assumed), vs. flattening the page into a single sorted product list (larger change, out of current scope).
- Does the client actually want sorting on these grouped pages? If not, we can hide the control (~1 hr) instead of building the fix.
