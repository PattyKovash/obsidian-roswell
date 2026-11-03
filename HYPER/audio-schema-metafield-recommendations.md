# Audio Schema — Metafield Recommendations

Article pages already output an `AudioObject` in the JSON-LD schema when `custom.audio_url` is set. The following fields, if added, would provide additional properties on that `AudioObject`. All are documented in the [Schema.org AudioObject spec](https://schema.org/AudioObject) as available properties — none are designated as required or recommended by Schema.org, and Google does not currently list AudioObject as a supported rich result type in its [Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).

Adding these fields completes the structured data description of the audio content. Whether or how search engines use them is not documented by Google.

All fields should be added under the **`custom`** namespace in Shopify — the same namespace used by the existing `audio_url`, `audio_episode`, `audio_season`, and `audio_voice_gender` fields.

---

## Fields

### `audio_duration`
**Field type:** Single-line text
**Example value:** `PT45M30S`

Maps to the [`duration`](https://schema.org/duration) property on `AudioObject`. Format is ISO 8601: `PT` followed by hours `H`, minutes `M`, and seconds `S`.

- 45 minutes, 30 seconds → `PT45M30S`
- 1 hour, 2 minutes → `PT1H2M`
- 30 minutes exactly → `PT30M`

---

### `audio_encoding_format`
**Field type:** Single-line text
**Example value:** `audio/mpeg`

Maps to the [`encodingFormat`](https://schema.org/encodingFormat) property on `AudioObject`. Should be a valid MIME type. Most podcast audio files are `audio/mpeg` (MP3).

---

### `audio_transcript_url`
**Field type:** URL
**Example value:** `https://yourdomain.com/blogs/podcast/episode-title-transcript`

Maps to the [`transcript`](https://schema.org/transcript) property on `AudioObject`. Should point to a URL where the full episode transcript is published. If transcripts are published inline on the article page rather than at a separate URL, this field is not applicable.

---

## Accessibility Considerations

The fields above relate to structured data only. Structured data (JSON-LD) is not consumed by screen readers or assistive technology — those rely on HTML semantics and ARIA attributes. However, the `transcript` field points to where actual accessibility work happens, and that work has documented benefits.

### Transcripts are a WCAG requirement

[WCAG 1.2.1 (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html) requires a text alternative for prerecorded audio-only content. Publishing a transcript fulfills this requirement for users who are deaf, hard of hearing, or have auditory processing difficulties.

The `audio_transcript_url` schema field does not provide the accessibility benefit — **publishing the transcript itself does**. The schema field signals to search engines where that transcript is located.

### Transcripts also improve content discoverability

[W3C WAI documents](https://www.w3.org/WAI/media/av/transcripts/) that transcripts make audio content searchable by search engines and enable content to be found by people who cannot or choose not to play audio. This is an indirect discovery benefit that applies to all users, not only those with disabilities.

### Duration

No accessibility requirement exists for the `duration` field. [W3C WAI](https://www.w3.org/WAI/media/av/) notes that duration information helps users plan their time, which is useful broadly, including for users with cognitive disabilities — but this benefit comes from displaying duration on the page, not from the schema property.

---

## Not Recommended

### Speakable schema
Google's [Speakable structured data](https://developers.google.com/search/docs/appearance/structured-data/speakable) is currently in beta, limited to English-language content for U.S. audiences, and scoped specifically to topical news content surfaced via Google Assistant on smart speakers. It is not applicable to branded blog or podcast content.

### `audio_voice_gender` *(existing field)*
There is no equivalent property in the [Schema.org AudioObject spec](https://schema.org/AudioObject). This field does not contribute to structured data.

---

## Reference

| Property | Schema.org Documentation |
|---|---|
| AudioObject | https://schema.org/AudioObject |
| duration | https://schema.org/duration |
| encodingFormat | https://schema.org/encodingFormat |
| transcript | https://schema.org/transcript |
| Google Search Gallery | https://developers.google.com/search/docs/appearance/structured-data/search-gallery |
| Google Speakable | https://developers.google.com/search/docs/appearance/structured-data/speakable |
| WCAG 1.2.1 — Audio-only (Prerecorded) | https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html |
| W3C WAI — Transcripts | https://www.w3.org/WAI/media/av/transcripts/ |
| W3C WAI — Audio and Video Media | https://www.w3.org/WAI/media/av/ |
