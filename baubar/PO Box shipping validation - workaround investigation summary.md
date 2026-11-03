# PO Box shipping validation — workaround investigation summary

## TL;DR

- Our Delivery Customization function (hides shipping methods that can't deliver to PO Boxes) doesn't reliably re-run when a buyer edits their address — a known Shopify platform issue we've already reported.
- We tried a second safety net (a checkout validation rule that blocks completion) — it turned out to have the same underlying problem, so it isn't a reliable fix on its own.
- We also tried a workaround (a checkout UI extension that "nudges" Shopify into refreshing) — this one worked reliably in our testing for regular checkout and Shop Pay.
- Apple Pay and similar accelerated checkouts appeared to refresh correctly on their own in our testing, without needing the workaround — though we haven't tested this as thoroughly, so we're not treating that as fully confirmed yet. However, the UI extension can be included in Shop Pay, which is the largest chunk of their users.
- **Recommendation:** test the checkout UI extension workaround on dev1, and if BaubleBar is comfortable with it, deploy to production.
  - [https://admin.shopify.com/store/dev1-baublebar/themes?appLoadId=8fffd76b-4053-4a9f-a290-5dd7d4c99552](https://admin.shopify.com/store/dev1-baublebar/themes?appLoadId=8fffd76b-4053-4a9f-a290-5dd7d4c99552)

![Screenshot of dev1 checkout editor showing the PO Box handler extension](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3160375441/Screenshot%202026-08-05%20at%2012.22.21%E2%80%AFPM.png)

## Background

BaubleBar needs checkout to correctly handle PO Box addresses — specifically, making sure a buyer shipping to a PO Box can't select a delivery method that can't actually deliver there (e.g. UPS/FedEx ground).

We already have a **Delivery Customization function** that's supposed to handle this: when it detects a PO Box address, it hides incompatible shipping methods and highlights the ones that work. The problem is that Shopify doesn't reliably re-run this function every time a buyer edits their address. We reported this to Shopify directly — see the existing note *"Delivery customization function - po box not re-triggering on address change issue"* for the full technical writeup and screen recording we sent them.

In short: Shopify only reliably reruns checkout logic when certain fields change (postal code, state/province) but not others (address line 1, address line 2, city) — depending on how a store's shipping is set up. Since BaubleBar's PO Box text usually lives in address line 1 or 2, this means a buyer can type in a PO Box and the shipping options won't always update to reflect it. This is the underlying bug we were trying to work around.

## What we explored

We looked at two different approaches to cover this gap while waiting on Shopify:

**1. A checkout UI extension "nudge."**
A checkout UI extension that watches the address fields as the buyer types. When it notices address line 1/2 change, it re-writes the postal code field with its own current value — postal code changes are one of the field types Shopify *does* reliably notice, so this is an attempt to force Shopify to notice the address edit and refresh the shipping options, even though the field that actually changed (address line 1/2) wouldn't have triggered a refresh on its own.

**2. A checkout validation rule.**
A separate, independent safety net: instead of trying to fix the shipping options list itself, this checks at the moment the buyer tries to complete their order — if the address is a PO Box and they've selected a shipping method that can't deliver there, it blocks checkout with a message telling them to pick a different method. This also has a settings page for our team to configure which shipping methods are considered PO Box-safe, turn on a test-only mode, and customize the error message.

## What we found

- **The validation rule has the same underlying problem.** It also depends on Shopify recalculating checkout, and that recalculation doesn't reliably happen on address line 1/2 edits — same root issue as the delivery customization function. In testing on the BaubleBar dev store, it did not reliably catch a PO Box address entered via address line 1/2.
- **The UI nudge does appear to work.** In testing, it reliably picked up PO Box edits and refreshed the shipping options for regular checkout and Shop Pay.
- **Apple Pay and other accelerated checkouts (non-Shop Pay) appeared to trigger a refresh on their own in our testing**, so the delivery customization function seemed to work correctly there without the workaround. This was based on limited testing rather than a confirmed guarantee from Shopify, so we'd want to keep an eye on it rather than assume it always holds.

Net effect: the nudge isn't a true server-side fix (it's a workaround, not something Shopify guarantees will keep working), but between it covering regular/Shop Pay checkout and accelerated checkouts appearing to work correctly on their own, this would likely cover the large majority of BaubleBar's checkout traffic.

## Current status

Both the validation rule and the UI nudge are installed and running on the **dev1** store for testing.

## Recommendation

Try out the UI nudge workaround. The BaubleBar team should test it on dev1 to confirm it behaves as expected. If they're comfortable moving forward with it, we can deploy it and release it to the production app.
