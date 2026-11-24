# Ticket / PRD Authoring Prompt (v2)

You're turning one Edge ticket into one refined PRD for a Roswell Studios Shopify project (no splitting initiatives into several tickets). The Edge is the system of record; draft locally and push back only per `/Users/pk/Documents/obs-roswell/Global/prd-edge-push.md`. Monday is reference only. Write so a human developer with no prior context, or an AI agent, can act on it, in the house structure below.

**Terse and non-technical.** The ticket is merchant-visible. Plain statements of fact; no editorializing, play-by-play, filler, or restating a point in another section. Cut any sentence the reader doesn't need to act.

**What goes in the PRD vs. the vault.** The PRD is for whoever opens the ticket to understand it and act on it (testing, scoping, reviewing, implementing), often without opening anything else. The vault holds the more detailed record: file-level detail, code, results, evidence, decisions and their reasoning. For each note, ask whether the ticket reader needs it to understand or act on the work. If not, it lives in the vault and the PRD links to it at most. If they need the gist, write a version for that reader and link to the vault for the rest: a rewrite, not a copy, concise and only what they need. AI drafts tend to over-explain here; when in doubt, cut it and let the link carry the detail.

The reader depends on the section: most sections are for anyone reading the ticket and stay light on technical detail; Dev Notes is for whoever implements the work (including during an estimate or review), so technical notes that help them belong there.

Example of the right level: `/Users/pk/Documents/obs-roswell/Example PRD (short).md`. Empty structure: `/Users/pk/Documents/obs-roswell/Base Monday Ticket Template.md`.

## Input
- An Edge ticket (`get_ticket`) and/or meeting notes. Read the ticket's comments and activity log; the ask often lives there. If there's no source, ask first; don't invent requirements.
- The original description is source material, not a header. Carry every still-relevant part (priority, problem, findings, fix steps, code snippets) into its section; the PRD replaces it. Show the user where each part went before the first push.
- Meeting sources: attribute points to the speaker and link the timestamp.

## Research
- Inspect the code; identify the files to change and note when one change covers several surfaces. Read from `origin/main`, not a stale checkout.
- Trace every surface that renders the behavior (callers, duplicate copies of the logic); a missed surface is the most common miss.
- Read a file's logic all the way through before saying it does or doesn't support something.
- List the existing settings that control it (labels, defaults, `visible_if`) and any ordering rules.
- Check the live site (browser checks via the `theme-test` skill); verify platform claims against official docs.

## Workflow
1. Research, then show the draft early, before going deep into reproduction or fixes. Work interactively, not in one shot.
2. AC candidates: map the brief's criteria in, tag each core, edge case or scope boundary, and confirm each with the user. Only confirmed items go in the table.
3. Ask your clarifying questions before writing them in; only questions still open go in the ticket.
4. Every AC maps to work in Dev Notes or the vault notes; flag gaps.
5. Re-read the draft before every edit; the user edits it directly. Keep their changes, and update pointers when they rename a section.
6. Out-of-scope findings go on the cleanup list in the vault notes, not into scope.
7. Anything needing a human decision (credentials, client sign-off, design) goes in Clarifying Questions. Don't rely on tribal knowledge: state a convention or link to it.

## Sections (in this order)
1. **Background:** why, who raised it, the problem. Quote external responses (vendor, app, support) word for word, attributed; if our assessment differs, one sub-bullet pointing to where it lives. Reproduction and root cause go in Dev Notes.
2. **Necessary Info (Design/Documentation):** context for scoping and implementing: source, where it shows up, settings, links, whether design is needed. Not technical. If the investigation found more than the report, say so and list it briefly.
3. **Constraints / Scope:** only when boundaries aren't already clear: the goal, what's out, assumptions, how edge cases are handled. No approach, no "In:" line, no vague words like "unchanged".
4. **Objective/Acceptance Criteria:** the table below.
5. **Testing Notes** (`TBD` until built): only what helps someone test (steps, test data, environments, gotchas). Not AC restatements or dev findings, nothing testers won't run into. "Normal, not a bug" only when verified on the build QA tests. Phrase notes so a backup can't hide a failure.
6. **Implementation Notes** (`TBD` until built): what changed, in plain language: the approach, settings with exact labels and defaults, behavior changes, go-live doc, key decisions with a vault link. End with a link to the vault notes.
7. **Dev Notes:** short, for the implementer:
   - First bullet: `claude --resume SESSION_ID` (the current transcript's filename under `~/.claude/projects/<project>/`).
   - Root cause in a sentence or two; the approach and the alternatives tried, with known risks as a sub-bullet; open items; short labeled notes on non-obvious *why*s.
   - Before implementation: key file paths with "confirm before implementing". Code snippets from the original ticket stay, as code blocks.
   - Last bullet: "For full dev notes, see the vault notes" with the link.
8. **Changes Made to Original Code Updates by `<Author>`** (only when merging someone else's code): one intro line ("Everything else was merged as they wrote it."), then each change to *their* code and why, with the file (not bugs we introduced and fixed ourselves).
9. **Bugs from QA:** `TBD`.
10. **Clarifying Questions:** only open ones, or "None."

No hours or estimates anywhere in the PRD. No other merchants or clients in it. Screenshots go where they help the reader; other evidence stays in the vault.

## Acceptance Criteria table
Columns: `| # | Item | Notes | Dev | QA |`
- **Item:** self-contained and verifiable without judgment calls, led by a label for the exact action under test (e.g. **Enter (desktop):**). One behavior per item; don't split a criterion across Item and Notes.
- **Notes:** short context (a URL, a screenshot). If there's a lot, put it in Testing or Implementation Notes and reference that section. QA adds their observations here.
- **Dev:** ✅ only when verified on the current code; re-verify after any code change. **QA:** left for QA.
- Coverage: happy path and scope boundary; edge cases only where the user confirmed they matter.
- Removing an item at the user's request doesn't stop dev testing that scenario; record results in the vault notes unless told to stop.

## Formatting and file
- Markdown, headings as `## Section:`, bullets `- `, bold sparingly. Label assumptions as assumptions.
- Vault links use the GitHub `main` URL (`https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/<merchant>/<path>`); the vault branch must reach `main` for them to resolve. Edge workaround: add the full URL as an indented sub-bullet under the link.
- File: `/Users/pk/Documents/obs-roswell/<PROJECT_KEY>/PRDs/<EDGE_ID>-short-description.md` (use the project's `PRD` folder if that's what it has).
- Frontmatter: `edge_id`, `edge_version`, `monday_id` (only if there is one), `project_key`, `authored`, `status`. Update `edge_version` and `status` after each push.
- Vault notes follow `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md` and `/Users/pk/Documents/obs-roswell/vault-pr-rules.md`.

## Before showing or pushing the PRD
- Is anything repeated: across sections, between Item and Notes, or copied from the vault?
- Would the reader act differently without each note? If not, cut it or link.
- Do Background, Necessary Info and Scope stay non-technical, and does Scope only say what isn't already clear?
- Does each AC test one labeled behavior, and is every Dev ✅ verified on the current code?
- Do Testing Notes only help a tester?
- Is every statement verified, or phrased as a possibility?
