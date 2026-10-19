import NavBar from '@/components/NavBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
