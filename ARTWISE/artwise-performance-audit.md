# ArtWise Performance Audit
**Ticket:** ARTWISE-ISSUE-12281153540 · **Site:** https://artwise.co · **Store:** artwiseonline-new
**Theme:** Broadcast (© Presidio Creative) + a custom Preact/Vite wrapper
**Date:** 2026-07-08 · **Type:** Investigation + prioritized recommendations

---

## Executive summary

The store was flagged as feeling slow. This audit looks at two things: Google's Core Web Vitals (the metrics Google ranks on) and the factors that can make a site feel sluggish even when those metrics are healthy. We measured the three highest-traffic template types (Home, Collection, Product) with **both real-user field data and lab data**, then read the actual theme source (templates, sections, and the shared snippets they render) to separate real issues from generic advice. The picture:

**1. Real users pass Core Web Vitals on all three templates.** At the 75th percentile (field data, the metrics Google ranks on), LCP, INP, and CLS are all in the "Good" range. Responsiveness (INP), the metric most sites fail, is excellent here. So this is **not** a failing-CWV emergency, and search ranking is not at risk today.

**2. The site is moderately heavy on a first visit, driven mostly by images.** A cold first visit loads about **8 MB on the homepage, 6 MB on a collection, 2 MB on a product** (mobile, WebPageTest) — mostly images, and mobile is served *larger* images than desktop. On a fast connection or repeat visit this is masked, which is why the field data passes; on a cold cache or mid-range phone it's felt. *(Earlier PSI-based figures of 10–20 MB were over-counts — see the PSI-vs-WPT reconciliation.)*

