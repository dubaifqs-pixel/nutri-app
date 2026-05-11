'use client'

import Link from 'next/link'
import LangToggle from '@/components/LangToggle'
import { useT } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { getProductImage } from '@/lib/product-images'
import { GRADE_COLORS, type Grade, type NutritionData } from '@/lib/types'
import { useEffect, useState, useRef, useCallback } from 'react'

// Product background colors matched to category
const PRODUCT_BG: Record<string, string> = {
  milk: '#EDE5D8', dairy: '#EDE5D8', laban: '#EDE5D8', cream: '#EDE5D8', yogurt: '#E8DDE8',
  cheese: '#F0E8D8', butter: '#F5EDD8',
  chocolate: '#D8CCC0', kitkat: '#D8CCC0', cocoa: '#D8CCC0', nutella: '#D8CCC0',
  snickers: '#D8CCC0', oreo: '#C8C0B8', cookie: '#D8CCC0',
  juice: '#F5D8A8', orange: '#F5D8A8', rani: '#F5D8A8', vimto: '#E0C0D0',
  cola: '#DBC0B0', coca: '#DBC0B0', pepsi: '#C0C8D8', soda: '#DBC0B0',
  water: '#D0E0E8', redbull: '#C8D0E0', energy: '#C8D0E0',
  chips: '#EEE0A8', lays: '#EEE0A8', pringles: '#EEE0A8', doritos: '#E8C8A0',
  cereal: '#C8D8B0', oats: '#D0D8B8', quaker: '#D0D8B8', kellogg: '#C8D8B0',
  bread: '#E8D8C0', chicken: '#E0D0C0', meat: '#E0D0C0',
  fruit: '#D0E8C8', apple: '#D0E8C8', banana: '#F0E8C0',
  frozen: '#D0D8E0', icecream: '#E8D0D8',
}

// Banner colors — handpicked to match each product bg
const BANNER_COLORS: Record<string, string> = {
  '#EDE5D8': '#B8A88E', // beige → warm sand
  '#DBC0B0': '#A8856E', // pinkish-brown → warm terracotta
  '#D8CCC0': '#A89078', // brown → warm mocha
  '#C8D8B0': '#6B7D55', // sage green → olive green (matching inspiration)
  '#F5D8A8': '#C4A060', // gold → warm amber
  '#E8E0D8': '#B0A090', // light beige → taupe
  '#D0E8C8': '#5E8A4A', // light green → forest green
  '#C8D0E0': '#7888A0', // light blue → slate blue
  '#E0D0C0': '#A88868', // tan → warm brown
  '#EEE0A8': '#B8A050', // yellow → golden brown
  '#F0E8C0': '#C0A860', // cream → amber
}

function getProductBg(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(PRODUCT_BG)) {
    if (lower.includes(key)) return color
  }
  return '#E8E0D8'
}

// Generate nutrition tags with colors
type NTag = { label: string; color: string }
function getNutritionTags(n: NutritionData): NTag[] {
  const tags: NTag[] = []
  if (n.sugars_g !== null) tags.push(n.sugars_g > 15
    ? { label: 'High sugar', color: '#ef4444' }
    : n.sugars_g <= 5 ? { label: 'Low sugar', color: '#10b981' }
    : { label: 'Sugar', color: '#f59e0b' })
  if (n.saturated_fat_g !== null) tags.push(n.saturated_fat_g > 5
    ? { label: 'High fat', color: '#ef4444' }
    : n.saturated_fat_g <= 2 ? { label: 'Low fat', color: '#10b981' }
    : { label: 'Fat', color: '#f59e0b' })
  if (n.protein_g !== null && n.protein_g > 5) tags.push({ label: 'Protein', color: '#8b5cf6' })
  if (n.fiber_g !== null && n.fiber_g > 3) tags.push({ label: 'Fiber', color: '#06b6d4' })
  if (n.sodium_mg !== null && n.sodium_mg > 500) tags.push({ label: 'High sodium', color: '#ef4444' })
  if (n.energy_kcal !== null && n.energy_kcal <= 100) tags.push({ label: 'Low cal', color: '#10b981' })
  return tags.slice(0, 3)
}

