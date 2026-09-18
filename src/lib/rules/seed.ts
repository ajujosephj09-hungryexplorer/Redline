import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_RULES } from './defaults'

/**
 * Seeds the 6 default red-line rules for a user.
 * Skips seeding if the user already has any rules (idempotent).
 * Called as a client-side fallback — the primary mechanism is the
 * database trigger in 00004_seed_default_rules.sql.
 */
export async function seedDefaultRules(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Check whether user already has rules
  const { count, error: countError } = await supabase
    .from('rules')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw new Error(`Failed to check existing rules: ${countError.message}`)
  }

  if (count && count > 0) {
    return // User already has rules — nothing to do
  }

  const rows = DEFAULT_RULES.map((rule) => ({
    user_id: userId,
    name: rule.name,
    description: rule.description,
    enabled: true,
    is_default: true,
    produces_gap: rule.producesGap,
  }))

  const { error: insertError } = await supabase.from('rules').insert(rows)

  if (insertError) {
    throw new Error(`Failed to seed default rules: ${insertError.message}`)
  }
}
