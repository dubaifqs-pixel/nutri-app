'use client'

import Link from 'next/link'
import FeaturedProducts from '@/components/FeaturedProducts'
import LangToggle from '@/components/LangToggle'
import { useT } from '@/lib/i18n'

export default function Home() {
  const t = useT()
  return (
    <div
      className="min-h-screen flex flex-col pb-[72px]"
      style={{ background: '#F5F4F0' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-9 pb-2 flex-shrink-0">
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[11px] flex items-center justify-center" style={{ background: '#1A1A1A' }}>
            <span className="text-white font-extrabold text-[13px] tracking-tight">DQ</span>
          </div>
          <h1 className="text-[17px] font-bold leading-tight" style={{ color: '#1A1A1A' }}>nutri</h1>
        </Link>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>
      </div>

      {/* Tagline */}
      <div className="px-5 pt-6 pb-6 flex-shrink-0">
        <p className="text-[28px] leading-[1.05] font-extrabold tracking-tight" style={{ color: '#1A1A1A' }}>
          {t('home.tagline.line1')}<br/>
          <span style={{ color: '#7A7A7A' }}>{t('home.tagline.line2')}</span>
        </p>
      </div>

      {/* Featured products carousel */}
      <FeaturedProducts />

      {/* Big Scan CTA */}
      <div className="px-4 pt-5">
        <Link
          href="/scan?mode=label"
          className="relative overflow-hidden flex items-center justify-between px-5 py-5 rounded-[20px] transition-opacity active:opacity-90"
          style={{ background: '#1A1A1A' }}
        >
          <div className="absolute pointer-events-none" style={{ width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -100, insetInlineEnd: -60 }} />
          <div className="relative">
            <p className="text-[20px] font-bold text-white leading-tight">{t('home.scan.title')}</p>
            <p className="text-[11px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('home.scan.sub')}</p>
          </div>
          <div
            className="relative w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#B6F074' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* Quick actions row */}
      <div className="px-4 pt-3 grid grid-cols-3 gap-2 flex-shrink-0">
        <Link
          href="/browse"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid rgba(0,0,0,0.06)', height: 86 }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#FFEC89' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
          </div>
          <p className="text-[12px] font-bold" style={{ color: '#1A1A1A' }}>{t('home.browse')}</p>
        </Link>

        <Link
          href="/compare"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid rgba(0,0,0,0.06)', height: 86 }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#DAB8F1' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
          </div>
          <p className="text-[12px] font-bold" style={{ color: '#1A1A1A' }}>{t('home.compare')}</p>
        </Link>

        <Link
          href="/chat"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid rgba(0,0,0,0.06)', height: 86 }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#B6E1FA' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-[12px] font-bold" style={{ color: '#1A1A1A' }}>{t('home.chat')}</p>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
        <div
          className="flex items-center justify-around px-4 py-2"
          style={{ background: '#F5F4F0', borderTop: '1px solid rgba(0,0,0,0.06)', height: '56px' }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: '#1A1A1A' }}>{t('nav.home')}</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>{t('nav.browse')}</span>
          </Link>
          <Link href="/scan?mode=label" className="flex items-center justify-center -mt-4">
            <div
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full"
              style={{ background: '#B6F074' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-[11px] font-bold" style={{ color: '#1A1A1A' }}>{t('nav.scan')}</span>
            </div>
          </Link>
          <Link href="/compare" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>{t('nav.compare')}</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>{t('nav.chat')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
