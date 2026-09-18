'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parseDocument, parseText } from '@/lib/parser'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

type Mode = 'paste' | 'upload'

interface ParsedDoc {
  title: string
  text: string
}

export default function UploadPage() {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('upload')
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ------------------------------------------------------------------
  // Parse handlers
  // ------------------------------------------------------------------

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

  // ------------------------------------------------------------------
  // Save handler
  // ------------------------------------------------------------------

  async function handleSave() {
    if (!parsed) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data, error: insertError } = await supabase
            .from('documents')
            .insert({
              user_id: user.id,
              title: parsed.title,
              plain_text: parsed.text,
            })
            .select('id')
            .single()

          if (insertError) throw insertError
          router.push(`/dashboard/documents/${data.id}`)
          return
        }
      }

      // Fallback: save to sessionStorage and go to /analyze
      sessionStorage.setItem(
        'redline_pending_document',
        JSON.stringify({ title: parsed.title, text: parsed.text })
      )
      router.push('/analyze')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save the document. Try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ------------------------------------------------------------------
  // Drag & drop
  // ------------------------------------------------------------------

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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const tabClass = (t: Mode) =>
    `px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
      mode === t
        ? 'bg-white text-navy border border-b-0 border-slate-200'
        : 'text-slate-500 hover:text-navy'
    }`

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Upload a contract</h1>
      <p className="text-slate-600 mt-1 leading-relaxed">
        Paste text or drop a file. Redline reads everything in your browser — nothing leaves your machine until you save.
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
        <p className="mt-4 text-sm font-semibold text-navy">
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
            onClick={handleSave}
            disabled={saving}
            className="mt-4 bg-navy text-white font-semibold text-sm px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Analyze'}
          </button>
        </div>
      )}
    </div>
  )
}
