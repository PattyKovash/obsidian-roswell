#  

## Background:

-  TBD

## Necessary Info (Design/Documentation):

-  [https://roswellstudios-company.monday.com/boards/18418818134/pulses/12457902459](https://roswellstudios-company.monday.com/boards/18418818134/pulses/12457902459)

-  **Issue:** The product-schema JSON-LD includes a hardcoded `review` field on most products, even when no review is displayed on the page.

-  **Cause:** Each affected product has a `Testimonial` metafield (present in both pinned and unpinned metafields) whose value matches the author name shown in the schema. This metafield appears to be feeding into `product-schema.liquid`.

-  **Note: **The products not impacted have a BLANK Testimonial metafield.

-  **Scope:** Audited AEDs by brand. Affects nearly every product across all brands (ZOLL, Philips, Cardiac Science, HeartSine, Stryker, Defibtech, Encore). [aed4life.ca](http://aed4life.ca) does not have this issue (no `Testimonial` metafield under unpinned metafields there).

-  **Ask:** Please investigate `product-schema.liquid` and stop it from pulling the `Testimonial` metafield into the `review` field. Metafield itself can stay — just remove it from the schema output.

 

 **Exceptions (not affected):**

-  Philips HeartStart FRx Construction and Workplace Safety Kit

-  LIFEPAK CR2 Bilingual (Cellular model)

-  LIFEPAK CR2 Bilingual (Cellular model) – Complete Package

-  AED Summer Cottage Rental

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3098526159/image-from-clipboard.png)

## Objective/Acceptance Criteria:

-  TBD

## Dev Notes:

-  TBD

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD

 