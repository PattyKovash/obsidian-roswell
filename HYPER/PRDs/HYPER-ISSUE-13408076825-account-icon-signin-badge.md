---
monday_id: 13408076825
project_key: HYPER
authored: 2026-10-28
---

## Background:

- HMG is launching a customer hub and wants the header account icon to nudge signed-out shoppers to sign in, modeled on [goodr.com](https://goodr.com/).
- Signed-out shoppers see an exclamation-point badge on the account icon; once signed in, the badge disappears.

## Necessary Info (Design/Documentation):

- Design assets from HMG: `Icon_CustomerHub-LoggedOut.svg` (person glyph + orange `#D54300` circle with white "!" over the top-right of the head) and `Icon_CustomerHub-LoggedIn.svg` (same glyph, no badge). Both 100×100 viewBox. The glyph replaces the current Focal person icon in both states.
- Goodr reference (reviewed 2026-10-28): 21px person icon plus a separate 18px badge element absolutely positioned over the top-right of the head (`top: -8px; right: -5px`). Their icon links to a hub drawer (`#k-hub`); HMG's links are unchanged.
- Surface: header account icon, which shows on tablet and desktop (≥741px). On phones the header has no account icon (`hidden-phone`), and the mobile drawer has no account icon either: the account link there is a text item in the mobile navigation menu.
- Badge color `#D54300` matches the theme's `primary_button_background`, but is hard-coded via a CSS variable so a button restyle doesn't change it.
- No new design needed beyond the supplied SVGs.

## Constraints / Scope:

- In scope: header account icon at the breakpoints where it shows today (tablet, desktop).
- Out of scope: mobile drawer account link (pending client direction — see Clarifying Questions); adding an account icon to the phone header; the text-link header variant ("show icons" off), which has no icon.
- Badge state is rendered server-side from `customer`; no JavaScript.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  A signed-out shopper sees the header account icon (tablet and desktop) as the HMG person glyph with the orange "!" badge over the top-right of the head. |   |  ✅ |   |
|  2 |  A signed-in customer sees the header account icon as the same HMG person glyph with no badge. |   |  ✅ |   |
|  3 |  The glyph's stroke weight and size match the header search and cart icons, and the glyph sits in the same position whether or not the badge shows. |   |  ✅ |   |
|  4 |  The glyph uses the header text color; the badge is `#D54300` (set via a CSS variable) with a white "!". |   |  ✅ |   |
|  5 |  Account link destinations and aria-labels are unchanged ("Login" signed out, "Account" signed in). |   |  ✅ |   |
|  6 |  The phone header and the text-link header ("show icons" off) are unchanged. |   |  ✅ |   |

## Dev Notes:

File paths, line numbers, and code below reflect a review at authoring time — confirm they still hold before implementing.

- Icon convention: `snippets/icon.liquid` is a `case` on `icon`, called as `{% render 'icon' with 'name', width:, height:, class: %}`. Each case defaults `width`/`height`, uses `{{ icon_class }}`, `currentColor`, and `settings.icon_stroke_width`. The new icon follows this, plus a `badge` param.
- Header account link: `sections/header.liquid` ~L285–293, inside `.header__icon-list`, `hidden-phone`. Previously rendered `'header-customer'`.
- `'header-customer'` stays as-is. Its only other use, the drawer footer account link in `snippets/mobile-menu.liquid` ~L147–157, is commented out ("assuming account will be a mobile nav item").
- Glyph geometry: the design glyph (circle `cx 40.58 cy 46.75 r 13.47` + shoulders path) scaled by 0.30058 into an 18×18 viewBox, centered like the existing icon. Badge kept in design coordinates inside a `<g>` with the same transform, drawn outside the viewBox with `overflow="visible"` so the icon box doesn't change size or shift.

```liquid
{%- if customer -%}
  {%- render 'icon' with 'header-customer-hub' -%}
{%- else -%}
  {%- render 'icon' with 'header-customer-hub', badge: true -%}
{%- endif -%}
```

```css
:root {
  --customer-hub-badge-color: #d54300;
  --customer-hub-badge-mark-color: #fff;
}
```

## Implementation Notes:

- `snippets/icon.liquid`: new `'header-customer-hub'` case (default 18×18). `badge: true` adds `<g class="icon__badge">` with `.icon__badge-bg` (circle) and `.icon__badge-mark` ("!").
- `assets/rs-custom.css`: `--customer-hub-badge-color` / `--customer-hub-badge-mark-color` on `:root`; `.icon__badge-bg` / `.icon__badge-mark` fills.
- `sections/header.liquid`: account icon renders `'header-customer-hub'`, with `badge: true` when `customer` is blank.
- Commits on `feature/HYPER-ISSUE-13408076825-account-icon`: `59b2c05`, `a01f32a`.

## Testing Notes:

- Preview: `https://hyperlite.myshopify.com/?preview_theme_id=187329314861` (confirm `window.Shopify.theme.id`).
- Signed out, desktop (1440px) and tablet (800px): account icon shows the "!" badge over the top-right of the head; link goes to the sign-in page; aria-label "Login".
- Sign in, return to any storefront page: badge gone, icon in the same spot; link goes to the account page; aria-label "Account".
- Compare the account glyph's stroke and size against the search and cart icons.
- Phone (390px): header has no account icon, same as before.

## Bugs from QA:

- TBD

## Clarifying Questions:

- Mobile drawer: the account link is a text nav item with no icon. Should it be replaced with the icon (with badge), or keep the text and add the "!" over it? Asked Gabrielle 2026-10-28 (she raised the ticket and discussed it with the client on the 2026-10-28 call); Matt as fallback. Work paused on this until answered.
