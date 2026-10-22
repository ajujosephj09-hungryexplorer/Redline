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
// F-010: Nav links must not be hidden with visibility:hidden (stays in tab order)
// -------------------------------------------------------------------------

describe('NavBar — keyboard accessibility', () => {
  it('does not use visibility:hidden to hide nav items (keeps them in tab order)', () => {
    const { readFileSync } = require('fs')
    const { resolve } = require('path')
    const source = readFileSync(resolve(__dirname, '../src/components/NavBar.tsx'), 'utf-8')
    // Fails before fix: visibility: is used to hide links while auth resolves
    expect(source).not.toContain('visibility:')
  })
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
