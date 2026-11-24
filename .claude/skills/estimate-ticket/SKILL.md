---
name: estimate-ticket
description: Review and estimate an Edge ticket. Pull it, study how the feature works today in the codebase and on the live site, answer "can the merchant already do this without code?", estimate the build as AI-implemented with human guidance (dev + QA + bug fix), draft the PRD the start-ticket way, and open an HTML review page locally. Nothing is pushed to the Edge without Patty's approval. Use when Patty says "review and estimate <ticket>", "estimate <ticket>", "can this be done today?", "scope this ticket", or pastes an Edge ticket URL and asks for an estimate.
---

# Estimate ticket

Turns one Edge ticket into an answer and a draft PRD for Patty to review:
1. **How it works today**, from the code and the live site.
2. **Can it be done today** without code (settings, tags, metafields, apps)?
   Say exactly where that falls short.
3. **If not, an estimate** for building it with AI implementing and a human
   guiding: dev, QA and bug fix hours, broken out.
4. **A PRD draft** in Patty's format, plus an **HTML review page** opened locally.

Works for any merchant and any feature area. Written so a subagent or another
agent can follow it with no prior context.

`<obs-vault>` is Patty's Obsidian vault (`~/Documents/obs-roswell`).

## 1. Hard rules

- **Nothing leaves the machine until Patty approves.** No Edge writes
  (`update_ticket`, `post_comment`, estimate fields), no git push, no theme
  push or deploy, no published artifact. Local files only.
- **Read-only on code.** Don't branch or edit the theme or app repo; this is
  review, not implementation.
- Don't stage or commit the vault's existing uncommitted changes.
- **No unverified claims.** Every "today it does X" points to a file or a live
  check. Otherwise, phrase it as a possibility or a question.
- Merchant-visible text (the PRD body) names no other clients and carries no
  Edge history figures or hours. Those go on the review page only.
- **Every Edge push needs Patty's approval**, each time. Right before pushing,
  pull the ticket again (`get_ticket`) and compare it with what you last read.
  If anything changed (description, brief, comments, version), show Patty and
  merge it into the PRD before pushing.

## 2. Load the house rules

Read these and follow them; this skill doesn't repeat them:
- `<obs-vault>/.claude/skills/start-ticket/SKILL.md`: orient, PRD location, Dev Notes.
- `<obs-vault>/Ticket Authoring Prompt v2.md`: PRD sections, AC table format, tone.
- `<obs-vault>/Base Monday Ticket Template.md`: the empty section list.
- The project repo's `CLAUDE.md` and any `docs/AGENT-GUIDELINES.md`, plus the
  memory index for the project.

## 3. Pull the ticket

- From an Edge URL like `.../pod/<merchant>?issue=<ID>`, take the merchant
  slug and the ticket ID.
- `get_ticket`: note the `version`, description, brief (summary, criteria,
  not_included), comments, dates and named people. The ask often lives in
  the description or comments, not the title.
- The original description is source material for the PRD, not something
  the PRD sits under. List its parts (priority, problem, findings, fix steps,
  code snippets); each one that's still relevant goes into a PRD section (§7).
- `get_context_pack`: similar finished tickets, this client's estimate
  tendencies, and agency-wide size bands. Use them to calibrate, and cite
  ticket IDs on the review page only.
- Note any **deadline** in the ticket ("live Saturday"). Compare it with
  today's date and the repo's release flow. A tight date is a headline risk.

## 4. Find how it works today

- Find the code that owns the behaviour. Read it from the production branch
  (e.g. `git show origin/main:<path>`), not a stale local checkout.
- Trace **every surface** that renders it. Grep for the callers and check for
  duplicate copies of the logic (e.g. a search dropdown with its own badge
  code). Missing a surface is the most common estimating miss.
- Before saying a surface does or doesn't support something, read that
  file's logic all the way through. A grep cut short with `head` can miss
  the part that proves it either way.
- Scope the estimate to the code that's live. If a replacement build isn't
  live yet (e.g. a Nosto search build), list it as a follow-up, not as part
  of this estimate.
- List the existing **settings** that control it (schema labels, defaults,
  `visible_if`), and any priority or ordering rules.
- Check the **live site** to confirm what shoppers see (fetch the page, check
  the theme ID and role). Repo settings files may not match live.
  For browser checks, follow the project's Playwright rules
  (`preview_theme_id`, one preview theme at a time, confirm `Shopify.theme.id`).

