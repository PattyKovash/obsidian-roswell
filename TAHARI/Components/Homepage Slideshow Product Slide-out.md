# Product Slide-out (reusable component)

**Ticket:** TAHARI-ISSUE-12131533470 (`feature/TAHARI-12131533470-thumbnail-slide`)
**Figma:** [node 45:191 desktop](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=45-191) · [node 87:438 mobile](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=87-438) · component [node 29:104](https://www.figma.com/design/RTEarArQVMHyU8ZuXFWfKr/Elie-Tahari?node-id=29-104)

## What was built

A **reusable `<product-slide-out>` web component**: a small product thumbnail that
docks to the bottom-right of its container and expands into a card (title +
**Explore** → PDP, **Buy Now** → add-and-go to cart). First consumer is the
homepage hero slideshow; it can drop into any section (e.g. Image Banner) by
rendering one snippet + loading two assets.

- **Desktop:** thumbnail hidden until the slide is hovered/focused, then slides in;
  hover or keyboard-focus+Enter expands the card.
- **Mobile:** thumbnail always docked; tap toggles the card.
- **No product selected → nothing renders.**

## Why it exists

Luxury quick-browse pattern (Loewe / Hermès) — feature a product from the hero
without leaving the page. Thumbnails are **rectangular, never circular** (May 14
fullscreen-gallery decision).

## Architecture (reusable)

- `assets/product-slideout.css` — the component. Positioning-agnostic: docks to the
  nearest positioned ancestor, inset by `--outer`. Fixed-width panel = the text is
  laid out once and **unmasked** as the card grows (drawer wipe, no reflow).
- `assets/product-slideout.js` — the `<product-slide-out>` custom element. Owns the
  open/closed state; one attribute (`open`) drives visuals + accessibility together.
  One shared document listener for outside-close; per-element listeners otherwise.
- `snippets/product-slideout.liquid` — orchestrator. Params `product` +
  `mobile_product`; renders one card when they match, two (toggled by breakpoint)
  when they differ. Off-viewport thumbnail is lazy + `display:none` → not fetched.
- `snippets/product-slideout-card.liquid` — the markup for one element.

**Slideshow wiring:** `blocks/_slide-image.liquid` adds `slideout_product` +
`slideout_mobile_product`; `snippets/slide.liquid` renders the orchestrator inside
`.hero__content__wrapper` (so it pairs with the hero CTA and adds
`slideshow__slide--has-slideout`); `assets/slideshow.css` holds only the thin
slideshow-specific "hide until slide hover" layer; the section loads the two assets.
`locales/*.json` hold `products.general.explore` / `buy_now`.

## Accessibility (WCAG 2.2 / ARIA APG Disclosure)

- Collapsed panel is **`inert` + `visibility:hidden`** → its links are out of the
  tab order *and* the accessibility tree until opened (belt-and-suspenders; `inert`
  is the explicit attribute a11y scanners look for). `visibility:hidden`/`display:none`
  hide from AT — unlike opacity/clip/off-screen, which is what scans flag.
- Hover-only reveal has a **keyboard/focus equivalent** (SC 1.4.13, 2.1.1).
- Semantic `<button aria-expanded aria-controls>`; `:focus-visible` outline;
  **Escape** closes and restores focus; decorative `<img alt="">`.

## Decisions & tradeoffs

- **Reusable component, not slideshow-only** — per request, so Image Banner etc. can
  add it in one step. Slideshow keeps its signature "hide until hover" as a thin
  layer targeting the `product-slide-out` tag.
- **Positioning** docks inside the hero content wrapper so it stays paired with the
  CTA at any hero height (the hero image is full-bleed while the CTA respects
  section padding — a fixed offset can't track it).
- **Buy Now = add-and-go permalink** (`/cart/{variant_id}:1`) interim; real custom
  add-to-bag+checkout not yet scoped. Falls back to PDP when no purchasable variant.
- **Performance:** one element in the common case; shared outside-close listener;
  lazy + hidden off-viewport image; `max-width` animation on a tiny one-element card.
- **Open:** exact expanded-card spacing approximated from screenshots — the Figma
  "Frame 34" expanded variant dimensions weren't extractable; fine-tune when available.
