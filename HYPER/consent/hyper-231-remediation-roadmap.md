# Cookie Consent Remediation: Roadmap

**Hyperlite Mountain Gear · Prepared by Roswell Studios · DRAFT, November 2026**

## Summary

The claim against Hyperlite is that tracking continues after a visitor declines cookies. The most important fixes for that went live Nov 6–7. A small number of tools still send data after a decline, and closing those is the first priority.

Beyond the claim, the largest gap by traffic is the **US states with privacy laws other than California**. They account for about a quarter of all sessions. Visitors there have no banner and no opt-out link, so every tracker runs.

We recommend three phases that build on each other:

| Phase | Focus | Proposed timing |
|---|---|---|
| **1. Close the claim** | A decline stops every tracker named in the claim | To be scoped |
| **2. Opt-out, banner and categorization** | Opt-out for US law states, EU/UK per-category choices, every tag in the right category, vendor questionnaires and contracts | To be scoped |
| **3. Govern** | Policy updates, rights requests, app approval process, ongoing monitoring | To be scoped |

Timing depends on the decisions listed at the end. This plan is a technical roadmap, not legal advice. Items marked **(counsel)** need a legal decision.

## Guiding principles

- **When in doubt, use the strictest category.** Any tool whose purpose we can't confirm is treated as Marketing, so it stays off until the visitor accepts.
- **Hyperlite and its counsel decide the risk.** If a tool can't be gated without breaking a feature, the choice is to turn it off or keep it and accept the risk. We'll lay out the trade-off for each one.
- **For apps that run through Shopify, we can only send the signal.** The site passes the visitor's choice to Shopify, which passes it to app pixels. Whether an app honors it depends on the app. That's why Phase 2 includes contacting vendors.

---

## Where Hyperlite's traffic is, and what applies

Sessions from Nov 9, 2025 to Nov 8, 2026, about 3.63 million in total:

| Region | Sessions | Share | Legal model | Today |
|---|---|---|---|---|
| **California** | 210,674 | 5.8% | Opt-out (CCPA/CPRA), plus CIPA lawsuits over tracking after a decline | Banner, denied default |
| **EU and UK** | 198,529 | 5.5% | Opt-in (GDPR, ePrivacy, UK PECR) | Banner, denied default |
| **Switzerland, Norway, Iceland, Liechtenstein** | 38,792 | 1.1% | Opt-in | Banner, denied default |
| **Florida** | 68,578 | 1.9% | State law may not apply at Hyperlite's size **(counsel)** | Banner, denied default |
| **New Jersey** | 34,796 | 1.0% | Opt-out, with a universal opt-out signal requirement | Banner, denied default (added Nov 7) |
| **Other US states with privacy laws:** Colorado, Virginia, Oregon, Texas, Utah, Iowa, Tennessee, Minnesota, New Hampshire, Montana, Maryland, Indiana, Connecticut, Kentucky, Nebraska, Rhode Island, Delaware | 892,000 | 24.6% | Opt-out. Most require honoring opt-out signals such as GPC **(counsel to confirm list)** | **No banner, no opt-out link, all tracking runs** |
| Other US states (incl. Washington, New York, Massachusetts) | 1,194,535 | 32.9% | No comprehensive privacy law | No banner, all tracking runs |
| Canada | 138,716 | 3.8% | PIPEDA; Québec Law 25 is stricter **(counsel)** | No banner |
| China | 270,568 | 7.5% | Likely largely bot traffic, worth checking | No banner |
| Rest of world | ~583,000 | ~16% | Varies | No banner |


**What this means**
- **Highest litigation risk: California.** This is where lawsuits over "Reject doesn't stop tracking" are being filed. Phase 1 addresses it directly.
- **Highest regulator risk: the EU and UK.** The banner is in place, but visitors can only accept everything or decline everything. This is addressed early in Phase 2.
- **Largest unaddressed audience: the other US law states.** That's about a quarter of all sessions. These laws don't require a banner, but they do require a way to opt out of data sharing for advertising, and most require honoring browser opt-out signals. This is addressed early in Phase 2, after counsel confirms the approach.

---

## Completed (Nov 6–7)

