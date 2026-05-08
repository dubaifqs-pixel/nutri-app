'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { GRADE_GRADIENTS, GRADE_COLORS, type Grade } from '@/lib/types'
import { getProductImage } from '@/lib/product-images'
import { useT } from '@/lib/i18n'

type Featured = {
  name: string
  brand: string
  category: string
  grade: Grade
  score: number
  image: string
}

const PICKS: { category: string; index: number }[] = [
  { category: 'dairy', index: 2 },     // Almarai Plain Yogurt
  { category: 'dairy', index: 0 },     // Al Ain Full Cream Milk
  { category: 'beverages', index: 0 }, // Coca-Cola
  { category: 'snacks', index: 0 },
  { category: 'cereals', index: 0 },
  { category: 'beverages', index: 2 }, // Al Ain Water
]

function buildFeatured(): Featured[] {
  return PICKS
    .map(({ category, index }) => {
      const list = DEMO_PRODUCTS[category]
      if (!list || !list[index]) return null
      const p = list[index]
      const result = calculateGrade(p.nutrition)
      return {
        name: p.product_name,
        brand: p.brand,
        category,
        grade: result.grade as Grade,
        score: result.score,
        image: getProductImage(p.product_name, result.grade),
      }
    })
    .filter((p): p is Featured => p !== null)
}

export default function FeaturedProducts() {
  const t = useT()
  const [products, setProducts] = useState<Featured[]>([])

  useEffect(() => {
    setProducts(buildFeatured())
  }, [])

  if (products.length === 0) return null

  return (
    <div className="flex-shrink-0">
      <div className="flex items-center justify-between px-5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8721C' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#E8721C' }}>{t('home.featuredToday')}</span>
        </div>
        <Link href="/browse" className="text-[10px] font-semibold transition-opacity hover:opacity-70" style={{ color: '#5A574F' }}>
          {t('home.seeAll')}
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-2 pt-1">
        {products.map((p) => {
          const gradeColor = GRADE_COLORS[p.grade]
          return (
            <Link
              key={`${p.category}-${p.name}`}
              href="/browse"
              className="group shrink-0 w-[136px] h-[156px] rounded-[20px] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(165deg, #FFFFFF 0%, #FAF8F4 100%)',
                border: '1px solid #E2DDD5',
                boxShadow: '0 1px 2px rgba(26,25,23,0.04), 0 8px 20px rgba(26,25,23,0.06)',
              }}
            >
              {/* Soft grade-tinted glow behind product */}
              <div
                className="absolute pointer-events-none transition-opacity duration-300"
                style={{
                  width: 110,
                  height: 110,
                  insetInlineEnd: -25,
                  top: 12,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${gradeColor}22 0%, transparent 60%)`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Grade badge with glow */}
              <div
                className="absolute w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[14px] font-bold z-10"
                style={{
                  top: 10,
                  insetInlineStart: 10,
                  background: GRADE_GRADIENTS[p.grade],
                  boxShadow: `0 2px 8px ${gradeColor}55, 0 0 0 1px rgba(255,255,255,0.5) inset`,
                  textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }}
              >
                {p.grade}
              </div>

              {/* Product image */}
              <img
                src={p.image}
                alt={p.name}
                className="absolute transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'contain',
                  insetInlineEnd: -10,
                  top: 14,
                  filter: 'drop-shadow(0 6px 12px rgba(26,25,23,0.18)) drop-shadow(0 2px 4px rgba(26,25,23,0.08))',
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />

              {/* Product info — bottom block with subtle gradient overlay */}
              <div
                className="absolute inset-x-0 bottom-0 px-3 pt-3 pb-3"
                style={{
                  background: 'linear-gradient(to top, #FFFFFF 0%, #FFFFFF 70%, transparent 100%)',
                }}
              >
                <p className="text-[10px] font-bold leading-[1.15] line-clamp-2" style={{ color: '#1A1917' }}>
                  {p.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: gradeColor }}>
                    {t('home.score')} {p.score}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
