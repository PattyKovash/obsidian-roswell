## Settings Migration Review — Old Theme (3.4.0) → New Theme (4.1.4)

### TODO — Swym wishlist placement on the PDP (deferred)

Not a settings-migration item; parked until the settings work is done.

**Problem.** The Swym wishlist button does not render on the DC PDP. The 3.4.0 fix (`d5e89fa`, "feat: Wishlist placement") lives on `dev`/`main` and shipped to live, but it was never ported to the 4.1.4 branch — `git merge-base --is-ancestor` confirms it is not in this lineage. It added a `custom_class` setting to `blocks/text.liquid` and injected `<div class="swym-wishlist-button-bar"></div>` from `snippets/text.liquid` when `template.name == 'product'`.

**Native blocks were already tried and rejected** — they don't position well next to the product title. `blocks/ai_gen_block_c0c90c0.liquid` (a styled Swym button block) exists in DC but is unused, and `snippets/swym-custom.liquid` (calls `swat.initializeActionButtons`) is rendered nowhere. Do not re-propose the native-block route.

**Preferred approach.** Rather than hardcoding the template check, add a `liquid` setting to the text block and render it inside the container:

```liquid
<{{ element }} {{ attributes | strip_newlines | strip }}>
  {{ block.settings.text | replace: '<h3>', '<h3 aria-level="2">' }}
  {{ block.settings.custom_liquid }}
</{{ element }}>
```

Merchant controls placement per block in the editor; no template-name branch, no `custom_class` escape hatch, and it generalises beyond Swym. Theme precedent for the setting type: `sections/custom-liquid.liquid:24-28` and `blocks/custom-liquid.liquid`.

**Related:** `templates/product.json` custom CSS rules `.product-details__title {…}` and `.product-details__title h1 {margin-bottom:0}` are dead selectors in DC because `custom_class` was removed — they exist to clean up after the old injection. Resolve alongside this.

### Pagination margin settings — added 2026-09-29

`snippets/pagination-controls.liquid` hardcoded `margin: 50px 0`, which only exists when pagination renders.

**Problem.** On collections with no pagination element — few enough products to fit one page — the pagination block isn't output at all, so its 50px of vertical spacing disappears entirely and the section below collapses upward. It is worse on collections that end with a quote section containing content: the gap between the product grid and that content becomes far too tight, because the only thing that was separating them was the pagination's own margin.

**Fix.** Split the margin into separate top and bottom values driven by CSS variables, then expose them as section settings so the spacing can be tuned per collection independently of whether pagination renders.

- `snippets/pagination-controls.liquid` — `margin: 50px 0` became `margin-block-start: var(--pagination-margin-block-start, 50px)` / `margin-block-end: var(--pagination-margin-block-end, 50px)` plus `margin-inline: 0`. The `50px` fallbacks preserve existing behaviour for the snippet's other callers (`sections/quick-order-list.liquid`, and `snippets/product-grid.liquid` via `sections/search-results.liquid`), none of which set the variables.
- `sections/main-collection.liquid` — new "Pagination layout" group with `pagination_margin_block_start` / `pagination_margin_block_end` ranges, cloned from the existing `padding-block-*` settings (0–100, step 1, px, default 50). Emitted on the section element alongside the padding variables so they cascade to the snippet.

No parameter threading: the render chain is `main-collection` → `product-grid` → `pagination-controls` and only `paginate` is passed through, so the section emits the variables and CSS inheritance carries them. The snippet stays generic.

Literal English labels rather than `t:` keys — no suitable keys exist and the locale files are auto-generated. Matches the existing `Pagination` and `Beam` groups.

**Related decision — standardised collection padding.** All 17 collection templates were then set to one uniform set: `padding-block-start: 0`, `padding-block-end: 50`, `padding-inline: 0/0`, `pagination_margin_block_start: 50`, `pagination_margin_block_end: 0`.

This **deliberately diverges from RC**, which has no uniform value — `padding-block-end` is `0` on nine templates and `32` on six, and `padding-block-start` is `32` on six (`fall-preview-sale`, `fall-sweater-sale`, `houseofleo`, `motherchic`, `sample-sale`, `tandtparis`). Standardising was chosen over parity for consistency and control.

