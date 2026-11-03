---
monday_id: 12905626203
project_key: AED
authored: 2026-09-02
---

## Background:

- Raised from a mobile-audit pass (source: "Ticket Template (66).md") covering three findings on AED4life/AEDShop: below-fold images missing `lazy` loading, images allegedly not served as WebP/AVIF, and PLP color-contrast failures. This ticket covers all three.
- **Below-fold images missing lazy-loading:** various below-fold images were shipping without `loading="lazy"` — AED4life on PLP, AEDShop on PDP and PLP.
- **Images not served as WebP/AVIF:** flagged as non-WebP/AVIF images site-wide, with a recommended fix of adding `format: "webp"` to the `image_url` filter.
- **PLP color-contrast failures:** manually confirmed via a full Lighthouse Accessibility report (score 89) — 2 contrast failures: "In Stock"/sale badge text at 3.94:1, and "Additional Savings at Checkout" text at 3.99:1 (both below the 4.5:1 minimum for normal text).

## Necessary Info (Design/Documentation):

- **Root cause (lazy-loading):** `snippets/image.liquid` hardcoded `loading="eager"` on the primary `<img>` tag regardless of the `lazy_load` param that was already being computed earlier in the same file — the flag was calculated and then never used. Confirmed identical in both `AED4LIFE_AED` and `AEDShop_AED` (shared Refine base theme, this file was byte-identical pre-fix).
- **WebP/AVIF verdict:** verified against current Shopify CDN documentation — Shopify's image CDN performs automatic content negotiation and serves WebP/AVIF to supporting browsers for any URL generated via `image_url`/`img_url`, without requiring an explicit `format:` parameter. The ticket's premise (images "not served as WebP/AVIF") and its recommended fix (add `format: "webp"` to the filter site-wide) do not reflect current Shopify CDN behavior. **Verdict: no code change required** — this item is closed as not-actionable on the theme side.
- **Root cause (color contrast):** `.new_badge_list .badge_tag { color: grey }` — `grey` (`#808080`) on white computes to ≈3.95:1, matching the reported 3.94:1 almost exactly. This class is shared by every PLP badge ("In Stock", "Sale", "Bilingual", "Canadian Made", "New", "Pre-Order", "Discontinued"), so the fix applies to all of them. Separately, `.additional-savings { color: #ec0d12 }` (a saturated red), duplicated across each repo's own stylesheets.
- **Color to use:** `#595959`, specified directly by the client/user rather than derived. Computes to ≈7:1 contrast on white — clears both the 4.5:1 AA minimum and the 7:1 AAA threshold.
- Surfaces: PLP product grid (both stores), the `media-grid` section (used on various pages, both stores). PDP-specific images were in scope per the source ticket but the PDP template does not route through `image.liquid`'s hardcoded-eager path in the same way as the grid; no PDP-specific bug was found beyond the shared `image.liquid` fix, which applies everywhere the snippet is used.
- No new design required for either the loading fix or the contrast fix — both are attribute/color-value changes, not layout changes.

## Constraints / Scope:

- `AED4LIFE_AED` and `AEDShop_AED` are separate, diverged repos sharing a base theme. Per repo convention, changes were applied as targeted, anchored edits to each repo's own current code — never copied file-to-file — and diffed against each repo's own baseline before committing. `product-card.liquid` and `main-collection.liquid` had already diverged between the two repos before this ticket; `image.liquid` and `media-grid.liquid` were byte-identical pre-fix and received the same edit in both. The color-contrast CSS locations also diverged: AED4LIFE duplicates `.additional-savings` across two media-query blocks in `theme.css` plus a `p.additional-savings` override in `main-collection.liquid`; AEDShop duplicates the same rule (unscoped) across `theme.css` and `base.css`. All locations were found and fixed independently per repo, not assumed to mirror each other.
- Eager-loading overrides are opt-in per section instance; the underlying schema default was changed mid-ticket (see Implementation Notes) from fully-lazy to a small nonzero desktop default, so "default" behavior below refers to the current state, not the ticket's original starting point.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | Product-card images in the collection grid render `loading="lazy"` by default on both AED4LIFE_AED and AEDShop_AED, instead of the previous hardcoded `loading="eager"`. |This is a section setting that can be updated. Setting used is best judgement with current collection templates.  | ✅ |  |
| 2 | The main collection grid section exposes desktop/mobile "eager-load rows" number settings, so merchants can keep a configurable number of above-the-fold rows eager for LCP. |  | ✅ |  |
| 3 | The media-grid section exposes desktop/mobile "eager-load count" number settings, scoping eager-loading to a configurable number of media blocks (in block order) instead of forcing every image in the grid eager whenever the section happens to be first on the page. |  | ✅ |  |
| 4 | Applied as targeted, repo-specific edits to both AED4LIFE_AED and AEDShop_AED, each verified against its own current code (not copy-pasted across repos). |  | ✅ |  |
| 5 | "Images not served as WebP/AVIF" finding is investigated against current Shopify CDN docs and closed with a documented verdict — no code change if Shopify already content-negotiates the format. | Confirmed empirically, not just from docs: live response headers on aed4life.ca show `content-type: image/webp` served for both a PNG-source and a JPEG-source image, neither URL carrying a `format:` param, both with `vary: Accept`. The CDN is already negotiating WebP on every plain `image_url` output — closed with certainty. | ✅ |  |
| 6 | PLP badge text ("In Stock", "Sale", and the other `.badge_tag` variants) renders at `#595959` instead of the previous failing color, on both stores. |  | ✅ |  |
| 7 | "Additional Savings at Checkout" text renders at `#595959` instead of the previous failing red, on both stores, in every stylesheet location where the rule was duplicated. |  | ✅ |  |

