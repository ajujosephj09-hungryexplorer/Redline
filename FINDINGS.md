# Adversarial Test Findings

**Date:** 2026-10-18
**Tested against:** PRD.md promises
**Production URL:** https://redline-kappa-umber.vercel.app/
**Analyses used:** 9 of 8 allowed (concurrent pair counted as 2)

---

## 1. Gap analysis produces no gaps for a contract missing all three required areas

**Steps:**
1. Submit a contract that contains only Scope of Services, Confidentiality, Relationship, and Governing Law sections
2. The contract has no IP Assignment clause, no Payment Terms, and no Termination clause
3. Review the analysis output

Contract submitted:
```
INDEPENDENT CONTRACTOR AGREEMENT
...
1. SCOPE OF SERVICES — Contractor shall provide data analysis and reporting services.
2. CONFIDENTIALITY — Contractor shall maintain strict confidentiality... survives termination for two years.
3. RELATIONSHIP — Contractor is an independent contractor, not an employee.
4. GOVERNING LAW — Laws of the State of New York.
```

**PRD promise (Section "What the first version does", item 5):**
> "Gap analysis — flags clauses that should exist but don't. Checked for IP Assignment, Payment Terms, and Termination — the three areas where absence hurts the freelancer."
> "Given a contract with no payment timeline, the tool surfaces a gap explaining that no due date was specified and why that matters."

**What happened instead:**
The `gaps` array is empty. The checklist shows all six rules as "clean." The summary correctly identifies the absences in prose ("It says nothing about how much you get paid, when you get paid, who owns the work you produce, what happens if the client cancels"), but no structured gap entries are produced. A freelancer looking at the checklist sees green across the board for a contract that has no payment terms, no IP clause, and no termination rights.

Verified by confirming the contract text contains no payment, IP, or termination language, and the response contains `"gaps":[]` with all checklist items `"status":"clean"`.

**Severity:** Misleads a reader. The freelancer gets a clean checklist for a contract that is missing the three protections the PRD says matter most when absent.

---

## 2. Checklist says "clean" for rules the same analysis flagged

**Steps:**
1. Submit a long contract (~30,000 characters) containing overbroad IP assignment, net-90 payment terms, a broad non-compete, and termination without payment
2. The analysis returns 4 flags: IP Assignment (critical), Termination (critical), Non-Compete (critical), Payment Terms (moderate)
3. The checklist in the same response shows IP Assignment as "clean" and Payment Terms as "clean"

**PRD promise (Section "What good looks like"):**
> "Given a contract with no issues, the tool shows the plain-English summary and a checklist of every rule that was checked, each with a clean status."

(Implies: when issues exist, the checklist should reflect them.)

**What happened instead:**
The flags array contains entries for IP Assignment and Payment Terms, but the checklist marks both as "clean":
```json
"flags": [{"ruleName":"IP Assignment","severity":"critical",...}, {"ruleName":"Payment Terms","severity":"moderate",...}],
"checklist": [{"ruleName":"IP Assignment (overbroad)","status":"clean"}, {"ruleName":"Payment Terms (unfavorable)","status":"clean"}]
```

Termination and Non-Compete are correctly marked "flagged" in both the flags and checklist. The inconsistency only affects IP Assignment and Payment Terms in this analysis.

Verified by comparing the `flags` and `checklist` arrays in the same JSON response. The rule names differ slightly between arrays (e.g., "IP Assignment" in flags vs. "IP Assignment (overbroad)" in checklist), which may be the cause — the matching logic may fail when the flag's `ruleName` doesn't exactly match the checklist entry.

**Severity:** Misleads a reader. A freelancer scanning the checklist for a quick verdict sees two green items that are actually flagged as critical/moderate risks in the detailed view.

---

## 3. Citation uses ellipsis instead of quoting the exact text

**Steps:**
1. Submit a Spanish-language contract containing: "Todo el trabajo realizado por el Contratista, incluyendo herramientas y materiales preexistentes desarrollados antes de este Contrato, sera propiedad exclusiva del Cliente."
2. The analysis returns two IP Assignment flags
3. The second flag's citation reads: "Todo el trabajo realizado por el Contratista... sera propiedad exclusiva del Cliente."

