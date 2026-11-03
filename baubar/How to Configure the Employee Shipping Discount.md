# BaubleBar: How to Configure the Shipping Discount Based on Tag and Discount Code

## What This Does

This discount function applies a configurable shipping discount at checkout for eligible buyers. It is set up through the Shopify Discounts UI and evaluated at checkout by a custom Shopify Function.

The function supports two eligibility gates that can be used independently or together:

- **Discount code match strings:** discount applies when any code entered at checkout contains any of the configured strings (case-insensitive, substring match, any-match). Example: configuring `BBEMP` matches `BBEMP-TEST` and `rs-bbemp-summer` (Shopify normalizes entered codes to uppercase).
- **Buyer tags:** discount applies when the authenticated buyer's account has any of the configured tags (case-sensitive, Shopify customer tag match).

When both are configured, both conditions must be met. When only one is configured, only that condition is checked. When neither is configured, the function does nothing.

The discount amount is configurable:

- **Percentage discount:** reduces each applicable shipping rate by the configured percentage (default: 100%, free shipping)
- **Fixed amount discount:** reduces each applicable shipping rate by a flat dollar amount

The delivery option scope is also configurable:

- **All delivery options:** the discount applies to every shipping option at checkout (default)
- **Specific delivery options:** the discount applies only to options whose title contains one of the configured match strings (case-sensitive)

Note: Shopify's native discount UI also provides customer eligibility controls (specific customers, customer segments). These are evaluated by Shopify separately from the function's buyer tag check and can be used alongside it.

---

## Combination Settings: Important Requirement

If buyer eligibility depends on a discount code (the code match gate), the employee discount function must be allowed to combine with the discount that carries that code.

Shopify tracks which codes are entered at checkout via `enteredDiscountCodes`. This list is only populated for codes whose discounts are configured to combine with this discount. If combination settings are not configured correctly, the function receives an empty code list and no shipping discount is applied, even if the buyer enters the correct code.

**Rule:** Any discount whose code the buyer will enter must have its combination settings set to allow combining with shipping discounts. The employee shipping discount itself must also be set to combine with that discount type.

---

## Prerequisites

- The CE extension app has been deployed to the store via `shopify app deploy`
- You have access to Shopify Admin with permission to create and edit discounts

---

## Step 1: Create the Employee Shipping Discount

