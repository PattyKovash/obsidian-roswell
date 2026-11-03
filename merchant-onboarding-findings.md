# Merchant Onboarding — Findings & Steps

## Current process (interim, until further notice)

Per Hugh (2026-09-01): `onboard-merchant.yml` is the correct backend
workflow, but a frontend UI for it is still in progress, and several steps
around it remain manual (webhook secret registration, an Edge restart/
re-sign-in before new merchants appear, merchant email domain registration).
**Hugh is handling onboardings himself for the interim**, until The Edge is
ready to fully manage them (eventually integrating into the sales-to-pod
handoff process).

**Action for us:** once a merchant's Google Drive folder (and ideally repo)
is set up, request that Hugh generate the vault docs — do not trigger
`onboard-merchant.yml` ourselves in the meantime.

Sources reviewed: `roswell-vaults`, `roswell-agency`, and
`roswell-operating-framework`. The operating-framework repo has nothing on
merchant-vault onboarding — it covers engineer/pod tooling onboarding, a
different topic.

## Two layers of "onboarding a new project"

1. **Vault scaffold only** (`roswell-vaults`) — copies the template folder
   structure. Documented in this repo's `README.md`:

   ```bash
   cp -r vaults/_template vaults/{merchant-slug}
   # Fill in 00-overview/summary.md, 01-mcd/mcd.md, 06-financial/contract.md
   # Commit with merchant onboarding message
   ```

2. **Full merchant registration** (`roswell-agency`) — the real pipeline that
   registers the merchant in canon, sets up Drive sync, Slack, financial
   tracking, and triggers the initial vault ingest. Documented in
   `roswell-agency/.claude/skills/ingest-merchant-vault/reference/merchant-onboarding-manual-steps.md`.

## Ownership note

`roswell-agency/teams.md` defines the `dri` permission role as "the Merchant
Partner who owns a pod's client relationships," and lists the MP as
"DRI for the pod." No file explicitly states that the MP is responsible for
populating vault content (summary/MCD/contract) — that was my inference from
the DRI/relationship-ownership language plus the shape of the manual steps in
the onboarding doc (pod assignment, slug/folder confirmation, Slack
instruction paste), not a directly documented rule.

## Step-by-step order of operations

1. **Confirm pod assignment** (manual). If the pod is brand-new, its GitHub
   team must exist and have `roswell-vaults` access first, or the merchant
   routes to the `@hughlim` catch-all (per the `nickname` field in `pods.md`).
2. **Confirm slug + Drive folder** (manual). Slug is immutable once set; trim
   folder-title suffixes (e.g. `AED4Life (AED|SEO)` → `AED4Life`) for a clean
   slug.
3. **Trigger the onboarding core** (automated) via one of two front doors:
   - CLI: `gh workflow run onboard-merchant.yml -f name=… -f pod=… -f folderId=…`
   - The Edge UI: `/admin/registry/onboard` (leadership-only; can also create
     the Drive folder from template via Google sign-in)

   Automatically does: generate slug → add verified row to
   `drive-folder-map.md` → add merchant to `merchants.md` (propagates
   `pods.md` + team scopes) → run `canon:check` → open **one** registration
   PR on `roswell-agency` (never auto-merged).
4. **Merge the registration PR** (manual gate). On merge,
   `post-registration-ingest.yml` auto-dispatches `drive-synthesize.yml`,
   which opens an **initial ingest draft PR** on `roswell-vaults`.
5. **Anthropic workspace + API key** (manual, not automated at all). Create
   workspace in Anthropic Console → create API key → store in 1Password →
   record `anthropic_workspace_id` + `anthropic_1p_key_label` in
   `merchants.md`.
6. **Slack channel** — auto-created on registration merge
   (`post-registration-slack.yml` creates `#<slug>`, invites Claude Tag,
   opens an allowlist PR). Manual remainder: paste the standing instruction
   into Claude Tag's Configure UI (no API for this), then merge the
   allowlist PR.
7. **Code repos, if any** (manual). Declare in `merchants.md code_repos`;
   set up the per-merchant webhook HMAC secret (1Password + Fly secret +
   per-repo GitHub webhook).
8. **Merchant-facing Edge access, if needed** (manual).
   `canon:grant-merchant-access <slug> <email>` per merchant-side user.
9. **Google Drive brand folder** — already exists (discovery path) or
   created via Edge template in step 3.
