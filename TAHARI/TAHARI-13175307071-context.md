# TAHARI-13175307071: Nosto search + autocomplete, working context

Handoff doc for any agent or session picking this up. Read in full before acting. Update it when a decision lands or a step completes.

Last updated: 2026-10-28

## Rules (from Patty, standing)

- **No code changes without Patty's approval of the plan.** As of the last update, the plan below is proposed and waiting for a go-ahead.
- **Commits:** never add `Co-Authored-By` lines. Commit or push only when asked.
- **Playwright / browser checks:** Shopify allows only one preview theme at a time per browser session. **Always** open URLs with the `preview_theme_id=<id>` param, then verify `window.Shopify.theme.id` equals that ID before trusting anything on the page.
  - `nosto/_candidate` theme: `https://www.elietahari.com/search?preview_theme_id=157709861001`
  - For verifying in-progress theme changes, Patty runs `shopify theme dev` on the theme repo and provides a dev preview theme ID. Use that one, with the same verification.
  - **Every Playwright check covers mobile and desktop breakpoints** (Patty, 2026-10-23), not desktop alone. Widths: 375 / 768 / 1024 / 1440px (one per band of the theme breakpoints 480 / 750 / 990 / 1400; Patty, 2026-10-23), plus 600px when the 480–749 band matters. Compare live and Nosto at the same widths.
- **Consent: our build must be compliant even though live may not be** (Patty, 2026-10-28). Everything Nosto-related we ship (search, collection, autocomplete, carousels, and the Nosto tracking they trigger) honours the shopper's Consentmo / Shopify Customer Privacy choice. Live-theme gaps are context, not a precedent. See item 21.
- **Animations: live's first** (Patty, 2026-10-28). Loading / skeleton / reveal animations reuse what live ET has (theme AOS `data-aos`, `lazy-image--backfill is-loading` shimmer, image fade-in). A Nosto or new animation only if more performant, and only after asking Patty.
- **New theme sections are named `rs-nosto-*`** (file and handle; editor name "RS: Nosto …") (Patty, 2026-10-23).
- **Theme branches:** branch from the latest `origin/nosto/_candidate`. Name: `nosto/feature/TAHARI-13175307071-<desc>` (the auto-PR workflow opens a PR into `nosto/_candidate`). Use a separate git worktree; the theme repo's main checkout has untracked files belonging to Patty.
- **PRD:** author with `/Users/pk/Documents/obs-roswell/Ticket Authoring Prompt v2.md`. There is no Monday PRD; the source is the SOW. Monday ID **13175307071**, project key `TAHARI`. Confirm each AC with Patty before finalizing.
- **Vault:** `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/elie-tahari/`. Protocol: `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md`. Only write verified facts; don't log undecided items in `02-decisions/decisions.md`.