**Consequence for future passes:** the RC↔DC comparison will report these as diffs indefinitely. Do not "fix" them back to live values — this is intentional.

### App-compatibility issues (not migration regressions)

Third-party apps bind to the theme by CSS selector or DOM shape. 4.1.4 changed both in places, so an app can silently stop working without anything being wrong in the template. These are **not** fixable by reconciling JSON against RC — they need the app vendor or app settings.

#### Restock Rocket — preorder button on product cards (found 2026-09-29)

**Symptom:** on a collection page, the quick-add button reads "PREORDER NOW / Add" instead of the icon, and clicking it does nothing. Reported on `Capital Z The Crosby Woven Bag` on `/collections/accessories-eyewear`.

**Not the theme.** Verified in-browser on both themes — the theme logic is identical on each side:

| | RC `131552772178` (3.4.0) | DC `131192324178` (4.1.4) |
|---|---|---|
| `data-quick-add-button` | `add` | `add` |
| `data-uses-selling-plans` | n/a | `false` |
| cart form present | yes | yes |
| button `type` | `submit`, enabled | `submit`, enabled |

The DC button carries an injected `restock-rocket` class and the app has prepended "PREORDER NOW" to the theme's own "Add" label. On RC the same card renders a clean Add button with no app class.

**Why it binds on one and not the other.** RC renders *two* buttons (Add + Choose) with `class="button button quick-add__button…"`; DC renders *one*, and the class list starts `"button quick-add__button…"`. The app's selector or DOM assumption no longer matches, so it half-attaches: it relabels the button but its click handler never fires, leaving neither the app's preorder flow nor the theme's form submit.

**Action:** raise with Restock Rocket, supplying both class strings. Do not "fix" the template.

**Generalisable:** before treating a rendered difference as a migration bug, check the element's class list for injected app classes. Two earlier hypotheses here (selling plans forcing the choose button; the 2+ options add/choose gate) were both wrong and cost time — the DOM answered it immediately.

### Decisions — deliberately not ported

- **Input hover background.** 3.4.0 tinted every input/textarea on hover (`input:hover, textarea:hover { background-color: var(--color-input-hover-background) }`, `base.css:60`, fed from `scheme.input_hover_background` = `#f5f5f5`). 4.1.4 removed the rule and the variable entirely — stock 4.1.4 has neither, so this is a deliberate Shopify removal, not stranded plumbing. Decided 2026-09-29 to accept 4.1.4 behaviour rather than reinstate the rule and add a setting. The delta was `#ffffff` → `#f5f5f5`, barely perceptible.
- **Content / merchandising.** Announcement copy, hero images, featured products, collection lists, promo links. RC receives live-theme pulls continuously, so these churn and will be stale again at cutover. Port structure, layout, colour and visibility only; do one content sync immediately before go-live.

### RC → DC PORT — progress tracker (updated 2026-09-29)

**Source of truth is RC (`release/_candidate`, Dwell 3.4.0, live).** DC is `develop/_candidate` (4.1.4); work happens on `develop/feature/THREADS-theme-settings-migration`, merged up to DC at `38a0cae`.

**RC is a moving target.** It absorbs live-theme pulls continuously — it went `02f987d` → `4515b2a` mid-session, which added three templates and re-churned the announcement copy in a file already marked done. Pin comparisons to a named RC commit and re-check before merge. "Done" is only true as of a specific RC sha.

**Method — do not skip.** Normalized line diff (strip JSONC header, `sort_keys=True`, `diff -u`) as ground truth; `scripts/rc_vs_dc.py` alongside only to triage and resolve palette refs. Where they disagree, the diff wins. Never infer a rendered colour — trace it. Full rationale and all trap classes: `vault/04-engineering/patterns/rc-to-dc-settings-comparison-method.md`.

**Tooling** (in `scripts/`, untracked): `rc_vs_dc.py` reads RC straight from the git ref, so it survives reboots and needs no extracted copy. `scheme_role_map.py` maps scheme roles to 4.1.4 equivalents. `palette_usage.py` shows a palette slot's blast radius before you change it.

