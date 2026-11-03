# SEO Description — Break-Control Recommendations

**Section:** `sections/rs-plp-seo-description.liquid`
**Date:** 2026-06-16
**Context:** Client suggested CSS to prevent paragraphs/headings from splitting across the two-column gap, and asked whether the small headings should be wrapped in `<h5>`/`<h6>`. This document reviews those suggestions against how the section actually works (content is pulled from a rich-text source — the collection description or the `custom.seo_story` metafield).

---

## Summary

| # | Recommendation | Status | Type |
|---|---|---|---|
| 1 | Retarget selectors to `.rs-plp-seo .story-desc` | Required | Code |
| 2 | Keep paragraphs whole within a column | ✅ Implement | Code |
| 3 | Lock headings to the text that follows | ✅ Implement (extend existing rule) | Code |
| 4 | Wrap small headings in `<h5>`/`<h6>` | ⚠️ Content task, not code | Editorial |
| 5 | `.story-mobile` | No change needed | — |

---

## 1. Selector correction (applies to everything)

The client's snippets target `.collection-footer-columns__inner`, `h2`, and `h3`. This section's multi-column container is `.rs-plp-seo .story-desc`, so the rules must be retargeted there or they have no effect.

Note: the two-column layout is **desktop-only**. On mobile the content renders single-column via `.story-mobile`, so all break-control CSS only matters on desktop — which is exactly where the gap issue appears.

### Why scope to `.rs-plp-seo .story-desc p` rather than the broader selector

The client's suggestion targets the container generically. We recommend the tighter scope for three concrete reasons:

1. **It matches the only element that actually has columns.** `break-inside`/`break-after` do nothing unless an ancestor is creating column fragments, and the only element doing that is `.story-desc` (`columns: 2`). Scoping to `.rs-plp-seo .story-desc p` applies the rule exactly where it has an effect and nowhere it's dead weight.

2. **It avoids touching the mobile copy.** The same `{{ content }}` is rendered twice — once in `.story-desc` (desktop, multi-column) and once in `.story-mobile` (mobile, single-column). A looser selector like `.rs-plp-seo p` would match both. It wouldn't *break* mobile (no columns there means no effect), but it's misleading to read later and invites confusion about whether mobile is affected. Scoping to `.story-desc` keeps the rule's intent self-documenting: "this is the column-gap fix."

3. **It's the only hook that's consistent across both content sources.** This section pulls from two sources, and they render differently:
   - `collection.description` (default — `use_metafield` is `false`): raw stored HTML, **no wrapper and no classes** — just bare `<p>`/`<h2>`/`<h3>`.
   - `collection.metafields.custom.seo_story | metafield_tag` (rich_text_field): Shopify wraps the output in `<div class="metafield-rich_text_field">`, but **the class is only on that outer div** — the inner `<p>`/`<h2>` are still bare semantic tags with no classes.

   So the individual paragraphs and headings are **unclassed in both cases**, and the Shopify `.metafield-rich_text_field` wrapper only exists on the metafield path. If we anchored to `.metafield-rich_text_field`, the rule would work with the metafield but silently do nothing with the plain description (the default). The theme's own `.story-desc` wrapper is the only hook present in *both* cases, which is why it's the correct anchor.

4. **It can't leak past this section.** The `.rs-plp-seo` prefix keeps the rule contained. Because the inner paragraphs are unclassed, a less-specific selector (e.g. a bare `p` rule) risks colliding with `<p>` elements from other sections or apps on the page. The two-class scope `.rs-plp-seo .story-desc` guarantees we only style the paragraphs we own.

In short: same visual result, but the rule does its job only where columns exist, works identically whether the content comes from the description or the metafield, reads clearly, and can't reach content outside this section.

## 2. ✅ Keep paragraphs from splitting across the gap

```css
.rs-plp-seo .story-desc p {
  break-inside: avoid-column;
}
```

**Why:** Clean, no-downside improvement. It keeps each paragraph whole within a single column instead of letting it split across the gap. Works whether the text comes from the standard collection description or the custom metafield, since both render the same `<p>` markup.

## 3. ✅ Lock headings to the text that follows

