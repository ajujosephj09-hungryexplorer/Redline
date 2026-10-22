# FINDINGS_1.md

Post-adversarial critique findings from `/impeccable critique` (quad-agent: UX/UI · Detector · Frontend Technical · Backend).
All issues tracked here until closed. Status: Open unless marked Fixed.

---

## P0 — Blocking (fix before any external user sees this)

### F-001 [A11Y] FindingRow accordion missing `aria-expanded`
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:76`
- **What:** The `<button onClick={onToggle}>` that expands each risk finding has no `aria-expanded` attribute. The landing page version (`src/app/page.tsx:97`) correctly sets `aria-expanded={isExpanded}`. Screen readers cannot communicate collapsed/expanded state.
- **Fix:** Add `aria-expanded={open}` to the button element at line 76.
- **Test:** Render FindingRow with `open={false}`, assert `aria-expanded="false"` on button; render with `open={true}`, assert `aria-expanded="true"`.
- **Status:** Open

### F-002 [A11Y] Auth inputs have no visible focus ring
- **File:** `src/app/(auth)/login/page.tsx:61,76` · `src/app/(auth)/signup/page.tsx:82,98`
- **What:** Both auth forms use `focus:ring-0`, removing the Tailwind ring without a verified WCAG-compliant replacement. The 1px border colour shift (slate-300 → navy) does not meet WCAG 2.1 SC 2.4.11 minimum focus indicator area.
- **Fix:** Replace `focus:ring-0` with `focus:ring-2 focus:ring-navy/30`, matching the pattern in `UploadForm.tsx`.
- **Test:** Render each input, assert class list contains `focus:ring-2` and does not contain `focus:ring-0`.
- **Status:** Open

### F-003 [RESPONSIVE] NavBar "Sign up" button touch target ~30 px tall
- **File:** `src/components/NavBar.tsx:85`
- **What:** `py-1.5` yields ~32 px total height. WCAG 2.5.5 requires 44×44 px minimum for touch targets. Every mobile visitor clicking the primary conversion button has a misfire risk.
- **Fix:** Change `py-1.5` to `py-2.5` (≈40 px) or `py-3` (44 px).
- **Test:** Render NavBar with `authed=false`, assert Sign up button does not have class `py-1.5`.
- **Status:** Open

### F-004 [UX] Anonymous save prompt buried below fold
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:732–744`
- **What:** The only account-creation CTA for anonymous users renders after the question box, all gap cards, and the rules checklist — 3–4 viewports below the fold on any real contract. Users read findings, feel done, and close the tab without ever seeing the save prompt.
- **Fix:** Move the save prompt to immediately below the summary card (before findings). Render as an inline banner: "This analysis disappears when you close the tab — [Save it →]."
- **Test:** Render AnalysisView in anonymous mode with `status="done"`, assert save-prompt element appears before the first FindingRow in the DOM.
- **Status:** Open

### F-005 [UX] No back navigation from document view for authenticated users
- **File:** `src/app/(app)/dashboard/documents/[id]/page.tsx` / `DocumentAnalysisClient.tsx`
- **What:** Neither the page nor DocumentAnalysisClient provides a "← Your contracts" link. Browser back and the NavBar "Library" link are the only exits. Users reviewing multiple contracts lose spatial context.
- **Fix:** Add a `← Your contracts` link at the top of the document page, above the document title, pointing to `/library`.
- **Test:** Render the document page shell, assert a link with `href="/library"` is present.
- **Status:** Open

