import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Supabase config', () => {
  beforeEach(() => {
    vi.resetModules()
    // Clear any env vars that might leak between tests
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  it('isSupabaseConfigured returns false when env vars are not set', async () => {
    const { isSupabaseConfigured } = await import('@/lib/supabase/config')
    expect(isSupabaseConfigured).toBe(false)
  })

  it('isSupabaseConfigured returns false when only URL is set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    const { isSupabaseConfigured } = await import('@/lib/supabase/config')
    expect(isSupabaseConfigured).toBe(false)
  })

  it('isSupabaseConfigured returns false when only anon key is set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key'
    const { isSupabaseConfigured } = await import('@/lib/supabase/config')
    expect(isSupabaseConfigured).toBe(false)
  })

  it('isSupabaseConfigured returns true when both env vars are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'some-key'
    const { isSupabaseConfigured } = await import('@/lib/supabase/config')
    expect(isSupabaseConfigured).toBe(true)
  })
})

describe('Supabase browser client', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  it('returns null when Supabase is not configured', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const client = createClient()
    expect(client).toBeNull()
  })
})
