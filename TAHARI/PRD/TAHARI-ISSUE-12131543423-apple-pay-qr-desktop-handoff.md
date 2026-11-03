## Background:

- User of the Hermès Apple Pay scan-from-desktop feature. On Hermès.com, desktop checkout presents a QR code that the customer scans with their iPhone to complete payment via Apple Pay on mobile. This bridges the gap for desktop shoppers who want the convenience of Apple Pay without a saved desktop credential. Approved as a Phase 2 feature.

- [JT, May 28]: "I buy through Hermès that way all the time — you just scan the QR and pay on your phone."

- Reference: [Hermès product page](https://www.hermes.com/us/en/product/sleeveless-sweater-H6H2666D3A334/) (screenshot on original Monday ticket).

## Necessary Info (Design/Documentation):

- Shopify Plus Support docs shared for this feature (Aug 6, 2026):
  - Accelerated checkout buttons overview: [help.shopify.com/en/manual/online-store/dynamic-checkout](https://help.shopify.com/en/manual/online-store/dynamic-checkout)
  - Showing Apple Pay in a cart drawer or custom button (JavaScript): [shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout](https://shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout)
  - Apple Pay setup and requirements: [help.shopify.com/en/manual/payments/accelerated-checkouts/apple-pay](https://help.shopify.com/en/manual/payments/accelerated-checkouts/apple-pay)
  - Accelerated checkouts with Checkout Kit (mobile): [shopify.dev/docs/storefronts/mobile/checkout-kit/accelerated-checkouts-overview](https://shopify.dev/docs/storefronts/mobile/checkout-kit/accelerated-checkouts-overview)
  - Apple Pay certificates for mobile: [shopify.dev/docs/storefronts/mobile/create-apple-payment-processing-certificates](https://shopify.dev/docs/storefronts/mobile/create-apple-payment-processing-certificates)

- Full Shopify Plus Support chat transcript (Jomica P., Aug 6, 2026), unaltered:

  ```
  19:33 System: An advisor has joined the chat
  19:33 Jomica P. (Support Advisor): Thanks for reaching out! My name is Jomica, a Merchant Success Specialist here at Shopify Plus.
  19:33 Jomica P. (Support Advisor): Hey Maria, great to meet you! Before we get started, I just wanted to double-check, is this regarding the elie-tahari.myshopify.com store?
  19:34 Maria Yoshitha: Hi we have implemented a custom buy button on tahari , we want to show apple pay when applicable is that possbiel we are using paypal
  19:35 Jomica P. (Support Advisor): Thanks for the details, Maria. I want to make sure I point you in the right direction here, so I have a quick clarifying question.
  19:35 Jomica P. (Support Advisor): When you say "custom buy button," are you referring to Shopify's native Buy Button sales channel embedded on an external site, or is this a custom-coded button built directly into your Shopify storefront theme?
  19:36 Maria Yoshitha: custom coded button
  19:36 Maria Yoshitha: https://www.elietahari.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=155400110217
  19:37 Maria Yoshitha: https://support.shopify.io/attachments/019fd894-6856-7c32-8eff-f65674ea6a47
  19:37 Jomica P. (Support Advisor): Got it, Maria. Since this is a custom-coded button, here is what needs to be in place for Apple Pay to show.
  19:38 Jomica P. (Support Advisor): Apple Pay requires a credit card payment provider that supports it. PayPal on its own does not enable Apple Pay. The most direct option is Shopify Payments, which automatically activates Apple Pay for eligible US stores with no extra setup.
  19:38 Jomica P. (Support Advisor): Could you or someone on your team with full admin access check Settings > Payments in your Shopify admin and confirm whether Shopify Payments is currently active on the store? That will help me confirm whether Apple Pay can be enabled for your custom button.
  19:39 Jomica P. (Support Advisor): By the way, the store I am looking at is: elie-tahari.myshopify.com
  19:39 Maria Yoshitha: we don't want to show shop pay button as its off brand
  19:40 Jomica P. (Support Advisor): Good news on that front, Apple Pay and Shop Pay are completely separate. You can have Apple Pay active without showing Shop Pay at all. Shop Pay can be turned off independently in your payment settings without affecting Apple Pay.
  19:40 Jomica P. (Support Advisor): So the key question is still whether Shopify Payments is currently active on the store. Could someone with full admin access check Settings > Payments and let me know? That will confirm whether Apple Pay is already available to enable, or if there are additional steps needed.
  19:40 Maria Yoshitha: can you share the steps , so i can forward to my team who has access to payments
  19:42 Jomica P. (Support Advisor): Here are the steps your team can follow.
  Step 1 - Check if Shopify Payments is active
  Go to Settings > Payments in your Shopify admin and confirm whether Shopify Payments is listed and active. If it is not active, that will need to be set up first, as Apple Pay requires a compatible credit card provider.
  Step 2 - Activate Apple Pay
  Go to Settings > Payments. In the Shopify Payments section, click Manage. Look for the Wallets section and activate Apple Pay from there.
  If your store uses a different credit card provider that supports Apple Pay, go to Settings > Payments, click Manage next to that provider, select Apple Pay in the Wallets section, and click Save.
  Step 3 - Turn off Shop Pay (if not already off)
  In the Shopify Payments section, click Manage and deactivate Shop Pay. This will not affect Apple Pay.
  Step 4 - Dev team action
  Since the buy button is custom-coded, your development team will also need to make sure the button surfaces Shopify's accelerated checkout options. Apple Pay only displays when a customer is on a compatible Apple device using Safari. The payment settings make Apple Pay available, but the custom button implementation controls whether it actually appears.
  19:42 Jomica P. (Support Advisor): Let me know if your team runs into anything along the way.
  19:43 Maria Yoshitha: do youhave any dev docs for implementation
  19:44 Jomica P. (Support Advisor): Of course. Here are the relevant resources for your dev team, depending on how the custom button is built.
  If the button is on your Shopify storefront (web):
  Accelerated checkout buttons overview: https://help.shopify.com/en/manual/online-store/dynamic-checkout
  Showing Apple Pay in a cart drawer or custom button (JavaScript): https://shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout
  Apple Pay setup and requirements: https://help.shopify.com/en/manual/payments/accelerated-checkouts/apple-pay
  If the button is inside a mobile app (iOS or React Native):
  Accelerated checkouts with Checkout Kit: https://shopify.dev/docs/storefronts/mobile/checkout-kit/accelerated-checkouts-overview
  Apple Pay certificates for mobile: https://shopify.dev/docs/storefronts/mobile/create-apple-payment-processing-certificates
  19:44 Jomica P. (Support Advisor): Let me know if you need anything else.
  19:49 Maria Yoshitha: do u have any example of implementation how it would look ?
  can the apple pay button retain cstom cs
  19:49 Jomica P. (Support Advisor): If you would like, I can also send these details and documents to your email at maria.yoshitha@roswellstudios.com right after this chat.
  19:50 Maria Yoshitha: sure
  19:50 Jomica P. (Support Advisor): Great questions. Here is what I can share on both.
  19:51 Jomica P. (Support Advisor): On implementation examples, the Shopify developer docs include a sample app for mobile (ShopifyAcceleratedCheckoutsApp) and the accelerated checkout docs for web show how the button renders in context. Your dev team will find those in the links I shared above.
  19:52 Jomica P. (Support Advisor): On custom styling, the Apple Pay button cannot be customized with CSS. Apple controls the button's appearance, including the branding, shape, and core design. You can choose between a few style variants (black, white, or outline), but the overall look is fixed by Apple's guidelines and cannot be overridden. This applies regardless of how the button is implemented.
  19:52 Jomica P. (Support Advisor): I have taken the initiative to pass your feedback straight to our developers, Maria. They are always on the lookout for ways to enhance the platform, and insights like yours are an absolute goldmine for them.
  19:52 Jomica P. (Support Advisor): The great news is that our team is already reviewing this feature for potential implementation in an upcoming platform update. While we cannot provide an exact timeframe for when it might drop, you can keep a close eye on the latest enhancements by bookmarking the Shopify Changelog and Shopify News.
  19:55 Jomica P. (Support Advisor): It's been a few minutes, just checking to see if we are still connected.
  19:55 Maria Yoshitha: so our buy now will be replaced if we enable apple pay (ios mobile user open the site )
  it wont look similar to anything our button looks in shape
  s that ccccccct?
  19:56 Maria Yoshitha: is that correct *?
  19:57 Jomica P. (Support Advisor): That is correct on the appearance, the Apple Pay button will not match your custom button's shape or style since Apple controls how it looks.
  19:57 Jomica P. (Support Advisor): However, to clarify on the first part, enabling Apple Pay does not replace your custom buy button. The two exist separately. Your custom button stays as is, and Apple Pay appears as an additional option only when a customer is on a compatible Apple device using Safari with Apple Pay set up on their device. Customers on other devices or browsers will not see the Apple Pay button at all and will only see your existing button.
  19:57 Jomica P. (Support Advisor): Your dev team will have control over where the Apple Pay button is placed on the page relative to your custom button.
  19:58 Maria Yoshitha: so we would have three buttons ? or would it replace buy now
  19:59 Jomica P. (Support Advisor): That is entirely up to how your dev team builds it. Since the button is custom-coded, they have full control over the layout.
  19:59 Jomica P. (Support Advisor): They could set it up, so Apple Pay appears alongside your existing button, which would mean eligible Apple users see two buttons. Or they could build logic, so Apple Pay replaces the buy now button only when a customer is on a compatible Apple device using Safari. For everyone else, only the original button shows.
  20:00 Jomica P. (Support Advisor): Neither outcome is automatic. Your dev team decides how it is structured. :)
  20:05 Jomica P. (Support Advisor): I haven't heard from you in a few minutes, so I wanted to check in. I'm still here whenever you're ready to continue.
  20:06 Maria Yoshitha: ook thank you
  20:06 System: Chat ended by client
  ```

- Follow-up email from Shopify Plus Support, unaltered:

  > To show Apple Pay on your custom-coded buy button, the first step is confirming that Shopify Payments is active on the store, as Apple Pay requires a compatible credit card provider. PayPal on its own does not enable it. To check and activate, someone with full admin access can go to **Settings > Payments**. In the Shopify Payments section, click **Manage**, then look for the Wallets section and activate Apple Pay from there. Shop Pay can be deactivated in that same area without affecting Apple Pay.
  >
  > A few things worth noting for your dev team. The Apple Pay button appearance is controlled by Apple and cannot be customized with CSS. You can choose between a few style variants (black, white, or outline), but the core design is fixed. The button will not replace your existing custom buy button. Your dev team has full control over placement and can build logic, so Apple Pay only appears for customers on a compatible Apple device using Safari, while all other customers continue to see your existing button as usual.

## Objective/Acceptance Criteria:

|  **#** |  **Item** |  **Notes** |  **Dev** |  **QA** |
| --- | --- | --- | --- | --- |
|  1 |  Desktop checkout shows Apple Pay option with a scannable QR code. |   |   |   |
|  2 |  Scanning QR on iPhone opens the Apple Pay payment confirmation on mobile. |   |   |   |
|  3 |  Payment completes and order is captured correctly in Shopify. |   |   |   |
|  4 |  Tested across Chrome, Safari, and Edge on desktop. |   |   |   |
|  5 |  Fallback behavior if QR is not scanned (timeout or alternative payment shown). |   |   |   |

## Dev Notes:

- This is a complex integration — Shopify's native Apple Pay does not support this QR handoff natively. Requires investigation into whether this can be achieved via:
  1. A third-party Shopify app that adds QR-code Apple Pay handoff.
  2. Custom implementation using the Web Authentication API or a handoff URL scheme.
- Research phase needed before scoping dev. Confidence is low until approach is validated. Do not commit to a timeline until feasibility is confirmed.

### Feasibility findings (independent research + live testing, Aug 2026)

- Hermès's "Scan Code with iPhone" is Apple's own native Apple Pay JS SDK feature (`applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js`), confirmed by inspecting Hermès.com directly. It is not a custom build. It's a standard Apple Pay on the Web capability for non-Safari/non-Apple browsers, shipped with iOS 18.
- To run that SDK, a site needs its own Apple Merchant ID, domain verification file, Payment Processing Certificate, and a server that performs Apple's merchant validation per transaction. Under Shopify Payments, all of that is held by Shopify, not exposed to merchant/theme code. There is no supported way to run this SDK ourselves through Shopify Payments.
- Shopify's own accelerated checkout component (`shopify-accelerated-checkout`) is Safari/Apple-device gated only and has not adopted Apple's iOS 18 third-party-browser flow as of Aug 2026.
- Building an independent Apple Pay integration outside Shopify Payments to get this flow would mean processing payment outside Shopify Checkout, which [Shopify's merchant Terms of Service](https://www.shopify.com/ca/legal/terms#4-your-responsibilities) (§4.5, §1.8) and [API License Agreement](https://www.shopify.com/legal/api-terms) (§2.3.18) prohibit without Shopify's written authorization.
- Tested the "hidden real button behind a decorative button, proxy-click via JS" workaround live against Shopify's own `shopify-apple-pay-button` element on the PDP.
  - **iPhone, Safari:** the click reaches the element, but the browser flags it `isTrusted: false` (script-generated, not a real user gesture) and Apple Pay does not open. Not a viable workaround on this device.
  - **MacBook Pro, Safari:** a system Apple Pay prompt did appear on click. However, that Mac doesn't have a card set up in Apple Pay, so the full payment flow (real payment sheet, merchant validation) was not confirmed. Result is inconclusive on this device pending a retest on hardware with Apple Pay configured.
- Confirmed with Shopify Plus Support (see transcript above) that the native Apple Pay button's styling is fixed (black/white/outline only, Apple-controlled) and always renders as its own separate button, not a restyle of or merge with our Add to Bag/Buy Now buttons.
- Shopify Support confirmed full Apple Pay button customization (custom CSS/styling beyond black/white/outline) is under internal review with no ETA. This is about button styling in general, not the QR handoff specifically.
- Conclusion: not achievable on Shopify today without dropping or supplementing Shopify Payments with a certified Payments App that implements this flow itself (none currently do, per research). Recommend deprioritizing until Shopify ships native support.
- Still need Shopify Support to confirm or correct our reading on the QR handoff specifically (certificate/merchant-validation architecture, ToS blocker). Follow-up sent, awaiting reply.

### Proof of concept: fake button proxy-clicking the Shopify-injected Apple Pay button

- On an iPhone, the programmatic click is detected as non-human-generated (`isTrusted: false`), which matches what the workaround research flagged as the likely failure mode.

![iPhone Safari console log showing isTrusted: false on the proxy-clicked Apple Pay button](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3169957648/Screenshot%202026-08-10%20at%202.06.39%E2%80%AFPM.png)

## Estimation Notes:

- **Hours Estimate:** 10–16 hrs | **Confidence:** 🔴 Low — Shopify native does not support this; approach TBD

- **Subtask Breakdown:**
  - Feasibility research (app options vs custom): 2–3 hrs
  - Implementation (approach TBD): 5–10 hrs
  - QA across browsers + devices: 2–3 hrs

- **Assumptions / Risks:**
  - A viable Shopify-compatible approach exists (not guaranteed)
  - Shopify checkout extensibility allows the required modification
  - May require a third-party app with associated ongoing cost

## Bugs from QA:

- TBD

## Clarifying Questions:

- Dev to confirm the feasibility spike before committing hours? Recommend yes — confirm with Yoshitha. Phase 2 feature — approved May 28.
- Follow-up sent to Shopify Plus Support (Patty Kovash, Aug 10, 2026, cc Yoshitha) confirming our reading of their Terms of Service and merchant-validation architecture as the actual blocker, plus asking whether disabling Shop Pay is the only way to isolate Apple Pay on the dynamic checkout button, whether "Shop Promise" would override that, and how to detect Apple Pay eligibility ourselves versus relying on Shopify's own detection. Awaiting reply before this ticket can be fully closed out or reopened.
