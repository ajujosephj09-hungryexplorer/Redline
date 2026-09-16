# Redline v1 — Spec

## Problem Statement

Freelancers receive inbound contracts from clients and sign them without legal review because review costs more than the project justifies. 71% have experienced non-payment. Only 28% use written contracts. The language that hurts them is sitting in a document they have access to — they lack the pattern recognition to know which sentences matter and the confidence to know what to say back.

Existing tools are either enterprise-priced ($30,000+/year) or too shallow (no severity ranking, no counter-offer drafting, no gap analysis). Every one requires significant upfront configuration. There is nothing affordable that combines clause analysis, severity ranking, counter-offer drafting, and document Q&A at a price a freelancer can justify.

## Solution

A web app where a freelancer uploads an inbound contract and immediately gets back:

- A plain-English summary of what the contract says
- Risk flags ranked by severity, each citing the exact source sentence, with a drafted counter-offer attached
- Gap analysis for clauses that should exist but don't (IP, Payment, Termination)
- A rules checklist showing what was checked and what passed
- A question box (post-analysis) to explore what the rules surfaced
- An editable rule set the user fully controls (toggle, add, delete, reword)
- A library of past documents

No configuration required. Six default red-line rules ship tuned for freelancer contracts. The user uploads and gets results.

## User Stories

### Upload and parsing

1. As a freelancer, I want to paste or upload a contract document, so that I can get it analyzed without any setup.
2. As a freelancer, I want parsing to happen in the browser, so that my contract text is not sent as a raw file to a server before I see results.
3. As a freelancer, I want only plain text to be stored, so that my original document format is not retained beyond what the analysis needs.
4. As a freelancer, I want clear feedback if my document is a scanned image or image-based PDF, so that I understand why the tool cannot process it rather than getting garbled results.

### Plain-English summary

5. As a freelancer, I want a readable summary of what the contract says, so that I can understand the agreement without parsing legal language myself.
6. As a freelancer, I want the summary written for someone who is not a lawyer, so that I do not need legal training to use it.
7. As a freelancer, I want to see the summary even when the contract has no issues, so that I get value from every upload.

### Risk flags

8. As a freelancer, I want each risk flag to name the problem in confident, direct language, so that I immediately understand what is wrong.
9. As a freelancer, I want each risk flag to cite the exact source sentence from my contract underneath the flag, so that I can verify the flag myself in seconds.
10. As a freelancer, I want flags ranked by severity, so that I know which problems to address first.
11. As a freelancer, I want severity assessed from the specific language (scope, duration, one-sidedness), so that a narrow non-compete is treated differently from a broad one even though they are the same clause type.
12. As a freelancer, I want the tool to flag aggressively when uncertain rather than stay silent, so that I never miss a risk because the tool was not sure enough to mention it.
13. As a freelancer, I want to verify any flag by reading the cited sentence, so that false positives cost me 10 seconds rather than real money.

### Gap analysis

14. As a freelancer, I want the tool to tell me when my contract is missing an IP ownership clause, so that I know ownership may default to the client.
15. As a freelancer, I want the tool to tell me when my contract has no payment timeline, so that I know there is no enforceable due date.
16. As a freelancer, I want the tool to tell me when my contract has no termination clause, so that I know neither party has a defined exit.
17. As a freelancer, I want the tool to NOT flag the absence of a non-compete, indemnification, or forced arbitration clause, so that I am not alarmed about missing clauses whose absence protects me.
18. As a freelancer, I want gaps presented differently from flags, so that I can distinguish "this clause is bad" from "this clause is missing."
19. As a freelancer, I want each gap to explain why the absence matters, so that I understand the risk rather than just seeing a label.

### Counter-offers

20. As a freelancer, I want a drafted counter-offer attached to each risk flag, so that I know what to say back to the client.
21. As a freelancer, I want a drafted counter-offer attached to each gap, so that I can propose language for clauses that should exist but don't.
22. As a freelancer, I want counter-offers specific to the contract shape (hourly vs. retainer vs. project-based), so that the suggested language fits my actual engagement rather than being a generic template.
23. As a freelancer, I want to copy counter-offer text directly, so that I can paste it into an email or message to the client.

