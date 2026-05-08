'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_COLORS, type Grade } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { useT } from '@/lib/i18n'

type Pill = { name: string; grade: Grade; key: string }

const FEATURED_PICKS: { category: string; index: number }[] = [
  { category: 'dairy', index: 2 },     // Almarai Plain Yogurt — high
  { category: 'beverages', index: 0 }, // Coca-Cola — low
  { category: 'cereals', index: 0 },   // first cereal
  { category: 'snacks', index: 0 },    // first snack
]

function buildFeatured(): Pill[] {
  const out: Pill[] = []
  for (const { category, index } of FEATURED_PICKS) {
    const list = DEMO_PRODUCTS[category]
    if (!list || !list[index]) continue
    const p = list[index]
    const g = calculateGrade(p.nutrition).grade as Grade
    out.push({ name: p.product_name, grade: g, key: `${category}-${index}` })
  }
  return out
}

export default function RecentPills() {
  const t = useT()
  const [pills, setPills] = useState<Pill[]>([])
  const [showingDemo, setShowingDemo] = useState(false)

  useEffect(() => {
    const history = getHistory().slice(0, 3)
    if (history.length > 0) {
      setPills(history.map((e: HistoryEntry, i) => ({
        name: e.product_name,
        grade: e.grade as Grade,
        key: `${e.scanned_at}-${i}`,
      })))
      setShowingDemo(false)
    } else {
      setPills(buildFeatured())
      setShowingDemo(true)
    }
  }, [])

  if (pills.length === 0) return null

  return (
    <div className="px-5 pb-3">
      <div className="flex items-center gap-2 hide-scrollbar overflow-x-auto">
        <span className="text-[9px] font-bold uppercase tracking-[0.06em] mr-1 whitespace-nowrap" style={{ color: '#9A9790' }}>
          {showingDemo ? t('home.featuredToday') : t('home.recent')}
        </span>
        {pills.map((p) => (
          <Link
            key={p.key}
            href={showingDemo ? '/browse' : '/'}
            className="flex items-center gap-1.5 rounded-full px-2 py-1 bg-white shrink-0"
            style={{ border: '1px solid #E2DDD5' }}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: GRADE_COLORS[p.grade] }}
            />
            <span className="text-[9px] font-medium max-w-[88px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#1A1917' }}>
              {p.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
