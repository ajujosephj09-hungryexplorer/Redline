---
target: src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:/Users/Juice_Inc/Desktop/AI Learning/Redline/src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx"
target_fingerprint: "sha256:2c6ab44e73758976429719dcaa3483f7336a3c891b2cce8d3fa51307332b5a41"
target_path: /Users/Juice_Inc/Desktop/AI Learning/Redline/src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx
timestamp: 2026-10-21T22-38-18Z
slug: p-dashboard-documents-id-analysisview-tsx-94745916
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading messages specific and reassuring; no real progress indicator during long analyses |
| 2 | Match System / Real World | 3 | Terminology accessible; "Clear" label on low-severity flags contradicts its own presence as a finding |
| 3 | User Control and Freedom | 2 | No confirmation on Re-analyze; no "reset to original" after saving a counter-offer edit |
| 4 | Consistency and Standards | 2 | Three compounding violations: "Clear" label on flagged items, GapCard amber background, green token shared between "low flag" and "no flag" |
| 5 | Error Prevention | 2 | Re-analyze fires immediately on tap; no route back to original AI counter-offer once overwritten |
| 6 | Recognition Rather Than Recall | 3 | Severity key present; expand/collapse controls visible but visually weak (text-xs text-slate-400) |
| 7 | Flexibility and Efficiency | 2 | No bulk copy, no keyboard shortcuts; auto-expand of first critical flag can re-fire unexpectedly |
| 8 | Aesthetic and Minimalist Design | 3 | Layout genuinely clean; stat bar clusters 6 elements before user reads a single finding |
| 9 | Error Recovery | 3 | Error states well-handled; QuestionBox uses critical red for network errors (minor Severity Monopoly stretch) |
| 10 | Help and Documentation | 2 | No "what now" guidance post-analysis; no starter questions in QuestionBox for first-timers |
| **Total** | | **25/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**LLM assessment:** View is authored for contract review — FindingRow expand→citation→counter-offer, Evidence Wall, gap cards are domain-specific. Composition pattern (accordion list, question box, checklist) is category-interchangeable. Nothing in the visual language acknowledges the stakes: money and legal rights. Reads with the same emotional register as a code linter. "Diagnostic Report" metaphor is technically implemented but not emotionally landed.

**Deterministic scan:** 6 findings total. 3 false positives (side-tab / border-l-4 at AnalysisView.tsx:114, 178, 287 — intentional per ignore.md). 3 real advisory findings all in globals.css: #f1f5f9 at line 28, #cbd5e1 at line 31, border-radius 3px at line 32. Zero violations in component files.

**Detector/LLM agreement:** Detector confirms clean component tree. LLM caught semantic violations the detector can't: amber as background fill in GapCard (Tailwind class, not literal hex), green token shared between "low flag" and "no flag" status.

## Overall Impression

Mechanical architecture is solid. FindingRow flow is the right shape. Last sprint work (severity grouping, expand-all, inline editing) substantially improved usability. What remains: semantic color system quietly broken in two places, and no "what to do next" moment at the end. Biggest single opportunity: fix color semantics in one pass, then close the emotional loop.

## What's Working

1. FindingRow expand→citation→counter-offer flow: mirrors how a lawyer walks a client through a problem. Most domain-specific interaction in the product.
2. Progressive loading messages: "Checking each clause against your rules..." is a real trust signal. Reduces perceived wait time.
3. Evidence Wall: monospace citations with navy border-l-4 are visually distinct. Typographic boundary between contract language and Redline's interpretation is unambiguous.

## Priority Issues

**[P0] "Clear" label on flagged findings**
- What: Low-severity FindingRow group header (line 688) labeled "Clear" in text-severity-clear (green). Severity key defines "Clear" as "checked and looks fair." But these are flags.
- Why: Freelancer scans green "Clear" header and concludes no action needed. May miss a clause that costs them money.
- Fix: Rename low severity tier from "Clear" to "Low" or "Minor" in FindingRow group header (line 688), severityPill() (line 45), and severity key (lines 641–645). Reserve "Clear" exclusively for "no flag found."

**[P0] GapCard background violates Severity Monopoly Rule**
- What: GapCard (line 213) uses bg-amber-50 border-amber-200 as card background/border. Per DESIGN.md, amber appears only as pills and dots.
- Why: Entire gaps section becomes amber wash. Palette diagnostic authority erodes once amber escapes to backgrounds.
- Fix: Change GapCard to bg-white border border-slate-200. Add amber severity dot/pill in GapCard header to preserve severity signal.

