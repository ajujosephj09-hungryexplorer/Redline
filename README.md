# Redline

AI contract reviewer for freelancers. Upload a contract, get back severity-ranked risk flags with exact citations and drafted counter-offer language you can send to the client.

**Live:** [redline-kappa-umber.vercel.app](https://redline-kappa-umber.vercel.app)

## The problem

71% of freelancers have experienced non-payment. Only 28% use written contracts. The ones who do rarely review them because a lawyer costs $300-$500 to review a $2,000 project.

Enterprise contract analysis tools run $30,000+/year and require weeks of setup. Consumer tools ($29-$99/month) offer no severity ranking, no counter-offer drafting, no gap analysis, and still need configuration before they produce anything useful.

Freelancers are never the drafting party. The language that hurts them is sitting in a document they have access to. They lack the pattern recognition to know which sentences matter and the confidence to know what to say back.

## What it does

- **Plain-English summary** of what the contract says, written for someone who is not a lawyer
- **Risk flags ranked by severity**, each citing the exact source sentence from the document. Severity comes from the specific language (scope, duration, one-sidedness), not from the clause category
- **Gap analysis** for clauses that should exist but don't (IP assignment, payment terms, termination). Does not flag missing non-competes or forced arbitration, because absence is the preferred state
- **Counter-offer drafting** for every flag and gap, specific to the contract shape. An hourly engagement gets minimum-commitment language; a retainer gets kill-fee language
- **Question box** that appears after the analysis runs, grounded in the document and analysis context. If the document doesn't contain the answer, the tool says so
- **Editable rules** with six defaults that ship ready. Users can toggle, add, delete, and reword

## The six default rules

| Rule | Why it matters |
|------|---------------|
| IP Assignment (overbroad) | Assigns pre-existing work or rights beyond project scope. A designer loses the right to reuse portfolio work |
| Payment Terms (unfavorable) | Net-60/90 windows, client-controlled milestones, no late penalties. 71% non-payment rate traces here |
| Termination without guaranteed payment | Client cancels with no kill fee, no minimum, no notice. Freelancer absorbs the loss |
| Non-Compete | Restricts who the freelancer can work for. Severity scales with scope and duration |
| Indemnification (overbroad) | Freelancer liable for client losses they don't control. Attorney fees alone can exceed contract value |
| Forced Arbitration + Class Action Waiver | Consumers win 9% of arbitration cases. 60M+ workers covered by these clauses |

## Architecture

```
Browser (paste/upload) → Client-side parsing → Vercel Serverless API
  → OpenRouter LLM (structured JSON output, strict schema validation)
  → Severity ranking + gap detection + counter-offer generation
  → Rendered report with expandable findings
```

Parsing happens in the browser. Only plain text reaches the server. No OCR (breaks citation accuracy). The analysis engine enforces `response_format: { type: "json_schema" }` with strict validation. A flag that cites a sentence not in the document is treated as a bug.

## Stack

- **Next.js** (App Router) with TypeScript
- **Supabase** for auth + database (row-level security on all tables)
- **OpenRouter** for LLM access
- **Vercel** for deployment (master branch auto-deploys)
- **Vitest** for testing (68 tests, 8 files, zero failures)

## Key design decisions

**False positives over false negatives.** The tool flags aggressively. A false positive costs the user 10 seconds (read the citation, dismiss). A false negative costs whatever the contract costs.

**Confident tone, not hedged.** Flags say "This clause assigns all derivative IP rights to the client," not "This clause may assign..." The citation underneath is the hedge. The user reads the quoted sentence and decides.

**Severity from language, not category.** A 2-year industry-wide non-compete is critical. A 6-month restriction limited to one named competitor is low. Same clause type, different severity. The tool never comments on legal enforceability.

**No setup required.** Six rules ship ready. No playbook configuration, no policy definition, no Microsoft Word integration. Upload and go.

**Inbound contracts only.** Rules assume the user is the weaker party. The tool does not review contracts you wrote.

## What it does not do

- No enforceability opinions (no jurisdiction awareness)
- No OCR (extraction errors break citation accuracy)
- No outbound contract review
- No automatic learning from dismissed flags
- No sharing or collaboration

## Development

```bash
npm run dev      # Local dev server
npm test         # 68 tests
npm run smoke    # Live model smoke test
npm run build    # Production build
```

## Status

All core features shipped and tested. Auth flow, document library, rules CRUD, question box, and anonymous analysis path all functional. See [BUILD-REPORT.md](BUILD-REPORT.md) for the full verification log.