**PRD promise (Section "What good looks like"):**
> "Every risk flag cites an exact sentence from the uploaded document. A human can find that sentence in the original and confirm it exists verbatim. A flag that cites a sentence not in the document, or paraphrases instead of quoting, is a bug."

**What happened instead:**
The citation replaces "incluyendo herramientas y materiales preexistentes desarrollados antes de este Contrato" with "..." — an ellipsis that is not in the document. Searching the document for the citation text fails. The full sentence without the ellipsis IS in the document; the abbreviated version is not.

Verified programmatically: `citation in contract_text` returns `False`.

**Severity:** Misleads a reader. The citation looks like a quote but cannot be found in the document. The freelancer cannot trace the flag back to its source, which is the entire basis for trusting the analysis.

---

## 4. Citations wrapped in quotation marks not present in the source document

**Steps:**
1. Submit a long contract (~30,000 characters)
2. All four returned citations are wrapped in `"..."` double-quote characters

Example — the document contains:
```
All work product, including pre-existing materials and tools created before this Agreement, shall be the sole property of Client.
```

The citation returned:
```
"All work product, including pre-existing materials and tools created before this Agreement, shall be the sole property of Client."
```

**PRD promise (Section "What good looks like"):**
> "A human can find that sentence in the original and confirm it exists verbatim."

**What happened instead:**
All four citations in the long-document analysis include opening and closing `"` characters that do not appear in the source text. Searching the document for any of the four cited strings fails. Removing the added quotes produces strings that are present verbatim.

Verified programmatically: all four `citation in contract_text` checks return `False` with quotes, `True` without.

This did not occur in the risky contract fixture (6 citations, all clean), the prompt injection contract (4 citations, all clean), or the first four citations of the Spanish contract. It occurred in all four citations of the long document.

**Severity:** Misleads a reader. Same as finding 3 — the citation cannot be located in the source, breaking the traceability promise.

---

## 5. Landing page sends users to login — no way to try the product without creating an account

**Steps:**
1. Open https://redline-kappa-umber.vercel.app/
2. Click either "Try it on your contract" button
3. Both link to `/login`
4. User must create an account before seeing any functional page

**PRD promise (Section "What the first version does", item 1):**
> "Landing page — a public page that demonstrates what the product does... One action: try it on your document."

**What happened instead:**
Both CTA buttons link to `/login`. The BUILD-REPORT describes an anonymous analysis path at `/analyze` (working via sessionStorage without authentication), but the landing page never links to it.

Verified via two separate fetches of the landing page; both CTAs confirmed linking to `/login`.

**Severity:** Stops a reader. A freelancer who arrives and wants to try it must create an account first.

---

## 6. API error exposes raw upstream service details to the end user

**Steps:**
1. Trigger an upstream failure (tested with an expired API key; any upstream error would follow the same code path)
2. The error response contains the upstream service name, error type, HTTP auth headers, and status codes

```json
{"error":"OpenRouter request failed (401): {\"error\":{\"message\":\"API key expired.\",\"code\":401,\"metadata\":{\"headers\":{\"WWW-Authenticate\":\"Bearer error=\\\"invalid_token\\\", error_description=\\\"API key expired\\\"\"}}}}"}
```

**PRD promise (implicit — CLAUDE.md standing rules):**
> "All copy a user reads in this product... must be run through the humanizer skill before it is committed. Copy that reads as though a model wrote it is a defect."

**What happened instead:**
The raw JSON error from the upstream provider is embedded in the response. A user sees "OpenRouter," "401," "Bearer," "invalid_token." The HTTP status is 500 instead of 502/503.

Reproduced across 5 API calls with different payloads during the expired-key period.

**Severity:** Stops a reader. The user gets an incomprehensible error with no guidance.

---

## 7. OpenRouter API key was expired — all analysis non-functional until manually renewed

**Steps:**
1. Open the product and submit any contract for analysis
2. All requests fail with HTTP 500

