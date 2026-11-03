---
name: Cart Transform 2026-04 Migration
description: Overall goal and status of migrating the ct-custom-product-transformer Shopify Function to 2026-04 API compatibility
type: project
originSessionId: afe4bab0-62b9-4118-b814-45fe3b66d35a
---
Migrate the `ct-custom-product-transformer` Shopify cart transform function (in `extensions/ct-custom-product-transformer/`) to be fully compatible with the 2026-04 Shopify Functions API. The function handles BaubleBar's checkout customization logic — emoji character pricing, calendar gem pricing, and parent/child bundle merging.

**Why:** The function was partially ported from `BAUBLEBAR_CE_EXT` into this standalone repo with the 2026-04 API version declared in the TOML, but the business logic had not been fully audited for breaking API changes. Running on a mismatched API would silently drop all `lineUpdate` and `linesMerge` operations at checkout.

**What was completed (2026-05-01):**
- Identified and fixed 5 locations where old operation key names were used (`update` → `lineUpdate`, `merge` → `linesMerge`) in `src/cart_transform_run.ts`
- Fixed internal operation guards (`if (op?.update)` → `if (op?.lineUpdate)`) that would have silently dropped all transform operations
- Fixed `no-operations.json` test fixture which was missing all required input fields
- Added `emoji-transform.json` and `merge-operation.json` fixtures covering the lineUpdate and linesMerge code paths
- Updated `.claude/context/extensions/custom-product-transformer.md` with the 2026-04 operation key rename as a permanent constraint

**How to apply:** When resuming work on this extension, all three test scenarios now pass. Next steps before production deploy: build the WASM (`shopify app function build`), run manual testing against the staging store for engraving, emoji, and bundle checkout scenarios.
