import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from '@/lib/rules/defaults'
import { getLocalRules } from '@/lib/rules/local'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('DEFAULT_RULES', () => {
  it('has exactly 6 entries', () => {
    expect(DEFAULT_RULES).toHaveLength(6)
  })

  it('marks IP Assignment, Payment Terms, and Termination as gap-producing', () => {
    const gapRules = DEFAULT_RULES.slice(0, 3)
    for (const rule of gapRules) {
      expect(rule.producesGap).toBe(true)
    }
  })

  it('marks Non-Compete, Indemnification, and Forced Arbitration as non-gap-producing', () => {
    const nonGapRules = DEFAULT_RULES.slice(3, 6)
    for (const rule of nonGapRules) {
      expect(rule.producesGap).toBe(false)
    }
  })
})

describe('getLocalRules', () => {
  it('returns 6 rules', () => {
    const rules = getLocalRules()
    expect(rules).toHaveLength(6)
  })

  it('populates all required fields on every rule', () => {
    const rules = getLocalRules()
    for (const rule of rules) {
      expect(rule.id).toBeTruthy()
      expect(rule.user_id).toBeTruthy()
      expect(rule.name).toBeTruthy()
      expect(rule.description).toBeTruthy()
      expect(typeof rule.enabled).toBe('boolean')
      expect(typeof rule.is_default).toBe('boolean')
      expect(typeof rule.produces_gap).toBe('boolean')
      expect(rule.created_at).toBeTruthy()
      expect(rule.updated_at).toBeTruthy()
    }
  })

  it('gives every rule a valid UUID-format id', () => {
    const rules = getLocalRules()
    for (const rule of rules) {
      expect(rule.id).toMatch(UUID_REGEX)
    }
  })
})
