## Background:

- [x]  H1 issue identified: page contains two H1s. First is correct, second is blank, in div class "rte paragraph-size-large" on [https://aed4life.ca/pages/liability-protection](https://aed4life.ca/pages/liability-protection) (remove 2nd/incorrect H1)

## Necessary Info (Design/Documentation):

 

 **optimize Image Banner Heading with SEO Schema and Tag Selection**

 Update the special heading section on the image banner to include an SEO schema. Ensure the system allows for dynamic selection of the appropriate HTML header tag (e.g., H1, H2).

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3096625701/Screenshot%202026-07-08%20at%207.04.52%E2%80%AFAM.png)

![Image: ](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3096634709/Screenshot%202026-07-08%20at%207.07.57%E2%80%AFAM.png)

## 

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  `Image Banner` section > `Special heading` block has a setting to set the title tag. Setting name: `Heading Tag`<br>Options should include H1-H6 tags. |   |  ✅ |   |
|  2 |  `Special heading` block's `Size` setting should still apply the selected size from the Size setting regardless of what heading tag is selected in the `Heading Tag setting.`  |   |  ✅ |   |
|  3 |  Do the same for `Heading` block.<br>Image Banner section > `Heading` block has a setting to set the title tag. Setting name: `Heading Tag`<br>Options should include H1-H6 tags. |   |  ✅ |   |
|  4 |  `Heading` block's `Size` setting should still apply the selected size from the Size setting regardless of what heading tag is selected in the `Heading Tag setting.` |   |  ✅ |   |
|  5 |  **AED4life**<br>The `standing-offer` template's `Image Banner` > `Special heading` `Heading Tag` is set to H1<br>[https://aed4life.ca/pages/aed-standing-offer](https://aed4life.ca/pages/aed-standing-offer) |  Dev is to update the `standing-offer` template's `Image Banner` > `Special heading` setting to an H1 and commit the setting. |  ✅ |   |
|  6 |  **AEDShop**<br>The `standing-offer` template's `Image Banner` > `Special heading` `Heading Tag` is set to H1<br>[https://aedshop.ca/pages/aed-standing-offer](https://aedshop.ca/pages/aed-standing-offer) |  Dev is to update the `standing-offer` template's `Image Banner` > `Special heading` setting to an H1 and commit the setting. |  ✅ |   |

 

## 

### Out of Scope

- **`collection.ROTAID` template.** The new `Heading Tag` setting applies to the Image Banner everywhere, including the ROTAID collection template. However, that template has pre-existing hard-coded font-size CSS scoped to `body.template-collection.ROTAID` (`assets/base.css:396`, `assets/theme.css:17644` and `:17832`) which we left in place. Those rules are written as `h2.section-image-banner-special-heading` — qualified by the tag name — so if the ROTAID banner's `Heading Tag` is ever changed away from H2, those selectors stop matching and the hard-coded font-size stops applying — the heading would fall back to its `Size` setting and visibly change. Nothing in this ticket changes ROTAID's tag, so those banners stay H2, keep their hard-coded font-size, and look exactly as they do today. If ROTAID's `Heading Tag` is changed later, the selectors need de-qualifying (so the hard-coded font-size follows whatever tag is chosen) plus a ROTAID regression pass — that should be its own ticket.

## Testing Notes:

Both repos verified the same way — driving the template settings and reading the rendered tag and **computed** `font-size` out of the DOM:

- **AED4LIFE** (`AED4LIFE_AED`) on preview theme `188159066414` — `https://7ddd97.myshopify.com/pages/aed-standing-offer?preview_theme_id=188159066414`
- **AEDShop** (`AEDShop_AED`) on preview theme `187923792193` — `https://2e7d7b-3.myshopify.com/pages/aed-standing-offer?preview_theme_id=187923792193`

The baseline and test matrix below are AED4LIFE's. AEDShop was probed independently (not assumed) and returned an **identical** baseline and an identical 9/9 PASS matrix.

**Baseline size table.** Each `Size` value maps to one CSS custom property (e.g. `.special-heading-size-large { font-size: var(--theme-special-heading-font-size-large) }`). These are the expected values a heading must render at for a given `Size`, regardless of `Heading Tag`. Measured at viewport width 2560px.

| Size | Special heading | Heading |
| --- | --- | --- |
| x-small | 40px | 18px |
| small | 48px | 20px |
| medium | 56px | 24px |
| large | 72px | 28px |
| x-large | — | 32px |
| big | — | 36px |
| huge | — | 40px |

