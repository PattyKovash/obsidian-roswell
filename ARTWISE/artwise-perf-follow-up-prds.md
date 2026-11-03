# ArtWise Performance — Follow-up PRDs

Distinct, copy-paste-ready tickets, one per recommendation from the performance audit (`artwise-performance-audit.md`). Each is self-contained. Fill the Monday ID into the filename when created: `ARTWISE-ISSUE-<MONDAY_ID>-<slug>.md`.

**Global scope note (applies to all):** `Shopify/assets/theme.css` and `theme.js` are the compiled **Broadcast (Presidio Creative) vendor theme** — do **not** hand-edit them. `Shopify/src/**` (Preact/Vite) and the Liquid templates/sections/snippets are ours to change. Respect app-owned surfaces per `vault/01-mcd/do-not-touch.md` (ArtPlacer, Atoms.ai, Gorgias, Saved By, Afterpay). Re-measure each fix with `scripts/perf-audit.mjs`.

---

# PRD 1 — Optimize image weight (right-size + modern format)
`ARTWISE-ISSUE-<MONDAY_ID>-image-weight-optimization.md`

## Background:
- Images are the single largest part of every page (WebPageTest, cold first-view): Home **5.86 MB mobile / 2.14 MB desktop**, Collection 2.47 / 0.72, Product 0.87 / 0.44. Reducing image weight — while preserving artwork quality — is the biggest single performance win.
- **Mobile is served larger images than desktop** because high-DPR phones request 2–3× the display width. That over-fetch is the top mobile lever.

## Necessary Info (Design/Documentation):
- Applies to all templates; Home is worst.
- **Hard constraint: preserve artwork quality.** ArtWise was fined $500/instance by the David Hockney Foundation; do NOT degrade artwork with heavy lossy compression. Use high-quality modern formats + correct sizing, not quality reduction.
- Shopify's image CDN auto-negotiates WebP/AVIF by browser when images are served via `image_url`/`image_tag`.

## Constraints / Scope:
- IN: image sizing (`srcset`/`sizes`/width caps), modern-format delivery, and reducing high-DPR mobile over-fetch.
- OUT: lossy quality reduction of artwork; lazy-load *timing* (covered by PRD 2).

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | Cold first-view image weight is materially reduced on mobile (baseline: Home 5.86 MB, Collection 2.47 MB, Product 0.87 MB) with no visible loss of artwork quality. |  |  |  |
| 2 | Mobile no longer over-fetches vs desktop for the same slots — `srcset` max widths / `sizes` are capped so high-DPR devices request appropriately-sized images. |  |  |  |
| 3 | Images are delivered in a modern format (WebP/AVIF) where supported. |  |  |  |
| 4 | No visual/quality regression on artwork across Home, Collection, Product (side-by-side check). |  |  |  |

## Dev Notes:
- Shared renderer: `snippets/image.liquid` (`image_tag` with `widths`/`sizes`/`aspect_ratio`); grid via `snippets/product-grid-item.liquid` (`sizes` computed ~lines 86–111, `widths` + `render 'image'` ~615–623); hero via `snippets/image-hero.liquid`.
- **Over-fetch fix:** review the `widths` arrays and `sizes` strings — cap the largest offered width to ~2× the real display size (DPR 2), not 3×; make `sizes` reflect the actual rendered width per breakpoint. `image.liquid:32` caps at 5760, likely far too high for card/mobile slots.
- **Format:** confirm all rendering uses Shopify `image_url`/`image_tag` (auto WebP/AVIF); grep for any legacy `img_url` with an explicit `format:` forcing a heavier format.
- Measure before/after with WebPageTest (Assets → image bytes) on the 3 baseline URLs, mobile + desktop.

## Clarifying Questions:
- What's the acceptable max resolution / quality floor for artwork (to set DPR/width caps without degrading quality)? Confirm with design/brand.

## Bugs from QA:
- TBD

---

# PRD 2 — Lazy-load below-the-fold homepage product images
`ARTWISE-ISSUE-<MONDAY_ID>-homepage-grid-image-priority.md`

## Background:
- From the performance audit: the homepage loads too many product images at once at high priority, including images far below the fold, which competes with the main content on a first visit.
- Root cause: product cards decide "load eagerly" based on position *within their own grid*, not position *on the page*. So every stacked collection section on the homepage eagerly loads its first row — even sections the shopper hasn't scrolled to.

## Necessary Info (Design/Documentation):
- Affected page: **Home** (`templates/index.json`). The collection-rendering sections are `section-tab-collections`, `section-collections-list`, `section-collection` — stacked as sections #4–#6, all below the fold.
- No visual/design change — images look identical; only their *load timing* changes.
- Current state: the hero and slideshow already load correctly (position-aware). Only the product grid is position-blind.

