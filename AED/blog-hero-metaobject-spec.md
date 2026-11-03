# Blog pillar hero — metaobject definition spec

**Status:** design only. No theme files are modified by this document.
**Scope:** drive the existing `sections/image-banner.liquid` hero on six pillar blog pages from a single metaobject definition + one shared `blog.pillar.json` template, via Shopify dynamic sources.
**Sources:** `sections/image-banner.liquid` (this repo, as of `331c9df`), `locales/en.default.schema.json`, vault `04-engineering/seo/blog-restructure.md`, and Shopify docs (verified 2026-08-24) — see [References](#references).

---

## 0. TL;DR

| | |
|---|---|
| Metaobject type | `blog_hero_banner` |
| Bindable fields | heading (H1 text), intro, desktop image, mobile image, overlay color, eyebrow, CTA label, CTA url |
| Blog metafield | owner `BLOG`, `custom.hero_banner`, type `metaobject_reference` (validated to `blog_hero_banner`) |
| Template | one `templates/blog.pillar.json` (fork of the existing `blog.blog-v2.json`), assigned to all six blogs |
| Not bindable | every `select`, `range`, `checkbox`, `color_scheme` and `liquid` setting — heights, alignment, size steps, heading tag, overlay on/off, overlay opacity, content width, spacing, separator |

The plan works. The heavy lifting is done by 3 text/image fields; the ~30 presentational settings stay hardcoded in the one shared template, which is fine because all six pillars are meant to look identical.

---

## 1. Full inventory of `image-banner` settings

Locale keys resolved from `locales/en.default.schema.json`. "Dyn?" = accepts a dynamic source (see §2).

### 1.1 Section settings

| # | id | type | English label | default | Dyn? |
|---|---|---|---|---|---|
| — | `header__general` | header | "General" | — | n/a |
| 1 | `height_mobile` | select | Height | `600` | **No** |
| 2 | `height` | select | Height on desktop | `680` | **No** |
| 3 | `side_margin_choice` | select | Side margin level | `level-0` | **No** |
| 4 | `color_scheme` | color_scheme | Color scheme | `scheme_2` | **No** |
| — | `header__background` | header | "background" | — | n/a |
| 5 | `background_image_mobile` | image_picker | Image | — | **Yes** (`file_reference`, image) |
| 6 | `background_image` | image_picker | Image | — | **Yes** (`file_reference`, image) |
| 7 | `background_video` | video | Video | — | **Yes** (`file_reference`, video) |
| 8 | `background_overlay` | checkbox | Add overlay | `false` | **No** |
| 9 | `background_overlay_color` | color | Overlay color | `#000000` | **Yes** (`color`) |
| 10 | `background_overlay_opacity` | range | Overlay opacity | `40` | **No** |
| — | `header__content` | header | "Content" | — | n/a |
| 11 | `content_custom_width` | checkbox | Set custom content width | `true` | **No** |
| 12 | `content_width` | range | Maximum width | `720` | **No** |
| 13 | `content_position` | select | Position | `left` | **No** |
| 14 | `content_vertical_align` | select | Vertical alignment | `center-bottom` | **No** |
| 15 | `content_horizontal_align` | select | Horizontal alignment | `left` | **No** |
| 16 | `inset_choice` | select | Inner padding level | `level-4` | **No** |
| — | `header__separator` | header | "Separator" | — | n/a |
| 17 | `separator` | checkbox | Show separator | `false` | **No** |
| 18 | `separator_width` | range | Width | `100` | **No** |
| 19 | `separator_use_custom_color` | checkbox | Choose custom color | `false` | **No** |
| 20 | `separator_custom_color` | color | Color | `#CCCCCC` | **Yes** (`color`) |
| — | `header__spacing` | header | "Spacing" | — | n/a |
| 21 | `spacing` | checkbox | Add margin | `true` | **No** |
| 22 | `spacing_choice` | select | Level | `level-3` | **No** |
| 23 | `spacing_placement` | select | Placement | `1` | **No** |

### 1.2 Block: `special-heading` ("Special heading")

| id | type | English label | default | Dyn? |
|---|---|---|---|---|
| `banner_special_heading` | text | Text | "This is Image banner heading" | **Yes** |
| `banner_special_heading_size` | select | Size | `medium` (x-small / small / medium / large) | **No** |
| `banner_special_heading_size_mobile` | select | Size (mobile) | `""` = "Same as desktop" | **No** |
| `banner_special_heading_tag` | select | Heading Tag (h1–h6) | `h2` | **No** |

### 1.3 Block: `heading` ("Heading")

| id | type | English label | default | Dyn? |
|---|---|---|---|---|
| `banner_heading` | text | Text | "This is Image banner heading" | **Yes** |
| `banner_heading_size` | select | Size | `medium` (x-small…huge, 7 steps) | **No** |
| `banner_heading_size_mobile` | select | Size (mobile) | `""` | **No** |
| `banner_heading_tag` | select | Heading Tag (h1–h6) | `h3` | **No** |

### 1.4 Block: `text` ("Text")

| id | type | English label | default | Dyn? |
|---|---|---|---|---|
| `banner_text` | text | Text | "This is simple description for Image banner." | **Yes** |
| `banner_text_size` | select | Size | `large` (x-small…x-large) | **No** |
| `banner_text_size_mobile` | select | Size (mobile) | `""` | **No** |

> The `*_size_mobile` settings are the recent local addition (commit history: "show computed px in the size dropdowns" / per-breakpoint sizes). A blank value emits nothing and inherits desktop. They are `select`, so they are **not** bindable — see §2.

### 1.5 Block: `buttons` ("Buttons")

Four button groups, 1–4. Per button *n*:

| id | type | English label | default | Dyn? |
|---|---|---|---|---|
| `banner_button_n_text` | text | Text | "Button n text" | **Yes** |
| `banner_button_n_url` | url | URL | — | **Yes** (`url` metafield only) |
| `banner_button_n_target` | select | Target (`_self`/`_blank`) | `_self` | **No** |
| `banner_button_n_style` | select | Style (outline / fill / outline-secondary / fill-secondary / link) | `fill` | **No** |
| `banner_button_1_custom_width`, `banner_button_2_custom_width` | checkbox | Set custom button width | `false` | **No** |
| `banner_button_1_width`, `banner_button_2_width` | range | Button width (150–350px) | `200` | **No** |

Note buttons 3 and 4 have **no** `custom_width`/`width` settings — an upstream asymmetry, not a bug introduced here.

### 1.6 Other block types

- `@app` — app blocks, nothing to bind.
- `liquid` — one `liquid`-type setting `custom_liquid` ("Custom liquid"). **Not** bindable, but it is the escape hatch (see §3.3).

### 1.7 Bugs / quirks worth knowing before templating

Two pre-existing defects in the section, both surfaced while inventorying it. Neither blocks this plan; both should be filed separately.

1. **`banner_button_*_target` is never rendered.** The schema defines it, but the `{% render 'button' %}` calls at lines 219–252 never pass `button_target`, so `snippets/button.liquid` always falls back to `_self`. "Open in new tab" silently does nothing.
2. **`--theme-image-banner-button-width` reads a setting that does not exist.** Line 50 emits `block.settings.banner_button_width` for `block.type == 'button'`, but the block type is `buttons` and the settings are `banner_button_1_width` / `banner_button_2_width`. That `{% style %}` branch is dead code.

---

## 2. Which settings can actually take a dynamic source

Verified against shopify.dev *Dynamic data sources* (fetched 2026-08-24). The complete compatibility matrix:

| Setting type | Compatible metafield type(s) |
|---|---|
| `text` | single/multi-line text, number, date, weight, volume, dimension, rating, money |
| `richtext` | same as `text`, plus link |
| `inline_richtext` | same as `richtext` |
| `url` | `url` |
| `color` | `color` |
| `image_picker` | `file_reference` (must accept image file types) |
| `video` | `file_reference` (must accept video file types) |
| `product` / `product_list` | `product_reference` / `list.product_reference` |
| `collection` / `collection_list` | `collection_reference` / `list.collection_reference` |
| `page` | `page_reference` |
| `article` | `article_reference` |
| `blog` | `blog_reference` |
| `metaobject` / `metaobject_list` | `metaobject_reference` / `list.metaobject_reference` (same type as the schema declares) |

**Explicitly absent from the matrix — cannot be bound:**
`select`, `range`, `checkbox`, `number`, `color_scheme`, `liquid`, `html`, `font_picker`, `video_url`, `header`, `paragraph`, `text_alignment`, `richtext`-adjacent editor-only types.

Two consequences that matter here, stated plainly:

- **`select` is not bindable.** So `height`, `height_mobile`, every `*_size` and `*_size_mobile` step, `*_tag` (the H1/H2 choice), `content_position`, `content_*_align`, `inset_choice`, `spacing_*`, `side_margin_choice`, and every button `target`/`style` are **hardcoded per template**, not per pillar. There is no metaobject workaround: the theme editor will not even show the dynamic-source (database) icon next to these.
- **`range` and `checkbox` are not bindable.** So `background_overlay` (on/off), `background_overlay_opacity`, `content_custom_width`, `content_width`, `separator*`, and button widths are likewise template-level.

That is acceptable for this project **because the brief calls for six visually identical pillar heroes differing only in image + H1 + intro.** If a pillar later needs a taller hero or a different overlay strength, the only options are (a) a second template (`blog.pillar-tall.json`) or (b) the `liquid` block escape hatch (§3.3). Say this to the merchant up front so "one metaobject controls everything" isn't over-promised.

Also verified: dynamic sources are **not** available on global theme settings — only section and block settings. Metaobjects are usable as a dynamic source in two ways: directly (any metaobject with storefront access is offered store-wide under "From your store"), or through a `metaobject_reference` metafield on the template's resource ("From this template"). Both require **storefront access = PUBLIC_READ** on the definition.

---

## 3. The metaobject definition

### 3.1 Type handle

```
blog_hero_banner
```

Descriptive, no app reservation (`$app:` prefix is for app-owned definitions and would hide it from the merchant). Display name: **Blog hero banner**.

### 3.2 Fields

| # | key | Name | Shopify field type | Required | Validations | Maps to |
|---|---|---|---|---|---|---|
| 1 | `heading` | Heading (H1) | `single_line_text_field` | Yes | max 120 chars | `special-heading` block → `banner_special_heading` |
| 2 | `intro` | Intro paragraph | `multi_line_text_field` | Yes | max 600 chars | `text` block → `banner_text` |
| 3 | `hero_image` | Hero image (desktop) | `file_reference` | Yes | `file_type_options: ["Image"]` | section → `background_image` |
| 4 | `hero_image_mobile` | Hero image (mobile) | `file_reference` | No | `file_type_options: ["Image"]` | section → `background_image_mobile` |
| 5 | `overlay_color` | Overlay color | `color` | No | — | section → `background_overlay_color` |
| 6 | `eyebrow` | Eyebrow / kicker | `single_line_text_field` | No | max 60 chars | `heading` block → `banner_heading` (optional second line) |
| 7 | `cta_label` | CTA label | `single_line_text_field` | No | max 40 chars | `buttons` block → `banner_button_1_text` |
| 8 | `cta_url` | CTA link | `url` | No | `allowed_domains` unset | `buttons` block → `banner_button_1_url` |

`displayNameKey: "heading"` so entries list readably in admin.

Fields 5–8 are optional headroom. The brief's pillar hero is image + H1 + intro only; ship 1–4 required and 5–8 defined-but-empty rather than adding fields later (adding a field to a definition is cheap, but re-binding six templates is not — except here there is only one template, so it is cheap either way).

**Deliberately NOT fields:** anything mapping to a `select`/`range`/`checkbox`. Creating a `heading_size` field would be a trap — the merchant would fill it in and nothing would happen, because `banner_special_heading_size` cannot be bound. Do not add them.

**`intro` as `multi_line_text_field` → `text` setting:** valid per the matrix, but the `text` block renders into a single `<p>` (line 213) so newlines collapse. The approved copy is one paragraph each, so this is fine. If multi-paragraph intros are ever wanted, the block would need to become `richtext`-typed — a theme change, out of scope here.

### 3.3 The blocks problem — read this carefully

`image-banner` puts its content in **blocks**, and block instances live in the template JSON (`templates/blog.pillar.json`), not in the metaobject. A metaobject cannot create, remove, or reorder blocks. It can only supply *values* to settings on blocks that already exist in the template.

Three arrangements, in order of preference:

1. **Recommended — fixed block set, bound settings.** The single `blog.pillar.json` contains exactly the blocks the design needs (`special-heading`, `text`, optionally `buttons`). Their `banner_special_heading` / `banner_text` / `banner_button_1_*` settings are bound to `blog.metafields.custom.hero_banner.value.<field>`. Every pillar gets the same block structure with different text. This is what the brief describes and it works cleanly.
   *Gotcha:* the `text` and `buttons` blocks render only `{% if setting != blank %}` (lines 205, 212, 216) — so an empty metaobject field degrades to "block not rendered", not "empty markup". That is the desired behaviour and means the optional CTA block can sit in the template permanently and simply disappear for pillars with no `cta_label`.

2. **Acceptable fallback — the `liquid` block.** `custom_liquid` cannot be bound, but its *contents* are Liquid and can read `blog.metafields.custom.hero_banner.value.*` directly at render time. Useful for anything the block schema can't express (a second paragraph, a conditional badge). Costs: no theme-editor preview affordance, no translation support, and it renders inside `.custom-liquid` at whatever position the block sits.

3. **Not recommended — per-blog templates.** Six `blog.<pillar>.json` files with hardcoded copy. This is exactly what the merchant asked to avoid, and it makes a design tweak a six-file edit. Only reach for it if a pillar genuinely needs different *presentational* settings.

### 3.4 How the metaobject is reached from a blog page

Blog metafield definition:

| Property | Value |
|---|---|
| Owner type | `BLOG` |
| Namespace | `custom` |
| Key | `hero_banner` |
| Type | `metaobject_reference` |
| Name | Hero banner |
| Validations | `metaobject_definition_id` = the `blog_hero_banner` definition |
| Storefront access | `PUBLIC_READ` |
| Admin access | `MERCHANT_READ_WRITE` |

Resolves in Liquid as:

```liquid
{{ blog.metafields.custom.hero_banner.value.heading }}
{{ blog.metafields.custom.hero_banner.value.intro }}
{{ blog.metafields.custom.hero_banner.value.hero_image | image_url: width: 1600 }}
```

and appears in the theme editor's dynamic-source picker under **"From this template"** when editing a `blog.*` template, because the template's resource is `blog`. (`MetafieldOwnerType` confirmed to include `BLOG`.)

> **Verify this one on the actual store before committing to it.** Shopify's public docs enumerate the *setting↔metafield* matrix exhaustively but do not enumerate which *resource* templates surface metafields in the picker; the help-centre article names "pages, blogs, homepage, and collection templates" for metaobject connections, which covers us, but that is help-centre prose rather than a spec. Ten-minute check: create the definition, set the value on one blog, open the blog template in the editor, confirm the database icon offers `Hero banner → Heading`. If for any reason it does not, fall back to the store-wide "From your store → Metaobjects" picker (which would pin *one* entry to the template — no good for six blogs) or to arrangement §3.3.2, which does not depend on the picker at all.

---

## 4. Creation steps

### 4.1 Admin UI click-path

**A. Create the metaobject definition**

1. Shopify admin → **Settings → Custom data → Metaobjects → Add definition**.
2. Name: `Blog hero banner`. Confirm the auto-generated type handle reads `blog_hero_banner` (edit it if admin slugifies differently).
3. **Add field** ×8 per the table in §3.2. For `hero_image` / `hero_image_mobile` choose **File** and restrict "Accepted file types" to **Images**. For `intro` choose **Multi-line text**.
4. Under **Options**, tick **Storefronts** access (this is mandatory — without it nothing renders and the field will not appear in the picker).
5. Set **Display name** field to `Heading`.
6. Save.

**B. Create the blog metafield**

1. **Settings → Custom data → Blogs → Add definition**.
2. Name `Hero banner`, namespace/key `custom.hero_banner`.
3. Type: **Metaobject → Blog hero banner**. (This produces `metaobject_reference` validated to the definition.)
4. Access: storefront visible. Save.

**C. Create the six entries** — **Content → Metaobjects → Blog hero banner → Add entry**, once per pillar, values from §5.

**D. Attach each entry to its blog** — **Content → Blogs →** *(pillar blog)* **→ Metafields → Hero banner →** select the matching entry.

**E. Create the template**

1. Copy `templates/blog.blog-v2.json` → `templates/blog.pillar.json`, push with `shopify theme push`.
2. In **Content → Blogs →** each pillar blog → **Theme template** → `pillar`.
3. Open the theme editor on the `blog.pillar` template.

**F. Bind the settings** — for each of these, click the setting, click the **dynamic source (database) icon**, pick **Hero banner → *(field)***:

| Setting | Bind to |
|---|---|
| Image banner → `background_image` | `hero_image` |
| Image banner → `background_image_mobile` | `hero_image_mobile` |
| Image banner → `background_overlay_color` | `overlay_color` |
| Special heading block → Text | `heading` |
| Text block → Text | `intro` |
| Buttons block → Button 1 Text / URL | `cta_label` / `cta_url` |

Save. Preview each of the six blogs.

### 4.2 GraphQL Admin API (scriptable, repeatable on AEDShop)

> Run against `2026-07` or later. Both mutations need `write_metaobject_definitions` / `write_metafield_definitions` scopes.

**Metaobject definition**

```graphql
mutation CreateBlogHeroBanner($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition { id type name fieldDefinitions { key name type { name } required } }
    userErrors { field message code }
  }
}
```

```json
{
  "definition": {
    "type": "blog_hero_banner",
    "name": "Blog hero banner",
    "displayNameKey": "heading",
    "access": { "admin": "MERCHANT_READ_WRITE", "storefront": "PUBLIC_READ" },
    "capabilities": { "publishable": { "enabled": true }, "translatable": { "enabled": true } },
    "fieldDefinitions": [
      { "key": "heading", "name": "Heading (H1)", "type": "single_line_text_field", "required": true,
        "validations": [{ "name": "max", "value": "120" }] },
      { "key": "intro", "name": "Intro paragraph", "type": "multi_line_text_field", "required": true,
        "validations": [{ "name": "max", "value": "600" }] },
      { "key": "hero_image", "name": "Hero image (desktop)", "type": "file_reference", "required": true,
        "validations": [{ "name": "file_type_options", "value": "[\"Image\"]" }] },
      { "key": "hero_image_mobile", "name": "Hero image (mobile)", "type": "file_reference", "required": false,
        "validations": [{ "name": "file_type_options", "value": "[\"Image\"]" }] },
      { "key": "overlay_color", "name": "Overlay color", "type": "color", "required": false },
      { "key": "eyebrow", "name": "Eyebrow", "type": "single_line_text_field", "required": false,
        "validations": [{ "name": "max", "value": "60" }] },
      { "key": "cta_label", "name": "CTA label", "type": "single_line_text_field", "required": false,
        "validations": [{ "name": "max", "value": "40" }] },
      { "key": "cta_url", "name": "CTA link", "type": "url", "required": false }
    ]
  }
}
```

`publishable` gives entries draft/active status so copy can be staged before a pillar launches. Drop it if the merchant finds the extra status field noisy — but note a *draft* entry renders nothing on the storefront, which is a useful safety net during the ~425-post migration.

**Blog metafield definition** — needs the definition id from the previous call:

```graphql
mutation CreateBlogHeroMetafield($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id name namespace key type { name } ownerType }
    userErrors { field message code }
  }
}
```

```json
{
  "definition": {
    "name": "Hero banner",
    "namespace": "custom",
    "key": "hero_banner",
    "ownerType": "BLOG",
    "type": "metaobject_reference",
    "description": "Pillar hero banner content for the blog.pillar template.",
    "validations": [
      { "name": "metaobject_definition_id", "value": "gid://shopify/MetaobjectDefinition/REPLACE_ME" }
    ],
    "access": { "admin": "MERCHANT_READ_WRITE", "storefront": "PUBLIC_READ" }
  }
}
```

**Creating an entry** (repeat ×6; `hero_image` takes a `gid://shopify/MediaImage/...` from a prior `fileCreate`):

```graphql
mutation CreateEntry($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message code }
  }
}
```

```json
{
  "metaobject": {
    "type": "blog_hero_banner",
    "handle": "compliance-regulations",
    "capabilities": { "publishable": { "status": "ACTIVE" } },
    "fields": [
      { "key": "heading", "value": "AED Compliance & Regulations" },
      { "key": "intro", "value": "AED requirements in Canada are set at both the federal and provincial level…" },
      { "key": "hero_image", "value": "gid://shopify/MediaImage/REPLACE_ME" }
    ]
  }
}
```

**Attaching an entry to a blog:**

```graphql
mutation AttachHero($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id key namespace }
    userErrors { field message code }
  }
}
```

```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Blog/REPLACE_ME",
    "namespace": "custom",
    "key": "hero_banner",
    "type": "metaobject_reference",
    "value": "gid://shopify/Metaobject/REPLACE_ME"
  }]
}
```

> **AEDShop caveat.** These mutations are store-level data, not theme files, so re-running them on the AEDShop store is safe and is the *right* way to port. Do **not** copy `templates/blog.pillar.json` or `sections/image-banner.liquid` across the repos — per CLAUDE.md the two themes have diverged in `image-banner.liquid` specifically, and AEDShop's copy has no `*_size_mobile` settings. Recreate the template as a targeted edit on that side. Also note AEDShop branches off `dev`, not `main`.

---

## 5. The six entries (pre-filled from approved vault copy)

Handles suggested to mirror the blog handles from `blog-restructure.md`. `overlay_color`, `eyebrow`, `cta_label`, `cta_url` left empty for all six unless the merchant asks.

| # | handle | `heading` | `intro` | `hero_image` / `hero_image_mobile` |
|---|---|---|---|---|
| 1 | `aed-compliance-regulations` | AED Compliance & Regulations | AED requirements in Canada are set at both the federal and provincial level, and, of course, are subject to change. This section covers Health Canada medical device licensing, provincial workplace and construction site obligations, registration and maintenance duties, and the liability questions that come with owning an AED. Helpful guidance for health and safety managers, facility owners, property managers, and business owners. | **Already chosen** — `aed-compliance-bg-desktop-2880x800.jpg` / `aed-compliance-bg-mobile-780x1158.jpg` (in use in `templates/blog.blog-v2.json`) |
| 2 | `cpr-cardiac-education` | Cardiac Arrest & CPR Education | Sudden cardiac arrest can happen to anyone, at any age, without warning. These blogs explain what happens during an arrest, why CPR and early defibrillation work together rather than separately, what CPR certification actually involves, and how to build and maintain the skills to respond. Geared toward first-time responders, workplace first-aid teams, and CPR instructors alike. | **TODO** |
| 3 | `aed-buying-guides` | AED Buying Guides & Comparisons | Choosing the right AED means weighing cost against features like bilingual prompts, CPR feedback, child settings, and connectivity. Our blogs compare the brands and models we carry, explain the difference between new and recertified units, and cover the ongoing needs most first-time buyers miss: replacement pads and batteries. Start here whether you're buying one AED or standardizing equipment across multiple sites. | **TODO** |
| 4 | `aed-industry-solutions` | Industry & Workplace Solutions | Every environment carries a different level of risk and a different set of obligations. Learn appropriate AED programs sector by sector, covering schools, construction sites, fitness centres, churches, offices, hospitals and aviation. This includes valuable information on how many units a site needs, where to mount them, and what training and maintenance the setting calls for. | **TODO** |
| 5 | `aed-product-spotlights` | Product & Technology Spotlights | Take a closer look at AED equipment itself: what each unit does, how the models differ, and which accessories they take. This blog covers AEDs from ZOLL, Philips, Cardiac Science, HeartSine, Physio-Control/Stryker and Defibtech, training manikins from Prestan and Laerdal, and readiness monitoring through TrackMyAED and AEDtrax. | **TODO** |
| 6 | `aed-news-canada` | Community & Company News | AED4Life is based in Canada and focused on this country's AED market. This blog is where we cover more of what's happening around us. Expect regional AED awareness initiatives, seasonal safety reminders, partnership and distributor announcements, and news from our team. | **TODO** |

Image sizing to match what pillar 1 already uses: **desktop 2880×800**, **mobile 780×1158**. Sara / the content team owns picking pillars 2–6.

> Copy note: the vault's pillar-1 intro ends "…property managers, and business owners." The value currently live in `blog.blog-v2.json` drops the serial comma ("property managers and business owners"). Trivial, but pick one before seeding the entry so the metaobject is the single source of truth.

Title tags and meta descriptions from the vault brief are **not** in this metaobject — they belong on the blog resource's own SEO fields (or a separate `custom.seo_*` blog metafield), not on a banner section. Out of scope here, but don't lose them.

---

## 6. Blocking gotchas and open items

1. **Duplicate H1 — the real blocker.** `sections/main-blog.liquid:83` already renders `<h1 class="blog-title">{{ blog.title }}</h1>`, and the brief asks the hero to carry the pillar H1. `blog.blog-v2.json` currently sets `banner_special_heading_tag` to `h2`, which avoids the duplicate but means the hero heading is *not* the H1 and the H1 is the raw blog title rather than the approved copy (e.g. "AED Compliance & Regulations"). Pick one, deliberately:
   - **(a)** Name each Shopify blog exactly the approved H1 string, keep the hero at `h2`, and let `main-blog` supply the H1. Zero theme change, but the H1 then sits below the hero in a section the design may want to hide.
   - **(b)** Set the hero block to `h1` and suppress `main-blog`'s title. Requires a theme edit to `main-blog.liquid` (a setting or a conditional) — **out of scope for this spec, needs its own ticket.**
   Since `banner_special_heading_tag` is a `select`, it cannot vary per pillar either way; whichever is chosen is baked into the one template.
2. **All presentational settings are shared across the six pillars.** Restated because it is the single most likely source of "the metaobject isn't working" confusion. See §2.
3. **Confirm the blog-metafield dynamic-source picker on the real store** before writing the six entries — §3.4's boxed note.
4. **Storefront access is not optional.** Both the metaobject definition and the blog metafield definition need storefront visibility, or the fields silently do not appear in the picker and render blank.
5. **`blog.blog-v2.json` is not the final template.** It is work-in-progress for `AED-ISSUE-12833905325` and its `rs_blog_nav` block still has three pillars pointing at `url: "#"` and one at the legacy `news` handle. The six real blogs do not exist yet; creating them (and their handles) is a prerequisite to attaching any metafield.
6. **The vault brief carries an unresolved FLAG** (`blog-restructure.md:110`): the AED4Life/AEDShop two-brand content mapping contradicts `blog-pre-publish-checklist.md`. That does not block creating the definition on the AED4Life store, but it does block deciding whether AEDShop gets the same six pillars.
7. **Two pre-existing `image-banner` bugs** (§1.7) — button `target` never applied, dead `banner_button_width` style branch. Only relevant if the CTA fields in §3.2 are actually used.
8. **Locale strings.** Nothing in this plan adds a user-facing string or setting label to the theme, so `locales/en.default*.json` need no changes.

---

## References

- shopify.dev — [Dynamic data sources](https://shopify.dev/docs/storefronts/themes/architecture/settings/dynamic-sources) (setting↔metafield compatibility matrix; "Dynamic sources aren't available for general theme settings")
- shopify.dev — [`metaobjectDefinitionCreate`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/metaobjectDefinitionCreate)
- shopify.dev — [`MetafieldOwnerType`](https://shopify.dev/docs/api/admin-graphql/latest/enums/MetafieldOwnerType) (confirms `BLOG`)
- Shopify Help Center — [Connecting and displaying metaobjects](https://help.shopify.com/en/manual/custom-data/metaobjects/connecting-to-your-online-store/connecting-metaobjects)
- Vault — `aed4life/04-engineering/seo/blog-restructure.md`
- Repo — `sections/image-banner.liquid`, `sections/main-blog.liquid`, `templates/blog.blog-v2.json`, `locales/en.default.schema.json`
