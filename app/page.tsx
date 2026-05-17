'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LangToggle from '@/components/LangToggle'
import NutriLogo from '@/components/NutriLogo'
import HeroCard, { type HeroProduct } from '@/components/HeroCard'
import { useT, useLang } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { getProductImage } from '@/lib/product-images'
import { type Grade, type NutritionData } from '@/lib/types'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'

// Opinionated "take" line per product — short, punchy
const TAKE: Record<string, string> = {
  'Al Ain Full Cream Milk': 'Pure dairy. Nothing else.',
  'Coca-Cola Original': '10 sugar cubes. Per can.',
  'KitKat 4 Finger': '218 calories. Treat, not snack.',
  "Kellogg's Corn Flakes": 'Fortified with iron & vitamins.',
  'Rani Orange Juice': 'Real fruit pieces.',
  "Lay's Classic Chips": 'Salt-loaded. Treat, not snack.',
}

const SIZE_LABEL: Record<string, string> = {
  'Al Ain Full Cream Milk': '1L BOTTLE',
  'Coca-Cola Original': '330ML CAN',
  'KitKat 4 Finger': '45G BAR',
  "Kellogg's Corn Flakes": '500G BOX',
  'Rani Orange Juice': '240ML PACK',
  "Lay's Classic Chips": '40G BAG',
}

function chipsFor(n: NutritionData): HeroProduct['chips'] {
  const out: HeroProduct['chips'] = []
  if (n.sugars_g !== null) {
    if (n.sugars_g > 15) out.push({ kind: 'bad', text: `${Math.round(n.sugars_g)}g sugar` })
    else if (n.sugars_g <= 5) out.push({ kind: 'pos', text: 'Low sugar' })
  }
  if (n.protein_g !== null && n.protein_g > 5 && out.length < 2) out.push({ kind: 'pos', text: `${Math.round(n.protein_g)}g protein` })
  if (n.sodium_mg !== null && n.sodium_mg > 500 && out.length < 2) out.push({ kind: 'warn', text: 'High sodium' })
  if (n.saturated_fat_g !== null && n.saturated_fat_g > 5 && out.length < 2) out.push({ kind: 'warn', text: 'High fat' })
  if (n.fiber_g !== null && n.fiber_g > 3 && out.length < 2) out.push({ kind: 'pos', text: `${Math.round(n.fiber_g)}g fiber` })
  if (out.length === 0) out.push({ kind: 'neutral', text: 'Scanned' })
  return out.slice(0, 2)
}

// Brand extraction — full brand prefix, not just first word
const BRAND_MAP: Record<string, string> = {
  'Al Ain Full Cream Milk': 'Al Ain',
  'Coca-Cola Original': 'Coca-Cola',
  'KitKat 4 Finger': 'KitKat',
  "Kellogg's Corn Flakes": "Kellogg's",
  'Rani Orange Juice': 'Rani',
  "Lay's Classic Chips": "Lay's",
}
function brandFor(name: string): string {
  return BRAND_MAP[name] || name.split(' ')[0]
}

