# Ticket / PRD Authoring Prompt (v2)

You are writing a development ticket (PRD) for a Roswell Studios Shopify project. The **Edge** is the system of record: the ticket is pulled from the Edge, drafted locally, and pushed back to the Edge ticket body only with approval. Monday.com is reference only. The ticket may be picked up by a human developer who was NOT part of any prior discussion, OR consumed by an AI coding agent that will execute the change directly. Write so either audience can act on it without further context. Match our house structure and conventions exactly.

**Default to terse and non-technical.** The Edge ticket body is shared and merchant-visible. Every section is a plain statement of fact: what's true, what's in scope, what's being asked for. No editorializing, no play-by-play of every change, no restating the same point in different words across sections, no filler transitions. If a sentence doesn't give the reader (human or agent) information they need to act, cut it.

**Don't put everything in the PRD. Link to the vault.** File-level detail, code, validation results, evidence screenshots, decisions and their reasoning go in the merchant vault (`roswell-vaults/vaults/<merchant>/`), wherever the agent documented them. The PRD references each one by its roswell-vaults GitHub URL (see Vault below) instead of repeating it. (The PRD's own current-vs-expected screenshots are the exception; see Screenshots.)

**What goes in the PRD vs. the vault.** The PRD is for whoever opens the ticket to understand it and act on it (testing, scoping, reviewing, implementing), often without opening anything else. The vault is where the more detailed record is kept.

For each note, ask whether someone reading the ticket needs it to understand or act on the work. If they don't, it lives in the vault, and the PRD links to it at most. If they need the gist of something whose full detail belongs in the vault, write a version for that reader in the PRD and link to the vault for the rest. That's a rewrite for a different audience, not a copy: concise, easy to read, and only what that reader needs. AI drafts tend to over-explain here; when in doubt, cut it and let the link carry the detail.

The reader depends on the section. Most sections are for anyone reading the ticket, so they stay human-readable with technical detail kept to a minimum. Dev Notes is for whoever implements the work, including during an estimate or review: technical notes that would help them belong there, written for that reader, with the full detail in the vault.

Avoid duplication by default: don't paste the same content into both places, don't restate the same point across PRD sections, and don't repeat an AC item in its Notes column. Every repeat makes the ticket harder to read and gives one more place to keep up to date.

**Scope: one ticket in, one ticket out.** This prompt turns one existing Edge ticket into one refined PRD. It does not split a larger initiative into multiple tickets. That's a separate exercise, not this prompt's job.

## Required input
- An existing **Edge ticket** (e.g. `HYPER-166`), pulled with `mcp__edge__get_ticket`, and/or **meeting notes** (transcript, call summary, client request) as source material. Check the ticket's comments and activity log too; the ask often lives there.
- If none is provided, **prompt for it before doing anything else**. Do not invent requirements.
- **The original ticket description is source material, not a header the PRD sits under.** Carry every part that's still relevant (priority, problem, findings, fix steps, code snippets) into the right PRD section. The PRD then replaces the original description, so nothing appears twice. Before pushing, show the user which part of the original went where.
- **Do NOT write to the Edge ticket body until the user approves.** Draft locally first (see Output).

## Authoring workflow: interview as you go

Don't draft the whole ticket in one shot and hand it over. Work through it interactively:

1. **Research first.** Read the source material and inspect the codebase (see Research below) before drafting anything.
2. **Draft Acceptance Criteria candidates, then confirm each with the user before finalizing the table.** Propose the items you intend to include (batching is fine), and for each flag whether it's core/happy-path, an edge case, or a scope boundary. Ask the user to confirm, reject, or reword each one. Only write confirmed items into the final table. Keep edge-case coverage reasonable.
3. **Surface your own clarifying questions to the user before writing them into the ticket.** They may already know the answer, or may tell you it's not applicable. Only questions that remain genuinely open go into **Clarifying Questions**.
4. **Check AC traceability before finalizing.** Every confirmed AC item should map to work named in Dev Notes or the linked vault notes. If one doesn't, add the coverage or flag the gap.
5. **Write the draft** once the above has settled, and show it right after the research. Don't go deep into reproduction or fixes before the user has seen a draft.
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
  - `/Users/pk/Documents/obs-roswell/Example PRD.md`: a filled-in pre-execution ticket showing tone, AC table format, Fathom attribution, and short Dev Notes.
  - `/Users/pk/Documents/obs-roswell/HYPER/PRDs/HYPER-166-schema-review-and-merge.md`: the current Edge workflow end to end. Short PRD, technical detail linked to the vault, a section listing changes made to another developer's code, and the Edge link workaround.

## Section structure (in this order)

1. **Background:** Why we're doing this, in plain terms. Who raised it, what problem it solves. States the problem and why it was raised, nothing further.
   - Quote any external response in the original ticket (a vendor's or app's diagnosis, a support reply) word for word, attributed. If our assessment differs, add one sub-bullet pointing to where it lives (e.g. "In our review, their suggested fix doesn't address the issue consistently. See Dev Notes (Okendo).").
   - Reproduction details and root cause aren't Background. Usually a short version goes in Dev Notes, with the full detail in the vault (see What goes in the PRD vs. the vault).
2. **Necessary Info (Design/Documentation):** Context that helps devs and others during scoping and implementation: source, why, where it shows up, new settings, tool/doc links, whether new design is needed. **Not technical.** No file-level detail.
   - Short, human-readable and easy to read. No superfluous information, minimal technical detail. Technical detail goes in Dev Notes, and only when it's necessary or helpful for implementing the ticket.
   - When the investigation finds behaviors beyond the original report, say so explicitly ("The original report flagged X. Investigating it found related behaviors with the same cause, which this ticket also addresses:") and list them briefly.
3. **Constraints / Scope:** *(include only when scope boundaries exist)* The goal and what's out of scope, assumptions, how edge cases are handled. Don't repeat what Necessary Info already makes clear: list an item here only when it isn't already explicit what's in or out of scope. Not the approach (that's Implementation Notes). No "In:" line that restates the goal, and no vague words like "unchanged" that a reader can't act on.
4. **Objective/Acceptance Criteria:** The table (spec below), confirmed with the user per the Authoring Workflow.
5. **Testing Notes:** *(post-execution; `TBD` until then)* Only what helps someone test: steps, test data/accounts, environments, gotchas and considerations. For QA to follow, not a restatement of the AC and not dev findings.
   - Leave out what testers won't run into (e.g. theme-editor-only behavior) or don't need (e.g. how the preview bar works).
   - A "Normal, not a bug" note only when it's verified on the build QA will test.
   - Phrase notes so a backup or fallback can't hide a failure (e.g. "Enter always lands on results because of a backup, so check the dropdown separately"), and so expected behavior isn't reported as a bug.
6. **Implementation Notes:** *(post-execution; `TBD` until then)* What changed, as short readable bullets in plain language: the approach, new settings (exact labels and defaults), behavior changes, go-live doc link, and key decisions with a link to their vault entry. Write it for whoever reads the ticket; the rest lives in the vault (see What goes in the PRD vs. the vault). End with one link to the vault notes for files, commits and test results. See the example under Dev Notes.
7. **Dev Notes:** See dedicated rules below.
8. **Changes Made to Original Code Updates by `<Author>`:** *(only when the ticket reviews/merges someone else's code)* Short, easy-to-read bullets for the original author: what we changed from their code and why, with the file in parentheses. One line of intro ("Everything else was merged as they wrote it."). Only list actual changes to *their* code; a bug we introduced and fixed ourselves doesn't belong here.
9. **Bugs from QA:** `TBD` placeholder.
10. **Clarifying Questions:** Only questions still genuinely open after the interview. If none, "None."

## Dev Notes

Short. Not a play-by-play. Written for whoever implements the work, including during an estimate or review: technical notes that help them are fine here, and everything else lives in the vault (see What goes in the PRD vs. the vault).

- **First bullet, always:** the Claude Code session to resume, as `claude --resume SESSION_ID` (the session ID is the current transcript's filename under `~/.claude/projects/<project>/`).
- **Root cause:** one or two plain sentences.
- **Approach:** when there were real alternatives, what was tried, why it wasn't used, and why this one was chosen (e.g. "kept the change away from PLPs right before BFCM"). Known risks of the chosen approach go as a sub-bullet (e.g. it relies on an undocumented third-party function, and what happens if that changes).
- **Open:** items still outstanding (e.g. post-deploy checks).
- Last bullet: "For full dev notes (…), see the vault notes" with the link.

- Short plain-language notes on anything non-obvious a developer should know, one topic per bullet, led by a short label (`Swym:`). Say *why* something works the way it does, not how the code is written.

Full technical detail (file paths, line numbers, code, root-cause analysis) lives in the vault notes and is referenced by link. Dev Notes carries only what the implementer needs from it, kept concise. When there are no vault notes yet (pre-execution ticket), a short "File paths and code reflect a review at authoring time; confirm before implementing" note plus the key file paths is fine.

- **No hours or estimates** in Dev Notes or anywhere in the PRD. Estimates live on the Edge estimate fields.
- **Code from the original ticket stays.** If the original description had a code snippet that's still relevant, keep it in Dev Notes as a code block under the bullet it belongs to.

### Example: Dev Notes and Implementation Notes at the right level

```markdown
## Dev Notes:

-  claude --resume 497dd857-8793-4464-9ee8-ba8fe1f81e0d

-  Account icon: a new icon in the theme's icon snippet, with an optional "!" badge. The badge colors are CSS variables, so a button restyle doesn't change them.

-  Swym: Swym only opens its wishlist from links to #swym-wishlist, so the header heart and the drawer "Wishlist" item are both links. The theme can't tell whether Swym's app embed is on, which is why "RS Enable Swym Wishlist" is a manual setting.

## Implementation Notes:

-  Go Live documentation here: https://docs.google.com/document/d/...

-  Header section settings: "Show account icon on mobile" (on by default) and "Mobile wishlist" (Header, Drawer or Hidden; Header by default).

-  Theme settings → Wishlist: "RS Enable Swym Wishlist" (on by default) removes the theme's wishlist heart, drawer link and PDP wishlist slot when off, and hides Swym's own PDP button if the app embed is still on.

-  The drawer's "Account" menu link now goes to the same place as the header account icon.

-  Files, commits and dev test results: [vault notes](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/<merchant>/04-engineering/planning/<ticket-slug>/README.md).
```

What makes it work:
- **Dev Notes:** the resume line, then only the non-obvious *why*s, in plain words.
- **Implementation Notes:** what changed from the merchant's and QA's point of view: settings with their exact labels and defaults, behavior changes, and a link to the go-live doc if there is one.
- **Last bullet:** everything else (files, commits, test results) is one link to the vault notes.

## Screenshots

Insert screenshots where they help readers understand the context, in the section where they're relevant. Other evidence screenshots stay in the vault (see What goes in the PRD vs. the vault).
- **For the Edge:** upload each one as an attachment to the ticket (an Edge write: ask first) and swap the returned URLs into the PRD before pushing.

## Vault (technical documentation)

Follow `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md` for everything the vault holds: what goes where, the planning-notes folder and frontmatter. Follow `/Users/pk/Documents/obs-roswell/vault-pr-rules.md` for vault mechanics: finding the right vault, branching, Edge-generated paths, and the checks to run before pushing. Read both before writing to the vault.

PRD-specific:
- **The Edge owns ticket content.** Scope, status, AC results and comments go on the Edge ticket, never into a vault file.
- **PRD links to the vault use the GitHub `main` URL**, not local paths or feature branches: `https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/<merchant>/<path>`. The vault branch must reach `main` for these to resolve.

## Acceptance Criteria table — exact format

Columns IN THIS ORDER:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|

Rules:
- **Item** = the full, self-contained, human-readable acceptance statement. Must stand alone and be unambiguous. Do NOT split one criterion across Item and Notes.
  - Lead with a short label naming the exact action under test (e.g. **Enter (desktop):**, **Dropdown (before pressing Enter):**). One behavior per item; don't mix two actions in one criterion.
- **Notes** = short, helpful context for that item, such as a relevant URL or a screenshot. Keep it concise. When there's a lot to say, put it in Testing Notes, Implementation Notes or wherever it fits best, and reference that section here (e.g. "See Testing Notes"). QA also adds their screenshots, links and observations here.
- **Removing an item from the table** (at the user's request) changes what the ticket formally accepts. It doesn't mean dev stops checking that scenario: keep testing it during dev and record the results in the vault notes, unless the user says to stop.
- **Dev** = ✅ once the item is verified during dev (not before). After any code change, re-verify before keeping a ✅; results from an earlier version don't count. **QA** = leave empty for QA.
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
  -  Test results and screenshots: [vault notes](https://github.com/.../README.md).
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
- **Always get the user's approval.** Approval for one push doesn't carry to later ones.
- **Review the whole PRD first.** Check every statement against what was actually verified, and remove anything repeated, outdated or superfluous; point to the vault instead where that's enough.
- **Screenshots first:** upload them and swap in their Edge URLs (see Screenshots) so no local image paths go up.
- **Always pull the ticket first.** Right before every push, `mcp__edge__get_ticket` and compare it with what you last read, to catch changes made directly in the Edge by the user or anyone else (MP, merchant, another engineer). Check the `version`, description, brief and comments. If anything changed, show the user and merge it into the draft before pushing, so their edits aren't overwritten.
- **First push (the PRD replaces the original description):** one `mcp__edge__update_ticket` call with the whole PRD body and `description_mode: "replace"`. One write, so no section is ever missing in between. Only after the user has seen where each part of the original went.
- **Later edits:** `description_section {heading, text}`, which replaces one `## heading` section in place. One section per call; the version increments each time, so re-read it between calls. Never remove sections or delete them to reorder.
- After pushing, read the ticket back to confirm, and update `edge_version`/`status` in the draft's frontmatter.
- Keep the local draft and the Edge body in sync. If the user edits one, bring the other in line (with approval for Edge writes). After the user edits the Edge ticket directly, pull it and write the Edge description into the local draft as-is (fetch it rather than retyping it), then update `edge_version`/`status`.
