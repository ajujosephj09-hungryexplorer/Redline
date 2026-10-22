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
