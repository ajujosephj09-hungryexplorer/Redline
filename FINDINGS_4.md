# FINDINGS_4.md

Manual QA findings from testing a real SEC EDGAR freelance contract (Surna Inc. / DSS Consulting Corporation).
Run on 2026-10-26. All issues tracked here until closed. Status: Open unless marked Fixed.

---

## P0 — Blocking

### F-073 [UX] Summary is an unreadable wall of text
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx` (lines 502-510)
- **What:** The summary renders as a single `<p>` tag — one continuous paragraph with no structure. For a contract with multiple topics (money, exit, wins, red flags), the result is a dense blob that no one will read. Markdown bold markers (`**Money:**`, `**Exit:**`, etc.) from the LLM appear as literal `**` characters instead of formatted text. This is the first thing the user sees after waiting 15-25 seconds for analysis. Losing them here means nothing else matters.
- **Fix:** Parse the summary as markdown and render structured HTML. Break the wall into scannable sections with headings, bold labels, and whitespace. Use a lightweight markdown renderer or structured layout (key-value sections) so the summary is immediately scannable.
- **Test:** Upload the Surna SEC contract. Summary should render with visible section breaks, bold labels, and no raw `**` markers.
- **Status:** Fixed

---

### F-074 [UX] Finding card layout is broken — text overlaps severity badge and title
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx` (lines 63-122, FindingRow component)
- **What:** The collapsed finding card crams three elements into one flex row: severity pill, rule name, and the full `problem` text. When the problem text is long (which it always is for real contracts), the text wraps and overlaps with the badge and title. The `shrink` class on the problem span causes it to compress into garbled, center-aligned text that collides with the left-aligned badge/title. The screenshot shows "Non-Compete" badge text and "Termination without guaranteed payment" title physically overlapping the problem description.
- **Fix:** Remove `flag.problem` from the collapsed header row entirely. The collapsed state should show only: severity pill + rule name + chevron. Move the problem description into the expandable area, displayed above the citation block. This matches standard disclosure/accordion UX — the header is a scannable label, the body has the detail.
- **Test:** Upload the Surna SEC contract. Each finding card header should show only badge + title + chevron with no text overlap. Problem text appears on expand.
- **Status:** Fixed

---

## P1 — High

### F-075 [UX] Finding card body text has no visual hierarchy
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx` (lines 96-119)
- **What:** When a finding is expanded, the problem description (once moved there per F-074), citation, and counter-offer run together with minimal visual separation. For lengthy findings (the Surna non-compete flag is 8+ lines), the user cannot quickly scan what the problem is vs. what the contract says vs. what to do about it.
- **Fix:** Add clear labeled sections inside the expanded area: "What is wrong" (problem), "Cited from your contract" (citation, already labeled), and the counter-offer block (already has its own component). Use consistent spacing, subtle dividers or background differentiation between sections.
- **Test:** Expand a finding. Three distinct sections should be visually identifiable without reading.
- **Status:** Fixed

---
