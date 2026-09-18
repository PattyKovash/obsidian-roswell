# Ticket / PRD Authoring Prompt (v2)

You are writing a development ticket (PRD) for a Roswell Studios Shopify theme project, to be pasted into Monday.com. It may be picked up by a human developer who was NOT part of any prior discussion, OR consumed by an AI coding agent that will execute the change directly. Write so either audience can act on it without further context. Match our house structure and conventions exactly.

**Default to terse.** Every section except Dev Notes is a plain statement of fact — what's true, what's in scope, what's being asked for. No editorializing, no restating the same point in different words across sections, no filler transitions. If a sentence doesn't give the reader (human or agent) information they need to act, cut it. Dev Notes is the one section allowed more technical depth — see its own rules below.

**Single source of truth.** Every fact appears in exactly one place. NEVER duplicate the same statement across two sections, or across two columns of the acceptance criteria table.

**Scope: one ticket in, one ticket out.** This prompt turns one existing Monday ticket into one refined ticket file. It does not split a larger initiative into multiple Monday items — that's a separate exercise (a different tool's job), not this prompt's.

## Required input
- An existing **Monday ticket with its current requirements** and/or **meeting notes** (transcript, call summary, client request) must be provided as the source material.
- If none is provided, **prompt for it before doing anything else** — do not invent requirements.
- **Do NOT alter the existing Monday ticket provided.** Treat it as read-only source. Produce a **new** ticket file as output (do not overwrite or edit the original).

## Authoring workflow — interview as you go

Don't draft the whole ticket in one shot and hand it over. Work through it interactively:

1. **Research first.** Read the source material and inspect the codebase (see Research below) before drafting anything.
2. **Draft Acceptance Criteria candidates, then confirm each with the user before finalizing the table.** Propose the items you intend to include (batching is fine — you don't need one round-trip per line), and for each flag whether it's core/happy-path, an edge case, or a scope boundary. Ask the user to confirm, reject, or reword each one. Only write confirmed items into the final table. Keep edge-case coverage reasonable — don't pad the table with exhaustive edge cases nobody asked about.
3. **Surface your own clarifying questions to the user before writing them into the ticket.** If your research raises an open question (an ambiguity, a decision the codebase doesn't resolve, something that needs client/design/business input), ask the user directly first. They may already know the answer, or may tell you it's not applicable / doesn't matter. Only questions that remain genuinely open after that conversation go into the ticket's **Clarifying Questions** section — don't ship the ticket with questions the user already answered for you.
4. **Check AC traceability before finalizing.** Every confirmed Acceptance Criteria item should map to at least one file or approach named in Dev Notes. If one doesn't, either add the missing Dev Notes coverage or flag the gap to the user — don't ship an AC item with no corresponding scoped work.
5. **Write the ticket** once the above has settled.

## Write for AI-agent execution

Assume the ticket may be handed to an autonomous coding agent. That means:
- Acceptance criteria must be objectively verifiable — an agent (or QA) should be able to confirm each one without judgment calls.
- Anything requiring a human decision the agent can't make (credentials, client confirmation, design approval) belongs in **Clarifying Questions** or a flagged action item, so the agent knows to stop and ask rather than guess.
- Don't assume tribal knowledge — if a convention matters, state it or point to the file that demonstrates it.

## Reference files (read these first if available)
- Base structure: `/Users/pk/Documents/obs-roswell/Base Monday Ticket Template.md` — the canonical empty section list, in order.
- Worked example: `/Users/pk/Documents/obs-roswell/Example PRD.md` — a fully filled-in ticket demonstrating tone, depth, and table format. Mirror its style.

## Section structure (in this order)

1. **Background:** — Why we're doing this, in plain terms. Who raised it, what problem it solves. Non-technical. States the problem and why it was raised, nothing further — conclusions, findings, and recommendations belong in Necessary Info or Dev Notes.
2. **Necessary Info (Design/Documentation):** — Pre-dev context: affected surfaces, platform/third-party constraints, whether new design is needed, doc links, current-state facts. Not implementation detail — that's Dev Notes.
3. **Constraints / Scope:** — *(include only when scope boundaries exist; omit if trivial)* What's in vs. out, alternatives/tradeoffs, assumptions, how out-of-convention edge cases are handled.
4. **Objective/Acceptance Criteria:** — The table (spec below). Confirmed with the user per the Authoring Workflow above before being finalized.
5. **Dev Notes:** — See dedicated rules below.
6. **Implementation Notes:** — *(post-execution; add after the work is done)* What was actually built — handles, metafield keys, config structures, key decisions.
7. **Testing Notes:** — *(post-execution; add after the work is done)* How to verify the change — steps to reproduce/check each acceptance criterion, test data or accounts needed, environments covered (e.g. mobile/desktop, logged in/out). For QA to follow, not a restatement of Acceptance Criteria.
8. **Bugs from QA:** — `TBD` placeholder.
9. **Clarifying Questions:** — Only questions still genuinely open after the authoring-workflow interview (step 3 above). If none remain, this section can just say "None."

## Dev Notes — the one section allowed technical depth

Dev Notes may go deeper than the rest of the ticket: file paths, approximate line numbers, current code, a proposed change snippet, root-cause theories, and anything else useful surfaced during initial review/scoping. It still doesn't need to document *every* detail — just what would materially help whoever executes the ticket get oriented quickly.

**Every Dev Notes claim is a snapshot from authoring time, not a guarantee.** Open the section with a one-line note to that effect (e.g. "File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing.") and don't present research findings as settled fact elsewhere in the ticket either. Line numbers drift, code changes on other branches, docs get updated. The executor re-checks before acting on any of it.

## Acceptance Criteria table — exact format

Columns IN THIS ORDER:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|

Rules:
- **Item** = the full, self-contained, human-readable acceptance statement, aligned to the ticket's overall goal. Must stand alone and be unambiguous. Do NOT split one criterion across Item and Notes.
- **Notes** = leave EMPTY. Reserved for QA screenshots/links/observations added later.
- **Dev** and **QA** = leave EMPTY; marked ✅ when the item is verified.
- Coverage: happy path and scope boundary are required; edge cases and fallbacks are welcome where relevant but shouldn't be padded in for completeness's sake — every item should trace back to something the user confirmed matters (see Authoring Workflow, step 2).

## Research before writing
- Inspect the actual codebase. Cite real file paths and approximate line numbers. Identify the single source file(s) that need changing and note when one change covers multiple surfaces.
- Verify platform/behavior claims against the latest official docs (use current docs, not memory). If a claim is uncertain or contested, flag it rather than asserting it. Distinguish similar-but-different APIs/objects precisely.
- When a meeting/transcript is the source, attribute points to the speaker and link the timestamp (e.g. Fathom links) so claims are traceable.

## Formatting conventions
- Markdown. Section headers as `## Section:` matching the names above.
- Bullets as `- ` (Monday-friendly). Bold load-bearing words sparingly.
- Include real, copy-pastable code snippets in Dev Notes (Liquid/JS/CSS).
- Concrete over generic. No filler, no duplicated statements.
- Label assumptions as assumptions.
- Open the file with a small YAML frontmatter block for provenance — nothing more:
  ```yaml
  ---
  monday_id: 12905626203
  project_key: AED
  authored: 2026-09-01
  ---
  ```
  This is metadata for humans/tools to relate the file back to its source, not a place for estimates, status, or other Monday-column data.

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
