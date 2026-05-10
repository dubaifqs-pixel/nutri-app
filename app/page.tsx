'use client'

import Link from 'next/link'
import LangToggle from '@/components/LangToggle'
import { useT } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { getProductImage } from '@/lib/product-images'
import { GRADE_COLORS, type Grade, type NutritionData } from '@/lib/types'
import { useEffect } from 'react'

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

function getProductBg(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(PRODUCT_BG)) {
    if (lower.includes(key)) return color
  }
  return '#E8E0D8'
}

// Generate nutrition tags
function getNutritionTags(n: NutritionData): string[] {
  const tags: string[] = []
  if (n.sugars_g !== null) tags.push(n.sugars_g > 15 ? 'High sugar' : n.sugars_g <= 5 ? 'Low sugar' : 'Sugar')
  if (n.saturated_fat_g !== null) tags.push(n.saturated_fat_g > 5 ? 'High fat' : n.saturated_fat_g <= 2 ? 'Low fat' : 'Fat')
  if (n.protein_g !== null && n.protein_g > 5) tags.push('Protein')
  if (n.fiber_g !== null && n.fiber_g > 3) tags.push('Fiber')
  if (n.sodium_mg !== null && n.sodium_mg > 500) tags.push('High sodium')
  if (n.energy_kcal !== null && n.energy_kcal <= 100) tags.push('Low cal')
  return tags.slice(0, 3)
}

// Grade text colors
const GRADE_TEXT: Record<Grade, string> = {
  A: '#2E7D32', B: '#558B2F', C: '#F9A825', D: '#E65100', E: '#C62828',
}
const GRADE_LABEL: Record<Grade, string> = {
  A: 'Great', B: 'Good', C: 'Okay', D: 'Poor', E: 'Bad',
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
  }
})

export default function Home() {
  const t = useT()

  // Preload images
  useEffect(() => {
    FEATURED.forEach(p => { const img = new Image(); img.src = p.image })
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

      {/* Pinterest Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {FEATURED.map((product, i) => (
          <Link
            key={i}
            href="/browse"
            className="block relative transition-transform active:scale-[0.97]"
            style={{ borderRadius: '18px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            {/* Image area — rounded inside the card */}
            <div
              className="relative flex items-center justify-center"
              style={{ margin: '10px 10px 0', borderRadius: '16px', overflow: 'hidden', minHeight: '160px', padding: '20px 10px', background: product.bg }}
            >
              {/* Grade — at top-right corner of image area, overlapping into white card */}
              <div className="absolute z-10 text-right" style={{ top: '-16px', right: '-2px' }}>
                <div className="text-[28px] font-extrabold leading-none" style={{ color: '#1A1A1A' }}>{product.grade}</div>
              </div>
              <img
                src={product.image}
                alt={product.product_name}
                className="max-h-[120px] object-contain"
                style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.15))' }}
                loading="lazy"
              />
            </div>

            {/* Info area */}
            <div style={{ padding: '12px 14px 14px' }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-bold leading-tight" style={{ color: '#1A1A1A' }}>{product.product_name}</p>
                <span className="text-[10px] font-semibold shrink-0 mt-0.5" style={{ color: '#1A1A1A', textDecoration: 'underline', textUnderlineOffset: '2px' }}>View ↗</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {product.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-[9px] font-medium px-2.5 py-1"
                    style={{ borderRadius: '16px', background: '#F0EFEB', color: '#5A5A5A' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
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
