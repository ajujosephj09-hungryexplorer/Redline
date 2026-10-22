import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')

function src(rel: string) {
  return readFileSync(path.join(root, rel), 'utf-8')
}

// -------------------------------------------------------------------------
// F-017: key={i} on checklist rows and gap cards must use ruleName
// -------------------------------------------------------------------------

describe('AnalysisView — stable list keys', () => {
  it('checklist and gaps are not keyed by array index', () => {
    const content = src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')
    // Fails before fix: <div key={i}> and <GapCard key={i}> use index keys
    // After fix: keys come from ruleName
    expect(content).not.toContain('key={i}')
  })
})

// -------------------------------------------------------------------------
// F-016: toggleFlag must be useCallback-wrapped; FindingRow must be React.memo'd
// -------------------------------------------------------------------------

describe('AnalysisView — FindingRow memoisation', () => {
  it('toggleFlag is wrapped in useCallback', () => {
    const content = src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')
    // Fails before fix: toggleFlag is a plain function, not useCallback
    expect(content).toContain('useCallback')
    expect(content).toMatch(/const toggleFlag\s*=\s*useCallback/)
  })

  it('FindingRow is wrapped in memo (React.memo)', () => {
    const content = src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')
    // Fails before fix: FindingRow is not memoised
    expect(content).toMatch(/memo\(function FindingRow|React\.memo/)
  })
})

// -------------------------------------------------------------------------
// F-015: loadingMessages must be defined at module scope, not inside component
// -------------------------------------------------------------------------

describe('AnalysisView — loadingMessages module scope', () => {
  it('LOADING_MESSAGES is defined at module scope (not inside the component)', () => {
    const content = src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')
    // Fails before fix: array is defined inside the component body (indented const)
    expect(content).not.toContain('  const loadingMessages')
    expect(content).toContain('const LOADING_MESSAGES')
  })
})

// -------------------------------------------------------------------------
// F-009: Decorative spinners must be aria-hidden
// -------------------------------------------------------------------------

describe('decorative spinners are aria-hidden', () => {
  it('AnalysisView loading spinner has aria-hidden="true"', () => {
    const lines = src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx').split('\n')
    const spinnerLine = lines.find((l) => l.includes('animate-spin'))
    // Fails before fix: spinner line has no aria-hidden
    expect(spinnerLine).toContain('aria-hidden')
  })

  it('QuestionBox loading spinner has aria-hidden="true"', () => {
    const lines = src('src/components/QuestionBox.tsx').split('\n')
    const spinnerLine = lines.find((l) => l.includes('animate-spin'))
    // Fails before fix: spinner line has no aria-hidden
    expect(spinnerLine).toContain('aria-hidden')
  })
})

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
