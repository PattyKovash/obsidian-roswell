# Apple Silicon Migration Log — 2026-09-18

Machine migrated from Intel Mac to Apple Silicon (arm64). Rosetta is **not installed** — all tools must be native arm64.

---

## Pre-Migration State

Many CLI tools failed with `Bad CPU type in executable` because they were Intel (x86_64) builds from the old Homebrew at `/usr/local`. Key breakages:

- Old Intel Homebrew at `/usr/local/Cellar` (57 formulae, ~2 GB)
- Old Intel Homebrew cask: `1password-cli` at `/usr/local/Caskroom`
- Rust toolchain (`~/.cargo/bin/*`) — all x86_64
- Go binary (`/usr/local/go/bin/go`) — x86_64
- RVM Ruby 3.0.0 — x86_64
- 24 of 28 nvm Node versions — x86_64
- Old global npm packages in `/usr/local/lib/node_modules` and scattered across old nvm versions
- GUI apps (Orca, etc.) inherited `/usr/local/bin` first via `/etc/paths`, hitting x86 binaries
- Orca worktrees lost after reboot (metadata reset, git data intact on disk)

---

## Already Done Before This Session

1. Native Homebrew installed at `/opt/homebrew`, loaded via `eval "$(/opt/homebrew/bin/brew shellenv)"` in `~/.zprofile`
2. Installed natively via brew: `git`, `gh`, `node`, `coreutils`, `zsh-syntax-highlighting`, `mongosh`
3. Cleaned `~/.zshrc`: removed broken Mongo PATH, pointed zsh-syntax-highlighting at `/opt/homebrew/share`
4. Claude Code reinstalled at `~/.local/bin/claude` (arm64). Old wrapper moved to `~/.claude/bin.old`
5. Node 24.19.0 installed through nvm, set as default

---

## Changes Made In This Session

### 1. Verified node/npm/npx (arm64)

```
$ which node   → /Users/pk/.nvm/versions/node/v24.19.0/bin/node  (Mach-O arm64)
$ which npm    → /Users/pk/.nvm/versions/node/v24.19.0/bin/npm   (script)
$ which npx    → /Users/pk/.nvm/versions/node/v24.19.0/bin/npx   (script)
$ npm config get prefix → /Users/pk/.nvm/versions/node/v24.19.0
```

No npm prefix warnings. Clean.

### 2. Installed Orca CLI Skill

```bash
npx skills add https://github.com/stablyai/orca --skill orca-cli --global
```

