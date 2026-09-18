'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AnalysisView from '@/app/(app)/dashboard/documents/[id]/AnalysisView'
import { getLocalRules } from '@/lib/rules/local'

interface PendingDoc {
  title: string
  text: string
}

export default function AnalyzePage() {
  const router = useRouter()
  const [doc, setDoc] = useState<PendingDoc | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('redline_pending_document')
    if (!raw) {
      setMissing(true)
      return
    }
    try {
      const parsed: PendingDoc = JSON.parse(raw)
      if (!parsed.title || !parsed.text) {
        setMissing(true)
        return
      }
      setDoc(parsed)
    } catch {
      setMissing(true)
    }
  }, [])

  if (missing) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-navy">Nothing to analyze</h1>
        <p className="text-slate-600 mt-2 leading-relaxed">
          Upload or paste a contract first so Redline has something to work with.
        </p>
        <button
          onClick={() => router.push('/upload')}
          className="mt-6 bg-navy text-white font-semibold text-sm px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors"
        >
          Go to Upload
        </button>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AnalysisView
        documentText={doc.text}
        documentTitle={doc.title}
        rules={getLocalRules()}
      />
    </div>
  )
}
