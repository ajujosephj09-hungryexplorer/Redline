# 05 — Gap analysis + rules checklist

**What to build:** The analysis engine now also detects missing clauses and displays a rules checklist. Gaps are surfaced for 3 of the 6 default rules where absence hurts: IP Assignment, Payment Terms, and Termination. Each gap explains why the absence matters and attaches a counter-offer proposing language. Non-Compete, Indemnification, and Forced Arbitration do NOT produce gaps (absence is good). A rules checklist shows every rule that was checked with its status (flagged, gap, or clean). When a contract has zero flags and zero gaps, the user sees the summary plus the all-clean checklist — no fabricated flags.

**Blocked by:** 04 — Analysis engine — summary + risk flags

**Status:** done

- [x] Analysis prompt extended to detect missing IP, Payment, and Termination clauses
- [x] Each gap includes an explanation of why the absence matters and a drafted counter-offer
- [x] Gaps are visually distinct from flags in the UI (ADR 0005)
- [x] No gaps produced for Non-Compete, Indemnification, or Forced Arbitration (absence is preferred)
- [x] Rules checklist shows every active rule with its status: flagged, gap, or clean
- [x] Clean contract behavior: when no flags and no gaps exist, the user sees the summary + all-clean checklist (no fabricated flags)
- [x] Counter-offer text on gaps is copyable
- [x] Custom rules that the user marks as gap-producing also trigger gap analysis
