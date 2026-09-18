# Agent Prompt — Migrate a Repo's Docs to the Merchant-Vault Protocol

> Copy the prompt below (everything after the line) and hand it to a fresh agent session in the target code repo. Fill in the bracketed placeholders first. This file itself is not a protocol doc — it's a reusable prompt template.

**Do not reuse** `documentation protocol session.md` or `claude-code-org-documentation-protocol.md` in this same folder as a reference — both describe an earlier, superseded per-repo `.claude/context/{area}.md` scheme that does not match the real framework. Use `Documentation Protocol.md` (also in this folder) as the corrected spec instead.

---

## The Prompt

You are migrating this repo's documentation to match Roswell's actual merchant-vault protocol. Read `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md` in full before doing anything else — it is the current, verified spec (reconciled 2026-07-07 against `roswell-operating-framework`, `roswell-agency`, and `roswell-vaults`). Do not invent your own scheme.

**Merchant:** [merchant-slug, e.g. `elie-tahari`]
**Code repo:** [org/repo, e.g. `roswell-studios/Elie_Tahari_TAHARI_2026`]
**Vault location:** `roswell-studios/roswell-vaults`, local clone path `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/[merchant-slug]/` (this is the expected path on the current machine; confirm it with the user if the clone lives elsewhere)

### Step 1 — Audit before touching anything

