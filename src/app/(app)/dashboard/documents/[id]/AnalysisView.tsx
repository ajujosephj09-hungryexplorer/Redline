'use client'

import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import type { AnalysisResult, RiskFlag, Gap, ChecklistItem, Severity } from '@/lib/analysis/types'
import type { Rule } from '@/lib/rules/types'
import { getLocalRules } from '@/lib/rules/local'
import QuestionBox from '@/components/QuestionBox'
import CounterOfferBlock from '@/components/CounterOfferBlock'

interface Props {
  documentText: string
  documentTitle: string
  rules?: Rule[]
  isAnonymous?: boolean
  onReset?: () => void
  initialResult?: AnalysisResult
  analysedAt?: string
  onAnalysisComplete?: (result: AnalysisResult) => void
  /** Set by parent when rule set has changed since this analysis was saved. */
  rulesChangedSinceAnalysis?: boolean
  /** Save status propagated from parent (DocumentAnalysisClient). */
  saveStatus?: 'saving' | 'saved' | 'failed'
  onRetrySave?: () => void
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Summary renderer — parse **Label:** sections into scannable blocks
// ---------------------------------------------------------------------------

function SummaryBody({ text }: { text: string }) {
  // Split on **Label:** patterns to extract structured sections
  const sectionPattern = /\*\*([^*]+?):\*\*/g
  const parts: Array<{ label: string; body: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = sectionPattern.exec(text)) !== null) {
    // Any text before the first label is the intro
    if (parts.length === 0 && match.index > 0) {
      const intro = text.slice(0, match.index).trim()
      if (intro) parts.push({ label: '', body: intro })
    } else if (parts.length > 0) {
      // Close previous section
      parts[parts.length - 1].body = text.slice(lastIndex, match.index).trim()
    }
    parts.push({ label: match[1].trim(), body: '' })
    lastIndex = match.index + match[0].length
  }

  // Close last section
  if (parts.length > 0) {
    parts[parts.length - 1].body = text.slice(lastIndex).trim()
  }

