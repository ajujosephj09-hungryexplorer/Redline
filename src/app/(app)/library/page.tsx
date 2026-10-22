'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { deriveTitle, formatUploadDate } from '@/lib/documents/format'

interface DocumentRow {
  id: string
  title: string
  plain_text: string
  created_at: string
  has_analysis: boolean
}

export default function LibraryPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      const supabase = createClient()
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch documents with a flag indicating whether an analysis exists
      const { data: docs, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, plain_text, created_at, analyses(id)')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (fetchError) {
        setError('Could not load your documents. Try refreshing the page.')
        setLoading(false)
        return
      }

      const rows: DocumentRow[] = (docs ?? []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        title: d.title as string,
        plain_text: d.plain_text as string,
        created_at: d.created_at as string,
        has_analysis: Array.isArray(d.analyses) && d.analyses.length > 0,
      }))

      setDocuments(rows)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  async function handleDelete(docId: string) {
    setDeletingId(docId)
    setError(null)

    const supabase = createClient()
    if (!supabase) {
      setDeletingId(null)
      return
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)

    if (deleteError) {
      setError('Could not delete the document. Try again.')
      setDeletingId(null)
      setConfirmId(null)
      return
    }

    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    setDeletingId(null)
    setConfirmId(null)
  }

  // Not configured: show sign-in prompt
  if (!isSupabaseConfigured) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Your contracts</h1>
        <p className="text-slate-600 mt-2 leading-relaxed">
          Sign in to save and revisit your contracts.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 bg-navy text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-navy transition-colors"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Your contracts</h1>
        <div className="mt-6 border border-slate-200 rounded-md divide-y divide-slate-200">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="px-5 py-3.5 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-2/5" />
                <div className="h-2.5 bg-slate-200 rounded w-1/4" />
              </div>
              <div className="flex-shrink-0">
                <div className="h-2.5 bg-slate-200 rounded w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && documents.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Your contracts</h1>
        <p className="text-sm text-navy font-semibold mt-2">{error}</p>
      </div>
    )
  }

  // Empty state — F-057: 3-step guide for first-timers
  if (documents.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Your contracts</h1>
        <ol className="mt-4 space-y-2" data-testid="onboarding-steps">
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">1</span>
            <p className="text-sm text-slate-600 pt-0.5">Upload your contract</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">2</span>
            <p className="text-sm text-slate-600 pt-0.5">We check 6 risk areas</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">3</span>
            <p className="text-sm text-slate-600 pt-0.5">You get exact citations and counter-offers</p>
          </li>
        </ol>
        <Link
          href="/upload"
          className="inline-block mt-6 bg-navy text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-navy transition-colors"
        >
          Upload a contract
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Your contracts</h1>
        <Link
          href="/upload"
          className="text-sm text-slate-600 hover:text-navy transition-colors"
        >
          Upload new
        </Link>
      </div>

      {error && (
        <p className="text-sm text-navy font-semibold mt-3">{error}</p>
      )}

      <div className="mt-6 border border-slate-200 rounded-md divide-y divide-slate-200">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="px-5 py-3.5 flex items-center justify-between gap-4"
          >
            <Link
              href={`/dashboard/documents/${doc.id}`}
              className="min-w-0 flex-1 group"
            >
              <span className="block text-sm font-semibold text-navy truncate group-hover:underline">
                {deriveTitle(doc.title, doc.plain_text)}
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">
                {formatUploadDate(doc.created_at)}
                {doc.has_analysis && (
                  <span className="ml-2 text-slate-400">Analyzed</span>
                )}
              </span>
            </Link>

            <div className="flex-shrink-0">
              {confirmId === doc.id ? (
                <span className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="text-xs font-semibold bg-severity-critical text-white px-2 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {deletingId === doc.id ? 'Deleting...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-slate-400 hover:text-navy"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmId(doc.id)}
                  className="text-xs text-slate-400 hover:text-navy transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
