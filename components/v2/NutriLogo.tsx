'use client'

export function NutriLogo({ height = 16, color = 'var(--ink)', onDark = false }: { height?: number; color?: string; onDark?: boolean }) {
  const chevH = height
  const chevW = chevH * 0.62
  const gap = height * 0.18
  const inkColor = onDark ? '#fff' : color

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, lineHeight: 1 }}>
      <span style={{
        fontFamily: 'var(--ff-brand)',
        fontWeight: 700,
        fontSize: height,
        letterSpacing: '0.04em',
        color: inkColor,
        lineHeight: 0.85,
      }}>NUTRI</span>
      <svg width={chevW} height={chevH} viewBox="0 0 26 40" style={{ display: 'block', flexShrink: 0 }}>
        <path d="M0 0 L26 20 L0 40 L8 40 L26 22 L26 18 L8 0 Z" fill="var(--lime)" />
      </svg>
    </span>
  )
}

export function NutriChevron({ height = 24 }: { height?: number }) {
  return (
    <svg width={height * 0.62} height={height} viewBox="0 0 26 40">
      <path d="M0 0 L26 20 L0 40 L8 40 L26 22 L26 18 L8 0 Z" fill="var(--lime)" />
    </svg>
  )
}
