
## Background:

- New Shopify main product section (PDP) for Elie Tahari, matched to the new Figma designs, replacing the current product page gallery and layout.
- This is PRD 1 of 6 for the new PDP. It's the **foundation ticket** — it sets up the new section and the block structure the other 5 PRDs build into. It doesn't build the gallery, variant picker, buy box, sticky bar, or description — those are placeholder blocks here.
- Main Monday Ticket: 12170552235.
- The full hour-estimate breakdown for all 6 PDP tickets is at the end of this PRD.

## Related PRDs

| PRD | Covers | Depends on this ticket for |
|---|---|---|
| PRD-02 Gallery | `TAHARI-ISSUE-12170552235-pdp-02-gallery.md` | The gallery slot |
| PRD-03 Variant Picker | `TAHARI-ISSUE-12170552235-pdp-03-variant-picker.md` | The variant-picker slot (part of the product-form unit — see Dev Notes) |
| PRD-04 Buy Box Actions | `TAHARI-ISSUE-12170552235-pdp-04-buy-box-actions.md` | The buy-buttons slot (part of the product-form unit — see Dev Notes) |
| PRD-05 Sticky Add-to-Cart Bar | `TAHARI-ISSUE-12170552235-pdp-05-sticky-add-to-cart-bar.md` | The sticky-bar setting stubbed here |
| PRD-06 Description + Accordion | `TAHARI-ISSUE-12170552235-pdp-06-description-accordion.md` | The below-gallery content slot(s) |

The exact block/file boundaries for PRD-02–06 aren't finalized as a 1:1 "one block per PRD" mapping — see Dev Notes for why, and for a flagged risk to PRD-03/PRD-04's file-level independence.

## Standing Requirement: Prefer Web Components (added 2026-07-28)

**New PDP JS should be built as a web component (a real custom element,
or extending/wrapping an existing one like `<slider-component>`), not a
bare IIFE script that reaches into the DOM from outside — especially on
the PDP, where dynamic content swap/injection is a common pattern.**

This was missed once already: `assets/main-product-gallery.js` (PRD-02)
was built as a plain querySelector-and-addEventListener script, reasoned
at the time as "glue code wiring into existing web components, not new
UI" — that reasoning didn't hold up against this standing preference and
the file is being converted after the fact (see
`02-decisions/decisions.md`, 2026-07-28).

**If there's a real reason not to build something as a web component for
a specific piece of work under this PRD, STOP and explain the reasoning
to the user, then get explicit confirmation before proceeding with a
non-web-component approach.** Do not silently default to a lighter
pattern the way the gallery script did.

## Necessary Info (Design/Documentation):

- **Figma (context only — no build of its own here):** [Desktop](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15023&m=dev) and [Mobile](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15129&m=dev) full-PDP references. Each individual block is owned by the PRDs above.
- The new section reuses the same block *mechanism* the current product page already uses (merchants add/remove/reorder blocks in the theme editor) — no new platform capability is required. The block list itself is new and scoped to what's in Figma (gallery, variant picker, buy box, description), not a copy of the current page's ~20 fine-grained block types — see Constraints and Dev Notes.
- The new section is built alongside the live PDP, not in place of it, so nothing on the live storefront changes until a separate future cutover ticket.
- A vault doc governing one existing PDP mechanism (`--pdp-media-height-ratio`, a gallery aspect-ratio variable) wasn't accessible while writing this PRD — flagged in Clarifying Questions for whoever reads it before PRD-02 starts.

## Constraints / Scope:

