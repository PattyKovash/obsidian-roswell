# Buy-box (PRD-04) live-review fix pass — subagent prompt

Saved alongside the other PDP subagent prompts in this folder. This is
phase 2 of the buy-box fix pass — phase 1 (Figma reference confirmation,
drawer architecture research, live OOS investigation) was done directly
in the orchestrating session on 2026-07-29, not by a subagent. This
prompt hands the actual implementation to a fresh agent.

Read the PRD's new "Fix Pass Scope (added 2026-07-29, after first live
review)" section first — everything below assumes that context.

---

## The prompt

```
Follow `/pdp-verify` documented at
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026/.claude/commands/pdp-verify.md`
(read it first). Also read
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026/CLAUDE.md`
if you haven't worked in this repo before.

## Background

Elie Tahari Shopify theme, PDP rebuild, ticket TAHARI-12170552235,
buy-box sub-ticket PRD-04 (TAHARI-12551877753), branch
`develop/feature/TAHARI-ISSUE-12551877753-pdp-buy-box-actions`, worktree
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-buy-box-actions`.
Combined worktree for deploy:
`/Users/pk/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-worktrees/pdp-combined`,
branch `develop/feature/TAHARI-ISSUE-12170552235-pdp-combined`. Dev
theme `155392376969` ("RS DEV (PK): PDP"). Confirmed Figma file key:
`RTEarArQVMHyU8ZuXFWfKr`. OOS test product (real sold-out variant, live):
`https://www.elietahari.com/products/judith-blouse?variant=44405905784969`
— test against this with `?preview_theme_id=155392376969` appended once
deployed.

Read the full PRD first:
`/Users/pk/Documents/obs-roswell/TAHARI/PRD/TAHARI-ISSUE-12170552235-pdp-04-buy-box-actions.md`
— specifically its "Fix Pass Scope (added 2026-07-29, after first live
review)" section, which has the full context for everything below. This
ticket was already built once (all 12 original ACs marked ✅) but never
live-verified before now — the user has since reviewed it live and found
real issues, which is what this pass fixes.

## Standing conventions for this project (apply throughout, not just here)

- **Comment brevity:** code comments should be short and WHY-only. Do
  NOT write "BUGFIX (date, ticket): [narrative]" comments documenting
  every fix as it happens — that history belongs in the vault decisions
  log, not inline in code. Only comment a genuinely non-obvious
  constraint a future dev would trip over, 1-3 lines max.
- **Web components preferred** for new PDP JS (real custom elements, not
  bare IIFEs) — this PRD already has the standing requirement section,
  follow it. If a real reason exists not to for a specific piece, STOP
  and confirm with the user before proceeding non-web-component.
- **PRD table checkmarks:** use the ✅ emoji for any new Dev/QA column
  entries, not the plain ✓ character — that's the project's current
  convention.
- **Shared-file changes are a conversation, not a subagent's call** —
  if a fix requires touching `assets/theme.dev.js`, `assets/theme.css`,
  or any other file used site-wide (not scoped to this PRD's own files),
  stop and confirm the scope with the user before making the change,
  same as this project's prior shared-file touches (documented in the
  vault decisions log).

## Your task, in order

### 1. Update the drawer architecture, starting with Notify Me

Build the new shared drawer/bottom-sheet shell decided in the PRD's Fix
Pass Scope section: one reusable component (native `<dialog>`-backed,
conceptually similar to `PopupComponent`'s open/close/focus-trap
behavior but NOT reusing its right-side-slide-in CSS — compose new
markup/CSS for a bottom sheet with a top drag-handle, matching Figma's
mobile color/size/notify-me screens). Build it with reuse in mind (a
future PLP quick-add drawer might plug into the same shell) but do NOT
build anything PLP-specific now — out of scope.

**First integration: move Notify Me into this drawer, both desktop AND
mobile.** No desktop Figma design exists for an inline email-capture
form (it currently renders inline and looks wrong per live review) — on
both breakpoints, the compact "Notify me" trigger should now open the
new drawer shell with the email form inside it (Figma node
`1117-15227` for the panel content itself). This replaces the existing
`data-always-open` `<klaviyo-bis-form>` panel's current inline-reveal
behavior for this specific usage — check whether `data-always-open` is
still the right mechanism once the panel lives inside a drawer instead
of inline, or whether that attribute's meaning needs to shift. Don't
break `product-buttons.liquid`'s existing (unrelated) usage of
`<klaviyo-bis-form>`, which never sets this attribute.