## 5. Answer "can it be done today?"

Make a table: **need** → **no-code today?** (Yes / Only with … / No) → **why**,
with file or setting references. Cover:
- each separate requirement in the ask
- every surface from step 4
- side effects of the workaround (what else a setting turns off storewide)
- manual effort (tagging, per-template toggles) and how to turn it off afterwards

Verdict: **Yes**, **Partly** or **No**, in one sentence. If it's Yes, the
estimate covers configuring and verifying it, not building.

## 6. Estimate

Basis: **AI implements, a human guides and reviews.** Break it out:
- **Dev**: implementation, schema and settings, every surface, lint and theme
  check, dev-theme verification at the project's breakpoints.
- **QA**: surfaces × states (happy path, each edge case, toggled off), all
  breakpoints.
- **Bug fix**: one QA round plus the client review round.

Estimate dev from the steps, not from the size band: list each step (get
files or data, the code change, the upload or config, the dev-theme check)
with minutes, then add them up. Don't pad. A change the AI can write in
minutes can be well under 1 h of dev; the time is in the steps around it.

Calibrate against `get_context_pack` (closest past tickets, the client's
estimate ratio, the agency size bands). Give a single number in hours, not a
range. If a no-code fallback exists, estimate it separately.

## 7. Draft the PRD

- File: `<obs-vault>/<PROJECT_KEY>/<PRD folder>/<EDGE_ID>-short-description.md`.
  Use the folder the project already has (`PRD` or `PRDs`).
- Frontmatter: `edge_id`, `edge_version` (from step 3), `project_key`,
  `authored`, `status: draft (not pushed)`.
- Follow the Authoring Prompt sections in order (after the AC: Testing Notes,
  Implementation Notes, Dev Notes). Map the Edge brief criteria into the AC
  table. Mark each candidate AC core, edge case or scope boundary on the
  review page, for Patty to confirm.
- Fold the original description into the PRD (§3): every still-relevant part
  goes into its section, code snippets included (as a code block in Dev
  Notes). The PRD replaces the original description; nothing is repeated.
- Dev Notes: the `claude --resume <session-id>` line first (the newest
  `.jsonl` in `~/.claude/projects/<project>/`), then the
  **can-it-be-done-today** verdict in plain words, the non-obvious *why*s,
  and the key file paths with "confirm before implementing". **No hours**:
  the estimate goes on the review page only.
- Open questions (dates, priority conflicts, definitions such as "marked
  down", styling) go in Clarifying Questions.

## 8. HTML review page

- Write `<obs-vault>/<PROJECT_KEY>/<EDGE_ID>-prd-review.html` and `open` it
  once, when it's created. After that, tell Patty when it's updated so she can
  refresh; don't open it again.
- Top to bottom: headline stats (estimate, dev/QA/bug-fix split, fallback
  estimate, deadline), the can-it-be-done-today table, the proposed build and
  hours table with its calibration note, AC candidates with core/edge/scope
  tags, "notes for you" (timing risk, out-of-scope findings for the cleanup
  list, anything unverified), an **"Original ticket → PRD" table** (each part
  of the original description and the PRD section it now lives in), then the
  full PRD rendered from the markdown. Embed the markdown and render it with
  `marked` from cdnjs, falling back to `<pre>`.
- Show proposed drafts and changes on this page, not in chat. The page embeds
  the PRD markdown: whenever the markdown changes, update the HTML too, then
  tell Patty to refresh.
- Works in light and dark mode and at phone width; tables scroll sideways.

## 9. Report and stop

In the reply: the verdict, the estimate with its split, the deadline risk,
the paths to the PRD and the review page, and the open questions. Then
**stop and wait** for Patty's review.

After she approves the PRD:
- Pull the ticket again and check for changes (§1).
- Push the whole PRD as the description in **one** `update_ticket` write
  (`description_mode: "replace"`), so the original is replaced by the PRD
  that includes it and no section is ever missing between writes. Read the
  ticket back, then update `edge_version` and `status` in the frontmatter.
- Stop there. Patty enters her own OE in the ticket drawer. The Billing
  estimate and the step buttons ("Mark brief ready", "Send to merchant") are
  the MP's. Don't set Edge estimates or press steps.
