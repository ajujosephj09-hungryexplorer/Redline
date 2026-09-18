'use client'

import { useEffect, useState, useCallback } from 'react'
import type { AnalysisResult, RiskFlag, Severity } from '@/lib/analysis/types'
import type { Rule } from '@/lib/rules/types'
import { getLocalRules } from '@/lib/rules/local'

interface Props {
  documentText: string
  documentTitle: string
  rules?: Rule[]
}

// ---------------------------------------------------------------------------
// Severity styling
// ---------------------------------------------------------------------------

function severityPill(severity: Severity) {
  switch (severity) {
    case 'critical':
      return 'bg-severity-critical text-white text-xs font-semibold px-2.5 py-0.5 rounded-full'
    case 'moderate':
      return 'bg-severity-moderate text-navy text-xs font-semibold px-2.5 py-0.5 rounded-full'
    case 'low':
      return 'text-severity-clear text-xs font-semibold'
  }
}

function severityLabel(severity: Severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

// ---------------------------------------------------------------------------
// FindingRow — expandable risk flag
// ---------------------------------------------------------------------------

function FindingRow({ flag }: { flag: RiskFlag }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyCounter = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(flag.counterOffer)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, [flag.counterOffer])

  return (
    <div className="border border-slate-200 rounded-md bg-white shadow-sm">
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors rounded-md"
      >
        <span className={severityPill(flag.severity)}>
          {severityLabel(flag.severity)}
        </span>
        <span className="text-sm font-semibold text-navy flex-1 min-w-0">
          {flag.ruleName}
        </span>
        <span className="text-sm text-slate-600 truncate max-w-[50%] hidden sm:block">
          {flag.problem}
        </span>
        <svg
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
            {/* Problem (visible on mobile since truncated above) */}
            <p className="text-sm text-slate-700 sm:hidden">{flag.problem}</p>

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

            {/* Counter-offer block */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="uppercase text-xs tracking-wider font-semibold text-slate-500">
                  Counter-offer
                </p>
                <button
                  onClick={copyCounter}
                  className="text-xs text-slate-500 hover:text-navy transition-colors"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-emerald-50 border-l-4 border-green-600 rounded-r-md p-3">
                <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">
                  {flag.counterOffer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function AnalysisView({ documentText, documentTitle, rules: externalRules }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      setStatus('loading')
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

        setResult(data)
        setStatus('done')
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
  }, [documentText, externalRules])

  // ---- Loading ----
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-navy">{documentTitle}</h1>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600">
            Reading the contract and checking each clause...
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
        <div className="mt-6 border border-slate-200 rounded-md p-5">
          <p className="text-sm font-semibold text-navy">Analysis could not be completed</p>
          <p className="text-sm text-slate-600 mt-1">{errorMsg}</p>
        </div>
      </div>
    )
  }

  // ---- Results ----
  const flags = result?.flags ?? []
  const criticalCount = flags.filter((f) => f.severity === 'critical').length
  const moderateCount = flags.filter((f) => f.severity === 'moderate').length

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-navy">{documentTitle}</h1>

      {/* Summary card */}
      <div className="mt-6 bg-white border border-slate-200 rounded-md shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Summary
        </h2>
        <p className="text-base text-navy leading-relaxed">
          {result?.summary}
        </p>
      </div>

      {/* Stats bar */}
      {flags.length > 0 && (
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-slate-600">
            {flags.length} {flags.length === 1 ? 'finding' : 'findings'}
          </span>
          {criticalCount > 0 && (
            <span className="text-severity-critical font-semibold">
              {criticalCount} critical
            </span>
          )}
          {moderateCount > 0 && (
            <span className="text-severity-moderate font-semibold">
              {moderateCount} moderate
            </span>
          )}
        </div>
      )}

      {/* Findings */}
      <div className="mt-4 space-y-3">
        {flags.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
            <p className="text-sm text-severity-clear font-semibold">
              No issues found
            </p>
            <p className="text-sm text-slate-600 mt-1">
              The contract looks fair based on the rules that were checked.
            </p>
          </div>
        ) : (
          flags.map((flag, i) => <FindingRow key={i} flag={flag} />)
        )}
      </div>
    </div>
  )
}
