## Background:

- On collection pages (PLP), shoppers scrolling quickly to load more products sometimes hit a **server error**, and sometimes the **loading spinner just spins forever** and no more products load. Once it breaks, infinite scroll stays broken for the rest of that visit — the shopper has to reload the page.

- This was reproduced and root-caused against the live theme. Two issues combine:
  - **Fast scrolling fires too many "load more" requests too quickly**, and **Shopify's bot protection** blocks them (HTTP 429 / a "Verifying your connection…" challenge page). This is the "server error," and once triggered it can gate the whole domain ("Can't open this page") for that visitor.
  - When that error comes back, the infinite-scroll library **doesn't recognize it as an error** and tries to read products out of the challenge page. That crashes the script, which is why the **spinner never stops** and loading is dead until reload.

- Business impact: shoppers can't browse past the first page of a collection, cutting off product discovery and sales on affected sessions.

## Necessary Info (Design/Documentation):

- **No new design required** — same look, layout, and spinner. This is a behavior/reliability fix only.

- **Affected surface:** collection pages only (`sections/collection.liquid`), when the theme setting **Infinite scroll** (`settings.enable_infinity_scroll`) is enabled. Blog, article, and search pages use standard numbered pagination and are **not** affected.

- **Current state:** infinite scroll is powered by a third-party library, `assets/ajaxinate.js` (Elkfox Ajaxinate), which is **minified and vendored**. It has a long-standing bug where its "did the request succeed?" check never actually works, and it has no error handling and no limit on how fast it fires requests.

- **Verified live** on preview theme `154680950921`: a burst of rapid page requests returned **HTTP 429 (Too Many Requests)**, and replaying the library's own logic against that error response threw a script crash (`Cannot read properties of undefined`) — matching both reported symptoms exactly.

## Constraints / Scope:

- **In scope:** collection-page infinite scroll reliability — minimize the request footprint that trips Shopify's protection, never crash on an error, and degrade to a manual control if a request fails.

- **Out of scope:** blog/article/search pagination (unaffected); any visual/design change; changing the number of products per page.

- **Infrastructure reality (not in our control):** the "Verifying your connection… / Can't open this page" screen is a **Cloudflare/Shopify platform bot-verification challenge**, triggered largely by **client IP reputation** and request rate — not by theme code. On a standard Shopify setup this is **not merchant-tunable**. Confirmed during QA: it fires far more often **on a VPN** (shared/flagged exit IPs) and much less off-VPN — i.e. the dominant trigger is the tester's network, and once a session is flagged, *every* request (even a single deliberate button tap) is challenged until the flag lifts. The theme reduces its footprint (section-only requests, serialized, cooldown-paced, gentle bounded retry) but cannot prevent a flagged-IP challenge. **Action items:** (1) notify the client this is expected Shopify behavior, worse on VPN / with scripted rapid-fire browsing — test at a human pace, off-VPN; (2) if it recurs for real shoppers on clean networks, escalate to Shopify support (theme can't raise the threshold).

