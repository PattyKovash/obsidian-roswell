# PLP SEO Description — Column Split Investigation Response

This collection's description was written as two paragraphs. It has a short one ("Backpack Attachments") followed by the longer body copy. I'm assuming the short one was intended to be a heading rather than a paragraph.

Our styling protects paragraphs from being broken apart, so with two paragraphs the layout placed the short one in the left column and the long one in the right, which is why it looked off.

I've converted "Backpack Attachments" into a proper heading. Headings are styled to stay attached to the text that follows them, so the heading and the start of the copy now sit together.

That leaves a single paragraph of body copy. Rather than stack all of it in the left column and leave the right column empty, which creates a visual imbalance on desktop, the layout flows it across both columns. This is the single-paragraph exception we built in during the previous ticket, and it's working as designed. Where exactly the text breaks between the two columns is decided by the browser based on the visitor's screen width, so it won't land in the same spot on every device.

A technique to avoid breaking mid-sentence is to split the body copy into two paragraphs in the collection description. This would keep the 1st paragraph with the heading and more predictably split the 2nd paragraph into the 2nd column.
