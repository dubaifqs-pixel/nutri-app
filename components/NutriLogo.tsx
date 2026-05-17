// Nutri wordmark — NUTRI text + notched chevron with gradient (ink → olive → lime)
// Path traced from Claude Design source: M0 0 L26 20 L0 40 L8 40 L26 22 L26 18 L8 0 Z
import { useId } from 'react'

export default function NutriLogo({
  height = 16,
  color = 'var(--ink, #181410)',
  onDark = false,
}: {
  height?: number
  color?: string
  onDark?: boolean
}) {
  const id = useId()
  const gid = `nutri-chev-${id.replace(/:/g, '')}`
  const fs = height
  const chevH = height * 1.05
  const chevW = chevH * 0.62
  const gap = height * 0.18
  const inkColor = onDark ? '#FFFFFF' : color

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: fs,
          letterSpacing: '0.04em',
          color: inkColor,
          lineHeight: 0.85,
        }}
      >
        NUTRI
      </span>
      <svg width={chevW} height={chevH} viewBox="0 0 26 40" style={{ display: 'block', flexShrink: 0 }} aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={inkColor} />
            <stop offset="50%" stopColor="#688040" />
            <stop offset="100%" stopColor="#B8E845" />
          </linearGradient>
        </defs>
        <path d="M0 0 L26 20 L0 40 L8 40 L26 22 L26 18 L8 0 Z" fill={`url(#${gid})`} />
      </svg>
    </span>
  )
}
