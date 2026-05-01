
# SAK — PDP Swatch Improvement Review
### AI Implementation Review (AIR) — Generated 2026-04-23

---

> **⚡ AUTOMATED BRIEF — PM CONFIRMATION RECOMMENDED BEFORE DEV STARTS**
> Copy the message in the Background section → paste to PM in Slack → proceed in 24hrs if no reply.

---

## Background:

**What AI built:** AJAX color swatch switcher on the PDP. Intercepts swatch clicks, fetches only the sections that change (gallery, price, ATC, swatches), swaps the DOM, and updates the URL — no full page reload.

**Why:** Full page reload on color change is slow and visually jarring. Client wants instant switching like True Classic Tees.

**Our job:** Code quality assessment, impact/risk check, validate it doesn't break anything. We are not rewriting it.

---

### Scope

**In scope:**
- Pull files from Shopify dev theme into branch
- Code read-through + integration map
- Functional validation (does swatch switching work correctly)
- Edge case testing (see Dev Notes)
- Integration check — Fastr slots, SS tabbed sections, analytics
- Fix any critical bugs found
- Fill in this ticket (Dev Notes, Bugs, Acceptance Criteria, Clarifying Questions)

**Out of scope — explicitly:**
- Initial page load speed improvement *(ticket acknowledges it stays the same — accepted)*
- SS tabbed section fixes *(known gap — will flag + open follow-up ticket)*
- Bundle builder / kit PDPs
- Collection page
- Cart drawer (beyond ATC button state on PDP)
- Analytics implementation *(gaps flagged only — client/analytics team to implement)*
- Accessibility audit, SEO remediation, code style refactor

---

### PM Confirmation Message
*(Optional but recommended — send before dev starts. No reply in 24hrs = proceed.)*

```
Hi [PM] — quick scope check before we start the PDP Swatch review. 30 seconds to read.
Reply only if something's wrong — otherwise we'll proceed in 24hrs.

WHAT WE'RE DOING
Reviewing the AI-built color swatch switcher on the PDP. We'll pull the files from the
dev theme, validate that swatch switching works correctly, test edge cases, check
third-party integrations (Fastr slots), and document findings back into the ticket.

WHAT WE'RE NOT DOING
- Initial page load speed (stays the same per ticket — not our concern)
- SS tabbed sections fix (known gap — will flag + create follow-up ticket)
- Bundle builder, collection page, or cart drawer
- Analytics implementation, accessibility audit, SEO remediation

ASSUMPTIONS WE'RE MAKING
- Browser targets: Chrome/Safari desktop + iOS Safari
- Analytics: GA4 + Meta Pixel — we'll flag gaps, not implement
- Fallback on fetch failure: silent no-op (page stays intact, no reload)
- "Validated" = functional, no critical bugs, edge cases documented
- Fastr slots: we'll verify they re-fire; classify as [FIX] or [FUTURE] based on complexity

ESTIMATED EFFORT
4–8 hrs (Tier 1–3 review + critical bug fixes)

Looks good? No reply needed. Something wrong? Just correct the specific item.
```

| Sent | PM Response | Changes made |
|---|---|---|
| | | |

---


## Necessary Info (Design/Documentation):

**Theme:** RS: release/SAK-2026.16 - PDP Var Change Test

| File | Purpose |
| --- | --- |
| `assets/sibling-color-swapper.js` | The brain — intercepts swatch clicks, prefetches on hover, swaps DOM, updates URL, re-fires Fastr slots |
| `sections/api-product-color-swap.liquid` | Lean Shopify section returning only above-fold content (gallery, title, price, ATC, swatches, tabs) — stripped down so the fetch stays small |

**Code Acquisition — do this first:**
Files are in the Shopify dev theme, not the repo. Pull before starting review.

```bash
# 1. Find the dev theme ID
shopify theme list

# 2. Pull the two files
shopify theme pull --theme <THEME_ID> \
  --only assets/sibling-color-swapper.js \
  --only sections/api-product-color-swap.liquid

# 3. Commit as-is before touching anything
git add assets/sibling-color-swapper.js sections/api-product-color-swap.liquid
git commit -m "chore: AI code snapshot pre-review — sibling-color-swapper + api-product-color-swap"
```

| File | Status |
|---|---|
| `assets/sibling-color-swapper.js` | ☐ Received / ☐ Missing |
| `sections/api-product-color-swap.liquid` | ☐ Received / ☐ Missing |

**Expected integration flow** *(verify against actual code after pull):*
```
Swatch click
  → sibling-color-swapper.js intercepts navigation
  → Prefetch fires on hover
  → Fetch → api-product-color-swap.liquid
  → Section returns: gallery, title, price, ATC, swatches, tabs
  → JS replaces DOM nodes
  → history.pushState() updates URL
  → Fastr slots re-fired
```