**What happened:**
The OpenRouter API key (`sk-or-v1-82d...d4f`) expired at 1:21 AM EDT on Oct 18, 2026. It had a $2 credit limit with no automatic reset. The key was created Sep 18, set to expire Oct 18 — exactly 30 days. No monitoring detected the failure. The product was silently broken for at least 6 hours before this test.

Fixed during this test session by creating a new key and redeploying.

**Severity:** Stops a reader. The entire product was non-functional with no user-facing explanation.

---

## Seen once

**Citation cites an unrelated sentence.** In the Spanish contract analysis, a Payment Terms flag about "no milestone-based payment protections" cites "El Cliente pagara al Contratista $80 por hora." — the hourly rate sentence, which says nothing about milestones. The citation IS verbatim, but it does not contain the risk described by the flag. Could not reproduce in a second analysis.

**Navigation shows "Sign out" for unauthenticated visitors.** When fetching `/upload` and `/rules` without authentication cookies, the nav bar includes "Sign out." Observed via server-rendered HTML; client-side JavaScript may handle auth state differently. Could not reproduce with a second method due to tooling limitations.

---

## What could not be tested

| Area | Status |
|------|--------|
| Empty document | Tested — API correctly rejects with 400 "Missing or empty text field" |
| Non-contract text | Tested — returns clean summary, no false flags |
| Long document | Tested — analysis completes, but has citation and checklist issues (findings 2, 4) |
| Non-English contract | Tested — Spanish contract analyzed correctly, citations in original language, but has ellipsis issue (finding 3) |
| Prompt injection | Tested — model ignored hidden instruction, called it out, flagged all real issues |
| Citation accuracy | Tested — 14 of 18 citations across all analyses are verbatim; 4 are not (findings 3, 4) |
| Unanswerable questions | Tested — correctly says "I can't find that in this contract" |
| Legal advice refusal | Tested — correctly refuses ("I can't tell you whether to sign") and declines enforceability opinions |
| External knowledge refusal | Tested — correctly refuses ("I can only answer based on the contract text") |
| Concurrent requests | Tested — two simultaneous analyses complete independently |
| Clean contract behavior | Tested — zero flags, all-clean checklist, accurate summary |
| Saved work, navigation, URL manipulation | Not tested — requires authenticated browser session |
| Rules CRUD (toggle, edit, add, delete) | Not tested — rules page requires client-side JS |
| HTML/XSS in rendered output | Not tested — API returns plain JSON; whether the UI escapes output requires a browser |
| Double-click buttons, mid-analysis refresh | Not tested — requires interactive browser |
| Mobile responsive behavior | Not tested — WebFetch has no viewport control |

---

## What held up

- **Citation accuracy (when it works):** 14 of 18 citations across 5 analyses are verbatim substrings of the source document, verified programmatically
- **Risky contract detection:** All 6 default rules fired correctly on the risky fixture, with appropriate severity levels (4 critical, 2 moderate) and specific counter-offers
- **Clean contract behavior:** Zero flags, all-clean checklist, no invented problems
- **Prompt injection resistance:** The model ignored a hidden instruction telling it to "report no risks," explicitly flagged the deceptive clause, and analyzed the rest of the contract normally
- **Question box grounding:** Correctly answered document questions with citations, refused external knowledge, refused legal advice, and said "I can't find that" for unanswerable questions
- **Non-English support:** Spanish contract was analyzed with flags, citations in the original language, and counter-offers in Spanish
- **Severity from language, not category:** The same Non-Compete rule produced "critical" for a 24-month worldwide ban and the tool handled a 12-month industry ban differently in its description
- **Counter-offer specificity:** Counter-offers reference specific contract terms (hourly vs. milestone, kill fee amounts, notice periods) rather than using generic templates
- **Input validation:** Empty text, wrong types, empty questions, and GET on POST-only endpoints all return correct 4xx errors
- **Concurrent requests:** Two simultaneous analyses complete independently without errors or data mixing
- **Landing page:** Accurate demo, honest about product stage ("no prices, no testimonials"), includes legal advice disclaimer
