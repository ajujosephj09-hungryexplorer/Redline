// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// -------------------------------------------------------------------------
// F-057: Empty library must show 3-step onboarding guide
// -------------------------------------------------------------------------

vi.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured: true }))
vi.mock('@/lib/documents/format', () => ({
  deriveTitle: (title: string) => title || 'Untitled contract',
  formatUploadDate: () => 'Oct 22, 2026',
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (_table: string) => ({
      select: () => ({
        order: () =>
          Promise.resolve({
            data: [],
            error: null,
          }),
      }),
    }),
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

import LibraryPage from '@/app/(app)/library/page'

describe('LibraryPage — empty state onboarding (F-057)', () => {
  it('shows a 3-item step guide when user has no documents', async () => {
    render(<LibraryPage />)

    // Fails before fix: empty state only shows "No contracts yet" paragraph
    const steps = await screen.findByTestId('onboarding-steps')
    expect(steps.querySelectorAll('li')).toHaveLength(3)
  })

  it('shows "Upload a contract" button linking to /upload', async () => {
    render(<LibraryPage />)

    const link = await screen.findByRole('link', { name: /upload a contract/i })
    expect(link).toHaveAttribute('href', '/upload')
  })
})
