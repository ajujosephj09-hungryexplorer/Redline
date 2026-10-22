// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

// Supabase mock: returns a document record
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: '123',
                title: 'Test Contract',
                plain_text: 'Payment is due within 90 days.',
              },
              error: null,
            }),
        }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

vi.mock('@/lib/rules/actions', () => ({
  fetchRules: () => Promise.resolve([]),
}))

// Return a cached result so AnalysisView never fires a fetch
vi.mock('@/lib/analyses/actions', () => ({
  fetchAnalysis: () =>
    Promise.resolve({
      result: { summary: 'Test.', flags: [], gaps: [], checklist: [] },
      createdAt: new Date().toISOString(),
    }),
  saveAnalysis: () => Promise.resolve(),
}))

import DocumentAnalysisClient from '@/app/(app)/dashboard/documents/[id]/DocumentAnalysisClient'

// -------------------------------------------------------------------------
// F-005: Document view must have a back link to /library
// -------------------------------------------------------------------------

describe('DocumentAnalysisClient — back navigation', () => {
  it('renders a "Your contracts" link pointing to /library', async () => {
    render(<DocumentAnalysisClient documentId="123" />)

    // Fails before fix: no back-nav link exists
    const backLink = await screen.findByRole('link', { name: /your contracts/i })
    expect(backLink).toHaveAttribute('href', '/library')
  })
})