### F-006 [DESIGN] "Clear" label on low-severity flagged findings
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:688` · `severityPill()` line 45 · severity key lines 641–645
- **What:** The low-severity FindingRow group header is labelled "Clear" in `text-severity-clear` (green). The severity key defines "Clear" as "checked and looks fair." These items are still flagged risks — a freelancer scanning the green header concludes no action is needed and may miss a harmful clause.
- **Fix:** Rename low-severity tier to "Low" in the group header, `severityPill()`, and the severity key. Reserve "Clear" exclusively for the no-flag checklist status.
- **Test:** Call `severityPill('low')`, assert returned className/text does not include the word "Clear" and does not include `text-severity-clear`.
- **Status:** Open

### F-007 [INTEGRITY] Counter-offer block copy-pasted between FindingRow and GapCard
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:58–189` (FindingRow) and `197–296` (GapCard)
- **What:** ~100 lines of identical state (`copied`, `counterText`, `editingCounter`), `useRef`, `copyCounter` callback, and textarea/save/cancel JSX are duplicated verbatim between the two components. Any behavioural change must be made twice and will drift.
- **Fix:** Extract `<CounterOfferBlock initialText={string} />` that owns all state and render logic. Both FindingRow and GapCard use it.
- **Test:** Confirm the extracted component renders a copy button that fires `navigator.clipboard.writeText` with the correct text, and that save/cancel correctly toggles edit mode.
- **Status:** Open

---

## P1 — Major (fix before user testing / public launch)

### F-008 [A11Y] QuestionBox `<input>` has no `<label>`
- **File:** `src/components/QuestionBox.tsx:220`
- **What:** The question input has `aria-describedby="question-char-count"` but no `<label>`, `aria-label`, or `aria-labelledby`. Screen readers announce placeholder as the accessible name, which is unreliable.
- **Fix:** Add `<label htmlFor="question-input" className="sr-only">Ask a question about this contract</label>` and `id="question-input"` on the input.
- **Test:** Render QuestionBox, query input by role with `{name: /ask a question/i}`, assert it is found.
- **Status:** Open

### F-009 [A11Y] Decorative spinners not `aria-hidden`; Copy button state not announced
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:469` · `src/components/QuestionBox.tsx:205`
- **What:** Spinning divs inside `role="status"` live regions are not `aria-hidden="true"` — screen readers announce them as unnamed decorative elements. The Copy button "Copied" state change has no `aria-live` announcement.
- **Fix:** Add `aria-hidden="true"` to both spinner divs. Add `aria-live="polite" aria-atomic="true"` to a wrapper around the Copy button, or update `aria-label` dynamically on state change.
- **Test:** Render loading state, assert spinner div has `aria-hidden="true"`. Render Copy button post-copy, assert announced label changes.
- **Status:** Open

### F-010 [A11Y] Nav links stay in tab order while `visibility:hidden`
- **File:** `src/components/NavBar.tsx:50–51`
- **What:** Uses `style={{ visibility: authed === null ? 'hidden' : 'visible' }}`. `visibility:hidden` removes elements visually but they remain in the keyboard tab order. During auth resolution, keyboard users tab to invisible nav links.
- **Fix:** Use `display: none` (e.g. conditional render or a `hidden` class) instead of `visibility:hidden` while `authed === null`.
- **Test:** Render NavBar with `authed=null`, assert nav link container is not in the document or has `display:none`.
- **Status:** Open

### F-011 [DESIGN+THEMING] GapCard uses amber as card background
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:213`
- **What:** `bg-amber-50 border-amber-200` fills the entire GapCard. Per DESIGN.md, amber appears only as pills and dots — never backgrounds. The entire "Missing clauses" section becomes an amber wash, eroding the palette's diagnostic authority. `bg-amber-50` (#fffbeb) and `border-amber-200` (#fde68a) are also off the documented token palette.
- **Fix:** Change GapCard to `bg-white border border-slate-200`. Add an amber severity dot or pill in the GapCard header to preserve the severity signal.
- **Test:** Render GapCard, assert root element does not have class `bg-amber-50` or `border-amber-200`.
- **Status:** Open

### F-012 [RESPONSIVE] Edit/Copy pill buttons ~20 px tall
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:131,138,240,247`
- **What:** `py-0.5` = 2 px top + 2 px bottom + ~16 px line-height ≈ 20 px. WCAG 2.5.5 requires 44×44 px minimum for touch targets. Mobile users will routinely misfire on Edit and Copy.
- **Fix:** Increase to `py-1.5 px-3` minimum.
- **Test:** Render FindingRow expanded, assert Edit button does not have class `py-0.5`.
- **Status:** Open

### F-013 [RESPONSIVE] Problem text hard-truncated at `max-w-[50%]` on mobile
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:86`
- **What:** On a 375 px screen, 50 % = ~187 px, truncating the problem to 2–3 words. The full problem text is not accessible via expansion (expansion shows citation, not problem). Content is hidden, not adapted.
- **Fix:** Remove `truncate max-w-[50%]`. Stack problem text below the rule name on narrow viewports using responsive classes.
- **Test:** Render FindingRow, assert problem text span does not have class `max-w-[50%]` or `truncate`.
- **Status:** Open

