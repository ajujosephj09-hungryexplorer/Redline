// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Fails before fix: CounterOfferBlock does not exist as a standalone component
import CounterOfferBlock from '@/components/CounterOfferBlock'

// -------------------------------------------------------------------------
// F-007: CounterOfferBlock extracted from FindingRow / GapCard duplication
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// F-012: Edit/Copy buttons must not use py-0.5 (~20 px, below WCAG touch target)
// -------------------------------------------------------------------------

describe('CounterOfferBlock — button touch targets', () => {
  it('Edit and Copy buttons do not use py-0.5', () => {
    const { readFileSync } = require('fs')
    const { resolve } = require('path')
    const source = readFileSync(resolve(__dirname, '../src/components/CounterOfferBlock.tsx'), 'utf-8')
    // The original buttons used py-0.5 (≈20 px). CounterOfferBlock must not regress.
    expect(source).not.toContain('py-0.5')
  })
})

// -------------------------------------------------------------------------
// F-056: Save button must be disabled when textarea is empty
// -------------------------------------------------------------------------

describe('CounterOfferBlock — empty save guard (F-056)', () => {
  it('Save button is disabled when textarea is blank', async () => {
    render(<CounterOfferBlock initialText="Original counter-offer." />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const ta = screen.getByRole('textbox')
    await userEvent.clear(ta)

    // Fails before fix: Save button is always enabled
    const saveBtn = screen.getByRole('button', { name: /save/i })
    expect(saveBtn).toBeDisabled()
  })

  it('Save button is enabled once text is entered', async () => {
    render(<CounterOfferBlock initialText="Original counter-offer." />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const ta = screen.getByRole('textbox')
    await userEvent.clear(ta)
    await userEvent.type(ta, 'New text.')

    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('shows "Restore original" button when textarea is blank', async () => {
    render(<CounterOfferBlock initialText="Original counter-offer." />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const ta = screen.getByRole('textbox')
    await userEvent.clear(ta)

    expect(screen.getByRole('button', { name: /restore original/i })).toBeTruthy()
  })
})

// -------------------------------------------------------------------------
// F-054: Citation context must appear in edit mode when citation prop provided
// -------------------------------------------------------------------------

describe('CounterOfferBlock — citation context in edit mode (F-054)', () => {
  it('shows citation text above textarea when editing with citation prop', async () => {
    render(
      <CounterOfferBlock
        initialText="Counter-offer text."
        citation="The exact clause from the contract."
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    // Fails before fix: citation is not shown inside CounterOfferBlock
    expect(screen.getByText('The exact clause from the contract.')).toBeTruthy()
  })

  it('does not show citation section when no citation prop is given', async () => {
    render(<CounterOfferBlock initialText="Counter-offer text." />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.queryByText(/from contract/i)).toBeNull()
  })

  it('citation is not visible when not in edit mode', () => {
    render(
      <CounterOfferBlock
        initialText="Counter-offer text."
        citation="The exact clause from the contract."
      />
    )
    // Not in edit mode — citation block should be hidden
    expect(screen.queryByTestId('edit-citation')).toBeNull()
  })
})

describe('CounterOfferBlock', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  it('copy button writes the initial text to clipboard', async () => {
    render(<CounterOfferBlock initialText="Payment within 30 days." />)

    await userEvent.click(screen.getByRole('button', { name: /copy/i }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Payment within 30 days.')
  })

  it('edit button shows textarea; save persists new text; cancel discards', async () => {
    render(<CounterOfferBlock initialText="Original counter-offer." />)

    // Edit mode off by default
    expect(screen.queryByRole('textbox')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    // Textarea appears
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeTruthy()

    // Cancel hides textarea without saving
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('textbox')).toBeNull()

    // Edit again, change text, save
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const ta = screen.getByRole('textbox')
    await userEvent.clear(ta)
    await userEvent.type(ta, 'Updated counter-offer.')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    // Textarea gone, new text visible
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('Updated counter-offer.')).toBeTruthy()
  })
})
