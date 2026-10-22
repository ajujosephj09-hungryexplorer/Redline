import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')
const landingSrc = readFileSync(path.join(root, 'src/app/page.tsx'), 'utf-8')

// -------------------------------------------------------------------------
// F-014: Landing page CTAs must link to /upload, not /analyze
// -------------------------------------------------------------------------

describe('landing page CTAs', () => {
  it('primary CTA links to /upload, not /analyze', () => {
    // Fails before fix: both CTAs point to /analyze (anonymous flow),
    // silently bypassing the save flow for authenticated users
    expect(landingSrc).not.toContain('href="/analyze"')
    expect(landingSrc).toContain('href="/upload"')
  })
})
