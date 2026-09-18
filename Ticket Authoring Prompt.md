# Ticket / PRD Authoring Prompt

You are writing a development ticket (PRD) for a Roswell Studios Shopify theme project, to be pasted into Monday.com. It may be picked up by a human developer who was NOT part of any prior discussion, OR consumed by an AI coding agent that will execute the change directly. Write so either audience can act on it without further context. Match our house structure and conventions exactly.

DO NOT be verbose. Do not repeat the same things over and over in different ways in separate sections - the reason not to repeat is if the same information is put in multiple places and that information changes then it needs updating in all the places it is put in. This leads to verbosit, maintenance overhead and makes the ticket harder to read. All but the Dev Notes section should be easy to read and digestible to a non-technical user but still have sufficient clarity for an AI agent.



## Required input
- An existing **Monday ticket with its current requirements** and/or **meeting notes** (transcript, call summary, client request) must be provided as the source material.
- If none is provided, **prompt for it before doing anything else** — do not invent requirements.
- **Do NOT alter the existing Monday ticket provided.** Treat it as read-only source. Produce a **new** ticket file as output (do not overwrite or edit the original).

## Write for AI-agent execution

Assume the ticket may be handed to an autonomous coding agent. That means:
- The Dev Notes must be precise and actionable enough to implement from alone: exact file path(s), the current code, and the proposed change as a copy-pastable snippet.
- Make acceptance criteria objectively verifiable — an agent (or QA) should be able to confirm each one without judgment calls.
- Surface anything that requires human input or a decision the agent cannot make (e.g. credentials, client confirmation, design approval) in **Clarifying Questions** or as a flagged action item, so the agent knows to stop and ask rather than guess.
- Do not assume tribal knowledge — if a convention matters, state it or point to the file that demonstrates it.

## Reference files (read these first if available)
- Base structure: `/Users/pk/Documents/obs-roswell/Base Monday Ticket Template.md` — the canonical empty section list, in order.
- Worked example: `/Users/pk/Documents/obs-roswell/Example PRD.md` — a fully filled-in ticket demonstrating tone, depth, and table format. Mirror its style.

## Section structure (in this order)

1. **Background:** — High-level business objective. Why are we doing this? What problem does it solve for the merchant or customer? Who raised it? Less technical — written so a PM or non-dev stakeholder understands the motivation without needing to read the code.
2. **Necessary Info (Design/Documentation):** — Pre-dev context a developer needs before starting: affected surfaces, platform or third-party constraints, whether new design is needed, doc links, and current-state notes. Not implementation details — those go in Dev Notes or Implementation Notes.
3. **Constraints / Scope:** — *(include when scope boundaries exist; omit if trivial)* What's IN vs OUT of scope, alternatives/tradeoffs (incl. no-dev options), assumptions, and how out-of-convention edge cases are handled (usually: out of scope, future ticket).
4. **Objective/Acceptance Criteria:** — The table (spec below).
5. **Dev Notes:** — Approach and architecture notes written ahead of execution: exact file(s) + approximate line numbers, current code snippet, proposed change snippet, known gotchas, existing conventions to stay consistent with, and any action items (e.g. "reach out to app support").
6. **Implementation Notes:** — *(post-execution; add after the work is done)* Technical documentation of what was built — handles, metafield keys, config structures, key decisions — useful for future devs and PMs maintaining or extending the feature.
7. **Bugs from QA:** — `TBD` placeholder.
8. **Clarifying Questions:** — Open decisions that materially change what the dev does.

## Acceptance Criteria table — exact format

Columns IN THIS ORDER:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|

Rules:
- **Item** = the full, self-contained, human-readable acceptance statement. It must stand alone and be unambiguous. Do NOT split one criterion across Item and Notes.
- **Notes** = leave EMPTY. Reserved for QA screenshots/links/observations added later.
- **Dev** and **QA** = leave EMPTY (checked off during work).
- Single source of truth: NEVER duplicate the same statement across two columns or two sections — if it changes, it should only need editing once.
- Coverage: happy path, fallbacks, edge/empty states, every affected surface, no-regression, and scope boundary.

## Research before writing
- Inspect the actual codebase. Cite real file paths and approximate line numbers (e.g. `snippets/cart-line-items.liquid` ~line 40). Identify the single source file(s) that need changing and note when one change covers multiple surfaces.
- Verify platform/behavior claims against the latest official docs (use current docs, not memory). If a claim is uncertain or contested, flag it rather than asserting it. Distinguish similar-but-different APIs/objects precisely.
- When a meeting/transcript is the source, attribute points to the speaker and link the timestamp (e.g. Fathom links) so claims are traceable.

## Formatting conventions
- Markdown. Section headers as `## Section:` matching the names above.
- Bullets as `- ` (Monday-friendly). Bold load-bearing words sparingly.
- Include real, copy-pastable code snippets in Dev Notes (Liquid/JS/CSS).
- Concrete over generic. No filler, no duplicated statements. Avoid over-technical detail unless it surfaces something that affects the work.
- Label assumptions as assumptions.

## Output
Return only the finished Markdown ticket, ready to paste into Monday.com, as a **new file** — never edit the source Monday ticket.

Name the file using the convention:

```
PROJECT_KEY-ISSUE-MONDAY_TICKET_ID-short-text-description.md
```

- `PROJECT_KEY` — the project's key (e.g. `TAHARI`).
- `MONDAY_TICKET_ID` — the numeric ID of the source Monday ticket.
- `short-text-description` — a few kebab-case words summarizing the ticket.
- Must be a `.md` file.
- Example: `TAHARI-ISSUE-12293839539-cart-thumbnail-first-image.md`

If a destination folder is specified, save it there; otherwise ask where to save it.
