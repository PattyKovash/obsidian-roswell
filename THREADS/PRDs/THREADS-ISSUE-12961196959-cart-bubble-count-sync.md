---
monday_id: 12961196959
project_key: THREADS
authored: 2026-09-15
---

## Background:

-  The live theme keeps the cart icon's count in sync no matter what changes the cart, including changes made by apps. It does this with a custom script that watches cart network traffic.

-  The 4.1.4 upgrade dropped that script. The upgraded theme only updates the count when one of its **own** components changes the cart. Apps that add to the cart are invisible to it.

-  Several apps on this store change the cart directly: Rebuy Smart Cart (the ajax cart shoppers actually see) and the Shop the Look widget on product pages. After either, the count stays stale until a full page load.

-  An earlier review of this ticket concluded no port was needed, on the grounds that nothing bypassed the theme's own event system. That was wrong — it was based on searching the theme's files, and apps inject themselves at runtime, so they never appear there.

## Necessary Info (Design/Documentation):

-  No design. This restores behavior the live site already has.

-  Surfaces: the header cart count, on every page.

-  The theme's own cart drawer does not render on this store — Rebuy Smart Cart replaces it. So "the cart" a shopper sees is Rebuy's, and changes made there are exactly the ones that were going unnoticed.

-  The count is slow to settle — roughly 6–10 seconds after a change. That is pre-existing theme behavior, measured before this work, and is not addressed here.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Changing an item's quantity inside the Rebuy cart updates the header count. |  Verified on mobile: 1 → 2, count followed at ~6s. |  ✅ |   |
|  2 |  Removing an item inside the Rebuy cart updates the header count. |  Confirmed working. |  ✅ |   |
|  3 |  Removing the **last** item empties the cart and the count disappears entirely rather than showing zero. |  Separate path from #2 — hiding the bubble, not decrementing it. |   |   |
|  4 |  Adding a product from Rebuy's recommendations ("Customers also added") updates the header count. |  Confirmed working. Rebuy appears only inside the cart on this store. |  ✅ |   |
|  5 |  Adding a product from the **Shop the Look** widget on a product page updates the header count. |  Confirmed working. |  ✅ |   |
|  6 |  Adding to cart from the theme's own product page, quick-add and sticky bar still updates the count, with no repeated animation. |  Verified on mobile. |  ✅ |   |
|  7 |  After an app changes the cart, navigating away and pressing back still shows the correct count. |  Regression guard, not a fix — this already works on live. Not yet tested here. |   |   |
|  8 |  Nothing else that relies on network requests breaks — collection filters, predictive search, quick-add. |  Highest-risk item: the fix works by wrapping the browser's network calls site-wide. Verified on `/collections/dresses` — availability filter applied and the grid re-rendered; predictive search returned 36 real results. |  ✅ |   |
|  9 |  No new browser console errors. |  Verified: the errors present are pre-existing third-party ones. |  ✅ |   |

### Out of Scope

-  **How long the count takes to update.** It settles at roughly 6–10 seconds, before and after this change. Worth its own ticket; it is theme behavior, not app behavior.

-  **Rebuy's own cart display.** Rebuy renders and updates its own totals. This ticket only concerns the theme's header count.

## Dev Notes:

*Reflects a review at authoring time — confirm before implementing.*

-  Commit `ecbad88`. New file `assets/cart-external-sync.js`, loaded from `snippets/header-actions.liquid` beside `cart-icon.js`.

-  It wraps `fetch` and `XMLHttpRequest`, watches for `/cart/add|change|update|clear`, then takes the count from the response when it carries one and re-reads `/cart.js` when it doesn't (`/cart/add.js` returns only the added line).

-  **It hands the count to `cart-icon.js`'s `renderCartBubble()` rather than writing the DOM.** This is the main departure from the live script, and it matters: the component owns `sessionStorage`, the animation, and the rule that counts of 100+ render blank. Writing the DOM directly would have meant two writers and would have reintroduced all three problems.

-  Both globals are wrapped as a **chain** — the original is always called — so other scripts that wrap them keep working. Rebuy does.

-  **On the risk of replacing `window.fetch` site-wide.** This is worth being explicit about, because it means every network request on the site passes through theme code. It cannot be scoped to cart URLs only — `window.fetch` is a single function, so any interception sits in the path for every call; you only choose what to *do* once inside.

    The live theme already does exactly this, and has for as long as it has been in production, alongside Rebuy, Swym, Yotpo, Klaviyo and Analyzify. This implementation is **less** invasive than live's: live attaches a `.then()` to every fetch and returns a new promise even for requests it ignores, whereas this one tests the URL first and returns the original promise untouched for anything non-cart.

    The alternative with no interception at all is `PerformanceObserver` on resource timing — it observes completed requests rather than sitting in the call path. It was not chosen because it carries no response body, so it would always cost an extra `/cart.js` read. That remains the fallback if the wrapping approach ever causes trouble.

    Because of this, criterion 8 — nothing else network-driven breaking — matters more than the feature itself. A stale count is cosmetic; a broken filter or search is not.

-  Three deliberate differences from the live script: `/cart/clear.js` is handled (live missed it, so an app emptying the cart left a stale count); a re-render is skipped when the count already matches, so theme-initiated changes don't replay the animation; and overlapping changes are queued rather than dropped.

-  Not copied forward from the live script: it wrote the raw number above 99 where the theme blanks it, and it kept screen-reader text in sync via markup 4.1.4 removed. Both are handled by routing through the component instead.

-  The live script never recorded the count to `sessionStorage`, which 4.1.4 reads when restoring a cached page. Routing through the component means this one does. Worth noting this is **not** fixing a live problem — back-navigation already works on live, because the script keeps the visible count correct and that is what gets cached. It is a small robustness gain, not a defect being repaired.

## Implementation Notes:

## Testing Notes:

Verified on `131192324178`, mobile viewport (390×844) first.

**The core case** — Rebuy quantity increment, from inside the Smart Cart:

|  | before | 2s | 4s | **6s** | 8s+ |
| --- | --- | --- | --- | --- | --- |
|  Header count |  1 |  1 |  1 |  **2** |  2 |

Server went 1 → 2 and the stored count recorded 2. The buttons used were Rebuy's own (`aria-label="Increase quantity of Tube Strap"`), so this is genuinely an app-initiated change.

**To re-test:** open a product page, wait ~10 seconds for Rebuy to finish loading (before that, the cart icon still links to `/cart` and the Smart Cart will not open), add something, then change the quantity inside the Rebuy cart and watch the header count. Give it 10 seconds before calling it a failure — it is slow.

**Rebuy remove, last item** — server went 2 → 0 and the count was hidden (not showing zero) by 4s.

**Regression check** — on `/collections/dresses`, the availability filter applied and the grid re-rendered; predictive search returned 36 results. Both run through the wrapped `fetch`, and the wrapper was confirmed still installed at each step. The card count staying at 24 under "In stock" is correct — Availability alone means "has at least one variant in stock", and every dress in that collection qualifies.

**Check mobile first.** It is the priority surface on this store.

## Bugs from QA:

TBD

## Clarifying Questions:

None.
