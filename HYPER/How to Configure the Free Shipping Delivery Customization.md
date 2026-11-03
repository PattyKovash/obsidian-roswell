# Hyperlite: How to Configure the Free Shipping Delivery Customization

## What This Does

Hyperlite's pro members receive a member discount on eligible items. During sitewide sales, those members may receive the sitewide rate instead of their pro discount depending on which is higher for a given item. Intuitive Shipping's free shipping exclusion is based on a static customer tag and cannot see which discount is actually active at checkout — it withholds free shipping from pro members regardless.

This function gives Shopify an alternative signal. The `percentThreshold` is set to match the current sitewide sale rate. Pro discounts are typically above that rate for qualifying items. The function checks the discount percentage on each line item:

- If any line item is discounted **above** the threshold → the pro discount is assumed to be active → free shipping is hidden
- If every line item is at or below the threshold → the customer is assumed to be at the sitewide rate → free shipping is available

**The Hyperlite use case:** the threshold is set to 15% (the sitewide sale rate). A tagged pro member with any item discounted above 15% is assumed to be receiving pro pricing and does not get free shipping. A tagged member whose items are all at or below 15% is assumed to be shopping at the sitewide rate and free shipping is allowed. This is the same as any other customer.

Note: only item-level (line-level) pro discounts count toward this check. Order-wide discount codes are the sitewide promotion itself and are excluded from the calculation.

Conditions that control when it runs:

- **Customer tags:** only applies to customers with a matching account tag (e.g. `outdoor-pro`, `pro-member`)
- **Cart total:** only applies when the cart meets a minimum subtotal. The cart total is calculated by summing all cart line subtotal amount (amount before discount). Shopify does not provide a cart subtotal with line-level discounts excluded.
- **Discount level:** only applies when at least one line item's discount strictly exceeds the configured percentage
- **Date window:** optional: restricts the function to a specific sale period

---

## Prerequisites

- The **Shopify GraphiQL app** is installed on the store
- The delivery customization function has been **deployed** via `shopify app deploy`

---

## Step 1: Open GraphiQL

1. Go to your Shopify admin
2. Click **Apps** in the left sidebar
3. Open the **Shopify GraphiQL App**

---

## Step 2: Find the Function ID

Before creating the delivery customization, you need the **Function ID** that identifies this specific function.

1. In the **left panel** of GraphiQL, paste the following:

```
query getShopifyFunctions {
  shopifyFunctions(first: 100) {
    nodes {
      id
      title
      app {
        handle
      }
      handle
    }
  }
}
```

2. Click the **Play** button
3. In the right panel, find the entry where `"handle"` is `"rs-dc-hide-by-tag-percent-threshold"`
4. Copy the `"id"` value for that entry. This is your **Function ID**.
5. You will paste this into the variables in the next step (replacing `YOUR_FUNCTION_ID`)

---

## Step 3: Paste the Mutation

Copy and paste the following into the **left panel** of GraphiQL (replacing the query from Step 2):

