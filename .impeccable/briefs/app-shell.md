# App Shell

**Mode:** Operate
**Audience:** Logged-in freelancers reviewing contracts
**Task:** Navigate between document library, upload, analysis results, question box, and rules editor
**Center of gravity:** The document library — returning users land here and pick a document
**Constraints:** Solo use. Post-authentication only. Inherits the medical diagnostic report visual world established in the landing page direction.

## Scope

The frame that holds:
- **Document library** (center) — past contracts, each showing name, date, and summary status (clean / flagged with severity counts)
- **Upload** — paste or drag a document; the entry point for every new analysis
- **Analysis results** — summary, ranked flags with citations and counter-offers, gap analysis, rules checklist
- **Question box** — alongside results, post-analysis only
- **Red-line rules** — the user's rule set, editable
- Navigation between these views

## Key states

- Empty library (first use, post-signup)
- Library with documents (returning user, the default landing)
- Analyzing (processing a newly uploaded contract)
- Results: flagged contract (the common case)
- Results: clean contract (summary + all-clear checklist, no fabricated flags)
- Rules editor (toggle, add, delete, reword)

## Direction inheritance

This surface inherits the medical diagnostic report world from the landing page direction. Clinical white ground, navy structure, red/amber/green severity. The app shell is the clinical portal to the landing page's diagnostic report — same visual language, Operate mode's density and scanability. Expression lives in precise severity indicators, clean tabular layouts, and the systematic feel of a well-run diagnostic practice.

## Not built today

This brief records the surface strategy. No app screens are built in this round.