The section already protects `<h2>`/`<h3>` from splitting and from being stranded at a column bottom (current rule, lines 5–9). Extend it to cover all heading levels:

```css
.rs-plp-seo .story-desc :is(h2, h3, h4, h5, h6) {
  break-inside: avoid;
  break-after: avoid;
}
```

**Why:**
- `break-inside: avoid` keeps the heading itself from splitting across the column gap.
- `break-after: avoid` keeps the heading attached to the paragraph it introduces, so it never gets orphaned at the bottom of a column.

### On the client's `margin-top: 1.5rem`

The client's intent is sound — they want breathing room **between a heading and the paragraph that precedes it**. But applying it as a blanket rule on every heading (as suggested) creates unwanted space in two cases:

- **Heading at the very start of the content** — if the merchant's first block is a heading, the top margin pushes it down from the top of the section, adding a gap we don't want.
- **Heading pushed to the top of column 2** — because rule #3 adds `break-after: avoid`, an otherwise-orphaned heading gets moved to the top of the second column. A blanket top margin pushes it down too, producing ragged, mismatched column tops. Browsers don't reliably strip top margins at a column break, so this needs visual verification.

The fix is to apply the margin only when the heading follows other content, and zero it when it's first:

```css
/* base: breathing room above headings */
.rs-plp-seo .story-desc :is(h2, h3, h4, h5, h6) {
  margin-top: 1.5rem;
}
/* but not when the heading is the first thing in the column/content */
.rs-plp-seo .story-desc > :is(h2, h3, h4, h5, h6):first-child,
.rs-plp-seo .story-desc .metafield-rich_text_field > :is(h2, h3, h4, h5, h6):first-child {
  margin-top: 0;
}
```

The `:first-child` reset needs **both** selectors because of the two content sources: the plain description renders headings directly inside `.story-desc`, while `metafield_tag` nests them inside `.metafield-rich_text_field`. One selector alone misses whichever source isn't in use.

This handles the "start of content" case. The column-top raggedness is browser-dependent and a visual judgment call — **route to the designer to verify in Chrome (Phase 3 validation loop) before locking the `1.5rem` value.** Note the current rule sets `margin-top: 0`, so any value here changes the existing look.

## 4. ⚠️ "Wrap small headings in `<h5>`/`<h6>`" — content task, not a code change

This is the key point. The section renders content from a **rich-text source** — either the collection description or the `custom.seo_story` metafield — and outputs whatever the author typed (`{{ content }}`). That means:

- **We can't promote a paragraph to a heading from the theme.** If a "small heading" was created by bolding a line of paragraph text, it's a `<p>` in the HTML. CSS can style it but cannot turn it into an `<h5>`/`<h6>`. The theme has no hook to rewrite that markup.
- **The reliable fix is editorial:** author those small headings using the actual Heading styles in Shopify's rich-text editor instead of bolding a paragraph. Once they're real heading tags, they automatically get both the bold look *and* the break-protection from rule #3 — no code needed.
- **Do not apply `break-after: avoid` to `<p>`.** If we tried to catch the bolded-paragraph "headings" that way, *every* paragraph would become "don't break after me," which sabotages the column balancing. That rule is only safe on real heading tags.

**Bottom line:** Implement #2 and #3 now (safe, source-agnostic). The heading-wrapping outcome is best achieved by authoring headings with real Heading styles in the description/metafield — then it all just works. If there's a reason to keep them as bolded paragraphs, we'd need to discuss options, but we can't lock those to their following text without breaking the layout.

## 5. `.story-mobile` — no change needed

The break-control properties only do anything where there are fragments to break across, and the only thing creating fragments is `columns: 2` on `.story-desc`.

- `.story-desc` → has `columns: 2`; needs break control. **Desktop only.**
- `.story-mobile` → no `columns` rule; single vertical flow. There's no second column for content to spill into, so `break-inside`/`break-after` would be harmless no-ops. Don't duplicate the rules here.

The two are mutually exclusive by viewport: desktop hides `.story-mobile`, mobile hides `.story-desc`.

**The one thing that carries over to mobile** is the heading-authoring point (#4): `.story-mobile` renders the same `{{ content }}`, so authoring real Heading styles gives the bold heading look in **both** views automatically.
