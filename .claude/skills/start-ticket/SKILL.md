---
name: start-ticket
description: Start work on an Edge ticket using Patty's workflow. Pull the ticket from the Edge, draft the PRD locally with a review page, reproduce and fix, keep vault planning notes current, test on the dev theme with Playwright, and ask before any push or Edge write. Use when Patty says "start a ticket", "start HYPER-123", "pick up <ticket>", "begin work on <ticket>", or "new ticket".
---

# Start ticket

Patty's workflow for an Edge ticket, from pickup to hand-off. The Edge is the system of record; Monday is reference only. Approvals follow the global hard rules (`~/Documents/obs-roswell/Global/agent-hard-rules.md`).

`<obs-vault>` is `~/Documents/obs-roswell`. `<vault>` is the merchant vault (`roswell-vaults/vaults/<merchant>`).

## Steps

1. **Orient.** Read the repo's `CLAUDE.md`. Find the merchant vault and confirm it per `<obs-vault>/vault-pr-rules.md` ("Find the right vault"); then read `<vault>/01-mcd/mcd.md`, `do-not-touch.md` and `02-decisions/decisions.md`.
2. **Pull the ticket** with `get_ticket`: note the `version`, and read the comments and activity log; the ask often lives there.
3. **Draft the PRD early**, right after the research, per `<obs-vault>/Ticket Authoring Prompt v2.md`. Re-read the draft before every edit; Patty edits it directly. Build the review page with the `prd-review-page` skill.
4. **Reproduce** (bugs): confirm with Patty where it was reported and reproduce it there, with the `theme-test` skill.
5. **Branch** in the theme repo per its `CLAUDE.md`, with the Edge ID in the name; reference the ID in the PR. Atomic, terse conventional commits, one fix per commit, committed right away.
6. **Implement and test** with the `theme-test` skill. Final checks on a production build.
7. **Vault notes** per `<obs-vault>/Global/Documentation Protocol.md` and `<obs-vault>/vault-pr-rules.md`. Out-of-scope findings go on a running cleanup list in the planning notes. Save screenshots Patty pastes into `evidence/` right away.
8. **Wrap up.** Update the PRD (Dev ✅ re-verified on the current code, Implementation and Testing Notes) and push it per `<obs-vault>/Global/prd-edge-push.md`. Edge bugs: `edge-issue` skill. Ending the session: `session-handoff` skill.
