# Task: Port the `rs-section` block spacing/class settings pattern to [SECTION NAME]

## Context

`sections/main-product.liquid` (PDP, ticket TAHARI-12551928604) recently got a standard
settings group added to every block in that section (except `gallery`): merchant/dev-facing
margin, padding, and a custom-class field. I need you to add the same pattern to the blocks
in `[SECTION FILE(S) — fill in]`.

This is a **port of an existing, working mechanism** — not a new design. Two shared snippets
already exist in this repo and should be reused as-is, unmodified:

- `snippets/rs-section.liquid`
- `snippets/rs-section-settings.liquid`

Do not fork or duplicate these snippets. If your section needs something they don't support,
stop and flag it rather than copy-pasting and diverging.

## What the pattern gives each block

Per block, independently settable:
- **Margin top / bottom**, mobile and desktop (4 free-text fields — plain CSS value strings
  like `24px` or `2rem`, not a slider/range — merchant can type any unit)
- **Padding top / bottom**, mobile and desktop (4 more, same shape)
- **Block Class** — a free-text field appended to the block's own wrapper `class` attribute,
  for one-off dev-authored CSS hooks (not really merchant-facing — it's an escape hatch for
  devs, put it in the schema anyway since it's a text field on the same block)

Breakpoint is fixed at this theme's existing 750px breakpoint (`main.css`/`theme.css`
convention: `max-width: 749px` = mobile, `min-width: 750px` = desktop). Don't add a
breakpoint-override setting — that's a deliberate simplification vs. the version of this
pattern used in other Roswell repos (PINKYS-UAT-5, DoyleAndDoyle), which also carry bg/text
color fields we intentionally dropped here. Match main-product's trimmed-down version:
margin/padding/class only.

## Exact mechanics (copy this shape)

### 1. Schema — add to every block's `settings` array (order matters, matches main-product.liquid)

```json
{
  "type": "text",
  "id": "block_class",
  "label": "t:sections.general.settings.block_class.label"
},
... (this block's own existing settings stay in the middle, unchanged) ...
{
  "type": "header",
  "content": "t:sections.general.settings.margin_settings.header"
},
{
  "type": "paragraph",
  "content": "t:sections.general.settings.margin_settings.paragraph"
},
{ "type": "text", "id": "margin_top_mobile", "label": "t:sections.general.settings.margin_top_mobile.label" },
{ "type": "text", "id": "margin_bottom_mobile", "label": "t:sections.general.settings.margin_bottom_mobile.label" },
{ "type": "text", "id": "margin_top", "label": "t:sections.general.settings.margin_top.label" },
{ "type": "text", "id": "margin_bottom", "label": "t:sections.general.settings.margin_bottom.label" },
{
  "type": "header",
  "content": "t:sections.general.settings.padding_settings.header"
},
{
  "type": "paragraph",
  "content": "t:sections.general.settings.padding_settings.paragraph"
},
{ "type": "text", "id": "padding_top_mobile", "label": "t:sections.general.settings.padding_top_mobile.label" },
{ "type": "text", "id": "padding_bottom_mobile", "label": "t:sections.general.settings.padding_bottom_mobile.label" },
{ "type": "text", "id": "padding_top", "label": "t:sections.general.settings.padding_top.label" },
{ "type": "text", "id": "padding_bottom", "label": "t:sections.general.settings.padding_bottom.label" }
```

`block_class` goes **first** in the settings array (established convention — do this on every
block for consistency, per explicit direction from a previous session). The `t:` keys already
exist in `locales/en.default.schema.json` (added for main-product.liquid) — reuse them, don't
create new keys unless your section needs section-scoped copy for some reason.

### 2. Render — wrap each block's output through `rs-section`

Wherever your section currently outputs a block's markup directly, capture it into a variable
and pass it through `rs-section` instead:

```liquid
{%- liquid
  assign wrapper_class = '[your-block-wrapper-base-class]'
  unless block.settings.block_class == blank
    assign wrapper_class = wrapper_class | append: ' ' | append: block.settings.block_class
  endunless
-%}
{%- capture block_html -%}
  ... existing block markup ...
{%- endcapture -%}
{%- render 'rs-section',
  prop_setting: block,
  prop_slot: block_html,
  prop_tag: 'div',
  prop_class: wrapper_class
-%}
```

`rs-section` takes `prop_setting` (the block — it reads `.settings.*` and `.id` off it),
`prop_slot` (the already-rendered inner HTML string), `prop_tag` (wrapping element, default
`div`), `prop_class`. It gives the wrapper a `data-section-id="{{ block.id }}"` attribute and
internally calls `rs-section-settings`, which emits an inline `<style>` block (nested INSIDE
the wrapper, as its last child — not after it, see Gotcha below) scoped to
`[data-section-id="..."]`, setting `--set-margin-top-mobile`/`-desktop`,
`--set-margin-bottom-*`, `--set-padding-top-*`, `--set-padding-bottom-*` custom properties —
one `@media` block per non-blank field only (blank fields emit nothing, so the CSS default
wins).

