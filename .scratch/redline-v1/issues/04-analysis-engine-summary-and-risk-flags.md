# 04 — Analysis engine — summary + risk flags

**What to build:** After uploading a contract, the user clicks "Analyze." The app sends the document's plain text and the user's active rules to an LLM via OpenRouter. The response is a structured analysis containing: a plain-English summary of the contract, and risk flags ranked by severity. Each flag names the problem in confident, direct language, cites the exact source sentence from the contract, includes a severity rating based on the specific language (scope, duration, one-sidedness), and attaches a drafted counter-offer specific to the contract shape. Results are displayed on a results page.

**Blocked by:** 02 — Document upload + browser parsing, 03 — Default red-line rules schema + seed

**Status:** done

- [x] OpenRouter API integration working (API key in `.env.local`)
- [x] Analysis prompt accepts plain text + active rules, returns structured JSON
- [x] Output includes a plain-English summary written for a non-lawyer
- [x] Each risk flag includes: problem statement (confident tone), exact verbatim citation from the document, severity rating, and counter-offer
- [x] Every citation is a verbatim substring of the uploaded text (ADR 0001)
- [x] Severity is assessed from specific language (scope, duration, one-sidedness), not clause category (ADR 0003)
- [x] Counter-offers are specific to the contract shape (hourly vs. retainer vs. project-based), not generic templates
- [x] Flags are ranked by severity in the results UI
- [x] The engine errs toward flagging when uncertain (ADR 0004)
- [x] Flag tone is confident and direct; hedging reserved for genuinely ambiguous language (ADR 0004)
- [x] Counter-offer text is copyable
- [x] Analysis results are stored so they can be retrieved later
