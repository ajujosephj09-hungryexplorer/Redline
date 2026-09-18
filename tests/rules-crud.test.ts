import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchRules,
  toggleRule,
  updateRule,
  createRule,
  deleteRule,
} from '@/lib/rules/actions'
import { getLocalRules } from '@/lib/rules/local'

// ---------------------------------------------------------------------------
// Mock Supabase client builder
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockSupabase(overrides: {
  userId?: string | null
  selectData?: unknown[]
  selectError?: Error | null
  updateError?: Error | null
  insertData?: unknown
  insertError?: Error | null
  deleteError?: Error | null
} = {}): any {
  const {
    userId = 'user-123',
    selectData = [],
    selectError = null,
    updateError = null,
    insertData = null,
    insertError = null,
    deleteError = null,
  } = overrides

  // Track calls for assertions
  const calls = {
    select: null as Record<string, unknown> | null,
    update: null as Record<string, unknown> | null,
    insert: null as Record<string, unknown> | null,
    delete: true as boolean,
    eqPairs: [] as [string, unknown][],
  }

  const chainable = (terminal: { data: unknown; error: Error | null }) => {
    const chain: Record<string, unknown> = {}
    chain.select = vi.fn(() => {
      calls.select = {}
      return {
        single: vi.fn(() => Promise.resolve(terminal)),
      }
    })
    chain.eq = vi.fn((col: string, val: unknown) => {
      calls.eqPairs.push([col, val])
      return chain
    })
    chain.order = vi.fn(() => Promise.resolve(terminal))
    chain.single = vi.fn(() => Promise.resolve(terminal))
    return chain
  }

  const selectChain = chainable({ data: selectData, error: selectError })
  const updateChain = chainable({ data: null, error: updateError })
  const insertChain = chainable({ data: insertData, error: insertError })
  const deleteChain = chainable({ data: null, error: deleteError })

  const from = vi.fn((table: string) => {
    return {
      select: vi.fn((...args: unknown[]) => {
        calls.select = { table, args }
        // For fetchRules: .select('*').eq(...).order(...)
        const eqFn = vi.fn((_col: string, _val: unknown) => {
          calls.eqPairs.push([_col, _val])
          return {
            order: vi.fn(() =>
              Promise.resolve({ data: selectData, error: selectError })
            ),
          }
        })
        return { eq: eqFn }
      }),
      update: vi.fn((data: Record<string, unknown>) => {
        calls.update = data
        return {
          eq: vi.fn((col: string, val: unknown) => {
            calls.eqPairs.push([col, val])
            return Promise.resolve({ error: updateError })
          }),
        }
      }),
      insert: vi.fn((data: Record<string, unknown>) => {
        calls.insert = data
        return {
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: insertData, error: insertError })
            ),
          })),
        }
      }),
      delete: vi.fn(() => {
        calls.delete = true
        return {
          eq: vi.fn((col: string, val: unknown) => {
            calls.eqPairs.push([col, val])
            return Promise.resolve({ error: deleteError })
          }),
        }
      }),
    }
  })

  const client = {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: userId ? { id: userId } : null },
        })
      ),
    },
    from,
    _calls: calls,
    _from: from,
  }

  return client as unknown as ReturnType<typeof mockSupabase> & {
    _calls: typeof calls
    _from: typeof from
    auth: typeof client.auth
  }
}

// ---------------------------------------------------------------------------
// Tests: CRUD actions
// ---------------------------------------------------------------------------

describe('fetchRules', () => {
  it('queries the rules table filtered by the authenticated user', async () => {
    const supabase = mockSupabase({ selectData: [] })
    const result = await fetchRules(supabase as never)
    expect(result).toEqual([])
    expect(supabase._from).toHaveBeenCalledWith('rules')
  })

  it('throws when no user is authenticated', async () => {
    const supabase = mockSupabase({ userId: null })
    await expect(fetchRules(supabase as never)).rejects.toThrow('Not authenticated')
  })

  it('returns the data from Supabase', async () => {
    const fakeRules = [
      { id: '1', name: 'Test Rule', enabled: true },
      { id: '2', name: 'Other Rule', enabled: false },
    ]
    const supabase = mockSupabase({ selectData: fakeRules })
    const result = await fetchRules(supabase as never)
    expect(result).toEqual(fakeRules)
  })

  it('throws on Supabase error', async () => {
    const supabase = mockSupabase({
      selectError: new Error('DB error'),
    })
    await expect(fetchRules(supabase as never)).rejects.toThrow('DB error')
  })
})