**If `prop_slot` is blank, `rs-section` renders nothing at all — not even the wrapper.** If
your block can legitimately have empty content (e.g. an optional text field), make sure
`block_html` is genuinely blank in that case rather than a wrapper-with-nothing-in-it, or
you'll get an invisible-but-still-there wrapper picking up borders/padding from other CSS.

### 3. CSS — add a base wrapper rule to your section's stylesheet

```css
.[your-block-wrapper-base-class] {
  --set-margin-top-mobile: [your section's existing default gap, or 0px];
  --set-margin-top-desktop: [same];
  margin-top: var(--set-margin-top-mobile);
  margin-bottom: var(--set-margin-bottom-mobile, 0px);
  padding-top: var(--set-padding-top-mobile, 0px);
  padding-bottom: var(--set-padding-bottom-mobile, 0px);
}

@media only screen and (min-width: 750px) {
  .[your-block-wrapper-base-class] {
    margin-top: var(--set-margin-top-desktop);
    margin-bottom: var(--set-margin-bottom-desktop, 0px);
    padding-top: var(--set-padding-top-desktop, 0px);
    padding-bottom: var(--set-padding-bottom-desktop, 0px);
  }
}
```

Pick sensible defaults for your section — main-product defaulted top-margin to its existing
flat block gap (24px) and everything else to 0, to preserve current visual spacing with zero
settings filled in. Whatever your section's current spacing convention is, that should become
the CSS default so turning this on doesn't shift anything until a merchant/dev actually fills
in a field.

## Gotchas hit while building this the first time — don't re-hit these

1. **Include your section's stylesheet exactly once, before the block loop — never per-block.**
   If any snippet rendered per-block calls `render 'stylesheet', name: '...'`, it re-emits a
   fresh `<link>` tag on every iteration. A per-block override and the class-level CSS default
   have equal specificity (`[data-section-id]` vs. the base class), so "later in the DOM wins"
   — a later block's redundant stylesheet re-inclusion silently reverts an earlier block's
   override back to the CSS default. Include the stylesheet once, at the very top of the
   section file, before any block rendering.

2. **`rs-section-settings`'s `<style>` output must render INSIDE the wrapper, not after it**,
   if you have any CSS depending on true DOM adjacency between consecutive wrapped blocks
   (e.g. an adjacent-sibling `+` selector for border-collapse between rows). The current
   `rs-section.liquid` already does this correctly (style renders as the wrapper's last
   child) — just don't "simplify" it to render the style as a sibling after `</div>` if you
   ever touch that snippet, it breaks `+` selectors between wrappers.

3. **If you ever change a setting's schema `type`** (e.g. from a `range`/number field to
   `text`/string, if some block already had a numeric padding setting before this port),
   grep every `templates/*.json` for that block type + setting id and fix any already-saved
   numeric values to quoted strings before merging. Shopify does not migrate saved template
   values when a schema type changes, and `shopify theme check` does not catch this — it
   surfaces as "Setting 'X' must be a string" only when a merchant opens the theme editor and
   tries to save.

4. **Don't reuse a generic/theme-wide state class name** (`is-open`, `is-active`, etc.) on any
   new wrapper or component root you touch while doing this — grep `assets/*.css` for the
   class name first. `is-open` in particular is used theme-wide as a descendant-selector
   prefix (drawers, `toggle-ellipsis`, klaviyo-bis) — reusing it on an unrelated component's
   own root can silently match one of those existing rules against your component instead of
   the one you meant to write.

## Reference implementation to read before starting

- `sections/main-product.liquid` — read the block loop (~line 206–278) and the fixed-slot
  block wrapping (~line 110–188) for two different call shapes (loop vs. individual capture).
- `snippets/rs-section.liquid`, `snippets/rs-section-settings.liquid` — the shared snippets,
  read but do not modify.
- `assets/main-product-description.css` — `.main-product__block-wrapper` rule (~line 41–57)
  for the CSS half.
- `locales/en.default.schema.json` — the `t:` keys, already repo-wide, reuse them.
- Vault pattern doc (if you have access): `04-engineering/patterns/main-product-block-spacing.md`
  in the `elie-tahari` merchant vault — full writeup of the mechanism plus 4 gotchas (the ones
  listed above, in more detail, plus a CSS Grid auto-placement one specific to main-product
  that likely doesn't apply to your section).

## What I need from you

1. Confirm which blocks in your section this should apply to (all of them, or are there
   fixed/structural blocks like `gallery` here that should stay excluded — ask if unsure
   rather than guessing).
2. Add `block_class` + the 8 margin/padding fields to each applicable block's schema, in the
   order shown above.
3. Wrap each block's rendered output through `rs-section` per the pattern above.
4. Add the base `.your-block-wrapper` CSS rule (mobile-first + `min-width: 750px` override),
   defaulting to your section's current spacing so nothing visually shifts with no fields
   filled in.
5. Verify in the theme editor: existing blocks still look identical with no settings changed;
   setting a margin/padding value actually moves that specific block; `block_class` value
   shows up on the wrapper in devtools.
6. Run `shopify theme check` before considering this done.
