# Eval report

## What the product does

Redline is a web app for freelancers who receive contracts and sign them without legal review. The freelancer uploads a contract, and the product returns a plain English summary, risk flags ranked by severity, gap analysis for missing clauses, and a drafted counter offer for each flag and gap. Every flag cites the exact source sentence from the document. A flag without a verbatim citation is a bug.

The product ships with six default rules, each chosen for what it costs a freelancer when it goes wrong:

1. **IP Assignment (overbroad)** flags when the contract assigns ownership of pre existing work, work outside the project scope, or derivative rights beyond what the project requires.
2. **Payment Terms (unfavorable)** flags net 60 or net 90 payment windows, milestone triggers controlled entirely by the client, and absence of late payment penalties.
3. **Termination without guaranteed payment** flags contracts where the client can cancel with no kill fee, no minimum commitment, and no notice period.
4. **Non Compete** flags restrictions on who the freelancer can work for during or after the engagement.
5. **Indemnification (overbroad)** flags clauses that make the freelancer liable for the client's losses, especially losses the freelancer does not control.
6. **Forced Arbitration + Class Action Waiver** flags clauses that require arbitration instead of court and waive the right to join a class action.

## What I measured

I ran every document in a nine document gold set through the same analysis pipeline the product uses, with the same model (`google/gemini-3.5-flash-lite`) and settings. The gold set contains six documents with planted clauses and three benign documents that should come back clean. None of the documents were collected from the real world; they were written for this suite.

The gold set uses seven clause types. Four map onto this product's six rules:

- `arbitration-and-class-action-waiver` maps to Forced Arbitration + Class Action Waiver
- `non-compete` maps to Non Compete
- `indemnification` maps to Indemnification (overbroad)
- `fee-escalators-and-late-fees` maps to Payment Terms (unfavorable)

Three types are out of scope and are never counted as misses:

- `limitation-of-liability` was excluded because the product chose Payment Terms over Liability Cap for relevance to freelancers.
- `auto-renewal` was excluded because it is rare in freelancer contracts.
- `unilateral-modification` was never among the clause types the research surfaced.

Two of the product's six rules, IP Assignment (overbroad) and Termination without guaranteed payment, have no planted clauses in the gold set and cannot be measured by this corpus.

## The numbers

All numbers are from the eval run on 30 October 2026.

**Recall:** The analysis found 14 of 24 in scope planted clauses. On sentences containing special characters (curly quotes, non breaking spaces, ligatures, em dashes, double spaces), recall was 3 of 7. On sentences without special characters, recall was 11 of 17.

**Precision:** 14 of 15 flags matched a planted clause.

**Groundedness:** 14 of 15 flags cited a sentence that appears character for character in the document.

**Type correctness:** Of the 13 flags that matched a planted clause in scope, 13 of 13 named the correct rule.

**Clean documents:** The analysis returned 1 flag on the 3 benign documents. The flag was on the library volunteer agreement, a mutual termination clause in an unpaid arrangement.

## Human labels

I labelled 10 flags by hand using this rule: PASS if the quoted sentence really is the kind of clause the flag names and really costs the reader something, otherwise FAIL.

I labelled 8 of the 9 flags I reviewed as PASS and 1 as FAIL. The FAIL was the termination flag on the library volunteer agreement. I wrote: "no need to flag its standard." One flag (number 4) I did not label.

## The judge

I wrote a rubric from the product brief's definitions and my own labelling notes, then had an LLM apply it to the same 10 flags without seeing my labels.

On the 10 flag set, the judge matched every label I gave. Of the 8 flags I passed, the judge passed 8. Of the 1 flag I failed, the judge failed 1.

I then ran the judge on all 14 grounded flags from the eval run. It passed 13 of 14 and failed 1. The single FAIL was the same volunteer termination clause.

## Limits

A model wrote the gold set. The phrasing is not independent of the measurement. A sentence written to read like an arbitration clause is a sentence a model is likely to recognise as one. Every number here is an upper bound on what the analysis achieves, not a promise to a reader. No number from this corpus belongs in copy a user sees.

Ten hand labels is a start, not a calibration. The set is heavy on indemnification and arbitration clauses and light on the other four rule types. A broader set with more variety in clause types and more borderline cases would give a sharper picture.

The judge agreed with me on all 9 labelled flags. That is a useful signal on these flags, but 9 flags with only 1 FAIL is not enough to know how well the judge handles disagreement cases. I need more flags it should fail, and more flags where the clause type is ambiguous.

## What I would fix next

1. **Recall is the weakest number.** 14 of 24 means the analysis misses 10 planted clauses. The biggest lever is switching to a stronger model. Recall should move up. Groundedness and type correctness should stay where they are or improve.

2. **Special characters drop recall further.** 3 of 7 versus 11 of 17 on clean sentences. The model retypes characters instead of copying them, and the citation stops being a verbatim substring. The `cleanCitation` function in the engine already handles some of this (stripping wrapping quotes, expanding ellipsis), but it does not normalize ligatures, curly quotes, or non breaking spaces. Adding normalization to `cleanCitation` should close this gap. Groundedness should move up as a result.

3. **The single over flag on benign documents is the termination rule firing on standard mutual exit clauses in unpaid arrangements.** The rule description does not distinguish paid from unpaid engagements. Adding that distinction to the rule description or to the system prompt should remove this false positive without affecting recall on paid contracts.

4. **IP Assignment and Termination have no gold set coverage.** I cannot measure recall for these two rules until I add documents with planted clauses of those types to the corpus.
