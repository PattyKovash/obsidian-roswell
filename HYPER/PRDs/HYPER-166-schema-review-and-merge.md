---
edge_id: HYPER-166
edge_version: 17
monday_id: 13432116592
project_key: HYPER
authored: 2026-11-02
status: pushed to Edge 2026-11-03 (v17)
---

## Background:

- Yoshitha (2026-10-31, Edge activity log): new schema was added to theme **Copy of RS: release/HYPER-v2026.44 (Ash: Email)** (`#188871475245`) and needs review and merge.
- The changes are Ashley's. Her code comments cite the Ahrefs audit finding "Category page missing ItemList schema" (Oct 2026).
- Her theme is a copy of live, so it lacks code from the upcoming release. Only her schema changes are brought over.

## Necessary Info (Design/Documentation):

-  **Source:** Ashley's schema changes on theme **Copy of RS: release/HYPER-v2026.44 (Ash: Email)** (`#188871475245`). That theme is a copy of live, so only her schema changes are brought over.

-  **Why:** the Ahrefs audit flagged "Category page missing ItemList schema". Her changes add product lists to collection and gift guide pages, and page-level schema to Pages.

-  **Where it shows up:** all Pages, gift guide pages, collection pages, and pages using the FAQ section.

-  **New theme settings:** **Output ItemList schema** on each featured collections block, and **Output FAQPage schema** on the FAQ section. Both are on by default.

-  **Validation tools:** [Google Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/).
   -  https://search.google.com/test/rich-results
   -  https://validator.schema.org/

-  No new design.

## Constraints / Scope:

- In: Ashley's schema changes and the review fixes needed to merge them.
- Out: everything else in her theme (excluded at file level before `9ca9793`).
- Goal: keep schema injection centralized in `snippets/microdata-schema.liquid` wherever the data doesn't depend on section/block settings, to limit places that can emit conflicting schema.
- Section-level output stays in the section only where it depends on section/block data (FAQ microdata, featured-collections ItemList, paginated collection ItemList).
- Every `ItemList` is nested as a `mainEntity`, never top-level, so multiple lists can coexist on a page: the collection page's own list under `CollectionPage`; secondary lists (featured collections) under `WebPageElement`.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  On any page using the `faq` section, every question row shows its question text. |   |  ✅ |   |
|  2 |  On a gift guide page, each featured-collections block with **Output ItemList schema** on outputs its own `WebPageElement` wrapping an `ItemList` of that block's collection products (name, collection URL, products in display order, positions starting at 1, `hidden-from-search` products excluded). |   |  ✅ |   |
|  3 |  A featured-collections block with **Output ItemList schema** off outputs no `ItemList`. |   |  ✅ |   |
|  4 |  Gift guide and collection pages pass Google Rich Results Test with no invalid Carousels items, including pages with more than one list. |   |  ✅ |   |
|  5 |  Collection pages output a `CollectionPage` (name, URL, description) whose `mainEntity` is an `ItemList` of the current page's products in grid order, with `numberOfItems` = total products, positions continuing across pages (page 2 starts after page 1's last position), and `hidden-from-search` products excluded; a page past the last page outputs none. |   |  ✅ |   |
|  6 |  Pages output the page-level schema type from `page-schema` (e.g. gift guide → `CollectionPage`; care instructions / user manual → `TechArticle`); `our-story` keeps its existing `AboutPage` with no duplicate. |   |  ✅ |   |
|  7 |  Every `@id` reference output by `page-schema` and `itemlist-schema` (e.g. `/#organization`) resolves to an entity defined on the same page. |   |  ✅ |   |
|  8 |  Pages using the `faq` section on care-instructions / user-manual handles output no `FAQPage` microdata. |   |  ✅ |   |
|  9 |  All tested pages validate on `validator.schema.org` with 0 errors. |   |  ✅ |   |
|  10 |  Schema types not touched by this ticket (Product/ProductGroup, BlogPosting, BreadcrumbList) are unchanged. |   |  ✅ |   |

## Dev Notes:

-  Claude Code session: `claude --resume 49a959cd-3983-46ee-bd09-94593f63c725`

-  Branch `feature/HYPER-166-schema`. Ashley's original changes are committed as-is (`9ca9793`) as a reference point, with review fixes as separate commits on top.

-  Changes from her original are listed under **Changes Made to Original Code Updates by Ashley**.

-  **Open:** confirm in Ahrefs (re-crawl) that the collection page ItemList clears "Category page missing ItemList schema".

-  Changes, test results, screenshots, and cleanup items for Ashley: [vault notes](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper-166-schema/README.md).
   -  https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper-166-schema/README.md

## Changes Made to Original Code Updates by Ashley:

What we changed from Ashley's theme (`#188871475245`) and why. Everything else was merged as she wrote it.

-  **FAQ question titles restored** (`sections/faq.liquid`). The question title line was dropped, so every FAQ row showed only a "+" and the FAQ schema questions had no text.

-  **Featured collections toggle fixed** (`sections/featured-collections.liquid`). The code read the **Output ItemList schema** setting from the section, but the checkbox is on each collection block, so no list was output. It now reads the block setting.

-  **Product lists nested instead of top-level** (new `snippets/itemlist-schema.liquid`). Google's Rich Results Test marks a page invalid when it has more than one top-level product list. Each list now sits inside a container:
   -  Featured collections: one container per block.
   -  Collection pages: the collection page itself.

-  **Empty list removed on out-of-range collection pages** (`sections/main-collection.liquid`). A page number past the last page output an empty list; it now outputs none.

-  **Date format corrected** (`snippets/page-schema.liquid`). The published date's timezone now uses the standard format (`-04:00` instead of `-0400`).

-  **Care-page product links fixed** (`snippets/page-schema.liquid`). Product links on care and user-manual pages were labeled as products, so Google flagged them as invalid products on those pages. They're now plain links to each product page's existing product schema.


## Implementation Notes:

-  Product lists on collection and gift guide pages are each nested inside a container so more than one can appear on a page. Reasoning and alternatives tested: [decisions log, 2026-11-03](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/02-decisions/decisions.md).
   -  https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/02-decisions/decisions.md

-  Care and user-manual pages link to their products with a plain reference to each product page's existing product schema, rather than repeating product schema on the care page. Reasoning: [decisions log, 2026-11-03](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/02-decisions/decisions.md).
   -  https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/02-decisions/decisions.md

-  Ashley's theme was compared against the live snapshot to confirm none of her schema changes were left out of the merge: [vault notes, Source-theme completeness check](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper-166-schema/README.md).
   -  https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper-166-schema/README.md

## Testing Notes:

- TBD (post-execution)

## Bugs from QA:

- TBD

## Clarifying Questions:

- TBD
