# Rules for vault PRs (roswell-vaults)

## Find the right vault
- The repo is `roswell-vaults`; a merchant's vault is `vaults/<merchant>/`. Before writing, confirm `vaults/<merchant>/01-mcd/mcd.md` names the right merchant: a `../vault` symlink next to a theme repo can point at another merchant's vault.
- If the vault can't be found, or `mcd.md` names a different merchant, ask the engineer for the path. Don't guess.

## Branches and PRs
- Confirm the branch with the engineer before committing. The rules as provided by Hugh: start each piece of work from fresh main (`git fetch origin && git checkout -b feature/<topic> origin/main`), one PR per topic or merchant. Patty finds it easier to work off one personal branch (e.g. `feature/pk-<date>`) kept current by pulling `origin/main` into it (`git fetch origin && git merge origin/main`) before starting work and before pushing.
- The vault folder is shared by every Claude session on the machine. Don't create or switch branches in it without asking; other sessions commit to whatever branch is checked out.
- Commit each vault change right away. Never commit `.obsidian/`. Ask the engineer before every push or PR.
- Keep each PR small enough to review.
- Before pushing:
  - List what changed: `git diff --name-only origin/main...HEAD`. Check every path against the generated list below.
  - List the commits that would go up: `git log --oneline origin/<branch>..HEAD`. Because the folder is shared, these can include other sessions' commits. Show them to the engineer when asking to push.
  - Run the two CI checks locally from a roswell-agency checkout at `origin/main` (a detached worktree, so the agency folder's branch isn't changed), after `pnpm install`:
    - `node --experimental-strip-types the-edge/scripts/vault-guard/check-generated-paths.ts --vault <vault repo> --globs the-edge/packages/db/generated-paths.txt --bot-email theedge@roswellstudios.com --mode pr --base origin/main --head HEAD`
    - `VALIDATE_BASE_REF=$(git -C <vault repo> merge-base origin/main HEAD) pnpm validate:vault <vault repo>/vaults --files <each changed file as its own argument>`. Passing the list as one quoted string checks 0 files.

## Never edit files the Edge generates
The Edge writes these from its database. CI fails any commit that touches them, even a commit that only reverts. Make the change in the Edge (theedge.roswell.nyc) instead:
- 03-pm/issues/**, 03-pm/epics/**, 03-pm/discussions/**, 03-pm/client-updates/<date>-*.md, 99-archive/issues|epics/**
- 00-overview/stakeholders.md, 00-overview/call-history.md, 00-overview/consent/slack-*.md
- 01-identity/team.md
- 01-calls/<date>-*.md, 02-decisions/call-decisions.md, 02-decisions/contract-decisions.md
- 04-engineering/repos.md, deploys.md, releases.md
- 06-financial/ (contract*.md, purchases/, contract-changes/, monthly files, ai-usage/, store-data-consent.md)
- 07-audit/ai-session-log.md, sync-log.md, metrics/store-metrics.md, experiments/*.md
- _source-archive/ manifests (*-manifest.json) and INGEST_FLAGS*.md
- Any file that opens with "Generated from the Edge" or similar
If a fact belongs in one of these, put it in a hand-written note (e.g. theme-architecture.md, tech-context.md) and tell the pod to update the Edge.
If a commit already touched one: don't revert it on top. Rebuild the branch without that change (git rebase -i origin/main and drop the edit), then force-push your own branch.

## Every markdown file
- Frontmatter with an allowed `type`. Copy the type from a neighboring file of the same kind (e.g. engineering-notes, engineering-reference). An unknown or missing type fails the validate check.
- Knowledge goes in .md files that make sense on their own. As provided by Hugh: the Edge's Ask reads markdown only, so no HTML pages. Patty's addition: when the source information is HTML (e.g. an HTML review page or exported report), it's fine to save it as evidence or notes alongside the .md. Like screenshots and exports, keep one copy (no duplicates) and summarize what it shows in a .md note, so Ask can find it.
- Write dated facts, not status: "Sent to Matt 2026-11-06", not "awaiting reply". To-dos and status go on the Edge ticket.

## Never in the vault
- Passwords, API keys, tokens or any credential. Save it in 1Password and write only the item name.
- Claude session IDs, local file paths, links into personal notes. Bring the document into the vault or describe it in one line.
- Public share links (e.g. Fathom share/). Use the logged-in link instead.
- Client code copied from another client's account.

## After you push
CI runs two required checks: validate (frontmatter) and generated-paths. If either fails, read the error, fix it in a new commit (or rebuild the branch for a generated-path hit), and push again.
