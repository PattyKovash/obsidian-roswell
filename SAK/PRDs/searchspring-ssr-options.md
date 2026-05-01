## Option A: Pre-render to Theme Snippets

### Architecture

A webhook-triggered service receives `products/update` and `inventory_levels/update` from Shopify, calls the Searchspring API for affected collections, renders the product grid HTML, and writes it to a generated theme snippet via the Shopify Admin API `themeFilesUpsert` mutation. Liquid outputs the snippet directly into `#searchspring-content` on page load. Shopify serves it as part of the normal HTML response.

Snippets are named by collection handle (`ss-prerendered-bags.liquid`) and live in the theme but are never edited by developers — a normal theme deploy from the repo won't touch them. A cleanup process handles deleted collections.

Snap loads in the background, `beforeSearch` middleware detects pre-rendered content and suppresses the initial render. First user interaction hands off to Snap normally — identical to Option B.

### Tickets

1. **Webhook service** — build and host a webhook receiver (Shopify `products/update`, `inventory_levels/update`), call Searchspring API for affected collections, render HTML, write snippet to theme via Admin API
2. **Server-side product grid template** — same as Option B: match Snap-rendered markup, images with srcset/sizes, price, title, badges, facet list, merchandising banners
3. **Snap handoff** — identical to Option B: `beforeSearch` middleware suppresses initial render, verify filter/sort/pagination interactions post-handoff
4. **Analytics / beacon parity** — identical to Option B: manually fire Searchspring impression beacons for pre-rendered tiles, verify no double-firing
5. **QA, performance validation, rollout** — CWV before/after, cross-device QA, phased rollout, rollback procedure

### Estimate

| Ticket | Without AI | With AI |
|--------|-----------|---------|
| Webhook service | 48–64 hrs | 24–32 hrs |
| Server-side product grid template | 47–61 hrs | 24–31 hrs |
| Snap handoff | 18–26 hrs | 12–17 hrs |
| Analytics / beacon parity | 30–38 hrs | 17–21 hrs |
| QA, performance validation, rollout | 50–64 hrs | 44–56 hrs |
| **Total** | **193–253 hrs** | **121–157 hrs** |

~5–6.5 weeks without AI / ~3–4 weeks with AI at 40 hrs/week

---

## Option B: Edge Worker (Cloudflare)

### Architecture

Edge Worker intercepts every collection page request. Checks KV cache first — hit returns immediately, miss fetches Shopify HTML and Searchspring API in parallel, injects the product grid into the empty `#searchspring-content` div, caches the result, returns complete HTML to the browser.

Shopify webhooks (`products/update`, `inventory_levels/update`) fire on any product change, hit a receiver Worker that identifies affected collections via the Admin API, and purges those KV keys. Staleness window is seconds.

Snap loads in the background, `beforeSearch` middleware detects the pre-rendered content and suppresses the initial re-render. First user interaction hands off to Snap normally.

### Tickets

1. **API integration + caching** — CF Worker setup, Searchspring API client, KV caching, Shopify webhook receiver, cache invalidation on product changes
2. **Server-side product grid template** — match existing Snap-rendered markup: images with srcset/sizes, price, title, badges, facet list, merchandising banners
3. **Snap handoff** — `beforeSearch` middleware suppresses Snap's initial render, leaving pre-rendered cards untouched until first user interaction
4. **Analytics / beacon parity** — manually fire Searchspring impression beacons for pre-rendered tiles, verify no double-firing on interaction
5. **QA, performance validation, rollout** — CWV before/after, cross-device QA, phased rollout, rollback procedure

### Estimate

| Ticket | Without AI | With AI |
|--------|-----------|---------|
| API integration + caching | 78–104 hrs | 40–53 hrs |
| Server-side product grid template | 47–61 hrs | 24–31 hrs |
| Snap handoff | 18–26 hrs | 12–17 hrs |
| Analytics / beacon parity | 30–38 hrs | 17–21 hrs |
| QA, performance validation, rollout | 50–64 hrs | 44–56 hrs |
| **Total** | **223–293 hrs** | **137–178 hrs** |

~5.5–7.5 weeks without AI / ~3.5–4.5 weeks with AI at 40 hrs/week

---

## Comparison

| | Option A | Option B |
|-|----------|----------|
| LCP improvement | Same | Same |
| Shopify support | Fully supported | Unsupported (O2O) |
| Infrastructure | Hosted webhook service | Cloudflare Workers + KV |
| Cache invalidation | Re-render + write snippet on webhook | Delete KV key, lazy re-fetch on next request |
| Staleness window | Seconds | Seconds |
| Complexity | Lower | Higher |
| Hours (with AI) | 121–157 hrs | 137–178 hrs |
| Hours (without AI) | 193–253 hrs | 223–293 hrs |

**Option A Pros**
- Fully supported by Shopify — no O2O disclaimer, no risk of breaking silently
- Simpler infrastructure — no Cloudflare Workers, no KV namespace, no edge DNS configuration
- Theme snippets are fast — served directly by Shopify's CDN with no additional hops
- Webhook service can be reused for other automation tasks
- Easier to debug — rendered HTML is inspectable directly in the theme

**Option A Cons**
- Requires hosting a webhook receiver service
- On first deploy, all collections need an initial render pass before any snippet exists
- A deleted collection leaves an orphaned snippet file unless a cleanup process is built
- Writing to a live theme programmatically requires discipline around naming conventions and deploy hygiene

**Option B Pros**
- No hosted service needed — everything runs on Cloudflare's infrastructure
- Cache miss re-fetches lazily on next request — no re-render job to run
- Easier to extend to search queries in the future (Option A can't pre-render arbitrary search queries)
- KV purge is simpler than re-rendering and writing a file on every product change

**Option B Cons**
- Shopify explicitly does not support O2O proxy configurations — could break without warning ([Shopify Help Center](https://help.shopify.com/en/manual/domains/troubleshoot-issues-with-domains))
- More moving parts: Worker, KV, DNS configuration, webhook receiver, parallel fetch logic
- Cold cache misses add latency (two upstream fetches before responding)
- Harder to debug — rendered HTML is only visible at runtime, not inspectable in the theme
