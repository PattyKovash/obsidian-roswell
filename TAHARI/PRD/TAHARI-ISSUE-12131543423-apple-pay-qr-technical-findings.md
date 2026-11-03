# Apple Pay QR Desktop Handoff — Technical Findings (Internal)

Scope: independent technical research and live testing performed Aug 2026 to determine whether Elie Tahari's Shopify storefront can replicate Hermès.com's desktop-to-iPhone Apple Pay QR handoff. Internal document, more technical than the PRD it supports. Only verified facts and conclusions are included; open questions still pending Shopify Support's reply are tracked separately in the PRD's Clarifying Questions, not here.

## Bottom line

Not achievable on this Shopify Payments storefront today, for architectural reasons independent of Apple's UI rules. Replicating it would require an Apple Pay integration Shopify does not expose to merchants, and building one ourselves would violate Shopify's merchant Terms of Service. The one live workaround tested (proxy-clicking the real button) is confirmed non-functional on a real device.

## 1. What Hermès actually does (confirmed via live inspection, not inferred)

- Hermès.com loads Apple's official Apple Pay JS SDK directly: `https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js`. `window.ApplePaySession` is defined as a result, including in a non-Safari (Chromium) browser.
- Their "Buy with Apple Pay" button is Apple's own native button (black style variant), not a custom-drawn element.
- Triggering it opens a modal served directly from `applepay.cdn-apple.com`, titled "Scan Code with iPhone," footer "Copyright © 2026 Apple Inc." and "Requires iOS 18 or later."
- Network trace showed a merchant-side `bck.hermes.com/available-payment-methods` call and a GA4 event tagged `event_category: Apple Pay, event_action: Optin`, both a standard Apple Pay JS SDK integration pattern.
- Conclusion: this is Apple's own "Apple Pay on the Web" third-party-browser capability (shipped with iOS 18), not something Hermès engineered. Any site that integrates the real SDK gets this behavior for free.

## 2. What a real Apple Pay Web integration requires (per Apple's own documentation)

To run the SDK for real (not just load the script), a site needs, per Apple's Apple Pay Merchant Integration Guide:

- An Apple Merchant ID
- A domain verification file hosted at `/.well-known/apple-developer-merchantid-domain-association`
- A Payment Processing Certificate, used server-side to decrypt the Apple Pay payment token
- A server that performs Apple's merchant validation (`startSession`) for every transaction, using a Merchant Identity Certificate

## 3. Shopify Payments does not expose any of the above to merchants

- Shopify's own developer docs explicitly instruct developers *not* to generate an "Apple Pay Merchant Identity Certificate" for Shopify Payments integrations, that certificate belongs to Shopify, not the merchant.
- Under Shopify Payments, Shopify holds the Merchant ID, certificate, and merchant-validation server. There is no documented or supported path for merchant/theme code to run the Apple Pay JS SDK independently while still using Shopify Payments as the processor.
- The only sanctioned interface to Apple Pay on a Shopify Payments storefront is Shopify's own `shopify-accelerated-checkout` web component (and its child `shopify-apple-pay-button` element).

## 4. Shopify's native accelerated checkout button — capabilities and limits (live-verified)

- **Closed shadow DOM.** `document.querySelector('shopify-accelerated-checkout').shadowRoot` returns `null` in live testing. No CSS or JS can reach or restyle its internals; the only supported customization is via documented `--shopify-accelerated-checkout-*` CSS custom properties (size, border-radius, box-shadow, etc.).
- **Wallet eligibility is decided client-side by Shopify's own script before rendering**, exposed via `recommended` / `fallback` JSON attributes on the element:
  - Tested in Chromium (non-Safari, no Apple Pay capability): `recommended.name = "shop_pay"`, no Apple Pay candidate offered at all.
  - Tested in real Safari on the same product, with the correct debug params (`?shopify-debug=true&show=ApplePay`): `recommended.name = "apple_pay"`, and the component rendered a real, addressable `<shopify-apple-pay-button slot="button">` child in the light DOM (not inside a closed shadow root itself).
  - Conclusion: Shopify's component does not attempt Apple's iOS 18 third-party-browser flow in non-Safari browsers. This matches Shopify Plus Support's direct statement ("Apple Pay only displays when a customer is on a compatible Apple device using Safari") and multiple unresolved Shopify Community / Apple Developer Forum threads on the same gap, none newer than Aug 2026.
- **Styling is restricted to three Apple-defined artwork variants**: black, white, white-with-outline. No custom colors, shapes, or branding. Independently confirmed by:
  - Apple's own Human Interface Guidelines (three fixed artwork styles; explicitly tells developers not to build their own localized/custom version of the button)
  - Shopify's own help docs (branded buttons, which includes Apple Pay, cannot have colors/fonts customized; only the unbranded "Buy it now" button can)
  - Shopify Plus Support, Aug 6 2026 chat: "the Apple Pay button cannot be customized with CSS... the overall look is fixed by Apple's guidelines and cannot be overridden. This applies regardless of how the button is implemented."
- **Always a distinct element.** The Apple Pay button never merges into or restyles to match a merchant's own Add to Bag/Buy Now buttons. Any "replace our button when eligible" behavior has to be conditional logic the merchant writes themselves (hide ours, show theirs); Shopify does not do this automatically. Confirmed both by the live Safari DOM capture and by Shopify Plus Support directly.

