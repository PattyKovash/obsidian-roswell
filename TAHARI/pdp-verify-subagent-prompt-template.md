# PDP subagent prompt template

This is the actual prompt pattern used to dispatch verification subagents
during the PDP rebuild (TAHARI-12170552235), reconstructed from today's
(2026-07-27) gallery (PRD-02) fix-verify passes. **Yes, it includes the
established loop** — every dispatch below follows `/pdp-verify`
(`.claude/commands/pdp-verify.md` in the repo): merge fix branch →
deploy to dev theme → live-verify with Playwright/DOM evidence →
regression spot-check → report back with pass/fail + evidence, not just
"looks good."

Why a template, not a single fixed prompt: each subagent is fresh with
no memory of prior work (transcripts expire when idle), so every dispatch
has to be fully self-contained — file paths, branch names, theme ID,
Figma nodes, and enough of the bug's history that the agent isn't
re-deriving context from scratch or, worse, guessing at it.

---

## Template

```
Follow `/pdp-verify` documented at
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026/.claude/commands/pdp-verify.md`
(read it first) to verify a fix just committed. Fresh agent, no memory
of prior work — everything needed is below.

## Background

Elie Tahari Shopify theme, PDP rebuild, ticket TAHARI-12170552235,
{sub-ticket} sub-ticket ({PRD-ID}, {monday-id}), branch
`develop/feature/TAHARI-ISSUE-{monday-id}-{slug}`, worktree
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/{slug}`.
Combined worktree for deploy:
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-combined`,
branch `develop/feature/TAHARI-ISSUE-12170552235-pdp-combined`. Dev
theme `155392376969` ("RS DEV (PK): PDP") — confirm `shopify.theme.toml`
in pdp-combined points there before pushing. Confirmed Figma file key:
`RTEarArQVMHyU8ZuXFWfKr`. Confirmed node(s) for this ticket: {node IDs
— NEVER invent one; ask the dispatcher if not stated}. Test product:
`{product URL}?preview_theme_id=155392376969`.

## The fix being verified

Read `git show {commit sha}` in the {slug} worktree yourself before
verifying — don't rely solely on this summary. {1-3 sentence root
cause + fix description, written so the agent understands WHY, not
just WHAT changed.}

## Your task

1. Merge `{commit sha}` into pdp-combined — verify with
   `git merge-base --is-ancestor {sha} HEAD` BEFORE and AFTER the
   merge, don't assume a merge landed just because you ran the command.
2. Deploy: `cd` into pdp-combined,
   `shopify theme push -t 155392376969 --path .`
3. Live-verify with Playwright MCP tools at {viewport — 1440x900
   desktop / 375x812 mobile}. If the browser is locked ("already in
   use"), check `ps aux | grep mcp-chrome` for a GENUINELY stale
   process (old timestamp, no recent activity) before killing anything
   — if unsure whether it's safe, stop and ask rather than guess.
4. {Specific checks — DOM measurements via getBoundingClientRect()/
   getComputedStyle(), NOT just "rule exists in the stylesheet" (this
   project has been bitten twice by object-fit/object-position
   precedence bugs that a rect check alone can't catch — screenshot +
   visual confirmation is required alongside DOM evidence for anything
   touching how content renders inside its box). Real interactions
   (mouse clicks, drags) over programmatic shortcuts (`flkty.select()`,
   `.click()`) where the bug might be interaction-path-dependent.}
5. Regression spot-check (brief, not exhaustive) on the other fixes
   from the same day/branch — list them.

## Report back

Pass/fail per item with specific evidence (rects, DOM state, console,
screenshots). Confirm merge/deploy actually happened (commit hashes,
ancestor check results before AND after). Any NEW/adjacent discrepancy
found — flag only, do NOT fix without asking, especially if it's in a
different PRD's files or a shared/site-wide file (theme.dev.js,
zoom.js, theme.css) — this project has an explicit rule that shared-file
changes get a scope conversation with the user first, they're not a
subagent's call to make silently. Whether this warrants a dated
`../vault/02-decisions/decisions.md` entry (routine fixes don't need
one; a reusable lesson — a recurring bug class, a non-obvious tradeoff —
does).
```

---

## What's deliberately baked into every dispatch

- **`git merge-base --is-ancestor` before AND after** — an early pass
  assumed a merge succeeded without checking; a later branch tip moved
  forward and a stale merge target got deployed. Now standard.
- **"Ask before killing a browser process"** — the shared Playwright
  Chrome profile has caused real collisions with other concurrent
  sessions this project. A subagent that found genuine evidence a
  process was still active (`ps aux` timestamps) refused to kill it on
  a relayed "should be free now" claim and stopped to verify with the
  user directly — that's the standard now, not a one-off.
- **DOM evidence over "the rule exists"** — the `object-fit`/
  `object-position` bugs specifically passed an earlier
  rect-measurement-only verification while the visual bug was still
  live, because a bounding-rect check can't see how content renders
  inside a correctly-sized box. Screenshots are now required alongside
  measurements for anything touching media rendering.
- **Real interactions over programmatic shortcuts** — the mobile
  progress-bar race was initially "unreproducible" using
  `flkty.select()` in tests; a later pass caught it because the fix
  was verified against a real synthetic drag instead.
- **Shared-file scope is a conversation, not a subagent decision** —
  when a subagent found the thumbnail-sync bug lived in
  `assets/theme.dev.js` (core Broadcast, not gallery-specific), it
  reported the finding and stopped rather than patching a shared file
  unilaterally. The scope decision (fix it, workaround it, or hold)
  was made explicitly with the user before any code changed.
- **Fresh-agent framing** — subagent transcripts expire when idle
  (confirmed today: `SendMessage` failed with "No transcript found"
  after a gap). Every dispatch assumes zero prior context and restates
  everything needed rather than referencing "as discussed earlier."