#### File status

| File | Status |
| --- | --- |
| `config/settings_data.json` | ✅ Globals verified — 45 shared scalars, zero diffs; all 17 global colours resolve exactly to scheme-1; 15 app embeds in parity |
| `sections/header-group.json` | ✅ Done at RC `02f987d`; announcement copy has since churned (content, skipping) |
| `sections/footer-group.json` | ✅ Done — black divider fixed via `divider_color: #00000000` |
| `templates/index.json` | ✅ Fixes applied, **uncommitted** |
| `templates/product.json` | ✅ Fixes applied, **uncommitted** |
| Remaining ~27 templates | ⬜ 13 collection templates share one shape — best batched |

#### Settings added to 4.1.4 (roles it dropped)

| Setting | Group | Why |
| --- | --- | --- |
| `page_border_color` | Page | 4.1.4 had no global border; `--color-border` was hardcoded to `page_text_color`, rendering near-black where live is `#ffffff99`. 16 consumers. |
| `drawer_overlay_color` / `popover_overlay_color` | Drawers / Popovers | Stock 4.1.4 reads `--color-shadow-rgb` in two places and never defines it, so every modal/drawer backdrop painted nothing. Stock bug, not migration fallout. |
| `palette_*_button_hover_{background,text,border}` ×6 | Buttons | 4.1.4 derives hovers algorithmically (`util-palette-hover-shift`), no way to set them. Wired as overrides — blank keeps the computed shift. |
| `text_color` on `header-announcements` | — | Section chrome (slider arrows) reads `--color-foreground`, which only `contrast-override` sets; a block-level setting couldn't reach it. |

**Every new colour setting needs `"alpha": true`** or the customizer picker has no transparency control and translucent values cannot be set. `drawer_border_color` and `popover_border_color` already carry it.

**Never put an alpha colour in a `color_palette` slot.** Shopify rejects it — `'color3' must not have alpha < 1` — and the whole theme upload fails. This silently blocked every change for part of a session; the filesystem looks fine and the browser shows stale output. If a fix "isn't working", check the dev server returns 200 before debugging anything else.

#### Still open, by category (against RC `4515b2a`)

| Category | Count | Notes |
| --- | --- | --- |
| Keys with no DC equivalent | 125 | Bulk triage — header-group's 9 were all inert, so this may collapse |
| Layout/design values | 42 | Mechanical, but watch the `border_width` trap |
| Custom CSS | 14 | Check each rule for prior porting before restoring — 3 of 3 checked so far were already ported elsewhere |
| Templates absent in DC | 6 | Needs admin check: is anything assigned to them? |
| Scheme colour not preserved | 5 | Each needs a trace |
| Content/merchandising | 7 | Deliberately skipped — see Decisions |
| Static blocks in RC JSON only | 14 | No action; 3.4.0 persisted them, 4.1.4 uses schema defaults |

#### Subagent workflow (works — 4 agents run, all produced verified findings)

One file per agent, report-only, then review and apply centrally. Agents found two defects nobody had spotted: the footer's black divider and the undefined backdrop variable. Brief must include: RC ref and how to read it, normalized-diff-as-ground-truth, all trap classes, `contrast-override` mechanics, no-push/no-commit, and the content-skipping rule. Verify their findings — one over-reported a `padding-block-end` on a third group that RC had at `0`.

**Superseded — do not trust these sections below:**
- The colour-loss audit (counts of "colour lost"/"foreground lost"). Its method assumed blank `text_color` falls back to the palette foreground; it does not — `contrast-override` computes it. Re-derive by tracing.
- Old-only section/template lists derived from the frozen `THREADS-release` checkout. Use the RC git ref instead.
- Styling PRD item 7 (view counter "dead CSS") — the markup exists in 4.1.4.

### RESOLVED — announcement bar colour experiment (2026-09-22)

Testing how 4.1.4 records a section background, two ways, by making the change in the customizer and pulling down:

