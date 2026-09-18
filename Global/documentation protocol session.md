
# Session Summary — BaubleBar CE UI Ext / AI Context Architecture

  

## What we built

  

Starting from a bare repo, we designed and implemented a **two-layer AI context file system** for the `baublebar-ce-ui-ext` Shopify project. The goal is replicable across all Roswell client projects.

  

**Files created:**

  

| File | Purpose |

|---|---|

| `CLAUDE.md` | Global router. Always loaded. Contains commands, top-level architecture pointers, global constraints, and the Session Start Protocol that tells the agent what to load next based on ticket content. Intentionally short. |

| `.claude/DOCUMENTATION_PROTOCOL.md` | Documentation rules. Loaded at every session start via the protocol. Defines what to update, when, and in what format — for both CLAUDE.md and code comments. |

| `.claude/context/app-layer.md` | Scoped context for `app/` work. Only loaded when a ticket touches auth, routes, webhooks, or the database. |

| `.claude/context/extensions/ceui-line-item-details.md` | Scoped context for the checkout extension. Only loaded when a ticket touches `extensions/ceui-line-item-details/`. |

| `extensions/ceui-line-item-details/CLAUDE.md` | Auto-loaded by Claude Code when `@mentioning` files in that directory. Points to the scoped context file above. |

  

---

  

## The core design decisions

  

**Two layers, not one:**

- **Global** — `CLAUDE.md` + `DOCUMENTATION_PROTOCOL.md`. Loaded every session, always short.

- **Scoped** — `.claude/context/*.md`. Loaded only when the ticket touches that area. Keeps token usage proportional to actual need.

  

**CLAUDE.md is a router, not an encyclopedia.** All detail lives in scoped context files. The root file stays lean on purpose.

  

**The Session Start Protocol** (baked into `CLAUDE.md`) tells the agent to ask for the Monday ticket first, then self-route to the right scoped context file based on ticket content. No scripts, no tooling — the agent follows the protocol autonomously.

  

**Documentation is part of done.** The `DOCUMENTATION_PROTOCOL.md` defines that every ticket ends with updating whichever context files were affected. New constraints, new "do not touch" zones, new gotchas — all recorded before the PR is raised, in the context file closest to the area they describe.

  

---

  

## What's not done yet

  

- **Additional scoped context files** as the project grows — new extensions or new app-layer complexity each get their own file under `.claude/context/`

- **Replicating the skeleton to other client repos** — the pattern is defined but not yet templated or applied elsewhere

- **Monday.com integration** — currently tickets are copy-pasted manually; automation (hook, script, or slash command) was identified as a future improvement but not built

  

---

  

## The replication pattern for new projects

  

```

CLAUDE.md ← Same structure, client-specific content

.claude/

DOCUMENTATION_PROTOCOL.md ← Identical across all projects

context/

[area].md ← One file per major codebase area

extensions/

[ext-name]/

CLAUDE.md ← Auto-loaded, points to scoped context

```

  

Copy `.claude/DOCUMENTATION_PROTOCOL.md` verbatim. Rebuild `CLAUDE.md` and the context files with client-specific content.