# 02 — Document upload + browser parsing

**What to build:** A logged-in user pastes contract text or uploads a file (.txt, .pdf, .docx). Parsing happens entirely in the browser — the server never receives the original file. The extracted plain text is stored in Supabase tied to the user's account. If the user uploads a scanned/image-based PDF, the app rejects it with a clear message explaining why.

**Blocked by:** 01 — Project scaffold + auth

**Status:** done

- [x] Upload UI accepts paste, .txt, .pdf, and .docx
- [x] Text extraction runs client-side (no file sent to server)
- [x] Only plain text is stored in the database
- [x] Uploaded document is tied to the authenticated user
- [x] Image-based / scanned PDFs are detected and rejected with a clear user-facing message
- [x] Empty or unreadable files are handled gracefully with an error message
- [x] Supabase row-level security ensures users can only see their own documents
