# Phase 2 roadmap items with no matching row in our audit CSV

Source: `Social Threads - Roadmap and Project Plan - Sheet1.csv`, Phase 2. Theme Upgrade section only (ST12-ST23). These items are on their theme-upgrade roadmap but don't correspond to anything our code-level audit flagged, either because they're new feature/config work rather than a migration regression, or because they're referenced only in our MD's prose (not scored CSV rows). Items from other phases of their roadmap (Phase 0, Phase 1, Phase 3, etc.) are out of scope for this list, this is a migration cross-reference, not a full roadmap review.

- **ST12**: "Investigation: audit delta between live and new theme." This is the umbrella ticket for the audit itself. Our work is the deliverable this describes; not a separate item to track.
- **ST19**: Enable Dwell's native quick add/buy view on collection cards, QA against Rebuy Smart Cart. New feature enablement, not a migration gap.
- **ST20**: Configure Search & Discovery category + color facets on Shop All. Config-only, not a migration gap.
- **ST21**: Simplify PDP CTA hierarchy to one primary button, activate sticky add-to-cart from existing theme code. Feature-activation decision, not a migration gap (distinct from the Inbox/sticky-ATC suppression issue we found and verified is already resolved).
- **ST22**: Rebuy recommendation re-ruling (category-matched, price-banded, in-cart-excluded rules). App ruleset tuning, not a migration gap. Decision on their sheet: "ST team will handle - DONE."
- **ST23**: Shop the Look restyle (replace legacy variant dropdowns and red buttons with the PDP swatch/chip pattern). Design/styling work on an app module, not a migration gap. Decision on their sheet: "ST team will handle - DONE."
- **`assets/product-title-truncation.js`** (mentioned in ST13, ST17): not a scored row in our CSV, only discussed in our MD's "Reference check" section: removed upstream, only referenced by stock/unmodified `scripts.liquid`, resolves automatically. Already verified safe.
- **`snippets/color-schemes.liquid`** (mentioned in ST13, ST17): not a scored row in our CSV, only discussed in our MD's "Reference check" section: this is Horizon's own upstream rename to `color-palette.liquid`, not a dropped customization.
