'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useT, useLang } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { addToHistory } from '@/lib/history'
import { calculateGrade } from '@/lib/scoring'
import { toHero } from '@/lib/v2-product'
import { HeroCard } from '@/components/v2/HeroCard'
import { ThumbChip } from '@/components/v2/ThumbChip'
import { BottomNavV2 } from '@/components/v2/BottomNav'
import { NutriHeader } from '@/components/v2/NutriHeader'

const CARD_W = 296
const CARD_GAP = 14

export default function Home() {
  const router = useRouter()
  const t = useT()
  const lang = useLang() as 'en' | 'ar'

  const featuredRaw = useMemo(() => [
    DEMO_PRODUCTS.dairy[0],
    DEMO_PRODUCTS.beverages[0],
    DEMO_PRODUCTS.snacks[1],
    DEMO_PRODUCTS.cereals[0],
    DEMO_PRODUCTS.beverages[3],
    DEMO_PRODUCTS.snacks[0],
  ].filter(Boolean), [])

  const featured = useMemo(
    () => featuredRaw.map((p) => toHero(p, lang)),
    [featuredRaw, lang],
  )

  const [activeIdx, setActiveIdx] = useState(0)
  const total = featured.length

  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Track which card is centered via IntersectionObserver so the counter
  // updates as the user scrolls.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with the highest intersection ratio
        let best: { idx: number; ratio: number } | null = null
        for (const e of entries) {
          const idxAttr = (e.target as HTMLElement).dataset.idx
          if (!idxAttr) continue
          const idx = parseInt(idxAttr, 10)
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio }
          }
        }
        if (best && best.ratio > 0.5) setActiveIdx(best.idx)
      },
      { root: scroller, threshold: [0.5, 0.75, 1] },
    )
    cardRefs.current.forEach((el) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [total])

  const openProduct = useCallback((idx: number) => {
    const raw = featuredRaw[idx]
    if (!raw) return
    const gradeResult = calculateGrade(raw.nutrition)
    const productData = {
      product_name: raw.product_name,
      nutrition: raw.nutrition,
      source: 'manual' as const,
    }
    sessionStorage.setItem('dfqs_product', JSON.stringify(productData))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    addToHistory(productData, gradeResult)
    router.push('/result')
  }, [featuredRaw, router])

  // Mouse-drag scrolling — desktop users without touch.
  const dragRef = useRef<{ startX: number; startScroll: number; dragging: boolean }>({ startX: 0, startScroll: 0, dragging: false })
  const onMouseDown = (e: React.MouseEvent) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    dragRef.current = { startX: e.clientX, startScroll: scroller.scrollLeft, dragging: true }
    scroller.style.scrollSnapType = 'none'
    scroller.style.cursor = 'grabbing'
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollLeft = dragRef.current.startScroll - (e.clientX - dragRef.current.startX)
  }
  const endDrag = () => {
    const scroller = scrollerRef.current
    if (!scroller || !dragRef.current.dragging) return
    dragRef.current.dragging = false
    scroller.style.scrollSnapType = 'x mandatory'
    scroller.style.cursor = 'grab'
  }

  const greeting = t('home.greeting')
  const h1a = t('home.heroLine1')
  const h1b = t('home.heroLine2')
  const more = t('home.alsoScanned')
  const swipeLabel = lang === 'ar' ? 'مسح ←' : 'SWIPE →'

  return (
    <div
      className="nutri-app"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100dvh',
        background: 'var(--cream)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ paddingTop: 8 }}>
        <NutriHeader />
      </div>

      <div style={{ padding: '24px 24px 8px' }}>
        <div className="n-mono" style={{ color: 'var(--ink-3)', marginBottom: 12 }}>{greeting}</div>
        <h1 style={{
          margin: 0,
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 800,
          fontSize: lang === 'ar' ? 34 : 40,
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}>
          {h1a}<br />
          <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{h1b}</span>
        </h1>
      </div>

      <div style={{
        padding: '18px 24px 10px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="n-num" style={{ fontSize: 22, lineHeight: 1, color: 'var(--ink)' }}>
            {String(activeIdx + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: 'var(--ff-display)',
            fontWeight: 500, fontSize: 15,
            fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums',
            color: 'var(--ink-3)',
          }}>/ {String(total).padStart(2, '0')}</span>
        </div>
        <div className="n-mono" style={{ color: 'var(--ink-3)' }}>{swipeLabel}</div>
      </div>

      {/* Native horizontal scroll-snap carousel — works for touch, mouse drag,
          trackpad, keyboard arrow keys. */}
      <div
        ref={scrollerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: CARD_GAP,
          padding: lang === 'ar' ? '6px 60px 12px 24px' : '6px 24px 12px 60px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {featured.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => { cardRefs.current[i] = el }}
            data-idx={i}
            style={{
              scrollSnapAlign: lang === 'ar' ? 'end' : 'start',
              flexShrink: 0,
            }}
          >
            <HeroCard
              product={p}
              lang={lang}
              width={CARD_W}
              height={460}
              onClick={() => openProduct(i)}
            />
          </div>
        ))}
      </div>

      <div style={{ paddingTop: 16 }}>
        <div style={{
          padding: '0 24px 8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <span className="n-mono" style={{ color: 'var(--ink-3)' }}>{more}</span>
        </div>
        <div className="hide-scrollbar" style={{
          display: 'flex', gap: 12,
          padding: '0 24px 110px',
          overflowX: 'auto',
        }}>
          {featured.filter((_, i) => i !== activeIdx).map((p) => {
            const realIdx = featured.findIndex((x) => x.id === p.id)
            return (
              <ThumbChip
                key={p.id}
                product={p}
                lang={lang}
                size={64}
                onClick={() => openProduct(realIdx)}
              />
            )
          })}
        </div>
      </div>

      <BottomNavV2 active="home" />
    </div>
  )
}
