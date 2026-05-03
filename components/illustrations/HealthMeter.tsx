'use client'

import { useEffect, useState } from 'react'

interface HealthMeterProps {
  score: number
  size?: number
}

export default function HealthMeter({ score, size = 200 }: HealthMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const id = `hm-${Math.random().toString(36).slice(2, 8)}`

  // Score range: -15 (best) to 40 (worst)
  // Map to 0 (left/green) to 1 (right/red)
  const normalizedScore = Math.max(0, Math.min(1, (score + 15) / 55))

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(normalizedScore), 100)
    return () => clearTimeout(timer)
  }, [normalizedScore])

  // Arc parameters
  const cx = 100
  const cy = 105
  const r = 72
  const startAngle = -210 * (Math.PI / 180) // left side
  const endAngle = -330 * (Math.PI / 180) // right side
  const totalAngle = 240 // degrees
  const needleAngle = -210 + animatedScore * totalAngle

  // Helper: point on arc
  const pointOnArc = (angleDeg: number) => {
    const rad = angleDeg * (Math.PI / 180)
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
  }

  // Generate tick marks
  const ticks = []
  for (let i = 0; i <= 24; i++) {
    const angle = -210 + (i / 24) * totalAngle
    const rad = angle * (Math.PI / 180)
    const isMajor = i % 6 === 0
    const innerR = isMajor ? r - 10 : r - 6
    const outerR = r + 2
    ticks.push({
      x1: cx + innerR * Math.cos(rad),
      y1: cy - innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy - outerR * Math.sin(rad),
      isMajor,
    })
  }

  // Arc path for the gauge track
  const arcStart = pointOnArc(-210)
  const arcEnd = pointOnArc(30)

  // Needle endpoint
  const needleRad = needleAngle * (Math.PI / 180)
  const needleLen = r - 16
  const needleTip = {
    x: cx + needleLen * Math.cos(needleRad),
    y: cy - needleLen * Math.sin(needleRad),
  }

  // Get label based on score
  const getLabel = () => {
    if (score <= -1) return 'Excellent'
    if (score <= 2) return 'Good'
    if (score <= 10) return 'Average'
    if (score <= 18) return 'Poor'
    return 'Bad'
  }

  return (
    <div className="health-meter-wrap" style={{ width: size, height: size * 0.7 }}>
      <svg
        viewBox="0 0 200 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Gauge gradient - green to yellow to orange to red along the arc */}
          <linearGradient id={`${id}-gauge`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="25%" stopColor="#34D399" />
            <stop offset="45%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#FB923C" />
            <stop offset="85%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          {/* Gauge track background */}
          <linearGradient id={`${id}-track`} x1="20" y1="105" x2="180" y2="105">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.15" />
          </linearGradient>
          {/* Needle glow */}
          <radialGradient id={`${id}-needle-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#F1B123" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F1B123" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${id}-shadow`} x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1A1D2E" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Gauge background arc */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
          stroke={`url(#${id}-track)`}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gauge colored arc */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
          stroke={`url(#${id}-gauge)`}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          filter={`url(#${id}-shadow)`}
          className="gauge-arc"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isMajor ? '#3A3F57' : '#6B7194'}
            strokeWidth={tick.isMajor ? 1.5 : 0.8}
            opacity={tick.isMajor ? 0.5 : 0.3}
          />
        ))}

        {/* Labels at edges */}
        <text x="28" y="132" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.7">A</text>
        <text x="172" y="132" textAnchor="middle" fill="#DC2626" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.7">E</text>

        {/* Needle glow */}
        <circle cx={needleTip.x} cy={needleTip.y} r="8" fill={`url(#${id}-needle-glow)`} className="needle-element" />

        {/* Needle */}
        <g className="needle-element" filter={`url(#${id}-glow)`}>
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#1A1D2E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Needle tip dot */}
          <circle cx={needleTip.x} cy={needleTip.y} r="3" fill="#F1B123" />
        </g>

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="6" fill="#1A1D2E" />
        <circle cx={cx} cy={cy} r="3.5" fill="#3A3F57" />

        {/* Digital readout */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill="#1A1D2E"
          fontSize="22"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          className="score-readout"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="#6B7194"
          fontSize="7"
          fontFamily="Inter, sans-serif"
        >
          {getLabel()}
        </text>
      </svg>

      <style>{`
        .health-meter-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gauge-arc {
          animation: gauge-draw 1.2s ease-out both;
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
        }
        @keyframes gauge-draw {
          to { stroke-dashoffset: 0; }
        }
        .needle-element {
          transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .score-readout {
          animation: count-fade 0.8s ease-out 0.5s both;
        }
        @keyframes count-fade {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
