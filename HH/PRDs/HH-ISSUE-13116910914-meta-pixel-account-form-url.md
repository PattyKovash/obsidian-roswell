---
monday_id: 13116910914
project_key: HH
authored: 2026-09-30
---

## Background:

-  Meta Business notified Brian Chun (Hat Heaven) on 2026-09-19 that **Hat Heaven's Pixel (New) (`998522800294842`)** is receiving a blocked parameter: `customer[last_name]`. Meta blocks the data, and repeat violations can restrict the pixel (custom conversions, custom audiences).
-  Hawk SEM (Natalie Hughes, 2026-09-23) traced it to a `last_name` value appearing in a page URL during the customer journey and asked that it be removed.

## Necessary Info (Design/Documentation):

-  Affected surface: account details form on `/pages/customer` (template `page.customer.json` → section `rs-account-edit`).
-  The pixel is installed by the **Facebook & Instagram** Shopify app (Customer Events web pixel), data sharing set to **Enhanced**. It reports the full page URL, query string included, on every event. The app has no setting to strip URL parameters.
-  GA4 (Explore → Page path + query string contains `last_name`) shows `/pages/customer?customer[first_name]=…&customer[last_name]=…` page views on live.
-  The form saves through the Storefront API (`POST /api/graphql`, `customerAccessTokenCreate` then `customerUpdate`) in `shopify/assets/rs-script.js`, not a native Shopify form post.
-  No new design required.

## Constraints / Scope:

-  In scope: the account details form on `/pages/customer` only.
-  Form input names stay as-is. Meta's automatic `SubscribedButtonClick` event sends the form's field **names** (e.g. `customer[last_name]`) in `cd[formFeatures]`, but no values; names and emails are sent only hashed (`udff`). Not addressed by this ticket.
-  The error message on a failed save stays the existing generic string (`customer.account.update_error_msg`).
-  Out of scope: the login form (`registerOnLoginListener`) and forgot-password button (`RegisterRecoverPasswordListener`) bind their listeners the same way and can lose them to the same Vue mount race. They don't leak data to URLs.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Saving account details on `/pages/customer` never adds customer fields (`customer[first_name]`, `customer[last_name]`, `customer[email]`, `customer[password]`) to the page URL, including when the form's JavaScript handler does not run. |   |  ✅ |   |
|  2 |  Updating first and/or last name with the correct password saves, shows "Successfully updated customer information", and the new values persist after reload. |   |  ✅ |   |
|  3 |  Updating the email address with the correct password saves, shows the success notice, and the new email persists after reload. |   |  ✅ |   |
|  4 |  Submitting with an incorrect password shows "An error occurred while processing your request.", re-enables the Save button, sends only one `/api/graphql` request, and does not freeze the tab. |   |   |   |
|  5 |  Submitting with the password field blank (when shown) shows the same error notice and re-enables the Save button. |   |   |   |
|  6 |  After saving account details, the Meta pixel `PageView` requests (`facebook.com/tr`) contain no `customer%5B` in the `dl=` parameter. |   |  ✅ |   |
|  7 |  Login, logout, and "Forgot password" work as before. |   |   |   |

## Dev Notes:

-  File paths, line numbers, and code below reflect a review at authoring time. Confirm they still hold before implementing.

**Root cause: form falls back to a native GET**

-  `shopify/sections/rs-account-edit.liquid` (~line 38, before fix): `<form data-action="update-customer" …>` had no `method` or `action`. HTML defaults to **GET to the current URL**, so any native submit serializes the inputs into the query string.
-  `shopify/assets/rs-script.js` (`registerAccountUpdateListener`, ~line 663 before fix) bound the `submit` listener directly to the form element once, from `init()` on `DOMContentLoaded`. `preventDefault()` in that listener was the only thing stopping the GET.
-  `src/main.js` ~line 17: `await okendoConfigure(i18n);` (top-level await, added with the Okendo reviews widget, Oct–Nov 2025) delays `new Vue({ el: '#app' })`. Vue compiles `#app` from the DOM and replaces it on mount. When mount lands after `DOMContentLoaded`, the listener is left on a detached node and the live form has none.
-  Measured on live `/account/login` (same pattern): unthrottled, Vue mounted ~14 ms before `rs-script.js` init; at 4× CPU throttle, Vue mounted ~500 ms **after** init in 2 of 3 loads and the form node was replaced.

**Secondary bug: infinite recursion on token failure** (present since `e5f8a20e`, 2022-08-02)

