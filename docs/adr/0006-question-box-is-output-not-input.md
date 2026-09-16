# ADR 0006: Question Box Is Output, Not Input

## Decision

The question box is an output feature that sits alongside the analysis results, not an independent input mode. It becomes available after the analysis engine runs, and its context includes both the uploaded document and the analysis output (flags, gaps, summary). The user does not need to know what to ask — the red-line rules do the asking. The question box lets the user explore what the rules already surfaced.

## Alternatives

1. Treat the question box as a standalone document Q&A tool — the user uploads a document and asks whatever they want, independent of the analysis. This assumes the user knows what to look for, which is the exact problem the product solves.
2. Offer both modes — standalone Q&A and post-analysis exploration. Adds complexity without clear value; if the rules are good, the analysis surfaces what matters.

## Why

The product exists because freelancers lack the pattern recognition to know which sentences matter. Asking them to formulate their own questions reproduces the problem. The red-line rules are the framework — they interrogate the document so the user doesn't have to. The question box exists for follow-up: "what does 'derivative works' mean in this context?" is a question that only arises because the IP Assignment flag surfaced it first.

## Consequences

- The question box does not need to work without an analysis having run first. It is not a standalone feature.
- The question box has access to the analysis context (flags, gaps, summary), not just the raw document. This means it can answer questions like "why was this flagged?" not just "what does this sentence say?"
- The onboarding story simplifies: upload → rules run → results appear → question box is there if needed. Zero learning curve. No blank prompt asking "what do you want to know?"
- Testing: the question box is tested through the same seam as the analysis engine — document + rules in, grounded output out. It is not a separate testing boundary.
