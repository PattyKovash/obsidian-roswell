# Handoff: ingredient arch images not filling their container (LoveAmika Hydrogen)

_2026-10-01_

## Symptom
On `/collections/smooth` and `/collections/color` (both loveamika.ca and loveamika.com), the ingredient cards from `app/components/modules/MicroContentCardGrid.tsx` sometimes show the image smaller than its arch container.
- **On /smooth:** a cream band shows around the image and looks like a border.
- **On /color:** the container is cream on a cream page, so the arch is invisible. The image looks like a rectangle with only its top corners clipped.
- **It seems random:** it changes with screen, refresh, cache and resize.

## Root cause
PR #1225 (`release/LA-v2026.40` into `main`, merged 2026-09-29) caused it, specifically commit `5149597c` ("feat: h1/image size remaining issues"). That commit added `.fit('max')` to the srcset URLs in `app/components/media/SanityImage.tsx`, and to `HeroImagePreload.tsx`, which must match it.

`fit('max')` makes the Sanity CDN return the source image at its native size when the requested width is larger. The srcset `w` labels weren't changed, so they no longer match the files:

```
…-320x364.png?w=1024&q=80&fit=max&auto=format 1024w   ← labelled 1024px, file is 320px
```

The browser computes an image's natural CSS width as the file's real pixel width ÷ (label width ÷ `sizes` value).
- **Before the PR:** the label always matched the file, so the natural width always equalled the `sizes` value (`400px` here). CSS (`w-full max-w-full`) capped it at 160px, so it filled the box.
- **After the PR, on a 2× screen:** the browser picks the `1024w` candidate. 1024 ÷ 400 = 2.56, and 320 ÷ 2.56 = 125px.
- **After the PR, on a 1× screen:** the browser picks the `640w` candidate. 320 ÷ 1.6 = 200px, which is still at least 160, so it looks fine.

Which candidate gets used depends on screen density, which versions are already cached, and resizes. Before the image loads, the `width`/`height` attributes size it. That explains why the bug looks random.

The component makes it visible because the container is `grid h-44 place-content-center`. With content-centring, the grid column isn't stretched; it sizes to the image. The image's `w-full` then resolves against that column, so the image ends up at its natural width instead of the container's width.

## Evidence (Playwright)
- **1440×900 at 1×:** every ingredient image is 160×182 (`w=640` candidate, natural width 200). Correct.
- **1440×900 at 2×:** every ingredient image is 125×142 (`w=1024` candidate, natural width 125). Broken, on both .ca and .com. This matches the user's screenshot, where a red outline on the container showed a 160×176 dome with a roughly 125px image centred inside it.
- **Live CSS override at 2×:** pinning the image with `absolute inset-0 h-full w-full` gives exactly 160×176. That proves the cause, but this is not the chosen fix.

## Why `fit('max')` was added (keep it)
`seo-task7-findings.md` on `main`, section 3, explains it. It was for an SEO audit of images over 100KB: the CDN was enlarging small sources to 1920px.
- **Crawler, sending `Accept: */*`:** a 750px source served as a 12.7MB PNG became 2.4MB.
- **Browsers:** the same image went from 161KB AVIF to 77KB WebP.

The reasoning is sound. The doc just didn't account for the srcset labels now being wrong.

## Recommended fix: `SanityImage.tsx` only, no layout or component changes
Keep `fit('max')`, but only list srcset candidates the source can actually deliver, with truthful labels. `main` already parses the source dimensions from the asset ref (`parseDimensionsFromRef`, which reads `image-<id>-<W>x<H>-<ext>`), and it already computes the cropped width.

```ts
// sourceWidth = cropped intrinsic width (intrinsicWidth * (1 - crop.left - crop.right)), rounded
const maxBp = breakpoints[breakpoints.length - 1];
const isSvg = /-svg$/.test(src); // Sanity serves SVGs untouched; leave their srcset as-is
const candidates =
  !isSvg && sourceWidth && sourceWidth < maxBp
    ? [...breakpoints.filter((w) => w < sourceWidth), sourceWidth]
    : breakpoints; // large (≥1920) or unknown-size sources → unchanged
// Do NOT append sourceWidth for large sources: a 3000px source would gain a
// 3000w candidate and retina desktops would fetch bigger files than today.
// emit `${urlBuilder.width(w).fit('max').auto('format').quality(q)} ${w}w`
```

What this gives:
- **Examples:** a 320px source produces a single `320w` candidate. A 1256px source produces `640w, 768w, 1024w, 1256w`.
- **Layout restored:** the labels match the files again, so every `SanityImage`'s natural width goes back to exactly what it was before #1225 (equal to the `sizes` value). That brings back the old layout everywhere.
- **Savings kept:** the files are still capped at native size, so the bandwidth savings stay.
- **Wider impact:** in principle, any `SanityImage` whose rendered size depends on the image's own size is affected. In practice the audit below found two confirmed regressions.

