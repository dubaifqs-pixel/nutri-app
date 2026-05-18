'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useT, useLang } from '@/lib/i18n'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { addToHistory } from '@/lib/history'
import { calculateGrade } from '@/lib/scoring'
import { toHero } from '@/lib/v2-product'
import { NutriLogo } from '@/components/v2/NutriLogo'
import { BottomNavV2 } from '@/components/v2/BottomNav'
import { BG_PALETTE, GRADE_TILE, type HeroProduct } from '@/components/v2/types'
import type { NutritionData } from '@/lib/types'

type Cat = 'all' | 'beverages' | 'dairy' | 'snacks' | 'cereals' | 'bread' | 'meat' | 'fruits' | 'frozen'

const CAT_ORDER: Cat[] = ['all', 'beverages', 'dairy', 'snacks', 'cereals', 'bread', 'meat', 'fruits', 'frozen']

function BrowseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useT()
  const lang = useLang() as 'en' | 'ar'
  const returnTo = searchParams.get('return')
  const compareSlot = searchParams.get('slot')
  const [cat, setCat] = useState<Cat>('all')

  // Build leaderboard from all DEMO_PRODUCTS, sorted by friendly score desc.
  const leaderboard = useMemo(() => {
    const allCats = Object.keys(DEMO_PRODUCTS) as Cat[]
    const items: { hero: HeroProduct; cat: Cat; raw: { product_name: string; nutrition: NutritionData; image_url?: string | null } }[] = []
    for (const c of allCats) {
      const list = DEMO_PRODUCTS[c] || []
      for (const p of list) {
        const hero = toHero(p, lang)
        items.push({ hero, cat: c, raw: p })
      }
    }
    return items.sort((a, b) => b.hero.score - a.hero.score)
  }, [lang])

  const filtered = useMemo(
    () => cat === 'all' ? leaderboard : leaderboard.filter((x) => x.cat === cat),
    [leaderboard, cat],
  )

  const top = filtered[0]
  const rest = filtered.slice(1)

  const openProduct = (raw: { product_name: string; nutrition: NutritionData; image_url?: string | null }) => {
    const gradeResult = calculateGrade(raw.nutrition)
    const productData = {
      product_name: raw.product_name,
      nutrition: raw.nutrition,
      image_url: raw.image_url || undefined,
      source: 'manual' as const,
    }
    addToHistory(productData, gradeResult)
    if (returnTo === 'compare' && (compareSlot === '1' || compareSlot === '2')) {
      sessionStorage.setItem(`dfqs_compare_${compareSlot}`, JSON.stringify(productData))
      sessionStorage.setItem(`dfqs_compare_${compareSlot}_grade`, JSON.stringify(gradeResult))
      router.push('/compare')
      return
    }
    sessionStorage.setItem('dfqs_product', JSON.stringify(productData))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
  }

  const labels = lang === 'ar' ? {
    kicker: 'الترتيب',
    h1a: 'الأفضل',
    h1b: ' إلى الأسوأ.',
    ranked: 'مرتّب حسب التقييم',
    items: 'منتج',
    topPick: 'الأفضل',
    cat: { all: 'الكل', beverages: 'مشروبات', dairy: 'ألبان', snacks: 'وجبات خفيفة', cereals: 'حبوب', bread: 'خبز', meat: 'لحوم', fruits: 'فواكه', frozen: 'مجمّد' } as Record<Cat, string>,
  } : {
    kicker: 'LEADERBOARD',
    h1a: 'Best to',
    h1b: ' worst.',
    ranked: 'RANKED BY GRADE',
    items: 'PICKS',
    topPick: 'TOP PICK',
    cat: { all: 'ALL', beverages: 'DRINKS', dairy: 'DAIRY', snacks: 'SNACKS', cereals: 'CEREALS', bread: 'BAKERY', meat: 'MEAT', fruits: 'FRUITS', frozen: 'FROZEN' } as Record<Cat, string>,
  }

  return (
    <div className="nutri-app" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      paddingBottom: 110,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <NutriLogo height={14} />
        <button aria-label="search" style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--ink)" strokeWidth="2"/>
            <path d="M20 20l-3.5-3.5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div style={{ padding: '18px 18px 0' }}>
        <div className="n-mono" style={{ color: 'var(--ink-3)', marginBottom: 10 }}>
          {labels.kicker}
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 700,
          fontSize: lang === 'ar' ? 34 : 38,
          lineHeight: 0.95, letterSpacing: '-0.025em',
          color: 'var(--ink)',
        }}>
          {labels.h1a}<br/>
          <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{labels.h1b}</span>
        </h1>
      </div>

      {/* Category chips */}
      <div className="hide-scrollbar" style={{
        marginTop: 18,
        display: 'flex', gap: 6, overflowX: 'auto',
        padding: '0 18px',
      }}>
        {CAT_ORDER.map((c) => {
          const active = c === cat
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: 999,
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--lime)' : 'var(--ink-2)',
              border: active ? 'none' : '1px solid rgba(0,0,0,0.10)',
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-mono)',
              fontSize: lang === 'ar' ? 12 : 10,
              fontWeight: 600,
              letterSpacing: lang === 'ar' ? 0 : '0.14em',
              cursor: 'pointer',
            }}>{labels.cat[c]}</button>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '0 18px 8px',
        }}>
          <span className="n-mono" style={{ color: 'var(--ink-3)' }}>{labels.ranked}</span>
          <span style={{
            fontFamily: 'var(--ff-mono)', fontSize: 10.5, fontWeight: 600,
            color: 'var(--ink-3)', letterSpacing: '0.08em',
            fontFeatureSettings: '"tnum"',
          }}>{String(filtered.length).padStart(2, '0')} {labels.items}</span>
        </div>

        <div style={{
          padding: '0 18px 0',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {top && (
            <TopPickRow
              hero={top.hero}
              topPickLabel={labels.topPick}
              lang={lang}
              onClick={() => openProduct(top.raw)}
            />
          )}
          {rest.map((item, i) => (
            <LeaderRow
              key={item.hero.id}
              hero={item.hero}
              rank={i + 2}
              lang={lang}
              onClick={() => openProduct(item.raw)}
            />
          ))}
        </div>
      </div>

      <BottomNavV2 active="browse" />
    </div>
  )
}

