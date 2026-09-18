import { isSupabaseConfigured } from '@/lib/supabase/config'
import DocumentAnalysisClient from './DocumentAnalysisClient'

interface Props {
  params: { id: string }
}

export default async function DocumentPage({ params }: Props) {
  const { id } = params

  if (!isSupabaseConfigured) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Cannot load document</h1>
        <p className="text-slate-600 mt-2 leading-relaxed">
          Supabase is not configured, so saved documents are not available.
          Use the public upload page to analyze a contract without an account.
        </p>
      </div>
    )
  }

  return <DocumentAnalysisClient documentId={id} />
}
