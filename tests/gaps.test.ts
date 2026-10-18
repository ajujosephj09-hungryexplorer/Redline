import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Mock the openrouter module — only the HTTP boundary, not the engine logic
vi.mock('@/lib/analysis/openrouter', () => ({
  callOpenRouter: vi.fn(),
}))

import { analyzeContract } from '@/lib/analysis/engine'
import { callOpenRouter } from '@/lib/analysis/openrouter'
import { getLocalRules } from '@/lib/rules/local'
import { buildMockAnalysis, buildMockGapAnalysis } from './stubs/model-client'

const riskyText = readFileSync(
  join(__dirname, 'fixtures/risky-contract.txt'),
  'utf8'
)
const cleanText = readFileSync(
  join(__dirname, 'fixtures/clean-contract.txt'),
  'utf8'
)

describe('gap analysis', () => {
  it('risky contract produces zero gaps (all clause types present)', async () => {
    const rules = getLocalRules()
    const mockResult = buildMockAnalysis('risky')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(riskyText, rules)

    expect(result.gaps).toHaveLength(0)
  })

  it('checklist contains one entry per active rule', async () => {
    const rules = getLocalRules()
    const enabledCount = rules.filter((r) => r.enabled).length

    const mockResult = buildMockAnalysis('risky')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(riskyText, rules)

    expect(result.checklist).toHaveLength(enabledCount)

    // Every rule name appears exactly once
    const names = result.checklist.map((c) => c.ruleName)
    expect(new Set(names).size).toBe(enabledCount)
  })

  it('gap-producing rules produce gaps when clause is absent', async () => {
    const rules = getLocalRules()
    const mockResult = buildMockGapAnalysis()
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(riskyText, rules)

    expect(result.gaps.length).toBe(3)

    const gapNames = result.gaps.map((g) => g.ruleName)
    expect(gapNames).toContain('IP Assignment (overbroad)')
    expect(gapNames).toContain('Payment Terms (unfavorable)')
    expect(gapNames).toContain('Termination without guaranteed payment')

    // Each gap has explanation and counterOffer
    for (const gap of result.gaps) {
      expect(gap.explanation).toBeTruthy()
      expect(gap.counterOffer).toBeTruthy()
    }

    // Checklist reflects gap status
    const checklistMap = new Map(
      result.checklist.map((c) => [c.ruleName, c.status])
    )
    for (const name of gapNames) {
      expect(checklistMap.get(name)).toBe('gap')
    }
  })

  it('engine backstops when LLM returns empty gaps for unflagged gap-producing rules', async () => {
    const rules = getLocalRules()

    // Contract text that genuinely lacks IP, Payment, and Termination clauses.
    // This is the scenario from Finding #1: the LLM recognized the absences in
    // the summary but returned "gaps": [] — no structured gap entries.
    const bareContract = [
      'INDEPENDENT CONTRACTOR AGREEMENT',
      'This Agreement is entered into by and between Horizon Labs, Inc. ("Client") and the undersigned contractor ("Contractor").',
      '1. SCOPE OF SERVICES',
      'Contractor shall provide data analysis and reporting services for Client.',
      '2. CONFIDENTIALITY',
      'Contractor shall maintain strict confidentiality regarding all Client proprietary information.',
      '3. RELATIONSHIP',
      'Contractor is an independent contractor, not an employee.',
      '4. GOVERNING LAW',
      'This Agreement shall be governed by the laws of the State of New York.',
    ].join('\n')

    const mockResult = {
      summary: 'This contract covers scope and confidentiality but says nothing about how you get paid, who owns the work, or how either side exits.',
      flags: [],
      gaps: [],
      checklist: [
        { ruleName: 'IP Assignment (overbroad)', status: 'clean' },
        { ruleName: 'Payment Terms (unfavorable)', status: 'clean' },
        { ruleName: 'Termination without guaranteed payment', status: 'clean' },
        { ruleName: 'Non-Compete', status: 'clean' },
        { ruleName: 'Indemnification (overbroad)', status: 'clean' },
        { ruleName: 'Forced Arbitration + Class Action Waiver', status: 'clean' },
      ],
    }
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(bareContract, rules)

    // The engine must produce gaps for the 3 gap-producing rules that have no flags
    expect(result.gaps.length).toBe(3)

    const gapNames = result.gaps.map((g) => g.ruleName)
    expect(gapNames).toContain('IP Assignment (overbroad)')
    expect(gapNames).toContain('Payment Terms (unfavorable)')
    expect(gapNames).toContain('Termination without guaranteed payment')

    // Each gap must have non-empty explanation and counterOffer
    for (const gap of result.gaps) {
      expect(gap.explanation).toBeTruthy()
      expect(gap.counterOffer).toBeTruthy()
    }

    // Checklist must show 'gap' not 'clean' for these rules
    const checklistMap = new Map(
      result.checklist.map((c) => [c.ruleName, c.status])
    )
    expect(checklistMap.get('IP Assignment (overbroad)')).toBe('gap')
    expect(checklistMap.get('Payment Terms (unfavorable)')).toBe('gap')
    expect(checklistMap.get('Termination without guaranteed payment')).toBe('gap')

    // Non-gap-producing rules must remain clean
    expect(checklistMap.get('Non-Compete')).toBe('clean')
    expect(checklistMap.get('Indemnification (overbroad)')).toBe('clean')
    expect(checklistMap.get('Forced Arbitration + Class Action Waiver')).toBe('clean')
  })

  it('non-gap-producing rules never produce gaps', async () => {
    const rules = getLocalRules()
    const nonGapRuleNames = rules
      .filter((r) => !r.produces_gap && r.enabled)
      .map((r) => r.name)

    // Even if the model hallucinated gaps for non-gap rules, the engine strips them
    const mockResult = buildMockGapAnalysis()
    // Inject a bogus gap for a non-gap-producing rule
    mockResult.gaps.push({
      ruleName: 'Non-Compete',
      explanation: 'Hallucinated gap that should be filtered out.',
      counterOffer: 'This should never appear.',
    })
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(riskyText, rules)

    const gapNames = new Set(result.gaps.map((g) => g.ruleName))
    for (const name of nonGapRuleNames) {
      expect(gapNames.has(name)).toBe(false)
    }
  })

  it('clean contract has zero flags, zero gaps, and all-clean checklist', async () => {
    const rules = getLocalRules()
    const mockResult = buildMockAnalysis('clean')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(cleanText, rules)

    expect(result.flags).toHaveLength(0)
    expect(result.gaps).toHaveLength(0)

    // Every checklist entry is clean
    for (const item of result.checklist) {
      expect(item.status).toBe('clean')
    }

    // Checklist covers all enabled rules
    const enabledCount = rules.filter((r) => r.enabled).length
    expect(result.checklist).toHaveLength(enabledCount)
  })
})