Installed to `~/.agents/skills/orca-cli`. Symlinked into Claude Code and Pi. PromptScript failure is expected (doesn't support global install).

### 3. Confirmed Orca.app Is arm64

```
/Applications/Orca.app/Contents/MacOS/Orca: Mach-O 64-bit executable arm64
```

The CLI at `/usr/local/bin/orca` is a symlink to the app's shell wrapper script — works fine.

### 4. Installed arm64 Homebrew Formulae

```bash
brew install mkcert tree yarn zsh-completions heroku railway
brew install go
brew install --cask 1password-cli
```

`themekit` is no longer in Homebrew — discontinued by Shopify, replaced by Shopify CLI (`@shopify/cli`).

### 5. Installed Global npm Packages

```bash
npm install -g @shopify/cli lighthouse
```

Installed into nvm's v24.19.0 (`~/.nvm/versions/node/v24.19.0/lib/node_modules/`).

### 6. Reinstalled Rust Toolchain (arm64)

Old x86_64 rustup couldn't run without Rosetta, so manual cleanup:

```bash
rm -rf ~/.cargo/bin/*
rm -rf ~/.rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

Result: `rustc 1.98.1 (48a229cea 2026-09-01)` — `aarch64-apple-darwin`.

### 7. Updated `/etc/paths`

**Why:** GUI apps (Orca, VS Code, Docker, etc.) get their PATH from `/etc/paths` + `/etc/paths.d/`, not from shell profiles. The old `/etc/paths` had `/usr/local/bin` first, so GUI apps found x86 `git` before arm64 `git`, causing Orca's `spawn Unknown system error -86` (EBADARCH).

**Before:**
```
/usr/local/bin
/System/Cryptexes/App/usr/bin
/usr/bin
/bin
/usr/sbin
/sbin
```

**After:**
```
/opt/homebrew/bin
/opt/homebrew/sbin
/usr/local/bin
/System/Cryptexes/App/usr/bin
/usr/bin
/bin
/usr/sbin
/sbin
```

**Command used:**
```bash
sudo sh -c 'printf "/opt/homebrew/bin\n/opt/homebrew/sbin\n/usr/local/bin\n/System/Cryptexes/App/usr/bin\n/usr/bin\n/bin\n/usr/sbin\n/sbin\n" > /etc/paths'
```

**To revert:**
```bash
sudo sh -c 'printf "/usr/local/bin\n/System/Cryptexes/App/usr/bin\n/usr/bin\n/bin\n/usr/sbin\n/sbin\n" > /etc/paths'
```

Note: `/etc/paths.d/homebrew` still exists with `/opt/homebrew/bin` — now redundant but harmless. Can be removed with `sudo rm /etc/paths.d/homebrew`.

### 8. Backed Up MongoDB Data

```bash
cp -a /usr/local/var/mongodb ~/mongodb-backup-2026-09-18
```

211 MB, ~9 databases, 121 WiredTiger collection files. Last activity: 2026-09-17 (day before migration).

### 9. Edited `~/.zshrc`

Four changes:

| Line | Change | Reason |
|------|--------|--------|
| 83 | Commented out `export PATH=$PATH/.nvm/versions/node/v13.8.0/bin/slate` | Slate is discontinued; path was malformed (missing `:` separator) and referenced x86 Node v13.8.0 |
| 235 | Split `alias h2='...'export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"` into two lines | Concatenated onto one line, breaking both the alias and the export |
| 236 | Removed `export GEMINI_API_KEY="AIzaSy..."` | API key exposed in plain text — needs rotation regardless |
| 254 | Removed duplicate `export PATH="/Users/pk/.local/bin:$PATH"` (Antigravity CLI) | Already added on line 244; `typeset -U` on line 259 dedupes anyway |

### 10. Restored Orca Worktrees

After restarting Orca (to pick up the new `/etc/paths`), set base refs and Orca auto-detected the existing git worktrees:

```bash
orca repo set-base-ref --repo "id:587cc448-..." --ref main    # Elie_Tahari_TAHARI_2026
orca repo set-base-ref --repo "id:bd97bf29-..." --ref main    # SocialThreads_THREADS
```

All 7 active worktrees restored:

| Repo | Worktree | Branch |
|------|----------|--------|
| TAHARI | feature-TAHARI-grid-layout-default | develop/feature/TAHARI-12729151257-UAT |
| TAHARI | TAHARI-mobile-slider | develop/feature/merge-rc-to-dc-2026-09-16 |
| TAHARI | TAHARI-PDP-zoom-modal-v3 | develop/feature/TAHARI-13008135199-zoom-modal-v3 |
| TAHARI | TAHARI-transparent-header | feature/TAHARI-12831158315-shop-the-look |
| THREADS | THREADS-cart-bubble-migration | develop/_candidate |
| THREADS | THREADS-release | release/_candidate |
| THREADS | THREADS-seo-dc | develop/feature/THREADS-12906260821-plp-schema |

### 11. Xcode Updated

Updated from 26.5 → 27.0 (Build 27A266a) via App Store. Required for `brew install` of source-only formulae (like `mongodb-community`) on macOS 27.

---

### 12. Command Line Tools Updated

Reinstalled CLT for Xcode 27.0 (version 27.0.0.0.1788430756). Old CLT was blocking `brew install` of source-only formulae.

```bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

### 13. MongoDB Community Installed (arm64)

```bash
brew install mongodb/brew/mongodb-community   # 8.3.11, arm64
```

Copied old data to new location and started the service:

```bash
cp -a /usr/local/var/mongodb/* /opt/homebrew/var/mongodb/
rm -f /opt/homebrew/var/mongodb/mongod.lock
brew services start mongodb/brew/mongodb-community
```

Server is running with old data. Auth is enabled — old credentials required to access databases. Backup remains at `~/mongodb-backup-2026-09-18`.

### 14. Ruby 3.3.0 Installed (arm64)

Ruby 3.0.0 was x86_64 and EOL. RVM demanded `openssl@1.1` (removed from Homebrew). Updated RVM and installed 3.3.0 with `--autolibs=disable`:

```bash
rvm get stable
brew install autoconf automake libtool pkg-config libyaml libksba zlib
rvm install 3.3.0 --with-openssl-dir=$(brew --prefix openssl@3) --autolibs=disable
rvm use 3.3.0 --default
```

Result: `ruby 3.3.0` — Mach-O arm64. Set as default.

### 15. Orca CLI Symlink Added to `/opt/homebrew/bin`

Orca's installer placed its CLI symlink at `/usr/local/bin/orca`. Created a duplicate at the arm64 Homebrew location so it resolves from either path:

```bash
ln -s /Applications/Orca.app/Contents/Resources/bin/orca /opt/homebrew/bin/orca
```

---

## Still Pending (Optional)

### Old nvm Node Versions

24 x86_64 Node versions remain in `~/.nvm/versions/node/`. Left in place by choice — they can't run without Rosetta, but don't interfere. Projects use project-local `node_modules/` which are architecture-independent. To clean up later:

```bash
# Remove all x86 versions (keeps v18.17.1, v22.22.0, v24.14.1, v24.19.0 which are arm64)
for v in v8.3.0 v10.16.0 v10.16.3 v10.24.1 v11.14.0 v12.13.0 v12.16.2 v12.20.1 v12.22.1 v13.8.0 v14.0.0 v14.16.0 v14.18.2 v14.19.1 v16.5.0 v16.15.0 v18.12.1 v18.20.8 v20.5.0 v20.6.1 v20.10.0 v20.15.1 v20.18.3 v22.5.0; do
  nvm uninstall "$v"
done
```

### Docker Broken Symlinks

`~/.docker/bin/com.docker.cli` and `~/.docker/bin/docker-index` point to files Docker Desktop no longer ships. Harmless — Docker itself is arm64. Will self-heal on next Docker Desktop update, or:

```bash
rm ~/.docker/bin/com.docker.cli ~/.docker/bin/docker-index
```

### Google Cloud SDK

Located at `~/Downloads/google-cloud-sdk`. Python-based — runs on the universal (arm64+x86) Python 3.11/3.13 framework. No action needed.

### Old Intel Homebrew (`/usr/local`) — Left in Place

Decision: keep `/usr/local` as-is. The x86 binaries can't run without Rosetta and are fully shadowed by `/opt/homebrew/bin` (higher priority in `/etc/paths` and shell PATH). No risk of accidentally using them — they crash with "Bad CPU type" if invoked directly. Takes ~2 GB disk space.

MongoDB data has been copied to `/opt/homebrew/var/mongodb` and is running from there. Backup at `~/mongodb-backup-2026-09-18`.

To clean up later if desired:

```bash
sudo rm -rf /usr/local/Homebrew /usr/local/Cellar /usr/local/Caskroom
sudo rm -rf /usr/local/var/homebrew /usr/local/var/mongodb
sudo rm -rf /usr/local/go
# Review /usr/local/bin before deleting — orca symlink now also at /opt/homebrew/bin/orca
ls /usr/local/bin/
```

### zsh-completions Setup

After installing `zsh-completions`, add to `~/.zshrc` if not already present:

```zsh
if type brew &>/dev/null; then
  FPATH=$(brew --prefix)/share/zsh-completions:$FPATH
  autoload -Uz compinit
  compinit
fi
```

Then rebuild the completion cache:

```bash
rm -f ~/.zcompdump; compinit
```

If you get "insecure directories" warnings:

```bash
chmod go-w '/opt/homebrew/share'
chmod -R go-w '/opt/homebrew/share/zsh'
```

---

## Rollback Notes

| Change | How to Revert |
|--------|---------------|
| `/etc/paths` | `sudo sh -c 'printf "/usr/local/bin\n/System/Cryptexes/App/usr/bin\n/usr/bin\n/bin\n/usr/sbin\n/sbin\n" > /etc/paths'` |
| Rust reinstall | Already done; old x86 binaries are gone. If needed: `rustup toolchain install stable-x86_64-apple-darwin` (requires Rosetta) |
| Ruby 3.3.0 | `rvm use 3.0.0 --default` to switch back (3.0.0 is x86 and won't run). `rvm remove 3.3.0` to uninstall |
| `~/.zshrc` edits | `git` doesn't track it; no automatic rollback. Changes were minor (commenting, line splitting, removing a key) |
| Homebrew formulae | `brew uninstall <formula>` to remove any |
| npm globals | `npm uninstall -g @shopify/cli lighthouse` |
| MongoDB data | Original at `/usr/local/var/mongodb`, backup at `~/mongodb-backup-2026-09-18`, active copy at `/opt/homebrew/var/mongodb` |
| MongoDB service | `brew services stop mongodb/brew/mongodb-community` to stop; `brew uninstall mongodb-community` to remove |
| Orca symlink | `rm /opt/homebrew/bin/orca` to remove; original at `/usr/local/bin/orca` still exists |
| Orca worktrees | Re-register with `orca repo set-base-ref` + restart Orca if lost again |
| CLT | `sudo xcode-select --install` if CLT needs reinstalling |

---

## Session Reference

Claude Code session ID: `55da232b-9948-4b10-89d6-59bce61761bc`
Project: `pod.wonchih`
Date: 2026-09-18
