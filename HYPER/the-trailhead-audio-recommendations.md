# The Trailhead: Audio, Schema, and Discoverability Recommendations

**Prepared for:** Hyperlite Mountain Gear
**Date:** June 2026
**Scope:** How to get the most discoverability and traffic out of The Trailhead's articles and their AI narrated (text to speech) audio versions, across Google, AI assistants, podcast apps, and assistive technology.

Every recommendation below is backed by a primary source (the platform's own documentation or the official specification). Where a point is supported only by industry analysis rather than a platform's own docs, that is called out plainly. Nothing here is assumed or inferred.

---

## The big picture (read this first)

Three plain truths shape everything that follows:

1. **Search engines and AI assistants cannot listen to your MP3s. They read text.** The discoverability value of the audio program comes almost entirely from the written article and a clean, visible transcript, not from the audio file itself. Google states in its own June 2026 guidance that there is no special markup or AI file you need to add to be picked up by AI features. ([Google, AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))

2. **The podcast RSS feed is the one real "audio discovery" channel you have.** Apple Podcasts, Spotify, YouTube Music, and Amazon all find episodes by reading your RSS feed, not by reading on page schema. ([Apple Podcasts requirements](https://podcasters.apple.com/support/823-podcast-requirements); [RSS.com](https://rss.com/blog/how-to-upload-a-podcast-to-spotify/))

3. **Most of the structured data on the wish list is valid but will not move the needle today.** It is good for correctness and tidiness, so we mark it optional rather than overselling it. The items that genuinely matter are highlighted as priorities.

So the work splits cleanly: **text and transcripts drive Google and AI discovery, the RSS feed drives podcast app discovery, and the rest is hygiene.**

---

## Priority 1: Do these. They have documented value.

### 1. Publish the full transcript as visible text on each article page

**What:** Make sure the words spoken in the audio appear as real, readable text on the article page (not only inside hidden code). For Hyperlite this is largely already true, because the MP3 is generated from the article body.

**Why:** Two documented benefits at once.
- It satisfies accessibility law. WCAG Success Criterion 1.2.1 (Level A, the baseline often referenced in ADA related claims) requires a text alternative for prerecorded audio. When the audio is a word for word reading of the article, the article text already meets this at no extra cost. The moment the audio adds anything not in the article (an intro, a sponsor line, an edit), a separate matching transcript becomes required. ([W3C WCAG 2.2, SC 1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded))
- It is what actually gets you found. Google and AI engines index the text on the page, and Google describes structured data as a supplement to that text, never a replacement. A visible transcript is the content they can read, quote, and cite. ([Google, Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data))

**Action:** Keep the article body as the on page transcript. If any episode ever diverges from the article text, render a separate transcript on that page.

---

### 2. Submit the podcast RSS feed to the major directories

**What:** Claim and submit your existing feed to the platforms where people actually listen, in this order of reach.

**Why:** This is the only documented way for someone to find or voice command your audio ("Hey Google, play the Hyperlite show"). Listening has consolidated onto video and streaming platforms: by Edison Research, YouTube is now the number one podcast platform in the US, Spotify second, Apple third. ([Edison Research via Podnews](https://podnews.net/press-release/podcast-consumer-2026))

**Action checklist (one time setup, you never resubmit per episode):**

| Platform | Why it matters | Requirement to know |
|---|---|---|
| **Spotify for Creators** | Number two by reach, strong in app search | Claim the feed, verify with an 8 digit code emailed to the address in the feed. ([Spotify](https://support.spotify.com/us/creators/article/finding-and-enabling-your-rss-feed/)) |
| **YouTube / YouTube Music** | Number one by reach; this is where Google moved podcasts after shutting Google Podcasts | YouTube Music plays your feed automatically with zero action. To appear in YouTube proper, connect the feed in YouTube Studio. Note: RSS ingested audio cannot contain ads. ([YouTube Help](https://support.google.com/youtube/answer/13525207?hl=en)) |
| **Apple Podcasts** | Still essential; also auto covers Overcast | RSS 2.0 compliant, publicly accessible feed. ([Apple](https://podcasters.apple.com/support/823-podcast-requirements)) |
| **Amazon Music + Audible** | One submission covers both | Confirm the verification link within 24 hours. ([Amazon](https://podcasters.amazon.com/submit-rss)) |
| **iHeartRadio** | Quick US win | Submit feed in their portal, approval in 2 to 3 days. ([iHeart](https://help.iheart.com/hc/en-us/articles/13406420908557-Updating-RSS-Feed-in-Podcaster-Portal)) |
| **Pocket Casts, Podcast Index** | Long tail, open ecosystem apps | 5 minute submissions. Overcast needs nothing, it pulls from Apple. ([Riverside](https://riverside.com/blog/podcast-directories)) |

**Pre flight tip that prevents most rejections:** Confirm the feed is HTTPS, has at least one published episode, contains a real monitored email address (every platform sends the verification code there), and uses square cover art of at least 1400 by 1400 pixels (use 3000 by 3000 to satisfy all platforms at once). A missing email in the feed is the single most common cause of failed submissions. ([RSS.com](https://rss.com/blog/how-to-upload-a-podcast-to-spotify/))

---

### 3. Disclose the AI voice in the podcast (this is mandatory, not optional)

**What:** Because the narration is an AI / text to speech voice, add a short spoken line in each episode (for example, "This article is narrated by an AI voice") and set your host's AI content metadata tag.

**Why:** Apple Podcasts requires disclosure when AI generates a material portion of the audio, which a fully TTS narrated article clearly is. Non compliance risks content removal, demonetization, or reduced distribution, meaning you could be pulled from the exact directory you are trying to use. Spotify does not require a label but prohibits content meant to deceive. ([RSS.com, AI disclosure](https://help.rss.com/en/support/solutions/articles/44002518955-ai-generated-content-in-podcasting))

---

### 4. Audit the RSS feed against Apple's required tags

**What:** Before submitting, check the feed at your podcast URL against Apple's required and recommended tags.

**Why:** Apple validates feeds on submission, and missing or malformed required tags block listing. The most important rule: each episode needs a globally unique ID (GUID) that never changes, even if the title or file URL changes, or you will get duplicate episodes. ([Apple Podcasts requirements](https://podcasters.apple.com/support/823-podcast-requirements))

**Key required tags:** show title, description, cover art (1400 to 3000 pixels square, JPEG or PNG), language (a valid code such as `en-us`), category, and explicit flag at the show level; episode title, audio file enclosure (URL, size in bytes, type `audio/mpeg`), and a stable GUID at the episode level. ([Apple, Podcaster's Guide to RSS](https://github.com/Podcastindex-org/podcast-namespace/blob/main/itunes_reference.md))

**Optional but supported addition:** the Podcasting 2.0 `podcast:transcript` tag at the episode level. Apple and Spotify both ingest transcripts from this tag (Spotify confirmed support in June 2025). Only worth adding if you publish the audio as a real podcast feed, which you do. ([Apple transcripts](https://podcasters.apple.com/support/5316-transcripts-on-apple-podcasts); [Podnews](https://podnews.net/update/spotify-transcripts-p20))

---

## Priority 2: Schema corrections and tidy ups (low effort, worth doing)

### 5. Do not add `audioDescription` to the accessibility tags

**What:** A draft proposal suggested adding `accessibilityFeature: ["audioDescription", ...]`. Do not add `audioDescription`. (Good news: your current code does not contain it, so this is a "leave it out" note for the proposal.)

**Why:** Per the official accessibility vocabulary, `audioDescription` means a track that describes the visual action in a video, and the documentation explicitly notes that an HTML audio element cannot even render audio descriptions. Your articles have no video, so claiming this feature would be factually incorrect metadata, which can mislead assistive technology users and fail an accessibility audit. ([DAISY Knowledge Base](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/audioDescription.html))

---

### 6. Add `duration` to the audio markup

**What:** Add the audio length to the `AudioObject` in ISO 8601 format (for example, `PT8M30S`). Your current markup does not include it.

**Why:** It is a valid, correct property and easy to capture when you generate the TTS. Be aware there is no documented Google search benefit for audio duration today (Google only consumes duration for video), so treat it as correctness, not a traffic win. ([schema.org AudioObject](https://schema.org/AudioObject))

---

### 7. Group the page's structured data with `@graph` and stable `@id` values

**What:** When you next touch the schema, consolidate the Organization, Article, and AudioObject blocks into a single `@graph` and give each entity a stable `@id` (a permanent identifier), then never change those IDs.

**Why:** It keeps the markup organized and lets Google associate related items on the same page (for example, an article and its audio). `@graph` and `@id` are part of the official JSON-LD specification and Google parses them. Be honest with expectations: Google does not document any ranking or Knowledge Graph benefit from this, so it is a correctness and maintainability improvement, not a growth lever. ([W3C JSON-LD 1.1](https://www.w3.org/TR/json-ld11/); [Google structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies))

---

## Optional: valid and harmless, but no documented benefit

These do no harm and are fine to include for completeness. None has a documented discoverability or ranking effect, so do not prioritize them or set traffic expectations.

- **`readingOrder` and `transcript` accessibility feature values.** Both are accurate for a well structured article whose audio matches the text. Honest accessibility signaling, no documented SEO lift. ([DAISY KB readingOrder](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/readingOrder.html))
- **`inLanguage` on the article and audio.** Already present in your code. Standards correct, helps machines identify the language, no documented ranking effect. ([schema.org inLanguage](https://schema.org/inLanguage))
- **`PodcastEpisode` / `PodcastSeries` schema.** Valid types, but Google has no podcast rich result and the podcast apps ingest from RSS only, so this is semantic tidiness, not distribution. ([schema.org PodcastEpisode](https://schema.org/PodcastEpisode))
- **`sameAs` linking the Organization to your Apple and Spotify show pages once live.** Google says it makes "general use" of `sameAs`. Good entity hygiene, no promised traffic. ([Google Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data))
- **`AudioObject` markup in general.** Already present. Worth keeping as cheap "help the AI understand the page" hygiene, but it produces no visual "Listen" result in Google. ([Google Search Gallery, which lists no audio result](https://developers.google.com/search/docs/appearance/structured-data/search-gallery))
- **Moving audio data from metafields to metaobjects.** A content management decision only. Search engines and AI tools see the rendered page, not where you store the data, so there is zero discoverability impact either way. The only real visibility rule here: make sure the audio and article content renders into the server HTML, because AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not run JavaScript. ([Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics))

---

## Do not build these (and what to do with existing ones)

- **`Speakable` schema.** It is a beta feature restricted to news content, US only, English only, on Google Home speakers. Hyperlite is a gear retailer, not a news publisher, so there is no documented benefit. ([Google Speakable BETA](https://developers.google.com/search/docs/appearance/structured-data/speakable))
- **`FAQPage` schema, as a discoverability play.** Google stopped showing FAQ rich results as of May 7, 2026, and is removing the related reports in June 2026. Existing FAQ markup is harmless and you do not need to rush to remove it, but do not build more of it expecting a result in Google. ([Google FAQPage docs](https://developers.google.com/search/docs/appearance/structured-data/faqpage))
- **`HowTo` schema.** Deprecated by Google since 2023. Harmless to leave if present, no benefit, do not add new. ([Google Search Central](https://developers.google.com/search/blog/2023/08/howto-faq-changes))
- **Anything aimed at a "Google Podcasts" result.** Google Podcasts was shut down in 2024 and Google removed its podcast structured data documentation. There is no Google podcast result to win. ([YouTube official blog](https://blog.youtube/news-and-events/migrating-your-podcasts/))

---

## Beyond schema: how the blog actually gets surfaced by AI and search in 2026

These are content and process recommendations, not code. They are where the real discoverability gains live. Where the evidence comes from SEO industry studies rather than the platforms themselves, it is labeled, because those figures shift as the engines retune.

1. **Lead every article with a direct 40 to 60 word answer to the real question a hiker would ask, near the top of the page.** Google's own documentation favors clear, well structured content for AI features, and independent studies of AI citations consistently find that the large majority are pulled from the top portion of the page. (Platform basis: [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). Directional industry data: [CXL study](https://cxl.com/blog/google-ai-overview-citation-sources/).)

2. **Back gear and trail claims with named specifics (weights, materials, test conditions) and keep a visible "last updated" date.** Concrete data and freshness both correlate with being cited by AI engines (industry analysis, directional). ([Contently](https://contently.com/2026/02/25/how-to-get-cited-google-ai-overviews/))

3. **Build genuine off site presence, especially in the ultralight community.** Being talked about on Reddit, YouTube, and review sites is reported as a strong citation factor across every AI engine. For Hyperlite this is a natural fit (industry analysis, directional). ([Contently](https://contently.com/2026/02/25/how-to-get-cited-google-ai-overviews/))

4. **Turn on the new Search Console Generative AI performance reports (launched June 3, 2026).** This finally lets you measure your visibility inside AI Overviews and AI Mode, so you can manage this by data rather than assumption. ([Google Search Central](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports))

5. **Skip llms.txt as a discoverability tactic.** Google has said on the record it does not use it, and server log studies show AI crawlers do not even request it. It is optional, low effort infrastructure at most, not a traffic lever. ([Search Engine Land](https://searchengineland.com/does-llms-txt-matter-467740))

---

## One page summary

| Recommendation | Priority | Why, in one line | Source type |
|---|---|---|---|
| Visible on page transcript | **Do now** | Meets accessibility law and is what Google and AI actually read | Primary (W3C, Google) |
| Submit RSS to Spotify, YouTube, Apple, Amazon, iHeart | **Do now** | The only real audio discovery channel | Primary (Edison, platforms) |
| Disclose the AI voice in episodes | **Do now** | Apple mandates it; non compliance risks removal | Primary (Apple) |
| Audit RSS against Apple's required tags | **Do now** | Missing tags block listing | Primary (Apple) |
| Do not add `audioDescription` | Correction | Factually wrong for audio only content | Primary (DAISY) |
| Add `duration` to AudioObject | Tidy up | Correct property, easy, no Google benefit | Primary (schema.org) |
| `@graph` plus stable `@id` | Tidy up | Cleaner data, no ranking benefit | Primary (W3C, Google) |
| `readingOrder`, `transcript`, `inLanguage`, `sameAs`, `PodcastEpisode`, AudioObject, metaobjects | Optional | Valid and harmless, no documented benefit | Primary |
| `Speakable` | Do not build | News only, not applicable | Primary (Google) |
| FAQ and HowTo schema | Do not build new | Rich results deprecated; existing is harmless | Primary (Google) |
| Anything for a "Google Podcasts" result | Do not build | The product no longer exists | Primary (Google) |
| Answer first content, freshness, off site mentions, Search Console AI reports | Highest leverage, ongoing | Where AI and search discovery is actually won | Mixed (Google primary, studies directional) |