  // No **Label:** patterns found — render as paragraphs split on double newlines
  if (parts.length === 0) {
    const paragraphs = text.split(/\n\n+/).filter(Boolean)
    return (
      <div className="space-y-3">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 48)} className="text-sm text-navy leading-relaxed">{p}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {parts.map((section) => (
        <div key={section.label || section.body.slice(0, 48)}>
          {section.label && (
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
              {section.label}
            </p>
          )}
          <p className="text-sm text-navy leading-relaxed">{section.body}</p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Severity styling
// ---------------------------------------------------------------------------

function severityPill(severity: Severity) {
  switch (severity) {
    case 'critical':
      return 'bg-severity-critical text-white text-xs font-semibold px-2.5 py-0.5 rounded-sm'
    case 'moderate':
      return 'bg-severity-moderate text-navy text-xs font-semibold px-2.5 py-0.5 rounded-sm'
    case 'low':
      return 'text-slate-600 text-xs font-semibold'
  }
}

function severityLabel(severity: Severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

// ---------------------------------------------------------------------------
// FindingRow — expandable risk flag
// ---------------------------------------------------------------------------

const FindingRow = memo(function FindingRow({ flag, open, onToggle }: { flag: RiskFlag; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-slate-200 rounded-md bg-white shadow-sm">
      {/* Header row — F-074: pill + title + chevron only */}
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`${open ? 'Collapse' : 'Expand'} ${flag.ruleName}`}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors rounded-md"
      >
        <span className={severityPill(flag.severity)}>
          {severityLabel(flag.severity)}
        </span>
        <span className="text-sm font-semibold text-navy flex-1 min-w-0">
          {flag.ruleName}
        </span>
        <svg
          aria-hidden="true"
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ease-out ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable detail */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-3">
            {/* F-075: What is wrong — problem description */}
            <div>
              <p className="uppercase text-xs tracking-wider font-semibold text-slate-500 mb-1.5">
                What is wrong
              </p>
              <p className="text-sm text-navy leading-relaxed">
                {flag.problem}
              </p>
            </div>

            {/* Citation block */}
            <div>
              <p className="uppercase text-xs tracking-wider font-semibold text-slate-500 mb-1.5">
                Cited from your contract
              </p>
              <div className="bg-slate-50 border-l-4 border-navy rounded-r-md p-3">
                <p className="text-sm font-mono text-navy leading-relaxed whitespace-pre-wrap">
                  {flag.citation}
                </p>
              </div>
            </div>

            {/* Counter-offer block — F-054: pass citation for in-edit reference */}
            <CounterOfferBlock initialText={flag.counterOffer} citation={flag.citation} />
          </div>
        </div>
      </div>
    </div>
  )
})

// ---------------------------------------------------------------------------
// GapCard — a missing clause
// ---------------------------------------------------------------------------

function GapCard({ gap }: { gap: Gap }) {
  return (
    <div data-testid="gap-card" className="bg-white border border-slate-200 rounded-md shadow-sm">
      <div className="px-4 py-3 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="bg-severity-moderate text-navy text-xs font-semibold px-2.5 py-0.5 rounded-sm">
            Missing
          </span>
          <span className="text-sm font-semibold text-navy">
            {gap.ruleName}
          </span>
        </div>

        {/* Explanation */}
        <p className="text-sm text-slate-700 leading-relaxed">
          {gap.explanation}
        </p>

        {/* Suggested language */}
        <CounterOfferBlock label="Suggested language" initialText={gap.counterOffer} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// YourResponseCard — F-053: copy all counter-offers as negotiation template
// ---------------------------------------------------------------------------

function YourResponseCard({ flags, criticalCount, moderateCount }: { flags: RiskFlag[]; criticalCount: number; moderateCount: number }) {
  const [copied, setCopied] = useState(false)

  async function copyAll() {
    const text = flags
      .map((f) => `${f.ruleName}\n${f.counterOffer}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }

  const parts: string[] = []
  if (criticalCount > 0) parts.push(`${criticalCount} critical`)
  if (moderateCount > 0) parts.push(`${moderateCount} moderate`)
  const issueSummary = parts.join(' and ')
  const totalOther = flags.length - criticalCount - moderateCount
  const otherLabel = totalOther > 0 ? ` and ${totalOther} low` : ''

  return (
    <div className="mt-6 border border-slate-200 rounded-md bg-white shadow-sm p-5">
      <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Your response
      </h2>
      <p className="text-sm text-slate-700 mb-3">
        You have {issueSummary}{otherLabel} {flags.length === 1 ? 'issue' : 'issues'} to raise.
        Copy all counter-offers to build your negotiation reply.
      </p>
      <button
        onClick={copyAll}
        className={`text-xs font-semibold border rounded px-3 py-1.5 transition-colors ${
          copied
            ? 'border-severity-clear text-severity-clear'
            : 'border-slate-200 text-slate-500 hover:border-navy hover:text-navy'
        }`}
      >
        {copied ? 'Copied' : 'Copy all counter-offers'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RulesChecklist — what was checked
// ---------------------------------------------------------------------------

function checklistStatusStyle(status: ChecklistItem['status']) {
  switch (status) {
    case 'flagged':
      return 'text-severity-critical'
    case 'gap':
      return 'text-severity-moderate-text'
    case 'clean':
      return 'text-severity-clear'
  }
}

function checklistStatusLabel(status: ChecklistItem['status']) {
  switch (status) {
    case 'flagged':
      return 'Flagged'
    case 'gap':
      return 'Missing'
    case 'clean':
      return 'Clear'
  }
}

function RulesChecklist({ items, isAnonymous }: { items: ChecklistItem[]; isAnonymous?: boolean }) {
  if (items.length === 0) return null

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500">
          What was checked
        </h2>
        {!isAnonymous && (
          <a href="/rules" className="text-xs text-slate-400 hover:text-navy transition-colors">
            Edit rules →
          </a>
        )}
      </div>
      <div className="border border-slate-200 rounded-md divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.ruleName} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm font-semibold text-navy">{item.ruleName}</span>
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${checklistStatusStyle(item.status)}`}
            >
              {checklistStatusLabel(item.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Status = 'idle' | 'loading' | 'done' | 'error'

const LOADING_MESSAGES = [
  'Reading the contract...',
  'Checking each clause against your rules...',
  'Identifying risks and missing protections...',
  'Drafting counter offers for flagged clauses...',
  'Wrapping up the analysis...',
  'Still working, this usually takes 15 to 30 seconds...',
]

export default function AnalysisView({ documentText, documentTitle, rules: externalRules, isAnonymous, onReset, initialResult, analysedAt, onAnalysisComplete, rulesChangedSinceAnalysis, saveStatus, onRetrySave }: Props) {
  const [status, setStatus] = useState<Status>(() => initialResult ? 'done' : 'idle')
  const [result, setResult] = useState<AnalysisResult | null>(() => initialResult ?? null)
  const [isFromCache, setIsFromCache] = useState(() => !!initialResult)
  const [errorMsg, setErrorMsg] = useState('')
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [openFlagIndices, setOpenFlagIndices] = useState<Set<number>>(new Set())

  // F-065: warn before leaving during analysis
  useEffect(() => {
    if (status !== 'loading') return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [status])

  useEffect(() => {
    if (status !== 'loading') {
      setLoadingMsgIndex(0)
      return
    }

    // Last message sticks — don't cycle past it
    if (loadingMsgIndex >= LOADING_MESSAGES.length - 1) return

    const timer = setTimeout(() => {
      setLoadingMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1))
    }, 4000)

    return () => clearTimeout(timer)
  }, [status, loadingMsgIndex, LOADING_MESSAGES.length])

  useEffect(() => {
    // Use the cached result on first load; only re-run if the user requests it
    if (initialResult && retryCount === 0) return

    let cancelled = false

    async function run() {
      setStatus('loading')
      setIsFromCache(false)
      setErrorMsg('')

      const rules = externalRules ?? getLocalRules()

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: documentText, rules }),
        })

        if (cancelled) return

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(
            data.error || `Analysis request failed (${res.status}).`
          )
        }

        const data: AnalysisResult = await res.json()
        if (cancelled) return

        // F-055: attach rule fingerprint so parent can detect staleness later
        const ruleFingerprint = rules
          .filter((r) => r.enabled)
          .map((r) => r.id)
          .sort()
        const resultWithFingerprint: AnalysisResult = { ...data, ruleFingerprint }

        setResult(resultWithFingerprint)
        setStatus('done')
        onAnalysisComplete?.(resultWithFingerprint)
      } catch (err) {
        if (cancelled) return
        setErrorMsg(
          err instanceof Error ? err.message : 'Something went wrong during analysis.'
        )
        setStatus('error')
      }
    }

    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentText, externalRules, retryCount])

  // Auto-expand first critical finding when result loads
  useEffect(() => {
    if (!result) return
    if (result.flags.length > 0 && result.flags[0].severity === 'critical') {
      setOpenFlagIndices(new Set([0]))
    } else {
      setOpenFlagIndices(new Set())
    }
  }, [result])

  const toggleFlag = useCallback((index: number) => {
    setOpenFlagIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  // These must stay above the early returns so hooks are always called in the
  // same order (React Rules of Hooks).
  const allFlags = result?.flags ?? []
  const criticalFlags = useMemo(
    () => allFlags.map((f, i) => ({ flag: f, index: i })).filter(({ flag }) => flag.severity === 'critical'),
    [allFlags]
  )
  const moderateFlags = useMemo(
    () => allFlags.map((f, i) => ({ flag: f, index: i })).filter(({ flag }) => flag.severity === 'moderate'),
    [allFlags]
  )
  const lowFlags = useMemo(
    () => allFlags.map((f, i) => ({ flag: f, index: i })).filter(({ flag }) => flag.severity === 'low'),
    [allFlags]
  )

  // ---- Loading ----
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="max-w-3xl mx-auto" role="status" aria-live="polite">
        <h1 className="text-2xl font-bold text-navy">{documentTitle}</h1>
        <div className="mt-6 flex items-center gap-3">
          <div aria-hidden="true" className="h-5 w-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          <p
            key={loadingMsgIndex}
            className="text-sm text-slate-600 animate-fadeIn"
          >
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
        </div>
      </div>
    )
  }

  // ---- Error ----
  if (status === 'error') {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-navy">{documentTitle}</h1>
        <div className="mt-6 border border-slate-200 rounded-md p-5" role="alert" aria-live="assertive">
          <p className="text-sm font-semibold text-navy">Analysis could not be completed</p>
          <p className="text-sm text-slate-600 mt-1">{errorMsg}</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="mt-4 text-sm font-semibold text-navy underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ---- Results ----
  const flags = allFlags
  const gaps = result?.gaps ?? []
  const checklist = result?.checklist ?? []
  const criticalCount = flags.filter((f) => f.severity === 'critical').length
  const moderateCount = flags.filter((f) => f.severity === 'moderate').length
  const isClean = flags.length === 0 && gaps.length === 0

  function expandAll() {
    setOpenFlagIndices(new Set(flags.map((_, i) => i)))
  }

  function collapseAll() {
    setOpenFlagIndices(new Set())
  }

  const allExpanded = flags.length > 0 && openFlagIndices.size === flags.length

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-navy">{documentTitle}</h1>
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-navy transition-colors mt-1"
        >
          ← Analyze a different contract
        </button>
      )}

      {/* Cache status line — shown for all saved documents, not anonymous */}
      {status === 'done' && !isAnonymous && (
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {isFromCache && analysedAt && (
            <span className="text-xs text-slate-400">
              Analyzed {formatRelativeDate(analysedAt)}
            </span>
          )}
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="text-xs text-slate-400 hover:text-navy underline underline-offset-2 transition-colors"
          >
            Re-analyze
          </button>
          {/* F-050: save status */}
          {saveStatus === 'saving' && (
            <span className="text-xs text-slate-400">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-slate-400">Saved</span>
          )}
          {saveStatus === 'failed' && (
            <span className="text-xs text-slate-400">
              Failed to save.{' '}
              <button
                onClick={onRetrySave}
                className="underline underline-offset-2 hover:text-navy transition-colors"
              >
                Retry
              </button>
            </span>
          )}
        </div>
      )}

      {/* Summary card — F-073: structured sections instead of text blob */}
      <div className="mt-6 bg-white border border-slate-200 rounded-md shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-3">
          Summary
        </h2>
        {result?.summary && <SummaryBody text={result.summary} />}
      </div>

      {/* F-055: Stale-analysis banner */}
      {rulesChangedSinceAnalysis && (
        <div className="mt-3 border border-slate-200 bg-slate-50 rounded-md px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-700">
            Your rules changed since this analysis.
          </p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="text-sm font-semibold text-navy underline underline-offset-2 shrink-0 hover:opacity-70 transition-opacity"
          >
            Re-analyze
          </button>
        </div>
      )}

      {/* Anonymous save banner — shown immediately after summary so it is seen before findings */}
      {isAnonymous && (
        <div className="mt-3 flex items-center justify-between gap-4 border border-slate-200 rounded-md px-4 py-3 bg-white">
          <p className="text-sm text-slate-600">
            This analysis disappears when you close the tab.
          </p>
          <a
            href="/signup"
            className="text-sm font-semibold text-navy underline underline-offset-2 hover:opacity-70 transition-opacity shrink-0"
          >
            Save it →
          </a>
        </div>
      )}

      {/* Guidance for users with findings */}
      {!isClean && (
        <>
          <p className="mt-3 text-sm text-slate-500">
            Expand each finding below to see the exact contract language and a counter-offer you can send back.
          </p>
          <div className="flex items-center gap-4 mt-1">
            {/* F-051: jump link when critical findings are present */}
            {criticalFlags.length > 0 && (
              <a
                href="#critical-findings"
                className="text-xs font-semibold text-severity-critical hover:opacity-70 transition-opacity"
              >
                Jump to critical findings ↓
              </a>
            )}
            <a
              href="#question-box"
              className="text-xs text-slate-400 hover:text-navy transition-colors"
            >
              Skip to questions ↓
            </a>
          </div>
        </>
      )}

      {/* Clean contract message */}
      {isClean && (
        <div className="mt-4 bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <p className="text-sm text-severity-clear font-semibold flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 7l3.5 3.5 5.5-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            No issues found
          </p>
          <p className="text-sm text-slate-600 mt-1">
            The contract looks fair based on the rules that were checked.
          </p>
        </div>
      )}

      {/* Stats bar + expand controls */}
      {(flags.length > 0 || gaps.length > 0) && (
        <div className="mt-4 flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {flags.length > 0 && (
              <span className="text-slate-600">
                {flags.length} {flags.length === 1 ? 'finding' : 'findings'}
              </span>
            )}
            {criticalCount > 0 && (
              <span className="text-severity-critical font-semibold">{criticalCount} critical</span>
            )}
            {moderateCount > 0 && (
              <span className="text-severity-moderate-text font-semibold">{moderateCount} moderate</span>
            )}
            {gaps.length > 0 && (
              <span className="text-severity-moderate-text font-semibold">{gaps.length} missing</span>
            )}
          </div>
          {flags.length > 1 && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <button
                onClick={expandAll}
                disabled={allExpanded}
                className="hover:text-navy transition-colors disabled:opacity-40"
              >
                Expand all
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={collapseAll}
                disabled={openFlagIndices.size === 0}
                className="hover:text-navy transition-colors disabled:opacity-40"
              >
                Collapse all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Severity key */}
      {flags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-severity-critical shrink-0" />
            <span><strong className="font-semibold">Critical</strong> — could cost you money or rights</span>
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-severity-moderate shrink-0" />
            <span><strong className="font-semibold">Moderate</strong> — worth pushing back on</span>
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-severity-clear shrink-0" />
            <span><strong className="font-semibold">Low</strong> — flagged but not urgent</span>
          </span>
        </div>
      )}

      {/* Grouped findings */}
      {flags.length > 0 && (
        <div className="mt-4 space-y-5">
          {criticalFlags.length > 0 && (
            <div id="critical-findings">
              <p className="text-xs font-semibold uppercase tracking-wider text-severity-critical mb-2">
                Critical
              </p>
              <div className="space-y-3">
                {criticalFlags.map(({ flag, index }) => (
                  <FindingRow
                    key={index}
                    flag={flag}
                    open={openFlagIndices.has(index)}
                    onToggle={() => toggleFlag(index)}
                  />
                ))}
              </div>
            </div>
          )}
          {moderateFlags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-severity-moderate-text mb-2">
                Moderate
              </p>
              <div className="space-y-3">
                {moderateFlags.map(({ flag, index }) => (
                  <FindingRow
                    key={index}
                    flag={flag}
                    open={openFlagIndices.has(index)}
                    onToggle={() => toggleFlag(index)}
                  />
                ))}
              </div>
            </div>
          )}
          {lowFlags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Low
              </p>
              <div className="space-y-3">
                {lowFlags.map(({ flag, index }) => (
                  <FindingRow
                    key={index}
                    flag={flag}
                    open={openFlagIndices.has(index)}
                    onToggle={() => toggleFlag(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <hr className="border-t border-slate-200 my-8" />

      {/* Gaps */}
      {gaps.length > 0 && (
        <div>
          <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Missing from this contract
          </h2>
          <p className="text-xs text-slate-500 mb-3">Protections that aren't in this contract but should be.</p>
          <div className="space-y-3">
            {gaps.map((gap) => <GapCard key={gap.ruleName} gap={gap} />)}
          </div>
        </div>
      )}

      {/* F-053: "Your response" card — copy all counter-offers as a negotiation template */}
      {flags.length > 0 && (
        <YourResponseCard flags={flags} criticalCount={criticalCount} moderateCount={moderateCount} />
      )}

      <hr className="border-t border-slate-200 my-8" />

      {/* Question box — ask about this contract */}
      {result && (
        <div id="question-box">
          <QuestionBox documentText={documentText} analysisResult={result} />
        </div>
      )}

      {/* Rules checklist */}
      <RulesChecklist items={checklist} isAnonymous={isAnonymous} />
    </div>
  )
}
