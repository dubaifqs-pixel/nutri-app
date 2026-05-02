'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_COLORS, GRADE_GRADIENTS, GRADE_GLOWS, type Grade, type NutritionData, type GradeResult } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'

interface CompareProduct {
  product_name: string
  nutrition: NutritionData
  grade: Grade
  score: number
  gradeResult: GradeResult
  image_url?: string
}

function GradeBadgeSmall({ grade, score }: { grade: Grade; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white"
        style={{ background: GRADE_GRADIENTS[grade], boxShadow: GRADE_GLOWS[grade] }}
      >
        <span className="text-3xl font-bold leading-none" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>{grade}</span>
      </div>
      <p className="text-xs text-[#6B7194]">Score: {score}</p>
    </div>
  )
}

const NUTRIENT_LABELS: { key: keyof NutritionData; label: string; unit: string; lowerIsBetter: boolean }[] = [
  { key: 'energy_kcal', label: 'Energy', unit: 'kcal', lowerIsBetter: true },
  { key: 'sugars_g', label: 'Sugars', unit: 'g', lowerIsBetter: true },
  { key: 'saturated_fat_g', label: 'Saturated Fat', unit: 'g', lowerIsBetter: true },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', lowerIsBetter: true },
  { key: 'protein_g', label: 'Protein', unit: 'g', lowerIsBetter: false },
  { key: 'fiber_g', label: 'Fiber', unit: 'g', lowerIsBetter: false },
]

