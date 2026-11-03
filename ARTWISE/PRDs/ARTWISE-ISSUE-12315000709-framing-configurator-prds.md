# Framing Configurator — PRD Breakdown

Source: mockup `framing-prototype (1).html` (canvas-based prototype: Artwork/Room toggle, frame style grid, mat colour picker, room placement selector, tier badge, price breakdown, framed ATC, provenance strip) compared against the live ArtWise PDP (`Shopify/templates/product.json` → `Shopify/sections/product.liquid` → `Shopify/snippets/product.liquid`).

Parent Monday ticket: **12315000709**. No sub-ticket IDs exist yet — each PRD below references the parent ID in its filename slot; split into separate Monday items using the divider breaks when ready.

**Cross-cutting finding (applies to all 5 PRDs below):** there is currently **no native framing feature** in the theme. Framing today is 100% third-party app surface:
- **Picture It** app embed — `picture_it_live_preview_block_ERpRyr` block in `Shopify/templates/product.json`, a "FRAME IT" / live-preview button targeting `media_gallery_selector: "media-gallery"` (note: the actual gallery custom element is `<product-images>`, not `media-gallery` — possible existing dead/mismatched selector, worth a quick check before build).
- **Artplacer** — a commented-out room-preview embed in `Shopify/snippets/product-buttons.liquid:472-475`.
- **"I'm interested in Framing"** — a plain lead-gen checkbox, block `line_item_c9CJhy` in `product.json`, rendered via `Shopify/snippets/product-properties.liquid`. It captures interest only; it has no pricing, no frame/mat options, and does nothing with the selection.

Building the mockup natively means deciding whether this **replaces** those three app-driven surfaces or **coexists** with them. That decision gates all 5 PRDs and is called out as a Clarifying Question in PRD-1 and PRD-4 — do not start build until it's answered.

---

# PRD-1: Framing & Mat Data Model

## Background:

- The framing mockup requires a structured catalog of frame styles (name, swatch colour, price, minimum tier) and mat colours (name, swatch), plus a tier system (Essential / Signature / Museum) that gates which frames are available based on the artwork's price.
- None of this exists today. The theme has no frame/mat metafields, no metaobjects, and no tier logic anywhere in `Shopify/`.
- This is foundational — PRD-2 (viewer), PRD-3 (picker UI), and PRD-4 (pricing/ATC) all read from the data model defined here.

## Necessary Info (Design/Documentation):

- Existing per-product metafields already power the PDP's structured data and description blocks: `ArtistFancy`, `Type`, `Style`, `Year`, `Subject`, `Color`, `Image_Size`, `Condition`, `Details_API_V3`, `dimensionsapi`, `Description_Final` (referenced in `Shopify/snippets/product.liquid:914-982`, the `VisualArtwork` JSON-LD block). These are metafields, not metaobjects.
- No design file exists for the frame swatches (colours in the mockup are placeholder hex values, e.g. Matte Black `#1a1a1a`, Natural Oak `#c4a06a`) — real swatch colours/images need sourcing from the framing vendor or a designer before this ships to production; the mockup hex values are **not** approved production colours.
- Mockup's tier logic (hardcoded per demo product, not price-driven in the actual code) implies a price-threshold rule, e.g. Essential < $1,000, Signature $1,000–$5,000, Museum > $5,000. **These thresholds are illustrative from the mockup only and need merchant confirmation.**

## Constraints / Scope:

- **In scope:** define the data structure for frame styles (id, name, swatch colour/image, price, `tiers` array) and mat colours (id, name, swatch colour), and a tier-threshold setting keyed off product price.
- **Recommended approach:** Shopify **metaobjects** for `frame_style` and `mat_colour` (repeating structured entries, editable in theme editor / admin without redeploys) rather than a hardcoded JSON blob in section settings or theme code. This mirrors how metaobjects are already used for structured admin-editable data in modern Shopify themes; confirm this is acceptable vs. the client's preference for hardcoded settings.
- **Out of scope:** real inventory/fulfillment for framing (this ticket defines pricing/display data only, not production/vendor integration), migrating off Picture It/Artplacer (see Clarifying Questions), per-product frame curation (assume frame/mat catalog is global across all products for v1 unless told otherwise).

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
| --- | --- | --- | --- | --- |
| 1 | A `frame_style` metaobject definition exists with fields: name, swatch colour (or image), price, and a multi-select `tiers` field (Essential/Signature/Museum). |  |  |  |
| 2 | A `mat_colour` metaobject definition exists with fields: name and swatch colour (nullable/"No mat" supported). |  |  |  |
| 3 | A theme setting (or metaobject) defines the price thresholds that map a product's price to Essential/Signature/Museum tier. |  |  |  |
| 4 | At least one seeded entry per tier exists for frame styles so PRD-2/3 can be built and QA'd against real data. |  |  |  |
| 5 | Frame styles correctly declare which tiers they're available to, matching the mockup's lock behaviour (e.g. a Museum-only frame is unavailable on an Essential-tier product). |  |  |  |
| 6 | Data model changes do not remove or break the existing `VisualArtwork` JSON-LD metafields or any current PDP block. |  |  |  |