## Snapshot — 2026-10-28 (session edd5a102)
- Merged: Nosto PR #14 → `release/_candidate` (preview push needed `force=true`: guard tripped on the 2026-10-23 `nosto:dev` build) and deployed live by Patty; theme `nosto/_candidate` at 6808740 (includes quick add v2, TAHARI-13231452690).
- **Quick add v2 works on Nosto cards, no change needed** (verified 2026-10-28, dev 158466539657): `theme.dev.js` fetches `window.theme.settings.quickAddSection` (`api-product-upsell-v2`) for any `<quick-add-product>`, incl. Nosto-injected ones; `buy-now-button.js` loads from `head.liquid`. Drawer opens with the PDP form + Buy Now on collection (375 / 768 / 1024 / 1440) and search (`dress`, same widths). Carousel not tested: both RS: Nosto carousels are **disabled** in `templates/index.json` / `collection.json` (Patty's dev settings 7a80c82); same card snippet, so expected to work (inference).
- **Done 2026-10-28: queue items 2, 14, 16(c, d), 18** — Nosto `be8edcb`, `cf0ea84`; theme `730a287`, `dd0026e`. Not pushed (Nosto: ask Patty; theme: push with `git push origin HEAD:nosto/feature/TAHARI-13175307071-search-template` when she says). Verified on dev 158466539657 with Nosto Preview **toggled on** (check it every time — a fresh browser has it off; proof of build: Nosto's skeleton has `.lazy-image`, the deployed one `.ns-shimmer`).
  - Grid: `rs-nosto-results` server-renders `[data-nosto-placeholder]` (caption on search, invisible toolbar row, `rs-nosto-skeleton-card` × collection count up to a page / 36 on search) inside the mount; `Portal` clears around it, CSS hides it once Nosto's content is beside it, a MutationObserver removes it. CLS collection 0 / 0.006 / 0.004 / 0.001, search 0.033 / 0.008 / 0.003 / 0 at 375 / 768 / 1024 / 1440 (live 0.027 / 0.016 / 0 / 0; was 0.11–0.18 at 375). Mount never 0px. Remaining: a 17px row growth when a card has a 2-line title / badge line; the infinite-scroll pagination block (155px) appears below the grid after results.
  - Skeleton look: theme's own `lazy-image--backfill is-loading` (`--bg-accent` #fdfaf9, shimmer ≥750px), what live and the real card show until the image fades in; text bars `--bg-accent`, no animation. Near-invisible on ET's cream background, same as live.
  - Carousel, Lazy load off: `<nosto-section-campaign>` holds a skeleton heading + 5 cards (same slider classes) until Nosto answers; section collapses if Nosto finishes (`:defined:not([loading])`) with the skeleton still there, or renders no `.grid-item`. Homepage CLS 0.029 / 0.017 / 0.004 / 0 (was 0.5–0.76). Tested: failed request and empty section both collapse. Lazy carousels unchanged (collapsed until filled) and now actually defer on collection / search, since the grid holds its height (no Nosto request at load).
  - Reveal: cards already animate via the theme's AOS (`img-in` + `fade`, staggered); heading now `data-aos="hero"` like `related.liquid`.
  - `?p=5` stuck skeletons: not reproduced (fresh load, reload, mid-grid restore all fill within ~3s, 200s). A mid-grid restore fired ~72 card requests at once — relevant to item 4. `?p` param assessment sent to Patty (not a Nosto requirement as far as docs show; Back lands at top on both live and ours, ours renders N pages); **Patty asking Nosto; no change until she decides.**
- 2026-10-29: `nosto:dev` 401'd ("This user is not authorized") on a valid login; fixed by Patty logging in again — likely the login had landed on another account. If it recurs: `npx nosto status`, then `npm run -s nosto:remote` (read-only) to confirm.
- **Pushed 2026-10-29** for Patty to merge before the consent gate: Nosto PR #16 (→ `release/_candidate`), theme PR #134 (→ `nosto/_candidate`), vault `feature/pk-2`. Patty's editor settings (`templates/collection.json`, `index.json`) deliberately left uncommitted. After merging Nosto: the preview push will trip the guard again (`nosto:dev` pushed a local build) → re-run `nosto-preview.yml` with `force=true`, then deploy live in Nosto Admin.
- **Next up: item 21 (consent research)** — Patty, 2026-10-28: consent compliance is important and every session must know it (standing section in `docs/AGENT-GUIDELINES.md`); whichever agent gets there does the research. Docs findings are under item 21; the browser part (two loads on the deployed template) is still to do. Then items 19, 20, 22.

## Snapshot — end of session b25fcc36, 2026-10-23
- Nosto questions sent to Nosto (queue item 0); waiting on answers.
- Page views: autoloader's `ev1` counts the view; `<nosto-section-campaign>`'s `ev1` is sent with `skipPageViews=true` (added by Nosto's client; the component calls plain `load()`). Not double counted (Patty checked both requests).
- `<nosto-campaign>` has a `lazy` attribute (IntersectionObserver); `<nosto-section-campaign>` doesn't, so `assets/rs-nosto-carousel.js` deferral stays.
- Theme worktree: Patty's editor changes committed (2d01202, 37ac00a, 96a47c8): collection toggle on, carousel on collection (`categorypage-nosto-1`) and homepage (`frontpage-nosto-2`, lazy off, currently the **first** section). Not pushed yet.
- Next: queue item 2 batched with 14, 16 and 18 (loading states, layout shift, carousel CLS + reveal, cards in view never show skeletons).

## CURRENT STATE — 2026-10-22 (read this first; sections below it are older)

**Nosto search is live on the `nosto/_candidate` theme and rendering real results.** The whole chain works:
our code → CI → Nosto preview → live deployment → theme mounts → theme-rendered cards.

**Account (unblocked 2026-10-22).** `shopify-35089973385` is provisioned: `searchEnabled`, `searchTemplatesEnabled`
and `categoriesEnabled` are all true, `searchApiUrl` is `https://search.nosto.com/api/`. Nosto issued both
`API_SEARCH` and `API_APPS` tokens. **Only `API_APPS` works for CLI/CI pushes** — `API_SEARCH` returns 401,
so BaubleBar's README is right and Nosto's CLI docs are wrong on this. Still outstanding on Nosto's side:
**multi-currency is USD-only** while the store uses Shopify Markets with the market-aware embed.

**CI/CD, wired and proven.** Repo variable `NOSTO_CI_ENABLED=true`; GitHub Environment `nosto-live` with
vars `NOSTO_MERCHANT=shopify-35089973385`, `NOSTO_GUARD=strict` and secret `NOSTO_API_KEY` (the `API_APPS`
token). First preview push succeeded: guard reported "Remote is empty — first push to this merchant", 115
files uploaded, build info recorded `origin: ci`. Going live is **deliberately manual** in Nosto Admin —
BaubleBar tried automating it and reverted (`7c49158`). A `workflow_dispatch` "deploy to live" button is an
option if redeploying for review gets tedious. Dependabot still opens PRs until the config removal reaches `main`.

**Two pipelines, two repos.** Nosto repo: feature push → CI → merge to `release/_candidate` → preview push.
Theme repo: `nosto/feature/*` push → auto-PR → merge to `nosto/_candidate` → `update-nosto-candidate.yml`
runs `shopify theme push` to theme **157709861001** ("RS: nosto/_candidate [DO NOT DELETE]").

**How previewing actually works.** A theme setting does NOT gate whether Nosto loads its bundle — Nosto
serves the deployed template from the account, with no knowledge of the Shopify theme. The theme setting
only controls whether the mounts exist. Proven on BaubleBar's live site: template deployed, theme unmerged,
bundle loads on every page and renders nothing. So without a live deployment, reviewers need
`?nostodebug=true` + a Nosto login + the Preview toggle; with one, any theme carrying the mounts renders for
everyone. That trade-off is why we deployed live while the live theme stays mount-free.

**Verified rendering on theme 157709861001 (2026-10-22):** results caption, sort dropdown reading the
theme's translated labels, the Model | Product switcher, 4-column grid of theme cards (images, titles,
sale pricing, colour counts), lazy card loading (36 cards, 8 fetched, skeletons holding the rest),
pagination, Filters button with **3 facet groups** — so facets are configured in Nosto Admin. Broadcast's
own search is fully stood down (no `<predictive-search>`, no `#SearchLoop`).

**Open — next up:** refine **autocomplete** and **filters**; investigate why Nosto returns **85** results for
"dress" where Shopify returns **376** (likely mostly that Shopify counts pages/articles and matches more
fields, plus our `hide`-tag prefilter — unconfirmed); the filter drawer has never been visually QA'd against
ET's CSS; multi-currency; category/PLP page.

**Repo defects found 2026-10-22:** the restructure reverted earlier package upgrades — `@nosto/search-js` is
back to 3.26.2 (latest 3.28.2) and `@nosto/nosto-cli` to 1.4.1 (latest 1.6.0). Decision: stay on BaubleBar's
exact versions for now so behaviour comparisons hold. Agent skills (`.claude`/`.agents`) were deliberately
left alone — BaubleBar has a useful `nosto-theme-integration` skill not yet ported, and ours still reference
Storybook, which now lives in `.unused/`.

## Known issues to fix next (from Patty, 2026-10-22, not exhaustive)

Found on the first visual QA of theme 157709861001. Each needs browser iteration against the live site
for comparison — unit tests and theme check will not catch any of them.

**Issues 1 and 2 are fixed (2026-10-22)**, verified on dev theme 158466539657 against the live theme at
390 / 600 / 1100 / 1440px (820px not checked: the search wouldn't open in Playwright there). Commits:
Nosto `bc4d621`, `fe010b5`; theme `e1cb7ef`. Mechanisms are in the vault pattern doc
(`04-engineering/patterns/nosto-search-templates.md`). The original notes below are kept for context.

**Work queue** (Patty, 2026-10-23: new to-dos go to the end unless she says otherwise; keep the PRD's AC table
`obs-roswell/TAHARI/PRD/TAHARI-ISSUE-13175307071-nosto-implementation.md` updated as items are verified):
0. **Sent to Nosto 2026-10-23; waiting on answers (tiles, carousels / multi-currency, autoloading, empty-results scope).** Was: **Priority (Patty, 2026-10-23):** Nosto questions on Content Personalization (tiles), and recommendation carousels for no-results search / autocomplete and category pages: draft `docs/comms/2026-10-23-nosto-ocp-recs-questions-slack.md`. Patty sends; then wait on answers before building tiles or carousels.
1. ~~Collection: infinite scroll~~ done 2026-10-23 (22 → 44 → 66 → 72, no duplicates, 1440 / 390).
2. **Done 2026-10-28** (see snapshot). Loading states vs live: grid and cards, on search and collection. Where Broadcast has none, mimic live's look. **Together with item 14** (layout shift while Nosto loads). **Cards in the viewport must never stay in the skeleton state** (Patty, 2026-10-23: four skeletons stuck in view on `/collections/bottoms-collection?p=5` after waiting; not reproduced in Playwright — 108/108 cards loaded, all 200. Suspects: a Cloudflare 429 on card requests in her session, or lazy cards missing their first intersection when `?p=N` restores scroll on reload. Next time: Network filter `api-nosto-product-card` for 429s; inspect whether the stuck `<nosto-dynamic-card>` is empty.)
3. Filters on collection pages vs live; chip removal, Clear Filters and Reset behaviour (search + collection).
4. PLP 429 / per-card request check (5 pages, infinite scroll).
5. Remaining unverified autocomplete ACs: 750–989px columns, suggestion / collection / product clicks, Enter and
   "Search for", keyboard navigation, mobile behaviour, settings toggles, translations, Nosto analytics.
6. Remaining unverified search / collection ACs: back / forward / reload, analytics, RS: Nosto settings and
   section settings applied when changed.
7. **Done 2026-10-28** (theme `8fbbf61`): hideFilters, clearFilters, showMore, viewItemsOne/Other, popularSearches now from theme locale keys (en verified; other locales not published on the storefront, keys present in the 6 locale files). **Left on English, no theme translation exists (live renders none of them):** sortAndFilters + pagination (aria labels), loadMore — need copy for 6 locales if wanted. productsOne/Other unused. Was: Translated copy gaps: `nosto-i18n.liquid` doesn't pass hideFilters, clearFilters, showMore, viewItems*,
   pagination, loadMore, popularSearches, sortAndFilters (English fallbacks in other locales).
8. 85 vs 376 "dress" result-count investigation.
9. Cleanup: old Search / Collection products sections still hold Nosto branches (pending Patty); unused
   `focusGroup` in FilterDrawerContext.
10. Recommendation carousels (scope TBD), multi-currency.
11. **Done 2026-10-29** (Nosto `64f33b3`, theme `c33c165`; title reads "Search: 85 results found for "dress" – Elie Tahari" at 375 / 768 / 1024 / 1440, Shopify's said ~400): theme adds `data-title-caption` (Shopify's `results_with_count_and_term` caption, matches the server `<title>` exactly — verified for 3 queries); Nosto swaps it for its own count once results arrive (`SearchPage.tsx` `useResultsTitle`), keeping "Search: … – Elie Tahari". Search page `<title>` shows Shopify's server-side result count (e.g. "Search: 91 results found") while Nosto shows its own (0) — make the title follow Nosto's count or use a neutral title. Note: live's Shopify search sometimes returns hundreds of products for nonsense queries (289 for `adfsdfsf`), inconsistently; Nosto returns 0.
12. Autocomplete product count: live's dropdown requests `/search/suggest` with Shopify's default 10 results shared across types (`assets/theme.dev.js:5619`), so products fill whatever suggestions leave ("dress": 4 + 3 + 3; no suggestions: 10 products full width, 4 cols desktop / 1 mobile). Ours always shows 3. Proposal: request up to 10, show 10 − suggestions (min the Products setting); only rendered cards fetch.
13. Recommendation carousels: render in the theme's layout. Design and layout references: the homepage Featured collection carousel and the PDP Product recommendations carousel (same product card as search / category). A test campaign div on a collection page currently renders Nosto's default template ("Products you recently viewed", mock tiles). Approach being researched (2026-10-23).
    Decided (Patty, 2026-10-23): one reusable section `rs-nosto-carousel` ("RS: Nosto carousel") with a text setting for the Nosto placement ID, used on homepage / PDP / 404 / category pages (same carousel; only the placement changes). It renders `<nosto-section-campaign placement section="rs-nosto-carousel-items">`; `rs-nosto-carousel-items` copies `snippets/products-recommendation.liquid` (`grid-slider` + `product-grid-item`), looking up products by handle from `search.terms`. Still open: replace or add alongside the PDP's `related.liquid` / homepage Featured collection; title source; cart drawer; reserve height vs no gap. Waiting on Nosto answers (docs/comms/2026-10-23-nosto-ocp-recs-questions-slack.md). **Web Components toggle**: Nosto's docs place it in Recommendations → Settings (loads Nosto's own web-components artifact at a chosen version), but it isn't shown on this account's Settings page (checked 2026-10-23). Not needed — our Search Templates bundle already imports `@nosto/web-components` 11.6.0 on every page (`src/entries/injected.tsx:9`); enabling it could load a second copy. If it ever appears and is needed, pick 11.6.0. **Autoloading + carousel requests:** Nosto's autoloader stays on; `<nosto-section-campaign>` adds a second `ev1` per page, but both responses carry the same `pv` (1 on first load, 2 after reload) — no double-counted page views (checked 2026-10-23, dev homepage). **Mock recommendations — root cause found (2026-10-23):** the Nosto multi-currency app embed (`nosto-mc-embed-block`, enabled on the dev theme) adds `variation: "USD"` to page tagging; the account has no USD variation / exchange rates, so every recommendation returns `result_type: "MOCK"`. Verified: same request without the variation returns `"REAL"`, and RS: Nosto carousel on the dev homepage (`frontpage-nosto-2`) renders 5 real products in the theme slider. Patty turned that embed **off on the dev theme** for testing (2026-10-23). Whether it's needed at all is open: dynamic product cards render through Shopify in the shopper's market (market currency; products unavailable in a market should be filtered out the same way — assumed from how Shopify works, **not confirmed**: non-US markets do exclude some products, but those aren't in the Online Store channel, so it can't be tested yet). **Patty's scope position: leave the embed disabled for this project.** Asked Nosto (incl. whether they discussed it with Claudia). Fix: Nosto sets up multi-currency (already open). `result_type` (`REAL` / `MOCK`) is the flag to gate on. **Recommendations master switch is off** (Nosto Admin → Recommendations → Settings → Recommendation visibility, 2026-10-23), so campaigns return nothing outside the debug toolbar's Preview; keep it off and test in Preview. In Preview the Session API (`viewCategory`) returned real products for `categorypage-nosto-1` while the web component's `createRecommendationRequest({ includeTagging: true })` got mock ones — open, Patty checking the debug toolbar; question also in the Nosto message. POC theme sections: `rs-nosto-carousel` + `rs-nosto-carousel-items` (theme `00edac5`); on the default collection template beside a custom-code `nosto_element` div with the same placement, on purpose, to compare Nosto's out-of-the-box HTML template with ours. **Circle back (Patty, 2026-10-23): when a campaign has no real products, render nothing** — no heading, no padding band, never Nosto's mock placeholders ("Mock Product 2", handles like `12345678902`, example.com URLs, which Nosto returns e.g. for Recently viewed with no history / in preview). The items section already outputs nothing for unknown handles; the wrapper's padding still needs collapsing (decide with the reserve-height question in item 2). A second layout like the homepage "Products with image" section (large image + product grid) may follow as its own `rs-nosto-*` section — on hold, beyond SOW scope; only if hours allow.
14. **Done 2026-10-28** (see snapshot). Prevent layout shift while Nosto loads (CLS): the grid is injected by JS, so content below (e.g. a recommendation carousel) shows at the top until results render. Reference: `~/Documents/roswell-studios/the-sak-vite-sak-owned` (Searchspring, same concept). Overlaps item 2 (loading states).
15. RS: Nosto carousel: hide the whole section (padding included) when Nosto returns no real products. **Decided (Patty, 2026-10-23): option 1** — CSS only, collapsed until a card exists: `[id^="RsNostoCarousel--"]:not(:has(.grid-item)) { display: none; }`. No JS or extra request; empty campaigns take no space; a shift on fill only counts for CLS inside the viewport (carousels sit low on pages — assumption). A "reserve space" option for above-the-fold placements only if ever needed, using item 2's skeleton. Pairs with items 2 / 14 and the carousel circle-back.
16. **Done 2026-10-28** (a–d; see snapshot). RS: Nosto carousel performance + layout shift (pairs with 2 / 14 / 15): (a) card images — the card snippet reads `section.settings.layout_desktop` / `grid` (`snippets/product-grid-item.liquid:130–141, 739–741`); the items section has none, so every card image renders `loading="eager"` + `fetchpriority="high"` — make them lazy / normal priority; (b) `<nosto-section-campaign>` has no lazy option (loads on connect; batches placements) — defer adding it until the section is ~1 viewport away (IntersectionObserver); (c) layout shift when a carousel fills (Patty, 2026-10-23): with option 1 (collapsed until filled) + early load, measure CLS on homepage / PDP / collection at 375 / 768 / 1024 / 1440. **(a) + (b) done 2026-10-23** (theme `df79247`, `f23b06c`): optional `lazy` param on `product-grid-item` (lazy + normal priority), deferral via `assets/rs-nosto-carousel.js` unless `section.index < 3`, empty wrapper hidden with `:not(:has(.grid-item))`. Verified homepage (section 2): 0 eager / 0 high-priority images (was 5). **Deferral doesn't take effect on search / collection pages until the grid reserves its height** (item 14): before Nosto renders, the carousel sits under the toolbar and triggers at once. (d) **Reveal should animate like native Broadcast sections** (Patty, 2026-10-23).
17. **Done 2026-10-29** (Nosto `9fe8918`; empty collection without filters: no Reset at 375 / 768 / 1024 / 1440; a filter that empties the grid: Reset shows at 375 / 1440 and clears to 22 cards): `NoResults` shows Reset only while filters are applied (test added). Collection empty state: on landing with no products and no filters applied, hide the Reset button (it does nothing). Show it only when filters are active. Seen on `/collections/new-arrivals-xx` (Patty, 2026-10-23).
18. **Done 2026-10-28** (see snapshot). RS: Nosto carousel with Lazy load off (e.g. homepage, first section): it doesn't reserve space, so the section below renders and then shifts down. Reserve the carousel's height until the Nosto response arrives; hide only if nothing comes back (content is the likely case). This changes item 15's "collapsed until a card exists" approach. Batch with 2 / 14 / 16 (Patty, 2026-10-23).
19. **Done 2026-10-28** (theme `980d600`): cards moved to `snippets/rs-nosto-carousel-items.liquid`; sections `rs-nosto-carousel-items` (model) / `rs-nosto-carousel-items-product` (product) chosen by the setting. Verified Model and Product on the homepage at 375 / 768 / 1024 / 1440 (5 of 5 cards ghost-first in Product mode). Gotcha: section schema `name` max 25 chars, or the upload is silently rejected (404 from Section Rendering). RS: Nosto carousel "Product card image" setting (Model / Product), like `section-collection.liquid:223` / `section-products-image.liquid` (`card_image_mode`, default `model`) (Patty, 2026-10-28). Can't be a plain setting: Nosto fetches the cards from `rs-nosto-carousel-items` via Section Rendering, which can't read the parent section's settings. Proposal: move the items markup into a snippet with two thin sections (`rs-nosto-carousel-items` = model, `rs-nosto-carousel-items-product` = product) and let the setting pick the `section` attribute. Server-rendered, no JS swap (see `product-grid-item.liquid` comment / vault `product-card-image-modes.md`).
20. **Done 2026-10-28** (theme `af087ae`; sort off / filters off / both off verified on collection at 375 / 768 / 1024 / 1440, search sort-off at 375 / 1440; CLS unchanged; placeholder toolbar row follows the toggles). Also fixed: `default: true` turned an unticked `false` into `true` — now `allow_false: true`. "Enable sort" / "Enable filters" checkboxes on RS: Nosto collection and RS: Nosto search (Patty, 2026-10-28, via another session). The old Search / Collection products sections have them (`enable_sort` / `enable_filters`, default true) and pass them to `rs-nosto-results`; the new sections don't, so `data-enable-sort` / `-filters` are always on (`src/lib/themeSettings.ts` `getToolbarSettings`). Add both (same ids / labels), pass through, verify each toggle at 375 / 768 / 1024 / 1440. Don't restore `showSort` (sort inside the drawer, removed on purpose in fc73406; BaubleBar pattern).
21. **NEXT UP** (Patty, 2026-10-28: slotted ahead of 19 / 20 / 22). Consent compliance (Patty, 2026-10-28): Nosto tracking must follow the shopper's consent as set in the store's consent tool (believed to be Consentmo — `consentmo_cookie_consent.js` loads on the storefront, seen 2026-10-28). Assess whether any Nosto tracking (incl. on page load: `ev1` page views, search / category analytics, card impressions and clicks, session cookies) must be gated until consent is known, and which Nosto data counts as required / functional vs analytics / marketing. Research with current (Oct 2026) sources: Nosto docs on consent / GDPR (e.g. their consent API), Shopify Customer Privacy API, Consentmo's Nosto handling. Recommendation before any change.
    **Observed 2026-10-28 (Playwright, live theme 157927932041, fresh cookie-free context each run, desktop; Shopify region `USWA`):**
    - Banner: Consentmo (`<csm-cookie-consent>`, shadow DOM) shows Preferences / Accept; Preferences has Necessary (locked), Statistics, Marketing, Preferences — **all pre-ticked**. Before any choice `Shopify.customerPrivacy.currentVisitorConsent()` already returns `yes` for marketing / analytics / preferences and `shouldShowBanner()` is false (US = opt-out defaults; an opt-in region, e.g. EU, would differ — **not tested**, needs an EU IP / VPN).
    - Before a choice: Nosto loads (`apps/proxy/.../nosto.js`), sends `ev1` and a `token` request, and sets `2c.cId`. With US defaults that is consistent with "consent = yes".
    - **After rejecting everything** (untick Statistics, Marketing, Preferences → Save choices): Customer Privacy reports analytics / marketing / preferences `no`, but **Nosto is unchanged** — `isDoNotTrack()` false, `2c.cId` still set, every page still sends `ev1` with the customer id, and the search page sends `search.nosto.com` + `analytics/search/impression` with the customer id. **So today neither Nosto nor the theme honours a reject.** Pre-existing on live (Nosto's Shopify app embed), not introduced by this build; our build adds more Nosto calls that would inherit it.
    - Context (Patty, 2026-10-28): the Nosto app embed is on for the live theme **at Nosto's request**, to start gathering data — so Nosto calls on live are expected. Open point only for the search query below.
    - Side finding: on the **live** theme (no Nosto mounts) the search page still calls `search.nosto.com/v1/graphql` and logs a search impression (observed); collection pages on live do the same (`search.nosto.com` + `analytics/category/impression`). Cause (traced): `src/shared/SearchQueryHandler.tsx` runs the initial query on any search page with `q` or any category page, with no check for a mount — unchanged from Nosto's search-templates-starter (`331b8ec`) and identical in BaubleBar. Option: only query when the results mount exists. Patty's call / ask Nosto (live embed is on at Nosto's request to gather data). Wasted request per search plus analytics for results never shown. Check with Nosto / gate the template on the mount existing.
    - Scope (Patty): live's gap is not ours to copy — our build must comply. Design note (inference, to verify): Nosto's page-view `ev1` comes from Nosto's own embed ~0.9s after load, before our bundle runs, so a gate set only in our bundle is too late; it likely needs a theme snippet ahead of the Nosto embed that queues `nostojs(api => api.visit.setDoNotTrack(true))` (or holds Nosto) until `Shopify.customerPrivacy` says yes. Confirm with Nosto which they support.
    - What the page view carries (guest, first visit, PDP, observed): `GET connect.nosto.com/ev1?m=…&message={url, page_type, cart: [...], events: [["vp", <product id>]]}`, then a `token` request; from the next page on, `c=<visitor id>` is added. `2c.cId` is a first-party, non-HttpOnly cookie that expires in ~13 months. No name or email for a guest; IP and user agent travel with every request anyway. Logged-in customers: Nosto's Shopify tagging likely adds customer details (email / name / marketing permission) — **inference, not tested** (needs a test customer login).
    - Consentmo **does** write Shopify's consent: saving choices in Consentmo flipped `Shopify.customerPrivacy.currentVisitorConsent()` to `no` immediately (observed). Consentmo is confirmed on the storefront (`<csm-cookie-consent>`, "Powered by Consentmo", `consentmo_gcm_*` globals). Recommendation: gate on Shopify's Customer Privacy API (Consentmo-agnostic, also what Shopify pixels use), not on Consentmo internals.
    - **Queued Do Not Track works with the app embed (tested 2026-10-29, candidate 157709861001, fresh context, US):** Nosto's documented stub (`window.nostojs = window.nostojs || function (cb) { (window.nostojs.q = window.nostojs.q || []).push(cb) }`) plus `nostojs(api => api.visit.setDoNotTrack(true))` before `nosto.js` → `isDoNotTrack()` true, no `2c.cId`, no `token` request, `ev1` without visitor id, no search / category impressions; search still returns results (8 cards). Baseline sends all of those. Nosto's docs (askQuestion, 2026-10-29): DNT must be set before any request; still sends data (anonymous); `setAutoLoad(false)` is not a gate; only documented full gate is not loading the script; nothing documented about gating the Shopify app embed.
    - Where Nosto loads: app embed `shopify://apps/nosto/blocks/nosto-script-embed-block` renders in `<head>` after `content_for_header` and injects `apps/proxy/script/shopify/market/nosto.js` inline. Enabled on live and candidate in admin; **not in the repo's `settings_data.json`, so the dev theme has no embed** (Nosto loads there only with `nostodebug`). Also a Nosto **web pixel** with `privacyPurposes: ["ANALYTICS","MARKETING"]` — Shopify gates web pixels on consent itself.
    - **Proposed gate (awaiting build):** inline snippet early in `<head>` (before the embed): stub + queue DNT when `Shopify.customerPrivacy` doesn't allow analytics / marketing, or consent is undecided where it's required up front; listen for `visitorConsentCollected` for later changes. No extra request. To test on dev, Patty enables the Nosto app embed in dev's theme editor (local `settings_data.json`, stays uncommitted). EU tests need Patty's VPN switched — tell her when.
    - Nosto call sheet (all open questions, consent first): `docs/comms/2026-10-29-nosto-call-questions.html`.
    - **Gate built 2026-10-29, uncommitted** (theme worktree, branch `nosto/feature/TAHARI-13175307071-search-template`): `snippets/rs-nosto-consent.liquid`, rendered in `layout/theme.liquid` after `head`, before `content_for_header`. Shopify's consent isn't readable that early (`_shopify_analytics` / `_shopify_marketing` cookies are HttpOnly; `Shopify.customerPrivacy` arrives ~page load; Consentmo's own `cookieconsent_preferences_disabled` is readable but vendor-specific), so the gate keeps the last known Shopify value in `localStorage['rs-nosto-consent']`. Before Nosto: stub + queue DNT if stored `denied`, or nothing stored and `localization.country` is EU/EEA/UK/CH. At load (reusing the already-loaded API; `loadFeatures` only as fallback — avoids a duplicate consent-tracking-api request) and on `visitorConsentCollected`: store granted/denied (needs analytics + marketing + preferences until Nosto confirms the mapping); on denied, DNT for the rest of the page and expire `2c.cId`.
    - **Verified on dev 158466539657 (US, desktop, 2026-10-29):** no choice → stores granted, normal tracking (visitor id from page 2). Reject via Consentmo → DNT on the same page, `2c.cId` cleared, nothing more sent; next pages: `ev1` without visitor id, no token, no impressions, search works. Stored denied + Shopify yes → that page DNT, stores granted, next page normal. One consent-tracking-api request per page. **Still to test: EU (Patty switches VPN; first-visit DNT before any choice, then reject / accept), 375px, a logged-in customer.**
    - **EU test (France VPN, 2026-10-29, dev, 1440 + 375): the store grants consent by default in the EU.** Fresh visit, no banner interaction: `getRegulation()` GDPR, `isRegulationEnforced()` true, `shouldShowBanner()` true — yet `getTrackingConsent()` "yes", `currentVisitorConsent()` all "yes", every `*ProcessingAllowed()` true, and Shopify's own `_shopify_analytics` / `_shopify_marketing` cookies are set. Banner offers Preferences / Accept with all categories pre-ticked. So the gate's first page is DNT (country FR), but it then stores "granted" from Shopify and tracks from page 2 — before any choice. Root cause is the consent configuration (Consentmo / Shopify customer privacy), store-wide (Shopify analytics and other apps also run pre-consent), not our code. Options: (a) fix the configuration so EU visitors are not consented until they choose; (b) also make our gate stricter in GDPR regions (e.g. require an explicit choice — Consentmo records one in `cookieconsent_status1`, absent before a choice — vendor-specific). Awaiting Patty.
    - **Decided (Patty, 2026-10-29): code follows the consent values the store exposes; no assumptions for the client.** The configuration must be right; our gate just follows Shopify's values. Consentmo's compliance score is 62/100; top issue "Cookie state before consent is not compliant" (EU etc.) — Behavior → "Cookie state before user choice" has Statistics / Marketing / Preferences ticked, model "Accept / Preferences" (no Reject), Smart Geotargeting off. Consentmo's docs confirm it pushes those defaults to Shopify as "yes". **Client hasn't prioritised compliance;** Patty suggesting to the MP to raise it; client may use Consentmo support to save hours — **suggest requesting Consentmo's free expert compliance review** (dashboard → "Request a review"); banner ignored rate 62.64% (7 days, worldwide) hints at the analytics impact; **tell them analytics will likely drop** once opt-in regions aren't consented by default. Full audit + settings checklist + evidence: vault `04-engineering/planning/TAHARI-13175307071/README.md` (PR #1272). Pending from Patty: whether to drop the gate's own country list (my proposal: no consent value yet → Do Not Track, for everyone, until Nosto answers on the first request).
    - **Moved to its own local branch `nosto/feature/TAHARI-13175307071-consent-gate` (Patty, 2026-10-29; not pushed; the search-template branch is back at `d30a8fe`, so dev no longer has the gate). Nosto's Shopify app has native consent handling (https://docs.nosto.com/shopify/features/shopify-cookie-consent-tracking — analytics → identifier, marketing → FB/GA sharing, mid-visit, needs "turning the feature on"; not on for this store per our live tests) — may replace the gate; ask Nosto / check Admin, then test natively.** Committed 2026-10-29 (theme `9c21d81`), first-page rule changed per Patty: no stored "granted" → Do Not Track, for everyone (country list removed; no region assumptions). Verified France 1440 / 375 (page 1 DNT, no cookie, search works; page 2 follows Shopify). US re-test pending VPN switch back. **First-visit timeline (France, dev):** `nosto.js` ~1.6s → first `ev1` ~2.4s → `Shopify.customerPrivacy` ~2.9s with empty (undecided) values → Consentmo init ~6.9s → **Consentmo itself calls `setTrackingConsent(all true)` ~8.9s** (`initialConsent: true, isConsentProvided: false` — no shopper action) → Shopify `visitorConsentCollected` ~9.1s. Consentmo's events: `consentmoSignal_onLoad`, `consentmoSignal` (ConsentUpdate), `window.Consentmo` (`getStatus`, `currentVisitorConsent`, …). Upgrading the first page after consent (Patty's idea) isn't documented by Nosto (DNT requests still processed → double-count risk); asked on the call sheet (1.6). Logged-in customer test: Patty will log in for me when ready.
    - Known limits: a choice changed outside a Consentmo event (none seen) applies from the page after; the first page of a first visit in an opt-in region relies on `localization.country` (market country, not IP) — Shopify's own region logic may differ. **Consentmo has no way to reopen after a choice** (no floating icon, no footer link) — shoppers can't change their mind; flag to Patty / client (Consentmo setting).
    - Not yet tested: EU / opt-in region; mobile widths; whether a reject *before* Nosto's first request (fresh visit in an opt-in region) prevents `2c.cId`.
    **Findings 2026-10-28 (docs only, nothing observed in a browser yet):**
    - Nosto documents **two** levels of opt-out (https://docs.nosto.com/techdocs/apis/frontend/implementation-guide-session-api/advanced-usage/spa-out-out-of-session-tracking.md):
      (a) don't initialise Nosto at all — wrap the script in a consent check, all features off for that shopper;
      (b) `nostojs(api => api.visit.setDoNotTrack(true))`, **called before any request to Nosto**. Status via `api.visit.isDoNotTrack()`.
    - Under Do Not Track: no session identifier is set, each request is treated as a new session and discarded; the
      `2c.cId` cookie (identifies the browser between visits) is **not** set. Other cookies are not disabled.
    - **Do Not Track is not a full gate.** Nosto's own wording: information sent with requests is still processed
      normally, and the merchant must obtain the necessary consent for that processing. So DNT reduces what is
      retained; it does not stop data reaching Nosto.
    - Feature impact under DNT: recommendations / personalisation still served but from the current request only (no
      profile or history); segments current-request only; **popups fully disabled**; **Search & Category Merchandising
      (Universal): analytics tracking disabled** — the docs don't say results themselves change. That maps closely to
      the SOW's "degraded, non-personalised experience", so DNT looks like the intended mechanism for decliners.
    - **Nosto does not classify its tracking into consent categories and does not state a legal basis.** Their docs
      refer only to "consent for data processing" in general and use an `accepts_marketing` cookie as a placeholder.
      The techdocs index has **no** page on the Shopify Customer Privacy API, CMPs, or the Shopify app's consent
      behaviour. *So the required/functional vs analytics/marketing mapping cannot be answered from Nosto's docs — it
      is a question for Nosto, not an inference for us to make.*
    - Note (unverified, from this storefront's client settings seen 2026-10-22): `trackingTypes` includes `"cmp"`,
      which may indicate consent-management-platform awareness in the script. Not documented; worth asking Nosto.
    - **Shopify Customer Privacy API (docs read 2026-10-28, https://shopify.dev/docs/api/customer-privacy):**
      categories are `analytics`, `marketing`, `preferences`, with `sale_of_data` enforced separately. Read current
      state with `window.Shopify.customerPrivacy` — `currentVisitorConsent()` returns `'yes' | 'no' | ''` (empty =
      not yet decided), and `analyticsProcessingAllowed()` / `marketingAllowed()` / `preferencesProcessingAllowed()` /
      `saleOfDataAllowed()` combine consent with region and merchant settings. Load via
      `window.Shopify.loadFeatures({ name: 'consent-tracking-api', version: '0.2' })`. Changes fire a
      `visitorConsentCollected` event on `document` (note its `detail` keys differ from the method names:
      `analyticsAllowed`, `preferencesAllowed`, `marketingAllowed`, `saleOfDataAllowed`).
    - **Key point: Shopify does not automatically gate app embeds or third-party scripts.** The API applies consent to
      *Shopify-managed surfaces* (pixels, audiences, checkout). A third-party script like Nosto's app embed therefore
      has to check consent itself — or we have to gate it. *Shopify's page doesn't discuss app embeds explicitly, so
      treat "not automatically gated" as a strong reading rather than an explicit statement; confirm with Nosto.*

    - Still to do: whether the Nosto Shopify app honours the Customer Privacy API automatically (ask Nosto);
      Consentmo's signals; and a browser check of what fires / what cookies are set **before** a consent choice.

22. Investigate why a Nosto Placement (app block, `nosto_element` `categorypage-nosto-1`) renders but RS: Nosto carousel with the same placement doesn't (Patty, 2026-10-28, collection template). Note: in Playwright on dev 158466539657 (Preview on, 2026-10-28) ours rendered 5 cards + title "Most Popular Products In This Category" at 375 and 1440 after scrolling to it — need Patty's repro (page, width, Preview state, whether she scrolled to it: ours is lazy and loads ~1 viewport away).
23. Assess Nosto's native scroll / history config (`persistentSearchCache`, `preservePageScroll`, search-js `InfiniteScroll` / URL handling; ours has both off in `src/config.ts`) vs our `?p` URL state, and whether to switch; recommendation first, no change without Patty (2026-10-28). Measure against the ACs from Patty's earlier infinite-scroll fix in the vault (`04-engineering/patterns/plp-infinite-scroll-and-swatch-fetch.md` and any related ticket / decision). Ties to the `?p` assessment (snapshot) and the Nosto question she's sending.
24. Colour filter swatches from the theme (Patty, 2026-10-29: "theme route in case it needs to be accessible elsewhere"). With the colour facet built from `COLOR_<family>` tags (A.1 on the call sheet), the swatch colour comes from Broadcast's **Swatch color list** theme setting (`settings.swatch_color_list` → `snippets/swatch-color-list.liquid` → CSS vars `--<handle>` on `.swatches`), not Nosto Admin visuals. Build: in `FilterSwatch.tsx`, for the colour facet use `var(--<value | handle>)` (fallback `--swatch-default` / Nosto's `visual` if set); the filter list needs the `.swatches` scope. The list is **empty** on live and candidate (0 entries, checked 2026-10-29) — someone fills it with every family name, matching the tag values exactly. Blocked on Nosto confirming how the tags become facet values (A.1).
25. RS: Nosto carousel: hovering a card (e.g. the 2nd) shows that card's image arrows, and an arrow also appears at the far right of the row, over the partly visible last card (Patty, 2026-10-29, `/collections/new-dresses`, desktop; screenshot on her Desktop 3.28.40 PM). Native Broadcast or a bug? Compare with live's native carousels (PDP Product recommendations / homepage Featured collection, same `grid-slider align-arrows` + `product-grid-item`) at 1024 / 1440, then decide. Not yet investigated.
Waiting on Patty: grid settings theme-level vs section; `rs_nosto_collection_enabled` fate; drawer facets when
filters leave zero results; colour source (**client chose product tags, 2026-10-29** — `COLOR_<family>` tags, e.g. Cyclamen variant tagged `COLOR_Pink`; colour family, not variant colour; format / splitting to confirm with Nosto, call sheet A.1); filter group collapse after selection (real browser);
infinite scroll URL (`?p=N` restores loaded pages on reload / Back; live's URL doesn't change).
Waiting on Nosto: Onsite Content placements for tiles; per-category placement filters; **consent — the first request sent before consent** (Patty, 2026-10-29, from the Nosto call: Nosto to get back on it; e.g. the anonymous `ev1` / search request that still goes out under Do Not Track before a choice in opt-in regions).

**Filters, confirmed with Nosto (2026-10-22):**
- Facet order is set in Nosto Admin (facet manager: pin / reorder). No template code. Live order: Product type, Price, Color, Size.
- The Nosto Shopify app indexes metafields as `customFields.{namespace}-{key}`, but metaobject references (including all
  category metafields such as `shopify.color-pattern`) are stored as JSON strings of metaobject GIDs, unresolved and
  unsplit. Nosto recommends a plain text metafield for anything used as a filter.
- Size grouping ("XS (0-2)") works with Admin "Merge facet values" (Patty tested). Value order: Admin sorting is only
  alphabetic / count.
- Swatches: set per facet value in Admin (Color / Image / None) → `visual` in the response → `FilterSwatch.tsx`.
  Which colour source to facet on is paused (Patty, 2026-10-22).
- Filter counts: off by default, theme setting "Show product counts".

**Category (PLP) pages, decided with Patty (2026-10-22):**
- Toolbar: ET's (Filters, sort dropdown, Model | Product — same as search, minus the results caption). Drop BB's
  "Sort & Filter" button, sort-in-drawer, product count and shortcut filters.
- Sort: Nosto's sort options only, not live's Shopify list (best selling / date aren't required).
- Pagination: match live (infinite scroll, 22 per page), and run the 429 / per-card request check on a PLP before shipping.
- Scope: SOW covers the default collection template only, but editorial tiles are being accommodated. Unlike live
  (theme `collection-featured-image` blocks, one card each), the content comes **from Nosto** and can span multiple
  rows and columns. How Nosto supplies it is open: the Search API has no in-grid content field; Nosto's docs point to
  Onsite Content placements (HTML), with position and span left to our code.
- Theme gap: `sections/collection.liquid` has no Nosto mount yet. BB's theme PR #149 (unmerged) is the reference.
- **Tiles tabled** until Nosto enables Onsite Content placements (Patty contacting Nosto; OCP is a SOW module).
  Planned design: dynamic placements with IDs prefixed `plp-grid`, found via `api.placements.getPlacements()`,
  fetched once per category page; each campaign's HTML wrapper carries `data-position` / `data-columns` /
  `data-rows`; tiles placed by `gridTiles.ts` and injected via `api.placements.injectCampaigns` (attribution); cap
  ~6 per page. Open with Nosto: can a content campaign use a dynamic placement filtered to one category?
  Guardrails while building the PLP: keep `gridTiles.ts` source-agnostic (`{ position, html }`), don't assume one
  tile = one cell, keep page size a setting, don't port BB's "hide tiles when filtered" rule.
- **Sections (2026-10-23):** Nosto search and collection pages render from new sections `RS: Nosto search`
  (`sections/rs-nosto-search.liquid`) and `RS: Nosto collection` (`sections/rs-nosto-collection.liquid`), added
  to `templates/search.json` and `templates/collection.json`; the old Search / Collection products sections stay
  in those templates **disabled** (not removed, per Patty). New sections carry only settings the theme applies
  itself or that reach Nosto: padding, colour scheme, default card image. Pagination / columns / page size still
  come from RS: Nosto Settings. The old sections still contain their earlier Nosto branches (dead while disabled).
- **Section vs theme settings — no performance difference** (researched 2026-10-23): both are server-rendered
  into the same `data-*` attributes; Nosto reads them lazily when building a query (`themeSettings.ts` readData,
  `config.ts` queryModifications), so no extra request, render-blocking or bundle change. Must stay global:
  `rs_nosto_search_enabled` (stands Broadcast's predictive search down on every page), the autocomplete settings
  (header popdown is also rendered from `layout/theme.liquid`, which has no `section.settings`; `readData` reads
  the first mount only), filter counts. Could move to sections: search / collection pagination, columns, page
  size. **Open for Patty:** whether to move those; and the fate of `rs_nosto_collection_enabled` now the
  template's section decides.
- **Eager loading tabled:** all cards are `lazy: true` today. Later: a mount data attribute for how many rendered
  cells load eagerly, decided with the 429 / LCP check.

**Comparing against live:** Nosto personalizes results, so which products and suggestions appear (and how
many) can differ from Shopify. Compare markup, layout and styling, not item lists.

**1. Autocomplete card size differs from the live dropdown.** *(Fixed: the live dropdown inherits the
theme's global `--COLUMNS` 4/3/2/1; our column settings defaulted to 3 and 2. The `sizes` attribute was
never the problem: both themes render the same snippet.)* Our dropdown card is
`sections/api-nosto-product-card-mini.liquid` → `snippets/search-product-item.liquid`, which hardcodes its
own `sizes` attribute (`'(min-width: 1400px) calc((80vw - 100px) * 0.75 / 4), …'`). Grid width now also
comes from `--COLUMNS` / `--COLUMNS-MEDIUM` / `--COLUMNS-MOBILE`, which `header-search-popdown.liquid`
writes onto the mount from the new theme settings (defaults 3 desktop / 2 mobile). Compare against the live
theme's own dropdown and reconcile the two — the theme's `.predictive-search__layout` sets `--columns:
repeat(3, …)` at ≥990px, so the column count and the card `sizes` must agree.

**2. Autocomplete term highlighting and font formatting missing.** *(Fixed: Nosto does return
`_highlight.keyword`, wrapped in `<strong>` by default; the keywords request now asks for `<mark>`, which the
theme's `mark` rule styles.)* The theme renders a matched suggestion
as `<span aria-label="{{ query.text }}">{{ query.styled_text }}</span>`
(`sections/predictive-search.liquid:73`) — Shopify's `styled_text` wraps the matched portion in markup the
theme styles. Our `Keyword` component (`src/features/autocomplete/AutocompleteResults.tsx:161`) renders
`keyword._highlight?.keyword` through `dangerouslySetInnerHTML`, which is the right idea but we have not
confirmed (a) that Nosto returns `_highlight.keyword` at all — we do request it in `config.ts`
`withAutocompleteDefaults` — or (b) that the element/class it produces matches what the theme's CSS targets.
Check the actual response first, then align the markup with the theme's.

**3. Filter colour swatches missing — and BaubleBar's approach will not work here.** BaubleBar renders
`<span class="rs-filter__color-swatch filter-group__swatch" style="background: var(--{handleize(value)})">`
when `facet.name.toLowerCase() === "color"` (`src/shared/filters/TermsFacet.tsx:24,47-52`), i.e. it depends
on a per-colour CSS variable existing in the Bauble theme. **Elie Tahari does not use that convention.**
ET's `snippets/filters.liquid:157-163` uses Shopify's native filter swatch data —
`filter_value.swatch.color` and `filter_value.swatch.image`, with an `empty_swatch` fallback — and the
theme's `settings.swatch_style` (`swatch__button--square` / `--circle`). Nosto's facet response does not
carry Shopify's swatch colour or image, so this needs a decision: pass a swatch map from the theme
(like the shortcut-filter/editorial-tile `<template>` pattern), source it from Nosto facet metadata, or
match on the product option. Per the standing rule, ET's markup and `swatch_style` win.

**4. Filter "Size" values differ from what the theme displays.** The size values Nosto returns do not match
the displayed labels. Could be Nosto indexing the raw Shopify option value while the theme displays a
transformed label, or a Nosto index configuration issue. Compare a known product's Shopify option values
against the Nosto facet values before assuming it is ours to fix — it may be a Nosto Admin indexing setting
rather than template code.

**Setup guide:** `docs/nosto-cicd-setup.md` (written 2026-10-22) covers CI/CD and Nosto Admin step by step.

**Two bugs worth remembering:**
1. A literal `{terms}` placeholder inside a `{{ }}` Liquid output tag makes Shopify reject the file **on
   upload** — `shopify theme check` passes it. Symptom: "Could not find asset snippets/nosto-i18n.liquid"
   while the file sits there looking fine. Build placeholder strings with `assign` instead.
2. Shopify's `t` filter HTML-escapes translations, so `Search for "{terms}"` arrives as
   `Search for &quot;{terms}&quot;`. Liquid has no unescape filter; `lib/i18n.ts` decodes on read.

---

## Scope

- SOW: `/Users/pk/Downloads/Elie Tahari — Nosto SOW - FINAL.md` (start 2026-09-30, go-live target 2026-11-11, $16k billed to Nosto). Vault copy: `06-financial/contract-nosto-sow.md`.
- **This round:** Nosto search results page and autocomplete only. Category pages, recommendations, OCP, consent gating and multi-market come later.
- **Design:** replicate the current live theme's layout and styling exactly. No new design.
- **Performance is a top priority (Patty, 2026-10-05).** Keep Core Web Vitals good (LCP, CLS, INP) on search and autocomplete. Every approach decision should be weighed against CWV and request volume, not only build speed.

## Repos and branches

| What | Path | Ref |
|---|---|---|
| Nosto templates (this repo) | `~/Documents/roswell-studios/Elie_Tahari_TAHARI_Nosto` | working branch `feature/TAHARI-13175307071-search-template`; `main`/`dev`/`release/_candidate` all at `331b8ec` (pristine starter 1.14.0) |
| Bauble Nosto reference (snapshot of `BaubleBar_Nosto@3a1ab34`) | `~/Documents/roswell-studios/Elie_Tahari_TAHARI_Nosto-bauble-reference` (worktree) | `reference/baublebar-nosto`, pushed to origin. Reference only, never merge. |
| Elie Tahari theme | `~/Documents/roswell-studios/Elie_Tahari_TAHARI_2026` | `nosto/_candidate` (branched from `develop/_candidate`, so it carries the unreleased PDP 2026 redesign; intentional per Patty) |
| Bauble theme | `~/Documents/roswell-studios/BaubleBar_Shopify_2026` | Nosto work is commit `2d075dc` on `origin/feature/BAUBAR-nosto-product-card` (PR #149), not on `release/_candidate` |
| Bauble Nosto original | `~/Documents/roswell-studios/BaubleBar_Nosto` | `release/_candidate`; docs in `docs/` |

## Done so far

- Starter copied and committed (`331b8ec`).
- GitHub workflows (uncommitted, on the working branch): Bauble's `ci.yml`, `nosto-preview.yml`, `auto-generate-feature-pr.yml` and `auto-generate-release-pr.yml` copied; the starter's `release.yml`, `deploy-pages.yml` and `copilot-setup-steps.yml` deleted. The only Bauble reference was a header comment, now pointing at the ET theme repo. `nosto-preview.yml` stays inert until the `NOSTO_CI_ENABLED=true` repo var and the `nosto-live` environment exist, and it needs `scripts/nosto-sync.mjs` (not yet ported).
- Vault, committed `c0f21a0d1` and `812ca257b` on `feature/pk-2`, pushed 2026-10-06: `06-financial/contract-nosto-sow.md` updated to the FINAL SOW dates; Nosto rows in `00-overview/timeline.md`, `04-engineering/repos.md`, `04-engineering/tech-context.md`; products-only decision in `02-decisions/decisions.md`.
- **Vault commit rule (Patty):** commit vault edits at good checkpoints so changes are trackable. Stage only `vaults/elie-tahari/` paths (Patty has unrelated uncommitted work in the clone, e.g. `vaults/social-threads/...`). Message style: `docs(elie-tahari): … (TAHARI-13175307071)`. Don't push unless asked.

## Build progress (go-ahead given 2026-10-05)

**Theme** — worktree `~/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-nosto-search`, branch `nosto/feature/TAHARI-13175307071-search-template` from `nosto/_candidate@25b2e78`. Local commits only (pushing opens an auto-PR to `nosto/_candidate`; ask first):
- `fdea6fe` toggle `rs_nosto_search_enabled`; popdown `[data-nosto-autocomplete]`; `search.liquid` Nosto branch (mount inside a page-load `[data-products-grid]` wrapper, `product-grid-scripts` rendered, `<template data-nosto-model-switcher>`, mount data attrs for card image mode/filter layout/sort/filters, theme filter scripts not loaded in Nosto mode); sections `api-nosto-product-card` (product-grid-item, index 99, explicit sizes, columns_mobile 2, model mode) and `api-nosto-product-card-mini` (search-product-item).
- `2280eeb` `snippets/nosto-i18n.liquid`: translated strings + Shopify sort labels as JSON, rendered in the popdown (every page).
- Theme check: no new errors (only the existing `stylesheet` render-argument warnings).

**Nosto repo** — branch `feature/TAHARI-13175307071-search-template`, local commits:
- `04163e6` workflows + this doc; `86a5593` Bauble tooling, search-js 3.28.2, nosto-cli 1.6.0, husky/commitlint/AGENTS.md removed; `233f5ee` unmodified port of Bauble `4d4017f`; `9c6e9a5` ET adaptations (i18n, toolbar + model switcher, autocomplete to ET dropdown with 4 queries / 3 collections / 3 products, card types `grid`/`mini`, ET skeletons using `--PRODUCT-GRID-ASPECT-RATIO`, ET icons, fixtures).
- Lint (2 pre-existing starter warnings), typecheck, 220 unit tests, injected build all pass. Bundle 137 KB / 47 KB gzip (was 87 KB in the bare starter; `@nosto/web-components` is most of the growth). E2E not run.

**Verified on Patty's dev theme `157823434889` (2026-10-05, setting on):** mounts, grid wrapper, switcher template and 3 autocomplete mounts present; Broadcast `<predictive-search>` gone. Both card sections render for 3 handles (200, no Liquid errors, no `||…||` placeholders; grid has quick add + lazy images + explicit sizes; mini has no quick add). Injecting the local production build into the page via Playwright (`page.addScriptTag`) renders the toolbar, sort, switcher and skeletons with no Nosto upload needed. That's the way to test until the Nosto preview is set up.
- `snippets/nosto-i18n.liquid` was missing from the dev theme ("Could not find asset"): `shopify theme dev` didn't pick up the new file. Restart dev from the worktree.

**BLOCKER — Nosto Search not enabled on the account.** Nosto account `shopify-35089973385` (from the app embed's `nosto.js` URL; market `2903965833`). The search request fails inside `nosto.js` (`fetch(undefined)` → `Cannot read properties of undefined (reading 'startsWith')`); the client settings (`nostojs(api => api.internal.getSettings())`) have account/server/currency but no search API URL. Patty asked Nosto (2026-10-05) for a CI key and any other setup; follow-up drafted asking them to enable Search + Search Templates, confirm catalog sync (tags, facet fields) and which key CI needs.
- **Root cause (Nosto Admin, 2026-10-05):** the account is still on a **free trial ("2 days of free trial left")**, so the SOW modules aren't enabled. Account Settings → Authentication tokens is **empty** ("Contact Nosto support if you need any API tokens"). No reply from Nosto yet. Revised message drafted (trial conversion before expiry, enable Search + Search Templates, CI token, catalog/facets); recommended via the Roswell–Nosto Slack channel (SOW). Risk: trial lapsing while the Nosto app embeds are enabled on themes.
- **Status end of 2026-10-05:** Patty sent the follow-up (`docs/comms/2026-10-05-nosto-followup-slack.md`) in the same Slack thread as her original request; following up with Nosto the morning of 2026-10-06. Vault updated (`812ca257b`: tech-context account status + readiness check, timeline row "Blocked on Nosto").
- **Nosto Admin → Product Experience Cloud → Search shows the "Discover / Personalized Search / Contact us" sales page** (2026-10-05): Search is not provisioned on the account. Nothing Nosto-side can be tested until Nosto converts the trial and enables Search, Search Templates and Category Merchandising.
- `my.nosto.com/admin/shopify-35089973385/search/templates` returns **403 Forbidden**. BaubleBar's (`shopify-26757464148`) shows the full Search menu (Analytics, Templates, Preview, Facet Manager, Synonyms, Autocomplete, Redirects, Settings) and a Templates page with "Deploy latest and launch live" / "Disable template". That's the state Elie Tahari needs. Consolidated follow-up to Nosto drafted 2026-10-05 (trial conversion, SOW modules, CI token, multi-currency, catalog/facets).
- **Confirmed by comparison (2026-10-05):** BaubleBar's storefront client settings include `searchEnabled: true`, `searchTemplatesEnabled: true`, `searchApiUrl: https://search.nosto.com/api/`, `searchTemplateHost`, `searchDeploymentId`. Elie Tahari's have none of these keys (30 keys: tracking, popups, USD-only currency). Nosto Admin also crashes repeatedly on this account. Check again with `nostojs(api => api.internal.getSettings())` once Nosto responds: `searchEnabled` and `searchApiUrl` must be present before testing.
- **Multi-currency not set up (Nosto debug toolbar, Server Errors, 2026-10-05):** "No product variations or exchange rates were found for variation [USD]. Please check your multi-currency setup or contact Nosto support." The market-aware embed (`nosto.js?...&market=2903965833`) sends a currency variation the account has no data for. Needs Nosto setup; add to the Nosto message.
- **Nosto debug toolbar:** `?nostodebug=true` opens it; after login the param becomes a session token. Works alongside Shopify's theme preview: Shopify sets a preview cookie on `preview_theme_id` and redirects without that param, so load the preview theme first, then add `nostodebug`. Toolbar tabs: Features (what the account has enabled), Tagging, Errors, Preview toggle (shows uploaded, not-live templates).
- **API keys:** local dev needs none (`nosto login` = user session). CI needs a key: Bauble says the `API_APPS` token from Nosto support (the search key failed); Nosto's CLI docs say a private Search API key. Confirm with Nosto.

**Still to do:**
- Verify on Patty's dev preview theme (Patty runs `shopify theme dev` from the worktree): `?section_id=api-nosto-product-card` and `-mini` across product states; then the full flow with the toggle on and the templates on the Nosto preview.
- Needs from Patty: Elie Tahari Nosto merchant ID; `npx nosto login` (browser) to push to the Nosto preview.
- Filters sidebar: still the starter's own sidebar component, not ET's slide-out `collection__sidebar__slide-out` markup. Needs facets configured in Nosto Admin to test.
- LCP placeholder image from Nosto data (needs real Nosto hits to match image URLs/srcset).
- Docs: ET `docs/product-card/spec.md`, README, CLAUDE.md, `docs/search/implementation.md`. PRD. Vault pattern doc.
- Finding: plain `curl` from the VPN IP got Shopify 429s (`retry-after: 60`, no `cf-mitigated`) on every URL after the tests, while a real browser on the same IP at the same time got 200. The limit targets non-browser clients, not shoppers. Use the browser (Playwright) for storefront checks.

## Approach (Bauble's "Approach A", adopted after the 429 check)

- Nosto owns query, facets, sort, pagination, URL state and analytics. The Preact UI around the cards emits Broadcast class names so `theme.css` styles it.
- Product cards are theme Liquid via `<nosto-dynamic-card section="...">`, which fetches `/products/{handle}?section_id=<section>`. Each card type is its own `api-nosto-*` section:
  - `api-nosto-product-card`: renders `product-grid-item` for search results.
  - `api-nosto-product-card-mini`: autocomplete. **ET must render `search-product-item`** (today's dropdown card, `sections/predictive-search.liquid:187`). Bauble's mini renders the full grid card because their dropdown already did.
- Theme setting `rs_nosto_search_enabled` (default off) is the rollback switch. When on, `snippets/header-search-popdown.liquid` outputs `<div data-nosto-autocomplete>` instead of `<predictive-search>`, and `sections/search.liquid` outputs `<div data-nosto-search>`.
- Nosto selectors (`src/config.ts`): `dropdown: "[data-nosto-autocomplete]"`, `searchInput: 'input[name="q"]'`, `searchForm: "form"`, `results: "[data-nosto-search]"`. There are three header popdowns (desktop, mobile, mobile menu), so one autocomplete portal per popdown.

## Keep / adapt / drop from Bauble

- **Keep:** `scripts/nosto-sync.mjs`, `src/plugins/buildInfoPlugin.ts` (+ vite.config line), `nosto:*` npm scripts, `.nvmrc`, `.nosto.json.example`, the multi-popdown `injected.tsx`, `AutocompleteInjected` `closest(form)` binding, the dynamic-card rules in `theme-bridge.css`, test updates. Bauble also removed husky, commitlint and `AGENTS.md` (the starter's `AGENTS.md` says to commit with `--no-verify`).
- **Adapt:** `src/config.ts` values (36 per page matches `search.liquid`; `hide`-tag preFilter applies to ET); rebuild the `GridSkeleton` in `ThemeProductCard.tsx` from ET's `product-grid-item` (Bauble's uses classes ET lacks); `ThemeIcon` SVGs from ET's `icon-*` snippets; hardcoded English copy in `Serp`/`Toolbar`/`Pagination`/`NoResults`/`ThemeResults`; README, CLAUDE.md and docs with ET values.
- **Drop / replace:** Bauble's `docs/product-card/spec.md`. **Write our own** ET version from `product-grid-item.liquid` and `search-product-item.liquid`: image modes (model/ghost), sibling swatches, color count, single badge, cutline, price/sale, quick add, `hide` tag, plus a state list. Also drop all Bauble values: merchant `shopify-26757464148`, `baublebar.myshopify.com`, theme IDs `142783184980`/`145566990420`, `dev1-baublebar`, test handle `bubble-initial-necklace-gold`, `BAUBAR` prefix, "Amar" as approver, `baublebar-nosto` package name.
- **Version:** ET is on starter 1.14.0 and Bauble on 1.13.13. Keep 1.14.0's `VITE_NOSTO_ENV` support in `src/entries/dev.ts`.

## ET theme specifics to handle

- Don't reuse `api-product-grid-item`: its `aos_anchor: '||itemAnimationAnchor||'` makes the AOS observer throw (ET `sections/api-product-grid-item.liquid:6`).
- Section Rendering has empty `section.settings`. Pass `index: 99`, explicit `sizes` and `card_image_mode` (choose: hard-code `model`, global setting, or two sections).
- Keep `snippets/product-grid-scripts.liquid` and a `[data-products-grid]` wrapper outside the Nosto mount, so the iOS memory/scroll scripts (`card-scroller-window.js`) still bind. See vault `04-engineering/patterns/plp-infinite-scroll-and-swatch-fetch.md`.
- Don't render `collection-filters-form` in Nosto mode (its popstate handler fights Nosto URL state). Keep `product-info.js` and `grid-item.js` loaded.
- Decide where the Model | Product switcher (`collection-model-switcher`, `search.liquid:174`) lives.
- Never render theme custom elements (`quick-add-product`, `hover-images`, etc.) through Preact JSX; only as injected HTML.
- Search currently returns pages/articles too (no `type` param on the forms; `search.liquid:86-89`). Nosto is products-only. Mention to the client.
- ET constraints: never edit `assets/theme.js` (custom JS in `theme.dev.js`); tracking snippets go via `snippets/head.liquid`; don't hand-edit section content in `settings_data.json`; keep Consentmo, IPinfo, Klaviyo, Swap.

## Key risk: per-card requests and Cloudflare 429s

Dynamic cards fire one Section Rendering request per card (36 per page). The vault's rule (`plp-infinite-scroll-and-swatch-fetch.md`) is to never fire a request per product card, because Shopify's Cloudflare bot challenge returns 429s and isn't merchant-tunable. Run Bauble's gate before committing to the approach: first 8 cards ≤600 ms p75 on Fast 4G, CLS ≤0.05, no 429s paging 5 pages, plus a VPN test. Fallback is a native Preact card ("Approach B"). DVF (also Broadcast) uses Nosto native cards.

### 429 / perf test results (2026-10-05, Playwright, preview theme 157709861001 verified, desktop, Patty's network, no VPN)

- **`<nosto-dynamic-card>` internals (`@nosto/web-components` 11.6.0):** one `GET /products/{handle}?section_id=…` per card; in-memory cache by URL; optional `lazy` (IntersectionObserver); no retry, no concurrency cap; URL root is `Shopify.routes.root`, so market/locale subfolders work.
- **Per-card pattern** (existing `api-product-grid-item` as a stand-in): 5 pages × 36 parallel requests, 1.5 s apart, 180 distinct handles → **all 200, zero `cf-mitigated`**. Page wall time 245–359 ms; p75 per card 203–226 ms; first 8 ≤288 ms. ~21 KB HTML per card (~770 KB per page). `cf-cache-status: DYNAMIC` (not edge-cached).
- **Batched pattern** (what `nosto-section-campaign` does: `/search?type=product&q=h1 OR h2 …&section_id=<section>`): 36 handles in one request → 200, **36/36 exact matches, no extras**, 682 ms (12 handles: 500 ms). URL ~1.7 KB for 36. Works as a lever if 429s show up; slower than parallel for first paint.
- **VPN test (same day, Patty's VPN, egress PacketHub datacenter IP, Seattle):** same 5 × 36 paced test → all 200, zero challenged, page wall 209–398 ms, first 8 ≤185 ms. Worst-case burst of **180 parallel** requests → all 200, zero challenged, 1.2 s; the search page fetched right after was still 200 with no challenge. **Per-card requests don't trip the 429 challenge at these volumes, even from a flagged IP class.** Batching stays a reserve lever only.
- **Not yet tested:** mobile networks, real CWV with Nosto in place. The current search page's LCP measured on the preview theme is unusable as a baseline: the Klaviyo popup image was the LCP element and preview TTFB was 2.5 s.
- **CWV risk that matters more than 429s:** today the cards ship in the initial HTML. With Nosto, LCP waits for the JS bundle → Nosto search API → card fetch → image (three sequential hops).

### Proposed optimizations (keep theme-rendered cards, no full Preact rebuild)

1. `lazy: true` (as Bauble does), so only cards near the viewport fetch.
2. **LCP image from Nosto data:** the skeleton renders the card's primary image (same URL/srcset/`sizes` as the theme card, `fetchpriority="high"` on the first row) as soon as the search response lands, so LCP doesn't wait for the card fetch. The theme HTML then replaces it and the browser reuses the cached image. Needs the image URL/srcset to match exactly; verify.
3. Skeleton uses the exact card aspect ratio (`product_grid_aspect_ratio` 1.5) and footprint so CLS stays ~0.
4. Batched `/search?q=… OR …` section as a fallback if VPN/mobile tests show 429s (or a concurrency cap).
5. Measure with Lighthouse/WebPageTest on Patty's dev preview theme (mobile, throttled) vs the current Liquid search page on the same preview.

### Official Nosto docs (read 2026-10-05)

- Entry: https://docs.nosto.com/techdocs/implementing-nosto/implement-search/using-search-templates-starter (index: https://docs.nosto.com/techdocs/llms.txt).
- **Confirms Bauble's flow:** CLI uploads go to preview only; go live in Nosto Admin → Search → Templates → "Deploy latest and launch live"; up to 15 min to show; rollback via "…" → "Redeploy"; emergency "Disable Templates". `nosto st dev` overwrites other devs' preview uploads.
- **Conflict to resolve:** docs say the CLI API key must be a "private Search API key"; Bauble's README says it must be the `API_APPS` token from Nosto support and that `API_SEARCH` doesn't work. Ask Nosto when setting up CI.
- **Docs are thinner/older than the code:** the dynamic-cards page still shows the deprecated `template` prop, gives no lazy/performance/rate-limit/tracking guidance, and names `VITE_SHOPIFY_STORE_URL` (the starter 1.14.0 `.env.example` uses `VITE_MERCHANT_DOMAIN`). Trust the installed package code over the docs.
- Starter dynamic-card entry points: `src/components/Product/DynamicCardProduct.tsx` (SERP) and `src/components/Autocomplete/DynamicCardProduct/` (autocomplete).
- Pages not yet read: Customizations, Autocomplete features, Web Components → Shopify Integration, multi-currency.
- **Package versions:** `@nosto/web-components` 11.6.0 (latest); `@nosto/search-js` 3.26.2 → 3.28.2 available; `@nosto/nosto-cli` 1.4.1 → 1.6.0 available.
- **MCP:** `@nosto/nosto-cli` has no MCP server (checked 1.4.1 help and the 1.6.0 package source; commands are login/logout/setup/status, `st` build/dev/pull/push, `dp` deploy/list/redeploy/disable). Nosto's GitBook docs do expose a docs-search MCP endpoint at `https://docs.nosto.com/techdocs/~gitbook/mcp` (responds to an MCP initialize). Added by Patty to this project's local Claude Code config as `nosto-docs` (2026-10-05); available from the next session on. Prefer it over WebFetch for Nosto docs lookups.

## Plan (proposed, awaiting go-ahead)

1. Theme: new branch from latest `nosto/_candidate`; add `rs_nosto_search_enabled`, the popdown and search mounts, and the `api-nosto-product-card` / `-mini` sections with the ET specifics above.
2. Verify `?section_id=api-nosto-product-card` for ~10 handles covering every state on Patty's dev preview theme; run the 429/perf gate.
3. Nosto repo: port Bauble tooling, then Bauble's UI commit `4d4017f` onto 1.14.0; apply ET adaptations; write our own spec.md and ET docs.
4. PRD for 13175307071 per Ticket Authoring Prompt v2.
5. Vault: pattern doc and decisions entry once built and decided.

## Open questions

- ~~Pages/articles in search results?~~ **Decided: products only** (Patty, 2026-10-05). In Nosto mode `search.liquid` renders only the Nosto mount; no Liquid page/article block, no Nosto content search. Queries like "shipping" or "returns" will no longer surface help pages. Tell the client; logged in vault `02-decisions/decisions.md`. Add as a scope-boundary AC in the PRD.
- Run the 429/perf gate before building the full UI? (asked, not yet answered)
- ~~Is `nosto-mc-embed-block` intentional?~~ Yes (Patty, 2026-10-05): it's Nosto's multi-currency embed, required because Elie Tahari uses Shopify Markets. Keep it enabled; it matters for the multi-market phase (prices/currency in Nosto results).
- Vault: commit the uncommitted vault edits, and on which branch?
- Stale vault notes spotted, not fixed: vault `04-engineering/CLAUDE.md` (last updated 2026-05-21); the 429 pattern doc says "non-Plus" but `repos.md` says Shopify Plus.