1. **Palette route** — ✅ tested. Two coordinated edits:
   - `config/settings_data.json` → `color_palette` gains `"color3": "#597CB7"` (reused the vacant `color3` slot)
   - `sections/header-group.json` → `"background_color": "{{ settings.color_palette.color3 }}"` — a literal Liquid reference string
   - **Alpha dropped:** `#597CB77D` → `#597CB7`. The palette picker stores opaque, so the bar renders solid rather than ~49% translucent.
2. **Hex route** — set a raw hex on the section instead. ← *in progress*
   - Watch: does the orphaned `color3` slot remain in the palette after switching?
   - Watch: does a raw hex field accept 8-digit `#597CB77D` (alpha)?

Target: `header_announcements_dKrUXR`, old value `#597cb77d` = `#597cb7` at ~49% alpha (from `scheme-e13ef891-7809-41ec-865f-2b5126767cb2`). Open question: whether the picker accepts alpha at all.

**Local state:** two commits on `develop/feature/THREADS-theme-settings-migration`, **not pushed** — `055f2e3` (18 files) and `7b95404` (gift-guide padding). `shopify theme pull` overwrites local from the store, so pulling `sections/header-group.json` will revert the header migrations in it (`border_width` 5, logo padding 22/10). Everything is committed, so `git diff` after the pull shows both the new change and the reverted migrations; re-apply the latter before committing.

Mechanism and full audit: `vault/04-engineering/patterns/color-scheme-to-color-palette-migration.md`.

---

### Summary

Compared all JSON settings across `config/settings_data.json`, `sections/*.json`, and `templates/*.json` between the old 3.4.0 theme and the new 4.1.4 theme.

> **Matching caveat.** Shopify auto-generates section IDs, so they differ between themes even for the same section. An ID-based comparison therefore reports renamed sections as "old-only" and never compares the settings inside them. Results here were re-checked by matching on section **type + position in `order`**, which corrected the breadcrumb findings and surfaced one real missed value (`collection.gift-guide.json`). Apply the same positional matching to any future old-vs-new comparison.
>
> One class of false positive remains benign: breadcrumb `background_color` reads `rgba(0,0,0,0)` in the old theme and `#00000000` in 4.1.4. Same transparent color, different notation — no action.

**Key findings:**
- **0** top-level theme settings needed auto-migration — values already match
- **4** old-only theme settings exist (all color scheme related, expected)
- The vast majority of differences are `color_scheme` / `inherit_color_scheme` / `color` references — expected since 4.1.4 replaced the multi-scheme system with `color_palette`
- Several layout value diffs (padding, gaps) need review
- Custom CSS in multiple template JSONs needs to be ported or confirmed dead

---

### Old-Only Theme Settings (Need Review)

These settings exist in the old `config/settings_data.json` but not in the new theme:

| Setting | Old Value | Notes |
| --- | --- | --- |
| `badge_sale_color_scheme` | `scheme-1` | Color scheme system removed in 4.1.4 |
| `badge_sold_out_color_scheme` | `scheme-4` | Color scheme system removed in 4.1.4 |
| `popover_border` | `none` | Setting removed in 4.1.4 — check if popover borders are correct |
| `quick_add_color_scheme` | `scheme-2` | Color scheme system removed in 4.1.4 |
| `color_schemes` section | (entire section) | Expected — replaced by `color_palette` |

---

### Header Settings Differences

**`sections/header-group.json`:**

| Setting | Old | New | Action |
| --- | --- | --- | --- |
| `header_section.border_width` | 5 | 1 | ✅ Auto-migrated |
| `header_section/header-logo.padding-block-end` | 10 | 0 | ✅ Auto-migrated |
| `header_section/header-logo.padding-block-start` | 22 | 0 | ✅ Auto-migrated |
| `header_section.collection_color_scheme` | `default` | (missing) | Color scheme — skip |
| `header_section.color_scheme_bottom` | `''` | (missing) | Color scheme — skip |
| `header_section.color_scheme_top` | `scheme-1` | (missing) | Color scheme — skip |
| `header_section.color_scheme_transparent` | `scheme-6` | (missing) | Color scheme — skip |
| `header_section.home_color_scheme` | `default` | (missing) | Color scheme — skip |
| `header_section.product_color_scheme` | `default` | (missing) | Color scheme — skip |

