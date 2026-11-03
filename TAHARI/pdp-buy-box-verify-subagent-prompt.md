# Buy-box (PRD-04) verification subagent prompt

Saved alongside `pdp-verify-subagent-prompt-template.md` in this same
folder, per the user's request (2026-07-27) to generate a buy-box-
specific prompt using that template, informed by actual investigation
of what's already been done vs. what the PRD/vault currently claim.

## Why this ticket needed its own prompt, not just the template filled in

Checked before writing this:
- `git log` on `develop/feature/TAHARI-ISSUE-12551877753-pdp-buy-box-actions`:
  4 commits (`7233789`, `414d68d`, `1f4eeb3`, `0db6de5`), all real feature
  work, dated 2026-07-23.
- `git merge-base --is-ancestor 0db6de5 <pdp-combined HEAD>` → **true**.
  It IS merged into `pdp-combined` (merge commit `cba9701`).
- `../vault/02-decisions/decisions.md`'s buy-box entry (2026-07-23) says
  "(not yet merged)" — **stale**, contradicted by the git check above.
  Needs correcting, not just appending a new entry.
- The PRD file itself
  (`obs-roswell/TAHARI/PRD/TAHARI-ISSUE-12170552235-pdp-04-buy-box-actions.md`)
  is thorough and mostly accurate — ACs checked off, detailed
  Implementation Notes — but its own Implementation Notes say outright:
  **"Not verified in this environment (no preview/live theme available)
  — flagged as pending human steps: the actual Ajax add-to-cart +
  checkout-redirect flow end-to-end (AC2, AC3), the no-JS `return_to`
  fallback (AC5), and a real screen-reader pass (AC9)."** Static code
  review + `shopify theme check` only — never deployed, never clicked.
- The `/pdp-verify` loop (merge → deploy → live Playwright verify →
  regression check) didn't exist yet when PRD-04 was built — it was
  established later, during the gallery (PRD-02) debugging session on
  2026-07-27, precisely because static review kept missing real,
  live-only-visible bugs (CSS cascade collisions, JS timing races, an
  ARIA/focus conflict, etc. — several of which took multiple rounds to
  even find). Buy-box has never been run through anything like it.
- The PRD's Figma references include node `1117-15129` for the mobile
  sold-out/notify-me button pairing, labeled "mobile full PDP
  reference." That exact node was later found, during gallery work, to
  be an imprecise stand-in for actual mobile gallery design (superseded
  by 1117-15059/1117-15066, then again by 1117-15132/1117-15137) — but
  that correction was specifically about the *gallery*, not this
  button pairing. Whether 1117-15129 is *also* wrong for this specific
  UI element has never been checked. Per the project's standing rule
  ("confirm each Figma node before starting work on a ticket"), this
  needs re-confirmation, not an assumption either way.

Given all of that, "some work has been done" understates it — the
actual build is real, thorough, and merged, but has an open-book
verification gap the gallery ticket didn't have until today, plus one
specific stale vault claim and one specific unconfirmed Figma reference.

---

## The prompt

```
Follow `/pdp-verify` documented at
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026/.claude/commands/pdp-verify.md`
(read it first). This is the FIRST time this specific ticket has been
run through this loop — treat it as a first-pass live verification of
already-merged work, not a re-verification of something previously
confirmed.

## Background

Elie Tahari Shopify theme, PDP rebuild, ticket TAHARI-12170552235,
buy-box sub-ticket PRD-04 (TAHARI-12551877753), branch
`develop/feature/TAHARI-ISSUE-12551877753-pdp-buy-box-actions`,
worktree
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-buy-box-actions`.
Combined worktree:
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-combined`,
branch `develop/feature/TAHARI-ISSUE-12170552235-pdp-combined`. Dev
theme `155392376969` ("RS DEV (PK): PDP"). Confirmed Figma file key:
`RTEarArQVMHyU8ZuXFWfKr`.

**Important — this ticket's Figma node situation is NOT fully
confirmed.** The PRD cites node `1117-15227` (Notify-me panel) and
`1117-15023` (available-state buttons) with reasonable confidence, but
also cites `1117-15129` for the mobile sold-out/notify-me pairing,
labeled "mobile full PDP reference" — a node later found imprecise for
gallery purposes during a different ticket. Do NOT assume 1117-15129 is
right OR wrong for this specific button pairing without checking. Pull
`get_design_context` on it yourself and compare against what's live. If
it's ambiguous, STOP and ask the user to confirm/provide the correct
node rather than guessing — this project has a standing rule about
this, established after real rework caused by an unconfirmed node
earlier in this project.

## Status: this branch IS already merged and built, but never live-verified

