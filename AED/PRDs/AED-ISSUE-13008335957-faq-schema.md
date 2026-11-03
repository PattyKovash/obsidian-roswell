---
monday_id: 13008335957
project_key: AED
authored: 2026-09-18
---

**See Implementation Notes below for how this was executed — the approach differs from the original suggestion.**

## Background:

-  TBD

## Necessary Info (Design/Documentation):

 In `blocks/ai_gen_block_469757d.liquid`, immediately after the closing `</faq-accordion-{{ ai_gen_id }}>` tag and before the block's behavior `<script>` tag, add a loop over the block's own `question_1..5` / `answer_1..5` settings that outputs `FAQPage` JSON-LD — one `Question`/`acceptedAnswer` entry per non-blank pair.

 Why here and not a hardcoded schema block in the page template: this block is reusable, so generating schema from its own settings keeps it in sync automatically (edit a question in the theme customizer, the schema updates too) and fixes the gap everywhere this block is used, not just this one page. A static/hardcoded JSON-LD block in the template would drift out of sync the next time someone edits the FAQ content.

 Suggested implementation (verified working in a scratch copy of the file, then reverted — not applied to the live export):

 

```
</faq-accordion-{{ ai_gen_id }}>

{%- comment -%} FAQPage structured data - mirrors the question_1..5 / answer_1..5 settings above {%- endcomment -%}
{%- assign faq_schema_has_content = false -%}
{%- for i in (1..5) -%}
 {%- assign question_key = 'question_' | append: i -%}
 {%- assign answer_key = 'answer_' | append: i -%}
 {%- if block.settings[question_key] != blank and block.settings[answer_key] != blank -%}
  {%- assign faq_schema_has_content = true -%}
 {%- endif -%}
{%- endfor -%}
{%- if faq_schema_has_content -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {%- assign faq_schema_first_item = true -%}
  {%- for i in (1..5) -%}
   {%- assign question_key = 'question_' | append: i -%}
   {%- assign answer_key = 'answer_' | append: i -%}
   {%- assign faq_schema_question = block.settings[question_key] -%}
   {%- assign faq_schema_answer = block.settings[answer_key] -%}
   {%- if faq_schema_question != blank and faq_schema_answer != blank -%}
    {%- unless faq_schema_first_item -%},{%- endunless -%}
    {%- assign faq_schema_first_item = false -%}
    {
     "@type": "Question",
     "name": {{ faq_schema_question | strip_html | json }},
     "acceptedAnswer": {
      "@type": "Answer",
      "text": {{ faq_schema_answer | strip_html | json }}
     }
    }
   {%- endif -%}
  {%- endfor -%}
 ]
}
</script>
{%- endif -%}

<script>

```

 Notes for dev:

-  Pass answer text through `strip_html` for the schema `text` field only — [schema.org](http://schema.org) answers should be plain text. Leave the visible accordion rendering full rich HTML/links as it does today; this only affects the JSON-LD copy.

-  Blank check guards against emitting empty `FAQPage` markup on block instances with no content filled in.

-  Because the About page uses two instances of this block, each will emit its own `FAQPage` script tag (covering 5 and 1 Q&As respectively) — this is valid; search engines parse multiple `FAQPage` JSON-LD blocks on a page independently.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
|---|---|---|---|---|
| 1 | About page emits a single `FAQPage` JSON-LD block containing all 6 Q&As. | | ✅ | |
| 2 | FAQ schema only renders when "Render FAQ schema" is enabled in the section settings. | | ✅ | |
| 3 | Schema max items setting caps the number of Q&A pairs in the JSON-LD output. | | ✅ | |
| 4 | `faqaccordion` section accordion behavior is unchanged (expand/collapse, single/multi-open, open-first-item). | | ✅ | |
| 5 | AI-gen block (`ai_gen_block_469757d`) also supports setting-gated FAQ schema when used independently. | | ✅ | |
| 6 | Old `_blocks` section on About page is disabled, not deleted. | | ✅ | |
| 7 | When schema max items is blank, all Q&A pairs are included in the JSON-LD output (no cap). | | ✅ | |

## Dev Notes:

-  TBD

## Implementation Notes:

The About page FAQ was migrated from the `ai_gen_block_469757d` block (used inside the built-in `_blocks` section) to the `faqaccordion` section — the same section already live on the FAQ page (linked from the footer). The `faqaccordion` section supports unlimited Q&A blocks, whereas the AI-gen block is hardcapped at 5 numbered settings. The About page has 6 Q&As, and consolidating into one section produces a single `FAQPage` JSON-LD block instead of two.

**What was built:**

- **`snippets/faq-schema.liquid`** (new) — reusable snippet that renders `FAQPage` JSON-LD. Accepts `faq_blocks`, `schema_id`, and `max_items`. Includes `@id` fragment identifier for knowledge-graph addressability, `strip_html | json` for clean text, blank-content guards, and a configurable item cap.
- **`sections/faqaccordion.liquid`** — added "Structured data" settings group: a checkbox to enable FAQ schema emission and a text input for max items. Renders the snippet when enabled. Also fixed a pre-existing bug where uppercase characters in Shopify-generated section IDs broke `customElements.define()` (added `| downcase` to 4 locations).
- **`blocks/ai_gen_block_469757d.liquid`** — added the same setting-gated `FAQPage` JSON-LD with `@id`, self-contained (loops its own `question_1..5` / `answer_1..5` settings). No max-items setting needed since the block is capped at 5.
- **`templates/page.about.json`** — old `_blocks` section with two AI-gen block instances set to `"disabled": true`. New `faqaccordion` section added with all 6 Q&As and schema enabled.

**Key decisions:**

- `FAQPage` is the only available schema.org type for FAQ content. Google deprecated FAQ rich results (May 2026), but Bing still uses them. AI platforms tokenize JSON-LD as raw text — no semantic parsing.
- Industry best practice is one `FAQPage` per URL (primarily for Bing). The `@id` fragment identifier (`#faq-{section.id}`) makes each block uniquely addressable if multiple do appear on a page.
- Schema emission is off by default and opt-in per section/block. The info text recommends enabling on only one section per template.

## Testing Notes:

- TBD

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD
