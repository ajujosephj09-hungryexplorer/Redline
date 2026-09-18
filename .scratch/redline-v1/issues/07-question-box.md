# 07 — Question box

**What to build:** After the analysis runs, a question box appears alongside the results. The user types a follow-up question and gets an answer grounded exclusively in the uploaded document and the analysis context (flags, gaps, summary). The question box can answer "why was this flagged?" because it sees the analysis output, not just the raw text. If the document does not contain the answer, the tool says so. Answers that draw on external knowledge are bugs. The question box does not function without an analysis having run first (ADR 0006).

**Blocked by:** 04 — Analysis engine — summary + risk flags

**Status:** done

- [x] Question box UI appears alongside analysis results, not as a separate page or mode
- [x] The question box is only available after an analysis has run
- [x] Every answer is traceable to the uploaded document
- [x] The question box has access to analysis context (flags, gaps, summary) and can answer "why was this flagged?"
- [x] When the question cannot be answered from the document, the response says "not found in document" (or equivalent)
- [x] Answers never draw on external knowledge — only the uploaded document and analysis context
- [x] Conversation-style follow-ups work within the same analysis session