| Change | Result |
|---|---|
| Consent defaults set to denied for the EU/EEA, UK, Switzerland, California, Florida and New Jersey (GTM v100) | Tested on the live site from New Jersey and Germany: no ad tags fire before the visitor answers |
| New Jersey added to the Cookiebot banner regions | Banner shows for New Jersey visitors |
| Microsoft Clarity loads only after Statistics consent; Vibe only after Marketing consent | Neither loads before consent or after a decline |
| If a visitor accepts and then declines on the same page, the page refreshes once | Clarity, Vibe and ad tags stop; tracking cookies are removed |
| Heatmap.com removed from the theme and its Shopify pixel disconnected (Nov 9; kept, not deleted); unused Because script removed | No longer load |
| Cookiebot passes the visitor's choice to Shopify on every change | Shopify's privacy setting updates on the same page |
| Unused Clarity custom pixel deleted | Can't be switched on by accident |

We tested in Germany, California, Florida, New Jersey, and New York/Canada. At each step we compared cookies, browser storage and network requests.

---

## Phase 1: Close the claim (next 1–2 weeks)

**Goal:** a decline stops every tracker named in the claim, and counsel has evidence.

| # | Item | Notes |
|---|---|---|
| 1.1 | **Klaviyo:** stop its tracking until Marketing consent | Named in the claim. Since the Nov 6 fixes, after a decline Klaviyo sets no tracking cookie and sends no browsing or cart events (CA, MA, DE, UK). What remains is its sign-up form script: an anonymous pop-up view count and a few items stored in the browser. Klaviyo considers these form functions, not tracking; we've asked Klaviyo to confirm for Hyperlite. **Recommendation:** keep as is. If counsel prefers (EU/UK storage rules are stricter than US rules): stop only the pop-ups for visitors who decline, or don't load Klaviyo for them (forms, Customer Hub and back-in-stock off for those visitors). **Hyperlite and counsel decide** |
| 1.2 | **Octane AI:** stop its tracking before consent | Octane's site-wide script is added by Shopify on Octane's behalf (a "script tag") and tracks before consent; its new app embed does the same, so don't enable it. We've asked Octane to make its scripts follow consent. As a stopgap we built and tested a theme fix that holds the script until the visitor accepts: after a decline nothing is sent and the quiz still works. It depends on how Shopify adds the script, so it's fragile; ideally Octane fixes it. On the quiz page, the quiz itself still records a visit on load (asked Octane). Shopify stops script tags on Mar 1, 2027. **Hyperlite decides** whether to use the stopgap now |
| 1.3 | **Shopify Customer events:** confirm every pixel respects consent | Done. In our Nov 9 tests from California, Massachusetts, Germany and the UK, every consent-gated pixel waits for consent, including the Shopify copies of Meta, TikTok, Pinterest and Criteo. The duplicates are gated, so we recommend leaving them for now and cleaning up in Phase 2. Elevar's checkout custom pixel was set to run regardless of consent and sent checkout data, including the email, to Elevar after a decline; per Hyperlite's fix list it now requires consent (Nov 9, retested). Wyllo (NoFraud) and BrandChamp are set to "Not required" by their apps: **Hyperlite decides** (classify; accept the risk or contact the vendor) |
| 1.4 | **GA4 and Google Ads:** stop user_id on denied hits; recommend basic vs advanced Consent Mode | user_id comes from Elevar's data layer. Recommendation: stay in advanced Consent Mode (keeps modeled conversions) but stop sending user_id when consent is denied, and remove a duplicate Google Ads tag that has no consent check. Elevar set up these tags and will put changes in a GTM workspace for Hyperlite's approval. Also asked Elevar whether its Strict Consent Mode is needed for server-side data (it lowers conversions reported for visitors who decline). **Hyperlite approves** |
| 1.5 | **Retest and evidence package for counsel** | After 1.1–1.4. Retest from California and the EU with VPN ad blocking off. Deliver written per-tag answers and network screenshots or a recording |
| 1.6 | **Classify Affirm and the fraud tools** (from Hyperlite's deck) | Affirm's script in the theme sets a long-lasting device ID and sends it with the page URL to Affirm on every page, even after a decline; we recommend Marketing (gate it, or remove it if on-site messaging isn't used). Fraud tools (Yofi, FraudLabs Pro, NoFraud) are likely necessary. **Hyperlite and counsel classify** |
| 1.7 | **Additional recommended remediations** (Roswell recommendation) | "Do not sell or share" link (California, about 211,000 sessions a year, 5.8% of all sessions): the banner is a custom Cookiebot template with only Accept and Decline, and California is set to Cookiebot's standard opt-in/opt-out mode, so Cookiebot's "Do Not Sell or Share" option doesn't show (HMG or Cookiebot support to enable if counsel confirms it applies). Per-category choices in the EU and UK (about 199,000 sessions a year, 5.5% of all sessions): switch to a standard Cookiebot banner or add the choices to the custom one, after Elevar confirms the Google tags handle partial consent; doesn't affect California, so HMG may move it to a later phase to stay focused on the claim (see 2.A3). Cookie classifications: HMG and counsel classify Cookiebot's 111 unclassified items (strictest category, Marketing, if unsure), ideally after a fresh scan. Order confirmation page test (needs a test order). Cookiebot setup review: bigger change, later phase; HMG to ask Cookiebot whether their plan includes a setup and Shopify integration review |

---

## Phase 2: Opt-out, banner and full categorization (following 4–6 weeks)

**Goal:** visitors in law states can opt out, the EU/UK banner offers per-category choices, and every tag, script and app has a verified category.
**Sequencing:** the opt-out and banner items come first. Several depend on counsel's decisions, which can be made while Phase 1 is underway.
**Limit:** categorization relies on our judgment and public vendor documentation. Phase 2 confirms it with vendors (2.10).

**First: opt-out and banner**

| # | Item | Notes |
|---|---|---|
| 2.A0 | **Cookiebot setup audit (Hyperlite to request):** once the Phase 1 fixes are in, ask Cookiebot support to review the Cookiebot setup and its integration with Shopify (Customer Privacy API sync, banner regions, GTM template) | If Hyperlite's Cookiebot plan includes support, it's an independent check on the configuration. The setup was built in stages over two years (Cookiebot is loaded through GTM). Points to check: how GTM and Cookiebot are installed vs Cookiebot's Shopify guide, whether to link the existing Cookiebot account to the Cookiebot Shopify app, and that Shopify's consent regions match Cookiebot's (confirmed for Germany and California on Nov 9; Florida and New Jersey not yet checked). Shopify's own cookie banner stays off. If auto-blocking is considered, check its effect on Klaviyo: Klaviyo users report Cookiebot blocking also hides sign-up forms for visitors who decline. Also decide whether the theme's own gated scripts (Clarity, Vibe) should use Cookiebot's standard markup (`type="text/plain" data-cookieconsent="statistics"`) instead of our bridge's queue; the bridge would still sync consent to Shopify and handle withdrawals. Test on the dev theme first, including with Cloudflare Rocket Loader. |
| 2.A1 | **"Your Privacy Choices" / "Do Not Sell or Share" link** in the footer, connected to a working opt-out | For US law states (about 1.1 million sessions). Counsel may prefer showing it to all US visitors rather than state by state, which is simpler to maintain **(counsel)** |
| 2.A2 | **Honor Global Privacy Control (GPC)** as an opt-out | Required in California and most other law states. We'll confirm Cookiebot's setting **(counsel)** |
| 2.A3 | **EU/UK per-category choices:** add a "Customize" option with Preferences, Statistics and Marketing toggles | Recommended to HMG as a Phase 1 additional remediation (1.7); stays here if HMG defers it. EU and UK regulator guidance (EDPB, CNIL, ICO) expects consent per purpose. The banner is a custom Cookiebot template (Accept and Decline only), so this means switching to a standard Cookiebot banner (built-in "Customize") or adding checkboxes to the custom template; ask Cookiebot whether the EU/UK can get a different banner from the US. Before enabling it, confirm with Elevar that each destination's consent categories still fit when visitors can choose per category (for example, Google Ads requires Marketing, Statistics and Preferences). |
| 2.A4 | **Fix the privacy page cookie section** | Cookiebot's cookie list displays, but its consent controls vary: "Withdraw" only after Accept, the whole panel hidden for implied consent (outside banner regions), and its "Do not sell or share" link hidden in every state (likely a Cookiebot setting). This is where visitors change their choice later |
| 2.A5 | **Unverified apps:** Swym, Shogun and Triple Whale set tracking storage before the visitor answers; Gorgias chat loads before consent (what it sends before chat opens not yet tested) (Intelligems resolved Nov 9: app embed turned off on live, not in use) | Gate each one as Marketing, or **Hyperlite decides** to keep it as-is until the vendor confirms it (2.10) |
| 2.A6 | **Consent records:** confirm what Cookiebot logs and how to export it | |

**Then: full categorization**

| # | Item | Notes |
|---|---|---|
| 2.0 | **Clean up duplicate pixels** (Meta, TikTok, Pinterest, Criteo in both GTM and Shopify) | One copy per channel. Not urgent: both copies wait for consent, so removing one changes nothing after a decline, and removing the wrong one could break conversion tracking. Roswell confirms the GTM and Elevar setup covers every event the app pixels send (especially checkout and purchase), sets up anything missing, then removes the duplicates |
| 2.1 | **Inventory every tracker:** GTM tags (every tag, trigger and variable), theme scripts, app embeds, and Shopify app and custom pixels, across every page type including cart, checkout and the order confirmation page; trace every cookie to its tool and remove leftovers from uninstalled apps | Produces a list with each vendor, how it loads, its category, and what a decline does |
| 2.2 | **Classify the remaining apps:** Affirm, Attentive, Redo, Gorgias, and the fraud and bot tools (Yofi, FraudLabsPro, NoFraud) | Whether the fraud tools are strictly necessary needs a decision **(counsel)**. NoFraud and Yofi also load through Shopify script tags, which stop on Mar 1, 2027: check the vendors' migration plans |
| 2.3 | **GTM review:** every tag has the right consent requirement and trigger | **We'll ask Elevar**, which set up many of the GTM tags and triggers, to review its setup and confirm each one uses Google consent checks. Email sent to Elevar Nov 9 asking them to make the updates (consent settings on their tags and destinations, user_id, the duplicate Google Ads tag, the checkout pixels), with GTM changes in an unpublished workspace for Hyperlite to approve. Also remove unused tags, apply pending template updates, and fix the container quality issue |
| 2.4 | **Classify Cookiebot's 111 unclassified cookies** | Accurate cookie declaration and banner categories |
| 2.5 | **Load Cookiebot directly in the theme**, ahead of GTM | If GTM is blocked (some VPNs and ad blockers do this), there's no banner and no opt-out |
| 2.6 | **Move theme trackers into GTM** (Clarity, Vibe) | One place to manage consent |
| 2.7 | **GA4 and Google Consent Mode audit:** consent signals received correctly, no personal data collected, and the full Consent Mode setup (URL passthrough, ads data redaction, Consent Mode reporting, Google Signals off without consent) | |
| 2.8 | **Test every consent state:** first visit, accept, decline, change of mind, returning visitor, GPC, and mobile | Uses our automated region tests |
| 2.9 | **Regional coverage review:** Canada (Québec), the Cyprus gap in Cookiebot, and whether law-state visitors should get a denied default | **(counsel)** |
| 2.10 | **Vendor questionnaires:** privacy policy, data processing agreement (DPA), sub-processors, how it honors consent and GPC | Start with session recording (Clarity, Vibe), ad pixels, Klaviyo, and anything on checkout. **Hyperlite and counsel decide** about vendors that can't answer adequately |
| 2.11 | **Contracts and EU data transfers:** DPAs on file, plus transfer safeguards | **(counsel)** |

---

## Phase 3: Govern (scoped separately)

**Goal:** confirm each vendor's practices in writing, correct any misclassifications, and keep the site compliant as tools change.

| # | Item | Notes |
|---|---|---|
| 3.1 | **Keep the privacy policy and cookie list current:** the policy (updated Sept 2026) already covers CCPA rights, advertising and cookies; Cookiebot's cookie list updates after each scan once cookies are classified; update the text if tools or uses change | Vendor responses feed this **(counsel)** |
| 3.2 | **Rights requests:** a process for access, deletion and opt-out within legal deadlines | **(counsel)** |
| 3.3 | **Saved consent when visitors travel:** consent applied automatically outside the banner regions persists when the visitor later browses from the EU | **(counsel)** |
| 3.4 | **App and script approval process:** nothing goes live without a consent category and a check of how it loads; limit who can publish GTM changes | |
| 3.5 | **Ongoing monitoring:** automated region tests after changes, regular Cookiebot scans, periodic vendor policy review | |

---

## Decisions needed from Hyperlite

1. Klaviyo and Octane: gate, limit, or accept the risk (1.1, 1.2).
2. Basic or advanced Consent Mode (1.4).
3. Leave the duplicate pixels in place for now (both copies wait for consent); Roswell cleans them up in Phase 2 after confirming GTM and Elevar cover the same events.
4. Opt-out link and GPC for all US visitors, or only law states (2.A1, 2.A2) **(counsel)**. Can be decided while Phase 1 is underway.
5. Whether to proceed with Phases 2 and 3, and when.
6. Ask Cookiebot support to audit the setup and Shopify integration once Phase 1 is done, if Hyperlite's plan includes support (2.A0).
7. Octane: approve option (a) or (b) for 1.2 after Octane support replies, or (a) now as a stopgap.
