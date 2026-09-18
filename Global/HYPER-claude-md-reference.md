> **Reference snapshot — not an active file.** This is a verbatim copy of `roswell-studios/HYPER-2026-05-11/CLAUDE.md`, taken 2026-07-07, kept here as the **structural reference** for migrating a repo's `CLAUDE.md` to the vault-first model (see `vault-migration-agent-prompt.md` in this folder). It is HYPER/Hyperlite-specific on purpose — copy the *structure* (vault callout, "Where vault context lives" table, "When making changes" workflow, canonical-vs-mirrored table), not the Hyperlite content. Stored in Global so migrations don't depend on the HYPER repo path; if HYPER's CLAUDE.md changes materially, refresh this snapshot.

---

# CLAUDE.md — HYPER (Hyperlite Mountain Gear storefront theme)

This file provides guidance to Claude Code when working with code in this repository.

> **Read the merchant vault first.** Everything about Hyperlite (brand voice, audience, do-not-touch list, decisions, active sprint) is canonical in the vault at `roswell-vaults/vaults/hyperlite/`. This `CLAUDE.md` is the **technical-only subset** for the storefront theme. The vault wins on any conflict.

## Where vault context lives

The merchant vault is the source of truth for everything non-code about this engagement. When working in this repo, Claude Code should read from the vault first.

Engineers typically clone the vault as a sibling of this repo:

```
~/Workspace/Shopify/                              # engineer-specific layout (Hugh's convention)
  HYPER/                                          # this repo
  HYPER_CE_EXT/                                   # the Shopify embedded app (sibling — see ../vault/04-engineering/repos.md)
~/WorkSpace/The_Intelligence_Layer/
  roswell-vaults/vaults/hyperlite/                # the merchant vault
```

When working a per-merchant task heavily, a common pattern is a per-merchant working dir with `vault/` symlinked to `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/hyperlite/`. Then vault references resolve as `../vault/...`.

| Canon | Path |
|---|---|
| Merchant Context Document | `../vault/01-mcd/mcd.md` |
| Brand voice | `../vault/01-mcd/brand-voice.md` |
| Audience & cohorts | `../vault/01-mcd/audience.md` |
| Do-not-touch list | `../vault/01-mcd/do-not-touch.md` |
| Decisions log | `../vault/02-decisions/decisions.md` |
| Active sprint | `../vault/03-pm/sprints/2026-W19.md` |
| Active issues | `../vault/03-pm/issues/` |
| Repo registry | `../vault/04-engineering/repos.md` |
| Vault-side engineer memory | `../vault/04-engineering/CLAUDE.md` |

## What This Is

A Shopify Theme OS 2.0 theme based on "Focal" by Maestrooo (v11.2.1). There is no build step — Liquid templates, assets, and config files are synced directly to Shopify via Theme Kit (`theme` CLI) or Shopify CLI.

The Pro/Outdoor/HyperPro discount logic that previously lived in Shopify Script Editor is being migrated to a Shopify Function in the sibling repo `roswell-studios/HYPER_CE_EXT` (see `../vault/03-pm/epics/EPIC-001.md`). Hard deadline: **June 30, 2026** (Shopify Script Editor deprecation). Until that cutover lands, the legacy Pro pricing scripts are on the do-not-touch list.

## Common Commands

```bash
npm run theme:watch           # Sync local changes to Shopify theme (dev loop)
npm run jsons:dev             # Pull JSON config/template files from the live theme
npm run theme:deploy          # Deploy current branch to Shopify
npm run theme:open            # Open theme in Shopify admin
npm run theme:openCustomizer  # Open theme customizer
npm run theme:grepLive        # Search for the live theme in the theme list
```

All scripts assume `config.yml` (gitignored) is configured for Theme Kit. Shopify CLI is also supported via `shopify.theme.toml` (gitignored); duplicate `shopify.theme.example.toml` to enable.

## Architecture

### Shopify Theme Structure

