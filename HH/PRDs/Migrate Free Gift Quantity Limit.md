# Migrate Free Gift Quantity Limit from Shopify Script to Checkout UI Extension + Validation

## Background:

The store currently uses a Shopify Script (Ruby) called **"Limit Free Gift"** to cap the quantity of any free gift product (tagged `'Free Gift'`) to a maximum of 1 per cart.

**Current Script Logic**

The existing Ruby script does the following:

1. Iterates over all line items in the cart.
2. Checks if a line item's product tags include the tag `'Free Gift'`.
3. If it does, it forces that line item's quantity to `1`, regardless of what the customer has in their cart.

**Why This Needs to Migrate**

Shopify Scripts are deprecated. There is no direct equivalent in Shopify Functions that replicates the script's ability to silently mutate line item quantities for free gift items. Cart Transform functions are scoped to merging/expanding bundles and cannot be used to cap quantities on tagged products. The replacement approach requires two complementary layers: a client-side Checkout UI Extension and a server-side Cart and Checkout Validation function.

## Necessary Info (Design/Documentation):

- [free gift limit to one over $60 — Script Editor](https://admin.shopify.com/store/shophatheaven/apps/script-editor/scripts/264077415)
- [Checkout UI Extensions — Shopify Docs](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Cart and Checkout Validation — Shopify Functions](https://shopify.dev/docs/apps/build/functions/input-output/cart-checkout-validation)
- [Dev mode reference implementation — `enableDevTest` logic](https://github.com/roswell-studios/BAUBLEBAR_CE_EXT/blob/release/_candidate/extensions/delivery-po-box-validation)

## Objective/Acceptance Criteria:

**Layer 1 — Checkout UI Extension (client-side enforcement)**

- [ ] A Checkout UI Extension is created that runs during the checkout flow.
- [ ] The extension reads all line items and identifies any whose product is tagged with the configured target tag.
- [ ] If a matching line item has a quantity greater than the configured max quantity, the extension surfaces UI feedback to the customer (e.g., a warning banner or inline message) and/or adjusts the quantity in the UI before the customer proceeds.
- [ ] The extension is **not** server-side — it runs in the browser as part of the checkout UI render.
- [ ] The extension exposes the following configurable extension settings:
  - **`productTag`** — the product tag used to identify free gift items (e.g., `'Free Gift'`). Must match the value configured in Layer 2.
  - **`maxQuantity`** — the maximum allowed quantity per free gift line item (e.g., `1`). Must match the value configured in Layer 2.
- [ ] The extension is deployed and active on the Hat Heaven store.

**Layer 2 — Cart and Checkout Validation Function (server-side gate)**

- [ ] A Shopify Function using the **Cart and Checkout Validation** API is created.
- [ ] The function identifies all line items whose product is tagged with the configured target tag.
- [ ] If any such line item has a quantity greater than the configured max quantity, the function blocks checkout completion and returns the configured error message.
	- The validation function cannot modify quantities — it validates and either passes or blocks.
- [ ] The function exposes the following configuration options (via metafield or function configuration):
  - **`productTag`** — the product tag used to identify free gift items. Must match the value configured in Layer 1.
  - **`maxQuantity`** — the maximum allowed quantity per free gift line item. Must match the value configured in Layer 1.
  - **`errorMessage`** — the error message displayed to the customer when checkout is blocked (e.g., `"Free gift items are limited to 1 per order."`).
  - **`enableDevTest`** — a dev mode flag. When enabled, the function triggers validation on a designated test product/condition without requiring actual free gift products in the cart. Reference implementation: [`enableDevTest` in delivery-po-box-validation](https://github.com/roswell-studios/BAUBLEBAR_CE_EXT/blob/release/_candidate/extensions/delivery-po-box-validation).
- [ ] The function is deployed and activated on the Hat Heaven store.

**Configuration Constraint**

Both layers must be configured with matching `productTag` and `maxQuantity` values. If these diverge, the UI extension and the validation function will behave inconsistently — the UI may allow a quantity that the server then blocks, or vice versa.

**General**

- [ ] The existing Shopify Script is unpublished/removed after both layers are confirmed working.
- [ ] Both layers are tested on a staging/dev environment before going live, using `enableDevTest` on the validation function to verify blocking behavior without needing real free gift products.
- [ ] Edge cases covered: quantity already at or below max (no action), multiple distinct free gift products (each evaluated independently), cart with no matching tagged products (no-op).

**Not in Scope**
- Function UIs. Functions will be configured with GraphiQL app

## Implementation Details:

**Extension handles**
- Layer 1 (Checkout UI Extension): `ceui-limit-free-gift` — scaffolded, source at `extensions/ceui-limit-free-gift/src/Checkout.jsx`
- Layer 2 (Validation Function): `cv-limit-free-gift` — branch `feature/HH-9008863623-cv-limit-free-gift` off `release/_candidate`

**Ruby script fidelity notes (from reading `Sitewide 25% Discount.md`)**
- The Ruby `QuantityLimit` campaign uses `limit_by: :product`, meaning quantity is tracked per **product ID** across all variants — not per line item. If a customer has two variants of the same tagged product totaling > 1, that is a violation. The validation function must aggregate quantities by `product.id` across all line items before comparing to `maxQuantity`.
- `ProductTagSelector` calls `tags.map(&:downcase)` — tag matching is **case-insensitive** in the Ruby script. The validation function should lower-case both the configured `productTag` and the product's tags before comparing.
- The tag used in the script is `"Free Gift"` (capital F and G). Confirm this is the active tag value before deploying.

**`enableDevTest` behavior**
- When `enableDevTest: true` and the buyer's email is in `devEmails`: always block checkout with `[DEV TEST]` prefix on the error message, regardless of cart contents. This lets you test the error surface on a live store without needing a real free gift product.
- When `enableDevTest: true` and buyer is a guest or email not in `devEmails`: normal validation logic applies — no effect on real shoppers.
- Configured via the function's metafield: namespace `$app:cv-limit-free-gift`, key `config`.

**Configuration metafield shape**
```json
{
  "productTag": "Free Gift",
  "maxQuantity": 1,
  "errorMessage": "Free gift items are limited to 1 per order.",
  "enableDevTest": false,
  "devEmails": []
}
```

## Dev Notes:

- UI Extensions are client-side (browser/React-based) — they cannot perform server-side writes or mutations directly. The validation function is the server-side safety net.
- The Checkout UI Extension and the Validation function should be built and deployed together to ensure consistent behavior across both layers.
- Tag check should match exact casing used by the merchandising team — confirm the exact tag string before deploying.
- `enableDevTest` pattern: see [delivery-po-box-validation](https://github.com/roswell-studios/BAUBLEBAR_CE_EXT/blob/release/_candidate/extensions/delivery-po-box-validation) for the reference implementation used on BAUBLEBAR.

## Bugs from QA:

- TBD

## Clarifying Questions:

- TBD
