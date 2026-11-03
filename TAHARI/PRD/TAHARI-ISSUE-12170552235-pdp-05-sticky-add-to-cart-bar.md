
## Background:

- New scroll-triggered sticky add-to-cart bar for the PDP (mobile-first, per Figma) — appears once the customer scrolls past the main buy box.
- PRD 5 of 6 for the new PDP. Depends on **PRD-01 (Scaffolding)** for the sticky-bar setting stub, **PRD-03 (Variant Picker)** for the current selection, and **PRD-04 (Buy Box Actions)** for the actual Add to Bag/Buy Now logic it must reuse, not duplicate.
- Monday Ticket: [12551904249](https://roswellstudios-company.monday.com/boards/4922048779/pulses/12551904249)

## Standing Requirement: Prefer Web Components (added 2026-07-28)

**New PDP JS should be built as a web component (a real custom element,
or extending/wrapping an existing one like `<slider-component>`), not a
bare IIFE script that reaches into the DOM from outside — especially on
the PDP, where dynamic content swap/injection is a common pattern.**

This was missed once already: `assets/main-product-gallery.js` (PRD-02)
was built as a plain querySelector-and-addEventListener script, reasoned
at the time as "glue code wiring into existing web components, not new
UI" — that reasoning didn't hold up against this standing preference and
the file is being converted after the fact (see
`02-decisions/decisions.md`, 2026-07-28).

**If there's a real reason not to build something as a web component for
a specific piece of work under this PRD, STOP and explain the reasoning
to the user, then get explicit confirmation before proceeding with a
non-web-component approach.** Do not silently default to a lighter
pattern the way the gallery script did.

## Necessary Info (Design/Documentation):

- **Figma:** [Sticky bar](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15242&m=dev) — a fixed bottom bar with a product thumbnail, name, "Size, Colour" summary, price, and outline "Add to Bag" / solid "Buy Now" buttons. The [mobile full PDP reference](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=1117-15129&m=dev) also shows a compressed size/color quick-picker row above the buttons, and a "Sold Out"/"Notify me" pairing for the unavailable state.
- The current PDP already has a sticky bottom cart bar — this replaces it with the new Figma design, reusing PRD-04's buttons rather than building new cart logic.
- Color selection navigates to a different product page (see PRD-03) — the bar doesn't need to dynamically sync when color changes, since the whole page (including the bar) reloads on that new product. Only size selection needs the bar to update live, using whatever dynamic update the current theme already provides.

## Constraints / Scope:

- **In scope:** the fixed bottom bar (thumbnail, name, variant summary, price, buttons or sold-out/notify state), the show/hide-on-scroll behavior, and the compressed size/color row.
- **Out of scope:** any new Add-to-Cart/Buy-Now/Notify-Me logic — this bar's buttons must call PRD-04's existing handlers, not a second implementation. A desktop version of this bar is out of scope unless confirmed necessary (see Clarifying Questions) — desktop already shows the buy box in view via PRD-03/04's floating panel.
- **Assumption:** the bar appears once the main buy box scrolls out of view and hides again when scrolled back above it; exact boundaries should be confirmed if a prototype/interaction spec exists, otherwise this is a reasonable default.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  The bar is hidden on page load and appears once the user scrolls the main buy box out of view. |   |   |   |
|  2 |  The bar shows the current gallery thumbnail, product name, "Size, Colour" summary, and price, matching Figma. |   |   |   |
|  3 |  When available, the bar shows outline "Add to Bag" and solid "Buy Now" buttons; clicking either uses the exact same logic as the main buy box (PRD-04). |   |   |   |
|  4 |  When sold out, the bar shows a disabled "Sold Out" indicator and a solid "Notify me" button using PRD-04's existing flow. |   |   |   |
|  5 |  The bar updates immediately when the shopper changes size, even while visible (color change navigates to a new page, so the bar naturally reflects it there). |   |   |   |
|  6 |  Show/hide doesn't cause layout shift or janky scrolling. |   |   |   |
|  7 |  The bar doesn't trap keyboard/screen-reader focus for the rest of the page; its buttons are reachable via Tab in a logical order when visible. |   |   |   |
|  8 |  On mobile, the bar respects safe-area insets and doesn't overlap browser chrome. |   |   |   |
|  9 |  No changes are made to the current live product page or any live templates. |   |   |   |

### Out of Scope

- New Add-to-Cart/Buy-Now/Notify-Me logic (must reuse PRD-04's).
- Desktop sticky bar, unless confirmed necessary.

## Dev Notes:

- **New files (proposed):** implement as the content of PRD-01's sticky-bar wrapper — `snippets/sticky-add-to-cart.liquid` + `assets/sticky-add-to-cart.js`.
- **Visibility trigger:** use `IntersectionObserver` watching the main buy box's Add to Bag button — show the bar when it leaves the viewport, hide it when it re-enters. Review `assets/product-sticky.js` (the current theme's sticky-bar script) first for reusable logic before writing new.
- **Shared state, not duplicated logic:** for size changes, hook into whatever existing update mechanism the current theme already fires on variant change (no new event needed — just confirm the bar's price/availability display stays in sync). For Add to Bag, call the same `<product-form>`/`ProductForm` submit path PRD-04 uses. For Buy Now, drop in the same `<buy-now-button>` component PRD-04 defines — it dispatches a `buy-now:error` event on failure that this bar should route into its own error container. For sold-out/Notify Me, reuse the same `<klaviyo-bis-form>` instance/pattern from PRD-04.
- **Compressed quick-picker row:** the color portion is a plain link to the sibling product (same as PRD-03's main color selector — no overlay needed). The size portion should confirm whether it opens PRD-03's full size picker in an overlay, or a separate compact interaction — no dedicated Figma screen exists for this specific behavior; default to reusing PRD-03's picker in an overlay if nothing else is specified.

## Implementation Notes:

_(To be completed after the work is done — final visibility-trigger implementation and whether a desktop variant was built.)_

## Bugs from QA:

- TBD

## Clarifying Questions:

- Does the sticky bar apply on desktop at all, given the buy box is already visible there via the floating panel?
- What are the exact scroll boundaries for showing/hiding the bar?
- Does the compressed quick-picker row's size portion open PRD-03's full picker inline, or a separate compact overlay?
