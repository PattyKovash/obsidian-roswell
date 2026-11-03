# Nosto Implementation Estimate — Elie Tahari TAHARI_2026

**Date:** 2026-07
**Repo:** `roswell-studios/Elie_Tahari_TAHARI_2026` (branch `nosto`)
**Scope:** Personalized Search, Category Merchandising, Product Recommendations, Onsite Content Personalization

---

## Breakdown

| # | Task | Subtasks | Raw | AI |
|:--|:--|:--|--:|--:|
| 1 | **Foundation** | • App install, account connect, app embed<br>• Catalog sync verification, metafield exposure<br>• Index exclusions — `hide` tag, `swap-protect`<br>• Colour audit vs. `swatches.css`<br>• Page-type spot-check | 5 | 4 |
| 2 | **Starter setup** | • Clone, `npm install`, `.env`<br>• CLI auth + API key for CI<br>• `src/config.tsx` injection selectors<br>• Link theme CSS into local dev harness<br>• Build + artifact upload pipeline | 5 | 4 |
| 3 | **Product card section** | • `nosto-product-card.liquid` (settings frozen)<br>• CSS delivery into Nosto templates<br>• Custom element verification — swatches, hover images, sibling swap, **quick add**, tooltips<br>• Skeleton/placeholder + `lazy` config | 7 | 5 |
| 4 | **SERP** | • Layout, injection, results count<br>• Facet components — accordions, zero-count, show-more, active counts<br>• Colour swatch facet<br>• Price range facet + money-format parsing<br>• Sort<br>• Pagination / infinite scroll<br>• No-results state<br>• Degradation when facets unavailable | 16 | 12 |
| 5 | **Autocomplete** | • Replace `header-search-popdown` / `predictive-search`<br>• Dropdown layout + DynamicCard results<br>• Query suggestions / keyword results<br>• Keyboard nav + accessibility<br>• Mobile behaviour | 9 | 7 |
| 6 | **Category Merchandising** | • Injection into `collection.liquid`<br>• Editorial tile JSON + splice by position<br>• Loading overlay + swap over existing Liquid grid<br>*Default collection template only* | 7 | 5 |
| 7 | **Recommendations** | • Placements — home, PDP, 404, category, ex-complementary<br>• Velocity templates + DynamicCard + `<grid-slider>`<br>• Slider re-init on async card load<br>• Cart drawer placement + cart-event re-render | 6 | 5 |
| 8 | **Onsite Content Personalization** | • Placements for content slots<br>• Responsive QA<br>Roswell drops in placements only. The client and Nosto author and style all OCP content. No Velocity template or styling work on our side. If that changes, add ~3 hrs. | 3 | 2 |
| 9 | **Tracking + consent** | • Consent-gated tracking — Nosto Do Not Track wired to Consentmo<br>• GSF payload correction on Nosto pages<br>• Nosto click + cart attribution<br>• Dedupe QA vs. GTM / Stape / Criteo | 6 | 5 |
| 10 | **Cross-market QA** | • Price correctness — displayed vs. Nosto index<br>• Money-format parsing<br>• Catalog availability per market<br>• Surface sweep | 5 | 5 |
| 11 | **QA / UAT** | • Breakpoint QA<br>• Template variant QA<br>• Cross-browser<br>• UAT cycles 1 & 2 + fixes | 16 | 14 |
| 12 | **MP + coordination** | • Sprint / ticket management<br>• Nosto coordination<br>• Client demos and reviews<br>• Documentation | 8 | 8 |
| 13 | **Model/Product switcher** | • Verify MutationObserver picks up injected cards<br>• Ghost image markup + QA | 2 | 2 |
| | **TOTAL** | | **95** | **77** |

| Phase | Scope | Raw | AI |
|:--|:--|--:|--:|
| **1 — Search** | Lines 1–5 + share of 9–12 | 62 | **50** |
| **2 — Merch, Recs, OCP** | Lines 6–8, 13 + remaining 9–12 | 33 | **27** |

> **Category pages reuse the search app.** The starter renders category pages through the same components as search — you pass `categoryQuery` and `isCategoryPage` to `init()`, and defaults for both are provided. Facets, sort and pagination are built once in line 4 and carry over with no additional wiring.

> **IN SCOPE — default collection template only.** `templates/collection.json` is the only collection template covered. **Out of scope:** `collection.stylist-template.json`, the `subcollections` section (separate section, links only — unaffected by injection), and `page.collection-lp-rs-design.json`.

> **Consent approach — decided.** Nosto loads for all users; tracking is gated on consent via Nosto's **Do Not Track** mode (each request treated as a fresh session and discarded; recommendations degrade to generic trend-based). Consentmo is the only consent system in use — `gcm-integration-script.liquid` already reads the accepted set from `gdprCache` in localStorage, so the wiring is mechanical.
>
> **Needed before build:** which Consentmo category gates Nosto — marketing, analytics, or functionality. Suggest functionality (personalization, not advertising), but it's a privacy-owner call.
>
> **Two states to build and test:**
> - *Granted* — full tracking, personalized search and recommendations.
> - *Denied* — DNT: no `2c.cId` persistence, no behavioural profile writes, each request a fresh session. Nosto still returns results, but generic trend-based; search ranking is relevance-only.
> - *Granted mid-session* — decide whether tracking activates immediately or on next page load. Next-page-load is simpler and usually acceptable.
>
> Tahari serves Europe, so the denied state is a real share of traffic and needs QA as a first-class state, not a spot-check.

> **OCP scope (line 8):** Roswell supplies placements only. All OCP content is authored **and styled** by the client and Nosto — no template or styling work on our side. If that changes, add ~3 hrs.

