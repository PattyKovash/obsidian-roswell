# Ticket / PRD Authoring Prompt (v2)

You are writing a development ticket (PRD) for a Roswell Studios Shopify project. The **Edge** is the system of record: the ticket is pulled from the Edge, drafted locally, and pushed back to the Edge ticket body only with approval. Monday.com is reference only. The ticket may be picked up by a human developer who was NOT part of any prior discussion, OR consumed by an AI coding agent that will execute the change directly. Write so either audience can act on it without further context. Match our house structure and conventions exactly.

**Default to terse and non-technical.** The Edge ticket body is shared and merchant-visible. Every section is a plain statement of fact: what's true, what's in scope, what's being asked for. No editorializing, no play-by-play of every change, no restating the same point in different words across sections, no filler transitions. If a sentence doesn't give the reader (human or agent) information they need to act, cut it.

**Technical detail lives in the merchant vault, not the PRD.** File-level detail, code, validation results, screenshots, decisions and their reasoning go in the merchant vault (`roswell-vaults/vaults/<merchant>/`). The PRD links to them. See Vault below.

**Single source of truth.** Every fact appears in exactly one place. NEVER duplicate the same statement across two sections, or across two columns of the acceptance criteria table. If the vault already documents it, link instead of repeating.

**Scope: one ticket in, one ticket out.** This prompt turns one existing Edge ticket into one refined PRD. It does not split a larger initiative into multiple tickets. That's a separate exercise, not this prompt's job.

## Required input
- An existing **Edge ticket** (e.g. `HYPER-166`), pulled with `mcp__edge__get_ticket`, and/or **meeting notes** (transcript, call summary, client request) as source material. Check the ticket's comments and activity log too; the ask often lives there.
- If none is provided, **prompt for it before doing anything else**. Do not invent requirements.
- **Do NOT write to the Edge ticket body until the user approves.** Draft locally first (see Output).

## Authoring workflow: interview as you go

Don't draft the whole ticket in one shot and hand it over. Work through it interactively:

1. **Research first.** Read the source material and inspect the codebase (see Research below) before drafting anything.
2. **Draft Acceptance Criteria candidates, then confirm each with the user before finalizing the table.** Propose the items you intend to include (batching is fine), and for each flag whether it's core/happy-path, an edge case, or a scope boundary. Ask the user to confirm, reject, or reword each one. Only write confirmed items into the final table. Keep edge-case coverage reasonable.
3. **Surface your own clarifying questions to the user before writing them into the ticket.** They may already know the answer, or may tell you it's not applicable. Only questions that remain genuinely open go into **Clarifying Questions**.
4. **Check AC traceability before finalizing.** Every confirmed AC item should map to work named in Dev Notes or the linked vault notes. If one doesn't, add the coverage or flag the gap.
5. **Write the draft** once the above has settled.
6. **Keep the draft current as work progresses.** Mark the **Dev** column ✅ only when an item is verified. Fill Implementation Notes and Testing Notes after execution.
7. **Push to the Edge only on approval** (see Pushing to the Edge).

### Working on the draft with the user
- **Re-read the draft before every edit.** The user edits it directly (renamed sections, reworded bullets). Keep their changes; never overwrite them with an earlier version.
- When the user renames a section, update every pointer to it (e.g. a Dev Notes line that names the section).
- Out-of-scope findings go to a running cleanup list in the vault notes, not into the ticket's scope.

## Write for AI-agent execution
- Acceptance criteria must be objectively verifiable. An agent (or QA) should be able to confirm each one without judgment calls.
- Anything requiring a human decision the agent can't make (credentials, client confirmation, design approval) belongs in **Clarifying Questions** or a flagged action item.
- Don't assume tribal knowledge. If a convention matters, state it or link to where it's documented.

