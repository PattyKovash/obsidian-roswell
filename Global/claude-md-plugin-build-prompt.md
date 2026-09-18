> Copy the prompt below (everything after the line) and hand it to a fresh agent session tasked with building a Claude Code plugin. This file itself is not a protocol doc — it's a build brief, written so a fresh agent with no memory of prior discussion has everything it needs, including *why* certain corrections must not be regressed.

---

## The Prompt

You are building a Claude Code plugin that packages an existing, manually-run documentation workflow into an invokable skill/slash-command. Read everything below before writing any code — this task is mostly "faithfully translate an existing spec into plugin form," not "design a new workflow."

### Background

Roswell Studios (an agency) runs a "merchant-vault" documentation protocol: for each client engagement, a git-tracked vault (`roswell-vaults/vaults/{merchant-slug}/`) holds canonical brand/decisions/PM context, and each merchant's code repo has a `CLAUDE.md` that points into that vault rather than duplicating it. There's an established, hand-refined workflow for bringing a repo's `CLAUDE.md` up to that standard. It currently exists as prompt-template files an engineer manually copies into a fresh Claude Code session. Your job is to turn that into a plugin so it can be invoked directly (e.g. `/vault-doc-update`) instead of copy-pasted.

### Source material — read all of these in full before building anything

1. `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md` — the authoritative spec for the whole protocol (what's canonical where, when to update what, and a "Writing Discipline" section governing how notes should read).
2. `/Users/pk/Documents/obs-roswell/Global/claude-md-vault-update-prompt.md` — the primary workflow to operationalize (stop-and-confirm variant: audit → draft → confirm with user → execute → report).
3. `/Users/pk/Documents/obs-roswell/Global/vault-migration-agent-prompt.md` — a faster variant of the same protocol with no confirm gate. Support both modes if practical (e.g. a flag/argument), defaulting to the confirm-gated one.
4. `/Users/pk/Documents/obs-roswell/Global/merchant-repo-claude-md-reference.md` — the generic, merchant-agnostic worked example of the target `CLAUDE.md` shape.
5. `~/WorkSpace/The_Intelligence_Layer/roswell-agency/patterns/merchant-repo-template/CLAUDE.md` — the canonical structure template.
6. `~/WorkSpace/The_Intelligence_Layer/roswell-agency/methodology/merging-existing-claude-md.md` — merge-vs-overwrite rules.

### Hard constraints — corrections already made; do not regress any of these

These were found and fixed after real inaccuracies were discovered propagating across multiple merchant repos. The plugin must preserve every one of them, not silently drop them for simplicity:

- **Never assume a merchant's vault exists.** Before writing any vault-first framing into a `CLAUDE.md`, the workflow must verify `roswell-vaults/vaults/{merchant-slug}/` actually exists on disk (and check git history, not just the expected path). If it doesn't, stop and report — don't write a callout claiming "the vault wins on conflict" for a vault that was never onboarded.
- **Never label vault documents "merchant-facing."** That term is reserved for The Edge (Roswell's internal web app) elsewhere in the agency's own docs. It has been mistakenly copy-pasted onto vault documents (do-not-touch bullets, decisions entries, pattern writeups) in at least three real merchant repos. The corrected phrasing is: "the vault gets the corresponding record... don't restate the full reasoning in both places" — with no audience label attached.
- **Never claim a CI check is agency-wide unless verified for that specific repo.** The `require-issue-reference.yml` workflow exists in the template and in the two `HYPER-*` repos, but was confirmed absent in several other real merchant repos. The workflow must check the target repo's actual `.github/workflows/` before documenting the issue-reference convention as CI-enforced; otherwise document it as guidance only.
- **Every vault table row must be individually verified to exist and be populated for that merchant** before being written into the repo's `CLAUDE.md` — never copy the full template's row list unconditionally.
- **Writing discipline applies to every note the workflow produces** (this repo's `CLAUDE.md`, and anything mirrored to the vault): not verbose, no play-by-play of the session that produced it, no editorializing about what was wrong with a prior version, no unverified claims stated as fact, no inference presented as settled fact. This is the exact language already in `Documentation Protocol.md`'s "Writing Discipline" section — reuse it, don't rephrase it.

### What the plugin should do

Package the *steps* already defined in `claude-md-vault-update-prompt.md` (audit → draft → stop-and-confirm → execute → report) as a skill invocable in any merchant code repo, with:
- Merchant slug and vault path either passed as arguments or inferred from repo context and confirmed with the user before proceeding (never silently guessed).
- The stop-and-confirm checkpoint preserved as a real pause, not skipped for convenience.
- A way to opt into the faster no-confirm variant if the user explicitly asks for it.

### How to structure it

Check whether the `skill-creator` skill is available in your environment and use it to scaffold correctly (skill metadata, trigger description, file layout) rather than guessing at Claude Code's plugin/skill conventions.

### Before you finish

Do not commit, push, or install the plugin globally without asking. Show the user what you built and where, and let them decide whether/how to distribute it.