> **Shopify Markets:** Tahari runs multiple Shopify Markets. Nosto creates a **separate account per market**, each indexed in that market's own currency and prices. Templates are shared across accounts via linking (arranged through Nosto support), so build work does **not** multiply per market. No locale or URL structure per market — market context travels by cookie, single language. Line 10 covers QA on a sampled subset of markets, not all.

> **Starter ships:** Vite, TypeScript, ESLint/Prettier/Stylelint, Playwright, Storybook, `nosto.config.ts`, three entry modes (Injected/Native/Mocked), and a component library — Facets, Pagination, Product listings, BottomToolbar, Loading/No-results. Lines 2, 4 and 5 assume these are configured and styled, not built. Starter is **Beta** (launched Q4 2025) — expect some API churn. Node: docs say 24+, repo README says 22+.

---

## Summary

| | Raw | AI-adjusted |
|---|---:|---:|
| **Full scope (4 modules)** | **95** | **77** |
| Phase 1 — Search | 62 | 50 |
| Phase 2 — Merch, Recs, OCP | 33 | 27 |

Historical comparable (no AI, no DynamicCard): 110–130h.

---

## Estimate trajectory

| Point | AI-adj | What changed |
|---|---:|---|
| Initial (pre-research) | 125–150 | Assumed JSX card rebuild |
| After DynamicCard re-cut | 89 | Card rebuild eliminated |
| Low point | 86 | Recs reduced, slider parity via theme's own `<grid-slider>` |
| S&D replacement decision | 88 | +1 no-facet degradation, +1 arithmetic correction in line 7 |
| SSR simplified | 87 | Overlay-and-swap over existing Liquid grid |
| Scope refinements | 85 | Foundation −2 (page types a non-issue, metafields easy to expose) |
| Starter reviewed | 83 | Starter ships far more than assumed |
| OCP scoped down | 80 | Roswell places only — no authoring or styling |
| Collection scope narrowed | 79 | Default template only; subcollections out |
| **Current** | **77** | Category facet/sort/pagination removed — reuses search app via `init()` config |

Net movement since the re-cut: **−12**.

---

## Full breakdown

### 1. Foundation — 5 raw / 4 adj

| Subtask | Hrs |
|---|---:|
| App install, account connect, merchant ID (`shopify-<storeid>`) | 1.0 |
| App embed enablement; verify Nosto script loads alongside deferred scripts in `head.liquid` | 0.5 |
| Catalog sync verification — metafield exposure, `hide`-tag + `swap-protect` exclusions verified (no blank cards) | 1.5 |
| Color value audit vs. the 130 vars in `assets/swatches.css` | 1.0 |
| Page-type spot-check | 0.5 |
| Handoff/buffer with Nosto onboarding manager | 0.5 |

**Page types are a non-issue.** Nosto reads Shopify's page type, not the template suffix — `product.earrings`, `product.necklaces`, `product.holuna-necklaces`, `product.editoral` all report as product; `collection.stylist-template` reports as collection. Only `page.*` templates are "other," which is correct.

**Critical item:** `hide`-tagged products must be excluded at index level. `product-grid-item.liquid:669-672` renders *nothing* for them — under Nosto that produces a blank grid cell rather than a suppressed card.

**Note:** sibling color metafield has six spelling variants in the fallback chain (`product-grid-item.liquid:373`). Any facet or filter built on it needs normalization or all six indexed.

---

### 2. Search Templates Starter setup — 5 raw / 4 adj

| Subtask | Hrs |
|---|---:|
| Clone, `npm install`, `.env` with `VITE_MERCHANT_ID` | 0.5 |
| `nosto login` / `nosto setup -m` / `.nosto.json` / scoped API key for CI | 0.5 |
| `src/config.tsx` injection selectors | 1.5 |
| Link theme CSS into local dev harness | 1.5 |
| Build + artifact upload pipeline | 1.0 |

**The starter ships almost everything.** Vite, TypeScript, ESLint/Prettier/Stylelint, Playwright, Storybook, `nosto.config.ts`, three entry modes, and a component library (Facets, Pagination, Product listings, BottomToolbar, Loading/No-results). This line is configuration, not scaffolding.

**Beta.** Launched Q4 2025, still in Beta — expect API churn. Node version discrepancy: docs say 24+, repo README says 22+.

**Hard constraint:** injection target must sit inside `<collection-component>` and `[data-products-grid]`, because `collection-model-switcher.js` resolves its scope via `this.closest('collection-component')`.

**Workflow constraint:** Nosto CLI does **not** support production deployments. Build and upload can be automated; releases are created in the Admin UI. Manual gate by design.

---

### 3. `sections/nosto-product-card.liquid` — 7 raw / 5 adj

| Subtask | Hrs |
|---|---:|
| Create section wrapping `product-grid-item`, section settings frozen | 2.0 |
| CSS delivery — theme stylesheets into Nosto templates (starter ships none) | 2.0 |
| Custom element upgrade verification + fixes | 2.0 |
| Skeleton/placeholder markup + `lazy` configuration | 1.0 |

**Head start:** `sections/api-product-grid-item.liquid` already exists as a Section Rendering endpoint wrapping the same snippet. The Nosto section is a near-copy.

**Elements that must upgrade on injected HTML:** `grid-item`, `grid-swatch`, `product-item-siblings`, `tooltip-component`, `native-scrollbar`, `hover-images`, `quick-add-product`.

**Frozen settings trade-off:** hard-coding `grid: 4` / `grid_mobile: "2"` affects only the `sizes` attribute math (`product-grid-item.liquid:94-137`). Column layout still comes from `--COLUMNS` and updates live. Later theme-editor changes degrade image resolution, not layout. Needs a code comment + CLAUDE.md entry.