## Constraints / Scope:
- **IN:** homepage collection sections only.
- **OUT:** the Collection template grid, search, related products, and ajax-loaded cards must keep today's behavior (their first row *should* load eagerly). This is why the change must be **opt-in**, not a default flip.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | On the homepage, product images in collection sections below the fold load lazily (as the shopper scrolls), not eagerly on first paint. |  |  |  |
| 2 | The first above-the-fold section keeps its current eager/high-priority loading. |  |  |  |
| 3 | The Collection template, search results, related products, and ajax-loaded cards are unchanged (first row still eager). |  |  |  |
| 4 | No visual or layout regression on the homepage grids. |  |  |  |

## Dev Notes:
- Snippet: `snippets/product-grid-item.liquid` — eager decision at ~lines 118–131 (`eager_images_limit`, `loading`) and `fetchpriority` at ~615–623. It uses the per-grid `index`, with **no `section.index` check**.
- Reference pattern to mirror: `snippets/image-hero.liquid` ~line 54 — `if section.location == 'template' and section.index < 3` → eager, else lazy (position-aware).
- **Approach (opt-in, safe):** add an optional param, e.g. `force_lazy` / `priority`, to `product-grid-item`, defaulting to current behavior. In the three homepage sections, pass it so their grids lazy-load (or gate eager on `section.index`). Example in each section's `render 'product-grid-item'` call: add `force_lazy: true` for below-fold instances.
- **Blast radius — do not change the default:** `product-grid-item` is rendered by 15 callers (`sections/collection.liquid`, `search.liquid`, `snippets/products-recommendation.liquid`, `sections/api-product-grid-item.liquid`, `article-inline-product-grid.liquid`, `multicolumn.liquid`, etc.). Only the three homepage sections opt in.

## Bugs from QA:
- TBD

---

# PRD 3 — Optimize homepage autoplay video (poster + on-demand)
`ARTWISE-ISSUE-<MONDAY_ID>-hero-autoplay-video.md`

## Background:
- The audit found autoplay video near the top of the homepage adding weight to the initial load. Replacing autoplay with a poster image + play-on-interaction removes that weight without changing the look at rest.

## Necessary Info (Design/Documentation):
- Affects **Home** (and Collection where applicable): `sections/section-hero.liquid` (background video) and `sections/section-slideshow-nested.liquid` (video slides via the `_slide-video` block).
- Design: first frame / poster image should match today's appearance; confirm with design whether autoplay must be preserved for brand reasons.

## Constraints / Scope:
- IN: hero + hero-slideshow video on Home/Collection. OUT: product-page gallery video (already loads lazily with `preload:'none'`).

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | Hero/slideshow video is not fully downloaded on first paint (poster image shown first; video loads on interaction or when in view). |  |  |  |
| 2 | Above-the-fold appearance at rest is unchanged. |  |  |  |
| 3 | No regression to product-page gallery video. |  |  |  |

## Dev Notes:
- `snippets/hero.liquid` ~line 174: `video_tag: image_size: '500x', autoplay: true, loop: true, muted: true`. Consider `preload: 'none'` + poster, or defer init until in-viewport.
- Slideshow video: `blocks/_slide-video.liquid` (rendered via `snippets/slide.liquid`).

## Clarifying Questions:
- Does the brand require autoplay on the hero, or is play-on-interaction acceptable?

## Bugs from QA:
- TBD

---

# PRD 4 — Scope the Preact/Vite bundle to load only where used
`ARTWISE-ISSUE-<MONDAY_ID>-scope-preact-bundle.md`

## Background:
- The custom Preact/Vite component framework — built as the foundation for interactive UI — currently initializes on **every** page, including pages that don't yet use any of its components. Scoping it to load only where its components are present (and minifying it for production) removes unused JavaScript from every page load.

## Necessary Info (Design/Documentation):
- This is **our** code (`src/`, output `assets/main2.js` + `vendor.js`). No visual change — no storefront component is currently mounted from this bundle.
- The Tailwind CSS output (`assets/main.css`) is a **separate** build output that a couple of sections *do* use — it must keep building. This ticket changes the **JS** only.

## Constraints / Scope:
- IN: stop shipping the JS bundle site-wide; minify it; remove the dev-only debug import.
- OUT: removing `main.css`/Tailwind (separate, higher-risk — it carries `app.scss` + `.rte` styles). Keep it.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | `main2.js` no longer loads on pages that mount no Preact custom element (currently: all pages). |  |  |  |
| 2 | The production JS build is minified and does not include `preact/debug`. |  |  |  |
| 3 | `main.css` still builds and loads; sections that use `rs-` classes and `.rte` styling are visually unchanged. |  |  |  |
| 4 | Cart behavior and all pages function identically to before (no console errors). |  |  |  |

