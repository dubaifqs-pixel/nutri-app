import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'nutri -- Eat smarter.',
  description: 'Eat smarter. AI-powered food grading.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#F2F0ED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-[#F2F0ED] text-[#1A1A1A] max-w-md mx-auto min-h-screen">
        {children}
      </body>
    </html>
  )
}