### F-014 [UX] Landing page CTAs link to `/analyze` — bypasses saved uploads for authenticated users
- **File:** `src/app/page.tsx:219,340`
- **What:** Both CTAs point to `/analyze` (anonymous flow). An authenticated user who clicks is silently dropped into a session that will not save to their account.
- **Fix:** Change both `href` values to `/upload`. The upload page already handles the Supabase-unconfigured fallback.
- **Test:** Render the landing page, assert primary CTA link has `href="/upload"`.
- **Status:** Open

### F-015 [PERFORMANCE] `loadingMessages` defined inside component body
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:371`
- **What:** `const loadingMessages = [...]` is declared inside the component function, recreating the array on every render. It is referenced as `loadingMessages.length` in a `useEffect` dependency array, masking a conceptual dependency error.
- **Fix:** Move `loadingMessages` outside the component as `const LOADING_MESSAGES = [...]`.
- **Test:** Not directly testable as a unit test (no render output difference). Manual check: confirm the constant is defined at module scope in the fixed file.
- **Status:** Open

### F-016 [PERFORMANCE] Inline `onToggle` arrow functions recreated every render
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:663,680,697`
- **What:** `onToggle={() => toggleFlag(index)}` creates a new function instance per flag per render, preventing `React.memo` bailouts on FindingRow.
- **Fix:** Wrap `toggleFlag` in `useCallback`. Wrap `FindingRow` in `React.memo`.
- **Test:** Not directly testable without a render performance harness. Manual check: confirm `React.memo` wraps FindingRow and `toggleFlag` is wrapped in `useCallback`.
- **Status:** Open

### F-017 [INTEGRITY] `key={i}` (index) on checklist rows and gap cards
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:342,716`
- **What:** Index-based keys break React reconciliation when items are added, removed, or reordered. Local state (`editingCounter`, `copied`) will be incorrectly preserved or reset.
- **Fix:** Use `key={item.ruleName}` for checklist items; `key={gap.ruleName}` for gap cards.
- **Test:** Render RulesChecklist with items, assert each item's key prop is the ruleName not an index. (Static analysis / snapshot test.)
- **Status:** Open

### F-018 [INTEGRITY] `text-severity-critical` used for generic UI errors
- **File:** `src/app/(auth)/login/page.tsx:82` · `src/app/(auth)/signup/page.tsx:104` · `src/app/(app)/upload/page.tsx:64` · `src/components/UploadForm.tsx:236`
- **What:** `text-severity-critical` (#dc2626) is used for form/network error messages, conflating contract severity with UI error state. The Severity Monopoly Rule is violated: red should appear only as a severity indicator.
- **Fix:** Define a `text-error` token in `tailwind.config.ts` pointing to `#dc2626`. Replace `text-severity-critical` with `text-error` in all four files.
- **Test:** Render login form with an error, assert error paragraph has class `text-error` not `text-severity-critical`.
- **Status:** Open

### F-019 [BACKEND] No server-side text size cap
- **File:** `src/app/api/analyze/route.ts:33` · `src/app/api/question/route.ts:32`
- **What:** Both routes accept arbitrary-length text. The client-side 2 MB file guard is trivially bypassed. A 50 MB string reaches the LLM unchecked, risking context window exhaustion and cost inflation.
- **Fix:** Add `if (text.length > 200_000) return NextResponse.json({ error: 'Contract text is too long.' }, { status: 413 })` at the start of both route handlers.
- **Test:** Call the route handler directly with a 200 001-character string, assert 413 response. Call with 199 999 characters, assert it proceeds past the check.
- **Status:** Open

