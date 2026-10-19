'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const appLinks = [
  { href: '/library', label: 'Library' },
  { href: '/upload', label: 'Upload' },
  { href: '/rules', label: 'Rules' },
]

export default function NavBar() {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setAuthed(false)
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-navy font-bold text-base tracking-tight shrink-0"
          >
            Redline
          </Link>
          {authed && (
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
              {appLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-600 hover:text-navy transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {authed === true && (
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-navy transition-colors"
            >
              Sign out
            </button>
          )}
          {authed === false && (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-600 hover:text-navy transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-navy text-white font-semibold px-4 py-1.5 rounded-md hover:bg-slate-700 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