## Dev Notes:

*File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing further changes.*

- **`snippets/image.liquid`** (both repos) — the `<img loading="...">` attribute on the primary tag was hardcoded to `"eager"`. Fixed to `loading="{% if lazy_load %}lazy{% else %}eager{% endif %}"`, using the `lazy_load` param the snippet already computes/accepts (default lazy unless `lazy_load == false` or `section_index == 1`, i.e. the section is first on the page).
- **`snippets/product-card.liquid`** (both repos, diverged content) — added an `eager` param (default false); when true, sets `card_image_lazy_load = false` and passes `lazy_load: card_image_lazy_load` into the two `render 'image'` calls for the primary card image (metafield-image override case and the standard `featured_media` case). Hover-image and swatch-image renders are untouched — always lazy.
- **`sections/main-collection.liquid`** (both repos, diverged content) — added `eager_load_rows_desktop`/`eager_load_rows_mobile` number settings, schema default `1`/`0` (see Implementation Notes for the mid-ticket default change). Computes `eager_product_count = max(eager_rows_desktop × 4, eager_rows_mobile × 2)` — the 4/2 column-count multipliers are read off each repo's own `.collects .grid-item` CSS widths (`assets/main-collection-collects.css`; confirmed 4 cols ≥1400px / 2 cols ≤991.67px in both repos independently, not assumed shared). Per-product `card_eager` flag passed as `eager:` into `render 'product-card'`.
- **`sections/media-grid.liquid`** (both repos, byte-identical pre-fix) — the existing `section_index: section.index` param was passed identically to every block in the grid loop, so `image.liquid`'s pre-existing "eager if section is first on page" rule fired for *every* image in the grid, not just the visible first row. Added `eager_load_count_desktop`/`eager_load_count_mobile` settings (default 0); computed `eager_load_count = max(desktop, mobile)`.
  - **First implementation attempt (superseded, see below):** only passed `section_index` (as `block_eager_section_index`) for blocks within `forloop.index <= eager_load_count`, leaving it `blank` otherwise. This turned out to still depend on `image.liquid`'s `section_index == 1` check — i.e. the setting only worked if `media-grid` was literally the *first* section on the page. Live-verified on the real "Brand" page (`templates/page.brands.json`, live handle differs per store — see Testing Notes) that `media-grid` there is actually the 3rd section (`h1_title` → `rich_text` → `media-grid`), so `section.index` was `3`, and the configured `eager_load_count` values (`2`/`1`) silently did nothing — every image rendered lazy despite the setting.
  - **Fix:** stopped routing through `section_index` entirely. Now computes `block_lazy_load` per block (`false` for blocks within `eager_load_count`, `true` otherwise) and passes `lazy_load: block_lazy_load` directly into `render 'image'` — the same explicit-boolean pattern `product-card.liquid` already uses, independent of the section's position on the page. Vault pattern writeup: `04-engineering/patterns/loop-level-eager-loading.md` (updated to note the position-dependent version was itself buggy, not just a documented gotcha).
