import type { Metadata } from 'next'
import { Libre_Franklin, Roboto_Mono } from 'next/font/google'
import './globals.css'

const libre = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Redline — Your contract, diagnosed.',
  description:
    'Upload a freelancer contract. Get risk flags ranked by severity, each citing the exact sentence. With counter-offers you can send back.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${libre.variable} ${mono.variable}`}>
      <body className="bg-white text-navy font-[family-name:var(--font-sans)] antialiased">
        {children}
      </body>
    </html>
  )
}
