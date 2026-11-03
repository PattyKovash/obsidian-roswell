# Re: SEO Description column tweaks

Thanks for these — the approach is right, and we'd tweak a couple of details before shipping.

**Paragraphs not splitting across the gap** — agreed, we'll add this. ✅

**Headings staying with their text** — agreed, and we'll extend it to cover all heading sizes, not just H2/H3. ✅

**One adjustment on the selectors:** your snippets reference a class from a different section. This section uses its own wrapper, so we'll retarget the rules to it — same result, just pointed at the right place. (It also keeps the rules from accidentally affecting other parts of the page.)

**On the `margin-top` for spacing:** we want that space *between* a heading and the text above it — but a blanket rule also adds a gap when a heading falls at the very top (start of the content, or the top of the second column), which looks off. We'll apply it but exclude the first heading in the container so the text starts at the top.

**On wrapping the small headings in H5/H6:** this one isn't a code change. The section pulls from the collection description / metafield, so it renders whatever was typed in the editor — we can't convert a bolded paragraph into a real heading from the theme side. The clean fix is to use the actual Heading styles in the editor when writing those lines. They'll then get the bold look automatically *and* pick up all the spacing/keep-together rules above. Happy to walk through that with whoever maintains the copy.
