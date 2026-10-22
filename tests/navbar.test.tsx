// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
      signOut: () => Promise.resolve({}),
    },
  }),
}))

import NavBar from '@/components/NavBar'

beforeEach(() => {
  vi.clearAllMocks()
})

// -------------------------------------------------------------------------
// F-003: Sign up button touch target must be at least 44 px tall
// -------------------------------------------------------------------------

describe('NavBar — touch targets', () => {
  it('Sign up button does not use py-1.5 (would make it ~32 px, below 44 px minimum)', async () => {
    render(<NavBar />)

    // Wait for auth resolution (authed=false → sign-up link renders)
    const signUpLink = await screen.findByRole('link', { name: /sign up/i })
    // Fails before fix: py-1.5 is present
    expect(signUpLink.className).not.toContain('py-1.5')
  })
})
