/**
 * Formatting utilities for the document library.
 */

/**
 * Derive a display title for a document. Uses the stored title if present;
 * otherwise falls back to the first non-empty line of the plain text,
 * truncated to `maxLength` characters.
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
