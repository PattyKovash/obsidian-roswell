# Add BreadcrumbList structured data (JSON-LD) to breadcrumb navigation

## Background:

- Last remaining item from the schema review effort (`AED-ISSUE-12580283608` covered Organization, CollectionPage, ItemList; `BreadcrumbList` was explicitly deferred there and in `AED-ISSUE-12611047447`).
- Neither storefront outputs breadcrumb schema markup today. Adding it lets Google show the breadcrumb trail in search results instead of just the URL, which is a minor but free SEO/CTR win.
- Same issue, same fix, on both repos (`AEDShop_AED`, `AED4LIFE_AED`) — see Constraints / Scope.

## Necessary Info (Design/Documentation):

- **Affected surfaces:** `snippets/breadcrumb.liquid` only, on every page that already shows the visible breadcrumb nav (product, collection, page, article, blog) — no new pages gain breadcrumbs, this only adds hidden schema alongside what's already visible.
- **AEDShop current state (confirmed during implementation):** the visible breadcrumb section is only actually placed on `templates/product.json` — `page.json`/`blog.json`/`article.json` don't include a breadcrumbs section at all, and the `collection*.json` templates include it but `"disabled": true`. So in practice, on AEDShop today, this schema only fires on product pages — not a gap in this ticket's fix, just the current state of which templates render the section at all.
- No design work — markup-only, not visual.
- There is an unused/orphaned snippet, `snippets/collection-product-breadcrumbs.liquid`, confirmed dead code (not referenced anywhere in the theme). Do not use it as a basis for this fix.
- After publishing, verify with [Google Rich Results Test](https://search.google.com/test/rich-results) on a product, collection, and page URL, both domains.

## Constraints / Scope:

- **In scope, both repos:** add `BreadcrumbList` JSON-LD inside `snippets/breadcrumb.liquid`, in the same conditional block that renders the visible nav, so it only fires where breadcrumbs already show.
- **Out of scope:** any change to the visible breadcrumb trail's logic/appearance, `snippets/collection-product-breadcrumbs.liquid` (leave as dead code — a separate cleanup ticket, not this one), any other schema type.
- **Assumption:** both repos' `snippets/breadcrumb.liquid` are similar enough that the fix is portable as a like-for-like edit per repo (per repo convention — not a file copy).

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | On every page where the visible breadcrumb nav renders (product, collection, page, article, blog), a `BreadcrumbList` JSON-LD block is also output, with one `ListItem` per visible crumb. | Verified on AEDShop preview theme (`188454502721`), product page: [ZOLL AED 3 — /products/zoll-aed-3](https://aedshop.ca/products/zoll-aed-3?preview_theme_id=188454502721) (4-deep trail) and [AEDtrax — /products/aedtrax-1](https://aedshop.ca/products/aedtrax-1?preview_theme_id=188454502721) (5-deep trail). Also verified on AED4Life preview theme (`188687221038`): [ZOLL AED 3 — /products/zoll-aed-3](https://aed4life.ca/products/zoll-aed-3?preview_theme_id=188687221038) (4-deep trail). Product is the only page type actually reachable to test on AEDShop today — see Necessary Info (collection/page/article/blog either disabled or don't render breadcrumbs at all on this store, independent of this fix). | ✅ (AEDShop + AED4Life, product) |  |
| 2 | The JSON-LD crumb order and labels match the visible breadcrumb trail exactly (Home → any category/subcategory → current page). | Verified on all three product URLs above — schema order/labels matched the rendered `<nav class="breadcrumbs">` text exactly in every case, including a duplicate-crumb edge case caught and fixed on AED4Life's ZOLL AED 3 (see Implementation Notes). | ✅ (AEDShop + AED4Life) |  |
| 3 | Every `ListItem.item` URL is an absolute URL (`request.origin` + the relative path), not a relative path. | Verified — e.g. `https://aedshop.ca/collections/zoll-aed-units` and `https://aed4life.ca/collections/zoll-aed-units`, not relative paths. | ✅ (AEDShop + AED4Life) |  |
| 4 | On pages where the visible nav is suppressed (`index`, `cart`), no `BreadcrumbList` schema is output either. | Verified on AEDShop: [Homepage — /](https://aedshop.ca/?preview_theme_id=188454502721) — 0 JSON-LD scripts contain `BreadcrumbList`. Also checked (no visible nav *or* schema on either, for the independent reason noted in Necessary Info — no breadcrumbs section on the `page` template at all): [FAQ — /pages/faq](https://aedshop.ca/pages/faq?preview_theme_id=188454502721), [Contact Us — /pages/contact](https://aedshop.ca/pages/contact?preview_theme_id=188454502721). AED4Life homepage/pages not yet checked. Cart not separately tested (same `unless` guard, not a new code path). | ✅ (AEDShop) / ⏳ (AED4Life) |  |
| 5 | The final crumb (current page) is included in the schema even though it isn't a link in the visible nav. | Verified — position 5 `"AEDtrax"` on AEDShop's AEDtrax page, position 4 `"ZOLL AED 3"` on both stores' ZOLL AED 3 page (all URLs above). | ✅ (AEDShop + AED4Life) |  |
| 6 | Output is valid JSON on a representative page of each type (product, collection, page, article, blog), both storefronts. | Product verified on both storefronts (`JSON.parse` clean on all three product URLs above). Collection/page/article/blog not applicable to test on AEDShop yet (see Necessary Info; FAQ and Contact Us pages checked, confirmed no schema present rather than invalid schema); not yet checked on AED4Life. | ⏳ (product done both stores, others n/a on AEDShop today, unchecked on AED4Life) |  |
| 7 | No visual or layout change to the visible breadcrumb nav — this is markup-only. | Spot-checked all three product URLs above — visible trail unchanged on both stores. No formal side-by-side regression pass. | ✅ (spot-check, AEDShop + AED4Life) |  |
| 8 | Google Rich Results Test shows the `BreadcrumbList` item as valid with no errors, on a sampled URL of each affected page type, both domains. | Run against AEDShop's [AEDtrax — /products/aedtrax-1](https://aedshop.ca/products/aedtrax-1?preview_theme_id=188454502721) full JSON-LD (Organization + BreadcrumbList + Product, pasted via code-input tab per `04-engineering/patterns/validator-code-input-testing.md`): **3 valid items — Breadcrumbs, Organization, Shipping policies — 0 errors.** Breadcrumbs detail confirmed all 5 `ListItem`s parsed with correct position/name/id. AED4Life not yet run through the validator (live-DOM verification above stands in for now). | ✅ (AEDShop, 1 product) / ⏳ (AED4Life) |  |
| 9 | Same fix applied to both `AEDShop_AED` and `AED4LIFE_AED`; only `snippets/breadcrumb.liquid` changes in each repo. | Both done — `git diff --stat` scoped to `snippets/breadcrumb.liquid` only in each repo (AEDShop: 2 commits, initial add + the deduplication guard fix below; AED4Life: 1 commit with the guard fix folded in from the start). | ✅ (AEDShop + AED4Life) |  |

## Dev Notes:

- **Single file:** `snippets/breadcrumb.liquid`.
- **Normalize the crumb data first.** The existing `bc1`/`bc2`/`bc3` lookup (lines ~136–224) captures ready-made link HTML (`{{ ltitles[...] | link_to: ... }}`) on some branches but doesn't consistently keep the plain `{title, url}` pair on every branch. Add a plain `assign` alongside each existing `capture bcN`/`assign bcN_url` pair so there's always a clean title/url for that level regardless of which branch fired:
  - ~line 141–142 (level 3 hit): already has `bc3_url`; add `assign bc3_title = ltitles[forloop.index0]`.
  - ~line 166–167 (level 2, scan branch): already has `bc2_url`; add `assign bc2_title = ltitles[forloop.index0]`.
  - ~line 180 (level 2, parent-lookup branch): already has `bc2_list_title`; also `assign bc2_title = bc2_list_title` (or just use `bc2_list_title` directly) and confirm `bc2_url` is set (it is, line 178).
  - ~line 203–204 and ~line 218 (level 1, both branches): same pattern — add `assign bc1_title = ltitles[forloop.index0]` (scan branch) and reuse `bc1_title` already assigned (parent-lookup branch, line 218).
- **Build the schema after the existing self-link dedupe** (after line ~237, `bc2`/`bc3` blank-out for repeated URLs) so the JSON-LD crumb list matches the visible list exactly. **Guard on `bc1 != blank`/`bc2 != blank`/`bc3 != blank` (the display captures), not `bc1_url`/`bc2_url`/`bc3_url`.** The self-link dedupe (lines ~232–237, from `AED-ISSUE-12485605342`) only blanks the display captures when a crumb repeats the URL above it — it does not clear the corresponding `bcN_url`/`bcN_title`. Gating the schema on the raw URL vars reproduces the exact duplicate-crumb bug that ticket fixed, just in the schema instead of the visible nav (caught live on AED4Life's `/products/zoll-aed-3`, which has the self-referential "ZOLL AED Units" menu link — see Implementation Notes).
- **Current-page crumb:** derive title/url per template type, matching the existing visible-output branches (lines ~257–283) — e.g. `product.title`/`product.url`, `collection.title`/`collection.url`, `page.title`/`page.url`, `article.title`/`article.url`, `blog.title`/`blog.url` (or `page_title`/`request.path` fallback for the final `else`).
- **New block**, added after `</ul></nav>` (still inside the `unless template == 'index' or template == 'cart'` guard so it only fires where the visible nav does). Implemented using a running `bc_position` counter (starts at 1 for Home, `| plus: 1` per present crumb) rather than a concatenated array — simpler than the array-building sketch originally proposed here, same output shape:

```liquid
{%- liquid
  if template contains 'product'
    assign current_crumb_title = product.title
    assign current_crumb_url = product.url
  elsif template contains 'collection' and collection.handle
    assign current_crumb_title = collection.title
    assign current_crumb_url = collection.url
  elsif template == 'blog'
    if current_tags
      assign current_crumb_title = current_tags | join: ' + '
    else
      assign current_crumb_title = blog.title
    endif
    assign current_crumb_url = request.path
  elsif template == 'article'
    assign current_crumb_title = article.title
    assign current_crumb_url = article.url
  elsif template contains 'page'
    assign current_crumb_title = page.title
    assign current_crumb_url = page.url
  else
    assign current_crumb_title = page_title
    assign current_crumb_url = request.path
  endif
  assign bc_position = 1
-%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": {{ 'sections.breadcrumbs.home_text' | t | json }},
      "item": {{ request.origin | append: routes.root_url | json }}
    }
    {%- if bc1 != blank -%}
      {%- assign bc_position = bc_position | plus: 1 -%}
      ,
      { "@type": "ListItem", "position": {{ bc_position }}, "name": {{ bc1_title | json }}, "item": {{ request.origin | append: bc1_url | json }} }
    {%- endif -%}
    {%- if bc2 != blank -%}
      {%- assign bc_position = bc_position | plus: 1 -%}
      ,
      { "@type": "ListItem", "position": {{ bc_position }}, "name": {{ bc2_title | json }}, "item": {{ request.origin | append: bc2_url | json }} }
    {%- endif -%}
    {%- if bc3 != blank -%}
      {%- assign bc_position = bc_position | plus: 1 -%}
      ,
      { "@type": "ListItem", "position": {{ bc_position }}, "name": {{ bc3_title | json }}, "item": {{ request.origin | append: bc3_url | json }} }
    {%- endif -%}
    {%- assign bc_position = bc_position | plus: 1 -%}
    ,
    { "@type": "ListItem", "position": {{ bc_position }}, "name": {{ current_crumb_title | json }}, "item": {{ request.origin | append: current_crumb_url | json }} }
  ]
}
</script>
```

- **Convention:** used `{% liquid %}` blocks for the new control flow, matching this file's and the theme's existing style (see `CLAUDE.md`).
- Did not base this on `snippets/collection-product-breadcrumbs.liquid` — confirmed dead code, not referenced anywhere in the theme.

## Implementation Notes:

- **Both repos implemented and spot-verified on their preview themes**, product pages: `AEDShop_AED` (branch `feature/AED-schema-breadcrumb`, commits `e07c221` + `afd552e`) and `AED4LIFE_AED` (same branch name, commit `ec54f07`). `theme check snippets/breadcrumb.liquid` clean in both. See Acceptance Criteria notes for exact URLs/results.
- **Bug found and fixed during AED4Life testing, then backported to AEDShop:** the first implementation gated the new schema on `bc1_url`/`bc2_url`/`bc3_url != blank`. AED4Life's ZOLL AED 3 (`/products/zoll-aed-3`) has the exact self-referential "ZOLL AED Units" child-menu link documented in `04-engineering/patterns/breadcrumb-menu-self-links.md` — the existing dedupe (from `AED-ISSUE-12485605342`) correctly blanks the *display* variable (`bc2`/`bc3`) for the repeated step, but doesn't clear the underlying `bcN_url`/`bcN_title`. Gating the schema on the raw URL vars reproduced the duplicate-crumb bug inside the new JSON-LD (visible nav showed 4 correct crumbs; schema showed 5, with "ZOLL AED Units" twice). Fixed by gating on `bc1`/`bc2`/`bc3 != blank` instead — the same variables the visible `<li>` output already gates on — so the schema can never diverge from the visible trail. Re-verified clean on both stores' ZOLL AED 3 pages after the fix, plus AEDShop's AEDtrax page (no regression on a page that didn't have the bug).
- **Collection/page/article/blog coverage on AEDShop is currently untestable**, not unimplemented — the Liquid branches for those template types exist in the new schema block (mirroring the pre-existing visible-output branches), but no AEDShop template actually places the breadcrumbs section on those page types today (see Necessary Info). If/when a collection template's breadcrumb section is ever enabled, or a page/blog/article template gains one, this schema will fire automatically — no further code change needed.
- **Remaining before this ticket is fully closed:** AED4Life homepage/page-type checks (Acceptance Criteria #4, #6) and an AED4Life Rich Results Test run (#8) — not yet done, tracked as ⏳ in the table above.

## Bugs from QA:

- TBD

## Clarifying Questions:

- None outstanding for AEDShop's implementation. For context: this ticket was previously gated by a do-not-touch condition requiring (1) the duplicate-crumb fix confirmed live on production and (2) client/internal confirmation that the visible breadcrumb logic was final — both resolved 2026-08-11 (see vault `01-mcd/do-not-touch.md`, `02-decisions/decisions.md`).