// ────────────────────────────────────────────────────────
function TopPickRow({
  hero,
  topPickLabel,
  lang,
  onClick,
}: {
  hero: HeroProduct
  topPickLabel: string
  lang: 'en' | 'ar'
  onClick: () => void
}) {
  const bg = BG_PALETTE[hero.bg]
  return (
    <button onClick={onClick} style={{
      position: 'relative',
      background: 'rgba(255,255,255,0.96)',
      borderRadius: 24,
      padding: '16px 16px 16px 18px',
      overflow: 'hidden',
      display: 'flex', alignItems: 'stretch', gap: 14,
      border: '0.5px solid rgba(0,0,0,0.05)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 22px -14px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.04)',
      cursor: 'pointer',
      textAlign: lang === 'ar' ? 'right' : 'left',
      width: '100%',
    }}>
      <div style={{
        flex: 1, position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minWidth: 0,
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 8,
            padding: '4px 10px 4px 6px',
            background: 'var(--ink)',
            color: 'var(--lime)',
            borderRadius: 999,
          }}>
            <span style={{
              fontFamily: 'var(--ff-display)', fontWeight: 800,
              fontSize: 11, letterSpacing: '-0.02em',
              fontFeatureSettings: '"tnum"',
            }}>01</span>
            <span style={{
              fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-mono)',
              fontSize: lang === 'ar' ? 11 : 9, fontWeight: 600,
              letterSpacing: lang === 'ar' ? 0 : '0.14em',
            }}>{topPickLabel}</span>
          </div>
          <div className="n-mono" style={{ color: bg.ink, opacity: 0.65, marginBottom: 4 }}>
            {lang === 'ar' ? hero.brand : hero.brand.toUpperCase()}
          </div>
          <div style={{
            fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
            fontWeight: 700,
            fontSize: lang === 'ar' ? 19 : 21,
            lineHeight: 1, letterSpacing: '-0.025em',
            color: bg.ink,
          }}>{hero.product_name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontFamily: 'var(--ff-display)', fontWeight: 800,
            fontSize: 36, lineHeight: 0.9, letterSpacing: '-0.04em',
            color: bg.ink, fontFeatureSettings: '"tnum"',
          }}>{hero.score}</span>
          <span style={{
            fontFamily: 'var(--ff-mono)', fontSize: 11, fontWeight: 600,
            color: bg.ink, opacity: 0.55, letterSpacing: '0.08em',
          }}>/100</span>
        </div>
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        width: 96, minHeight: 120,
        filter: `drop-shadow(0 14px 18px ${bg.accent}66) drop-shadow(0 4px 6px rgba(0,0,0,0.10))`,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.image}
          alt={hero.product_name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
        />
      </div>
    </button>
  )
}

