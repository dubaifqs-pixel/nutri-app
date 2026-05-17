'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_GRADIENTS, type Grade, type NutritionData, type GradeResult, type NutrientKey } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'
import { useT } from '@/lib/i18n'

interface CompareProduct {
  product_name: string
  nutrition: NutritionData
  grade: Grade
  score: number
  gradeResult: GradeResult
  image_url?: string
}

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E']

const NUTRIENTS: { key: NutrientKey; label: string; unit: string; lowerIsBetter: boolean }[] = [
  { key: 'energy_kcal', label: 'Calories', unit: 'kcal', lowerIsBetter: true },
  { key: 'sugars_g', label: 'Sugar', unit: 'g', lowerIsBetter: true },
  { key: 'saturated_fat_g', label: 'Sat. Fat', unit: 'g', lowerIsBetter: true },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', lowerIsBetter: true },
  { key: 'protein_g', label: 'Protein', unit: 'g', lowerIsBetter: false },
  { key: 'fiber_g', label: 'Fiber', unit: 'g', lowerIsBetter: false },
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
  const t = useT()
  const [slot1, setSlot1] = useState<CompareProduct | null>(null)
  const [slot2, setSlot2] = useState<CompareProduct | null>(null)
  const [showModal, setShowModal] = useState<1 | 2 | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [verdict, setVerdict] = useState('')
  const [verdictLoading, setVerdictLoading] = useState(false)
  const [verdictOpen, setVerdictOpen] = useState(false)

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

  // Calculate wins per product
  let wins1 = 0, wins2 = 0
  if (slot1 && slot2) {
    NUTRIENTS.forEach(({ key, lowerIsBetter }) => {
      const v1 = slot1.nutrition[key]
      const v2 = slot2.nutrition[key]
      if (v1 !== null && v2 !== null) {
        if (lowerIsBetter) { if (v1 < v2) wins1++; else if (v2 < v1) wins2++ }
        else { if (v1 > v2) wins1++; else if (v2 > v1) wins2++ }
      }
    })
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ background: '#F5F4F0' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2 flex-shrink-0">
        <button onClick={() => router.push('/')} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl transition-colors" style={{ color: '#7A7A7A' }} aria-label="Back home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#B6F074' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#B6F074' }}>{t('compare.section')}</span>
          </div>
          <h1 className="text-[20px] font-extrabold" style={{ color: '#1A1A1A', letterSpacing: '-0.02em' }}>{t('compare.title')}</h1>
        </div>
      </div>

      {/* Compact product cards row */}
      <div className="grid grid-cols-2 gap-2 px-5 pb-2 flex-shrink-0">
        {([1, 2] as const).map((slotNum) => {
          const product = slotNum === 1 ? slot1 : slot2
          const isWinner = winner === slotNum
          const wins = slotNum === 1 ? wins1 : wins2
          return (
            <div
              key={slotNum}
              className="relative flex items-center gap-2.5 p-2.5 rounded-2xl transition-all"
              style={{
                background: '#FFFFFF',
                border: isWinner ? '1.5px solid #B6F074' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isWinner ? '0 4px 14px rgba(182, 240, 116, 0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {product ? (
                <>
                  {/* Grade tile */}
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white"
                    style={{ background: GRADE_GRADIENTS[product.grade] }}
                  >
                    <span className="text-xl font-extrabold leading-none">{product.grade}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold leading-tight line-clamp-2" style={{ color: '#1A1A1A' }}>{product.product_name}</p>
                    {bothLoaded && (
                      <p className="text-[10px] mt-0.5" style={{ color: isWinner ? '#558B2F' : '#7A7A7A', fontWeight: 700 }}>
                        {wins} {t('compare.wins')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => clearSlot(slotNum)} className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ color: '#ACACAC' }} aria-label="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </>
              ) : (
                <button onClick={() => setShowModal(slotNum)} className="flex items-center gap-2 w-full py-2 text-[#7A7A7A] transition-colors">
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </div>
                  <span className="text-[12px] font-semibold">{t('compare.addProduct')}</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Stat-by-stat split rows */}
      {bothLoaded && slot1 && slot2 && (
        <div className="flex-1 overflow-hidden px-5 pb-2 flex flex-col gap-1.5 min-h-0">
          <div className="flex items-center justify-between px-1 pb-0.5 flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#ACACAC' }}>{t('compare.headToHead')}</span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            {NUTRIENTS.map(({ key, label, unit, lowerIsBetter }) => {
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

              const w1pct = Math.min((n1 / maxVal) * 50, 50)
              const w2pct = Math.min((n2 / maxVal) * 50, 50)

              return (
                <div key={key} className="rounded-xl px-3 py-2 flex-1 flex flex-col justify-center min-h-0" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)' }}>
                  {/* Labels above split */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold tabular-nums" style={{ color: winner1 ? '#2E7D32' : '#ACACAC' }}>
                      {v1 !== null ? `${Math.round(v1)}${unit}` : '--'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#1A1A1A' }}>{label}</span>
                    <span className="text-[10px] font-semibold tabular-nums" style={{ color: winner2 ? '#2E7D32' : '#ACACAC' }}>
                      {v2 !== null ? `${Math.round(v2)}${unit}` : '--'}
                    </span>
                  </div>
                  {/* Mirrored split bar — left from center, right from center */}
                  <div className="relative h-2 flex items-center">
                    <div className="absolute left-0 right-1/2 h-full flex justify-end items-center pr-px">
                      <div
                        className="h-full rounded-l-full transition-all duration-700"
                        style={{
                          width: `${w1pct * 2}%`,
                          background: winner1 ? '#558B2F' : winner2 ? '#E0E0E0' : '#ACACAC',
                        }}
                      />
                    </div>
                    <div className="absolute left-1/2 right-0 h-full flex justify-start items-center pl-px">
                      <div
                        className="h-full rounded-r-full transition-all duration-700"
                        style={{
                          width: `${w2pct * 2}%`,
                          background: winner2 ? '#558B2F' : winner1 ? '#E0E0E0' : '#ACACAC',
                        }}
                      />
                    </div>
                    {/* Center divider */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-px h-3 bg-[rgba(0,0,0,0.1)]" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state when no products */}
      {!bothLoaded && (
        <div className="flex-1 flex items-center justify-center px-5 text-center">
          <p className="text-sm" style={{ color: '#7A7A7A' }}>
            {slot1 || slot2 ? t('compare.addOneMore') : t('compare.pickTwo')}
          </p>
        </div>
      )}

      {/* AI verdict — collapsible bottom sheet */}
      {bothLoaded && (
        <div className="flex-shrink-0 px-5 pb-5">
          <button
            onClick={() => setVerdictOpen(v => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl transition-all"
            style={{
              background: verdictOpen ? '#FFFFFF' : 'rgba(182, 240, 116, 0.12)',
              border: '1px solid rgba(182, 240, 116, 0.3)',
            }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B6F074, #A8E866)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            </div>
            <span className="text-[12px] font-bold flex-1 text-left" style={{ color: '#1A1A1A' }}>
              {verdictLoading ? 'Analyzing…' : t('compare.aiVerdict')}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: verdictOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          {verdictOpen && verdict && (
            <div className="mt-2 p-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: '#1A1A1A' }}>{verdict}</p>
            </div>
          )}
          {verdictOpen && verdictLoading && (
            <div className="mt-2 p-4 flex items-center justify-center gap-1.5" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="w-2 h-2 bg-[#B6F074] rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-[#B6F074] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-2 h-2 bg-[#B6F074] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
        </div>
      )}

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowModal(null)}>
          <div className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl px-6 py-6 flex flex-col gap-3 animate-slide-up-full" onClick={(e) => e.stopPropagation()} style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.1)' }}>
            <div className="w-10 h-1 bg-[rgba(0,0,0,0.06)] rounded-full mx-auto mb-2" />
            <h2 className="text-base font-bold text-[#1A1A1A] mb-1">{t('compare.selectProduct')}</h2>

            <button onClick={() => router.push(`/scan?mode=label&return=compare&slot=${showModal}`)} className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl btn-tangerine text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              {t('compare.scanLabel')}
            </button>
            <button onClick={() => router.push(`/scan?mode=barcode&return=compare&slot=${showModal}`)} className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl btn-espresso text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
              {t('compare.scanBarcode')}
            </button>

            {history.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-xs font-semibold text-[#ACACAC] uppercase tracking-wider">{t('compare.fromHistory')}</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {history.map((entry, i) => (
                    <button key={`${entry.scanned_at}-${i}`} onClick={() => selectFromHistory(entry)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all hover:bg-[#F5F4F0] active:scale-[0.99]"
                      style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                      <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}>{entry.grade}</span>
                      <span className="text-sm text-[#1A1A1A] truncate flex-1">{entry.product_name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setShowModal(null)} className="mt-2 py-2 text-sm text-[#ACACAC] transition-colors hover:text-[#7A7A7A] min-h-[44px] w-full">{t('compare.cancel')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
