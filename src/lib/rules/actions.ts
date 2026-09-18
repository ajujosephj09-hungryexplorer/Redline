import type { SupabaseClient } from '@supabase/supabase-js'
import type { Rule } from './types'

/**
 * Fetch all rules for the current authenticated user, ordered by creation date.
 */
export async function fetchRules(supabase: SupabaseClient): Promise<Rule[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Toggle a rule's enabled/disabled state.
 */
export async function toggleRule(
  supabase: SupabaseClient,
  ruleId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from('rules')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('id', ruleId)

  if (error) throw error
}

/**
 * Update a rule's name and/or description.
 */
export async function updateRule(
  supabase: SupabaseClient,
  ruleId: string,
  updates: { name?: string; description?: string }
): Promise<void> {
  const { error } = await supabase
    .from('rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', ruleId)

  if (error) throw error
}

/**
 * Create a new custom rule for the current user.
 */
export async function createRule(
  supabase: SupabaseClient,
  rule: { name: string; description: string; produces_gap: boolean }
): Promise<Rule> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('rules')
    .insert({
      user_id: user.id,
      name: rule.name,
      description: rule.description,
      produces_gap: rule.produces_gap,
      enabled: true,
      is_default: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a rule by id.
 */
export async function deleteRule(
  supabase: SupabaseClient,
  ruleId: string
): Promise<void> {
  const { error } = await supabase
    .from('rules')
    .delete()
    .eq('id', ruleId)

  if (error) throw error
}
