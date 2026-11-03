Hi Jomica,

Thanks for the info you sent over. I did some research on my end and want to confirm we're understanding your earlier answers correctly, plus ask a few follow-up questions.

Some base context:

- No plans to build a separate mobile app or go headless. We're on Shopify Plus with a Shopify-hosted Liquid theme.

- Shop Pay is by far our dominant accelerated checkout method, so we'd be cautious about disabling it.

First, to confirm we understood you right from before:

- Based on what you told us plus our own research, our understanding is: the only way to make the dynamic checkout button show only Apple Pay (not Shop Pay) is to disable Shop Pay entirely in Settings > Payments > Shopify Payments. There's no setting to hide Shop Pay from the button while it's still active. Can you confirm that's correct?

- Apple, not Shopify, controls the Apple Pay button's appearance. Our only styling options are black, white, or outline, plus whatever CSS variables Shopify exposes. We can't make it match our own button's look outside of those constraints.

- Apple Pay always renders as its own separate button (behavior of dynamic buttons in general), never merged into or restyled to match our Add to Bag or Buy Now. You said we could build our own logic to make it replace Buy Now for eligible customers instead of showing both. Is that right?

- By "build our own logic," do you mean we detect when to show Apple Pay by checking browser/device ourselves, or by adding an observer that watches for the dynamic checkout buttons Shopify injects and checks whether the Apple Pay button is present? Or is there a more reliable way to know which accelerated checkout button was injected, so we key off the same data Shopify button uses?

Now the follow-up questions. The main goal is to give customers the same seamless Apple Pay experience Hermes.com offers. Hermes shows a QR code users can scan with their iPhone to finish paying with Apple Pay. On mobile, Hermes skips the QR step entirely: Apple Pay opens directly as an overlay on the product page, and the customer checks out without ever navigating to a separate checkout screen. We tested Hermes directly and confirmed this is powered by Apple's own Apple Pay JS SDK (applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js), a native Apple Pay Web capability for non-Safari browsers since iOS 18, not something Hermes built themselves. Worth noting Hermes isn't on Shopify, so they may have more flexibility to implement this than we do.

Here's what we think is blocking this on Shopify, and we'd like you to confirm or correct us:

1. Running that SDK requires our own Apple Merchant ID, domain verification file, Payment Processing Certificate, and a server to handle Apple's merchant validation per transaction. Under Shopify Payments, our understanding is Shopify holds all of that, not us, so we can't run this SDK ourselves. Is that accurate?

2. Because of that, the only supported way to show Apple Pay on our storefront is through your shopify-accelerated-checkout component, which is Safari/Apple-device gated and doesn't support the iOS 18 third-party browser flow. Can you confirm there's no setting or workaround that enables the QR flow through Shopify Payments or use of this SDK today?

3. We also checked your Terms of Service. Building this ourselves means our own Apple Merchant ID, certificate, and validation server, collecting and authorizing payment entirely outside Shopify, then reporting a finished order afterward. Our understanding is section 4.5 and 1.8 of the merchant terms don't allow processing payment outside Shopify's system like that without written authorization. Is that correct? Is there an approved path we're missing, like a certified Payments App? And if this matters enough to the merchant, what's the path to getting authorization?

4. Separately: if we disable Shop Pay to make Apple Pay the only wallet on the button, would "Shop Promise" being active override that and still prioritize Shop Pay?

Bottom line: is this simply not possible on Shopify today no matter how it's built, or is there a legitimate path (headless, a specific Payments App, an authorized exception) that avoids violating your terms?

Appreciate you taking a look.
