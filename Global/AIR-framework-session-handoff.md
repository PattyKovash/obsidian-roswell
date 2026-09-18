# Session Handoff — AIR Framework Build
**Date:** 2026-05-04
**Project:** Roswell Studios — Internal Process / SAK Client

---

## What This Session Was About

We built a repeatable framework called **AIR (AI Implementation Review)** — a structured process for when a client uses AI to build something and Roswell needs to validate it. The problem we solved: "validate" was undefined — no one knew how much effort to put in, what to test, or what was out of scope.

---

## What Was Built

### 1. AIR Framework (master template)
**File:** `/Users/pk/Documents/roswell-studios/the-sak-vite/.claude/worktrees/vibrant-babbage-340452/AI-REVIEW-FRAMEWORK.md`

A reusable, copy-per-engagement doc with:
- **Phase 0** — Engage & Define (before touching code)
- **Phase 0.5** — PM Confirmation *(optional, recommended)* — auto-generated Slack message, silence = approval in 24hrs
- **Phase 1** — Code Acquisition (explicit step — code often lives in Shopify theme, not repo)
- **Phase 2** — Orientation Read (map before judging)
- **Phase 3** — Validation Tiers 1–5 (scaled effort: quick scan → code quality)
- **Phase 4** — Findings Classification (`[FIX]`, `[FLAG]`, `[OOS]`, `[Q]`, `[FUTURE]`)
- **Phase 5** — Deliverable (fills back into ticket)
- **Automation Summary table** — what AI generates vs. what stays human
- **Effort Estimation Guide**

Key design decisions baked in:
- Scope Contract is signed before any work starts
- Out of scope is **explicitly named**, not implied
- Code Acquisition is its own phase (often skipped — don't)
- Open questions become **documented assumptions** (assumption engine) instead of blockers
- PM Confirmation is optional but recommended — pre-written message, no reply = proceed

### 2. AIR Applied — SAK PDP Swatch Ticket
**File:** `/Users/pk/Documents/obs-roswell/SAK/AIR/sak-11829903383-air-review.md`

The framework instantiated for ticket `sak-11829903383` (PDP Swatch Improvement Review), formatted to match the **Monday.com ticket template** (`/Users/pk/Documents/obs-roswell/Base Monday Ticket Template.md`).

Sections filled in:
- Background + scope contract + PM Slack message (ready to copy-paste)
- Necessary Info + code acquisition steps (Shopify CLI commands, file table)
- Objective/Acceptance Criteria (concrete checkbox list, replaces "TBD")
- Dev Notes (tiered validation checklist + edge cases + findings log table)
- Bugs from QA (template ready, populated during review)
- Clarifying Questions (8 questions with pre-filled assumptions — dev can start without waiting)

---

## The SAK Ticket Context (for reference)

**Ticket:** SAK — PDP Swatch Improvement Review (`sak-11829903383`)
**What AI built:** AJAX color swatch switcher. Intercepts swatch clicks → fetches only changed sections → swaps DOM → pushState URL. No full page reload.
**Files:** `assets/sibling-color-swapper.js` + `sections/api-product-color-swap.liquid`
**Where files live:** Shopify dev theme (NOT in repo yet — must pull via `shopify theme pull`)
**Branch:** RS: release/SAK-2026.16 - PDP Var Change Test
**Known gaps:** SS tabbed sections don't work with the swap yet

---

## What Still Needs to Happen

### Immediate — on the SAK ticket
- [ ] Send PM Confirmation message (copy from `sak-11829903383-air-review.md` Background section)
- [ ] Get dev theme ID from client → run `shopify theme pull` to acquire files
- [ ] Run through validation tiers (Tier 1–3 minimum)
- [ ] Fill in Bugs from QA + Dev Notes findings as review progresses
- [ ] Open a follow-up ticket for SS tabbed sections fix
- [ ] Confirm answers to 8 clarifying questions (or let assumptions stand)

### Framework — ongoing
- [ ] Decide on the standard input method for Monday tickets (can't auth into Monday.com directly):
  - **Option A:** Export/copy text from Monday → paste into chat
  - **Option B:** Save ticket as `.md` file locally first (current approach — works well)
- [ ] Move master framework file (`AI-REVIEW-FRAMEWORK.md`) to a permanent home (currently in a worktree). Suggest: `/Users/pk/Documents/obs-roswell/Global/AIR-framework.md`
- [ ] Consider building this as a Claude skill so any agent can invoke it with `/air` + ticket text
- [ ] Consider adding a Monday.com MCP integration so tickets can be read/written directly

---

## Key Decisions Made

| Decision | Outcome |
|---|---|
| What "validate" means | Tiered: Tier 1 always, Tier 2 always, Tier 3+ scoped per engagement |
| Open questions | Replaced with documented assumptions; PM/client corrects if wrong |
| PM sign-off | Optional but recommended; pre-written message; 24hr silence = go |
| Code acquisition | Always explicit Phase 1; check where files actually live before starting |
| Out of scope | Always explicitly named — not implied |
| Monday.com access | Can't auth; use local `.md` files or paste ticket text |
| Output format | Mapped to Monday ticket template (`Base Monday Ticket Template.md`) |

---

## Files Created This Session

| File | Purpose |
|---|---|
| `/Users/pk/Documents/roswell-studios/the-sak-vite/.claude/worktrees/vibrant-babbage-340452/AI-REVIEW-FRAMEWORK.md` | Master reusable AIR framework template |
| `/Users/pk/Documents/obs-roswell/SAK/AIR/sak-11829903383-air-review.md` | AIR applied to SAK PDP swatch ticket, in Monday format |
| `/Users/pk/Documents/obs-roswell/Global/AIR-framework-session-handoff.md` | This file |
