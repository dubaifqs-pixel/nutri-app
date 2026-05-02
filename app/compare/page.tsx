'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_GRADIENTS, GRADE_GLOWS, type Grade, type NutritionData, type GradeResult } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'

interface CompareProduct {
  product_name: string
  nutrition: NutritionData
  grade: Grade
  score: number
  gradeResult: GradeResult
  image_url?: string
}

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E']

const NUTRIENTS: { key: keyof NutritionData; label: string; unit: string; lowerIsBetter: boolean; max: number }[] = [
  { key: 'energy_kcal', label: 'Calories', unit: 'kcal', lowerIsBetter: true, max: 800 },
  { key: 'sugars_g', label: 'Sugar', unit: 'g', lowerIsBetter: true, max: 50 },
  { key: 'saturated_fat_g', label: 'Sat. Fat', unit: 'g', lowerIsBetter: true, max: 20 },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', lowerIsBetter: true, max: 1000 },
  { key: 'protein_g', label: 'Protein', unit: 'g', lowerIsBetter: false, max: 30 },
  { key: 'fiber_g', label: 'Fiber', unit: 'g', lowerIsBetter: false, max: 10 },
]

function getWinner(s1: CompareProduct, s2: CompareProduct): 1 | 2 | 0 {
  const i1 = GRADE_ORDER.indexOf(s1.grade)
  const i2 = GRADE_ORDER.indexOf(s2.grade)
  if (i1 < i2) return 1
  if (i2 < i1) return 2
  if (s1.score < s2.score) return 1
  if (s2.score < s1.score) return 2
  return 0
}

