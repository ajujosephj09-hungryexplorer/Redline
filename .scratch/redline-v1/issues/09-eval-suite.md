# 09 — Eval suite

**What to build:** An eval runner that sends every document in the gold set through the real analysis pipeline (same code path as `npm run smoke`) and reports recall, groundedness, and clean-document rates. The gold set comes from an external repo and contains nine documents with forty planted clauses across seven clause types. Four of those seven map onto this product's rules; three are out of scope.

**Blocked by:** 04 — Analysis engine (done)

**Status:** in progress

- [ ] Gold set copied to `eval/gold-set/` with corpus and fixtures, relative paths preserved
- [ ] Clause type mapping documented in `eval/README.md`
- [ ] `npm run eval` runs every document through `analyzeContract` with local rules and OpenRouter settings from `.env.local`
- [ ] Recall: planted clauses found (overlap match) out of in-scope planted clauses, split by special character presence
- [ ] Groundedness: flags with verbatim citations out of all flags
- [ ] Clean document rate: flags returned on benign documents (should be zero)
- [ ] Failed model calls excluded from all denominators, count reported
- [ ] Each run saved to `eval-runs/` as timestamped `.txt` and `.json` with every flag detail
- [ ] Type correctness: whether matched flags named the right mapped rule, reported separately
- [ ] Gold-set integrity test added to normal test suite (no network): every planted sentence appears exactly once in its document
- [ ] `npm run typecheck` and `npm test` pass
- [ ] `npm run eval` run once if OPENROUTER_API_KEY is set
- [ ] "How we measure it" section added to PRD.md