1. In Shopify Admin, go to **Discounts** in the left sidebar
2. Click **Create discount**
3. Select **dc-shipping-by-tag-code**
4. Fill in the native discount fields:
   - **Method:** Automatic or Code (Automatic is recommended; the function's code match gate handles code gating independently)
   - **Title:** e.g., `Employee Free Shipping`
   - **Customer eligibility:** optionally restrict to specific customers or segments using Shopify's native controls
   - **Combinations:** configure which other discount types this discount can stack with
     - **Product discounts:** enable if the buyer may also receive a product discount alongside this shipping discount
     - **Order discounts:** enable if the buyer may use an order-wide code at checkout
   - **Usage limits:** set if needed
   - **Active dates:** set if needed

---

## Step 2: Configure the Function Settings

In the same discount creation screen, scroll to the **Employee Shipping Discount** settings section. The following fields are available:

| Field | Description |
| :---- | :---- |
| **Discount code match strings** | Case-insensitive substrings (add/remove list). The discount applies when any entered code contains any of these strings (ANY match). Leave empty to skip this check. Example: `BBEMP` |
| **Buyer tags** | One or more Shopify customer account tags. The discount applies when the authenticated buyer has any of these tags. Case-sensitive. Leave blank to skip this check. Example: `Employee`, `Affiliate` |
| **Discount type** | `Percentage` or `Fixed amount`. Default: Percentage. |
| **Discount value** | The numeric value for the chosen type. For Percentage: enter a number from 1 to 100 (e.g. `100` for free shipping, `50` for half off). For Fixed amount: enter a dollar amount (e.g. `10` for $10 off). Default: 100. |
| **Delivery option scope** | `All delivery options` applies the discount to every shipping option at checkout. `Specific delivery options` applies only to options whose title contains a configured match string. Default: All. |
| **Delivery option matches** | Visible when Specific is selected. One or more strings. A delivery option is discounted only when its title contains at least one of these strings (case-sensitive). Example: `Standard` matches `Standard Shipping` but not `standard shipping`. |

At least one of **Discount code match strings** or **Buyer tags** must be filled in. If both are empty, the function does nothing.

Click **Save** when done.

---

## Step 3: Verify at Checkout

Test the setup with a buyer account that meets the configured conditions:

1. Add items to cart
2. Proceed to checkout
3. Enter the discount code if the code match gate is configured
4. Confirm the shipping step reflects the configured discount on the expected options

If shipping is not discounted, see the Troubleshooting section below.

---

## Configuration Reference

| Field | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| `discountCodeMatches` | array of strings | No | Substrings to match against entered discount codes. Case-insensitive contains check, ANY match. Leave empty to disable this gate. |
| `buyerTags` | array of strings | No | Shopify customer account tags. Match is case-sensitive. Discount applies when the buyer has any one of these tags. Leave blank to disable this gate. |
| `discountType` | string | No | `"percentage"` or `"fixed"`. Defaults to `"percentage"` when absent or unrecognized. |
| `discountValue` | number | No | Value for the chosen discount type. For percentage: 1 to 100 (100 = free shipping). For fixed: flat dollar amount off the shipping rate. Defaults to `100` when absent. |
| `deliveryOptionMatches` | array of strings | No | Title contains strings for filtering delivery options. Absent or empty applies the discount to all options. Case-sensitive substring match. Example: `["Standard"]` matches `"Standard Shipping"` but not `"standard shipping"`. |

At least one of `discountCodeMatches` or `buyerTags` must be non-empty for the function to apply a discount.

---

## How to Update the Configuration

1. Go to **Discounts** in Shopify Admin
2. Find and click the employee shipping discount
3. Update the relevant fields
4. Click **Save**

Changes take effect immediately on the next checkout. No redeploy required.

---

## Test Matrix

The scenarios below were accounted for in development and testing.

| # | Scenario |
| :---- | :---- |
| **Configuration** | |
| 1 | No metafield configured (discount created but settings never saved): no shipping discount applied |
| 2 | Both eligibility fields empty: no shipping discount applied |
| **Code Match Gate** | |
| 3 | Code match configured, buyer enters a code containing the match string: shipping discount applied |
| 4 | Code match configured, buyer enters a code that does not contain the match string: no discount |
| 5 | Code match configured, buyer enters no code: no discount |
| 6 | Code match is case-insensitive: `rs-test` config matches `RS-TEST-ORDER-2026` entered code (Shopify normalizes entered codes to uppercase) |
| 7 | Multiple codes entered at checkout: discount fires if any entered code contains any configured match string |
| 8 | Multiple match strings configured: first string misses but second matches — discount fires (ANY match) |
| 9 | Code match configured only (no buyer tags), matching code entered: discount applied regardless of buyer identity |
| **Buyer Tag Gate** | |
| 10 | Buyer tags configured, authenticated buyer has a matching tag: discount applied |
| 11 | Buyer tags configured, authenticated buyer has no matching tags: no discount |
| 12 | Buyer tags configured, guest checkout (no account): no discount |
| 13 | Buyer tags configured, `buyerIdentity` absent: no discount |
| 14 | Buyer tags configured only (no code match), buyer has matching tag: discount applied regardless of entered codes |
| **Delivery Option Filtering** | |
| 15 | No `deliveryOptionMatches` configured: discount applies to all delivery options |
| 16 | `deliveryOptionMatches` configured, an option title contains the match string: that option is discounted |
| 17 | One match string matches multiple option titles: all matching options are targeted in a single discount operation |
| 18 | `deliveryOptionMatches` configured, no option title contains any match string: no discount applied |
| 19 | Delivery option title matching is case-sensitive: `standard` does not match `Standard Shipping` |
| **Discount Amount** | |
| 20 | `discountType` `"fixed"`, `discountValue` `10`: $10 fixed discount applied to applicable options |
| 21 | `discountType` `"percentage"`, `discountValue` `50`: 50% discount applied to applicable options |
| 22 | Neither `discountType` nor `discountValue` configured: defaults to 100% (free shipping) |
| **Native Discount Eligibility** | |
| 23 | Shopify native customer eligibility restricts to specific customers: non-eligible buyer does not receive discount |
| **Combination Settings** | |
| 24 | Combination settings not configured on the code's discount: `enteredDiscountCodes` is empty, no shipping discount applied |
| 25 | Combination settings correctly configured on both discounts: code is visible to the function and discount applies |
| **Integration** | |
| 26 | Multiple delivery groups: discount applied to all groups when no option filter is set |
| 27 | End-to-end: code entered, combination settings correct, buyer has tag: all applicable options discounted |
| 28 | End-to-end: code entered, combination settings missing on code's discount: no discount (empty code list) |

---

## Troubleshooting

| Problem | Solution |
| :---- | :---- |
| Shipping is not discounted even though the correct code was entered | Check combination settings on the discount whose code was entered. It must allow combining with shipping discounts. Also verify the employee shipping discount allows combining with that discount's type. |
| Shipping is not discounted even though the buyer has the correct tag | Verify the tag in the buyer's account exactly matches (case-sensitive) one of the configured buyer tags. Open the customer record in Admin and compare character by character. |
| Function appears to do nothing | Confirm at least one of the two eligibility fields (discount code match or buyer tags) is filled in. If both are empty, the function intentionally does nothing. |
| Only some delivery options are discounted | Check the `deliveryOptionMatches` setting. If specific options are configured, only options whose title contains one of the match strings will be discounted. Verify the match strings match the option titles exactly, including case. |
| Discount amount is not what was expected | Verify the Discount type and Discount value fields match the intended configuration. A missing Discount value defaults to 100. |
| Discount not visible in the Create discount list | Run `shopify app deploy` to deploy the extension to the store, then retry. |
| Settings section not visible in the discount creation screen | Confirm the extension was deployed to this specific store and that the UI extension handle `dcui-shipping-by-tag-code` is linked to the function in the toml. |
