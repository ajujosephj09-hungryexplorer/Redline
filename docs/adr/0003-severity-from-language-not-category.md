# ADR 0003: Severity Is Assessed from Specific Language, Not Clause Category

## Decision

Risk flag severity is determined by the scope, duration, and one-sidedness of the specific contract language — not by the clause category. Two clauses of the same type can have different severities. Legal enforceability is not factored in.

## Alternatives

1. Fixed severity per clause type (e.g., IP Assignment is always "critical"). Simple to build, immediately wrong for edge cases.
2. Factor in legal enforceability by jurisdiction. More accurate in theory, but requires user's location, introduces unsupported claims, and violates ADR 0001's principle of stating only what the document says.

## Why

A narrow non-compete limited to one named competitor for 6 months is not the same severity as a 2-year industry-wide non-compete. The language determines the danger, not the label. Enforceability is excluded because it varies by jurisdiction, would require the user's state, and "this is probably unenforceable" encourages users to sign clauses that may be enforceable where their client operates.

## Consequences

- The model must assess scope, duration, and one-sidedness within each clause, not just categorize it. Prompting is more complex.
- Testing must cover the same clause type at different severity levels to verify the model distinguishes them.
- The tool never comments on whether a clause would hold up in court. It flags what the language says, period.
