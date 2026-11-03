#  

## Background:

-  TBD

## Necessary Info (Design/Documentation):

 please dev a function

-  **Develop inventory logic: 1-unit ****left then show ****sold-out + **

-  **international**** order only use inventory from ****-**** ****only warehouse;**

## Objective/Acceptance Criteria:

-  When a product has exactly 1 unit remaining in the warehouses an of them, the system currently allows users to attempt a purchase. However, the store generally prefer to keep that 1 product as its last piece

-  Additionally, international orders are pulling stock from localized regional warehouses. This leads to exorbitant shipping costs and delivery failures because those regional facilities lack international carrier integrations.

### Necessary Info

-  **Low-Stock Threshold:** Trigger "Sold Out" state when `inventory_count == 1`.n any warehouse

-  **International Fulfillment:** International orders must exclusively reserve and pull inventory from the `Only Warehouse` facility

### Acceptance Criteria

- [ ]   **1-Unit Friction Prevention:** A product must display as "Sold Out" and block checkout addition as soon as the available inventory drops to 1 unit in a place.


- [ ]  **International Routing Lock:** When a user enters a non-domestic shipping address, the checkout system must evaluate stock availability _only_ from the designated international warehouse (`WH-MAIN-01`).
meeting recording  : [https://fathom.video/share/tZsnNnx_b4ridNE9yssh5VxiFd_WKrjM](https://fathom.video/share/tZsnNnx_b4ridNE9yssh5VxiFd_WKrjM)


## Dev Notes:

-  TBD

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD

 