- **In scope:** the new section file, a structure that renders the gallery and product form (title/price/variant picker/buy buttons) as one visually-composed unit matching Figma — where exactly the buy box floats over the gallery on desktop, not stacked below it — plus flexible content blocks for the area below the gallery (description, accordion, text, divider, and a general-purpose custom-liquid block for ad hoc content), section settings, placeholder content so the page renders end-to-end, and a separate test template so this can be reviewed without touching the live PDP.
- **Decision: minimize customization/settings across this project.** Development speed, performance, ADA compliance, and matching Figma exactly are the priorities — merchant-configurability is not. Default to hardcoded values matching Figma (padding, colors, layout) rather than exposing theme-editor settings for them, across every PRD in this project, not just this one. Only add a setting where the ticket already calls for one (e.g. `enable_sticky_add_to_cart`) or where Figma itself shows a genuinely content-editable field (e.g. block heading/body text). Don't add settings "for flexibility" as a default habit — that's the opposite of this project's priority.
- **Out of scope:** the actual gallery/variant-picker/buy-box/sticky-bar/description UI (PRD-02–06); matching the current product page's ~20 fine-grained, independently-reorderable block types (title, price, buttons, etc. as separate blocks) — the new schema is intentionally scoped to Figma's elements, not full parity with the current page's granularity; cutting the live product page over to the new section (a separate future ticket needing merchant sign-off); "Complete the Look," "Collection Story," "You May Also Like," and the footer — these are separate existing sections, not part of "gallery, product details, and product form."
- **Alternative considered:** editing the current product page in place instead of building alongside it. Rejected — the new design is a large enough change that building in parallel is safer and keeps the live page untouched until it's ready.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  A new PDP section exists, scoped to Figma's elements (not the current product page's full ~20-block-type list), and its gallery + product form render as one visually-composed unit matching Figma's overlapping desktop layout — not a plain vertical stack. |   | ✓ |   |
|  1a |  The area below the gallery/product form supports flexible, repeatable content blocks (description, accordion, text, divider, custom liquid) that a merchant can add/remove/reorder independently. |   | ✓ |   |
|  2 |  Placeholder content renders for each block/slot so the page is visibly complete end-to-end, ready for PRD-02–06 to build into. |   | ✓ |   |
|  3 |  A new test template renders the section with zero errors, and is only reachable by previewing it on the dev theme with a `?view=` URL parameter — no product's template assignment needs to change, and no live product page is affected. |  Verified live via `?view=pdp-2026&preview_theme_id=...` on 2026-07-20 — renders with zero errors from our code (one unrelated third-party retargeting-pixel console error). |  ✓ | ✓ |
|  4 |  Structured data (SEO) still renders correctly for a product using the new template. |  Verified live on `?view=pdp-2026` (2026-07-20): `application/ld+json` outputs Product (8 variant offers), BreadcrumbList, and Organization schema correctly — `snippets/microdata-schema.liquid` is rendered globally from `layout/theme.liquid`, decoupled from which section renders the product. |  ✓ | ✓ |
|  5 |  No changes are made to the current live product page files or any of the 6 live product templates. |   | ✓ |   |
|  6 |  New files pass the theme's code-quality check (`shopify theme check`) with zero new errors. |  Ran 2026-07-20: 0 errors, 3 warnings (`MissingRenderSnippetArguments` on the `render 'stylesheet'` call — a pervasive pre-existing pattern across this theme, not specific to our code; matches the plainest existing call convention e.g. `snippets/product.liquid`'s `pickup-availability.css` call). |  ✓ | ✓ |
|  7 |  A short comment in the new section documents where each downstream PRD's block plugs in. |   | ✓ |   |

### Out of Scope

- Actual gallery/variant-picker/buy-box/sticky-bar/description UI (PRD-02–06).
- "Complete the Look," "Collection Story," "You May Also Like," footer.
- Any functional updates to the existing gallery zoom feature (PRD-02 only repositions/restyles it to match Figma — zoom behavior itself is unchanged, project-wide).
- Dynamic in-page updating of product data (gallery, price, details) beyond what the theme already does today. The current theme does **not** swap product data in place when a shopper picks a different color — clicking a color swatch navigates to that color's sibling product page (a normal page load), which is the existing, working pattern. This project does not add new AJAX/dynamic product-data swapping for color; size selection continues to use whatever dynamic update the current theme already provides, unchanged.

