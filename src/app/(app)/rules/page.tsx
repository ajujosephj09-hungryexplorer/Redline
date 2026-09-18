'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getLocalRules } from '@/lib/rules/local'
import type { Rule } from '@/lib/rules/types'

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [isLocal, setIsLocal] = useState(false)

  useEffect(() => {
    async function loadRules() {
      if (!isSupabaseConfigured) {
        setRules(getLocalRules())
        setIsLocal(true)
        setLoading(false)
        return
      }

      const supabase = createClient()
      if (!supabase) {
        setRules(getLocalRules())
        setIsLocal(true)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRules(getLocalRules())
        setIsLocal(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        // Fall back to local rules if the query fails
        setRules(getLocalRules())
        setIsLocal(true)
      } else {
        setRules(data ?? [])
        setIsLocal(false)
      }

      setLoading(false)
    }

    loadRules()
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Rules</h1>
        <p className="text-slate-500 text-sm mt-4">Loading rules...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Rules</h1>
      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
        These rules tell Redline what to look for in a contract. Each one
        flags a specific kind of risk or a missing clause.
      </p>

      {isLocal && (
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-md px-4 py-3">
          <p className="text-sm text-slate-600">
            You&apos;re seeing the defaults. Sign in to customize your rules.
          </p>
        </div>
      )}

      <div className="mt-6 border border-slate-200 rounded-md divide-y divide-slate-200">
        {rules.map((rule) => (
          <div key={rule.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy text-sm">
                    {rule.name}
                  </p>
                  {rule.is_default && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-slate-200 rounded-sm px-1.5 py-0.5">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  {rule.description}
                </p>
              </div>
              <span
                className={`shrink-0 mt-0.5 text-xs font-semibold uppercase tracking-wider ${
                  rule.enabled ? 'text-severity-clear' : 'text-slate-400'
                }`}
              >
                {rule.enabled ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="mt-6 text-center py-12">
          <p className="text-slate-500 text-sm">
            No rules yet. Default rules are created when you sign up.
          </p>
        </div>
      )}
    </div>
  )
}
