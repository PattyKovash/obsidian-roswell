# Personal Claude Code skills

Patty's own skills, kept in this vault and linked into `~/.claude/skills/` so
Claude Code loads them in every session. They're personal, not shared with the
team; team skills live in `roswell-studios/pod.wonchih` (`.claude/commands/`).

Run a skill by typing `/<name>`, or just ask in plain words; each skill's
trigger phrases are listed below.

## Skills

### Issues and tickets

| Skill | What it does | Say |
|---|---|---|
| [`edge-issue`](edge-issue/SKILL.md) | Drafts a GitHub issue for The Edge (`roswell-studios/roswell-agency`): bug, feature or open question. Uses the repo's templates, checks the code and the real ticket, and **shows the draft for approval before creating it**. | "create an issue", "write up a bug", "feature request", "put the question in an issue" |

### Tickets

| Skill | What it does | Say |
|---|---|---|
| [`start-ticket`](start-ticket/SKILL.md) | Starts an Edge ticket with Patty's workflow: pull the ticket, draft the PRD early (Ticket Authoring Prompt v2) with a review page, reproduce, branch, implement and test, keep vault notes, and push per the prompt. Approvals follow `Global/agent-hard-rules.md`. | "start a ticket", "start HYPER-123", "pick up <ticket>", "begin work on <ticket>" |
| [`estimate-ticket`](estimate-ticket/SKILL.md) | Reviews and estimates an Edge ticket: how it works today (code and live site), whether the feature already exists without code, an estimate as AI-implemented with human guidance (dev + QA + bug fix), a PRD draft, and a local review page. **No pushes or Edge writes.** | "review and estimate <ticket>", "estimate <ticket>", "can this be done today?", "scope this ticket" |
| [`prd-review-page`](prd-review-page/SKILL.md) | Builds and keeps current the local HTML review page for a PRD: the PRD first, original ticket → PRD, notes for Patty, and the estimate on estimate pages. Opened once; Patty refreshes. | "make a review page", "HTML version of the PRD" |

### Sessions

| Skill | What it does | Say |
|---|---|---|
| [`session-handoff`](session-handoff/SKILL.md) | Wraps up a session (commit and push every repo, refresh transcripts, update the working-context doc), then writes a short prompt to paste into the next session. | "wrap up this session", "write a handoff prompt", "I'm starting a new session" |

### Skill management

| Skill | What it does | Say |
|---|---|---|
| [`vault-skill`](vault-skill/SKILL.md) | Adds a new skill to this vault, or moves an existing one in from `~/.claude/skills/` or `~/.claude/commands/`, links it, commits it, and updates this README. | "add a skill", "save this as a skill", "move this skill to my vault" |

### Testing

| Skill | What it does | Say |
|---|---|---|
| [`theme-test`](theme-test/SKILL.md) | Tests a Shopify theme with Playwright: right preview theme and confirmed theme ID, environments compared the same way, production build for final checks, walkthroughs. | "test on the dev theme", "walk me through", "reproduce this" |
| [`pk-test`](pk-test/SKILL.md) | Does nothing. Used to test hook configuration. | `/pk-test` |

## Not in this vault

| Skill | Where it lives | Why |
|---|---|---|
| `orca-cli` | `~/.agents/skills/orca-cli` (linked from `~/.claude/skills/`) | Installed and managed by Orca. Leave it there. |
| `issues`, `technical-lead-issue-review`, `x_technical-lead-issue-review` | `~/.claude/commands/` (old single-file format) | Not moved yet; `/vault-skill` can convert them. |

## How it's set up

```
<vault>/.claude/skills/<name>/SKILL.md     ← the real file (edit here, committed)
~/.claude/skills/<name>                    ← symlink to it (what Claude Code reads)
```

- Edit skills here (in Obsidian or any editor). The symlink means the change
  is live in Claude Code right away.
- Each skill is a folder with a `SKILL.md`. Its frontmatter `description`
  decides when the skill triggers, so it lists the phrases you'd actually say.
- `.gitignore` re-includes `!.claude/skills/` so these files can be committed.

## Adding or changing a skill

The easy way: run `/vault-skill`. By hand:

```bash
# new skill: create <vault>/.claude/skills/<name>/SKILL.md, then link it
ln -s "<vault>/.claude/skills/<name>" ~/.claude/skills/<name>

# commit (-f because Claude Code may exclude .claude/ from git)
git -C <vault> add -f ".claude/skills/<name>/SKILL.md" .claude/skills/README.md
git -C <vault> diff --cached --name-only
git -C <vault> commit -m "chore(skills): add <name>"
```

Add the skill to the right section of this README when you add it.

## New machine

Clone the vault, then link every skill:

```bash
for d in <vault>/.claude/skills/*/; do
  ln -s "${d%/}" ~/.claude/skills/"$(basename "$d")"
done
```
