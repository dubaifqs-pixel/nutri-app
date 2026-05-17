'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT } from '@/lib/i18n'

type NavKey = 'home' | 'browse' | 'compare' | 'chat'

function NavIconHome({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V10.5z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
    </svg>
  )
}
function NavIconBrowse() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function NavIconScan() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3"
            stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M3 12h18" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
function NavIconCompare() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 4v16M16 4v16M4 8l4-4 4 4M20 16l-4 4-4-4"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function NavIconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1 4a8 8 0 011 4z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

export function BottomNavV2({ active }: { active?: NavKey }) {
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

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 448, zIndex: 30, pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'auto',
        margin: '0 18px 16px',
        background: 'var(--paper)',
        borderRadius: 28,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 30px -12px rgba(40,28,18,0.22), 0 0 0 0.5px rgba(0,0,0,0.05)',
        position: 'relative',
      }}>
        <NavLink href="/" active={isActive('home')} icon={<NavIconHome active={isActive('home')} />} label={t('nav.home')} />
        <NavLink href="/browse" active={isActive('browse')} icon={<NavIconBrowse />} label={t('nav.browse')} />
        <Link href="/scan?mode=label" aria-label={t('nav.scan')} style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--lime)',
          border: '4px solid var(--paper)',
          marginTop: -34,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 22px -6px rgba(140,180,40,0.55), inset 0 -3px 0 rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}>
          <NavIconScan />
        </Link>
        <NavLink href="/compare" active={isActive('compare')} icon={<NavIconCompare />} label={t('nav.compare')} />
        <NavLink href="/chat" active={isActive('chat')} icon={<NavIconChat />} label={t('nav.chat')} />
      </div>
    </div>
  )
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} aria-label={label} style={{
      flex: 1,
      padding: '4px 0',
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      color: active ? 'var(--ink)' : 'var(--ink-4)',
      minHeight: 44,
    }}>
      {icon}
      {active && <span style={{ width: 4, height: 4, background: 'var(--ink)', borderRadius: 999 }} />}
    </Link>
  )
}
