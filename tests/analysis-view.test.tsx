// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AnalysisView from '@/app/(app)/dashboard/documents/[id]/AnalysisView'
import type { AnalysisResult } from '@/lib/analysis/types'

// -------------------------------------------------------------------------
// Shared fixtures
// -------------------------------------------------------------------------

const MODERATE_RESULT: AnalysisResult = {
  summary: 'A service agreement with a slow payment term.',
  flags: [
    {
      ruleName: 'Payment Terms',
      problem: '90-day payment window.',
      citation: 'Payment is due within 90 days.',
      severity: 'moderate',
      counterOffer: 'Payment within 30 days.',
    },
  ],
  gaps: [],
  checklist: [{ ruleName: 'Payment Terms', status: 'flagged' }],
}

// -------------------------------------------------------------------------
// F-001: Accordion button must have aria-expanded
// -------------------------------------------------------------------------

describe('FindingRow — accessibility', () => {
  it('accordion button has aria-expanded="false" when closed', () => {
    render(
      <AnalysisView
        documentText="Payment is due within 90 days."
        documentTitle="Test Contract"
        initialResult={MODERATE_RESULT}
      />
    )

    // The rule name appears in both FindingRow header and the checklist.
    // Only the one inside a <button> is the accordion trigger.
    const ruleTexts = screen.getAllByText('Payment Terms')
    const accordionBtns = ruleTexts
      .map((el) => el.closest('button'))
      .filter(Boolean)

    expect(accordionBtns).toHaveLength(1)
    // Fails before fix: button has no aria-expanded attribute
    expect(accordionBtns[0]).toHaveAttribute('aria-expanded', 'false')
  })
})
