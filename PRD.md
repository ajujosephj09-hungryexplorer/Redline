# Redline — Product Brief

## Who this is for

Freelancers who receive contracts from clients and sign them without legal review because review costs more than the project justifies. 71% of freelancers have experienced non-payment; only 28% use written contracts; those who do reduce payment disputes by 73% (Freelancers Union, Flexable.work). The contracts they receive are inbound — terms handed to them by someone with more leverage. Service agreements, NDAs, IP assignments, payment schedules, kill-fee provisions.

**What they do today:** Read the contract themselves (miss things), ask a friend who "knows legal stuff" (unreliable), pay $300-$500 for a lawyer to review a $2,000 project (uneconomical), or sign without reading (most common). Existing AI tools are either too expensive ($30,000+/year for enterprise) or too shallow ($29-$99/month with no counter-offer drafting and no severity ranking). Every existing tool requires significant upfront configuration — playbook setup, policy definition, or Microsoft Word integration — before producing useful output.

## The problem

Contracts are written to protect the party that drafted them. Freelancers are never the drafting party. The language that hurts them is not hidden — it is readable, specific, and sitting in a document they have access to. They do not lack the right to read it. They lack the time, the pattern recognition, and the confidence to know which sentences matter and what to say back.

> "the interest rate was higher than they told me over the phone and the total payment to them was going to be well over $200,000"
> — Student loan / flight school financing (humansoftumblr.com, sourced via research/summary.md)

That person caught the discrepancy by reading. Most do not. Redline exists so that the reading happens every time, automatically, and the user gets back not just "this is bad" but "here is what to say instead."

> "The mere fact that one does not read a contract which he has signed is not grounds to invalidate the writing."
> — Court ruling compelling arbitration against an employee who did not read two arbitration clauses in onboarding paperwork (hrdailyadvisor.hci.org, sourced via research/summary.md)

The court does not care whether you read it. Redline makes sure you did.

## What the first version does

1. **Upload a contract** — the user pastes or uploads a document. Parsing happens in the browser. Only plain text is stored. No OCR.
2. **Plain-English summary** — a readable summary of what the contract says, written for someone who is not a lawyer.
3. **Risk flags ranked by severity** — each flag names the problem in confident, direct language and cites the exact source sentence from the document underneath. Severity is assessed from the specific language (scope, duration, one-sidedness), not from the clause category. Two clauses of the same type can have different severities.
4. **Gap analysis** — flags clauses that should exist but don't. Checked for IP Assignment, Payment Terms, and Termination — the three areas where absence hurts the freelancer. Does not flag absence of Non-Compete, Indemnification, or Forced Arbitration, because missing is the preferred state.
5. **Counter-offer for each flag and gap** — drafted alternative language the freelancer can send back. The flag detects the problem broadly; the counter-offer proposes a remedy specific to the contract shape (e.g., minimum-commitment language for hourly contracts, kill-fee language for retainers).
6. **Question box** — the user asks questions and gets answers sourced only from the uploaded document. No external knowledge. No speculation.
7. **Editable red-line rules** — six defaults ship out of the box (see "My red lines" below). Users can toggle defaults on/off, adjust wording, add entirely new rules, and delete defaults. Full control.
8. **Document library** — saved past documents for reference.

That is the complete list. Nothing else is in scope.

## What good looks like

These are testable. If the product ships and any of these fail, the analysis cannot be trusted.

**Citation accuracy:** Every risk flag cites an exact sentence from the uploaded document. A human can find that sentence in the original and confirm it exists verbatim. A flag that cites a sentence not in the document, or paraphrases instead of quoting, is a bug.

**Flag relevance:** Given a contract with a 2-year industry-wide non-compete, the tool flags it at high severity. Given the same contract with a 6-month non-compete limited to one named competitor, the tool flags it at lower severity. The severity must change when the language changes, even if the clause category is the same.

**Gap detection:** Given a contract with no payment timeline, the tool surfaces a gap explaining that no due date was specified and why that matters. Given a contract with no non-compete clause, the tool does not surface a gap — it says nothing, because absence of a non-compete is good.

**Counter-offer usefulness:** The drafted alternative language is specific to the contract, not a generic template. A counter-offer for a termination clause in an hourly engagement suggests minimum-commitment language. A counter-offer for the same rule in a retainer suggests a kill fee or notice period. If the counter-offers are identical across different contract shapes, they are not good enough.

**Clean contract behavior:** Given a contract with no issues, the tool shows the plain-English summary and a checklist of every rule that was checked, each with a clean status. It does not invent flags to justify its existence.

