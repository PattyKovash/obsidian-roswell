# Hyperlite Mountain Gear — The Trailhead
## Schema, Discoverability & Audio Distribution Research

**Sourcing rules for this document.** Every claim about platform behavior must cite a primary source (the platform's own documentation or the schema/spec authority). Anything I cannot back with a source is either dropped or labeled as **"Optional — best practice with no documented platform impact."** I do not infer benefits.

**Where the research lands overall.** Most of the structured-data items in the brief are valid schema, but few of them have documented platform consumers that move discoverability today. The single most impactful change for the audio program is the RSS feed, because that is the only channel Apple Podcasts and Spotify use. On the website, the most defensible items are duration, transcript (where it exists), the `@graph` restructure for entity correctness, and dropping `audioDescription` from the accessibility proposal because it is the wrong value per spec.

---

## 1. `accessibilityFeature: ["audioDescription", "readingOrder"]`

### Verdict

`readingOrder` is valid. `audioDescription` is the wrong value for this content and should not be added. A separate value, `transcript`, is also valid if a transcript exists on the page.

### Documentation

The controlled vocabulary for `accessibilityFeature` is maintained by the W3C Accessibility Discoverability Vocabulary Community Group; the DAISY Consortium's Accessible Publishing Knowledge Base is the authoritative implementation reference.

- **`audioDescription`** is defined as: *"description tracks are included for any video sources that require them. Audio descriptions differ from captions and subtitles in that they describe the actions that are occurring in the video."* The DAISY KB explicitly notes: *"The HTML `audio` element cannot be used to render audio descriptions, as it does not provide a display area for them."* Source: [DAISY KB — audioDescription](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/audioDescription.html). Asserting this value on a blog post whose only media is a TTS narration of the article would be inaccurate per the spec.

- **`readingOrder`** is defined as: *"there is a logical reading order to the text of a publication. The logical reading order is the progression from one element of content to the next (e.g., a heading for a chapter is followed by the first paragraph and so on)."* Source: [DAISY KB — readingOrder](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/readingOrder.html). This is true of a standard blog post.

- **`transcript`** (as an accessibilityFeature value, distinct from the `transcript` property on AudioObject) is defined as: *"transcripts are provided for any auditory content."* Source: [DAISY KB — transcript](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/transcript.html). Valid to claim if a transcript is rendered on the page.

### Documented discoverability benefit

I cannot find a primary source documenting that any major search engine, AI assistant, or screen reader uses `accessibilityFeature` as a ranking, surfacing, or eligibility signal. The documented consumers are EPUB accessibility metadata systems (DAISY Consortium tooling, EPUB Accessibility 1.1, ONIX list 196), which do not apply to an HTML blog. **Treat this as optional accessibility hygiene with no documented discoverability impact.**

### Recommendation

- Drop `audioDescription` — incorrect per spec.
- Add `readingOrder` if the article DOM order matches its visual/logical order (almost always true).
- Add `transcript` only if a transcript is actually rendered on the page.
- **Optional:** other values that may be truthful for a Trailhead article — `alternativeText` (if all images have alt text), `structuralNavigation` (if proper heading hierarchy is used), `tableOfContents` (only if rendered).

### Risk

Asserting a value that is not factually true (such as `audioDescription` for content with no video description track) is inaccurate metadata. No documented penalty, but it would not pass an accessibility audit by tooling that checks these claims.

---

## 2. `custom.audio_duration` → `duration` on AudioObject

### Verdict

Valid schema property. Documented format. **Optional implementation — recommended for correctness; I cannot cite a documented current Google Search consumer.**

### Documentation

`duration` is a property of `MediaObject` (and therefore `AudioObject`), expected type `Duration` or `QuantitativeValue`, in ISO 8601 duration format. Source: [schema.org/AudioObject](https://schema.org/AudioObject) (v30.0, March 2026), and the example on that page uses exactly the proposed format.

### Documented discoverability benefit

The Google Podcast structured data documentation page no longer exists at developers.google.com. Google Podcasts as a product was shut down in the US on April 2, 2024, and outside the US on June 24, 2024, with users redirected to YouTube Music. Source: [Wikipedia — Google Podcasts](https://en.wikipedia.org/wiki/Google_Podcasts), citing Google's own announcement.

`itunes:duration` in the RSS feed is the field Apple Podcasts uses to display episode runtime. The on-page `duration` property on AudioObject does not feed into Apple, Spotify, or any podcast directory. Source: [Apple Podcasts iTunes namespace reference](https://github.com/Podcastindex-org/podcast-namespace/blob/main/itunes_reference.md).

### Recommendation

Implement. It is valid, low-effort if you can extract duration at TTS generation time, and it is the correct property to use. But the discoverability work for duration happens in the RSS feed (section 7), not in JSON-LD.

### Risk

None documented.

---

## 3. `custom.audio_transcript` → `transcript` on AudioObject

### Verdict

Valid schema property. The on-page rendering of the transcript is what is documented to be indexable; the JSON-LD property itself is not documented as a discoverability signal.

### Documentation

`transcript` is a property directly on `AudioObject`, defined as: *"If this MediaObject is an AudioObject or VideoObject, the transcript of that object."* Expected type: `Text`. Source: [schema.org/AudioObject](https://schema.org/AudioObject) (v30.0, March 2026).

### Documented benefits

- **WCAG 2.1 Success Criterion 1.2.1** (Audio-only and Video-only, Prerecorded) requires a text alternative for prerecorded audio-only content. Source: [W3C WCAG 2.1 SC 1.2.1](https://www.w3.org/TR/WCAG21/#audio-only-and-video-only-prerecorded). If the audio is verbatim TTS of the article, the article body itself satisfies this. If the audio diverges, a separate transcript is required for WCAG compliance.

- **Indexable text on the page.** Google indexes the content of the rendered DOM. This is a foundational documented behavior; structured data is described by Google as supplementary signal, not a replacement for page content. Source: [Google Search Central — Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data): *"Google uses structured data that it finds on the web to understand the content of the page."* I cannot cite Google documentation stating that text inside a JSON-LD `transcript` property is indexed or used as a ranking signal.

### Recommendation

- **If audio is verbatim TTS of the article:** the article body already satisfies WCAG 1.2.1, and `accessModeSufficient` already declares that text alone is sufficient. **Optional:** populate `AudioObject.transcript` with the article body text for schema completeness. Not documented to drive discoverability.
- **If audio ever diverges from the article** (intro music, narrator commentary, ad reads, edits): render the transcript on the page and populate `AudioObject.transcript` with the same text. Storage in `custom.audio_transcript` as a metafield is fine; the requirement is that it also be rendered in the DOM.

### Risk

None documented.

---

## 4. `PodcastEpisode` + `PodcastSeries` schema

### Verdict

Valid schema types. **No documented current Google Search rich result.** No documented use by Apple Podcasts or Spotify, both of which index from RSS only. **Optional — semantic correctness, no documented platform consumer for the on-page schema.**

### Documentation

- `PodcastEpisode` and `PodcastSeries` are documented schema.org types. Source: [schema.org/PodcastEpisode](https://schema.org/PodcastEpisode), [schema.org/PodcastSeries](https://schema.org/PodcastSeries).
- Apple Podcasts requirements state: *"In order for a podcast to be listed on Apple's podcast directory and show up within the Apple Podcasts app, a corresponding RSS feed must be created, submitted on Podcasts Connect, and it must pass Apple's validation."* No mention of schema.org JSON-LD. Source: [Apple Podcaster's Guide to RSS](https://github.com/Podcastindex-org/podcast-namespace/blob/main/itunes_reference.md), [Apple Podcasts requirements](https://podcasters.apple.com/support/823-podcast-requirements).
- Google Podcasts was shut down 2024, and the dedicated podcast structured data documentation has been removed from developers.google.com. Source: [Wikipedia — Google Podcasts](https://en.wikipedia.org/wiki/Google_Podcasts).
- The structured data feature gallery at [developers.google.com/search/docs/appearance/structured-data/search-gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) does not list a Podcast rich result.

### Recommendation

**Optional.** If implemented, use a `@graph` with `BlogPosting` and `PodcastEpisode` as separate `@id`-linked entities (see section 5) rather than multi-typing one node. The discoverability work for the podcast happens in the RSS feed (section 7); on-page schema is for semantic correctness.

### Risk

None documented, provided the data is accurate.

---

## 5. `@graph` with `@id` linking

### Verdict

Valid JSON-LD pattern that Google parses. **Documented support for `@graph` and `@id` is in the JSON-LD 1.1 spec and in Google's own example markup;** Google does not publish documentation explicitly tying `@graph` to a ranking or entity-merging benefit. Treat as best-practice consolidation.

### Documentation

- `@graph` is a JSON-LD 1.1 keyword. Source: [W3C JSON-LD 1.1 spec](https://www.w3.org/TR/json-ld11/).
- Google's Search Central docs use `@graph` patterns in code samples and process structured data across multiple `<script>` blocks or within `@graph` equivalently. Source: [Google — Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).
- Google has not published documentation stating that cross-entity `@id` references improve ranking or change how the Knowledge Graph reconciles entities. The most defensible statement available is from John Mueller's repeated office-hours guidance that Google processes structured data page-by-page; `@id` references across pages are not automatically merged into a graph.

### Documented benefits

- **Maintainability and clarity.** A single `@graph` block consolidates the Organization, BlogPosting, AudioObject, and PodcastEpisode entities into one place per page, removes duplicated data, and makes relationships between entities explicit.
- **Avoiding type conflicts.** If the same page is both a BlogPosting and a PodcastEpisode, two linked `@id` entities in a `@graph` is cleaner than multi-typing a single node.

### Recommendation

Implement. Use stable `@id` URIs:

- `https://hyperlitemountaingear.com/#organization`
- `https://hyperlitemountaingear.com/#website`
- `https://hyperlitemountaingear.com/blogs/the-trailhead/{handle}#article`
- `https://hyperlitemountaingear.com/blogs/the-trailhead/{handle}#audio`
- `https://hyperlitemountaingear.com/blogs/the-trailhead/{handle}#episode` (if PodcastEpisode is added)

Once set, do not change them.

### Risk

None documented if `@id` values remain stable.

---

## 6. Metaobject migration

### Verdict

Operational/DX improvement only. Zero documented discoverability impact.

### Documentation

Shopify metaobjects vs. metafields is an internal data-modeling choice. Search engines and AI platforms parse the rendered HTML and JSON-LD output of the Liquid template; the source storage is not visible to them. No source contradicts this.

### Recommendation

Implement if the operational benefit (single source of truth, easier rendering across templates, consistent updates) is worth the migration effort. Bundle with the structured-data work in sections 1–5 so the new content model supports the additional fields from the start. Do not include this in the SEO/discoverability portion of the work; it belongs in maintainability.

### Risk

None to schema/SEO. Standard migration risk only.

---

## 7. RSS feed — the highest-leverage item for the audio program

This is the only channel Apple Podcasts and Spotify use to populate every detail listeners see. The on-page schema items in sections 1–5 do not feed into Apple or Spotify.

### Documentation source

[Apple's "A Podcaster's Guide to RSS"](https://github.com/Podcastindex-org/podcast-namespace/blob/main/itunes_reference.md), archived in the Podcast Index repository directly from Apple's original document. Tags are categorized as Required, Recommended, or Situational by Apple.

### Channel-level (the show) — Apple's required tags

| Tag | Apple status | Notes |
|---|---|---|
| `<title>` | Required | Show title. Apple uses this field for search. |
| `<description>` | Required | Max 4000 bytes. Wrap HTML in CDATA. |
| `<itunes:image>` | Required | 1400×1400 to 3000×3000 px, JPEG/PNG, 72dpi, RGB. |
| `<language>` | Required | ISO 639 (`en-us`). Invalid codes fail validation. |
| `<itunes:category>` | Required | Pick from [Apple Podcast categories](https://podcasters.apple.com/support/1691-apple-podcasts-categories). Apple recognizes only the first category if multiple are present. |
| `<itunes:explicit>` | Required | `true` or `false`. |

### Channel-level — Apple's recommended/situational tags

| Tag | Apple status | Notes |
|---|---|---|
| `<itunes:author>` | Recommended | "Hyperlite Mountain Gear." |
| `<link>` | Recommended | Show website URL. |
| `<itunes:type>` | Situational | `episodic` (default — newest first) or `serial` (requires episode numbers, oldest first). For Trailhead, `episodic` is correct. |
| `<copyright>` | Situational | If copyrighted. |
| `<itunes:new-feed-url>` | Situational | Only if the feed URL ever changes. |

### Episode-level — Apple's required tags

| Tag | Apple status | Notes |
|---|---|---|
| `<title>` | Required | Don't put episode/season number in here; use `<itunes:episode>` and `<itunes:season>`. |
| `<enclosure>` | Required | URL, length (bytes), type (`audio/mpeg` for MP3). |

### Episode-level — Apple's recommended/situational tags

| Tag | Apple status | Notes |
|---|---|---|
| `<guid>` | Recommended | Apple: *"each episode must have a unique GUID and it never changes, even if metadata like title or enclosure URL do change."* Changing a GUID causes duplicate episodes. |
| `<pubDate>` | Recommended | RFC 2822 format. |
| `<description>` | Recommended | Max 4000 bytes. Show notes. |
| `<itunes:duration>` | Recommended | Apple recommends conversion to seconds. |
| `<link>` | Recommended | Episode webpage (the article URL). |
| `<itunes:image>` | Recommended | Per-episode artwork if higher quality than show artwork. |
| `<itunes:explicit>` | Recommended | Per-episode override. |
| `<itunes:episode>` | Situational | Integer. Populate from `custom.audio_episode`. |
| `<itunes:season>` | Situational | Integer. The existing pattern of using year as season is permitted. |
| `<itunes:episodeType>` | Situational | `full`, `trailer`, or `bonus`. |

### Podcast Namespace (Podcasting 2.0) — recommended additions

The Podcast Index namespace is supported by Spotify (which announced support for `podcast:transcript` in 2025), Apple Podcasts (which renders transcripts in-app via this tag), Pocket Casts, Overcast, and others. Source: [Podnews — Spotify supporting Podcasting 2.0 for transcripts](https://podnews.net/update/spotify-transcripts-p20), [Podcast Index namespace spec](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md).

Namespace declaration:
```xml
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:podcast="https://podcastindex.org/namespace/1.0">
```

| Tag | Notes |
|---|---|
| `<podcast:transcript url="..." type="text/html"/>` | At `<item>` level. Apple Podcasts and Spotify both render transcripts from this tag. Multiple instances permitted for different formats. URL must be HTTPS. |
| `<podcast:person>` | Optional. Identifies hosts/narrators. |
| `<podcast:funding>` | Optional. A link to the brand site. |
| `<podcast:guid>` | Optional. A stable show-level GUID, separate from per-episode GUIDs. |

### Recommendation

Audit the current feed at the provided URL against Apple's required tags first, then recommended, then add Podcasting 2.0 `podcast:transcript` if transcripts exist on-page.

### Risk

Apple validation failures: invalid `<language>` code, missing required tags, incorrect artwork size, changing GUIDs across publishes. All documented in Apple's guide.

---

## 8. Additional items considered

### 8a. `SpeakableSpecification` — not applicable

The `speakable` property is documented as **BETA, restricted to news content for Google Assistant TTS playback in the US in English**, last updated December 10, 2025. From Google's documentation: *"The Google Assistant uses speakable structured data to answer topical news queries on smart speaker devices."* Source: [Google — Speakable BETA](https://developers.google.com/search/docs/appearance/structured-data/speakable).

Hyperlite is not a news publisher. There is also reporting from late 2025 that John Mueller indicated Speakable is among the schema types Google may deprecate. Source: [Stan Ventures — John Mueller Clarifies Schema Changes Coming in 2026](https://www.stanventures.com/news/google-john-mueller-schema-update-2026-5719/) (note: this is a third-party summary of Mueller's remarks, not primary Google documentation).

**Do not implement.**

### 8b. `FAQPage` — re-evaluate current implementation

The brief mentions `FAQPage` schema is already implemented. Google deprecated FAQ rich results on May 7, 2026: *"As of May 7, 2026, FAQ rich results are no longer appearing in Google Search. We will be dropping the FAQ search appearance, rich result report, and support in the Rich results test in June 2026."* Source: [Google — FAQPage docs (deprecation banner)](https://developers.google.com/search/docs/appearance/structured-data/faqpage).

Google states existing FAQ markup is harmless: *"Sites with FAQ structured data don't need to rush to remove it. Google has previously said that unused structured data doesn't cause problems for Search."*

**Optional cleanup.** No documented benefit from removing it; no documented benefit from keeping it. The work to maintain it can be deprioritized.

### 8c. `HowTo` — confirmed deprecated

If any Trailhead articles use `HowTo` (gear lists, packing lists), this rich result was deprecated in 2023 for mobile and subsequently for desktop. Source: [Google Search Central blog — Changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes). Same guidance as FAQ: harmless to keep, no documented benefit either way.

### 8d. `inLanguage` on BlogPosting and AudioObject

Valid documented schema.org property on both types. Source: [schema.org/AudioObject](https://schema.org/AudioObject) (lists `inLanguage` as a CreativeWork property). Uses BCP 47 codes. **Optional — best practice with no documented platform impact;** matches the `language` tag in the RSS feed for consistency.

### 8e. `sameAs` on the Organization pointing to podcast directory URLs

Once the podcast is live on Apple and Spotify, the Organization's `sameAs` array can include those URLs. Google documents `sameAs` as a property it makes general use of: *"In addition to the properties and objects documented here, Google can make general use of the sameAs property and other schema.org structured data."* Source: [Google — Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data). No specific documented behavior tied to podcast directory URLs; this is best practice.

**Optional — best practice with general documented support.**

---

## Implementation priority

Ordered by strength of documented benefit per unit of effort.

1. **RSS feed audit against Apple's required and recommended tags.** Section 7. Only documented channel for Apple/Spotify. Highest leverage.
2. **Add `podcast:transcript` to RSS feed.** Section 7. Documented support by Apple Podcasts and Spotify.
3. **Remove `audioDescription` from accessibilityFeature; keep `readingOrder`.** Section 1. Spec-correct.
4. **Add `duration` to AudioObject.** Section 2. Valid schema; trivial.
5. **`@graph` restructure with `@id` linking.** Section 5. JSON-LD spec, supported by Google, maintainability and entity correctness.
6. **Transcript decision.** Section 3. Required for WCAG only if audio diverges from article text. Optional otherwise.
7. **`PodcastEpisode` + `PodcastSeries` schema in the `@graph`.** Section 4. Optional, no documented current Google rich result.
8. **Metaobject migration.** Section 6. Operational track, not SEO.

---

## What is not in this document

The following claims appeared in the earlier draft of this research and have been removed because I could not back them with a primary source:

- That AI assistants (ChatGPT, Claude, Gemini, Perplexity) use schema.org accessibility metadata for surfacing decisions.
- That JSON-LD `@id` references improve Google Knowledge Graph entity reconciliation.
- That LLM grounding tools use the `transcript` property in JSON-LD as a content source distinct from the rendered DOM.
- That `mentions` and `about` properties on BlogPosting are used by AI Overviews for editorial-to-product linking. (The properties exist on schema.org; I could not find documentation of platform consumers.)
- That `speakable` benefits non-news publishers.

If primary sources for any of these emerge, they can be reconsidered.