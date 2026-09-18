'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getLocalRules } from '@/lib/rules/local'
import {
  fetchRules,
  toggleRule,
  updateRule,
  createRule,
  deleteRule,
} from '@/lib/rules/actions'
import type { Rule } from '@/lib/rules/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-navy' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Inline edit field (click to edit, blur/enter to save)
// ---------------------------------------------------------------------------

function InlineEdit({
  value,
  onSave,
  className,
  multiline,
}: {
  value: string
  onSave: (next: string) => void
  className?: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  // Keep draft in sync if the parent value changes while not editing
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setDraft(value)
    }
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`${className} text-left hover:bg-slate-50 rounded px-1 -mx-1 transition-colors cursor-text`}
      >
        {value}
      </button>
    )
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        rows={3}
        className={`${className} w-full border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy resize-y`}
      />
    )
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') {
          setDraft(value)
          setEditing(false)
        }
      }}
      className={`${className} w-full border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy`}
    />
  )
}

// ---------------------------------------------------------------------------
// Add-rule form
// ---------------------------------------------------------------------------

function AddRuleForm({
  onAdd,
  onCancel,
}: {
  onAdd: (rule: { name: string; description: string; produces_gap: boolean }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [producesGap, setProducesGap] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !description.trim()) return
    setSaving(true)
    await onAdd({
      name: name.trim(),
      description: description.trim(),
      produces_gap: producesGap,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 bg-slate-50">
      <div>
        <label htmlFor="rule-name" className="block text-xs font-semibold text-navy mb-1">
          Rule name
        </label>
        <input
          id="rule-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Confidentiality (overbroad)"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-navy"
        />
      </div>
      <div>
        <label htmlFor="rule-desc" className="block text-xs font-semibold text-navy mb-1">
          Description
        </label>
        <textarea
          id="rule-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What should Redline look for?"
          rows={3}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-navy resize-y"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
        <input
          type="checkbox"
          checked={producesGap}
          onChange={(e) => setProducesGap(e.target.checked)}
          className="rounded border-slate-300"
        />
        Check for missing clause (gap analysis)
      </label>
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!name.trim() || !description.trim() || saving}
          className="bg-navy text-white text-sm font-semibold rounded-md px-4 py-2 disabled:opacity-40 hover:bg-slate-800 transition-colors"
        >
          {saving ? 'Saving...' : 'Add rule'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-navy transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Delete confirmation
// ---------------------------------------------------------------------------

function DeleteConfirm({
  ruleName,
  isLastRule,
  onConfirm,
  onCancel,
}: {
  ruleName: string
  isLastRule: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
      <p className="text-sm text-navy">
        Delete <span className="font-semibold">{ruleName}</span>?
        {isLastRule && (
          <span className="text-slate-500">
            {' '}This is your only rule. Deleting it means Redline has nothing to check.
          </span>
        )}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onConfirm}
          className="text-sm font-semibold text-navy hover:text-slate-800 transition-colors"
        >
          Yes, delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-navy transition-colors"
        >
          Keep it
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rule row (authenticated mode)
// ---------------------------------------------------------------------------

function RuleRow({
  rule,
  isLastRule,
  supabase,
  onUpdate,
}: {
  rule: Rule
  isLastRule: boolean
  supabase: SupabaseClient
  onUpdate: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleToggle(enabled: boolean) {
    setToggling(true)
    try {
      await toggleRule(supabase, rule.id, enabled)
      onUpdate()
    } finally {
      setToggling(false)
    }
  }

  async function handleNameSave(name: string) {
    await updateRule(supabase, rule.id, { name })
    onUpdate()
  }

  async function handleDescriptionSave(description: string) {
    await updateRule(supabase, rule.id, { description })
    onUpdate()
  }

  async function handleDelete() {
    await deleteRule(supabase, rule.id)
    onUpdate()
  }

  return (
    <div>
      <div className="px-5 py-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <InlineEdit
                value={rule.name}
                onSave={handleNameSave}
                className="font-semibold text-navy text-sm"
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-slate-200 rounded-sm px-1.5 py-0.5 shrink-0">
                {rule.is_default ? 'Default' : 'Custom'}
              </span>
            </div>
            <InlineEdit
              value={rule.description}
              onSave={handleDescriptionSave}
              className="text-slate-600 text-sm mt-1 leading-relaxed block"
              multiline
            />
          </div>
          <div className="flex items-center gap-3 shrink-0 mt-0.5">
            <div className={toggling ? 'opacity-50' : ''}>
              <Toggle checked={rule.enabled} onChange={handleToggle} />
            </div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-slate-400 hover:text-navy transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      {confirmDelete && (
        <DeleteConfirm
          ruleName={rule.name}
          isLastRule={isLastRule}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Read-only rule row (local/unauthenticated mode)
// ---------------------------------------------------------------------------

function ReadOnlyRuleRow({ rule }: { rule: Rule }) {
  return (
    <div className="px-5 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-navy text-sm">{rule.name}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-slate-200 rounded-sm px-1.5 py-0.5">
              Default
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1 leading-relaxed">
            {rule.description}
          </p>
        </div>
        <span className="shrink-0 mt-0.5 text-xs font-semibold uppercase tracking-wider text-severity-clear">
          On
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [isLocal, setIsLocal] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  const loadRules = useCallback(async (client: SupabaseClient | null) => {
    if (!client) {
      setRules(getLocalRules())
      setIsLocal(true)
      setLoading(false)
      return
    }

    try {
      const data = await fetchRules(client)
      setRules(data)
      setIsLocal(false)
    } catch {
      setRules(getLocalRules())
      setIsLocal(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      loadRules(null)
      return
    }

    const client = createClient()
    if (!client) {
      loadRules(null)
      return
    }

    setSupabase(client)
    loadRules(client)
  }, [loadRules])

  function handleUpdate() {
    if (supabase) loadRules(supabase)
  }

  async function handleAdd(input: {
    name: string
    description: string
    produces_gap: boolean
  }) {
    if (!supabase) return
    await createRule(supabase, input)
    setShowAddForm(false)
    handleUpdate()
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Rules</h1>
        <p className="text-slate-500 text-sm mt-4">Loading rules...</p>
      </div>
    )
  }

  // ------ Local / unauthenticated mode ------
  if (isLocal) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Rules</h1>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          These rules tell Redline what to look for in a contract. Each one
          flags a specific kind of risk or a missing clause.
        </p>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-md px-4 py-3">
          <p className="text-sm text-slate-600">
            You&apos;re seeing the defaults. Sign in to customize your rules.
          </p>
        </div>

        <div className="mt-6 border border-slate-200 rounded-md divide-y divide-slate-200">
          {rules.map((rule) => (
            <ReadOnlyRuleRow key={rule.id} rule={rule} />
          ))}
        </div>
      </div>
    )
  }

  // ------ Authenticated mode ------
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Rules</h1>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="bg-navy text-white text-sm font-semibold rounded-md px-4 py-2 hover:bg-slate-800 transition-colors"
        >
          Add rule
        </button>
      </div>
      <p className="text-slate-600 text-sm mt-2 leading-relaxed">
        These rules tell Redline what to look for in a contract. Toggle them
        on or off, edit their wording, or add your own.
      </p>

      <div className="mt-6 border border-slate-200 rounded-md divide-y divide-slate-200">
        {showAddForm && (
          <AddRuleForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        {rules.map((rule) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            isLastRule={rules.length === 1}
            supabase={supabase!}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {rules.length === 0 && !showAddForm && (
        <div className="mt-6 text-center py-12">
          <p className="text-slate-500 text-sm">
            No rules yet. Add one to get started.
          </p>
        </div>
      )}
    </div>
  )
}
