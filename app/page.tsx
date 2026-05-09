'use client'

import Link from 'next/link'
import LangToggle from '@/components/LangToggle'
import { useT } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { getCategoryImage } from '@/lib/product-images'
import { GRADE_COLORS, type Grade, type NutritionData } from '@/lib/types'
import { useState, useRef } from 'react'

// Pick featured products
const FEATURED = [
  { ...DEMO_PRODUCTS.dairy[0], cat: 'dairy' },
  { ...DEMO_PRODUCTS.beverages[1], cat: 'beverages' },
  { ...DEMO_PRODUCTS.snacks[0], cat: 'snacks' },
  { ...DEMO_PRODUCTS.cereals[0], cat: 'cereals' },
  { ...DEMO_PRODUCTS.dairy[2], cat: 'dairy' },
  { ...DEMO_PRODUCTS.beverages[0], cat: 'beverages' },
].map(p => {
  const g = calculateGrade(p.nutrition)
  return { ...p, grade: g.grade as Grade, score: g.score, image: getCategoryImage(p.cat) }
})

// Generate "why" label from nutrition
function getWhyLabel(n: NutritionData, grade: Grade): string {
  const bad: string[] = []
  const good: string[] = []
  if (n.sugars_g !== null && n.sugars_g > 15) bad.push('High sugar')
  if (n.saturated_fat_g !== null && n.saturated_fat_g > 5) bad.push('High fat')
  if (n.sodium_mg !== null && n.sodium_mg > 500) bad.push('High sodium')
  if (n.sugars_g !== null && n.sugars_g <= 5) good.push('Low sugar')
  if (n.protein_g !== null && n.protein_g > 5) good.push('Good protein')
  if (n.fiber_g !== null && n.fiber_g > 3) good.push('High fiber')
  if (grade === 'A' || grade === 'B') return good.slice(0, 2).join(', ') || 'Healthy choice'
  return bad.slice(0, 2).join(', ') || 'Check nutrition'
}

// Score arc dashoffset (lower score = more fill = better)
function getArcOffset(score: number): number {
  // Score range roughly -15 to 40. Map to dashoffset 10 (full) to 130 (empty)
  const clamped = Math.max(-15, Math.min(40, score))
  const normalized = (clamped + 15) / 55 // 0 to 1
  return 10 + normalized * 120 // 10 (best) to 130 (worst)
}

function ScoreArc({ grade, score }: { grade: Grade; score: number }) {
  const color = GRADE_COLORS[grade]
  const offset = getArcOffset(score)
  return (
    <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
        <circle cx="28" cy="28" r="24" fill="none" stroke="#E8E8E8" strokeWidth="3.5" />
        <circle cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="3.5"
          strokeDasharray="150.8" strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="relative text-[16px] font-black" style={{ color }}>{grade}</span>
    </div>
  )
}

export default function Home() {
  const t = useT()
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const cardWidth = el.scrollWidth / FEATURED.length
    const idx = Math.round(el.scrollLeft / cardWidth)
    setCurrent(idx)
  }

  return (
    <div className="flex flex-col" style={{ background: '#F5F4F0', height: '100dvh', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-1 flex-shrink-0">
        <div>
          <p className="text-[11px] font-medium" style={{ color: '#ACACAC' }}>Welcome back</p>
          <p className="text-[15px] font-bold" style={{ color: '#1A1A1A' }}>nutri</p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M4 6h16M4 18h16"/></svg>
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

      {/* Stats row */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-3 flex-shrink-0">
        <span className="text-[32px] font-extrabold leading-none" style={{ color: '#1A1A1A' }}>{FEATURED.length}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#FFEC89', color: '#1A1A1A' }}>Featured</span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[9px] font-medium mr-1" style={{ color: '#ACACAC' }}>Your grades</span>
          <div className="flex -space-x-1">
            {FEATURED.slice(0, 3).map((p, i) => (
              <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold border" style={{ background: GRADE_COLORS[p.grade], borderColor: '#F5F4F0' }}>{p.grade}</div>
            ))}
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold border" style={{ background: '#E8E8E8', color: '#ACACAC', borderColor: '#F5F4F0' }}>{FEATURED.length - 3}+</div>
          </div>
        </div>
      </div>

      {/* Product cards — fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto px-5 flex-1"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', alignItems: 'stretch' }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {FEATURED.map((product, i) => (
            <Link
              key={i}
              href="/browse"
              className="shrink-0 relative bg-white active:scale-[0.98] transition-transform flex flex-col"
              style={{
                width: 'calc(100vw - 56px)',
                maxWidth: '340px',
                borderRadius: '20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                scrollSnapAlign: 'start',
                overflow: 'visible',
              }}
            >
              {/* Product name */}
              <div style={{ padding: '22px 20px 0', maxWidth: '50%' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.1, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                  {product.product_name}
                </h3>
                <p style={{ fontSize: '11px', color: '#ACACAC', marginTop: '6px', fontWeight: 500 }}>
                  {product.brand}
                </p>
              </div>

              {/* Product image — massive, overlapping */}
              <img
                src={product.image}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  right: '-16px',
                  bottom: '-12px',
                  width: '180px',
                  height: '180px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))',
                  pointerEvents: 'none',
                }}
              />

              {/* Score Arc + Score + Why — bottom left */}
              <div style={{ position: 'absolute', bottom: '18px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
                <ScoreArc grade={product.grade} score={product.score} />
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#7A7A7A', background: '#F5F4F0', padding: '3px 10px', borderRadius: '10px', display: 'inline-block' }}>
                    Score: {product.score}
                  </div>
                  <p style={{ fontSize: '9px', color: '#ACACAC', fontWeight: 500, marginTop: '3px' }}>
                    {getWhyLabel(product.nutrition, product.grade)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-3 flex-shrink-0">
          {FEATURED.map((_, i) => (
            <div key={i} style={{ width: i === current ? 16 : 6, height: 6, borderRadius: 3, background: i === current ? '#1A1A1A' : '#DCDCDC', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
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