describe('toggleRule', () => {
  it('calls update with the new enabled value', async () => {
    const supabase = mockSupabase()
    await toggleRule(supabase as never, 'rule-abc', false)
    expect(supabase._from).toHaveBeenCalledWith('rules')
  })

  it('throws on Supabase error', async () => {
    const supabase = mockSupabase({
      updateError: new Error('Update failed'),
    })
    await expect(
      toggleRule(supabase as never, 'rule-abc', true)
    ).rejects.toThrow('Update failed')
  })
})

describe('updateRule', () => {
  it('calls update with the provided fields', async () => {
    const supabase = mockSupabase()
    await updateRule(supabase as never, 'rule-abc', {
      name: 'New name',
      description: 'New desc',
    })
    expect(supabase._from).toHaveBeenCalledWith('rules')
  })

  it('allows partial updates (name only)', async () => {
    const supabase = mockSupabase()
    await updateRule(supabase as never, 'rule-abc', { name: 'Just name' })
    expect(supabase._from).toHaveBeenCalledWith('rules')
  })

  it('throws on Supabase error', async () => {
    const supabase = mockSupabase({
      updateError: new Error('Update failed'),
    })
    await expect(
      updateRule(supabase as never, 'rule-abc', { name: 'fail' })
    ).rejects.toThrow('Update failed')
  })
})

describe('createRule', () => {
  const input = {
    name: 'NDA scope',
    description: 'Flags overly broad NDA terms',
    produces_gap: false,
  }

  it('inserts a new rule with is_default false and enabled true', async () => {
    const inserted = {
      id: 'new-id',
      user_id: 'user-123',
      ...input,
      enabled: true,
      is_default: false,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    }
    const supabase = mockSupabase({ insertData: inserted })
    const result = await createRule(supabase as never, input)
    expect(result).toEqual(inserted)
    expect(supabase._from).toHaveBeenCalledWith('rules')
  })

  it('throws when not authenticated', async () => {
    const supabase = mockSupabase({ userId: null })
    await expect(createRule(supabase as never, input)).rejects.toThrow(
      'Not authenticated'
    )
  })

  it('throws on Supabase error', async () => {
    const supabase = mockSupabase({
      insertError: new Error('Insert failed'),
    })
    await expect(createRule(supabase as never, input)).rejects.toThrow(
      'Insert failed'
    )
  })
})

describe('deleteRule', () => {
  it('deletes the rule by id', async () => {
    const supabase = mockSupabase()
    await deleteRule(supabase as never, 'rule-xyz')
    expect(supabase._from).toHaveBeenCalledWith('rules')
  })

  it('throws on Supabase error', async () => {
    const supabase = mockSupabase({
      deleteError: new Error('Delete failed'),
    })
    await expect(deleteRule(supabase as never, 'rule-xyz')).rejects.toThrow(
      'Delete failed'
    )
  })
})

// ---------------------------------------------------------------------------
// Tests: local rules fallback
// ---------------------------------------------------------------------------

describe('getLocalRules (fallback)', () => {
  it('returns 6 rules', () => {
    expect(getLocalRules()).toHaveLength(6)
  })

  it('marks every rule as is_default: true', () => {
    for (const rule of getLocalRules()) {
      expect(rule.is_default).toBe(true)
    }
  })

  it('marks every rule as enabled: true', () => {
    for (const rule of getLocalRules()) {
      expect(rule.enabled).toBe(true)
    }
  })

  it('sets user_id to "local"', () => {
    for (const rule of getLocalRules()) {
      expect(rule.user_id).toBe('local')
    }
  })
})
