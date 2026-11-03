# Products with image — make the full image open quick add

## Background:

-  Requested by the client via the MP: in the `Products with image` section, clicking the **large lifestyle image** should do the same thing as clicking the **bag button** on a product card — open the quick add drawer.

-  Goal: let a shopper buy straight from the editorial image instead of having to find and click the small product card next to it.

-  Source ticket note: "SHOP THE LOOK GALLERY : FULL IMAGE SHLD REPLICATE THE SAME ACTION AS WHEN CLICKED ON THE BAG BUTTON — Section: `Products with Image`."

 

## Necessary Info (Design/Documentation):

-  Section in the theme editor: **Products with image**. It has two blocks — **Products** (up to 4 product cards) and **Image** (one lifestyle image).

-  The product cards already have the bag icon. Its behavior today: product with **multiple variants** opens the quick add drawer; product with a **single variant** adds straight to the cart. This ticket reuses that behavior as-is — nothing about the drawer itself changes.

-  The Image block today only supports a plain link (optional button, or link the whole image). It has **no product association**, so it cannot know which product to add.

-  **Proposed approach:** add an optional **Product** setting to the Image block. When set, clicking the image triggers the same quick add as that product's bag button.

-  No new design is needed for the click behavior. Design input is only needed if we also add a visible bag icon on the image — see Clarifying Questions.

 

## Constraints / Scope:

-  Scope is the **Image block of the Products with image section** only. No other section changes.

-  The image supports **one** product. A multi-product "shop the look" hotspot experience is out of scope.

-  When no product is selected, the image keeps its current behavior exactly (existing link/button settings untouched).

-  The quick add drawer, cart, and product cards are not modified.

 

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  The Image block in the `Products with image` section has a new optional **Product** setting in the theme editor. |   |   |   |
|  2 |  With a product selected, clicking anywhere on the image opens the quick add drawer for that product — identical to clicking the bag button on a product card. |   |   |   |
|  3 |  If the selected product has only one variant, clicking the image adds it straight to the cart with no drawer, matching the bag button's behavior for single-variant products. |   |   |   |
|  4 |  If the selected product is sold out or unavailable, the image does not trigger quick add and shows no error — it behaves like a normal image. |   |   |   |
|  5 |  With no product selected, the image behaves exactly as it does today, including the existing link and button settings. |   |   |   |
|  6 |  If both a product and a link are set on the Image block, the product (quick add) takes priority and the link is ignored. |   |   |   |
|  7 |  The behavior works on both desktop and mobile. |   |   |   |
|  8 |  Pending confirmation (see Clarifying Questions): a bag icon appears in the bottom corner of the image, matching the icon on the product cards. |   |   |   |
|  9 |  No visual or layout regression to the section — image sizing, heading, and the adjacent product cards are unchanged. |   |   |   |
|  10 |  No other section that uses images or quick add is affected. |   |   |   |

 

## Dev Notes:

-  **Section:** `sections/section-products-image.liquid` (schema block `"type": "image"`, ~line 269).

-  **Image block markup:** `snippets/brick-image.liquid` — the image is wrapped in `<a class="frame__item" href="{{ link }}">` when a link is set, otherwise a plain `<div>` (~lines 74–112). The product trigger replaces that wrapper.

-  **Quick add behavior to reuse:** `snippets/quick-add-product.liquid`. The multi-variant path is a `<button data-quick-add-btn data-quick-add-modal-handle="{{ product.handle }}">` plus `{% render 'product-quick-add-modal-template' %}`; the single-variant path is a submit button bound to a hidden product form. Rendering `quick-add-product` inside the image block and making the image itself the trigger is preferred over re-implementing the JS.

-  Add to the Image block schema:

 {
   "type": "product",
   "id": "quick_add_product",
   "label": "Quick add product",
   "info": "Clicking the image opens quick add for this product. Leave blank to use the Link setting instead."
 }

-  Note `sections/section-products-image.liquid` already conditionally loads `product-info.js` when `settings.quickview_enable` is on (~line 46) — that dependency is in place.

-  Accessibility: the trigger must be a real `<button>` (or the existing quick add button stretched over the image), not a click handler on a `<div>`, and needs an `aria-label` matching the product cards' bag button.

 

## Bugs from QA:

-  TBD

 

## Clarifying Questions:

-  **Should the image also show the bag icon in the bottom corner, like the product cards do?** Without it there is no visual cue that the image is clickable. Needs a yes/no, and design confirmation of placement if yes.

-  **Confirm the section.** The theme also has a separate section literally named `Shop the look: Gallery`, and the ticket headline says "SHOP THE LOOK GALLERY" while the note says `Products with Image`. Confirming we are building this on `Products with image`.

-  **One product per image — correct?** If the look in the image contains several products, confirm the client only wants one of them added, not a multi-product picker.

-  **If a product and a link are both set, is quick add the right winner?** Assumed yes in AC #6.
