'use client'

import type { GradeResult, NutritionData } from '@/lib/types'
import { useT } from '@/lib/i18n'

interface Props {
  gradeResult: GradeResult
  nutrition: NutritionData
}

const MAX_NEGATIVE_POINTS = 10

const NUTRIENT_COLORS = {
  energy: '#9A9790',
  sugars: '#C62828',
  saturated_fat: '#E65100',
  sodium: '#F9A825',
  protein: '#E8721C',
  fiber: '#2E7D32',
}

function NutrientRow({ label, value, unit, points, isPositive, delay, color, ptsLabel }: {
  label: string; value: number | null; unit: string; points: number; isPositive: boolean; delay: number; color: string; ptsLabel: string
}) {
  if (value === null) return null

  const percentage = isPositive
    ? Math.min((points / 5) * 100, 100)
    : Math.min((points / MAX_NEGATIVE_POINTS) * 100, 100)

  const barColor = isPositive
    ? (points > 0 ? '#E8721C' : '#D0D0D0')
    : (points > 5 ? '#E53935' : points > 2 ? '#F9A825' : '#E8721C')

  const textColor = isPositive
    ? (points > 0 ? 'text-[#2E7D32]' : 'text-[#9A9790]')
    : (points > 5 ? 'text-[#C62828]' : points > 2 ? 'text-[#E65100]' : 'text-[#2E7D32]')

  return (
    <div
      className="bg-white rounded-2xl p-3.5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="text-sm font-medium text-[#1A1917]">{label}</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`} dir="ltr">{value}{unit}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-[#F1EEE8]">
        <div
          className="absolute inset-y-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            insetInlineStart: 0,
            backgroundColor: barColor,
          }}
        />
      </div>
      <div className="flex justify-end mt-1.5">
        <span className={`text-[11px] font-bold ${textColor}`}>{points} {ptsLabel}</span>
      </div>
    </div>
  )
}

export default function NutritionBreakdown({ gradeResult, nutrition }: Props) {
  const t = useT()
  const ptsLabel = t('nutri.points')
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-sm font-semibold text-[#1A1917] mb-1 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9790" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        {t('nutri.analysis')}
      </h3>
      <NutrientRow label={t('nutri.energy')} value={nutrition.energy_kcal} unit={` ${t('nutri.unit.kcal')}`} points={gradeResult.negative_points.energy} isPositive={false} delay={50} color={NUTRIENT_COLORS.energy} ptsLabel={ptsLabel} />
      <NutrientRow label={t('nutri.sugars')} value={nutrition.sugars_g} unit={t('nutri.unit.g')} points={gradeResult.negative_points.sugars} isPositive={false} delay={100} color={NUTRIENT_COLORS.sugars} ptsLabel={ptsLabel} />
      <NutrientRow label={t('nutri.saturatedFat')} value={nutrition.saturated_fat_g} unit={t('nutri.unit.g')} points={gradeResult.negative_points.saturated_fat} isPositive={false} delay={150} color={NUTRIENT_COLORS.saturated_fat} ptsLabel={ptsLabel} />
      <NutrientRow label={t('nutri.sodium')} value={nutrition.sodium_mg} unit={t('nutri.unit.mg')} points={gradeResult.negative_points.sodium} isPositive={false} delay={200} color={NUTRIENT_COLORS.sodium} ptsLabel={ptsLabel} />

      <div className="flex items-center gap-3 my-1 px-1">
        <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
        <span className="text-[10px] text-[#9A9790] uppercase tracking-widest">{t('nutri.positive')}</span>
        <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
      </div>

      <NutrientRow label={t('nutri.protein')} value={nutrition.protein_g} unit={t('nutri.unit.g')} points={gradeResult.positive_points.protein} isPositive={true} delay={300} color={NUTRIENT_COLORS.protein} ptsLabel={ptsLabel} />
      <NutrientRow label={t('nutri.fiber')} value={nutrition.fiber_g} unit={t('nutri.unit.g')} points={gradeResult.positive_points.fiber} isPositive={true} delay={350} color={NUTRIENT_COLORS.fiber} ptsLabel={ptsLabel} />

      {gradeResult.partial_data && (
        <div className="bg-white flex items-start gap-2.5 text-xs text-amber-600 px-4 py-3 mt-1 rounded-2xl" style={{ border: '1px solid rgba(255, 193, 7, 0.2)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          {t('nutri.partialData')}
        </div>
      )}
      {!gradeResult.protein_counted && nutrition.protein_g !== null && (
        <div className="bg-white flex items-start gap-2.5 text-xs text-[#9A9790] px-4 py-3 rounded-2xl" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          {t('nutri.proteinNotCounted')}
        </div>
      )}
    </div>
  )
}
