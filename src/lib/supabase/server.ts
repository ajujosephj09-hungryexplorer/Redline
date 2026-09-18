import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from './config'

import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null

  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll is called from a Server Component where cookies
          // cannot be modified. This is expected during the initial
          // read and can be safely ignored.
        }
      },
    },
  })
}
