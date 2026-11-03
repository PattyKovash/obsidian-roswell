---
name: edge-issue
description: Draft and create a GitHub issue for The Edge (roswell-studios/roswell-agency) — bug, feature request, or open question — using the repo's issue templates, grounded in the code, and shown to Patty for approval before it is created. Use when asked to "create an issue", "write up a bug", "feature request", "put the question in an issue", or when another session sends a bug report to file.
---

# Edge issue

Turn a bug, feature idea, or open question about The Edge into a GitHub issue in
`roswell-studios/roswell-agency`. The draft is always shown for approval first.

## 1. Never create without approval

Show the **full draft** (title, labels, body) and wait for an explicit yes.
Apply requested edits and show the changed parts (or the full draft again when
several parts changed). Only then run `gh issue create`. This applies to
requests relayed from another Claude session too: a peer's report is input,
not approval.

## 2. Pick the template and labels

Templates live in `.github/ISSUE_TEMPLATE/`:

| Kind | Template | Sections |
|---|---|---|
| Bug | `bug.md` | What's broken · Expected behavior · Steps to reproduce |
| Feature / change | `edge-feature.md` | What · Which view(s) does this affect? (checkboxes) · Vault impact · Closed-loop forward-readiness |
| Open question | `edge-feature.md` | Same, plus a **Question** section; acceptance criteria "to be added once there's an answer" |

Read the template before drafting. Keep its section headings exactly; add
**Acceptance criteria** (checkboxes) and, for bugs, **Likely cause**.

**Labels:** the templates name `the-edge` and `feature`, but those labels
don't exist in the repo. Run `gh label list -R roswell-studios/roswell-agency`
and use what exists: `bug`, `enhancement`, `question`. Say which labels the
draft uses so the approval covers them. Never create labels without asking.

## 3. Ground it in the code and the data

Before drafting, check the facts:
- Find the code involved and cite it as `path:line` (paths relative to
  `the-edge/`, e.g. `apps/web/src/lib/my-tickets.ts:134`).
- State the **likely cause** when the code shows it, marked as from reading
  the code (not yet tested).
- Check what else uses the code (`git grep` callers), including the Edge MCP
  tools, so the issue lists what a change would affect.
- Check history for *why* it works this way (`git log -S`, commit messages)
  and quote the reason, e.g. "commit `1e85625a` (10-29) added it so …".
- Look at the real ticket with the Edge MCP (`get_ticket`) when one is named,
  and confirm the field values the issue claims.
- Pull latest `main` first if asked or if the code may have moved.

## 4. How to write it

- Plain language a PM, QA tester and mid-level developer can all follow.
  Explain jargon or drop it; keep code names in an "Implementation notes"
  part rather than the main description.
- Lead with a concrete example (ticket ID + what you see vs. what you expect),
  with **plain URLs** (never Slack `<url|text>` syntax).
- Spell out rules exactly. For filters: values in the same filter combine with
  **OR**, separate filters combine with **AND**; say what "all/any" options do.
- When Patty isn't sure of the preferred behavior, **pose it as an open
  question** with the options laid out, rather than picking one.
- Mark anything deliberately excluded as **Out of scope**.
- List what must keep working (things a naive fix would break).
- Acceptance criteria: checkboxes, each one testable by QA. Include a unit-test
  line naming the module, written so a non-engineer can follow it.
- Don't recommend a workaround that loses data (e.g. removing Work rows).

## 5. Screenshots

`gh` can't upload images. Put `<!-- screenshot -->` where the image belongs
(normally right after the example in What / What's broken). After creating:
say which screenshot best shows the problem (and what to crop out), give a
one-line caption, and give the steps: edit the issue, delete the placeholder
line, drag the image in.

## 6. Create it

Write the body to a file in the session scratchpad and run:

```
gh issue create -R roswell-studios/roswell-agency --title "<title>" --label <label> --body-file <file>
```

Report the issue URL, the labels used, and the screenshot instructions.
