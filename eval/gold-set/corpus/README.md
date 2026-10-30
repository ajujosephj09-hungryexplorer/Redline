# The eval corpus

Nine documents with a known clause inventory per document. `npm run eval` reads this
directory and nothing else.

## What this corpus is, and what it is not

**It is not a corpus of real contracts.** Two of the nine documents came from
`tests/fixtures/`, where they were written for the deterministic suite. The other seven
were written for this suite. None was collected from the world.

A recall figure over documents written by the same kind of model being measured is
weaker than one over contracts real people were handed, in two specific ways:

1. **The clauses are hidden the way the author knew how to hide them.** Section 5 of
   `PRD.md` says how these clauses hide in real documents, and the seven documents here
   follow it: a liability cap expressed as a cross-reference rather than a number, a
   non-compete filed under Post-Termination Obligations, a cancellation deadline stated
   as date arithmetic, a late charge deferred to a fee schedule the document does not
   reproduce. That is a reasonable imitation. It is not the same as the genuine variety
   of a hundred real agreements, and a model that misses a clause hidden in a way nobody
   here thought of will still score well.
2. **The phrasing is not independent of the measurement.** A sentence written to read
   like an arbitration clause is a sentence a model is likely to recognise as one. The
   recall figures should be read as an upper bound.

So the figures are worth having and they are not a calibration. They tell the owner
which clause types the analysis is weak on, whether the weakness tracks the evidence
split `ADR 0004` predicts, and how often a citation fails to verify. They do not tell
anyone what recall this product achieves on a real contract, and no number from a run
over this corpus belongs in copy a reader sees. `PRD.md` section 4 forbids that
independently.

## What is in it

| Document | Planted clauses | What it is |
|---|---|---|
| `../fixtures/adhesion-contract.txt` | 9 | Gym membership and instructor certification. From the deterministic suite. |
| `../fixtures/clean-document.txt` | benign | Community garden plot licence. From the deterministic suite. |
| `documents/saas-subscription.txt` | 8 | Consumer software subscription terms. |
| `documents/offer-letter.txt` | 5 | Offer of employment with restrictive covenants. |
| `documents/storage-unit-rental.txt` | 6 | Self storage unit rental. |
| `documents/phone-plan-terms.txt` | 7 | Consumer wireless service agreement. |
| `documents/internship-agreement.txt` | 5 | Fixed term summer analyst programme. |
| `documents/library-volunteer-agreement.txt` | benign | Library volunteer arrangement. |
| `documents/swim-lesson-registration.txt` | benign | Eight week swimming lesson registration. |

Forty planted clauses, spread across the seven types:

| Clause type | Instances | Evidence |
|---|---|---|
| `arbitration-and-class-action-waiver` | 5 | regulator-evidenced |
| `unilateral-modification` | 6 | weaker evidence |
| `non-compete` | 4 | regulator-evidenced |
| `auto-renewal` | 6 | regulator-evidenced |
| `limitation-of-liability` | 4 | weaker evidence |
| `indemnification` | 6 | weaker evidence |
| `fee-escalators-and-late-fees` | 9 | regulator-evidenced |

**Four instances is thin.** `non-compete` and `limitation-of-liability` sit at four, and
a recall of 0.75 over four instances is one clause away from 1.0 and one clause away
from 0.5. The run prints the count beside every rate for that reason. Treat those two
rows as a direction rather than a figure, and note that `limitation-of-liability` is one
of the three types `PRD.md` says rests on weaker evidence, so it is the row where a
small count and a weak baseline land on the same number.

Non-compete is hard to reach a higher count on honestly, because it appears in offer
letters and training agreements and almost nowhere else in the segment `ADR 0002` chose.
Adding a fifth by planting one in a gym membership would make the count look better and
the corpus less like the world.

**Three documents are benign.** `PRD.md` section 4 tests that clean documents stay
clean, and a corpus of nothing but loaded contracts cannot measure it. The three carry
real obligations on both sides, a fixed end date rather than a renewal, and no clause of
any of the seven types. Any flag on one of them is an over-flag, which `ADR 0004`
accepts and the run still reports.