-  `fetchToken` uses a synchronous XHR (`xhr.open("POST", GRAPHQL_URL, false)`, ~line 401). On a null token it calls `clearToken()`, which dispatches `RS:Account:tokenSet`, the same event `updateCustomer`'s `fetchTokenHandler` listens for. The handler called `updateCustomer` before removing itself, so it retried forever: `RangeError: Maximum call stack size exceeded`, a burst of `customerAccessTokenCreate` requests, and a frozen tab.
-  Unreachable on live whenever the submit listener was lost; the delegation fix makes it reachable on every failed login, so it's fixed here.

**Fix**

-  `rs-account-edit.liquid` ~line 39:

```liquid
<form method="post" onsubmit="return false;" data-action="update-customer" data-notification-id="{{- _notification_id -}}">
```

-  `rs-script.js`, delegate from `document` in `setupGlobalEventDelegation()` (~line 859) and resolve the form with `closest()` (~line 671):

```js
Account.onAccountUpdateHandler = function onAccountUpdateHandler(e) {
  const form = e && e.target && e.target.closest ? e.target.closest(ACCOUNT_UPDATE_SELECTOR) : null;
  if (!form) return;
  e.preventDefault();
  Account.updateCustomer(form);
};

// setupGlobalEventDelegation()
document.addEventListener('submit', window.theme.RS.Account.onAccountUpdateHandler);
```

-  `rs-script.js` ~line 863, isolate each `init()` step:

```js
function safeRun(fn) {
  try {
    fn();
  } catch (error) {
    console.log('RS:Init: error in ' + (fn.name || 'anonymous') + '. ', error);
  }
}
```

-  `rs-script.js` ~line 590, remove the handler before retrying and only retry with a token:

```js
const fetchTokenHandler = function() {
  document.removeEventListener(Account.TOKEN_SET_EVENT, fetchTokenHandler);
  if (Account.getAccessToken()) {
    Account.updateCustomer(form);
  } else {
    Account.onUpdateErrorHandler(form);
    Account.toggleSubmit(form, null);
  }
};
```

-  `fetchToken` also calls `Account.clearToken()` when the response has errors (~line 437) and when email or password is blank (~line 457), so a pending update always resolves to success or error.

## Implementation Notes:

-  Branch `feature/HH-13116910914-meta-pixel-block`, commit `dac2464` ("fix: keep account edit fields out of the URL").
-  Files changed: `shopify/sections/rs-account-edit.liquid`, `shopify/assets/rs-script.js`. Changes match the Dev Notes fix.
-  `shopify/assets/rs-script.js` is a hand-maintained asset, not webpack output. No build step required.
-  `registerAccountUpdateListener` no longer binds `submit`. It still reveals and enables the password field when no customer token is stored.

## Testing Notes:

-  Environment: `https://hatheaven.com/pages/customer?preview_theme_id=<theme id>`, logged in as a **test customer** (production store; don't use a real customer account). Desktop and mobile.
-  Open DevTools → Network with **Preserve log** on.
-  **AC 1:** Edit fields and click Save Account Details. The address bar stays `/pages/customer`. To simulate the handler not running, reload and run in the Console, then submit: nothing happens and no `?customer[...]` appears.

```js
document.removeEventListener('submit', window.theme.RS.Account.onAccountUpdateHandler)
```

-  **AC 2 / 3:** Change name, then email, with the correct password. The green notice appears; reload and confirm the values persist.
-  **AC 4:** Clear the stored token (`sessionStorage.removeItem('_rs_a_t')`), reload, enter a wrong password, save. The red notice appears, Save is clickable, the Network filter `api/graphql` shows one POST, and there's no `Maximum call stack size exceeded` in the Console.
-  **AC 5:** Same as AC 4 with the password field left blank.
-  **AC 6:** Network filter `facebook.com/tr`. On save, no new `PageView` fires (the page doesn't reload). Open the `SubscribedButtonClick` POST → Payload: `dl` is `https://hatheaven.com/pages/customer` with no `customer[...]`. The Facebook & Instagram app pixel may not fire on every preview; if no `tr` requests appear, verify on live after release.
-  **AC 7:** Log out, log in, and submit "Forgot password" from the login page.
-  **Expected (not a bug):** After you save your details once, the password box disappears. That's normal. You can keep changing your details and clicking Save without typing your password again. The password box comes back after you close the browser tab.
-  Post-release: the GA4 exploration (Page path + query string contains `last_name`) should show no new `/pages/customer?customer[...]` rows.

## Bugs from QA:

-  TBD

## Clarifying Questions:

-  Hawk SEM needs to confirm in Meta Events Manager that the `customer[last_name]` blocked-parameter warning clears after release (Roswell has no Events Manager access to pixel `998522800294842`). Who owns that follow-up with Hawk?
