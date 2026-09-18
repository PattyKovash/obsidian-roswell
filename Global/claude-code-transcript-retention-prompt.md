# Claude Code — Transcript Retention Prompt

Hand this to an agent when you need to change how long Claude Code keeps session transcripts. Replace `<N>` with the number of days.

## The prompt

```
Set Claude Code's transcript retention to <N> days.

Edit ~/.claude/settings.json and set the top-level key "cleanupPeriodDays" to <N>.

Requirements:
- Use a targeted edit, not a rewrite. That file holds my hooks, enabledPlugins,
  extraKnownMarketplaces, env, and model settings — all must survive untouched.
- If the key already exists, update it in place rather than adding a second one.
- Afterward, validate the file parses and echo back the new value:
  python3 -c "import json;d=json.load(open('/Users/pk/.claude/settings.json'));print(d['cleanupPeriodDays'])"

Context you should know before acting:
- This controls how long session transcripts in ~/.claude/projects/<slugified-cwd>/*.jsonl
  are kept. The default is 30. Minimum is 1.
- The sweep hard-deletes via unlink. Deleted transcripts do NOT go to ~/.Trash and are
  not recoverable except from an off-machine backup. APFS local snapshots roll off in
  ~24h and will not help.
- The sweep runs at launch and applies retroactively. LOWERING this number will delete
  transcripts older than the new cutoff the next time Claude Code starts. Before
  lowering it, tell me how many transcripts fall outside the new window and wait for my
  confirmation. Raising it is safe but never restores anything already swept.

Then report the oldest surviving transcript on the machine and its new expiry date:
  find ~/.claude/projects -name '*.jsonl' -exec stat -f '%Sm %N' -t '%Y-%m-%d' {} + | sort | head -5
```

## Why the confirmation clause matters

An agent that treats this as a routine one-line config edit can destroy history irreversibly. Lowering the value is a delete operation disguised as a settings change.

## Background

Verified against Claude Code v2.1.237 by inspecting the CLI binary.

- Transcripts live at `~/.claude/projects/<slugified-cwd>/<session-id>.jsonl`, where `<slugified-cwd>` is the working directory path with non-alphanumeric characters replaced by `-`.
- Default retention is 30 days (`cleanupPeriodDays` unset).
- The retention sweep calls `unlink` directly — no trash, no staging directory. Skills get a `~/.claude/skills/.trash`; transcripts do not.
- Recovery after a sweep requires an off-machine backup (e.g. a network Time Machine destination). macOS APFS local snapshots only retain ~24h and will not cover a deletion from days or weeks earlier.

### Related: sessions missing from `/resume`

The picker is scoped to the current directory by default. Within the picker:

- `Ctrl+A` — all projects on the machine
- `Ctrl+W` — all worktrees of the current repo (only in multi-worktree repos)
- `Ctrl+B` — filter to the current git branch
- `/` — search mode
- `Ctrl+R` — rename a session

Sessions deliberately hidden from the picker: sidechains, team sessions, `daemon`/`daemon-worker` kinds, `/loop` sessions, and anything started via `claude -p` or the SDKs (`sdk-cli`, `sdk-ts`, `sdk-py`). Those can still be resumed by ID with `claude --resume <session-id>`.

Terminals do not split sessions — every session started from the same directory lands in the same project folder regardless of which terminal or tmux pane launched it.