**3. The theme is more competently built than a generic audit would assume, so the wins are specific and surgical, not a rebuild.** Reading the code changed several of our initial assumptions (documented in *Corrections* below). The product grid already lazy-loads, the product gallery and hero slideshow already prioritize their LCP image correctly, layout stability is handled via CSS aspect-ratios, and the vendor theme JS is already minified. The real, fixable issues are narrower and **image-led**: **oversized images** (especially the retina versions served to mobile), an **image-priority inconsistency** on the homepage grid, **above-the-fold autoplay video** (moderate), and smaller items (an **inert Preact bundle**, **font preloads**). Most live in *our* wrapper, in theme settings, or in the images themselves — not deep in the vendor monolith. (The "aggressive prefetching" from the first draft turned out to be Shopify's own checkout preload — not ours.)

> **Bottom line:** The site passes Google's Core Web Vitals, so ranking is safe. The heaviness on first load is real and measurable as **page weight**, and it is addressable with targeted fixes (below), with no re-platform or theme rebuild required. The single highest-value theme fix is **quality-preserving image optimization** (right-sized, modern-format images — especially the oversized mobile versions), since images are the bulk of the page weight.

---

## How we measured this (and how to re-test)

We report **every metric** and label each by reliability, rather than dropping inconvenient ones. Lab loading/responsiveness numbers are shown next to their real-user field counterpart so nothing is over- or under-stated.

| Tier | What it is | Reliability | Source |
|---|---|---|---|
| **1 — Deterministic** | Page weight, request count, JS/CSS bytes, images, videos | **Highest** — byte/asset counts; identical every run; hold after fixes | Live Chrome measurement of the published site |
| **2 — Real-user field** | LCP, INP, CLS at P75 | **Ground truth for real users** (28–30 day window) | Shopify Web Performance report + Google CrUX (via PSI) |
| **3 — Perceived-visual** | Speed Index, when the screen fills | **Directional** — confirm on a real-device tool | PageSpeed Insights (lab) |
| **4 — Lab diagnostic** | Total Blocking Time, lab-LCP, long tasks | **Lowest / worst-case** — simulated Slow-4G + 4× CPU; tool-dependent; shown only beside the field value | PageSpeed Insights (lab) |

**Tools & steps (reproducible):**
1. **Field first** — Shopify admin → Analytics → Reports → *LCP / INP / CLS: Page Type* (last 30 days). Cross-checked against Google CrUX via PageSpeed Insights.
2. **Lab** — PageSpeed Insights (Google's cloud Lighthouse) via `scripts/perf-audit.mjs`, **median of 3 runs** per URL, mobile. Local headless Lighthouse could **not** complete on this site (timed out across three throttling methods — the page never reaches idle); hosted PSI completed mobile, but **all desktop runs errored**. That instability is itself a symptom of the heaviness.
3. **Deterministic weight** — live Chrome measurement (Resource Timing) of Home (cold), Product, Collection.
4. **Source audit** — Claude Code over the theme repo: traced the index/product/collection templates → their sections → the shared snippets those sections render (`image-hero`, `product-grid-item`, `media`, `slide`, `hero`), with blast-radius counts for every shared file.
5. **Re-test** — `scripts/perf-audit.mjs` (PSI, needs a free API key in `.env`) + the `/perf-audit` command regenerate this baseline for before/after on each fix.

**Baseline URLs** (top of each type by sessions, last 90 days):
- Home — `https://artwise.co/`
- Collection — `https://artwise.co/collections/all` (1,071 sessions; literal #1. It renders the whole catalog and is heavier than a typical curated collection — top curated is `/collections/spring-cleaning`, 445.)
- Product — `https://artwise.co/products/aw1005` (151 sessions)

---

## Baseline

**Audience / device split (GA4, last 90 days):** Mobile **~59%** (19,110 sessions; heavily iOS/Safari), Desktop **~40%** (12,822; a bit lower for real humans — ~1,700 bot sessions like HeadlessChrome/ClaudeBot), Tablet <1%. So **both matter** — mobile is the larger share *and* the heavier load (8 MB vs 3.2 MB on Home), which justifies a mobile-first emphasis, but desktop at ~40% is not a footnote. Present both.

### Tier 1 — Deterministic weight (the reliable "heaviness" numbers)

*Pages measured: Home = `/`, Collection = `/collections/all` (top by sessions), Product = `/products/aw1005` (top by sessions).*

> **Superseded for weight by Tier 1b (WebPageTest).** This table is the initial live-browser snapshot. Note "JavaScript decoded 5.26 MB" is *uncompressed parse size*; the over-the-wire **transfer is ~0.56 MB** (WPT). Use Tier 1b for authoritative byte weights.

| Metric | Home | Product | Collection |
|---|--:|--:|--:|
| Network requests (initial) | **353** | 357 | 333 |
| Transferred (first visit, home cold) | **3.66 MB** | ¹ | ¹ |
| Full-load transfer (Lighthouse) | 10.4 MB | 14.7 MB | **19.2 MB** |
| JavaScript requests | 214 | 227 | 213 |
| JavaScript decoded² | 5.26 MB | 5.34 MB | 5.26 MB |
| CSS requests | 41 | 41 | 41 |
| Images (loaded / `<img>` tags) | 24 / 102 | 10 / 33 | 18 / 96 |
| — eager (not lazy) | **49** | 21 | **49** |
| Videos / iframes | 3 / 7 | 0 / 7 | 4 / 7 |
| Runtime prefetch links | 112 | 112 | 113 |
| Fonts (woff2) | 6 (295 KB) | 6 | 6 |
| Server response (TTFB) | 120 ms | **623 ms** | 50 ms |
| `load` event | 4.24 s | 3.69 s | 2.18 s |

¹ Product/Collection were measured warm-cached, so their *transferred* bytes understate a first visit; the **full-load** row (from Lighthouse, cold) is the comparable figure. ² JS-decoded includes ~112 prefetched files (future-navigation resources), so it reflects both "this page's JS is large" *and* "the theme pre-downloads more."

**Asset sizes (raw / gzipped-on-the-wire):**

| Asset | Raw | Gzip | Notes |
|---|--:|--:|---|
| `theme.css` (Broadcast) | 569 KB | **87 KB** | render-blocking; **not** minified |
| `theme.js` (Broadcast) | 144 KB | 35 KB | **already minified** (vendor) |
| `main2.js` (our Preact app) | 58 KB | 17 KB | unminified; **renders nothing — see §Source audit** |
| `vendor.js` (Preact/Radix) | 60 KB | 16 KB | unminified; ships with the inert Preact layer |
| `main.css` (our Tailwind) | 27 KB | 7 KB | ~2 sections use it; also carries `app.scss` + `.rte` |
| `ebay-bootstrap.css` | 120 KB | — | **orphaned** — zero references |
| `theme.dev.js` | 273 KB | — | unused (not served); dead weight in repo only |

### Tier 1b — Cold per-device asset breakdown (WebPageTest, 2026-07-15) — AUTHORITATIVE

WebPageTest, **cold first-view**, real device profiles, **same tool for mobile and desktop** (mobile = Moto G Stylus / 4G, desktop = Chrome / Cable). Pages: Home = `/`, Collection = `/collections/all`, Product = `/products/aw1005`. **This supersedes the PSI figures**, which badly over-counted (see reconciliation).

| Metric (Mobile / Desktop) | Home | Collection | Product |
|---|--:|--:|--:|
| **Total weight** | **8 / 3.2 MB** | **6 / 2.0 MB** | **2 / 2.0 MB** |
| Requests | 140 / 157 | 147 / 162 | 182 / 207 |
| Images | **5.86 / 2.14 MB** | 2.47 / 0.72 MB | 0.87 / 0.44 MB |
| Video | 1.23 / 0.08 MB | **2.76 / 0.44 MB** | 0 |
| JavaScript | 0.56 / 0.56 MB | 0.56 / 0.56 MB | 0.88 / 1.05 MB |
| CSS | 0.08 MB | 0.08 MB | 0.08 MB |
| Fonts | 0.29 MB | 0.29 MB | 0.48 MB |
| LCP | 6.6 / 5.0 s | 2.3 / 2.1 s | 2.2 / 2.8 s |
| TBT | 1.19 s / 397 ms | 2.04 s / 435 ms | 1.22 s / 558 ms |

*(Lighthouse score errored on WPT too — score 0 across the board; the site consistently breaks Lighthouse regardless of tool. WPT's own timing/weight metrics are reliable; Speed Index glitched to 0 on several runs.)*

**Reads:**
- **Real first-visit weight is 2–8 MB, not 10–20 MB.** The earlier PSI numbers were inflated.
- **Images are the #1 lever, and mobile is served LARGER images than desktop** — Home 5.86 vs 2.14 MB, Collection 2.47 vs 0.72, Product 0.87 vs 0.44 (high-DPR/retina versions). Quality-preserving image sizing/format is the single biggest reduction, especially on mobile.
- **Video is moderate** — Home 1.23 MB, Collection 2.76 MB mobile (not the 11.6 MB PSI implied). Desktop video is tiny (posters).
- **JS executed is ~0.56–0.88 MB** (not the ~5 MB PSI showed — that was prefetch counting). Modest lever.

### Reconciliation — PSI vs WebPageTest (why the numbers changed)
PSI/Lighthouse measures to **network-idle**, so on this page (looping autoplay video + ~100 low-priority checkout prefetches) its `total-byte-weight` accumulates bytes a real first visit never feels — Collection PSI **19.4 MB** vs WPT **6 MB**; Product PSI **14.8 MB** vs WPT **2 MB**. **WPT first-view (Tier 1b) is the baseline; the earlier PSI figures are over-counts and should not be quoted.**

### Tier 2 — Real-user field data (source of truth) · Shopify RUM, last 30 days, P75

| Template | % traffic | LCP P75 | INP P75 | CLS P75 | Verdict |
|---|--:|--:|--:|--:|:--|
| **Collection** | 50.4% | 1,456 ms | 48 ms | 0.00 | ✅ all Good |
| **Product** | 23.5% | 1,759 ms | 92 ms | 0.01 | ✅ all Good |
| **Home** | 16.8% | 2,255 ms | 88 ms | 0.00 | ✅ all Good (LCP weakest) |
| Site summary | 100% | 1,644 ms | 64 ms | 0.01 | ✅ Passing |

*Thresholds: LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1.* Google CrUX (via PSI) independently agrees: **Core Web Vitals Assessment = Passed** (mobile LCP 1.6 s / INP 118 ms; desktop 1.7 s / 95 ms). INP and CLS are excellent everywhere; **Home LCP (2,255 ms) is the one field metric worth improving** — passing but weakest.

### Tiers 3 & 4 — Lab data (PageSpeed Insights, median of 3 runs)

Mobile shown; **desktop omitted — every desktop run returned a Lighthouse runtime error.**

| Template | Mobile score (T3) | Speed Index (T3) | TBT (T4) | LCP lab (T4) | Full bytes (T1) |
|---|--:|--:|--:|--:|--:|
| Home | 51 | 22.1 s | 243 ms | 35.9 s | 10.4 MB |
| Collection | 35 | 20.0 s | 1,264 ms | 11.2 s | 19.2 MB |
| Product | 56 | 26.6 s | 180 ms | 9.3 s | 14.7 MB |

**Read the lab numbers with care — they're unstable here by nature:**
- **Scores swing.** Home mobile was 37 on a single run, 51 as a median of three. The page never settles, so Lighthouse scores it differently each run.
- **Lab LCP (9–36 s) is an artifact.** Field LCP is 1.6 s. Confirmed on both form factors (desktop, which barely throttles, also produced ~41 s) — it's the page never reaching end-of-load, not a real-user experience. **Do not chase it; watch field LCP.**
- **TBT (180–1,264 ms) is tool-dependent** — pair with field INP (48–118 ms = excellent). Real users are not experiencing this jank.
- **The reliable signal is Tier 1 weight**, not the lab score. Track fixes against page weight + field CWV.

---

## Source-code audit — what the theme actually does

This is the section the first draft was missing. Findings are from tracing the three templates → their sections → shared snippets, with blast-radius counts.

### The architecture, accurately

- **The theme is Broadcast (© Presidio Creative)** — a paid vendor theme. `theme.js` is a **minified** monolithic bundle carrying all section behavior (dispatched by `data-section-type`); `theme.css` is a **556 KB unminified** monolith. **No SCSS/JS source for the theme is in the repo**, and the vendor header states the compiled files must not be modified. This bounds several recommendations.
- **On top sits a custom Preact/Vite layer** (`src/`, output to `main2.js` + `vendor.js` + `main.css`). This is *our* code and is where the cleanest wins live.

### Finding A — The Preact layer is inert scaffolding shipping on every page

`src/entrypoints/main.tsx` imports only the cart lib, `CartProvider`, `GlobalProvider`, and a **`HelloWorld` demo**. `src/components/` contains only `HelloWorld.tsx` and an unused `ui/` (Radix `dialog`/`sheet`/`tabs`). The three registered custom elements (`global-provider`, `cart-provider`, `hello-world`) appear in **zero** `.liquid`/`.json` files — the only references are the `register()` calls inside built `main2.js` — and no provider is mounted in `theme.liquid`. So `main2.js` + `vendor.js` (**~33 KB gzip / ~116 KB parsed**) load on every page and **render nothing**, and `main.tsx` ships `import "preact/debug"` (a dev tool) to production.
*Honest caveat:* the byte saving is modest against the overall page weight (which is mostly images) — the value is a zero-risk removal of pure waste (JS parse cost + `preact/debug` + 2 requests), not a transformation.
*Coupling:* `main.css` (Tailwind) is a **separate output of the same Vite build**, injected independently. It is **not** dead — it carries `app.scss` (real custom CSS, e.g. range-slider thumb styling), `.rte` rich-text rules (partly duplicated with `theme.css`), and a small set of Tailwind utilities used by ~2 sections. So the JS can be dropped without touching the CSS; removing the CSS is a separate, more careful task.

### Finding B — Image-priority is inconsistent: below-the-fold grids eager-load

The theme has **two different image-priority patterns**:

- **`image-hero.liquid`** (used by **16 callers** — hero, slideshow, banners) is **position-aware**: `image-hero.liquid:54` sets `loading:'eager'` only when `section.index < 3`, else `lazy`. Correct.
- **`product-grid-item.liquid`** (used by **15 callers** — every product card) is **position-blind**: `product-grid-item.liquid:118-131` decides eager by `forloop.index` *within its own grid* (first row eager + `fetchpriority:'high'` at `:615-623`), with **no `section.index` check**.

Consequence: on the homepage, the collection grids are sections **#4, #5, #6** (`section-tab-collections`, `section-collections-list`, `section-collection`) — **all below the fold** — yet each eager-loads and high-prioritizes its first row, competing with the real hero. This is a large part of the **49 eager images** on Home. An "above-the-fold only" lens would miss it; the below-the-fold grids are demonstrably part of the problem.

### Finding C — The LCP paths that are already correct (validated, no action)

- **Hero image** (`section-hero` → `hero.liquid` → `image-hero`): loads **eager** (hero is section index 1, within the `section.index < 3` rule). *Gap:* `hero.liquid:121/133` doesn't pass `fetchpriority:'high'` (defaults null) — small opportunity.
- **Hero slideshow first slide** (`slide.liquid:84`): correctly `eager + high + preload`, **and position-aware** (`section.index < 3`). ✅
- **Product gallery** (`media.liquid:31`): first media `eager + high`; product videos autoplay but with `preload:'none'` / `loading:'lazy'`. ✅
- **Collection grid** (`collection.liquid`): already paginates by `products_per_page` and lazy-loads subsequent pages via **ajaxinate infinite scroll**; per-card first-row-eager/rest-lazy + responsive `srcset`. ✅ ("Load X then lazy-load the rest" is already implemented.)
- **Layout stability**: the `image` snippet reserves space via CSS `--aspect-ratio`, so field CLS is ~0. ✅

### Finding D — Above-the-fold autoplay video

`hero.liquid:174` autoplays a background video (`autoplay:true, loop, muted`) when configured, and `section-slideshow-nested` supports autoplay video slides. Cold first-view weight (WPT): **Home 1.23 MB, Collection 2.76 MB on mobile** (desktop tiny — posters only). A **moderate** lever worth deferring (poster + interaction-triggered playback), but not the 11.6 MB the earlier PSI figure implied.

### Finding E — Runtime prefetching (resolved: Shopify checkout preload + app embeds)

Live investigation (2026-07-10) resolved the ~110 `<link rel="prefetch">`:
- **~100 = Shopify native checkout preload** — all `/cdn/shopifycloud/checkout-web/assets/*` (polyfills, `app.js`, vendor), each `fetchpriority="low"`. Shopify pre-warms the checkout bundle during idle time; **not theme code, not removable, beneficial** (faster checkout). Being low-priority, they fetch after critical content.
- **~7 = Gorgias** chat app (`assets.gorgias.chat` bundles).
- **~3 = Wishlist Hero** app (`cdn.shopify.com` extension assets).

**Not actionable at the theme level** — the bulk is Shopify platform behavior; the rest is app embeds (see Finding G). Corrects the earlier draft: because these are `fetchpriority="low"`, their real first-paint impact is small, so they should **not** be counted as first-load-critical weight.

### Finding F — Fonts, render-blocking CSS, app scripts, orphans

- **Fonts from three providers** (Shopify CDN + Google Fonts + Adobe Typekit) with **5 font preloads** (`head.liquid:619-631`; Shopify recommends ≤2 hints/template).
- `theme.css` (87 KB gz) + `atomz.css` load **render-blocking** (`head.liquid:634-635`). `atomz.css` belongs to the **Atoms.ai** app — defer, don't trim.
- **MakeAnOffer** app dumps a large inline `<script>` **after `</html>`** (`theme.liquid:62-114`), serializing product/variants/collections JSON on every page.
- **Orphaned assets**: `ebay-bootstrap.css` (120 KB, zero references) and `theme.dev.js` (273 KB, unused).
- **AOS "animate on scroll"** is pervasive (9–25 `data-aos` hooks per index section) but implemented performantly via **`IntersectionObserver`** in `theme.js` (batched, no per-element scroll listeners; only 3 scroll listeners total, none per-animation). Parallax (`rellax.js`) uses a single scroll listener + `requestAnimationFrame` and is lazy-loaded only where used. Not a meaningful perf factor; keep it as design polish (no ticket).

### Finding G — 3rd-party app loading (reference for a future app audit)

Captured from the prefetch investigation (2026-07-10) so a deeper app audit doesn't start from scratch.

**How apps load here:** almost all via **Shopify app embeds** (theme app extensions), registered in `Shopify/config/settings_data.json` as `shopify://apps/<app>/blocks/<block>` and injected by Shopify — **not hardcoded in theme Liquid**. The one exception is **MakeAnOffer**, hardcoded inline in `theme.liquid:62-114`.

**App embeds found (~11 apps / ~14 blocks):**
- **Chat: Gorgias** (`gorgias-live-chat-helpdesk`) **and Shopify Inbox** (`inbox/blocks/chat`) — two chat apps.
- **Wishlist: Wishlist Hero** (`wishlist-hero`) **and Wishlist Plus** (`wishlist-plus`) — two wishlist apps.
- `klaviyo` (email/SMS), `octane-ai` (quiz), `impact-com` (consent + UTT tracking), `offerly` (offers), `savedby-package-protection` (Saved By), `square-instagram-feed`.
- Plus hardcoded **MakeAnOffer** (`theme.liquid`).

**Flags for the audit:**
- **Likely redundancy** — two chat apps (Gorgias + Shopify Inbox) and two wishlist apps (Wishlist Hero + Wishlist Plus). Consolidation candidates; confirm which is actually live (client decision).
- **Prefetch owners** (Finding E): Gorgias and Wishlist Hero each prefetch their own bundles.
- **Do-not-touch app surfaces** (vault): ArtPlacer, Atoms.ai, Gorgias, Saved By, Afterpay.

**Effort note:** app embeds are Shopify-injected, so we do **not** control their loading from theme code. To *skip an app embed and self-host/control the loading ourselves* (defer, conditionally load, or replace), **each app needs its own feasibility + effort assessment** — some can't be self-hosted, some tie functionality or licensing to the embed, and some own do-not-touch surfaces. Out of scope for this audit; it's a separate, app-by-app engagement if pursued.

---

## Ranked recommendations

Prioritized by evidence (impact × effort × risk), not by category. Effort: **S** ≈ hours · **M** ≈ 1–2 days · **L** ≈ multi-day. "Possible impact" is an estimate; deterministic (byte/request) savings are more certain than lab-score movement.

### Tier A — highest value

| # | Recommendation | Template(s) | Possible impact | Effort | Risk / fix type |
|:--:|---|---|---|:--:|---|
| **1** | **Optimize images (quality-preserving) — the #1 lever.** Serve right-sized, modern-format (WebP/AVIF) images and **fix the oversized mobile images** (mobile gets 5.86 MB on Home vs 2.14 MB desktop — retina versions are too large). Tighten `srcset`/`sizes` and width caps; ensure below-the-fold images lazy-load. **Preserve artwork quality** (Hockney-fine constraint) — high-quality WebP/AVIF + right-sizing, *not* lossy degradation. | All (Home worst) | **Largest single weight reduction** — images are the bulk of every page; biggest win on mobile. | **M** | Theme code + Shopify image `width`/format params |
| **2** | **Make `product-grid-item` image priority position-aware (opt-in).** Add an optional `eager`/`priority` param defaulting to *today's* behavior; have the below-the-fold homepage collection sections pass "lazy even for first row." Mirrors the `image-hero` `section.index` rule (Finding B). | Home (Product/Collection unaffected) | Removes ~a dozen competing eager/`fetchpriority:high` fetches on Home → faster Home LCP. | **M** | **Low** if opt-in. **Do not flip the default** — `product-grid-item` has 15 callers that should keep first-row-eager. Theme code (ours). |
| **3** | **Reduce above-the-fold media weight (moderate).** Poster + lazy/interaction-triggered playback for hero/slideshow autoplay video (Finding D: Home 1.23 MB, Collection 2.76 MB mobile). | Home, Collection | Removes video bytes + decode from the initial load. | S–M | Theme + **content decision** |

*(The runtime-prefetch item is closed — not theme-actionable; it's Shopify checkout preload + app embeds. See Findings E & G.)*

### Tier B — clean hygiene, modest but low-risk

| # | Recommendation | Template(s) | Possible impact | Effort | Risk / fix type |
|:--:|---|---|---|:--:|---|
| **4** | **Remove or gate the inert Preact JS** (stop injecting `main2.js`; drop `HelloWorld`/`preact/debug`; keep building `main.css`). If Preact work is imminent instead, at minimum **minify + drop `preact/debug`** (flip `vite.config.js:56-57`). | All | ~33 KB gzip + ~116 KB parse + 2 requests + removes `preact/debug`. Zero functional loss (Finding A). | **S–M** | **Low.** Keep `main.css` building (it's load-bearing). Theme code (ours). |
| **5** | **Add `fetchpriority:'high'` to the hero image** (`hero.liquid:121/133` → pass through `image-hero`). | Home | Nudges Home LCP (the one weak field metric). | **S** | Low; `image-hero` shared by 16 callers — pass the param from `hero` only. |
| **6** | **Delete orphaned assets** — `ebay-bootstrap.css` (120 KB, unreferenced) and `theme.dev.js` (273 KB, unused). | All | 120 KB off the wire; repo cleanup. | **S** | None |
| **7** | **Reduce font preloads to ≤2** (`head.liquid:619-631`). Live: **~4 preloads for 3 distinct fonts** — `nav` and `btn` are both Nunito Sans (**duplicate preload**); `subheading` is a system font (already skipped). Keep base (Inter) + header (Bricolage); drop the rest — they still load via `@font-face` + `font-display:swap`. | All | Fewer font fetches competing with the LCP image early. | **S** | Theme code |

### Tier C — modest / careful

| # | Recommendation | Template(s) | Possible impact | Effort | Risk / fix type |
|:--:|---|---|---|:--:|---|
| **8** | **App audit / ghost-code removal** — the MakeAnOffer inline blob (`theme.liquid:62-114`), FB pixel, and any leftover snippets from removed apps. | All | Fewer per-page third-party scripts. | **M** | **Respect app-owned surfaces** — ArtPlacer, Atoms.ai, Gorgias, Saved By, Afterpay are on the do-not-touch list; optimize *around* them. **Client decision** + theme cleanup. |
| **9** | **Minify `theme.css`** via a build step (currently unminified). | All | ~15% off uncompressed (parse cost); only a few KB on the wire (gzip already covers whitespace). Low payoff. | **S** | Mechanical transform; re-run on Broadcast updates. |
| **10** | **Defer/async `theme.css` with a small hand-curated critical set (header/nav/base only).** | All | Un-blocks render — but partial and fragile. | **M** | **Caveat:** true above-the-fold critical CSS is unreliable on a merchant-arranged, source-less monolith; scope to the stable header/nav/base shell only, or skip. |

### Implementation estimates (internal — for pricing; MP to add margin)

Developer time including light QA, per recommendation, reasoned from the code. **External approvals are not included** (design/brand image-quality sign-off, autoplay/content decisions, font-provider confirmation, client app-removal decisions).

| Rec | Effort | Est. hrs | Estimate driver |
|---|:--:|--:|---|
| 1 · Image optimization | M | 6-10 | central width-cap is small; hours = per-context `sizes` audit + artwork quality/zoom verification (Hockney) |
| 2 · Position-aware grid | M | 2-4 | opt-in param + pass from 3 homepage sections; careful due to 15-caller blast radius |
| 3 · Autoplay video | S–M | 3-5 | 2 homepage paths (hero + `_slide-video`); product gallery video already correct |
| 4 · Remove/gate Preact bundle | S–M | 2-4 | nothing in theme depends on it; gate injection + drop `preact/debug` + minify + smoke test |
| 5 · Hero fetchpriority | S | 1-2 | one param in `hero.liquid` (2 spots) |
| 6 · Delete orphaned assets | S | 1-2 | 2 files, verified unreferenced |
| 7 · Font preloads (dedupe) | S | 2-3 | dedupe Liquid (drafted in PRD); verify count + no swap flash |
| 8 · App audit / ghost code | M | 4-8 | investigation-heavy; client-gated on removals |
| 9 · Minify theme.css | S | 1-2 | cssnano deploy step; low payoff |
| 10 · Defer/critical CSS | M | 4-8 | fragile (header/nav shell only); optional |

### Expected improvement per recommendation (internal — for client positioning)

Split by what we can honestly promise. **Measurable** = real before/after (page weight, requests). **Felt speed / CWV can't be promised upfront** — the site already passes CWV, and the complaint was subjective; that's confirmed in 28-day field data *after* shipping. Baselines are WebPageTest mobile cold first-view (Tier 1b).

| # | Rec | What we can promise | Confidence |
|---|---|---|---|
| **1** | **Images** | The big one. Images = **5.86 MB of the 8 MB homepage** (mobile), and mobile is served ~2.7× the desktop image bytes. Right-sizing (no quality loss) ~**30–50%** off mobile image weight → **~2–3 MB off the homepage** first load; smaller wins on collection/product. | High (measured bulk; exact % after a quality check) |
| **2** | **Video** | Deferring autoplay removes the video from first load: **~1.2 MB (home), ~2.8 MB (collection ≈ 45% of its mobile weight)**. | High (won't download until interaction) |
| **6** | **JS bundle** | Remove the inert Preact bundle: **~33 KB + 2 requests off every page**. Small but real dead weight. | High but small |
| **3** | **Hero fetchpriority** | No byte change; the hero image starts loading sooner (small LCP nudge). Felt, not weighed. | Not quantifiable in assets |
| **4** | **Remove unused files** | **~0 visitor impact** — the files are orphaned/not served. Codebase hygiene only; don't sell as a speed win. | N/A |
| **5** | **Font preloads** | **~0 byte change**; a couple fewer files compete for priority early. Minor. | Not quantifiable meaningfully |
| **7** | **App review** | Fewer third-party scripts + main-thread work, **not a headline MB saving** — most app weight is off the critical load (e.g. Gorgias = **723 B** on first paint; its bundle is prefetched/on-interaction). Measured empirically after removal, and only the redundant duplicates are removable (do-not-touch apps stay). | No reliable pre-estimate |

**Lead with #1, #2, #6** (real byte numbers). #3/#5 are minor, #4 is hygiene, #7 is client-gated.

### Not recommended / out of scope

- **Per-section JS/CSS extraction from the Broadcast monolith** — **L, not recommended.** No SCSS/JS source in the repo, vendor "do not modify," no per-section boundaries in the 556 KB CSS. It would re-architect a paid theme and break upgradeability.
- **Unused-CSS purge of `theme.css`** — the real byte lever, but **M–H and risky** (classes injected by JS, merchant rich-text, customizer settings) — needs careful safelisting and per-template testing before it's safe.

### Validated as *not* a problem (no ticket)

INP/responsiveness (field 48–118 ms), CLS/layout stability (field ~0; CSS aspect-ratios), the product grid's lazy-loading (ajaxinate + eager/lazy already implemented), the product gallery and hero slideshow LCP prioritization (already correct), `theme.js` minification (already minified — only *our* bundle isn't), and server response on Home/Collection (fast). Product-page TTFB (623 ms) is worth a light look but isn't the main story.

### Considered but intentionally left out of the client-facing report (internal)

Recorded so the reasoning isn't re-litigated later.

| Item | Why it's not in the client report | Decision |
|---|---|---|
| **Scroll animations (AOS)** | Checked the implementation: runs on `IntersectionObserver` (batched, no per-element scroll listeners; only 3 scroll listeners in `theme.js` total; parallax `rellax.js` is a single listener + rAF, lazy-loaded). Not a meaningful perf factor, and keeping the effect is a design/brand preference. | **Keep as-is. No ticket, not presented.** |
| **Home client-side redirect** | Confirmed not in theme code (server returns 200; it's an inline `content_for_header` `window.location` rewrite, Shopify/app-owned). Low impact, likely intentional/benign (param stripping / Markets / consent). Not ours to change. | **Not presented as a rec.** If curiosity warrants, just ask the client / check the app list; no ticket. |
| **Font provider consolidation** | Fonts load from three providers (Shopify + Google + Adobe Typekit). Consolidating to one is **not in our control** (brand/typeface choice + Adobe/Typekit account access) and **low impact**: fonts are ~295 KB and already use `font-display: swap`, so they don't block text or LCP. | **Not recommended, not presented.** Kept only the controllable sub-win — reduce preloads to ≤2 (Rec #7). |

---

## Technical appendix — file references & proposed follow-up tickets

| # | File · line | Evidence | Proposed follow-up ticket |
|:--:|---|---|---|
| 1 | `snippets/image.liquid:32` (width cap 5760), `product-grid-item.liquid:86-111,:615-623` (sizes/widths); Shopify `image_url`/`image_tag` | Images = largest weight; mobile over-fetches vs desktop (Home 5.86 vs 2.14 MB) | *"Optimize image weight: cap DPR/width + modern format, preserve artwork quality"* |
| 2 | `Shopify/snippets/product-grid-item.liquid:118-131`, `:615-623` (vs `image-hero.liquid:54`) | Eager decision uses per-grid `forloop.index`, not `section.index`; 15 callers | *"Position-aware product-grid-item image priority (opt-in) for below-fold homepage grids"* |
| 3 | `Shopify/snippets/hero.liquid:174`; `Shopify/sections/section-slideshow-nested.liquid` (`_slide-video` block) | Above-the-fold autoplay video | *"Poster + lazy autoplay video on home hero/slideshow"* |
| 4 | `vite.config.js:56-57`; `src/entrypoints/main.tsx`; `Shopify/snippets/importmap.liquid:4` | Inert Preact bundle + `preact/debug` shipped; unminified | *"Remove/gate unused Preact bundle (or minify + drop preact/debug)"* |
| 5 | `Shopify/snippets/hero.liquid:121,133` | Hero image renders `image-hero` without `fetchpriority` | *"Set fetchpriority=high on hero LCP image"* |
| 6 | `Shopify/assets/ebay-bootstrap.css`, `Shopify/assets/theme.dev.js` | Orphaned / unused | *"Delete orphaned ebay-bootstrap.css and unused theme.dev.js"* |
| 7 | `Shopify/snippets/head.liquid:146-165` (3 providers), `:619-631` (5 preloads) | Shopify + Google + Typekit fonts | *"Consolidate to one font provider; ≤2 font preloads"* |
| 8 | `Shopify/layout/theme.liquid:62-114` | MakeAnOffer inline `<script>` after `</html>` | *"App audit & ghost-code removal (respect app-owned surfaces)"* |
| 9 | `Shopify/assets/theme.css` (build step) | 569 KB, unminified | *"Minify theme.css in deploy (modest)"* |

---

## Corrections to the first draft (for transparency)

Reading the code overturned several assumptions in the initial pass; recording them so the audit is trustworthy:
- **"Theme ships unminified JS"** → only *our* Preact bundle is unminified; **`theme.js` (Broadcast) is already minified.**
- **"~21–29 images missing dimensions → CLS risk"** → false alarm; the `image` snippet uses CSS `--aspect-ratio`, and **field CLS is ~0.** Retracted.
- **"Collection needs lazy-loading of products"** → already implemented (ajaxinate + per-card eager/lazy).
- **"Hero image may be lazy/unprioritized"** → the hero image is **eager** (via `image-hero`'s position-aware rule); the only gap is `fetchpriority`.
- **"Remove Preact → reclaim 116 KB JS *and* 26 KB CSS, zero loss"** → the CSS (`main.css`) is a separate, **load-bearing** output (app.scss + `.rte` + utilities); only the JS is safely removable.
- **"Double stack = legacy + a live modern app"** → the Preact layer is **inert**, so it's "real Broadcast theme + an unused bundle," not two competing live stacks.
- **"First-visit weight is 10–20 MB; video/JS dominate"** (from PSI) → PSI over-counted (looping autoplay video + ~100 checkout prefetches accumulate over its network-idle window). **WebPageTest cold first-view shows 2–8 MB**, video is moderate (1.2–2.8 MB, not 11.6), and executed JS is ~0.56 MB (not ~5 MB). Tier 1b (WPT) is authoritative.
- **Images were not flagged as the top lever in the first pass** → they are. **Oversized images — especially the retina versions served to mobile** (Home 5.86 MB vs 2.14 MB desktop) — are the single biggest weight. Added as recommendation #1.

## Notes & caveats
- **Do not chase the lab LCP / Lighthouse score** on this theme — both are unstable until the JS/prefetch weight drops enough for the page to settle. Track fixes against **Tier-1 weight** and **field CWV**.
- **Exact scores are not guaranteed** and vary by device/network/tool.
- **Recommended addition:** a **WebPageTest** filmstrip baseline (real device, real throttling) for an artifact-free "when does the screen fill in" measure. Not run here (needs a WPT key).
- **Ongoing monitoring:** a RUM tool that tracks perceived metrics (SpeedCurve / Calibre surface Speed Index + filmstrips), since Shopify's dashboard reports only the three CWV.
- **Re-test after each fix** with `scripts/perf-audit.mjs` + `/perf-audit`.

*Measurement captured 2026-07-06/08. Field window: last 30 days. Lab: PageSpeed Insights, mobile, median of 3.*
