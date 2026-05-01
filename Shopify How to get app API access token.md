# How to Get a Shopify App API Access Token

## Which method do you need?

### Permanent token — Partner Dashboard OAuth redirect

Use this for internal tooling, CLI scripts, or any situation where you're accessing a store you or a client owns. This produces a token that doesn't expire and doesn't require a running server or hosted backend. It works for live stores, dev stores in a different org, and any store you have collaborator access to.

This is the method documented below.

### Client credentials grant

Use this when your app and the store are in the **same Shopify Dev Dashboard organization** — meaning the store appears under Dev stores in the same org as your app in the Dev Dashboard. This is simpler to implement (no OAuth redirect required) and is the flow Shopify officially recommends for same-org dev tooling.

It will **not** work across organizations. If the store is in a different org, or is a store you don't own, Shopify rejects the request with:
> `Client credentials cannot be performed on this shop`

See the [official docs](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens?lang=node) for the client credentials implementation.

---

## Getting a permanent token

Shopify's official docs only cover tokens that expire in 24 hours. A permanent token requires the OAuth authorization code flow, which needs a redirect URL. For script-only tools with no hosted backend, you can use an extension-only app with Shopify's own URL as the redirect — no local server required.

> **Note:** If you change the app's access scopes, repeat this process to get a new token.

### Prerequisites

- A [Shopify Partner account](https://partners.shopify.com)
- The [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) installed (`npm install -g @shopify/cli`)
- Owner or collaborator access to the target store

### Step 1: Create the app in the Partner Dashboard

1. Go to [partners.shopify.com](https://partners.shopify.com) → **Apps** → **Create app** → **Create app manually**
2. Name it and click **Create**
3. Copy your **Client ID** and **Client Secret** from the app settings page

### Step 2: Set up the app locally

```bash
shopify app init
```

Connect to the existing app when prompted, then replace the generated `shopify.app.toml` with the following. Update `client_id`, `name`, and `scopes` for your use case:

```toml
client_id = "YOUR_APP_CLIENT_ID"
name = "YOUR_APP_NAME"
application_url = "https://shopify.dev/apps/default-app-home"
embedded = false

[build]
automatically_update_urls_on_dev = false

[webhooks]
api_version = "2026-04"

  [[webhooks.subscriptions]]
  topics = [ "app/uninstalled" ]
  uri = "/webhooks/app/uninstalled"

  [[webhooks.subscriptions]]
  topics = [ "app/scopes_update" ]
  uri = "/webhooks/app/scopes_update"

[access_scopes]
scopes = "your required scopes"
optional_scopes = []
use_legacy_install_flow = false

[auth]
redirect_urls = [
  "https://shopify.dev/apps/default-app-home/auth/callback",
  "https://shopify.dev/apps/default-app-home/auth/shopify/callback",
  "https://shopify.dev/apps/default-app-home/api/auth/callback"
]
```

Then deploy:

```bash
shopify app deploy
```

### Step 3: Install the app and get your token

Follow [this YouTube video](https://www.youtube.com/watch?v=8dymQjcylv8) to complete installation and retrieve the token.

**Differences from the video:**
- For extension only apps, you can use `https://shopify.dev/apps/default-app-home/auth/callback` as the redirect URL instead of `localhost`. You'll get a 404 after the redirect, but the token is still generated. If you are using an app that is already hosted, you can use that url too. It has to be whitelisted in the redirects_url list of the app toml.

- Instead of using params use either `form-data`, `urlencoded`, or `json` to send the `client_id`, `client_secret`, and `code` in the `/oauth/access_token` request.

### Step 4: Store the token

Save the token somewhere secure (e.g. a `.env` file). Never commit it to version control.
