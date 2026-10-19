'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import AnalysisView from '@/app/(app)/dashboard/documents/[id]/AnalysisView'
import { getLocalRules } from '@/lib/rules/local'
import { parseDocument, parseText } from '@/lib/parser'

type UploadMode = 'upload' | 'paste'

interface PendingDoc {
  title: string
  text: string
}

function AnalyzeHeader() {
  return (
    <nav className="border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-14">
        <Link
          href="/"
          className="text-navy font-bold text-base tracking-tight"
        >
          Redline
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-navy transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-navy text-white font-semibold px-4 py-1.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  )
}

function InlineUploadForm({ onAnalyze }: { onAnalyze: (doc: PendingDoc) => void }) {
  const [mode, setMode] = useState<UploadMode>('upload')
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<PendingDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleParse() {
    setError(null)
    setParsed(null)
    setParsing(true)

    try {
      if (mode === 'paste') {
        const result = parseText(pasteText, pasteTitle)
        setParsed(result)
      } else if (selectedFile) {
        const result = await parseDocument(selectedFile)
        setParsed(result)
      } else {
        setError('Pick a file first.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while reading the file.')
    } finally {
      setParsing(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setParsed(null)
      setError(null)
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setParsed(null)
    setError(null)
  }

  const tabClass = (t: UploadMode) =>
    `px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
      mode === t
        ? 'bg-white text-navy border border-b-0 border-slate-200'
        : 'text-slate-500 hover:text-navy'
    }`

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Upload a contract</h1>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        Drop a file or paste text. Redline reads it in your browser and flags what matters.
      </p>

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 border-b border-slate-200">
        <button className={tabClass('upload')} onClick={() => { setMode('upload'); setParsed(null); setError(null) }}>
          Upload file
        </button>
        <button className={tabClass('paste')} onClick={() => { setMode('paste'); setParsed(null); setError(null) }}>
          Paste text
        </button>
      </div>

      <div className="mt-4">
        {/* ---- Upload mode ---- */}
        {mode === 'upload' && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-navy bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <p className="text-sm text-slate-600">
                {selectedFile
                  ? selectedFile.name
                  : 'Drop a .txt, .pdf, or .docx file here, or click to browse'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {selectedFile && !parsed && (
              <button
                onClick={handleParse}
                disabled={parsing}
                className="mt-4 bg-navy text-white font-semibold text-sm px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {parsing ? 'Reading...' : 'Read file'}
              </button>
            )}
          </div>
        )}

        {/* ---- Paste mode ---- */}
        {mode === 'paste' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="paste-title" className="block text-sm font-medium text-navy mb-1">
                Title (optional)
              </label>
              <input
                id="paste-title"
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="e.g. Freelance agreement with Acme"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label htmlFor="paste-text" className="block text-sm font-medium text-navy mb-1">
                Contract text
              </label>
              <textarea
                id="paste-text"
                rows={12}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste the full contract text here..."
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy resize-y"
              />
            </div>
            {!parsed && (
              <button
                onClick={handleParse}
                disabled={parsing}
                className="bg-navy text-white font-semibold text-sm px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {parsing ? 'Reading...' : 'Read text'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---- Error ---- */}
      {error && (
        <p className="mt-4 text-sm font-semibold text-severity-critical">
          {error}
        </p>
      )}

      {/* ---- Preview ---- */}
      {parsed && (
        <div className="mt-6 border border-slate-200 rounded-md p-5">
          <h2 className="text-lg font-bold text-navy">{parsed.title}</h2>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {parsed.text.length > 500
              ? parsed.text.slice(0, 500) + '...'
              : parsed.text}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {parsed.text.length.toLocaleString()} characters total
          </p>

          <button
            onClick={() => onAnalyze({ title: parsed.title, text: parsed.text })}
            className="mt-4 bg-navy text-white font-semibold text-sm px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            Analyze
          </button>
        </div>
      )}
    </div>
  )
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

  if (missing) {
    return (
      <div className="min-h-screen">
        <AnalyzeHeader />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <InlineUploadForm onAnalyze={handleAnalyze} />
        </div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen">
        <AnalyzeHeader />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AnalyzeHeader />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnalysisView
          documentText={doc.text}
          documentTitle={doc.title}
          rules={getLocalRules()}
        />
      </div>
    </div>
  )
}
