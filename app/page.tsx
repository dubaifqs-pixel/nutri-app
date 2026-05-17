'use client'

import { useMemo, useState, useRef, useCallback } from 'react'
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

export default function Home() {
  const router = useRouter()
  const t = useT()
  const lang = useLang()

  const featuredRaw = useMemo(() => [
    DEMO_PRODUCTS.dairy[0],
    DEMO_PRODUCTS.beverages[0],
    DEMO_PRODUCTS.snacks[1],
    DEMO_PRODUCTS.cereals[0],
    DEMO_PRODUCTS.beverages[3],
    DEMO_PRODUCTS.snacks[0],
  ].filter(Boolean), [])

  const featured = useMemo(
    () => featuredRaw.map((p) => toHero(p, lang as 'en' | 'ar')),
    [featuredRaw, lang],
  )

  const [activeIdx, setActiveIdx] = useState(0)
  const total = featured.length

  const touchStart = useRef(0)
  const touchDelta = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)

  const swipe = useCallback((dir: 1 | -1) => {
    setActiveIdx((prev) => Math.max(0, Math.min(total - 1, prev + dir)))
  }, [total])

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; setDragging(true) }
  const onTouchMove = (e: React.TouchEvent) => { touchDelta.current = e.touches[0].clientX - touchStart.current; setDragX(touchDelta.current) }
  const onTouchEnd = () => {
    setDragging(false); setDragX(0)
    if (Math.abs(touchDelta.current) > 60) swipe(touchDelta.current < 0 ? 1 : -1)
    touchDelta.current = 0
  }

  const openProduct = useCallback((rawIdx: number) => {
    const raw = featuredRaw[rawIdx]
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

  const rotated = useMemo(
    () => [...featured.slice(activeIdx), ...featured.slice(0, activeIdx)],
    [featured, activeIdx],
  )
  const rotatedRawIdxs = useMemo(
    () => [...Array(total).keys()].slice(activeIdx).concat([...Array(total).keys()].slice(0, activeIdx)),
    [activeIdx, total],
  )

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
        <div className="n-mono" style={{ color: 'var(--ink-3)', marginBottom: 12 }}>
          {greeting}
        </div>
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
            fontWeight: 500,
            fontSize: 15,
            fontFeatureSettings: '"tnum"',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--ink-3)',
          }}>/ {String(total).padStart(2, '0')}</span>
        </div>
        <div className="n-mono" style={{ color: 'var(--ink-3)' }}>{swipeLabel}</div>
      </div>

      <div
        style={{ overflow: 'hidden', position: 'relative', flexShrink: 0 }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{
          display: 'flex', gap: 14,
          padding: lang === 'ar' ? '6px 60px 12px 24px' : '6px 24px 12px 60px',
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(${lang === 'ar' ? '-' : ''}${dragX}px)`,
        }}>
          {rotated.map((p, i) => (
            <div key={p.id} style={{
              flexShrink: 0,
              transform: i === 0 ? 'none' : 'scale(0.94)',
              opacity: i === 0 ? 1 : 0.7,
              transition: 'transform 0.35s, opacity 0.35s',
              transformOrigin: 'center bottom',
            }}>
              <HeroCard
                product={p}
                lang={lang as 'en' | 'ar'}
                width={278}
                height={440}
                onClick={() => openProduct(rotatedRawIdxs[i])}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', paddingTop: 12 }}>
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
          {rotated.slice(1).map((p, i) => (
            <ThumbChip
              key={p.id}
              product={p}
              lang={lang as 'en' | 'ar'}
              size={64}
              onClick={() => openProduct(rotatedRawIdxs[i + 1])}
            />
          ))}
        </div>
      </div>

      <BottomNavV2 active="home" />
    </div>
  )
}
