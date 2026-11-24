---
name: prd-review-page
description: Build and maintain the local HTML review page for a PRD draft (Patty's workflow). Renders the PRD first, then where the original ticket went and any notes for Patty; estimate pages add the estimate. Use when start-ticket or estimate-ticket reach the review page step, or when Patty asks for "a review page", "an HTML version of the PRD", or "a page I can reload".
---

# PRD review page

A local page Patty keeps open to read the PRD and anything she needs to decide.

## File

- `~/Documents/obs-roswell/<PROJECT_KEY>/<EDGE_ID>-prd-review.html`. A local file, not a published artifact.
- `open` it once, when it's created. After that, tell Patty when it's updated so she can refresh; don't open it again.

## Content, in order

1. **The PRD**, rendered from the markdown draft. Embed the markdown in a `<script type="text/markdown">` block and render it with `marked` from cdnjs (exact version, e.g. `marked/12.0.2`), falling back to `<pre>`. Strip the frontmatter.
2. **Original ticket → PRD:** a short table of each part of the original Edge description and the PRD section it now lives in. Needed before the first push.
3. **Notes for Patty**, only when there's something to decide or know: risks, open questions, out-of-scope findings for the cleanup list, anything unverified.
4. **Estimate pages only:** a table with Low, High and Plan (High) hours, split into dev / QA / bug fix with what each covers, for both the AI-implemented estimate and the human-only comparison, plus a fallback estimate if a cheaper option exists. One line above it if the feature already exists without code (e.g. "Already possible with the X setting, so this covers configuring it").

No stats boxes, no separate AC candidate list (the ACs are in the PRD), no build or evidence sections (those live in Implementation Notes and the vault).

## Rules

- **Keep it current.** Whenever the PRD markdown changes, update the HTML too. Remove sections that no longer match what was done.
- Tables, breakdowns and option comparisons go on this page, not in chat; the chat reply says what changed and to refresh.
- Light and dark mode (`prefers-color-scheme`), readable at phone width; tables scroll sideways.
- Local images in the PRD resolve relative to the HTML file; rewrite their paths in the render script if the PRD sits in a subfolder.
