import type { SupabaseClient } from '@supabase/supabase-js'
import type { AnalysisResult } from '@/lib/analysis/types'

/**
 * Fetch the most recent cached analysis for a document.
 * Returns null if no analysis has been stored yet.
 */
export async function fetchAnalysis(
  supabase: SupabaseClient,
  documentId: string
): Promise<{ result: AnalysisResult; createdAt: string } | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('result, created_at')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return { result: data.result as AnalysisResult, createdAt: data.created_at }
}

/**
 * Save a completed analysis result for a document.
 * Silently skips if not authenticated; does not throw on save failure.
 */
export async function saveAnalysis(
  supabase: SupabaseClient,
  documentId: string,
  result: AnalysisResult
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('analyses')
    .insert({ document_id: documentId, user_id: user.id, result })

  if (error) {
    console.error('Failed to cache analysis:', error.message)
  }
}
