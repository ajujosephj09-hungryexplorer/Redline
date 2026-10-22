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

const ANON_RESULT: AnalysisResult = {
  summary: 'A service agreement.',
  flags: [
    {
      ruleName: 'Payment Terms',
      problem: '90-day window.',
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
  // F-004 is below in its own describe block

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

// -------------------------------------------------------------------------
// F-004: Anonymous save prompt must appear before the first FindingRow
// -------------------------------------------------------------------------

describe('AnalysisView — anonymous save prompt position', () => {
  it('save prompt appears before the first finding in the DOM', () => {
    render(
      <AnalysisView
        documentText="Payment is due within 90 days."
        documentTitle="Test Contract"
        initialResult={ANON_RESULT}
        isAnonymous
      />
    )

    const savePrompt = screen.getByText(/This analysis disappears/i)
    const ruleTexts = screen.getAllByText('Payment Terms')
    const accordionBtn = ruleTexts
      .map((el) => el.closest('button'))
      .filter(Boolean)[0] as Element

    // DOCUMENT_POSITION_FOLLOWING (4): accordionBtn comes after savePrompt
    // Fails before fix: save prompt is below the findings
    const position = savePrompt.compareDocumentPosition(accordionBtn)
    expect(position & 4).toBeTruthy()
  })
})
