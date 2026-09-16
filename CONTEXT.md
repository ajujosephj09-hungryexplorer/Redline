# Redline — Domain Context

## Target Segment

**v1 user:** Freelancers reviewing inbound contracts from clients. This is the only segment v1 serves.

**Expansion segments (not v1):** Renters, small business owners, startup founders, agencies, content creators. Gig workers are excluded entirely (not economically viable at any paid price point).

## Core Concepts

### Inbound Contract
A contract the user **receives** from a counterparty (client, employer, landlord, vendor). The user is the weaker party. Redline v1 reviews only inbound contracts — documents being done *to* the user, not documents the user authored.

### Red-Line Rule
A user-defined condition that flags a clause as risky. Rules drive the analysis engine. Users can toggle defaults on/off, adjust their wording, add entirely new custom rules, and delete defaults. Full control — not just tweaking.

### Risk Flag
A finding produced by the analysis engine. Every risk flag must cite the exact source sentence from the uploaded contract (see ADR 0001). A flag without a traceable source is a bug.

Flags use **confident tone** — direct assertions, not hedged language. The citation underneath is what lets the user verify. Hedging is reserved only for genuinely ambiguous contract language (e.g., an undefined term).

### Severity
How dangerous a flagged clause is **based on its specific language**, not its category. Severity is determined by the scope, duration, and one-sidedness of the actual wording. A narrow non-compete is low severity; a broad one covering "any business in the same industry" for 2 years is critical. Two clauses of the same type can have different severities.

### Counter-Offer
Drafted alternative language attached to a risk flag. The flag detects the problem (broad); the counter-offer proposes the remedy (specific to the contract shape). Example: a "Termination without guaranteed payment" flag might draft minimum-commitment language for an hourly contract or kill-fee language for a retainer.

## Default Red-Line Rules (v1)

These six rules ship out of the box, tuned for freelancer contracts:

1. **IP Assignment (overbroad)** — client claims ownership of pre-existing work or work outside project scope
2. **Payment Terms (unfavorable)** — net-60/90, client-controlled milestones, no late-payment penalty
3. **Termination without guaranteed payment** — client can cancel with no kill fee, minimum commitment, or notice period
4. **Non-Compete** — can't work for client's competitors, sometimes broadly defined
5. **Indemnification (overbroad)** — freelancer liable for client's losses, including things outside their control
6. **Forced Arbitration + Class Action Waiver** — strips court access if things go wrong

Users can add, edit, or remove rules. These are defaults, not limits.

## Gap Analysis (v1)

A **gap** is a clause that *should* exist but doesn't. Unlike a risk flag, a gap cites the **absence** of a sentence, not a quoted sentence. Gaps are a parallel track to flags — ADR 0001 (cite exact source) applies to flags, not gaps.

**Gaps are checked for 3 of the 6 default rules** — only where absence hurts the freelancer:

1. **IP Assignment** — no IP clause means ownership defaults to the client in many jurisdictions. Freelancer loses rights to pre-existing work and portfolio use.
2. **Payment Terms** — no payment timeline means no enforceable due date. Client pays whenever they want.
3. **Termination** — no exit clause means neither party knows how to leave. Ambiguity favors the party with the money.

**The other 3 rules do NOT produce gaps** — absence is the preferred state:

4. **Non-Compete** — absence means the freelancer can work for anyone. Ideal.
5. **Indemnification** — absence means less liability exposure. Standard rules apply, which are less aggressive.
6. **Forced Arbitration** — absence means full court access preserved. Better for the weaker party.

## Clean Contract Behavior

When a contract has no issues, the tool still shows:
1. **Plain-English summary** — proves the tool read the document, gives the user something useful regardless
2. **Rules checklist with clean status** — lists every rule that was checked and shows each passed. Proves thoroughness without inventing problems.

Never fabricate flags to look busy. A clean result is a valid result.

## Future Expansions (not v1)

- **Dismissal-to-learning pipeline:** Track which flags users dismiss and use patterns to reduce false positives over time. Could range from per-user rule tuning to cross-user aggregation to model fine-tuning. Deferred — v1 relies on manual rule editing.
