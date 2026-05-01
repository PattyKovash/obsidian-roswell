# `cv-limit-free-gift` — Configuration Guide

How to configure the Free Gift Quantity Limit validation function via GraphiQL.

---

## How to Open GraphiQL

From the Shopify admin, navigate to **Apps > GraphiQL**.

---

## Step 1 — Add the Checkout Rule

1. Go to **Admin > Settings > Checkout**
2. Scroll down to **Checkout rules** and click **Add rule**
3. Select **Tag-Based Quantity Limit** under the app name
4. Add a title, check **Block checkout if app experiences a problem** if that is the desired behavior
5. Leave status as **Inactive** and click **Save**

Copy the validation ID from the URL or proceed to Step 2 to look it up via GraphiQL.

---

## Step 2 — Find the Validation ID

Open GraphiQL, paste this query, and click **Run**. Look for the node where `handle` is `"cv-limit-free-gift"` and copy its `id`.

```graphql
query {
  validations(first: 10) {
    edges {
      node {
        id
        title
        enabled
        shopifyFunction {
          handle
        }
      }
    }
  }
}
```

**Example result:**
```json
{
  "id": "gid://shopify/Validation/123456789",
  "shopifyFunction": { "handle": "cv-limit-free-gift" }
}
```

Copy the full `id` value — you'll need it in Steps 3 and 4.

---

## Step 3 — Create the Metafield Definition

This only needs to be done **once**. It registers the config field so Shopify knows how to store it. Skip this step if the definition already exists.

### Check if it already exists

```graphql
query {
  metafieldDefinitions(first: 5, ownerType: VALIDATION, namespace: "roswell", key: "config") {
    nodes {
      id
      name
    }
  }
}
```

If `nodes` returns an entry, skip to Step 4. If it's empty, run the mutation below.

### Create the definition

```graphql
mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**

```json
{
  "definition": {
    "name": "cv-limit-free-gift Config",
    "namespace": "roswell",
    "key": "config",
    "type": "json",
    "ownerType": "VALIDATION"
  }
}
```

Click **Run**. If `userErrors` is empty, the definition was created.

---

## Step 4 — Set the Configuration

Paste the mutation below into GraphiQL, then paste the variables into the **Variables** panel at the bottom. Replace `YOUR_VALIDATION_ID` with the `id` from Step 2.

### Mutation

```graphql
mutation SetValidationConfig($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

### Variables

```json
{
  "metafields": [
    {
      "ownerId": "YOUR_VALIDATION_ID",
      "namespace": "roswell",
      "key": "config",
      "type": "json",
      "value": "{\"matchTags\":[\"Free Gift\"],\"maxQuantity\":1,\"errorMessage\":\"Free gift items are limited to 1 per order.\",\"enforceAt\":[\"CART_INTERACTION\",\"CHECKOUT_INTERACTION\",\"CHECKOUT_COMPLETION\"],\"enableDevTest\":false,\"devEmails\":[]}"
    }
  ]
}
```

Click **Run**. If `userErrors` is empty, the config was saved.

---

## Step 5 — Update the Configuration (ongoing)

To change any config value after initial setup, run the same `metafieldsSet` mutation with the full updated config. You do **not** need to deactivate the rule first — changes take effect immediately.

### Mutation

```graphql
mutation SetValidationConfig($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

### Variables

Replace `YOUR_VALIDATION_ID` with the `id` from Step 2. Set every field even if only one value changed — the entire config is overwritten on each save.

```json
{
  "metafields": [
    {
      "ownerId": "YOUR_VALIDATION_ID",
      "namespace": "roswell",
      "key": "config",
      "type": "json",
      "value": "{\"matchTags\":[\"Free Gift\"],\"maxQuantity\":1,\"errorMessage\":\"Free gift items are limited to 1 per order.\",\"enforceAt\":[\"CART_INTERACTION\",\"CHECKOUT_INTERACTION\",\"CHECKOUT_COMPLETION\"],\"enableDevTest\":false,\"devEmails\":[]}"
    }
  ]
}
```

Click **Run**. If `userErrors` is empty, the config was updated.

---

## Step 6 — Configure the Checkout UI Extension

The UI extension (`ceui-limit-free-gift`) runs alongside the validation function and auto-corrects the cart before the customer reaches checkout. **Its settings must match the values set in Step 4** — if they differ, the UI extension may allow quantities the function will block, or vice versa.

1. Go to **Admin > Settings > Checkout** and click **Customize**
2. In the checkout editor, add a block under **Order summary** and select **Tag Based Product Quantity Limit**
3. Set the following fields to match your validation function config:

| UI Extension Field | Must match |
|---|---|
| **Free Gift Product Tag** | The tags in `matchTags`, comma-separated (e.g. `Free Gift`) |
| **Max Quantity** | The value of `maxQuantity` (e.g. `1`) |

4. If the extension should also run in Shop Pay, enable **Include block in Shop Pay** under **Checkout behavior**
5. Click **Save**

---

## Step 7 — Activate the Rule

Once the config is set and tested, go back to **Admin > Settings > Checkout > Checkout rules**, open the rule, and set the status to **Active**. Click **Save**.

---

## Configuration Options

| Field | Type | Default | Description |
|---|---|---|---|
| `matchTags` | array | — | **Required.** Product tags that identify qualifying items. Case-insensitive. Must match the tags configured in the UI extension. If omitted or empty, the function does not run. |
| `maxQuantity` | number | `1` | Maximum allowed quantity per matching product per order |
| `errorMessage` | string | `"Quantity limit exceeded for one or more items in your cart."` | The message shown to the customer when blocked |
| `enforceAt` | array | `["CHECKOUT_INTERACTION", "CHECKOUT_COMPLETION"]` | Which stage(s) of checkout trigger the block (see below) |
| `enableDevTest` | boolean | `false` | When `true`, blocks checkout for specific test accounts regardless of cart contents |
| `devEmails` | array | `[]` | Email addresses that are blocked when `enableDevTest` is on |

### `enforceAt` values

| Value | When it runs |
|---|---|
| `"CART_INTERACTION"` | When items are added/removed from the cart. The cart returns an error and the quantity is not applied. |
| `"CHECKOUT_INTERACTION"` | During checkout as the customer fills in address and payment fields. Surfaces the error early but does **not** block order placement on its own. |
| `"CHECKOUT_COMPLETION"` | When the customer clicks "Pay Now" / "Place Order". **Required to actually block order placement.** |

Recommended — block at all stages:

```json
"enforceAt": ["CART_INTERACTION", "CHECKOUT_INTERACTION", "CHECKOUT_COMPLETION"]
```

---

## Testing with `enableDevTest`

Set `enableDevTest` to `true` and add your Shopify customer account email to `devEmails`. Your checkout will be blocked even with no qualifying products in the cart, so you can verify the error message and placement without needing real test products.

**Variables:**

```json
{
  "metafields": [
    {
      "ownerId": "YOUR_VALIDATION_ID",
      "namespace": "roswell",
      "key": "config",
      "type": "json",
      "value": "{\"matchTags\":[\"Free Gift\"],\"maxQuantity\":1,\"errorMessage\":\"Free gift items are limited to 1 per order.\",\"enforceAt\":[\"CART_INTERACTION\",\"CHECKOUT_INTERACTION\",\"CHECKOUT_COMPLETION\"],\"enableDevTest\":true,\"devEmails\":[\"you@example.com\"]}"
    }
  ]
}
```

Remember to set `enableDevTest` back to `false` before activating the rule in production.