- `layout/` — Root layout files (`theme.liquid` wraps every page)
- `templates/` — Page-level templates (product, collection, article, blog, etc.)
- `sections/` — ~90 modular Liquid sections rendered within templates
- `snippets/` — ~45 reusable Liquid partials (components, helpers)
- `blocks/` — Content block definitions
- `config/` — Theme settings schema (`settings_schema.json`) and data (`settings_data.json`)
- `assets/` — CSS, JS, fonts, and vendor libraries (Flickity, PhotoSwipe)
- `locales/` — Translation strings for i18n
- `custom-pixels/` — Shopify Pixel tracking scripts (**do not touch without confirming active pixels in Shopify Customer Events** — see `../vault/01-mcd/do-not-touch.md`)
- `_backups/` — read-only historical theme snapshots (**never modify**)

### Branching & CI/CD

Branches trigger auto-deploys via GitHub Actions:

- `release/_candidate` → staging theme (auto-deployed on push)
- `develop/_candidate` → dev theme (auto-deployed on push)

PRs are auto-created when pushing to:

- `feature/*`, `bug/*`, `hotfix/*` → targets `release/_candidate`
- `develop/feature/*`, `develop/bug/*`, `develop/hotfix/*` → targets `develop/_candidate`

Main branches: `main` (production), `dev` (primary development).

### Commit & PR Convention

Commits follow conventional commit format: `feat:`, `fix:`, `chore:`, etc., followed by a description.

**Every PR must reference an issue from the merchant vault using `ISSUE-XXX` or `EPIC-XXX` in the title or body.** The `require-issue-reference.yml` workflow enforces this — PRs without a reference fail CI.

Map old to new: the legacy `HYPER-<monday_pulse_id>` references on existing branches are kept for branch naming (the auto-PR machinery uses them), but the **PR itself must include `ISSUE-XXX` or `EPIC-XXX`**. Cross-reference Monday pulse IDs are preserved in each vault issue's `monday_pulse_id` frontmatter field.

## When making changes

1. **Read the vault first.** Open `../vault/01-mcd/mcd.md` and `../vault/02-decisions/decisions.md` before planning a substantive change.
2. **Check the active sprint.** `../vault/03-pm/sprints/2026-W19.md` lists what's in flight. Each active issue file (`../vault/03-pm/issues/ISSUE-NNN.md`) carries the ask, scope, and risks.
3. **Reference the issue ID.** Every PR title or body must include `ISSUE-XXX` or `EPIC-XXX`. The CI check fails any PR without one.
4. **Log meaningful decisions.** If a decision is worth remembering 6 months from now, write it to `../vault/02-decisions/decisions.md` in the same PR or a follow-up commit.
5. **Honor the do-not-touch list.** Read `../vault/01-mcd/do-not-touch.md` before touching `custom-pixels/`, `_backups/`, CookieBot, the legacy Pro pricing scripts, or the Heatmap script (`prettyprint.min.js`).
6. **Atomic commits with rollback tags.** Tag `pre-{feature}` before deploy; `{feature}-v1` after. See agency methodology.

## Phase 3 validation loop (UI work)

For UI work: Claude Code reads the Figma frame via Figma MCP, generates/updates components, validates against Figma source via Claude in Chrome with HMR, designer signs off. See agency Designer Playbook S02.

## What The Edge does automatically

The Edge's webhook handler (Phase 1 of The Edge build, not live yet) will eventually advance vault issues automatically on:

- **PR merged** → referenced issue advances from `in-sprint` to `qa`
- **Production deploy succeeds** → referenced issue advances to `roswell-done`
- **Tag / release** → entry written to `../vault/04-engineering/releases.md`

Until then, status changes are manual.

## What's canonical here vs. in the vault

| Artifact | Canonical here | Mirrored to vault |
|---|---|---|
| Source code (theme) | Yes | No |
| Architecture decisions / ADRs | Yes | Cross-referenced from decisions log |
| `CLAUDE.md` (this file) | Yes | Referenced from `../vault/04-engineering/CLAUDE.md` |
| MCD | No | Yes (`../vault/01-mcd/mcd.md`) |
| Decisions log | No | Yes (`../vault/02-decisions/decisions.md`) |
| Active sprint state | No | Yes (`../vault/03-pm/`) |
| Pro discount Function | No (lives in HYPER_CE_EXT) | Cross-referenced in repo registry |