**[P1] Green token shared between "low severity flag" and "clean checklist status"**
- What: Both low-severity FindingRow (line 45: text-severity-clear) and clean-checklist item (line 310: text-severity-clear) use same green token.
- Why: Green is most positive signal on page. Applying it to a finding corrupts its meaning. Users under time pressure use color as first-pass triage.
- Fix: Assign low-severity flags text-slate-600 or gray dot. Reserve green exclusively for "no finding" outcomes. Update severityPill() (line 45), checklistStatusStyle (line 310), severity key copy.

**[P1] Re-analyze has no confirmation guard**
- What: Re-analyze button (line 542) fires immediately on click. Near document title in light underlined text (text-xs text-slate-400 underline). Easily hit mid-scroll on mobile.
- Why: Stray tap burns API credits and discards counter-offer edits made during the session.
- Fix: On first click, show "Re-analyze? (confirm)" and reset after 3s if not clicked again. Or one-line dialog: "This will replace the current analysis."

**[P1] No forward-looking close action**
- What: After reading findings and copying counter-offers, user scrolls to RulesChecklist — a backward-looking audit. No "you're ready to respond" closure.
- Why: Peak-end rule failure. Page ends on most bureaucratic content. Morgan (2 hours) needs "task complete" signal.
- Fix: Add closing section — "You found X issues. Copy the counter-offers above and send them back before signing." Apply same closure logic as the clean-contract case.

**[P2] Expand all / Collapse all are visually buried**
- What: Lines 609–628: "Expand all" / "Collapse all" are text-xs text-slate-400 in stat bar alongside six other elements.
- Why: Morgan misses the expand controls and taps each row individually — 6+ clicks instead of 1.
- Fix: Move "Expand all" above the first Critical heading as a standalone button with more visual weight.

**[P2] QuestionBox has no starter questions**
- What: Single placeholder string. First-timers have no model of what questions are useful.
- Why: Jordan won't know what to ask. Most differentiated feature goes unused by the 71% who most need it.
- Fix: Generate 2–3 suggested questions from the actual analysis result. Show as tappable chips that disappear once conversation starts.

**[P3] Edit/Copy touch targets too small inside FindingRow**
- What: Edit and Copy buttons (lines 129–145) are text-xs py-0.5 px-2 — ~28×18px, below 44×44pt minimum.
- Why: Casey (mobile) will misfire frequently.
- Fix: Increase to py-1.5 px-3 minimum, or wrap in min-h-[44px] flex items-center container.

## Persona Red Flags

**Jordan:** No "start here" visual hierarchy post-load; QuestionBox gives no signal that answers are document-grounded; "Edit rules →" link has no context for what rules are.

**Riley:** Zero-findings case has large dead zones (summary → clean message → triple hr → empty QuestionBox); re-analyzing silently discards counter-offer edits; back/forward re-triggers analysis, no state restoration.

**Casey:** Edit/Copy buttons ~28×18px; "Skip to questions" anchor is marginally tappable with no affordance; problem text truncation at max-w-[50%] on 375px screens has no tooltip fallback.

**Morgan:** Critical information is 7 elements deep before first Critical group heading; no triage summary at page top; all three stat bar counts are identical font-semibold size with no triage hierarchy.

## Minor Observations

- Authenticated dashboard users have no in-view back navigation to Library — browser back only.
- QuestionBox char counter disappears if user deletes below 400 characters mid-edit.
- Low-severity FindingRow has no pill shape — breaks visual rhythm relative to critical/moderate rows.
- hr elements at lines 706, 721, 730 always render — zero-gaps document produces double hr.
- globals.css: #f1f5f9 (line 28), #cbd5e1 (line 31), border-radius 3px (line 32) not in DESIGN.md palette.

## Questions to Consider

- Should a sticky summary bar (critical count + most critical finding) follow the user on scroll for orientation?
- Should low-severity findings fold into RulesChecklist instead of the accordion, keeping the accordion focused on actionable items?
- Anonymous save prompt appears after QuestionBox — should it appear immediately after the summary card at peak engagement?
- Should flags and gaps be unified in a single severity-ranked list rather than two split sections?
