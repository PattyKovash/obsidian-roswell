---
monday_id: 13155849991
project_key: THREADS
authored: 2026-09-28
---

## Background:

-  On desktop, hovering **Shop** opens the mega menu, but moving the pointer down into it often closes it. It is intermittent: slow moves and diagonal moves fail more often than fast, straight ones.

-  Three causes, all in the header menu:

    1.  **A dead zone between the menu item and the dropdown.** Each item has an invisible "bridge" covering the gap down to the dropdown, but it only covered the header's bottom padding (8px), not the bottom border. The border was raised from 1px to 5px in the theme editor on 2026-09-09 (commit `9c41d24`), which opened a ~4px gap. That change is why the issue got noticeably worse.

    2.  **A JS bug at the dropdown's edge (stock Dwell).** Chrome reports "left the item" when the pointer enters the item's own dropdown. The theme closed the menu on that, it reopened, and it flip-flopped until it ended closed. This existed before the border change; the thin border just hid it.

    3.  **Hover area only as wide as the item.** Moving diagonally from Shop toward the far left or right of the dropdown leaves Shop's narrow area before reaching the dropdown.

    4.  **"Nothing opens at all" coming up from the hero (stock Dwell).** Same Chrome quirk as #2. Entering Shop from just below the nav, Chrome fires a false "left the item" event and the theme closes the menu within milliseconds. This is what the client's team saw every time (Shopify support ticket 70644772). It's on live and on stock Dwell 3.4.0.

## Necessary Info (Design/Documentation):

-  No design. Restores expected mega menu behavior.

-  Surface: desktop header menu, **750px and up** (below that the mobile drawer is used). Only **Shop** has a dropdown today.

-  The strip between the nav text and the dropdown is the header row's bottom padding (8px) plus its bottom border (Header → Appearance → **Border thickness**). It is intentional design and stays.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Moving slowly straight down from Shop into the dropdown keeps it open. |  0.5px-step sweeps at Shop's center and left edge. RC + v2026.41, Chrome 153 and 154, 1024/1440px. |  ✅ |   |
|  2 |  Works at any **Border thickness** value. |  Bridge height reads the border width. Verified at 0px and 5px. |  ✅ |   |
|  3 |  Hovering Shop **coming up from just below the nav** (the hero) opens it. |  Was the client's "nothing opens at all": live 0/4 → RC 4/4. |  ✅ |   |
|  4 |  Diagonal moves toward the dropdown — steep, and toward the far left — keep it open. |  Far-left needed the 150ms close delay. |  ✅ |   |
|  5 |  Moving down along Shop's very edge with a slight sideways wobble keeps it open. |  6/6 closed → 0/6 with the close delay. |  ✅ |   |
|  6 |  Works at 125% and 150% display scaling / browser zoom. |  8px bridge overlap into the dropdown (Shopify support). |  ✅ |   |
|  7 |  Hovering another top-level item (e.g. New Arrivals) still switches away from Shop. |  |  ✅ |   |
|  8 |  Leaving the dropdown (below it, or up above the nav) closes it. |  Closes after 150ms. |  ✅ |   |
|  9 |  Mobile header / drawer unchanged. |  Rules only apply to the desktop menu. |   |   |
|  10 |  Homepage hero shows at every width, including 750–768px. |  Bundled fix — see below. |  ✅ |   |

### Known limitations

-  **Diagonal toward the far right** crosses New Arrivals etc. and switches to them. Accepted.

-  While Shop is open, hovering the strip **under another item** stays on Shop until the pointer reaches that item's text.

-  **Open, not fixed** (stock Dwell; also in 4.1.4):
    -  **Hover during page load is ignored.** If the mouse reaches Shop before the menu script runs, it stays closed until the mouse moves off and back.
    -  **Dropdown items cut off.** Sometimes the dropdown opens too short and the bottom rows are hidden. Found by us; reproducible manually, not yet in automated tests.

### Out of Scope

-  Changing the header's padding or border (the strip itself).

-  Safe-triangle logic for the far-right diagonal.

-  The two open issues above.

## Dev Notes:

Branch `feature/THREADS-desktop-menu`, merged to `release/_candidate` (RC at `6c6fafa`).

-  `0f9c1e6` — `assets/header-menu.js`: Shopify support's 150ms close delay (`#scheduleClose` / `#cancelClose`, cancelled in `activate()`, cleared on disconnect). `blocks/_header-menu.liquid`: open-state bridge extends `--submenu-hover-overlap: 8px` into the dropdown (Shopify suggested moving the dropdown up 8px; same overlap, no panel shift).

-  `f83f3a3` — `sections/header-group.json`: Border thickness 5px (theme editor setting).

-  **4.1.4 migration** (`develop/feature/THREADS-theme-settings-migration`, commit `025109a`, not pushed):
    -  Stock 4.1.4 already covers the gap, flip-flop, "nothing opens from below" and scaling. It still failed far-left diagonals and edge wobble, so the 150ms close delay was ported.
    -  **4.1.4-only bug:** section hydration resets the new disclosure button's `aria-expanded` about 0.3–0.5s after load. An open menu disappears and won't reopen until the mouse leaves and comes back. Fixed by adding `data-skip-node-update="true"` to the button.
    -  The rest of the 3.4.0 fix is not ported; 4.1.4's own code covers it.

-  `f5845d2` — `blocks/_header-menu.liquid`: bridge height is now `--header-padding + --border-bottom-width`. `assets/header-menu.js`: `deactivate()` ignores a leave whose `relatedTarget` is inside the open item.

-  `fd6696d` — `blocks/_header-menu.liquid`: while an item is open (`:has(> [ref='menuitem'][aria-expanded='true'])`), its bridge is absolutely positioned across the full `.header__row` (same box the full-width dropdown uses).

-  `e5e3869` — `blocks/ai_gen_block_540b3cf.liquid`: desktop hero's "hide on mobile" breakpoint changed `max-width: 768px` → `749px`. The mobile hero block (`ai_gen_block_a0a9a35`) shows only at ≤749px, so 750–768px showed **no hero**. Present since the repo's first commit. Note: `ai_gen_block_*` files are AI-generated store content — edited by explicit request.

-  Not caused by the 2026-09-14 accessibility commit (`27fe5fa`); reverting its layout change made no difference.

## Implementation Notes:

## Testing Notes:

Verified on RC `131190325330` and `RS: release/THREADS-v2026.41` `131552772178` (confirmed via `window.Shopify.theme.id`), Chrome 153 and 154, 5px border. Live `131415048274` and stock Dwell 3.4.0 `129595539538` used as "before" baselines — both fail AC 1 and 3. The 4.1.4 migration was verified on dev theme `131192324178` with `025109a`: AC 1–8 pass, matching RC.

**To re-test manually:**

-  Hover Shop, then move **slowly** down into the dropdown. Fast moves often pass even when broken.
-  Repeat along Shop's far-left edge.
-  Come up into Shop from the hero image just under the nav.
-  Move diagonally from Shop toward the far left of the dropdown.
-  Repeat at 125% browser zoom, and at ~760px wide for the hero.

Automated suite steps are in the vault pattern note (`dwell-mega-menu-hover-bridge.md`, "Test suite").

**Check mobile first.** It is the priority surface on this store.

## Bugs from QA:

TBD

## Clarifying Questions:

-  Is the "stays on Shop while hovering under another item" behavior acceptable, or should hovering under an item switch to it?

-  Do we address the two open issues (early hover, cut-off dropdown) now, or as separate tickets?