## Blast radius (audited 2026-10-01 against `origin/main`)
There are 31 `SanityImage` call sites across 28 files.

**Key fact:** since `928d18d8` (June 2026, the CLS work), `SanityImage` emits `width`/`height` attributes from the cropped source size. An image with no CSS width therefore gets its width from that attribute, not from the srcset, so it is immune to this bug. The bug only bites where CSS sets a *percentage* width that resolves against a container sized by its content.

A live sweep backs the code read; method and full results are in the next section.

| Component | Status | Evidence |
|---|---|---|
| `modules/MicroContentCardGrid.tsx` | **Regressed by #1225** | 160px at 1×, 125px at desktop 2×, 100px at mobile 3×. The simulated fix gives 160px at every density. |
| `ingredients/IngredientDetail.tsx` | **Regressed by #1225 (mobile retina)** | Measured on `/ingredients/sea-buckthorn-seed-oil` (900×900 JPG, no `sizes` so 100vw, wrapper is a content-sized flex item). Mobile 390@3×: **274px today** vs 350px before #1225 and 350px with the simulated fix, so the image no longer fills its column. Desktop 2× currently gets away with it (natural width 675px is above the 628px column). Any Sanity source under about 840px would show it on desktop retina too. |
| `modules/Marquee.tsx` | **Separate older bug, not #1225** | The icon is an SVG (`…-54x32.svg`). Sanity ignores `w=` for SVGs, so it was mis-sized before #1225 too: 51×30 at desktop 1×, 27×16 at desktop 2×, 16×10 at mobile, against the intended 54×32. Removing `fit=max` changes nothing. The fix would change it to 54×32 unless SVGs are skipped (hence `isSvg` above). Worth a separate decision. |
| The other 28 call sites | **Unaffected** | Each has a definite CSS width: `absolute h-full w-full` in padded-ratio boxes (DataPill, Steps, PerkUp ×2, PromotionCards, HalfAccordions, DataPills), `layout="fill"`/`fill*`/`responsive` (CallToAction, VideoCTA, Grid, Image, ImageWithProductHotspots), fixed sizes (IconsGrid, IngredientsIconsGrid, MobileNav `h-5 w-5`), `w-full` in a definite-width parent (Card, CollectionList, FeaturedArticle, PromoGrid ×2, pageHero, featuredArticleHero), or no CSS width, so the attribute plus `max-width:100%` applies (ArticleCard, ContentCarouselCard, AuthorLink, MobileNav icon, the blog article featured image). The sweep showed no density-dependent widths outside the components above. |

## Sweep: method and results
**Principle:** layout should never depend on screen density. Any Sanity image that renders at a different CSS width at 1× than at 2×/3× is reading its size from the srcset, which makes it vulnerable.

**Script:** `sanity-image-density-sweep.js`, saved next to this doc. Run it with the Playwright MCP tool `browser_run_code_unsafe` and pass `filename`. It takes about 2–3 minutes. For each page and configuration it:
1. Opens a fresh browser context at the given viewport and `deviceScaleFactor` (no shared cache).
2. Sets every `img` to `loading="eager"` and waits until every `img[srcset*="cdn.sanity.io"]` is `complete`.
3. Records each Sanity image's rendered width/height, its parent's width, its `naturalWidth`, its classes and its asset id.
4. At high density only, **simulates the fix** by rewriting each srcset in the page with truthful labels: for raster sources narrower than 1920px, use the breakpoints below the source width plus the source width itself. Sources of 1920px or wider and SVGs are left as they are. It then waits for the images to reload and measures again.
5. Reports (a) every image whose width differs by more than 2px between 1× and high density, with its width after the simulated fix, and (b) every image that was density-stable but changed after the simulated fix. Type (b) would be a regression introduced by the fix.

To check what an image looked like **before #1225**, a separate spot check strips `&fit=max` from the srcset in the page and re-measures. Without `fit=max` the CDN enlarges the file to the requested width, so the labels become truthful again.

**Configurations:** desktop 1440×900 at 1× vs 2×; mobile 390×844 at 1× vs 3×.

**Pages and Sanity image counts (desktop):**

| Page | Sanity `<img>` count |
|---|---|
| `/` | 33 |
| `/collections/smooth` | 33 |
| `/collections/color` | 9 |
| `/blogs/the-strand` | 13 |
| `/blogs/the-strand/finally-amika-body-care-is-here` | 4 |
| `/ingredients/aloe-barbadensis-leaf-extract` | 0 (Shopify image; replaced below) |
| `/ingredients/sea-buckthorn-seed-oil` | 1 (measured separately) |

**Results** (rendered CSS width; "pre-#1225" means `fit=max` stripped):