Then build the color and size drawers using the same shell (Figma nodes
`1117-15203` color, `1117-15214` size — both confirmed against Figma
already, re-verify yourself before trusting a secondhand description).

### 2. Fix the `variant--soldout` class bug

Real bug, confirmed live: for a URL-preselected OOS variant (test with
the OOS product URL above), Add to Bag correctly gets `disabled`
server-side, but whatever's supposed to add the `variant--soldout`
class (swapping in the sold-out/Notify-me row) never fires on initial
load — only the `--available` row shows. Diagnose root cause (check
`<product-info>`'s existing variant-change JS and whether it only fires
on a user-driven change event, not on initial connect for a
pre-selected variant) and fix it.

### 3. Klaviyo conflict — the "mock" Sold Out button workaround

Confirmed live (see PRD Fix Pass Scope for the full investigation):
Klaviyo's own onsite back-in-stock widget auto-detects the real
`button[type="submit"][name="add"]` inside `form[action="/cart/add"]`
(unavoidable — that's the standard Shopify convention, not something
in our control) and force-hides it, injecting its own competing button
into `#klaviyo-bis-button-container`. The OLD/live product page already
solves this with one CSS rule in `assets/product.css:927`:

```css
/* Hide default Klaviyo button */
#klaviyo-bis-button-container {
  display: none;
}
```

Two things to do, both required:
1. Port that same rule into the new PDP's own CSS
   (`assets/main-product-buy-buttons.css`) so Klaviyo's competing button
   is hidden here too, matching the old page.
2. **Build the visible "Sold Out" indicator as a separate element that
   Klaviyo's script can never target in the first place** — do NOT give
   it `type="submit"`, `name="add"`, or put it inside the `/cart/add`
   form. A `<button type="button" disabled>` outside the cart form (or
   an inert, correctly-ARIA'd non-button element) both work — prefer
   real button semantics for accessibility even though it's
   non-interactive by design. This is the actual fix — even with the
   CSS port from step 1, if the "real" Add to Bag button is what's
   supposed to visually represent "Sold Out," Klaviyo will still find
   and fight over it. The mock element sidesteps that entirely.

Wire this into the same show/hide toggle as the `variant--soldout` fix
above: {real Add to Bag + Buy Now} vs. {mock Sold Out indicator +
theme's own Notify Me trigger (which now opens the drawer from step 1)}.

### 4. Re-verify against Figma, both breakpoints

Use the corrected Figma node mapping from the PRD (mobile buy buttons
are the sticky footer node `1117:15181`, not the whole-page node cited
originally; desktop is the "Hero CTA" instance's nested "Frame 272"
card, not literal page chrome). Pull `get_design_context` yourself for
each node before trusting any prior description, including this one.

### 5. Deploy and do the full `/pdp-verify` loop

Merge into `pdp-combined`, deploy to `155392376969`, live-verify with
Playwright/browser tools:
- The OOS product URL above — confirm sold-out row shows correctly on
  load (not just after a manual variant change), confirm the mock Sold
  Out element and Klaviyo's widget don't visually collide, confirm
  clicking Notify Me opens the new drawer on both desktop and mobile.
- An available (in-stock) product — confirm Add to Bag / Buy Now still
  work end-to-end (this ticket's original ACs 2/3/5/9 were never live
  verified either — check them now if you have time, not required to
  block on it if the fix-pass items above take priority).
- Color/size drawers open and match Figma.
- Regression spot-check: this ticket's prior shared-file touches
  (`theme.dev.js`'s `ProductForm` submit-guard, `<klaviyo-bis-form>`'s
  `data-always-open` attribute) still don't affect any other
  `<product-form>`/`<klaviyo-bis-form>` usage site-wide.

## Report back

What you built for the drawer shell (file names, whether it ended up a
new custom element or extended something), pass/fail on each item above
with evidence (not just "looks good"), the `variant--soldout` bug's
actual root cause, confirmation the Klaviyo mock-button workaround
actually prevents the widget collision live (screenshot both states),
and update the PRD's AC table QA column + Implementation Notes with
what you verified. Flag anything you're unsure about rather than
guessing — this ticket has already had one round of "looked right
statically, wasn't" (the original zero-live-verification build), don't
repeat that pattern.
```