## Dev Notes:

- No existing metaobject definitions were found in this repo during research — confirm via Shopify Admin → Settings → Custom data → Metaobjects before assuming a greenfield build; there may be undocumented ones already in the live store.
- Existing metafield-consumption pattern to stay consistent with (`Shopify/snippets/product.liquid` ~line 914):
  ```liquid
  {%- assign artist = product.metafields.custom.artistfancy -%}
  ```
  Metaobject field access follows the same dot-notation via `shop.metaobjects.frame_style.values` or a metafield-of-type-metaobject-reference on the product, depending on which linking approach is chosen (see Clarifying Questions).
- Tier-threshold setting: simplest implementation is a `settings_schema.json` entry (e.g. `essential_max_price`, `signature_max_price`) read in Liquid to compute `{% if product.price < settings.essential_max_price %}essential{% endif %}` — keep this logic in one place (a snippet, e.g. `snippets/framing-tier.liquid`) so PRD-2/3/4 all include it rather than re-deriving it.
- Action item: confirm with the client/designer what the real frame swatch images/colours are before seeding data — do not ship the mockup's placeholder hex values to production.

## Implementation Notes:



## Bugs from QA:

- TBD

## Clarifying Questions:

- **Does this native configurator replace or coexist with Picture It and Artplacer?** If it replaces them, those app embed blocks (`picture_it_live_preview_block_ERpRyr`, the commented Artplacer code, and the `line_item_c9CJhy` checkbox) should be removed as part of this work — flag for the client to confirm before build starts.
- Are frame/mat options global across the whole catalog, or curated per product/collection (e.g. some frames unavailable for oversized pieces)?
- What are the actual production price thresholds for Essential/Signature/Museum tiers (mockup values are placeholders)?
- Metaobjects vs. simple theme-settings JSON — does the client need admin-editable frame/mat catalog (metaobjects), or is a developer-maintained settings list acceptable?

---

# PRD-2: Framed Gallery Viewer (Artwork / Room Toggle + Room Placement)

## Background:

- The mockup's left panel replaces a static product image with a live "framed preview": an **Artwork** view (art matted and framed, true to aspect ratio) and an **In a room** view (the same framed art composited into a furnished room photo), switchable via a toggle, with a room-picker (Living room / Bedroom / Home office / Hallway) that swaps the background scene.
- The current PDP gallery has no concept of framing overlay at all — it renders whatever media is uploaded to the product, full stop.
- Depends on PRD-1 for frame/mat data and tier logic, and feeds live preview updates from PRD-3's picker selections.

## Necessary Info (Design/Documentation):

- Current gallery: `<product-images>` custom element, markup in `Shopify/snippets/product.liquid:155-328`. Each media item renders via `Shopify/snippets/media.liquid`; zoom (PhotoSwipe) via `Shopify/assets/zoom.js`; thumbnails via `Shopify/assets/product-thumbs.js`.
- Variant-driven image switching already exists: `Shopify/assets/product-info.js` listens for `theme.PUB_SUB_EVENTS.optionValueSelectionChange`, re-fetches the section, and swaps gallery media (matches on `data-variant="variant--<value>"` tags set in `media.liquid:35-36`). This is the theme's existing pattern for "picker selection updates the gallery" — the new framing viewer should follow the same event-driven shape rather than inventing a new mechanism, for consistency (see Dev Notes).
- No Preact/custom-element work currently touches the gallery — `src/entrypoints/main.tsx` only registers `HelloWorld`, `CartProvider`, `GlobalProvider`. This is net-new component work.
- Mockup implementation uses `<canvas>` with hand-drawn gradients standing in for real artwork. **Production must composite the actual product image**, not a placeholder gradient — this is the single biggest technical difference between prototype and real build.

