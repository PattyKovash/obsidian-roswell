---
monday_id: 12847605177
project_key: THREADS
authored: 2026-09-09
---

## Background:

- Part of the Dwell 3.4.0 → 4.1.4 theme upgrade. The Beam donation widget (cart nonprofit picker, tracked impact) is fully wired up on the live theme but entirely missing from the upgraded 4.1.4 base: the Beam settings, the widget's include, and the cart's nonprofit picker were all dropped during the automatic Shopify migration.
- Flagged in the migration audit (`config/settings_schema.json`, `layout/theme.liquid`, `snippets/cart-summary.liquid`) as three files needing porting, all part of the same feature.
- Separately flagged: the Beam API key ships as a schema default value, visible in plaintext to anyone who opens the theme code. **Resolved (2026-09-09):** confirmed safe. Beam's own onboarding flow (Rebuy Smart Cart App > Beam Impact integration panel) hands merchants this exact key specifically to paste into a client-side widget configuration field, alongside Chain ID, Store ID, and SDK version, per Beam's own instructions ("Once approved, you will be given an API Key, Chain Id, Store Id, and Version Number which you will add to the Beam Smart Cart App configuration"). This confirms the key is designed by Beam to be client-exposed, not a private credential, consistent with the Beam SDK itself loading client-side. No further handling change needed.

## Necessary Info (Design/Documentation):

