'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLang } from '@/lib/i18n'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { calculateGrade } from '@/lib/scoring'
import type { Grade, NutritionData, GradeResult, NutrientKey } from '@/lib/types'
import { toHero } from '@/lib/v2-product'
import { BottomNavV2 } from '@/components/v2/BottomNav'
import { GRADE_TILE, BG_PALETTE, type HeroProduct } from '@/components/v2/types'

interface CompareProduct {
  product_name: string
  nutrition: NutritionData
  grade: Grade
  score: number
  gradeResult: GradeResult
  image_url?: string
  hero: HeroProduct
}

function buildCompareProduct(name: string, nutrition: NutritionData, image_url: string | undefined, lang: 'en' | 'ar'): CompareProduct {
  const gradeResult = calculateGrade(nutrition)
  const hero = toHero({ product_name: name, nutrition, image_url }, lang)
  return {
    product_name: name,
    nutrition,
    grade: gradeResult.grade,
    score: hero.score,
    gradeResult,
    image_url,
    hero,
  }
}

const METRICS: { key: NutrientKey; en: string; ar: string; unit: string; lowerBetter: boolean; max: number }[] = [
  { key: 'sugars_g', en: 'SUGAR', ar: 'السكر', unit: 'g', lowerBetter: true, max: 50 },
  { key: 'protein_g', en: 'PROTEIN', ar: 'البروتين', unit: 'g', lowerBetter: false, max: 30 },
  { key: 'energy_kcal', en: 'CAL', ar: 'سعرات', unit: '', lowerBetter: true, max: 500 },
  { key: 'fiber_g', en: 'FIBER', ar: 'الألياف', unit: 'g', lowerBetter: false, max: 10 },
]

