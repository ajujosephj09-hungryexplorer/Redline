# 08 — Document library

**What to build:** A logged-in user sees a library of their past uploads. Each entry shows the document name and upload date. The user can open any past document and see its original analysis (summary, flags, gaps, checklist). The library is private to the user's account.

**Blocked by:** 04 — Analysis engine — summary + risk flags

**Status:** ready-for-agent

- [ ] Library page lists all past documents for the logged-in user, sorted by upload date
- [ ] Each entry shows document name (or a derived label) and upload date
- [ ] Clicking a past document opens its stored analysis results (summary, flags, gaps, checklist)
- [ ] Row-level security ensures users only see their own documents
- [ ] Empty library state is handled with a clear message directing the user to upload
- [ ] User can delete a document from the library
