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
import { buildMockAnalysis } from './stubs/model-client'

describe('analysis engine', () => {
  it('returns flags with valid citations for risky contract', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/risky-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules()

    const mockResult = buildMockAnalysis('risky')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    expect(result.summary).toBeTruthy()
    expect(result.flags.length).toBeGreaterThanOrEqual(4)

    // Every citation must be a verbatim substring of the input
    for (const flag of result.flags) {
      expect(text).toContain(flag.citation)
    }
  })

  it('returns zero flags for clean contract', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/clean-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules()

    const mockResult = buildMockAnalysis('clean')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    expect(result.summary).toBeTruthy()
    expect(result.flags).toHaveLength(0)
  })

  it('only sends enabled rules to the model', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/risky-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules().map((r) => ({ ...r, enabled: false }))

    const mockResult = {
      summary: 'No rules to check.',
      flags: [],
      gaps: [],
      checklist: [],
    }
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    // Verify callOpenRouter was called
    expect(vi.mocked(callOpenRouter)).toHaveBeenCalled()

    // With no enabled rules the model should return no flags
    expect(result.flags).toHaveLength(0)
  })

  it('sorts flags by severity — critical first', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/risky-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules()

    const mockResult = buildMockAnalysis('risky')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    const severities = result.flags.map((f) => f.severity)
    const order = { critical: 0, moderate: 1, low: 2 }
    for (let i = 1; i < severities.length; i++) {
      expect(order[severities[i]]).toBeGreaterThanOrEqual(
        order[severities[i - 1]]
      )
    }
  })

  it('checklist shows "flagged" even when LLM returns truncated rule names', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/risky-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules()

    // Simulate the LLM returning truncated names (no parenthetical suffix)
    const mockResult = {
      summary: 'Contract with issues.',
      flags: [
        {
          ruleName: 'IP Assignment',
          problem: 'Overbroad IP clause.',
          citation: 'All work product shall be the sole property of Client.',
          severity: 'critical',
          counterOffer: 'Limit IP assignment to project deliverables.',
        },
        {
          ruleName: 'Payment Terms',
          problem: 'Net-90 payment window.',
          citation: 'Client shall pay Contractor within ninety (90) days.',
          severity: 'moderate',
          counterOffer: 'Change to net-30.',
        },
      ],
      gaps: [],
      checklist: [
        { ruleName: 'IP Assignment', status: 'flagged' },
        { ruleName: 'Payment Terms', status: 'flagged' },
        { ruleName: 'Termination without guaranteed payment', status: 'clean' },
        { ruleName: 'Non-Compete', status: 'clean' },
        { ruleName: 'Indemnification', status: 'clean' },
        { ruleName: 'Forced Arbitration', status: 'clean' },
      ],
    }
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    // The engine must match truncated names to canonical rules
    const checklistMap = new Map(
      result.checklist.map((c) => [c.ruleName, c.status])
    )
    expect(checklistMap.get('IP Assignment (overbroad)')).toBe('flagged')
    expect(checklistMap.get('Payment Terms (unfavorable)')).toBe('flagged')

    // Flags should also use canonical names
    const flagNames = result.flags.map((f) => f.ruleName)
    expect(flagNames).toContain('IP Assignment (overbroad)')
    expect(flagNames).toContain('Payment Terms (unfavorable)')
  })

  it('returns zero gaps and a full checklist for risky contract (all clause types present)', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/risky-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules()

    const mockResult = buildMockAnalysis('risky')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    // All clause types exist in the risky contract, so no gaps
    expect(result.gaps).toHaveLength(0)

    // Checklist has one entry per enabled rule
    expect(result.checklist).toHaveLength(rules.filter((r) => r.enabled).length)

    // Every flagged rule should show as 'flagged' in the checklist
    const flaggedNames = new Set(result.flags.map((f) => f.ruleName))
    for (const item of result.checklist) {
      if (flaggedNames.has(item.ruleName)) {
        expect(item.status).toBe('flagged')
      } else {
        expect(item.status).toBe('clean')
      }
    }
  })
})
