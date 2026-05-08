import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'nutri -- Eat smarter.',
  description: 'Eat smarter. AI-powered food grading.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#F1EEE8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-[#F1EEE8] text-[#1A1917] max-w-md mx-auto min-h-screen">
        {children}
      </body>
    </html>
  )
}
