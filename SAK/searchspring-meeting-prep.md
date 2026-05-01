# Searchspring Meeting Prep

## Questions for the Client

**On the actual goal**
- When you say collection pages are slow — is this something you're seeing in data (Google Search Console, PageSpeed Insights) or is it a felt experience?
- Is there a specific metric you're trying to hit — LCP under a certain threshold, a PageSpeed score, a Core Web Vitals pass in Search Console?
- Is this affecting SEO rankings, conversion, or is it more of a general quality concern?

**On scope**
- Is this purely collection pages, or does search results performance matter equally?
- Are all collections equally important or are there priority collections (top traffic, upcoming campaigns)?
- Is the goal the initial page load only, or does filter/sort interaction speed matter too?

**On constraints**
- Are you open to any technical approach, or are there platform or budget constraints we should know about?
- What's the timeline driving this?

**On Searchspring**
- Has Searchspring flagged any performance concerns or suggested anything on their end?

---

## Questions for Searchspring

**API / Server-side**
- For a standard non-headless Shopify store, do you have a recommended approach or any existing customers who have implemented server-side rendering of initial collection results?
- Is there an API key required for server-side calls, separate from the siteId?
- What are the rate limits for server-side API calls?
- For server-side calls, how should `userId` and `sessionId` be handled when there's no browser cookie available?
- Are there any fields in the product response that need to be explicitly enabled in the Searchspring dashboard?

**Snap**
- Can `beforeSearch` middleware cancel the initial search call without side effects — specifically, will it break analytics, merchandising, or any other Snap subsystem?
- Is there a supported or recommended pattern for pre-rendering results and suppressing Snap's initial render?
- Are there any active custom configurations on this account that would affect what the API returns vs. what Snap renders?

**Account / Data**
- What fields are currently enabled for display in the API response for this siteId (`jvj64l`)? Specifically badges, sale indicators, any custom fields
- Are there any collection-specific merchandising campaigns or pinned products that a server-side render needs to account for?

---

## Searchspring Docs Summary

### API Endpoint

Single endpoint for both search and collection pages:
```
GET https://{siteId}.a.searchspring.io/api/search/search.json
```
Collections use `bgfilter` instead of `q` to pre-filter results.

### Required Parameters (server-side)
- `siteId` — in the hostname
- `resultsFormat` — must be `json`
- `userId` — from `ssUserId` cookie or generated UUID
- `sessionId` — from `ssSessionId` cookie or generated UUID
- `pageLoadId` — new UUID per page load
- `domain` — full URL of the current page
- `HTTP_X_FORWARDED_FOR` header — required for server-side calls, passes the customer's actual IP

### Key Optional Parameters
- `q` — search query (search pages)
- `bgfilter` — background filters for collection pages
- `sort` — should **not** be passed on initial load so merchandising rules apply
- `page` / `resultsPerPage` — pagination
- `shopper` — logged-in customer ID for personalization

### Response Shape
- `results` — product array: `name`, `price`, `imageUrl`, `url`, `sku`
- `facets` — filter options with values and counts
- `pagination` — `totalResults`, `currentPage`, `totalPages`, `perPage`
- `merchandising` — banners, pinned/elevated products, redirects
- `sorting` — available sort options
- `filterSummary` / `breadcrumbs`

### Snap Lifecycle Hooks
- `init` — controller initialization
- `beforeSearch` — fires before API request, can cancel with no `next()` call
- `afterSearch` — fires after API response
- `afterStore` — fires after store state is updated

### SSR in Searchspring Docs
The only documented SSR pattern is for **Shopify Hydrogen** — make direct server-side HTTP requests to the API during the React server render. There is no documented SSR approach for standard non-headless Shopify stores.

### Rate Limiting
No hard public limits documented. Returns `429` when exceeded. Adaptive based on account tier — confirm limits with Searchspring before running a bulk initial render across all collections.
