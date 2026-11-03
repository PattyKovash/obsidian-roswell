# Fulfillment Routing — Call Talking Points

TAHARI-ISSUE-12553978006 · 2026-08-13

---

## Good news

D4S and Studio Milburn are already blocked from online orders. That part of your July request is done.

---

## What we found

**Your routing skips CLS.**

Think of it as a checklist Shopify runs on every order. It starts with every location allowed to ship online, and each step crosses some off. Whoever's left gets the order.

Shopify's standard checklist has three steps. Yours has two:

1. **"Can one location send this in one box?"** — anyone holding every item stays, everyone else is crossed off
2. **"Prefer CLS, then the three stores"** — your ranked groups

**Step 1 runs first, and it doesn't know anything about CLS.**

Example — customer orders 3 items. CLS has 2 of them. Santa Monica has all 3.

- Step 1: "who can send this in one box?" → Santa Monica. **CLS is crossed off here.**
- Step 2: only Santa Monica is left. Nothing to prioritize.
- Order goes to Santa Monica.

CLS was never considered. This happens on every order where CLS is missing even one item.

**Fix:** swap the two steps. CLS then wins whenever it has stock.

**Trade-off:** more orders arrive in two packages — CLS sends what it has, a store sends the rest. Split shipping is off in your checkout, so the customer still pays one shipping charge and you absorb the second package. A bit more shipping cost, against fewer cancellations. Your call.

---

## Free, this week

| Action | Notes |
|---|---|
| Swap the two routing rules | **Your decision** — costs shipping, see above |
| Switch off the ELIE TAHARI location | Empty, no impact. Tidy-up only |
| Matrixify: "continue selling when out of stock" → false | Agreed in July, not done yet |

Until Matrixify is fixed, everything else can be oversold straight through it.

---

## What we can build

**International orders pull only from CLS** — yes, standard Shopify capability. No waiting on anyone. Recommend greenlighting.

**Last-unit protection** — yes, and better than the Flow version approved in July. Flow only hides the product; anyone with the page open or bookmarked can still buy it. Done properly it also blocks at checkout, including Apple Pay and Shop Pay.

---

## Steer away from

**"Route to the store with the most stock."** Shopify has kept this in beta since 2023, no release date, needs their approval.

Also — you told us the real problem is stores counting by hand and getting it wrong. Routing to the store with the *most* stock doesn't help if the number is unreliable. The last-unit rule fixes the actual cause.

**Possible free alternative:** reordering the rules may give you highest-inventory routing natively. Testing it.

---

## Sequence

1. Free fixes this week
2. Watch cancellations a few weeks
3. Build international + last-unit when there's budget

PDP stays first.

---

---

## Internal — not for client

- **Rule-order finding is a hypothesis**, not tested on their store. Say "we think we've found." Provable with one test order: two items stocked at different locations, see who gets assigned.
- **ELIE TAHARI is empty** — do NOT present it as a cause of cancellations. Tidy-up only. Also means no double-counting risk in the last-unit maths.
- **Highest-inventory-native:** Shopify doc says minimize-split "defaults to prioritizing the location with the highest available inventory" — but only "when no other rules for prioritization are specified." Unclear if it applies when second in a chain. Verify before promising.
- **Their setup is missing 2 of Shopify's 3 default rules** — "stay within destination market" and "ship from closest location." The market rule is the native guard against international pulling from US stores.
- **Don't raise:** TikTok app already has 3 fulfillment constraints registered. Ours could collide and block checkout. Investigate before building.