### Question box

24. As a freelancer, I want to ask follow-up questions after seeing the analysis results, so that I can explore what the rules surfaced in more depth.
25. As a freelancer, I want every answer traceable to my uploaded document, so that the tool never answers from external knowledge.
26. As a freelancer, I want the question box to say "not found in document" when my question cannot be answered from the contract, so that I know the tool is not making things up.
27. As a freelancer, I want the question box to have access to the analysis context (flags, gaps, summary), so that I can ask "why was this flagged?" and get a useful answer.
28. As a freelancer, I want the question box to appear alongside my results rather than as a separate mode, so that I do not need to navigate away from the analysis to ask a question.

### Red-line rules

29. As a freelancer, I want six default rules that ship out of the box (IP Assignment, Payment Terms, Termination, Non-Compete, Indemnification, Forced Arbitration), so that the tool is useful on first upload without any setup.
30. As a freelancer, I want to toggle any default rule on or off, so that I can silence rules that do not apply to my work.
31. As a freelancer, I want to adjust the wording of a default rule, so that I can tune what it looks for.
32. As a freelancer, I want to add entirely new custom rules, so that I can cover clause types the defaults do not address (e.g., non-disparagement, scope definition).
33. As a freelancer, I want to delete default rules I will never use, so that my rule set is not cluttered.
34. As a freelancer, I want my custom rules to persist across sessions, so that I do not rebuild my rule set every time I upload a new contract.

### Clean contract behavior

35. As a freelancer, I want to see a plain-English summary even when nothing is flagged, so that I know the tool actually read my contract.
36. As a freelancer, I want to see a checklist of every rule that was checked with a clean status on each, so that I know the tool was thorough rather than just empty.
37. As a freelancer, I want the tool to never fabricate flags when the contract is fine, so that I trust the results when it does flag something.

### Document library

38. As a freelancer, I want my past uploads saved in a library, so that I can reference previous analyses.
39. As a freelancer, I want to open a past document and see its original analysis, so that I can compare contracts over time.

### Authentication

40. As a freelancer, I want to sign up and log in, so that my rules and documents are tied to my account.
41. As a freelancer, I want my data private to my account, so that no one else sees my contracts or rules.

## Implementation Decisions

### Stack

- **Framework:** Next.js
- **Database and auth:** Supabase (set up from scratch; auth flow decided during implementation)
- **Deployment:** Vercel
- **LLM access:** OpenRouter (specific model deferred to implementation)

### Analysis engine — one seam

The entire analysis flows through a single boundary:

- **Input:** Plain text of a contract + a set of red-line rules
- **Output:** Summary, risk flags (each with severity + citation + counter-offer), gaps (each with explanation + counter-offer), and a rules checklist

The question box is downstream of this output — it receives the analysis context and the document, not just the raw text. It is not a separate module with its own boundary.

### Parsing

- Happens in the browser. The server never receives the original file format.
- Only plain text is stored in the database.
- No OCR. Image-based documents are rejected with a clear message.

### Citation model

- Every risk flag must include a verbatim quote from the uploaded contract (ADR 0001). A flag without a citation is a bug.
- Gaps cite absence, not a sentence. They are a distinct output category from flags.
- The LLM prompt must be structured to return citations as part of every flag. Off-the-shelf summarization is not sufficient.

### Severity model

- Severity is assessed per-flag from the specific language: scope, duration, and one-sidedness (ADR 0003).
- Severity is NOT fixed per clause category.
- The tool does not comment on legal enforceability. It flags what the language says.

### Tone

- Flags use confident, direct assertions (ADR 0004).
- Citations underneath are the verification mechanism.
- Hedging ("may," "possibly") is reserved for genuinely ambiguous contract language only.

### Flagging bias

- The engine errs toward false positives over false negatives (ADR 0004).
- A borderline clause gets flagged. The user dismisses it in 10 seconds via the citation.

### Default rules

Six rules ship, tuned for freelancer inbound contracts:

