# ADR 0002: V1 Serves Freelancers Only

## Decision

Redline v1 targets freelancers reviewing inbound contracts from clients. The default red-line rule set is built around freelancer contract types: service agreements, NDAs, IP assignments, kill fees, and payment terms. Other segments (renters, small business owners, startup founders) are expansion candidates, not v1 scope.

## Alternatives

1. Target freelancers and small business owners equally (both Tier 1 in research). Ship two default rule sets.
2. Target small business owners first (higher spend per user, broader contract types).
3. Build a generic tool with no segment-specific defaults and let all segments self-serve.

## Why

Freelancers have the sharpest pain (71% non-payment rate, near-zero legal spend), the most standardized contracts (fewer clause variations to cover), and the clearest first-impression moment ("IP Assignment — flagged" on first upload). Small business contracts vary too much to nail defaults. One segment means one marketing message, one default rule set, and one definition of "does this work."

## Consequences

- The default rule set must cover freelancer-specific clause types. Clauses common in commercial leases or vendor SaaS terms are not defaults.
- Marketing, copy, and onboarding language should speak to freelancers, not generic "professionals."
- The rules engine must still support custom rules so non-freelancer users can adapt, but the out-of-box experience is tuned for freelancers.
- Expansion to renters or small business owners means adding a new default rule set, not rebuilding the product.