1. Read this repo's current `CLAUDE.md` in full.
2. Find every existing context/documentation artifact for this project: `.claude/context/*`, ad hoc Obsidian notes, README sections, code comments claiming to be canonical, anything else. List them.
3. For each one, classify it:
   - **Team protocol or architecture knowledge** → migrate per Step 2.
   - **Personal workflow** (an individual engineer's own habits, folder layout, or preferences) → leave it out of `CLAUDE.md` entirely. `CLAUDE.md` is team standard only.
   - **Ticket-level working material** (PRDs, QA scenarios, one-off investigation notes) → does not belong in the vault or in `CLAUDE.md`. Leave it wherever the team already keeps ticket material; only reference it from `CLAUDE.md` if that reference itself is a team convention, not a personal path.
4. **First confirm the vault directory itself exists** — `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/[merchant-slug]/` (check the actual clone on disk and its git history, not just the expected path). If it does not exist, **stop and report that instead of proceeding** — don't write vault-first framing (a callout claiming the vault "wins on conflict," a path table) for a merchant that hasn't been onboarded to the vault. Onboarding (`cp -r vaults/_template vaults/[merchant-slug]` in `roswell-vaults`) is a separate task, not part of this one unless asked.

Once confirmed to exist, open the vault and check it for staleness before treating anything in it as current:
   - `last_updated` frontmatter on `01-mcd/mcd.md` and `01-mcd/do-not-touch.md` — flag anything over ~60 days old.
   - `02-decisions/decisions.md` — check the most recent entry date.
   - `03-pm/sprints/` — is there a sprint file newer than what any `CLAUDE.md` currently references? Do NOT assume the newest file you see is "current" — ask the user if unsure.
   - Report staleness findings to the user before proceeding. Do not silently treat stale vault content as ground truth, and do not edit the vault to "fix" staleness yourself without being asked.

### Step 2 — Restructure `CLAUDE.md` to the vault-first model

**Writing discipline for everything you write in this step and Step 3** (per `Documentation Protocol.md`'s "Writing Discipline" section): not verbose — only what a future session needs to act correctly; no play-by-play of this migration session itself; no editorializing about what was wrong with the prior version; no claim you haven't personally verified against the actual files (don't write "this is enforced" or "this is standard" unless you checked); no inference presented as settled fact. If you didn't verify something in Step 1, don't write a line asserting it.

The **canonical structure** is `~/WorkSpace/The_Intelligence_Layer/roswell-agency/patterns/merchant-repo-template/CLAUDE.md`, and the **merge protocol** (what to preserve vs. add vs. overwrite when a `CLAUDE.md` already exists) is `~/WorkSpace/The_Intelligence_Layer/roswell-agency/methodology/merging-existing-claude-md.md` — both are authoritative; read them first. `/Users/pk/Documents/obs-roswell/Global/merchant-repo-claude-md-reference.md` is a generic, merchant-agnostic worked example of the same structure — use it to see the shape end-to-end, filling in its `{bracketed}` placeholders with this merchant's real content, and defer to the agency template if they ever disagree. At minimum, `CLAUDE.md` should end up with:

1. A short callout near the top: read the vault first, this file is the technical-only subset, vault wins on conflict.
2. A **"Where Vault Context Lives"** table: canon → path, covering **only rows for paths you confirmed actually exist and are populated for this merchant** (from Step 1.4) — MCD (`01-mcd/mcd.md`), brand voice (`01-mcd/brand-voice.md`), audience (`01-mcd/audience.md`), do-not-touch list (`01-mcd/do-not-touch.md`), decisions log (`02-decisions/decisions.md`), active sprint location, active issues (`03-pm/issues/`), repo registry (`04-engineering/repos.md`), and vault-side engineer memory (`04-engineering/CLAUDE.md` — this exists in most real merchant vaults checked, but confirm it for this one rather than assuming). Follow the agency template's referencing convention: express these as `../vault/...` relative paths (the vault is conventionally symlinked as a `vault/` sibling of the code repo), not absolute `~/WorkSpace/...` paths. For the active sprint, point at the *directory* (`03-pm/sprints/`) rather than hardcoding a specific sprint filename — that goes stale within weeks and nothing will catch it. (Note: the agency template currently uses a `{current-iso-week}.md` placeholder here; prefer the directory pointer unless the user says otherwise.)
3. A **"When Making Changes"** numbered workflow: read the vault first, check active sprint/issue state, reference the issue ID, log meaningful decisions, honor do-not-touch, record the *why* in-repo and mirror the corresponding record to the vault (don't restate the full reasoning in both places). **The do-not-touch item needs an escape valve, not a blanket rule:** if there's a legitimate reason to touch something on the do-not-touch list, the agent should stop, explain the reasoning, and get the engineer's explicit confirmation before proceeding or continuing to honor the constraint — never proceed unilaterally either way. **Do not label vault documents "merchant-facing"** — that term describes The Edge (the web app), never vault markdown; this mislabeling has already been copy-pasted into at least two merchant repos' `CLAUDE.md` files. On the issue-reference convention: the `require-issue-reference.yml` CI check exists in the agency template and has been adopted in the `HYPER-*` repos, but it is **not** agency-wide — confirm whether *this* repo's `.github/workflows/` actually has it before claiming it's enforced. If it doesn't, document the reference convention as guidance only and say so explicitly; don't add the CI workflow yourself unless asked. Legacy branch-name patterns (e.g. `HYPER-<monday_pulse_id>`) may remain on branches where auto-PR machinery uses them, but the PR itself should still carry the vault reference.
4. A **canonical-vs-mirrored table**: what's authoritative in the code repo vs. what's authoritative in the vault.
5. Existing "Gotchas & Non-Obvious Decisions" (or equivalent) entries — keep them, but see Step 3 for what to do with ones that duplicate vault content.

### Step 3 — Eliminate duplication (this is the part people get wrong)

For any constraint/architecture explanation you find in more than one place (code comment, `CLAUDE.md`, an old Obsidian note, a vault pattern doc):

- Pick **one** place to hold the full explanation. Default to a new or existing file under `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/[merchant-slug]/04-engineering/patterns/[topic].md` for anything that's a "reusable pattern or deeper mechanism worth its own writeup" (per the Documentation Protocol). Code comments should stay short and point at the vault doc, not restate it.
- Everywhere else that references the same thing, replace the full explanation with a one-line pointer. Example of what NOT to do: writing the same "how this mechanism works" paragraph in `CLAUDE.md`, in a code comment, AND in a vault pattern doc. Example of the right shape: code comment says "DO NOT X, see vault docs `04-engineering/patterns/[topic].md`"; `CLAUDE.md` Gotcha says "see vault doc `04-engineering/patterns/[topic].md`, don't re-derive here"; the vault doc has the actual full writeup once.
- `01-mcd/do-not-touch.md` bullets should always be short (one bullet, a reason, a pointer to the fuller doc if one exists) — never a full mechanism explanation.
- If you find an old standalone doc (Obsidian or elsewhere) that's now fully superseded by a vault doc, tell the user and ask before deleting it — don't delete unilaterally.

### Step 4 — Report back

Give the user:
- What you found (the audit from Step 1), including any staleness flags from the vault.
- What you moved where, and why (one line each).
- Anything you deliberately left alone and why (e.g. personal workflow notes, ticket-level PRDs).
- Any duplication you eliminated and which file is now the single source of truth for it.

Do not commit or push anything without being asked. Show the diff and let the user decide.

---

## Worked Example (for your own reference before writing the prompt above)

Elie Tahari (`Elie_Tahari_TAHARI_2026`, vault `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/elie-tahari/`) went through this exact process on 2026-07-07:

- Found a PDP gallery cropping bug's context split across three places: a code comment, `CLAUDE.md` Gotchas #7/#8 (full mechanism explained twice), and an Obsidian doc (`obs-roswell/TAHARI/Docs/...md`) that predated the vault migration.
- Created one canonical vault doc: `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/elie-tahari/04-engineering/patterns/pdp-gallery-aspect-ratio.md` (full mechanism, do-not-touch reasoning, decisions/tradeoffs).
- Added a short do-not-touch bullet to `01-mcd/do-not-touch.md` and a dated entry to `02-decisions/decisions.md`, both pointing back to the pattern doc rather than repeating it.
- Collapsed `CLAUDE.md` Gotchas #7+#8 into one line: "canonical in the vault, don't re-derive or re-document here."
- Updated the code comment to point at the vault doc instead of the old Obsidian file.
- Deleted the now-orphaned Obsidian doc after confirming with the user.
- Restructured `CLAUDE.md` overall to match `HYPER`'s structure (vault-context table, vault-discipline workflow, canonical-vs-mirrored table), explicitly avoiding hardcoding a sprint filename after finding that exact staleness trap already live in the Hyperlite vault's `CLAUDE.md` (pointed at a sprint file ~9 weeks stale).
