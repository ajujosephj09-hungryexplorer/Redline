# FINDINGS_2.md

Post-merge critique findings from `/impeccable critique` (dual-agent: Design Review · Detector).
Run after 47-finding fix (FINDINGS_1.md) merged to master on 2026-10-22.
All issues tracked here until closed. Status: Open unless marked Fixed.

---

## P0 — Blocking

### F-048 [SECURITY] RLS status on `analyses` and `rules` tables unverified
- **File:** Supabase console — `analyses`, `rules`, `profiles` tables
- **What:** The `documents` table has 3 RLS policies confirmed (screenshot). The `analyses` and `rules` tables are visible in the sidebar but their RLS status is unknown. If RLS is disabled on either, any authenticated user can read or overwrite any other user's analyses or rules via the JS client — the server-side `.eq('user_id', user.id)` filter is not a security boundary when called from the browser.
- **Fix:** In Supabase console, click `analyses` → check for RLS badge. Repeat for `rules`. If missing, enable RLS and add per-user policies (SELECT/INSERT/UPDATE/DELETE scoped to `auth.uid() = user_id`). Add migrations to `supabase/migrations/` so policies are version-controlled.
- **Status:** Fixed — user confirmed RLS is enabled on all tables (screenshot: `documents` shows DELETE/INSERT/SELECT policies; `analyses` and `rules` confirmed 2026-10-22).

---

## P1 — High

