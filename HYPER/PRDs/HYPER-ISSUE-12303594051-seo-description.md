#  

## Background:

-  TBD

## Necessary Info (Design/Documentation):

-  There is a stray > in the code.

-  Instead of using p tags in the description, we can change actual headings to heading tags. How did we upload the content to the description? Will they all follow the same structure? Are we skipping metafield for now?

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3046434542/Screenshot%202026-06-16%20at%2011.20.21%E2%80%AFAM.png)

-  [seo-description-client-response.md](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3046519066/seo-description-client-response.md)

-  [seo-description-break-control-recommendations.md](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3046519557/seo-description-break-control-recommendations.md)

  For the heading break, I think we still need to include the other tags in our css. Currently, I think the css only covers h2,h3. Im assuming we'd want to include h1 too..rs-plp-seo .story-desc :is(h2, h3, h4, h5, h6) { break-inside: avoid; break-after: avoid;}

![Image: ](https://files.monday.com/use1/photos/28314062/thumb_small/28314062-user_photo_2023_05_30_16_23_38.png?1685463818)

## Objective/Acceptance Criteria:

-  TBD

## Dev Notes:

-  TBD

## Implementation Notes:

-  Fixed the stray `>` left after `{% endschema %}`.

-  Extended the heading break-control rule from `h2, h3` to `:is(h2, h3, h4, h5, h6)` in `sections/rs-plp-seo-description.liquid`, so all heading levels stay locked to the text that follows them (`break-inside: avoid; break-after: avoid;`) instead of just h2/h3.

-  Added `break-inside: avoid-column` on paragraphs so a paragraph doesn't split mid-sentence across the two-column gap. Scoped to `.rs-plp-seo .story-desc p:not(:only-of-type)` — applying it unscoped to every `<p>` caused single-paragraph collection descriptions to collapse entirely into column 1, leaving column 2 empty (confirmed live on the "no heading, 1 paragraph" scenario below before scoping it).

-  Did **not** implement the client's suggested blanket `margin-top: 1.5rem` on headings — a flat rule adds unwanted space above a heading at the very start of the content and can misalign column tops when `break-after: avoid` pushes an orphaned heading to the top of column 2. This needs a Phase 3 Chrome visual-verification pass before locking a value.

-  Did **not** convert small/bolded "headings" to real `<h5>`/`<h6>` tags — the section renders whatever's typed in the collection description or `custom.seo_story` metafield (`{{ content }}`), so a bolded paragraph can't be promoted to a real heading tag from the theme side. That's an editorial fix (author with real Heading styles in the rich-text editor), not a code change.

### Heading level recommendation: author as `<h2>`, styled to the compact `h4` size

**Recommendation:** author these subheadings as `<h2>` in the rich-text editor, styled via CSS to the compact H4 size — because H2 keeps the page's heading hierarchy correct, while CSS (not tag level) is what should control how big a heading looks.

- **The page already skips heading levels.** `/collections/ultralight-tents` jumps straight from `H1` to `H5`, bypassing H2–H4 entirely. `<h2>` fixes this outright (no other H2 exists on the page to conflict with); `<h4>` would still skip two levels.
- **The sizing bug is a missing-style problem, not a tag problem.** `{{ content }}` renders with none of the theme's heading styles applied (no `.rte` wrapper), so headings fall back to raw browser defaults — `h4` computes to `1em` (15px, coincidentally equal to body text) and `h5` to `0.83em` (12.45px, measured — smaller than body text). Scoped CSS fixes this for any tag level, which is why we can use the correct tag (`h2`) and still get the compact look.
- **Google explicitly says don't use heading level for visual sizing — use CSS instead.** [Google developer documentation style guide](https://developers.google.com/style/headings)
- **Heading level isn't a ranking factor itself, but correct hierarchy helps Google (and AI systems) understand what a heading applies to** and matters for accessibility/screen readers. [Google Search Central podcast (Illyes & Splitt), reported by Search Engine Journal](https://www.searchenginejournal.com/heading-tags-for-seo/341817/)
- **AI answer engines reward proper semantic heading structure to extract and cite the right chunk** — directly relevant since this section exists to feed SEO/AI-visible copy. [Perplexity's official crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

Implemented in `sections/rs-plp-seo-description.liquid`:
```css
.rs-plp-seo .story-desc :is(h2, h3, h4, h5, h6),
.rs-plp-seo .story-mobile :is(h2, h3, h4, h5, h6) {
  font-size: var(--heading-h4-font-size);
  font-family: var(--heading-font-family);
  font-weight: var(--heading-font-weight);
  line-height: var(--heading-line-height);
  letter-spacing: -.3px;
}
```

Scenarios tested (screenshots attached):

1.  **Has headings, using h4** — sizing reads correctly (heading larger than paragraph text).
    Admin: https://admin.shopify.com/store/hyperlite/collections/271751741485
    Storefront: https://hyperlitemountaingear.com/collections/ultralight-backpacks

2.  **Has headings, using h5** — heading reads smaller than the paragraph text below it.
    Admin: https://admin.shopify.com/store/hyperlite/collections/34122432557
    Storefront: https://hyperlitemountaingear.com/collections/ultralight-tents

3.  **No heading, single paragraph** — the scenario that exposed the unscoped `break-inside: avoid-column` regression (content collapsed into column 1, column 2 empty); confirms the `:not(:only-of-type)` fix.
    Admin: https://admin.shopify.com/store/hyperlite/collections/73307029549
    Storefront: https://hyperlitemountaingear.com/collections/all

4.  **All paragraphs, no heading tags used** — content looks like it has headings visually, but none are actually wrapped in heading tags; useful baseline for the "all `<p>`" case.
    Admin: https://admin.shopify.com/store/hyperlite/collections/261498142765
    Storefront: https://hyperlitemountaingear.com/collections/sleep-system

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD

 