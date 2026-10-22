'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchRules } from '@/lib/rules/actions'
import { fetchAnalysis, saveAnalysis } from '@/lib/analyses/actions'
import type { Rule } from '@/lib/rules/types'
import type { AnalysisResult } from '@/lib/analysis/types'
import AnalysisView from './AnalysisView'

interface Props {
  documentId: string
}

interface Document {
  id: string
  title: string
  plain_text: string
}

export default function DocumentAnalysisClient({ documentId }: Props) {
  const [doc, setDoc] = useState<Document | null>(null)
  const [rules, setRules] = useState<Rule[] | undefined>(undefined)
  const [cachedResult, setCachedResult] = useState<AnalysisResult | null>(null)
  const [analysedAt, setAnalysedAt] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()
      if (!supabase) {
        setError('Database connection is not available.')
        setLoading(false)
        return
      }

      const [docResult, userRules, cached] = await Promise.all([
        supabase
          .from('documents')
          .select('id, title, plain_text')
          .eq('id', documentId)
          .single(),
        fetchRules(supabase).catch(() => undefined),
        fetchAnalysis(supabase, documentId).catch((err) => {
          console.error('Failed to load cached analysis:', err instanceof Error ? err.message : err)
          return null
        }),
      ])

      if (cancelled) return

      if (docResult.error || !docResult.data) {
        setError(docResult.error?.message ?? 'Document not found.')
        setLoading(false)
        return
      }

      setDoc(docResult.data as Document)
      if (userRules && userRules.length > 0) setRules(userRules)
      if (cached) {
        setCachedResult(cached.result)
        setAnalysedAt(cached.createdAt)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [documentId])

  const handleAnalysisComplete = useCallback(async (result: AnalysisResult) => {
    const supabase = createClient()
    if (!supabase) return
    await saveAnalysis(supabase, documentId, result)
    setAnalysedAt(new Date().toISOString())
  }, [documentId])

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Loading document...</p>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Could not load document</h1>
        <p className="text-slate-600 mt-2 leading-relaxed">{error}</p>
      </div>
    )
  }

  return (
    <>
      <Link
        href="/library"
        className="inline-block text-xs text-slate-400 hover:text-navy transition-colors mb-4"
      >
        ← Your contracts
      </Link>
      <AnalysisView
        documentText={doc.plain_text}
        documentTitle={doc.title}
        rules={rules}
        initialResult={cachedResult ?? undefined}
        analysedAt={analysedAt}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </>
  )
}
