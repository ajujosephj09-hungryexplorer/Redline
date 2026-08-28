# Redline

A web app that uploads a contract and returns:
- Plain-English summary
- Clauses ranked by severity with exact source sentences
- Drafted counter-offers for each flagged clause
- Question box that answers only from the document
- Editable list of red-line rules that drive the analysis
- Saved library of past documents

## Settled decisions

- **Stack:** Next.js, Supabase (auth + database), Vercel deployment
- **Model via OpenRouter:** Choice deferred to implementation
- **Parsing:** Happens in the browser. Only plain text is stored.
- **Citations:** Every risk flag must cite the exact sentence it came from. A flag without a traceable source is a bug.
- **Scope:** Build the capabilities listed above. Payments, billing, OCR, and sharing are excluded on purpose. This version proves analysis can be trusted; none of those three increase trustworthiness. OCR actively harms it.

## Standing rules

- Keep credentials in .env.local (gitignored). Never commit a secret.
- State only what the document says. Unsupported claims are bugs.
- Ask before adding a dependency.
- Ask me before building anything not on the list above.

## Before you start

- `research/summary.md` — market validation, pain points, and competitive gaps. Read before deciding what to build.
- `PRD.md` — will hold the brief once written. Read before building.

## During the build

- Supabase project: set up from scratch. Auth flow decided as we build.
- Solo development.