> Note: Special heading sizes are `clamp()`/`vw`-based, so they scale with viewport width — the values above hold at 2560px. Heading sizes are `rem`-based and fixed. Re-measure the baseline at your own viewport before comparing.

**Bare tag sizes (for contrast).** What a heading would render at if the tag leaked through instead of the `Size` setting. A test only proves something when the expected size differs from this value:

| Tag | h1 | h2 | h3 | h4 | h5 | h6 |
| --- | --- | --- | --- | --- | --- | --- |
| Bare size | 40px | 36px | 32px | 28px | 24px | 20px |

**Test matrix (beyond the acceptance criteria table).** Both blocks set to the same tag each round so one page load verifies AC 1–4 together. Every enum value of both settings is covered: all 6 tags, all 4 Special heading sizes, all 7 Heading sizes. Pass = rendered tag matched the requested tag AND computed font-size matched the baseline above (not the bare-tag size).

| Round | Special (size/tag) | Heading (size/tag) | Special px | Heading px | Bare tag px | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | large / h1 | large / h1 | 72 = 72 | 28 = 28 | 40 | PASS |
| 2 | medium / h2 | medium / h2 | 56 = 56 | 24 = 24 | 36 | PASS |
| 3 | small / h3 | small / h3 | 48 = 48 | 20 = 20 | 32 | PASS |
| 4 | x-small / h4 | x-small / h4 | 40 = 40 | 18 = 18 | 28 | PASS |
| 5 | large / h5 | large / h5 | 72 = 72 | 28 = 28 | 24 | PASS |
| 6 | medium / h6 | medium / h6 | 56 = 56 | 24 = 24 | 20 | PASS |
| 7 | large / h2 | x-large / h2 | 72 = 72 | 32 = 32 | 36 | PASS |
| 8 | large / h3 | big / h3 | 72 = 72 | 36 = 36 | 32 | PASS |
| 9 | large / h2 | huge / h2 | 72 = 72 | 40 = 40 | 36 | PASS |

**Additional checks not in the acceptance criteria table:**

| Check | Result |
| --- | --- |
| Back-compat: blocks saved before this setting existed (tag key absent) | Special heading falls back to `<h2>`, Heading to `<h3>` — previous markup preserved |
| AC 5 before/after on the live page | Before: **0 H1s**, banner `<h2>`, 48px → After: **1 H1**, banner `<h1>`, **48px**. Only the tag changed; size identical |
| `standing-offer` heading outline | 1× H1 then H3s; no empty headings |
| Editor round-trip | Adding a Heading block via the customizer wrote `banner_heading_tag: "h3"` into the template, confirming the setting is registered and saves |
| `shopify theme check` | 965 offenses before, 965 after — no new offenses; no offenses reference `heading_tag` |

**AEDShop (AC 6) results.** Same 9 rounds, same assertions, run against AEDShop's preview theme. Baseline probed fresh for that store and matched AED4LIFE exactly (Special 40/48/56/72px; Heading 18/20/24/28/32/36/40px; bare tags h1-h6 40/36/32/28/24/20px). All 9 rounds PASS.

| Check | AED4LIFE | AEDShop |
| --- | --- | --- |
| 9-round tag + size matrix | 9/9 PASS | 9/9 PASS |
| standing-offer H1 count | 1 (banner, 48px) | 1 (banner, 48px) |
| `main` page-title section | disabled — same zero-H1 cause | disabled — same zero-H1 cause |
| Empty headings on page | 0 | 0 |
| `shopify theme check` before → after | 965 → 965 | 717 → 717 |
| Editor round-trip of `Heading Tag` | confirmed | confirmed |

> Repo divergence note: the two `image-banner.liquid` files are **not** identical — AED4LIFE's `buttons` block has 4 buttons, AEDShop's has 2. Everything this ticket touches (both heading render lines, both block schemas, the heading locale entries, and the `standing-offer` section/block IDs) is byte-identical. Do **not** copy `sections/image-banner.liquid` or `locales/en.default.schema.json` between the repos — apply targeted edits, or the button settings will leak across.

**Coverage limit:** 9 rounds, not the full 66-combination cartesian (4×6 Special + 7×6 Heading). Every enum value of both settings is exercised against an absolute expected value; untested is the interaction of specific size×tag pairs beyond these 9, which the CSS structure makes independent (size comes from a class, tag from the element name).

## Dev Notes:

-  TBD

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  What is the SEO schema they want in the image banner? 

 