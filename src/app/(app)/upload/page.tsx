'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import UploadForm from '@/components/UploadForm'

export default function UploadPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleParsed(doc: { title: string; text: string }) {
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
              title: doc.title,
              plain_text: doc.text,
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
        JSON.stringify({ title: doc.title, text: doc.text })
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Upload a contract</h1>
      <p className="text-slate-600 mt-1 leading-relaxed">
        Paste text or drop a file. Redline reads everything in your browser — nothing leaves your machine until you save.
      </p>

      {error && (
        <p className="mt-4 text-sm font-semibold text-error">
          {error}
        </p>
      )}

      <UploadForm
        onParsed={handleParsed}
        submitLabel={saving ? 'Saving...' : 'Save & Analyze'}
      />
    </div>
  )
}