---

### 4. SERP — 16 raw / 12 adj

| Subtask | Hrs |
|---|---:|
| Layout, injection, results count | 2.0 |
| Facet components — collapsible accordions, zero-count hide/disable, show-more-after-10, active counts | 5.0 |
| Color swatch facet (map facet values to `swatches.css` vars) | 2.0 |
| Price range facet + money-format parsing (4 separator conventions) | 2.0 |
| Sort | 1.0 |
| Pagination / infinite scroll | 2.0 |
| No-results state | 1.0 |
| Graceful degradation when facets unavailable | 1.0 |

**Parity target** is `snippets/filters.liquid` (344 lines): `<collapsible-elements>` accordions, `filter-group--hidden` for all-zero groups (`:90-92`), `link--disable` per value (`:139-155`), show-more past index 10 (`:219-226`), active-count chips (`:119-121`), `<range-slider>` with `data-se-*` and four money-format branches (`:229-266`).

**Swatch facets are custom.** Nosto terms facets return `{ value, count, selected }` only — no hex, no image. The theme's existing convention (`swatch-{{handle}}` + `--swatch: var(--{{handle}})`, `product-grid-item.liquid:382-386`) plus the 130-var map in `swatches.css` is the mapping source.

---

### 5. Autocomplete — 9 raw / 7 adj

| Subtask | Hrs |
|---|---:|
| Replace `header-search-popdown` / `sections/predictive-search.liquid` | 3.0 |
| Dropdown layout + DynamicCard results | 2.0 |
| Query suggestions / keyword results | 2.0 |
| Keyboard navigation + accessibility | 1.0 |
| Mobile behavior | 1.0 |

---

### 6. Category Merchandising — 7 raw / 5 adj

| Subtask | Hrs |
|---|---:|
| Injection into `sections/collection.liquid` inside `<collection-component>` | 2.0 |
| Editorial tile JSON emit + splice by position | 3.0 |
| Loading overlay + swap over the existing Liquid grid | 2.0 |

**Scope: default `templates/collection.json` only.** `collection.stylist-template.json` and `page.collection-lp-rs-design.json` are out of scope. The `subcollections` section is a separate section rendering links above the grid — unaffected by injection, not in scope.

**No facet/sort/pagination work here.** The starter renders category pages through the same app as search: pass `categoryQuery` and `isCategoryPage` to `init()`, defaults provided for both. Those components are built once in line 4 and carry over.

**SSR approach:** the Liquid grid renders server-side as it does today — nothing is removed or rebuilt. A loading state overlays it, Nosto swaps the contents underneath. Server-rendered content is preserved for crawlers for free. Work is the overlay timing, the swap mechanism, and not double-rendering editorial tiles (present in both grids).

**Editorial tiles:** emit *pre-rendered HTML*, not structured data — avoids reimplementing `collection-featured-image.liquid` in JSX.

```liquid
{%- if paginate.current_page == 1 and section.blocks.size > 0 -%}
  {%- capture editorial_tiles -%}
    [
      {%- for block in section.blocks -%}
        {%- capture tile_html -%}
          {%- render 'collection-featured-image', block: block -%}
        {%- endcapture -%}
        { "position": {{ block.settings.position }}, "html": {{ tile_html | json }} }
        {%- unless forloop.last -%},{%- endunless -%}
      {%- endfor -%}
    ]
  {%- endcapture -%}
  <script type="application/json" id="nosto-editorial-tiles">{{- editorial_tiles -}}</script>
{%- endif -%}
```

Merchant continues editing blocks in the Shopify theme editor. Position semantics stay "Nth slot, first result batch only" (matches `collection.liquid:91`).

**Not at risk:** the `collection-image-with-title` banner (separate section) and `collection.stylist-template.json` (identical structure — one selector covers both). Breadcrumbs don't appear on collection pages.

**SEO:** keep the Liquid grid server-rendering and have Nosto swap it post-hydrate. `snippets/pagination.liquid` otherwise removes the crawl path to pages 2..N. `microdata-schema.liquid` is unaffected (Product/BlogPosting/BreadcrumbList — none grid-dependent).

---

### 7. Recommendations — 6 raw / 5 adj

| Subtask | Hrs |
|---|---:|
| Placements — home, PDP, 404, category, former complementary slots | 1.0 |
| Velocity templates with `<nosto-dynamic-card>` + `<grid-slider>` wrapper | 2.0 |
| Slider re-initialization on async card load | 1.0 |
| Cart drawer placement + `theme:cart:refresh` / `theme:cart:ready` re-render | 2.0 |

**Scope:** Roswell builds the rendering surface. Campaign content and configuration is client + Nosto.

**Carousel:** do *not* use Nosto's Swiper-based starting point. The theme has no Swiper — `vendor.js` carries Flickity only, and `<grid-slider>` (`theme.dev.js:3406`) is native scroll-snap. Emit the theme's own markup and let it upgrade:

```
<grid-slider align-arrows>
  <div class="grid grid--slider" data-grid-slider>
    #foreach($product in $products)
      <nosto-dynamic-card handle="$!product.handle" section="nosto-product-card">
    #end
  </div>
</grid-slider>
```

`GridSlider.init()` queries `[data-grid-slider]` and `[data-grid-item]`; the card already emits `data-grid-item` at `product-grid-item.liquid:684-690`.

**Housekeeping:** remove the now-dead complementary block schema settings in `product.liquid:2310` and `section-featured-product.liquid:1958`.

---

### 8. Onsite Content Personalization — 3 raw / 2 adj