1. IP Assignment (overbroad) — flag + gap
2. Payment Terms (unfavorable) — flag + gap
3. Termination without guaranteed payment — flag + gap
4. Non-Compete — flag only (absence is good)
5. Indemnification (overbroad) — flag only (absence is good)
6. Forced Arbitration + Class Action Waiver — flag only (absence is good)

### Rules engine

- Users can toggle, edit, add, and delete rules (ADR implied by CONTEXT.md).
- Custom rules persist across sessions (stored in Supabase, tied to user account).
- Dismissing a flag does NOT adjust rules automatically. Manual editing only.

### Question box

- Output feature, not input mode (ADR 0006).
- Available only after analysis has run.
- Has access to the analysis context (flags, gaps, summary) plus the document.
- Grounded exclusively in the uploaded document. Answers from external knowledge are bugs.

## Testing Decisions

### What makes a good test

Tests assert on the external behavior of the analysis engine through its single seam. They do not test internal implementation details (prompt structure, parsing internals, UI component state). If the interface stays stable, the code underneath can change without tests moving.

### The seam

One seam: contract text + rules in → structured analysis output.

Every testable behavior from the PRD's "what good looks like" section maps to this boundary:

- **Citation accuracy:** Given a contract, every flag in the output contains a `citation` field whose value is a verbatim substring of the input text.
- **Severity differentiation:** Given two contracts with the same clause type but different scope/duration/one-sidedness, the severity values differ.
- **Gap detection (positive):** Given a contract with no IP clause, no payment timeline, or no termination clause, the output contains a gap for the missing item.
- **Gap detection (negative):** Given a contract with no non-compete, no indemnification, or no forced arbitration, the output does NOT contain a gap.
- **Counter-offer specificity:** Given an hourly contract with a termination issue and a retainer with the same issue, the counter-offer text differs.
- **Clean contract:** Given a contract with no issues, the output contains a summary, a rules checklist with all-clean status, zero flags, and zero gaps.
- **Question box grounding:** Given an analysis output and a follow-up question, the answer is traceable to the input document. A question not answerable from the document returns a "not found" response.
- **False positive preference:** Given a borderline clause, the output contains a flag (not silence). This is harder to test deterministically — may require a curated set of borderline examples with expected behavior.

### What we do NOT test at this seam

- UI rendering, layout, or component behavior (tested separately if needed, not through the analysis seam)
- Authentication and authorization (standard Supabase auth, tested through its own surface)
- Document library CRUD (standard database operations)

## Out of Scope

- **Payments, billing, subscriptions** — v1 proves trustworthiness, not monetization
- **OCR** — breaks citation accuracy; image-based documents are rejected
- **Sharing or collaboration** — solo use only
- **Outbound contract review** — rules assume user is the weaker party receiving a contract
- **Enforceability opinions** — no jurisdiction awareness, no legal judgment
- **Automatic learning from dismissals** — manual rule editing only in v1
- **Segment-specific rule sets beyond freelancers** — no defaults for renters, SMBs, startups
- **Multi-language contracts** — not addressed in research or PRD; deferred

## Further Notes

- **Payment Terms is not in the research.** The research's eight clause types do not include "Payment Terms" as a standalone category. It was added because the 71% freelancer non-payment statistic traces directly to unfavorable or absent payment terms. The clause type was not named in the research; the consequence was. This is a judgment call, not a research finding.

- **Gap analysis is a bet.** No existing tool offers it. There is no competitive validation that users want it, but also no evidence they do not.

- **False positive tolerance is unknown.** The PRD's "what good looks like" section defines the expected behavior, but there is no data on how many flags per document a user will tolerate before deciding the tool is noise. The clean-contract behavior (summary + checklist) handles the zero-flag case, but the upper bound is undefined.

- **The build chain.** This spec is the output of `grill-with-docs → to-spec`. Next step is `to-tickets` to split this into implementation tickets, then `implement` to build, then `code-review` to verify.

- **`gh` CLI is not installed.** This spec is written to `SPEC.md` instead of published to GitHub Issues. Once `gh` is available, it should be published as an issue with the `ready-for-agent` label.