## Reference files (read these first if available)
- Base structure: `/Users/pk/Documents/obs-roswell/Base Monday Ticket Template.md`, the canonical empty section list, in order.
- Worked examples:
  - `/Users/pk/Documents/obs-roswell/Example PRD.md`: a filled-in ticket showing tone, AC table format, and Fathom attribution (pre-Edge; its Dev Notes are more technical than current practice).
  - `/Users/pk/Documents/obs-roswell/HYPER/PRDs/HYPER-166-schema-review-and-merge.md`: the current Edge workflow end to end. Short PRD, technical detail linked to the vault, a section listing changes made to another developer's code, and the Edge link workaround.

## Section structure (in this order)

1. **Background:** Why we're doing this, in plain terms. Who raised it, what problem it solves. States the problem and why it was raised, nothing further.
2. **Necessary Info (Design/Documentation):** Context that helps devs and others during scoping and implementation: source, why, where it shows up, new settings, tool/doc links, whether new design is needed. **Not technical.** No file-level detail.
3. **Constraints / Scope:** *(include only when scope boundaries exist)* What's in vs. out, assumptions, how edge cases are handled.
4. **Objective/Acceptance Criteria:** The table (spec below), confirmed with the user per the Authoring Workflow.
5. **Dev Notes:** See dedicated rules below.
6. **Changes Made to Original Code Updates by `<Author>`:** *(only when the ticket reviews/merges someone else's code)* Short, easy-to-read bullets for the original author: what we changed from their code and why, with the file in parentheses. One line of intro ("Everything else was merged as they wrote it."). Only list actual changes to *their* code; a bug we introduced and fixed ourselves doesn't belong here.
7. **Implementation Notes:** *(post-execution)* Key decisions in plain language, each linking to its vault entry (decisions log, planning notes).
8. **Testing Notes:** *(post-execution)* How to verify each AC: steps, test data/accounts, environments. For QA to follow, not a restatement of the AC.
9. **Bugs from QA:** `TBD` placeholder.
10. **Clarifying Questions:** Only questions still genuinely open after the interview. If none, "None."

## Dev Notes

Short. Not a play-by-play.

- **First bullet:** the Claude Code session to resume, as `claude --resume <session-id>` (the session ID is the current transcript's filename under `~/.claude/projects/<project>/`).
- Branch name, and how commits are organized if that matters (e.g. "original changes committed as-is as a reference point, review fixes on top").
- **Open:** items still outstanding (e.g. post-deploy checks).
- A link to the vault planning notes for changes, test results, screenshots, and cleanup items.

Anything more technical (file paths, line numbers, code, root-cause analysis) goes in the vault notes. When there are no vault notes yet (pre-execution ticket), a short "File paths and code reflect a review at authoring time; confirm before implementing" note plus the key file paths is fine.

## Vault (technical documentation)

- Merchant vault: `roswell-vaults/vaults/<merchant>/`. Verify `01-mcd/mcd.md` frontmatter says the right merchant before writing; don't trust a `../vault` symlink.
- Planning notes per ticket: `04-engineering/planning/<ticket-slug>/README.md`, frontmatter `type: plan` (not `planning`; the `validate-frontmatter` CI check fails it). Contents: current state, verification table, changes made, cleanup items for others; screenshots in `evidence/`.
- **Every vault `.md` you add or change needs a frontmatter `type`.** The validator flags a missing `type`. A PRD or ticket draft kept in a planning folder uses `type: plan` too.
- Decisions worth remembering go in `02-decisions/decisions.md`. Reusable how-tos go in `04-engineering/patterns/`.
- **The Edge owns ticket content.** Scope, status, AC results and comments go on the Edge ticket via the Edge MCP, never into a vault file. `03-pm/issues/` and other generated paths are rebuilt from the Edge database and overwritten on every sync.
- **Never touch a generated path.** The list is in roswell-agency `the-edge/packages/db/generated-paths.txt`; read the current file. As of 2026-11-03 it includes `03-pm/{issues,epics,discussions,client-updates}`, `99-archive/{issues,epics}`, `01-identity/team.md`, dated `01-calls/*.md`, `02-decisions/call-decisions.md`, most of `06-financial/`, `04-engineering/{deploys,releases}.md`, and `07-audit/` logs. The `generated-paths` CI guard fails a PR if *any* commit in it touches one, and a later fix-up commit doesn't clear it.
- **Branch from `origin/main` for each piece of vault work.** Don't reuse long-lived personal branches; they pick up blocked history.
- Commit each vault change right away. Never commit `.obsidian/`. Ask before pushing or opening a PR.
- Before pushing, run the vault checks from a roswell-agency `origin/main` checkout: `pnpm validate:vault <vault> --files <paths>` and the `vault-guard/check-generated-paths.ts` script (see the roswell-vaults README/workflows for current usage).
- **PRD links to the vault use the GitHub `main` URL**, not local paths or feature branches: `https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/<merchant>/<path>`. The vault branch must reach `main` for these to resolve.

## Acceptance Criteria table — exact format

Columns IN THIS ORDER:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|

Rules:
- **Item** = the full, self-contained, human-readable acceptance statement. Must stand alone and be unambiguous. Do NOT split one criterion across Item and Notes.
- **Notes** = leave EMPTY. Reserved for QA screenshots/links/observations.
- **Dev** = ✅ once the item is verified during dev (not before). **QA** = leave empty for QA.
- Coverage: happy path and scope boundary are required; edge cases only where they trace back to something the user confirmed matters.

## Research before writing
- Inspect the actual codebase. Identify the source file(s) that need changing and note when one change covers multiple surfaces.
- Verify platform/behavior claims against current official docs, not memory. If uncertain, flag it rather than asserting it.
- **No unverified claims.** Don't write "often/usually" or process claims the user can't vouch for; phrase as possibilities.
- When a meeting/transcript is the source, attribute points to the speaker and link the timestamp (e.g. Fathom links).

## Formatting conventions
- Markdown. Section headers as `## Section:` matching the names above.
- Bullets as `- `. Bold load-bearing words sparingly.
- **No references to other merchants/clients** in the ticket body (it's merchant-visible). Comparisons with other clients' work belong in the vault, if anywhere.
- **Links (temporary Edge workaround):** the Edge viewer currently shows links as unstyled text, so they don't look clickable. Keep the markdown link, and add the full URL as an indented sub-bullet underneath:
  ```markdown
  -  Changes, test results, and cleanup items: [vault notes](https://github.com/.../README.md).
     -  https://github.com/.../README.md
  ```
  Drop the sub-bullets once the Edge renders link styling.
- Label assumptions as assumptions.
- Open the file with a small YAML frontmatter block for provenance:
  ```yaml
  ---
  edge_id: HYPER-166
  edge_version: 17
  monday_id: 13432116592
  project_key: HYPER
  authored: 2026-11-02
  status: pushed to Edge 2026-11-03 (v17)
  ---
  ```
  `monday_id` only if the ticket has one. `edge_version` and `status` track the last push; update them after each push.

## Output
Save the draft as a **new file** in `/Users/pk/Documents/obs-roswell/<PROJECT_KEY>/PRDs/`, named:

```
EDGE_ID-short-text-description.md
```

- `EDGE_ID`: the Edge ticket ID (e.g. `HYPER-166`).
- `short-text-description`: a few kebab-case words summarizing the ticket.
- Example: `HYPER-166-schema-review-and-merge.md`

## Pushing to the Edge
- **Only after the user approves.** Approval for one push doesn't carry to later ones.
- Get the current `version` with `mcp__edge__get_ticket`, then `mcp__edge__update_ticket` with `description_section {heading, text}`. This replaces or appends one `## heading` section per call; the version increments each time, so re-read it between calls.
- After pushing, read the ticket back to confirm, and update `edge_version`/`status` in the draft's frontmatter.
- Keep the local draft and the Edge body in sync. If the user edits one, bring the other in line (with approval for Edge writes).
