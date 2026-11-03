## Background:

- Source requirement (verbatim from the original ticket): *"PLEASE investigate the page speed and suggest ways to optimize."*

- This is an **investigation + recommendations** ticket, not an implementation ticket. The deliverable is a documented performance audit (baseline + prioritized, scoped fix list). Each recommended fix becomes its own follow-up ticket so the work can be estimated, QA'd, and measured independently.

- Why it matters now (2026): Google weights **real-user field data (CrUX)** over lab scores for ranking, and **LCP + INP are Baseline-available across all browsers as of Dec 2025**, so field data now reflects nearly all visitors — not just Chrome. Slow pages cost twice: lower organic ranking (CWV is a ranking signal) and higher paid CPCs (landing-page experience feeds Quality Score).

- Initial code review of this theme already surfaces likely culprits (see Dev Notes): a **569 KB render-blocking `theme.css`**, an additional **123 KB `ebay-bootstrap.css`** plus `atomz.css` loaded render-blocking, and **five preloaded fonts**. Image handling already uses `fetchpriority`/`loading` attributes in many places, so the largest wins are expected in CSS weight, third-party/app scripts, and font strategy rather than images.

- Desired outcome: a baseline report across the three key template types (home, collection, product) measured with both field and lab data, a ranked list of optimizations with expected impact and effort, and explicit scope boundaries so follow-up tickets can be opened.

## Necessary Info (Design/Documentation):

- **No design work.** This ticket produces a written audit/report; no storefront UI changes are made here.

