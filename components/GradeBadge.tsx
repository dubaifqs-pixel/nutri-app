'use client'

import { Grade, GRADE_COLORS, GRADE_GRADIENTS, GRADE_GLOWS, GRADE_LABELS_EN } from '@/lib/types'

const ALL_GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E']

export default function GradeBadge({ grade, score }: { grade: Grade; score: number }) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main Grade Badge with Pulse Ring */}
      <div className="relative animate-grade-reveal">
        {/* Outer pulsing ring */}
        <div
          className="absolute inset-0 rounded-[24px]"
          style={{
            background: GRADE_GRADIENTS[grade],
            animation: 'pulse-ring 2s ease-in-out infinite',
          }}
        />
        {/* Badge */}
        <div
          className="relative w-[80px] h-[80px] rounded-[24px] flex flex-col items-center justify-center text-white"
          style={{
            background: GRADE_GRADIENTS[grade],
            boxShadow: GRADE_GLOWS[grade],
          }}
        >
          <span className="text-4xl font-bold leading-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{grade}</span>
          <span className="text-[10px] mt-1 font-medium opacity-90">{GRADE_LABELS_EN[grade]}</span>
        </div>
      </div>

      {/* A-E Grade Bar */}
      <div className="flex gap-1.5 items-end">
        {ALL_GRADES.map((g) => {
          const isActive = g === grade
          return (
            <div
              key={g}
              className="flex items-center justify-center text-white font-bold transition-all duration-300"
              style={{
                background: isActive ? GRADE_GRADIENTS[g] : GRADE_COLORS[g],
                opacity: isActive ? 1 : 0.25,
                fontSize: isActive ? '16px' : '12px',
                padding: isActive ? '8px 18px' : '6px 10px',
                borderRadius: '12px',
                boxShadow: isActive ? GRADE_GLOWS[g] : 'none',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {g}
            </div>
          )
        })}
      </div>

      {/* Score Pill */}
      <div className="glass-subtle flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl">
        <p className="text-sm font-semibold text-[#4A4540]">Score: {score}</p>
      </div>
    </div>
  )
}
