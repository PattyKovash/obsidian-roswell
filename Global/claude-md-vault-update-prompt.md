> Copy the prompt below (everything after the line) and hand it to a fresh agent session in the target code repo. Fill in the bracketed placeholders first. This file itself is not a protocol doc — it's a reusable prompt template, refined from actually running this process on `Elie_Tahari_TAHARI_2026` on 2026-07-20 (see that repo's `CLAUDE.md` for the resulting shape).

**Do not reuse** `documentation protocol session.md` or `claude-code-org-documentation-protocol.md` in this same folder as a reference — both describe an earlier, superseded scheme. Use `Documentation Protocol.md` (also in this folder) as the corrected spec.

This prompt is a tighter variant of `vault-migration-agent-prompt.md` in this same folder — same underlying protocol, but adds a mandatory **stop-and-confirm gate** before any file is touched, a **backup step**, and explicit instructions to verify the vault's actual structure rather than assume the template's paths all exist. Prefer this version when you want a review checkpoint before the edit lands; use the other one if you want the agent to go straight to Step 4.

---

## The Prompt

You are updating this repo's `CLAUDE.md` to follow Roswell's merchant-vault documentation protocol. Read these four docs in full, in this order, before doing anything else — do not invent your own scheme:

1. `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md` — the current, verified spec.
2. `~/WorkSpace/The_Intelligence_Layer/roswell-agency/patterns/merchant-repo-template/CLAUDE.md` — the canonical structure to merge toward.
3. `~/WorkSpace/The_Intelligence_Layer/roswell-agency/methodology/merging-existing-claude-md.md` — the merge-vs-overwrite protocol.
4. `/Users/pk/Documents/obs-roswell/Global/merchant-repo-claude-md-reference.md` — a generic, merchant-agnostic worked example of the same structure. Copy the *structure* (vault callout, "Where vault context lives" table, "When making changes" workflow, canonical-vs-mirrored table), filling its `{bracketed}` placeholders with this merchant's real content.

**Merchant:** `[merchant-slug, e.g. elie-tahari]`
**Code repo:** `[org/repo, e.g. roswell-studios/Elie_Tahari_TAHARI_2026]`
**Vault path:** `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/[merchant-slug]/`

### Step 1 — Audit before touching anything

