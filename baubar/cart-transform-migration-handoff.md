# Cart Transform Migration Handoff — BAUBAR-11559831589

**Project:** `~/Documents/roswell-studios/bauble-bar-cart-transform (the current active app). The legacy app lives at `~/Documents/roswell-studios/baublebar-checkout-extensibility` — do not modify it, read-only source only.

**Branch:** `feature/BAUBAR-11559831589-cart-transform-migration` off `release/_candidate`.

**What you're doing:** Migrating the `custom-product-transformer` cart transform Shopify Function from API version `2025-04` (in the legacy app) to `2026-04` (in BAUBLEBAR_CE_EXT), with a `jsonValue` instruction-reduction optimization.

---

## Research Context (already done, do not re-research)

- `2025-04` is deprecated as of April 2026. Shopify falls forward to the oldest supported stable version (`2025-07`) for apps still pinned to it.
- **Breaking changes from 2025-04 → 2026-04:**
  - Target renamed: `purchase.cart-transform.run` → `cart.transform.run`
  - Export renamed: `run` → `cart-transform-run`
  - File naming convention changed: `run.js` / `run.graphql` → `cart_transform_run.js` / `cart_transform_run.graphql`
  - Type names changed: `RunInput` → `CartTransformRunInput`, `FunctionRunResult` → `CartTransformRunResult`
  - `@shopify/shopify_function` upgraded: `1.0.0` → `^2.0.1`
  - **Operation keys (`merge`, `update`, `expand`) are unchanged** — the earlier assumption they were renamed was wrong; confirmed from the 2026-04 schema.
  - `jsonValue` is now available on metafields — returns a pre-parsed object, skipping `JSON.parse()`.

---

## What Has Already Been Completed

1. **Legacy snapshot** copied from `baublebar-checkout-extensibility/extensions/custom-product-transformer/` into `BAUBLEBAR_CE_EXT/.legacy/extensions/custom-product-transformer/` — all files (toml, src, generated, locales, package.json, schema.graphql, vite.config.js).

2. **Fresh scaffold** generated via `shopify app generate extension --template=cart_transform --name="custom-product-transformer" --flavor=vanilla-js` in BAUBLEBAR_CE_EXT. The CLI automatically matched the original extension uid (`b105e92f-e80e-b11b-4be2-1d78b5400b4aedc45253`) and handle. This is committed as the first commit on the feature branch.

---

## What Still Needs to Be Done

You are starting at the point after the scaffold commit. The scaffold gives you a clean boilerplate `cart_transform_run.js` and `cart_transform_run.graphql` with no business logic. You need to port the full logic from the legacy extension.

### Step 1 — Update `src/cart_transform_run.graphql`

Replace the scaffold's minimal query with the full input query from the legacy extension (`src/run.graphql`), but use `jsonValue` instead of `value` on all JSON metafields. Plain-string metafields keep `value`.

```graphql
query CartTransformRunInput {
  cart {
    lines {
      id
      quantity
      cost { amountPerQuantity { amount } }
      ref: attribute(key: "_ref") { value }
      isParentProduct: attribute(key: "_isParentProduct") { value }
      customization: attribute(key: "_Customization") { value }
      calendarVariants: attribute(key: "_calendarVariants") { value }
      madeToOrderText: attribute(key: "Made to Order") { value }
      merchandise {
        __typename
        ... on ProductVariant {
          id
          title
          product {
            title
            customEmojisTransformSettings: metafield(namespace: "product", key: "custom_emojis_transform_settings") {
              jsonValue   # was: value
            }
            calendarTransformSettings: metafield(namespace: "product", key: "calendar_transform_settings") {
              jsonValue   # was: value
            }
            quantityTiers: metafield(namespace: "product", key: "charms_quantity_tiers") {
              jsonValue   # was: value
            }
            serviceCharge: metafield(namespace: "product", key: "service_charge") {
              value       # keep as value — plain string "true"/"false", not JSON
            }
          }
        }
      }
    }
  }
}
```

### Step 2 — Update `src/cart_transform_run.js`

Port the full business logic from `.legacy/extensions/custom-product-transformer/src/run.js`. Key changes:

- Typedefs: `RunInput` → `CartTransformRunInput`, `FunctionRunResult` → `CartTransformRunResult`
- Function export: `run(input)` → `cartTransformRun(input)`
- Replace all `JSON.parse(metafield?.value || '[]')` with `metafield?.jsonValue ?? []` (the platform already parsed it)
- Replace `if (metafield?.value) { quantityTiers = JSON.parse(metafield.value) }` with `quantityTiers = metafield?.jsonValue ?? []`
- All `.value` checks/reads on cart line **attributes** (ref, isParentProduct, customization, calendarVariants, madeToOrderText, serviceCharge) remain unchanged — `jsonValue` only applies to metafields
- Logic itself (merge/update/expand operations, emoji pricing, calendar pricing, charms quantity tiers) is unchanged

See `docs/shopify-functions-js-optimization.md` in BAUBLEBAR_CE_EXT for the rationale on `jsonValue` over manual parsing.

### Step 3 — Bump `@shopify/cli` in root `package.json`

`3.93.1` → `3.93.2` (global CLI is already `3.93.2`). Run `npm install --package-lock-only` to update the lock file.

### Step 4 — Commit

Commit all changes (graphql, js, package.json, package-lock.json) to `feature/BAUBAR-11559831589-cart-transform-migration` with a message like:

```
feat: port cart transform business logic to 2026-04 with jsonValue optimization
```

---

## Files for Reference

| File | Purpose |
|---|---|
| `.legacy/extensions/custom-product-transformer/src/run.js` | Legacy business logic to port |
| `.legacy/extensions/custom-product-transformer/src/run.graphql` | Legacy input query |
| `docs/shopify-functions-js-optimization.md` | jsonValue / instruction optimization rationale |
| `extensions/custom-product-transformer/src/cart_transform_run.js` | Target file to edit |
| `extensions/custom-product-transformer/src/cart_transform_run.graphql` | Target file to edit |

---

## Known Pre-existing Issue (out of scope for this task)

The legacy `run.test.js` tests against an older metafield schema (`transformSettings` as a single combined field) that no longer matches the actual function code. Those tests are preserved in `.legacy/` as-is. The new scaffold uses `@shopify/shopify-function-test-helpers` with JSON fixture files — new fixtures for emoji/calendar/charms scenarios should be added in a future pass.
