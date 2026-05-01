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
    <div className="flex flex-col gap-2" dir="rtl">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">التحليل الغذائي</h3>
      <NutrientRow label="طاقة" value={nutrition.energy_kcal} unit=" kcal" points={gradeResult.negative_points.energy} isPositive={false} />
      <NutrientRow label="سكريات" value={nutrition.sugars_g} unit="g" points={gradeResult.negative_points.sugars} isPositive={false} />
      <NutrientRow label="دهون مشبعة" value={nutrition.saturated_fat_g} unit="g" points={gradeResult.negative_points.saturated_fat} isPositive={false} />
      <NutrientRow label="صوديوم" value={nutrition.sodium_mg} unit="mg" points={gradeResult.negative_points.sodium} isPositive={false} />
      <div className="h-px bg-gray-200 my-1" />
      <NutrientRow label="بروتين" value={nutrition.protein_g} unit="g" points={gradeResult.positive_points.protein} isPositive={true} />
      <NutrientRow label="ألياف" value={nutrition.fiber_g} unit="g" points={gradeResult.positive_points.fiber} isPositive={true} />
      {gradeResult.partial_data && (
        <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg mt-1">&#x26A0;&#xFE0F; بيانات جزئية — بعض القيم غير متوفرة</div>
      )}
      {!gradeResult.protein_counted && nutrition.protein_g !== null && (
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">&#x2139;&#xFE0F; البروتين لم يُحتسب (النقاط السلبية &#x2265; 11)</div>
      )}
    </div>
  )
}