### F-049 [A11Y] FindingRow expand button has no accessible name for the finding it controls
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`
- **What:** The `<button aria-expanded={open}>` on each FindingRow announces expanded/collapsed state (F-001 fix) but not which finding it belongs to. Screen reader users hear "button, collapsed" for every row with no way to distinguish "IP Assignment" from "Non-Compete". The rule name is a sibling `<span>`, not inside the button.
- **Fix:** Add `aria-label={\`${open ? 'Collapse' : 'Expand'} ${flag.ruleName}\`}` to the toggle button.
- **Test:** Assert button has aria-label containing the ruleName.
- **Status:** Open

### F-050 [UX] Analysis save failures are silent — user loses work on refresh
- **File:** `src/app/(app)/dashboard/documents/[id]/DocumentAnalysisClient.tsx`
- **What:** `saveAnalysis` catches errors and calls `console.error`. The user sees nothing. If the Supabase write fails (network blip, quota, RLS), the analysis is lost on page refresh and the user must re-analyze.
- **Fix:** Add a `saveStatus` state ('saving' | 'saved' | 'failed'). Show a subtle status line below the document title: "Saving…" → "Saved" (with timestamp) → "Failed to save — [Retry]". Auto-retry once on failure before showing the error state.
- **Test:** Mock saveAnalysis to reject; assert error UI is visible.
- **Status:** Open

### F-051 [UX] Analysis results page: no clear first action for the user
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`
- **What:** Summary, all severity groups, gaps, save banner, question box, and checklist render in one unbroken scroll. A contract with 5 critical flags + 3 gaps requires 8+ screen-lengths before reaching the question box. No signal tells the user where to start.
- **Fix:** Add a "Jump to critical findings ↓" anchor link immediately below the summary when `criticalFlags.length > 0`. Auto-scroll to the first critical FindingRow on load. Add a sticky mini-summary bar (critical count / moderate count / gap count) that stays visible while scrolling.
- **Test:** Assert anchor link is present when criticalFlags > 0.
- **Status:** Open

### F-052 [FEATURE] No workflow for revised contracts — re-upload re-analyzes from scratch
- **File:** `src/app/(app)/upload/page.tsx` · `src/lib/analyses/actions.ts`
- **What:** After negotiating, a freelancer receives a revised contract. Redline re-analyzes from scratch with no diff or comparison. The freelancer cannot tell what changed or whether their pushback was accepted.
- **Fix:** After title/text parsing on upload, check the library for documents with similar titles. If found, offer "Is this a revision of [similar doc]?" If yes, after analysis show a "Changes from previous version" section using text diff (diff-match-patch) to highlight added/removed/modified passages in the flagged clauses.
- **Test:** Unit test the diff detection logic.
- **Status:** Open

---

## P2 — Medium

### F-053 [UX] Emotional flatline at end of analysis — no clear next action
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`
- **What:** After reviewing all findings, the user is left at the question box with no summary of what to do next. For a freelancer who needs to send a response to the client, there is no "here's your response draft" moment.
- **Fix:** Add a "Your response" card after the gaps section. Show a count ("You have X critical and Y moderate issues to raise") and a "Copy all counter-offers" button that copies a formatted list of all flagged ruleName + counterOffer as a plain-text negotiation email template.
- **Test:** Assert the card renders when flags.length > 0; assert copy button is present.
- **Status:** Open

### F-054 [UX] Counter-offer editing loses citation context
- **File:** `src/components/CounterOfferBlock.tsx`
- **What:** When the user clicks Edit, the textarea replaces the counter-offer card. The citation block (showing the exact contract text) is above in the parent, but tabbing to check it loses focus on the textarea. For editing that requires cross-referencing the original clause, this is friction.
- **Fix:** When in edit mode, add a collapsed citation reminder inside CounterOfferBlock: a smaller "From contract:" label + monospace excerpt of the citation (passed as a prop) above the textarea, so the user never has to leave the edit context.
- **Test:** Assert citation text is visible when isEditing is true.
- **Status:** Open

### F-055 [UX] No stale-analysis warning when rules are toggled on/off
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx` · `src/app/(app)/rules/page.tsx`
- **What:** If a user toggles a rule on/off after viewing an analysis, the cached analysis no longer matches the active ruleset. There is no banner or prompt to re-analyze.
- **Fix:** Store the rule fingerprint (sorted array of enabled rule IDs) at analysis time. On the document view, compare the current rules fingerprint against the stored one. If they differ, show a banner: "Your rules have changed since this analysis. [Re-analyze]".
- **Test:** Assert stale banner appears when rule fingerprint differs.
- **Status:** Open

### F-056 [UX] Empty counter-offer saves without validation
- **File:** `src/components/CounterOfferBlock.tsx`
- **What:** A user can click Save on a blank textarea, replacing the generated counter-offer with nothing. There is no minimum-length validation.
- **Fix:** Disable the Save button when the textarea is empty or whitespace-only. Show a helper message: "Counter-offer cannot be blank — restore original?" with a reset link.
- **Test:** Assert Save button is disabled when textarea is empty.
- **Status:** Open

---

## P3 — Polish

### F-057 [UX] No onboarding after first signup — empty library with no guidance
- **File:** `src/app/(app)/library/page.tsx`
- **What:** After signup, the user lands on an empty library with "No contracts yet. Upload one to get started." The button exists but there is no hand-holding for a first-timer who doesn't know the workflow.
- **Fix:** Enhance the empty state: add a 3-step visual guide ("1. Upload your contract → 2. We check 6 risk areas → 3. You get exact citations and counter-offers") above the Upload button. Keep it concise — one line per step.
- **Test:** Assert step guide renders when documents.length === 0 and user is authenticated.
- **Status:** Open

### F-058 [DESIGN] Scrollbar thumb color (#cbd5e1) not registered in DESIGN.md token set
- **File:** `src/app/globals.css:31`
- **What:** The webkit scrollbar thumb uses `#cbd5e1` (slate-300 equivalent) which is not in the documented color palette. Low-risk drift, but inconsistent with the token-first approach.
- **Fix:** Add `scrollbar-thumb: '#cbd5e1'` to DESIGN.md neutral tokens, or replace with `#cbd5e1` → `theme(colors.slate.300)` in globals.css.
- **Test:** No code test needed — design system documentation update.
- **Status:** Open

### F-059 [UX] deriveTitle falls back to raw contract text — produces truncated legal preamble
- **File:** `src/lib/documents/format.ts` (deriveTitle function)
- **What:** When no title is provided, the fallback slices the first N characters of plain_text, producing titles like "FREELANCE AGREEMENT THIS AGREEMENT, entered into as of the date...". This is unreadable in the library list.
- **Fix:** If no title and plain_text starts with common legal preamble patterns, return "Untitled contract · [formatted date]" instead of slicing.
- **Test:** Assert fallback title is "Untitled contract" pattern for preamble-starting text.
- **Status:** Open

### F-060 [UX] QuestionBox uses single-line input — multi-sentence questions are awkward
- **File:** `src/components/QuestionBox.tsx`
- **What:** The question input is `<input type="text">`. Users writing a detailed question ("What does clause 4.2 say about payment timing, and does the 30-day net term apply to milestone deliverables?") must do so on one line. Shift+Enter does nothing.
- **Fix:** Replace `<input type="text">` with `<textarea rows={1}` that auto-expands to max 4 rows on content. Submit on Enter (without Shift), newline on Shift+Enter.
- **Test:** Assert textarea is rendered; assert Enter submits; assert Shift+Enter inserts newline.
- **Status:** Open

### F-061 [UX] No "Restore defaults" on rules page — deleted rules cannot be recovered
- **File:** `src/app/(app)/rules/page.tsx`
- **What:** If a user deletes all rules or wants to return to the 6 defaults, there is no button to restore them. They must know the defaults from memory.
- **Fix:** Add a "Restore defaults" button (or link) in the rules page header, visible only when one or more default rules are missing. On click, re-insert the missing defaults without replacing custom rules.
- **Test:** Assert button is visible when a default rule is absent; assert clicking it restores only missing defaults.
- **Status:** Open

---

## Infrastructure (out of scope for code fixes — requires external services)

### F-062 [BACKEND] Rate limiting is per-process, not global
- **File:** `src/lib/rate-limit.ts`
- **What:** On Vercel with multiple serverless instances, each maintains its own limiter. Effective limit is 10 × number-of-instances per IP per minute. Not exploitable at current scale, but documented as a soft limit.
- **Fix:** Replace in-memory Map with Upstash Redis `@upstash/ratelimit`. Requires adding Upstash to Vercel integrations.
- **Status:** Open — deferred (infrastructure dependency)
