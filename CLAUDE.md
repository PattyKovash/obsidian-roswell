# obs-roswell — Agent Instructions

Patty's personal Obsidian vault: notes, PRDs and research per client, plus her personal Claude Code skills.

**Skills commit path:** Personal skills live at `obs-roswell/.claude/skills/<name>/SKILL.md`, symlinked from `~/.claude/skills/<name>` so Claude Code loads them. Edit and commit them here, never through `~/.claude` (the symlinks aren't tracked):
```bash
git -C <vault-path> add -f ".claude/skills/<name>/SKILL.md"   # -f: Claude Code may exclude .claude/
git -C <vault-path> diff --cached --name-only                 # confirm staging before commit
git -C <vault-path> commit -m "chore(skills): …"
```

**Skills index:** `.claude/skills/README.md` lists every skill by category, with what it does and how to trigger it. Keep it current when adding or removing a skill.

**Adding a skill:** run `/vault-skill`, or create `.claude/skills/<name>/SKILL.md` here and link it:
```bash
ln -s "<vault-path>/.claude/skills/<name>" ~/.claude/skills/<name>
```

**Personal, not shared.** These skills are for Patty only. Team skills belong in the shared pod repo (`roswell-studios/pod.wonchih`, `.claude/commands/`).

> **No hardcoded absolute paths in committed files.** Use `<vault-path>` placeholders.

## Commits

Commit directly to `main` — notes, not code. No branches, no PRs. Stage explicit paths only, and check `git diff --cached --name-only` before committing. Use `docs:` for notes and `chore:` for skills and config.
