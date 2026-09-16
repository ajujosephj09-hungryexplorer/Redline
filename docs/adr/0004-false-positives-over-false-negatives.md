# ADR 0004: Prefer False Positives Over False Negatives

## Decision

When uncertain, the tool flags aggressively. A false positive (flagging something harmless) is preferred over a false negative (missing something that hurts). Flags use confident tone with citations underneath for user verification.

## Alternatives

1. Balanced approach — only flag when confidence is high. Reduces noise but lets borderline risks through silently.
2. Hedged tone — say "may" on uncertain flags. Honest about uncertainty but makes the tool sound unsure of itself, and users stop reading hedged language.

## Why

A freelancer can dismiss a wrong flag in 10 seconds by reading the cited sentence (ADR 0001 makes this possible). A missed flag is invisible until the freelancer gets burned. The citation requirement is what makes aggressive flagging viable — every flag is verifiable, so false positives are cheap. False negatives are silent and costly.

## Consequences

- The default rule sensitivity errs toward flagging. Some clean clauses will be flagged.
- Confident tone on flag text; citations do the hedging. Hedged language ("may," "possibly") is reserved only for genuinely ambiguous contract language.
- Over time, a dismissal-to-learning pipeline (deferred, not v1) can reduce false positive rates without sacrificing recall.
