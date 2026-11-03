---
name: vault-skill
description: Add a personal Claude Code skill to Patty's Obsidian vault (obs-roswell) and link it into ~/.claude/skills — either a new skill, or an existing one moved out of ~/.claude/skills or ~/.claude/commands. Use when asked to "add a skill", "save this as a skill", "move this skill to my vault", "keep this skill for myself", or after creating a personal skill.
---

# Vault skill

Patty's personal skills live in her Obsidian vault and are symlinked into
`~/.claude/skills/` so Claude Code loads them. The vault's `CLAUDE.md` records
the convention; this skill carries it out.

- Vault: `~/Documents/obs-roswell` (git repo, `main`, remote `PattyKovash/obsidian-roswell`)
- Skills: `<vault>/.claude/skills/<name>/SKILL.md`
- Link: `~/.claude/skills/<name>` → `<vault>/.claude/skills/<name>`

These are **personal**. Team skills belong in the shared pod repo
(`roswell-studios/pod.wonchih`, `.claude/commands/`); if a skill looks like
it's meant for the team, say so and ask before putting it in the vault.

## 1. Check first

- Run `git -C <vault> status --short`. If there are uncommitted changes, tell
  Patty; she may want to commit them herself first. Never stage them.
- Pick a short kebab-case name. Check that neither `<vault>/.claude/skills/<name>`
  nor `~/.claude/skills/<name>` already exists (a name clash would replace a
  skill). If one exists, show what's there and ask.
- Leave anything managed by another tool alone (e.g. `orca-cli`, a symlink
  into `~/.agents/skills/`).

## 2. Create or move the skill

**New skill:** write `<vault>/.claude/skills/<name>/SKILL.md` with frontmatter:

```markdown
---
name: <name>
description: <what it does and when to use it, including trigger phrases>
---
```

The description decides when the skill triggers, so name the phrases Patty
would actually say. For a larger skill, the `skill-creator:skill-creator`
skill can help draft and test it.

**Existing skill in `~/.claude/skills/<name>/`:** `mv` the folder into
`<vault>/.claude/skills/`.

**Existing command in `~/.claude/commands/<name>.md`:** ask whether to convert
it. If yes, create `<vault>/.claude/skills/<name>/SKILL.md` from it, add the
frontmatter `name` and a `description`, and remove the old command file only
after the new skill is linked (two copies would show up twice).

## 3. Link it

```bash
ln -s "<vault>/.claude/skills/<name>" ~/.claude/skills/<name>
ls -la ~/.claude/skills/<name>   # confirm it points at the vault copy
```

## 4. Update the README

Add a row for the skill to `<vault>/.claude/skills/README.md` under the
section that fits (Issues and tickets, Sessions, Skill management, Testing;
add a new section if none fits): linked name, one-line "What it does", and
the trigger phrases. If it was moved in from `~/.claude/commands/`, remove it
from the "Not in this vault" table.

## 5. Commit (vault only)

- No hardcoded absolute paths in the committed file; use `<vault-path>`-style
  placeholders. Check with `grep -n "/Users/" <file>`.
- Stage with `-f` (Claude Code may exclude `.claude/` from git):

```bash
git -C <vault> add -f ".claude/skills/<name>/SKILL.md" .claude/skills/README.md
git -C <vault> diff --cached --name-only    # must list only this skill and the README
git -C <vault> commit -m "chore(skills): add <name>"
```

- Commit straight to `main`. No `Co-Authored-By` line.
- Don't push unless Patty asks.

## 6. Report

Say where the skill lives, that the link is in place, the commit hash, that
it's not pushed, and how to invoke it (`/<name>` or the trigger phrases). A
new skill is usually picked up in the current session; if not, it loads in the
next one.
