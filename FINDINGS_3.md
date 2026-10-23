# FINDINGS_3.md

Post-fix critique findings from `/impeccable critique` (dual-agent: Design Review + Detector).
Run after FINDINGS_2.md fixes merged to master on 2026-10-22.
Score: 29/40 (up from 25). Trend: 25 → 23 → 31 → 25 → 29.
All issues tracked here until closed. Status: Open unless marked Fixed.

---

## P0 — Blocking

### F-063 [UX] CTA buttons have no visible hover state
- **File:** All pages — `page.tsx`, `login/page.tsx`, `signup/page.tsx`, `NavBar.tsx`, `library/page.tsx`, `rules/page.tsx`, `UploadForm.tsx` (15+ instances)
- **What:** Every primary button uses `hover:bg-navy` while resting state is already `bg-navy`. Hover produces zero visual change. The `button-primary-hover` token in DESIGN.md is set to `#1e293b` — identical to the resting value.
- **Fix:** Add a distinct hover color (e.g. `navy-hover: '#334155'` / slate-700) to `tailwind.config.ts`. Replace all `hover:bg-navy` with `hover:bg-navy-hover`.
- **Test:** Visual — hover should produce a visible background shift.
- **Status:** Fixed

---

## P1 — High

### F-064 [UX] NavBar has no active state — user cannot tell which page they are on
- **File:** `src/components/NavBar.tsx`
- **What:** Library, Upload, and Rules nav links all use `text-slate-600 hover:text-navy`. No link is highlighted for the current route. No `aria-current="page"`.
- **Fix:** Import `usePathname()` from `next/navigation`. Apply `text-navy font-semibold` + `aria-current="page"` to the matching link.
- **Test:** Assert active link has `aria-current="page"` and distinct styling.
- **Status:** Fixed

---

## P2 — Medium

### F-065 [UX] No guard against data loss during analysis or counter-offer editing
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`, `src/components/CounterOfferBlock.tsx`
- **What:** Page refresh during the 15-25s analysis kills the request silently. Navigating away from an unsaved counter-offer edit discards it. No `beforeunload` listener.
- **Fix:** Add `useEffect` with `window.addEventListener('beforeunload', ...)` in AnalysisView when `status === 'loading'`, and in CounterOfferBlock when `editingCounter === true`. Remove on cleanup.
- **Test:** Assert `beforeunload` handler is registered during loading/editing states.
- **Status:** Fixed

### F-066 [UX] Analysis loading goes silent for the last ~9 seconds
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`
- **What:** 5 loading messages cycle every 4 seconds (total ~16s), then "Wrapping up the analysis..." sticks indefinitely. The OpenRouter timeout is 25s. The UI goes silent during the highest-anxiety moment.
- **Fix:** Add a 6th message ("Still working, this usually takes 15 to 30 seconds...") to `LOADING_MESSAGES`. Alternatively, show an elapsed-time counter.
- **Test:** Assert 6 messages exist; assert the last message is reassuring.
- **Status:** Fixed

### F-067 [A11Y] Counter-offer textarea has no aria-label
- **File:** `src/components/CounterOfferBlock.tsx`
- **What:** The `<textarea>` in edit mode has no `aria-label` or associated `<label>`. Screen readers announce it as an unlabeled text field.
- **Fix:** Add `aria-label="Edit counter-offer"` to the textarea.
- **Test:** Assert textarea has an aria-label.
- **Status:** Fixed

### F-068 [A11Y] FindingRow chevron SVG missing aria-hidden
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`
- **What:** The expand/collapse chevron SVG (line ~82) lacks `aria-hidden="true"`. Screen readers may announce "path" elements. The landing page version correctly has it.
- **Fix:** Add `aria-hidden="true"` to the SVG element.
- **Test:** Assert SVG has `aria-hidden="true"`.
- **Status:** Fixed

### F-069 [A11Y] QuestionBox conversation area has no role="log"
- **File:** `src/components/QuestionBox.tsx`
- **What:** The scrollable conversation div has no semantic role. Screen readers won't announce new responses automatically.
- **Fix:** Add `role="log"` and `aria-live="polite"` to the conversation container div.
- **Test:** Assert conversation container has `role="log"`.
- **Status:** Fixed

---

## P3 — Polish

### F-070 [UX] Library error messages styled as headings, not errors
- **File:** `src/app/(app)/library/page.tsx`
- **What:** Error text uses `text-navy font-semibold` (lines 149, 195) instead of `text-error`. Errors look like normal content and get overlooked.
- **Fix:** Replace `text-navy font-semibold` with `text-error` on both error message lines.
- **Test:** Assert error elements use `text-error` class.
- **Status:** Fixed

### F-071 [A11Y] InlineEdit says "click to edit" — should say "activate to edit"
- **File:** `src/app/(app)/rules/page.tsx`
- **What:** The `sr-only` span on InlineEdit buttons says "(click to edit)". Keyboard users don't "click." Should use interaction-agnostic language.
- **Fix:** Change "(click to edit)" to "(edit)".
- **Test:** Assert sr-only text does not contain "click".
- **Status:** Fixed

### F-072 [UX] QuestionBox error uses text-severity-critical instead of text-error
- **File:** `src/components/QuestionBox.tsx`
- **What:** Error message uses `text-severity-critical` (line 222) while all other errors use `text-error`. Same hex value (#dc2626) but different semantic class. Violates the Severity Monopoly Rule at the naming level.
- **Fix:** Replace `text-severity-critical` with `text-error`.
- **Test:** Assert error element uses `text-error` class.
- **Status:** Fixed

### F-073 [A11Y] FindingRow chevron in AnalysisView differs from landing page version
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx` vs `src/app/page.tsx`
- **What:** Landing page uses Unicode `▾` for expand/collapse; AnalysisView uses SVG chevron. Different affordance for the same interaction. (SVG is better — landing page should match, not the reverse.)
- **Fix:** Low priority. Note for future landing page polish pass.
- **Test:** N/A — cosmetic alignment.
- **Status:** Open — deferred

### F-074 [DESIGN] 5 undocumented token extensions in use
- **File:** `tailwind.config.ts`, various components
- **What:** `slate-600`, `slate-700`, `slate-800` (as text), `severity-moderate-text` (#b45309), `error` (#dc2626), and `slate-300` (toggle bg) are used in production but not documented in DESIGN.md's color inventory.
- **Fix:** Run `/impeccable document` to refresh DESIGN.md from shipped code.
- **Test:** N/A — documentation.
- **Status:** Open — deferred (run after code fixes)

---

## Deferred (product decisions required)

### F-075 [UX] "Copy all counter-offers" produces context-free text
- **What:** The copied text is rule names + counter-offers but no citations. Not useful as an email draft. Requires product decision on format.
- **Status:** Open — deferred

### F-076 [UX] No export/share/PDF for forwarding analysis to a lawyer
- **What:** For the "forward to my lawyer" use case, the tool hits a wall. Requires product decision on scope.
- **Status:** Open — deferred
