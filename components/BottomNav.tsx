'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT } from '@/lib/i18n'

type NavKey = 'home' | 'browse' | 'compare' | 'chat'

export default function BottomNav({ active }: { active?: NavKey }) {
  const t = useT()
  const pathname = usePathname()

  const isActive = (key: NavKey): boolean => {
    if (active) return active === key
    if (key === 'home') return pathname === '/'
    if (key === 'browse') return pathname.startsWith('/browse')
    if (key === 'compare') return pathname.startsWith('/compare')
    if (key === 'chat') return pathname.startsWith('/chat')
    return false
  }

  const color = (key: NavKey) => (isActive(key) ? '#1A1A1A' : '#ACACAC')
  const weight = (key: NavKey) => (isActive(key) ? 'font-semibold' : 'font-medium')

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
      <div
        className="flex items-center justify-around px-4 py-2"
        style={{ background: '#F5F4F0', borderTop: '1px solid rgba(0,0,0,0.06)', height: '56px' }}
      >
        <Link href="/" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color('home')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className={`text-[10px] ${weight('home')}`} style={{ color: color('home') }}>{t('nav.home')}</span>
        </Link>
        <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color('browse')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
          <span className={`text-[10px] ${weight('browse')}`} style={{ color: color('browse') }}>{t('nav.browse')}</span>
        </Link>
        <Link href="/scan?mode=label" className="flex items-center justify-center -mt-4">
          <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-full" style={{ background: '#B6F074' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span className="text-[12px] font-bold" style={{ color: '#1A1A1A' }}>{t('nav.scan')}</span>
          </div>
        </Link>
        <Link href="/compare" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color('compare')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
          <span className={`text-[10px] ${weight('compare')}`} style={{ color: color('compare') }}>{t('nav.compare')}</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color('chat')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span className={`text-[10px] ${weight('chat')}`} style={{ color: color('chat') }}>{t('nav.chat')}</span>
        </Link>
      </div>
    </div>
  )
}
