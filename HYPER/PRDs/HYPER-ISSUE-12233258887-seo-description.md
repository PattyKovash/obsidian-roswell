#  

## Background:

-  TBD

## Necessary Info (Design/Documentation):

-  We need to create a new, high-performance custom Shopify section named `rs-plp-seo-description.liquid`. This section will allow us to display long-form collection descriptions or custom SEO story metafields dynamically in a balanced, newspaper-style **2-column layout on desktop**, while optimizing space on **mobile with an automated "Read more" word-count toggle**.

### figma :[https://www.figma.com/design/fPNOWuKDXCTV7skARPfojb/Hyperlite-PLP?node-id=0-1&p=f&t=d30hsQbFHcdUaHVb-0](https://www.figma.com/design/fPNOWuKDXCTV7skARPfojb/Hyperlite-PLP?node-id=0-1&p=f&t=d30hsQbFHcdUaHVb-0)

### 1. General & Layout Features

-  **Dynamic Data Sources:** By default, the section must pull and render the native `collection.description`. A schema checkbox must be available to switch the data source to a custom rich-text metafield (`collection.metafields.custom.seo_story`).

-  **Desktop Layout:** Content must be automatically distributed across 2 perfectly balanced columns using native CSS columns (`columns: 2`). Headings (`<h2>`, `<h3>`) must stay joined to their respective content blocks and never wrap awkwardly alone at the bottom of a column split.

-  **Global Styling:** The section should use standard theme typography, margins, and body text styles automatically without hardcoded overrides.

### 2. Mobile Responsive Optimization ("Read More" Functional Spec)

-  On screen sizes below `768px`, the layout must automatically collapse into a single column.

-  The text must truncate cleanly using Liquid's `truncatewords` filter based on a custom schema value.

-  **use minimal JavaScript for page speed:** The "Read more / Read less" expansion logic must be executed purely via CSS (using a hidden checkbox toggled via an adjacent `<label>`) to avoid Cumulative Layout Shift (CLS) or degradation of core web vitals.

### Acceptance Criteria

- [x]  [ ] The section can be successfully added to the default collection template in the Shopify Theme Editor.


- [x]  [ ] Changing the "Mobile Word Limit" slider dynamically adjusts the truncated length on mobile preview instantly.


- [x]  [ ] Clicking "Read more" on a mobile device immediately swaps the text to full view and flips the link text to "Read less" without a page refresh or layout glitching.


- [ ]  [ ] No custom JavaScript files are loaded or executed for this feature.


- [x]  [ ] Desktop layout splits into two distinct, clear columns as visualized in the initial project references.


## 

## Dev Notes:

### Schema Controls added

-  The section settings panel in the customizer must include:

1.  **Use Metafield instead of Description** (Checkbox, default: `false`)

2.  **Max Container Width** (Range slider: 800px – 1600px, default: `1200px`)

3.  **Desktop Column Gap** (Range slider: 20px – 100px, default: `60px`)

4.  **Mobile Word Count Cutoff** (Range slider: 10 – 150 words, default: `40`)

5.  **Read More Button Text** (Text input, default: `"Read more"`)

6.  **Read Less Button Text** (Text input, default: `"Read less"`)

7.  

## 

## Bugs from QA:

 R/C - [https://hyperlitemountaingear.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=132956356653](https://hyperlitemountaingear.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=132956356653)

 [https://hyperlitemountaingear.com/collections/all](https://hyperlitemountaingear.com/collections/all)

 Customizer - [https://admin.shopify.com/store/hyperlite/themes/132956356653/editor](https://admin.shopify.com/store/hyperlite/themes/132956356653/editor)

 Collection - [https://admin.shopify.com/store/hyperlite/collections/73307029549](https://admin.shopify.com/store/hyperlite/collections/73307029549)

 ✅ 

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3037305507/image-from-clipboard.png)

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3037301173/image-from-clipboard.png)

 QA Note - Metafield on hold:

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3037316699/image-from-clipboard.png)

 ✅ FIXED - Mobile - when user adds in Bolded text for Title, it appears not bold and on same line as subsequent text when text is not expanded. See screenshot below:

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3037402929/image-from-clipboard.png)

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3038201791/image-from-clipboard.png)

## Clarifying Questions:

-  TBD

 