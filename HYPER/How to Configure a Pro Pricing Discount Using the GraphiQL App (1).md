# HOW TO TEST ON PROD

## **Pro Pricing: Testing Instructions**

---

**Pro Pricing: Testing Instructions**

**1\. Test Environment Setup**

* **System Status:** All 3 development discounts and non-test discounts are now fully set up. Please ensure the correct tiers are activated during testing.![][image1]  
* **Authorized Access:** Only the below emails are enabled for testing. **Matt**, your email is already active:  
  * matt@hyperlitemountaingear.com  
  * patty@roswellstudios.com  
  * jessie.wong@roswellstudios.com  
  * maria.yoshitha@roswellstudios.com  
  * lisa.homsokolowski@roswellstudios.com  
  * jimmy.kan@roswellstudios.com  
* **Simultaneous Customer Testing:** You can test multiple customer tiers simultaneously by assigning a different "Qualifying Customer Tag" to each authorized email listed above. Simply enter the specific email at checkout to see that user's specific discount.

![][image2]

* **Legacy Script Warning:** The existing legacy script is still active. To avoid errors, ensure you are testing with products tagged with the **new live tags** listed below rather than old ones.

**2\. Testing with the RS Test Product**

* **Product URL:** [RS Test Product](https://www.hyperlitemountaingear.com/products/rs-test-product) *(Note: Ensure you are logged into an authorized account to see the changes).*  
* **Simultaneous Category Testing:** If you wish to test all categories (Packs, Sacks, etc.) at the same time, you will need to apply the specific category tags to different individual products.

**3\. Pricing Tier & Discount Rules**

| Category | RS Hyper Pro | RS Outdoor Pro | RS Pro Member |
| :---- | :---- | :---- | :---- |
| **Packs** | 40% off | 20% off | 10% off |
| **Accessories** | 40% off | 20% off | 10% off |
| **Sacks** | 25% off | 10% off | 10% off |
| **Shelters** | 25% off | 10% off | 10% off |
| **Checkout Msg** | RS Hyper Pro Applied | RS Outdoor Pro Applied | RS Pro Member Applied |

**4\. Qualifying Tags (Case-Sensitive)**

To trigger these rules, both the **Customer** and the **Product** must have the correct tags:

* **Customer Tags:**  
  * rs-hyper-pro / rs-Hyper-pro  
  * rs-outdoor-pro / rs-Outdoor-pro  
  * rs-pro-member / rs-Pro-member  
* **Product Category Tags:**  
  * **Packs:** rs-pro-packs / rs-PRO-PACKS  
  * **Accessories:** rs-pro-accessories / rs-PRO-ACCESSORIES  
  * **Sacks:** rs-pro-sacks / rs-PRO-SACKS  
  * **Shelters:** rs-pro-shelters / rs-PRO-SHELTERS

# How to Configure

# How to Configure a Pro Pricing Discount Using the GraphiQL App

This guide walks you through creating a discount using the Shopify GraphiQL app. You will need to do this **once per tier** (Hyper Pro, Outdoor Pro, Pro Member).

---

## Prerequisites

- The **Shopify GraphiQL app** is installed on the store  
- The discount function has been **deployed** via `shopify app deploy`

---

## Step 1: Open GraphiQL

1. Go to your Shopify admin  
2. Click **Apps** in the left sidebar  
3. Open the **Shopify GraphiQL App**

---

## Step 2: Find the Function ID

Before creating a discount, you need to find the **Function ID** for the discount function. This is a unique identifier that tells Shopify which function to use.

1. In the **left panel** of GraphiQL, clear any existing text and paste the following:

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

2. Click the **Play** button (the triangle icon at the top)  
3. The **right panel** will show a list of all functions installed on the store. It will look something like this:

```json
{
  "data": {
    "shopifyFunctions": {
      "nodes": [
        {
          "id": "019d6397-aa84-7011-9642-a6b6076813a7",
          "title": "discount-by-tag",
          "app": {
            "handle": "pk-dev-test"
          },
          "handle": "discount-by-tag"
        }
      ]
    }
  }
}
```

4. Look through the list for the function with `"handle": "discount-by-tag"`  
5. Copy the `"id"` value for that function — this is your **Function ID**  
6. You will paste this ID into the variables in the next steps (replacing `YOUR_FUNCTION_ID`)

**Tip:** The function list may include other functions from other apps. Make sure you pick the one with the correct `handle` and `app.handle` that matches your app.

---

## Step 3: Paste the Mutation

Copy and paste the following into the **left panel** of GraphiQL (replace the query from Step 2):

```
mutation CreateAutomaticDiscount($automaticAppDiscount: DiscountAutomaticAppInput!) {
  discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
    automaticAppDiscount {
      discountId
      title
      startsAt
      endsAt
      status
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

---

## Step 4: Paste the Variables

At the bottom of GraphiQL, there is a section called **"Query Variables"**. Click on it to expand it.

Paste **one** of the following JSON blocks depending on which tier you are creating.

**Important:** Replace `YOUR_FUNCTION_ID` with the Function ID you copied in Step 2\.

**Note:** The `"title"` field (e.g., `"Hyper Pro Pricing"`) can be changed to anything you like, as long as it stays within Shopify's 255-character limit. This is the name that appears in the Shopify admin discount list.

Each tier has two versions:

- **Dev mode (default):** The discount only works for the email addresses listed in `devEmails`. Use this when testing on a live store so real customers are not affected. Replace `your-email@example.com` with the email of the account you are testing with.  
- **Production mode:** The discount works for all customers with the matching tier tag. Switch to this when you are ready to go live.

---

### Option A: Hyper Pro Pricing

**Dev mode (for testing):**

```json
{
  "automaticAppDiscount": {
    "title": "Hyper Pro Pricing",
    "functionId": "YOUR_FUNCTION_ID",
    "startsAt": "2026-04-06T00:00:00Z",
    "endsAt": null,
    "discountClasses": ["PRODUCT"],
    "combinesWith": {
      "orderDiscounts": false,
      "productDiscounts": false,
      "shippingDiscounts": false
    },
    "metafields": [
      {
        "namespace": "$roswell:discount",
        "key": "config",
        "type": "json",
        "value": "{\"tierTags\":[\"hyper-pro\",\"Hyper-pro\"],\"packsTags\":[\"pro-packs\",\"PRO-PACKS\"],\"accessoriesTags\":[\"pro-accessories\",\"PRO-ACCESSORIES\"],\"sacksTags\":[\"pro-sacks\",\"PRO-SACKS\"],\"sheltersTags\":[\"pro-shelters\",\"PRO-SHELTERS\"],\"enableDevTest\":true,\"devEmails\":[\"your-email@example.com\"],\"discountRules\":{\"packs\":40,\"accessories\":40,\"sacks\":25,\"shelters\":25},\"message\":\"Hyper Pro Customer Discount Applied\"}"
      }
    ]
  }
}
```

**Production mode (for go-live):**

```json
{
  "automaticAppDiscount": {
    "title": "Hyper Pro Pricing",
    "functionId": "YOUR_FUNCTION_ID",
    "startsAt": "2026-04-06T00:00:00Z",
    "endsAt": null,
    "discountClasses": ["PRODUCT"],
    "combinesWith": {
      "orderDiscounts": false,
      "productDiscounts": false,
      "shippingDiscounts": false
    },
    "metafields": [
      {
        "namespace": "$roswell:discount",
        "key": "config",
        "type": "json",
        "value": "{\"tierTags\":[\"hyper-pro\",\"Hyper-pro\"],\"packsTags\":[\"pro-packs\",\"PRO-PACKS\"],\"accessoriesTags\":[\"pro-accessories\",\"PRO-ACCESSORIES\"],\"sacksTags\":[\"pro-sacks\",\"PRO-SACKS\"],\"sheltersTags\":[\"pro-shelters\",\"PRO-SHELTERS\"],\"enableDevTest\":false,\"devEmails\":[],\"discountRules\":{\"packs\":40,\"accessories\":40,\"sacks\":25,\"shelters\":25},\"message\":\"Hyper Pro Customer Discount Applied\"}"
      }
    ]
  }
}
```

---

### Option B: Outdoor Pro Pricing

**Dev mode (for testing):**

```json
{
  "automaticAppDiscount": {
    "title": "Outdoor Pro Pricing",
    "functionId": "YOUR_FUNCTION_ID",
    "startsAt": "2026-04-06T00:00:00Z",
    "endsAt": null,
    "discountClasses": ["PRODUCT"],
    "combinesWith": {
      "orderDiscounts": false,
      "productDiscounts": false,
      "shippingDiscounts": false
    },
    "metafields": [
      {
        "namespace": "$roswell:discount",
        "key": "config",
        "type": "json",
        "value": "{\"tierTags\":[\"outdoor-pro\",\"Outdoor-pro\"],\"packsTags\":[\"pro-packs\",\"PRO-PACKS\"],\"accessoriesTags\":[\"pro-accessories\",\"PRO-ACCESSORIES\"],\"sacksTags\":[\"pro-sacks\",\"PRO-SACKS\"],\"sheltersTags\":[\"pro-shelters\",\"PRO-SHELTERS\"],\"enableDevTest\":true,\"devEmails\":[\"your-email@example.com\"],\"discountRules\":{\"packs\":20,\"accessories\":20,\"sacks\":10,\"shelters\":10},\"message\":\"Outdoor Pro Customer Discount Applied\"}"
      }
    ]
  }
}
```

**Production mode (for go-live):**

```json
{
  "automaticAppDiscount": {
    "title": "Outdoor Pro Pricing",
    "functionId": "YOUR_FUNCTION_ID",
    "startsAt": "2026-04-06T00:00:00Z",
    "endsAt": null,
    "discountClasses": ["PRODUCT"],
    "combinesWith": {
      "orderDiscounts": false,
      "productDiscounts": false,
      "shippingDiscounts": false
    },
    "metafields": [
      {
        "namespace": "$roswell:discount",
        "key": "config",
        "type": "json",
        "value": "{\"tierTags\":[\"outdoor-pro\",\"Outdoor-pro\"],\"packsTags\":[\"pro-packs\",\"PRO-PACKS\"],\"accessoriesTags\":[\"pro-accessories\",\"PRO-ACCESSORIES\"],\"sacksTags\":[\"pro-sacks\",\"PRO-SACKS\"],\"sheltersTags\":[\"pro-shelters\",\"PRO-SHELTERS\"],\"enableDevTest\":false,\"devEmails\":[],\"discountRules\":{\"packs\":20,\"accessories\":20,\"sacks\":10,\"shelters\":10},\"message\":\"Outdoor Pro Customer Discount Applied\"}"
      }
    ]
  }
}
```

---

### Option C: Pro Member Pricing

**Dev mode (for testing):**

```json
{
  "automaticAppDiscount": {
    "title": "Pro Member Pricing",
    "functionId": "YOUR_FUNCTION_ID",
    "startsAt": "2026-04-06T00:00:00Z",
    "endsAt": null,
    "discountClasses": ["PRODUCT"],
    "combinesWith": {
      "orderDiscounts": false,
      "productDiscounts": false,
      "shippingDiscounts": false
    },
    "metafields": [
      {
        "namespace": "$roswell:discount",
        "key": "config",
        "type": "json",
        "value": "{\"tierTags\":[\"pro-member\",\"Pro-member\"],\"packsTags\":[\"pro-packs\",\"PRO-PACKS\"],\"accessoriesTags\":[\"pro-accessories\",\"PRO-ACCESSORIES\"],\"sacksTags\":[\"pro-sacks\",\"PRO-SACKS\"],\"sheltersTags\":[\"pro-shelters\",\"PRO-SHELTERS\"],\"enableDevTest\":true,\"devEmails\":[\"your-email@example.com\"],\"discountRules\":{\"packs\":10,\"accessories\":10,\"sacks\":10,\"shelters\":10},\"message\":\"Pro Member Customer Discount Applied\"}"
      }
    ]
  }
}
```

**Production mode (for go-live):**

```json
{
  "automaticAppDiscount": {
    "title": "Pro Member Pricing",
    "functionId": "YOUR_FUNCTION_ID",
    "startsAt": "2026-04-06T00:00:00Z",
    "endsAt": null,
    "discountClasses": ["PRODUCT"],
    "combinesWith": {
      "orderDiscounts": false,
      "productDiscounts": false,
      "shippingDiscounts": false
    },
    "metafields": [
      {
        "namespace": "$roswell:discount",
        "key": "config",
        "type": "json",
        "value": "{\"tierTags\":[\"pro-member\",\"Pro-member\"],\"packsTags\":[\"pro-packs\",\"PRO-PACKS\"],\"accessoriesTags\":[\"pro-accessories\",\"PRO-ACCESSORIES\"],\"sacksTags\":[\"pro-sacks\",\"PRO-SACKS\"],\"sheltersTags\":[\"pro-shelters\",\"PRO-SHELTERS\"],\"enableDevTest\":false,\"devEmails\":[],\"discountRules\":{\"packs\":10,\"accessories\":10,\"sacks\":10,\"shelters\":10},\"message\":\"Pro Member Customer Discount Applied\"}"
      }
    ]
  }
}
```

---

## Step 5: Run the Mutation

1. Click the **Play** button (the triangle icon) at the top of GraphiQL  
2. The right panel will show the response

---

## Step 6: Verify Success

A successful response looks like this:

```json
{
  "data": {
    "discountAutomaticAppCreate": {
      "automaticAppDiscount": {
        "discountId": "gid://shopify/DiscountAutomaticNode/123456789",
        "title": "Hyper Pro Pricing",
        "startsAt": "2026-04-06T00:00:00Z",
        "endsAt": null,
        "status": "ACTIVE"
      },
      "userErrors": []
    }
  }
}
```

**What to check:**

- `userErrors` should be an **empty array** `[]`  
- `status` should be `"ACTIVE"`  
- `discountId` will be returned — save this if you need to update the discount later

If you see errors in `userErrors`, copy the full response and share it with a developer.

---

## Step 7: Confirm in Shopify Admin

1. Go to **Discounts** in the Shopify admin sidebar  
2. You should see the discount you just created (e.g., "Hyper Pro Pricing")  
3. It will show as an **Automatic** discount with status **Active**

---

## Step 8: Repeat for Each Tier

Repeat Steps 3–7 for each tier you need to create. You should have **three discounts** total:

1. Hyper Pro Pricing  
2. Outdoor Pro Pricing  
3. Pro Member Pricing

---

## How to Update a Discount's Configuration

To change percentages, messages, dev mode, emails, or other config values for an existing discount:

1. Go to **Discounts** in the Shopify admin sidebar  
2. Find the discount you want to update (e.g., "Hyper Pro Pricing")  
3. Select it by clicking the **checkbox** next to the discount name  
4. A toolbar will appear at the top — click **Deactivate**  
5. Confirm the deactivation  
6. Go back to the **Shopify GraphiQL App** (see Step 1\)  
7. Follow **Steps 3–7** again to create a new discount with the updated configuration values  
   - Use the same `functionId` from Step 2 (it does not change)  
   - Update the `"value"` inside the `metafields` with your new settings (e.g., change a percentage, flip `enableDevTest` to `false`, add/remove emails from `devEmails`)  
   - You can reuse the same `"title"` or give it a new name

**Tip:** You can leave deactivated discounts in the list to quickly re-enable them later, or delete them from the Discounts page to keep things clean.

---

## Troubleshooting

| Problem | Solution |
| :---- | :---- |
| `userErrors` is not empty | Read the error message — it usually tells you exactly what's wrong. Common issues: missing `functionId`, missing `discountClasses` |
| Discount shows as "Draft" not "Active" | Check that `startsAt` is set to a date in the past or present |
| Discount doesn't apply at checkout | Verify the customer has the correct tag and the product has a qualifying tag (e.g., `PRO-PACKS`) |
| Function ID not found | Run `shopify app deploy` first, then ask a developer for the function ID |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>