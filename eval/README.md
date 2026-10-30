# Eval suite

Runs every document in the gold set through the same analysis pipeline `npm run smoke`
uses, with the OpenRouter settings in `.env.local`, and reports recall, groundedness,
and clean-document rates.

## Running it

```
npm run eval
```

Requires `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in `.env.local`. Produces a `.txt`
summary and a `.json` record in `eval-runs/`, both named for the UTC time the run started.

## Clause type mapping

The gold set uses seven clause types. This product has six rules. Four map; three do not.

| Gold set type | Redline rule | Maps? |
|---|---|---|
| `arbitration-and-class-action-waiver` | Forced Arbitration + Class Action Waiver | Yes |
| `non-compete` | Non-Compete | Yes |
| `indemnification` | Indemnification (overbroad) | Yes |
| `fee-escalators-and-late-fees` | Payment Terms (unfavorable) | Yes |
| `limitation-of-liability` | (none) | No — out of scope |
| `auto-renewal` | (none) | No — out of scope |
| `unilateral-modification` | (none) | No — out of scope |

### Why three types are out of scope

**`limitation-of-liability`**: The PRD excluded Liability Cap in favour of Payment Terms
(unfavorable), which is not in the research's eight clause types but traces directly to
the 71% freelancer non-payment statistic. Liability Cap was cut for relevance to
freelancers, not because it is unimportant.

**`auto-renewal`**: The PRD excluded Auto-Renewal because it is rare in freelancer
contracts. It hits SaaS customers and construction contracts harder. Available as a
custom rule but not a default.

**`unilateral-modification`**: Never among the eight clause types the research surfaced.
Not a default rule and not referenced in the PRD's "My red lines" section. The gold set
includes it because the instructor's product covers a broader audience.

### Mapping semantics

A planted clause counts as **found** when a flag's quoted citation overlaps the planted
sentence by at least one character span. Overlap is checked as: the flag citation is a
substring of the planted sentence, or the planted sentence is a substring of the flag
citation, or they share a run of 40+ characters.

**Type correctness** is reported separately: whether a matched flag's `ruleName` maps to
the planted clause's `clauseType` through the table above.

### Decisions made during build

1. **IP Assignment and Termination rules produce no gold-set matches.** The gold set has
   no planted clauses of types that map to IP Assignment (overbroad) or Termination
   without guaranteed payment. These rules cannot be measured by this corpus. Any flags
   they produce on non-benign documents are counted only in groundedness, not in recall.

2. **Overlap threshold of 40 characters.** Shorter overlaps risk coincidental matches
   between unrelated sentences. 40 characters is roughly 6-8 words, enough to confirm
   the flag is citing the same passage.

3. **Special character split.** Recall is split by whether the planted sentence contains
   a curly quote or apostrophe (`\u2018\u2019\u201C\u201D`), a non-breaking space
   (`\u00A0`), an fi or fl ligature (`\uFB01\uFB02`), an em dash (`\u2014`), or two
   consecutive ASCII spaces. This follows the gold set README's observation that these
   characters cause citation failures when a model retypes rather than copies.

## What the numbers mean

These are upper bounds. The gold set was written by a model, so the phrasing is not
independent of the measurement. See `eval/gold-set/corpus/README.md` for the full
caveat. No number from a run belongs in copy a reader sees.
