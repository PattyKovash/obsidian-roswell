# Testing a local plugin branch before merging (CLAUDE-RS_Claude_Code_Plugins)

How to try a not-yet-merged branch of `roswell-studios/CLAUDE-RS_Claude_Code_Plugins` (e.g. a new skill) in another project, without disrupting the published `roswell-studios` marketplace everywhere else.

## Why this isn't as simple as "just add the local path"

The marketplace's name (`roswell-studios`) is defined *inside* `.claude-plugin/marketplace.json`, not chosen when you add it. Pointing a new source at the same local repo — which still has `"name": "roswell-studios"` in that file — registers under the **same marketplace key** as the existing GitHub-sourced one. That repoints/overrides it globally, for every project, not just the one you're testing in, until you switch the source back.

## Option A — scoped to one project (recommended)

1. On your local branch, edit `.claude-plugin/marketplace.json`'s `"name"` to something like `"roswell-studios-local"`. Don't commit this — it's throwaway, just for local testing.
2. In the *other* project's `.claude/settings.json` (or `settings.local.json` if you don't want it checked in), add:
   ```json
   {
     "extraKnownMarketplaces": {
       "roswell-studios-local": {
         "source": { "source": "directory", "path": "/Users/pk/Documents/roswell-studios/CLAUDE-RS_Claude_Code_Plugins" }
       }
     },
     "enabledPlugins": {
       "rs-shopify@roswell-studios-local": true
     }
   }
   ```
   (Verify the exact `source` type key Claude Code expects for a local directory before relying on this — not fully confirmed.)
3. This coexists with the real `roswell-studios` marketplace everywhere else, and only affects that one project.

**To undo:**
1. Remove the `extraKnownMarketplaces`/`enabledPlugins` entries from that project's settings file.
2. Optionally `/plugin uninstall rs-shopify@roswell-studios-local` in that project first.
3. Revert the throwaway `name` edit in the plugins repo: `git checkout -- .claude-plugin/marketplace.json`.

## Option B — global override (simpler, but affects every project on the machine)

Run:
```
/plugin marketplace add /Users/pk/Documents/roswell-studios/CLAUDE-RS_Claude_Code_Plugins
```
This repoints `roswell-studios` at your local branch everywhere on this machine until reverted.

**To undo:**
```
/plugin marketplace add roswell-studios/CLAUDE-RS_Claude_Code_Plugins
```
If it doesn't cleanly resync, `/plugin marketplace remove roswell-studios` first, then re-add the GitHub source.

## Recommendation

Option A is cleaner to undo — deleting a few lines from one project's settings file, nothing global to reverse — so prefer it unless you specifically want the local branch active everywhere.
