/**
 * Formatting utilities for the document library.
 */

/**
 * Common patterns that indicate the first line is a legal preamble rather
 * than a meaningful document title. When matched, the fallback title is used
 * instead of the raw text slice.
 */
const LEGAL_PREAMBLE_PATTERNS = [
  /^(this |the )?(freelance |independent contractor |consulting |professional services? |services? )?agreement\b/i,
  /^whereas\b/i,
  /^know all (men|persons)\b/i,
  /^in (consideration|witness) whereof\b/i,
]

function startsWithLegalPreamble(text: string): boolean {
  return LEGAL_PREAMBLE_PATTERNS.some((p) => p.test(text.trim()))
}

/**
 * Derive a display title for a document. Uses the stored title if present;
 * otherwise falls back to the first non-empty line of the plain text,
 * truncated to `maxLength` characters. Lines that look like legal preamble
 * ("THIS AGREEMENT…", "WHEREAS…") produce "Untitled contract" instead.
 */
export function deriveTitle(
  title: string | null | undefined,
  plainText: string,
  maxLength = 80
): string {
  const trimmed = (title ?? '').trim()
  if (trimmed) return trimmed

  const firstLine = plainText
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0)

  if (!firstLine) return 'Untitled contract'
  if (startsWithLegalPreamble(firstLine)) return 'Untitled contract'

  if (firstLine.length <= maxLength) return firstLine
  return firstLine.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Format an ISO date string (or Date) for display in the library list.
 * Returns e.g. "Sep 18, 2026".
 */
export function formatUploadDate(raw: string | Date): string {
  const date = typeof raw === 'string' ? new Date(raw) : raw
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
