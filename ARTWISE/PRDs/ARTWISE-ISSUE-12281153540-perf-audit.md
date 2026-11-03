#  

## 

## Background:

-  Source requirement (verbatim from the original ticket): _"PLEASE investigate the page speed and suggest ways to optimize."_

-  The client reported the site feeling slow. Client did not have specific metrics.

-  This is an **investigation + recommendations** ticket, not an implementation ticket. The deliverable is a documented performance audit (baseline + prioritized, scoped fix list). Each recommended fix becomes its own follow-up ticket so the work can be estimated, QA'd, and measured independently.

-  **Desired outcome:** a baseline report across the three key template types (home, collection, product) measured with both field and lab data, a ranked list of optimizations with expected impact and effort, and explicit scope boundaries so follow-up tickets can be opened.

 

## Necessary Info (Design/Documentation):

-  This ticket produces a written audit/report; no storefront UI changes are made here.

-  Field data is the source of truth, lab data is for diagnosis/comparison only. 

-  **Suggested Tooling for audit (not exhaustive):**

   -  **Claude in Chrome** (browser automation) to drive the live measurement: navigate to PageSpeed Insights, run Lighthouse in DevTools, capture network waterfalls, read console warnings, and record the Performance trace while interacting with key elements (ATC, variant selector, cart drawer, search) for INP.

   -  **Claude Code**

   -  **Google PageSpeed Insights** — Core Web Vitals + mobile/desktop lab scores; also exposes CrUX field data for comparison.

   -  **Chrome DevTools** — Coverage tab (unused JS/CSS), Rendering tab → Layout Shift Regions (CLS), Performance tab (long tasks → INP), Network waterfall (request order/size).

   -  **WebPageTest** (optional, precision synthetic) — filmstrip + waterfall tuned to a P75 mobile profile for deep diagnosis.

-  **Affected surfaces (measure all three; they have different LCP elements and template weights):** Home (`templates/index.json`), Collection (`templates/collection.json`), Product (`templates/product.json` → `snippets/product.liquid`).

 

## Constraints / Scope:

