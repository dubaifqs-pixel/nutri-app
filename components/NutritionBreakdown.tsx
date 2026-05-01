'use client'

import type { GradeResult, NutritionData } from '@/lib/types'

interface Props {
  gradeResult: GradeResult
  nutrition: NutritionData
}

function NutrientRow({ label, value, unit, points, isPositive }: {
  label: string; value: number | null; unit: string; points: number; isPositive: boolean
}) {
  if (value === null) return null
  const color = isPositive
    ? (points > 0 ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50')
    : (points > 5 ? 'text-red-600 bg-red-50' : points > 2 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50')
  return (
    <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${color.split(' ')[1]}`}>
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-semibold ${color.split(' ')[0]}`}>{value}{unit} ({points}pts)</span>
    </div>
  )
}

export default function NutritionBreakdown({ gradeResult, nutrition }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Nutrition Analysis</h3>
      <NutrientRow label="Energy" value={nutrition.energy_kcal} unit=" kcal" points={gradeResult.negative_points.energy} isPositive={false} />
      <NutrientRow label="Sugars" value={nutrition.sugars_g} unit="g" points={gradeResult.negative_points.sugars} isPositive={false} />
      <NutrientRow label="Saturated Fat" value={nutrition.saturated_fat_g} unit="g" points={gradeResult.negative_points.saturated_fat} isPositive={false} />
      <NutrientRow label="Sodium" value={nutrition.sodium_mg} unit="mg" points={gradeResult.negative_points.sodium} isPositive={false} />
      <div className="h-px bg-gray-200 my-1" />
      <NutrientRow label="Protein" value={nutrition.protein_g} unit="g" points={gradeResult.positive_points.protein} isPositive={true} />
      <NutrientRow label="Fiber" value={nutrition.fiber_g} unit="g" points={gradeResult.positive_points.fiber} isPositive={true} />
      {gradeResult.partial_data && (
        <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Partial data -- some values are missing
        </div>
      )}
      {!gradeResult.protein_counted && nutrition.protein_g !== null && (
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Protein not counted (negative points &gt;= 11)
        </div>
      )}
    </div>
  )
}
