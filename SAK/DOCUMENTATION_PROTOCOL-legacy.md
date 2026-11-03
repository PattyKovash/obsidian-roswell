> **Archived — superseded, 2026-07-10.** This was `the-sak-vite:.claude/DOCUMENTATION_PROTOCOL.md`, the repo-local governing doc for The Sak's now-abandoned per-repo scoped-context scheme (`.claude/context/{area}.md`). Moved here (not deleted) at Patty's request when the repo migrated to the real vault-first protocol at `obs-roswell/Global/Documentation Protocol.md`.
>
> Two things from this file were genuinely unique (not covered by the Global protocol) and were preserved forward rather than lost:
> - The **"Shopify-Specific Rules"** section → folded into `the-sak-vite:CLAUDE.md` as a "Shopify-Specific Gotchas" section (Shopify/theme-repo-specific, not appropriate for the cross-merchant Global doc).
> - The **third-party-integration-file-promotion threshold** (when a section in `third-party.md` earns its own dedicated doc) → generalized into `obs-roswell/Global/Documentation Protocol.md`'s new "Why Files Stay Small — the Context Budget Principle" section, since the underlying idea (split by topic once a doc gets too large to load economically) applies beyond third-party integrations.
>
> Everything else in this file (core principle, ticket start/end checklists, comment format, failure signals) restates what the real Documentation Protocol already covers — just in the superseded scoped-file frame. Kept here for reference/history only; do not treat as current.

---

# Documentation Protocol

This file governs how documentation is maintained in this project. It applies to every ticket regardless of scope.

---

## The Core Principle

Documentation is infrastructure, not debt. The codebase must always be in a state where a replacement engineer or a fresh AI agent session could be productive within a day — no knowledge transfer required.

Every constraint discovered, every "do not touch" zone identified, every non-obvious architectural decision made during a ticket must be recorded before the PR is raised.

---

## Project Structure (Shopify Theme)

This is a Shopify theme project (not a Remix app). The two-layer documentation structure maps to theme concerns:

| Layer | What it covers |
|---|---|
| **Global** — `CLAUDE.md` + this file | Commands, architecture overview, global constraints, session start protocol. Always loaded. Always short. |
| **Scoped** — `.claude/context/*.md` | One file per major feature area or integration. Loaded only when a ticket touches that area. |

**Scoped context files to create as the project grows:**

| File | Load when ticket touches |
|---|---|
| `.claude/context/sibling-color-swapper.md` | `sibling-color-swapper.js`, `api-product-color-swap.liquid`, color-swap UX |
| `.claude/context/bundle-builder.md` | `src/components/bundleBuilder/`, GBB Mix integration |
| `.claude/context/cart.md` | Cart drawer, `io.ts`, cart events, cart bar |
| `.claude/context/pdp.md` | `sections/product.liquid`, product form, variant selection, BIS |
| `.claude/context/third-party.md` | SearchSpring, Fastr, Yotpo, TrueFit — and pointer index for integrations with their own context files |
| `.claude/context/klaviyo-bis.md` | `SakBisModal.tsx`, `rs-klaviyo-bis.liquid`, `rs-klaviyo-trigger.liquid`, BIS modal UX, Klaviyo Client API |
| `.claude/context/purple-dot.md` | `purple-dot.liquid`, `.pd-waitlist-info-container`, pre-order button behavior, `_reinitPurpleDot()`, `pd-style-*` CSS class |

**Breaking a third-party integration into its own context file:**

When a third-party integration grows complex enough to warrant its own context file (custom architecture, multiple DO NOT rules, non-trivial API contract), move the detail out of `third-party.md` and into a dedicated file. When you do:

1. Replace the section in `third-party.md` with a one-paragraph summary and an explicit pointer: `Full context: .claude/context/{name}.md`
2. Add the new file to the table above with its load trigger
3. The pointer in `third-party.md` must always be kept — it is the index entry that tells a future agent the dedicated file exists

---

## What to Update and When

### CLAUDE.md — update after every ticket if any of the following are true

