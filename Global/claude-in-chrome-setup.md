# Claude in Chrome — Setup & Daily Use

## One-Time Setup

### 1. Launch isolated Chrome profile

Run this in Terminal:

```bash
open -na "Google Chrome" --args \
  --user-data-dir="$HOME/chrome-iso-profile" \
  --no-first-run \
  --no-default-browser-check
```

This opens a fresh Chrome window using an isolated profile at `~/chrome-iso-profile`, separate from your regular Chrome profile.

### 2. Install the extension

In the new Chrome window, go to:
`https://chromewebstore.google.com/detail/fcoeoabgfenejglbffodgkkbkcdhcgfn`

Click **Add to Chrome** and confirm.

### 3. Pin and sign in

1. Click the **puzzle piece icon** (top-right toolbar)
2. Find **Claude in Chrome** and click the **pin icon**
3. Click the **Claude icon** in the toolbar
4. Sign in with your Anthropic account

---

## Daily Use

Just rerun the launch command. The profile persists at `~/chrome-iso-profile` so Claude stays installed, signed in, and your MCP tab group is intact.

```bash
open -na "Google Chrome" --args \
  --user-data-dir="$HOME/chrome-iso-profile" \
  --no-first-run \
  --no-default-browser-check
```

### Shell alias (recommended)

Add this to your `~/.zshrc` so you can launch with a short command:

```bash
alias rs-claude-chrome='open -na "Google Chrome" --args --user-data-dir="$HOME/chrome-iso-profile" --no-first-run --no-default-browser-check'
```

Then run `source ~/.zshrc` once to activate it. After that, just type:

```bash
rs-claude-chrome
```

In a Claude Code session, prefix with `!`:

```bash
! rs-claude-chrome
```

---

## Using with Claude Code

The extension lets Claude Code control the browser — open URLs, read page content, click elements, fill forms, take screenshots.

Make sure the Claude icon in Chrome shows as **connected**, then ask Claude Code to interact with the browser directly in your session.

---

## Notes

- No need to remove the extension from your regular Chrome profile — the isolated profile is completely separate.
- Do **not** use `--disable-extensions-except` flag — Chrome's flag handling is unreliable with Web Store extensions and will prevent the extension from loading.
- Profile isolation alone provides the clean environment needed (no ad blockers, 1Password, etc. interfering with Anthropic auth).
