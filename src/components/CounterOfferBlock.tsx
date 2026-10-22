'use client'

import { useState, useRef, useCallback } from 'react'

interface Props {
  label?: string
  initialText: string
}

export default function CounterOfferBlock({ label = 'Counter-offer', initialText }: Props) {
  const [copied, setCopied] = useState(false)
  const [counterText, setCounterText] = useState(initialText)
  const [editingCounter, setEditingCounter] = useState(false)
  const counterRef = useRef<HTMLTextAreaElement>(null)

  const copyCounter = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(counterText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, [counterText])

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="uppercase text-xs tracking-wider font-semibold text-slate-500">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {!editingCounter && (
            <button
              onClick={() => setEditingCounter(true)}
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
          <textarea
            ref={counterRef}
            defaultValue={counterText}
            rows={4}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') setEditingCounter(false) }}
            className="w-full text-sm text-navy border border-slate-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-navy resize-y leading-relaxed"
          />
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => {
                const trimmed = counterRef.current?.value.trim()
                if (trimmed) setCounterText(trimmed)
                setEditingCounter(false)
              }}
              className="text-xs font-semibold text-navy hover:opacity-70 transition-opacity"
            >
              Save
            </button>
            <button
              onClick={() => setEditingCounter(false)}
              className="text-xs text-slate-400 hover:text-navy transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-l-4 border-severity-clear rounded-r-md p-3">
          <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">
            {counterText}
          </p>
        </div>
      )}
    </div>
  )
}
