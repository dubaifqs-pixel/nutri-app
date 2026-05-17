'use client'

import type { ChipKind } from './types'

const STYLES: Record<ChipKind, { bg: string; ink: string; dot: string }> = {
  pos:     { bg: '#ecf6cd', ink: '#3a4f12', dot: '#6cc24a' },
  warn:    { bg: '#fff0c6', ink: '#5a3d05', dot: '#ff9a2b' },
  bad:     { bg: '#ffd9d4', ink: '#5a1810', dot: '#ff5a3a' },
  neutral: { bg: 'var(--paper)', ink: 'var(--ink-2)', dot: 'var(--ink-3)' },
}

export function Chip({
  kind = 'neutral',
  children,
  lang = 'en',
  dot = true,
}: {
  kind?: ChipKind
  children: React.ReactNode
  lang?: 'en' | 'ar'
  dot?: boolean
}) {
  const s = STYLES[kind] || STYLES.neutral
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 11px 6px 10px',
      background: s.bg,
      color: s.ink,
      borderRadius: 999,
      fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
      fontSize: 11.5,
      fontWeight: 600,
      letterSpacing: '-0.005em',
      boxShadow: '0 4px 14px -6px rgba(40,28,18,0.22), 0 0 0 0.5px rgba(0,0,0,0.04)',
      whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, flexShrink: 0 }} />}
      {children}
    </div>
  )
}