export default function ComparePage() {
  const router = useRouter()
  const t = useT()
  const lang = useLang() as 'en' | 'ar'
  const [slot1, setSlot1] = useState<CompareProduct | null>(null)
  const [slot2, setSlot2] = useState<CompareProduct | null>(null)
  const [showModal, setShowModal] = useState<1 | 2 | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => { setHistory(getHistory()) }, [])

  useEffect(() => {
    const load = (k: string, gk: string) => {
      const raw = sessionStorage.getItem(k)
      const rawG = sessionStorage.getItem(gk)
      if (!raw || !rawG) return null
      const p = JSON.parse(raw)
      return buildCompareProduct(p.product_name, p.nutrition, p.image_url, lang)
    }
    setSlot1(load('dfqs_compare_1', 'dfqs_compare_1_grade'))
    setSlot2(load('dfqs_compare_2', 'dfqs_compare_2_grade'))
  }, [lang])

  const selectFromHistory = useCallback((entry: HistoryEntry) => {
    if (!showModal) return
    const nutrition = entry.nutrition || { energy_kcal: null, sugars_g: null, saturated_fat_g: null, sodium_mg: null, protein_g: null, fiber_g: null, fruits_veg_percent: null }
    const cp = buildCompareProduct(entry.product_name, nutrition, entry.image_url, lang)
    const slotKey = showModal === 1 ? 'dfqs_compare_1' : 'dfqs_compare_2'
    const gradeKey = showModal === 1 ? 'dfqs_compare_1_grade' : 'dfqs_compare_2_grade'
    sessionStorage.setItem(slotKey, JSON.stringify({ product_name: entry.product_name, nutrition, image_url: entry.image_url, source: entry.source }))
    sessionStorage.setItem(gradeKey, JSON.stringify(cp.gradeResult))
    if (showModal === 1) setSlot1(cp); else setSlot2(cp)
    setShowModal(null)
  }, [showModal, lang])

  const clearSlot = (slot: 1 | 2) => {
    if (slot === 1) { setSlot1(null); sessionStorage.removeItem('dfqs_compare_1'); sessionStorage.removeItem('dfqs_compare_1_grade') }
    else { setSlot2(null); sessionStorage.removeItem('dfqs_compare_2'); sessionStorage.removeItem('dfqs_compare_2_grade') }
  }

  const winner = slot1 && slot2 ? (slot1.score >= slot2.score ? slot1 : slot2) : null
  const labels = lang === 'ar' ? {
    kicker: 'مقارنة',
    pickHero: (b: string) => `${b} الأفضل`,
    seeWhy: 'لماذا؟',
    addProduct: 'إضافة منتج',
    remove: 'إزالة',
    history: 'من السجل',
    cancel: 'إلغاء',
    addOne: 'أضف منتجاً آخر لبدء المقارنة',
  } : {
    kicker: 'HEAD TO HEAD',
    pickHero: (b: string) => `Pick ${b}`,
    seeWhy: 'See why',
    addProduct: 'Add product',
    remove: 'Remove',
    history: 'From History',
    cancel: 'Cancel',
    addOne: 'Add one more product to start comparing',
  }

  return (
    <div className="nutri-app" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      paddingBottom: 110,
    }}>
      <div style={{
        padding: '12px 18px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => router.push('/')} aria-label="back" style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
            <path d="M14 6l-6 6 6 6" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
        <div className="n-mono" style={{ color: 'var(--ink-3)' }}>{labels.kicker}</div>
        <div style={{ width: 36 }} />
      </div>

      {/* The duel */}
      <div style={{
        position: 'relative',
        margin: '10px 18px 0',
        height: 300,
        borderRadius: 28,
        overflow: 'hidden',
        display: 'flex',
      }}>
        <CompareSide product={slot1} side="left" lang={lang} onOpen={() => setShowModal(1)} onRemove={() => clearSlot(1)} />
        <CompareSide product={slot2} side="right" lang={lang} onOpen={() => setShowModal(2)} onRemove={() => clearSlot(2)} />
        {slot1 && slot2 && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--ink)', color: 'var(--lime)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ff-display)',
            fontWeight: 800, fontSize: 20, letterSpacing: '-0.04em',
            boxShadow: '0 16px 32px -10px rgba(0,0,0,0.45), 0 0 0 6px var(--surface)',
          }}>VS</div>
        )}
      </div>

      {/* Helper text when not full */}
      {!(slot1 && slot2) && (
        <div style={{
          padding: '14px 18px 0',
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
          fontSize: 13, color: 'var(--ink-3)', textAlign: 'center',
        }}>
          {labels.addOne}
        </div>
      )}

      {/* Per-metric delta bars */}
      {slot1 && slot2 && (
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 22,
            padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {METRICS.map((m) => (
              <DeltaRow key={m.key} metric={m} a={slot1.nutrition} b={slot2.nutrition} lang={lang} />
            ))}
          </div>
        </div>
      )}

      {/* Verdict ribbon */}
      {winner && slot1 && slot2 && (
        <div style={{ padding: '12px 18px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12,
            background: 'var(--ink)', color: '#fff',
            borderRadius: 20,
            padding: '12px 14px 12px 16px',
            boxShadow: '0 18px 36px -16px rgba(0,0,0,0.45)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span className="n-mono" style={{ color: 'var(--lime)' }}>
                {lang === 'ar' ? 'الخيار' : 'THE PICK'}
              </span>
              <span style={{
                fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
                fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>{labels.pickHero(winner.hero.brand)}</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem('dfqs_product', JSON.stringify({
                  product_name: winner.product_name, nutrition: winner.nutrition, source: 'manual', image_url: winner.image_url,
                }))
                sessionStorage.setItem('dfqs_grade', JSON.stringify(winner.gradeResult))
                router.push('/result')
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--lime)', color: 'var(--ink)',
                border: 'none', cursor: 'pointer',
                fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
                fontWeight: 700, fontSize: 12,
              }}
            >
              {labels.seeWhy}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <BottomNavV2 active="compare" />

      {/* Selection modal */}
      {showModal && (
        <div onClick={() => setShowModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)', zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', maxWidth: 448,
            background: 'var(--paper)',
            borderRadius: '24px 24px 0 0',
            padding: '20px 24px 24px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{
              alignSelf: 'center', width: 40, height: 4,
              background: 'rgba(0,0,0,0.06)', borderRadius: 999,
              marginBottom: 8,
            }} />
            <h2 style={{
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
              fontWeight: 700, fontSize: 18, margin: 0,
              color: 'var(--ink)', marginBottom: 4,
            }}>{lang === 'ar' ? 'اختر منتجاً' : 'Select Product'}</h2>

            <button onClick={() => router.push(`/scan?mode=label&return=compare&slot=${showModal}`)} style={modalBtnLime}>
              {lang === 'ar' ? 'مسح الملصق الغذائي' : 'Scan Nutrition Label'}
            </button>
            <button onClick={() => router.push(`/scan?mode=barcode&return=compare&slot=${showModal}`)} style={modalBtnDark}>
              {lang === 'ar' ? 'مسح الباركود' : 'Scan Barcode'}
            </button>
            <button onClick={() => router.push(`/browse?return=compare&slot=${showModal}`)} style={modalBtnNeutral}>
              {lang === 'ar' ? 'اختر من الكتالوج' : 'Pick from catalog'}
            </button>

            {history.length > 0 && (
              <>
                <div className="n-mono" style={{ color: 'var(--ink-3)', marginTop: 8 }}>{labels.history}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {history.map((entry, i) => (
                    <button
                      key={`${entry.scanned_at}-${i}`}
                      onClick={() => selectFromHistory(entry)}
                      style={historyBtn}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: GRADE_TILE[entry.grade as Grade].bg,
                        color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--ff-display)', fontWeight: 800,
                        fontSize: 14, letterSpacing: '-0.03em',
                      }}>{entry.grade}</span>
                      <span style={{
                        fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
                        fontSize: 13, fontWeight: 600,
                        color: 'var(--ink)', flex: 1, textAlign: lang === 'ar' ? 'right' : 'left',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{entry.product_name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <button onClick={() => setShowModal(null)} style={{
              padding: '10px 0', background: 'transparent', border: 'none',
              color: 'var(--ink-3)', fontSize: 14, cursor: 'pointer',
            }}>{labels.cancel}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
function CompareSide({
  product,
  side,
  lang,
  onOpen,
  onRemove,
}: {
  product: CompareProduct | null
  side: 'left' | 'right'
  lang: 'en' | 'ar'
  onOpen: () => void
  onRemove: () => void
}) {
  const isLeft = side === 'left'

  if (!product) {
    return (
      <button
        onClick={onOpen}
        style={{
          flex: 1, position: 'relative',
          background: 'rgba(255,255,255,0.96)',
          overflow: 'hidden',
          [isLeft ? 'borderRight' : 'borderLeft']: '0.5px solid rgba(0,0,0,0.08)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          border: '2px dashed rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-3)', fontSize: 32, fontWeight: 300,
        }}>+</div>
      </button>
    )
  }

  const bg = BG_PALETTE[product.hero.bg]
  const grade = GRADE_TILE[product.grade]

  return (
    <div style={{
      flex: 1, position: 'relative',
      background: 'rgba(255,255,255,0.96)',
      overflow: 'hidden',
      [isLeft ? 'borderRight' : 'borderLeft']: '0.5px solid rgba(0,0,0,0.08)',
      boxShadow: `inset ${isLeft ? '6px' : '-6px'} 0 24px -16px ${bg.accent}aa, inset 0 1px 0 rgba(255,255,255,0.9)`,
    }}>
      <div aria-hidden style={{
        position: 'absolute',
        top: -40,
        [isLeft ? 'left' : 'right']: -40,
        width: 140, height: 140, borderRadius: '50%',
        background: `radial-gradient(circle, ${bg.accent}55 0%, ${bg.accent}00 70%)`,
        pointerEvents: 'none', zIndex: 1,
      }}/>
      <div style={{
        position: 'absolute', top: 14,
        [isLeft ? 'left' : 'right']: 14,
        zIndex: 3,
      }}>
        <span className="n-mono" style={{ color: bg.ink, opacity: 0.7 }}>
          {lang === 'ar' ? product.hero.brand : product.hero.brand.toUpperCase()}
        </span>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 76,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 88, height: 110,
        zIndex: 2,
        filter: `drop-shadow(0 18px 22px ${bg.accent}66) drop-shadow(0 6px 8px rgba(0,0,0,0.10))`,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.hero.image} alt={product.product_name}
             style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 38, left: 12, right: 12,
        zIndex: 3,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
      }}>
        <div style={{
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 700, fontSize: 13,
          lineHeight: 1.05, letterSpacing: '-0.02em',
          color: bg.ink, textAlign: 'center',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{product.hero.product_name}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px 4px 4px',
          background: '#fff',
          borderRadius: 999,
          boxShadow: '0 4px 12px -4px rgba(0,0,0,0.18)',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: grade.bg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ff-display)', fontWeight: 800,
            fontSize: 11, lineHeight: 1, letterSpacing: '-0.03em',
            color: 'var(--ink)',
          }}>{product.grade}</span>
          <span style={{
            fontFamily: 'var(--ff-display)', fontWeight: 700,
            fontSize: 13, lineHeight: 1, letterSpacing: '-0.02em',
            color: 'var(--ink)', fontFeatureSettings: '"tnum"',
          }}>{product.score}</span>
        </div>
      </div>

      <button onClick={onRemove} style={{
        position: 'absolute', bottom: 12, left: 0, right: 0,
        background: 'transparent', border: 'none',
        fontSize: 10, color: 'var(--ink-3)', cursor: 'pointer',
        zIndex: 3, fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-mono)',
        textTransform: lang === 'ar' ? 'none' : 'uppercase',
        letterSpacing: lang === 'ar' ? 0 : '0.08em',
      }}>{lang === 'ar' ? 'إزالة' : 'Remove'}</button>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
function DeltaRow({
  metric,
  a, b,
  lang,
}: {
  metric: typeof METRICS[number]
  a: NutritionData
  b: NutritionData
  lang: 'en' | 'ar'
}) {
  const aVal = (a[metric.key] ?? 0) as number
  const bVal = (b[metric.key] ?? 0) as number
  let winner: 'a' | 'b' | 'tie' = 'tie'
  if (aVal !== bVal) {
    if (metric.lowerBetter) winner = aVal < bVal ? 'a' : 'b'
    else winner = aVal > bVal ? 'a' : 'b'
  }
  const aPct = Math.min(100, (aVal / metric.max) * 100)
  const bPct = Math.min(100, (bVal / metric.max) * 100)
  const winColor = 'var(--lime)'
  const loseColor = 'rgba(0,0,0,0.18)'
  const aColor = winner === 'a' ? winColor : winner === 'b' ? loseColor : 'rgba(0,0,0,0.32)'
  const bColor = winner === 'b' ? winColor : winner === 'a' ? loseColor : 'rgba(0,0,0,0.32)'
  const fmt = (v: number) => `${v}${metric.unit}`

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 40px',
      alignItems: 'center', columnGap: 10,
    }}>
      <div style={{
        textAlign: lang === 'ar' ? 'left' : 'right',
        fontFamily: 'var(--ff-display)', fontWeight: winner === 'a' ? 800 : 600,
        fontSize: 14, letterSpacing: '-0.02em',
        color: winner === 'a' ? 'var(--ink)' : 'var(--ink-3)',
        fontFeatureSettings: '"tnum"',
      }}>{fmt(aVal)}</div>

      <div style={{ position: 'relative', height: 22 }}>
        <div style={{ position: 'absolute', top: 4, bottom: 4, left: '50%', width: 1, background: 'rgba(0,0,0,0.06)' }}/>
        <div style={{
          position: 'absolute', top: 8, height: 6, right: '50%',
          width: `${aPct / 2}%`, background: aColor,
          borderRadius: '999px 0 0 999px',
          minWidth: aVal === 0 ? 0 : 4,
        }}/>
        <div style={{
          position: 'absolute', top: 8, height: 6, left: '50%',
          width: `${bPct / 2}%`, background: bColor,
          borderRadius: '0 999px 999px 0',
          minWidth: bVal === 0 ? 0 : 4,
        }}/>
        <div className="n-mono" style={{
          position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-2)',
          padding: '0 6px',
          color: 'var(--ink-3)',
          whiteSpace: 'nowrap',
        }}>{lang === 'ar' ? metric.ar : metric.en}</div>
      </div>

      <div style={{
        textAlign: lang === 'ar' ? 'right' : 'left',
        fontFamily: 'var(--ff-display)', fontWeight: winner === 'b' ? 800 : 600,
        fontSize: 14, letterSpacing: '-0.02em',
        color: winner === 'b' ? 'var(--ink)' : 'var(--ink-3)',
        fontFeatureSettings: '"tnum"',
      }}>{fmt(bVal)}</div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

const modalBtnLime: React.CSSProperties = {
  padding: '14px 16px',
  background: 'var(--lime)', color: 'var(--ink)',
  border: 'none', borderRadius: 18,
  fontFamily: 'var(--ff-display)',
  fontWeight: 700, fontSize: 14,
  cursor: 'pointer',
  textAlign: 'inherit',
}
const modalBtnDark: React.CSSProperties = {
  padding: '14px 16px',
  background: 'var(--ink)', color: 'var(--lime)',
  border: 'none', borderRadius: 18,
  fontFamily: 'var(--ff-display)',
  fontWeight: 700, fontSize: 14,
  cursor: 'pointer',
  textAlign: 'inherit',
}
const modalBtnNeutral: React.CSSProperties = {
  padding: '14px 16px',
  background: 'var(--surface-2)', color: 'var(--ink)',
  border: 'none', borderRadius: 18,
  fontFamily: 'var(--ff-display)',
  fontWeight: 700, fontSize: 14,
  cursor: 'pointer',
  textAlign: 'inherit',
}
const historyBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '10px 12px',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 14, background: 'var(--paper)',
  cursor: 'pointer',
}
