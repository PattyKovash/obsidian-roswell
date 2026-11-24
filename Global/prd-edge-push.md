# Pushing a PRD to the Edge

Read at the push step. Every Edge write needs the user's approval (hard rules).

1. **Review the whole PRD** with the checklist at the end of `/Users/pk/Documents/obs-roswell/Ticket Authoring Prompt v2.md`.
2. **Screenshots first:** upload each one as a ticket attachment (`upload_attachment`) and swap the returned URLs into the PRD, so no local image paths go up.
3. **Pull the ticket** (`get_ticket`) right before every push and compare it with what you last read (version, description, brief, comments), to catch edits made directly in the Edge by anyone. Show the user any changes and merge them into the draft first.
4. **First push:** one `update_ticket` with the whole PRD (frontmatter stripped) and `description_mode: "replace"`, after the user has seen where each part of the original went.
5. **Later edits:** `description_section {heading, text}`, one section per call; the version changes each time, so re-read it between calls. Never remove sections or delete them to reorder.
6. **Read the ticket back** to confirm, then update `edge_version` and `status` in the draft's frontmatter.
7. **Keep both in sync.** If the user edits the ticket in the Edge, fetch the description and write it into the local draft as-is (fetched, not retyped), then update the frontmatter.
