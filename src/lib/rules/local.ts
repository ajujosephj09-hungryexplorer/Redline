import { DEFAULT_RULES } from './defaults'
import type { Rule } from './types'

/**
 * Deterministic UUIDs for the local (offline) default rules.
 * These are stable so that components can use them as React keys
 * without regenerating on every render.
 */
const LOCAL_IDS = [
  'a1b2c3d4-1111-4000-8000-000000000001',
  'a1b2c3d4-2222-4000-8000-000000000002',
  'a1b2c3d4-3333-4000-8000-000000000003',
  'a1b2c3d4-4444-4000-8000-000000000004',
  'a1b2c3d4-5555-4000-8000-000000000005',
  'a1b2c3d4-6666-4000-8000-000000000006',
]

const now = new Date().toISOString()

/**
 * Returns the 6 default rules as fully-formed Rule objects.
 * Used when Supabase is not configured, so the analysis engine
 * and rules page still have something to work with.
 */
export function getLocalRules(): Rule[] {
  return DEFAULT_RULES.map((def, i) => ({
    id: LOCAL_IDS[i],
    user_id: 'local',
    name: def.name,
    description: def.description,
    enabled: true,
    is_default: true,
    produces_gap: def.producesGap,
    created_at: now,
    updated_at: now,
  }))
}