| Subtask | Hrs |
|---|---:|
| Placements for content slots | 2.0 |
| Responsive QA | 1.0 |

**Scope — confirmed:** Roswell drops in placements only. The client and Nosto author **and** style all OCP content. No Velocity template or styling work on our side. If that changes, add ~3 hrs.

---

### 9. Tracking + consent coexistence — 6 raw / 5 adj

| Subtask | Hrs |
|---|---:|
| Consentmo → Nosto gating decision + implementation | 2.0 |
| GSF payload correction on Nosto-controlled pages | 2.0 |
| Nosto click + cart attribution wiring | 1.5 |
| Dedupe QA vs. GTM / Stape server-side / Criteo | 0.5 |

**Consent:** `gcm-integration-script.liquid` sets `initialState: 7` (all denied) but only feeds `gtag()`. Criteo, Clarity, Curalate, and ShopMy currently load regardless. Decision needed on whether Nosto follows that pattern or is gated behind `functionality_storage` / `personalization_storage`.

**Blocker:** two GDPR apps are embedded simultaneously — `consentmo-gdpr` and `ultimate-gdpr-eu-cookie-banner`. Only Consentmo is wired into the GCM script. This must be resolved before the gating decision.

**Impression payloads:** `gsf-conversion-pixels.liquid` builds `view_item_list` from `collection.products limit:4` and `view_search_results` from `search.results limit:5` — server-side. Once Nosto renders those grids, the payloads describe products never displayed. Owner is `simprosys-google-shopping-feed`.

**Server-side GTM:** `stape-conversion-tracking` is embedded. Double-count checks needed on both browser and server containers. Best guess +1–2h if the Stape container config is complex.

---

### 10. Cross-market QA (sampled markets) — 5 raw / 5 adj

| Subtask | Hrs |
|---|---:|
| Price correctness — displayed vs. Nosto's internal index | 2.0 |
| Money-format parsing across separator conventions | 1.0 |
| Catalog availability per market | 1.5 |
| Surface sweep (SERP, category, autocomplete, recs) | 0.5 |

**No locale or URL structure per market** (confirmed) — market context travels by cookie on same-origin requests, so the DynamicCard fetch inherits it without URL construction. Single language.

**Sampling guidance:** choose markets that differ structurally, not by revenue. Code-level issues surface anywhere; data-level issues (catalog availability, price divergence) only surface in the affected market.

---

### 11. QA / UAT / fixes — 16 raw / 14 adj

| Subtask | Hrs |
|---|---:|
| Breakpoint QA across all surfaces | 5.0 |
| Template variant QA | 3.0 |
| Cross-browser | 2.0 |
| UAT cycle 1 + fixes | 3.0 |
| UAT cycle 2 + fixes | 3.0 |

---

### 12. MP + coordination — 8 raw / 8 adj

| Subtask | Hrs |
|---|---:|
| Sprint / ticket management | 3.0 |
| Nosto coordination calls | 2.0 |
| Client demos and reviews | 2.0 |
| Documentation — CLAUDE.md, vault patterns doc | 1.0 |

---

### 13. Model/Product switcher — 2 raw / 2 adj

| Subtask | Hrs |
|---|---:|
| Verify MutationObserver picks up injected cards | 1.0 |
| Ghost image markup in Nosto card section + QA | 1.0 |

`collection-model-switcher.js` already observes `[data-products-grid]` via MutationObserver with `subtree: true` and re-applies ghost mode to new `[data-has-ghost]:not([data-ghost-swapped])` cards. Built for ajaxinate; should cover Nosto injection.

**Scope question:** category pages only, or also the Nosto SERP? `sections/search.liquid` does not render the switcher today. Adding it: +1.5h.

---

## Phasing

| Phase | Lines | Raw | AI-adj |
|---|---|---:|---:|
| **1 — Search** | 1–5 + allocated share of 9–12 | 62 | **50** |
| **2 — Merch, Recs, OCP** | 6–8, 13 + remaining share of 9–12 | 33 | **27** |

---

## Key architectural decision: DynamicCard

One `sections/nosto-product-card.liquid` serves every surface. Card-building hours live **only in line 3**. Lines 4–8 contain zero card work.

| Surface | Reuses card | Builds separately |
|---|---|---|
| SERP | yes | facets, sort, pagination, no-results |
| Autocomplete | yes | dropdown, suggestions, keyboard nav |
| Category | yes | injection, editorial tiles, SSR fallback |
| Recommendations | yes | Velocity template, carousel, cart re-render |

**Two template languages.** Search, autocomplete, and category use **Preact/TSX** in the Search Templates Starter. Recommendations, OCP, and Pop-Ups use **Velocity** in the Nosto admin UI, injected via Nosto's client script.

**Why this matters:** rebuilding `product-grid-item.liquid` (893 lines) in JSX was almost certainly the largest line in the historical 110–130h build. DynamicCard eliminates it.

---

## Implementation method — decided

Two separate decisions, because Nosto splits campaigns and search into different systems.

### Campaigns (Recommendations, Bundles, OCP) → **Automatic Injection (autoloading)**

