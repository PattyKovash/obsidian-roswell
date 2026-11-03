# Social Threads: Theme Review Summary (2026-08-26 onboarding)

## What we did

Compared their live theme code against a clean baseline, then tested an actual upgrade using Shopify's own already-upgraded copy of their theme, to measure (not guess) what an upgrade would break.

## What we found

- ~280 differences from stock. 272 of those (96%) need no action at all, either expected customization (branding, page content, known apps like Beam, Swym, Yotpo, product reviews) or harmless formatting noise. The remaining 12 need review.
- 12 items need review before we touch anything, notably:
  - An app API key for the Beam donation feature is present in the theme code instead of stored as a setting. Not confirmed to be a security issue, some app keys are meant to be public-facing; want to confirm with you before deciding if this needs different handling.
  - A "recently viewed" counter calling an outside script on what looks like a 3rd party service.
- Tested against Shopify's real upgraded copy: 52 of the ~280 differences need review before we call the upgrade done.
  - 17 are custom features that do not survive the automatic upgrade and need manual rebuilding (donation widget wiring, "Final Sale" labeling, some styling, the view-counter above).
  - The other 35 are a separate, bigger finding, not specific to their customizations: Shopify itself changed how the new theme version handles color. Their site currently uses 4 distinct color themes for different sections (e.g. a red-background contrast section). The new version only supports one shared color scheme site-wide. This means some sections may not look the same after upgrading, independent of anything we or they built. These 35 files (mostly page and product templates) need a visual check, not a rebuild.
- New since the meeting: we finished a full review of every other change Shopify made to the theme itself between versions (not just color), same depth as the customization review. 26 findings total, most already covered by the visual-check work above, but a few are new and distinct:
  - Six items we flagged as needing a decision are already resolved on the in-progress upgrade branch: the sticky "add to cart" bar staying visible during live chat, header dropdown menus still opening on hover, product card links, card images, and product title links all correctly preserving the selected color/size when clicked, and the quick-add button on product cards behaving the same as it does today (hidden only once a product is completely sold out). No action needed, just a final confirmation.
  - Several built-in components (search results, cart counter, filters) lose some screen-reader accessibility labeling in Shopify's own new version. A separate accessibility specialist is handling this category, not included in the estimate below.

## Bottom line

Upgrading is a real project, not a one-click update. We now have a verified, bottom-up estimate, checked against the actual in-progress upgrade code, not a rough guess: **roughly 18-39 hours of execution plus 17.5 hours of QA**, assuming the work is done with an AI coding agent under human review (see the effort estimate below for what a fully manual approach would look like instead).

This is a first pass, not a full audit. It's enough to confirm the scope and set expectations, but a few items still need a deeper dive.

We'd also like their input: which of these customizations are must-haves for the relaunch, and are there others they want us to prioritize or flag that we may not have caught?

## Features needing manual rebuild

The 17 files needing actual rebuilding map to these distinct features (separate from the 35 files that just need a visual check, see the color scheme row below). Worth confirming with the client that each is still wanted before we rebuild it, rather than assuming. Hours are verified against the actual in-progress upgrade code.

| Feature | What it does | Est. hours (execution / QA) |
|---|---|---|
| Beam donation widget | Cart nonprofit donation picker (drawer/summary; not checkout, theme code can't touch Shopify's managed checkout without a UI extension). Also where the API key lives, so confirming whether to keep Beam resolves that too. Estimate assumes moving it to a merchant setting; if it turns out to need a server, that's a separate scoping conversation | 1.25-3.0 / 1.0 |
| Live "recently viewed" view counter | Shows a live viewer count on product pages (the `qa.wpweb.co.in` feature) | 1.5-3.0 / 1.0 |
| Product card badges | Bestseller / limited stock / exclusive badges on product cards | 0.5-1.0 / 0.25 |
| "Final Sale" labeling | Tags final-sale products, adds a cart line-item flag and label | 1.25-2.5 / 0.75 |
| Sale price styling | Highlighted styling for discounted prices | 0.25-0.5 / 0.25 |
| Custom cart font sizing | Custom font-size scale in the cart drawer | 0.25-0.5 / 0.25 |
| Cart bubble count fix | Keeps the cart icon count in sync | 0.25-0.5 / 0.25 |
| Pagination brand color | Brand-colored pagination controls | 0.25-0.5 / 0.25 |
| Quick-add modal price alignment | Price text alignment in the quick-add popup | 0.25-0.5 / 0.25 |
| Misc brand styling | Assorted brand-specific CSS not covered above | 1.0-2.0 / 0.5 |
| Color scheme system (35 files) | Not a rebuild task, a full visual review: Shopify replaced the old multi-scheme color system with one shared scheme, so any section relying on a distinct color scheme for contrast needs checking | 10.3-22.5 / 9.95 |

## Other decisions needed (not a rebuild, Shopify's new defaults)

| Item | Est. hours (execution / QA) |
|---|---|
| Review scroll-dependent code against the page's new scroll container | 0.5-1.5 / 0.5 |

## 12 items needing review

9 of these 12 are the same underlying features as the rebuild list above. 3 are independent (won't block the upgrade, but worth cleaning up).

| Item | Concern | Also needs rebuild? |
|---|---|---|
| Beam API key | Present in theme code instead of a setting; not confirmed to be a security issue, want to check with you first; resolves once we confirm whether Beam is being kept | Yes |
| Live view counter (3 files) | Calls an outside, unverified script | Yes |
| `theme.liquid` cart script | Runs on every page load, includes debug logging | Yes |
| Pagination brand color | Hardcoded color instead of theme setting | Yes |
| Base stylesheet colors | Hardcoded color instead of theme setting | Yes |
| "Final Sale" buy button | Leftover commented-out code | Yes |
| Product card badge render | Small code change, confirm badges still show | Yes |
| Cart bubble count fix | Patches core browser behavior instead of using the theme's built-in update system | No, carries over as-is |
| Header custom CSS | Custom CSS added via settings instead of a stylesheet | No, carries over as-is |
| Duplicate pagination file | Looks unused, possible leftover | No, carries over as-is |

## Effort estimate (full migration)

Verified, bottom-up estimate: reviewed the actual code gap between the live theme and the in-progress upgrade branch for every item below, not a top-down guess.

| Approach | Hours | Notes |
|---|---|---|
| AI-assisted, human-supervised | 17.55-38.25 execution + 17.25 QA | The actual verified estimate. AI drafts each fix, a developer reviews, tests, and approves every change |
| Manual, no AI (rough comparison) | roughly 60-120 | Not independently re-verified line by line, a rough multiple of the AI-assisted number for comparison, since a manual developer does the same investigation and drafting work the AI does here, just slower |

Covers the 60 rows that have an actual task (17 rebuilds, 35 visual checks, and the remaining open decisions), not the 7 items already resolved on the upgrade branch or the accessibility work a separate specialist owns. Excludes time waiting on the client or third-party vendors, and review/approval cycles.

## Questions for Client

- The live view count feature (`qa.wpweb.co.in`) is currently live on the site. How important is it to keep the live view count? What's the goal of this feature?
- Where does this code actually live, and do they own or have access to it?
- Any past documentation or prior developer we can reference for context?
- Full feature parity, or reconsider the shakier custom features (Beam donation widget, tracking script, manual cart-count fix) during the rebuild?
- What issue were they facing with the cart-count that required a fix? This is something we could see is fixed in the new version of the theme.
