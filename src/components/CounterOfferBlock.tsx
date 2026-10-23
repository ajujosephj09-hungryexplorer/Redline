'use client'

import { useState, useCallback, useEffect } from 'react'

interface Props {
  label?: string
  initialText: string
  /** When provided, shown above the textarea in edit mode for cross-reference. */
  citation?: string
}

export default function CounterOfferBlock({ label = 'Counter-offer', initialText, citation }: Props) {
  const [copied, setCopied] = useState(false)
  const [counterText, setCounterText] = useState(initialText)
  const [editingCounter, setEditingCounter] = useState(false)
  const [draftValue, setDraftValue] = useState('')

  // F-065: warn before leaving during counter-offer editing
  useEffect(() => {
    if (!editingCounter) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [editingCounter])

  const copyCounter = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(counterText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, [counterText])

  function enterEdit() {
    setDraftValue(counterText)
    setEditingCounter(true)
  }

  function saveEdit() {
    const trimmed = draftValue.trim()
    if (trimmed) setCounterText(trimmed)
    setEditingCounter(false)
  }

  function cancelEdit() {
    setDraftValue('')
    setEditingCounter(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="uppercase text-xs tracking-wider font-semibold text-slate-500">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {!editingCounter && (
            <button
              onClick={enterEdit}
              className="text-xs font-semibold border rounded px-2 py-1.5 transition-colors border-slate-200 text-slate-500 hover:border-navy hover:text-navy"
            >
              Edit
            </button>
          )}
          <button
            onClick={copyCounter}
            className={`text-xs font-semibold border rounded px-2 py-1.5 transition-colors ${
              copied
                ? 'border-severity-clear text-severity-clear'
                : 'border-slate-200 text-slate-500 hover:border-navy hover:text-navy'
            }`}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      {editingCounter ? (
        <div>
          {/* F-054: show citation context so the user doesn't lose their place */}
          {citation && (
            <div className="mb-2" data-testid="edit-citation">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                From contract
              </p>
              <p className="text-xs font-mono text-slate-600 bg-slate-50 border-l-2 border-navy rounded-r p-2 leading-relaxed whitespace-pre-wrap">
                {citation}
              </p>
            </div>
          )}
          <textarea
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            rows={4}
            autoFocus
            aria-label="Edit counter-offer"
            onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit() }}
            className="w-full text-sm text-navy border border-slate-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-navy resize-y leading-relaxed"
          />
          <div className="flex items-center gap-3 mt-1.5">
            {/* F-056: Save disabled when textarea is empty or whitespace-only */}
            <button
              onClick={saveEdit}
              disabled={!draftValue.trim()}
              className="text-xs font-semibold text-navy hover:opacity-70 transition-opacity disabled:opacity-40"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="text-xs text-slate-400 hover:text-navy transition-colors"
            >
              Cancel
            </button>
            {!draftValue.trim() && (
              <button
                type="button"
                onClick={() => setDraftValue(counterText)}
                className="text-xs text-slate-400 hover:text-navy transition-colors underline underline-offset-2"
              >
                Restore original
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-counter-offer-bg border-l-4 border-severity-clear rounded-r-md p-3">
          <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">
            {counterText}
          </p>
        </div>
      )}
    </div>
  )
}
