# Flag labelling

Hand-label ten flags from the eval run to check whether the analysis engine is
flagging real problems.

## Which run

`eval-runs/2026-10-30T16-40-28-873Z.json` — the second successful run on
`google/gemini-3.5-flash-lite`, 30 October 2026.

## How the ten were picked

Only grounded flags (citation is a verbatim substring of the document) were
eligible. From those:

1. Every flag that matched no planted clause in the gold set, including flags on
   documents that should come back clean.
2. Every flag that matched a planted clause but named a different clause type.
3. Flags from the most severe band (critical), drawn from as many different
   documents as possible, until there were ten. When critical ran out, moderate
   flags filled the remaining slots.

No information about which group a flag came from is included in `flags.json`.

## The rule

**PASS** if the quoted sentence really is the kind of clause the flag names and
really costs the reader something. Otherwise **FAIL**.

## How to open the page

```
npm run label
```

Then open the address printed in the terminal (default `http://127.0.0.1:4317`).
Labels are saved to `labels.json` in this directory and also kept in the
browser's localStorage. You can close the page and come back later.
