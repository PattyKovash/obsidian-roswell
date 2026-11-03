#  

## Background:

-  **Ticket: **Fix language switcher href (FR link points to "/" instead of "/fr")

 

## Necessary Info (Design/Documentation):

-  **Issue: **The "FR" language-switcher link in the header/footer has href="/" and relies on a JS click handler to redirect the shopper to /fr. The href="/" means search crawlers and non-JS clients don't see this as a link to the French site.

-  [**aedshop.ca**](http://aedshop.ca)** — 3 instances of the link (**`a[data-value="fr"]`), all rendering as: `<a href="/" hreflang="fr" lang="fr" data-value="fr">FR</a>`

-  [**aed4life.ca**](http://aed4life.ca)** — same, 3 instances, all **`href="/"`.

-  **Fix:** Update the href on all instances of the FR language-switcher link, on both sites, from: **`<a href="/"`**` hreflang="fr" lang="fr" data-value="fr">FR</a>` to **`<a href="/fr"`**` hreflang="fr" lang="fr" data-value="fr">FR</a>`

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  On aed4life.ca, the FR language-switcher link in the desktop header renders `href="/fr"` (instead of `href="/"`). |   | ✅ |   |
|  2 |  On aed4life.ca, the FR language-switcher link in the mobile header drawer renders `href="/fr"`. |   | ✅ |   |
|  3 |  On aed4life.ca, the FR language-switcher link in the footer renders `href="/fr"`. |   | ✅ |   |
|  4 |  On aedshop.ca, all 3 instances of the FR language-switcher link (header, mobile drawer, footer) render `href="/fr"`. |   | ✅ |   |
|  5 |  Clicking/tapping the FR link still switches the storefront to French as before (existing JS click-handler behavior is unchanged). |   | ✅ |   |
|  6 |  The link still carries `hreflang="fr" lang="fr" data-value="fr"` unchanged — only the `href` value is updated. |   | ✅ |   |
|  7 |  No visual or layout regression in the language switcher on header, mobile drawer, or footer on either site. |   |   |   |

 

## Dev Notes:

-  snippets/language-selector.liquid

   -  `{{ language.root_url }}`

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD

 
