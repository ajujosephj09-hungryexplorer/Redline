# Build Report

**Date:** 2026-09-18
**Builder:** Claude Opus 4.6 (automated, unattended)

## Ticket Status

| # | Ticket | Status |
|---|--------|--------|
| 00 | Landing page | Done (pre-existing) |
| 01 | Project scaffold + auth | Done |
| 02 | Document upload + browser parsing | Done |
| 03 | Default rules schema + seed | Done |
| 04 | Analysis engine — summary + risk flags | Done |
| 05 | Gap analysis + rules checklist | Done |
| 06 | Red-line rules CRUD | Done |
| 07 | Question box | Done |
| 08 | Document library | Done |

All 9 tickets are complete. No tickets are blocked.

## Verification

- `npm run build` — passes. All 13 routes compile.
- `npm test` — 68 tests pass across 8 test files, zero failures.
- `npm run smoke` — passes against live model (`z-ai/glm-5.3-flash` via Fireworks). 6 flags found on the risky fixture, all 6 citations verified as verbatim substrings. 0 gaps (correct — the contract has all clause types, just bad versions). Summary is specific to the contract and reads well.

## What's Working Now

- **Vercel deployment** — live at redline-kappa-umber.vercel.app. Auto-deploys from master.
- **OpenRouter env vars** — `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` set in both `.env.local` (local dev) and Vercel (production).
- **Supabase** — project created (`phtutsxmzhbibehqaigq`). Env vars set in `.env.local` and Vercel. All 5 migrations run. Tables: profiles, documents, rules, analyses — all with RLS policies.
- **Landing page** — public, no auth needed.
- **Anonymous analysis** — paste a contract at `/analyze`, runs through OpenRouter, returns flags with citations.
- **Auth** — sign up / log in pages wired to Supabase. Ready for manual testing.
- **Document library** — saves and retrieves past contracts per user account.
- **Rules customization** — editable red-line rules that persist across sessions.
- **Question box** — follow-up questions grounded in the document and analysis context.

## Decisions Made

### 1. Vercel deployment (ticket 01)
Vercel is connected to the GitHub repo. Pushes to master trigger automatic production deploys. All 4 env vars (OpenRouter + Supabase) are set in Vercel project settings.

### 2. App works without Supabase
The app starts and serves the landing page, upload, and anonymous analysis without Supabase env vars. Auth-dependent features (library, rules persistence) degrade gracefully with sign-in prompts.

### 3. Gap analysis was already in the analysis engine
Ticket 04's agent built the gap detection, gap UI, and rules checklist as part of the analysis engine. Ticket 05 added dedicated tests, extended the test stubs with gap mock data, and updated the smoke script.

### 4. OpenRouter structured output
The analysis engine uses `response_format: { type: "json_schema" }` with a strict schema. Provider pinned to Fireworks, fallbacks disabled, reasoning effort low. Model ID read from `OPENROUTER_MODEL` — never hardcoded.

### 5. Anonymous analysis path
When Supabase is absent, users can paste a contract and analyze it via sessionStorage and the `/analyze` route. The question box also works in this path. Only persistence (library, custom rules) requires an account.

### 6. Test mocking boundary
Tests mock `callOpenRouter` (the HTTP call to OpenRouter) but NOT the analysis engine itself. The engine's prompt construction, result validation, severity sorting, gap filtering, and checklist rebuilding all run for real. The stubs return fixture-derived payloads with citations that are verified as verbatim substrings of the fixture contract.

### 7. No impeccable direction round
The build prompt said not to start one. All screens follow DESIGN.md (clinical white, navy ink, severity-only color, max-w-3xl, finding row accordion, rules checklist). Copy was written in direct human language per the standing rule.

### 8. PDF worker
pdfjs-dist requires a web worker. The worker file is copied from node_modules to `public/` via a postinstall script. The built file is gitignored.

## What Could Not Be Verified

1. **Supabase auth flow** — Supabase is connected and migrations are run. Needs manual testing (sign up, log in, save a document, check library).
2. **Real document parsing** — PDF and DOCX parsing tested with text fixtures only, not real binary files. The parser uses pdfjs-dist and mammoth which are battle-tested libraries.
3. **Mobile responsive behavior** — Not verified visually. The design uses max-w-3xl which should work on mobile, but no browser testing was done.

## Local Dev Commands

```bash
# Start the dev server
npm run dev

# Run tests
npm test

# Run the smoke test (live model call)
npm run smoke

# Build for production
npm run build
```

## File Inventory

### Routes
- `/` — Landing page (public)
- `/login` — Sign in
- `/signup` — Sign up
- `/auth/callback` — Supabase auth callback
- `/dashboard` — Redirects to `/library`
- `/library` — Document library (authenticated)
- `/upload` — Upload or paste a contract (authenticated)
- `/rules` — View and manage red-line rules (authenticated)
- `/dashboard/documents/[id]` — Analysis results for a document (authenticated)
- `/analyze` — Anonymous analysis via sessionStorage (public)
- `/api/analyze` — Analysis API endpoint
- `/api/question` — Question box API endpoint

### Key modules
- `src/lib/analysis/engine.ts` — Core analysis pipeline
- `src/lib/analysis/openrouter.ts` — OpenRouter API client
- `src/lib/analysis/question.ts` — Question answering logic
- `src/lib/analysis/types.ts` — Analysis type definitions
- `src/lib/parser.ts` — Client-side document parsing
- `src/lib/rules/` — Rules types, defaults, CRUD actions, local fallback
- `src/lib/supabase/` — Supabase client with graceful degradation
- `src/lib/documents/format.ts` — Document title/date formatting

### Migrations
- `00001_create_profiles.sql` — Profiles table + auto-create trigger
- `00002_create_documents.sql` — Documents table with RLS
- `00003_create_rules.sql` — Rules table with RLS
- `00004_seed_default_rules.sql` — Default rules seed trigger
- `00005_create_analyses.sql` — Analyses table with RLS

### Tests (68 total)
- `tests/scaffold.test.ts` — 5 tests (Supabase config, client degradation)
- `tests/parser.test.ts` — 7 tests (text parsing, fixture citations)
- `tests/rules.test.ts` — 6 tests (default rules, gap metadata)
- `tests/rules-crud.test.ts` — 18 tests (CRUD operations, local fallback)
- `tests/analysis.test.ts` — 5 tests (risky/clean contracts, disabled rules, severity)
- `tests/gaps.test.ts` — 5 tests (gap production, checklist, clean behavior)
- `tests/question-box.test.ts` — 8 tests (grounding, not-found, history)
- `tests/library.test.ts` — 14 tests (title derivation, date formatting)
