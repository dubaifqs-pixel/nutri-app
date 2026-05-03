'use client'

import { type Grade } from '@/lib/types'

export function GradeConfetti() {
  // Generate particles with deterministic positions for SSR consistency
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${8 + (i * 37 + 13) % 84}%`,
    delay: `${(i * 0.15) % 2}s`,
    duration: `${2 + (i % 3) * 0.5}s`,
    size: 3 + (i % 4),
    color: i % 3 === 0 ? '#34D399' : i % 3 === 1 ? '#059669' : '#A7F3D0',
  }))

  return (
    <div className="grade-confetti" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
      <style>{`
        .grade-confetti {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .confetti-particle {
          position: absolute;
          top: -8px;
          border-radius: 50%;
          animation: confetti-fall linear infinite;
          opacity: 0;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          50% { opacity: 0.6; }
          100% { transform: translateY(120px) rotate(360deg) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export function GradeWarningPulse() {
  return (
    <div className="grade-warning-pulse" aria-hidden="true">
      <div className="warning-ring ring-1" />
      <div className="warning-ring ring-2" />
      <style>{`
        .grade-warning-pulse {
          position: absolute;
          inset: -20px;
          pointer-events: none;
          z-index: 0;
        }
        .warning-ring {
          position: absolute;
          inset: 0;
          border-radius: 32px;
          border: 2px solid rgba(248, 113, 113, 0.2);
          animation: warning-expand 2.5s ease-out infinite;
        }
        .ring-2 {
          animation-delay: 1.25s;
        }
        @keyframes warning-expand {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export function GradeEffect({ grade }: { grade: Grade }) {
  if (grade === 'A') return <GradeConfetti />
  if (grade === 'E') return <GradeWarningPulse />
  return null
}
