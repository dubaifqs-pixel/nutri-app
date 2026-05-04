import type { Metadata, Viewport } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
})

export const metadata: Metadata = {
  title: 'nutri -- Eat smarter.',
  description: 'Eat smarter. AI-powered food grading.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#FF8C42',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={quicksand.variable}>
      <body className="font-quicksand antialiased bg-[#F5F3EF] text-[#2D2A26] max-w-md mx-auto min-h-screen">
        {children}
      </body>
    </html>
  )
}