export default function Home() {
  const router = useRouter()
  const t = useT()
  const lang = useLang()

  const FEATURED = useMemo<HeroProduct[]>(() => {
    const list = [
      DEMO_PRODUCTS.dairy[0],
      DEMO_PRODUCTS.beverages[0],
      DEMO_PRODUCTS.snacks[1],
      DEMO_PRODUCTS.cereals[0],
      DEMO_PRODUCTS.beverages[3],
      DEMO_PRODUCTS.snacks[0],
    ].filter(Boolean)
    return list.map(p => {
      const g = calculateGrade(p.nutrition)
      return {
        brand: brandFor(p.product_name),
        product_name: p.product_name,
        take: TAKE[p.product_name] || 'Scanned & verified',
        size_label: SIZE_LABEL[p.product_name] || 'PRODUCT',
        grade: g.grade as Grade,
        image: getProductImage(p.product_name, g.grade as Grade),
        chips: chipsFor(p.nutrition),
      }
    })
  }, [])

  // store original product nutrition for navigation
  const rawProducts = useMemo(() => {
    return [
      DEMO_PRODUCTS.dairy[0],
      DEMO_PRODUCTS.beverages[0],
      DEMO_PRODUCTS.snacks[1],
      DEMO_PRODUCTS.cereals[0],
      DEMO_PRODUCTS.beverages[3],
      DEMO_PRODUCTS.snacks[0],
    ].filter(Boolean)
  }, [])

  const [activeCard, setActiveCard] = useState(0)
  const total = FEATURED.length

  const goToProduct = useCallback((idx: number) => {
    const p = rawProducts[idx]
    if (!p) return
    const gradeResult = calculateGrade(p.nutrition)
    sessionStorage.setItem('dfqs_product', JSON.stringify({
      product_name: p.product_name,
      nutrition: p.nutrition,
      source: 'manual',
    }))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
  }, [rawProducts, router])

  // Touch swipe for carousel
  const touchStart = useRef(0)
  const touchDelta = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)

  const swipe = useCallback((dir: 1 | -1) => {
    setActiveCard(prev => Math.max(0, Math.min(total - 1, prev + dir)))
  }, [total])

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; setDragging(true) }
  const onTouchMove = (e: React.TouchEvent) => { touchDelta.current = e.touches[0].clientX - touchStart.current; setDragX(touchDelta.current) }
  const onTouchEnd = () => {
    setDragging(false); setDragX(0)
    if (Math.abs(touchDelta.current) > 60) swipe(touchDelta.current < 0 ? 1 : -1)
    touchDelta.current = 0
  }

  useEffect(() => {
    FEATURED.forEach(p => { const img = new Image(); img.src = p.image })
  }, [FEATURED])

  // For "Also scanned" thumb strip, rotate to show non-active cards
  const others = useMemo(() => {
    const rotated = [...FEATURED.slice(activeCard + 1), ...FEATURED.slice(0, activeCard)]
    return rotated
  }, [FEATURED, activeCard])

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#FAF7F2', paddingBottom: 0 }}>

      {/* Top chrome — small wordmark + lang/menu */}
      <header className="flex items-center justify-between" style={{ padding: '12px 24px 0', gap: 12 }}>
        <NutriLogo height={16} />
        <div className="flex items-center gap-2">
          <LangToggle />
          <button aria-label="Menu" className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, border: '1px solid rgba(24,20,16,0.12)', background: 'transparent' }}>
            <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden>
              <rect x="0" y="0" width="14" height="1.4" rx="0.7" fill="#181410" />
              <rect x="0" y="4.3" width="10" height="1.4" rx="0.7" fill="#181410" />
              <rect x="0" y="8.6" width="14" height="1.4" rx="0.7" fill="#181410" />
            </svg>
          </button>
        </div>
      </header>

      {/* Greeting overline + BIG display headline */}
      <div style={{ padding: '36px 24px 8px' }}>
        <div className="n-mono" style={{ color: '#7A7166', marginBottom: 14 }}>
          {t('home.greeting')}
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 44,
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          color: '#181410',
        }}>
          {t('home.h1a')}<br />
          <span style={{ color: '#7A7166', fontWeight: 500 }}>{t('home.h1b')}</span>
        </h1>
      </div>

      {/* Counter + SWIPE indicator */}
      <div style={{ padding: '24px 24px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="n-num" style={{ fontSize: 22, lineHeight: 1, color: '#181410' }}>
            {String(activeCard + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 15,
            fontFeatureSettings: '"tnum"',
            fontVariantNumeric: 'tabular-nums',
            color: '#7A7166',
          }}>
            / {String(total).padStart(2, '0')}
          </span>
        </div>
        <div className="n-mono" style={{ color: '#7A7166' }}>{t('home.swipe')}</div>
      </div>

      {/* Hero carousel */}
      <div
        style={{ overflow: 'hidden', position: 'relative' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{
          display: 'flex',
          gap: 14,
          padding: '6px 60px 12px 24px',
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(calc(${-activeCard * 316}px + ${dragX}px))`,
        }}>
          {FEATURED.map((product, i) => (
            <div
              key={i}
              style={{
                transform: i === activeCard ? 'none' : 'scale(0.94)',
                opacity: i === activeCard ? 1 : 0.7,
                transition: 'transform 0.35s, opacity 0.35s',
                transformOrigin: 'center bottom',
              }}
            >
              <HeroCard
                product={product}
                width={302}
                height={510}
                onTap={() => goToProduct(i)}
                lang={lang}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {FEATURED.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveCard(i)}
            aria-label={`Card ${i + 1}`}
            style={{
              width: i === activeCard ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === activeCard ? '#181410' : 'rgba(24,20,16,0.15)',
              transition: 'all 0.3s ease',
              border: 'none',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Also scanned thumb strip */}
      <div style={{ flex: 1, overflow: 'hidden', paddingTop: 20 }}>
        <div style={{ padding: '0 24px 8px' }}>
          <span className="n-mono" style={{ color: '#7A7166' }}>{t('home.alsoScanned')}</span>
        </div>
        <div style={{
          display: 'flex',
          gap: 12,
          padding: '0 24px 120px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }} className="no-scrollbar">
          {others.map((p, i) => {
            const realIdx = FEATURED.findIndex(x => x.product_name === p.product_name)
            return (
              <button
                key={p.product_name}
                onClick={() => goToProduct(realIdx)}
                style={{
                  flexShrink: 0,
                  width: 72,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 0 0 0.5px rgba(40,28,18,0.06), 0 4px 12px -8px rgba(40,28,18,0.12)',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 5,
                    left: 5,
                    zIndex: 2,
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: getTileBg(p.grade),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
                    fontWeight: 800,
                    fontSize: 15,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    boxShadow: '0 4px 10px -3px rgba(40,28,18,0.20)',
                  }}>
                    {p.grade}
                  </div>
                  <div style={{
                    position: 'absolute',
                    inset: '18% 14% 12%',
                    filter: 'drop-shadow(0 6px 10px rgba(40,28,18,0.14))',
                  }}>
                    <img src={p.image} alt={p.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#3A342A',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}>{p.brand}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Floating bottom nav — elevated lime FAB */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '28rem', zIndex: 40, pointerEvents: 'none' }}>
        <div style={{
          pointerEvents: 'auto',
          margin: '0 18px 16px',
          background: '#FFFFFF',
          borderRadius: 28,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 30px -12px rgba(40,28,18,0.22), 0 0 0 0.5px rgba(0,0,0,0.05)',
          position: 'relative',
        }}>
          <Link href="/" className="flex flex-col items-center gap-1" style={{ flex: 1, minHeight: 44, padding: '4px 0', color: '#181410' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="currentColor" fillOpacity={0.12} />
            </svg>
            <span style={{ width: 4, height: 4, background: '#181410', borderRadius: 999 }} />
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-1" style={{ flex: 1, minHeight: 44, padding: '4px 0', color: '#A89F93' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
              <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
              <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
              <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
            </svg>
          </Link>
          <Link href="/scan?mode=label" aria-label={t('nav.scan')} style={{
            width: 60, height: 60, borderRadius: '50%',
            background: '#B8E845',
            border: '4px solid #FFFFFF',
            marginTop: -34,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 22px -6px rgba(140,180,40,0.55), inset 0 -3px 0 rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3" stroke="#181410" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M3 12h18" stroke="#181410" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </Link>
          <Link href="/compare" className="flex flex-col items-center gap-1" style={{ flex: 1, minHeight: 44, padding: '4px 0', color: '#A89F93' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M8 4v16M16 4v16M4 8l4-4 4 4M20 16l-4 4-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-1" style={{ flex: 1, minHeight: 44, padding: '4px 0', color: '#A89F93' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1 4a8 8 0 011 4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

function getTileBg(grade: Grade): string {
  switch (grade) {
    case 'A': return '#B8E845'
    case 'B': return '#9BC93A'
    case 'C': return '#FFD23D'
    case 'D': return '#FF9A4F'
    case 'E': return '#FF5A3A'
  }
}