// Grade text colors
const GRADE_TEXT: Record<Grade, string> = {
  A: '#2E7D32', B: '#558B2F', C: '#F9A825', D: '#E65100', E: '#C62828',
}
const GRADE_LABEL: Record<Grade, string> = {
  A: 'Great', B: 'Good', C: 'Okay', D: 'Poor', E: 'Bad',
}

// Fallback nutrition facts (under 6 words)
const FALLBACK_FACTS: Record<string, string> = {
  'Al Ain Full Cream Milk': 'Rich in calcium & protein',
  'Coca-Cola Original': '39g sugar per 330ml can',
  'KitKat 4 Finger': '218 calories per bar',
  "Kellogg's Corn Flakes": 'Fortified with iron & vitamins',
  'Rani Orange Juice': 'Contains real fruit pieces',
  "Lay's Classic Chips": 'High in sodium & fat',
}

// Featured products
const FEATURED = [
  DEMO_PRODUCTS.dairy[0],
  DEMO_PRODUCTS.beverages[0],
  DEMO_PRODUCTS.snacks[1],
  DEMO_PRODUCTS.cereals[0],
  DEMO_PRODUCTS.beverages[3],
  DEMO_PRODUCTS.snacks[0],
].filter(Boolean).map(p => {
  const g = calculateGrade(p.nutrition)
  return {
    ...p,
    grade: g.grade as Grade,
    score: g.score,
    image: getProductImage(p.product_name, g.grade as Grade),
    bg: getProductBg(p.product_name),
    tags: getNutritionTags(p.nutrition),
    fact: FALLBACK_FACTS[p.product_name] || 'Scanned & verified by nutri',
  }
})

