#  

## Background:

-  Add-on products that are Seconds products don't get the **Final Sale** line-item property when they're added to cart as a PDP bundle add-on. The "All sales of Seconds products are final" note is missing for those items in the cart, checkout and order.

-  When the Swym wishlist app embed is turned off, the theme still renders Swym's placeholders. This leaves a blank spot in the header where the wishlist icon used to be, and extra space next to Add to Cart on the PDP.

 

## Necessary Info (Design/Documentation):

-  **Seconds products:** any product with a tag starting with `seconds` (e.g. `Seconds`, `seconds25`, `seconds26`). These products get a visible `Final Sale` line-item property with the value "All sales of Seconds products are final".

-  **Add-ons:** the PDP `bundle_upsell` block lists add-on variants from a product metafield, each with a checkbox. All three Seconds templates (`product.seconds-product`, `product.seconds-crosspeak-alt`, `product.seconds-dyneema-icons`) and most standard product templates include this block.

-  **`_intuitive_cid`****:** a hidden `properties[_intuitive_cid]` input carries the signed-in customer's ID for **Intuitive Shipping**.

-  **Swym:** the app is "Wishlist Plus" (Swym), loaded through a Shopify app embed. Liquid has no way to check whether an app embed is turned on, so this ticket adds a manual theme setting to control the theme's Swym markup.

-  The three existing "Swym Wishlist …" groups in `config/settings_schema.json` come from Swym's onboarding and are managed from the Swym admin app. They don't control the theme's own Swym markup.

-  No new design is needed. With Swym off, the header and PDP should look the same as they would if the wishlist had never been there.

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3327657163/Screenshot%202026-10-19%20at%202.12.40%E2%80%AFPM.png)

 

## Constraints / Scope:

-  **Swym cleanup is no longer in scope.** The client brought the Wishlist (Swym) app back, so the Swym setting and cleanup (AC 11–15 and the Swym toggle Dev Notes) won't be built in this ticket.

-  **Add-on fix:** changes only what's sent when one or more add-ons are checked. Adding to cart without an add-on already sends every form input, and that path doesn't change.

-  **Swym:** the new setting doesn't turn Swym's app embed on or off. When Swym is turned on or off in the app embeds, the merchant has to switch this setting to match.

-  **Assumption:** the setting defaults to **on**, so deploying this changes nothing until someone turns it off.

-  **Out of scope:**

   -  `templates/product.gag-product.json` (April Fools template with Swym markup hard-coded in a Custom Liquid block).

   -  Swym's own app-managed settings groups.

   -  Other ways to add to cart: shop-the-look and collection-card quick-add. They already send `Final Sale` but not `_intuitive_cid`.

 

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  When a Seconds add-on is checked on a PDP and added to cart, the add-on's line has the `Final Sale` property ("All sales of Seconds products are final") in the cart, checkout and order. |   |  ✅ |   |
|  2 |  When a Seconds main product is added with a non-Seconds add-on, only the main product's line has the `Final Sale` property. |   |  ✅ |   |
|  3 |  When both the main product and the add-on are Seconds, both lines have `Final Sale`. When neither is Seconds, no line has it. |   |  ✅ |   |
|  4 |  Each add-on line has the same line-item properties as that product gets when added to cart alone from its own PDP: `Final Sale` if it's a Seconds product, and `_intuitive_cid` set to the customer's ID if they're signed in. |  Private line-item properties (names starting with `_`, e.g. `_intuitive_cid`) don't display to the customer, same as today. |  ✅ |   |
|  5 |  When add-ons are checked, main-product inputs (custom line-item property blocks, gift card recipient fields) appear on the main product's line only. |   |  ✅ |   |
|  6 |  Adding a product with add-ons on the PDP behaves the same as on the live site, for Seconds and non-Seconds products. The only difference is that Seconds add-ons now get the `Final Sale` property. |   |  ✅ |   |
|  7 |  Adding to cart with no add-on checked produces the same line items and properties as before this change. |   |  ✅ |   |
|  8 |  Adding a Seconds product from a blog article's **Shop the Look** drawer (`sections/rs-shop-products-drawer.liquid`, via the product's quick-buy drawer) gives its cart line the `Final Sale` property, and `_intuitive_cid` when signed in. |   |  ✅ |  SKIP |
|  9 |  Adding a Seconds product from the cart drawer's "You may also like" recommendations (via the product's Quick view) gives its cart line the `Final Sale` property. |   |  ✅ |  SKIP |
|  10 |  On the E-Gift Card product page (`/products/e-gift-card`), checking "I want to send this as a gift", filling out all the recipient fields and adding to cart works the same as on the live site. |   |  ✅ |   |
|  11<br>🚧 [NOT IN SCOPE] |  Theme settings has a new **Enable Swym Wishlist** checkbox, which defaults to on. |   |   |   |
|  12<br>🚧 [NOT IN SCOPE] |  With the setting off, the header has no wishlist link or counter and no empty gap between the header icons, on desktop and mobile. |   |   |   |
|  13<br>🚧 [NOT IN SCOPE] |  With the setting off, the PDP has no empty wishlist slot or extra spacing beside Add to Cart, and Add to Cart fills the row. |   |   |   |
|  14<br>🚧 [NOT IN SCOPE] |  With the setting off, the page source doesn't include the `swym-custom` header count script. |   |   |   |
|  15<br>🚧 [NOT IN SCOPE] |  With the setting on and Swym's app embed enabled, the header wishlist icon, the wishlist count and the PDP wishlist button look and work the same as before this change. |   |   |   |

 