-  **IN scope:** measurement, diagnosis, and a written, prioritized recommendations report. Establish a baseline; identify root causes in field + lab + source.

   -  **Templates in scope for audit:**

      -  HP - index

      -  Default product template. [Use the top product page from the last 90 days as baseline](https://admin.shopify.com/store/artwiseonline-new/analytics/reports/explore?ql=FROM+sessions++SHOW+sessions++WHERE+landing_page_type+=+%27product%27++GROUP+BY+landing_page_path+WITH+TOTALS++SINCE+startOfDay(-90d)+UNTIL+today++ORDER+BY+sessions+DESC++LIMIT+3VISUALIZE+sessions+TYPE+list_with_dimension_values+MAX+5).

      -  Default Collection template. [Use the top collection page from the last 90 days as baseline. ](https://admin.shopify.com/store/artwiseonline-new/analytics/reports/explore?ql=FROM+sessions++SHOW+sessions++WHERE+landing_page_type+=+%27collection%27++GROUP+BY+landing_page_path+WITH+TOTALS++SINCE+startOfDay(-90d)+UNTIL+today++ORDER+BY+sessions+DESC++LIMIT+3VISUALIZE+sessions+TYPE+list_with_dimension_values+MAX+5)

-  **OUT of scope:** implementing the fixes. Each recommendation is filed as a **separate follow-up ticket** with its own estimate. Other theme templates.

-  **Assumption:** assumed the three template types above are the highest-traffic/highest-value pages. If analytics show another template dominates traffic, additional audit and implementation phase required.

-  **Exact scores are not guaranteed**

 

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |
| --- | --- | --- | --- |
|  1 |  A baseline is recorded for Home, Collection, and Product templates capturing **field data** (Shopify Web performance report + Search Console CrUX: P75 LCP, INP, CLS) and **lab data** (PageSpeed Insights mobile + desktop, median of ≥3 runs each).
      -  HP - index
      -  Default product template. [Use the top product page from the last 90 days as baseline](https://admin.shopify.com/store/artwiseonline-new/analytics/reports/explore?ql=FROM+sessions++SHOW+sessions++WHERE+landing_page_type+=+%27product%27++GROUP+BY+landing_page_path+WITH+TOTALS++SINCE+startOfDay(-90d)+UNTIL+today++ORDER+BY+sessions+DESC++LIMIT+3VISUALIZE+sessions+TYPE+list_with_dimension_values+MAX+5).
      -  Default Collection template. [Use the top collection page from the last 90 days as baseline. ](https://admin.shopify.com/store/artwiseonline-new/analytics/reports/explore?ql=FROM+sessions++SHOW+sessions++WHERE+landing_page_type+=+%27collection%27++GROUP+BY+landing_page_path+WITH+TOTALS++SINCE+startOfDay(-90d)+UNTIL+today++ORDER+BY+sessions+DESC++LIMIT+3VISUALIZE+sessions+TYPE+list_with_dimension_values+MAX+5) | -  See if we have access to Search Console |   |
|  2 |  Lab metrics are captured for both mobile and desktop — the Lighthouse Performance score (0–100) plus TBT, FCP, and Speed Index — taken as the median of ≥3 PageSpeed Insights runs each. |   |   |
|  3 |  A **prioritized recommendations table** is produced — each row: issue, affected template(s), expected CWV impact (which metric), effort (S/M/L), and whether it's a theme-code fix vs. app/config/client decision. Ordered by impact: app/script audit → CSS/JS weight → fonts → images → CLS. |   |   |
|  4 |  Each actionable theme-code recommendation cites the **exact file + approximate line** (e.g. `snippets/head.liquid` ~line 634) so a follow-up ticket can be opened directly from it. |   |   |
|  5 |  The audit names the tools and exact steps used (Claude in Chrome for live measurement, Claude Code for source audit, PSI/DevTools/Shopify report) so the measurement is **reproducible** for a re-test after fixes. |   |   |

 

## Dev Notes:

-  **Reproducible measurement workflow (run in this order):**

    1.  **Field first.** Read Shopify admin → Online Store → Web performance report and Search Console → Core Web Vitals. Record P75 LCP/INP/CLS/TBT/Performance per template group.

    2.  **Lab, per template.** With **Claude in Chrome**, open PageSpeed Insights for the Home, a Collection, and a Product URL; run each 3× and take the **median**. Capture mobile + desktop.

    3.  **Diagnose in DevTools** (Claude in Chrome): Coverage tab → unused CSS/JS %; Network waterfall → request order/size/blocking; Rendering → Layout Shift Regions; Performance → record interactions for long tasks/INP.

    4.  **Source audit** (Claude Code): confirm what each asset is and whether it's used; draft fix snippets for follow-up tickets.

-  **Deliverable format:** a Markdown report (baseline table + prioritized recommendations table per AC #1 and #9) attached to this ticket, with one proposed follow-up ticket title per actionable recommendation.

-  **Action item (human/client decisions to surface, not execute):** app removal/consolidation, replatform consideration.

-  **References:**

   -  Shopify Help — [Web performance reports](https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports) · [Improving web performance](https://help.shopify.com/en/manual/online-store/web-performance/improving-web-performance)

   -  Shopify dev — [Storefront performance](https://shopify.dev/docs/apps/build/performance/storefront) · [Theme performance data table](https://performance.shopify.com/pages/theme-performance-data-table)

   -  Shopify — ["What is a good speed score?" (Goodhart's-law caveat)](https://www.shopify.com/enterprise/blog/good-shopify-speed-score)

   -  Tools: [PageSpeed Insights](https://pagespeed.web.dev/) · [WebPageTest](https://www.webpagetest.org/) · Chrome DevTools (Coverage / Rendering / Performance)

   -  2026 CWV guidance: [Hyperspeed — Core Web Vitals 2026: what changed](https://hyperspeed.me/blog/core-web-vitals-2026-what-changed/) · [Scandiweb — Shopify performance 2026 playbook](https://scandiweb.com/blog/shopify-performance-optimization/)

 

## Bugs from QA:

 

 