export default function Home() {
  const t = useT()
  const [facts, setFacts] = useState<Record<string, string>>(FALLBACK_FACTS)
  const [activeCard, setActiveCard] = useState(0)
  const touchStart = useRef(0)
  const touchDelta = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)

  const swipe = useCallback((dir: 1 | -1) => {
    setActiveCard(prev => Math.max(0, Math.min(FEATURED.length - 1, prev + dir)))
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
    setDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStart.current
    setDragX(touchDelta.current)
  }, [])

  const onTouchEnd = useCallback(() => {
    setDragging(false)
    setDragX(0)
    if (Math.abs(touchDelta.current) > 60) {
      swipe(touchDelta.current < 0 ? 1 : -1)
    }
    touchDelta.current = 0
  }, [swipe])

  useEffect(() => {
    // Preload images
    FEATURED.forEach(p => { const img = new Image(); img.src = p.image })

    // Load Gemini facts (cached in localStorage for 24h)
    const CACHE_KEY = 'nutri_facts_v2'
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const { facts: f, ts } = JSON.parse(cached)
        if (Date.now() - ts < 86400000) { setFacts(f); return }
      } catch {}
    }
    fetch('/api/facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: FEATURED.map(p => p.product_name) }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.facts) {
          setFacts(d.facts)
          localStorage.setItem(CACHE_KEY, JSON.stringify({ facts: d.facts, ts: Date.now() }))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col pb-[64px]" style={{ background: '#F5F4F0' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-7 pb-1 flex-shrink-0">
        <div>
          <p className="text-[11px] font-medium" style={{ color: '#ACACAC' }}>Welcome back</p>
          <p className="text-[15px] font-bold" style={{ color: '#1A1A1A' }}>nutri</p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M4 6h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      {/* Hero text */}
      <div className="px-5 pt-3 pb-1 flex-shrink-0">
        <p className="text-[22px] leading-[1.15]" style={{ color: '#1A1A1A', fontWeight: 400 }}>
          Scan your <span className="font-bold">food.</span><br/>
          <span className="font-bold">Eat smarter.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4 flex-shrink-0">
        <span className="text-[28px] font-extrabold leading-none" style={{ color: '#1A1A1A' }}>{FEATURED.length}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#FFEC89', color: '#1A1A1A' }}>Featured</span>
      </div>

      {/* Swipeable Card Carousel */}
      <div
        className="relative overflow-hidden"
        style={{ padding: '0 20px' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{
          display: 'flex',
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(calc(-${activeCard * 100}% + ${dragX}px))`,
        }}>
        {FEATURED.map((product, i) => (
          <div key={i} style={{ minWidth: '100%', padding: '0 4px' }}>
          <a
            onClick={(e) => {
              e.preventDefault()
              sessionStorage.setItem('dfqs_product', JSON.stringify({
                product_name: product.product_name,
                nutrition: product.nutrition,
              }))
              sessionStorage.setItem('dfqs_grade', JSON.stringify({
                grade: product.grade,
                score: product.score,
              }))
              window.location.href = '/result'
            }}
            className="block relative active:scale-[0.98] cursor-pointer"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: '#FFFFFF',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s ease',
            }}
          >
            {/* Grade badge — white corner */}
            <div style={{
              position: 'absolute', top: '0', right: '0', zIndex: 20,
              background: '#FFFFFF',
              borderBottomLeftRadius: '14px',
              padding: '3px 6px 5px 8px',
            }}>
              <span style={{ fontSize: '22px', fontWeight: 700, color: GRADE_TEXT[product.grade], lineHeight: 1 }}>{product.grade}</span>
              <span style={{ fontSize: '9px', fontWeight: 500, color: '#1A1A1A', opacity: 0.4 }}>{GRADE_LABEL[product.grade]}</span>
            </div>

            {/* Image area */}
            <div
              style={{
                margin: '6px',
                borderRadius: '14px',
                minHeight: '300px',
                background: product.bg,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div className="flex items-end justify-center" style={{ padding: '20px 16px 30px', minHeight: '300px' }}>
                <img
                  src={product.image}
                  alt={product.product_name}
                  className="max-h-[240px] object-contain"
                  style={{ filter: 'drop-shadow(2px 6px 14px rgba(0,0,0,0.18))' }}
                  loading="lazy"
                />
              </div>
              {/* Fact banner — gradient fade */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(to bottom, transparent 0%, ${BANNER_COLORS[product.bg] || '#8A7D65'}90 40%, ${BANNER_COLORS[product.bg] || '#8A7D65'} 100%)`,
                padding: '12px 10px 5px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                <span style={{ fontSize: '7px', fontWeight: 400, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px', fontStyle: 'italic' }}>{facts[product.product_name] || product.fact}</span>
              </div>
            </div>

            {/* Info area */}
            <div style={{ padding: '12px 16px 14px' }}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[18px] leading-snug" style={{ color: '#1A1A1A', fontWeight: 700 }}>{product.product_name}</p>
                <span className="shrink-0" style={{
                  fontSize: '10px', fontWeight: 600, color: '#1A1A1A',
                  border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px',
                  padding: '4px 10px', whiteSpace: 'nowrap',
                }}>View ↗</span>
              </div>

              {/* Tags — colored tinted pills */}
              <div className="flex gap-2 mt-3 overflow-hidden">
                {product.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="whitespace-nowrap"
                    style={{
                      fontSize: '10px', fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '10px',
                      border: `1px solid ${tag.color}30`,
                      background: `${tag.color}10`,
                      color: tag.color,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </a>
          </div>
        ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {FEATURED.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCard(i)}
              style={{
                width: i === activeCard ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === activeCard ? '#1A1A1A' : 'rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
        <div className="flex items-center justify-around px-4 py-2" style={{ background: '#F5F4F0', borderTop: '1px solid rgba(0,0,0,0.06)', height: '56px' }}>
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-semibold" style={{ color: '#1A1A1A' }}>{t('nav.home')}</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>{t('nav.browse')}</span>
          </Link>
          <Link href="/scan?mode=label" className="flex items-center justify-center -mt-4">
            <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-full" style={{ background: '#B6F074' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span className="text-[12px] font-bold" style={{ color: '#1A1A1A' }}>{t('nav.scan')}</span>
            </div>
          </Link>
          <Link href="/compare" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
            <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>{t('nav.compare')}</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ACACAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>{t('nav.chat')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
