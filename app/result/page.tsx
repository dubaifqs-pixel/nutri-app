'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLang } from '@/lib/i18n'
import type { ProductData, GradeResult, Grade, NutritionData } from '@/lib/types'
import { calculateNegativePoints, calculatePositivePoints } from '@/lib/scoring'
import { toHero } from '@/lib/v2-product'
import { Chip } from '@/components/v2/Chip'
import { ScorePill } from '@/components/v2/ScorePill'
import { BottomNavV2 } from '@/components/v2/BottomNav'
import { BG_PALETTE } from '@/components/v2/types'

const VERDICT_EN: Record<Grade, string> = { A: 'EXCELLENT', B: 'GOOD', C: 'FAIR', D: 'POOR', E: 'BAD' }
const VERDICT_AR: Record<Grade, string> = { A: 'ممتاز', B: 'جيد', C: 'متوسط', D: 'ضعيف', E: 'سيء' }

export default function ResultPage() {
  const router = useRouter()
  const t = useT()
  const lang = useLang() as 'en' | 'ar'
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')
  const [compareState, setCompareState] = useState<'idle' | 'added' | 'full'>('idle')

  useEffect(() => {
    const p = sessionStorage.getItem('dfqs_product')
    const g = sessionStorage.getItem('dfqs_grade')
    if (!p || !g) { router.push('/'); return }
    setProduct(JSON.parse(p))
    setGradeResult(JSON.parse(g))
  }, [router])

  const handleAddToCompare = useCallback(() => {
    if (!product || !gradeResult) return
    const slot1 = sessionStorage.getItem('dfqs_compare_1')
    const slot2 = sessionStorage.getItem('dfqs_compare_2')
    const payload = { product_name: product.product_name, nutrition: product.nutrition, image_url: product.image_url, source: product.source }
    let target: 1 | 2 | null = null
    if (!slot1) target = 1
    else if (!slot2) target = 2
    if (!target) {
      setCompareState('full')
      setTimeout(() => setCompareState('idle'), 2000)
      return
    }
    sessionStorage.setItem(`dfqs_compare_${target}`, JSON.stringify(payload))
    sessionStorage.setItem(`dfqs_compare_${target}_grade`, JSON.stringify(gradeResult))
    setCompareState('added')
    setTimeout(() => router.push('/compare'), 600)
  }, [product, gradeResult, router])

  const handleShare = useCallback(async () => {
    if (!product || !gradeResult) return
    const verdict = lang === 'ar' ? VERDICT_AR[gradeResult.grade] : VERDICT_EN[gradeResult.grade]
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://nutri-app-mocha.vercel.app'
    const text = lang === 'ar'
      ? `${product.product_name} حصل على تقدير ${gradeResult.grade} (${verdict}) على نيوتري. جرّبه: ${url}`
      : `I scanned ${product.product_name} on nutri and it got a grade ${gradeResult.grade} (${verdict})! Try it: ${url}`
    let shared = false
    type ShareNavigator = Navigator & { share?: (data: ShareData) => Promise<void> }
    const nav = navigator as ShareNavigator
    if (typeof navigator !== 'undefined' && nav.share) {
      try { await nav.share!({ text }); shared = true } catch { /* fallthrough */ }
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(text)
        setShareState('copied')
        setTimeout(() => setShareState('idle'), 2000)
      } catch { /* ignore */ }
    }
  }, [product, gradeResult, lang])

  const hero = useMemo(() => product ? toHero(product, lang) : null, [product, lang])

  if (!product || !gradeResult || !hero) {
    return (
      <div className="nutri-app" style={{ minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid var(--ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'nutri-pulse 1s linear infinite' }} />
      </div>
    )
  }

  const bg = BG_PALETTE[hero.bg]

  return (
    <div className="nutri-app" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => router.push('/')} aria-label="back" style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
            <path d="M14 6l-6 6 6 6" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleAddToCompare} aria-label={lang === 'ar' ? 'إضافة للمقارنة' : 'Add to compare'} style={iconBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--ink)" strokeWidth="2"/>
              <path d="M12 3v18" stroke="var(--ink)" strokeWidth="2"/>
            </svg>
          </button>
          <button onClick={handleShare} aria-label={lang === 'ar' ? 'مشاركة' : 'Share'} style={iconBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"
                    stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 18px 110px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <HeroPoster product={hero} grade={gradeResult} bg={bg} lang={lang} />

        <InsightCallout product={hero} grade={gradeResult} lang={lang} />

        <DailyHitStrip nutrition={product.nutrition} t={t} lang={lang} />

        <NutritionAnalysis nutrition={product.nutrition} grade={gradeResult} t={t} lang={lang} />

        <ProsConsCard nutrition={product.nutrition} t={t} lang={lang} />

        {/* Ingredient chips */}
        <div>
          <div className="n-mono" style={{ color: 'var(--ink-3)', marginBottom: 8, padding: '0 4px' }}>
            {lang === 'ar' ? 'المكوّنات' : 'INGREDIENT BREAKDOWN'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hero.chips.map((c, i) => (
              <Chip key={i} kind={c.kind} lang={lang}>{c.text}</Chip>
            ))}
          </div>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => router.push('/chat')}
            style={{ ...actionBtn, background: 'var(--lime)', color: 'var(--ink)' }}
          >
            {lang === 'ar' ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}
          </button>
          <button
            onClick={() => router.push('/alternatives')}
            style={{ ...actionBtn, background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)' }}
          >
            {lang === 'ar' ? 'البدائل' : 'Alternatives'}
          </button>
        </div>

        {/* Compare/share status messages */}
        {compareState === 'added' && (
          <div style={statusPill('var(--lime-soft)')}>{lang === 'ar' ? 'تمت الإضافة إلى المقارنة' : 'Added to compare'}</div>
        )}
        {compareState === 'full' && (
          <div style={statusPill('#ffd9d4')}>{lang === 'ar' ? 'المقارنة ممتلئة' : 'Compare is full'}</div>
        )}
        {shareState === 'copied' && (
          <div style={statusPill('var(--lime-soft)')}>{lang === 'ar' ? 'تم النسخ' : 'Copied to clipboard'}</div>
        )}
      </div>

      <BottomNavV2 />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
function HeroPoster({ product, grade, bg, lang }: { product: ReturnType<typeof toHero>; grade: GradeResult; bg: typeof BG_PALETTE['cream']; lang: 'en' | 'ar' }) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 32,
      overflow: 'hidden',
      padding: '20px 20px 22px',
      minHeight: 360,
      background: 'var(--surface)',
      border: '0.5px solid rgba(0,0,0,0.06)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 28px -18px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 10,
      }}>
        <span className="n-mono" style={{ color: bg.ink, opacity: 0.7 }}>
          {lang === 'ar' ? product.brand : product.brand.toUpperCase()}
        </span>
        <span className="n-mono" style={{ color: bg.ink, opacity: 0.55 }}>
          {product.size_label}
        </span>
      </div>

      <div style={{
        width: 152, height: 188, margin: '8px auto 16px',
        filter: `drop-shadow(0 28px 32px ${bg.accent}88) drop-shadow(0 10px 14px rgba(0,0,0,0.12))`,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.product_name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{
          margin: 0,
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 700,
          fontSize: lang === 'ar' ? 24 : 26,
          lineHeight: 1.05, letterSpacing: '-0.025em',
          color: bg.ink,
        }}>{product.product_name}</h1>
        <div style={{
          marginTop: 6,
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
          fontSize: 13, fontWeight: 500,
          lineHeight: 1.3, color: bg.ink, opacity: 0.7,
        }}>{product.take}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ScorePill grade={grade.grade} score={product.score} lang={lang} />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
function InsightCallout({ product, grade, lang }: { product: ReturnType<typeof toHero>; grade: GradeResult; lang: 'en' | 'ar' }) {
  const n = product.nutrition
  let kind: 'good' | 'warn' | 'bad' = 'warn'
  let text = lang === 'ar' ? 'متوسط من حيث القيمة الغذائية.' : 'Middling on nutrition.'

  if (grade.grade === 'A' || grade.grade === 'B') {
    kind = 'good'
    text = lang === 'ar' ? 'مكوّنات نظيفة وقيمة غذائية حقيقية.' : 'Clean ingredients, real nutritional value.'
  } else if (n.sugars_g !== null && n.sugars_g >= 20) {
    kind = 'bad'
    const pct = Math.min(99, Math.round((n.sugars_g / 50) * 100))
    text = lang === 'ar'
      ? `الكثير من السكر. ${pct}٪ من حدّك اليومي.`
      : `Too much sugar. ${pct}% of your daily limit.`
  } else if (n.sodium_mg !== null && n.sodium_mg >= 400) {
    kind = 'warn'
    text = lang === 'ar' ? `صوديوم مرتفع — ${Math.round(n.sodium_mg)} ملغ.` : `Salty business. ${Math.round(n.sodium_mg)}mg sodium.`
  } else if (n.saturated_fat_g !== null && n.saturated_fat_g >= 5) {
    kind = 'warn'
    text = lang === 'ar' ? `دهون مشبعة عالية ${n.saturated_fat_g}غ.` : `High saturated fat (${n.saturated_fat_g}g).`
  }

  const TONE = {
    good: { bg: 'var(--lime)',  ink: '#0a1a00', emoji: '✓' },
    warn: { bg: 'var(--yellow)', ink: '#2a1f00', emoji: '!' },
    bad:  { bg: '#ff8a7a',       ink: '#2a0800', emoji: '!' },
  }[kind]

  return (
    <div style={{
      position: 'relative',
      background: TONE.bg,
      borderRadius: 22,
      padding: '18px 18px 18px 58px',
      boxShadow: '0 14px 30px -16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4)',
    }}>
      <div style={{
        position: 'absolute',
        insetInlineStart: 16, top: 16,
        width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ff-display)', fontWeight: 800,
        fontSize: 16, color: TONE.ink,
      }}>{TONE.emoji}</div>
      <div style={{
        fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
        fontWeight: 700, fontSize: 16,
        lineHeight: 1.25, letterSpacing: '-0.02em',
        color: TONE.ink,
      }}>{text}</div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
function DailyHitStrip({ nutrition, t, lang }: { nutrition: NutritionData; t: ReturnType<typeof useT>; lang: 'en' | 'ar' }) {
  const DAILY = { cal: 2000, sugar: 50, sodium: 2300 }
  const items = [
    { l: lang === 'ar' ? 'الطاقة' : 'ENERGY', pct: nutrition.energy_kcal !== null ? Math.round((nutrition.energy_kcal / DAILY.cal) * 100) : 0, val: nutrition.energy_kcal !== null ? `${Math.round(nutrition.energy_kcal)} kcal` : '—' },
    { l: lang === 'ar' ? 'السكر' : 'SUGAR', pct: nutrition.sugars_g !== null ? Math.round((nutrition.sugars_g / DAILY.sugar) * 100) : 0, val: nutrition.sugars_g !== null ? `${nutrition.sugars_g}g` : '—' },
    { l: lang === 'ar' ? 'الصوديوم' : 'SODIUM', pct: nutrition.sodium_mg !== null ? Math.round((nutrition.sodium_mg / DAILY.sodium) * 100) : 0, val: nutrition.sodium_mg !== null ? `${Math.round(nutrition.sodium_mg)}mg` : '—' },
  ]
  const tone = (pct: number) => pct < 10 ? 'good' : pct < 25 ? 'med' : pct < 50 ? 'high' : 'vhigh'
  const TONE = {
    good:  { ring: 'var(--lime)',  ink: '#0a1a00' },
    med:   { ring: 'var(--yellow)', ink: '#2a1f00' },
    high:  { ring: '#ff9a4f',       ink: '#2a1500' },
    vhigh: { ring: '#ff6a4a',       ink: '#2a0800' },
  } as const
  const SIZE = 64
  const R = 26
  const C = 2 * Math.PI * R

  return (
    <div>
      <div className="n-mono" style={{ color: 'var(--ink-3)', marginBottom: 10, padding: '0 4px' }}>
        {lang === 'ar' ? 'حصة يومية' : 'DAILY HIT'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {items.map((it, i) => {
          const c = TONE[tone(it.pct)]
          const pct = Math.min(100, Math.max(0, it.pct)) / 100
          return (
            <div key={i} style={{
              background: 'var(--paper)',
              borderRadius: 18,
              padding: '12px 10px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: '0 0 0 0.5px rgba(0,0,0,0.04), 0 6px 16px -12px rgba(0,0,0,0.10)',
            }}>
              <div style={{ width: SIZE, height: SIZE, position: 'relative' }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                  <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6"/>
                  <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={c.ring} strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={C} strokeDashoffset={C - C * pct}
                          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}/>
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--ff-display)', fontWeight: 800,
                  fontSize: 14, letterSpacing: '-0.02em',
                  color: c.ink, fontFeatureSettings: '"tnum"',
                }}>{it.pct}%</div>
              </div>
              <div className="n-mono" style={{
                color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.2,
                fontSize: 9.5,
              }}>{it.l}</div>
              <div style={{
                fontFamily: 'var(--ff-mono)', fontSize: 10, fontWeight: 600,
                color: 'var(--ink-2)', letterSpacing: '0.02em',
                fontFeatureSettings: '"tnum"',
              }}>{it.val}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
function NutritionAnalysis({ nutrition, grade, t, lang }: { nutrition: NutritionData; grade: GradeResult; t: ReturnType<typeof useT>; lang: 'en' | 'ar' }) {
  const neg = calculateNegativePoints(nutrition)
  const pos = calculatePositivePoints(nutrition, neg.total)
  const proteinCounts = pos.protein_counted

  const labels = lang === 'ar' ? {
    title: 'تحليل التغذية',
    energy: 'الطاقة', sugars: 'السكريات', satFat: 'دهون مشبعة', sodium: 'الصوديوم',
    protein: 'البروتين', fiber: 'الألياف',
    positive: 'إيجابي', pts: 'نقاط',
    note: 'البروتين لا يُحسب (النقاط السلبية ≥ ١١)',
  } : {
    title: 'Nutrition Analysis',
    energy: 'Energy', sugars: 'Sugars', satFat: 'Saturated Fat', sodium: 'Sodium',
    protein: 'Protein', fiber: 'Fiber',
    positive: 'POSITIVE', pts: 'pts',
    note: 'Protein not counted (negative points ≥ 11)',
  }

  type Row = { label: string; value: string; pts: number; max: number; kind: 'neg' | 'pos'; muted?: boolean }
  const negRows: Row[] = [
    { label: labels.energy, value: nutrition.energy_kcal !== null ? `${Math.round(nutrition.energy_kcal)} kcal` : '—', pts: neg.energy, max: 10, kind: 'neg' },
    { label: labels.sugars, value: nutrition.sugars_g !== null ? `${nutrition.sugars_g}g` : '—', pts: neg.sugars, max: 10, kind: 'neg' },
    { label: labels.satFat, value: nutrition.saturated_fat_g !== null ? `${nutrition.saturated_fat_g}g` : '—', pts: neg.saturated_fat, max: 10, kind: 'neg' },
    { label: labels.sodium, value: nutrition.sodium_mg !== null ? `${Math.round(nutrition.sodium_mg)}mg` : '—', pts: neg.sodium, max: 10, kind: 'neg' },
  ]
  const posRows: Row[] = [
    { label: labels.protein, value: nutrition.protein_g !== null ? `${nutrition.protein_g}g` : '—', pts: pos.protein, max: 5, kind: 'pos', muted: !proteinCounts },
    { label: labels.fiber, value: nutrition.fiber_g !== null ? `${nutrition.fiber_g}g` : '—', pts: pos.fiber, max: 5, kind: 'pos' },
  ]

  return (
    <div style={{
      background: 'var(--paper)',
      borderRadius: 26,
      padding: '20px 20px 16px',
      boxShadow: '0 0 0 0.5px rgba(0,0,0,0.05), 0 14px 30px -18px rgba(0,0,0,0.10)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 17l4-4 4 3 4-6 6 7" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 21h18" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 700, fontSize: 18,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}>{labels.title}</span>
      </div>

      {negRows.map((r, i) => <NutrientRow key={i} row={r} ptsLabel={labels.pts} lang={lang} />)}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 6px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }}/>
        <span className="n-mono" style={{ color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{labels.positive}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }}/>
      </div>

      {posRows.map((r, i) => <NutrientRow key={i} row={r} ptsLabel={labels.pts} lang={lang} />)}

      {!proteinCounts && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'var(--surface-2)', borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-sans)',
          fontSize: 12, fontWeight: 500,
          color: 'var(--ink-3)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="9" stroke="var(--ink-3)" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {labels.note}
        </div>
      )}
    </div>
  )
}

function NutrientRow({ row, ptsLabel, lang }: { row: { label: string; value: string; pts: number; max: number; kind: 'neg' | 'pos'; muted?: boolean }; ptsLabel: string; lang: 'en' | 'ar' }) {
  const tone = nutrientTone(row)
  const COLORS: Record<string, { dot: string; text: string; fill: string }> = {
    good:    { dot: '#6cc24a', text: '#3a8a18', fill: '#6cc24a' },
    light:   { dot: '#9bcf50', text: '#3a8a18', fill: '#9bcf50' },
    med:     { dot: '#ffb547', text: '#a86a00', fill: '#ffb547' },
    high:    { dot: '#ff7a3a', text: '#c83d10', fill: '#ff7a3a' },
    vhigh:   { dot: '#e8402a', text: '#c83d10', fill: '#e8402a' },
    neutral: { dot: '#a8a8a8', text: 'var(--ink-3)', fill: '#a8a8a8' },
  }
  const c = COLORS[tone]
  const muted = row.muted
  const fillPct = Math.min(100, (row.pts / row.max) * 100)

  return (
    <div style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: muted ? '#cfcfcf' : c.dot, flexShrink: 0 }}/>
          <span style={{
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
            fontWeight: 700, fontSize: 16,
            letterSpacing: '-0.015em',
            color: muted ? 'var(--ink-3)' : 'var(--ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{row.label}</span>
        </div>
        <span style={{
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 700, fontSize: 17,
          letterSpacing: '-0.01em',
          color: muted ? 'var(--ink-4)' : c.text,
          fontFeatureSettings: '"tnum"',
          flexShrink: 0,
        }}>{row.value}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(0,0,0,0.05)', borderRadius: 999, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{
          width: `${fillPct}%`, height: '100%',
          background: muted ? '#d0d0d0' : c.fill,
          borderRadius: 999, transition: 'width 0.3s',
        }}/>
      </div>
      <div style={{
        textAlign: lang === 'ar' ? 'left' : 'right',
        fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
        fontWeight: 700, fontSize: 12,
        color: muted ? 'var(--ink-4)' : c.text,
        fontFeatureSettings: '"tnum"',
      }}>{row.pts} {ptsLabel}</div>
    </div>
  )
}

function nutrientTone(row: { kind: 'neg' | 'pos'; pts: number; muted?: boolean }): string {
  if (row.muted) return 'neutral'
  if (row.kind === 'neg') {
    if (row.pts === 0) return 'good'
    if (row.pts <= 2) return 'light'
    if (row.pts <= 4) return 'med'
    if (row.pts <= 7) return 'high'
    return 'vhigh'
  }
  if (row.pts === 0) return 'neutral'
  if (row.pts <= 1) return 'light'
  return 'good'
}

// ────────────────────────────────────────────────────────────
function ProsConsCard({ nutrition, t, lang }: { nutrition: NutritionData; t: ReturnType<typeof useT>; lang: 'en' | 'ar' }) {
  const pros: string[] = []
  const cons: string[] = []
  if (nutrition.fiber_g !== null && nutrition.fiber_g >= 2) pros.push(lang === 'ar' ? `ألياف ${nutrition.fiber_g}غ` : `Fiber ${nutrition.fiber_g}g`)
  if (nutrition.protein_g !== null && nutrition.protein_g >= 5) pros.push(lang === 'ar' ? `بروتين ${nutrition.protein_g}غ` : `Protein ${nutrition.protein_g}g`)
  if (nutrition.sugars_g !== null && nutrition.sugars_g < 5) pros.push(lang === 'ar' ? 'سكر منخفض' : 'Low sugar')
  if (nutrition.sodium_mg !== null && nutrition.sodium_mg < 100) pros.push(lang === 'ar' ? 'صوديوم منخفض' : 'Low sodium')

  if (nutrition.sugars_g !== null && nutrition.sugars_g >= 15) cons.push(lang === 'ar' ? `${nutrition.sugars_g}غ سكر` : `${nutrition.sugars_g}g sugar`)
  if (nutrition.saturated_fat_g !== null && nutrition.saturated_fat_g >= 3) cons.push(lang === 'ar' ? `دهون مشبعة ${nutrition.saturated_fat_g}غ` : `${nutrition.saturated_fat_g}g sat fat`)
  if (nutrition.sodium_mg !== null && nutrition.sodium_mg >= 400) cons.push(lang === 'ar' ? `صوديوم ${Math.round(nutrition.sodium_mg)}ملغ` : `${Math.round(nutrition.sodium_mg)}mg sodium`)
  if (nutrition.energy_kcal !== null && nutrition.energy_kcal >= 400) cons.push(lang === 'ar' ? `${Math.round(nutrition.energy_kcal)} سعرة` : `${Math.round(nutrition.energy_kcal)} kcal`)

  if (pros.length === 0) pros.push('—')
  if (cons.length === 0) cons.push('—')

  const proLabel = lang === 'ar' ? 'ما يعجبنا' : 'WHAT WE LIKE'
  const conLabel = lang === 'ar' ? 'ما يقلقنا' : 'WHAT WORRIES US'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <div style={{
        background: 'var(--lime-soft)',
        borderRadius: 18, padding: '12px 14px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#3a8a18" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="n-mono" style={{ color: '#3a8a18' }}>{proLabel}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pros.map((s, i) => (
            <div key={i} style={{
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
              fontWeight: 600, fontSize: 12.5,
              color: '#1a3a08', lineHeight: 1.3,
            }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#ffe4dc',
        borderRadius: 18, padding: '12px 14px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#c83d10" strokeWidth="2.2"/>
            <path d="M12 7v6M12 17h.01" stroke="#c83d10" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
          <span className="n-mono" style={{ color: '#c83d10' }}>{conLabel}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {cons.map((s, i) => (
            <div key={i} style={{
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
              fontWeight: 600, fontSize: 12.5,
              color: '#3a0e00', lineHeight: 1.3,
            }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

const actionBtn: React.CSSProperties = {
  flex: 1,
  height: 48,
  borderRadius: 24,
  border: 'none',
  fontFamily: 'var(--ff-display)',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
}

const statusPill = (bg: string): React.CSSProperties => ({
  alignSelf: 'center',
  background: bg,
  padding: '8px 14px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink)',
})
