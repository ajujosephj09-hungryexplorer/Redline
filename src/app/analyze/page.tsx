'use client'

import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'
import AnalysisView from '@/app/(app)/dashboard/documents/[id]/AnalysisView'
import UploadForm from '@/components/UploadForm'
import { getLocalRules } from '@/lib/rules/local'

interface PendingDoc {
  title: string
  text: string
}

export default function AnalyzePage() {
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

  function handleAnalyze(newDoc: PendingDoc) {
    setDoc(newDoc)
    setMissing(false)
  }

  function handleReset() {
    sessionStorage.removeItem('redline_pending_document')
    setDoc(null)
    setMissing(true)
  }

  if (missing) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-navy">Upload a contract</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Drop a file or paste text. Redline reads it in your browser and flags what matters.
          </p>
          <UploadForm onParsed={handleAnalyze} submitLabel="Analyze" />
        </div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p role="status" className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnalysisView
          documentText={doc.text}
          documentTitle={doc.title}
          rules={getLocalRules()}
          isAnonymous
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
