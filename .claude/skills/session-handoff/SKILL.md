---
name: session-handoff
description: >-
  Close out the current Claude Code session cleanly and produce a short prompt for the next one.
  Use when the user says "/session-handoff", "wrap up this session", "I'm starting a new session",
  "write a handoff prompt", "generate the next prompt", or asks what to paste into a fresh session —
  typically because context is getting high. Runs the handoff checklist first (commit and push every
  repo, refresh any transcript archive, bring the working-context doc current), then writes the prompt.
  This is about ending a conversation and starting the next one; it is not about Orca worktrees or
  passing work to a subagent.
---

# Session handoff

A good handoff is mostly **state**, not prose. The prompt is the last step and the smallest one — it is
only as useful as the files it points at. Do the checklist first.

## 1. Find what this project already has

Don't invent structure. Look for it:

- A working-context doc. **Check whether it is versioned or deliberately kept outside the repo** — a
  working file full of session state and one person's TODOs usually should not be committed. Durable
  findings belong somewhere team-facing (a vault, a pattern doc, the PRD); working state does not. A memory
  note often records where it actually lives.
- A standing-rules doc — e.g. `docs/AGENT-GUIDELINES.md`. If one exists, the prompt **points at it rather
  than restating it**. Duplicated rules go stale in one place and not the other.
- Memory notes for this project (`/memory`) — they may already carry conventions the next session inherits
  automatically, which the prompt then doesn't need.
- Any transcript-archiving convention.

If none of these exist and the work will continue, consider proposing a context doc — but don't create a
documentation scheme unasked.

## 2. Run the checklist

**Every repo involved**, not just the main one — a worktree, a theme repo and a vault are easy to forget:

- `git status` clean? Commit anything outstanding, following the project's commit conventions.
- Anything unpushed? Push it, or say explicitly why not.
- **Report honestly.** If something can't be pushed or a check fails, say so in the prompt. A handoff that
  hides a broken state is worse than no handoff.

Then:

- Refresh any transcript archive, per the project's naming convention. Never overwrite another session's.
- **Bring the working-context doc current.** This is the highest-value step: current state, what landed,
  what's in flight, open questions, anything learned that isn't captured elsewhere. The prompt points here,
  so staleness here poisons everything downstream.

## 3. Write the prompt

Short. If a project has a standing-rules doc, the prompt is mostly a pointer plus live state:

- Read `<standing-rules doc>` and `<context doc>` first
- Where things stand: what's done, what's half-done, anything uncommitted, unpushed or failing
- The next task, concretely — not "continue the work"
- Any URLs, IDs or commands the next session needs to reproduce the current state
- Anything learned that isn't yet written down anywhere
- Anything not to change without asking

Leave out: narration of how the current session went, rules already in the standing-rules doc, and
anything the next session can read for itself.

Write it wherever that project keeps such drafts — check first, since some projects deliberately keep them
**outside the repo or gitignored** rather than versioned, and a handoff prompt is usually personal rather
than team-facing. Write **one** copy, not duplicates that drift. Put it on the clipboard with `pbcopy` so it
can be pasted straight into the new session.

## 4. Report

Tell the user where the prompt is, what the checklist found, and anything still outstanding that they —
not the next agent — need to deal with.

## Notes

- **Check `/context` rather than estimating.** Transcript size is not a proxy for context use; estimating
  from it can be off by multiples. Handing off around 70% leaves room to finish cleanly.
- If another session is already doing the work, **that session should write the prompt**, not this one —
  it has the current state. Message it instead of guessing.