Options per [Implement PSN](https://docs.nosto.com/techdocs/implementing-nosto/implement-psn):

| Method | SPA-safe | A/B testing | Notes |
|---|---|---|---|
| **Autoloading** ← chosen | No | Yes | Velocity templates injected by Nosto client script; **attribution automatic** |
| JS API `createRecommendationRequest()` | No | Yes | Manual request; HTML or JSON response mode |
| Session API `defaultSession()` | Yes | Yes | For SPA/headless; Nosto will *not* inject HTML for you |
| GraphQL `updateSession()` | Yes | No | No OCP, no dynamic filtering, manual attribution |

**Rationale:** conventional server-rendered Liquid theme, full page loads on navigation — the documented fit for autoloading. Fastest deploy, placements are Theme App Extension blocks, and attribution is handled automatically (work otherwise landing in line 9).

**Exception — cart drawer.** The drawer re-renders client-side on `theme:cart:refresh` / `theme:cart:ready` with no page load. Autoloading likely won't re-inject there. Expect to use `createRecommendationRequest()` for that one placement, bound to those events. This is the 2h in line 7.

### Search / Autocomplete / Category → **Injected mode**

Starter offers Injected / Native / Mocked. Injected renders via React Portals into CSS-selector targets in `src/config.tsx`. Native assumes building the store shell from scratch — not applicable. Mocked is Storybook only.

**Critical selector constraint:** injection target must sit inside `<collection-component>` **and** `[data-products-grid]`, because `collection-model-switcher.js` resolves scope via `this.closest('collection-component')`. Wrong selectors mean components don't render at all.

**`fallback: true`** — a failed search request disables Nosto for 10 minutes and restores the content it overrode. Works out of the box only when Nosto and native paths match; they do here (`/search`, `/collections/*`). Note this restores the Liquid grid but *not* filters (S&D is gone), so the line 4 degradation item still applies as a complement.

**Autocomplete collision handling:**
- `fromCssSelector` — supply the containing form's selector to unbind it and its elements from existing events. This is how you stop the theme's `header-search-form` / `main-search` custom elements fighting Nosto.
- `dropdownCssSelector` — overrides default sibling placement; mounts the dropdown as last child of the named element.

---

## Assumptions

1. DynamicCard used on every surface — no JSX card rebuild. Card built once (line 3), reused by SERP, category, and recommendations.
2. Section settings frozen at current `collection.json` values.
3. Sibling colour duplication preserved as-is — parity with today's native search, no dedup work.
4. **Default `templates/collection.json` only.** Stylist template, subcollections, and the collection LP page are out.
5. Editorial tiles injected as pre-rendered HTML, not reimplemented in Preact.
6. Existing Liquid grid stays server-rendered; a loading overlay covers it and Nosto swaps underneath. Nothing removed or rebuilt.
7. Category pages reuse the search app via `categoryQuery` / `isCategoryPage` config — no separate facet, sort, or pagination build.
8. Nosto owns dashboard/backend config — facet indexing, merchandising rules, campaign setup, onboarding.
9. Filter UI targets visual parity with `filters.liquid`. Accepting Nosto defaults saves 4–6h.
10. **Recommendations:** Roswell builds rendering surfaces; client + Nosto drive campaign content.
11. **OCP:** Roswell supplies placements only. Client + Nosto author *and* style all content.
12. Consent: Nosto loads for all users; tracking gated via Do Not Track wired to Consentmo (the only consent system in use).
13. Cross-market QA on a sampled subset, not all markets.
14. All required metafields can be made storefront-accessible (confirmed by client).
15. Nosto's Search Templates Starter is configured and styled, not built — it ships the component library.

---

## Excluded

- **`collection.stylist-template.json`**, the `subcollections` section, and `page.collection-lp-rs-design.json`
- **OCP content authoring *and* styling** — client + Nosto
- **Recommendation campaign content and configuration** — client + Nosto
- Sibling/colour dedup or grouping (optional improvement, 12–24h)
- Nosto dashboard configuration and merchandising rule authoring
- Design work — assumes Figma settled before build
- Post-launch optimization, A/B testing, merchandising tuning
- Cleanup of dead filter code (`filters.liquid`, `collection-filters-sidebar.liquid`, `collection-filters-form.js`, `range-slider.js`)
- Removal of the leftover `ultimate-gdpr-eu-cookie-banner` app embed

---

## Confirmed facts

**DynamicCard API** — [TypeDoc](https://nosto.github.io/web-components/classes/DynamicCard.html), [Web Components](https://docs.nosto.com/techdocs/apis/frontend/oss/web-components)

| Attribute | Type | Default |
|---|---|---|
| `handle` | string | required |
| `section` | string | conditional — recommended |
| `template` | string | conditional — **deprecated** |
| `variant-id` | string | — |
| `lazy` | boolean | `false` |
| `mock` | boolean | `false` |
| `placeholder` | boolean | `false` |

Extends `ReactiveElement`. Shopify only. Web Components must be enabled in Nosto Recommendation Settings. Compatible with Product Recommendations, Dynamic Bundles, Personalized Search, and Category Merchandising. CSS not included in the starter.

**Template languages** — [Template customization](https://docs.nosto.com/techdocs/implementing-nosto/template-customization): "Product Recommendations, Onsite Content Personalization, and Pop-Ups all use Velocity based templates which are injected into the page via Nosto's client script." Search Templates are a separate implementation.

**Tooling** — [Getting Started](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/using-search-templates-starter/getting-started), [Nosto CLI](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/deployment-and-testing/nosto-cli): Node 24+, `npm ci`, `.env` `VITE_MERCHANT_ID`, `src/config.ts`, `nosto login` → `nosto setup -m` → `.nosto.json` → `nosto st dev` / `st push`. CLI does not support production deployments.

**Markets** — [Shopify Markets](https://docs.nosto.com/shopify/shopify-markets): separate Nosto account per market, each indexed in that market's currency and prices, respecting Shopify exchange rates and rounding. Full Product Sync up to ~2h. Documented failure mode: Global-e or Markets Pro setting prices. Tags and ProductTypes cannot be translated.

**Multi-market templates:** one template instance can be shared across multiple accounts via linking, arranged through Nosto support. Runtime branching by `location.hostname` or `document.documentElement.lang`. Template work does not multiply per market.

**Facets** — [Search page](https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-code-editor/implementing-search-page): types `terms` and `stats` only. Terms values carry `{ value, count, selected }`. Configured in the Nosto dashboard. Default 100 values per facet, overridable via `customFacets`. Sorting by explicit field disables merchandising rules.

**Catalog:** all Shopify product tags map to `tags1`. Product metadata sent to Nosto cannot be customized on Shopify; metafields must be storefront-accessible.

**Search & Discovery removal:** S&D populates `collection.filters` — without it that object is empty and `filters.liquid` renders nothing. `intent=complementary` requires S&D curation; `intent=related` does not (Shopify auto-generates).

---

## Unconfirmed — best guesses

| # | Item | Best guess | Downside |
|---|---|---|---|
| ① | Theme custom elements upgrade inside fetched card HTML | Yes, ~85% — autonomous elements upgrade on innerHTML insertion; card has no inline `<script>` | +8–12h |
| ② | Caching of section fetches | None documented — assume 1 request per card per page view; `lazy` is the mitigation | +3–5h |
| ③ | Section fetch inherits market context | Yes, ~90% — same-origin cookie inheritance, no locale URL to construct | +4–6h |
| ④ | Exact fetch URL construction | `/products/<handle>?section_id=<section>` | negligible |
| ⑤ | Account linking cost / lead time | Free, days not weeks | +6–10h if per-account deploy required |
| ⑥ | `<grid-slider>` re-init when cards arrive async | Works with manual `theme:grid-slider:init` dispatch | +1h |

---

## Open questions

1. **Which Consentmo category gates Nosto** — marketing, analytics, or functionality? Suggest functionality. Needed before line 9 build.
2. **Native Shopify Markets pricing, or Global-e / Managed Markets?** Check Shopify admin → Settings → Markets for a "Managed Markets" section (Markets Pro was renamed). No Global-e traces in theme source, but Managed Markets operates at admin level.
3. **How many markets, and how many QA'd?**
4. **Model/Product switcher on the Nosto SERP, or category only?** +1.5h if search too.
5. **Stape server-side GTM container config** — affects line 9 by +1–2h.
6. **Denied-consent state QA** — Europe means this is a real share of traffic. +1h to line 11 if covered explicitly.

### Resolved

- ~~Two GDPR apps~~ — Consentmo only; the other embed is a leftover.
- ~~OCP scope~~ — Roswell places only; client + Nosto author and style.
- ~~Metafield exposure~~ — client can expose any metafield on request.
- ~~Multi-market template deployment~~ — one template shared across accounts via linking.
- ~~Consent approach~~ — Nosto loads for all; DNT gates tracking.

---

## Recommended next step: half-day spike

Build `sections/nosto-product-card.liquid`, fetch via Section Rendering API, inject into a live collection page. Verify:

- [ ] Swatch hover
- [ ] Sibling price / image / cutline swap
- [ ] Hover image slider
- [ ] Quick add — single variant
- [ ] Quick add — multi variant (drawer via `product-info.js`)
- [ ] Model/Product ghost swap
- [ ] `<grid-slider>` carousel with async-loaded cards
- [ ] One non-primary market cookie

Resolves unknowns ①②③④⑥ — together **+15–23h** of downside. Highest-leverage four hours available before committing the number.

---

## Launch sequencing

Do **not** uninstall Search & Discovery until Nosto is live and verified in production. Once removed, `collection.filters` empties immediately with no staged rollback, and filter behaviour is reported not to cleanly revert after uninstall/reinstall. Make removal an explicit post-launch step with its own sign-off.

---
---

# Resources

## Project

| Resource | Location |
|---|---|
| Repo | `roswell-studios/Elie_Tahari_TAHARI_2026` |
| Working branch | `nosto` |
| Figma (source of truth for all visual decisions) | https://www.figma.com/design/iBHKtwieSkMfWqYalNhK1v/Elie-Tahari---Amar-Copy |
| Merchant vault | `roswell-vaults/vaults/elie-tahari/` |
| Technical bible | `CLAUDE.md` (repo root) |
| Do-not-touch list | `../vault/01-mcd/do-not-touch.md` |
| Decisions log | `../vault/02-decisions/decisions.md` |
| Reusable patterns | `../vault/04-engineering/patterns/*.md` |

Base theme: **Broadcast v8.1.0**. Shopify CLI 3.93.2 (workflows bumped to 4.5.2), Node >=25.8.2.

---

## Key theme files

### Product card and grid

| File | Lines | What |
|---|---:|---|
| `snippets/product-grid-item.liquid` | 893 | The card. Rendered from 13 call sites |
| `sections/api-product-grid-item.liquid` | 6 | Existing Section Rendering endpoint — template for the Nosto card section |
| `snippets/product-grid-price.liquid` | 183 | Price rendering, `currency_code_enable` branch |
| `snippets/quick-add-product.liquid` | 118 | Single vs multi-variant add-to-cart |
| `snippets/product-badge.liquid` | — | Badge component |
| `assets/swatches.css` | 131 | **130 colour-handle → hex vars.** Swatch facet mapping source |

**Card internals worth knowing (`product-grid-item.liquid`):**

| Lines | Feature |
|---|---|
| `94-137` | Responsive `sizes` math from `section.settings.grid` / `grid_mobile` / `layout_desktop` / `width` |
| `143-167` | Swatch style classes (circle/square/text/slider/text-slider/limited/grid) |
| `170-299` | Native option swatches via `<grid-swatch>` |
| `225-232` | Desktop/mobile `+N` overflow counts |
| `307-308` | Ghost image — `product.media \| where: 'alt', 'alt:ghost'` |
| `318-447` | Sibling products block (separate product per colour) |
| `373` | **Sibling colour metafield fallback chain — six spelling variants** |
| `382-386` | `swatch-{{handle}}` + `--swatch: var(--{{handle}})` convention |
| `449-616` | Six-tier badge cascade (preorder → sold out → sale → tag-based → custom → auto-NEW) |
| `534-546` | Sale badge walks every variant to find max discount |
| `669-672`, `683` | **`hide` tag suppression — renders nothing** |
| `684-690` | `<grid-item ... data-grid-item>` — what `GridSlider` queries for slides |
| `692-797` | Image stack: default, ghost, hover slider, variant preload |
| `822-848` | Cutline with CLS-reserving `&nbsp;` |

### Collection and search

| File | Lines | Notes |
|---|---:|---|
| `sections/collection.liquid` | 733 | `:88-119` + `:243-279` featured-image interleaving; `:91` page-1-only guard |
| `sections/search.liquid` | 356 | Uses `<collection-component>`, no model switcher |
| `snippets/filters.liquid` | 344 | Facet parity target — see line-refs in §4 above |
| `snippets/collection-filters-sidebar.liquid` | 131 | |
| `snippets/collection-sorting.liquid` | 86 | Native `sort_by` |
| `snippets/collection-model-switcher.liquid` | 5 | Model \| Product toggle |
| `assets/collection-model-switcher.js` | — | MutationObserver on `[data-products-grid]`, `subtree: true` |
| `sections/predictive-search.liquid` | 260 | |
| `snippets/header-search-popdown.liquid` | — | |

### Recommendations

| File | Notes |
|---|---|
| `sections/related.liquid` (464) | PDP related, tabbed, grid/slider |
| `snippets/products-recommendation.liquid` (43) | `<grid-slider>` wrapper, `:10-30` |
| `sections/api-product-recommendation.liquid` (3) | Section Rendering endpoint |
| `assets/related-products.js` | Fetches `?intent=related` — survives S&D removal |
| `assets/complementary-products.js` | Fetches `?intent=complementary` — **breaks without S&D** |
| `snippets/cart-block-upsell.liquid` (101) | Cart drawer upsell |
| `product.liquid:2310`, `section-featured-product.liquid:1958` | Complementary block schema — remove after S&D |

### Tracking and consent

| File | Notes |
|---|---|
| `snippets/head.liquid` | All tracking. `:841-842` loads `vendor.js` + `theme.dev.js` |
| `snippets/gcm-integration-script.liquid` | Consentmo GCM V2, `initialState: 7` (all denied) |
| `snippets/gsf-conversion-pixels.liquid` | `view_item_list` from `collection.products limit:4`; `view_search_results` from `search.results limit:5` |
| `snippets/criteo-tracking.liquid` | Criteo 23242, prefix `shopify_US` |
| `snippets/microdata-schema.liquid` | JSON-LD — Product, BlogPosting, BreadcrumbList |
| `snippets/date-price-info.liquid` | Geo-gated compliance text (US state list, ipinfo.io) |

### JS libraries and custom elements

**Slider library: Flickity only** (`assets/vendor.js`). **No Swiper anywhere in the repo.**

`<grid-slider>` at `assets/theme.dev.js:3406` is **native scroll-snap**, not Flickity. Queries `[data-grid-slider]` for the track and `[data-grid-item]` for slides. Listens for `theme:grid-slider:init` to re-initialize.

Custom elements the card depends on: `grid-item`, `grid-swatch`, `product-item-siblings`, `tooltip-component`, `native-scrollbar`, `hover-images`, `quick-add-product`.

> **Regex caveat:** `grep "customElements\.define\('name'"` under-reports — many definitions in `theme.dev.js` are formatted with a newline after the paren. Use `grep -n "'element-name'"` instead.

### Installed app embeds (from `config/settings_data.json`)

`orbe-geolocation` · `swap-shipping-returns` · `stape-conversion-tracking` (server-side GTM) · `klaviyo` · `judge-me-reviews` · `consentmo-gdpr` · `simprosys-google-shopping-feed` (owns `gsf_conversion_data`) · `ultimate-gdpr-eu-cookie-banner` · `brevo-pushowl`

> **Two GDPR apps are embedded simultaneously.** Only Consentmo is wired into `gcm-integration-script.liquid`.

---

## Nosto documentation

### Shopify platform

| Topic | URL |
|---|---|
| Personalization for Shopify (overview) | https://docs.nosto.com/shopify |
| Installing | https://docs.nosto.com/shopify/installing |
| Features index | https://docs.nosto.com/shopify/features |
| **Styling Options — Dynamic Product Cards** | https://docs.nosto.com/shopify/styling-options-dynamic-product-cards |
| Shopify International (Markets) | https://docs.nosto.com/shopify/shopify-markets |
| Markets — front-end addition | https://docs.nosto.com/shopify/shopify-markets/technical-details-how-to-use-it |
| Multi-currency support | https://docs.nosto.com/shopify/features/multi-currency-support.md |
| Variations (configurable products) | https://docs.nosto.com/shopify/features/variations-configurable-product |
| Recommendation Extensions | https://docs.nosto.com/shopify/recommendation-extensions |
| Adding / moving recommendations | https://docs.nosto.com/shopify/guides/adding-removing-or-moving-recommendations |
| Migration to Theme App Extensions | https://docs.nosto.com/shopify/features/migration-to-theme-app-extensions |
| How Nosto modifies your theme | https://docs.nosto.com/shopify/guides/how-nosto-modifies-your-theme |
| Quicker recommendation loading | https://docs.nosto.com/shopify/guides/quicker-recommendation-loading |
| Customising product metadata | https://docs.nosto.com/shopify/features/outdated-asset-api-approach/customising-product-metadata.md |
| Sitemap | https://docs.nosto.com/shopify/sitemap.md |

**Dead URLs** (kept so nobody re-chases them): `/shopify/features/multi-currency` → use `-support.md`. `/shopify/guides/customising-product-metadata` → moved to `/features/outdated-asset-api-approach/`.

### Search

| Topic | URL |
|---|---|
| Implement Search & Categories (hub) | https://docs.nosto.com/techdocs/implementing-nosto/implement-search |
| **Search Templates Starter** | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/using-search-templates-starter |
| Starter — getting started | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/using-search-templates-starter/getting-started |
| **Starter — dynamic product cards** | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/using-search-templates-starter/customizations/dynamic-product-cards |
| Code editor — search page (facets) | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-code-editor/implementing-search-page |
| Code editor — category pages | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-code-editor/implementing-category-pages |
| **Code editor — FAQ** (facet overrides, SKU selection) | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-code-editor/faq |
| API — search page | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-api/implementing-search-page |
| API — category pages | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-api/implementing-category-pages |
| Search & Categories API | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/implement-search-using-api/using-the-search-api |
| JavaScript library | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/search |
| **Nosto CLI** | https://docs.nosto.com/techdocs/implementing-nosto/implement-search/deployment-and-testing/nosto-cli |

### Templates and web components

| Topic | URL |
|---|---|
| **Template customization** (confirms Velocity) | https://docs.nosto.com/techdocs/implementing-nosto/template-customization |
| Product cards | https://docs.nosto.com/techdocs/implementing-nosto/template-customization/product-cards |
| Starting points (Carousel, Swatches templates) | https://docs.nosto.com/techdocs/implementing-nosto/template-customization/starting-points |
| Web Components overview | https://docs.nosto.com/techdocs/apis/frontend/oss/web-components |
| Shopify integration (Dawn/Horizon patterns) | https://docs.nosto.com/techdocs/apis/frontend/oss/web-components/shopify-integration |
| **DynamicCard API reference** | https://nosto.github.io/web-components/classes/DynamicCard.html |
| TypeDoc root | https://nosto.github.io/web-components |
| **Storybook (live examples)** | https://nosto.github.io/web-components/storybook/ |
| Source repo | https://github.com/Nosto/web-components |
| Default product tagging | https://docs.nosto.com/techdocs/implementing-nosto/implement-on-your-website/manual-implementation/product-tagging/default-product-tagging |
| Docs index for LLMs | https://docs.nosto.com/techdocs/llms.txt |

> **Doc-fetch tip:** many Nosto pages return thin content to fetchers. Append `.md` to the URL, or use the GitBook query form: `<url>.md?ask=<question>&goal=<goal>`. The Storybook and TypeDoc are more reliable than the prose docs for component APIs.

### Shopify documentation

| Topic | URL |
|---|---|
| Managed Markets (formerly Markets Pro) | https://help.shopify.com/en/manual/international/managed-markets |
| Managed Markets — setup | https://help.shopify.com/en/manual/international/managed-markets/setting-up |
| Search & Discovery — filters | https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters |
| Search & Discovery — recommendations | https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-recommendations |
| Storefront filtering | https://help.shopify.com/en/manual/online-store/themes/customizing-themes/common-customizations/storefront-filters |
| Product recommendations (themes) | https://shopify.dev/docs/storefronts/themes/product-merchandising/recommendations |
| Product Recommendations Ajax API | https://shopify.dev/docs/api/ajax/reference/product-recommendations |
| Related products | https://shopify.dev/docs/storefronts/themes/product-merchandising/recommendations/related-products |
| `productRecommendations` (Storefront API) | https://shopify.dev/docs/api/storefront/latest/queries/productRecommendations |

### Global-e

| Topic | URL |
|---|---|
| Global-e and Shopify Markets | https://docs.global-e.com/nce/en/global-e-and-shopify-markets.html |
| Managed Markets merchant terms | https://s3.global-e.com/policies/shopify/ww-merchant-terms.html |

---

## Commercial context

From the Nosto × Elie Tahari plan (end of July signature), annual fees at $7M revenue:

| Item | List |
|---|---|
| Experience.AI License | $11,051 |
| Personalized Search | $7,825 |
| Category Merchandising | $7,825 |
| Product Recommendations | $6,384 |
| Onsite Content Personalization | $7,825 |
| Onboarding (one-time) — *"Implementation, Development and Stylization of Templates (Done and billed by Roswell)"* | $2,000 |
| **Total** | **$42,910** (discounted $34,328) |

12-month term, annual upfront. Nosto's onboarding line explicitly assigns template implementation and styling to Roswell; Nosto provides the onboarding manager, backend setup, and training/strategy sessions.

---

## How to verify things yourself

| Question | How |
|---|---|
| Managed Markets / Global-e in use? | Shopify admin → Settings → **Markets** → look for a "Managed Markets" section (Markets Pro was renamed) |
| Global-e standalone? | Apps list; or storefront network requests to `global-e.com`, JS globals `window.GlobalE` / `GlobalE_Data`, cookies `GlobalE_Data` |
| Which metafields are storefront-exposed? | Shopify admin → Settings → Custom data → per definition, check "Storefronts" access |
| Slider library in theme | `grep -ril "swiper\|flickity" assets/` — returns Flickity only |
| Custom elements defined | `grep -n "'element-name'" assets/theme.dev.js` (not the `customElements.define(` form) |
| App embeds installed | Parse `blocks` from `config/settings_data.json` `current` |
