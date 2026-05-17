'use client'

import type { Grade } from '@/lib/types'
import { GRADE_TILE } from './types'

export function BigScorePill({ grade = 'A', lang = 'en' }: { grade?: Grade; lang?: 'en' | 'ar' }) {
  const g = GRADE_TILE[grade] || GRADE_TILE.A
  const verdict = lang === 'ar' ? g.verdict_ar : g.verdict_en
  return (
    <div style={{
      width: 96, height: 96, borderRadius: 24,
      background: g.bg, color: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 2,
      boxShadow: '0 14px 32px -14px rgba(40,28,18,0.32), inset 0 -3px 0 rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)',
      direction: 'ltr',
    }}>
      <span style={{
        fontFamily: 'var(--ff-display)', fontWeight: 800,
        fontSize: 56, lineHeight: 0.92, letterSpacing: '-0.04em',
        color: '#FFFFFF',
        textShadow: '0 1px 2px rgba(0,0,0,0.10)',
      }}>{grade}</span>
      <span style={{
        fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
        fontWeight: 700,
        fontSize: 11,
        color: '#FFFFFF',
        letterSpacing: lang === 'ar' ? 0 : '0.10em',
        textTransform: lang === 'ar' ? 'none' : 'uppercase',
        opacity: 0.95,
        marginTop: -2,
      }}>{verdict}</span>
    </div>
  )
}
