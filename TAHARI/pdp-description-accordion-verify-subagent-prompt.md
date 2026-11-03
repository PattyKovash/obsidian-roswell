# Description + Accordion (PRD-06) verification subagent prompt

Saved alongside `pdp-verify-subagent-prompt-template.md` and
`pdp-buy-box-verify-subagent-prompt.md` in this same folder, per the
user's request (2026-07-29) to generate a PRD-06-specific prompt so a
different agent/session can pick this up, using the same template and
following the project's full established process.

## Why this ticket needed its own prompt, not just the template filled in

Checked before writing this:
- `git log` on `develop/feature/TAHARI-ISSUE-12551928604-pdp-description-accordion`:
  3 commits (`735a294`, `a62ec77`, `dbdd8aa`), all real feature work.
- `git merge-base --is-ancestor dbdd8aa <pdp-combined HEAD>` → **true**.
  It IS already merged into `pdp-combined` (merge commit `c2821c1`) —
  but the branch itself has never been pushed to `origin` (confirmed via
  `git ls-remote --heads origin` — no match). Push it before or as part
  of this work; don't assume it exists on GitHub.
- The PRD file itself
  (`obs-roswell/TAHARI/PRD/TAHARI-ISSUE-12170552235-pdp-06-description-accordion.md`)
  is thorough — all 11 ACs marked ✓, detailed Implementation Notes,
  already has the "Standing Requirement: Prefer Web Components" section
  — but its own Implementation Notes say outright: **"Not verified in
  this environment: no live/preview theme was available, so nothing
  above was checked in an actual browser — no visual Figma comparison,
  no screen-reader pass, no confirmation that the 120px column gap or
  the '×' rotation reads correctly at real viewport sizes."** Static
  code review + `shopify theme check` only — never deployed, never
  clicked, despite already being merged into the combined build.
- The `/pdp-verify` loop (merge → deploy → live Playwright verify →
  regression check) didn't exist yet when PRD-06 was built. This ticket
  has never been run through it.
