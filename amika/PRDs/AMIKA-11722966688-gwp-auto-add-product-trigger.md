# AMIKA - Free Sticker GWP: Buy X Get Y — Automatic Add to Cart w/ Specific Products

## Background:
Merchant has an upcoming promotion where when specific products are added to cart,
a GWP is auto added to the cart. Customer buys 1 or more of (n) number of products,
a pre-specified product is auto added to cart. Merchant is aware they will also need
to utilize a discount with this.

## Necessary Info (Design/Documentation):

## Objective/Acceptance Criteria:
- When a qualifying product is added to cart, the GWP is automatically added
  without any user action required
- When all qualifying products are removed from cart, the GWP is automatically
  removed
- If the GWP product is already in cart (added independently), no duplicate is added
- The GWP displays with the existing gift badge treatment in the cart
- The GWP is not manually quantity-editable by the customer
- Removing a qualifying product that would disqualify the GWP triggers the existing
  removal warning modal
- The GWP campaign is fully configurable in Sanity — qualifying products, GWP
  product, auto-add behavior, and active state require no code changes to update
- The merchant can toggle the campaign on/off via Sanity without a code deploy
- If the GWP variant is out of stock, the auto-add does not fire and no message
  is shown to the customer

### Out of Scope:
- Building a net-new custom Shopify discount function. Existing functions in the
  CE app should be evaluated first (see Dev Notes). If neither can be configured
  or minimally modified to cover this use case, that work should be scoped
  as a separate ticket.

## Dev Notes:

### Existing GWP System:
- GWP configuration lives in Sanity under `productGiftSelector` (global settings singleton)
- Each `productOption` has: `qualifier` (spend threshold), `max_quantity`, `authorized_tags`, `type`
- Qualification is spend-threshold based — checks cart subtotal against `qualifier` value
- Gifts are **user-selected**, not auto-added — customer clicks "Add" in the cart drawer selector (`ProductGiftsSelector.tsx`)
- Auto-remove exists: `MicroProductCard.tsx` fires a `cartLinesUpdate` (qty 0) via `useEffect` when cart drops below the qualifier
- Gift cart lines are tagged with `_GWP` or `_GWP-VIP` attributes and must cost `$0.00` to be recognized as gifts
- `isGiftProduct()` and `isAutoGift()` in `utils.ts` classify gift lines by those attributes + cost — `isAutoGift` is imported in `Cart.tsx` but unused (dead code)
- Cart mutations flow through `app/routes/($lang).cart.tsx` — `ADD_TO_CART`, `UPDATE_CART`, `REMOVE_FROM_CART`

### Existing Discount Functions (LoveAmika_CE_EXT):
_Note: Final discount function selection is dependent on trigger logic (see Q1).
The following is a preliminary assessment of available options._

Two existing Shopify Functions are candidates for zeroing out the GWP price —
a net-new function should not be needed:

**1. `discount-gwp` (Gift with Purchase)**
- Detects cart lines with `_GWP` or `_GWP-VIP` attributes and applies a hardcoded
  100% discount
- Currently qualifies based on spend threshold — would need modification or threshold
  set to `$0` to support product-triggered qualification
- Best alignment with existing Hydrogen attribute tagging pattern
- Risk: setting threshold to `$0` could conflict if the spend-based GWP campaign
  runs simultaneously

**2. `discount-buy-x-get-z`**
- Configurable percentage (set to 100 for free), supports specific product/variant
  targeting on both the qualifying (X) and discounted (Z) sides
- Has `xQuantity` field — natively supports minimum quantity threshold on qualifying products
- Currently skips lines tagged with `_GWP` attribute — conflicts with existing
  tagging pattern and would require adjustment
- More flexible for product-triggered logic but needs more modification than option 1

**3. Native Shopify Automatic Buy X Get Y — Viable for discount only**
- Auto-add is not native — but that's handled by Hydrogen, so this isn't a blocker
- Set to "Free" (100% off), targets specific qualifying products and the GWP variant
- Discount surfaces in Storefront API via `cart.lines.discountAllocations` —
  price is visible in the Hydrogen cart, not just at checkout
- No discount code required — runs as a fully automatic discount
- Risks: conflicts with other active product discounts (Shopify applies only the
  highest value); entering a discount code removes the automatic Buy X Get Y;
  store-wide cap of 25 active automatic discounts; 100-variant limit per discount

### Implementation Approach:
To be determined by dev. Key considerations:
- This feature requires product-in-cart detection as the qualifier (not spend threshold)
- Auto-add must be triggered without user interaction — no equivalent exists today
- A fetcher guard will be needed to prevent duplicate add submissions on rapid
  cart state changes
- Discount function choice will affect whether `_GWP` attribute tagging should
  be reused or a new attribute introduced for this campaign type

## Bugs from QA:


## Clarifying Questions:
1. **Trigger logic** — Is the rule "cart contains ANY ONE of the qualifying
   products" or "cart must contain ALL specified products"? Does the merchant
   also need to control a minimum quantity threshold for qualifying products
   (e.g., must have 2+ units of a qualifying product to trigger the GWP)?

2. **GWP product count** — Does the merchant need the ability to auto-add more than
   one GWP product when a qualifying product is in cart? (e.g., trigger adds both a
   sticker and a sample).

3. **GWP removal by customer** — Should customers be able to manually remove the
   GWP line item from their cart? If yes, should it re-add itself while the
   qualifying product is still in cart, or stay removed for the session?

4. **Discount setup** — Two existing Shopify Functions in the CE app can likely
   handle zeroing out the GWP price (`discount-gwp` or `discount-buy-x-get-z`).
   Dev will determine which requires less modification. Is the merchant expecting
   this to be handled as part of this ticket, or do they have an existing discount
   already set up?

6. **Simultaneous campaigns** — Is there a near-term need to run this product-
   triggered GWP alongside the existing spend-threshold GWP at the same time?
   (Affects whether we scope a single-campaign extension vs. a multi-campaign
   refactor.)

8. **Cart display treatment** — Should the auto-added GWP reuse the existing gift
   badge and display treatment in the cart, or does it require distinct UI? If
   distinct, design specs are needed before development can begin.
