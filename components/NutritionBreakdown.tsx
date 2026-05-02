'use client'

import type { GradeResult, NutritionData } from '@/lib/types'

interface Props {
  gradeResult: GradeResult
  nutrition: NutritionData
}

const MAX_NEGATIVE_POINTS = 10

function NutrientRow({ label, value, unit, points, isPositive, delay }: {
  label: string; value: number | null; unit: string; points: number; isPositive: boolean; delay: number
}) {
  if (value === null) return null

  const percentage = isPositive
    ? Math.min((points / 5) * 100, 100)
    : Math.min((points / MAX_NEGATIVE_POINTS) * 100, 100)

  const barGradient = isPositive
    ? (points > 0 ? 'linear-gradient(90deg, #34D399, #059669)' : 'linear-gradient(90deg, #D1D5DB, #9CA3AF)')
    : (points > 5 ? 'linear-gradient(90deg, #F87171, #DC2626)' : points > 2 ? 'linear-gradient(90deg, #FBBF24, #D97706)' : 'linear-gradient(90deg, #34D399, #059669)')

  const glowColor = isPositive
    ? (points > 0 ? 'rgba(52, 211, 153, 0.15)' : 'transparent')
    : (points > 5 ? 'rgba(248, 113, 113, 0.15)' : points > 2 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(52, 211, 153, 0.1)')

  const textColor = isPositive
    ? (points > 0 ? 'text-emerald-600' : 'text-[#6B7194]')
    : (points > 5 ? 'text-red-500' : points > 2 ? 'text-amber-600' : 'text-emerald-600')

  return (
    <div
      className="glass-card p-3.5 animate-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: `inset 0 0 20px ${glowColor}, 0 2px 12px rgba(0,0,0,0.03)`,
        borderRadius: '16px',
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#1A1D2E]">{label}</span>
        <span className={`text-sm font-semibold ${textColor}`}>{value}{unit}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(26, 29, 46, 0.06)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: barGradient,
          }}
        />
      </div>
      <div className="flex justify-end mt-1.5">
        <span className={`text-[11px] font-medium ${textColor}`}>{points} pts</span>
      </div>
    </div>
  )
}

export default function NutritionBreakdown({ gradeResult, nutrition }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-sm font-semibold text-[#1A1D2E] mb-1 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Nutrition Analysis
      </h3>
      <NutrientRow label="Energy" value={nutrition.energy_kcal} unit=" kcal" points={gradeResult.negative_points.energy} isPositive={false} delay={50} />
      <NutrientRow label="Sugars" value={nutrition.sugars_g} unit="g" points={gradeResult.negative_points.sugars} isPositive={false} delay={100} />
      <NutrientRow label="Saturated Fat" value={nutrition.saturated_fat_g} unit="g" points={gradeResult.negative_points.saturated_fat} isPositive={false} delay={150} />
      <NutrientRow label="Sodium" value={nutrition.sodium_mg} unit="mg" points={gradeResult.negative_points.sodium} isPositive={false} delay={200} />

      <div className="flex items-center gap-3 my-1 px-1">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
        <span className="text-[10px] text-[#6B7194]/40 uppercase tracking-widest">Positive</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
      </div>

      <NutrientRow label="Protein" value={nutrition.protein_g} unit="g" points={gradeResult.positive_points.protein} isPositive={true} delay={300} />
      <NutrientRow label="Fiber" value={nutrition.fiber_g} unit="g" points={gradeResult.positive_points.fiber} isPositive={true} delay={350} />

      {gradeResult.partial_data && (
        <div className="glass-card flex items-start gap-2.5 text-xs text-amber-600 px-4 py-3 mt-1" style={{ borderColor: 'rgba(251, 191, 36, 0.2)', borderRadius: '14px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Partial data -- some values are missing
        </div>
      )}
      {!gradeResult.protein_counted && nutrition.protein_g !== null && (
        <div className="glass-card flex items-start gap-2.5 text-xs text-[#6B7194] px-4 py-3" style={{ borderRadius: '14px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Protein not counted (negative points &gt;= 11)
        </div>
      )}
    </div>
  )
}
