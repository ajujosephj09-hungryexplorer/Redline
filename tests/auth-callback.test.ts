import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

vi.mock('@/lib/supabase/config', () => ({
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'test-anon-key',
  isSupabaseConfigured: true,
}))

// -------------------------------------------------------------------------
// F-041: OAuth callback must support next= param for deep linking
// -------------------------------------------------------------------------

describe('auth callback — next= redirect', () => {
  it('redirects to /dashboard by default', async () => {
    const { GET } = await import('@/app/(auth)/auth/callback/route')
    const req = new Request('http://localhost/auth/callback?code=test-code')
    const res = await GET(req)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to the next= path after successful exchange', async () => {
    // Fails before fix: next= is ignored, always redirects to /dashboard
    const { GET } = await import('@/app/(auth)/auth/callback/route')
    const req = new Request('http://localhost/auth/callback?code=test-code&next=/library')
    const res = await GET(req)
    expect(res.headers.get('location')).toBe('http://localhost/library')
  })

  it('ignores next= if it does not start with / (SSRF guard)', async () => {
    const { GET } = await import('@/app/(auth)/auth/callback/route')
    const req = new Request('http://localhost/auth/callback?code=test-code&next=https://evil.com')
    const res = await GET(req)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard')
  })
})
