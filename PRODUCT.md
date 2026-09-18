# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), Supabase (auth + database), Vercel deployment, OpenRouter for LLM access. Decided in PRD; not delegated.

## Users

Freelancers who receive inbound contracts from clients. They sign without legal review because a lawyer costs more than the project justifies. 71% have experienced non-payment; only 28% use written contracts. They lack the pattern recognition to know which sentences matter and the confidence to know what to say back.

Not in v1 scope: renters, small business owners, startup founders, agencies, content creators. Gig workers excluded entirely.

## Product Purpose

Upload an inbound contract, immediately get back: a plain-English summary, risk flags ranked by severity with exact source citations and drafted counter-offers, gap analysis for missing clauses, a rules checklist, and a grounded question box to explore what the rules surfaced. Six default red-line rules ship tuned for freelancer contracts. No setup required.

The product exists so that the reading happens every time, automatically, and the user gets back not just "this is bad" but "here is what to say instead."

## Positioning

Combines clause analysis, severity ranking from specific language, counter-offer drafting, and gap analysis at a price a freelancer can justify. Enterprise tools cost $30,000+/year. Shallow tools ($29-$99/month) offer no severity ranking, no counter-offer drafting, no gap analysis, and require significant upfront configuration. Nothing affordable does all four with zero setup.

## Operating Context

The user receives a contract from a client (service agreement, NDA, IP assignment, payment schedule, kill-fee provision). They need to understand what it says, know which sentences hurt them, and have language to send back — before signing. This is a solo activity. Contracts are inbound; the user is always the weaker party.

## Capabilities and Constraints

**Capabilities (v1):**
- Public landing page demonstrating the product: a contract turning into ranked flags with exact citations. One action, no invented claims.
- Upload/paste a contract; browser-side parsing (.txt, .pdf, .docx); only plain text stored
- Plain-English summary for non-lawyers
- Risk flags ranked by severity, each citing the exact source sentence (ADR 0001), with counter-offers specific to contract shape
- Gap analysis for IP Assignment, Payment Terms, and Termination (absence hurts); no gaps for Non-Compete, Indemnification, Forced Arbitration (absence is good)
- Rules checklist showing what was checked and what passed
- Question box (post-analysis only, grounded in document + analysis context; ADR 0006)
- Editable red-line rules: toggle, add, delete, reword. Six defaults ship
- Document library for past uploads

**Constraints:**
- No OCR — breaks citation accuracy; image-based documents rejected
- No outbound contract review — rules assume user is the weaker party
- No enforceability opinions — no jurisdiction awareness
- No automatic learning from flag dismissals — manual rule editing only
- No sharing, collaboration, or multi-user access
- No payments, billing, or subscriptions in v1
- Every risk flag must cite its exact source sentence; a flag without a traceable source is a bug
- Severity from specific language (scope, duration, one-sidedness), never from clause category or enforceability (ADR 0003)
- False positives preferred over false negatives (ADR 0004)

**Undecided:**
- Specific LLM model via OpenRouter — deferred to implementation
- Auth flow details — decided during build
- Pricing mechanism — validated at $50-$100/review but monetization deferred

## Brand Commitments

"Redline" is a working title, not the shipping name. Final name undecided.

No voice, visual identity, or personality direction established yet. The PRD uses confident, direct, unhedged language for flag text (hedging reserved for genuinely ambiguous contract wording) — this is a product behavior decision, not a brand commitment.

## Evidence on Hand

- Market research in `research/summary.md`: pain points, competitive gaps, pricing benchmarks, clause-type frequency data
- No real freelancer contracts in the repo (no corpus to validate clause-type ordering)
- No direct willingness-to-pay survey conducted
- No testimonials, case studies, press, or user data
- Statistics sourced from Freelancers Union, Flexable.work, FTC, and court records (cited in PRD)
- Gap analysis is a bet — no existing tool offers it, no competitive validation it is wanted

## Product Principles

1. **State only what the document says.** Unsupported claims are bugs. Every flag cites its source. No speculation, no external knowledge in answers.
2. **The user should not need to know what to look for.** The rules do the asking. Zero setup, zero legal training required.
3. **A missed risk is worse than a wrong flag.** False positives cost 10 seconds (read the citation, dismiss). False negatives cost whatever the contract costs.
4. **Specificity over templates.** Counter-offers fit the contract shape. Severity fits the language. Generic output is not good enough.
5. **Prove thoroughness, not just problems.** Clean contracts get a summary and an all-clean checklist. The tool never fabricates flags to look busy.

## Accessibility & Inclusion

WCAG 2.1 AA baseline. No product-specific accessibility requirements established.
