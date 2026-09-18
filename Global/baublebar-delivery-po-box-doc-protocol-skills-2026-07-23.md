# Session context — 2026-07-23 (BaubleBar delivery-customization work + documentation-protocol overhaul)

Recovery doc in case this conversation gets collapsed/summarized. Not committed to git (untracked, local only) — delete once no longer needed.

---

## 1. The actual code work (done, merged)

**Repo:** `BAUBLEBAR_CE_EXT`, extension `delivery-po-box-validation` (functionId `019ed740-b933-76bd-aa92-463f227dcaf6`).

- Added two config fields to `extensions/delivery-po-box-validation/src/cart_delivery_options_transform_run.ts`:
  - `restrictedStates` — treats `PR`/`AE`/`AA`/`AP` province codes exactly like PO Box addresses (only `protectedKeywords` [`Economy`] survives, everything else hidden, Economy pinned first).
  - `alwaysHiddenOptions` — hides listed rates (currently `["Economy"]`) unconditionally on non-PO-box/non-restricted addresses, regardless of buyer tag.
  - Both replicate the retired legacy Shopify Script `4/25/24 - Shipping + Hide Shipping for P.O. Box, Military, or Puerto Rico`. Precedence preserved: PO-box/restricted-state branch runs first, wins over tag-based logic.
  - Added `provinceCode` to the GraphQL input query to support this.
