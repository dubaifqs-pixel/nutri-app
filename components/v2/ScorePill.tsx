'use client'

import type { Grade } from '@/lib/types'
import { GRADE_COLOR } from './types'

export function ScorePill({ grade = 'A', score = 90, lang = 'en' }: { grade?: Grade; score?: number; lang?: 'en' | 'ar' }) {
  const c = GRADE_COLOR[grade]
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px 6px 6px',
      background: 'var(--paper)',
      borderRadius: 999,
      boxShadow: '0 6px 18px -6px rgba(40,28,18,0.25), 0 0 0 0.5px rgba(0,0,0,0.05)',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: '50%',
        background: c.accent,
        color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ff-display)',
        fontWeight: 700,
        fontSize: 16,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>{grade}</span>
      <span style={{
        fontFamily: 'var(--ff-display)',
        fontWeight: 700,
        fontSize: 17,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: 'var(--ink)',
      }}>{score}</span>
      <span style={{
        fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-mono)',
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: lang === 'ar' ? 0 : '0.16em',
        color: 'var(--ink-3)',
        textTransform: lang === 'ar' ? 'none' : 'uppercase',
      }}>{lang === 'ar' ? '‎/100' : '/100'}</span>
    </div>
  )
}
