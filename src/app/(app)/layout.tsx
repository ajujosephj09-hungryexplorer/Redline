'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/library', label: 'Library' },
  { href: '/upload', label: 'Upload' },
  { href: '/rules', label: 'Rules' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-navy font-bold text-base tracking-tight"
            >
              Redline
            </Link>
            <div className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-600 hover:text-navy transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-navy transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
