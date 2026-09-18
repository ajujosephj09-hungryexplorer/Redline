'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      setError('Authentication is not configured yet.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-navy">Check your email</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            We sent a confirmation link to <strong className="text-navy">{email}</strong>.
            Click the link to finish signing up.
          </p>
          <p className="mt-8">
            <Link href="/login" className="text-sm text-navy font-medium underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy">Create your account</h1>
        <p className="text-sm text-slate-600 mt-1">
          Start reviewing contracts in minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:ring-0"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-navy focus:ring-0"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-severity-critical">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white font-semibold text-sm px-4 py-2.5 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-navy font-medium underline">
            Sign in
          </Link>
        </p>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-navy transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