- A new constraint was discovered that AI would violate without knowing it
- A new "do not touch" zone was found (file, snippet, section, or integration that breaks something live)
- The tech stack changed (new dependency, deprecated pattern, Shopify API change, Vite config change)
- A performance baseline shifted
- A third-party app integration conflict was uncovered
- A Shopify platform behavior was found to differ from expected (Section Rendering API, metafield access, etc.)

Two sprints without any change to `CLAUDE.md` or a scoped context file is a signal that documentation discipline has eroded.

### Scoped context files — update when the ticket touches that area

If work on the color swapper reveals a new constraint, update `.claude/context/sibling-color-swapper.md`. If work on the bundle builder reveals something new, update `.claude/context/bundle-builder.md`. Documentation lives closest to the area it describes.

### Code comments — write for two audiences

Comments serve human engineers and future AI sessions simultaneously. A comment that explains *why* a decision was made prevents a human from second-guessing it and prevents an AI from optimizing it away.

**Comment when:**
- A pattern deviates from what a Shopify theme engineer would produce by default
- A known-safe approach was chosen over a more obvious one due to a third-party conflict or Shopify platform constraint
- A Shopify section, snippet, or JS integration has a non-obvious failure mode already encountered

**Format:**
```
// DO NOT [alternative approach].
// [Specific reason: third-party conflict, Shopify platform constraint, or known failure mode].
// Validated [date]. See [context file] for full context.
```

Do not comment to describe what the code does. Comment only to explain why it does it this way instead of the obvious alternative.

---

## Shopify-Specific Rules

- **Section Rendering API returns null for app-owned sections** (Fastr, SearchSpring, Klaviyo widgets). Do not attempt to fetch these via `?sections=`. Document any workaround in the relevant context file.
- **Custom element `connectedCallback` fires on DOM insertion**, not page load. Any section swap that inserts a `<product-form>` or similar custom element will trigger its init logic immediately. Document timing-sensitive patterns.
- **Metafield dot notation does not support hyphenated keys.** Use bracket notation: `product.metafields.global['key-name']`.
- **`defer` scripts on Shopify templates**: Scripts loaded with `defer` in `theme.liquid` run after DOMContentLoaded. Scripts loaded via `{% javascript %}` in a section run inline. Do not assume execution order without checking.
- **Theme environments**: `development`, `staging`, and `default` (production) are defined in `shopify.theme.toml`. Never deploy to production without a staging verification step.

---

## At the Start of Every Ticket

Load `CLAUDE.md` first. Based on the ticket area, load the relevant scoped context file from `.claude/context/`. No additional action required.

---

## At the End of Every Ticket

Before raising a PR, run this documentation check:

| Question | Action if yes |
|---|---|
| Did I discover a new constraint the next engineer needs to know? | Add to `CLAUDE.md` global constraints or the relevant scoped context file |
| Did I write code that deviates from documented patterns? | Add an inline comment explaining the one-off, or update the pattern in the context file |
| Did I find a new "do not touch" zone? | Add it to the relevant context file with the reason |
| Did I update a dependency, Shopify API version, or Vite config? | Update the relevant context file |
| Are there non-obvious decisions in my diff with no comments? | Add comments before the PR is raised |
| Did I change how a third-party app (SS, Klaviyo, Fastr, Yotpo) is initialized or re-initialized? | Update `.claude/context/third-party.md` |

---

## Per-Ticket Documentation (for new features)

For any ticket that adds a meaningful new capability, create or update a brief entry in the relevant scoped context file describing:

- What was built and where it lives
- Any constraints or gotchas discovered during implementation
- Any "do not touch" zones created as a result

This is not a changelog. It is a forward-looking constraint record for the next agent or engineer who touches this area.

---

## Failure Signals

- An AI session produces code that touches a known "do not touch" zone — because that zone was not in any context file
- A new engineer asks a question already answered by a previous decision — because that decision was not commented
- Two sprints pass without any update to any context file
- A PR introduces a pattern that deviates from documented conventions without explanation
- A third-party integration breaks after a swap because a reinit step was not documented