## Dev Notes:

-  File paths, line numbers and code below reflect a review at authoring time. Confirm they still hold before implementing.

 

### Final Sale / add-on line-item properties

 **Root cause:** `ProductForm._onSubmit` in `assets/theme.js` (~line 5461) has two ways of adding to cart:

 

-  **No add-ons** (~line 5492): posts `new FormData(this)`, so every form input is sent.

-  **One or more add-ons** (~line 5473): builds an `items[]` JSON body. The main item gets only `id` and `quantity`, and each add-on gets only `id` and `quantity: 1`. No `properties` and no `sections` are sent.

 

```js
// current — assets/theme.js ~5473
items.push({
  id: Number(this?.id?.value),
  quantity: this?.quantity?.value ? this?.quantity?.value : 1
});
this?.upsellProducts?.forEach((upsellProductId) => {
  items.push({ id: Number(upsellProductId), quantity: 1 });
});

```

 

-  The `items[]` format is required: one `/cart/add` request can't combine the form's single `id` field with extra lines.

-  The add-on checkboxes (`snippets/product-form.liquid` ~1132) sit in the `bundle_upsell` block, outside the `<form>`, which closes at ~1078. They have no `form=` attribute and no hidden inputs, so the add-on lines have no properties to send.

-  The Final Sale input comes from `snippets/hmg-seconds-final-sale-property.liquid`, which is rendered only inside the main product form (~line 921).

 

 **Possible Approach:** give every item its own form and build each item's JSON from that form's `FormData`. Leave the no-add-on path (~5492) as it is.

 

1.  **One snippet for line-item properties.** Create a snippet (e.g. `snippets/hmg-line-item-properties.liquid`) that renders a product's theme-generated hidden property inputs: `_intuitive_cid` when signed in (currently inline at ~919) and the Final Sale snippet. The main product form renders it in place of those two inputs, and each add-on form renders it with the add-on's product. Update the "Render inside a {% form 'product' %}" comment in `hmg-seconds-final-sale-property.liquid`. Quick-add and shop-the-look keep rendering that snippet directly.

2.  **One form per add-on.** In the `bundle_upsell` block (~1128), give each add-on its own `<form>` holding a hidden `id` (the variant ID), a quantity of 1 and the snippet from step 1. The block sits outside the main product form, so these forms aren't nested in it. Check that nothing else wraps that area in a `<form>`. The add-on checkbox still only controls whether that add-on is included.

3.  **One FormData-to-JSON conversion for every item.** For the main form and each checked add-on's form, read `new FormData(form)` and convert it to an `items[]` entry. Bracketed names (e.g. `properties[Final Sale]`) become nested objects, and everything else (`id`, `quantity`) is copied as is. Don't special-case `properties`: any input added to an item's form should reach that item's line. Leave out fields the cart doesn't need: `option1` to `option3` (already deleted on the no-add-on path), plus any extras Shopify's `form` tag adds (e.g. `form_type`, `utf8`).

4.  **`UpsellProducts`**** (~6938)** currently passes only checked variant IDs to `ProductForm`. Change it to pass the checked add-ons' forms (or their converted items).

5.  **Request.** Keep the single JSON `/cart/add.js` request so a failed add-on still fails the whole add, the same as today. Add `sections: "mini-cart"`. The current add-on path doesn't send it, so `responseJson.sections` comes back `undefined` and is handed to `cart:refresh`. Check the drawer renders correctly with real sections data (AC 6).

 

 **Why ****`FormData`****:** it already applies the browser's rules for which inputs to send. It skips disabled inputs (e.g. `__shopify_offset`) and unchecked checkboxes and radios, and includes inputs linked with `form="{{ product_form_id }}"` (custom property blocks, ~630–665). Reading inputs from a plain wrapper instead would mean reimplementing those rules.

 

 **Verify:** that `/cart/add.js` accepts nested `properties` on each JSON `items[]` entry, per current Shopify Ajax Cart API docs.

 

 **Other notes:**

 

