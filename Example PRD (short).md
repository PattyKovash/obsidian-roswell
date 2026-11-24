---
edge_id: HYPER2-009
edge_version: 26
project_key: HYPER
authored: 2026-11-24
status: example (shortened from the pushed PRD)
---

## Background:

- The Klaviyo Chat Widget (Klaviyo's floating chat button) covers buttons shoppers need:
  - **Product page, phone and tablet:** the sticky Add to Cart button.
  - **Cart drawer, all screen sizes:** the Checkout button.
- Original ticket: "klaviyo box shouldnt block CTA". The client has since turned off Klaviyo Hub's product page Add to Cart widget, so this ticket covers the Chat Widget only.

## Necessary Info (Design/Documentation):

- Related: [HYPER2-007](https://theedge.roswell.nyc/pod/hyperlite?issue=HYPER2-007) (Klaviyo Favorites fixes).
  - https://theedge.roswell.nyc/pod/hyperlite?issue=HYPER2-007
- No new design needed.

## Constraints / Scope:

- Desktop product page: the sticky bar is at the top of the screen, so the chat widget stays where Klaviyo puts it.
- Out of scope: other drawers (menu, quick view, filters, search) and the widget's position and color settings in Klaviyo.

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | **Sticky Add to Cart (phone and tablet, 375–999px):** while the bar shows, the chat widget sits above it and doesn't cover Add to Cart. When the bar hides, the widget returns to its usual spot. | Scroll down a product page until the bar appears. | ✅ | ✅ |
| 2 | **Shop the Look drawer (all sizes):** while the drawer is open, the chat widget is hidden; it comes back when the drawer closes. | Example post: https://hyperlitemountaingear.com/blogs/the-trailhead/new-peter-bugg | ✅ | ✅ |
| 3 | **Sign-up tab:** Klaviyo's "GET 10% OFF" tab is hidden while the sticky bar shows (phone and tablet) or the cart drawer is open (all sizes). | See Testing Notes. | ✅ | ✅ |

_(Example trimmed to three rows; a real ticket lists every criterion.)_

## Testing Notes:

- Close Klaviyo's sign-up popup first: the "GET 10% OFF" tab only appears after (bottom-left). Add an item to the cart so the Checkout button shows.

## Implementation Notes:

- The chat widget is hidden (also from screen readers and keyboard) while the cart drawer or Shop the Look drawer is open.
- New settings in Theme settings → **RS Klaviyo Hub**: "Klaviyo Chat offset" (default 10px) and "Sticky add to cart height (px)" (default 102, a fallback until the page measures the bar).
- Technical details, test results and screenshots: [vault notes](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper2-009-klaviyo-pdp-widget/README.md).
  - https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper2-009-klaviyo-pdp-widget/README.md

## Dev Notes:

- claude --resume bab163ac-60d7-4022-9134-0be78e0285bf
- Klaviyo styles the Chat Widget inline, so the theme's CSS overrides it, targeting only Klaviyo's `kl-hub-` classes (Klaviyo says those are safe for custom CSS).
- For full dev notes, see the [vault notes](https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper2-009-klaviyo-pdp-widget/README.md).
  - https://github.com/roswell-studios/roswell-vaults/blob/main/vaults/hyperlite/04-engineering/planning/hyper2-009-klaviyo-pdp-widget/README.md

## Bugs from QA:

- TBD

## Clarifying Questions:

- None.
