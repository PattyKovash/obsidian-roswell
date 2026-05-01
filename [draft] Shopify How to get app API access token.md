
Since all new apps must be created through the dev dashboard now, you may wonder where to find the api app access token. From what I initially found, [Shopify only has documentation to generate one that expires in 24 hrs](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens?lang=node). 

There is a way to get a permanent one. The process must be repeated if you update your access scopes.

I found this [YT video](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens?lang=node) helpful. However, instead of using localhost or needing to actually deploy an app for the redirect_uri, you can set up your app as an extension only app, and this still works. 

Extension only apps are when you set embedded = false  in your app toml. For extension only apps, you can set the application_url and redirect urls with the Shopify base url of https://shopify.dev/apps/default-app-home .

So then the redirect_uri to use instead would be https://shopify.dev/apps/default-app-home/auth/callback
. You’ll get a 404, but an access token is still generated.

An example app toml could look like this:

```
# Learn more about configuring your app at 
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
# Learn more at https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes
scopes = "all your access scopes you need your app to have"
optional_scopes = [ ]
use_legacy_install_flow = false

[auth]
redirect_urls = [
  "https://shopify.dev/apps/default-app-home/auth/callback",
  "https://shopify.dev/apps/default-app-home/auth/shopify/callback",
  "https://shopify.dev/apps/default-app-home/api/auth/callback"
]
```
