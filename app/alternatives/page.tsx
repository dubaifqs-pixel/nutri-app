'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GRADE_COLORS, GRADE_GRADIENTS, type Grade, type NutritionData, type ProductData, type GradeResult } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'
import EmptyState from '@/components/illustrations/EmptyState'

interface Alternative {
  product_name: string
  brand: string
  image_url: string | null
  grade: Grade
  score: number
  nutrition: NutritionData
  source: 'usda' | 'openfoodfacts' | 'manual' | 'ai_knowledge'
  data_source?: string
}

interface RecommendResponse {
  alternatives: Alternative[]
  summary: string
  category: string | null
}

type FilterKey = 'all' | 'low_sugar' | 'low_fat' | 'high_protein' | 'low_sodium' | 'high_fiber'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'low_sugar', label: 'Low Sugar' },
  { key: 'low_fat', label: 'Low Fat' },
  { key: 'high_protein', label: 'High Protein' },
  { key: 'low_sodium', label: 'Low Sodium' },
  { key: 'high_fiber', label: 'High Fiber' },
]

function passesFilter(nutrition: NutritionData, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'low_sugar':
      return nutrition.sugars_g !== null && nutrition.sugars_g < 5
    case 'low_fat':
      return nutrition.saturated_fat_g !== null && nutrition.saturated_fat_g < 3
    case 'high_protein':
      return nutrition.protein_g !== null && nutrition.protein_g > 8
    case 'low_sodium':
      return nutrition.sodium_mg !== null && nutrition.sodium_mg < 200
    case 'high_fiber':
      return nutrition.fiber_g !== null && nutrition.fiber_g > 3
  }
}

const SOURCE_LABELS: Record<string, string> = {
  usda: 'USDA',
  openfoodfacts: 'OpenFoodFacts',
  manual: 'Curated',
  ai_knowledge: 'AI Knowledge',
}

function formatVal(val: number | null): string {
  if (val === null) return '--'
  return String(Math.round(val * 10) / 10)
}

