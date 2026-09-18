import { readFileSync } from 'fs'
import { join } from 'path'

/** All 6 default rule names, in the same order as defaults.ts */
const RULE_NAMES = [
  'IP Assignment (overbroad)',
  'Payment Terms (unfavorable)',
  'Termination without guaranteed payment',
  'Non-Compete',
  'Indemnification (overbroad)',
  'Forced Arbitration + Class Action Waiver',
]

/** Rules where absence is a problem */
const GAP_PRODUCING_RULES = new Set([
  'IP Assignment (overbroad)',
  'Payment Terms (unfavorable)',
  'Termination without guaranteed payment',
])

/**
 * Builds a mock analysis result from the fixture sidecar JSON files.
 * Used in tests so we never call the real OpenRouter API.
 */
export function buildMockAnalysis(fixtureName: 'risky' | 'clean') {
  const sidecar = JSON.parse(
    readFileSync(
      join(__dirname, `../fixtures/${fixtureName}-contract.json`),
      'utf8'
    )
  )

  const flags = sidecar.expectedFlags.map((f: Record<string, string>) => ({
    ruleName: f.rule,
    problem: f.description,
    citation: f.citation,
    severity: f.severity,
    counterOffer: `Counter-offer for ${f.rule}: [specific alternative language]`,
  }))

  const flaggedNames = new Set(flags.map((f: { ruleName: string }) => f.ruleName))

  // Risky contract has all clause types present (just bad versions), so zero gaps.
  // Clean contract has all clause types present and fair, so zero gaps.
  const gaps: Array<{ ruleName: string; explanation: string; counterOffer: string }> = []

  // Build checklist: flagged if rule produced a flag, clean otherwise.
  // No gaps because all clause types are present in both fixtures.
  const checklist = RULE_NAMES.map((name) => ({
    ruleName: name,
    status: flaggedNames.has(name) ? 'flagged' : 'clean',
  }))

  return {
    summary:
      fixtureName === 'risky'
        ? 'This is a service agreement from Apex Digital Holdings that contains several clauses heavily favoring the client.'
        : 'This is a fair service agreement from Fieldwork Studio with balanced terms for both parties.',
    flags,
    gaps,
    checklist,
  }
}

/**
 * Builds a mock result for a contract missing all gap-producing clause types.
 * IP Assignment, Payment Terms, and Termination are absent (gaps present).
 * Non-Compete, Indemnification, Forced Arbitration are absent too, but those
 * rules have produces_gap = false, so absence is the preferred state (clean).
 */
export function buildMockGapAnalysis() {
  return {
    summary: 'This is a short consulting agreement that covers scope and confidentiality but is missing several standard protections.',
    flags: [],
    gaps: [
      {
        ruleName: 'IP Assignment (overbroad)',
        explanation: 'The contract says nothing about who owns what the contractor builds. Without an IP clause, ownership may default to the client under work-for-hire doctrine, leaving the contractor with no rights to reuse their own work.',
        counterOffer: 'All deliverables created under this Agreement shall be assigned to Client upon full payment. Contractor retains ownership of pre-existing tools, frameworks, and methodologies, with a perpetual license granted to Client for use in the deliverables.',
      },
      {
        ruleName: 'Payment Terms (unfavorable)',
        explanation: 'There is no payment timeline, late-fee provision, or invoicing process. The contractor has no enforceable due date and no recourse if the client delays payment indefinitely.',
        counterOffer: 'Client shall pay all invoices within thirty (30) calendar days of receipt. Invoices unpaid after 30 days shall accrue interest at 1.5% per month. Contractor may suspend work if any invoice remains unpaid for more than 45 days.',
      },
      {
        ruleName: 'Termination without guaranteed payment',
        explanation: 'The contract has no termination clause. Either party can walk away at any time with no notice, no kill fee, and no obligation to pay for work already done.',
        counterOffer: 'Either party may terminate this Agreement with fourteen (14) calendar days written notice. Upon termination, Client shall pay for all Services completed through the termination date plus a kill fee equal to 25% of the estimated remaining project value.',
      },
    ],
    checklist: [
      { ruleName: 'IP Assignment (overbroad)', status: 'gap' },
      { ruleName: 'Payment Terms (unfavorable)', status: 'gap' },
      { ruleName: 'Termination without guaranteed payment', status: 'gap' },
      { ruleName: 'Non-Compete', status: 'clean' },
      { ruleName: 'Indemnification (overbroad)', status: 'clean' },
      { ruleName: 'Forced Arbitration + Class Action Waiver', status: 'clean' },
    ],
  }
}