## 5. Contractual blocker: Shopify's merchant Terms of Service

Independently re-verified against the live Terms of Service (last updated Aug 1, 2026) and API License Agreement, not just cited from memory:

- **ToS §4.5:** "You agree to use Shopify Checkout for any sales associated with your online store."
- **ToS §1.8:** "You agree not to work around, bypass, or circumvent any of the technical limitations of the Services, including to process orders outside Shopify's Checkout..."
- **API License Agreement §2.3.18:** apps may not "use an alternative to Shopify Checkout for checkout or payment processing" without Shopify's express written authorization.

**Why this applies here, precisely:** Shopify's own native accelerated checkout buttons already skip the visible checkout *page* for eligible customers (this is normal and compliant), but the transaction is still processed by Shopify's own backend. Shopify's mobile Checkout Kit docs state this explicitly: "the buyer taps the Shop Pay or Apple Pay button, confirms payment in the payment sheet, and if the payment succeeds, **Shopify places the order**." A merchant-built Apple Pay integration (own Merchant ID, certificate, validation server) would instead collect and authorize payment entirely outside Shopify's system, then report a finished order afterward via the Admin API. That is payment processing happening outside Shopify Checkout in the sense the ToS actually prohibits, not merely skipping a page of UI.

## 6. Live workaround testing

### 6.1 Overlay technique (real native button hidden behind a decorative button)

Setup: Shopify's real `shopify-accelerated-checkout` element rendered at ~2% opacity, absolutely positioned directly on top of a decorative "Buy Now" button, so a genuine pointer click lands on the real element.

- Result: mechanically works. A real, trusted click on the invisible real button triggered real navigation into Shopify's hosted checkout (`/checkouts/cn/...&skip_shop_pay=true`).
- Limitation: on the browser under test (Chromium, non-Safari), Shopify's own component had already excluded Apple Pay from its candidate wallets (see §4), so the resulting Express Checkout only offered Shop, PayPal, and Google Pay, no Apple Pay. The overlay technique can only surface whichever wallets Shopify's client logic already decided to offer for that browser; it cannot force a wallet Shopify's own logic excluded.

### 6.2 Proxy-click technique (fake button calls `.click()` on the real Apple Pay element via JS)

Setup: a decorative "Buy with Apple Pay" button's click handler synchronously called `.click()` on the real `shopify-apple-pay-button` element (no `await`/`setTimeout` between the two).

- **iPhone, Safari (real device):** the click reached the real element, but was flagged `Event.isTrusted: false` by the browser (confirmed via a capture-phase listener logging the event). No `ApplePaySession` was invoked; no payment sheet or system dialog appeared. Verified this was not an async-timing issue, the call chain was fully synchronous.
- **`Event.isTrusted` cannot be forced to `true` from page JavaScript in any current browser.** This is an engine-level, unforgeable property read from native code, independently confirmed via MDN documentation and browser-vendor bug trackers (Mozilla/Chromium). It exists specifically to prevent this class of proxy-click technique.
- **MacBook Pro, Safari:** the same technique produced a native macOS Apple Pay system dialog ("Add cards to Apple Pay to make purchases on this Mac"). This result is not treated as evidence the technique works: Safari's Web Inspector was open with its "Emulate User Gesture" console feature visible in the same screenshot, a DevTools-only affordance that artificially marks the next action as a trusted gesture. It is not available to a real site visitor. The iPhone result (real device, no DevTools) is the reliable data point, and it is a hard fail.
- **Conclusion:** the proxy-click workaround is confirmed non-viable. This is a categorical browser restriction, not a fixable implementation detail.

## 7. Business context (client-provided data, not independently verified)

Trailing 12 months (Aug 2025–Aug 2026), by digital wallet:

| Method | Orders | Gross Revenue | % of Total |
|---|---|---|---|
| Shop Pay | 12,186 | $5,371,491.79 | 54.82% |
| Standard (no wallet) | 8,333 | $3,160,822.25 | 32.26% |
| Apple Pay | 2,076 | $959,092.92 | 9.79% |
| Shop Pay Installments | 810 | $292,545.82 | 2.99% |
| Google Pay | 38 | $14,526.06 | 0.15% |

Apple Pay already converts a meaningful share of orders (9.79%, ~$959K) through Shopify's standard checkout for eligible Safari/Apple-device customers, independent of the custom PDP button or the QR feature under investigation. Shop Pay is the dominant accelerated checkout method by a wide margin.

## 8. Conclusion

The QR handoff is a real, verifiable Apple capability, not a Hermès-specific build, but it cannot be replicated on this store under Shopify Payments:

1. The certificate and merchant-validation infrastructure it requires is held entirely by Shopify, not exposed to merchants.
2. Shopify's own accelerated checkout component has not adopted this specific Apple capability as of Aug 2026.
3. Building an independent integration to get it would violate Shopify's Terms of Service (§4.5, §1.8) and API License Agreement (§2.3.18).
4. The one client-side workaround that could theoretically route around Shopify's component (proxy-clicking the real button) is confirmed broken by browser design, not by our implementation.

The only path that could legitimately close this gap is Shopify shipping native support for the iOS 18 third-party-browser flow in their own accelerated checkout button, or a certified Shopify Payments App implementing it on Shopify's behalf. Neither exists today per this research.
