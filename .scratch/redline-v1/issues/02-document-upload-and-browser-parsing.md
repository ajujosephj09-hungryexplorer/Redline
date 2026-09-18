# 02 — Document upload + browser parsing

**What to build:** A logged-in user pastes contract text or uploads a file (.txt, .pdf, .docx). Parsing happens entirely in the browser — the server never receives the original file. The extracted plain text is stored in Supabase tied to the user's account. If the user uploads a scanned/image-based PDF, the app rejects it with a clear message explaining why.

**Blocked by:** 01 — Project scaffold + auth

**Status:** ready-for-agent

- [ ] Upload UI accepts paste, .txt, .pdf, and .docx
- [ ] Text extraction runs client-side (no file sent to server)
- [ ] Only plain text is stored in the database
- [ ] Uploaded document is tied to the authenticated user
- [ ] Image-based / scanned PDFs are detected and rejected with a clear user-facing message
- [ ] Empty or unreadable files are handled gracefully with an error message
- [ ] Supabase row-level security ensures users can only see their own documents