- **Targets to set client expectations against (2026 consensus, not 100/100):**
  - LCP < **2.5s**, INP < **200ms**, CLS < **0.1**, measured at the **75th percentile (P75)** of real users.
  - A healthy **mobile** PageSpeed score for a feature-rich Shopify store is **60–80**; chasing 100/100 is explicitly a non-goal (Goodhart's law — Shopify itself warns that "speed-score" hacks can hurt real UX).
  - Mobile always scores lower than desktop; that is normal.

- **Field data is the source of truth, lab data is for diagnosis/comparison only.** A single Lighthouse run can be 30%+ off the median — always take the **median of ≥3 runs** under identical conditions.

- **Where field data lives:** Shopify admin → **Online Store → Web performance report** (real-user CrUX data, last 30 days, weighted across page types). Google **Search Console → Core Web Vitals** for the 28-day field trend per URL group.

- **Tooling the audit must leverage (agency-standard, triangulate — no single tool):**
  - **Claude in Chrome** (browser automation) to drive the live measurement: navigate to PageSpeed Insights, run Lighthouse in DevTools, capture network waterfalls, read console warnings, and record the Performance trace while interacting with key elements (ATC, variant selector, cart drawer, search) for INP.
  - **Claude Code** to audit the theme source directly (grep for render-blocking assets, unused CSS/JS, image attributes, app script tags) and to draft the fix snippets for the follow-up tickets.
  - **Google PageSpeed Insights** — Core Web Vitals + mobile/desktop lab scores; also exposes CrUX field data for comparison.
  - **Chrome DevTools** — Coverage tab (unused JS/CSS), Rendering tab → Layout Shift Regions (CLS), Performance tab (long tasks → INP), Network waterfall (request order/size).
  - **WebPageTest** (optional, precision synthetic) — filmstrip + waterfall tuned to a P75 mobile profile for deep diagnosis.

- **Affected surfaces (measure all three; they have different LCP elements and template weights):** Home (`templates/index.json`), Collection (`templates/collection.json`), Product (`templates/product.json` → `snippets/product.liquid`).

## Constraints / Scope:

- **IN scope:** measurement, diagnosis, and a written, prioritized recommendations report. Establish a baseline; identify root causes in field + lab + source.

- **OUT of scope:** implementing the fixes. Each recommendation is filed as a **separate follow-up ticket** with its own estimate and AC. (If the client wants quick wins applied in this same ticket, see Clarifying Questions — but default is investigate-only.)

- **OUT of scope:** theme replatform (Hydrogen / headless) and app removal decisions — those are client business decisions surfaced as recommendations, not executed here.

- **Assumption (label):** assumed the three template types above are the highest-traffic/highest-value pages. If analytics show another template dominates traffic, add it to the baseline.

- **Realistic ceiling (set expectation in the report):** most Shopify stores plateau around **LCP 2.0–2.4s on mobile**; the last 0.3–0.5s typically requires a Hydrogen/custom build. Recommend stopping at the plateau unless the client wants to invest beyond it.

- **Avoid vanity-score tactics** (critical-CSS hacks that break rendering, lazy-loading the LCP image, hiding content from Lighthouse). Recommendations must improve real-user experience, not just the lab number.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
| --- | --- | --- | --- | --- |
| 1 | A baseline is recorded for Home, Collection, and Product templates capturing **field data** (Shopify Web performance report + Search Console CrUX: P75 LCP, INP, CLS) and **lab data** (PageSpeed Insights mobile + desktop, median of ≥3 runs each). |  |  |  |
| 2 | Lab scores are captured for **both mobile and desktop**, and the report states explicitly that field/P75 data is the source of truth and lab data is for diagnosis only. |  |  |  |
| 3 | The audit identifies the **LCP element** on each of the three templates and whether it is correctly prioritized (not lazy-loaded; `fetchpriority="high"` / `loading="eager"` where appropriate; preloaded if a hero image). |  |  |  |
| 4 | Render-blocking CSS is quantified, including the **569 KB `theme.css`**, **`ebay-bootstrap.css` (~123 KB)**, `atomz.css`, and the Vite `main.css`; the report states which are actually used per template (DevTools Coverage) and which are candidates for removal/splitting. |  |  |  |
| 5 | JavaScript is audited for unused/blocking code via DevTools Coverage; the report confirms `theme.dev.js` (~280 KB) does **not** load in production and lists third-party/app scripts ordered by main-thread cost (INP impact). |  |  |  |
| 6 | The **5 preloaded fonts** are assessed; the report recommends a `font-display` strategy and reducing preloads to only above-the-fold fonts, with expected LCP impact. |  |  |  |
| 7 | CLS is checked with DevTools Layout Shift Regions on each template; any shifting elements (announcement bar, late-injected widgets, images without dimensions) are listed. |  |  |  |
| 8 | INP is measured by recording a Performance trace while interacting with add-to-cart, variant selector, cart drawer, and search; any long tasks (>50ms) are attributed to a script/file. |  |  |  |
| 9 | A **prioritized recommendations table** is produced — each row: issue, affected template(s), expected CWV impact (which metric), effort (S/M/L), and whether it's a theme-code fix vs. app/config/client decision. Ordered by impact: app/script audit → CSS/JS weight → fonts → images → CLS. |  |  |  |
| 10 | Each actionable theme-code recommendation cites the **exact file + approximate line** (e.g. `snippets/head.liquid` ~line 634) so a follow-up ticket can be opened directly from it. |  |  |  |
| 11 | The report sets explicit, realistic targets (LCP < 2.5s, INP < 200ms, CLS < 0.1 at P75; mobile PageSpeed 60–80) and names the expected plateau, so the client does not chase 100/100. |  |  |  |
| 12 | The audit names the tools and exact steps used (Claude in Chrome for live measurement, Claude Code for source audit, PSI/DevTools/Shopify report) so the measurement is **reproducible** for a re-test after fixes. |  |  |  |

## Dev Notes:

- **Reproducible measurement workflow (run in this order):**
  1. **Field first.** Read Shopify admin → Online Store → Web performance report and Search Console → Core Web Vitals. Record P75 LCP/INP/CLS per template group. This is the ranking-relevant data.
  2. **Lab, per template.** With **Claude in Chrome**, open PageSpeed Insights for the Home, a Collection, and a Product URL; run each 3× and take the **median**. Capture mobile + desktop.
  3. **Diagnose in DevTools** (Claude in Chrome): Coverage tab → unused CSS/JS %; Network waterfall → request order/size/blocking; Rendering → Layout Shift Regions; Performance → record interactions for long tasks/INP.
  4. **Source audit** (Claude Code): confirm what each asset is and whether it's used; draft fix snippets for follow-up tickets.

- **Confirmed source findings to anchor the audit (this theme):**
  - Render-blocking CSS chain in `snippets/head.liquid` (~lines 634–646):

        {{ 'theme.css' | asset_url | stylesheet_tag }}      {%- comment -%} ~569 KB {%- endcomment -%}
        {{ 'atomz.css' | asset_url | stylesheet_tag }}
        {%- render 'vite', vite: 'main.scss' -%}             {%- comment -%} main.css ~27 KB {%- endcomment -%}

    Investigate splitting/trimming `theme.css`, and whether `ebay-bootstrap.css` (~123 KB) / `ebay-styles.css` are still referenced anywhere — likely legacy and removable. Use DevTools Coverage to prove unused %.
  - **Five font preloads** in `snippets/head.liquid` (~lines 619–631):

        <link rel="preload" as="font" href="{{ settings.type_base_font | font_url }}" type="font/woff2" crossorigin>
        ... (base, header, nav, btn, subheading)

    Preloading 5 fonts competes with the LCP image for bandwidth. Recommend preloading only above-the-fold fonts and confirming `font-display: swap`.
  - **JS is already deferred** (good): `vendor.js`, `theme.js`, `main2.js` use `defer`/`type="module"` (`snippets/head.liquid` ~lines 754–772). `theme.dev.js` (~280 KB) is correctly gated to dev only (~line 774) — confirm it is absent from production HTML.
  - **Image discipline already present:** `fetchpriority` used ~47×, `loading: 'eager'` ~8×, `loading: 'lazy'` ~16× across sections/snippets. Audit confirms the **LCP** image per template is eager + high priority and that below-fold images are lazy.
  - Third-party/app scripts: check the `theme.liquid` head marketing-code block (~line 57) and any app-injected `script` tags for main-thread cost — apps are the #1 cause of failing CWV.

- **Deliverable format:** a Markdown report (baseline table + prioritized recommendations table per AC #1 and #9) attached to this ticket, with one proposed follow-up ticket title per actionable recommendation.

- **Action item (human/client decisions to surface, not execute):** app removal/consolidation, replatform consideration, and whether to apply quick wins inline (see Clarifying Questions).

- **References:**
  - Shopify Help — [Web performance reports](https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports) · [Improving web performance](https://help.shopify.com/en/manual/online-store/web-performance/improving-web-performance)
  - Shopify dev — [Storefront performance](https://shopify.dev/docs/apps/build/performance/storefront) · [Theme performance data table](https://performance.shopify.com/pages/theme-performance-data-table)
  - Shopify — ["What is a good speed score?" (Goodhart's-law caveat)](https://www.shopify.com/enterprise/blog/good-shopify-speed-score)
  - Tools: [PageSpeed Insights](https://pagespeed.web.dev/) · [WebPageTest](https://www.webpagetest.org/) · Chrome DevTools (Coverage / Rendering / Performance)
  - 2026 CWV guidance: [Hyperspeed — Core Web Vitals 2026: what changed](https://hyperspeed.me/blog/core-web-vitals-2026-what-changed/) · [Scandiweb — Shopify performance 2026 playbook](https://scandiweb.com/blog/shopify-performance-optimization/)

## Bugs from QA:

- TBD

## Clarifying Questions:

- Should this ticket **apply quick wins inline** (e.g. removing a confirmed-unused stylesheet, trimming font preloads), or strictly investigate-and-recommend with all fixes as follow-up tickets? Default assumed: investigate-only.
- Which page types are highest-priority for the client (traffic/revenue)? Default measured: Home, Collection, Product — confirm whether to add others (e.g. blog, cart).
- Is there an existing **RUM tool** or analytics access (Search Console, GA4) the audit can pull field data from, or should baseline rely on Shopify's Web performance report alone?
- What is the appetite beyond the typical mobile-LCP plateau (~2.0–2.4s)? I.e., is a future Hydrogen/headless investment on the table, or should recommendations stay within the current Liquid theme?