export default function ComparePage() {
  const router = useRouter()
  const [slot1, setSlot1] = useState<CompareProduct | null>(null)
  const [slot2, setSlot2] = useState<CompareProduct | null>(null)
  const [showModal, setShowModal] = useState<1 | 2 | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [verdict, setVerdict] = useState('')
  const [verdictLoading, setVerdictLoading] = useState(false)

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  useEffect(() => {
    const raw1 = sessionStorage.getItem('dfqs_compare_1')
    const raw1g = sessionStorage.getItem('dfqs_compare_1_grade')
    if (raw1 && raw1g) {
      const product = JSON.parse(raw1)
      const gradeResult = JSON.parse(raw1g)
      setSlot1({
        product_name: product.product_name,
        nutrition: product.nutrition,
        grade: gradeResult.grade,
        score: gradeResult.score,
        gradeResult,
        image_url: product.image_url,
      })
    }
    const raw2 = sessionStorage.getItem('dfqs_compare_2')
    const raw2g = sessionStorage.getItem('dfqs_compare_2_grade')
    if (raw2 && raw2g) {
      const product = JSON.parse(raw2)
      const gradeResult = JSON.parse(raw2g)
      setSlot2({
        product_name: product.product_name,
        nutrition: product.nutrition,
        grade: gradeResult.grade,
        score: gradeResult.score,
        gradeResult,
        image_url: product.image_url,
      })
    }
  }, [])

  const fetchVerdict = useCallback(async (p1: CompareProduct, p2: CompareProduct) => {
    setVerdictLoading(true)
    setVerdict('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Compare these two products and tell me which is healthier and why. Be concise (3-4 sentences).

Product 1: ${p1.product_name} (Grade ${p1.grade}, Score ${p1.score})
Nutrition per 100g: ${JSON.stringify(p1.nutrition)}

Product 2: ${p2.product_name} (Grade ${p2.grade}, Score ${p2.score})
Nutrition per 100g: ${JSON.stringify(p2.nutrition)}`,
        }),
      })
      if (!res.ok) {
        setVerdict('Could not generate AI comparison. Please try again.')
        return
      }
      const data = await res.json()
      setVerdict(data.response || data.error || 'Could not generate comparison')
    } catch {
      setVerdict('Could not generate AI comparison. Please try again.')
    } finally {
      setVerdictLoading(false)
    }
  }, [])

  useEffect(() => {
    if (slot1 && slot2) {
      fetchVerdict(slot1, slot2)
    }
  }, [slot1, slot2, fetchVerdict])

  const selectFromHistory = (entry: HistoryEntry) => {
    if (!showModal) return
    const nutrition = entry.nutrition || {
      energy_kcal: null, sugars_g: null, saturated_fat_g: null,
      sodium_mg: null, protein_g: null, fiber_g: null, fruits_veg_percent: null,
    }
    const gradeResult = calculateGrade(nutrition)
    const product: CompareProduct = {
      product_name: entry.product_name,
      nutrition,
      grade: gradeResult.grade,
      score: gradeResult.score,
      gradeResult,
      image_url: entry.image_url,
    }
    const slotKey = showModal === 1 ? 'dfqs_compare_1' : 'dfqs_compare_2'
    const gradeKey = showModal === 1 ? 'dfqs_compare_1_grade' : 'dfqs_compare_2_grade'
    sessionStorage.setItem(slotKey, JSON.stringify({ product_name: entry.product_name, nutrition, image_url: entry.image_url, source: entry.source }))
    sessionStorage.setItem(gradeKey, JSON.stringify(gradeResult))
    if (showModal === 1) setSlot1(product)
    else setSlot2(product)
    setShowModal(null)
  }

  const navigateToScan = (mode: 'label' | 'barcode', slot: 1 | 2) => {
    router.push(`/scan?mode=${mode}&return=compare&slot=${slot}`)
  }

  const clearSlot = (slot: 1 | 2) => {
    if (slot === 1) {
      setSlot1(null)
      sessionStorage.removeItem('dfqs_compare_1')
      sessionStorage.removeItem('dfqs_compare_1_grade')
    } else {
      setSlot2(null)
      sessionStorage.removeItem('dfqs_compare_2')
      sessionStorage.removeItem('dfqs_compare_2_grade')
    }
    setVerdict('')
  }

  const formatValue = (val: number | null, unit: string) => {
    if (val === null) return '--'
    return `${Math.round(val * 10) / 10}${unit}`
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6 mesh-bg">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="text-[#6B7194] transition-colors hover:text-[#1A1D2E] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#1A1D2E]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#1A1D2E]">Compare Products</h1>
      </div>

      {/* Product Slots */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up stagger-1">
        {[1, 2].map((slotNum) => {
          const product = slotNum === 1 ? slot1 : slot2
          return (
            <div key={slotNum} className="glass-card flex flex-col items-center gap-3 p-4" style={{ borderRadius: '20px' }}>
              {product ? (
                <>
                  <GradeBadgeSmall grade={product.grade} score={product.score} />
                  <p className="text-xs font-medium text-[#1A1D2E] text-center line-clamp-2">{product.product_name}</p>
                  <button onClick={() => clearSlot(slotNum as 1 | 2)} className="text-xs text-[#6B7194]/50 transition-colors hover:text-red-400 min-h-[44px] px-2 flex items-center">
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(slotNum as 1 | 2)}
                  className="flex flex-col items-center justify-center gap-2 w-full py-6 text-[#6B7194] transition-colors hover:text-[#3A3F57]"
                >
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-[#6B7194]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </div>
                  <span className="text-xs font-medium">Add product</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* VS Divider */}
      {slot1 && slot2 && (
        <div className="flex items-center gap-3 -my-2 animate-scale-in">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #F1B123, #D89A0E)', color: 'white', boxShadow: '0 4px 12px rgba(241, 177, 35, 0.3)' }}>VS</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
        </div>
      )}

      {/* Comparison Table */}
      {slot1 && slot2 && (
        <div className="glass-card overflow-hidden animate-slide-up stagger-3" style={{ borderRadius: '20px' }}>
          <div className="grid grid-cols-3 px-4 py-3" style={{ background: 'rgba(26, 29, 46, 0.03)' }}>
            <span className="text-xs font-semibold text-[#6B7194]">Nutrient</span>
            <span className="text-xs font-semibold text-[#6B7194] text-center truncate">{slot1.product_name.split(' ').slice(0, 2).join(' ')}</span>
            <span className="text-xs font-semibold text-[#6B7194] text-center truncate">{slot2.product_name.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          {NUTRIENT_LABELS.map(({ key, label, unit, lowerIsBetter }, i) => {
            const v1 = slot1.nutrition[key]
            const v2 = slot2.nutrition[key]
            let better1 = false
            let better2 = false
            if (v1 !== null && v2 !== null) {
              if (lowerIsBetter) {
                if (v1 < v2) better1 = true
                else if (v2 < v1) better2 = true
              } else {
                if (v1 > v2) better1 = true
                else if (v2 > v1) better2 = true
              }
            }
            return (
              <div key={key} className="grid grid-cols-3 px-4 py-2.5" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26, 29, 46, 0.02)' }}>
                <span className="text-xs text-[#3A3F57]">{label}</span>
                <span className={`text-xs text-center font-medium flex items-center justify-center gap-1 ${better1 ? 'text-emerald-600' : 'text-[#3A3F57]'}`}>
                  {better1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F1B123" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21"/></svg>
                  )}
                  {formatValue(v1, unit)}
                </span>
                <span className={`text-xs text-center font-medium flex items-center justify-center gap-1 ${better2 ? 'text-emerald-600' : 'text-[#3A3F57]'}`}>
                  {better2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F1B123" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21"/></svg>
                  )}
                  {formatValue(v2, unit)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* AI Verdict */}
      {slot1 && slot2 && (
        <div className="glass-card p-4 animate-slide-up stagger-4" style={{ borderRadius: '20px', borderColor: 'rgba(241, 177, 35, 0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1B123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            <h3 className="text-sm font-semibold text-[#1A1D2E]">AI Verdict</h3>
          </div>
          {verdictLoading ? (
            <div className="flex items-center gap-2.5 py-2">
              <div className="w-4 h-4 border-2 border-[#F1B123] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#6B7194]">Analyzing...</span>
            </div>
          ) : (
            <p className="text-sm text-[#3A3F57] leading-relaxed">{verdict}</p>
          )}
        </div>
      )}

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowModal(null)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl px-6 py-6 flex flex-col gap-3 animate-slide-up-full"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.1)' }}
          >
            <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-2" />
            <h2 className="text-base font-bold text-[#1A1D2E] mb-1">Select Product {showModal}</h2>

            <button
              onClick={() => navigateToScan('label', showModal)}
              className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl btn-gold text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Scan Nutrition Label
            </button>

            <button
              onClick={() => navigateToScan('barcode', showModal)}
              className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl btn-ink text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
              Scan Barcode
            </button>

            {history.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-xs font-semibold text-[#6B7194]/60 uppercase tracking-[0.08em]">From History</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {history.map((entry, i) => (
                    <button
                      key={`${entry.scanned_at}-${i}`}
                      onClick={() => selectFromHistory(entry)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all hover:bg-[#F8F9FC] active:scale-[0.99]"
                      style={{ border: '1px solid rgba(26, 29, 46, 0.06)' }}
                    >
                      <span
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
                      >
                        {entry.grade}
                      </span>
                      <span className="text-sm text-[#1A1D2E] truncate flex-1">{entry.product_name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setShowModal(null)} className="mt-2 py-2 text-sm text-[#6B7194]/50 transition-colors hover:text-[#6B7194] min-h-[44px] w-full">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
