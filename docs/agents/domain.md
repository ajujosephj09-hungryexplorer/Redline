# Domain docs

This project uses a **single-context** layout:

- **CONTEXT.md** — will live at the repo root (to be created). This is the authoritative reference on project scope, domain terminology, and architectural decisions.
- **ADRs** — live in `docs/adr/`. Each ADR documents a significant decision, alternatives considered, and consequences.

## Consumer rules

Agent skills that reference "domain docs" will read from:

1. `CONTEXT.md` (if it exists) for the current project's scope and terminology
2. `docs/adr/` for architectural decisions and their rationale
3. `CLAUDE.md` for standing rules and settled decisions (already exists)

If you need to document domain terminology, constraints, or architectural context that isn't a formal ADR, add it to `CONTEXT.md`. Use ADRs for decisions that rule out alternatives or carry forward consequences.

## Layout

```
.
├── CLAUDE.md                    # Standing rules (exists)
├── CONTEXT.md                   # Domain docs (to be created)
├── docs/
│   ├── agents/
│   │   ├── issue-tracker.md    # Where issues live
│   │   ├── domain.md           # This file
│   │   └── triage-labels.md    # Label vocabulary (if triage skill is installed)
│   └── adr/
│       ├── 0001-*.md           # Decisions and their consequences
│       └── ...
└── ...
```
