# Cart Transform GraphQL Operations

API Version: `2026-04`

## Required Access Scopes

Add to `shopify.app.toml`:
```
read_cart_transforms
write_cart_transforms
```

---

## Step 1 — Find your function handle

Lists all deployed cart transform functions owned by your app. Run this first to get the `handle` needed for the create mutation.

```graphql
query GetCartTransformFunctions {
  shopifyFunctions(first: 10, apiType: "cart_transform") {
    nodes {
      id
      handle
      title
      apiType
      apiVersion
    }
  }
}
```

The `handle` matches the `handle` field in your `shopify.extension.toml`.

---

## Step 2 — Create the cart transform

```graphql
mutation CreateCartTransform($functionHandle: String!, $blockOnFailure: Boolean) {
  cartTransformCreate(functionHandle: $functionHandle, blockOnFailure: $blockOnFailure) {
    cartTransform {
      id
      functionId
      blockOnFailure
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

**Variables:**
```json
{
  "functionHandle": "ct-custom-product-transformer",
  "blockOnFailure": false
}
```

- `functionHandle` — from Step 1, matches the extension's `handle` in `shopify.extension.toml`
- `blockOnFailure: false` — lets checkout proceed even if the function errors; `true` blocks it
- `functionId` is deprecated — use `functionHandle` only

The returned `cartTransform.id` is what you need for the delete mutation.

---

## Step 3 — Verify it's active

```graphql
query ListCartTransforms {
  cartTransforms(first: 10) {
    nodes {
      id
      functionId
      blockOnFailure
    }
  }
}
```

Returns only transforms owned by your app's API client.

---

## Step 4 — Delete (teardown / re-deploy)

```graphql
mutation DeleteCartTransform($id: ID!) {
  cartTransformDelete(id: $id) {
    deletedId
    userErrors {
      field
      message
      code
    }
  }
}
```

**Variables:**
```json
{
  "id": "gid://shopify/CartTransform/123456789"
}
```

Use the `id` from `ListCartTransforms` or from the `cartTransformCreate` response.

---

## Executing without GraphiQL

### Option A — Shopify CLI

```bash
shopify store execute graphql --body mutation.graphql --variables vars.json
```

### Option B — curl directly against the Admin API

```bash
curl -X POST \
  https://YOUR-SHOP.myshopify.com/admin/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: YOUR_ACCESS_TOKEN" \
  -d '{"query": "mutation { cartTransformCreate(functionHandle: \"ct-custom-product-transformer\", blockOnFailure: false) { cartTransform { id functionId } userErrors { message } } }"}'
```

Replace `YOUR_ACCESS_TOKEN` with an offline token that has `write_cart_transforms` scope (from your installed app session or via the Partner Dashboard token exchange).