**Question box grounding:** Every answer from the question box is traceable to the uploaded document. If the document does not contain the answer, the tool says so. An answer that draws on knowledge outside the document is a bug.

**False positive preference:** The tool errs toward flagging. A clause that is borderline gets flagged, not skipped. The user dismisses it in 10 seconds by reading the citation. A missed risk is invisible until the freelancer gets hurt.

## My red lines

Six default rules ship with the product. Each one is here because of what it costs a freelancer when it goes wrong.

**1. IP Assignment (overbroad)**
Flags when the contract assigns ownership of pre-existing work, work outside the project scope, or derivative rights beyond what the project requires. This is the top red flag in freelancer contracts (research/summary.md, rank 7 by overall harm frequency, but rank 1 for freelancers specifically). A designer who signs an overbroad IP clause loses the right to reuse pre-existing portfolio work.
Gap: If no IP clause exists, ownership defaults to the client in many jurisdictions. The freelancer loses rights without a single word being written.

**2. Payment Terms (unfavorable)**
Flags net-60 or net-90 payment windows, milestone triggers controlled entirely by the client, and absence of late-payment penalties. The research does not list "Payment Terms" as a standalone clause type. It is included here because the research's loudest signal — 71% freelancer non-payment rate — traces directly to unfavorable or absent payment terms. The clause type was not named; the consequence was.
Gap: If no payment timeline is specified, there is no enforceable due date. The client pays when they choose to.

**3. Termination without guaranteed payment**
Flags contracts where the client can cancel the engagement with no financial obligation — no kill fee, no minimum commitment, no notice period. A freelancer who blocks time for a client and gets canceled on day one absorbs the entire loss.
Gap: If no termination clause exists, neither party knows how to exit. Ambiguity favors the party holding the money.

**4. Non-Compete**
Flags restrictions on who the freelancer can work for during or after the engagement. Severity depends on the specific language — a 6-month restriction limited to one named competitor is low severity; a 2-year restriction covering "any business in the same industry" is critical. Non-competes affect 30-60 million workers; the FTC estimates banning them would add $250-$296 billion per year in worker earnings (research/summary.md).
No gap: Absence of a non-compete is the ideal state.

**5. Indemnification (overbroad)**
Flags clauses that make the freelancer liable for the client's losses, especially losses the freelancer does not control. Indemnification is the primary source of commercial litigation; attorney fee obligations alone can exceed contract value (research/summary.md).
No gap: Absence of an indemnification clause means less exposure. Default liability rules are almost always less aggressive than a written clause.

**6. Forced Arbitration + Class Action Waiver**
Flags clauses that require disputes to go through arbitration instead of court and waive the right to join a class action. Consumers win only 9% of arbitration cases; when companies counter-sue, they win 93% of the time. 60+ million workers are covered by forced arbitration; 826.5 million consumer agreements contain these clauses (research/summary.md).
No gap: Absence means full court access is preserved.

**Severity for all six** is determined by the specific language in the contract — scope, duration, and one-sidedness — not by which category the clause falls into. The tool never comments on legal enforceability. It flags what the language says.

## The calls I made and what I gave up

**Freelancers only, not freelancers and small business owners.**
Both are Tier 1 in the research. Small business owners have higher per-user spend ($2,000-$13,300/year on legal). I chose freelancers because their contracts are more standardized (fewer clause variations to nail defaults), their pain is sharper (71% non-payment vs. 43% skipping review), and the first-impression moment is clearer. Small business owners can still use the product by customizing rules, but the defaults and the marketing will not speak to them. They are worse off because the out-of-box experience will feel generic to their contracts.

**Inbound contracts only, not both directions.**
Small business owners review contracts they receive and contracts they send. Freelancers almost exclusively receive contracts. I chose inbound-only because it keeps the rules engine simpler — every document is something being done *to* the user, so "risky" always means "risky for you." Supporting both directions would require the rules engine to flip perspective, which doubles the analysis complexity. Anyone who drafts their own contracts and wants them reviewed is worse off — the tool will not help them check their own language.

**Six default rules, not eight.**
The research surfaced eight clause types. I excluded Auto-Renewal and Fee Escalator because they are rare in freelancer contracts — they hit SaaS customers and construction contracts harder. Liability Cap (Too Low) was excluded in favor of Payment Terms (unfavorable), which is not in the research's eight but traces directly to the 71% non-payment statistic. Non-Disparagement was excluded as a default but is available as a custom rule. Freelancers who work in industries where gag clauses are common (influencer contracts, agency work) are worse off — they must add the rule themselves.

