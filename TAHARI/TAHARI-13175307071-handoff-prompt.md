Continuing TAHARI-13175307071 — Nosto Search for Elie Tahari.

**Read `docs/TAHARI-13175307071-context.md` first** — the "CURRENT STATE — 2026-10-22" section at the top. Everything below is in there in more detail.

**Where things stand.** Nosto search is live and rendering on the `nosto/_candidate` theme. The full chain works: our code → CI → Nosto preview → live deployment → theme mounts → theme-rendered cards. The account (`shopify-35089973385`) is provisioned, CI/CD is wired and proven, and three facet groups are configured in Nosto Admin.

**Do the visual comparison yourself in Playwright** — don't ask Patty to describe differences you can measure. For each issue, load the live theme, capture what it does (screenshot, computed styles, DOM), then load ours and compare.

**Every check covers mobile and desktop**, not desktop alone — at minimum 390px and 1440px, plus 820px and 1100px when layout changes at the theme's 750 / 990px breakpoints. Compare live and Nosto at the same widths.

**Shopify allows only ONE preview theme at a time**, so you cannot have both open at once — check one, then the other, sequentially. **Always pass `preview_theme_id` explicitly on every URL, including for the live theme**: a lingering preview cookie from a previous navigation will silently put you on the wrong theme. Confirm `window.Shopify.theme.id` matches what you asked for before trusting anything on the page.

- Live theme (Shopify search, the reference): `?preview_theme_id=157927932041`
- Nosto candidate theme (ours): `?preview_theme_id=157709861001`

e.g. `https://www.elietahari.com/search?q=dress&preview_theme_id=157927932041`

**The governing rule:** Elie Tahari's own functionality and styling is the spec. The BaubleBar_Nosto repo (`~/Documents/roswell-studios/BaubleBar_Nosto`, and a snapshot on our `reference/baublebar-nosto` branch) is another dev's working implementation — borrow its structure, mechanisms and solved problems freely, but never its behaviour or look. Where they differ, ET wins.

**Your task: refine autocomplete and filters.** Four known issues, written up with file-and-line pointers and initial diagnosis under "Known issues to fix next" in the context doc:

1. Autocomplete card size differs from the live dropdown
2. Autocomplete term highlighting and font formatting missing
3. Filter colour swatches missing — note BaubleBar's approach will NOT work here; ET uses Shopify's native filter swatch data, so this needs designing rather than porting
4. Filter "Size" values differ from what the theme displays — may be Nosto indexing config rather than our code, so check before assuming

Also open: Nosto returns 85 results for "dress" where Shopify returns 376. Worth understanding before anyone reviews the page — likely mostly that Shopify counts pages/articles and matches more fields, plus our `hide`-tag prefilter, but that's unconfirmed.

**Three things that will save you time:**

- **Verify in the browser, not just by test.** Two bugs shipped past lint, typecheck, 199 unit tests and `shopify theme check` on 2026-10-22: a Liquid syntax error that made Shopify silently reject a file on upload, and HTML entities from Shopify's `t` filter rendering literally. Both only showed on the real page.
- **The filter drawer is the riskiest untested piece.** It reimplements Broadcast's collapsible behaviour — including a string `open="true"` attribute the CSS keys off — reverse-engineered from BaubleBar's theme JS, not ET's. It has never been visually QA'd.
- **Playwright theme discipline** — see the comparison note above. One preview theme at a time, explicit `preview_theme_id` on every URL, verify `window.Shopify.theme.id`.

**Documentation protocol — this engagement has one, follow it.** Spec: `/Users/pk/Documents/obs-roswell/Global/Documentation Protocol.md`.

- **The merchant vault is canonical** for the MCD, decisions, the do-not-touch list and reusable patterns: `~/WorkSpace/The_Intelligence_Layer/roswell-vaults/vaults/elie-tahari/`. The vault wins on any conflict with repo docs.
- **Reusable mechanisms go in `04-engineering/patterns/{topic}.md`**, and the code gets a short comment pointing at it — not the full reasoning in both places. The Nosto architecture already has one: `patterns/nosto-search-templates.md`. Extend it rather than starting a new doc for the same area.
- **Log a decision in `02-decisions/decisions.md` only when a real alternative was on the table** — dated, with Context / Options considered / Decision / Reasoning / Recorded by. Routine work doesn't get an entry.
- **A newly found "do not touch" zone goes in `01-mcd/do-not-touch.md`**, not into a repo CLAUDE.md.
- **Writing discipline:** write for the next session, not as a record of this one. Not verbose, no play-by-play, no editorialising, and never state something you haven't verified — flag inference as inference.
- **Committing the vault:** stage only `vaults/elie-tahari/` paths (Patty has unrelated work in that clone), message style `docs(elie-tahari): … (TAHARI-13175307071)`, and push when asked.
- **`docs/TAHARI-13175307071-context.md` in this repo is the working record.** Update it at decision points and when something lands, so a handoff is always current.
- If a PRD is needed, author it with `/Users/pk/Documents/obs-roswell/Ticket Authoring Prompt v2.md`.

**Don't change without asking:** the agent skills in `.claude`/`.agents`, and the pinned `@nosto/*` package versions (deliberately matching BaubleBar's working set).

Working branches: `feature/TAHARI-13175307071-search-template` here, `nosto/feature/TAHARI-13175307071-search-template` in the theme worktree at `~/Documents/roswell-studios/Elie_Tahari_TAHARI_2026-nosto-search`. All three repos (here, theme, vault) are committed and pushed.
