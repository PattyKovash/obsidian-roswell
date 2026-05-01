# Review: Shopify API Access Token Doc

## Context

This is a review of an internal doc titled "How to Get a Shopify App API Access Token." The doc describes a workaround for obtaining a permanent API access token using an extension-only app and Shopify's OAuth redirect flow. It was written to address the gap left by Shopify's transition away from legacy custom apps.

The doc should be evaluated against the current official Shopify documentation:
https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens?lang=node

---

## Platform Change Summary

As of January 1, 2026, Shopify no longer allows custom apps to be created from the store admin. All new apps must be created through the **Shopify Dev Dashboard** (part of the Shopify Dev Platform) and installed on the store separately. The old flow of copying a permanent token directly from the admin UI is gone. The new standard is the **Client Credentials Grant** — an OAuth-based flow using a Client ID and Client Secret.

---

## Assessment of the Existing Doc

### What it gets right
- Correctly identifies that Shopify's official docs historically only covered 24-hour tokens
- The extension-only app + redirect URL workaround (`https://shopify.dev/apps/default-app-home`) does work for obtaining a permanent token without a hosted backend
- Useful for one-off migration scripts and internal CLI tooling

### What is now outdated or problematic
- The workaround routes around Shopify's intended flow using the Partner Dashboard and an OAuth redirect hack, which is more convoluted than the current official approach
- The doc does not reference or link to the official Shopify Dev Dashboard token documentation
- The premise that you need a workaround to avoid per-request token fetching is no longer accurate (see below)

---

## Key Finding: Token Caching

A major concern motivating the workaround was avoiding token fetching on every API request without a hosted backend. The official Shopify Node.js example resolves this with in-memory caching:

```js
let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiresAt - 60_000) return token;
  // fetch new token only when expired or about to expire
}
```

Tokens are valid for 24 hours (`expires_in: 86399`). For scripts and CLI tools running in a single process, in-memory caching is entirely sufficient — no hosted backend required. A new token is only fetched when the current one is within 60 seconds of expiry.

The "no hosted backend" concern only becomes relevant for long-running services across multiple processes or instances. For internal tooling, this is a non-issue.

---

## Recommendation

The existing workaround doc should be **replaced or significantly updated** to align with the official Client Credentials Grant flow. The official approach is:

1. Create an app in the Dev Dashboard
2. Store `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, and `SHOPIFY_CLIENT_SECRET` in a `.env` file
3. Use a `getToken()` helper with in-memory caching to exchange credentials for a token programmatically
4. Pass the token in the `X-Shopify-Access-Token` header on API requests

This is simpler than the current workaround, requires no redirect URL gymnastics, no hosted backend, and is fully supported and documented by Shopify.

### Suggested doc updates
- Replace the OAuth redirect workaround with the Client Credentials Grant flow
- Add the official Shopify docs link as the primary reference
- Include or link to the official Node.js example: https://github.com/Shopify/example-auth--client-credentials-grant--node
- Note that token caching handles the "no hosted backend" concern natively
- Add a note that the `client_id` and `client_secret` are NOT the same as the old API Access Token — they must be exchanged for one via the token endpoint first
- Retain a brief note about the old workaround for historical context if needed, but mark it as superseded

---

## References

- Official token docs: https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens?lang=node
- Dev Dashboard app creation: https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard
- Official Node.js example: https://github.com/Shopify/example-auth--client-credentials-grant--node
- Shopify changelog (legacy custom app deprecation): https://changelog.shopify.com/posts/legacy-custom-apps-can-t-be-created-after-january-1-2026