**False positives over false negatives.**
The tool flags aggressively. Clean clauses will sometimes be flagged. Users who want a quiet tool that only speaks when certain will find it noisy. The trade-off is justified because a false positive costs 10 seconds (read the citation, dismiss) while a false negative costs whatever the contract costs. This only works because every flag cites its source — without citations, aggressive flagging would be noise.

**Confident tone, not hedged.**
Flags say "This clause assigns all derivative IP rights to the client," not "This clause may assign..." Users who expect the tool to express uncertainty in the flag text will not see it. The citation underneath is the hedge — the user reads the quoted sentence and decides for themselves. Hedged language is reserved for genuinely ambiguous contract wording (e.g., an undefined term). Users who skim the flag and skip the citation may over-trust a wrong assertion.

**Severity from specific language, not clause category or enforceability.**
The tool does not say "this is probably unenforceable." It does not know the user's jurisdiction and does not guess. A clause that is harsh on paper but unlikely to hold up in court is flagged at the severity the language warrants. Users in jurisdictions where a specific clause type is unenforceable will see flags they could safely ignore — but users whose clients operate in jurisdictions where it *is* enforceable will be protected. The cost is some unnecessary flags; the benefit is never telling someone "don't worry about it" when they should.

**No automatic learning from dismissals.**
When a user dismisses a flag, nothing adjusts. They can manually edit their rules anytime, but the tool does not learn from their behavior. Users who review many contracts will see the same false positives repeatedly until they edit their rules themselves. A dismissal-to-learning pipeline is deferred to a future version.

## What we are not building

**Payments, billing, or subscriptions.** This version proves the analysis can be trusted. None of those increase trustworthiness. Pricing is validated in the research ($50-$100/review for freelancers) but the monetization mechanism is decided later.

**OCR.** Redline parses plain text in the browser. Scanned documents and image-based PDFs are not supported. OCR introduces extraction errors that break the citation requirement — a flag that cites a sentence mangled by OCR is worse than no flag at all. Users with scanned contracts cannot use the tool. This is intentional.

**Sharing or collaboration.** No multi-user access, no "share this report with your client." Solo use only. Freelancers reviewing contracts is a solo activity.

**Outbound contract review.** The tool does not review contracts the user wrote. It reviews contracts handed to the user. The rules engine assumes the user is the weaker party.

**Enforceability opinions.** The tool does not comment on whether a clause would hold up in court. It flags what the language says. Enforceability varies by jurisdiction and would require location data and legal reasoning the tool is not qualified to provide.

**Automatic rule adjustment from user behavior.** Dismissing a flag does not change future behavior. Manual rule editing is the only mechanism in v1.

**Segment-specific rule sets beyond freelancers.** No default rules for renters, small business owners, startup founders, or any other segment. The rules engine supports custom rules, so these users can build their own — but nothing ships for them.

## What the research could not tell us

**Whether freelancers will pay for this.** The research validated a $50-$100/review price point based on comparable tools (Justee.ai) and inferred willingness from the gap between traditional review costs ($300-$500) and current spend (near zero). No direct willingness-to-pay survey was conducted with freelancers. The price point is plausible, not proven.

**Which clause types actually appear most often in freelancer contracts.** The research ranked clause types by overall harm frequency across all contract types. The freelancer-specific ranking (IP Assignment as most relevant, Auto-Renewal as least) is a judgment call informed by the research, not a finding from it. We do not have a corpus of real freelancer contracts to validate this ordering.

**Whether the six defaults are the right six.** Payment Terms is not in the research's eight clause types — it was added based on reasoning from the 71% non-payment statistic. Auto-Renewal and Liability Cap were excluded based on relevance to freelancers, not on frequency data within freelancer contracts specifically. The defaults are defensible but untested.

**How users will react to false positives.** The decision to prefer false positives assumes users will read citations and dismiss incorrect flags. If users instead lose trust after seeing too many wrong flags, the tool fails even though it catches everything. The research says nothing about user tolerance for false positives in contract review specifically.

**What "too many flags" looks like.** There is no data on how many flags per document a user will tolerate before deciding the tool is noise. The clean-contract behavior (summary + checklist) handles the zero-flag case, but the boundary between "thorough" and "crying wolf" is unknown.

**Whether gap analysis is valued.** No existing tool in the research offers gap analysis for missing clauses. This means there is no competitive validation that users want it — but also no evidence they do not. It is a bet.
