# TAHARI Fulfillment Routing & Last Unit 

---

## Current setup

**Locations that can fulfill online orders:** CLS, National Harbor, Santa Monica Place, Pembroke Gardens.

**Shipping:** one profile, one set of locations, International & US only.

**Routing rules, in order:**

1. Minimize split fulfillments  
2. Use ranked locations  
   - **2a.** Creative Logistic Services  
   - **2b.** National Harbor, Santa Monica Place, Pembroke Gardens  
   - **2c.** D4S ×9, ELIE TAHARI, Studio Milburn *(not relevant)*  
     

Based on [Shopify’s logic](https://help.shopify.com/en/manual/fulfillment/setup/order-routing/understanding-order-routing), a checklist runs on every order. Each step crosses locations off, and whoever is left gets the order.

1. "Can one location send this in one box?"  
2. "Prefer CLS, then the three stores"

**Step 1 runs first and knows nothing about CLS.**

Example: an order of 3 items. CLS has 2 of them. Santa Monica has all 3\. Step 1 crosses CLS off. Step 2 has only Santa Monica left. The order goes to the store.

CLS is skipped whenever it is missing an item and another location, or combination of locations, can complete the order in fewer packages.

---

## US vs. non-US orders breakdown for the last 12 months

[Shopify Report](https://admin.shopify.com/store/elie-tahari/analytics/reports/explore?ql=FROM+sales%0A++SHOW+orders%2C+total_sales%0A++GROUP+BY+shipping_country%0A++SINCE+-12m+UNTIL+today%0A++ORDER+BY+total_sales+DESC%0AVISUALIZE+orders%2C+total_sales+TYPE+list_with_dimension_values+MAX+5)

|  | Orders | Share of orders |
| :---- | :---- | :---- |
| United States (incl. POS) | 24,270 | 99.4% |
| International | 85 | 0.3% |
| Other unspecified | 65 | 0.3% |
| **Total** | **24,420** |  |

International is 85 orders a year, about 7 a month.

**Consideration when weighing options: does fixing the 0.3% put the 99.4% at risk?**

### Browsing activity, same period

Orders count only the people who bought. Sessions show the full international audience, which helps gauge how much to prioritise pre-checkout feedback.

|  | Sessions | Share of sessions |
| :---- | :---- | :---- |
| United States | 3,340,453 | 86.1% |
| International (excluding China) | 424,414 | 10.9% |
| China | 114,486 | 3.0% |
| **Total** | **3,879,353** | 100% |

Top international markets:

| Market | Sessions | Conversion |
| :---- | :---- | :---- |
| Canada | 57,526 | 0.13 to 0.15% |
| United Kingdom | 38,089 | 0.13 to 0.15% |
| Singapore | 25,881 | |
| United States, for comparison | 3,340,453 | 0.50% |

**China is set aside.** 114,486 sessions at 0.0009% conversion. High activity with almost no conversion is more likely bots or competitor research than real demand.

Two things worth noting:

- International traffic converts at roughly a third of the US rate
- International average order value is about $375 against $371 for the US

**How to read this against the options.** Only a fraction of these shoppers would ever hit a checkout block, since it only happens when the item they want is not held at the warehouse. But this is the population size to weigh when deciding whether telling them earlier is worth paying for.

---

## Questions

Marked **[assumed]** where the options below are already built on an answer. We need these confirmed, not decided from scratch.

### 1\. Which locations can fulfill online orders

**[assumed]**

> Just to confirm, the only locations that should ever fulfill an online order are **CLS, National Harbor, Santa Monica Place, and Pembroke Gardens**. Nothing else, ever. Is that right?  
>   
> There is also a location called **"ELIE TAHARI"** with no stock in it. Can we switch it off?

### 2\. When something should show as sold out

**[assumed]** Read back rather than ask, you have already told us this twice:

> To confirm the rule: for a given variant, when CLS has none left and the three stores have only **1 between them in total**, that variant comes off the website. The store keeps its last piece. Right?  
> 

1. **[assumed]** When we take it off, what should the site say? We would suggest "unavailable" rather than "sold out," since back in stock notifications will not work on these and we do not want to invite a signup we cannot deliver on.

### 3\. Where orders should ship from

2. **[assumed]** For US orders, when should a store ever be used instead of CLS?  
     
   - **(a)** Only when CLS has none of that item at all, or  
   - **(b)** also when CLS has some but not enough to cover the order?

   

3. **[assumed]** If CLS has most of an order but not all of it, would you rather:  
     
   - **(a)** CLS ships what it has and a store ships the rest, in two packages, or  
   - **(b)** the whole order goes to one store that has everything?

   

4. **[assumed]** Should CLS always be tried first, even when a store could ship the whole order in one box?  
     
5. When CLS is out and more than one store has the item, which store should get it? The one with the most stock, or the one closest to the customer?

### 4\. International orders

6. **[assumed]** Which locations can fulfill international orders? If an international customer wants something CLS does not have, but a store does, should they simply not be able to buy it?

   

7. Do you ever create international orders manually in the back end, rather than the customer ordering on the site?

---

## Options

### The main consideration, and it applies to both requests

Both requests come down to the same choice.

**Ideally we use Shopify's own availability.** When Shopify itself knows an item is unavailable:

- The website, your product feeds, your reporting and any third party apps that rely on Shopify availability all read the same number, so the site and your feeds never contradict each other. This matters commercially: Google and Meta check the product page against what the feed claims, and can flag a product or drop it from the feed when the two disagree
- Back in stock emails work as expected
- Sold out shows everywhere, and checkout is blocked
- Additional user feedback workarounds are not needed. It works on every surface without us building it for each one

**Shopify has native tools for both. What it does not have is your exact rule.**

Shopify can hold stock back at a location, and it can control which locations serve which countries. What it cannot do on its own is "hold back the last one once three stores have only one between them," or "only the warehouse ships abroad, with nothing else changing."

There is a simpler native option for the last unit request, using a fixed buffer at each store, covered below. If you want the exact rule rather than an approximation, that means building a small inventory management app that moves stock into a held state and back out again. That is a real application:

- It has to know which location is holding the remaining unit
- It has to handle everything else that changes inventory: sales, returns, transfers, imports, manual edits
- It needs an audit trail, because it is changing your real inventory
- It needs its own hosting, at a monthly cost

We would scope that as a separate project.

**The alternative is to do it more simply, in pieces.** We can get most of the same customer experience with lighter custom work. The trade off is that the website says one thing and Shopify says another. That means:

- **The feed risk.** Your feed will say in stock while the page says sold out. Google and Meta compare the two and can flag the product or drop it from the feed. That is lost visibility on a live product, not just a data mismatch
- Back in stock emails will not send, because Klaviyo keys off Shopify availability and does not think the item went out of stock
- Any third party app that relies on Shopify availability may still treat the item as in stock
- We are stitching several pieces together to do what native availability does on its own

**Two ways to decide:**

- If feed accuracy is not a major concern for the brand, this is the simpler route and we would recommend it
- If it is a concern, we can still start with the smallest piece, launch it, and watch whether it causes problems before going further

**Some feeds can be corrected, others cannot.** Google has ways to fix a mismatch. Meta flags it and we have not found a fix beyond sending the real figure. Others vary.

We would scope this once we know which feeds you actually rely on. We only need to solve for those.


---

### Quick fixes

| Fix | What it does | Notes |
| :---- | :---- | :---- |
| Swap the two routing rules so CLS goes first (Option C) | Stops CLS being skipped | **Needs approval**, risk of increasing split shipments for domestic orders |
| Switch off the ELIE TAHARI location | Tidy-up | Empty, no impact, safe |
| Matrixify: "continue selling when out of stock" to false | Stops overselling | Agreed in July, not yet done |

**On the swap.** Today "Minimize split fulfillments" runs before "Use ranked locations," which is why CLS gets skipped. Swapping them makes CLS win whenever it has stock.

The cost: more orders ship in two packages, and the customer still pays a single shipping charge, so Tahari absorbs the second package. The trade is extra shipping spend against fewer cancellations. Questions 2 to 4 cover this.

**On Matrixify.** Until "continue selling when out of stock" is switched off, everything else can be oversold straight through it.

---

### International orders from CLS only

**Recommendation: Option C \- if risk of increased split shipments for domestic orders is acceptable. If not Option C try Option B.**

Option A and Option B differ in who carries the downside. Option A's costs fall on US shoppers. Option B's fall only on international shoppers. For 0.3% of orders, we do not think it is worth putting the other 99.4% at risk.

|  | A. Split locations into two sets | B. Rule built into checkout |
| :---- | :---- | :---- |
| **Recommendation** | Not recommended | **Recommended** |
| Development needed | No | Yes |
| Effect on US shipping costs | Split US orders charged one larger combined rate | None |
| Risk to app-calculated US rates | **Unknown, needs checking** | None |
| Ongoing upkeep | US rates maintained in two places | None |
| Customer finds out | Adding to bag | Partway through checkout |
| Shows out of stock to international shoppers | Yes | No |
| Triggers back-in-stock notifications | Yes | No |
| Reversible | Yes | Yes |
| Status | Tested and working | Proof of concept built and tested in the dev store |

#### 

#### **Option A: split the locations into two sets**

No development. CLS goes in one set that ships to the US and internationally. The three stores go in a second set that ships to the US only. Because international shipping exists only in CLS's set, only CLS can fulfill an international order.

It works, and it gives international shoppers a better experience: they find out when adding to the bag rather than at checkout, and the item shows as out of stock for them.

**Why we are not recommending it.** Every downside lands on US customers:

- **Split orders cost more.** Once locations are in two sets, the two shipping charges are added together. A $200 order that splits goes from roughly $15 to $30. The customer sees one higher price with no explanation.  
- **US rates have to be maintained in two places** and match exactly, forever. If they drift, customers are charged differently depending on where stock happens to sit.  
- **Unknown effect on app-calculated rates.** Today all orders quote from New Jersey. Splitting the sets means any rate app is also asked to quote from Florida, California and Maryland. If it is not set up for those, some **US** orders could get no shipping options at all.

The free shipping over $350 rule is safe. We tested it.

#### **Option B: build a rule into checkout *(recommended)***

A small piece of custom logic runs inside Shopify's checkout. If the order is going outside the US, only the CLS location can fulfill it. US orders are untouched.

**What you give up.** Shopify does not know the stores are unavailable to that shopper, so for international customers this option does not give:

- Out of stock status on the product page. The item looks available until checkout.  
- Back-in-stock notifications, which are triggered by Shopify's own stock status.  
- The message in the bag when someone adds more than can be sent to them.

**Could we close those gaps?** Yes, with a Flow, custom front-end logic, a second checkout rule and theme work. We do not recommend it:

- It still would not restore back-in-stock notifications.  
- The site would show different availability than Shopify actually holds, which puts it at odds with Google Shopping, Meta, the Shop channel, collection sorting and filtering, and any third party app relying on Shopify availability.  
- Everything added is another thing to keep in sync.

For 85 orders a year, that is a lot of machinery and a lot of new ways to break.

**One thing to check with legal.** Because the customer only finds out partway through checkout, EU consumer rules may require you to state up front that delivery restrictions apply. This only matters if you are considered to be selling into the EU, so the first question is where those 85 orders actually come from.

The fix is wording, not development:

> **International shipping** International orders are shipped from our New Jersey warehouse. Items stocked only in our retail stores are not available for delivery outside the United States.

Shorter, for a product page:

> Ships internationally from our New Jersey warehouse. Some items are not available for international delivery.

*(Not legal advice. Flagging it so counsel can decide whether it is needed and approve the wording.)*

#### **Option B.2: Option B plus front end feedback**

Option B's main weakness is that international shoppers only find out at checkout. This closes that gap. The website would show the item as unavailable to an international shopper when the warehouse does not have it, before they add it to the bag.

#### Breakdown

All figures are on top of Option B.

| Piece | What it does | Low | High |  |
| :---- | :---- | :---- | :---- | :---- |
| Flow to write warehouse count to a metafield | Makes the warehouse quantity readable by the website and the cart rule | 1 | 1 | Required |
| Show unavailable to international shoppers | Development and testing on the product page and product cards, and across markets | 4 | 6 | Required |
| Cart & Checkout Validation Function | Powers the cart error message. Checkout is already blocked by Option B, so this is for feedback rather than blocking | 4 | 6 | Optional |
| Add to cart error feedback | Explains why they cannot add it | 3 | 4 | Optional |

**Display only: 5 to 7 hrs.**
**Everything: 12 to 17 hrs.**

**What it takes.** The website cannot see how much stock sits at the warehouse specifically, so we write that figure to each product behind the scenes and the site reads it, alongside knowing which country the shopper is in.

**What it gets you.** Roughly the same customer experience as Option A, without touching your shipping rates or putting US orders at risk.

**Same trade off as the last unit work.** The website would show unavailable while Shopify still counts the item as in stock, so the feed mismatch and back in stock issues described above apply here too.

**Worth weighing against the browsing numbers.** International is around 11% of sessions but 0.3% of orders. If pre-checkout feedback matters, this is what delivers it.

#### **Option C: Update routing rule order**

No development work.

With ranking first, Shopify would always attempt CLS before any other location. If CLS has even one item on the order, it gets assigned there first. Then Rule 2 (minimize splits) would try to consolidate remaining items, but since CLS is already locked in as the primary, the system would look to fulfill remaining items from CLS if possible, and only split to another location if CLS is completely out on a specific SKU.

Swapping would enforce CLS priority more strictly, but at the cost of more split shipments. For international orders specifically, this is likely the right trade-off — a split from CLS is better than a single shipment from a retail store. For domestic US orders, it could increase splits unnecessarily.

**Trade-offs**

|  | Current (Minimize Splits → Rank) | Proposed (Rank → Minimize Splits) |
| :---- | ----- | ----- |
| Split frequency | Lower. Shopify finds the best single-location option first | Higher. CLS gets priority even if it means splitting |
| CLS usage | Only when CLS is the best no-split option | Always, whenever CLS has any stock |
| Retail location usage | Higher when retail can fulfill complete orders | Lower.  Retail only used when CLS is fully out |
| Customer experience | Fewer shipments per order | Potentially more split shipments |
| International routing | Risk of retail fulfilling if retail has full stock | CLS always gets first shot |

#### **Option D: Separate Shipping Profile (not recommended)**

Can’t have the same product in 2 different shipping profiles. This would require creating duplicate products and inventory allocation/syncing of the duplicate products.

---

### Last unit sold out

When the stores have only 1 left between them, make that variant unavailable. The store keeps its last piece as a buffer.

#### Breakdown

| Piece | What it does | Low | High |  |
| :---- | :---- | :---- | :---- | :---- |
| Show unavailable on the website | The variant shows as unavailable and cannot be added to the bag. Development and testing needed on both the product page and product cards | 4 | 6 | Required |
| Flow to write the count to a metafield | Makes the quantity readable by the checkout rule | 1 | 1 | Required with the function |
| Cart & Checkout Validation Function | Blocks checkout, catching anyone who already had the page open or bookmarked. Also powers the cart error feedback below | 4 | 6 | Optional |
| Add to cart error feedback | Explains why they cannot add more | 3 | 4 | Optional |

**Display only: 4 to 6 hrs.**
**Display plus checkout block: 9 to 13 hrs.**
**Everything: 12 to 17 hrs.**

Display only catches almost everyone. Adding the checkout block later rather than now costs about an hour extra, so starting small and testing whether it fixes the cancellations is reasonable.

#### What to know before choosing

The website will say sold out while Shopify still counts the item as in stock. That means:

- **Back in stock emails will not send.** Klaviyo triggers off Shopify's stock status, and as far as Shopify is concerned the item never went out of stock. There is no practical workaround: Klaviyo tracks these signups per size and colour, so replicating it manually would mean a separate list for every variant in the catalogue.
- **Because of that, we would show these as "unavailable" rather than "sold out."** Sold out suggests it will come back and invites a notify-me signup we cannot deliver on.
- **Google Shopping, Meta and any third party app that relies on Shopify availability read Shopify's numbers,** so they may still show the item as available.

Our recommendation is to launch it, watch for problems, and reassess. If it does cause issues, there is a fuller version below.

#### One decision for you

Should the rule protect the warehouse's last unit too, or only the stores'?

- **Only the stores** is what you originally described, and keeps warehouse sales flowing. It costs nothing extra if we are doing option 2\.  
- **Everything** is simpler but blocks the sale of the warehouse's last unit, which is the one we can most reliably ship.

#### A simpler native option: keep one back at every store

Rather than a rule that watches inventory, use Shopify's own safety stock setting to permanently hold 1 unit at each location. Every location always keeps one piece off the website.

**Estimate: 3 to 6 hrs.** It is a bulk import rather than a build. Matrixify supports a Safety Stock column per location, so the whole catalogue can be set in one file.

Applied to all four locations, that holds 4 pieces of each variant off the website. It can be applied to the three stores only if you would rather the warehouse keep selling to its last unit.

**What you get.** Everything native, so all the benefits above apply:

- Sold out shows correctly and checkout is blocked
- Back in stock emails work
- Feeds, reporting and any third party apps relying on Shopify availability all stay accurate
- No app, no hosting cost, nothing running in the background

**How it differs from what you asked for.** You asked to hold the last unit back once the three stores have 1 between them. This holds one back at every location, all the time, so 3 or 4 pieces of each variant sit off the website instead of 1.

That is more stock held back. But it is arguably better protection: your concern was counting by hand and getting it wrong, and a permanent buffer of 1 absorbs a counting error at every location rather than only catching the very last piece.

**Things to weigh**

- How much stock this holds back overall, which is 3 or 4 for every variant you carry
- New products would need the same setting applied, so we would want a repeatable import as part of the normal process
- Worth testing on a handful of variants first, since bulk imports can land stock in a generic "unavailable" state rather than labelled as safety stock

#### Also explored, not recommended

**Hiding or unpublishing the product (the two Flows drafted in July).** One Flow unpublished the product from the Online Store when store stock hit 1, a second republished it when stock returned. A later variation set the product to Unlisted and hid the Add to Cart button instead.

Not recommended because:

- **Neither version reliably stops the sale.** Unpublishing leaves a window where someone already holding the item in their cart can still check out. The Unlisted variation is weaker still: the page stays live and the item remains purchasable through a direct cart link, so hiding the Add to Cart button is only a soft block.
- **Publishing is a product level setting**, so one variant running low would likely pull the whole product, every variant, off the website.
- **It removes the product from your feeds and search.** Unpublished products return a 404, and a product selling and restocking around the threshold flips repeatedly. That churn affects Google and Meta listings and search rankings.

**A third party inventory buffer app.** Some apps offer stock buffers. Worth revisiting only if the fuller version below is approved, since it solves the same problem with the same trade offs but less control.

#### The fuller version, if the above causes problems

**Estimate: 66 to 108 hrs, plus a monthly hosting cost.**

Shopify can genuinely hold a unit back so it is in the store but not for sale. Done that way, nothing is pretended: back in stock emails work, and Google, Meta and any third party apps relying on Shopify availability all stay correct. Store staff can still sell the unit in person.

The catch is that Shopify has no setting for "hold back the last one," so this becomes a small application that changes your real inventory as stock moves. That needs careful handling, activity logging so you can see exactly what it did, and ongoing hosting.

We would only recommend this if the simpler version proves a problem in practice.

---

### Not recommended: route to the store with the most stock

Shopify has kept this capability in beta since 2023\. No release date, and it needs their approval to use.

It also does not fix the cause you described, which is stores counting stock by hand and getting it wrong. Routing to the store with the most stock does not help if the number itself is unreliable. The last-unit rule addresses that directly.

There may be a free alternative: reordering the routing rules might give you this natively. We are testing it.

---

## Internal, not for client

### Running the conversation

**Ask section 1 first.**

**Why section 1 is a read-back:** she has already named these four, twice.

- Email, Jul 9: *"If CLS is out of stock, the order should then route to the store with the highest available inventory (Santa Monica, Pembroke Gardens, or National Harbor)."*  
- Call, 14:21: *"In the fulfillment locations, it just says CLS, National Harbor, Pembroke, and Santa Monica."*  
- She excluded ELIE TAHARI and Studio Milburn (Jul 10, 11:32 AM) and all D4S (*"we should never consider D4S, this is for donations,"* Jul 10, 3:46 PM).

Admin does not fully match: ELIE TAHARI's fulfillment toggle is still on.

**Answers that change what we build:**

- **Section 2 read-back.** The rule is unambiguous in both sources (quotes under Last unit implementation). Do not re-open it as a question. The PRD contradicts it, so the point of the read-back is getting the correct version in writing.  
- **Q2/Q3.** Q2 sets the principle, Q3 prices it. Answering (a) to Q2 maximises splits and shipping cost. She should own both.  
- **Q7.** Lower priority than previously noted. Fulfillment constraints **do** cover draft orders and manually created admin orders, so Option B is not bypassed there. Still worth knowing operationally.

**Do not present ELIE TAHARI as a cause of cancellations.** It is empty and not in the shipping profile. Tidy-up only.

**Rule-order finding is a hypothesis,** not tested on their store. Say "we think we've found." Provable with one test order.

### Verified in dev store

- **Option A works.** International shopper gets an add-to-bag availability error when international stock is short. US and international addresses each return the correct set's rates.  
- **Zero stock tested.** Dropping the international location to 0 moved fulfillment and the rate to the domestic-only set. Availability is computed from the eligible set's stock and updates live.  
- **Split shipping off tested,** matching the live setting. Rates combine into a single larger charge with no breakdown shown.  
- **Free-shipping threshold tested, no risk.** A $400 order split $200/$200 still shipped free. The threshold is measured against the whole order total, not each set's share. Flat-rate doubling still applies below the threshold.  
- **Customer-facing wording captured** (screenshots on file): cart cap message, checkout quantity-update modal, "This product is not available for delivery to your location" with a *remove unavailable item* link.  
- **Option B behaves the same at checkout.** Tested with the warehouse holding 1 and 4 requested: same native "Quantity update" modal as Option A, same `/stock-problems` path. The constraint feeds into native availability handling rather than bypassing it. Untested: warehouse at zero.  
- **CLS is a regular location and the store Default,** not a fulfillment service. 3PL concerns are closed: manual location changes work, and no app can silently alter the shipping profile through it. Note the default location absorbs oversells, so negative counts at CLS are not necessarily a Flow bug.

### Still open

- **App or carrier-calculated domestic rates.** Only matters if Option A is revived. Check Settings \> Shipping and delivery on the live store. The dev store cannot answer this.  
- Whether the PDP itself shows sold out under Option A, or the block only appears at add-to-bag.  
- Under Option B: "Shipping not available" appeared alongside the quantity-reduction modal in one test. Possibly a pre-recalculation state or an unrelated form error. Recheck.

### Option B implementation

Fulfillment Constraints Function (GA), `cart.fulfillment-constraints.generate.run`. Function only, no front end. Reads delivery country plus CLS location, returns `DeliverableLinesMustFulfillFromAdd` locking every line to CLS when the country is not domestic. Registered via `fulfillmentConstraintRuleCreate`, scope `write_fulfillment_constraint_rules`. Appears in admin under Routing constraints.

Verified schema facts (2026-07): country at `cart.deliveryGroups[].deliveryAddress.countryCode`; `locations(names:)` is on the root Input type, not under `cart`; operation is `deliverableLinesMustFulfillFromAdd { deliverableLineIds (optional), locationIds (required) }`; the older `mustFulfillFrom` is deprecated.

**Country is null until the customer enters an address.** This is why the rule cannot fire before checkout. Structural, not an implementation limit.

**Surface coverage** (from the API docs compatibility table). Corrects an earlier note that said manual and draft orders bypass it. They do not.

- **Supported:** Draft Order (Admin), Draft Order (Checkout), Shopify Admin
- **Partial:** Order Edit (Admin), "available only for new items". POS, "available only when shipping to a customer". Storefront, "available only with Buy with Prime"
- **Unsupported:** Order Edit (Checkout), Pre-order and Try Before You Buy

Remaining gaps are order editing, not order creation.

**For production, match the location by handle or GID, not name.** The POC matches an exact string, so a rename or stray whitespace silently disables the constraint and fails open.

**No `enabled` field on a constraint rule.** Deleting it is the only off-switch. Save the rule ID on creation.

**TikTok already has 3 fulfillment constraints registered.** Ours could collide and block checkout. Investigate before going live.

POC built and passing in `BAUBLEBAR_CE_EXT/extensions/fc-international-orders`, 5/5 tests. Registration helper at `scripts/fulfillment-constraint-rule.ts`.

**Tech debt:** that repo has Shopify CLI 3.93.1 locally, 4.6.1 globally, disagreeing on the wasm path. A fallback sits in `tests/default.test.js`; upgrading to 4.x makes it dead code.

### Last unit implementation

**The rule is unambiguous in both sources.** Do not treat it as open.

- Email, Jul 9: *"if the only inventory remaining is in a store and there's 'just one unit left of a SKU/variant' **(across all stores)** that unit is no longer available to the eCommerce channel"*  
- Call, 16:00: *"if there's only one unit **across all three stores**... it's just considered sold out. Like, that size."*

So: **per variant** (confirmed by PK, and supported by her *"Like, that size"*), when CLS available is 0 **and** the sum across National Harbor, Santa Monica and Pembroke is 1, make it unsellable online. The email's "if the only inventory remaining is in a store" clause means CLS stock keeps it on sale, so that does not need asking either.

The PRD contradicts this ("1 unit in any warehouse"). Get the correct version in writing before building.

#### Two tracks, both on the table

|  | Track 1: metafield \+ validation | Track 2: safety stock app |
| :---- | :---- | :---- |
| Site and Shopify agree | No | Yes |
| Back-in-stock fires | No | Yes |
| Feeds, Nosto, sorting correct | No | Yes |
| POS can still sell it | Yes | Yes (unverified, see below) |
| Hosting cost | None | Monthly |
| Mutates real inventory | No | Yes |
| Estimate | 8 to 24 hrs | 66 to 108 hrs |

Track 2 is technically correct. Track 1 is proportionate. Given nobody has counted the cancellations this is meant to prevent, start with Track 1 and monitor.

#### Track 1 breakdown

**Path A, display only (8 to 12 hrs).** Liquid reads `variant.inventory_quantity` directly. No Flow, no metafield, no function.

| Piece | Low | High |
| :---- | :---- | :---- |
| Theme sold out display | 4 | 5 |
| QA | 2 | 3 |
| Discovery, coordination, writeup | 2 | 4 |

**Path B, display plus checkout block (16 to 24 hrs).** Flow writes a metafield; **both** the theme and the validation function read it, so there is one source of truth and no window where the PDP and checkout disagree during Flow latency.

| Piece | Low | High |  |
| :---- | :---- | :---- | :---- |
| Flow: compute and write metafield | 3 | 5 | Required |
| Validation function | 4 | 6 | Required |
| Theme display, reading metafield | 4 | 5 | Required |
| QA | 3 | 4 | Required |
| Discovery, coordination, writeup | 2 | 4 | Required |
| Cart error message wiring | 3 | 5 | Optional |
| Back-in-stock list routing | 8 | 12 | Optional |

A first then B later: add 1 to 2 hrs to swap the theme's data source.

**Excluding CLS is free in Path B** (Flow computes a sum either way) and not free in Path A (Liquid only gives the total). If she wants store-only protection, that argues for going straight to B.

**Verify before quoting Path A:** that `variant.inventory_quantity` reflects available across the fulfilling locations and is not altered by market context. Not confirmed.

#### Track 2 breakdown

| Piece | Low | High |  |
| :---- | :---- | :---- | :---- |
| App scaffold, auth, hosting setup | 8 | 12 | Required |
| Webhook handlers, all inventory events | 10 | 16 | Required |
| Hold and release logic | 12 | 20 | Required |
| State tracking of our own moves | 8 | 12 | Required |
| Activity logging and audit trail | 6 | 10 | Required |
| Reconciliation after POS sells a held unit | 6 | 10 | Required |
| Testing including bulk import behaviour | 12 | 20 | Required |
| Monitoring and alerting | 4 | 8 | Required |
| Admin UI to view the log | 8 | 16 | Optional |

Nothing here is really optional once an app is moving real inventory.

**Open:** whether Admin API calls can run from a Hydrogen/Oxygen-hosted app to avoid a separate hosting line. Mechanics are probably fine server to server, but suitability for a webhook-driven background workload is unverified.

#### Mechanism

`inventoryMoveQuantities` moves between `available` and `reserved` / `damaged` / `safety_stock` / `quality_control`. Per location, per inventory item. Moving to safety stock reduces Available and leaves On hand unchanged, since `on_hand` is the sum of available, committed, reserved, damaged, safety_stock and quality_control.

It is the **only** mutation that applies for safety stock. `inventorySetQuantities` sets on_hand, `inventoryAdjustQuantities` increments a single state. Matrixify's Safety Stock column has nothing else it could be calling, so a Matrixify import should behave identically: set safety stock, leave Available alone, and Available falls on its own.

Required args: `inventoryItemId`, `from.name` / `from.locationId`, `to.name` / `to.locationId`, `quantity`, `reason`.

`referenceDocumentUri` is optional but recommended, and is the likeliest fix for the "Managed by Apps" display issue. **`ledgerDocumentUri` is not needed for safety stock moves**, correcting an earlier note here; it is only required for non-available states in `from`/`to`, and available is one side of this move.

`from.changeFromQuantity` and `to.changeFromQuantity` give concurrency control, so a move fails rather than corrupting when the quantity shifts underneath. Worth using in anything automated.

**No native trigger.** No threshold feature, no cross-location rule, and Flow has no built-in action for it. Path is a Flow inventory trigger plus a **Send Admin API request** action calling `inventoryMoveQuantities`.

**Idempotency key is required** as of API 2026-04 (`@idempotent` directive).

#### POS behaviour, and what is actually verified

**Verified**, [Shopify Help Center](https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock): "'Continue selling when out of stock' doesn't apply to orders placed from Shopify POS." Staff "can continue selling products when available inventory reaches zero and below," with a warning.

That page covers zero available generally rather than safety stock by name, but the reasoning holds either way. If POS checks `available`, safety stock takes it to zero and POS sells per the quote. If POS checks `on_hand`, safety stock leaves that untouched and it sells too. Treat as settled: **safety stock does not block POS.**

The earlier Flows document claims the opposite. It is wrong.

**Unknown, and worth testing:** what happens to the numbers after a POS sale of a held unit. With safety stock 1 and available 0, the sale has to come off somewhere. Either available goes to -1 and safety stock stays at 1, which is now phantom stock that does not physically exist, or Shopify decrements the safety stock.

If it is the first, the buffer drifts out of sync with reality and someone has to reconcile it periodically. This applies to the buffer option as much as to the full app, so it is worth answering before either is quoted.

#### Open risks

- **Reversal needs state tracking.** When stores restock, the unit must move back out of safety stock. Nothing natively distinguishes units we moved from safety stock the team set deliberately. Needs tracking somewhere.  
- **App-attributed bucket.** Reported Jan 2025, no fix since: when an app performs the move, admin shows the quantity under "Managed by Apps" rather than Safety stock. Functionally correct, cosmetically confusing for merchandising. One thread suggests passing `referenceDocumentUri` and `ledgerDocumentUris` makes it display correctly. Test this.  
- **POS sale of a protected unit** pushes Available negative while safety stock still shows a unit that no longer exists. Needs a reconciliation plan.

#### Unrelated but imminent

Stocky is retired after 31 August 2026\. If Tahari uses it, that is a separate problem on a short clock.

### Market catalogue variant publishing: considered, rejected

Shipped 7 May 2026. `ProductVariant` became `Publishable` in API 2026-07, so a variant can be published or unpublished per sales channel or per market catalogue. The idea was to unpublish a variant from the international catalogue when CLS hits zero, giving a native result with no feed mismatch.

Rejected for five reasons:

1. **It is binary, and the problem is partly quantitative.** It can only say the size exists for international shoppers or does not. If CLS has 2 and the shopper wants 5, the variant is still published and they can add 5. The storefront quantity is the total across all locations, so native inventory does not close this either. Only the checkout constraint catches it.
2. **404, confirmed by test.** Excluding all variants of a product returns a 404, not the homepage redirect the docs implied. Same SEO churn objection that applied to the original Flow approach.
3. **It hides rather than marking sold out.** The size just disappears from the selector, with no explanation and nothing to sign up to for back in stock.
4. **37 markets, 36 of them non-US.** Any automation would have to write across all of them. That is a lot of surface area for something operating on live catalogue state.
5. **Flow cannot do it.** Only a product-level "Unpublish product" action exists. Variant publishing is not exposed to Flow triggers or actions, so it needs a Send Admin API request calling `publishableUnpublish` against the variant GID.

Also worth knowing: variant publishing is not available for POS, and variants cannot be scheduled.

For the last unit request it fits better, since that rule is about total quantity and native inventory covers it. But it still loses to the safety stock buffer, which shows a proper sold out state, keeps back in stock working, and is a Matrixify import rather than a build.

### Option A gotchas, if revived

- Removing the last location from a set deletes that set's zones and rates. Screenshot everything first.  
- Do not create a separate "International" profile. A product can only be in one profile at a time, so moving products into it removes them from General, and if that profile lacks domestic zones, domestic customers get no rates. Use sets inside the existing General profile.  
- New locations land in "Not fulfilling from" on every profile and will not ship until moved.  
- Both sets need identical rate names and prices. Names are customer-visible.  
- Needs "Products" and "Manage settings" staff permissions.

### Highest-inventory routing

Order Routing Location Rule Function, `cart.fulfillment-groups.location-rankings.generate.run`. Plus-only, by request, in developer preview since Feb 2023\. Also needs per-location inventory mirrored into metafields, since the input exposes none.

On the free alternative: Shopify's doc says minimize-split "defaults to prioritizing the location with the highest available inventory," but only "when no other rules for prioritization are specified." Unclear whether that holds when it sits second in a chain. Test before offering it.  
