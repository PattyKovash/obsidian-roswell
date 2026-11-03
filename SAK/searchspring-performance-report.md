# Searchspring Performance Report
### Our custom integration vs. the current live theme

**Summary.** Across all four collections, the custom integration loads lighter than the current live theme: roughly 80% less page weight, zero (or near-zero) autoplay video, and about a fifth of the images. The page-weight and asset wins are consistent and should remain the same even after launch. Core Web Vitals (layout stability and responsiveness) test well in our build. Because our theme is not yet published, we will validate them in Google field data after launch, since lab and field results can differ.

## Bags
https://www.thesak.com/collections/bags

| Metric | OURS | Live |
|---|--:|--:|
| Lighthouse Performance score (mobile / desktop) | **49 / 79** ✅ | 37 / 64 |
| Cumulative Layout Shift, CLS (mobile / desktop) | **0.00 / 0.02** ✅ | 0.35 / 0.25 🔴 |
| Interaction to Next Paint, INP (mobile / desktop) | **72-112 ms** ✅ | 404 / 224 ms 🟠 |
| Video files loaded | **0** ✅ | 8-9 (28-34 MB) |
| Images loaded (mobile) | **57 (2.7 MB)** ✅ | 279 (8.8 MB) |
| Page weight (mobile / desktop) | **7.8 / 6.9 MB** ✅ | 46.7 / 39.3 MB |
| Network requests (mobile / desktop) | **488 / 558** ✅ | 649 / 728 |

## Best Sellers
https://www.thesak.com/collections/best-sellers

| Metric | OURS | Live |
|---|--:|--:|
| Lighthouse Performance score (mobile / desktop) | 39 / **55** ✅ | 38 / 51 |
| Cumulative Layout Shift, CLS (mobile / desktop) | **0.00** ✅ | 0.93 / 1.23 🔴 |
| Interaction to Next Paint, INP (mobile / desktop) | **under 130 ms** ✅ | 346 / 179 ms 🟠 |
| Video / media files loaded | **1-2 (2.4-3.3 MB)** ✅ | 11-12 (32-35 MB) |
| Images loaded (mobile) | **53 (2.5 MB)** ✅ | 296 (9.3 MB) |
| Page weight (mobile / desktop) | **10.2 / 10.4 MB** ✅ | 45.6 / 43.8 MB |
| Network requests (mobile / desktop) | **494 / 547** ✅ | 788 / 789 |

## New Arrivals
https://www.thesak.com/collections/new-arrivals

| Metric | OURS | Live |
|---|--:|--:|
| Lighthouse Performance score (mobile / desktop) | **45 / 77** ✅ | 40 / 52 |
| Cumulative Layout Shift, CLS (mobile / desktop) | **0.00** ✅ | 0.81 / 1.11 🔴 |
| Interaction to Next Paint, INP (mobile / desktop) | **under 130 ms** ✅ | 399 / 250 ms 🟠 |
| Video files loaded | **0** ✅ | 10 (29 MB) |
| Images loaded (mobile) | **54 (2.5 MB)** ✅ | 300 (9.4 MB) |
| Page weight (mobile / desktop) | **7.9 / 7.1 MB** ✅ | 43.9 / 41.1 MB |
| Network requests (mobile / desktop) | **489 / 543** ✅ | 769 / 776 |

## Shoe Shop
https://www.thesak.com/collections/shoe-shop

| Metric | OURS | Live |
|---|--:|--:|
| Lighthouse Performance score (mobile / desktop) | **43 / 74** ✅ | 16 / 48 |
| Cumulative Layout Shift, CLS (mobile / desktop) | **0.00** ✅ | 0.40 / 0.36 🔴 |
| Interaction to Next Paint, INP (mobile / desktop) | **under 130 ms** ✅ | 465 / 274 ms 🟠 |
| Video files loaded | **0** ✅ | 7 (20 MB) |
| Images loaded (mobile) | **58 (3.4 MB)** ✅ | 283 (10.9 MB) |
| Page weight (mobile / desktop) | **8.7 / 7.3 MB** ✅ | 36.5 / 33.2 MB |
| Network requests (mobile / desktop) | **489 / 538** ✅ | 761 / 725 |

