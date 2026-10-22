import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')

function src(rel: string) {
  return readFileSync(path.join(root, rel), 'utf-8')
}

// -------------------------------------------------------------------------
// F-018: text-severity-critical must not appear in generic UI error messages
// -------------------------------------------------------------------------

describe('UI error messages use text-error token, not text-severity-critical', () => {
  const errorFiles = [
    'src/app/(auth)/login/page.tsx',
    'src/app/(auth)/signup/page.tsx',
    'src/app/(app)/upload/page.tsx',
    'src/components/UploadForm.tsx',
  ]

  for (const file of errorFiles) {
    it(`${file} does not use text-severity-critical for form errors`, () => {
      // Fails before fix: severity-critical used for network/form errors
      expect(src(file)).not.toContain('text-severity-critical')
      expect(src(file)).toContain('text-error')
    })
  }
})

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

// -------------------------------------------------------------------------
// F-024: analyze/page.tsx loading state must have role="status"
// -------------------------------------------------------------------------

describe('analyze page — loading state accessibility', () => {
  it('the Loading... paragraph has role="status"', () => {
    // Fails before fix: plain <p> with no role, screen readers won't announce it
    expect(src('src/app/analyze/page.tsx')).toContain('role="status"')
  })
})

// -------------------------------------------------------------------------
// F-037: x-forwarded-for must use [0] (original client), not .pop() (last proxy)
// -------------------------------------------------------------------------

describe('API routes — x-forwarded-for client IP extraction', () => {
  const apiRoutes = [
    'src/app/api/analyze/route.ts',
    'src/app/api/question/route.ts',
  ]

  for (const file of apiRoutes) {
    it(`${file} uses split(',')[0] not .pop() for x-forwarded-for`, () => {
      // Fails before fix: .pop() returns the last (proxy) IP, not the client IP
      const content = src(file)
      expect(content).not.toContain("split(',').pop()")
      expect(content).toContain("split(',')[0]")
    })
  }
})

// -------------------------------------------------------------------------
// F-035: Middleware must return 503 for protected paths when Supabase is unconfigured in production
// -------------------------------------------------------------------------

describe('middleware — unconfigured Supabase safety', () => {
  it('middleware references NODE_ENV to gate the unconfigured pass-through', () => {
    // Fails before fix: unconditional NextResponse.next() when !isConfigured
    expect(src('src/middleware.ts')).toContain('NODE_ENV')
  })

  it('middleware returns a 503 response when Supabase is unconfigured in production', () => {
    // Fails before fix: only NextResponse.next() is returned for unconfigured state
    const content = src('src/middleware.ts')
    expect(content).toContain('503')
  })
})

// -------------------------------------------------------------------------
// F-033: GAP_TOPIC_PATTERNS must cover every gap-producing default rule
// -------------------------------------------------------------------------

describe('engine — GAP_TOPIC_PATTERNS coverage', () => {
  const gapRuleNames = [
    'IP Assignment (overbroad)',
    'Payment Terms (unfavorable)',
    'Termination without guaranteed payment',
  ]

  for (const name of gapRuleNames) {
    it(`engine.ts has a GAP_TOPIC_PATTERNS entry for "${name}"`, () => {
      expect(src('src/lib/analysis/engine.ts')).toContain(name)
    })
  }
})

// -------------------------------------------------------------------------
// F-031: Library "Analyzed" label must not use severity-clear (green is semantic)
// -------------------------------------------------------------------------

describe('library page — Analyzed label colour', () => {
  it('Analyzed label uses text-slate-400, not text-severity-clear', () => {
    // Fails before fix: green severity token misused for a neutral status label
    const content = src('src/app/(app)/library/page.tsx')
    expect(content).not.toContain('text-severity-clear')
    expect(content).toContain('text-slate-400')
  })
})

// -------------------------------------------------------------------------
// F-030: Pencil icon should be visible at opacity-40 resting, not opacity-0
// -------------------------------------------------------------------------

describe('rules page — pencil icon resting state', () => {
  it('pencil icon does not use opacity-0 (invisible at rest)', () => {
    // Fails before fix: opacity-0 makes the icon invisible until hover
    expect(src('src/app/(app)/rules/page.tsx')).not.toContain('opacity-0 group-hover:opacity-100')
  })

  it('pencil icon uses opacity-40 at rest', () => {
    expect(src('src/app/(app)/rules/page.tsx')).toContain('opacity-40')
  })
})

