'use client'

import { Grade, GRADE_COLORS, GRADE_GRADIENTS, GRADE_LABELS_EN } from '@/lib/types'

const ALL_GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E']

export default function GradeBadge({ grade, score }: { grade: Grade; score: number }) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main Grade Badge */}
      <div className="relative animate-grade-reveal">
        <div
          className="relative w-[72px] h-[72px] rounded-[20px] flex flex-col items-center justify-center text-white"
          style={{
            background: GRADE_GRADIENTS[grade],
          }}
        >
          <span className="text-3xl font-bold leading-none">{grade}</span>
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
                fontSize: isActive ? '14px' : '11px',
                padding: isActive ? '7px 16px' : '5px 9px',
                borderRadius: '10px',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {g}
            </div>
          )
        })}
      </div>

      {/* Score Pill */}
      <div className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <p className="text-sm font-semibold text-[#1A1A1A]">Score: {score}</p>
      </div>
    </div>
  )
}
