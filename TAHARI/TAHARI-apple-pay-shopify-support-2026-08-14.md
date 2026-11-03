On August 13, Alan G wrote:

No worries at all, happy to help and thanks again for the follow-up. I took a closer look at what the review usually involves, and I'm happy to share some more info that might be helpful for you folks.

For the submission itself, the account team will need enough detail to understand both the business need and the experience you’re trying to build. I’d include:
- The intended customer journey on desktop and mobile, including the QR flow and product-page Apple Pay overlay.
- Why Shopify’s current accelerated checkout experience doesn’t meet the requirement.
- Expected annual payment and transaction volume.
- The payment provider you’d plan to work with.
- Who would build, host, and maintain the integration.
- Whether payment must stay onsite or whether a redirect could work.
- Any requirements around subscriptions, saved payment methods, captures, refunds, or other wallets.
- A high-level architecture or buyer-flow diagram, if you have one.
- Any relevant PCI or security documentation, particularly if onsite card processing is part of the proposal.

Right now, there isn’t a standard review timeframe I can quote. It generally depends on whether the merchant is eligible, how complex the request is, how complete the initial proposal is, and whether the reviewing team needs any additional information.

You don’t need to have the full integration designed before starting the conversation. The most useful things to prepare are the exact buyer experience, expected volume, proposed provider and implementation owner, plus any early architecture or compliance material you already have.

From here, the next step would be to connect with the merchant’s Merchant Success Manager. They can review the business case, confirm whether the merchant is eligible for the Custom Payments App review process, and coordinate the submission if it’s a fit.

As mentioned in my last email, these requests are reviewed case by case, so neither eligibility nor approval is guaranteed. I’d recommend waiting for both eligibility and technical feasibility to be confirmed before investing in the build.

If it would be useful, I’m also happy to help your team outline the technical flow before you take it to our Merchant Success folks. As always, just let me know if I can assist with anything else.

All the best,
Alan G. | Developer Support Expert | Shopify Developer Support



On August 14, Alan G wrote:

No problem at all, happy to help.  Just including some information and flows so that you have this on record if you decide to pursue it.
 
Here's a standard custom Payments App flow just for reference:
 
The buyer selects the approved payment method during Shopify checkout.
Shopify creates a payment session and sends it to the payment app through an HTTP POST request to your app's server.
The app communicates with its payment provider to process or authorize the payment (this is where the app's independent Apple logic would likely need to live)
The app reports the session as successful, pending, or unsuccessful via the API (for example)
Shopify then continues or completes the checkout accordingly.
 
The main limitation is that this standard Payments App flow doesn't, by itself, expose Apple’s SDK on a Liquid product page or provide the Hermès-style QR and product-page overlay experience. This logic would have to be built into the app itself. Essentially, the Payment App API acts as a handshake between Shopify and your custom logic hosted elsewhere.
 
I'd recommend including the following in the request to your Merchant Success Manager:
Desktop and mobile journey diagrams, including the QR handoff.
The required product-page behaviour and fallback checkout experience.
Confirmation that Shop Pay and Shop Promise should remain active.
Expected transaction and annual payment volume.
Proposed payment provider and implementation owner.
The concept for integrating Apple Pay independently on the app's client side
Requirements for authorization, capture, voids, refunds, and pending payments.
Any available architecture, PCI, security, and compliance documentation.
 
Your Merchant Success Manager should be able use that information to coordinate the Payments Product review. Approval and technical feasibility aren’t guaranteed as I mentioned, so I’d recommend waiting for confirmation before beginning development around Apple’s SDK or a separate Merchant ID.
 
The relevant API documentation is available here, just attaching for reference!
https://shopify.dev/docs/api/payments-apps/2026-04
 
I hope this helps! As always, let me know if I can help with anything else on my side, happy to help! 
 
All the best,
Alan G. | Developer Support Expert | Shopify Developer Support