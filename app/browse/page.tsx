'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_PRODUCTS, getDemoProductCount } from '@/lib/demo-products'
import { getCategoryImage, getProductImage } from '@/lib/product-images'
import { calculateGrade } from '@/lib/scoring'
import { GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { useT } from '@/lib/i18n'

const CATEGORY_IDS = ['dairy', 'beverages', 'snacks', 'cereals', 'bread', 'meat', 'fruits', 'frozen'] as const
type CategoryId = typeof CATEGORY_IDS[number]

type Filter = 'all' | 'healthy' | 'avoid' | 'kids'

interface SearchHit {
  product_name: string
  grade: Grade
  category: CategoryId
  image: string
}

export default function BrowsePage() {
  const router = useRouter()
  const t = useT()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [recent, setRecent] = useState<HistoryEntry[]>([])

  useEffect(() => { setRecent(getHistory().slice(0, 8)) }, [])

  // Flatten + grade all demo products for trending and search
  const allProducts = useMemo<SearchHit[]>(() => {
    const list: SearchHit[] = []
    for (const cat of CATEGORY_IDS) {
      const products = (DEMO_PRODUCTS as any)[cat] as { product_name: string; nutrition: any }[] | undefined
      if (!products) continue
      for (const p of products) {
        const g = calculateGrade(p.nutrition)
        list.push({
          product_name: p.product_name,
          grade: g.grade as Grade,
          category: cat,
          image: getProductImage(p.product_name, g.grade as Grade),
        })
      }
    }
    return list
  }, [])

  const trending = useMemo(() => {
    return [...allProducts].sort((a, b) => 'ABCDE'.indexOf(a.grade) - 'ABCDE'.indexOf(b.grade)).slice(0, 8)
  }, [allProducts])

  const filteredCategories = useMemo(() => {
    if (filter === 'all') return CATEGORY_IDS
    // For non-all filters, surface only categories that have matching products
    return CATEGORY_IDS.filter(cat => {
      const products = (DEMO_PRODUCTS as any)[cat] as { product_name: string; nutrition: any }[] | undefined
      if (!products?.length) return false
      return products.some(p => {
        const g = calculateGrade(p.nutrition).grade
        if (filter === 'healthy') return g === 'A' || g === 'B'
        if (filter === 'avoid') return g === 'D' || g === 'E'
        if (filter === 'kids') return g === 'A' || g === 'B'
        return true
      })
    })
  }, [filter])

  const searchHits = useMemo<SearchHit[]>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return allProducts.filter(p => p.product_name.toLowerCase().includes(q)).slice(0, 20)
  }, [search, allProducts])

  const goToProduct = (hit: SearchHit) => {
    const products = (DEMO_PRODUCTS as any)[hit.category] as { product_name: string; nutrition: any }[]
    const p = products.find(x => x.product_name === hit.product_name)
    if (!p) return
    const gradeResult = calculateGrade(p.nutrition)
    sessionStorage.setItem('dfqs_product', JSON.stringify({ product_name: p.product_name, nutrition: p.nutrition, source: 'manual' }))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
  }

  return (
    <div className="min-h-screen px-5 pt-6 pb-24 flex flex-col gap-4" style={{ background: '#F5F4F0' }}>
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl" style={{ color: '#7A7A7A' }} aria-label="Back home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1A1A1A' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#1A1A1A' }}>{t('browse.section')}</span>
          </div>
          <h1 className="text-[22px] font-extrabold" style={{ color: '#1A1A1A', letterSpacing: '-0.02em' }}>{t('browse.title')}</h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('browse.search')}
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-[14px] outline-none focus:ring-2"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.06)',
            color: '#1A1A1A',
            fontWeight: 500,
          }}
        />
      </div>

      {/* Search results overlay */}
      {search.trim() && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1" style={{ color: '#ACACAC' }}>
            {searchHits.length} results
          </span>
          {searchHits.length === 0 ? (
            <p className="text-[13px] py-4 text-center" style={{ color: '#7A7A7A' }}>No matches. Try a different brand or product.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
              {searchHits.map((hit, i) => (
                <button key={i} onClick={() => goToProduct(hit)} className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.99]"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#FAFAF7' }}>
                    <img src={hit.image} alt={hit.product_name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: '#1A1A1A' }}>{hit.product_name}</p>
                    <p className="text-[10px] font-medium" style={{ color: '#7A7A7A' }}>{t(`browse.cat.${hit.category}` as any)}</p>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-extrabold" style={{ background: GRADE_GRADIENTS[hit.grade] }}>
                    {hit.grade}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* When NOT searching: Recent + Trending + Filters + Grid */}
      {!search.trim() && (
        <>
          {/* Recent scans */}
          {recent.length > 0 && (
            <div className="flex flex-col gap-2 -mx-5 animate-slide-up">
              <div className="flex items-center justify-between px-5">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1A1A1A' }}>{t('browse.recentScans')}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
                {recent.map((entry, i) => (
                  <button key={`${entry.scanned_at}-${i}`}
                    onClick={() => {
                      const nutrition = entry.nutrition || { energy_kcal: null, sugars_g: null, saturated_fat_g: null, sodium_mg: null, protein_g: null, fiber_g: null, fruits_veg_percent: null }
                      const gradeResult = calculateGrade(nutrition)
                      sessionStorage.setItem('dfqs_product', JSON.stringify({ product_name: entry.product_name, nutrition, image_url: entry.image_url, source: entry.source }))
                      sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
                      router.push('/result')
                    }}
                    className="shrink-0 flex flex-col items-center gap-1.5 w-[88px] p-2.5 rounded-2xl"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#FAFAF7' }}>
                      <img
                        src={entry.image_url || getProductImage(entry.product_name, entry.grade as Grade)}
                        alt={entry.product_name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-bold leading-tight text-center line-clamp-2 w-full" style={{ color: '#1A1A1A' }}>
                      {entry.product_name.split(' ').slice(0, 2).join(' ')}
                    </span>
                    <span className="text-[10px] font-extrabold w-5 h-5 rounded-md flex items-center justify-center text-white" style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}>
                      {entry.grade}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div className="flex flex-col gap-2 -mx-5 animate-slide-up">
            <div className="flex items-center justify-between px-5">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#1A1A1A' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 1.821.487 3.53 1.338 5"/><path d="m13.41 10.59 2.83-2.83a1 1 0 0 1 1.41 0l4.95 4.95a1 1 0 0 1 0 1.41l-2.83 2.83a1 1 0 0 1-1.41 0l-4.95-4.95a1 1 0 0 1 0-1.41Z"/></svg>
                {t('browse.trending')}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
              {trending.map((hit, i) => (
                <button key={i} onClick={() => goToProduct(hit)}
                  className="shrink-0 flex flex-col items-start gap-1.5 w-[120px] p-2.5 rounded-2xl"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="relative w-full h-16 rounded-xl flex items-center justify-center" style={{ background: '#FAFAF7' }}>
                    <img src={hit.image} alt={hit.product_name} className="w-14 h-14 object-contain" />
                    <span className="absolute top-1 right-1 text-[9px] font-extrabold w-5 h-5 rounded-md flex items-center justify-center text-white" style={{ background: GRADE_GRADIENTS[hit.grade] }}>
                      {hit.grade}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold leading-tight line-clamp-2 w-full text-left" style={{ color: '#1A1A1A' }}>
                    {hit.product_name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto -mx-5 px-5 no-scrollbar flex-shrink-0">
            {(['all', 'healthy', 'avoid', 'kids'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: filter === f ? '#1A1A1A' : '#FFFFFF',
                  color: filter === f ? '#FFFFFF' : '#1A1A1A',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {t(`browse.filter.${f}` as any)}
              </button>
            ))}
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map((catId: CategoryId, i) => {
              const imageUrl = getCategoryImage(catId)
              const count = getDemoProductCount(catId)
              const name = t(`browse.cat.${catId}` as const)
              const description = t(`browse.cat.${catId}.desc` as const)
              return (
                <button
                  key={catId}
                  onClick={() => router.push(`/browse/${catId}`)}
                  className="group relative flex flex-col items-start p-4 animate-slide-up overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    borderRadius: '22px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    minHeight: '160px',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <span className="text-[15px] font-extrabold relative z-10" style={{ color: '#1A1A1A', letterSpacing: '-0.01em' }}>{name}</span>
                  <span className="text-[11px] mt-1 relative z-10 font-medium" style={{ color: '#ACACAC' }}>{description}</span>
                  {count > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full mt-2 font-bold relative z-10" style={{ color: '#1A1A1A', background: '#F0FBDF', border: '1px solid #D4F5A8' }}>
                      {count} {t('browse.curated')}
                    </span>
                  )}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="absolute w-[120px] h-[120px] object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
                      style={{
                        insetInlineEnd: -12,
                        bottom: -12,
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12)) drop-shadow(0 3px 6px rgba(0,0,0,0.06))',
                      }}
                      loading="lazy"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
