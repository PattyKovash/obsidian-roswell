# Claude Code — Org-Wide Documentation Protocol Enforcement

Using Claude for Teams managed settings, we can push a `SessionStart` hook to every dev automatically on login. The hook pulls the latest documentation protocol from a central org repo and writes it into the active project before Claude starts working. Devs always have the current version without any manual steps.

## How it works

1. Dev runs `claude` → hook fires → latest `DOCUMENTATION_PROTOCOL.md` is pulled into `.claude/` in their project
2. `CLAUDE.md` tells Claude to read that file at the start of every ticket
3. Update the org repo → every dev gets it next session

## When it fires

Once per session at startup — every time the `claude` command is run, not just on sign-in. Not tied to authentication.

## Token impact

The hook itself runs as a shell process outside Claude's context — zero tokens consumed. The only token cost is Claude reading `DOCUMENTATION_PROTOCOL.md` at the start of a ticket, which is the same as any file read. No surprise usage.

## Admin console JSON

`claude.ai → Admin Settings → Claude Code → Managed settings`

```json
{
  "env": {
    "ORG_GITHUB_TOKEN": "ghp_yourtoken"
  },
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "mkdir -p \"$PWD/.claude\" && curl -fsSL -H \"Authorization: token $ORG_GITHUB_TOKEN\" \"https://raw.githubusercontent.com/your-org/claude-standards/main/DOCUMENTATION_PROTOCOL.md\" -o \"$PWD/.claude/DOCUMENTATION_PROTOCOL.md\" && echo \"Documentation protocol synced\" >&2"
          }
        ]
      }
    ]
  }
}
```

## CLAUDE.md entry

For Claude to actually follow the protocol, each project's `CLAUDE.md` needs an instruction pointing to the file:

```markdown
## Session Start Protocol

Follow this sequence at the start of every ticket before writing any code or making any suggestions:

1. **Read `.claude/DOCUMENTATION_PROTOCOL.md`** — documentation rules apply to every ticket.
```

> **TBD:** Getting this into every project's `CLAUDE.md` automatically — likely a second hook or part of the `/init` flow.

## Summary

One repo, one source of truth, zero per-machine setup. Token cost is only what Claude reads — the hook itself is free.
