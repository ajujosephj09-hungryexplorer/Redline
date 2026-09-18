import { readFileSync } from 'fs'
import { join } from 'path'

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

  return {
    summary:
      fixtureName === 'risky'
        ? 'This is a service agreement from Apex Digital Holdings that contains several clauses heavily favoring the client.'
        : 'This is a fair service agreement from Fieldwork Studio with balanced terms for both parties.',
    flags: sidecar.expectedFlags.map((f: Record<string, string>) => ({
      ruleName: f.rule,
      problem: f.description,
      citation: f.citation,
      severity: f.severity,
      counterOffer: `Counter-offer for ${f.rule}: [specific alternative language]`,
    })),
    gaps: [],
    checklist: [],
  }
}