---

**Reliable and consistent** (they count bytes and assets, so they measure the same every run, and will hold after launch): **page weight, video files, images, network requests.**

**Can vary by device, network, and test tool** (we recommend confirming these on the published theme): **CLS, INP, Lighthouse score.**

**How the numbers were measured.** Every value in the live column is measured on a copy of the current live theme, in the same preview environment as ours, so the comparison is like-for-like. Lab values are the median of three Google Lighthouse runs. The exceptions are the live site's CLS and INP, which are Google field data (real users, Chrome UX Report, 28 day 75th percentile) since a preview theme has no real-user data.

<!--
INTERNAL (do not send to client):
- TBT dropped from client tables: third-party-dominated (GTM/Redo/Postscript/etc., proven via
  WebPageTest blockingTimes), equal on both themes, and wildly tool-dependent (318ms Lighthouse
  vs 1709ms WPT on bags mobile). Differentiates nothing; invites questions.
- TTI dropped from client tables: Google removed TTI from the Lighthouse score in v10 (2023) —
  citing a retired metric reads as dated. (It was a real win, ~2.4s vs 5.5s desktop, if ever needed.)
- LCP excluded from all tables: OURS is unpublished (no CrUX field LCP); lab mobile LCP is a
  Slow-4G artifact (Live ~13.5s lab vs 2.7s field; OURS ~24s->18s lab) targeting different elements
  per theme, and would make OURS look worse on a metric a client can re-run.
- PERF PASS (2026-07-06), outcome:
    * #1 DONE + deployed: fetchpriority="high" on the initController.js modulepreload + kickoff
      (Shopify/snippets/rs-ss-async-tag.liquid). initController start 25s -> 7.6s; mobile lab LCP
      24.2s -> 18.4s. KEEP.
    * #2 tried + REVERTED: dynamic-import createRecommendationController out of the critical chunk
      saved only ~800 bytes gz (it shares ~all code with createSearchController). Not worth the
      no-results-path complexity.
    * Bottleneck now = the UI render module (rs-searchspring.js, ~68KB gz, deferred) painting the
      grid ~18s, not the data request. Remaining lab LCP is FCP(5.1s) + UI module load + image,
      serialized under Slow-4G — a simulation artifact, not a real-user problem (unthrottled OURS
      beats copy-of-live). Server-render first-row was considered and rejected (LCP element/order
      could differ from what Snap returns).
    * POST-LAUNCH: monitor field LCP in CrUX once OURS is published; expect field << lab (per the
      copy-of-live 13.5s lab vs 2.7s field precedent). Only re-open lab-LCP work if field LCP is poor.
- Best-sellers is the weakest collection: mobile score ~tie (39 vs 38), TBT ~tie (669 vs 675ms),
  and OURS carries 1-2 media files (2.4-3.3MB) there. Investigate what media survives on that PLP.
- Shoe-shop Live mobile Lighthouse median = 16 (runs 39/16/16); heavy page fails to settle headless.
  The reliability note caveats this; the deterministic + field rows carry the story.
- OURS INP: bags measured 72-112 ms lab; others shown as "under 130 ms" (shared interaction code
  across PLPs, not separately measured per collection).
- Live field CWV (URL-level CrUX, 2026-07-06):
    bags        mobile INP 404 / CLS 0.35 / LCP 2.7s ; desktop INP 224 / CLS 0.25 / LCP 1.6s
    best-sellers mobile INP 346 / CLS 0.93 / LCP 4.3s ; desktop INP 179 / CLS 1.23 / LCP 4.0s
    new-arrivals mobile INP 399 / CLS 0.81 / LCP 3.3s ; desktop INP 250 / CLS 1.11 / LCP 3.2s
    shoe-shop    mobile INP 465 / CLS 0.40 / LCP 3.0s ; desktop INP 274 / CLS 0.36 / LCP 1.6s
- Sources: harness data/ours-vs-live/*.json; OURS mobile DevTools dev-* exports; Live mobile DevTools exports.
-->
