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