## How the clauses hide

The hiding is deliberate. A corpus where every clause announces itself measures
nothing.

- The liability cap in `saas-subscription.txt` is a cross-reference to Section 2 rather
  than a figure, and the one in `phone-plan-terms.txt` is one bill period of charges on
  the affected line.
- The monthly renewal in `saas-subscription.txt` sits under a heading called Account
  Housekeeping, and the annual one states its deadline as a day counted back from an
  anniversary.
- The non-compete in `offer-letter.txt` is under Post-Termination Obligations, and its
  scope is in an exhibit the letter does not include. The one in
  `internship-agreement.txt` is under Post-Programme Obligations, and the restricted
  employers are on a list handed out in week one.
- The late charge in `storage-unit-rental.txt` and the reactivation charge in
  `saas-subscription.txt` both point at a schedule posted elsewhere.
- Two of the seven charges that look like taxes in `phone-plan-terms.txt` are not, and
  the document says so in the same sentence that lets the operator raise them.

## The characters a model retypes

Ten of the forty planted sentences carry a character class that a model tends to retype
instead of copy: an em dash, a curly apostrophe, a non-breaking space, an `fi` or `fl`
ligature, or a run of two spaces. Ticket 10's run against a real model dropped the same
flag every time, on the one fixture sentence carrying three of them at once, because the
span the model returned did not match the document and the flag never left the seam.

Real documents pasted out of a PDF carry all of these, so a corpus without any would
measure a cleaner world than the one the product ships into. A corpus where every
sentence carried them would measure the typography instead of the analysis. Ten of forty
is the compromise, and the run prints recall split by whether the sentence carried one,
so the effect is a measurement rather than a mystery.

`npm run verify:corpus` lists which sentences carry what.

## The sidecar schema

The same schema the two fixtures use, documented in `../fixtures/README.md`. Each
document has a sidecar under `sidecars/` naming its title, its summary, all seven
checked clause types, and its planted clauses as `P-01` upward in document order.

Two things belong to this corpus rather than to a fixture sidecar, and they live in
`manifest.json`:

- `provenance`, which says where the document came from. Every entry says so.
- `unusualButHarmless`, sentences that are odd or specific and take no lever and cost
  nothing. They are not planted clauses and a flag on one is an over-flag. They exist so
  that "arbitration outranks a merely unusual clause" has something in the corpus to be
  true about.

## Questions

`questions/` holds the question sets, in the shape `../fixtures/questions.json` uses.
Two documents carry one: the adhesion contract, whose set is the fixture's own, and
`saas-subscription.txt`.

Thirteen questions the document answers and thirteen it cannot. Both halves are asked,
because a product that refused every question would score 100 percent refusal and be
worth nothing.

## The rule that matters, turned on the corpus

Every `sourceSentence`, every `exit.sourceSentence`, every `expectedSourceSentence` and
every `unusualButHarmless` entry is an exact substring of the document it names,
character for character, and appears in it exactly once.

A sentence that has drifted would report a recall miss the model never made, so
`tests/eval-corpus.test.ts` checks all of it on every commit with no model and no
network, and `scripts/eval/corpus.ts` refuses to load a corpus where one sentence
cannot be found. `npm run verify:corpus` runs the same check and prints the list.

## Adding a document

1. Write the `.txt` under `documents/`, one paragraph per line, with no hard wrapping.
   Everything downstream compares spans against these characters, so a line break in the
   middle of a sentence puts a break in the middle of every citation to it.
2. Write the sidecar under `sidecars/`, copying each sentence out of the document rather
   than retyping it.
3. Add the entry to `manifest.json` with its provenance and whether it is benign.
4. Run `npm run verify:corpus`, then `npm test`.

Leave the two fixture documents alone. `tests/fixtures/adhesion-contract.txt` is the
fidelity corpus for the whole build and every citation in the deterministic suite is an
exact substring of it.