10. **Review + merge the initial-ingest draft PR** on `roswell-vaults`
    (manual gate — first ingest always routes to `@hughlim`; later ones
    route to the pod). This is where `00-overview/summary.md`,
    `01-mcd/mcd.md`, `06-financial/contract.md` etc. actually get filled
    in/reviewed.
11. **Edge visibility** — merchant appears in The Edge UI only after the
    next redeploy (`merchants.md` is image-baked); ingest itself doesn't
    wait on redeploy.

## What's automated vs. manual

**Automated** (via `onboard-merchant.yml`, triggered by CLI or Edge UI):
- Slug generation
- `merchants.md` entry (propagates `pods.md`, team scopes)
- Verified row in `drive-folder-map.md`
- Registry validation (`canon:check`)
- Registration PR (`merchants.md`, `pods.md`, `teams.md`, `drive-folder-map.md`)
- On merge → initial ingest draft PR on `roswell-vaults`
- Slack channel + Claude Tag invite + allowlist PR
- Drive brand folder creation, if using the Edge path

**Manual:**
- Pod assignment decision + pod access prerequisites
- Slug/folder confirmation before registration
- Anthropic workspace + API key + 1Password + recording IDs
- Slack standing-instruction paste into Claude Tag Configure UI
- Code repo declaration + webhook HMAC setup
- Merchant-facing Edge access grants
- Drive folder creation if *not* using the Edge path
- Reviewing/merging the initial-ingest PR on `roswell-vaults`

## Trigger mechanics (what actually fires what)

- Nothing listens to Google Drive folder creation directly (no Drive
  push/webhook found in either repo).
- `drive-discover.yml` — daily **scheduled poll**, diffs Drive content,
  flags unregistered folders/drift, opens an issue for a human to act on.
- `post-registration-ingest.yml` — triggers on a **git push to `main`**
  that touches `drive-folder-map.md` (i.e., the registration PR merging),
  not on Drive itself. Dispatches `drive-synthesize.yml`, which opens the
  initial ingest draft PR on `roswell-vaults`.

## `onboard-merchant.yml`

Location: `roswell-agency/.github/workflows/onboard-merchant.yml`

Inputs:
- `name` (required) — merchant display name
- `pod` (required) — pod number
- `folderId` (required) — Google Drive brand folderId
- `code_repos` (optional) — comma-separated `org/repo` list
- `slug` (optional) — override; defaults to `slugifyMerchant(name)`

Generates/modifies (all in `roswell-agency`, on branch `onboard/<slug>`):
1. `drive-folder-map.md` — adds a verified `slug | folderId | name` row
2. `merchants.md` — adds the merchant (`pnpm canon:add-merchant`), which
   regenerates derived data into `pods.md` and team scopes
3. Runs `pnpm canon:check` (registry invariants I1–I18)
4. Commits `merchants.md`, `pods.md`, `teams.md`, `drive-folder-map.md`;
   pushes the branch; opens one PR into `main` (never auto-merges)

Idempotent — re-running for a known slug or folderId aborts clean.

Nothing in `roswell-vaults` is touched by this workflow directly; that only
happens after the registration PR merges (downstream ingest PR carries the
regenerated `CODEOWNERS`).

## Example — Social Threads

Answers used to build the command:
- name: `Social Threads`
- pod: `5`
- folderId: `1JQo7po3xTg7_3p8AhwSQGGyD2Cbe-6P0`
- code_repos: `roswell-studios/SocialThreads_THREADS` (converted from the
  full GitHub URL `https://github.com/roswell-studios/SocialThreads_THREADS`
  to the `org/repo` format the workflow expects)
- slug: left blank → auto-derives to `social-threads`

Command:

```bash
gh workflow run onboard-merchant.yml \
  --repo roswell-studios/roswell-agency \
  -f name="Social Threads" \
  -f pod=5 \
  -f folderId="1JQo7po3xTg7_3p8AhwSQGGyD2Cbe-6P0" \
  -f code_repos="roswell-studios/SocialThreads_THREADS"
```

Notes:
- Slug auto-derives to `social-threads`.
- Pushes branch `onboard/social-threads` and opens a registration PR on
  `roswell-agency` — does not auto-merge.
- Run with `gh` authenticated against the `roswell-studios` org; `--repo`
  makes it runnable from anywhere, or drop it and `cd` into a local
  `roswell-agency` checkout.
- After running, verify with:
  `gh run list --repo roswell-studios/roswell-agency --workflow onboard-merchant.yml`
  then review and merge the PR it opens.
