# Flag labelling rubric

## The rule

**PASS** if the quoted sentence really is the kind of clause the flag names and
really costs the reader something. Otherwise **FAIL**.

Severity is not part of this rule. Neither is checking whether the quote appears
in the document — code already does that.

## What each clause type means

These definitions come from the product brief. Use them to decide whether a
quoted sentence really is the kind of clause the flag names.

**IP Assignment (overbroad):** Flags when the contract assigns ownership of
pre-existing work, work outside the project scope, or derivative rights beyond
what the project requires.

**Payment Terms (unfavorable):** Flags net-60 or net-90 payment windows,
milestone triggers controlled entirely by the client, and absence of
late-payment penalties.

**Termination without guaranteed payment:** Flags contracts where the client can
cancel the engagement with no financial obligation — no kill fee, no minimum
commitment, no notice period. A freelancer who blocks time for a client and gets
canceled on day one absorbs the entire loss.

**Non-Compete:** Flags restrictions on who the freelancer can work for during or
after the engagement. Severity depends on the specific language — a 6-month
restriction limited to one named competitor is low severity; a 2-year
restriction covering "any business in the same industry" is critical.

**Indemnification (overbroad):** Flags clauses that make the freelancer liable
for the client's losses, especially losses the freelancer does not control.

**Forced Arbitration + Class Action Waiver:** Flags clauses that require
disputes to go through arbitration instead of court and waive the right to join
a class action.

## What "costs the reader something" means

A clause costs the reader something when it takes away a right, imposes an
obligation, or creates exposure the reader would not have without it. The clause
must do real, concrete harm — restrict where they can work, make them liable for
someone else's losses, remove their access to a court, force them into payments
they cannot control.

A clause that is standard, expected, and does not disadvantage the reader does
not cost them anything. A mutual termination clause in an unpaid volunteer
arrangement, for example, is normal — neither side owes anything, neither side
loses anything. Flagging it adds noise without protecting the reader.

## Edge cases

1. **Standard terms in unpaid or no-cost arrangements.** If neither side is
   paying anything, and either side can walk away without owing anything, the
   termination clause is standard. It does not cost the reader something. FAIL.

2. **One-sided obligation vs. mutual obligation.** A clause where only one side
   bears the cost (the reader indemnifies the other party, but not vice versa)
   costs the reader something. A mutual clause can still cost the reader
   something if the obligation is disproportionate.

3. **Clause type must match.** If the quoted sentence is an indemnification
   clause but the flag calls it a non-compete, that is FAIL regardless of
   whether the sentence costs the reader something. The flag must name the right
   kind of clause.