### F-020 [BACKEND] `conversationHistory` unvalidated and unbounded
- **File:** `src/app/api/question/route.ts:32`
- **What:** `conversationHistory` is passed directly to the LLM message array without schema validation, role check, or length cap. Arbitrary roles, unlimited turns, or malformed entries can be injected, bloating prompt tokens and potentially causing unexpected model behaviour.
- **Fix:** Validate: assert array, cap at 20 turns, assert each entry has `role` in `['user', 'assistant']` and `content` is a non-empty string under 2 000 characters.
- **Test:** Call the route handler with `conversationHistory` containing 21 turns, assert 400 response. Call with an entry whose role is `'system'`, assert 400. Call with valid history, assert it proceeds.
- **Status:** Open

### F-021 [BACKEND] No `AbortController` timeout on OpenRouter fetch
- **File:** `src/lib/analysis/openrouter.ts:45`
- **What:** The `fetch` call to OpenRouter has no `signal`. A stalled call holds the serverless function open until the platform hard-timeout (10–30 s on Vercel), consuming concurrency slots and returning a generic 504 with no actionable message.
- **Fix:** Add `AbortController` with a 25 s timeout. Pass `signal` to `fetch`. Clear the timer in `finally`. Surface a timeout-specific error message.
- **Test:** Mock `fetch` to never resolve. Call `callOpenRouter`. Assert it rejects within ~26 s with a timeout error.
- **Status:** Open

### F-022 [BACKEND] `toggleRule` / `updateRule` / `deleteRule` lack ownership filter (BOLA)
- **File:** `src/lib/rules/actions.ts:25,43,83`
- **What:** All three execute `.update()` / `.delete().eq('id', ruleId)` without `.eq('user_id', user.id)`. Any authenticated user who knows a rule UUID can mutate or delete another user's rule if RLS is misconfigured.
- **Fix:** Add `.eq('user_id', user.id)` to each query, mirroring the pattern already used in `fetchRules` and `createRule`.
- **Test:** Mock Supabase. Call `toggleRule` with a rule UUID. Assert the resulting Supabase query chain includes `.eq('user_id', ...)`. Same for `updateRule` and `deleteRule`.
- **Status:** Open

---

## P2 — Minor (fix in next pass)

