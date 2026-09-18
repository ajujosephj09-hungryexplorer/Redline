import { describe, it, expect } from 'vitest'
import { deriveTitle, formatUploadDate } from '@/lib/documents/format'

describe('deriveTitle', () => {
  it('returns the stored title when present', () => {
    expect(deriveTitle('Service Agreement', 'Some body text')).toBe(
      'Service Agreement'
    )
  })

  it('trims whitespace from the stored title', () => {
    expect(deriveTitle('  NDA  ', 'body')).toBe('NDA')
  })

  it('falls back to the first non-empty line of plain text when title is empty', () => {
    expect(deriveTitle('', 'First line of the contract\nSecond line')).toBe(
      'First line of the contract'
    )
  })

  it('falls back to the first non-empty line when title is null', () => {
    expect(deriveTitle(null, 'Opening clause\nMore text')).toBe(
      'Opening clause'
    )
  })

  it('falls back to the first non-empty line when title is undefined', () => {
    expect(deriveTitle(undefined, 'Clause one')).toBe('Clause one')
  })

  it('skips blank lines at the start of plain text', () => {
    expect(deriveTitle('', '\n\n  \nActual first line\nrest')).toBe(
      'Actual first line'
    )
  })

  it('truncates the first line at maxLength with an ellipsis', () => {
    const longLine = 'A'.repeat(100)
    const result = deriveTitle('', longLine, 40)
    expect(result).toBe('A'.repeat(40) + '...')
  })

  it('does not truncate if the first line is exactly maxLength', () => {
    const line = 'B'.repeat(40)
    expect(deriveTitle('', line, 40)).toBe(line)
  })

  it('returns "Untitled contract" when both title and text are empty', () => {
    expect(deriveTitle('', '')).toBe('Untitled contract')
  })

  it('returns "Untitled contract" when text is only whitespace', () => {
    expect(deriveTitle('', '   \n  \n  ')).toBe('Untitled contract')
  })
})

describe('formatUploadDate', () => {
  it('formats an ISO string as "Mon DD, YYYY"', () => {
    // Use a date that won't shift across midnight in any US timezone
    const result = formatUploadDate('2026-09-18T12:00:00Z')
    expect(result).toBe('Sep 18, 2026')
  })

  it('accepts a Date object', () => {
    const result = formatUploadDate(new Date(2025, 0, 5, 12, 0, 0))
    expect(result).toBe('Jan 5, 2025')
  })

  it('handles a date at the start of the year', () => {
    const result = formatUploadDate('2026-01-01T12:00:00Z')
    expect(result).toBe('Jan 1, 2026')
  })

  it('handles a date at the end of the year', () => {
    const result = formatUploadDate('2026-12-31T12:00:00Z')
    expect(result).toBe('Dec 31, 2026')
  })
})
