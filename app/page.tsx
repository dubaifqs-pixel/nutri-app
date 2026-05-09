'use client'

import Link from 'next/link'
import LangToggle from '@/components/LangToggle'
import { useT } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { getCategoryImage } from '@/lib/product-images'
import { GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { useState, useRef } from 'react'

// Pick 6 featured products across categories
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
    <div className="min-h-screen flex flex-col pb-[72px]" style={{ background: '#F5F4F0' }}>

      {/* Header — Swipe Drinks style */}
      <div className="flex items-center justify-between px-5 pt-8 pb-1 flex-shrink-0">
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

      {/* Hero text — Swipe Drinks style: light + bold keywords */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <p className="text-[24px] leading-[1.15]" style={{ color: '#1A1A1A', fontWeight: 400 }}>
          {t('home.tagline.line1').split(' ').map((word, i) => {
            const boldWords = ['food.', 'food', 'غذائك.', 'غذائك']
            return boldWords.includes(word)
              ? <span key={i} className="font-bold">{word} </span>
              : <span key={i}>{word} </span>
          })}
          <br/>
          <span className="font-bold">{t('home.tagline.line2')}</span>
        </p>
      </div>

      {/* Stats row — like Swipe Drinks "24 Swiped" */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <span className="text-[36px] font-extrabold leading-none" style={{ color: '#1A1A1A' }}>
          {FEATURED.length}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#FFEC89', color: '#1A1A1A' }}>
          Featured
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] font-medium" style={{ color: '#ACACAC' }}>Your grades</span>
          <div className="flex -space-x-1">
            {FEATURED.slice(0, 3).map((p, i) => (
              <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2" style={{ background: GRADE_GRADIENTS[p.grade], borderColor: '#F5F4F0' }}>{p.grade}</div>
            ))}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border-2" style={{ background: '#E8E8E8', color: '#ACACAC', borderColor: '#F5F4F0' }}>{FEATURED.length - 3}+</div>
          </div>
        </div>
      </div>

      {/* ===== HERO PRODUCT CARD — Swipe Drinks style ===== */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto px-5 pb-4 flex-shrink-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.hero-scroll::-webkit-scrollbar { display: none; }`}</style>
        {FEATURED.map((product, i) => (
          <Link
            key={i}
            href="/browse"
            className="shrink-0 relative bg-white active:scale-[0.98] transition-transform"
            style={{
              width: 'calc(100vw - 56px)',
              maxWidth: '340px',
              minHeight: '220px',
              borderRadius: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              scrollSnapAlign: 'start',
              overflow: 'visible',
            }}
          >
            {/* Product name — LEFT, bold, stacked */}
            <div style={{ padding: '24px 20px 0', maxWidth: '50%' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.1, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                {product.product_name}
              </h3>
              <p style={{ fontSize: '11px', color: '#ACACAC', marginTop: '6px', fontWeight: 500 }}>
                {product.brand}
              </p>
            </div>

            {/* Product image — MASSIVE, overlapping right + bottom */}
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

            {/* "Scan Now" + dark circle — bottom left, like Swipe Drinks */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
              <div>
                <p style={{ fontSize: '11px', color: '#ACACAC', fontWeight: 500 }}>Scan</p>
                <p style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 700 }}>Now</p>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-4">
        {FEATURED.map((_, i) => (
          <div key={i} style={{ width: i === current ? 16 : 6, height: 6, borderRadius: 3, background: i === current ? '#1A1A1A' : '#DCDCDC', transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Quick actions — 3 small cards */}
      <div className="px-5 grid grid-cols-3 gap-2 flex-shrink-0">
        <Link href="/browse" className="flex flex-col items-start justify-between p-3 rounded-[16px] bg-white active:scale-[0.97] transition-transform" style={{ border: '1px solid rgba(0,0,0,0.06)', height: 80 }}>
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#FFEC89' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
          </div>
          <p className="text-[11px] font-bold" style={{ color: '#1A1A1A' }}>{t('home.browse')}</p>
        </Link>
        <Link href="/compare" className="flex flex-col items-start justify-between p-3 rounded-[16px] bg-white active:scale-[0.97] transition-transform" style={{ border: '1px solid rgba(0,0,0,0.06)', height: 80 }}>
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#DAB8F1' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
          </div>
          <p className="text-[11px] font-bold" style={{ color: '#1A1A1A' }}>{t('home.compare')}</p>
        </Link>
        <Link href="/chat" className="flex flex-col items-start justify-between p-3 rounded-[16px] bg-white active:scale-[0.97] transition-transform" style={{ border: '1px solid rgba(0,0,0,0.06)', height: 80 }}>
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#B6E1FA' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="text-[11px] font-bold" style={{ color: '#1A1A1A' }}>{t('home.chat')}</p>
        </Link>
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