1. Read this repo's current `CLAUDE.md` in full. Count its lines.
2. Find every other existing context/documentation artifact for this project: `.claude/context/*`, ad hoc Obsidian notes, README sections, code comments claiming to be canonical. List them.
3. Classify each one:
   - **Team protocol or architecture knowledge** → migrate per Step 2.
   - **Personal workflow** (an individual engineer's own habits/paths/preferences) → leave out of `CLAUDE.md` entirely.
   - **Ticket-level working material** (PRDs, QA scenarios, investigation notes) → does not belong in the vault or in `CLAUDE.md`. Leave it wherever the team already keeps it; reference it from `CLAUDE.md` only if that reference itself is a team convention.
4. **First confirm the vault directory itself exists** — `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/[merchant-slug]/` (check the actual clone on disk, and its git history, not just the expected path). If it does not exist, **stop this workflow and report that instead of proceeding** — don't write vault-first framing (a callout claiming the vault "wins on conflict," a path table) for a vault that isn't onboarded yet. Onboarding is `cp -r vaults/_template vaults/[merchant-slug]` in `roswell-vaults`, done separately, not as part of this task unless the user asks for it.

Once the vault directory is confirmed to exist, open it and **verify structure before assuming the template is accurate for this merchant**:
   - Does every path the template references actually exist? (`01-mcd/audience.md`, `01-mcd/brand-voice.md`, `03-pm/issues/` vs. a flat `03-pm/issues-index.md`, `04-engineering/mirrored/`, etc.) Use whichever file/folder is **actually populated** for this merchant, not whatever the template assumes — note the substitution if you make one.
   - `last_updated` frontmatter on `01-mcd/mcd.md` and `01-mcd/do-not-touch.md` — flag anything over ~60 days old.
   - `02-decisions/decisions.md` — note the most recent entry date.
   - `03-pm/sprints/` — is there a sprint file newer than what any existing `CLAUDE.md` references? Do NOT assume the newest file you see is "current" — ask the user if unsure. Regardless, point `CLAUDE.md` at the `sprints/` **directory**, never a hardcoded filename — it goes stale within weeks.
5. Check for duplication: does anything in the current `CLAUDE.md` (a gotcha, an architecture explanation) already exist, restated, somewhere in the vault (a `do-not-touch.md` bullet, a `04-engineering/patterns/*.md` doc)? Don't assume duplication exists — check specifically, topic by topic, before claiming it.
6. If any source you were told to trust (a worked example, a prior note, a comment) claims work was already done that you can't actually find evidence of in the current files — say so explicitly in your report. Do not silently assume it happened, and do not silently assume it didn't; state what you found and didn't find.

### Step 2 — Draft the merge (don't write it yet)

Determine merge vs. overwrite: if the existing `CLAUDE.md` is under ~30 lines and pure template placeholder, overwrite is fine. Otherwise — merge. Draft, in your head or scratch space, not yet in the file.

**Writing discipline for every line you draft** (per `Documentation Protocol.md`'s "Writing Discipline" section — apply it here, don't just read past it): not verbose — only what a future session needs to act correctly; not a play-by-play of this migration session; no editorializing about what was wrong before; no fact you haven't personally verified in this audit; no inference written as if it were confirmed. If Step 1 didn't verify something, don't draft a line asserting it.

1. A vault-first callout near the top (technical-only subset, vault wins on conflict).
2. A "Where Vault Context Lives" table — **only rows for paths you confirmed exist** in Step 1.4. Use `../vault/...` relative paths (the agency convention — the vault is conventionally symlinked as a sibling of the code repo), not absolute `~/WorkSpace/...` paths, even if no symlink exists yet in your current environment — note that gap rather than hardcoding around it.
3. A "When making changes" numbered workflow: read the vault first, honor do-not-touch, log meaningful decisions, add/update pattern docs for reusable mechanisms, reference an issue ID in PRs (note explicitly if this repo has no CI check enforcing it — document as guidance, don't add a new CI workflow unless asked). **The do-not-touch item needs an escape valve, not a blanket rule:** if there's a legitimate reason to touch something on the do-not-touch list, the agent should stop, explain the reasoning, and get the engineer's explicit confirmation before proceeding or continuing to honor the constraint — never proceed unilaterally either way. Carry this wording into every future migration's do-not-touch item.
4. A canonical-vs-mirrored boundary table.
5. A closing "record the why" item: a code comment or `CLAUDE.md` explains the technical mechanism in-repo; the vault gets the corresponding record — a do-not-touch bullet, a decisions entry, or a `04-engineering/patterns/{topic}.md` writeup — not a restatement of the full reasoning in both places. **Do not label vault documents "merchant-facing."** That term describes The Edge (the merchant/pod/leadership-facing web app) elsewhere in `roswell-agency` — it has never applied to vault markdown, which is canon consumed by tools and engineers, not shown to the merchant directly. This exact item has been copy-pasted with that wrong label into at least two other merchant repos' `CLAUDE.md` files (`AEDShop_AED`, `AED4LIFE_AED`) — carry the corrected wording forward, don't propagate the label again.
6. Everything else in the existing `CLAUDE.md` — preserve as-is unless it's stale (references a dead path/tool) or contradicts vault canon.
7. Identify anything to **remove**: stale doc-protocol instructions that predate this migration (e.g. pointers to an Obsidian path that doesn't correspond to the real vault) — replace with the real vault pointer, don't just leave both.

### Step 3 — Stop and confirm before editing

**Do not write to `CLAUDE.md` yet.** Present the user your understanding: what you found in Step 1 (including staleness flags and any discrepancies from 1.6), what you're adding/removing/preserving from Step 2, and any judgment calls you had to make (e.g., substituting a real vault path for one the template assumed). Ask if this matches what they want before proceeding. This is a deliberate checkpoint — do not skip it even if the task seems obvious.

### Step 4 — Execute

Once confirmed:
1. Back up the current file first: `cp CLAUDE.md CLAUDE.md.bak-{today's date}` (uncommitted, local only).
2. Make the edits — merge, don't overwrite, per the draft from Step 2.
3. Sanity-check the result reads cleanly (no duplicate numbered-list items, no broken tables, no dangling references to paths that don't exist).

### Step 5 — Report back

Give the user:
- What you found (the Step 1 audit), including staleness flags and any discrepancies.
- What you changed, and why (one line each) — additions, removals, preservations.
- Anything you deliberately left alone and why.
- Any duplication you eliminated and which file (vault or repo) is now the single source of truth for it.

**Do not commit or push anything without being asked.** Do not edit the vault itself as part of this task unless separately asked — this is a `CLAUDE.md`-only update. Do not delete old artifacts (e.g. a superseded Obsidian doc) without asking first.
