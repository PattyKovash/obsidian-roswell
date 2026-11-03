# Social Threads Theme Audit: Dwell (Horizon) 3.4.0

Comparing the live, customized theme (`dev`) against a clean copy of stock Horizon 3.4.0. Full row-per-file detail is in [`theme_customization_audit.csv`](./theme_customization_audit.csv) (`porting_status`, `severity`, `legitimacy`, and `needs_review` are the columns to filter on; `porting_status` is first).

**Migration workflow assumption:** the actual rebuild always starts from stock 4.1.4 and brings customizations onto it, fixing any resulting regressions from that base, never patching the old 3.4.0 file forward. Findings below don't repeat this as a warning; where "start from 4.1.4" would otherwise have been called out as a special risk, it isn't, since that's just how the work gets done.

**284** customization files differ · **97** legitimate · **175** noise (126 theme-editor re-saves + 49 locale files touched only by Shopify's auto-generated header comment) · **12** need review · **+26** vendor-only behavior changes (`finding_type = theme-4.1.4-change` in the CSV, see below, not counted in the 284)

**Total estimated effort: 17.55-38.25 dev hours + 17.25 QA hours**, across the 60 rows that actually have a task (`low dev estimate`, `high dev estimate`, `QA` columns in the CSV; everything else is blank by design). Assumes an AI coding agent executes each fix with a human reviewing and testing. Excludes the 5-file accessibility regression (a separate specialist's scope) and anything already resolved on `develop/_candidate` (7 items, counted at 0 dev hours, QA-only to confirm). Grounded in the real, current `release/_candidate` vs `develop/_candidate` diff, not a synthetic baseline.

---

## Needs-review items · 12 total

| Severity | File(s) | Issue |
|---|---|---|
| 🟡 Needs client discussion | `config/settings_schema.json` | Beam API key present as a schema default (`p-CuQxQZfFO0DP.a13dbf25-...`) instead of a merchant-entered setting. Not confirmed as a security risk, some app API keys are meant to be public-facing; needs discussion with the client before we treat it as one |
| 🔴 Critical | `blocks/_product-details.liquid`, `swatches.liquid`, `snippets/text.liquid` | "Recently viewed" counter phones home to `qa.wpweb.co.in` (looks like a dev/QA host); fake `btoa()` "security token"; debug logs left in |
| 🔴 Critical | `layout/theme.liquid` | Inline script `POST`s to `/cart/update.js` on *every* page load; debug log left in |
| 🔴 Critical | `assets/cart-bubble-fix.js` | Globally monkey-patches `window.fetch`/`XMLHttpRequest` instead of using the theme's own event system. Note: 3.4.0's `ThemeEvents.cartUpdate` no longer exists in stock 4.1.4, replaced by `@shopify/events`' `CartLinesUpdateEvent`, use that instead when reimplementing |
| 🟠 Moderate | `snippets/pagination-controls.liquid`, `assets/base.css` | Hardcoded hex colors (`#e51a4e`, `#000`) instead of theme color variables, breaks color-scheme switching |
| 🟠 Moderate | `sections/header-group.json` | Raw CSS injected via a settings array instead of a stylesheet (Yotpo block alongside it is fine) |
| 🔴 Critical | `blocks/buy-buttons.liquid` | Final Sale feature is fine; leaves a commented-out alternate input behind. Losing this on migration affects real order data (hidden line-item property, sale labeling with returns/exchange implications) |
| 🟡 Verify | `blocks/_product-card-gallery.liquid` | Badge markup swapped for a `render` call, confirm badges still show |
| 🟡 Verify | `snippets/pagination.liquid` | Looks like an orphaned duplicate of `pagination-controls.liquid`, check for actual usage |

Rows for the paired files (view-counter, colors) count as one review item each in the 12 total.

## Everything else: 272 files, no action needed

- **Merchant content** (templates, footer/header, branding): expected, includes Junip reviews embedded as recognized `custom_liquid` blocks.
- **App integrations**: Beam, Swym, Yotpo, Rewind (legacy), BSS, all match `CLAUDE.md`'s do-not-touch list.
- **24 AI-generated blocks**: individually scanned, all clean.
- **126 files**: pure whitespace noise (leading blank lines from theme-editor re-saves), not real changes.
- **49 locale files** (`locales/*.json`, `*.schema.json`): every one only differs by Shopify's standard auto-generated "do not edit" header comment; verified no wording or content changes in any of them.

## Reference check: files Horizon drops in 4.1.4

Only 3 files disappear upstream between 3.4.0 and 4.1.4. Checked whether any customization depends on them, none do:

| Removed file | Used by | Risk |
|---|---|---|
| `product-title-truncation.js` | Stock `scripts.liquid` only (unmodified) | None, resolved by adopting stock 4.1.4 file |
| `color-schemes.liquid` | Stock files + `theme.liquid`'s stock render call | None, Horizon renames it to `color-palette.liquid` |
| `_media.liquid` | Nothing, already orphaned | None |

## Verified migration check: theme 131192324178 (real 4.1.4, already duplicated in admin)

Shopify's admin already has an unpublished duplicate of the live theme upgraded to 4.1.4 (theme ID `131192324178`, "RS DEV (PK)"). We pulled it (read-only, no push) and compared it directly against `dev`, line by line, for every one of the 109 real customizations from this audit (the 49 locale files above are excluded here since they aren't real customizations). **54 carried over with zero drift. 35 carried over but drifted cosmetically. 17 need actual rebuilding.**

| `porting_status` value | Count | Meaning |
|---|---|---|
| Carried over cleanly, no porting needed | 54 | Byte-for-byte unchanged (49) or the file differs elsewhere but 100% of the customization's own lines survived (5) |
| Carried over cleanly, cosmetic drift only | 35 | 50 to 98% of the file's own customization lines survived. The file transferred; some of its own setting values shifted shape, mostly from the color-scheme change described below. Worth a visual glance, not a rebuild |
| **Needs porting (mostly dropped)** | **8** | Under 50% of the file's own customization lines survived |
| **Needs porting (fully dropped)** | **9** | The customization is entirely gone, see below |
| Not applicable | 3 | Horizon's own README/LICENSE/release-notes, not part of this theme |

### Important: Horizon replaced its entire color-scheme system between 3.4.0 and 4.1.4

The 537/342-line diff on `config/settings_data.json` above is measured against the real upgraded theme (`131192324178`), not a clean baseline. Its root cause isn't a Social Threads customization issue, it's an upstream design-system change, which we separately confirmed by diffing the clean 3.4.0 and 4.1.4 baselines directly (independent of this store's data), to rule out anything specific to this theme:

- **Stock 3.4.0** uses a multi-scheme system: `color_schemes` holds 4+ independently-colored palettes (`scheme-1` through `scheme-4`, each with its own background/foreground/button/input/variant colors), and individual sections and settings pick one via a `"color_scheme": "scheme-2"` style reference (5 such references in the stock schema).
- **Stock 4.1.4** removes that system entirely. Zero `color_scheme` references remain. It's replaced by one single global `color_palette` setting with just 5 tokens (`background`, `foreground`, `color1`, `color2`, `color4`).

Social Threads used at least 4 visually distinct schemes deliberately (e.g. `scheme-2` is an inverted red-background/white-text look, used for contrast sections and badges). In 4.1.4, everything draws from one shared palette instead. The color *values* carry across fine (the new palette's tokens map to the old primary scheme's colors), but any section that relied on a *different* scheme specifically for visual contrast will not automatically look the same. A full section-by-section visual pass after upgrading is the only reliable way to catch this, spot-checking a handful of pages is not enough. This is the direct cause of most of the 35 "cosmetic drift" files above (`porting_status = carried over cleanly, cosmetic drift only` in the CSV): page/collection templates (`templates/page.*.json`, `templates/collection.*.json`), plus `index.json`, `search.json`, `cart.json`, `404.json`, `list-collections.json`, `product.json` and its final-sale/preorder variants, `sections/footer-group.json`, and `sections/header-group.json` (which also has its own separate code-quality issue, raw CSS in settings, called out on its own below). None of these 35 are broken customizations, they're stock structure that now needs a visual check for this reason alone. One concrete example: `templates/404.json` (94% preserved) only lost five `"color": "var(--color-foreground)"` lines, plain "use the default text color" settings on individual text blocks, removed outright rather than replaced. Since that's what the new default color already resolves to, this specific case is very likely a no-visible-difference cleanup rather than a real loss, though it should still get a quick look rather than being assumed safe. Verified against the current `release/_candidate` (not a stale snapshot): none of these 35 have actually been visually checked or fixed yet, each still shows Shopify's raw automatic migration output. **Subtotal: 10.3-22.5 dev hours + 9.95 QA hours** across all 35, per-file detail (including which pages have multiple distinct color sections and warrant a slightly larger estimate) is in the CSV's `low dev estimate`/`high dev estimate`/`QA` columns.

### What needs porting (17 files: 9 fully dropped, 8 mostly dropped)

Hour estimates are verified against the actual current gap between `release/_candidate` and `develop/_candidate` (not a synthetic baseline), and assume an AI coding agent executes the fix with a human reviewing and testing, not a fully manual developer session. For a multi-file feature, the bulk of the estimate sits on the primary file; companion files get a small marginal add-on, don't sum a feature's rows or you'll double-count.

| File(s) | What's gone | Est. hours (dev / QA) |
|---|---|---|
| `layout/theme.liquid` | Both the `web_checkout` cart-attribute script and the `{% render 'beam-imports' %}` call are dropped. Confirmed: the Beam snippet files still exist in 4.1.4 but nothing calls them anymore, so Beam is fully inert. | 0.5-1.5 / 0.5 |
| `snippets/cart-summary.liquid` | The `beam-select-nonprofit` render call is gone too, same root cause as above (shared task) | 0.25-0.5 / 0.25 |
| `config/settings_schema.json` | The entire `Beam` settings block is gone, including the API key that was present as a schema default. Beam config needs to be rebuilt from scratch, this time as a merchant-entered setting. Estimate below assumes that's all that's needed; if the client determines the key is an actual security exposure, this may need to be rescoped, that typically requires a server | 0.5-1.0 / 0.25 |
| `blocks/_product-details.liquid`, `swatches.liquid`, `snippets/text.liquid` | The whole `qa.wpweb.co.in` view-counter feature is gone (script, display badge, and hook div) | 1.5-3.0 / 1.0 combined (1.0-2.0/0.5 on `_product-details.liquid`, 0.25-0.5/0.25 each on the other two) |
| `blocks/_product-card-gallery.liquid` | The `render 'product-card-badges'` call is gone | 0.5-1.0 / 0.25 |
| `blocks/buy-buttons.liquid`, `snippets/quick-add.liquid`, `snippets/cart-products.liquid` | The "Final Sale" tag check, hidden line-item property, and cart label are gone from all three add-to-cart paths | 1.25-2.5 / 0.75 combined |
| `snippets/price.liquid` | The `price--on-sale` styling class is gone (`cart-products.liquid`'s copy of this same issue is already counted in the Final Sale row above) | 0.25-0.5 / 0.25 |
| `sections/main-cart.liquid` | The 7 custom `--cart-font-size--*` CSS variables are gone | 0.25-0.5 / 0.25 |
| `snippets/cart-bubble.liquid` | The `cart-bubble-fix.js` script include is gone (worth checking if 4.1.4's own cart bubble still has the bug this patched before re-adding it) | 0.25-0.5 / 0.25 |
| `snippets/pagination-controls.liquid` | Brand color reverted to the default theme token | 0.25-0.5 / 0.25 |
| `snippets/quick-add-modal.liquid` | A `text-align: center` rule reverted to `left` | 0.25-0.5 / 0.25 |
| `assets/base.css` | The brand color and related custom rules are genuinely gone, not relocated into 4.1.4's new style-snippet architecture. The color only survives in `base.min.css`, which is unreferenced anywhere in the theme | 1.0-2.0 / 0.5 |
| `config/settings_data.json` | Large diff, root cause is the color-scheme system replacement described above, not simple renumbering; needs a full visual QA pass, not just a settings-editor spot check | 0 / 0, no distinct Beam value was ever saved here, folded into the color-scheme visual pass below |

**Subtotal: 6.75-14.0 dev hours + 4.75 QA hours** across these 17 rows (avoiding double-counting the shared-task rows above).

Full per-file detail (including the 54 that carried over cleanly) is in the CSV's `porting_status`, `severity`, `migration_status_4.1.4_live`, `Percentage Preserved`, and `migration_notes` columns.

## Vendor-to-vendor behavior changes (3.4.0 to 4.1.4, independent of any customization)

Everything above compares this store's customizations against stock. This section is different: it's what Shopify itself changed in Horizon's own code between versions, reviewed directly on the two clean baselines with zero customization involved. These have no customization diff to flag, so they're tracked as 26 separate rows in the CSV with `finding_type = theme-4.1.4-change` rather than mixed into the 284 customization rows.

Coverage is now complete, not just a JS sample: every file that changed between stock 3.4.0 and stock 4.1.4 was reviewed (422 files total: 87 blocks, 40 sections, 70 modified + 52 new snippets, 77 assets, 51 modified + 6 new locale files, 13 templates, 2 layout, 2 config), the same file-by-file rigor as the 284-row customization audit, each finding cross-checked against whether this store's actual configuration would trigger it.

### Already handled by starting from the 4.1.4 base (2), no separate action

| File | What's new in stock 4.1.4 |
|---|---|
| `layout/theme.liquid` | New global renders for Inbox chat, the cart drawer, and the `.page-wrapper` scroll container (see `base.css` below). Already present since the rebuild starts from the stock 4.1.4 file. Only caution: don't remove these while re-adding Beam/`web_checkout` (see the customization rework list above). |
| `snippets/header-actions.liquid` | The cart-drawer dialog markup that used to live inline here moved to a new `sections/cart-drawer-section.liquid` + `snippets/cart-drawer.liquid`, wired up via `theme.liquid` above. Already present in the 4.1.4 base. |

### Already resolved on `develop/_candidate` (7), just confirm

Checked directly against `release/_candidate` vs `develop/_candidate` (the real branches, not a synthetic baseline): this work already exists.

| File | Est. hours (dev / QA) | Evidence |
|---|---|---|
| `assets/sticky-add-to-cart.js` | 0 / 0.5 | A real merchant-configurable setting, `hide_sticky_add_to_cart_when_chat_active` (checkbox, default `false`), now gates the Inbox-chat suppression instead of the stock hardcoded gate. Defined in `sections/product-information.liquid`. Verified: absent entirely on `release/_candidate`, so this is genuine new work, not something that existed before. |
| `blocks/_header-menu.liquid` | 0 / 0.25-0.5 | The new click-toggle button was added alongside the existing `on:pointerenter="/activate"` hover handlers, not instead of them. Hover-to-open still works. |
| `assets/header-menu.js` | 0 / 0.5 | No custom work needed on this file specifically; QA time is to confirm the redesigned header nav (overflow/"more" button, focus management) looks and behaves correctly, same QA pass covers the hover confirmation above. |
| `snippets/product-card.liquid` | 0 / 0.25 | Originally flagged from a code-level diff as dropping the selected variant from the product card link. Verified live on the `develop/_candidate` preview theme (shopsocialthreads.com, `preview_theme_id=131219882066`): selecting a color swatch on a collection-page card correctly carries that variant into the card link, and the PDP loads with the right color selected. Not reproducible on the actual candidate build. |
| `snippets/card-gallery.liquid` | 0 / 0.1 | Same variant-URL-loss pattern as `product-card.liquid`, verified resolved in the same live test (the card image link also carries the selected variant). |
| `blocks/product-title.liquid` | 0 / 0.1 | Same variant-URL-loss pattern as `product-card.liquid`, verified resolved in the same live test (the title link also carries the selected variant). |
| `blocks/_product-card-gallery.liquid` (quick-add visibility) | 0 / 0.1 | Originally flagged from a code-level diff (a new `product.available` guard around the quick-add render) as hiding the quick-add button for out-of-stock products, said to have shown previously. Verified live with explicit `preview_theme_id` swaps between the two themes (confirmed `window.Shopify.theme.id` at each step, not relying on cookie carryover) on a fully sold-out product (all variants unavailable): on live 3.4.0 (129595539538, `role=main`) the button is present in the DOM but `disabled` and `display:none`, not visible or usable; on the 4.1.4 candidate (131219882066) the button isn't rendered in the DOM at all. Different implementation, same end-user-visible result: no usable quick-add button once a product is completely sold out, on either version. A product with only some variants sold out still shows a working quick-add button on both. |

### Confirmed, needs a decision or QA pass (1)

| File | What changed | Relevance | Est. hours (dev / QA) |
|---|---|---|---|
| `sections/predictive-search.liquid` | See the accessibility section below (largest single instance of that pattern), plus a logic change: suggestion pills now render unconditionally whenever any exist, rather than only in the "has results" branch. | Stock/unmodified for this store, applies directly. Out of scope for hour estimates, part of the accessibility work another agency is handling. | see note |
| `assets/base.css` | New `.page-wrapper` div (added around header/main/footer in `theme.liquid`) gets `height: 100dvh; overflow-y: auto` on desktop, **the page now scrolls within `.page-wrapper` instead of `html`/`body` directly**, active by default. Also a new `.page-wrapper--drawer-open` class shifts content via `margin-right` when certain drawers open. Verified live on the candidate build: `.page-wrapper` renders with `overflow-y: auto` and a fixed height, confirming the new scroll container is active. | Any code assuming document-level scroll (scroll-to-top, viewport-rooted `IntersectionObserver`s, scroll-position tracking) needs to be verified against the new container. | 0.5-1.5 / 0.5 |

Subtotal (excluding the accessibility row, handled separately): **0.5-1.5 dev hours + 0.5 QA hours.**

### Systemic accessibility regression (5 files, independent of the above)

Same root pattern across 5 stock files, none customized by this store: ARIA roles, live regions, and labels present in 3.4.0 are simply absent in 4.1.4. Worth a dedicated screen-reader QA pass post-upgrade, particularly cart and search. **No hour estimate here by design**, a separate ADA/accessibility specialist is handling this category.

| File | What was removed |
|---|---|
| `sections/predictive-search.liquid` | `aria-live="polite"` on the results-count status region, `role="listbox"` + `aria-labelledby` on the suggestions list, a hardcoded `aria-expanded="true"` |
| `snippets/cart-bubble.liquid` | `role="status"` live region and the screen-reader "cart count: N" text entirely |
| `snippets/checkbox.liquid` | `role="checkbox"` |
| `snippets/filter-remove-buttons.liquid` | `autofocus` on the first filter-remove button after filtering |
| `snippets/predictive-search-products-list.liquid` | `role="listbox"` and `aria-label` on the results list |

### Checked, low relevance to this store today (10)

| File | What changed | Why it's low priority here |
|---|---|---|
| `assets/header-menu.js` | Substantial rewrite adding overflow/"more" button handling and focus/`inert` management. Additive, not a suppression. | Still worth a visual + keyboard-navigation QA pass since the mechanics changed meaningfully, but nothing is broken. |
| `assets/events.js` (+ ~12 other files) | The theme's internal `ThemeEvents` system (`cartUpdate`, `variantUpdate`, `FilterUpdate`) is removed entirely, replaced by `@shopify/events`. | Zero references to the old names in this store's actual customizations, so nothing breaks today. `CLAUDE.md`'s architecture section documents the old model and needs a post-upgrade update; also a trap for any *new* pre-upgrade work reaching for the old pattern. |
| `snippets/quick-add.liquid` (stock) | Adds selling-plan/subscription handling and a dual-button mode for single-option swatch products. | Only one stock reference to `selling_plan` anywhere in `dev`, no subscription app in use. Already on the rework list for the unrelated Final Sale feature. |
| `blocks/buy-buttons.liquid` (stock) | Pickup-location availability info now hidden entirely for out-of-stock products (used to show regardless); also drops `aria-labelledby`/`aria-label` on the pickup dialog. | No pickup settings configured, local pickup unused here. Already on the rework list for Final Sale. |
| `config/settings_schema.json` (stock) | Removes `drawer_border`, `drawer_border_width`, `drawer_border_opacity`, `drawer_drop_shadow`, `popover_border`, `popover_border_opacity` (unrelated to the color-scheme change). | None of these were configured beyond the default in `dev`'s settings. |
| `sections/header.liquid` | New additive settings: `bubble_style`, per-row background/text color overrides. | Nothing in the current header configuration exercises them, capability only. |
| `sections/main-blog-post.liquid` | Hardcoded block markup replaced by a dynamic `content_for 'blocks'` area with the same defaults. | Not customized here; should render equivalently unless block order was changed via the theme editor, which isn't visible from code. |
| `sections/product-hotspots.liquid` | One CSS selector loosened (dropped an `[open]` attribute gate). | Low confidence this is even a real change, likely redundant cleanup. |
| `blocks/disclosures.liquid` | New block (didn't exist in 3.4.0), renders Shopify-native disclosure metafields. | Requires metafield data and manual theme-editor placement, not automatically active. |
| `blocks/filters.liquid` | Minor UI polish: hides an active-filter-count chip when the count is zero. | Not a regression. |

### Everything else reviewed, no behavior-relevant change

The remaining ~370 files across blocks, sections, snippets, assets, locales, and templates were pure refactoring (moved to the new `@shopify/events`/color-palette systems, CSS extracted into new per-component `*-styles.liquid` snippets, internal renames, added doc comments), additive-only settings gated behind non-default values nothing in this store configures, or icon/asset redesigns with no structural regression (34 SVG icons spot-checked, all clean). The 39 purely-new styling snippets and the color-math utility snippets supporting the palette system are listed in the CSV but not individually described here. Locale key coverage was checked directly: exactly one storefront-facing key was removed (`accessibility.open_hotspot`), and it's tied to a section (`product-hotspots`) never placed on any live page. 12 of the 13 changed stock templates are irrelevant since `dev`'s versions are already fully merchant-customized; the one exception, `templates/gift_card.liquid`, is still 100% stock and is only touched by the already-documented color-scheme rename.

This category was originally surfaced by a second review agent working on the actual migration/porting work in parallel with this audit, who hit the Inbox/sticky-ATC issue directly while porting unrelated customizations and asked for it to become a standing check rather than something discovered ad hoc file-by-file.