```
mutation CreateDeliveryCustomization($deliveryCustomization: DeliveryCustomizationInput!) {
  deliveryCustomizationCreate(deliveryCustomization: $deliveryCustomization) {
    deliveryCustomization {
      id
      title
      enabled
      functionId
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## Step 4: Paste the Variables

At the bottom of GraphiQL, click **"Query Variables"** to expand it. Paste **one** of the following depending on where you are in the process.

**Important:** Replace `YOUR_FUNCTION_ID` with the Function ID copied in Step 2.

---

### Dev mode (for testing, restricts to the `rs-dev` tag)

Use this when testing on a live store so real customers are not affected. Update target string and thresholds as needed.

Before testing, add the `rs-dev` tag to your test customer account in Shopify admin:
**Customers → find the account → Tags → add `rs-dev`**

```json
{
  "deliveryCustomization": {
    "title": "Hide Free Shipping During Sitewide Sale",
    "functionId": "YOUR_FUNCTION_ID",
    "enabled": true,
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"percentThreshold\":15,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"],\"devMode\":true}"
      }
    ]
  }
}
```

**Testing on hyperlite-staging.myshopify.com:**

- **Intuitive Shipping rates:** Delivery options created by Intuitive Shipping only appear at checkout if the word "Intuitive" (case insensitive) is present in either the first or last name field of the shipping address. If you don't see any Intuitive Shipping options, check that name field first.

- **Cart total behavior:** Intuitive Shipping defines Cart Total as the combined subtotal of products in the cart. Based on observed behavior, this is the cart total **before** discounts are applied, not after. Our function uses the same logic — `cartThreshold` is compared against the pre-discount cart subtotal. Keep this in mind when setting up test carts: a cart with $300 in products but discounted down to $250 will still meet a $300 threshold.

---

### Production mode

Use this when you are ready to go live. This config has no date restrictions and will run continuously. To schedule it for a specific sale window, update `startDateTime` and `endDateTime` before enabling (see Configuration Reference for sentinel values). Update target string and thresholds as needed.

Replace `YOUR_FUNCTION_ID` with the Function ID from Step 2.

```json
{
  "deliveryCustomization": {
    "functionId": "YOUR_FUNCTION_ID",
    "title": "Hide Free Shipping Over $300 for pros with 15% discount threshold",
    "enabled": false,
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"percentThreshold\":15,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"]}"
      }
    ]
  }
}
```

Note: `"enabled": false` keeps the customization inactive until you are ready to turn it on. Enable it from **Settings → Checkout → Delivery customizations** in Shopify admin, or change it to `true` before running the mutation.

---

**Note on dates:** enter times in the shop's local time zone exactly as they should appear on a clock in the store's location. No UTC conversion is needed — the values are stored as-is and Shopify compares them against the shop's local time when the function runs at checkout. The server location does not affect this. Hyperlite's time zone is configured in Shopify admin under **Settings → Store details**.

---

### With a start date only

Active from the start date onwards with no end. Useful when a sale begins on a known date and you will disable it manually when the sale ends. Update target string and thresholds as needed.

```json
{
  "deliveryCustomization": {
    "functionId": "YOUR_FUNCTION_ID",
    "title": "Hide Free Shipping Over $300 for pros with 15% discount threshold",
    "enabled": false,
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"percentThreshold\":15,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"],\"startDateTime\":\"2026-07-04T00:00:00\"}"
      }
    ]
  }
}
```

---

### With an end date only

Active immediately and turns off automatically at the end date. Useful when you want the function live now but have a firm cutoff. Update target string and thresholds as needed.

```json
{
  "deliveryCustomization": {
    "functionId": "YOUR_FUNCTION_ID",
    "title": "Hide Free Shipping Over $300 for pros with 15% discount threshold",
    "enabled": false,
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"percentThreshold\":15,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"],\"endDateTime\":\"2026-07-07T23:59:59\"}"
      }
    ]
  }
}
```

---

### With a start and end date (sale window)

Active only within a specific window. The function does nothing before the start and after the end. No manual disabling required. Update target string and thresholds as needed.

```json
{
  "deliveryCustomization": {
    "functionId": "YOUR_FUNCTION_ID",
    "title": "Hide Free Shipping Over $300 for pros with 15% discount threshold",
    "enabled": false,
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"percentThreshold\":15,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"],\"startDateTime\":\"2026-07-04T00:00:00\",\"endDateTime\":\"2026-07-07T23:59:59\"}"
      }
    ]
  }
}
```

---

### Without a percent threshold

Hides free shipping for any tagged customer whose cart meets the `$300` minimum — regardless of what discount they are receiving. Use this if you want to block free shipping for all pro members during a sale, not just those with a qualifying discount level.

```json
{
  "deliveryCustomization": {
    "functionId": "YOUR_FUNCTION_ID",
    "title": "Hide Free Shipping Over $300 for all pro members",
    "enabled": false,
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"]}"
      }
    ]
  }
}
```

---

## Configuration Reference

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| `targetStrings` | array of strings | **Yes** | Shipping option name(s) to hide. Case-sensitive, substring match. Example: `["Free Shipping Over $300"]` |
| `cartThreshold` | number | No | Minimum cart subtotal for the function to activate. Example: `300.0`. Omit to apply regardless of cart size. |
| `percentThreshold` | number | No | Set this to match the sitewide sale percentage. Any line item with a pro discount **strictly above** this rate triggers hiding (assumed to be receiving pro pricing). At or below this rate is assumed to be the sitewide rate — free shipping is not hidden. Only item-level pro discounts count; order-wide discount codes are excluded. Omit to hide whenever all other conditions are met regardless of discount level. |
| `customerTags` | array of strings | No | Customer account tags to target. Example: `["outdoor-pro", "pro-member"]`. Omit to apply to all customers including guests. |
| `startDateTime` | string | No | Window start (shop local time). Omit for no start restriction. |
| `endDateTime` | string | No | Window end (shop local time). Omit for no end restriction. |
| `devMode` | boolean | No | When `true`, the function only runs for customers who are authenticated and have the `rs-dev` tag. The tag is hardcoded and does not need to be added to the config. Use during testing to avoid affecting real customers. |

---

## Step 5: Run the Mutation

1. Click the **Play** button at the top of GraphiQL
2. The right panel will show the response

---

## Step 6: Verify Success

A successful response looks like this:

```json
{
  "data": {
    "deliveryCustomizationCreate": {
      "deliveryCustomization": {
        "id": "gid://shopify/DeliveryCustomization/123456789",
        "title": "Hide Free Shipping During Sitewide Sale",
        "enabled": true,
        "functionId": "..."
      },
      "userErrors": []
    }
  }
}
```

**What to check:**

- `userErrors` should be an **empty array** `[]`
- `enabled` should be `true`
- Save the `id` if you need to reference this customization later

If you see errors in `userErrors`, copy the full response and share it with a developer.

---

## Step 7: Confirm in Shopify Admin

1. Go to **Settings → Checkout** in the Shopify admin sidebar
2. Scroll to the **Delivery customizations** section
3. You should see "Hide Free Shipping During Sitewide Sale" listed as **Active**

---

## Test Matrix

The scenarios below were accounted for in development and testing.

| # | Scenario |
| :---- | :---- |
| **Configuration** | |
| 1 | No metafield configured → no options hidden |
| 2 | `targetStrings` is empty → no options hidden |
| **Date Window** | |
| 3 | Current time is before `startDateTime` → no options hidden |
| 4 | Current time is past `endDateTime` → no options hidden |
| 5 | No date restriction (sentinel values `1970`/`2099`) → always active |
| 6 | Within a configured sale window → active |
| 7 | Only `startDateTime` configured (no `endDateTime`) and current time is past start → active |
| 8 | Date window enforced against shop's local timezone |
| **Customer Tags** | |
| 9 | No `customerTags` configured → applies to all customers including guests |
| 10 | Customer has a matching tag → proceeds to threshold checks |
| 11 | Customer has no matching tag → no options hidden |
| 12 | Guest checkout (no account) when `customerTags` is configured → no options hidden |
| 13 | `buyerIdentity` entirely absent (null) when `customerTags` is configured → no options hidden |
| **Cart Threshold** | |
| 14 | Cart below `cartThreshold` → no options hidden |
| 15 | Cart exactly at `cartThreshold` → activates (≥ behavior) |
| 16 | No `cartThreshold` configured → proceeds regardless of cart total |
| **Percent Discount** | |
| 17 | No `percentThreshold` configured → hides on all qualifying carts |
| 18 | At least one line item has a pro discount strictly above the threshold → hides matched options (pro pricing assumed) |
| 19 | Line item discounted at exactly the threshold → not hidden (sitewide rate assumed, not pro pricing) |
| 20 | All line items at or below threshold → no options hidden |
| 21 | Line item has both a line-level discount and an order-wide discount code → only the line-level portion counts (Shopify excludes order-level codes from the line total used for this check) |
| 22 | All discounts are order-wide (discount code only, no pro discount on any line) → no options hidden |
| 23 | `percentThreshold` configured, cart has no line items → no options hidden |
| 24 | Multiple line items, one has pro discount strictly above threshold → hides matched options |
| **Shipping Option Matching** | |
| 25 | `targetString` not found in any option title → no options hidden |
| 26 | Multiple `targetStrings` configured → all matched options hidden |
| 27 | Matching is case-sensitive (lowercase `targetString` ≠ title-case option) |
| 28 | Non-matched options (e.g. "Standard") stay visible |
| **Dev Mode** | |
| 29 | `devMode: true` + authenticated + `rs-dev` tag → function runs normally |
| 30 | `devMode: true` + guest → function skips (no options hidden) |
| 31 | `devMode: true` + authenticated, no `rs-dev` tag → function skips |
| 32 | `devMode: false` explicitly set → function runs normally (no `rs-dev` tag required) |
| **Integration** | |
| 33 | Pro member, cart ≥ $300, pro discount strictly above 15% on a line item, active window → "Free Shipping Over $300" hidden |
| 34 | Pro member, same cart but all items at or below 15% (sitewide rate) → "Free Shipping" NOT hidden |
| 35 | Retail customer (no matching tag) → "Free Shipping" NOT hidden regardless of discount level |
| 36 | Config updated via GraphiQL → new settings apply on next checkout with no redeploy |
| 37 | Pro member, 1 tent + 1 pack (qty 1 each) — Shopify applies 15% sitewide to both because it's the higher discount → free shipping NOT hidden |
| 38 | Pro member, 1 tent + 2 packs (qty 1 tent, 2 packs) — Shopify determines the pro discount is greater on the pack line → free shipping hidden. Note: qty affects which discount Shopify applies, but the function only checks the resulting line discount percentage |

---

## How to Update the Configuration

To change the date window, thresholds, target strings, or any other setting, use the update mutation directly in GraphiQL without needing to disable and recreate.

First, get the ID of the customization you want to update:

```graphql
query {
  deliveryCustomizations(first: 50) {
    nodes {
      id
      title
      enabled
      functionId
      metafield(namespace: "$roswell:dc", key: "config") {
        json
      }
    }
  }
}
```

**Mutation:**

```
mutation HYPERUpdateDeliveryCustomization($id: ID!, $input: DeliveryCustomizationInput!) {
  deliveryCustomizationUpdate(id: $id, deliveryCustomization: $input) {
    deliveryCustomization { id title }
    userErrors { field message }
  }
}
```

**Variables:**

Replace the `id` with the ID returned when you created the customization (saved from Step 6). Update the `value` field with your new config.

```json
{
  "id": "gid://shopify/DeliveryCustomization/YOUR_CUSTOMIZATION_ID",
  "input": {
    "title": "Hide Free Shipping Over $300 for pros with 15% discount threshold",
    "metafields": [
      {
        "namespace": "$roswell:dc",
        "key": "config",
        "type": "json",
        "value": "{\"targetStrings\":[\"Free Shipping Over $300\"],\"cartThreshold\":300,\"percentThreshold\":15,\"customerTags\":[\"pro-member\",\"Pro-member\",\"Outdoor-pro\",\"outdoor-pro\",\"Hyper-pro\",\"hyper-pro\",\"rs-hyper-pro\",\"rs-pro-member\"]}"
      }
    ]
  }
}
```

To schedule the customization for a specific sale window, update `startDateTime` and `endDateTime` in the `value` string before running (e.g. `"startDateTime\":\"2026-07-01T00:00:00\"`).

---

## Troubleshooting

| Problem | Solution |
| :---- | :---- |
| `userErrors` is not empty | Read the error message. It usually tells you exactly what's wrong. Common causes: missing `functionId`, invalid JSON in the `value` field |
| Delivery customization shows as disabled | Ensure `"enabled": true` is set in the variables |
| Function not found in the `shopifyFunctions` results | Run `shopify app deploy` first, then retry Step 2 |
| Shipping option not hidden at checkout | Confirm the option title matches a `targetString` exactly (case-sensitive). Verify all conditions are met: customer tag, cart total ≥ threshold, at least one line item discounted ≥ `percentThreshold`, current time within the date window |
| Real customers affected during testing | Set `"devMode": true` in the config and only add the `rs-dev` tag to your own test account |
| Free shipping is showing for a pro member even during a sale | Verify the pro discount function is active and applying. If all items are discounted at or below the `percentThreshold`, the function assumes the customer is at the sitewide rate and intentionally allows free shipping. |
| Pro member has an order-wide discount code and free shipping is hidden | Order codes are the sitewide promotion itself and are excluded from the threshold check. If the code alone is triggering hiding, verify no line-level pro discount is also active above the threshold. |