- **`locales/en.default.schema.json`** (both repos, diverged content) — added `t:` keys for the new `main-collection.liquid` settings (`header__performance`, `eager_load_rows_desktop`, `eager_load_rows_mobile`) under `sections.main_collection_grid.settings`, matching that file's existing locale-key convention. `media-grid.liquid`'s schema uses plain inline strings (not `t:` keys) in both repos, so no locale changes were needed for that section.
- **Color contrast — AED4LIFE_AED:** `.new_badge_list .badge_tag` in `assets/main-collection-collects.css`; `.additional-savings` duplicated in `assets/theme.css` (two responsive occurrences) and overridden again as `p.additional-savings` inline in `sections/main-collection.liquid`'s `{% style %}` block.
- **Color contrast — AEDShop_AED:** same `.new_badge_list .badge_tag` rule in its own `assets/main-collection-collects.css`; `.additional-savings`/`p.additional-savings` duplicated across `assets/theme.css` and `assets/base.css` (a different duplication pattern than AED4LIFE — found and fixed independently, not assumed to match).

## Implementation Notes:

- **AED4LIFE_AED**, branch `feature/AED-12905626203-mobile-audit`:
  - `7d879c6` — `snippets/image.liquid`, `snippets/product-card.liquid`, `sections/main-collection.liquid`, `locales/en.default.schema.json` (lazy-loading fix + eager-load-rows settings, schema default `0`/`0` at this point).
  - `9c901b8` — `sections/media-grid.liquid` (eager-load-count desktop/mobile settings), plus a merchant-applied settings update to `templates/page.brands.json` (`eager_load_count_desktop: 2` / `mobile: 1` on the first media-grid instance, `0`/`0` on the second).
  - `9cb99e0` / `21b3030` — untracked then re-tracked `templates/agents.md.liquid` (a `shopify theme pull` round-trip test file, unrelated to this ticket's substance; net no-op).
  - `98a5729` — changed `eager_load_rows_desktop`'s schema default from `0` to `1` (mobile default stays `0`), and explicitly set `1`/`0` on every other collection template using the `main-collection` section (`collection.main-collection.json`, `collection.manikins-simulators.json`, `collection.manikins-sub-template.json`, `collection.ROTAID.json`, `collection.zoll-sale.json`) so behavior is consistent across every collection page, not just the ones a merchant happens to re-save. See vault decision: `02-decisions/decisions.md` → "2026-09-02 · Eager-load-row settings default to 1 desktop row...".
  - `7bd6737` — color-contrast fix (`#595959`) across `assets/main-collection-collects.css`, `assets/theme.css`, `sections/main-collection.liquid`.
  - `5c1c7b5` — fixed the media-grid eager-load-count bug described above (position-dependent `section_index` → explicit `lazy_load` boolean). Note: an earlier attempt at this same fix was briefly committed directly to `release/_candidate` (`395fedf`) by mistake, and separately a stray `git pull origin release/_candidate` accidentally fast-forwarded the local `feature/AED-12905626203-mobile-audit` ref to that branch's tip — both were caught and reverted (local-branch resets against origin, nothing pushed) before landing this commit on the correct branch.
- **AEDShop_AED**, branch `feature/AED-12905626203-mobile-audit`:
  - `da0e00e` — `snippets/image.liquid`, `snippets/product-card.liquid`, `sections/main-collection.liquid`, `sections/media-grid.liquid`, `locales/en.default.schema.json` — same fix set as AED4LIFE's `7d879c6`+`9c901b8`, applied as targeted edits against this repo's own (diverged) `product-card.liquid`/`main-collection.liquid` content, not copied from AED4LIFE_AED.
  - `78ee7f0` — matched `collection.json`'s `eager_load_rows_desktop: 1`/`mobile: 0` to AED4LIFE's value (this repo didn't have the setting saved there yet).
  - `895729b` — same default-to-`1` schema change plus explicit per-template settings, mirroring AED4LIFE's `98a5729` (this repo has no `collection.zoll-sale.json` equivalent).
  - `31ece7c` — color-contrast fix (`#595959`) across `assets/main-collection-collects.css`, `assets/theme.css`, `assets/base.css` (this repo's own duplication pattern, found independently).
  - `5c512eb` — matched `templates/page.brands.json`'s media-grid `eager_load_count_desktop`/`mobile` values to AED4LIFE's (`2`/`1` on the first instance, `0`/`0` on the second) — both repos' `page.brands.json` share identical section/block IDs, confirmed before applying the value-only edit.
  - `63cfa6c` — same media-grid eager-load-count fix as AED4LIFE's `5c1c7b5` (position-dependent `section_index` → explicit `lazy_load` boolean).
- "Images not served as WebP/AVIF" — closed, no code change. See verdict in Necessary Info.
- Vault mirror: `roswell-vaults/vaults/aed4life/03-pm/issues/ISSUE-013.md`, decision entry in `02-decisions/decisions.md`, pattern doc `04-engineering/patterns/loop-level-eager-loading.md`.

## Testing Notes:

- **Lazy-loading default — AEDShop_AED:** live-verified via Playwright against dev theme `188272738625` (`https://aedshop.ca/?preview_theme_id=188272738625`, role `unpublished`). `window.Shopify.theme.id` confirmed before trusting page content. Pages tested: `/collections/all` and `/` (homepage). Read the `loading` attribute off the first 12 `.card__main-image` elements on `/collections/all` — all rendered `loading="lazy"`. Homepage doesn't use `media-grid`, so that setting wasn't visually checked live there.
- **Lazy-loading default + eager-row path — AED4LIFE_AED:** live-verified via Playwright against dev theme `188206940462` (`https://aed4life.ca/collections/all?preview_theme_id=188206940462`, role `unpublished`), `window.Shopify.theme.id` confirmed first. Read the `loading` attribute off the first 12 `.card__main-image` elements: the first 4 (`collection.json`'s `eager_load_rows_desktop: 1` × 4 desktop columns) rendered `loading="eager"`, every one after rendered `loading="lazy"`. This confirms both the lazy-loading fix and the `98a5729` default-to-`1` change are working correctly live, not just by static trace.
- **Lazy-loading default + eager-row path — AEDShop_AED:** live-verified via Playwright against dev theme `188272738625` (`https://aedshop.ca/collections/all?preview_theme_id=188272738625`, role `unpublished`), `window.Shopify.theme.id` confirmed first. Same result as AED4LIFE: first 4 `.card__main-image` elements render `loading="eager"`, every one after renders `loading="lazy"` — confirms the `895729b` default-to-`1` change is working correctly live on this repo too.
- **Media-grid eager-count path (both stores):** live-verified via Playwright on each store's dev theme, on the live page actually assigned `page.brands.json` — handle `manufacturer` on both stores (page title "Brand"), confirmed via `document.body.className === 'template-page.brands'`. `window.Shopify.theme.id` confirmed first in both cases.
  - AED4LIFE_AED: `https://aed4life.ca/pages/manufacturer?preview_theme_id=188206940462`. First media-grid instance (`eager_load_count_desktop: 2`): first 2 of 15 images `loading="eager"`, remaining 13 `lazy`. Second instance (`0`/`0`): all 4 images `lazy`.
  - AEDShop_AED: `https://aedshop.ca/pages/manufacturer?preview_theme_id=188272738625`. Identical result — first 2 of 15 `eager`, remaining 13 `lazy`; second grid all 4 `lazy`.
  - This live check is what surfaced the `section_index`-dependency bug in the first place (see Dev Notes) — the *first* implementation attempt was checked on this same page/theme combination and showed all-lazy despite the configured count, which is what prompted the fix to an explicit `lazy_load` boolean.
- **Color contrast — both stores, live-verified:** Playwright against each store's dev theme, `Shopify.theme.id` confirmed first in both cases:
  - AED4LIFE_AED: `https://aed4life.ca/collections/on-sale?preview_theme_id=188206940462` (theme role `unpublished`). Read `getComputedStyle(...).color` off `.badge_tag` and `.additional-savings` elements — all returned `rgb(89, 89, 89)` (`#595959`), covering "Sale" and "In stock" badges plus "Additional Savings at Checkout" text.
  - AEDShop_AED: `https://aedshop.ca/collections/on-sale?preview_theme_id=188272738625` (theme role `unpublished`). Same check, same result — `.badge_tag` ("In stock", "Sale", "Bilingual") and `.additional-savings` all `rgb(89, 89, 89)`.
- JSON validity of both repos' modified `{% schema %}` blocks, `locales/en.default.schema.json`, and every edited `templates/*.json` was confirmed via a local JSON parse (stripping the generated-file comment header) before each commit.

## Bugs from QA:

- TBD

## Clarifying Questions:

- None outstanding. The WebP/AVIF item's original open question ("is there a Shopify universal setting impacting this?") is resolved by the verdict above — Shopify's CDN already content-negotiates the format automatically.
