import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Welcome to Redline</h1>
      <p className="text-slate-600 mt-2 leading-relaxed">
        Upload a contract and get it diagnosed, or browse what you have already reviewed.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href="/upload"
          className="inline-flex items-center justify-center bg-navy text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-slate-700 transition-colors"
        >
          Upload a contract
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center border border-slate-300 text-navy font-semibold text-sm px-6 py-3 rounded-md hover:bg-slate-50 transition-colors"
        >
          View your library
        </Link>
      </div>
    </div>
  )
}
