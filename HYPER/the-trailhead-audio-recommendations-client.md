# The Trailhead: Audio, Schema, and Discoverability Recommendations

Text and transcripts drive Google and AI discovery, the RSS feed drives podcast app discovery, and the rest is hygiene.

---

## Theme and schema (Roswell implements)

**Add the transcript to the audio schema.** The article body already serves as the visible transcript, which is the part that matters for accessibility and for what Google and AI engines index, so no content work is needed there. The `transcript` property is simply missing from the AudioObject in the schema today; adding it points the structured data at the existing article text. This holds as long as the narration stays a faithful reading of the article (images are not part of the audio and do not need to be included). ([schema.org AudioObject](https://schema.org/AudioObject); [WCAG 2.2, SC 1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded))

**Add `duration` to the AudioObject** in ISO 8601 format (for example `PT8M30S`). Not currently in the markup, and the value already exists per episode in the podcast feed. Correct and low effort. ([schema.org AudioObject](https://schema.org/AudioObject))

**Group the page schema in one `@graph` with stable `@id` values.** Consolidates the Organization, Article, and AudioObject blocks and links the article to its audio. Set the IDs once and never change them. A correctness and maintainability improvement, not a ranking lever. ([W3C JSON-LD 1.1](https://www.w3.org/TR/json-ld11/))

**Do not add `audioDescription` to the accessibility tags.** A draft proposal suggested it. It is not in the current code, so this is simply a note to leave it out. ([DAISY Knowledge Base](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/audioDescription.html))

**Optional, harmless schema values:** the `readingOrder` accessibility value (accurate for a well structured article); `PodcastEpisode` and `PodcastSeries` types (valid, but Google has no podcast result and the apps read from RSS, so this is semantic tidiness only); and `sameAs` pointing to the Apple and Spotify show pages once live. None has a documented discoverability benefit. ([DAISY KB](https://kb.daisy.org/publishing/docs/metadata/schema.org/accessibilityFeature/readingOrder.html); [schema.org PodcastEpisode](https://schema.org/PodcastEpisode); [Google](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data))

**Worth recommending as a separate piece of work: a Trailhead Episode metaobject.** As the audio data grows (URL, episode, season, duration, transcript, disclosure), consolidating the loose per article fields into one structured metaobject gives validation, a cleaner admin list for managing all 469 episodes, and reuse across the article page, the schema, and a possible future podcast index page. This has no effect on discoverability (search engines only see the rendered page), so it is an engineering and content management improvement, scoped on its own after the items above. ([Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics))

---

## Podcast feed (changes happen in the feed generator)

We reviewed the live feed (Stories from The Trailhead, 469 episodes, generated from a Google Sheet). It is in good shape and already meets Apple's required tags: show title, description, language (`en-us`), cover art (3000 by 3000 pixels, passes), category, explicit flag, and owner email; and per episode a title, a stable GUID, pubDate, duration, season, episode number, and an enclosure with byte length and `audio/mpeg` type. Items to address:

- **Add the Podcasting 2.0 namespace and a `podcast:transcript` tag per episode.** Apple and Spotify both display transcripts from this tag. ([Apple](https://podcasters.apple.com/support/5316-transcripts-on-apple-podcasts); [Podnews](https://podnews.net/update/spotify-transcripts-p20))
- **Disclose the AI voice (mandatory for Apple Podcasts).** Apple requires disclosure when AI generates a material portion of the audio. The show description already notes synthetic voices, which is a good start at the show level; add a short spoken line per episode and the AI metadata tag. Non compliance risks removal. ([RSS.com](https://help.rss.com/en/support/solutions/articles/44002518955-ai-generated-content-in-podcasting))
- **Fix the one episode missing its number:** "The Situation Is The Boss, Man..." (file `S2021-E000`) has no `itunes:episode` tag. ([Apple RSS guide](https://github.com/Podcastindex-org/podcast-namespace/blob/main/itunes_reference.md))
- **Optional:** add `itunes:episodeType` (full, trailer, or bonus) per episode.

Because the feed is built from a Google Sheet, these changes are made in that generator, not in the Shopify theme.

---

## Distribution (one time setup, then automatic)

Submit the feed once to each platform. Apps then pull new episodes on their own. Ordered by audience size (per Edison Research). ([Podnews](https://podnews.net/press-release/podcast-consumer-2026))

- **YouTube / YouTube Music** — largest audience; YouTube Music plays the feed automatically, and connecting it in YouTube Studio adds a searchable channel.
- **Spotify for Creators** — second largest; claim the feed.
- **Apple Podcasts** — still essential; also covers Overcast.
- **Amazon Music and Audible** — one submission covers both.
- **iHeartRadio** — quick US reach.
- **Pocket Casts and Podcast Index** — long tail, open ecosystem apps.

---

## Content (ongoing, highest impact on traffic)

1. **Lead each article with a direct 40 to 60 word answer** to the question a hiker would ask, near the top. This is where AI engines pull citations from. ([Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide); directional industry data: [CXL](https://cxl.com/blog/google-ai-overview-citation-sources/))
2. **Back claims with specifics** (weights, materials, test conditions) and keep a visible "last updated" date. Concrete data and freshness both raise AI citation odds (industry analysis, directional). ([Contently](https://contently.com/2026/02/25/how-to-get-cited-google-ai-overviews/))
3. **Earn off site mentions** on Reddit, YouTube, and review sites. A documented citation factor across every AI engine and a natural fit for the ultralight community (industry analysis, directional). ([Contently](https://contently.com/2026/02/25/how-to-get-cited-google-ai-overviews/))
4. **Turn on Search Console's Generative AI performance reports** (launched June 2026) to measure visibility inside AI Overviews and AI Mode. ([Google](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports))
5. **Skip llms.txt.** Google has said it does not use it and AI crawlers do not request it, so it is not a traffic lever. ([Search Engine Land](https://searchengineland.com/does-llms-txt-matter-467740))
