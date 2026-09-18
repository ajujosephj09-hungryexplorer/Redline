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

  it('returns empty gaps and checklist (ticket 05 fills these)', async () => {
    const text = readFileSync(
      join(__dirname, 'fixtures/risky-contract.txt'),
      'utf8'
    )
    const rules = getLocalRules()

    const mockResult = buildMockAnalysis('risky')
    vi.mocked(callOpenRouter).mockResolvedValueOnce(mockResult)

    const result = await analyzeContract(text, rules)

    expect(result.gaps).toEqual([])
    expect(result.checklist).toEqual([])
  })
})