- **Approach decision:** add a small in-house **web component** in a new file, `assets/rs-infinite-scroll.js`, and point the collection page at it instead of the vendored library. The vendor file `assets/ajaxinate.js` is **left untouched on disk** (not edited, not deleted) — it simply stops being loaded. It: (a) fetches via the **Section Rendering API** (`?section_id=…`) so each load is ~63% lighter than the old full-page fetch (matches Shopify's own Dawn/Horizon pattern); (b) keeps requests **serialized** with a preload margin; (c) on any failure **degrades to a manual "Load more" button** rather than auto-retrying — a deliberate tap avoids feeding Shopify's bot detector; (d) self-initializes on re-injection (filters/sort). Pagination markup and IDs (`#AjaxinateLoop`, `#AjaxinatePagination`) are **kept as-is** so no section redesign is needed.

- **Approach: mirror Shopify Horizon.** The component is a direct port of Horizon's `PaginatedList` pattern (`Shopify/horizon`: `assets/paginated-list.js` + `assets/section-renderer.js`), adapted to Broadcast's markup. Horizon is Shopify's flagship theme; on the same VPN where our earlier builds tripped the challenge, Horizon does not — because it makes fewer, idle-paced, de-duplicated requests and degrades silently. We copy that behaviour rather than invent our own recovery UX.

- **Alternatives considered (not chosen):** (1) patch the un-minified upstream Ajaxinate — heavy full-page fetch + burst behaviour; (2) auto-retry-with-backoff + "Load more" button (a prior revision of this ticket) — rejected after QA on VPN: the background retries and repeated failed button taps *added* requests to an already-flagged session and surfaced errors Horizon never shows, making it feel worse. Horizon's silent, idle-paced approach is the fix.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | On a collection with multiple pages, scrolling to the bottom keeps loading the next page of products, continuing all the way to the end. |  |  |  |
| 2 | Scrolling quickly does not produce a server error or a spinner that spins forever — products keep loading normally. |This is more reproducible on VPN and scrolling very rapidly (like a bot).

Per Shopify docs, VPN users can still encounter server bot-verification issues.

Fully supporting VPN is NOT in scope. However for testing purposes, it may be easier to replicate the issue if you can't replicate off of VPN.  |  |  |
| 3 | If a "load more" request fails, it degrades gracefully: the spinner stops (never frozen), products already loaded stay on screen, and loading resumes as the shopper keeps scrolling — the page never crashes. |  |  |  |
| 4 | Infinite scroll still works after applying a filter or changing the sort. |  |  |  |
| 5 | On the last page, loading stops cleanly — no spinner and no further requests. |  |  |  |
| 6 | No visual or layout regression: the product grid, spinner, and appended products match the current live styling, and quick-add and color swatches on appended products still work. |  |  |  |

## Dev Notes:

- **Files touched:**
  - `assets/rs-infinite-scroll.js` — **new file.** Web component (`customElements.define('rs-infinite-scroll', …)`) implementing the loader. See sketch below.
  - `assets/ajaxinate.js` — **leave untouched.** Vendor file stays on disk; it is simply no longer referenced. (Grep confirms `ajaxinate` is referenced only in `collection.liquid`, so the two edits below fully retire it with no orphan references.)
  - `sections/collection.liquid` — two edits only:
    - `~line 35`: `assign items_container_tag = 'ajaxinate-items'` → `'rs-infinite-scroll'`
    - `~line 355`: `<script src="{{ 'ajaxinate.js' | asset_url }}" defer>` → `<script src="{{ 'rs-infinite-scroll.js' | asset_url }}" defer>`
    - Pagination markup, `#AjaxinatePagination`, `data-ajaxinate-id`, and `id="AjaxinateLoop"` are **unchanged**. No `locales/` or `pagination.css` changes needed — Horizon's silent degradation uses no extra copy or styling.

- **Root cause — the broken success check** (current `ajaxinate.js`, inside `loadMore()`):

  ```js
  // parses as (4 === !readyState) || (200 === !status) — both sides are always false,
  // so it NEVER returns early: error responses fall straight into the success path.
  if (4 === !this.request.readyState || 200 === !this.request.status) return;
  ```
  Confirmed live: this evaluates to `false` for HTTP 200, 429, 430, and 500 alike. On a 429 the code then does `container.innerHTML` where `container` is `undefined` (the error page has no `#AjaxinateLoop`) → `TypeError` → spinner never reset, listeners never re-armed.

- **Why fast scroll causes the 429:** the library chains a fresh full-page `GET ?page=N` for each pagination element that scrolls into view, with **no throttle, no in-flight lock, and no preload margin**. Live test: 90 rapid requests → 60 returned **HTTP 429** with a "Verifying your connection…" challenge page (no product grid in it).

- **Implementation — a port of Horizon's `PaginatedList`** (`Shopify/horizon`: `assets/paginated-list.js` + `assets/section-renderer.js`) to Broadcast's markup. The custom element **is** the product-grid container (rendered via `items_container_tag`), carrying `id="AjaxinateLoop"` and `data-ajaxinate-id`. It self-initializes on `connectedCallback` (so filter/sort re-injection re-arms it) and tears down on `disconnectedCallback`. Behaviour mirrored from Horizon:
  1. **Section Rendering API fetch** (`sectionUrl()` → `?…&section_id={data-ajaxinate-id}` + `searchParams.sort()` for a stable cache key). Bare `fetch` — same as Horizon; verified live 1609KB→599KB (−63%).
  2. **Prefetch one page ahead + cache + in-flight dedupe:** `fetchSection()` caches by URL (`this.cache`) and shares in-flight promises (`this.pending`) so a page is never fetched twice; `prefetch()` warms the next page inside `requestIdleCallback` (with a `setTimeout` fallback). This is the key cadence difference that keeps request volume Horizon-low.
  3. **`IntersectionObserver({rootMargin:'300px'})`, observed continuously** (no unobserve/re-observe). An in-flight lock (`this.loading`) serializes renders. Because we don't re-observe, a failure can't self-trigger a tight retry loop — the next attempt only happens on a genuine new intersection (the shopper scrolling to the sentinel again).
  4. **`history.pushState`** updates `?page=N` as pages render (SEO + back button), matching Horizon.
  5. **Silent degradation:** a response with no `#AjaxinateLoop` (challenge/error) throws before any DOM mutation; the catch just deletes the bad cache entry — no banner, no button, no background retry. The spinner shows only while a fetch is in flight (`setSpinner`), so it never spins forever. `observer.disconnect()` on the last page (no next `<a>`).

- **Why silent, not the earlier button + auto-retry:** QA on VPN showed the button build made it *worse* — the background retries and repeated failed taps added requests to a Cloudflare-flagged session and surfaced errors Horizon never shows. Horizon (which does not trip the challenge on the same VPN) degrades silently and paces requests via idle prefetch; we copy that exactly.

- **Keep consistent with the theme:** appended products rely on **event delegation + native `loading="lazy"`** (no per-item re-init needed) — we append `#AjaxinateLoop`'s children directly, same as before.

- **Filter/sort interaction:** `assets/collection-filters-form.js` replaces the whole `[data-products-grid]`, re-creating `<rs-infinite-scroll>` and re-firing `connectedCallback` with a fresh cache — infinite scroll re-arms automatically (covers AC #6).

- **Manual QA repro (failure/challenge state):** in the console, monkeypatch `window.fetch` to return `new Response('<html></html>', {status:429})` for URLs containing `section_id=`, then scroll — the component must NOT crash, NOT show an error/button, NOT retry in the background; products already loaded stay. Restore `fetch`, scroll to the sentinel again, and confirm the next page loads (silent scroll-to-retry).

## Implementation Notes:

*(post-execution)*

- **Root cause turned out to be two issues, and the bigger one was NOT infinite scroll.** Live A/B against Shopify's Horizon theme (which doesn't trip the challenge on the same VPN/IP) proved the challenge is driven by **request volume**: Broadcast's core `<grid-swatch>` fetches `/products/{handle}.js` per product card (~198 for 220 products) just to gate a color-option check whose data Liquid already renders. Infinite scroll only multiplied it. Blocking those per-card fetches made our theme behave like Horizon.
- **Two fixes shipped, each behind a toggle:**
  1. **Infinite-scroll loader** — `assets/rs-infinite-scroll.js` (new web component) replaces vendored Ajaxinate. Section Rendering API, one request/page, cache + dedupe, prefetch-ahead (idle), `pushState`, throttled-scroll trigger, silent degradation, no retry. `sections/collection.liquid`: element tag `ajaxinate-items`→`rs-infinite-scroll` + script swap. `assets/ajaxinate.js` retired on disk (unreferenced). Gated by existing `enable_infinity_scroll`.
  2. **Swatch fetch** — `assets/grid-swatch-static.js` (new): drop-in mirroring core `grid-swatch` init/hover/image-swap minus the fetch. `snippets/product-grid-item.liquid` renders it via a `grid_swatch_tag` variable when new setting **`disable_swatch_fetch`** (Swatches group, default **on**) is set; loaded in `snippets/head.liquid`. **Theme-wide** (all `product-grid-item` surfaces). Toggle off = revert to core.
- **Safety verified:** nothing reads grid-swatch's fetched data; quick-add (`?section_id=api-product-upsell`) and siblings (Liquid `data-*`) are independent. Store models colors mostly as **separate products per color** via custom `custom.available_colors` metafield → those fell through to the fetching `grid-swatch` branch, so static is a pure win (and more correct — core skips `init()` on single-color products). Current live `collection_swatch_style: "text"` shows only a color count, so no visible change.
- **Verified live** on dev theme `154203979913`: zero per-card fetches, loads 10+ pages, no 429 — matches Horizon's request profile.
- **Platform ceiling (out of scope, flagged):** the Cloudflare challenge is not merchant-tunable on standard Shopify and is worse on VPN (Shopify staff 2026-06-30: no complete VPN fix). Team notified; persistent off-VPN cases → Shopify support.
- **Follow-up ticket candidate:** the swatch-fetch fix is PLP-wide Broadcast behavior distinct from infinite scroll — consider tracking it separately for QA/PM clarity.

## Bugs from QA:

- TBD

## Clarifying Questions:

- None blocking. The vendor file `assets/ajaxinate.js` is intentionally left on disk but unreferenced; a future cleanup ticket can remove it once the new component is confirmed stable in production.