## Dev Notes:
- The bundle is inert today: `src/entrypoints/main.tsx` imports only the cart lib, `CartProvider`, `GlobalProvider`, and a `HelloWorld` demo. The registered elements (`global-provider`, `cart-provider`, `hello-world`) appear in **no** `.liquid`/`.json` — nothing mounts them. Confirm before removing that no template relies on `window.Shopify.cart` from `src/lib/cart.ts` (the Broadcast theme has its own cart JS).
- Injection: `snippets/importmap.liquid:4` (`"main/main": main2.js`) + the `main.tsx` branch in `snippets/vite.liquid`. Gate/remove these so `main2.js` isn't injected globally (keep the `main.scss`→`main.css` branch).
- Minify: `vite.config.js:56-57` — `minify: false` → `'esbuild'`, `sourceMap: true` → `false`. Remove `import "preact/debug"` from `main.tsx` (or make it dev-only).
- When real Preact components ship later, inject `main2.js` conditionally on the templates/sections that use them.

## Bugs from QA:
- TBD

---

# PRD 5 — Set fetchpriority=high on the homepage hero image
`ARTWISE-ISSUE-<MONDAY_ID>-hero-image-fetchpriority.md`

## Background:
- Home is the one page whose main-image metric is weakest (still passing). Marking the hero image as high-priority tells the browser to fetch it first, nudging that metric.

## Necessary Info (Design/Documentation):
- Affects **Home** hero (`sections/section-hero.liquid` → `snippets/hero.liquid` → `snippets/image-hero.liquid`). The hero image already loads eagerly; it just isn't marked high-priority.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | The homepage hero image renders with `fetchpriority="high"`. |  |  |  |
| 2 | Only the hero (first above-the-fold image) is high-priority — no additional images are promoted. |  |  |  |
| 3 | No visual regression; other sections using `image-hero` are unchanged. |  |  |  |

## Dev Notes:
- `snippets/hero.liquid` ~lines 121 & 133 render `image-hero` **without** `fetchpriority`. Pass `fetchpriority: 'high'` from the hero call only.
- Do **not** change the default in `snippets/image-hero.liquid` — it's shared by 16 callers.

## Bugs from QA:
- TBD

---

# PRD 6 — Remove orphaned/unused theme assets
`ARTWISE-ISSUE-<MONDAY_ID>-remove-orphaned-assets.md`

## Background:
- The theme ships files that nothing references, adding size and clutter.

## Necessary Info (Design/Documentation):
- `assets/ebay-bootstrap.css` (~120 KB) — referenced nowhere in the theme.
- `assets/theme.dev.js` (~273 KB) — a development file, not served in production.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | `assets/ebay-bootstrap.css` is removed and no page references it (no 404s, no visual change). |  |  |  |
| 2 | `assets/theme.dev.js` is removed (or excluded from the theme) with no functional change. |  |  |  |

## Dev Notes:
- Verify zero references before deleting: `grep -rn "ebay-bootstrap" Shopify/` returns nothing outside the asset itself. `theme.dev.js` is only referenced in a commented-out line in `snippets/head.liquid` (~774).

## Bugs from QA:
- TBD

---

# PRD 7 — Reduce font preloads to ≤2
`ARTWISE-ISSUE-<MONDAY_ID>-reduce-font-preloads.md`

## Background:
- The theme preloads five font files. Shopify recommends ≤2 resource hints per template; five preloads compete with the hero/LCP image early in the load. Reducing to the two most-critical fonts is a small, controllable win.
- Note: consolidating the three font providers (Shopify + Google + Adobe Typekit) was considered and **not** included — it's a brand/licensing decision outside our control and low impact (fonts already use `font-display: swap`, so they don't block text/LCP). This ticket is only the preload reduction.

## Necessary Info (Design/Documentation):
- Affects all templates. Keep preloading only the fonts used in above-the-fold text (typically body + one heading); drop the rest to normal (non-preload) loading. `font-display: swap` already prevents invisible text.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | No more than two `<link rel="preload" as="font">` hints render per template. |  |  |  |
| 2 | The preloaded fonts are the ones used in above-the-fold text. |  |  |  |
| 3 | No layout shift or fallback-font-flash regression versus current. |  |  |  |

