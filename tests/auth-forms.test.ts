import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')

function src(rel: string) {
  return readFileSync(path.join(root, rel), 'utf-8')
}

// -------------------------------------------------------------------------
// F-002: Auth inputs must not use focus:ring-0 (removes focus indicator)
// -------------------------------------------------------------------------

describe('auth form focus rings', () => {
  it('login inputs do not use focus:ring-0', () => {
    // Fails before fix: focus:ring-0 is present, removing the visible focus ring
    expect(src('src/app/(auth)/login/page.tsx')).not.toContain('focus:ring-0')
  })

  it('login inputs use focus:ring-2 for a WCAG-compliant indicator', () => {
    expect(src('src/app/(auth)/login/page.tsx')).toContain('focus:ring-2')
  })

  it('signup inputs do not use focus:ring-0', () => {
    // Fails before fix: focus:ring-0 is present on both signup inputs
    expect(src('src/app/(auth)/signup/page.tsx')).not.toContain('focus:ring-0')
  })

  it('signup inputs use focus:ring-2 for a WCAG-compliant indicator', () => {
    expect(src('src/app/(auth)/signup/page.tsx')).toContain('focus:ring-2')
  })
})
