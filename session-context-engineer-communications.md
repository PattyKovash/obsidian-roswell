# Session Context — Roswell NYC Engineer Communications Project

## What this is
A handoff document summarizing the goals, decisions, and outputs of a working session building client communication training materials for engineers at Roswell NYC. An AI agent should use this to continue refining the materials without starting from scratch.

---

## Organization context

**Roswell NYC** is a Shopify-focused agency operating a two-person "pod" model: one Merchant Partner (MP) and one AI-native Engineer. Engineers now work directly with clients — removing the traditional AM/PM buffer layer that insulated developers from client contact. This is new for many of the devs.

The internal operating framework lives at:
`https://roswell-studios.github.io/roswell-operating-framework/`

The **AI-Native Engineer Playbook** (`/engineer-playbook.html`) was the source of context for this session. Key points from it relevant to these materials:
- Engineers are co-equal partners with MPs, not subordinates executing tickets
- They own the Merchant Context Document (technical sections), CLAUDE.md, and codebase quality
- Client proximity is described as the mechanism for commercially coherent output
- The MP typically leads client calls; engineers participate as technical experts

---

## What was built this session

### Primary deliverable
**`client-comms-engineer-guide.html`** — A styled HTML document (matching Roswell's framework aesthetic) serving as a field guide for engineers on client communication. It is self-contained and ready to distribute.

### Sections currently in the guide
1. **Your role on a client call** — technical expert framing, short answers first, what to do if running solo
2. **Translating for non-technical clients** — side-by-side phrase rewrites, "lead with business impact" rule
3. **What to say / not say** — direct phrase swap table for common confidence-eroding patterns
4. **When you don't know** — three ready-to-use scripts with follow-up commitment structure
5. **Framing difficult topics** — before/after examples for constraints, scope expansions, delays; the `what happened → why → options` pattern
6. **Email best practices** — two templates (call follow-up, issue flag), core writing rules
7. **Gathering technical requirements** — the "why before the what" principle, 9 discovery questions with annotations, 6 conversation strategies, the 4-question readiness check

### Secondary deliverable
A curated resource library (delivered inline in chat, not yet embedded in the HTML guide) covering:
- Client-facing communication for technical people
- Translating technical concepts for non-technical audiences
- Requirements gathering and discovery
- Active listening and questioning
- Clear technical writing

Notable resources include: *The Mom Test* (Fitzpatrick), *Continuous Discovery Habits* (Torres), Google's free Technical Writing course, HBR active listening articles (2024–2025), *Never Split the Difference* (Voss), *Articulating Design Decisions* (Greever), and the MIT Persuasive Communication Bootcamp.

---

## Explicit scope boundaries

### In scope for the guide
- Client calls (as technical participant and occasionally as solo facilitator)
- Client emails
- Requirements gathering and discovery conversations
- Translating technical language for non-technical merchants

### Explicitly out of scope (flagged by user, saved for a separate document)
- MP ↔ Engineer internal communication patterns
- Blocker communication between pod members
- PR description standards
- Internal async norms

---

## Design decisions made

- **Format**: Styled standalone HTML, consistent with the Roswell operating framework aesthetic (dark topbar, warm off-white background, serif display font, monospace accents, orange/rust accent color)
- **Tone**: Practical and direct — no fluff, no throat-clearing, get to the point
- **Audience**: Engineers who are technically strong but have had zero client exposure; not junior developers, not PMs
- **Merchant profile**: Primarily Shopify Plus e-commerce operators; some technically sophisticated, many not; B2B and DTC contexts both present
- **Voice on calls**: Engineers attend as technical expert/contributor, not meeting runner; MP leads unless unavailable

---

## What still needs to be done

### High priority
- **Embed the resource library into the HTML guide** as a dedicated section (Section 08 or an appendix). Currently it exists only as a chat artifact. Each resource should include: title, author, format, URL, and one-sentence rationale. Group by topic matching the guide's themes.
- **Review and tighten Section 07 (requirements gathering)** — the user asked for this section and it was added, but it has not yet been reviewed for length or tone consistency with the rest of the guide.

### Medium priority
- **Add a "before your first client call" checklist** — a quick-reference one-pager or sidebar an engineer could pull up the morning of a call. Should include: read the MCD, know the sprint status, know what you've shipped and what's in progress, have one sentence ready for anything that's delayed.
- **Add a section on reading the room** — how to gauge whether a client is confused, frustrated, or checked out, and what to do in each case. This was not requested but would fill a gap in the live call guidance.
- **Video resources** — the resource library search returned book and article recommendations but the user specifically mentioned videos. Worth a targeted search for high-quality YouTube or conference talk resources (e.g., talks from LeadDev, Mind the Product, or First Round's YouTube channel) on communication for engineers.

### Lower priority / future sessions
- A separate document on **MP ↔ Engineer internal communication** (explicitly deferred by user)
- A **solo call runsheet** for engineers who need to facilitate without the MP — the guide currently notes this scenario but doesn't give a full structure for it
- **Scenario role-play prompts** that could be used in team training sessions to practice the phrase patterns in Section 03 and the requirements questions in Section 07

---

## File locations
- Main guide: `/mnt/user-data/outputs/client-comms-engineer-guide.html`
- This context document: `/mnt/user-data/outputs/session-context.md`
- Source playbook URL: `https://roswell-studios.github.io/roswell-operating-framework/engineer-playbook.html`

---

## Stylistic notes for the next agent
- The guide uses **Syne** (sans-serif headings), **Newsreader** (serif display/pull quotes), and **JetBrains Mono** (labels, code, templates) — loaded from Google Fonts
- CSS variables: `--accent: #bf4e2a` (rust orange), `--green: #2d6644`, `--blue: #1e4f80`, `--amber: #7a5010`
- Pattern components already defined in the CSS: `.phrase-grid`, `.scenario`, `.callout`, `.tpl`, `.qlist`, `.pull` — use these for new sections, don't introduce new patterns
- Sections are numbered sequentially (`id="s01"` through `s07`); TOC is manually maintained in the hero nav — update both when adding sections
- Keep section intros to 2–3 sentences max; the guide's value is in the concrete examples and tables, not prose explanation
