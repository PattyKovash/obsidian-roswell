# Variant Active State Bug — Bisect Log

**Issue:** On mobile, selecting a variant size option on the product page does not show the active state and takes a few taps to appear.

**Branch used:** `feature/test-2026-09-17` on `release/_candidate`

---

## Bisect Results

| Step | Commit | PR | Description | Status |
|------|--------|----|-------------|--------|
| 1 | `42c1fe3` | #28 (testparty/initial) | Accessibility audit batch | Broken |
| 2 | `0639b6a` | #27 | merge-release-settings-2026-09-14 | Broken |
| 3 | `57a3977` | #26 | merge-release-settings-2026-09-14 | Skipped |
| 4 | `fddf4d5` | #17 | THREADS-12906260821-plp-schema | **Working** |
| 5 | `12b2ab0` | #16 | merge-theme-updates-2026-09-09 | Broken |
| 6 | `66c3424` | #21 | merge-release-settings-2026-09-11 | **Broken** |

**Conclusion:** Bug introduced between PR #17 (`fddf4d5`) and PR #21 (`66c3424`).

PR #21 is a single commit (`d79a610`) — a settings/template JSON merge with no code changes. 16 files changed, all JSON config.

---

## Narrowing Down — File-by-File from PR #21

Starting from last known working state (`fddf4d5`, PR #17), applying changes one file at a time.

| Step | File Applied | Result |
|------|-------------|--------|
| 1 | All files EXCEPT `config/settings_data.json` | Pending |
| — | *(Reverted to clean working state)* | — |
| 2 | `templates/product.json` only | **Testing...** |

---

## Key Suspect: `config/settings_data.json`

The settings_data.json diff changed `scheme-3` selected variant colors:

| Setting | Before (working) | After (broken) |
|---------|------------------|----------------|
| `selected_variant_background_color` | `#000000` | `#FFFFFF` |
| `selected_variant_text_color` | `#FFFFFF` | `#100000` |
| `selected_variant_border_color` | `#000000` | `#E51A4E` |
| `selected_variant_hover_background_color` | `#1A1A1A` | `#FFFFFF` |
| `selected_variant_hover_text_color` | `#FFFFFF` | `#020000` |
| `selected_variant_hover_border_color` | `#1A1A1A` | `#1a1a1a` |

Before: black fill + white text (high contrast, unmistakable active state).
After: white fill + pink border (nearly identical to unselected white background).

The product page section uses `"color_scheme": "scheme-3"`, so these values directly control the variant button appearance.
