---
monday_id: 13095154767
project_key: THREADS
authored: 2026-10-20
---

## Background:

-  Raised in the 1st CRO review round as a suggestion ([source doc](https://roswellstudios-company.monday.com/boards/4922048779/pulses/12846919686?doc_id=18427309975)).

-  The Yotpo rewards CTA sits at the top of the page, is not sticky, and gets missed — particularly by signed-out visitors, who are the audience the loyalty programme is trying to convert.

-  Ask: move the rewards entry point into the header so it is always reachable, replicating the Hat Heaven desktop pattern. The mobile header is already crowded, so rewards, account and wishlist placement needed resolving there too.

## Necessary Info (Design/Documentation):

-  Surfaces: desktop header, mobile header, mobile menu drawer.

-  Yotpo's Spotlight widget is **two separately installed pieces** — the Trigger (CTA), a theme app block, and the Drawer, enabled under App embeds ([Yotpo docs](https://support.yotpo.com/docs/yotpo-spotlight-widget#the-trigger-cta)).

-  Yotpo documents one hook for a custom trigger: `document.dispatchEvent(new CustomEvent('yotpo-loyalty-spotlight-open-drawer'))`. Their docs also state the drawer is shown to logged-in customers only, and that a custom trigger loses their built-in login flow — which is why signed-out visitors need their own path.

-  Observed at authoring time, contrary to those docs: with the Spotlight CTA app block disabled, the drawer is never added to the page even though the Drawer app embed is enabled. The CTA block's script is what builds the drawer container.

-  The wishlist icon is injected into the header at runtime by Swym; it is not theme markup.

-  No new design required for mobile. Desktop follows the existing Hat Heaven treatment.

## Constraints / Scope:

-  The Yotpo Spotlight CTA app block must remain **enabled but visually hidden**, because it mounts the drawer. Disabling it removes the drawer entirely and the trigger has nothing to open.

-  Swym's injected wishlist anchor cannot be moved, and a hand-authored `.swym-wishlist` / `#swym-wishlist` anchor stays inert even after calling `swat.initializeActionButtons()` — their script binds only the anchor it injects. The drawer entry is therefore a link to the wishlist page, which is what Swym's own header icon does on this store (it navigates to `/pages/swym-wishlist`) and is one of their [documented launch-point options](https://swym.it/help/adding-the-wishlist-plus-launch-point-to-your-shopify-sites-header-menu/). Trade-off: the drawer entry shows no wishlist count badge. Swym's [custom header icon reference](https://developers.getswym.com/reference/custom-header-icon) suggests `swat.ui.open()` as the richer alternative, but that method is not present on this store's build (`swat.ui` exposes only `Connect` and `renderSFLButtonsOnCartDrawer` as functions) — verify before adopting it.

-  Changing Yotpo's own widget behaviour is out of scope.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  On desktop, signed out, activating the rewards trigger opens the customer account sign-in dialog — the same one the header's account icon opens. |   |   |   |
|  2 |  On desktop, signed in, activating the rewards trigger opens the Yotpo Spotlight rewards drawer. |   |   |   |
|  3 |  On mobile, signed out, activating the rewards trigger opens the customer account sign-in dialog. |   |   |   |
|  4 |  On mobile, signed in, activating the rewards trigger opens the Yotpo Spotlight rewards drawer. |   |   |   |
|  5 |  On desktop, the account icon behaves as it does today: signed out it opens the sign-in dialog, signed in it opens the account menu. |   |   |   |
|  6 |  On mobile, signed out, the account control opens the sign-in dialog and shows the account icon — whether it sits in the header or has been moved to the menu drawer. |   |   |   |
|  7 |  On mobile, signed in, the account control opens the account menu, and in the menu drawer it shows the customer's initial in a filled circle matching the header avatar, in the colour set by Account avatar color. |   |  ✅ |   |
|  8 |  On desktop, the wishlist icon continues to open the wishlist as it does today. |   |   |   |
|  9 |  On mobile with the wishlist icon kept in the header, it behaves as it does today; moved out of the header, a Wishlist row appears in the menu drawer, using the same heart icon as the header and opening the wishlist the same way. |   |   |   |
|  10 |  The rewards trigger, account icon and wishlist icon can each be shown or hidden independently per breakpoint, without affecting the other two or the cart icon. |   |   |   |
|  11 |  The rewards trigger is merchant-configurable: positioned left or right and in the top or bottom row on desktop, and placed in either the menu drawer or the header icon group on mobile. |   |   |   |
|  12 |  With the rewards trigger enabled, the desktop header layout holds from the 750px breakpoint upward — no wrapping, overlap, or shifted logo — and the trigger's image reserves its space so the header does not shift as it loads. |   |   |   |
|  13 |  When the rewards drawer cannot open, the click navigates to the configured fallback page rather than doing nothing. |   |   |  Skip |

### Out of Scope

-  Yotpo's own widget behaviour, including why the drawer requires their CTA block to mount.

-  Relocating or re-binding Swym's injected wishlist anchor.

## Dev Notes:

File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing.

-  **Trigger markup** — `snippets/yotpo-rewards-trigger.liquid`. One snippet renders three contexts via a `context` param: `header` (desktop, positioned by the section's order engine), `mobile-bar` (inside `<header-actions>`), `drawer` (menu drawer). When the `link` param is set it renders a plain `<a>` and no component at all.

-  **Placement** — the trigger plugs into the header's existing positioning engine rather than being special-cased. `snippets/header-row.liquid` reads `settings[item + '_position']` and `settings[item + '_row']` for each key in the order string, so adding `yotpo_rewards` to that string gives it the same left/right and top/bottom options as search and localization. `sections/header.liquid` inserts it immediately before `actions` in every order permutation:

```liquid
if section.settings.show_yotpo_rewards
  assign order = order | replace: ',actions', ',yotpo_rewards,actions'
endif
```

-  **Mobile placement** — the mobile grid has five fixed slots (`leftA leftB center rightA rightB`) and cannot honour the row/column settings, so the desktop instance is hidden below 750px and a second `mobile-bar` instance renders inside `<header-actions>`. Visibility is keyed to the viewport, **not** `[data-menu-style]` — that attribute flips to `drawer` on any touch device (`assets/utilities.js`, `setHeaderMenuStyle`), which would drop the trigger on touch-screen laptops.

-  **Signed-in path** — `assets/yotpo-rewards-trigger.js` dispatches Yotpo's documented event, then guards against the click dying silently:

```js
#openRewardsDrawer() {
  document.dispatchEvent(new CustomEvent('yotpo-loyalty-spotlight-open-drawer'));
  const drawer = document.querySelector(DRAWER_SELECTOR);
  if (!drawer) return this.#goToFallback();
  setTimeout(() => {
    if (!drawer.classList.contains(DRAWER_ACTIVE_CLASS)) this.#goToFallback();
  }, DRAWER_OPEN_TIMEOUT);
}
```

   -  The drawer is matched by class because Yotpo's element exposes nothing else — no id, no `data-*`, no `role`, no `aria-hidden`, and the open state is a class too (`yotpo-spotlight-drawer--active`). If Yotpo renames it, the fallback fires instead of the drawer opening.

-  **Signed-out path** — `assets/account-dialog.js`. `<shopify-account>` exposes no `open()` method and ignores a click on the host element, so the only way in from a second trigger is its own button inside the open shadow root (`button[part="signed-out-avatar"]`). The dialog it opens is a native modal `<dialog>`, which restores focus to whatever was focused beforehand — so the trigger is focused first, and focus lands back on it on close. Falls back to `routes.account_login_url` when the account element is absent.

-  **Account in the drawer** — when account is moved out of the mobile header, the header instance stays rendered but clipped to zero size. `display: none` and `visibility: hidden` both stop its dialog from opening; clipping leaves the control focusable, so `assets/account-trigger.js` toggles `inert` on the 749px media query (inert is an attribute, so it cannot be set from CSS). A modal dialog is exempt from an inert ancestor, so its own controls stay usable.

-  **Wishlist** — Swym injects `a#swym-inject-header.swym-wishlist` into `<header-actions>` at runtime, so visibility is CSS-only, scoped to a `data-wishlist-visibility` attribute on `#header-component`. Liquid is not evaluated inside `{% stylesheet %}` blocks, which is why the state is carried on an attribute rather than emitted conditionally.

-  **Element naming** — the custom elements end in `-component` (`yotpo-rewards-trigger-component`, `account-trigger-component`) so `assets/component.js` applies its upgrade-race rescue and warns; elements not matching that suffix have their clicks dropped silently if the module has not executed yet.

-  **Back-compat** — schema defaults do not backfill sections already saved in `header-group.json`, so every new visibility setting is read nil-tolerantly: only an explicit `false` hides an icon.

## Implementation Notes:

-  Commits: `b9ec253` (trigger, per-breakpoint settings, drawer entries), `aa085ca` (drawer fallback, `-component` renames).

-  New files: `snippets/yotpo-rewards-trigger.liquid`, `snippets/header-drawer-actions.liquid`, `assets/yotpo-rewards-trigger.js`, `assets/account-trigger.js`, `assets/account-dialog.js`, `assets/icon-heart.svg`.

-  Modified: `sections/header.liquid`, `sections/_blocks.liquid`, `snippets/header-row.liquid`, `snippets/header-actions.liquid`, `snippets/header-drawer.liquid`, `snippets/section.liquid`, `snippets/scripts.liquid`.

-  Settings added under Header → Yotpo rewards: show on desktop, position, row, image, image height, text (signed in), text (signed out), text colour, fallback page, link instead of drawer (desktop); show on mobile, show in mobile header, mobile image, mobile image height, mobile text (signed in / signed out), mobile text colour, link instead of drawer (mobile). Customer account and Wishlist groups each gained show on desktop / show on mobile / show in mobile header; Wishlist also has a drawer link label and URL.

-  A `custom_class` setting was added to `sections/header.liquid` and to the generic section wrapper (`sections/_blocks.liquid` + `snippets/section.liquid`), used to hide the Yotpo CTA section while leaving it enabled.

-  Fallback page is `/pages/loyalty-rewards` (verified live; `/pages/rewards` returns 404).

## Testing Notes:

-  **Check your VPN first.** During development the rewards trigger did nothing on a physical iPhone while signed in, and the cause was the VPN on that device: it blocked Yotpo's customer lookup (`storefront.yotpo.com/loyalty/v3/stores/{id}/customer_view/spotlight`), which is what builds the drawer. With no drawer on the page, neither this trigger nor Yotpo's own CTA does anything. If the drawer does not open, disable any VPN, tracker blocker, or filtering DNS and retest before raising a bug. Tracker blocklists commonly include Yotpo.

-  Test each of the four core cases on the dev theme, signed out and signed in, at desktop and mobile widths:

   -  Signed out → the account sign-in dialog opens.

   -  Signed in → the Yotpo rewards drawer opens.

-  Layout (AC 12): check the desktop header at 750px (where the mobile grid hands over to the desktop layout), 1024px and 1440px with the trigger enabled — no wrapping, no overlap with the logo or icon group, and no shift as the trigger's image loads.

-  Mobile placement: with "Show in mobile header" off, the rewards trigger is in the menu drawer; with it on, it sits in the header icon group beside the cart.

-  Account and wishlist (AC 5–9): check each on desktop, then on mobile both in the header and switched out to the menu drawer. Signed out, the account control opens the sign-in dialog; signed in, it opens the account menu. The wishlist control opens the wishlist page in every position.

-  Fallback (AC 13): **QA skip** — verified by the Roswell dev, as it requires disabling the Yotpo Spotlight CTA section to remove the drawer, then restoring it.

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  Yotpo's docs say the Spotlight Drawer installs standalone via App embeds, but with the CTA app block disabled the drawer is never built. Do we raise this with Yotpo support, or accept the hidden-CTA-section workaround permanently? The workaround is a trap for whoever next edits the header group, since the section looks disposable.
