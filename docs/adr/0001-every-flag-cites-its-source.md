# ADR 0001: Every Risk Flag Must Cite Its Source Sentence

## Decision

Every risk flag that Redline produces must include a citation to the exact sentence from the uploaded contract that the flag refers to. A flag whose source sentence cannot be displayed is treated as a bug, not a formatting preference or acceptable degradation.

## Alternatives

1. Let the language model describe risks in its own words without requiring quotes. The model summarizes or paraphrases the problem and users trust the AI's judgment.
2. Allow "summary-level" flags that point to sections rather than exact sentences.
3. Include a source flag only when the model is certain; omit it for lower-confidence findings.

## Why

Users must be able to read the exact source material themselves and verify that the flagged risk is real. This shifts verification from trusting the model's interpretation to checking the original text. A user reading a flag can go directly to the document, find the cited sentence, and decide whether the risk is legitimate or the analysis is wrong. This is what trustworthy output looks like.

## Consequences

- **Product scope:** The analysis is only as good as what the model can extract and attribute. We cannot offer speculative or inference-based risks.
- **LLM integration:** The model must be prompted to always return source citations. We cannot use off-the-shelf summarization; citation must be part of the task.
- **Testing:** Every flag in output must be traceable to the input. Tests must verify both the analysis and the citation. This is non-negotiable.
- **Edge cases:** PDFs with OCR errors, scanned documents, and malformed text make citation harder. We must decide whether to skip flagging or present low-confidence citations.
