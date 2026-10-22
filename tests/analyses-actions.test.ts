import { describe, it, expect, vi } from 'vitest'
import { fetchAnalysis } from '@/lib/analyses/actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockSupabase(overrides: {
  data?: unknown
  error?: { message: string } | null
} = {}): any {
  const { data = null, error = null } = overrides

  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data, error }))

  return {
    from: vi.fn(() => chain),
  }
}

// -------------------------------------------------------------------------
// F-034: fetchAnalysis must throw on DB error, not silently return null
// -------------------------------------------------------------------------

describe('fetchAnalysis', () => {
  it('returns null when no analysis exists (cache miss)', async () => {
    const supabase = mockSupabase({ data: null, error: null })
    const result = await fetchAnalysis(supabase, 'doc-123')
    expect(result).toBeNull()
  })

  it('returns the cached result when one exists', async () => {
    const payload = { summary: 'ok', flags: [], gaps: [], checklist: [] }
    const supabase = mockSupabase({
      data: { result: payload, created_at: '2026-01-01T00:00:00Z' },
      error: null,
    })
    const result = await fetchAnalysis(supabase, 'doc-123')
    expect(result).not.toBeNull()
    expect(result!.result).toEqual(payload)
  })

  it('throws on DB error instead of silently returning null', async () => {
    // Fails before fix: `if (error || !data) return null` masks the DB error
    const supabase = mockSupabase({ data: null, error: { message: 'permission denied' } })
    await expect(fetchAnalysis(supabase, 'doc-123')).rejects.toThrow('permission denied')
  })
})
