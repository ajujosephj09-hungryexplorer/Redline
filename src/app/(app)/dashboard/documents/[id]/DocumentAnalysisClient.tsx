'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, plain_text')
        .eq('id', documentId)
        .single()

      if (cancelled) return

      if (fetchError || !data) {
        setError(fetchError?.message ?? 'Document not found.')
        setLoading(false)
        return
      }

      setDoc(data as Document)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
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
    <AnalysisView
      documentText={doc.plain_text}
      documentTitle={doc.title}
    />
  )
}
