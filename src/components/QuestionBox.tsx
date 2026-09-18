'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { AnalysisResult } from '@/lib/analysis/types'

interface Props {
  documentText: string
  analysisResult: AnalysisResult
}

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export default function QuestionBox({ documentText, analysisResult }: Props) {
  const [input, setInput] = useState('')
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation, loading])

  const submit = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setError('')
    setInput('')

    const userTurn: ConversationTurn = { role: 'user', content: trimmed }
    setConversation((prev) => [...prev, userTurn])
    setLoading(true)

    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          documentText,
          analysisContext: analysisResult,
          conversationHistory: conversation,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status}).`)
      }

      const data: { answer: string } = await res.json()
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      )
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, documentText, analysisResult, conversation])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    },
    [submit]
  )

  return (
    <div className="mt-8 border border-slate-200 rounded-md bg-white shadow-sm">
      <div className="px-5 py-4">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-3">
          Ask about this contract
        </h2>

        {/* Conversation area */}
        {conversation.length > 0 && (
          <div
            ref={scrollRef}
            className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1"
          >
            {conversation.map((turn, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  {turn.role === 'user' ? 'You' : 'Redline'}
                </p>
                <p
                  className={`text-sm leading-relaxed ${
                    turn.role === 'user' ? 'text-navy' : 'text-slate-700'
                  }`}
                >
                  {turn.content}
                </p>
              </div>
            ))}

            {/* Loading indicator inside conversation flow */}
            {loading && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  Redline
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Reading the contract...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-severity-critical mb-3">{error}</p>
        )}

        {/* Input row */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What does the termination clause say?"
            disabled={loading}
            className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-2.5 text-navy placeholder:text-slate-400 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:opacity-60"
          />
          <button
            onClick={submit}
            disabled={loading || input.trim().length === 0}
            className="bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
