# Decouple product-schema GTIN from Barcode via new verified-GTIN metafield

## Background:

-  product-schema.liquid currently outputs `gtin12` sourced from each variant's native Barcode field. An audit found many Barcode values across the catalog are inaccurate or duplicated across variants that should have distinct identifiers. We've independently verified 40 correct GTIN values so far, with more to follow. Rather than editing Barcode — which may be tied to POS/inventory use elsewhere — we want to decouple the schema from it entirely and source it from a new, dedicated metafield holding only confirmed-correct values.

-  TBD

## Necessary Info (Design/Documentation):

**1. Create new metafield definition**

-  Namespace & key: `custom.verified_gtin`

-  Owner resource: **Product variant** (not Product — GTIN varies by variant, same as Barcode)

-  Type: **Single line text** — not Integer/Number. This is critical: a numeric field type strips leading zeros, which will silently corrupt any GTIN starting with 0.

-  Description (visible in Admin): "Manually confirmed GTIN — only populate with values verified against manufacturer documentation. Do not copy from Barcode."

-  Optional: validation regex requiring 8, 12, 13, or 14 numeric digits, to catch bad entries later.

**2. Update product-schema.liquid**

-  Find where `gtin12` is currently populated from `variant.barcode`.

-  Replace the source with `variant.metafields.custom.verified_gtin` (syntax may need `.value` depending on which Liquid metafields API version the theme uses).

-  Keep/add a blank check so the property is fully omitted from the JSON-LD when the metafield is empty — not rendered as `""` or `null`.

-  Do not modify or remove `variant.barcode` anywhere else in the theme; leave it untouched for any other use.

-  While in this code: check whether the property name is hardcoded as `"gtin12"` regardless of the actual value's digit length. [schema.org](http://schema.org/) defines gtin8/gtin12/gtin13/gtin14 as length-specific, plus a generic `"gtin"` property that accepts any length. If 13- or 14-digit values are being emitted under the `gtin12` key, that's a second, separate bug worth fixing here — switch to the generic `gtin` property, or select gtin8/12/13/14 dynamically based on string length.

## Constraints / Scope:

-  **IN scope, both repos (`AEDShop_AED`, `AED4LIFE_AED`):** the GTIN-emitting logic wherever it lives today in each repo — see Dev Notes for the exact file(s) per repo, since the two repos have diverged here.

-  **AED4LIFE_AED-specific:** the fix must be applied in **two** files, not one — see Dev Notes. `AEDShop_AED` only needs one.

-  **Out of scope:** any change to `variant.barcode` itself, POS/inventory behavior, or the metafield-definition creation for the two Shopify stores is an **Admin task, not a theme-code change** — it isn't achievable via a repo commit and isn't something the executing coding agent can do from this codebase.

-  **Per-repo edit, not a copy:** per `CLAUDE.md`, never copy a file between `AEDShop_AED` and `AED4LIFE_AED` — apply the same intent as a targeted, independent edit in each repo's own file(s).

## Objective/Acceptance Criteria:

| # | Item | Notes | Dev | QA |
|---|---|---|---|---|
| 1 | Variant with `custom.verified_gtin` populated → JSON-LD gtin value matches the metafield, not Barcode (test on a variant where the two differ, to confirm the source actually switched). | | | |
| 2 | Variant without `custom.verified_gtin` populated → no gtin property appears in the JSON-LD at all (not `""`, not `null`). | | | |
| 3 | The emitted property key matches the actual value's digit length (`gtin8`/`gtin12`/`gtin13`/`gtin14`), or the generic `gtin` property is used — never a mismatched fixed key. | | | |
| 4 | `variant.barcode` is unchanged everywhere else in the theme (no incidental edits). | | | |
| 5 | Fix is applied on **both** storefronts (aedshop.ca, aed4life.ca) — including AED4LIFE_AED's second, independent GTIN-emitting location (see Dev Notes). | | | |
| 6 | Spot-check a few product pages (mix of populated/empty) in Google's Rich Results Test — no schema errors introduced. | | | |
| 7 | No other template/snippet/app in either theme separately references `variant.barcode` for structured data (confirmed by repo-wide search, not just the files touched). | | | |

## Dev Notes:

> **Everything below is a starting point compiled ahead of execution, not a verified spec.** The executing agent must **independently re-confirm each file path, line number, and code snippet against the current repo state before editing** — the code may have moved since this was written. The agent is also free to **deviate from the specific approach suggested here** if it finds a better way to satisfy the Acceptance Criteria during implementation (e.g. a different blank-check pattern, or choosing generic `gtin` vs. length-keyed properties) — the acceptance criteria are the contract, not this section.

