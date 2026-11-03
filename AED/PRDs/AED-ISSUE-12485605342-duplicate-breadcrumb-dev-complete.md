#  

## Background:

-  TBD

## Necessary Info (Design/Documentation):

-  Duplicate breadcrumbs are present.

-  [https://aed4life.ca/products/zoll-aed-3](https://aed4life.ca/products/zoll-aed-3)

-  Breadcrumbs should be: Home > AED Units > ZOLL AED Units > ZOLL AED 3

-  One of the two "ZOLL AED Units" entries needs to be removed from the breadcrumb template. Since this is a Shopify theme, the fix would be in the breadcrumb section of `product.liquid` or wherever the breadcrumb logic lives — remove the extra list item that's creating the repeated step.

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3098524069/image-from-clipboard.png)

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | `https://aed4life.ca/products/zoll-aed-3` shows the breadcrumb `Home > AED Units > ZOLL AED Units > ZOLL AED 3` — the repeated `ZOLL AED Units` step is gone. |  |  |  |
| 2 | No product page on either storefront renders the same breadcrumb step twice — i.e. no two consecutive crumbs link to the same URL. |  |  |  |
| 3 | Products whose trail is legitimately three or four levels deep keep every step (e.g. `ZOLL AED Plus Small Hard Case` still shows `Home / AED Accessories / ZOLL AED Accessories / ZOLL AED Plus Accessories / ZOLL AED Plus Small Hard Case`). |  |  |  |
| 4 | No step repeats regardless of how the product page is reached: clicked from a collection grid, or loaded directly as `/products/<handle>` or as `/collections/<handle>/products/<handle>`. (The trails are not expected to be identical across those URLs — the collection-scoped URL omits that collection's own crumb, which is long-standing behaviour and out of scope here.) |  |  |  |
| 5 | No empty or blank breadcrumb entries appear in the trail on any page. |  |  |  |
| 6 | Only `snippets/breadcrumb.liquid` is changed. No navigation menus are edited in the Shopify admin, and no collections, products, or other theme files are modified. |  |  |  |

## Testing Notes:

Every product page on both stores was fetched from the local dev server and its rendered breadcrumb chain compared before vs. after the fix.

| Store | Dev theme | Products checked | Had duplicates | After fix |
| --- | --- | --- | --- | --- |
| AED4LIFE (`7ddd97`) | `188206940462` | 520 | 13 | 0 duplicates; other 507 unchanged |
| AEDShop (`2e7d7b-3`) | `187923792193` | 519 | 1 | 0 duplicates; other 518 unchanged |

No breadcrumb step was lost and no empty entries were introduced on either store.

**AED4LIFE — 13 affected products.** All 13 shared the same trail: `Home / AED Units / ZOLL AED Units / ZOLL AED Units / <product>` — the `ZOLL AED Units` step (`/collections/zoll-aed-units`) rendered twice. All now show it once.

| # | Product | URL |
| --- | --- | --- |
| 1 | ZOLL AED 3 | [https://aed4life.ca/products/zoll-aed-3](https://aed4life.ca/products/zoll-aed-3) |
| 2 | ZOLL AED 3 - Complete Package | [https://aed4life.ca/products/zoll-aed-3-complete-package](https://aed4life.ca/products/zoll-aed-3-complete-package) |
| 3 | ZOLL AED 3 BLS Semi-Automatic | [https://aed4life.ca/products/zoll-aed-3-bls-semi-automatic](https://aed4life.ca/products/zoll-aed-3-bls-semi-automatic) |
| 4 | ZOLL AED 3 Construction and Workplace Safety Kit | [https://aed4life.ca/products/zoll-aed-3-construction-workplace](https://aed4life.ca/products/zoll-aed-3-construction-workplace) |
| 5 | ZOLL AED 3 Encore Series (Recertified) | [https://aed4life.ca/products/zoll-aed-3-encore](https://aed4life.ca/products/zoll-aed-3-encore) |
| 6 | ZOLL AED 3 Trainer | [https://aed4life.ca/products/zoll-aed-3-trainer](https://aed4life.ca/products/zoll-aed-3-trainer) |
| 7 | ZOLL AED 3 with Carry Bag Package | [https://aed4life.ca/products/zoll-aed-3-with-carry-bag](https://aed4life.ca/products/zoll-aed-3-with-carry-bag) |
| 8 | ZOLL AED Plus | [https://aed4life.ca/products/zoll-aed-plus](https://aed4life.ca/products/zoll-aed-plus) |
| 9 | ZOLL AED Plus - Complete Package | [https://aed4life.ca/products/zoll-aed-plus-complete-package](https://aed4life.ca/products/zoll-aed-plus-complete-package) |
| 10 | ZOLL AED Plus - Trainer2 | [https://aed4life.ca/products/zoll-aed-plus-trainer2](https://aed4life.ca/products/zoll-aed-plus-trainer2) |
| 11 | ZOLL AED Plus Encore Series (Recertified) | [https://aed4life.ca/products/zoll-aed-plus-refurbished](https://aed4life.ca/products/zoll-aed-plus-refurbished) |
| 12 | ZOLL AED Plus Construction and Workplace Safety Kit | [https://aed4life.ca/products/safesite-aed-bundle](https://aed4life.ca/products/safesite-aed-bundle) |
| 13 | ZOLL AED Pro | [https://aed4life.ca/products/zoll-aed-pro-aed](https://aed4life.ca/products/zoll-aed-pro-aed) |

**AEDShop — 1 affected product.** A different menu repeated itself here (`AED Units`, one level higher up than AED4Life's), which is why a ZOLL spot-check on this store looked clean.

| # | Product | URL | Before | After |
| --- | --- | --- | --- | --- |
| 1 | HeartSine Samaritan Gateway | [https://aedshop.ca/products/heartsine-samaritan-gateway](https://aedshop.ca/products/heartsine-samaritan-gateway) | Home / AED Units / AED Units / HeartSine Samaritan Gateway | Home / AED Units / HeartSine Samaritan Gateway |

Also verified by clicking through from collection pages, and by loading product URLs both with and without the collection in the path (`/products/<handle>` and `/collections/<handle>/products/<handle>`).

## Dev Notes:

- **Cause — the navigation menu, not the breadcrumb template.** The trail is built by walking the store's menus: the theme finds the product's collection in a menu, then works upward adding each parent as a step. Some menus contain a "view all" link named after the menu itself — the ZOLL AED Units menu holds a link called "ZOLL AED Units" pointing back at the same collection. `snippets/breadcrumb.liquid` treats that self-link as one step, then looks up what sits above it and lands on the very same menu entry, adding it a second time. Since it depends on how each store's menus happen to be built, it surfaced in different places: `zoll-aed-units` (levels 2→3) on AED4Life, `aed-units` (levels 1→2) on AEDShop. Nothing is wrong with the menus — they're a normal setup the breadcrumb code never anticipated.
- **Fix:** track the URL behind each crumb (`bc1_url`/`bc2_url`/`bc3_url`) and skip a crumb that repeats the URL directly above it. Matching on URL rather than label, so two same-named crumbs pointing at different collections both survive.
- Render guards changed from `{% if bc1 %}` to `{% if bc1 != blank %}` — an empty string is truthy in Liquid, so a cleared crumb would otherwise emit an empty `<li>`.
- The ticket suggested removing an extra list item; that was not the fix. The crumbs are generated in a loop, so deleting a list item would have broken every product with a legitimate 3- or 4-deep path.
- **Files:** `snippets/breadcrumb.liquid` in both repos. Commits: AED4LIFE_AED `7246702`, AEDShop_AED `77eba30`, both on branch `feature/AED-ISSUE-12485605342-duplicate-breadcrumb`.

## Implementation Notes:

- **Necessary Info above is inaccurate** — it says to "remove the extra list item" from the breadcrumb template. There is no extra list item, and the logic is not in `product.liquid`; it lives in `snippets/breadcrumb.liquid`, where crumbs are generated in a loop. Removing a list item would break every product with a legitimate 3- or 4-deep path. Left as written; see Dev Notes for what was actually done.

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD

 