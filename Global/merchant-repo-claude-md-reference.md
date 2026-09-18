> **Generic structural reference — not an active file.** This is a merchant-agnostic worked example of the vault-first `CLAUDE.md` shape, for use alongside `vault-migration-agent-prompt.md` and `claude-md-vault-update-prompt.md` in this folder. Fill in the `{bracketed}` placeholders per-merchant; do not invent merchant-specific content when using this as a structural guide. It reflects the current, corrected protocol — no hardcoded absolute vault paths, no unverified CI-enforcement claims, and no "merchant-facing" mislabeling of vault documents (see `Documentation Protocol.md`'s Writing Discipline section for why). If the underlying protocol changes materially, update this file rather than letting a single merchant's `CLAUDE.md` drift into being the de facto reference.

---

# CLAUDE.md — {Merchant Name} ({repo purpose, e.g. storefront theme})

This file provides guidance to Claude Code when working with code in this repository.

> **Read the merchant vault first.** Everything about {Merchant Name} (brand voice, audience, do-not-touch list, decisions, active sprint) is canonical in the {merchant-slug} merchant vault. This `CLAUDE.md` is the **technical-only subset** for this repo. The vault wins on any conflict.

## Where vault context lives

The merchant vault is the source of truth for everything non-code about this engagement. When working in this repo, Claude Code should read from the vault first.

**The vault lives outside this repo and its location may differ per engineer** — there is no path that's correct for everyone. Below, `<vault>` means the {merchant-slug} vault root, i.e. the directory containing `01-mcd/`, `02-decisions/`, `03-pm/`.

### Finding the vault

Resolve `<vault>` once at the start of a session, in this order:

1. **`$ROSWELL_VAULTS`**, if set — then `<vault>` = `$ROSWELL_VAULTS/vaults/{merchant-slug}`.
2. **A `vault/` symlink or directory alongside this repo** (`../vault`). Common when working out of a per-merchant working dir.
3. **Search** for a `roswell-vaults/vaults/{merchant-slug}` directory under the home directory (engineers commonly keep it a few levels deep under a workspace dir).
4. **Ask the engineer for the path.** If none of the above resolves, stop and prompt for it rather than guessing or proceeding without vault context.

**Always verify before reading or writing.** A resolved path is only correct if `<vault>/01-mcd/mcd.md` exists *and* its frontmatter reads `merchant: {merchant-slug}`. The `../vault` symlink in particular is shared across merchant repos in some layouts and can point at a different merchant's vault — a wrong-merchant write is silent and easy to miss. Same check applies to any issue file before editing it.

Setting `ROSWELL_VAULTS` in your shell profile makes step 1 hit every time and skips the rest.

**Only include rows below that you've confirmed actually exist and are populated for this merchant** — don't assume every path in this list applies uniformly.

| Canon | Path |
|---|---|
| Merchant Context Document | `<vault>/01-mcd/mcd.md` |
| Brand voice | `<vault>/01-mcd/brand-voice.md` |
| Audience & cohorts | `<vault>/01-mcd/audience.md` |
| Do-not-touch list | `<vault>/01-mcd/do-not-touch.md` |
| Decisions log | `<vault>/02-decisions/decisions.md` |
| Active sprint | `<vault>/03-pm/sprints/` (latest `YYYY-Www.md`) |
| Active issues / epics | `<vault>/03-pm/issues/`, `<vault>/03-pm/epics/` |
| Repo registry | `<vault>/04-engineering/repos.md` |
| Vault-side engineer memory | `<vault>/04-engineering/CLAUDE.md` (present in most real merchant vaults — confirm for this one) |
| Reusable technical patterns | `<vault>/04-engineering/patterns/` |

Other repos related to this one (e.g. a companion checkout-extension app) are listed in `<vault>/04-engineering/repos.md`.

## What this is

{One or two sentences: what the repo is, the platform/framework it's built on, build/no-build model.}

## Common commands

```bash
{stack-specific commands — dev server, lint, build, deploy}
```

{Any setup prerequisites — gitignored config files that must exist locally, how to obtain them.}

## Architecture

{Repo-specific architecture sections — folder structure, key conventions, whatever is actually true of this codebase. This is the bulk of a real CLAUDE.md and has no generic template; write what's actually here.}

### Branching & CI/CD

{This repo's actual branch model and what each branch triggers. Don't assume another repo's branch names apply here.}

### Commit & PR convention

{This repo's actual commit convention, if any.}

**Check whether this repo's `.github/workflows/` has a `require-issue-reference.yml` (or equivalent) CI check before documenting the issue-reference convention as enforced.** That check exists in the agency template and has been adopted by some merchant repos, but it is **not** universal — several real merchant repos don't have it. If this repo doesn't have it, document the convention as guidance only, and say so explicitly; don't add the CI workflow yourself unless asked.

## When making changes

1. **Read the vault first.** Open `<vault>/01-mcd/mcd.md` and `<vault>/02-decisions/decisions.md` before planning a substantive change.
2. **Check the active sprint / issues.** `<vault>/03-pm/sprints/` (latest file) and `<vault>/03-pm/issues/` carry what's in flight, the ask, scope, and risks.
3. **Reference the issue ID.** Every PR title or body should include `ISSUE-XXX` or `EPIC-XXX`. Note explicitly whether this repo has CI enforcing it (see above) or whether it's guidance only.
4. **Log meaningful decisions.** If a decision is worth remembering 6 months from now — meaning a real alternative was on the table — write it to `<vault>/02-decisions/decisions.md`.
5. **Honor the do-not-touch list.** Read `<vault>/01-mcd/do-not-touch.md` before touching anything it flags. If there's a legitimate reason to touch something on that list, don't proceed unilaterally — stop, explain the reasoning to the engineer, and get explicit confirmation on whether to proceed with the change or continue honoring the do-not-touch constraint.
6. **Record the why in-repo, mirror it to the vault in the form that fits.** A code comment or this file explains the technical mechanism; the vault gets the corresponding record — a do-not-touch bullet, a decisions entry, or a `<vault>/04-engineering/patterns/{topic}.md` writeup. Don't restate the full reasoning in both places, just point one at the other. (Do not label vault documents "merchant-facing" — that term describes The Edge, the web app, never vault markdown.)
7. {Any repo-specific mechanical convention — atomic commits with rollback tags, a validation loop for UI work, etc. — only if actually true of this repo.}

## What's canonical here vs. in the vault

| Artifact | Canonical here | Mirrored to vault |
|---|---|---|
| Source code | Yes | No |
| Architecture / constraint reasoning | Yes | Yes (distilled) |
| `CLAUDE.md` (this file) | Yes | Referenced from `<vault>/04-engineering/CLAUDE.md` |
| MCD | No | Yes (`<vault>/01-mcd/mcd.md`) |
| Decisions log | No | Yes (`<vault>/02-decisions/decisions.md`) |
| Active sprint / issue state | No | Yes (`<vault>/03-pm/`) |
