import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google'
import './globals.css'

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'DFQS — Dubai Food Quality Standards',
  description: 'AI-powered food grading based on Dubai Food Quality Standards',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#3A3F57',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${arabic.variable} ${inter.variable}`}>
      <body className="font-inter antialiased bg-white text-gray-800 max-w-md mx-auto min-h-screen">
        {children}
      </body>
    </html>
  )
}
