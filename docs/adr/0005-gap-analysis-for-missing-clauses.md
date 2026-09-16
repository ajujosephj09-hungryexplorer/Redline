# ADR 0005: Gap Analysis for Missing Clauses

## Decision

Redline v1 flags missing clauses as "gaps" — a parallel track to risk flags. Gaps cite the absence of a clause, not a quoted sentence. Gap analysis runs for 3 of the 6 default rules where absence hurts the freelancer: IP Assignment, Payment Terms, and Termination. The remaining 3 (Non-Compete, Indemnification, Forced Arbitration) do not produce gaps because their absence is the preferred state.

## Alternatives

1. Only flag clauses that exist. Simpler, but misses the quietest way freelancers get hurt — contracts that never defined ownership, payment timelines, or exit terms.
2. Flag missing clauses using the same risk flag format with a synthetic citation. Violates ADR 0001 — there is no source sentence to cite.

## Why

Some of the worst freelancer outcomes come from clauses that aren't there at all. No IP clause means ownership defaults to the client. No payment timeline means no enforceable due date. No termination clause means no clean exit. These absences are invisible to a system that only reads what's written.

## Consequences

- Gaps are a distinct UI category from flags. Flags show a quoted sentence with severity. Gaps show "This contract does not include [X] — here's why that matters."
- ADR 0001 (cite exact source) applies to flags, not gaps. Gaps cite absence.
- Counter-offers can attach to gaps as well as flags (e.g., suggest IP ownership language when none exists).
- The gap engine only fires for rules where absence is harmful. It does not fabricate gaps for rules where missing is safe.
