# Implementation Plan: `cv-limit-free-gift` Cart & Checkout Validation Function

## What this is

A Shopify Function (Cart and Checkout Validation) that serves as the server-side enforcement layer for free gift quantity limits. It is Layer 2 of a two-layer replacement for a deprecated Shopify Script (Ruby). Layer 1 (the Checkout UI Extension `ceui-limit-free-gift`) is already scaffolded.

## Repo & Branch

- **Repo**: `/Users/pk/Documents/roswell-studios/HH_CE_EXT` (or its worktree sibling)
- **Branch**: `feature/HH-9008863623-cv-limit-free-gift` (branched from `release/_candidate`)
- **Worktree**: to be created at `/Users/pk/Documents/roswell-studios/HH_CE_EXT-cv-limit-free-gift`
  ```bash
  cd /Users/pk/Documents/roswell-studios/HH_CE_EXT
  git worktree add /Users/pk/Documents/roswell-studios/HH_CE_EXT-cv-limit-free-gift feature/HH-9008863623-cv-limit-free-gift
  ```

## Tooling & Documentation

- **Date**: April 2026. Before writing any code, verify you are using the latest Shopify CLI, API version, and Function SDK. Check the current latest versions:
  ```bash
  npm info @shopify/cli version
  npm info @shopify/shopify_function version
  ```
- **`@shopify/cli` latest is `3.94.2`** (confirmed April 2026). Pin this in root `package.json` devDependencies before scaffolding, then run `npm install`.
- **Consult the latest Shopify docs** before implementing — API shapes, GraphQL schema fields, and function targets can change between versions. Do not rely solely on this document for syntax:
  - [Cart and Checkout Validation — Shopify Functions](https://shopify.dev/docs/apps/build/functions/input-output/cart-checkout-validation)
  - [Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)

## Scaffold (run from worktree root, do this first)

```bash
shopify app generate extension --template=cart_checkout_validation --name="cv-limit-free-gift" --flavor=typescript
```

This creates `extensions/cv-limit-free-gift/` with stub files. After scaffolding, read `schema.graphql` to confirm the exact field names before writing `run.graphql`.

## Ruby Script Being Migrated

The relevant logic from `Sitewide 25% Discount.md` (the active Shopify Script):

```ruby
QuantityLimit.new(
  :all,
  nil,
  nil,
  ProductTagSelector.new(:does, :match, ["Free Gift"]),
  :product,
  1
)
```

Key behaviors to preserve:
- **Tag**: `"Free Gift"` — case-insensitive match (`tags.map(&:downcase)` in Ruby)
- **Limit by product** (`limit_by: :product`): aggregate quantity across all variants of the same product before comparing to the limit. If a customer has two variants of the same tagged product totaling > 1, that is a violation.
- **Limit**: `1` per product

## Files to Write

### `extensions/cv-limit-free-gift/src/run.graphql`

```graphql
query RunInput {
  cart {
    buyerIdentity {
      isAuthenticated
      customer {
        email
      }
    }
    lines {
      quantity
      merchandise {
        ... on ProductVariant {
          product {
            id
            tags
          }
        }
      }
    }
  }
  validation {
    config: metafield(namespace: "$app:cv-limit-free-gift", key: "config") {
      jsonValue
    }
  }
}
```

> After scaffolding, verify `validation { metafield(...) }` exists in the generated `schema.graphql`. Adjust field path if it differs.

### `extensions/cv-limit-free-gift/src/run.ts`

```typescript
import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_ERRORS: FunctionRunResult = { errors: [] };

type Configuration = {
  productTag?: string;
  maxQuantity?: number;
  errorMessage?: string;
  enableDevTest?: boolean;
  devEmails?: string[];
};

export function run(input: RunInput): FunctionRunResult {
  const config = input.validation?.config?.jsonValue as Configuration | null;

  const productTag   = (config?.productTag   ?? "Free Gift").toLowerCase();
  const maxQuantity  = config?.maxQuantity  ?? 1;
  const errorMessage = config?.errorMessage ?? "Free gift items are limited to 1 per order.";

  // enableDevTest: blocks checkout for authenticated buyers in devEmails,
  // regardless of cart contents — lets you test the error on a live store
  // without needing a real free gift product.
  if (config?.enableDevTest) {
    const buyer = input.cart.buyerIdentity;
    if (buyer?.isAuthenticated) {
      const devSet = new Set(config.devEmails ?? []);
      if (devSet.has(buyer.customer?.email ?? "")) {
        return {
          errors: [{
            localizedMessage: `[DEV TEST] ${errorMessage}`,
            target: "cart",
          }],
        };
      }
    }
  }

  // Aggregate quantity per product ID — mirrors limit_by: :product from the Ruby script.
  // Case-insensitive tag match mirrors tags.map(&:downcase) in the Ruby script.
  const productQtyMap = new Map<string, number>();
  for (const line of input.cart.lines) {
    if (line.merchandise?.__typename !== "ProductVariant") continue;
    const product = line.merchandise.product;
    if (!product) continue;
    const tags = product.tags.map((t) => t.toLowerCase());
    if (!tags.includes(productTag)) continue;
    productQtyMap.set(product.id, (productQtyMap.get(product.id) ?? 0) + line.quantity);
  }

  const hasViolation = [...productQtyMap.values()].some((qty) => qty > maxQuantity);
  if (!hasViolation) return NO_ERRORS;

  return {
    errors: [{
      localizedMessage: errorMessage,
      target: "cart",
    }],
  };
}
```

### `extensions/cv-limit-free-gift/shopify.extension.toml`

After scaffolding the CLI will generate this. Confirm/update:
- `api_version = "2026-04"`
- `type = "function"`
- `target = "purchase.validation.run"`
- `input_query = "src/run.graphql"`
- `export = "run"`
- No `[extensions.ui.paths]` block (configured via GraphiQL, not a UI)

## After Writing Files

```bash
cd extensions/cv-limit-free-gift
npm run typegen   # generates generated/api.ts — fix any type errors
npm run build     # compiles to WASM — must succeed before deploy
```

## Configuration (via GraphiQL — not in code scope)

Metafield: namespace `$app:cv-limit-free-gift`, key `config`

```json
{
  "productTag": "Free Gift",
  "maxQuantity": 1,
  "errorMessage": "Free gift items are limited to 1 per order.",
  "enableDevTest": false,
  "devEmails": []
}
```

## Verification Checklist

- [ ] `typegen` passes with no type errors
- [ ] `build` compiles to WASM successfully
- [ ] Dev test: set `enableDevTest: true`, add your email to `devEmails` — checkout should be blocked with `[DEV TEST]` prefix
- [ ] Live test: add a product tagged `"Free Gift"` with qty > 1 — checkout should be blocked
- [ ] No-op test: add a non-tagged product at any qty — checkout should proceed
- [ ] Multi-variant test: add two different variants of the same `"Free Gift"` product (each qty 1, total 2) — checkout should be blocked (per-product aggregation)

## Reference

- Layer 1 (already scaffolded): `extensions/ceui-limit-free-gift/src/Checkout.jsx`
- `enableDevTest` pattern reference: `BAUBLEBAR_CE_EXT/extensions/delivery-po-box-validation/src/cart_delivery_options_transform_run.ts`
- Ticket PRD: `/Users/pk/Documents/obs-roswell/HH/PRDs/Migrate Free Gift Quantity Limit.md`
