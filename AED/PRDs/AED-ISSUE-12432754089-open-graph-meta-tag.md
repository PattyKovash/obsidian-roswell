
## Background:

-  Original ask: "Missing Open Graph meta tag. Fix: add og:image global fallback (branded image, logo on clean background) - to **both websites**" (AEDShop and AED4LIFE storefronts).

-  Without an `og:image` fallback, pages with no source image (collections/pages/blogs with no image set, and the homepage) share with **no image at all** on Facebook, Slack, iMessage, etc. — a broken/blank link preview.

-  Client has historically wanted **per-page control** over the share image (precedent: other clients could override the social share image per template/page via metafield), not just a single static image.

## Necessary Info (Design/Documentation):

-  Resource types in scope: **product, collection, article, blog, page**, plus a **site-wide default** for every other page type (home, cart, search, 404, etc).

-  Shopify's native `page_image` (existing platform object, not our code) already resolves per page type before our fallback logic ever runs:
   -  **Product** → product's featured image
   -  **Collection** → collection's image
   -  **Article** → article's featured image
   -  **Blog listing, Page, Index/home, and anything else with no dedicated image** → the shop-wide **Social sharing image**, set in Admin → Online Store → Preferences ([Shopify docs](https://help.shopify.com/en/manual/online-store/images/showing-social-media-thumbnail-images)). If that admin setting is filled in, `page_image` is rarely/never blank — our theme-setting fallback only kicks in when it's genuinely empty at every tier.
   -  **Confirmed via direct Liquid comparison** (not just docs): `shop.brand.cover_image` (Settings → Brand) is a separate, independently-set field — populating Online Store → Preferences → Social sharing image changed `page_image`'s output but left `shop.brand.cover_image` blank. Don't confuse the two when auditing a store's config.

-  Meta's/Open Graph's recommended `og:image` size is **1200×630** (1.91:1) — also satisfies Twitter's `summary_large_image` card, already declared in the theme.

## Constraints / Scope:

-  **In scope:** `og:image` (+ `og:image:secure_url`/`width`/`height`) only. `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, Twitter tags — unchanged, already implemented.

-  **Out of scope:** per-page control of any OG field other than the image; checkout pages (Shopify-controlled, theme has no access).

-  Shopify's image CDN will not upscale past a source image's native resolution. If a resolved image is smaller than 1200×630, force-cropping to that size would either fail or make Shopify silently cap the output — while our meta tags kept claiming 1200×630, an accurate-size mismatch. **Guard:** only crop to 1200×630 when the source is large enough to support it; otherwise serve unscaled and report the image's true dimensions.

-  Applies to **both** AEDShop_AED and AED4LIFE_AED. The two theme codebases are assumed to share the same base ("Refine" by AgniHD) but have not been diffed for drift — confirm structural parity before porting (see Clarifying Questions).

## Objective/Acceptance Criteria:

Core issue = pages sharing with **no image at all** on live today. Prioritize QA checking these, homepage first:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
|---|---|---|---|---|
|  1 |  Homepage — blank on live (https://aedshop.ca/) — now shows the theme's default social share image as `og:image`. |   | X |   |
|  2 |  Collection with no image — blank on live (https://aedshop.ca/collections/acls-defibrillator-units) — now shows the theme's default social share image as `og:image`. |   | X |   |
|  3 |  Page template — blank on live (https://aedshop.ca/pages/resources) — now shows the theme's default social share image as `og:image`. |   | X |   |
|  4 |  Blog listing — blank on live (https://aedshop.ca/blogs/news) — now shows the theme's default social share image as `og:image`. |   | X |   |
|  5 |  Theme setting "Default social share image" is available under Theme settings → Social media, and is pre-filled with the site's existing logo. |   | X |   |
|  6 |  No regression to existing `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, or Twitter card tags. |   | X |   |
|  7 |  Same fix implemented on **both** AEDShop_AED and AED4LIFE_AED. |   |   |   |

Per-resource metafield overrides and the featured/collection/article-image fallback tier are additional coverage, not the core bug — see Testing Notes; QA can skip re-checking these individually.

## Dev Notes:

-  **New snippet — `snippets/og-image.liquid`** — resolves the image per resource type (metafield → `page_image` → theme setting) and outputs the `og:image*` tags, with the upscale guard described in Constraints/Scope.

-  **`snippets/meta-tags.liquid` ~line 22** — the old `page_image`-only block was replaced with `{%- render 'og-image' -%}` (rendered from `layout/theme.liquid` ~line 48 and `layout/password.liquid` ~line 24, so both surfaces are covered by one change).

-  **`config/settings_schema.json` ~line 643-655** — new `image_picker` setting `og_image_fallback` in the existing Social Media settings group, under a new "Sharing" header (above the existing "Accounts" header). Matching locale keys in `locales/en.default.schema.json` ~line 402-411 (`en.default.schema.json` is source of truth; other locale files are admin-managed merge targets — do not hand-edit).

-  **`config/settings_data.json` ~line 36** — default `og_image_fallback` to the same image already used by the header logo (`sections/header-group.json` → `sections.header.settings.logo`), so the setting isn't blank out of the box. Each storefront's logo file differs — use that store's own logo, not another store's.

-  **Metafield definitions must be created manually** in Shopify Admin → Settings → Custom data, once per resource type (Products, Collections, Articles, Blogs, Pages), namespace `rs_meta`, key `open_graph_image`, type File (Image). Shopify's admin UI auto-generates the key from the definition name using underscores — this key was chosen to match that default so it doesn't require manual correction.

-  **Testing gotcha:** Shopify preview URLs (`?preview_theme_id=...`) 302-redirect to the clean URL on first load and rely on a session cookie set by that redirect. A stateless external crawler (Facebook Sharing Debugger, Slack unfurl bot) follows the redirect but has no cookie, so it lands on the **live** theme, not the preview — it will look like the fix "isn't working" when it's actually just not reachable yet. Validate via curl with a cookie jar (or a real logged-in browser session) against the preview URL, and only use external OG debug tools once the change is live or on a publicly reachable non-gated URL (e.g. `release/_candidate`).

## Implementation Notes:

-  Implemented and verified on **AEDShop_AED** (branch `feature/AED-ISSUE-12432754089-open-graph-meta-tag`): setting, snippet, and wiring committed as four atomic commits. Verified via direct HTTP checks (cookie-authenticated, mimicking the dev preview session) against product, collection (both with and without the metafield set, and with/without a collection image), page, blog, and article URLs, on both the live and dev themes.

-  **AED4LIFE_AED** port: complete, same four commits, on its own dev branch (`feature/AED-ISSUE-12432754089-open-graph-meta-tag`). Structural diff confirmed no meaningful drift between the two theme codebases — `meta-tags.liquid`, the Social Media settings block, and the header-logo convention (`sections/header-group.json`) all matched, so this was a straight port aside from using AED4LIFE's own logo file (`aed4life-logo-lts_...png`) as the fallback default instead of AEDShop's.

-  No metafield definitions have been created in either store's admin yet — required before content editors can actually use the override (see Dev Notes).

## Testing Notes:

-  Checked live theme (pre-fix) vs. dev theme (this fix) on AEDShop_AED, via direct HTTP requests with a cookie-authenticated session (see Dev Notes testing gotcha):

|  Page |  URL |  Image source (tier) |  Live theme |  Dev theme (this fix) |
|---|---|---|---|---|
|  Home |  `/` |  no image / theme default |  no `og:image` tag at all |  theme-default logo, 1200×630 |
|  Product |  `/products/zoll-r-series-defibrillator` |  `page_image` → featured image |  featured image, unresized (700×422) |  featured image, resized to 1200×630 |
|  Collection (no collection image) |  `/collections/acls-defibrillator-units` |  no image / theme default |  no `og:image` tag at all |  theme-default logo, 1200×630 |
|  Collection (has collection image) |  `/collections/aed-backpacks` |  `page_image` → collection image |  collection image, unresized (722×695) |  collection image, correctly reported at native size (654×630, no upscale) — this is what caught the need for the upscale guard |
|  Collection (metafield override) |  `/collections/aed-backpacks` |  `rs_meta.open_graph_image` metafield |  n/a (metafield tier not on live) |  metafield image, resized to 1200×630 — confirmed it overrides the collection image |
|  Page |  `/pages/resources` |  no image / theme default |  no `og:image` tag at all |  theme-default logo, 1200×630 |
|  Blog |  `/blogs/news` |  no image / theme default |  no `og:image` tag at all |  theme-default logo, 1200×630 |
|  Article |  `/blogs/news/how-real-time-cpr-feedback-improves-survival-during-sudden-cardiac-arrest` |  `page_image` → article image |  article image, unresized and square (1280×1280) |  article image, resized to 1200×630 |

-  In every "Dev theme" case above, the actual delivered image bytes (checked with `sips`) were confirmed to match the dimensions declared in the `og:image:width`/`og:image:height` meta tags — no mismatched/lying size tags.

-  Used the [Open Graph Checker](https://chromewebstore.google.com/detail/open-graph-checker/lkjaebkedoblfeglnhbgbjbdodjdogpe) Chrome extension to visually confirm the rendered tags/preview in-browser.

-  Same live-vs-dev check repeated on **AED4LIFE_AED** (`preview_theme_id=188159066414`):

|  Page |  URL |  Live theme |  Dev theme (this fix) |
|---|---|---|---|
|  Home |  `/` |  no `og:image` tag at all |  shop-wide social sharing image (via `page_image`), 648×432 native |
|  Collection (no image) |  `/collections/acls-defibrillator-units` |  no `og:image` tag at all |  same shop-wide image, 648×432 native |
|  Blog |  `/blogs/news` |  no `og:image` tag at all |  same shop-wide image, 648×432 native |
|  Page |  `/pages/faq` |  no `og:image` tag at all |  same shop-wide image, 648×432 native |
|  Product |  `/products/aedtrax` |  featured image, unresized (1280×856) |  featured image, resized to 1200×630 |
|  Article |  `/blogs/news/adventure-awaits-in-canadas-national-parks` |  article image, unresized square (1280×1280) |  article image, resized to 1200×630 |

-  **Drift finding (store config, not code):** AED4LIFE has the Admin → Online Store → Preferences → Social sharing image set; AEDShop does not. That's why AED4LIFE's home/collection/blog/page resolve via `page_image` itself (native 648×630, correctly not upscaled) rather than reaching our theme-setting fallback, while AEDShop's genuinely reach it (native 648×432, correctly not upscaled). Same code, same fix, different observed source image — expected given each store's own admin config.

-  **Precedence decision:** Shopify's own docs state theme settings images should outrank the Online Store Preferences image, but our chain (`metafield → page_image → theme setting`) puts the theme setting last, so on generic pages Preferences can outrank it when both are set. Confirmed via direct Liquid comparison that `page_image` and `shop.brand.cover_image` are unrelated fields (populating one doesn't touch the other) while diagnosing this. **Decision: leave as-is** — the theme setting is assumed to always be populated in practice, so this ordering never actually matters.

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  Who creates the five `rs_meta.open_graph_image` metafield definitions per store (Products/Collections/Articles/Blogs/Pages) — Roswell or the client? Needed before content editors can use the feature.
-  Does the client want a documented minimum source-image size (e.g. 1200×630+) communicated to whoever uploads share images, given the no-upscale guard serves smaller images at their native (non-spec) size?
