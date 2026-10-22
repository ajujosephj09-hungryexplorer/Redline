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
// F-013: Problem text must not be hard-truncated at max-w-[50%]
// -------------------------------------------------------------------------

describe('FindingRow — problem text responsive', () => {
  it('problem text span does not use max-w-[50%] or truncate', () => {
    render(
      <AnalysisView
        documentText="Payment is due within 90 days."
        documentTitle="Test Contract"
        initialResult={MODERATE_RESULT}
      />
    )

    const problemText = screen.getByText('90-day payment window.')
    // Fails before fix: span has truncate max-w-[50%]
    expect(problemText.className).not.toContain('max-w-[50%]')
    expect(problemText.className).not.toContain('truncate')
  })
})

// -------------------------------------------------------------------------
// F-011: GapCard must not use amber as background (Severity Monopoly Rule)
// -------------------------------------------------------------------------

describe('GapCard — amber background', () => {
  it('gap card root element does not use bg-amber-50 or border-amber-200', () => {
    const GAP_RESULT: AnalysisResult = {
      summary: 'Missing IP clause.',
      flags: [],
      gaps: [
        {
          ruleName: 'IP Assignment',
          explanation: 'No IP assignment clause found.',
          counterOffer: 'All work product created under this agreement is assigned to Client.',
        },
      ],
      checklist: [{ ruleName: 'IP Assignment', status: 'gap' }],
    }

    render(
      <AnalysisView
        documentText="Some contract."
        documentTitle="Test Contract"
        initialResult={GAP_RESULT}
      />
    )

    const card = screen.getByTestId('gap-card')
    // Fails before fix: card had bg-amber-50 border-amber-200
    expect(card.className).not.toContain('bg-amber-50')
    expect(card.className).not.toContain('border-amber-200')
  })
})

// -------------------------------------------------------------------------
// F-006: severityPill('low') must not use the word "Clear" or text-severity-clear
// -------------------------------------------------------------------------

describe('severityPill — low severity label', () => {
  it('low findings group header is labelled "Low", not "Clear"', () => {
    const LOW_RESULT: AnalysisResult = {
      summary: 'Test.',
      flags: [
        {
          ruleName: 'Minor Issue',
          problem: 'Minor thing.',
          citation: 'Some clause.',
          severity: 'low',
          counterOffer: 'Change minor thing.',
        },
      ],
      gaps: [],
      checklist: [{ ruleName: 'Minor Issue', status: 'flagged' }],
    }

    render(
      <AnalysisView
        documentText="Some clause."
        documentTitle="Test Contract"
        initialResult={LOW_RESULT}
      />
    )

    // Fails before fix: the group header text is "Clear"
    expect(screen.queryByText('Clear', { selector: 'p' })).toBeNull()
    // The group header should say "Low"
    const lowHeader = screen.getByText('Low', { selector: 'p' })
    expect(lowHeader).toBeTruthy()
    // It must not use the clear/green colour
    expect(lowHeader.className).not.toContain('text-severity-clear')
  })
})

// -------------------------------------------------------------------------
// F-008: QuestionBox input must have an accessible label
// -------------------------------------------------------------------------

describe('QuestionBox — accessibility', () => {
  it('question input has an accessible label (not just a placeholder)', () => {
    render(
      <AnalysisView
        documentText="Payment is due within 90 days."
        documentTitle="Test Contract"
        initialResult={MODERATE_RESULT}
      />
    )

    // Fails before fix: input has no label, so getByRole with a label name throws
    const input = screen.getByRole('textbox', { name: /ask a question about this contract/i })
    expect(input).toBeTruthy()
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
