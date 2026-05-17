// Chip — small pill that orbits the photo on hero cards (Claude Design).
// kind: pos (green) | warn (amber) | bad (red) | neutral (white)
type Kind = 'pos' | 'warn' | 'bad' | 'neutral'

const STYLES: Record<Kind, { bg: string; ink: string; dot: string }> = {
  pos: { bg: '#ECF6CD', ink: '#3A4F12', dot: '#6CC24A' },
  warn: { bg: '#FFF0C6', ink: '#5A3D05', dot: '#FF9A2B' },
  bad: { bg: '#FFD9D4', ink: '#5A1810', dot: '#FF5A3A' },
  neutral: { bg: '#FFFFFF', ink: '#3A342A', dot: '#7A7166' },
}

export default function Chip({
  kind = 'neutral',
  children,
  dot = true,
}: {
  kind?: Kind
  children: React.ReactNode
  dot?: boolean
}) {
  const s = STYLES[kind] || STYLES.neutral
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px 6px 10px',
        background: s.bg,
        color: s.ink,
        borderRadius: 999,
        fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        boxShadow: '0 4px 14px -6px rgba(40,28,18,0.22), 0 0 0 0.5px rgba(0,0,0,0.04)',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
      )}
      {children}
    </div>
  )
}
