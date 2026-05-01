'use client'

import { Grade, GRADE_COLORS, GRADE_LABELS_EN, GRADE_LABELS_AR } from '@/lib/types'

const ALL_GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E']

export default function GradeBadge({ grade, score }: { grade: Grade; score: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-28 h-28 rounded-3xl flex flex-col items-center justify-center text-white shadow-lg"
        style={{ background: `linear-gradient(145deg, ${GRADE_COLORS[grade]}dd, ${GRADE_COLORS[grade]})` }}
      >
        <span className="text-6xl font-bold leading-none">{grade}</span>
        <span className="text-sm mt-1">{GRADE_LABELS_EN[grade]}</span>
      </div>
      <div className="flex rounded-lg overflow-hidden">
        {ALL_GRADES.map((g) => (
          <div
            key={g}
            className="px-3 py-2 text-white font-bold text-sm transition-all"
            style={{
              backgroundColor: GRADE_COLORS[g],
              opacity: g === grade ? 1 : 0.3,
              fontSize: g === grade ? '18px' : '13px',
              padding: g === grade ? '8px 16px' : '8px 10px',
            }}
          >
            {g}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-sm text-gray-500">Score: {score}</p>
        <p className="text-xs text-gray-400 font-arabic">{GRADE_LABELS_AR[grade]}</p>
      </div>
    </div>
  )
}