**AEDShop_AED — single file:**

-  `snippets/product-schema.liquid`, inside the `offers` loop (~lines 96–109 as of this writing). Current pattern:

```liquid
{%- if variant.barcode.size == 12 -%}
    "gtin12": {{ variant.barcode | json }},
{%- endif -%}
{%- if variant.barcode.size == 13 -%}
  "gtin13": {{ variant.barcode | json }},
{%- endif -%}
{%- if variant.barcode.size == 14 -%}
  "gtin14": {{ variant.barcode | json }},
{%- endif -%}
```

-  Note this already does length-based key selection for 12/13/14 — it's missing `gtin8`, and it reads `variant.barcode` instead of the new metafield. Swap the source and add the 8-digit case (or collapse all four into the generic `"gtin"` property — see acceptance criterion #3, either satisfies it):

```liquid
{%- assign verified_gtin = variant.metafields.custom.verified_gtin.value | default: '' | strip -%}
{%- if verified_gtin.size == 8 -%}
  "gtin8": {{ verified_gtin | json }},
{%- elsif verified_gtin.size == 12 -%}
  "gtin12": {{ verified_gtin | json }},
{%- elsif verified_gtin.size == 13 -%}
  "gtin13": {{ verified_gtin | json }},
{%- elsif verified_gtin.size == 14 -%}
  "gtin14": {{ verified_gtin | json }},
{%- endif -%}
```

-  `.value` on a variant metafield reference is the established pattern already used elsewhere in this same file (e.g. `product.metafields.global.length.value`) — confirm this repo's metafields API version handles variant metafields identically before assuming it's a drop-in swap.

-  `sections/featured-product.liquid` does **not** need a separate edit in this repo — it was already refactored (in-progress branch work, not yet merged) to `{% render 'product-schema', product: product %}` instead of carrying its own duplicate JSON-LD block. Confirm this is still true at execution time before assuming it — if it's reverted, this file would need the same fix as AED4LIFE's copy below.

**AED4LIFE_AED — two files (has not received the dedup refactor above):**

-  `snippets/product-schema.liquid` — same barcode/gtin block as AEDShop_AED (~lines 90–103), same fix applies.

-  `sections/featured-product.liquid` (~lines 160–175) — this repo still carries its **own independent copy** of the JSON-LD generator, not a render of the shared snippet. It has the same barcode-sourced `gtin12/13/14` logic and needs the identical metafield swap applied here too, or this file will keep emitting stale barcode-based GTINs even after the snippet is fixed. (Whether to also dedupe this file to `{% render 'product-schema' %}` while in here is a judgment call for the executing agent — not required by the acceptance criteria, but worth doing if it's a low-risk, in-scope opportunity; don't let it become a bigger refactor than the ticket calls for.)

-  Confirmed via `grep -rn "barcode\|gtin"` across both repos that these are the only two GTIN-emitting locations total (one in AEDShop_AED, two in AED4LIFE_AED) — re-run this search after editing to confirm criterion #7.

**Testing — automate what's automatable with Playwright:**

-  The JSON-LD shape/value checks (criteria #1–3) are good candidates for Playwright rather than manual page inspection — read the script tag straight from the rendered page and assert on the parsed object:

```js
const schema = await page.locator('script#product-schema').textContent();
const data = JSON.parse(schema);
const offer = data.offers.find(o => o.sku === expectedSku);
expect(offer.gtin12 ?? offer.gtin13 ?? offer.gtin14 ?? offer.gtin8 ?? offer.gtin).toBe(expectedVerifiedGtin);
```

   Run once against a variant with `custom.verified_gtin` populated (value should match) and once against a variant without it (no gtin-shaped key should exist on the offer object at all). Note AED4LIFE's `featured-product.liquid` copy emits its script tag without an `id` today — either select it by `script[type="application/ld+json"]` position/content instead, or add an `id` while editing (small, in-scope, non-breaking).

-  Criterion #6 (Google Rich Results Test) is **not** a good Playwright target — it's a third-party hosted tool not meant for automation and prone to breaking silently if scripted against. Do that step manually.

-  Requires at least one product per store with `custom.verified_gtin` already populated (per Background, 40 values are already verified) — pick one of those as the fixture rather than inventing test data.

## Implementation Notes:

-  TBD — fill in after execution (which key strategy was chosen — length-keyed vs. generic `gtin` — and whether AED4LIFE's `featured-product.liquid` was also deduped to the shared snippet).

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  TBD
