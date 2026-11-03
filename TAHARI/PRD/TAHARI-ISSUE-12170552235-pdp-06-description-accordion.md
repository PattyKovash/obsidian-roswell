
## Background:

- New product description + accordion (Product details / Fabric / Size & Fit / Shipping & Returns) below the PDP gallery, matched to Figma.
- PRD 6 of 6 for the new PDP. Depends on **PRD-01 (Scaffolding)** for the block slot.
- Monday Ticket: [12551928604](https://roswellstudios-company.monday.com/boards/4922048779/pulses/12551928604)

## Standing Requirement: Prefer Web Components (added 2026-07-28)

New PDP JS should be built as a real web component (a custom element, or extending/wrapping an existing one), not a bare script that reaches into the DOM from outside. If there's a real reason not to for a specific piece of work under this PRD, flag it and get confirmation before proceeding another way.

## Necessary Info (Design/Documentation):

- **Figma:**
  - [Desktop description + accordion](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15024&m=dev) — description + delivery note on the left; accordion rows on the right, all closed by default (re-confirmed directly against the file; an earlier draft of this PRD incorrectly said "Product details" was open by default).
  - [Mobile full PDP reference](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15129&m=dev) — description + accordion rows stack below the gallery, all closed by default. The specific mobile description/accordion sub-frame is node `1117:15140`.

- The current product page has an accordion with 2 rows configured — the new design calls for up to 4 (Product details, Fabric, Size & Fit, Shipping & Returns). Built as a flexible, repeatable block so a merchant can add/remove/reorder rows without a dev.

## Constraints / Scope:

- **In scope:** the description paragraph, delivery note, and the accordion as an independently configurable, repeatable block.
- **Out of scope:** "Complete the Look," "Collection Story," "You May Also Like" (separate existing sections); writing new "Fabric"/"Size & Fit" merchandising copy (a content task for the merchant/PM, not dev). No default-open state — see Necessary Info above.
- **Assumption:** the accordion ships as a repeatable block so existing products with only 2 rows configured keep working without a forced migration to exactly 4.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Description paragraph and delivery note render and match Figma, on both desktop and mobile. |  |  ✅ |   |
|  2 |  Accordion rows match Figma on both desktop and mobile — layout, spacing, and the expand/collapse icon. |  |  ✅ |   |
|  3 |  Clicking a row's heading opens/closes it, with a clear visual indicator of state. |  |  ✅ |   |
|  4 |  Rows are accessible — screen readers correctly announce expanded/collapsed state, hidden content is actually hidden (not just visually). |  |  ✅ |   |
|  5 |  A row can contain a bulleted list and it renders correctly, matching the theme's normal list styling. |  |  ✅ |   |
|  6 |  Accordion rows can be added, removed, reordered, and edited by a merchant in the theme editor, without a dev. |  |  ✅ |   |
|  7 |  Existing products currently configured with only 2 accordion rows still render correctly. |  |  ✅ |   |
|  8 |  No changes to the current live product page or live templates. |  |  ✅ |   |
|  9 |  An accordion row or text block with no content configured doesn't render at all — no empty row or blank block appears on the page. |  |  ✅ |   |

### Out of Scope

- "Complete the Look," "Collection Story," "You May Also Like" sections.
- Writing new "Fabric"/"Size & Fit" merchandising copy.

## Dev Notes:

- **Reuse candidates evaluated, not reused:** `snippets/product-tabs.liquid`'s `collapsible-elements` accordion couples "is this row collapsible on this breakpoint" with its default-open state in a way that would make a row non-interactive on whichever breakpoint it's forced open on — doesn't fit this PRD's "always toggleable" requirement. Built a small purpose-built `<accordion-row>` custom element instead (`assets/main-product-accordion.js`), following the standard button + `aria-expanded`/`aria-controls` + `role="region"` disclosure pattern.
- **Blank rows:** a row with no content configured is skipped entirely rather than rendering an empty panel — a merchant who hasn't backfilled "Fabric"/"Size & Fit" copy simply won't see that row. Same logic applies to the text block: if its content is blank (and, if configured, its fallback is also blank), neither the block nor its wrapper renders.
- **Per-block spacing controls:** every block in this section (except gallery) also got merchant/dev-facing margin, padding, and custom-class settings this cycle, matching a pattern already used in other Roswell theme repos — see the vault pattern doc referenced in Implementation Notes rather than re-explained here.

## Implementation Notes:

- **Branch:** `develop/feature/TAHARI-ISSUE-12551928604-pdp-description-accordion`, merged into `develop/_candidate` (PR #65) and live-verified/deployed to `RS DEV (PK): PDP` before merge.
- **Files:** `sections/main-product.liquid`, `snippets/main-product-description.liquid`, `snippets/main-product-accordion.liquid`, `assets/main-product-description.css`, `assets/main-product-accordion.js`, plus the new shared `snippets/rs-section.liquid`/`rs-section-settings.liquid` (per-block spacing mechanism).
- **Default-open removed:** the original PRD cited Figma as requiring "Product details" open by default on desktop. Re-checked directly against the actual Figma component instance during live verification — it's set to the closed variant, same as every other row. The automatic open-on-desktop JS logic was removed; replaced with an explicit, merchant-facing "Open by default" checkbox per row instead (opt-in, not automatic).
- **Desktop two-column / mobile single-column layout:** implemented via CSS only, no changes to the section's shared block-rendering loop. Blocks are bucketed by their `column` setting into two groups per render pass (rather than each block getting its own CSS Grid column assignment) — an earlier per-item approach left visual gaps when blocks assigned to different columns rendered out of column order; bucketing avoids that class of bug entirely.
- **Icon:** matches the same before/after pseudo-element construction + rotate transition already used by the theme's size-guide accordion, for visual consistency between the two.
- **Full technical writeup:** `04-engineering/patterns/main-product-block-spacing.md` (the per-block spacing mechanism and the two non-obvious bugs found building it) and `02-decisions/decisions.md` (2026-07-31 entries) in the merchant vault.

## Bugs from QA:

- Found and fixed during this ticket's own live-verification pass (not a separate QA round): accordion icon was oversized and used the wrong open/close interaction (rotated plus instead of the theme's plus/minus construction); row borders broke when the per-block spacing wrapper was introduced; a shared stylesheet included once per block was silently reverting per-block spacing overrides for earlier blocks.

## Clarifying Questions:

- Where does "Fabric" and "Size & Fit" copy come from for existing products that only have "Product Details"/"Shipping & Returns" today — merchant backfill, or omit the row when empty? *(Resolved as: omit when empty — see Dev Notes. Not confirmed with a PM as the final/permanent answer.)*
- Is "Complimentary Delivery over $350" a static string, a merchant-editable setting, or tied to an actual shipping/discount threshold that should stay in sync? *(Currently a static string, matching existing live precedent. Not confirmed as the final call.)*