function LeaderRow({
  hero,
  rank,
  lang,
  onClick,
}: {
  hero: HeroProduct
  rank: number
  lang: 'en' | 'ar'
  onClick: () => void
}) {
  const grade = GRADE_TILE[hero.grade]
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px 10px 12px',
      background: 'var(--surface-2)',
      borderRadius: 18,
      border: 'none',
      cursor: 'pointer',
      textAlign: lang === 'ar' ? 'right' : 'left',
      width: '100%',
    }}>
      <span style={{
        flexShrink: 0,
        width: 24, textAlign: 'center',
        fontFamily: 'var(--ff-display)', fontWeight: 800,
        fontSize: 14, letterSpacing: '-0.02em',
        color: 'var(--ink-3)', fontFeatureSettings: '"tnum"',
      }}>{String(rank).padStart(2, '0')}</span>

      <div style={{
        flexShrink: 0,
        width: 36, height: 36, borderRadius: 10,
        background: grade.bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ff-display)', fontWeight: 800,
        fontSize: 17, lineHeight: 1, letterSpacing: '-0.03em',
        color: '#fff',
      }}>{hero.grade}</div>

      <div style={{
        flexShrink: 0,
        width: 40, height: 40, borderRadius: 10,
        background: '#fff',
        overflow: 'hidden',
        boxShadow: '0 0 0 0.5px rgba(0,0,0,0.06), 0 4px 8px -4px rgba(0,0,0,0.12)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero.image} alt="" loading="lazy"
             style={{ width: '100%', height: '100%', objectFit: 'cover', padding: 4 }}/>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: lang === 'ar' ? 'var(--ff-ar)' : 'var(--ff-display)',
          fontWeight: 700, fontSize: 14, lineHeight: 1.1,
          letterSpacing: '-0.02em', color: 'var(--ink)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{hero.product_name}</div>
        <div className="n-mono" style={{ color: 'var(--ink-3)', marginTop: 2 }}>
          {lang === 'ar' ? hero.brand : hero.brand.toUpperCase()} · {hero.size_label}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 3,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--ff-display)', fontWeight: 800,
          fontSize: 18, lineHeight: 1, letterSpacing: '-0.025em',
          color: 'var(--ink)', fontFeatureSettings: '"tnum"',
        }}>{hero.score}</span>
        <span style={{
          fontFamily: 'var(--ff-mono)', fontSize: 9, fontWeight: 600,
          color: 'var(--ink-3)', opacity: 0.6, letterSpacing: '0.08em',
        }}>/100</span>
      </div>
    </button>
  )
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="nutri-app" style={{ minHeight: '100dvh', background: 'var(--surface)' }} />}>
      <BrowseContent />
    </Suspense>
  )
}
