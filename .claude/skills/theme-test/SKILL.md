---
name: theme-test
description: Test a Shopify theme in the browser with Playwright the way Patty expects: right preview theme, theme ID confirmed, environments compared the same way, production build for final checks. Use when reproducing a bug, verifying an AC on a dev or release theme, comparing live and dev, checking a deploy, or when Patty asks to "walk me through" or "test on the dev theme".
---

# Theme testing (Playwright)

## Right theme, every time

- **Always** add `?preview_theme_id=<theme id>` to the URL. The dev theme ID is in the repo's config or `CLAUDE.md`; ask if unsure.
- After every navigation, confirm `window.Shopify.theme.id` equals that ID. If it doesn't, stop and say so.
- **One preview theme at a time.** Shopify keeps one preview theme per browser session and the cookie persists. Never compare two themes in tabs. To compare against live, fetch it without cookies (`fetch(url, {credentials: 'omit'})`) and check the theme ID in the HTML.
- Bugs: confirm with Patty where the issue was reported (live, a release or preview theme, another environment) and reproduce it there first. Then compare that environment and dev with the same method.

## Builds and deploys

- **Final verification uses a production build** (`yarn build`). A dev build can be slow enough to change timing and show problems production doesn't have.
- Patty deploys builds to themes unless she gives explicit permission for a specific deploy.
- Before testing, confirm the deployed bundle has the change: the `bundle.js?v=` version changed, and a string from the new code or the rendered DOM is present. Uploads can lag a webpack rebuild.

## How to test

- Timing-dependent problems: repeat across page loads (cold and warm cache, private window and a regular one) and report counts, not one run.
- Request interception (`page.route`) disables the browser cache for the whole page and changes timing. For timing tests, intercept a single file with CDP `Fetch` instead.
- Screenshots: close popups that cover them. When the URL matters, show it (Playwright doesn't capture the browser's address bar; add one from `location.href`). Check each shot shows the state its caption claims.
- Patty watches the browser. When she asks for a walkthrough, run it slowly in the visible window and explain each step in plain language.

## Reporting

- Never say something was tested when it wasn't. If Patty sees something you can't reproduce, say so plainly and ask for what would help (a recording, the URL she landed on).
- Mark an AC's Dev column ✅ only after it's verified on the current code; record the evidence in the vault notes.