// -------------------------------------------------------------------------
// F-029: "Skip to questions" anchor must not be hidden on desktop
// -------------------------------------------------------------------------

describe('AnalysisView — skip to questions link', () => {
  it('AnalysisView does not use sm:hidden anywhere (skip-to-questions was the last instance)', () => {
    // Fails before fix: skip-to-questions anchor has sm:hidden, hiding it on desktop
    expect(src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')).not.toContain('sm:hidden')
  })
})

// -------------------------------------------------------------------------
// F-028: criticalFlags/moderateFlags/lowFlags must be wrapped in useMemo
// -------------------------------------------------------------------------

describe('AnalysisView — memoised flag partitions', () => {
  it('imports useMemo from react', () => {
    // Fails before fix: useMemo is not imported
    expect(src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')).toContain('useMemo')
  })

  it('criticalFlags is derived via useMemo', () => {
    // Fails before fix: plain const that re-runs every render
    expect(src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')).toMatch(
      /criticalFlags\s*=\s*useMemo/
    )
  })

  it('moderateFlags is derived via useMemo', () => {
    expect(src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')).toMatch(
      /moderateFlags\s*=\s*useMemo/
    )
  })

  it('lowFlags is derived via useMemo', () => {
    expect(src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')).toMatch(
      /lowFlags\s*=\s*useMemo/
    )
  })
})

// -------------------------------------------------------------------------
// F-027: hover:bg-slate-700/800 on primary buttons → hover:bg-navy
// -------------------------------------------------------------------------

describe('primary buttons use hover:bg-navy', () => {
  const primaryButtonFiles = [
    'src/app/page.tsx',
    'src/app/(auth)/login/page.tsx',
    'src/app/(auth)/signup/page.tsx',
    'src/components/QuestionBox.tsx',
    'src/components/UploadForm.tsx',
    'src/components/NavBar.tsx',
    'src/app/(app)/library/page.tsx',
    'src/app/(app)/rules/page.tsx',
  ]

  for (const file of primaryButtonFiles) {
    it(`${file} does not use hover:bg-slate-700 or hover:bg-slate-800`, () => {
      // Fails before fix: inconsistent raw slate values instead of navy token
      const content = src(file)
      expect(content).not.toContain('hover:bg-slate-700')
      expect(content).not.toContain('hover:bg-slate-800')
    })
  }
})

// -------------------------------------------------------------------------
// F-026: globals.css scrollbar track colour and thumb border-radius
// -------------------------------------------------------------------------

describe('globals.css scrollbar tokens', () => {
  it('scrollbar track uses #f8fafc (slate-50), not the darker #f1f5f9', () => {
    // Fails before fix: track is #f1f5f9 (slate-100)
    expect(src('src/app/globals.css')).not.toContain('#f1f5f9')
    expect(src('src/app/globals.css')).toContain('#f8fafc')
  })

  it('scrollbar thumb border-radius is 2px, not 3px', () => {
    // Fails before fix: border-radius is 3px
    expect(src('src/app/globals.css')).not.toContain('border-radius: 3px')
    expect(src('src/app/globals.css')).toContain('border-radius: 2px')
  })
})

// -------------------------------------------------------------------------
// F-025: amber-700 hardcodes a colour; use text-severity-moderate-text token
// -------------------------------------------------------------------------

describe('severity moderate text uses design token', () => {
  const files = [
    'src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx',
    'src/app/page.tsx',
  ]
  for (const file of files) {
    it(`${file} uses text-severity-moderate-text, not text-amber-700`, () => {
      // Fails before fix: hardcoded amber-700 instead of the token
      expect(src(file)).not.toContain('text-amber-700')
      expect(src(file)).toContain('text-severity-moderate-text')
    })
  }
})

// -------------------------------------------------------------------------
// F-023: amber-600 lacks contrast on white; all amber text must be amber-700
// -------------------------------------------------------------------------

describe('AnalysisView — amber text contrast', () => {
  it('AnalysisView does not use text-amber-600 (insufficient contrast on white)', () => {
    // Fails before fix: checklistStatusStyle('gap') and the gaps count use amber-600
    expect(src('src/app/(app)/dashboard/documents/[id]/AnalysisView.tsx')).not.toContain('text-amber-600')
  })
})