**Header Custom CSS (old theme):**
```css
.menu-list__link-title {font-size: 22px;}

.menu-list__item--level-2 a,
.menu-list__item--level-3 a,
.menu-list__submenu a,
.header__submenu .menu-list__link-title,
ul.menu-list li a {font-size: 16px !important;}
```

---

### Footer Settings Differences

**`sections/footer-group.json`** — social media URLs auto-migrated:

| Setting | Old | New | Action |
| --- | --- | --- | --- |
| `footer_utilities/block.facebook_url` | `shopsocialthreads` | `shopify` (default) | ✅ Auto-migrated |
| `footer_utilities/block.instagram_url` | `socialthreads` | `shopify` (default) | ✅ Auto-migrated |
| `footer_utilities/block.tiktok_url` | `socialthreads` | `shopify` (default) | ✅ Auto-migrated |

**`sections/footer-group.json`** — all old-only (settings don't exist in new):

| Section | Setting | Old Value |
| --- | --- | --- |
| `footer_utilities` | `color_scheme` | `scheme-6` |
| `footer_utilities` | `divider_thickness` | 1 |
| `footer_utilities` | `gap` | 24 |
| `footer_utilities` | `padding-block-end` | 20 |
| `footer_utilities` | `padding-block-start` | 20 |
| `footer_utilities` | `section_width` | `page-width` |
| `migrated_footer_content` | `border` | `none` |
| `migrated_footer_content` | `border_opacity` | 100 |
| `migrated_footer_content` | `border_radius` | 0 |
| `migrated_footer_content` | `border_width` | 1 |
| `migrated_footer_content` | `color_scheme` | `scheme-6` |
| `migrated_footer_content` | `gradient_direction` | `to top` |
| `migrated_footer_content` | `overlay_color` | `#00000026` |
| `migrated_footer_content` | `overlay_style` | `solid` |
| `migrated_footer_content` | `section_height_custom` | 50 |
| `migrated_footer_content` | `toggle_overlay` | `false` |

---

### Template Differences — Layout & Content Values

Layout/spacing diffs have been **auto-migrated** to match the old theme values. Content/merchandising diffs (images, products, text) need manual review:

#### `templates/article.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section/blog-post-details` | `padding-block-start` | 24 | 0 |

#### `templates/collection.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `columns_gap_vertical` | 35 | 16 |
| `main` | `padding-block-end` | 0 | 32 |
| `section` | `padding-block-start` | 34 | 0 |

#### `templates/collection.accessories.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-end` | 0 | 32 |
| `section_ArxkKk/text_XxVxre` | `padding-block-start` | 0 | 18 |

#### `templates/collection.bottoms-collection.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-end` | 0 | 32 |

#### `templates/collection.final-sale.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-end` | 0 | 32 |
| `main` | `padding-block-start` | 0 | 32 |

#### `templates/collection.gift-guide.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-end` | 0 | 32 |

#### `templates/collection.risen-jeans.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-end` | 0 | 32 |
| `section/text_tqQTNE` | `background_color` | `#ffffff` | `#f5f5f5` |

#### `templates/collection.tops-collection.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-end` | 0 | 32 |
| `section/text_tqQTNE` | `background_color` | `#ffffff` | `#f5f5f5` |

#### `templates/collection.fall-preview-sale.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section` | `padding-block-start` | 34 | 0 |

#### `templates/collection.houseofleo.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section` | `padding-block-start` | 34 | 0 |

#### `templates/collection.preorder.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section` | `padding-block-start` | 40 | 0 |

#### `templates/collection.sample-sale.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section` | `padding-block-start` | 34 | 0 |

#### `templates/collection.tandtparis.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section` | `padding-block-start` | 34 | 0 |

#### `templates/index.json` (Homepage)
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `17526898729d389805/ai_gen_block_a0a9a35_3JBw99` | `background_image` | `ST_090826__1755_...jpg` | `ST072026_6587.jpg` |
| `175269115448ba3436/ai_gen_block_540b3cf_GLw8kA` | `background_image` | `homepage_4b6b467c...png` | `homepage_be8bc9e1...png` |
| `175269115448ba3436/ai_gen_block_540b3cf_GLw8kA` | `primary_btn_bg_color` | `#030303` | `#e51a4e` |
| `175269115448ba3436/ai_gen_block_540b3cf_GLw8kA` | `secondary_btn_bg_color` | `#030303` | `{{ settings.color_palette.foreground }}` |
| `175269115448ba3436/ai_gen_block_540b3cf_GLw8kA` | `secondary_btn_text_color` | `#ffffff` | `{{ settings.color_palette.background }}` |
| `175269115448ba3436/ai_gen_block_540b3cf_GLw8kA` | `subheading_spacing` | 25 | 10 |
| `collection_list_BAqBgh` | `padding-block-end` | 30 | 17 |
| `media_with_content_cYWhwX` | `media_position` | `left` | `right` |
| `media_with_content_cYWhwX` | `section_width` | `full-width` | `page-width` |
| `product_recommendations_9tpPi6` | `product` | `blu-ivy-slouch-neck-dolman-pullover` | `risen-frannie-palazzo-raw-hem` |
| `section_WCtahF` | `padding-block-end` | 50 | 25 |
| `section_WCtahF` | `padding-block-start` | 50 | 18 |
| `section_WCtahF/text_KP8TFP` | `font` | `var(--font-subheading--family)` | `var(--font-body--family)` |
| `section_WCtahF/text_KP8TFP` | `font_size` | `1.5rem` | `1rem` |
| `section_WCtahF/text_KP8TFP` | `text` | `<h2>Join Our Email Newsletter</h2>` | `<h2>JOIN OUR EMAIL NEWSLETTER</h2>` |
| `section_WCtahF/text_KP8TFP` | `type_preset` | `rte` | `h3` |
| `section_pnwezH` | `padding-block-end` | 50 | 21 |
| `section_pnwezH` | `padding-block-start` | 50 | 11 |
| `section_pnwezH/group_FzzJtL` | `padding-block-end` | 15 | 0 |
| `section_pnwezH/group_UqKteD` | `padding-block-end` | 15 | 0 |

#### `templates/page.beam.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `section_YcDYxF/image_VakpVD` | `image` | `1_STX_Beam_Website_15d86905...png` | `1_STX_Beam_Website_e34d11f2...png` |

#### `templates/product.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `175148750904be90f6` | `horizontal_alignment` | `flex-start` | `center` |
| `175148750904be90f6` | `padding-block-start` | 38 | 0 |
| `175148750904be90f6/shop_the_look...` | `button_color` | `#030303` | `#000000` |
| `175148750904be90f6/shop_the_look...` | `use_theme_settings` | `true` | `false` |
| `main` | `padding-block-start` | 0 | 30 |
| `product_recommendations_xmXAhw` | `padding-block-end` | 40 | 16 |
| `product_recommendations_xmXAhw` | `padding-block-start` | 70 | 47 |

#### `templates/product.final-sale.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-start` | 0 | 30 |

#### `templates/product.preorder.json`
| Section | Setting | Old | New |
| --- | --- | --- | --- |
| `main` | `padding-block-start` | 0 | 30 |
| `main` | `enable_sticky_add_to_cart` | `true` | (missing) |
| `main/media-gallery` | `thumbnail_radius` | 0 | (missing) |

---

### Color Scheme → Color Palette Mapping

4.1.4 removed color schemes entirely. The old theme's **16 schemes** (each a full set of ~25 colour roles) collapsed into **one 5-value `color_palette`**:

```
background #ffffff   foreground #1a1a1a   color1 #000000   color2 #e51a4e   color4 #eae8e6
```

Sections no longer reference a scheme; they carry their own `background_color`, which may point at a palette value (e.g. `{{ settings.color_palette.color2 }}`). So the question per section is whether its old scheme colour survived into the palette.

Across templates and section groups there are **72 old `color_scheme` usages**. Matched positionally to their new counterparts:

#### Correctly replaced (6)
| Old scheme | Colour | Used by | Now |
| --- | --- | --- | --- |
| `scheme-2` | `#e51a4e` pink | `index.json` marquee + media-with-content, `page.connect-with-us`, `page.our-story` | `color_palette.color2` ✅ |
| `scheme-6` | `#eae8e6` grey | `footer-group.json` ×2 | `color_palette.color4` ✅ |

#### Colour lost — needs an explicit `background_color` (5)
| Template / section | Old colour | Now renders | Fix |
| --- | --- | --- | --- |
| `index.json` `section_pnwezH` | `#eae8e6` grey (scheme-6) | white | **Easy — `color4` already holds this colour** |
| `index.json` `media_with_content_cYWhwX` | `#597cb7` blue | white | Not in palette; set explicit hex or add a palette slot |
| `index.json` `section_WCtahF` | `#67113c` maroon | white | Not in palette; set explicit hex |
| `header-group.json` `header_announcements_dKrUXR` | `#597cb77d` translucent blue | white | Not in palette; set explicit hex |
| `index.json` `divider_ikx3XE` | `#000000` black | — | Section missing entirely (see old-only sections) |

#### Foreground lost (7 uses, 1 scheme)
`scheme-d0bb3aab` had a white background but a **maroon `#67113c` foreground**. Background-only comparison misses this — all 7 now render near-black `#1a1a1a`.

Affects: `collection.json`, `collection.accessories`, `collection.bottoms-collection`, `collection.dresses-collection`, `collection.final-sale`, `collection.gift-guide`, `collection.risen-jeans` (plus `collection.shoe-shop`, which doesn't exist here).

#### Cosmetic (18)
`scheme-4` / `scheme-5` used pure black `#000000` vs the palette's `#1a1a1a`. Negligible, but `color1` is exactly `#000000` if an exact match is wanted.

#### No action (36)
`scheme-1`, `scheme-3`, `scheme-64c1ae50` — background and foreground both match the palette exactly.

---

### Custom CSS in Templates (Needs Review)

#### 1. Header (`sections/header-group.json`)
```css
.menu-list__link-title {font-size: 22px;}

.menu-list__item--level-2 a,
.menu-list__item--level-3 a,
.menu-list__submenu a,
.header__submenu .menu-list__link-title,
ul.menu-list li a {font-size: 16px !important;}
```
**Status:** Needs porting — menu font sizes are a deliberate brand customization.

#### 2. Collection templates (multiple)
```css
.collection-view-count {display: none !important;}
```
Found in: `collection.accessories`, `collection.bottoms-collection`, `collection.dresses-collection`, `collection.final-sale`, `collection.gift-guide`, `collection.json`

**Status: NOT dead — do not port as-is.** Corrected 2026-09-23. `.collection-view-count` exists in 4.1.4 (`blocks/swatches.liquid:24` styles it, `:53` emits it), so this rule would hide a live element rather than doing nothing.

Complicating it: DC also added `blocks/view-counter.liquid`, which uses a *different* class (`.view-counter` / `.view-counter__text`). Two view-count implementations now coexist — worth resolving before deciding what, if anything, to hide.

Supersedes styling PRD item 7 ("dead CSS, feature markup doesn't exist in theme — N/A").

#### 3. Homepage (`templates/index.json`)

**Mobile hero heading margin:**
```css
.ai-mobile-hero-heading-aavjjqxnmsgr3a3rjdaigenblocka0a9a353jbw99 {margin-bottom: 0px;}
```

**Media-with-content section styling:**
```css
p {text-transform: none; line-height: 27px;}

@media screen and (max-width: 749px) {
  .media-block__media {height: 30svh;}
  .media-with-content .media-block {grid-area: content;}
  .media-with-content .media-with-content__content {grid-area: media;}
}
```
**Status:** Needs review — the mobile media reordering swaps image/content positions on mobile.

**Junip review carousel (custom liquid section):**
```html
<div class="junip-review-carousel"
  data-title="Store Reviews"
  data-reviews-type="store_reviews"
  data-product-id=""
  data-show-summary="true">
</div>
```
**Status:** Needs porting — third-party integration (Junip reviews).

#### 4. Product templates (`product.json`, `product.final-sale.json`, `product.preorder.json`)

All three share the same PDP custom CSS:
```css
div#viewsCounterRTEA {color: black; font-size: 12px; text-align: left;}
[id*="true_fit_widget"] {margin-right: auto; transform: translate(-8px, 0);}
.product-details__title {display: flex; flex-direction: row; align-items: flex-start; justify-content: space-between;}
.swym-wishlist-button-bar {margin-top: 0; margin-bottom: 0;}
.product-details__title h1 {margin-bottom: 0;}
@media screen and (max-width: 749px) {
  .product-information {margin-top: -24px;}
  .product-details__title h1 {/* truncated */}
}
```
**Status:** Mixed — `viewsCounterRTEA` is dead CSS, but TrueFit, product title layout, Swym margins, and mobile spacing rules are likely still needed.

**Product recommendations** (product.json only):
```css
.collection-view-count {display: none !important;}
```
**Status:** Dead CSS.

**Shop-the-look** (product.json only):
```css
.shopthelook-section-v2 select {border: 1px solid rgb(0 0 0) !important;}
.shopthelook-section-v2 .shopthelook_add-to-cart {
  background-color: transparent !important;
  color: black !important;
  border: 1px solid #e51a4e !important;
}
.shopthelook-section-v2 .shopthelook_add-to-cart:hover {
  background-color: #e51a4e !important;
  color: white !important;
  border-color: #e51a4e !important;
}
```
**Status:** Needs porting — brand-specific button styling for shop-the-look feature.

**Junip product review (custom liquid section, all 3 product templates):**
```html
<span class="junip-product-review" data-product-id="{{ product.id }}"></span>
```
**Status:** Needs porting — third-party integration (Junip reviews).

---

### Templates Only in Old Theme

| Template | Notes |
| --- | --- |
| `collection.shoe-shop.json` | Collection-specific template — check if still needed |
| `collection.fall-sweater-sale.json` | Collection-specific template — check if still needed |
| `product.no-shop-the-look.json` | Product template variant — check if still needed |

---

### Breadcrumb Sections — No Action Needed

Breadcrumbs are already fully migrated on this branch: `sections/breadcrumb.liquid`, `snippets/breadcrumb.liquid`, and all 16 templates that had them in the old theme reference them.

The comparison matched sections by **ID**, and the breadcrumbs were re-added with regenerated IDs (`breadcrumb_orexOV` vs old `breadcrumb_pdGQrC`). Same type, same position in `order`, different key — so every one was reported as "old-only." All false positives.

The two old templates with breadcrumbs that aren't covered — `collection.shoe-shop.json` and `product.no-shop-the-look.json` — are missing because the whole template doesn't exist here, not because of breadcrumbs.

---

### Old-Only Sections in Templates

After filtering out the same ID-regeneration false positives, only four sections are genuinely absent:

| Template | Section | Type | Notes |
| --- | --- | --- | --- |
| `index.json` | `blocks_icdLYP` | _blocks | Homepage — verify intentional |
| `index.json` | `divider_ikx3XE` | divider | Was last in old `order` |
| `index.json` | `media_with_content_JX3wnr` | media-with-content | 4 other `media_with_content_*` sections are present |
| `product.final-sale.json` | `blocks_xzRUfr` | _blocks | Carried the shop-the-look custom CSS |

**Not missing** — these generic sections were renamed, not dropped. Each sits in the same `order` position as its old counterpart:

| Template | Old ID | New ID |
| --- | --- | --- |
| `collection.accessories.json` | `section_t6bi8a` | `section` |
| `collection.bottoms-collection.json` | `section_AQBCQD` | `section` |
| `collection.dresses-collection.json` | `section_h49KU6` | `section` |
| `collection.gift-guide.json` | `section_RFjqKG` | `section` |

### Section Ordering Differences

| Template | Change |
| --- | --- |
| `collection.gift-guide.json` | `section_ArxkKk` moved ahead of `collection_list_rYqJkc` / `main` |
| `product.json` | `product_recommendations_xmXAhw` and `custom_liquid_6mqAeU` swapped |

---

### Sections in settings_data.json (Old Only)

| Section | Notes |
| --- | --- |
| `color_schemes` | Expected — replaced by `color_palette` in 4.1.4 |
