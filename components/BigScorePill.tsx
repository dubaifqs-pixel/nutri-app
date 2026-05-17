// BigScorePill — canonical squared-rounded grade tile (Claude Design).
// 96×96, radius 24. Grade letter 56px Extrabold white centered, verdict caption 11px Bold below.
// Background = grade color (A lime · B light green · C yellow · D orange · E red).
import type { Grade } from '@/lib/types'

const GRADE_TILE: Record<Grade, { bg: string; verdict_en: string; verdict_ar: string }> = {
  A: { bg: '#B8E845', verdict_en: 'GOOD', verdict_ar: 'جيد' },
  B: { bg: '#9BC93A', verdict_en: 'GOOD', verdict_ar: 'جيد' },
  C: { bg: '#FFD23D', verdict_en: 'FAIR', verdict_ar: 'متوسط' },
  D: { bg: '#FF9A4F', verdict_en: 'BAD', verdict_ar: 'سيء' },
  E: { bg: '#FF5A3A', verdict_en: 'BAD', verdict_ar: 'سيء' },
}

export default function BigScorePill({
  grade = 'A',
  lang = 'en',
  size = 96,
}: {
  grade?: Grade
  lang?: 'en' | 'ar'
  size?: number
}) {
  const g = GRADE_TILE[grade] || GRADE_TILE.A
  const verdict = lang === 'ar' ? g.verdict_ar : g.verdict_en
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: g.bg,
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        boxShadow:
          '0 14px 32px -14px rgba(40,28,18,0.32), inset 0 -3px 0 rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)',
        direction: 'ltr',
      }}
    >
      <span
        style={{
          fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: size * 0.58,
          lineHeight: 0.92,
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
          textShadow: '0 1px 2px rgba(0,0,0,0.10)',
        }}
      >
        {grade}
      </span>
      <span
        style={{
          fontFamily: lang === 'ar' ? "'IBM Plex Sans Arabic', system-ui, sans-serif" : "'Cabinet Grotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: Math.max(10, size * 0.115),
          color: '#FFFFFF',
          letterSpacing: lang === 'ar' ? 0 : '0.10em',
          textTransform: lang === 'ar' ? 'none' : 'uppercase',
          opacity: 0.95,
          marginTop: -2,
        }}
      >
        {verdict}
      </span>
    </div>
  )
}
