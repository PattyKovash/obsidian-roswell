---
name: estimate-ticket
description: Review and estimate an Edge ticket. Pull it, study how the feature works today in the codebase and on the live site, answer "does the feature already exist?" (can the merchant already do this without code), estimate the build as AI-implemented with human guidance (dev + QA + bug fix), draft the PRD, and open an HTML review page locally. Nothing is pushed to the Edge without Patty's approval. Use when Patty says "review and estimate <ticket>", "estimate <ticket>", "can this be done today?", "scope this ticket", or pastes an Edge ticket URL and asks for an estimate.
---

# Estimate ticket

Turns one Edge ticket into an estimate and a draft PRD for Patty to review. Works for any merchant and feature area, and can be followed by a subagent with no prior context. Approvals follow the global hard rules (`~/Documents/obs-roswell/Global/agent-hard-rules.md`); on top of those:
- **Read-only on code.** Don't branch or edit the theme or app repo.
- **Local files only** until Patty approves: no Edge writes (including estimate fields), pushes or published artifacts.
- Don't set Edge estimates or press workflow steps ("Mark brief ready", "Send to merchant"); those are Patty's and the MP's.

`<obs-vault>` is `~/Documents/obs-roswell`.

## Steps

1. **Load the rules.** `<obs-vault>/Ticket Authoring Prompt v2.md` (PRD writing and research), `<obs-vault>/Base Monday Ticket Template.md`, the repo's `CLAUDE.md` and any `docs/AGENT-GUIDELINES.md`, and the project's memory index.
2. **Pull the ticket.** From an Edge URL (`.../pod/<merchant>?issue=<ID>`) take the merchant slug and ID. `get_ticket`: version, description, brief, comments, dates, people. Note any **deadline** and compare it with today's date and the repo's release flow; a tight date is a headline risk.
3. **Calibration.** `get_context_pack`: similar finished tickets, the client's estimate tendencies, agency size bands. Cite ticket IDs on the review page only.
4. **How it works today**, per the Authoring Prompt's "Research" section. Scope to the code that's live; a replacement build that isn't live yet is a follow-up, not part of this estimate.
5. **Does the feature already exist?** Check whether the merchant can already do it without code (settings, tags, metafields, apps), for each requirement and every surface, including side effects of a workaround and manual effort. Verdict: Yes, Partly or No. If Yes, the estimate covers configuring and verifying it.
6. **Estimate**, as Low and High hours, each split into dev, QA and bug fix. The plan is the High end; no "expected" figure and no separate buffer line. Give two estimates:
   - **AI implements, a human guides and reviews** (the one used for planning).
   - **Human only**, for comparison.

   What each part covers:
   - **Dev:** implementation, schema and settings, every surface, lint and theme check, dev-theme verification at the project's breakpoints.
   - **QA:** surfaces × states (happy path, each edge case, toggled off), all breakpoints.
   - **Bug fix:** one QA round plus the client review round.

   Estimate dev from the steps (each with minutes, added up), not the size band; don't pad. Calibrate against step 3. Estimate a no-code or partial fallback separately if one exists.
7. **Draft the PRD** per the Authoring Prompt. Dev Notes carry the feature-exists verdict in plain words and the key file paths with "confirm before implementing". No hours in the PRD. Open questions (dates, priority conflicts, definitions, styling) go in Clarifying Questions.
8. **Review page** with the `prd-review-page` skill, including the estimate section.
9. **Report and stop.** Reply with the verdict, both estimates (Low–High, with the dev / QA / bug fix split), the deadline risk, the paths to the PRD and review page, and the open questions. Wait for Patty's review. After she approves, push the PRD per `<obs-vault>/Global/prd-edge-push.md`, then stop; Patty enters her own OE.