## Objective/Acceptance Criteria:

The following must be true before this ticket closes:

**Core functionality**
- [ ] Swatch switching works without a full page reload
- [ ] Gallery, title, price, ATC button, and swatches all update correctly on swap
- [ ] No JS console errors during normal use

**Edge cases**
- [ ] Rapid swatch clicking does not cause broken UI state (race condition handled)
- [ ] Out-of-stock swatches correctly disable the ATC button
- [ ] Variant with no image does not break the gallery
- [ ] Price updates correctly when variant has a different price
- [ ] Browser back button works as expected after a swap
- [ ] Failed network request does not break the page (graceful no-op)

**Integration**
- [ ] Fastr slots re-fire correctly after swap — or documented as a known gap with follow-up ticket
- [ ] SS tabbed sections gap is documented and a follow-up ticket is created

**QA**
- [ ] Tested: Chrome desktop, Safari desktop, iOS Safari
- [ ] All clarifying questions below are answered or explicitly deferred with a decision logged


## Dev Notes:

### Validation Checklist

**Tier 1 — Quick Scan** *(~30 min, always run)*
- [ ] No JS console errors on load or swatch click
- [ ] No broken references (missing DOM targets, undefined vars, 404 assets)
- [ ] No hardcoded dev URLs or test product handles
- [ ] Liquid section renders without errors
- [ ] Happy path works: click swatch → content updates, no reload

**Tier 2 — Functional**
- [ ] Swatch switching is consistent on repeat interactions
- [ ] Works on mobile / touch
- [ ] No visual layout shift or flash during swap
- [ ] Loading/pending state exists (or graceful no-op while fetch is in-flight)
- [ ] Graceful failure: 500 or offline → page stays intact

**Tier 3 — Edge Cases**

*Interaction*
- [ ] Rapid swatch clicks — last click wins, no broken state
- [ ] Click while fetch is in-flight — cancels or queues correctly
- [ ] Click the active swatch — no side effects
- [ ] Touch / swipe on mobile

*Inventory / Variant*
- [ ] Out-of-stock color → ATC disables
- [ ] Variant with no image → gallery doesn't break
- [ ] Variant with different price → price updates
- [ ] Variant with different available sizes → size selector updates

*Browser / Navigation*
- [ ] Back button after swap → goes to previous color, not previous page
- [ ] Direct link to color URL (e.g. `?variant=123`) → loads correctly on first paint
- [ ] Refresh after swap → correct color shown
- [ ] Open swatch URL in new tab → correct

*Network / Failure*
- [ ] Slow network → old content stays visible, no broken state
- [ ] Failed fetch (500, offline) → no page crash, silent no-op or controlled fallback
- [ ] Empty / malformed response → handled

*Third-Party*
- [ ] Fastr slots re-fire with correct slot IDs for new variant
- [ ] GA4 events fire on swap (or gap flagged)
- [ ] Meta Pixel fires on swap (or gap flagged)
- [ ] Rebuy / personalisation tools unaffected
- [ ] SS tabbed sections — identify which ones break, document for follow-up

*SEO*
- [ ] `pushState` URL matches Shopify variant canonical
- [ ] JSON-LD structured data — note if stale after swap (flag only, don't fix)

### Findings Log

| # | Finding | Tag | Priority |
|---|---|---|---|
| | | | |

**Tags:** `[FIX]` we fix it · `[FLAG]` client/PM decision · `[OOS]` out of scope, documented · `[FUTURE]` backlog


## Bugs from QA:

*(Populated during review — see Findings Log in Dev Notes above for classification)*

- TBD


## Clarifying Questions:

> Auto-generated assumptions below. Assumptions stand unless PM or client corrects them.

| # | Question | Assumption (proceed unless corrected) | Who confirms |
|---|---|---|---|
| 1 | Which Fastr slot IDs need to re-fire? How do we verify? | We'll identify from code + test manually | Client / Dev |
| 2 | Which SS tabbed sections are affected? Fix in scope? | **Out of scope** — flag + follow-up ticket | PM |
| 3 | Do GA4 / Meta Pixel events need to fire on swap? Which events? | **Assumed yes** — flag gaps, client team implements | Client |
| 4 | Fallback if fetch fails — reload, no-op, or error state? | **Assumed silent no-op** — page stays intact | Dev decision |
| 5 | Does `pushState` URL need to match Shopify variant canonical exactly? | **Assumed yes** — flag if it doesn't | Dev / SEO |
| 6 | Is there a designed loading state for the swap? | **Assumed none** — acceptable UX for speed gain | Design |
| 7 | Browser / device targets for QA? | **Assumed** Chrome/Safari desktop + iOS Safari | Client |
| 8 | Is the dev theme still live and accessible for testing? | **Assumed yes** — confirm before starting | Client |