export default function ComparePage() {
  const router = useRouter()
  const [slot1, setSlot1] = useState<CompareProduct | null>(null)
  const [slot2, setSlot2] = useState<CompareProduct | null>(null)
  const [showModal, setShowModal] = useState<1 | 2 | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [verdict, setVerdict] = useState('')
  const [verdictLoading, setVerdictLoading] = useState(false)

  useEffect(() => { setHistory(getHistory()) }, [])

  useEffect(() => {
    const load = (key: string, gradeKey: string) => {
      const raw = sessionStorage.getItem(key)
      const rawG = sessionStorage.getItem(gradeKey)
      if (!raw || !rawG) return null
      const product = JSON.parse(raw)
      const gradeResult = JSON.parse(rawG)
      return { product_name: product.product_name, nutrition: product.nutrition, grade: gradeResult.grade, score: gradeResult.score, gradeResult, image_url: product.image_url } as CompareProduct
    }
    const s1 = load('dfqs_compare_1', 'dfqs_compare_1_grade')
    const s2 = load('dfqs_compare_2', 'dfqs_compare_2_grade')
    if (s1) setSlot1(s1)
    if (s2) setSlot2(s2)
  }, [])

  const fetchVerdict = useCallback(async (p1: CompareProduct, p2: CompareProduct) => {
    setVerdictLoading(true)
    setVerdict('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Compare "${p1.product_name}" (Grade ${p1.grade}) vs "${p2.product_name}" (Grade ${p2.grade}). Give a short bilingual verdict (2-3 sentences English, then Arabic). Focus on the key differences that matter most for health. Do NOT use JSON format, just write plain text.`,
          product_context: { product_name: p1.product_name, grade: p1.grade, score: p1.score, nutrition: p1.nutrition },
        }),
      })
      if (!res.ok) { setVerdict(''); return }
      const data = await res.json()
      const text = data.response || ''
      // Strip JSON if AI returned it anyway
      if (text.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
          const sections = parsed.sections || []
          const texts = sections.map((s: any) => s.title_en || s.text_en || '').filter(Boolean)
          const arTexts = sections.map((s: any) => s.title_ar || s.text_ar || '').filter(Boolean)
          setVerdict([...texts, '', ...arTexts].join('\n'))
          return
        } catch {}
      }
      setVerdict(text)
    } catch {
      setVerdict('')
    } finally {
      setVerdictLoading(false)
    }
  }, [])

  useEffect(() => {
    if (slot1 && slot2) fetchVerdict(slot1, slot2)
  }, [slot1, slot2, fetchVerdict])

  const selectFromHistory = (entry: HistoryEntry) => {
    if (!showModal) return
    const nutrition = entry.nutrition || { energy_kcal: null, sugars_g: null, saturated_fat_g: null, sodium_mg: null, protein_g: null, fiber_g: null, fruits_veg_percent: null }
    const gradeResult = calculateGrade(nutrition)
    const product: CompareProduct = { product_name: entry.product_name, nutrition, grade: gradeResult.grade, score: gradeResult.score, gradeResult, image_url: entry.image_url }
    const slotKey = showModal === 1 ? 'dfqs_compare_1' : 'dfqs_compare_2'
    const gradeKey = showModal === 1 ? 'dfqs_compare_1_grade' : 'dfqs_compare_2_grade'
    sessionStorage.setItem(slotKey, JSON.stringify({ product_name: entry.product_name, nutrition, image_url: entry.image_url, source: entry.source }))
    sessionStorage.setItem(gradeKey, JSON.stringify(gradeResult))
    if (showModal === 1) setSlot1(product); else setSlot2(product)
    setShowModal(null)
  }

  const clearSlot = (slot: 1 | 2) => {
    if (slot === 1) { setSlot1(null); sessionStorage.removeItem('dfqs_compare_1'); sessionStorage.removeItem('dfqs_compare_1_grade') }
    else { setSlot2(null); sessionStorage.removeItem('dfqs_compare_2'); sessionStorage.removeItem('dfqs_compare_2_grade') }
    setVerdict('')
  }

  const winner = slot1 && slot2 ? getWinner(slot1, slot2) : 0
  const bothLoaded = !!(slot1 && slot2)

  return (
    <div className="min-h-screen px-5 py-6 flex flex-col gap-5 mesh-bg">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="text-[#6B7194] transition-colors hover:text-[#1A1D2E] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#1A1D2E]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#1A1D2E]">Product Showdown</h1>
      </div>

      {/* Product Cards — Side by Side */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up stagger-1">
        {([1, 2] as const).map((slotNum) => {
          const product = slotNum === 1 ? slot1 : slot2
          const isWinner = winner === slotNum
          return (
            <div
              key={slotNum}
              className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: isWinner ? 'rgba(241, 177, 35, 0.06)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                border: isWinner ? '2px solid rgba(241, 177, 35, 0.3)' : '1px solid rgba(26, 29, 46, 0.08)',
                boxShadow: isWinner ? '0 8px 32px rgba(241, 177, 35, 0.12)' : '0 4px 24px rgba(0,0,0,0.04)',
              }}
            >
              {/* Winner crown */}
              {isWinner && bothLoaded && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 animate-scale-in">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg, #F1B123, #D89A0E)', color: 'white', boxShadow: '0 4px 12px rgba(241, 177, 35, 0.4)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    Better
                  </div>
                </div>
              )}

              {product ? (
                <>
                  {/* Grade */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${bothLoaded ? 'animate-grade-reveal' : ''}`}
                    style={{ background: GRADE_GRADIENTS[product.grade], boxShadow: GRADE_GLOWS[product.grade] }}
                  >
                    <span className="text-3xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{product.grade}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#1A1D2E] text-center line-clamp-2 mt-1">{product.product_name}</p>
                  <p className="text-[10px] text-[#6B7194]">Score: {product.score}</p>
                  <button onClick={() => clearSlot(slotNum)} className="text-[10px] text-[#6B7194]/40 hover:text-red-400 min-h-[36px] px-2 flex items-center transition-colors">
                    Remove
                  </button>
                </>
              ) : (
                <button onClick={() => setShowModal(slotNum)} className="flex flex-col items-center justify-center gap-2 w-full py-8 text-[#6B7194] transition-colors hover:text-[#3A3F57]">
                  <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#6B7194]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </div>
                  <span className="text-xs font-medium">Add product</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* VS Badge */}
      {bothLoaded && (
        <div className="flex items-center -my-2 animate-scale-in">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
          <span className="mx-3 text-sm font-bold px-4 py-1.5 rounded-full animate-gold-pulse"
            style={{ background: 'linear-gradient(135deg, #F1B123, #D89A0E)', color: 'white', boxShadow: '0 4px 16px rgba(241, 177, 35, 0.35)' }}>
            VS
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
        </div>
      )}

      {/* Head-to-Head Nutrient Bars */}
      {bothLoaded && slot1 && slot2 && (
        <div className="flex flex-col gap-2.5 animate-slide-up stagger-3">
          <h3 className="text-xs font-semibold text-[#6B7194] uppercase tracking-wider px-1">Head to Head</h3>
          {NUTRIENTS.map(({ key, label, unit, lowerIsBetter, max }, i) => {
            const v1 = slot1.nutrition[key]
            const v2 = slot2.nutrition[key]
            const n1 = v1 !== null ? v1 : 0
            const n2 = v2 !== null ? v2 : 0
            const maxVal = Math.max(n1, n2, 1)

            let winner1 = false, winner2 = false
            if (v1 !== null && v2 !== null) {
              if (lowerIsBetter) { if (n1 < n2) winner1 = true; else if (n2 < n1) winner2 = true }
              else { if (n1 > n2) winner1 = true; else if (n2 > n1) winner2 = true }
            }

            return (
              <div key={key} className="glass-subtle rounded-xl p-3 animate-slide-up" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#1A1D2E]">{label}</span>
                  <span className="text-[10px] text-[#6B7194]">{lowerIsBetter ? 'lower is better' : 'higher is better'}</span>
                </div>

                {/* Product 1 bar */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] w-10 text-right text-[#6B7194] shrink-0">{v1 !== null ? `${Math.round(v1)}${unit}` : '--'}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(26, 29, 46, 0.04)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((n1 / maxVal) * 100, 100)}%`,
                        background: winner1
                          ? 'linear-gradient(90deg, #34D399, #059669)'
                          : winner2
                            ? 'linear-gradient(90deg, #FB923C, #EA580C)'
                            : 'linear-gradient(90deg, #94A3B8, #64748B)',
                        boxShadow: winner1 ? '0 0 8px rgba(5, 150, 105, 0.3)' : 'none',
                      }}
                    />
                  </div>
                  {winner1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                </div>

                {/* Product 2 bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-10 text-right text-[#6B7194] shrink-0">{v2 !== null ? `${Math.round(v2)}${unit}` : '--'}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(26, 29, 46, 0.04)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((n2 / maxVal) * 100, 100)}%`,
                        background: winner2
                          ? 'linear-gradient(90deg, #34D399, #059669)'
                          : winner1
                            ? 'linear-gradient(90deg, #FB923C, #EA580C)'
                            : 'linear-gradient(90deg, #94A3B8, #64748B)',
                        boxShadow: winner2 ? '0 0 8px rgba(5, 150, 105, 0.3)' : 'none',
                      }}
                    />
                  </div>
                  {winner2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-1">
                  <span className={`text-[9px] ${winner1 ? 'text-emerald-600 font-semibold' : 'text-[#6B7194]'}`}>{slot1.product_name.split(' ').slice(0, 2).join(' ')}</span>
                  <span className={`text-[9px] ${winner2 ? 'text-emerald-600 font-semibold' : 'text-[#6B7194]'}`}>{slot2.product_name.split(' ').slice(0, 2).join(' ')}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Scorecard Summary */}
      {bothLoaded && slot1 && slot2 && (
        <div className="animate-slide-up stagger-5">
          {(() => {
            let wins1 = 0, wins2 = 0
            NUTRIENTS.forEach(({ key, lowerIsBetter }) => {
              const v1 = slot1.nutrition[key]
              const v2 = slot2.nutrition[key]
              if (v1 !== null && v2 !== null) {
                if (lowerIsBetter) { if (v1 < v2) wins1++; else if (v2 < v1) wins2++ }
                else { if (v1 > v2) wins1++; else if (v2 > v1) wins2++ }
              }
            })
            return (
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(26, 29, 46, 0.9), rgba(45, 49, 72, 0.9))', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-white">{wins1}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{slot1.product_name.split(' ').slice(0, 2).join(' ')}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Wins</p>
                  <div className="w-8 h-0.5 rounded-full bg-[#F1B123]" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-white">{wins2}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{slot2.product_name.split(' ').slice(0, 2).join(' ')}</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* AI Verdict */}
      {bothLoaded && (
        <div className="animate-slide-up stagger-6 rounded-2xl p-4" style={{ background: 'rgba(241, 177, 35, 0.04)', border: '1px solid rgba(241, 177, 35, 0.12)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F1B123, #D89A0E)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-[#1A1D2E]">AI Verdict</h3>
          </div>
          {verdictLoading ? (
            <div className="flex items-center gap-2.5 py-4 justify-center">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#F1B123] rounded-full animate-bounce" />
                <span className="w-2.5 h-2.5 bg-[#F1B123] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2.5 h-2.5 bg-[#F1B123] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          ) : verdict ? (
            <p className="text-sm text-[#3A3F57] leading-relaxed whitespace-pre-line">{verdict}</p>
          ) : null}
        </div>
      )}

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowModal(null)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl px-6 py-6 flex flex-col gap-3 animate-slide-up-full" onClick={(e) => e.stopPropagation()} style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-2" />
            <h2 className="text-base font-bold text-[#1A1D2E] mb-1">Select Product</h2>

            <button onClick={() => router.push(`/scan?mode=label&return=compare&slot=${showModal}`)} className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl btn-gold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Scan Nutrition Label
            </button>
            <button onClick={() => router.push(`/scan?mode=barcode&return=compare&slot=${showModal}`)} className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl btn-ink text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
              Scan Barcode
            </button>

            {history.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-xs font-semibold text-[#6B7194]/60 uppercase tracking-wider">From History</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {history.map((entry, i) => (
                    <button key={`${entry.scanned_at}-${i}`} onClick={() => selectFromHistory(entry)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all hover:bg-[#F8F9FC] active:scale-[0.99]"
                      style={{ border: '1px solid rgba(26, 29, 46, 0.06)' }}>
                      <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}>{entry.grade}</span>
                      <span className="text-sm text-[#1A1D2E] truncate flex-1">{entry.product_name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setShowModal(null)} className="mt-2 py-2 text-sm text-[#6B7194]/50 transition-colors hover:text-[#6B7194] min-h-[44px] w-full">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