- Two of the PRD's own Clarifying Questions were never actually
  resolved by anyone outside the agent that wrote them — they're
  judgment calls, not confirmed answers: (1) where "Fabric"/"Size & Fit"
  copy comes from for existing products (resolved as "skip the row if
  content is blank," not confirmed with a PM), and (2) whether
  "Complimentary Delivery over $350" should be a static string or tied
  to an actual shipping threshold (resolved as static, matching
  existing live precedent, but never confirmed as the final call). Flag
  both to the user rather than treating them as settled.
- The desktop Figma node (`1117-15024`) and mobile node (`1117-15129`)
  were cited with reasonable confidence but not independently
  re-confirmed the way the gallery/buy-box tickets later were. Note:
  `1117-15129` was separately investigated during PRD-04 (buy-box) work
  on 2026-07-29 and found to actually be the **entire mobile PDP page**,
  not a narrow "buy buttons" or "description" frame — the Description
  sub-frame within it is `1117:15140`. This PRD's own Necessary Info
  section already correctly describes 1117-15129 as "the mobile full
  PDP reference," so this isn't a contradiction, just worth being
  precise about: verify against the actual Description/accordion
  sub-frame, not the whole-page frame.

Given all of that: real, thorough, already-merged-into-combined work,
but with a full verification gap (nothing has ever been seen live) plus
two unresolved judgment calls worth surfacing, not two settled answers.

---

## The prompt

```
Follow `/pdp-verify` documented at
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026/.claude/commands/pdp-verify.md`
(read it first). This is the FIRST time this specific ticket has been
run through this loop — treat it as a first-pass live verification of
already-merged work, not a re-verification of something previously
confirmed. Also read
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026/CLAUDE.md`
before touching anything if you haven't worked in this repo before —
it documents the vault locations, Figma-first rule, and branching this
project runs on.

## Background

Elie Tahari Shopify theme, PDP rebuild, ticket TAHARI-12170552235,
description + accordion sub-ticket PRD-06 (TAHARI-12551928604), branch
`develop/feature/TAHARI-ISSUE-12551928604-pdp-description-accordion`,
worktree
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-description-accordion`.
Combined worktree:
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-combined`,
branch `develop/feature/TAHARI-ISSUE-12170552235-pdp-combined`. Dev
theme `155392376969` ("RS DEV (PK): PDP"). Confirmed Figma file key:
`RTEarArQVMHyU8ZuXFWfKr`.

**This branch has never been pushed to origin.** Confirm with
`git ls-remote --heads origin | grep description-accordion` — if it's
still missing, push it (`git push -u origin
develop/feature/TAHARI-ISSUE-12551928604-pdp-description-accordion`)
so the work isn't local-only.

**This branch IS already merged into `pdp-combined`** (merge commit
`c2821c1`) — confirm with `git merge-base --is-ancestor dbdd8aa HEAD`
in the pdp-combined worktree before assuming either way, don't just
trust this prompt. If pdp-combined has moved on since and this is no
longer true, stop and report rather than re-merging blind.

## Status: already merged into the combined build, but never live-verified

3 commits on this branch (`735a294`, `a62ec77`, `dbdd8aa`). Read the
full PRD file yourself at
`/Users/pk/Documents/obs-roswell/TAHARI/PRD/TAHARI-ISSUE-12170552235-pdp-06-description-accordion.md`
for the complete feature list, architecture decisions (purpose-built
`<accordion-row>` custom element — reuse of the theme's existing
`collapsible-elements` was evaluated and rejected for a documented
reason, don't re-litigate unless you find the reasoning doesn't hold
up), and the CSS-only two-column desktop / reordered single-column
mobile layout trick (`display: contents` + CSS Grid, no Liquid changes
to the shared dispatch loop).

The PRD's own Implementation Notes admit this was built and merged
with **zero live verification** — no preview theme was available at
build time. Your job is to be the first real live check this feature
has ever had.

## Your task

1. Confirm `shopify.theme.toml` in pdp-combined points to `155392376969`,
   deploy the CURRENT state of pdp-combined (confirm the merge is still
   present per the ancestor check above before assuming).
2. Live-verify against the PRD's own acceptance criteria table on a
   real product with 4 accordion rows configured if one exists (check
   `templates/product.json` and/or the theme editor), or note if only
   the legacy 2-row products are available and verify AC #10 (backward
   compatibility) as the fallback case instead.
   - **AC #4/#5 — default open/closed state per breakpoint.** Load
     desktop (≥750px) and confirm "Product details" (first row in DOM
     order) is open, all others closed. Resize/reload at a mobile
     viewport and confirm ALL rows are closed by default. This is
     `matchMedia`-driven JS logic that was never seen running — highest
     priority check.
   - **AC #6/#7 — toggle behavior and accessibility.** Click a row,
     confirm `aria-expanded` toggles, the "+" glyph rotates, and the
     panel's `hidden` attribute is actually added/removed (not just a
     CSS class) — inspect the DOM directly, not just visually. Check
     for the ARIA/focus-conflict pattern this project has hit before
     (a focusable element inside an `aria-hidden` ancestor) since
     accordion panels are exactly the kind of conditionally-shown
     content that bug class affects.
   - **AC #8 — animation and reduced motion.** Confirm opening/closing
     animates height smoothly (not an instant jump), and separately
     confirm with `prefers-reduced-motion: reduce` emulated
     (Playwright/DevTools) that the transition is actually skipped, not
     just faster.
   - **AC #9 — bulleted list content.** If a row's content includes a
     `<ul>`, confirm it renders with the theme's real `.rte` bullet
     styling, not default/unstyled browser bullets.
   - **AC #2 — delivery note placement.** Confirm on both desktop and
     mobile that the delivery note sits where Figma shows it (desktop:
     below the description text, left column; mobile: after all
     accordion rows, per the Implementation Notes' `order: 99` trick).
     This is CSS layout logic that's never been seen rendered — check
     for it landing in the wrong column/order before trusting the
     Implementation Notes' description of it.
   - **The 120px column gap** — the Implementation Notes explicitly flag
     this as "scaled down as a pragmatic adaptation... flagged for a
     human visual pass" versus Figma's literal 200px. Take a screenshot
     next to the Figma reference and give your own read on whether
     120px reads correctly or the gap looks visually off.
3. **Re-confirm both Figma nodes before trusting them as correct**,
   per this project's standing rule (confirm each Figma node before/while
   verifying against it, don't assume a prior citation was right):
   - Desktop: `https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15024&m=dev`
   - Mobile: the PRD cites `1117-15129` as "the mobile full PDP
     reference" — that's the whole page, not just this component. Per
     the buy-box investigation on 2026-07-29, the Description sub-frame
     within it is specifically `1117:15140`. Use `get_design_context`
     on the specific sub-frame, not just the whole-page node, for an
     accurate comparison.
4. Regression spot-check: this ticket only touched
   `sections/main-product.liquid` (one additive schema setting,
   `delivery_note`, per its own Implementation Notes) plus its own
   snippets/CSS/JS. Confirm the other block types in that section's
   dispatch loop (gallery, badges, title, variant_picker, buy_buttons,
   text, divider, custom_liquid) still render normally on the same
   product page — same "shared file, verify no regression elsewhere"
   discipline used for prior shared-file touches on this project.

## Two unresolved judgment calls to flag, not silently accept as final

- Whether "Fabric"/"Size & Fit" accordion rows should genuinely be
  omitted when empty (current behavior) versus rendering an empty/
  placeholder state — this was a judgment call by the building agent,
  never confirmed with a PM/merchant. Flag it as still open, don't
  treat it as settled just because the PRD marks the AC ✓.
- Whether "Complimentary Delivery over $350" should stay a static
  string (current behavior, matching existing live precedent) or
  eventually sync to a real shipping-threshold setting — same, flag as
  still open.

## Documentation (do this after live verification, not before — base it
on what you actually find)

- Comment style: keep any code comments you add short and WHY-only, no
  "BUGFIX (date, ticket): [narrative]" style — that history belongs in
  the vault decisions log, not inline in code.
- `../vault/02-decisions/decisions.md`: if this is the first live
  verification pass for this ticket, a short dated entry noting pass/
  fail is enough for a clean pass; only go into full narrative detail
  if you find and fix a real bug, root cause included.
- `../vault/04-engineering/patterns/main-product-pdp-architecture.md`:
  update its status section if it currently implies PRD-06 is
  unverified/pending in a way that's no longer accurate once you're
  done.
- Update the PRD's own Objective/Acceptance Criteria table's QA column
  (use the ✅ emoji for any new checkmarks, not the plain ✓ character —
  that's the project's current convention going forward) and
  Implementation Notes to reflect what was actually verified live,
  replacing "Not verified in this environment" once it no longer
  applies.

## Report back

Pass/fail per acceptance criteria checked, any bugs found (root cause
if you get there, not just symptom), whether both Figma nodes read as
correct or need the user's input, whether the branch got pushed to
origin, and confirmation of what vault/PRD documentation you actually
updated vs. what you're flagging for the user to decide. This is the
first verification pass for a whole ticket, not a small fix — thorough
is appropriate here.
```
