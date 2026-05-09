'use client'

import Link from 'next/link'
import LangToggle from '@/components/LangToggle'
import { useT } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { getCategoryImage } from '@/lib/product-images'
import { GRADE_COLORS, type Grade, type NutritionData } from '@/lib/types'
import { useState, useRef, useCallback } from 'react'

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)
  const startXRef = useRef(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    setExitDir(null)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setDragX(e.clientX - startXRef.current)
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (Math.abs(dragX) > 80) {
      const dir = dragX > 0 ? 'right' : 'left'
      setExitDir(dir)
      setTimeout(() => {
        setCurrentIndex(prev => prev < FEATURED.length - 1 ? prev + 1 : 0)
        setDragX(0)
        setExitDir(null)
      }, 250)
    } else {
      setDragX(0)
    }
  }, [isDragging, dragX])

  const currentProduct = FEATURED[currentIndex]
  const nextProduct = FEATURED[(currentIndex + 1) % FEATURED.length]
  const rotation = dragX * 0.06
  const opacity = 1 - Math.abs(dragX) / 500

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

      {/* Tinder-style stacked cards — fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0 px-5">
        <div className="relative flex-1">
          {/* Counter */}
          <div className="absolute top-0 right-0 z-10">
            <span className="text-[11px] font-semibold" style={{ color: '#ACACAC' }}>{currentIndex + 1}/{FEATURED.length}</span>
          </div>

          {/* Next card (behind) */}
          {nextProduct && (
            <div
              className="absolute inset-x-0 bg-white"
              style={{
                borderRadius: '20px',
                top: 8,
                bottom: 8,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transform: 'scale(0.95)',
                opacity: 0.5,
              }}
            >
              <div style={{ padding: '22px 20px 0', maxWidth: '50%' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#DCDCDC', lineHeight: 1.1 }}>
                  {nextProduct.product_name}
                </h3>
              </div>
            </div>
          )}

          {/* Current card (draggable) */}
          {currentProduct && (
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => { if (isDragging) handlePointerUp() }}
              className="absolute inset-x-0 bg-white cursor-grab active:cursor-grabbing select-none"
              style={{
                top: 0,
                bottom: 0,
                borderRadius: '20px',
                boxShadow: isDragging ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                transform: exitDir
                  ? `translateX(${exitDir === 'right' ? '120%' : '-120%'}) rotate(${exitDir === 'right' ? '12' : '-12'}deg)`
                  : `translateX(${dragX}px) rotate(${rotation}deg)`,
                transition: isDragging ? 'box-shadow 0.2s' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: exitDir ? 0 : opacity,
                overflow: 'visible',
                touchAction: 'pan-y',
                zIndex: 5,
              }}
            >
              {/* Product name */}
              <div style={{ padding: '24px 22px 0', maxWidth: '48%' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.08, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
                  {currentProduct.product_name}
                </h3>
                <p style={{ fontSize: '11px', color: '#ACACAC', marginTop: '8px', fontWeight: 500 }}>
                  {currentProduct.brand}
                </p>
              </div>

              {/* Product image — bigger */}
              <img
                src={currentProduct.image}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  right: '-20px',
                  bottom: '-16px',
                  width: '220px',
                  height: '220px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.14))',
                  pointerEvents: 'none',
                }}
              />

              {/* Swipe indicators */}
              {isDragging && dragX > 30 && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', padding: '5px 14px', borderRadius: '10px', border: '2px solid #B6F074', color: '#66BB6A', fontSize: '12px', fontWeight: 700, transform: 'rotate(8deg)' }}>
                  VIEW
                </div>
              )}
              {isDragging && dragX < -30 && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '5px 14px', borderRadius: '10px', border: '2px solid #DCDCDC', color: '#ACACAC', fontSize: '12px', fontWeight: 700, transform: 'rotate(-8deg)' }}>
                  NEXT
                </div>
              )}

              {/* Score Arc + Score + Why */}
              <div style={{ position: 'absolute', bottom: '20px', left: '22px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
                <ScoreArc grade={currentProduct.grade} score={currentProduct.score} />
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#7A7A7A', background: '#F5F4F0', padding: '3px 10px', borderRadius: '10px', display: 'inline-block' }}>
                    Score: {currentProduct.score}
                  </div>
                  <p style={{ fontSize: '9px', color: '#ACACAC', fontWeight: 500, marginTop: '3px' }}>
                    {getWhyLabel(currentProduct.nutrition, currentProduct.grade)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Swipe hint + dots */}
        <div className="flex items-center justify-between py-2 flex-shrink-0">
          <p className="text-[9px]" style={{ color: '#DCDCDC' }}>Swipe to browse</p>
          <div className="flex gap-1.5">
            {FEATURED.map((_, i) => (
              <div key={i} style={{ width: i === currentIndex ? 14 : 5, height: 5, borderRadius: 3, background: i === currentIndex ? '#1A1A1A' : '#DCDCDC', transition: 'all 0.3s' }} />
            ))}
          </div>
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
