import type { Metadata, Viewport } from 'next'
import LangSync from '@/components/LangSync'
import './globals.css'

export const metadata: Metadata = {
  title: 'nutri -- Eat smarter.',
  description: 'Eat smarter. AI-powered food grading.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Cabinet Grotesk (Fontshare) — Swipe Drinks display font */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" />
        {/* Nunito fallback for legacy bits */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Inline script reads stored language and sets dir/lang BEFORE first paint, avoiding RTL flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('dfqs_lang');if(l==='ar'){document.documentElement.setAttribute('lang','ar');document.documentElement.setAttribute('dir','rtl');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased bg-[#FAF7F2] text-[#181410] max-w-md mx-auto min-h-screen">
        <LangSync />
        {children}
      </body>
    </html>
  )
}
