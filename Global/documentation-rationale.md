# Documentation rationale

Why the documentation rules are shaped the way they are. For whoever restructures the docs; not needed during tickets.

## Why files stay small

Every doc (`CLAUDE.md`, `do-not-touch.md`, `decisions.md`, pattern docs, the ticket prompt, the protocol) is loaded into a finite AI context window. A file that holds everything gets too large to load economically and makes every session pay for content unrelated to its ticket. So the model is many small, topic-scoped files: a short `CLAUDE.md`, one pattern doc per topic loaded only when that area is touched, a do-not-touch list of short bullets with pointers. When a doc trends toward "explains everything", split it by topic, leave a one-line pointer, and make the new file discoverable (indexed from `CLAUDE.md`, `do-not-touch.md`, or the vault's `repos.md` / `04-engineering/CLAUDE.md`). The trigger is size and blast radius, not a kind of content.

The old per-repo `.claude/context/<area>.md` scheme had the right instinct but the wrong container: it rebuilt per-topic files inside the code repo instead of using the vault's `04-engineering/patterns/`, which non-technical and vault-side sessions can also see.

## Vault vs. Google Drive

Drive holds a merchant's full source documents in their native formats (contracts, decks, spreadsheets, transcripts). The vault holds condensed markdown distillations of that material. This split covers business and commercial artifacts; engineering context has no Drive source and is written directly into the vault (`04-engineering/tech-context.md`, `patterns/`, the Technical section of `do-not-touch.md`).

## How corrections are kept

Rules are written as one line each. The reason for a change goes in its git commit message, not in the doc, so the docs stay small and `git log` keeps the history of corrections.