## Constraints / Scope:

- **In scope:** a flat 2D layered composite (product image → mat colour layer → frame border, sized by aspect ratio) for the "Artwork" view, and the same composite placed over a small curated set of static room photos for "In a room" view.
- **Recommended approach:** CSS-layered `<div>`/`<img>` compositing (frame as a padded border box, mat as an inner padded box, product image innermost) rather than literal `<canvas>` drawing — cheaper to build, more accessible, easier to keep responsive, and avoids re-drawing raster art. Canvas is only worth it if pixel-accurate shadow/glare effects are a hard requirement (mockup has these, but they're decorative, not functional).
- **Out of scope:** true perspective/AR room placement (that's what the disabled Artplacer widget already does) — this PRD is flat 2D overlay only, matching the mockup's own approach. Real-time user room photo upload is out of scope (room scenes are a small fixed set, see Clarifying Questions).
- Aspect ratio for the artwork frame must come from real product dimension data — confirm `dimensionsapi` metafield format is parseable (e.g. `"27 x 39 in"`) before assuming automatic sizing works out of the box.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
| --- | --- | --- | --- | --- |
| 1 | An "Artwork" / "In a room" toggle is present above the gallery and switches views without a page reload. |  |  |  |
| 2 | The "Artwork" view shows the real product image framed with the currently-selected frame style and mat colour, sized proportionally to the product's real dimensions. |  |  |  |
| 3 | The "In a room" view shows the same framed composite placed over a room background photo. |  |  |  |
| 4 | A room-selector control swaps between at least the room scenes defined in PRD-1/asset scope, updating the background photo without affecting frame/mat selection. |  |  |  |
| 5 | Changing frame style or mat colour (via PRD-3's picker) updates the preview live in both Artwork and Room views. |  |  |  |
| 6 | On mobile, the viewer remains usable (stacks above controls, no horizontal overflow) matching the existing responsive gallery breakpoint behavior. |  |  |  |
| 7 | Existing gallery features (zoom, video/3D media, thumbnails) are not broken for products that don't use the framing configurator (i.e. this is additive, not a wholesale gallery rewrite unless PRD-1's clarifying question confirms full replacement). |  |  |  |

## Dev Notes:

- Build as a new Preact component (e.g. `src/components/FramedGalleryViewer.tsx`), registered as a custom element in `src/entrypoints/main.tsx` following the existing pattern:
  ```tsx
  register(FramedGalleryViewer, "framed-gallery-viewer", ["product-image", "aspect-ratio"], { shadow: true });
  ```
- Mount point: inside or replacing the relevant portion of `Shopify/snippets/product.liquid:155-328` (`<product-images>` block), gated by a section setting or metafield check (e.g. only render the framing viewer when the product has frame/mat metaobject data attached, else fall back to the existing gallery unchanged).
- Listen for frame/mat selection via a custom window event (e.g. `framing:selection-changed`) dispatched by the PRD-3 picker component — do not couple directly to `theme.PUB_SUB_EVENTS.optionValueSelectionChange`, since that pub/sub is for Shopify variant options, not this custom framing state, but keep the event-driven shape consistent with how `product-info.js` already reacts to selection changes.
- Room scene photos: static assets, likely `Shopify/assets/room-{name}.jpg`, referenced by the PRD-1 room-scene list (confirm PRD-1 includes a room-scene entity, or add here if not).

## Implementation Notes:



## Bugs from QA:

- TBD

## Clarifying Questions:

- How many room scenes ship at launch (mockup shows 4 — Living room, Bedroom, Home office, Hallway)? Are these one global set for all products, or merchant/collection-specific?
- Are room scene photos existing brand assets, stock photography to be licensed, or new photography? Who's sourcing them?
- Should this component fully replace `<product-images>` for all products, or only activate on products that have frame/mat data configured (leaving unframed products on the current gallery)?

---

# PRD-3: Frame Style & Mat Colour Picker

## Background:

- The mockup's control panel includes a frame-style grid (swatches, tier-locked with an upgrade badge on unavailable options) and a row of mat-colour swatches. Today the only framing-adjacent control on the PDP is a plain "I'm interested in Framing" checkbox (`line_item_c9CJhy`) — no real options exist to pick from.
- Depends on PRD-1 (frame/mat catalog + tier data) and drives PRD-2 (live preview) and PRD-4 (price breakdown).

## Necessary Info (Design/Documentation):

- Variant picker precedent to match visually/interactively: `Shopify/snippets/product-variant-picker.liquid` (option orchestration) + `Shopify/snippets/product-variant-options.liquid` (per-value rendering) + `Shopify/snippets/swatch-input.liquid` (swatch input + tooltip). New frame/mat pickers should feel consistent with this existing swatch pattern rather than introducing a visually different control.
- Mockup lock behaviour: an unavailable frame (wrong tier) is shown at reduced opacity with a small badge ("SIG+" / "MUS") instead of being hidden — this preserves upsell visibility. Confirm this is the desired UX (vs. simply hiding unavailable options) — it's a deliberate merchandising choice worth flagging to the client, not just an implementation detail.
- No design file/Figma exists for this control — mockup CSS is the only spec (`.frame-grid`, `.frame-opt`, `.mat-row`, `.mat-opt` styles in the HTML `<style>` block); a designer pass may be needed to match brand type/spacing before this ships pixel-accurate.

## Constraints / Scope:

- **In scope:** frame style selection grid (with tier-lock visual state) and mat colour swatch row, both reading from the PRD-1 data model, filtered to the current product's computed tier.
- **Out of scope:** custom/bespoke framing quote flow (mockup includes a "Custom" frame option tagged "Quote" — this PRD renders it as a selectable option that triggers a contact/quote path, not a full custom-order system; the quote mechanism itself is future work unless already covered by an existing contact form).

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
| --- | --- | --- | --- | --- |
| 1 | Frame style options render as a grid of swatches with name and price, matching the product's available tier from PRD-1. |  |  |  |
| 2 | Frame options not available at the product's tier are visibly locked (reduced opacity + badge) and are not selectable. |  |  |  |
| 3 | Mat colour options render as a swatch row, including a "no mat" option. |  |  |  |
| 4 | Selecting a frame or mat updates component state and dispatches the event PRD-2 listens for. |  |  |  |
| 5 | A default frame/mat is pre-selected on page load (first available option for the product's tier). |  |  |  |
| 6 | Keyboard and screen-reader accessible: swatches are focusable, selectable via keyboard, and announce name/price/lock state. |  |  |  |
| 7 | Component renders correctly on mobile widths without overflow or unusable tap targets. |  |  |  |

## Dev Notes:

- New Preact component, e.g. `src/components/FramePicker.tsx` and `src/components/MatPicker.tsx` (or one combined `FramingControls.tsx`), registered in `src/entrypoints/main.tsx` as custom elements, e.g.:
  ```tsx
  register(FramingControls, "framing-controls", ["product-id", "product-tier"], { shadow: true });
  ```
- Mount point: `Shopify/snippets/product.liquid` block loop (~line 357-881), positioned where `picture_it_live_preview_block_ERpRyr` / `line_item_c9CJhy` currently sit in `block_order` — replacing them if PRD-1's "replace vs coexist" question resolves to replace.
- Reuse the swatch visual language from `Shopify/snippets/swatch-input.liquid` for tooltip/hover behaviour where practical, even though this is a new component rather than a native variant option.

## Implementation Notes:



## Bugs from QA:

- TBD

## Clarifying Questions:

- Confirm the "locked with badge" upsell pattern is desired (vs. hiding unavailable frames entirely) — this is a merchandising decision, not just a UI detail.
- What happens when a "Custom" frame option (tagged "Quote" in the mockup) is selected — does it open a contact form, disable ATC, or something else? No such flow currently exists in the theme.

---

# PRD-4: Tier Badge, Price Breakdown & Framed Add-to-Cart

## Background:

- The mockup shows a tier badge (e.g. "Essential framing") with explanatory copy, a live price breakdown (art price + framing price = total), and a primary "Add to cart — framed" button showing the live total, plus a secondary "add artwork only" link. None of this pricing/ATC logic exists today — the current ATC is a flat single-price button.
- Depends on PRD-1 (tier thresholds, frame/mat pricing) and PRD-3 (current picker selection).

## Necessary Info (Design/Documentation):

- Current ATC markup: `Shopify/snippets/product-buttons.liquid` (512 lines) — quantity stepper, `<product-form>` submit, dynamic checkout button, gift-card recipient hook, and the commented-out Artplacer widget (lines 472-475).
- Current price display: `Shopify/snippets/product-price.liquid`.
- **Critical open question:** how does the framing price actually get charged? Two viable approaches:
  1. **Cart line item properties** (`properties[Frame]`, `properties[Mat]`, `properties[Room]`) attached to the art product's line item — framing price is *cosmetic only* unless a Shopify Function / cart transform adds the price server-side.
  2. **Bundled second line item** — add a companion "framing" product/variant to the cart alongside the art product, priced per the PRD-1 catalog, so the price total is real and reflected in Shopify's own cart totals without custom pricing logic.
  Approach 2 is more correct for real checkout totals but requires real framing products/variants to exist in the catalog. Approach 1 is cheaper to build but requires either accepting an "informational only" price display or building a Shopify Function to adjust cart pricing — a materially bigger scope addition. **This must be decided before implementation** (see Clarifying Questions).

## Constraints / Scope:

- **In scope:** tier badge + info copy display, live price math client-side, framed vs. artwork-only ATC actions.
- **Out of scope:** building a Shopify Function/cart transform for price adjustment unless the client confirms Approach 1 above and accepts that scope increase — default assumption for estimate purposes is **Approach 2 (bundled line item)**, the lower-risk path, pending confirmation.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
| --- | --- | --- | --- | --- |
| 1 | A tier badge displays the product's computed tier (Essential/Signature/Museum) with the correct label and colour treatment. |  |  |  |
| 2 | An info box shows tier-appropriate explanatory copy (content sourced from PRD-1's tier data or a CMS field — confirm source). |  |  |  |
| 3 | Price breakdown shows art price, framing price (from the currently selected frame), and a computed total, updating live as frame selection changes. |  |  |  |
| 4 | "Add to cart — framed" adds the art product plus the selected framing (per whichever cart approach is confirmed) and shows the live total on the button. |  |  |  |
| 5 | "Add artwork only" adds just the base art product at its own price, with no framing line item/properties attached. |  |  |  |
| 6 | Cart correctly reflects the framed total (not just the art price) after adding a framed item, verified in both cart drawer and cart page. |  |  |  |
| 7 | No regression to the existing dynamic checkout button or gift-card recipient flow in `product-buttons.liquid`. |  |  |  |

## Dev Notes:

- Price math and ATC dispatch should live alongside the PRD-3 picker component's state (single source of truth for selected frame/mat), exposed to a new or modified ATC block in `product-buttons.liquid`.
- Cart integration: use `window.Shopify.cart.add` (`src/lib/cart.ts`) rather than calling `/cart/add.js` directly, per existing theme convention — if bundling a second line item (Approach 2), this likely needs a multi-item add call or two sequential `add` calls with a shared cart line property (e.g. a shared UUID) to associate them for later cart display/removal-in-tandem.
- Tier copy: reuse the tier-threshold snippet proposed in PRD-1 Dev Notes so this doesn't re-derive tier logic independently.

## Implementation Notes:



## Bugs from QA:

- TBD

## Clarifying Questions:

- **Bundled line item vs. line-item-properties-only pricing (see Necessary Info) — which approach does the client want?** This materially changes both scope and whether real framing products/variants need to be created in the catalog first.
- If framing is removed from the cart, does the art product need to be removed too (and vice versa), or can they be independent line items?
- Where does the tier explanatory copy (e.g. "A matte black aluminium frame keeps the focus...") come from — a CMS field, hardcoded per tier, or client-provided copy deck?

---

# PRD-5: Provenance Strip

## Background:

- The mockup displays a compact strip of key facts (edition size, signature status, condition, paper size) below the ATC button. The current PDP has this data partially available (via metafields feeding the `VisualArtwork` JSON-LD block) but nothing renders it as a customer-facing visual strip — it's currently either invisible (SEO-only) or buried in the "Details"/"Dimensions" accordions.
- Lowest-complexity PRD of the five — primarily presentational, contingent on confirming metafield coverage.

## Necessary Info (Design/Documentation):

- Existing metafields confirmed in use for structured data (`Shopify/snippets/product.liquid:914-982`): `ArtistFancy`, `Type`, `Style`, `Year`, `Subject`, `Color`, `Image_Size`, `Condition`.
- Mapping mockup fields → existing data:
  - **Paper size** → likely `Image_Size` or `dimensionsapi` metafield (both exist; confirm which is authoritative and in the right format, e.g. `"27 × 39 in"`).
  - **Condition** → `Condition` metafield (confirmed exists).
  - **Edition size** (e.g. "Edition of 2,000") → **not confirmed to exist** as a metafield; needs verification in Shopify Admin → Settings → Custom data → Products.
  - **Signature status** (e.g. "Unsigned" / "Signed in pencil") → **not confirmed to exist**; needs verification.
- Existing accordion blocks (`accordion-0` "Details", `accordion` "Dimensions" in `product.json` block order) already surface some of this data in prose form — the new strip should pull from the same source metafields to avoid duplicate/conflicting content, not introduce a second copy of the same facts.

## Constraints / Scope:

- **In scope:** a new visual strip snippet rendering 4 facts (or however many are confirmed to have real data) as compact label/value pairs, matching mockup's `.prov-strip` styling intent.
- **Out of scope:** adding brand-new metafields to every product in the catalog if edition/signature data doesn't exist — that's a content/merchandising backfill task, not a theme-dev task; if the fields don't exist, this PRD ships with whichever facts are confirmed available and flags the gap.

## Objective/Acceptance Criteria:

| **#** | **Item** | **Notes** | **Dev** | **QA** |
| --- | --- | --- | --- | --- |
| 1 | A provenance strip renders below the ATC button showing paper size and condition, sourced from existing metafields. |  |  |  |
| 2 | If edition size and/or signature metafields are confirmed to exist, they render in the same strip; if not, those slots are omitted gracefully (no empty/broken labels). |  |  |  |
| 3 | Strip content matches the existing "Details"/"Dimensions" accordion data (no conflicting values shown in two places). |  |  |  |
| 4 | Strip is responsive and wraps sensibly on mobile widths, matching the site's existing typographic scale. |  |  |  |
| 5 | No regression to the existing `VisualArtwork` JSON-LD block or the Details/Dimensions accordions. |  |  |  |

## Dev Notes:

- New snippet, e.g. `Shopify/snippets/product-provenance-strip.liquid`, rendered near the accordion blocks or ATC in `Shopify/snippets/product.liquid`'s block loop (~line 357-881), reusing the metafield-access pattern already established at line ~914:
  ```liquid
  {%- assign condition = product.metafields.custom.condition -%}
  ```
- Confirm exact metafield namespace/key casing for `Image_Size`/`dimensionsapi` and `Condition` by inspecting Shopify Admin → Settings → Custom data → Products before writing the snippet — the JSON-LD block's variable names may not exactly match the underlying metafield keys.

## Implementation Notes:



## Bugs from QA:

- TBD

## Clarifying Questions:

- Do "edition size" and "signature status" metafields already exist under different names, or do they need to be added? If added, is populating them across the existing catalog in scope for this ticket or a separate content ticket?

---

# Estimate Summary

Estimates are for a single Shopify Liquid theme + Preact codebase, assume a developer already ramped on this repo's conventions, and exclude QA/design-asset sourcing time called out in each PRD's Clarifying Questions. "AI-assisted" assumes an agentic coding tool (e.g. Claude Code) driving implementation with developer review/steering, not unsupervised autopilot.

| PRD | Non-AI-assisted | AI-assisted | Balanced (blended) |
| --- | --- | --- | --- |
| PRD-1: Framing & Mat Data Model | 8–14 hrs | 3–5 hrs | 5–8 hrs |
| PRD-2: Framed Gallery Viewer (Artwork/Room Toggle) | 40–60 hrs | 16–24 hrs | 24–34 hrs |
| PRD-3: Frame Style & Mat Colour Picker | 20–28 hrs | 8–12 hrs | 12–18 hrs |
| PRD-4: Tier Badge, Price Breakdown & Framed ATC | 16–24 hrs | 6–10 hrs | 10–16 hrs |
| PRD-5: Provenance Strip | 4–6 hrs | 1.5–3 hrs | 2.5–4 hrs |
| **Total** | **88–132 hrs** | **34.5–54 hrs** | **53.5–80 hrs** |

Notes on the estimate:
- PRD-2 is the long pole — it's genuinely new compositing/viewer engineering with no existing pattern in this theme to build from, and its estimate would grow further if the client wants canvas-accurate shadow/glare rendering rather than the recommended CSS-layered approach.
- PRD-4's estimate assumes the lower-risk "bundled line item" cart approach; if the client requires real-time server-side price adjustment via a Shopify Function (Approach 1 in PRD-4's Necessary Info), add roughly 12–20 hrs (non-AI) / 5–8 hrs (AI-assisted) on top.
- None of these include the Clarifying-Questions decisions (Picture It/Artplacer replace-vs-coexist, room photo sourcing, metafield backfill) — those are prerequisites that should be resolved before PRD-1 kicks off, not absorbed into these hour ranges.
