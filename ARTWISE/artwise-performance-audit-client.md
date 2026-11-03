# ArtWise Website Performance Review
**Prepared by Roswell Studios, 2026-07**

## Summary

- We reviewed your three core page templates, each measured on its **highest-traffic page over the last 90 days** so the baseline reflects what most visitors actually experience: the homepage (`/`), the top product page (`/products/aw1005`), and the most-visited collection (`/collections/all`). We used real visitor data, lab tests, and a review of the theme code.
- This review looks at two things: Google's Core Web Vitals (the official speed-health metrics), and the factors that can make a store feel sluggish even when those metrics are healthy.
- Scope note: this covers the default product & collection templates and the homepage. Any custom product or collection layouts would need their own review.
- Your traffic is roughly **60% mobile, 40% desktop** (last 90 days), so both experiences matter, and the numbers below cover each.
- Good news: by Google's Core Web Vitals standard, your site passes on all three page types. Speed is not putting your search ranking at risk today.
- At the same time, the pages are heavy on a first visit, loading a lot of data and images at once. On a fast connection or a repeat visit this is most likely not noticeable. On a phone or a first-time visit it can feel slow, especially on a slower network, which is the experience that was flagged.
- The improvements below are targeted tuning, not a rebuild. Each is small to medium effort and can be scheduled on its own.

## Passing the health check while still feeling heavy

Google's pass/fail score is based on your typical visitor, and many of them are on fast connections or returning with files already saved from a previous visit. A first-time visit on a mid-range phone downloads everything fresh, and that first load is genuinely heavy. So the average score can look healthy while individual first visits still feel slow. Reducing the weight is what improves those first visits.

## What's already working well, no action needed

- Responsiveness to taps and clicks is excellent.
- The page stays visually stable as it loads, with no content jumping around.
- Product pages and image galleries already load their main image first, the right way.
- Collection pages already load a limited set of products and fetch more as the shopper scrolls.

## What's driving the heaviness

1. Ships heavy images (the single biggest part of the page), and on mobile, visitors are served *larger* (retina) images than desktop. It also loads many at once, including images far down the page that could wait until the shopper scrolls to them.
2. Plays autoplay video near the top of the homepage.
3. Loads one JavaScript bundle on every page that most pages don't actually need.
4. Preloads several fonts at once, one of them a duplicate of the same font.
5. Ships a few leftover, unused files.

## Recommendations (priority order)

| Priority | Improvement | Why it helps | Effort |
|:--:|---|---|:--:|
| 1 | Optimize images: serve right-sized, compressed versions (especially fix the oversized mobile images) and lazy-load off-screen ones | Images are the biggest part of the page, so this is the single largest weight reduction, with quality preserved | M |
| 2 | Optimize the homepage autoplay video (show a still image first, play on demand) | Removes video weight from the initial load | S/M |
| 3 | Give the homepage's main image top loading priority | Improves the homepage's one weaker metric | S |
| 4 | Remove leftover, unused theme files | A smaller, cleaner theme | S |
| 5 | Preload only the two above-the-fold fonts, not several (one preload is currently a duplicate of the same font) | Fewer font files competing with the main image early; the rest still load normally | S |
| 6 | Stop loading one JavaScript bundle site-wide that most pages don't use | Removes that bundle's weight from those page loads. This is JavaScript in our control and does not require a major structural change to the underlying theme | S/M |
| 7 | Review installed apps for unused or leftover code | Fewer third-party scripts on every page | M |

## Current baseline (our starting point)

Real-visitor Core Web Vitals (Google's health metrics, last 30 days). All three page types are within Google's "Good" range:

| Page | Loading (LCP) | Responsiveness (INP) | Visual stability (CLS) | Result |
|---|--:|--:|--:|:--:|
| Home | 2.3 s | 88 ms | 0.00 | Pass |
| Collection | 1.5 s | 48 ms | 0.00 | Pass |
| Product | 1.8 s | 92 ms | 0.01 | Pass |

First-visit page weight (what the improvements reduce), measured cold on WebPageTest for both mobile and desktop with the same tool:

| What loads (Mobile / Desktop) | Home | Collection | Product |
|---|--:|--:|--:|
| **Total page weight** | **8 / 3.2 MB** | **6 / 2.0 MB** | **2 / 2.0 MB** |
| Total requests | 140 / 157 | 147 / 162 | 182 / 207 |
| Images | **5.9 / 2.1 MB** | 2.5 / 0.7 MB | 0.9 / 0.4 MB |
| Video | 1.2 / 0.1 MB | **2.8 / 0.4 MB** | 0 |
| JavaScript | 0.6 MB | 0.6 MB | 0.9 / 1.0 MB |
| Fonts | 0.3 MB | 0.3 MB | 0.5 MB |

The homepage is the heaviest, driven mostly by **images**, and mobile visitors are served noticeably larger images than desktop (5.9 MB vs 2.1 MB on the homepage). We re-measure the same way after each improvement to show the change.

## How we'll measure success

Every improvement is filed as its own scoped ticket and re-measured against a repeatable baseline, so we can show a clear before and after for each one. It helps to treat two kinds of metric differently:

- **Stable and consistent (measure every run):** page weight, bytes downloaded, number of images and videos, and request counts. These count bytes and assets, so they measure the same on every test and hold after each fix ships. This is our primary before-and-after evidence per improvement, measured with WebPageTest.
- **Best judged on real users (field data):** Core Web Vitals (LCP, INP, CLS). These vary by device, network, and test tool, so a single lab run is not reliable for them. Your Core Web Vitals are already strong, so the right way to evaluate them is Google's 28-day real-user field data (CrUX and the Shopify Web Performance report).

Because your Core Web Vitals already pass, the primary before-and-after evidence for these improvements is the weight reduction. We monitor field Core Web Vitals to confirm nothing regresses and to catch any gains for slower-device visitors.
