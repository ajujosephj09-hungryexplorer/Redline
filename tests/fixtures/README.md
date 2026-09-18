# Test Fixtures

Fixture contracts used by the analysis engine test suite.

## Files

### risky-contract.txt / risky-contract.json

An adhesion-style freelancer service agreement with six planted clauses that trigger the default red-line rules:

- IP Assignment (overbroad) — critical
- Non-Compete — critical
- Indemnification (overbroad) — moderate
- Forced Arbitration + Class Action Waiver — moderate
- Payment Terms (unfavorable) — moderate
- Termination without guaranteed payment — critical

The contract includes clauses for IP, Payment, and Termination (the three gap-checkable categories), so no gaps should fire. The clauses are present but unfavorable.

### clean-contract.txt / clean-contract.json

A fair freelancer service agreement with no issues. Fair IP clause (project work only, pre-existing IP retained), 30-day payment with late penalties, mutual termination with pro-rated payment, no non-compete, no indemnification, no forced arbitration. Expected result: zero flags, zero gaps.

## Sidecar JSON format

Each `.json` file contains:

```json
{
  "expectedFlags": [
    {
      "rule": "Rule name matching a default red-line rule",
      "severity": "critical | moderate | low",
      "citation": "Exact verbatim substring from the .txt file",
      "description": "What makes this clause flaggable"
    }
  ],
  "expectedGaps": []
}
```

Every `citation` value must be a verbatim substring of the corresponding `.txt` file. Tests can verify this programmatically:

```python
assert citation in contract_text
```

If a citation does not appear verbatim in the contract, the fixture is broken.