## Dev Notes:

- **Architecture starting point:** use this theme's existing `section.blocks` + `{% case block.type %}` pattern — the same shape `sections/product.liquid` already uses in production. Avoid Horizon's `content_for 'blocks'`/nestable-blocks layer as the *outer* section mechanism — it depends on an unconfirmed platform capability and isn't needed to satisfy anything in scope here.
- **The layout requirement, not the mechanism, is what's fixed.** Two things this ticket must get right, however it's built:
  1. **Gallery + product form (title, price, variant picker, buy buttons) render as one visually-composed unit**, matching Figma/the Hermès reference: on desktop, the product form is a panel that floats over/beside the gallery, not a block stacked below it. Do not treat title/price/variant-picker/buy-buttons as independently-reorderable top-level blocks that a merchant could separate or drag apart in the theme editor — that would break the layout.
  2. **The area below the gallery/product form is a flexible, repeatable content zone** (description, accordion, text, divider, custom liquid) that a merchant *can* freely add/remove/reorder — this is where the current theme's granular, many-block-type approach is actually a good model to follow, unlike the product-form area above.
- **How to satisfy (1) is an implementation decision, not prescribed here — evaluate Figma and pick the right structure.** Options, roughly in order of risk (lowest first):
  - **Flat blocks + CSS Grid.** Keep gallery/variant-picker/buy-buttons as separate block types (as today's theme does for similar overlapping layouts elsewhere), each rendered inside the section's normal block loop, but give each a class based on `block.type` and use `grid-template-areas` on the section's outer container so the buy-box blocks visually overlap the gallery regardless of DOM/schema order. No new platform capability needed; each block stays in its own file.
  - **One merged block for the whole product form.** A single `product_form` block type whose snippet internally renders title/price/variant-picker/buy-buttons together. Simpler CSS, but means whichever file implements it can't be cleanly split across two PRDs without both touching the same file — **this directly conflicts with the "Build order" section's assumption that PRD-03 and PRD-04 each own a separate file and can build in parallel.** If this option is chosen, re-check that build-order/parallelism plan before dispatching PRD-03 and PRD-04.
  - **Nested blocks ("blocks within blocks").** Only pick this if the platform capability is confirmed available first — this is the same class of unconfirmed-capability risk already flagged for the outer section's architecture, just one level deeper.
- **Proposed new files** (adjust based on whichever structural option above is chosen):
  - `sections/main-product.liquid` — new section shell, block dispatch, structured data.
  - Separate snippets per block/slot (e.g. `snippets/main-product-gallery.liquid`, `snippets/main-product-variant-picker.liquid`, `snippets/main-product-buy-buttons.liquid`, `snippets/main-product-description.liquid`) if the flat-blocks approach is used — real markup added by PRD-02/03/04/06. Named `main-product-*` to avoid colliding with the legacy `product-*.liquid` snippets, which are not touched by this project.
  - `templates/product.pdp-2026.json` — new alternate template. Preview it on any existing product on the dev theme via the `?view=pdp-2026` URL parameter — no need to reassign a product's template or use a dedicated test product.
- **Current implementation being replaced** (reference only, not edited under this ticket):
  - `sections/product.liquid` — thin wrapper (`{%- render 'product' -%}` + a `{% schema %}` block defining ~20 block types: `title`, `price`, `variants`, `buttons`, `siblings`, `description`, `accordion`, `upsell`, etc., plus settings like `product_sticky_enable`, `image_layout`). Not a model to copy wholesale for the product-form area (see above), but a reasonable model for the flexible content-blocks area below it.
  - `snippets/product.liquid` (941 lines) — the real PDP template: sets `--pdp-media-height-ratio` at line 161 (consumed by `snippets/media.liquid` lines 22/68), then a `case block.type` loop (lines ~429–915) dispatching to ~18 `product-*.liquid` partials.
  - `assets/product-info.js` defines `<product-info>`, the variant-change orchestrator (AJAX re-render, URL update, price/availability sync). Loaded from 5 places site-wide, not PDP-exclusive — do not modify. Mount it in the new section the same way the current one does; PRD-02–05 all depend on it.
  - 6 live templates reference `"type": "product"` as their main section: `product.json`, `product.earrings.json`, `product.necklaces.json`, `product.holuna-necklaces.json`, `product.gift-card.json`, `product.editoral.json`.
- Whatever schema shape is chosen: use `t:` translation keys for any label that does exist, but per the minimize-customization decision above, keep the settings list itself minimal — no padding/color/layout range-and-picker settings by default. Hardcode spacing and color to match Figma directly in CSS. Only `enable_sticky_add_to_cart` (already required by PRD-05) and genuinely content-editable fields belong in the schema.
- **Gotcha:** `<product-info>` is reused site-wide (5 call sites). If PRD-02–05 need new/changed behavior on it, extending it with feature-detection (not assumed PDP-exclusive) is one option — but building a separate, new custom element for PDP-specific behavior is equally acceptable if it avoids regression-testing the shared component across all 5 call sites. Prefer whichever is less risky for the specific change; don't default to extending `<product-info>` just because it exists.
- **Project-wide convention: prefer web components (custom elements) for any new JS, configured via attributes, not inline `<script>` JSON blobs or globals.** This matches what the theme already does (`<product-info>`, `<slider-component>`, `<klaviyo-bis-form>`, `<variant-selects>`) and keeps any future dynamic behavior easy to bolt on later — a component can react to an attribute changing (`attributeChangedCallback`) without needing a rewrite. PRD-04's `<buy-now-button data-variant-id="...">` already follows this; PRD-02/03/05 should follow the same pattern for any new elements they introduce.
- **Action item:** read the vault pattern doc `04-engineering/patterns/pdp-gallery-aspect-ratio.md` for the `--pdp-media-height-ratio` rationale before PRD-02 starts — it wasn't accessible while writing this PRD.

## Implementation Notes:

- **Built on `feature/TAHARI-12551827026-pdp-setup`.**
- **Structural decision made: flat blocks + explicit "fixed slot" extraction, positioned with plain CSS (`position: relative`/`absolute`), not CSS Grid, a merged block, or nested blocks.** `gallery`, `variant_picker`, and `buy_buttons` stay as separate block types (each independently toggleable/settings-editable in the theme editor) but are pulled out of the general block loop via `section.blocks | where: 'type', 'gallery' | first` and rendered into two explicit wrapper `<div>`s (`.main-product__top > .main-product__media` and `.main-product__form`) — so they can never be reordered relative to each other, satisfying the "one visually-composed unit" requirement without needing CSS Grid, a merged file, or any nested-blocks platform capability. This also means **PRD-03 and PRD-04 remain fully independent files** — the earlier flagged conflict in "Build order" does not apply; Wave 2's 4-way parallel build stands as originally planned.
- Layout: on desktop (≥768px), `.main-product__form` is `position: absolute; right/bottom` over `.main-product__media` (`position: relative`), matching Figma's floating buy-box panel. Below 768px it reverts to normal stacked flow. No `grid-template-areas` used — this theme had no existing precedent for that pattern, and simple absolute positioning was faster to implement and simpler to reason about.
- Files created: `sections/main-product.liquid`; `snippets/main-product-gallery.liquid`, `main-product-variant-picker.liquid`, `main-product-buy-buttons.liquid`, `main-product-description.liquid`, `main-product-accordion.liquid` (all placeholder stubs with real minimal content — e.g. the buy-buttons stub renders a disabled button with the existing `products.product.add_to_cart` locale key, the gallery stub renders `product.featured_image`); `assets/main-product.css`; `templates/product.pdp-2026.json`. No existing files were modified (confirmed via `git status`).
- **Block schema deviates from the PRD's original sketch in two ways, both per the "minimize customization" decision and actual theme convention (confirmed by reading 3 existing sections' schemas):**
  - Uses plain English `"name"`/`"label"` strings, not `t:` translation keys — this theme does not use a `t:`/locale-key convention for schema labels anywhere (checked `sections/product.liquid`, `sections/section-hero.liquid`, `sections/section-before-after.liquid` — all plain strings). Reused the one existing relevant locale key that does exist: `products.product.add_to_cart` for the buy-buttons stub.
  - No `padding`/color range settings, no `disabled_on` block. `disabled_on` is used elsewhere in this theme only on decorative/reusable sections that could be dropped into header/aside/footer groups — the main product-page section (`sections/product.liquid`) doesn't have one either, so this one doesn't either. Only two settings exist: `enable_sticky_add_to_cart` (checkbox, required by PRD-05) and `color_scheme` (the theme's standard `color_scheme` picker, used site-wide — kept as core infra, not "extra flexibility").
  - Two additional lightweight block types were added beyond the original 4 (`description`, `accordion`, `text`, `divider`) to cover the "flexible content below the gallery" requirement, per the `text`/`divider` examples explicitly requested.
- Structured data: **no action taken/needed.** `{{ product | structured_data }}` was deliberately *not* added — `snippets/microdata-schema.liquid` already renders JSON-LD site-wide from `layout/theme.liquid`, independent of which section renders the product. Adding the native filter here would have produced duplicate/conflicting JSON-LD, contradicting `CLAUDE.md`'s explicit instruction not to touch that snippet.
- All acceptance criteria now verified: live preview (`?view=pdp-2026`), structured data (Product/BreadcrumbList/Organization JSON-LD all present), and `shopify theme check` (0 errors, 3 pre-existing-pattern warnings) — see the table above.
- Committed (not pushed) as `83c54bc` on `feature/TAHARI-12551827026-pdp-setup`.
- **Bug caught during implementation, fixed before commit:** the color scheme default was initially written as `scheme_1` (underscore) copying `sections/product.liquid`'s own schema default — but that default doesn't actually match any real scheme ID; `config/settings_data.json` defines the real scheme as `scheme-1` (hyphen), and `templates/product.json` references it that way too. `sections/product.liquid`'s schema has this same underscore/hyphen mismatch (latent, harmless there since the instance-level template setting always overrides the schema default) — this new section's schema default was corrected to `scheme-1` rather than copying that inconsistency forward.

## Bugs from QA:

- TBD

## Clarifying Questions:

- Should the new gallery keep the existing `--pdp-media-height-ratio` mechanism once the vault doc is read, or is this the moment to redesign it?
- How should the gallery + product form be structured to achieve Figma's overlapping layout — flat blocks positioned with CSS Grid, one merged product-form block, or nested blocks (pending platform-support confirmation)? This should be decided during PRD-01's implementation (see Dev Notes) and directly affects whether PRD-03 and PRD-04 can be built in parallel (see Build order).

## Project Estimate Summary (all 6 PDP PRDs)

Itemized hour breakdown for the AI-assisted estimate on every ticket in this project, placed here since this is the foundation ticket. "AI-assisted" hours are mostly human time — reviewing generated code, testing in the theme preview, accessibility checks, confirming no regression — not raw code-generation time.

### Build order

Not all 6 tickets can start at once. This assumes each PRD-02–06 owns a distinct file, so within a wave they don't conflict with each other — **that assumption holds if PRD-01 uses the flat-blocks-plus-CSS-Grid approach for the product form (see Dev Notes), but breaks for PRD-03/PRD-04 specifically if PRD-01 instead merges variant-picker and buy-buttons into one combined block/file.** Re-confirm this table once PRD-01's structural approach is actually decided.

| Wave | PRD(s) | Can run in parallel? | Depends on |
|---|---|---|---|
| 1 | PRD-01 | Solo — must go first | Nothing |
| 2 | PRD-02, PRD-03, PRD-04, PRD-06 | Yes, all 4 in parallel — unless PRD-01 merges the variant-picker and buy-buttons into one file, in which case PRD-03 and PRD-04 need to coordinate or be built sequentially instead | PRD-01 merged (creates the section shell and block slots each of these fills) |
| 3 | PRD-05 | Solo — must go last | PRD-03 (sibling-color swatch markup) and PRD-04 (`<buy-now-button>` and back-in-stock components) — this ticket reuses their actual code, not just a written interface, so it needs them built first |

| PRD | Subtask | AI-assisted hrs |
|---|---|---|
| **01 — Scaffolding** | Evaluate Figma layout, decide gallery/product-form structure (flat blocks + CSS Grid vs. merged block vs. nested blocks) | 1.0–1.5 |
| | Schema + placeholder partials, matching the existing product-page pattern | 0.5–1.0 |
| | Test template + preview via `?view=` URL param on the dev theme | 1.0–1.5 |
| | Theme-check cleanup + translation-key review | 1.0 |
| | Wire `<product-info>` mount + sticky-bar setting stub | 1.0–1.5 |
| | **Subtotal** | **4.5–6.5** |
| **02 — Gallery** | Configure the theme's existing slider component for the filmstrip/carousel (already used on the current PDP, so no new carousel logic needed) | 2.0–3.0 |
| | Thumbnail rail + mobile progress-indicator styling to Figma | 2.0–2.5 |
| | Zoom (reposition/restyle existing zoom feature to match Figma — no functional change) | 1.0–1.5 |
| | Responsive images, lazy-loading, accessibility, performance check | 1.5–2.0 |
| | **Subtotal** | **6.5–9.0** |
| **03 — Variant Picker** | Color swatches, built against the confirmed data model (link to sibling product, no dynamic swap) | 2.0–2.5 |
| | Size grid + sold-out styling | 1.5 |
| | Size-chart trigger reuse | 0.5–1.0 |
| | Confirm size selection still triggers the existing (unchanged) variant update behavior with the new markup | 0.5–1.0 |
| | Accessibility + pre-selected-variant test | 1.0–1.5 |
| | **Subtotal** | **5.5–7.5** |
| **04 — Buy Box Actions** | Add to Bag styling over the existing add-to-cart logic | 1.5–2.0 |
| | New Buy Now component (add to cart, then go to checkout, keeping the cart intact) | 3.0–4.0 |
| | Extend the existing back-in-stock notify form to match Figma | 1.5–2.0 |
| | Sold-out state + error messaging | 1.0–1.5 |
| | Accessibility + preorder check | 1.0–1.5 |
| | **Subtotal** | **9.0–11.0** |
| **05 — Sticky Bar** | Show/hide-on-scroll behavior | 1.0–1.5 |
| | Bar styling to Figma | 1.5–2.0 |
| | Wire to shared selection state and buy-box actions (no new logic) | 1.0–1.5 |
| | Compressed size/color row | 0.5–1.0 |
| | **Subtotal** | **4.0–6.0** |
| **06 — Description + Accordion** | Convert the existing accordion into a repeatable, merchant-editable block | 1.5–2.0 |
| | Accessibility (expand/collapse states, motion) | 1.0–1.5 |
| | Default-open behavior (desktop vs. mobile) | 0.5–1.0 |
| | Description + delivery-note copy | 0.5–1.0 |
| | Check existing products with fewer accordion rows still work | 0.5–1.0 |
| | **Subtotal** | **4.0–6.5** |
| | **Project total (AI-assisted)** | **33.5–46.5 hrs** |

**Least reliable estimates:** PRD-04's new Buy Now component (genuinely new code, needs real testing) and PRD-03's dependency on a pending color data-model decision. Most reliable: PRD-01, PRD-05, and PRD-06, which lean almost entirely on things already working in this codebase.