- Fixed `hide-delivery-by-line-prop`'s test harness (was using broken `runFunction` helper, fails loading `dist/index.wasm`; switched to working `execSync` pattern). Added 9 new fixtures (13 total).
- `delivery-po-box-validation` now has 55 fixture tests (added `l1`/`l2` for `alwaysHiddenOptions`, `m1`/`m2` for `restrictedStates`).
- Added `config`/`config:set` commands to `scripts/delivery-customization.ts` (view/update a live `deliveryCustomization`'s config metafield + title without delete/recreate).

**Merge status:**
- Function code + test-harness fix → merged to `main` via PR #17 (squash commit `2c0b323`), and reached `dev` via `release/BAUBAR-v2026.29`.
- `config:set` script addition (commit `eadce7d`) → **NOT merged anywhere**, only exists on `bug/economy-shipping`. Deliberately held back — user said: finish documentation work first, push scripts work after.

**Live config** on `gid://shopify/DeliveryCustomization/65241172`:
```json
{
  "protectedKeywords": ["Economy"],
  "enableDevTest": false,
  "devEmails": [],
  "buyerTagsToMatch": ["Employee", "Affiliate"],
  "tagHiddenOptions": ["Rush", "Economy", "2nd Day", "Overnight", "Surepost"],
  "reorderTagsToMatch": ["Employee", "Affiliate"],
  "reorderOptionKeyword": "Standard",
  "restrictedStates": ["PR", "AE", "AA", "AP"],
  "alwaysHiddenOptions": ["Economy"]
}
```
Title: "Show only Economy to PO Box/Military/PR + Hide Rush/2nd Day/Overnight/Surepost for Employee & Affiliate". Deployed and confirmed live.

**Ownership split (final, confirmed):**
| Scenario | Owner |
|---|---|
| PO Box / PR/AE/AA/AP → Economy only | `delivery-po-box-validation` |
| Non-restricted address → hide Economy | `delivery-po-box-validation` (`alwaysHiddenOptions`) |
| Employee/Affiliate → hide Overnight/2nd Day/Surepost | `delivery-po-box-validation` (`tagHiddenOptions`, pre-existing) |
| Employee/Affiliate → free ship on Standard | separate discount function (not modified this session) |
| MTO → hide Rush/Expedited | `hide-delivery-by-line-prop` |
| Hawaii → hide Rush/Get It By | **Checkout Blocks** (third-party app) — confirmed this is now the ONLY active Checkout Blocks delivery customization; its PR/AE/AA/AP rule was deactivated once our function went live |

**Known open issue (unresolved, not this session's bug):** Shopify has a platform bug where `delivery-po-box-validation` doesn't reliably re-trigger when a buyer edits address line 1/2/city (only province/postal-code edits reliably retrigger). `isPOBox()` reads address1/2 text so it's exposed; `restrictedStates` reads `provinceCode` so it's less exposed. A checkout UI "nudge" workaround was tested successfully on dev1; production deployment status is unconfirmed. Documented in `obs-roswell/BAUBAR/PO Box shipping validation - workaround investigation summary.md`.

---

## 2. CLAUDE.md work — IMPORTANT: location matters

**Per explicit instruction, all `CLAUDE.md` edits went into the worktree, NOT the main repo clone:**
- Worktree: `~/.superset/worktrees/BAUBLEBAR_CE_EXT/ordinary-comte`
- Branch: `chore/docs`
- Committed: `acf94d1` — "docs: migrate CLAUDE.md to vault-first documentation model" — **NOT pushed**

The main repo clone (`/Users/pk/Documents/roswell-studios/BAUBLEBAR_CE_EXT`, branch `bug/economy-shipping`) still has the **old, stale** `CLAUDE.md`. User explicitly said they'll handle branch syncing themselves — do not do it unprompted.

**What the worktree's `CLAUDE.md` now contains:**
- Vault-first callout (vault at `roswell-vaults/vaults/baublebar/`, this file is the technical-only subset).
- "Where Vault Context Lives" — vault-resolution algorithm (`$ROSWELL_VAULTS` env var → `../vault` symlink → search home → ask engineer) + mandatory frontmatter verification (`<vault>/01-mcd/mcd.md` must read `merchant: baublebar`) before trusting any path. Note: the `roswell-studios/vault` symlink at the parent dir level points to **hyperlite**, not baublebar — confirmed live bug this session.
- Known vault staleness note: `04-engineering/repos.md` doesn't list `BAUBLEBAR_CE_EXT`/`BAUBLEBAR_CE_EXT_CART_TRANSFORM`/`BAUBLEBAR_CE_UI_EXT_ONLY` at all (stale).
- "When Making Changes" — read vault first; honor do-not-touch **with an escape valve** (if legitimate reason to touch a do-not-touch item: stop, explain reasoning, get explicit confirmation before proceeding OR continuing to honor it — never proceed unilaterally either way); log decisions; reference issue IDs (guidance only, no CI enforcement here); mirror reusable engineering knowledge to vault flat files, not `.claude/context/`.
- Canonical-vs-mirrored table.
- Repo structure, API versions (unchanged from original).
- Global Constraints — original 6 gotchas preserved, plus 3 folded in from the now-superseded `.claude/context/extensions/dc-shipping-by-tag-code.md` (Rust `Option<T>` panic gotcha, comma-separated UI list fields, `DeliveryGroupTarget` targeting), plus 2 new ones added this session:
  - "Run existing tests after modifying a Shopify Function's logic" — run the extension's fixture suite before treating a change as done; a broken function doesn't fail loudly, people keep building on top of it.
  - (the pre-existing "do NOT use `runFunction`" one, unchanged)
- Removed: the old `.claude/context/extensions/` pointer, the absolute-path `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md` reference (non-portable), and an unverified "docs/ is team convention" line (removed after determining it was an inference presented as fact, never actually confirmed).

**`README.md`** (same worktree) also updated: cart-transform sibling-repo reference (`BAUBLEBAR_CE_EXT_CART_TRANSFORM` — note: actual GitHub repo name, not `bauble-bar-cart-transform` the local folder name), plus a one-line pointer to `CLAUDE.md`'s testing-guideline entry. This fix also exists independently on `bug/economy-shipping` (uncommitted-vs-worktree difference — not synced).

**Backup file** `CLAUDE.md.bak-2026-07-23` sits untracked in the worktree — fine to ignore/delete.

**`.claude/context/extensions/dc-shipping-by-tag-code.md`** — now fully superseded (content folded into `CLAUDE.md`). Never deleted — still sitting there as a stale artifact. User hasn't said whether to delete it.

---

## 3. Vault work (`roswell-vaults`) — committed AND pushed

- Repo: `~/WorkSpace/The_Intelligence_Layer/roswell-vaults`, branch `feature/pk-2` (pre-existing branch, NOT created this session — also has unrelated uncommitted work for `aed4life` and `elie-tahari` merchants that was deliberately left untouched).
- Commit `d09cac0f`, pushed to `origin/feature/pk-2`.
- `vaults/baublebar/02-decisions/decisions.md` — new entry "2026-07-23 — Extend `delivery-po-box-validation` to cover PR/AE/AA/AP and unconditional non-restricted-address Economy hiding." Covers config fields, precedence, ownership split (including the now-confirmed Checkout Blocks deactivation), live config retitle, test-harness fix. Trimmed per the decision-bearing/bookkeeping test (no fixture names/counts).
- `vaults/baublebar/04-engineering/scripts-functions-migration.md` — new §5 "Status update — 2026-07-23," added below the untouched sourced tracker tables. Flags a discrepancy (tracker recommends Checkout Blocks for the Employee/Affiliate discount; actual implementation uses a separate custom function), confirms Overnight/2nd Day/Surepost hiding is live, cross-references that `delivery-po-box-validation` (`BAUBLEBAR_CE_EXT`) and `Shipping Options` (`baublebar-checkout-extensibility`) are two separate extensions now overlapping in scope for PR/AE/AA/AP.
- Re-reviewed against the fully-finalized `CLAUDE.md`/protocol — no drift found, nothing further needed.
- Verified: this vault content is scoped entirely to the actual code work, zero mention of documentation-protocol meta-work.

---

## 4. Documentation-protocol docs (`obs-roswell/Global/`) — edited, NOT committed (unclear if git-tracked)

- **`Documentation Protocol.md`** — added the do-not-touch escape-valve paragraph (under "Kind of thing → Where it goes"), and the decision-bearing-vs-bookkeeping clarification under "Not verbose" in the Writing Discipline section. Revision History entries added for both (dated 2026-07-23), no origin-repo citation per user's request to remove those.
- **`claude-md-vault-update-prompt.md`** — do-not-touch escape valve added to Step 2's checklist. This is the file being wrapped into a proper skill right now (see §6).
- **`vault-migration-agent-prompt.md`** — same escape-valve addition to its Step 2.
- **`merchant-repo-claude-md-reference.md`** — pre-existing file (not created this session), do-not-touch escape valve added to item 5. This is the "current, corrected protocol" reference — `<vault>` notation, `$ROSWELL_VAULTS` resolution algorithm, frontmatter verification, no absolute paths, no "merchant-facing" mislabeling.
- **`shopify-function-qa-test-matrix-and-fixtures-prompt.md`** — new file, mirrors the promoted prompt (see §5), formatted to match the "copy this prompt" convention of its siblings, later edited to say "point your agent at this file" instead of "copy-paste."

---

## 5. `roswell-agency` work — two branches, both uncommitted-to-main

Repo: `~/WorkSpace/The_Intelligence_Layer/roswell-agency`.

**Branch `feature/prompt-shopify-function-testing`** (off `main`, fully contains `main`):
- Added `prompts/engineering/shopify-function-qa-test-matrix-and-fixtures-prompt.md` (promoted from `BAUBLEBAR_CE_EXT/docs/prompt-test-matrix-and-fixtures.md`, renamed for clarity, original left in place there).
- Pushed. **PR #244 open**: https://github.com/roswell-studios/roswell-agency/pull/244
- **STATUS: likely to be superseded** — decided to build this as a proper Claude Code skill instead (see §6). Open question for user: close PR #244 unmerged, or handle it themselves? Not yet resolved.
- Also has a later commit `f0b6b9a` fixing the same "copy-paste" → "point agent at file" wording, already pushed to this PR.

**Branch `feature/merchant-repo-template-vault-resolution`** (off `main`, in a separate new worktree `~/.superset/worktrees/roswell-agency/merchant-repo-template-vault-resolution`):
- Updates `patterns/merchant-repo-template/CLAUDE.md` (created by hughlim, commit `8c35abc`, sourced from "Cowork staging") to match the refined vault-resolution scheme: `<vault>` notation, `$ROSWELL_VAULTS` algorithm, frontmatter verification, do-not-touch escape valve, softened CI-enforcement claim (check `.github/workflows/` before asserting), fixed hardcoded sprint filename → directory pointer.
- Committed `0c1ce1a`. **NOT pushed.**
- Note: the user had their OWN old, forgotten, stale uncommitted diff on this same file (on the `feature/prompt-shopify-function-testing` branch in the main clone) — this was reverted/discarded (`git checkout main -- patterns/merchant-repo-template/CLAUDE.md`) since it predated and was superseded by the properly-refined version built in the new worktree.

---

## 6. `CLAUDE-RS_Claude_Code_Plugins` work — IN PROGRESS, multiple parallel worktrees

Repo: `~/Documents/roswell-studios/CLAUDE-RS_Claude_Code_Plugins`. Two plugins exist: `rs-shopify` (source `./`) and `rs-github` (source `./rs-github`). Skills auto-discovered from `skills/` folders at each plugin's source root — no explicit manifest registration needed, just folder placement + a README table entry.

**User's own pre-existing branch (DO NOT TOUCH):** `feature/skill-validator-code-input-testing`, checked out in the main clone. Builds `skills/rs-shopify-validator-code-input-testing/SKILL.md` (JSON-LD validation skill) — unrelated to this session's work, not merged into `dev`/`main` yet. This branch introduces the FIRST "Skills" table into `rs-shopify`'s README section (doesn't exist on `dev` yet).

**Branch `feature/skill-shopify-function-qa-test-matrix`** (worktree `~/.superset/worktrees/CLAUDE-RS_Claude_Code_Plugins/skill-shopify-function-qa-test-matrix`, off `dev`):
- Built `skills/rs-shopify-qa-test-matrix/SKILL.md` — converts the QA-test-matrix-and-fixtures prompt (§5) into a skill under `rs-shopify`.
- Committed `eb14da3`. **NOT pushed.**
- Also independently added its own new "Skills" table to README (since `dev` has none) — **will conflict with `feature/skill-validator-code-input-testing`'s table at merge time**, both introduce the same section independently. Flagged, not resolved.

**Two more subagents launched just before this context file was written — RESULTS UNKNOWN, CHECK TASK NOTIFICATIONS:**
1. Branch `feature/skill-claude-md-vault-migration` (worktree `~/.superset/worktrees/CLAUDE-RS_Claude_Code_Plugins/skill-claude-md-vault-migration`, off `dev`) — wraps the `claude-md-vault-update-prompt.md` 5-step workflow (audit → draft → **mandatory stop-and-confirm gate** → execute → report) as a skill. Told to independently judge whether it belongs under `rs-github` or warrants a new plugin, and to preserve every safety constraint (backup file, merge-not-overwrite, vault-existence check, frontmatter verification, do-not-touch escape valve, Writing Discipline).
2. Branch `feature/skill-vault-doc-mirror` (worktree `~/.superset/worktrees/CLAUDE-RS_Claude_Code_Plugins/skill-vault-doc-mirror`, off `dev`) — wraps the "mirror finished code work to the vault" habit (Documentation Protocol's End-of-Ticket checklist + decision-bearing/bookkeeping classification) as a **separate** skill from #1, since it fires on a completely different cadence (every ticket, vs. once-per-repo). Meant to work standalone in any project via manual invocation or `/loop`, independent of whether that project's `CLAUDE.md` needs migration at all. Also told to independently judge plugin placement.

**Both were told:** don't touch any other in-progress skill branch, confirm `dev` is current, create worktree+branch off `dev`, commit only (no push/PR), concise commit message (no verbose body — explicit user preference), report back worktree path / branch / skill name / plugin placement reasoning / any merge-conflict risk.

**Why two separate skills instead of one combined skill** (explicit design decision, confirmed with user): different trigger frequency (rare/one-time migration vs. constant every-ticket habit) and different scope — combining them would blur the `description` frontmatter signal Claude Code uses for auto-discovery.

**User's stated intent:** repeat the CLAUDE.md-vault-protocol-alignment work across BaubleBar's sibling repos (`BAUBLEBAR_CE_EXT_CART_TRANSFORM`, `BAUBLEBAR_CE_UI_EXT_ONLY`, `baublebar-checkout-extensibility`) once these skills exist, rather than manually repeating this whole session's process each time.

---

## 7. Open items / unresolved decisions

1. **PR #244** (roswell-agency) — close unmerged now that a skill supersedes the prompt file, or user handles it? Not decided.
2. **Skills-table merge conflicts** in `CLAUDE-RS_Claude_Code_Plugins` — at least 2-3 branches will independently introduce a new "Skills" section to the same README when merged. Not reconciled yet.
3. Whether to reduce/remove the `BAUBLEBAR_CE_EXT/docs/prompt-test-matrix-and-fixtures.md` and `obs-roswell/Global/shopify-function-qa-test-matrix-and-fixtures-prompt.md` copies now that a skill exists — only the `roswell-agency` copy's removal was discussed (via closing PR #244), not the other two.
4. `.claude/context/extensions/dc-shipping-by-tag-code.md` — superseded, never deleted. Never got a decision.
5. Main `BAUBLEBAR_CE_EXT` repo's `CLAUDE.md`/`README.md` (on `bug/economy-shipping`) — stale relative to the worktree. User said they'll sync branches themselves.
6. Nothing in `roswell-agency` or `CLAUDE-RS_Claude_Code_Plugins` has been pushed except `feature/prompt-shopify-function-testing` (both commits).

---

## 8. User preferences/working style, observed this session

- **Never** include `Co-Authored-By` trailers in commit messages — asked explicitly, multiple times.
- Wants **concise** commit messages — no verbose multi-paragraph bodies (corrected me once on this).
- Deliberate **stop-and-confirm gate** before any documentation-protocol file gets edited — never skip it, even when the change seems obvious.
- Strong aversion to **duplicate/unnecessary/verbose documentation** — pushed back multiple times to sharpen the "what belongs in a note" test; landed on the decision-bearing-vs-bookkeeping distinction (a constraint/value/reason belongs even if specific; an inventory artifact like exact fixture names/counts doesn't, because it carries no interpretive meaning and goes stale).
- **Git safety**: always check for unrelated uncommitted work before staging/committing (caught unrelated changes in both `roswell-agency` and `roswell-vaults` this session); never bundle unrelated changes into one commit.
- Prefers I **verify by reading actual files** rather than assert from memory — corrected me when I summarized instead of checking.
- **Worktree-based workflow**: `~/.superset/worktrees/{repo}/{branch-or-name}` pattern, `git worktree add -b {branch} {path} {base}`. Keeps unrelated work isolated per branch/worktree. Multiple parallel worktrees per repo are normal for this user.
- Wants forked subagents (not fresh ones) for background work that needs full session context; fresh/general-purpose agents only for self-contained tasks with no context dependency.