### F-023 [A11Y] Checklist gap status `text-amber-600` fails contrast
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:308`
- **What:** `text-amber-600` (#d97706) on white (#ffffff) gives ~2.95:1 contrast ratio. WCAG AA requires 4.5:1 for normal-sized text.
- **Fix:** Use `text-amber-700` (#b45309, ~4.6:1 on white).
- **Test:** Assert `checklistStatusStyle('gap')` returns a class containing `amber-700` not `amber-600`.
- **Status:** Open

### F-024 [A11Y] `analyze/page.tsx` loading state missing `role="status"`
- **File:** `src/app/analyze/page.tsx:64`
- **What:** The loading branch renders `<p>Loading...</p>` in a plain div with no `role="status"` or `aria-live`. Inconsistent with every other loading state in the app.
- **Fix:** Add `role="status" aria-live="polite"` to the wrapping div.
- **Test:** Render the loading branch, assert the wrapper div has `role="status"`.
- **Status:** Open

### F-025 [THEMING] `text-amber-600` / `text-amber-700` used instead of `severity-moderate` token
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:308,603,606,671` · `src/app/page.tsx:289`
- **What:** The documented token is `severity-moderate` (#f59e0b = Tailwind amber-400). `amber-600` (#d97706) and `amber-700` (#b45309) are darker, undocumented shades. Six occurrences route around the token system.
- **Fix:** Add `severity-moderate-text: '#b45309'` to `tailwind.config.ts`. Replace all `text-amber-600` / `text-amber-700` occurrences with `text-severity-moderate-text`.
- **Test:** Assert `tailwind.config.ts` exports a colour named `severity-moderate-text`.
- **Status:** Open

### F-026 [THEMING] `globals.css` scrollbar colours and radius off token scale
- **File:** `src/app/globals.css:28,31,32`
- **What:** Scrollbar track uses `#f1f5f9` (not in palette; documented surface-muted is `#f8fafc`). Thumb border-radius is `3px` (documented scale: 2 px / 6 px / 9999 px).
- **Fix:** Change track to `#f8fafc`. Change `border-radius: 3px` to `border-radius: 2px`.
- **Test:** Read globals.css, assert neither `#f1f5f9` nor `3px` appears in the scrollbar rules.
- **Status:** Open

### F-027 [THEMING] `hover:bg-slate-700` / `hover:bg-slate-800` used instead of navy token
- **File:** `src/app/(app)/rules/page.tsx:210,255,492` · multiple other files
- **What:** Button hover states use undocumented `slate-700` / `slate-800` instead of routing through the navy token. Some buttons hover to `slate-700`, others to `slate-800` — inconsistent.
- **Fix:** Standardise to `hover:bg-navy` across all primary-action buttons.
- **Test:** Assert button elements in the rules page do not have class `hover:bg-slate-700` or `hover:bg-slate-800`.
- **Status:** Open

### F-028 [PERFORMANCE] `criticalFlags` / `moderateFlags` / `lowFlags` recomputed every render
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:516–518`
- **What:** Three `filter`+`map` operations run on every render, including accordion toggles that only need to re-render individual rows.
- **Fix:** Wrap with `useMemo([flags])`.
- **Test:** Manual check — confirm all three derivations are inside `useMemo` in the fixed file.
- **Status:** Open

### F-029 [UX] "Skip to questions" anchor is `sm:hidden` — hidden on desktop
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx:567`
- **What:** The anchor is mobile-only (`sm:hidden`) but desktop users who need to jump to the question box — particularly Morgan under deadline — have no equivalent shortcut.
- **Fix:** Remove `sm:hidden` to make the anchor visible at all breakpoints.
- **Test:** Render AnalysisView with findings, assert "Skip to questions" link is present and does not have class `sm:hidden`.
- **Status:** Open

### F-030 [UX] Inline rule edit has no touch affordance
- **File:** `src/app/(app)/rules/page.tsx:97`
- **What:** The pencil edit icon uses `opacity-0 group-hover:opacity-100`. Hover never fires on touch devices; the entire edit capability is invisible on mobile.
- **Fix:** Show the pencil at permanent low opacity (`opacity-40`) resting, full opacity on active/hover. Or add an explicit "Edit" text button visible at all times.
- **Test:** Render RuleRow, assert pencil icon does not have class `opacity-0`.
- **Status:** Open

### F-031 [UX] Library "Analyzed" indicator uses `text-severity-clear` (green) in body text
- **File:** `src/app/(app)/library/page.tsx:203`
- **What:** `text-severity-clear` (green) is used for the "Analyzed" status label. Green in this design system means "no risk found." Using it to mean "this document has been analysed" creates ambiguity.
- **Fix:** Replace with `text-slate-400` or a neutral indicator. If per-document severity is needed, show a coloured dot representing the worst finding.
- **Test:** Render a library item, assert the "Analyzed" span does not have class `text-severity-clear`.
- **Status:** Open

### F-032 [BACKEND] No retry on transient OpenRouter errors
- **File:** `src/lib/analysis/openrouter.ts`
- **What:** A single attempt is made. OpenRouter 429s, 502s, and brief 503s are not retried. Transient errors surface as permanent failures to the user.
- **Fix:** Retry up to 3 times for status codes 429, 502, 503, 504, with 1 s and 2 s delays. Respect `Retry-After` header.
- **Test:** Mock `fetch` to return 503 twice then 200. Call `callOpenRouter`. Assert it succeeds on the third attempt.
- **Status:** Open

### F-033 [BACKEND] `GAP_TOPIC_PATTERNS` covers only 3 of 6 default rules
- **File:** `src/lib/analysis/engine.ts:249`
- **What:** The deterministic backstop defines regex patterns for only 3 rule names. The other 3 gap-producing rules have no pattern and silently receive no backstop protection. Custom rules are never covered.
- **Fix:** Extend `GAP_TOPIC_PATTERNS` to cover all 6 default gap-producing rules. Document that custom rules are not backstop-covered.
- **Test:** For each of the 6 default rule names that have `produces_gap: true`, assert `GAP_TOPIC_PATTERNS` contains a matching entry.
- **Status:** Open

### F-034 [BACKEND] `fetchAnalysis` silently swallows Supabase errors
- **File:** `src/lib/analyses/actions.ts:19`
- **What:** `if (error || !data) return null` makes a DB error indistinguishable from a cache miss. When Supabase has an intermittent issue, the analysis is silently re-run on every page load, burning API credits.
- **Fix:** Separate: `if (error) throw error` (or return `{ error }`); `if (!data) return null`.
- **Test:** Mock Supabase to return an error. Call `fetchAnalysis`. Assert it throws (or returns `{ error }`) rather than returning `null`.
- **Status:** Open

### F-035 [BACKEND] Supabase misconfiguration silently passes all protected routes
- **File:** `src/middleware.ts:13`
- **What:** When `isConfigured` is false (missing env vars), `middleware.ts` returns `NextResponse.next()` for all routes including `/dashboard`. A misconfigured production deployment becomes fully public with no error surfaced.
- **Fix:** In production, return 503 for protected routes when `!isConfigured`, or log a clear error. Passthrough is acceptable for local dev (guarded by `NODE_ENV !== 'production'`).
- **Test:** Call the middleware handler with a `/dashboard` request and `NODE_ENV=production`, mocking `isConfigured=false`. Assert a 503 response.
- **Status:** Open

### F-036 [BACKEND] In-memory rate limiter does not survive multi-instance deployment
- **File:** `src/lib/rate-limit.ts`
- **What:** The `RateLimiter` uses a process-level `Map`. On Vercel, each serverless instance is independent — a user hitting two instances gets 10 requests per instance. The Map also grows unboundedly (expired entries are never pruned).
- **Fix:** For true multi-instance limiting, use Vercel KV or Upstash Redis. As a minimum, add periodic pruning of expired entries from the Map. Document the limitation in a comment.
- **Test:** Call `check()` with the same key 11 times in the same window on one instance, assert the 11th returns `allowed: false`. (Demonstrates single-instance logic works; documents the limitation.)
- **Status:** Open

### F-037 [BACKEND] Rate limiter picks wrong `x-forwarded-for` entry
- **File:** `src/app/api/analyze/route.ts:7` · `src/app/api/question/route.ts:7`
- **What:** `.split(',').pop()?.trim()` returns the last IP in the `x-forwarded-for` chain (the most recently appended proxy hop), not the client IP (the first entry). In a Vercel + CDN setup all users may share a single rate-limit bucket.
- **Fix:** Use `.split(',')[0]?.trim()` to get the originating client IP.
- **Test:** Test the IP-extraction logic with a header value of `"1.2.3.4, 10.0.0.1, 172.16.0.1"`. Assert the extracted IP is `"1.2.3.4"`.
- **Status:** Open

### F-038 [BACKEND] `AnalysisResult` cast with `as`, not validated at runtime
- **File:** `src/lib/analyses/actions.ts:21`
- **What:** `data.result as AnalysisResult` is erased at runtime. A stored result missing the `checklist` or `flags` field produces a silent TypeScript cast, then a page-level crash when the UI iterates the missing array.
- **Fix:** Add a lightweight shape validator. If validation fails, return `null` so the caller re-runs analysis.
- **Test:** Call `fetchAnalysis` with mocked Supabase returning a result object with no `checklist` field. Assert `null` is returned (not a crashing cast).
- **Status:** Open

---

## P3 — Polish

### F-039 [UX] Login page subtitle re-pitches returning users
- **File:** `src/app/(auth)/login/page.tsx:48`
- **What:** "Analyze your contracts. Find the risk before you sign." is persuasion copy aimed at new visitors. A returning user who knows the product does not need to be sold on it again.
- **Fix:** Change to "Sign in to access your saved contracts."
- **Test:** Render login page, assert subtitle text does not contain "Find the risk before you sign".
- **Status:** Open

### F-040 [BACKEND] `reasoning: { effort: 'low' }` hardcoded in OpenRouter caller
- **File:** `src/lib/analysis/openrouter.ts:43`
- **What:** Reasoning effort is hardcoded with no way to override per call site. Analysis and Q&A share the same setting. Not universally supported — could cause errors on some providers.
- **Fix:** Accept an optional `reasoningEffort` parameter in `callOpenRouter`. Default to `'low'`. Let callers override.
- **Test:** Call `callOpenRouter` with `reasoningEffort: 'medium'`. Assert the request body includes `reasoning: { effort: 'medium' }`.
- **Status:** Open

### F-041 [BACKEND] OAuth callback always redirects to `/dashboard` — no `next=` support
- **File:** `src/app/(auth)/auth/callback/route.ts:34`
- **What:** After a successful OAuth exchange, the handler always redirects to `${origin}/dashboard` regardless of where the user was trying to go. Deep links after auth are lost.
- **Fix:** Read a `next` query parameter from the callback URL (set when building the OAuth URL). After successful exchange, redirect to `next` if it starts with `/`, otherwise fall back to `/dashboard`.
- **Test:** Call the callback handler with `?next=/library`. Assert the redirect location is `/library`.
- **Status:** Open

---

## P4 — Minor observations

### F-042 [STRUCTURE] `analyze/page.tsx` self-renders NavBar independently
- **File:** `src/app/analyze/page.tsx`
- **What:** The anonymous analyze route renders its own NavBar and layout wrapper instead of using the `(app)` route group layout. Any layout changes to `(app)/layout.tsx` will not apply to the anonymous flow.
- **Fix:** Evaluate whether the anonymous flow should join the `(app)` route group with auth-gating at the API level only.
- **Test:** Manual check — note the divergence in layout ownership.
- **Status:** Open

### F-043 [DESIGN] Landing page counter-offer block uses `bg-emerald-50` instead of token
- **File:** `src/app/page.tsx:130`
- **What:** Same as the in-app counter-offer blocks: `bg-emerald-50` routes around the `counter-offer-bg` token. Visually identical today, will diverge silently if the token changes.
- **Fix:** Use `bg-counter-offer-bg` (after adding the token to `tailwind.config.ts` as part of F-011/counter-offer fixes).
- **Test:** Assert landing page counter-offer block uses the token class.
- **Status:** Open

### F-044 [UX] NavBar uses `overflow-x-auto` on the nav links container
- **File:** `src/components/NavBar.tsx:49`
- **What:** On very narrow viewports the nav links become a horizontal scroll strip, which is unusual behaviour users do not expect from a top nav.
- **Fix:** Consider a collapsed/overflow menu pattern for narrow viewports, or simply ensure links wrap at a visible breakpoint.
- **Test:** Manual check — inspect nav on 320 px viewport.
- **Status:** Open

### F-045 [THEMING] Library delete "Confirm" has no button affordance
- **File:** `src/app/(app)/library/page.tsx`
- **What:** The destructive "Confirm" label uses `text-severity-critical` styling without button visual affordance — reads the same weight as the "Cancel" text beside it.
- **Fix:** Style "Confirm" as a proper button (border, background, or underline) so its affordance communicates the destructive action.
- **Test:** Render the delete-confirm UI, assert the Confirm element is a `<button>` with distinct visual styling from Cancel.
- **Status:** Fixed — commit f743057

---

## Post-deploy issues

### F-046 [BUG] useMemo hooks placed after early returns — crashes on re-analyze
- **File:** `src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx`
- **What:** The three `useMemo` calls for `criticalFlags`, `moderateFlags`, and `lowFlags` were added (F-028) after the loading/error early returns. React requires all hooks to be called unconditionally on every render. When the component returned early (loading/error state), those hooks were skipped; on the next render when status became `'done'`, React saw a different hook call order and threw a client-side exception. Reproduced by clicking re-analyze on the preview deployment.
- **Fix:** Move the three `useMemo` calls above the first early return, using `result?.flags ?? []` as the source array so they are safe when `result` is null.
- **Test:** Pre-existing auth-forms.test.ts assertions on `useMemo` presence still pass; build and typecheck pass.
- **Status:** Fixed — commit f9bd23b