- No new design: this restores existing, live functionality as-is on the new theme version.
- Surfaces: Theme Settings (Beam config), every page (widget script include), cart totals (nonprofit picker).
- Current state on `develop/feature/THREADS-12847605177-beam` (branched from the 4.1.4 base): zero Beam references anywhere in the codebase. Confirmed via `grep -rn -i "beam"` across `config/`, `layout/`, `snippets/`: no matches.
- Reference source: `main` (the live, published theme) has the complete working Beam wiring: used as the source of truth for what to restore.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Beam settings section (SDK version, API key, chain ID, store ID, store domain, base URL) is present in Theme Settings, restored to the same values as live. |   | x |   |
|  2 |  The `beam-imports` include renders on every page (the donation widget's script loads), matching live. |   | x |   |
|  3 |  The `web_checkout` cart-attribute tracking script runs on every page load, matching live, with the stray `console.log` removed as cleanup. |   | x |   |
|  4 |  The `beam-select-nonprofit` nonprofit picker renders in the cart totals, matching live. |   | x |   |
|  5 |  The Beam API key is restored as-is (same default value as live). Confirmed safe to leave as a schema default: Beam's own onboarding process issues this key specifically for client-side widget configuration. |   | x |   |
|  6 |  No regression to cart drawer, quick-add modal, or chat drawer rendering after these changes. |   | x |   |

## Dev Notes:

*File paths, line numbers, and code below reflect a review at authoring time: confirm they still hold before implementing.*

- Three files, one feature. All source code below is copied verbatim from `main` (the live theme) via `git show main:<path>`.

**1. `config/settings_schema.json`**: add a new `Beam` settings section. Currently ends at the `t:names.variant_pickers` section (file is 2119 lines); insert as a new object appended after that section's closing `}`, before the file's final `]`.

```json
{
  "name": "Beam",
  "settings": [
    {
      "type": "text",
      "id": "beam_sdk_version",
      "label": "Beam SDK Version",
      "default": "v1.56.2"
    },
    {
      "type": "text",
      "id": "beam_api_key",
      "label": "Beam API Key",
      "default": "p-CuQxQZfFO0DP.a13dbf25-50f1-41be-885d-efa36bb21158"
    },
    {
      "type": "number",
      "id": "beam_chain_id",
      "label": "Beam chain id",
      "default": 415
    },
    {
      "type": "number",
      "id": "beam_store_id",
      "label": "Beam store id",
      "default": 626
    },
    {
      "type": "text",
      "id": "beam_store_domain",
      "label": "Beam store domain",
      "default": "shopsocialthreads.com"
    },
    {
      "default": "https://api.beamimpact.com",
      "id": "beam_base_url",
      "label": "Beam Base URL",
      "type": "text"
    }
  ]
}
```

**2. `layout/theme.liquid`**: two separate insertions, both present on `main` but missing on this branch (195 lines currently, zero Beam/web_checkout references):

- The cart-tracking script, inserted right after the existing `setHeaderMenuStyle()` script's closing `</script>` (current line ~168) and before `<main` (current line ~170). **Drop the `console.log('Cart updated:', data);` line per AC #3**: keep the rest as-is:

```html
<script>
  fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attributes: { web_checkout: 'true' }
    })
  })
  .then(res => res.json())
  .catch(err => {
    console.error('Error:', err);
  });
</script>
```

- The Beam widget include, inserted right before `</body>` (current line ~194), after the existing `{% if settings.quick_add or settings.mobile_quick_add %}...{% endif %}` quick-add-modal block:

```liquid
<!-- BEAM START -->
{% render 'beam-imports' %}
<!-- BEAM END -->
```

  `snippets/beam-imports.liquid` and the rest of the Beam snippet files (`beam-select-nonprofit.liquid`, `beam-cart-setup.liquid`, `beam-config.liquid`, `beam-product-details-page.liquid`, `beam-community-impact.liquid`, `sections/beam-cumulative-impact.liquid`) already exist in this branch, untouched: they're just not included/rendered anywhere yet. This ticket only needs to reconnect the render calls, not recreate the snippets.

**3. `snippets/cart-summary.liquid`**: insert the nonprofit picker inside `.cart-totals__original-container`, as the first child (before the cart-level-discount check):

```liquid
<!-- BEAM START -->
{% render 'beam-select-nonprofit' %}
<!-- BEAM END -->
```

- Caution: don't remove the existing `.page-wrapper`, cart-drawer, or chat-drawer renders in `theme.liquid` while making these edits (new in 4.1.4, unrelated to Beam): see AC #6.

## Implementation Notes:

- All three files edited exactly as scoped; verified with `git diff --stat` that only `config/settings_schema.json`, `layout/theme.liquid`, and `snippets/cart-summary.liquid` changed (no other files touched).
- **`config/settings_schema.json`**: inserted the `Beam` settings object as a new array element immediately after the `t:names.variant_pickers` section's closing `}` (now line 2119) and before the file's final closing `]` (now line 2161). File validates with `python3 -m json.tool`.
- **`layout/theme.liquid`** (at commit time):
  - `web_checkout` cart-tracking `<script>` block inserted right after the `setHeaderMenuStyle()` script's closing `</script>` (line 168) and before `<main` (line 184): landed at lines 170-182. **Superseded by the post-commit follow-up below**: this block no longer lives in `theme.liquid`.
  - `{% render 'beam-imports' %}`, wrapped in `<!-- BEAM START -->` / `<!-- BEAM END -->`, inserted after the existing `{% if settings.quick_add or settings.mobile_quick_add %}...{% endif %}` quick-add-modal block and before `</body>`: still in place, unaffected by the follow-up.
  - **Deliberate deviation from live, per AC #3**: the `console.log('Cart updated:', data);` line inside the `.then(res => res.json())` handler was dropped as scoped cleanup. Everything else in that script (fetch call, headers, body, `.catch(err => console.error('Error:', err))`) matches live verbatim: this holds true in its current location too, see below.
- **`snippets/cart-summary.liquid`**: `{% render 'beam-select-nonprofit' %}`, wrapped in `<!-- BEAM START -->` / `<!-- BEAM END -->`, inserted as the first child inside `.cart-totals__original-container`, before the `{%- if cart.cart_level_discount_applications.size > 0 -%}` check: lands at lines 14–16.
- Confirmed via full re-read of both `layout/theme.liquid` and `snippets/cart-summary.liquid` that the `page-wrapper` div, `chat-drawer` render, `cart-drawer` render, `theme-drawer` render, `search-modal` render, and the `quick-add-modal` conditional block are all still intact and unmodified: only additive changes were made, aside from the one `console.log` line explicitly scoped for removal.
- Ran `npx shopify theme check`: 38 errors / 18 warnings reported theme-wide, all pre-existing (missing app theme blocks for shop-the-look/true-fit/yotpo, a remote Yotpo script asset, and an oversized pagination limit in `templates/search.bss.product.labels.liquid`): none in the three files touched by this ticket. `grep -n -i beam` across all three files confirms the expected references are present.
- No new Beam snippet/section files were created: `beam-imports.liquid`, `beam-select-nonprofit.liquid`, and the other Beam snippets already existed untouched on this branch per the ticket's Dev Notes; this ticket only reconnected the render calls and settings.
- Committed as `e709c65` on `develop/feature/THREADS-12847605177-beam` (not pushed).
- **Follow-up, post-commit**: the `web_checkout` script was moved out of the inline `<script>` block in `layout/theme.liquid` into its own module, `assets/web-checkout-attribute.js`, loaded via `snippets/scripts.liquid` as `<script src="..." type="module" defer>` (matches this theme's existing pattern, e.g. `page-view-event.js`) and deferred with the theme's own `onDocumentReady` helper (`@theme/utilities`). Same behavior, cacheable external file instead of inline, doesn't compete with critical-path resources at parse time. Considered but rejected: skipping the redundant per-pageview POST via a `{% unless cart.attributes.web_checkout == 'true' %}` Liquid guard: rejected because it risks baking visitor-specific cart state into potentially-cached page HTML (this theme deliberately avoids that pattern elsewhere, see `CLAUDE.md`'s Section Rendering API note); a `sessionStorage`-based skip was also considered and rejected as unreliable if the attribute gets cleared server-side without the client knowing. Left as an unconditional per-pageload POST, same as live, just no longer inline/blocking.
- **Provenance correction on the `web_checkout` script**: this was originally treated as bundled with the Beam work purely because it lives in the same file and the client's own roadmap ticket (ST18a) groups both fixes together procedurally. That connection is **not confirmed**. Verified live on the published theme (129595539538): searched all 110 loaded scripts (theme + every installed app: Beam, Rebuy, Yotpo, Swym) for the string `web_checkout`, zero matches outside this one script. Checked `/cart.js` on a live cart: every other app-attributed cart attribute follows a clear naming convention (Rebuy: underscore-prefixed; another app: `azfy_`-prefixed): `web_checkout` matches neither. No public documentation found for this attribute name either. It was restored as-is per AC3 because the client's ticket asked for it, but its actual purpose/consumer is unconfirmed: worth asking the client directly before assuming it's load-bearing for Beam or anything else.
- **API key exposure resolved (2026-09-09)**: reviewed Rebuy's Smart Cart App admin panel (`rebuyengine.com/admin/smartcart/edit/36225`, Beam Impact integration block). Beam's own setup instructions there read: "Contact the Beam team ... Once approved, you will be given an API Key, Chain Id, Store Id, and Version Number which you will add to the Beam Smart Cart App configuration." The exact same key value present in this theme's schema default (`p-CuQxQZfFO0DP.a13dbf25-...`) is entered in that panel's plaintext "Api Key" field, alongside Store Id `626` and Chain Id `415`, matching the schema values verbatim. This confirms the key is issued by Beam specifically for client-side widget configuration, not a server-side secret. Closes the open Clarifying Question below.

## Testing Notes:

- **AC1 (Beam settings)**: In the Shopify theme editor, go to Theme Settings and confirm a "Beam" section appears with six fields: SDK Version (`v1.56.2`), API Key (`p-CuQxQZfFO0DP.a13dbf25-50f1-41be-885d-efa36bb21158`), Chain ID (`415`), Store ID (`626`), Store Domain (`shopsocialthreads.com`), and Base URL (`https://api.beamimpact.com`): all pre-populated with these default values.
- **AC2 (beam-imports include)**: Load any storefront page, view page source, and confirm a `<!-- BEAM START -->` / `{% render 'beam-imports' %}` output / `<!-- BEAM END -->` block appears immediately before `</body>`. Confirm the Beam widget script itself loads (check Network tab for a request pulling in the Beam SDK).
- **AC3 (web_checkout tracking)**: Open browser DevTools → Network tab, load any page, and confirm a `POST` request fires to `/cart/update.js` with a JSON body containing `attributes: { web_checkout: "true" }`. Open the Console tab and confirm no `"Cart updated:"` log line appears (only a `console.error('Error:', ...)` would appear, and only if the fetch fails).
- **AC4 (nonprofit picker)**: Add any item to the cart, open the cart drawer or cart page, and confirm the nonprofit picker (rendered by `beam-select-nonprofit`) appears above/before the subtotal line in the cart totals area.
- **AC5 (API key unchanged)**: Diff the `beam_api_key` default in `config/settings_schema.json` against the value on `main` (`git show main:config/settings_schema.json | grep -A1 beam_api_key`) and confirm they match exactly: no masking, truncation, or reformatting.
- **AC6 (no regressions)**: On the same page load used for AC2/AC3, confirm: the cart drawer still opens and functions normally when the cart icon is clicked; the quick-add modal still opens from a product card (if `settings.quick_add` or `settings.mobile_quick_add` is enabled); the chat/Inbox drawer still renders and opens as before. None of these should differ in behavior from the pre-change theme.

## Bugs from QA:

- TBD

## Clarifying Questions:

- ~~Does the client know who set up the Beam integration, and can they confirm what the API key can actually do?~~ **Resolved (2026-09-09):** Beam's own Rebuy Smart Cart App integration panel confirms this key is issued for client-side widget configuration, not a private credential. See Implementation Notes.
- None remaining.