## Dev Notes:
- `snippets/head.liquid` ~lines 619–631 — five `font_url` preloads, each gated by `unless .system?`. **Live active theme = ~4 preload tags for 3 distinct fonts:** base = Inter, header = Bricolage Grotesque, nav = Nunito Sans, btn = Nunito Sans (**same file as nav — duplicate preload**), subheading = system (already skipped). Because fonts are driven by theme settings, **don't hardcode which roles to drop** — de-duplicate dynamically so it stays correct if settings change.
- **Preferred: dynamic de-dupe.** Track preloaded font URLs and skip repeats:

```liquid
{%- assign seen_fonts = '|' -%}
{%- for role in 'base,header,nav,btn,subheading' | split: ',' -%}
  {%- case role -%}
    {%- when 'base' -%}{%- assign f = settings.type_base_font -%}
    {%- when 'header' -%}{%- assign f = settings.type_header_font -%}
    {%- when 'nav' -%}{%- assign f = settings.type_nav_font -%}
    {%- when 'btn' -%}{%- assign f = settings.type_btn_font -%}
    {%- when 'subheading' -%}{%- assign f = settings.type_subheading_font -%}
  {%- endcase -%}
  {%- unless f.system? -%}
    {%- assign u = f | font_url -%}
    {%- unless seen_fonts contains u -%}
      <link rel="preload" as="font" href="{{ u }}" type="font/woff2" crossorigin>
      {%- assign seen_fonts = seen_fonts | append: u | append: '|' -%}
    {%- endunless -%}
  {%- endunless -%}
{%- endfor -%}
```

- De-dupe alone: 4 → 3 (removes the nav/btn duplicate; skips system). **Optional** to reach ≤2: only include the above-the-fold roles (`base`, `header`) in the loop list. `@font-face` declarations (~146–165) stay, so all fonts still load with `font-display: swap` — only preload hints change.
- Verify: `document.querySelectorAll('link[rel="preload"][as="font"]').length` on the live page.
- **Note:** minor win — fonts are ~458 KB and already `font-display: swap` (non-blocking). Do this as cheap hygiene, not for measurable LCP movement.

## Bugs from QA:
- TBD

---

# PRD 8 — App audit & leftover-code cleanup
`ARTWISE-ISSUE-<MONDAY_ID>-app-audit-ghost-code.md`

## Background:
- Installed apps inject scripts on every page and are a common source of slowness. This ticket inventories them and removes leftover code from any removed/unused app.

## Necessary Info (Design/Documentation):
- Known inline app code: the MakeAnOffer block in `layout/theme.liquid` (~lines 62–114) serializes product/variant/collection data on every page and sits **after** `</html>`.
- **Do not remove or modify app-owned surfaces** on the do-not-touch list: ArtPlacer (PDP "View in a Room"), Atoms.ai (search + `atomz.css`), Gorgias (chat), Saved By (wishlist), Afterpay (BNPL).

## Constraints / Scope:
- IN: inventory apps; remove ghost code from apps no longer installed; move/clean the MakeAnOffer block if it's still in use (relocate inside `<body>`, load only where needed).
- OUT: removing any active revenue/critical app. App removal is a **client decision**.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | A list of installed apps and the per-page scripts each injects is produced. |  |  |  |
| 2 | Leftover code from any uninstalled app is removed (no console errors, no visual change). |  |  |  |
| 3 | The MakeAnOffer inline block is valid HTML (inside `<body>`) and only loaded where the feature is used. |  |  |  |
| 4 | All do-not-touch app surfaces remain untouched and functional. |  |  |  |

## Dev Notes:
- `layout/theme.liquid:62-114` — MakeAnOffer `<script>` currently after the closing `</html>` tag.

## Clarifying Questions:
- Which installed apps are still actively used? (Client confirmation needed before removing any.)

## Bugs from QA:
- TBD

---

# PRD 9 — Minify theme.css at deploy (low priority)
`ARTWISE-ISSUE-<MONDAY_ID>-minify-theme-css.md`

## Background:
- `theme.css` ships unminified. Minifying reduces its uncompressed (parse) size. Note: modest payoff — the file is already served compressed, so wire savings are small. Low priority.

## Objective/Acceptance Criteria:
| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | The deployed `theme.css` is minified (comments/whitespace stripped) with no style regressions across Home, Collection, Product. |  |  |  |
| 2 | The minify step is repeatable on future Broadcast updates (build step, not a one-off hand edit). |  |  |  |

## Dev Notes:
- `assets/theme.css` (~569 KB raw, ~87 KB gzip). Add a `cssnano`/`clean-css` step at deploy; do not hand-edit the vendor file. Re-run when Broadcast is updated.

## Bugs from QA:
- TBD