| Page / component | Config | Today | Pre-#1225 | Simulated fix |
|---|---|---|---|---|
| /smooth & /color: MicroContentCardGrid (320×364 PNG, 5 + 4 images) | desktop 1× | 160 | 160 | 160 |
| | desktop 2× | **125** | 160 | 160 |
| | mobile 1× | 160 | 160 | 160 |
| | mobile 3× | **100** | 160 | 160 |
| /ingredients/sea-buckthorn-seed-oil: IngredientDetail (900×900 JPG) | desktop 1× | 628 | 628 | 628 |
| | desktop 2× | 628 (natural width 675, close) | 628 | 628 |
| | mobile 1× | 350 | 350 | 350 |
| | mobile 3× | **274** | 350 | 350 |
| /smooth: Marquee icon (54×32 **SVG**, ×6) | desktop 1× | 51×30 | 51×30 | 54×32* |
| | desktop 2× | 27×16 | 27×16 | 54×32* |
| | mobile 1× / 3× | 16×10 | 16×10 | 54×32* |

\* The sweep's first run didn't skip SVGs, so the Marquee icon changed under the simulated fix (it was flagged as type (b)). It was mis-sized identically before #1225, so this is an older bug, not this regression. The recommended fix skips SVGs and leaves it unchanged; correcting it is a separate decision.

**Everything else:** no other Sanity image on the swept pages changed width with screen density, and none changed under the simulated fix. That covers the hero/CTA images, product pills, promo grid, carousels, blog cards, blog featured image, icons and the rest.

**Not covered by the sweep:** the swept pages don't show every component (for example AuthorLink, PerkUp, Steps, HalfAccordions, MobileNavigation icons). Those were cleared by reading the code; see the blast-radius table.

## Regression risk of the fix: low
- **Raster sources ≥1920px:** the srcset is byte-identical to today, so nothing changes.
- **Raster sources <1920px:** the srcset gets shorter, but the browser receives the same files (the removed candidates all returned the native-size file anyway). Layout only changes where it depends on the image's natural size, and there it returns to the pre-#1225 behaviour that ran in production for months. The simulated fix changed no image on the 6 swept pages other than the regressed ones (and the Marquee SVG, which `isSvg` now excludes).
- **SVGs:** skipped, so no change.
- **Main risk is implementation, not design:** if the `HeroImagePreload.tsx` srcset drifts from `SanityImage`, the homepage hero downloads twice. Mitigate by sharing one builder function and checking that the preload `imagesrcset` matches the `<img srcset>`.
- **Minor:** crop rounding can make a label 1px off (harmless). The new native-width URLs (for example `w=1256`) are a one-time CDN cache miss.

## Things to handle
1. **`HeroImagePreload.tsx` must produce the same srcset byte-for-byte**, or the homepage hero downloads twice. Best approach: export the srcset builder (and the source-width helper) from `SanityImage.tsx` and import them in `HeroImagePreload.tsx` (it has `image.asset._ref` and `image.crop`), so the two can't drift.
2. **Crop:** use the cropped width, since Sanity's `rect` cropping reduces the real output width. A 1px rounding difference doesn't matter.
3. **`urlDefault`**, the fallback `src` at `w=1920&fit=max`, is fine as it is.
4. **Don't change the layout** in `MicroContentCardGrid.tsx`; the user explicitly doesn't want grid→relative changes. A separate, optional, low-risk tweak there would be `sizes="400px"` → `"160px"` to match `w-40`, but it isn't needed for the fix.

## Branch notes
- The local `release/_candidate` is 589 commits behind origin and doesn't have #1225 yet. Branch from an up-to-date `origin/release/_candidate` (quick-fix flow) or `origin/main`; the user hasn't chosen yet. `origin/release/_candidate` already contains `origin/main`.
- The working tree has unrelated, uncommitted changes in `app/routes/($lang).account.orders.tsx` and `vite.config.ts`. Leave them alone.

## How to verify
With Playwright, check at `deviceScaleFactor` 1 and 2, viewport 1440×900, and also at a mobile width:
- `/collections/smooth` and `/collections/color`: every `div.rounded-t-full.bg-cream img` should render at least 160px wide and fill the arch.
- Homepage: the hero `<link rel=preload imagesrcset>` must exactly equal the hero `<img srcset>`, and the hero image should download only once in the network panel.
- `/ingredients/sea-buckthorn-seed-oil` at 390@3×: the image should be 350px wide (it's 274px today).
- Re-run `sanity-image-density-sweep.js` against a preview deployment (change `BASE`). Images should no longer differ in width between densities, apart from the Marquee SVG, which is unchanged by design. Since the fix is deployed, the in-page simulation should be a no-op.

## Side note (content, not code)
The ingredient PNGs and the pink product-pill PNGs on /smooth already have an arch shape built in: transparent corners with a soft edge. The CSS rounds them again. The built-in arch overlaps the CSS curve by only about 1–2px, so a faint seam can show along the curve even after the fix. Uploading plain rectangular assets would remove that.