export default function AlternativesPage() {
  const router = useRouter()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [data, setData] = useState<RecommendResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  useEffect(() => {
    const productData = sessionStorage.getItem('dfqs_product')
    const gradeData = sessionStorage.getItem('dfqs_grade')
    if (!productData || !gradeData) {
      router.push('/')
      return
    }
    const p: ProductData = JSON.parse(productData)
    const g: GradeResult = JSON.parse(gradeData)
    setProduct(p)
    setGradeResult(g)

    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_grade: g.grade,
        product_name: p.product_name,
        nutrition: p.nutrition,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not find alternatives. Please try again.')
        setLoading(false)
      })
  }, [router])

  const filteredAlternatives = data?.alternatives.filter((a) => passesFilter(a.nutrition, activeFilter)) ?? []

  const handleCompare = (alt: Alternative) => {
    if (!product || !gradeResult) return

    sessionStorage.setItem('dfqs_compare_1', JSON.stringify({
      product_name: product.product_name,
      nutrition: product.nutrition,
      image_url: product.image_url,
      source: product.source,
    }))
    sessionStorage.setItem('dfqs_compare_1_grade', JSON.stringify(gradeResult))

    const altGradeResult = calculateGrade(alt.nutrition)
    sessionStorage.setItem('dfqs_compare_2', JSON.stringify({
      product_name: alt.product_name,
      nutrition: alt.nutrition,
      image_url: alt.image_url,
      source: alt.source,
    }))
    sessionStorage.setItem('dfqs_compare_2_grade', JSON.stringify(altGradeResult))

    router.push('/compare')
  }

  if (!product || !gradeResult) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="w-10 h-10 border-2 border-[#F1B123] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-5 mesh-bg">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/result')} className="text-[#6B7194] transition-colors hover:text-[#1A1D2E] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#1A1D2E]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#1A1D2E]">Healthier Alternatives</h1>
      </div>

      {/* Original Product Card */}
      <div className="glass-card p-4 animate-slide-up stagger-1" style={{ borderRadius: '20px' }}>
        <p className="text-[10px] text-[#6B7194]/60 uppercase tracking-[0.1em] mb-2.5" style={{ fontFamily: 'var(--font-inter)' }}>Your Product</p>
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: GRADE_GRADIENTS[gradeResult.grade], boxShadow: `0 4px 12px ${GRADE_COLORS[gradeResult.grade]}40` }}
          >
            {gradeResult.grade}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A1D2E] truncate">{product.product_name}</p>
            <p className="text-xs text-[#6B7194] mt-0.5">Score: {gradeResult.score}</p>
          </div>
        </div>
        {/* Key bad nutrients */}
        <div className="flex gap-2 mt-3 text-xs flex-wrap">
          {product.nutrition.sugars_g !== null && product.nutrition.sugars_g > 9 && (
            <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full border border-red-100">Sugar: {formatVal(product.nutrition.sugars_g)}g</span>
          )}
          {product.nutrition.saturated_fat_g !== null && product.nutrition.saturated_fat_g > 3 && (
            <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full border border-red-100">Sat Fat: {formatVal(product.nutrition.saturated_fat_g)}g</span>
          )}
          {product.nutrition.sodium_mg !== null && product.nutrition.sodium_mg > 360 && (
            <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full border border-red-100">Sodium: {formatVal(product.nutrition.sodium_mg)}mg</span>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 animate-slide-up stagger-2" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className="shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[44px] flex items-center"
            style={
              activeFilter === f.key
                ? { background: 'linear-gradient(135deg, #F1B123, #D89A0E)', color: '#fff', boxShadow: '0 4px 12px rgba(241, 177, 35, 0.3)' }
                : { background: 'rgba(255, 255, 255, 0.6)', color: '#6B7194', border: '1px solid rgba(26, 29, 46, 0.08)', backdropFilter: 'blur(10px)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-10 h-10 border-2 border-[#F1B123] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7194]">Finding healthier alternatives...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-sm text-[#6B7194]">{error}</p>
          <button onClick={() => router.push('/result')} className="mt-4 text-sm text-[#F1B123] font-semibold">
            Go back
          </button>
        </div>
      )}

      {/* Alternatives List */}
      {!loading && !error && data && (
        <>
          {filteredAlternatives.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredAlternatives.map((alt, i) => (
                <AlternativeCard
                  key={`${alt.product_name}-${i}`}
                  alt={alt}
                  originalNutrition={product.nutrition}
                  onCompare={() => handleCompare(alt)}
                  delay={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <EmptyState
                message={
                  activeFilter !== 'all'
                    ? 'No alternatives match this filter. Try a different filter.'
                    : 'No healthier alternatives found.'
                }
                size={160}
              />
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="text-sm text-[#F1B123] font-semibold"
                >
                  Show all alternatives
                </button>
              )}
              <button
                onClick={() => router.push('/browse')}
                className="mt-2 px-5 py-2.5 rounded-2xl btn-outline text-sm"
              >
                Browse categories
              </button>
            </div>
          )}

          {/* AI Summary */}
          {data.summary && (
            <div className="glass-card p-4 mt-1" style={{ borderRadius: '20px', borderColor: 'rgba(241, 177, 35, 0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1B123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
                <h3 className="text-sm font-semibold text-[#1A1D2E]">AI Summary</h3>
              </div>
              <p className="text-sm text-[#3A3F57] leading-relaxed">{data.summary}</p>
            </div>
          )}
        </>
      )}

      {/* Back button */}
      <button
        onClick={() => router.push('/result')}
        className="w-full py-3.5 rounded-2xl btn-outline text-sm flex items-center justify-center gap-2 mt-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to result
      </button>
    </div>
  )
}

function AlternativeCard({
  alt,
  originalNutrition,
  onCompare,
  delay,
}: {
  alt: Alternative
  originalNutrition: NutritionData
  onCompare: () => void
  delay: number
}) {
  const comparisons = buildComparisons(alt.nutrition, originalNutrition)

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${delay * 80}ms`, borderRadius: '20px' }}>
      <div className="flex items-start gap-3">
        {/* Grade badge */}
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold"
          style={{ background: GRADE_GRADIENTS[alt.grade], boxShadow: `0 4px 12px ${GRADE_COLORS[alt.grade]}30` }}
        >
          {alt.grade}
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1D2E] truncate">{alt.product_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#6B7194]">Score: {alt.score}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: (alt.source === 'ai_knowledge' || alt.source === 'manual') ? 'rgba(241, 177, 35, 0.1)' : 'rgba(26, 29, 46, 0.05)',
                color: (alt.source === 'ai_knowledge' || alt.source === 'manual') ? '#D89A0E' : '#6B7194',
              }}
            >
              {SOURCE_LABELS[alt.source] || alt.source}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {alt.image_url && (
          <img
            src={alt.image_url}
            alt={alt.product_name}
            loading="lazy"
            className="shrink-0 w-10 h-10 rounded-xl object-cover bg-[#F0F1F5]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>

      {/* Nutrition mini row */}
      <div className="flex gap-3 mt-3 text-xs text-[#6B7194]">
        <span>{formatVal(alt.nutrition.energy_kcal)} kcal</span>
        <span>Sugar: {formatVal(alt.nutrition.sugars_g)}g</span>
        <span>Protein: {formatVal(alt.nutrition.protein_g)}g</span>
      </div>

      {/* Comparison arrows */}
      {comparisons.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
          {comparisons.map((c) => (
            <span key={c.label} className="flex items-center gap-1 text-xs">
              <span className="text-[#6B7194]">{c.label}:</span>
              <span className="text-[#6B7194]/60">{c.from}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              <span className={c.improved ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{c.to}</span>
              {c.improved ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Compare button */}
      <button
        onClick={onCompare}
        className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-[#1A1D2E] flex items-center justify-center gap-1.5 btn-outline min-h-[44px]"
        style={{ background: 'rgba(241, 177, 35, 0.06)', borderColor: 'rgba(241, 177, 35, 0.15)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D89A0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
        Compare
      </button>
    </div>
  )
}

interface ComparisonItem {
  label: string
  from: string
  to: string
  improved: boolean
}

function buildComparisons(altNutrition: NutritionData, origNutrition: NutritionData): ComparisonItem[] {
  const items: ComparisonItem[] = []

  if (origNutrition.sugars_g !== null && altNutrition.sugars_g !== null && origNutrition.sugars_g !== altNutrition.sugars_g) {
    items.push({
      label: 'Sugar',
      from: `${formatVal(origNutrition.sugars_g)}g`,
      to: `${formatVal(altNutrition.sugars_g)}g`,
      improved: altNutrition.sugars_g < origNutrition.sugars_g,
    })
  }

  if (origNutrition.energy_kcal !== null && altNutrition.energy_kcal !== null && origNutrition.energy_kcal !== altNutrition.energy_kcal) {
    items.push({
      label: 'Calories',
      from: `${formatVal(origNutrition.energy_kcal)}`,
      to: `${formatVal(altNutrition.energy_kcal)}`,
      improved: altNutrition.energy_kcal < origNutrition.energy_kcal,
    })
  }

  if (origNutrition.saturated_fat_g !== null && altNutrition.saturated_fat_g !== null && origNutrition.saturated_fat_g !== altNutrition.saturated_fat_g) {
    items.push({
      label: 'Sat Fat',
      from: `${formatVal(origNutrition.saturated_fat_g)}g`,
      to: `${formatVal(altNutrition.saturated_fat_g)}g`,
      improved: altNutrition.saturated_fat_g < origNutrition.saturated_fat_g,
    })
  }

  return items.slice(0, 3)
}
