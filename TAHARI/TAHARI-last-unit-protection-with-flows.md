Context: Elie Tahari Shopify store. Goal was "last-unit protection" — stopping the online channel from selling the final unit of a SKU when that unit physically sits in a retail store, which risks in-store stockouts and subsequent eCommerce cancellations. Order routing has CLS (warehouse) as first priority, five retail stores in the second group, and D4S locations last.

The originally proposed interim — two Shopify Flow workflows that toggled Online Store publication:

Workflow 1 ("Last-unit protection"): triggers on inventory quantity change; sums available inventory across the five store locations only (CLS excluded); when the store total hits 1, it sets the variant to deny further sales and unpublishes it from the Online Store.
Workflow 2 ("Reset"): same trigger and store-only logic; when the store total goes back above 1, it re-publishes the variant to the Online Store.

(A later variant of the same idea was floated: instead of unpublishing, set product status to Unlisted and add theme code to hide the Add to Cart button. It has the same underlying problem, below, plus its own wrinkles.)

Why I recommended against it: the core objection is that these are catalog-visibility levers being used to solve an inventory-availability problem — the wrong tool for the job. Specifically:

Feed / channel churn. Unpublishing drops the product out of Google/Meta Shopping feeds and marketplaces, and republishing re-adds it. That churn can reset ad learning and trigger product disapproval / re-review cycles.
SEO. While unpublished, the product URL returns a 404. Because the workflows flip right at the one-unit boundary (unpublish at ≤1, republish at 2), a SKU that sells and restocks around that line flaps repeatedly, 404-ing the URL each time — bad for rankings.
Publication-dependent integrations. Reviews, recommendation/upsell/bundle apps, and any headless Storefront API queries keyed on availability react each time the product drops and reappears.
In-flight cart race. A customer who already has the item in their cart can still check out before the unpublish propagates, partially defeating the protection.
Clarifying a red herring: the original stated worry was that unpublishing might break downstream logic referencing the product/variant ID. It won't — unpublish (publishableUnpublish) only removes the sales-channel publication; product and variant IDs stay stable. The real exposure is publication/availability-dependent logic and the feed/SEO churn above, not broken ID references.

For the Unlisted variant specifically: it avoids the hard 404 (URL stays live, Shopify adds noindex) but still pulls the product from other sales channels and the Shopify Catalog — which now feeds AI shopping surfaces (ChatGPT, Perplexity, Gemini, Shop app) — and re-ingestion when flipping back to Active runs on an hours-to-days cycle. Unlisted products also remain purchasable via the cart permalink, so hiding the Add to Cart button is only a soft block, and Liquid doesn't expose product status, so the theme condition has to key off a metafield the Flow sets.

Direction I steered toward instead: solve it as availability, not visibility — keep the product Active/published and reduce what the online channel can promise (a per-location or pooled inventory buffer), so feeds and SEO never move. Native safety stock does this but also blocks POS sale of the reserved unit; a buffer app (e.g. HotWax-style network thresholds) or inventoryMoveQuantities via Flow's Send Admin API request are the online-only options. The custom order-routing Function that would have done highest-inventory routing is separate and currently blocked by Shopify's beta/early-access gating.