-  `UpsellProductsTotalPrice` (~6962) reads prices separately and needs no changes.

-  **Test data:** to find which Seconds products are configured as add-ons, check the metafield set in the `bundle_upsell` block's `namespace` and `key` settings on the Seconds templates.

 

### Swym toggle

🚧 [NOT IN SCOPE]

 **Setting (****`config/settings_schema.json`****):** add a standalone settings group (e.g. "Wishlist") with a checkbox `swym_wishlist_enabled`, labeled "Enable Swym Wishlist" and defaulting to on. Follow the pattern of the "Customer accounts" group (~line 599). The info text should say to turn it off when Swym's app embed is disabled, and that it doesn't turn the app embed on or off.

 

 **Places to gate with ****`{%- if settings.swym_wishlist_enabled -%}`****:**

 

-  `sections/header.liquid` ~291–294: the `<a class="swym-wishlist">` link and `<span class="swym-hidden-counter">`.

-  `sections/header.liquid` ~394: `{% render 'swym-custom' %}`.

-  `snippets/product-form.liquid` ~1017–1021 and the matching closing `</div>`s ~1040–1060: the `.atc-swym-wrapper` and `.swym-wishlist-button-bar`. The opening wrapper is inside one `if` and its closing `</div>` is inside another (`template contains 'product'` and not the quick-buy suffixes). Add the Swym condition to **both** so the markup stays balanced.

-  `sections/featured-product.liquid` ~132–137: scoped CSS targeting `.atc-swym-wrapper`. Check whether this section's layout still holds when the wrapper isn't rendered.

 

 **CSS (****`assets/rs-custom.css`**** ~920–990):** these rules only match Swym markup, so they have no effect once the markup is gone and can stay. Check that removing `.atc-swym-wrapper` (`display: flex`) doesn't change Add to Cart's width or alignment with the setting off.

 

 **Full sweep:** search the whole theme (`grep -rni swym layout sections snippets blocks templates assets`). At authoring time, the only other match was the out-of-scope `templates/product.gag-product.json`.

 

## Implementation Notes:

-  Branch `feature/HYPER-ISSUE-13329812332-final-sale`, fix commit `378d28b`.
-  Each add-on has its own hidden form that renders the same line-item property snippet as the main form (`snippets/hmg-line-item-properties.liquid`). `assets/theme.js` builds every item from its form's `FormData`. The no-add-on path is unchanged.
-  Also fixed a Liquid error on add-ons with no image.
-  Details, test results and screenshots: [vault notes](https://github.com/roswell-studios/roswell-vaults/blob/feature/pk-2/vaults/hyperlite/04-engineering/planning/hyper-115-addon-final-sale/README.md).

## Testing Notes:

### How to test with the RS Test product

-  Open `/products/rs-test?preview_theme_id=<theme id>`. RS Test is unlisted, so open it by URL; it won't appear in collections, search or recommendations.
-  RS Test is a Seconds product (price $100,000, **never check out**). Its add-ons are its own sizes (Seconds) and two Junction 40L variants (not Seconds).
-  **Add-on test:** keep Small selected, check the **RS Test - Medium** and **Junction - 40L / Small / Black** add-ons, then Add to cart.
   -  The cart drawer (Ajax cart) opens with 3 lines.
   -  RS Test Small and RS Test Medium both show "Final Sale: All sales of Seconds products are final".
   -  Junction has no Final Sale.
   -  Open `/cart` and check the same.
-  **Don't use the RS Test - Small add-on with Small selected.** Same variant, same properties, so Shopify merges it into one line with quantity 2.
-  **No add-on:** clear the cart, add RS Test with no add-ons checked. One line, with Final Sale.
-  **Featured product section:** in the theme editor, add a Featured product section with RS Test to a page (e.g. Day Packs, `/pages/day-packs`), then Add to cart from it. The line shows Final Sale. **To change settings or templates, duplicate the `release/_candidate` theme and test on the copy, not the original. If a section does get added to `release/_candidate`, remove it when done.**
-  **Gift card:** on `/products/e-gift-card`, check "I want to send this as a gift", fill out all the fields, Add to cart. The recipient details show on the cart line.
-  **Other listed products:** add one from a collection card and one from "You may also like". Each lands in the drawer as before.
-  **Lower priority, signed in:** repeat the add-on test, then open `/cart.js` in a new tab. Every line's `properties` has `_intuitive_cid`. It's hidden, so it doesn't show in the drawer or `/cart`.

-  Dev test results and methods: [vault notes](https://github.com/roswell-studios/roswell-vaults/blob/feature/pk-2/vaults/hyperlite/04-engineering/planning/hyper-115-addon-final-sale/README.md).

## Bugs from QA:

-  TBD

 

## Clarifying Questions: