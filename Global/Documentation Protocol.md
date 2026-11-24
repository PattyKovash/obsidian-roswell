# Documentation Protocol

How documentation is kept across Roswell merchant engagements, for every ticket. Goal: the code repo and the merchant vault together let a fresh engineer or AI session be productive within a day, with no knowledge transfer. The reasoning behind these rules is in `/Users/pk/Documents/obs-roswell/Global/documentation-rationale.md` (not needed during tickets).

## Where things live

- **Code repo:** canonical for code, architecture reasoning, and its `CLAUDE.md`. Code comments and `CLAUDE.md` constraint sections are authoritative.
- **Merchant vault** (`roswell-vaults`, `vaults/<merchant>/`): canonical for the MCD, the decisions log and the do-not-touch list, plus a distilled mirror of code-repo knowledge for readers who won't open the code. The Edge and an ingestion pipeline (Drive, Slack, email, repo activity) also write to it through PRs the merchant's pod approves; engineers edit it directly for technical content.
- **The Edge** (https://theedge.roswell.nyc): tickets. Scope, status, PRD, AC results and comments live there, never in a vault file. Written through the Edge MCP; PRDs follow `/Users/pk/Documents/obs-roswell/Ticket Authoring Prompt v2.md`. Ticket IDs are project codes (`HYPER-166`, epics `HYPER-E02`); never add legacy `ISSUE-nnn`/`EPIC-nnn` IDs.
- Vault mechanics (finding the right vault, branching, Edge-generated paths, frontmatter, what never goes in, pre-push checks): `/Users/pk/Documents/obs-roswell/vault-pr-rules.md`.

| Artifact | Canonical in code repo | In vault |
|---|---|---|
| Source code | Yes | No |
| Architecture / constraint reasoning | Yes | Distilled |
| Repo `CLAUDE.md` | Yes | Referenced |
| MCD, decisions log | No | Yes |
| Design tokens | No | `04-engineering/mirrored/` |

## What goes where in the vault

Record what a future engineer, PM or AI session needs, closest to the kind of thing it is:

| Kind of thing | Where |
|---|---|
| A non-negotiable constraint ("don't do X") | `01-mcd/do-not-touch.md` (Brand-level / Technical / Commercial / Editorial), as a short bullet pointing to the fuller doc |
| A decision with real alternatives | `02-decisions/decisions.md`: newest first, dated, Context / Options / Decision / Reasoning / Recorded by |
| A reusable pattern or mechanism | `04-engineering/patterns/<topic>.md`, one per topic; split it if it grows too big, leaving a pointer |
| Ticket working notes, results, evidence | `04-engineering/planning/<ticket>/README.md` (`type: plan`), screenshots in `evidence/`; the PRD links here |
| Useful beyond this merchant | `roswell-agency/patterns/` (or `anti-patterns/`, `component-archetypes/`) |

Granularity is per merchant (one do-not-touch list, one decisions log, a patterns folder), not per component. If the vault has its own session-start checklist in its `CLAUDE.md`, follow it.

## Writing a note

Every entry is for a future session, not a record of this one.
- **Decision-bearing, not bookkeeping.** Keep constraints, values, thresholds and reasons, even if specific (`restrictedStates: [PR, AE, AA, AP]` *is* the decision). Leave out fixture names, test counts, line numbers and which files were touched.
- **The destination, not the play-by-play:** what was decided, discovered or worth reusing, not what was tried.
- **No editorializing** about the mistake or how the fix was found.

## The repo's `CLAUDE.md`

Read this when editing a repo's `CLAUDE.md`.
- Update it when a code-level constraint was found that AI would otherwise violate (no business reasoning; nobody outside engineering needs it), or the tech stack changed.
- Keep it short and technical; full mechanisms go in vault pattern docs.
- A do-not-touch zone is vault-first (`01-mcd/do-not-touch.md`); `CLAUDE.md` gets a short pointer at most.
- Merge, don't overwrite. Only a placeholder `CLAUDE.md` under ~30 lines is replaced outright (`roswell-agency/methodology/merging-existing-claude-md.md`).

## Code comments

Read this when writing code. Comment *why*, not what, when a pattern deviates from what AI would produce by default, a safe approach was chosen over a more obvious one, or an integration has a known failure mode:
```
// DO NOT [alternative approach].
// [Specific reason: app conflict, platform constraint, or known failure mode].
// Validated [date]. See [vault pattern doc or CLAUDE.md section] for full context.
```

## End of every ticket

Before raising a PR:

| Question | If yes |
|---|---|
| New constraint the next engineer needs? | Repo `CLAUDE.md` and/or `01-mcd/do-not-touch.md` |
| New do-not-touch zone? | `01-mcd/do-not-touch.md`, with the reason |
| Decision with real alternatives? | Dated entry in `02-decisions/decisions.md` |
| Code that deviates from documented patterns, or non-obvious decisions without comments? | Comment it, or create/update a vault pattern doc |
| Meaningful new capability? | What it is, why, how it works, key decisions: in code and in the vault. Forward-looking, not a changelog. |
| AC verified or implementation done? | Update the PRD draft; push per `/Users/pk/Documents/obs-roswell/Global/prd-edge-push.md` |
| Test results or screenshots? | Vault planning notes, linked from the PRD |
