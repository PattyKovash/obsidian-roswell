# BAUBAR-11559788034 — Automated Test Verification Prompt

**Context for this task:**

You are reviewing a Shopify checkout UI extension called `ceui-line-item-details` and its automated test suite. A prior session built the test matrix and wrote the unit tests. Your job is to verify that the mock data used in the tests matches real data structures observed in the live product catalog, and to flag any mismatches or gaps.

---

## What the extension does

The extension renders below each line item in the Shopify checkout. It reads three signals and renders up to three UI sections:

1. `_Customization` — a cart line attribute (string) set by customizer product forms on the storefront. Renders the customer's customization text, with optional emoji icon substitution.
2. `_calendarVariants` — a cart line attribute (string) set when a customer selects gem/birthstone variants on a calendar-style PDP. Renders a list of gem selections by day and month.
3. `custom.mto_timeline_disclaimer` — an app metafield (string) set at product or variant level. Renders a shipping disclaimer. Variant-level takes precedence over product-level.

If none of these are present the extension renders nothing.

---

## Files to read

- `extensions/ceui-line-item-details/src/Checkout.jsx` — main component
- `extensions/ceui-line-item-details/src/utils.js` — all pure logic functions
- `extensions/ceui-line-item-details/src/utils.test.js` — the full unit test suite
- `extensions/ceui-line-item-details/test-matrix.md` — the test matrix
- `extensions/ceui-line-item-details/TESTING-GUIDE.md` — the QA testing guide

---

## Real data structures observed from the live product catalog and theme code

Use these as the ground truth to verify the test mocks against.

### `product.cart_transform_settings` metafield (what the extension reads for emoji config)

**Confirmed from live product export 2026-04-20.** Real structure:

```json
{
  "customEmojisTransformSettings": [
    {
      "icon": "https://cdn.shopify.com/s/files/1/0267/5746/4148/files/motif-selector_star.svg",
      "utfChar": "\\uf133",
      "cartChar": "#Star#",
      "price": 0,
      "title": "Star"
    }
  ]
}
```

Key confirmed facts:
- `cartChar` is a **hash-delimited name string** e.g. `"#Star#"`, `"#Heart#"` — NOT a unicode character
- `utfChar` is a **unicode escape code string** e.g. `"\\uf133"` — NOT the character itself
- `price` field is always present (typically `0`)
- This is a JSON metafield; the extension reads it as `appMetafields` with `valueType: "json_string"`

### `_calendarVariants` cart line attribute (set by the storefront JavaScript)

**Confirmed from theme source** (`src/js/build/theme.js:3133`, `product-form-calendar.liquid:65`).

Format: `"${day}: ${variant.title}"` entries joined with `", "` (comma-space).

```
"1: Amethyst, 2: Garnet"
```

- Space after the colon
- Variant title is `{{ variant.title }}` **verbatim** — no suffix is added by theme code
- Actual variant naming convention (gemstone names, month names, etc.) is set in Shopify admin
- No active calendar products exist in the current catalog to confirm live variant title format

**`_calendarVariants` parsing in `utils.js`:**
`parseCalendarVariants` splits on `,` then on `:` and trims both sides — space after colon is handled correctly.

`findGemVariant` does a case-insensitive **exact match** between the parsed variant title and the Storefront API `variant.title`. Both sides come from `variant.title`, so they always match in production. Mismatch silently returns `undefined` (no thumbnail).

### Gem variants from Storefront API (the `getGemVariants` query in `Checkout.jsx`)

```json
{
  "title": "Amethyst",
  "image": {
    "url": "https://...",
    "altText": "...",
    "width": 100,
    "height": 100
  }
}
```

Note: variant title format is whatever the Shopify admin named the variants. `"Amethyst"` is used as an example consistent with the theme agent's code context; actual titles on live products are unverifiable until a calendar product is active again.

### `appMetafields` shape (how Shopify passes app metafields to checkout UI extensions)

The extension accesses `shopify.appMetafields.value` which returns an array. Each entry is expected to have this shape:

```json
{
  "target": {
    "type": "product",
    "id": "12345"
  },
  "metafield": {
    "namespace": "custom",
    "key": "mto_timeline_disclaimer",
    "value": "Ships in 6-8 weeks",
    "valueType": "json_string"
  }
}
```

The tests construct mocks using this same shape. Verify the shape is consistent between `Checkout.jsx`, `utils.js`, and the test mocks.

### `custom.mto_timeline_disclaimer` in the live catalog

- Only 2 products in the catalog have this set, both in Draft status
- The value is a plain text string (e.g. `"Limited quantities available for Vday delivery"`)
- Can be set at product level (`Metafield: custom.mto_timeline_disclaimer`) or variant level (`Variant Metafield: custom.mto_timeline_disclaimer`)

---

## What to verify and report

### 1. `_calendarVariants` format vs. test data

The theme sets this as `"1: January Birthstone, 2: February Birthstone"`. Test mocks use `"15:January,20:March"`. Trace whether `parseCalendarVariants` + `findGemVariant` would correctly resolve a real variant titled `"January Birthstone"` when `_calendarVariants` contains `"1: January Birthstone"`. Flag if the exact-match in `findGemVariant` would fail against real variant titles.

### 2. `cart_transform_settings` mock structure

Confirm the `customEmojisTransformSettings` key name and the shape `{cartChar, icon, utfChar, title}` in the tests matches the real metafield JSON structure above.

### 3. `appMetafields` mock shape

Check every test that constructs an `appMetafields` array and confirm the `{target: {type, id}, metafield: {namespace, key, value, valueType}}` shape is consistent throughout the test file and matches how `Checkout.jsx` and `utils.js` actually access the data.

### 4. `findCartTransformMetafield` — namespace and key

The function filters for `namespace: 'product'`, `key: 'cart_transform_settings'`. The live metafield is `product.cart_transform_settings` (namespace `product`, key `cart_transform_settings`). Confirm this aligns and that no test uses a different namespace/key.

### 5. Scenario coverage gaps

Cross-reference the test matrix scenarios against what is actually tested in `utils.test.js`. The matrix has rows A1–A5, B1–B5, C1–C7, D1–D4, E1–E4. Confirm every row marked `Automated Test: X` in the matrix has a corresponding test case. Flag any matrix rows marked as covered that have no matching test, and any tests that cover scenarios not in the matrix.

### 6. `mto_timeline_disclaimer` ID format

The extension strips the GID prefix from product/variant IDs:

```js
productId = productGid.replace('gid://shopify/Product/', '')
```

The test mocks pass bare numeric IDs like `'100'` and `'200'`. Confirm this stripping happens before the IDs reach `resolveMtoDisclaimer` and that the mock IDs are consistent with what would actually be passed after stripping.

---

## Report format

For each item above: **PASS** (mock matches real data), **MISMATCH** (describe the discrepancy and its likely production impact), or **UNCLEAR** (not enough information to determine — state what is missing).

Conclude with a prioritized list of any mismatches ordered by likely production impact.