4 commits already on this branch (`7233789`, `414d68d`, `1f4eeb3`,
`0db6de5`), already merged into `pdp-combined` (confirmed via
`git merge-base --is-ancestor 0db6de5 <pdp-combined HEAD>` → true,
merge commit `cba9701`). Read the full PRD file at
`/Users/pk/Documents/obs-roswell/TAHARI/PRD/TAHARI-ISSUE-12170552235-pdp-04-buy-box-actions.md`
yourself for the complete feature list, architecture decisions
(reusable `<buy-now-button>` custom element, extended
`<klaviyo-bis-form>` with a new `data-always-open` attribute, a
submit-guard added to `assets/theme.dev.js`'s `ProductForm` — a shared
file, already reviewed/shipped, not something to re-litigate unless you
find it's actually broken), and known scope decisions (v1 is
quantity=1 only, Buy Now has no preorder-label variant, etc. — these
are intentional, not gaps to "fix").

The PRD's own Implementation Notes admit this was built and shipped
with **zero live verification** — no preview theme was available at
build time. Your job is to be the first real live check this feature
has ever had.

## Your task

1. Confirm `shopify.theme.toml` in pdp-combined points to `155392376969`,
   deploy the CURRENT state of pdp-combined (it should already have
   PRD-04 merged — confirm via `git merge-base --is-ancestor 0db6de5 HEAD`
   before assuming, don't just trust this prompt).
2. Live-verify against the PRD's own acceptance criteria table, with
   priority on the three it explicitly flagged as unverified:
   - **AC2/AC3 — Add to Bag and Buy Now, end to end.** Click Add to
     Bag on a real product; confirm the item actually lands in the
     cart (check cart count/drawer state, not just "no JS error").
     Click Buy Now; confirm it adds to cart AND redirects to checkout
     (or at least fires the redirect — you likely can't complete a real
     Shopify checkout, but confirm the navigation/URL change happens).
   - **AC5 — no-JS `return_to` fallback.** Check the rendered HTML for
     a `return_to`/similar hidden field or `formaction` fallback that
     would work if JS never loaded. This may require reading the
     rendered markup rather than a live interaction.
   - **AC9 — screen reader pass.** You won't have a real screen reader,
     but check the accessibility tree / ARIA attributes on both buttons
     and the sold-out/notify-me state via `read_page` or
     `getComputedStyle`/DOM inspection — look for the kind of
     ARIA/focus conflicts this project has hit before (e.g. a focusable
     element inside an `aria-hidden` ancestor — that exact bug was found
     and fixed in the gallery ticket today, worth specifically checking
     for here too since the patterns are similar: modals, panels,
     conditionally-shown states).
3. Test the sold-out/Notify-me flow on a genuinely sold-out product if
   one exists in the catalog (check the collection/search for one, or
   ask if you can't find one rather than skipping this). Confirm the
   compact Sold Out + Notify Me pairing renders, clicking Notify Me
   reveals the email panel, and it's positioned/styled per whichever
   Figma node you've confirmed as correct for this state.
4. Test the preorder state if a preorder product exists (check
   `product.metafields.theme.preorder` usage or product tags per the
   PRD's own preorder logic description) — confirm Add to Bag's label
   swaps correctly, Buy Now's label does NOT change (intentional per
   the PRD).
5. Trigger a real add-to-cart error if you can (e.g. a variant with 0
   inventory that still allows the request, or throttle/intercept the
   fetch) and confirm the error message renders via the existing
   `data-cart-errors-container` hook, auto-dismisses, and doesn't
   leave the button permanently disabled.
6. Regression spot-check: this ticket's `theme.dev.js` changes
   (`<klaviyo-bis-form>` `data-always-open`, `ProductForm`'s
   `buy-now-button` submit-guard) — confirm the THEME'S OTHER,
   pre-existing back-in-stock forms (not this PDP) still work normally,
   same "shared file, verify no regression elsewhere" discipline used
   for today's gallery `theme.dev.js` fix.

## Vault/documentation corrections needed (do this after live
verification, not before — base it on what you actually find, not what
this prompt assumes)

- `../vault/02-decisions/decisions.md`'s existing 2026-07-23 buy-box
  entry says "(not yet merged)" at the end of its `Recorded by:` line —
  this is now factually wrong (it IS merged, confirmed above). Correct
  that line in place; don't just add a new entry on top of a wrong one.
- If your live verification finds real bugs, log them the same way
  today's gallery bugs were logged (dated entry, root cause, fix,
  commit hash) — but only if something real breaks. If everything
  passes clean, a short note that this ticket received its first live
  verification pass on this date and passed is enough; it doesn't need
  gallery-saga-level detail for a clean pass.
- Update `../vault/04-engineering/patterns/main-product-pdp-architecture.md`'s
  status section if it currently implies PRD-04 is unverified/pending
  in a way that's no longer accurate once you're done.

## Report back

Pass/fail per acceptance criteria checked, any bugs found (root cause
if you get there, not just symptom), whether the Figma node question
for 1117-15129 got resolved or needs the user's input, and confirmation
of what vault/PRD documentation you actually updated vs. what you're
flagging for the user to decide. This is the first verification pass
for a whole ticket, not a small fix — thorough is appropriate here.
```
