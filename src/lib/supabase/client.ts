import { createBrowserClient } from '@supabase/ssr'
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from './config'

import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
