# Fixtures

Two documents and three sidecars. Every deterministic test in this build reads
them, and `src/model/stub.ts` builds its payloads from the sidecars, so a change
here changes what the suite believes.

| File | What it is |
|---|---|
| `adhesion-contract.txt` | A gym membership and instructor certification agreement, roughly 1,600 words, carrying one planted instance of each of the seven clause types and two auto-renewal clauses at different severities. Written as ordinary boilerplate: the liability cap is a cross-reference, the restrictive covenant sits under Post-Termination Obligations, the late charge points at a separate fee schedule. |
| `adhesion-contract.json` | Its sidecar. Nine planted clauses, P-01 to P-09, in document order. |
| `clean-document.txt` | A community garden plot licence, roughly 700 words, with real obligations on both sides and none of the seven clause types. |
| `clean-document.json` | Its sidecar, with an empty `plantedClauses` list and the full `checkedClauseTypes` list, because a clean result has to name what was checked. |
| `questions.json` | Ten grounded questions about the adhesion contract, each with the sentence that answers it, and eight questions the document genuinely cannot answer. |

## The rule that matters

Every `sourceSentence`, every `exit.sourceSentence` and every
`expectedSourceSentence` is an exact substring of the document it names,
character for character. That includes the curly quotes, the `ﬁ` and `ﬂ`
ligatures, the non-breaking spaces, the double space in the fee adjustment
sentence and the tabs. Citation verification across the whole build is tested
against these strings, so a sentence that no longer matches is a broken fixture,
not a test to relax.

The two `.txt` files are also the fidelity corpus. They carry curly quotation
marks, ligature glyphs, non-breaking spaces, em dashes, a run of two spaces
inside a sentence, a line with trailing whitespace, tab characters and LF line
endings, with no byte-order mark. Extraction has to leave all of it alone. Both
documents end with a signature block, which is how a later ticket tells a whole
document from a truncated one.

These two files are quoted document prose, so the project's rule against em
dashes does not reach inside them. It does reach this README.

## Sidecar schema

```json
{
  "document": "adhesion-contract.txt",
  "title": "the document's own title, verbatim",
  "sourceKind": "pasted",
  "checkedClauseTypes": ["arbitration-and-class-action-waiver", "unilateral-modification", "non-compete", "auto-renewal", "limitation-of-liability", "indemnification", "fee-escalators-and-late-fees"],
  "summary": "What the document is and what accepting it commits the reader to. No recommendation about signing.",
  "plantedClauses": [
    {
      "id": "P-01",
      "clauseType": "one of the seven slugs above",
      "sourceSentence": "the verbatim sentence",
      "expectedSeverityBand": "critical | high | moderate",
      "confidence": 0.95,
      "consequence": "what the clause does to the reader, from the clause's own text",
      "exit": null,
      "why": "which terms set the band. Notes for a reviewer, not reader-facing copy."
    }
  ]
}
```

`exit` is `null` unless the document itself grants a deadline or an opt-out for
that clause. Where it does, it is `{ "text": "...", "sourceSentence": "..." }`
and that sentence verifies verbatim too. `confidence` is how sure the analysis is
that the clause was identified correctly, which is a different question from how
much the clause costs.

P-01 and P-07 are both `auto-renewal` and sit in different bands, P-01 high on a
three day cancellation window and P-07 moderate on a ninety day one. Severity is
a property of the instance, not a lookup on its type, and that pair is what
proves it.

## Re-running the verification

```
node scripts/verify-fixtures.mjs
```

It checks that every sidecar sentence is a unique verbatim substring of its
document, that every clause type slug and severity band is legal, that ids run
P-01 upward in document order, that the adhesion contract still carries each
special character, and that the clean document trips none of the seven types on
a keyword screen. It prints one line per check and exits non-zero on any
failure.
