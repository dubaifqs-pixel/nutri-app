'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
import { calculateGrade } from '@/lib/scoring'
import { GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { getProductImage } from '@/lib/product-images'

type Featured = {
  name: string
  brand: string
  category: string
  grade: Grade
  score: number
  image: string
}

const PICKS: { category: string; index: number }[] = [
  { category: 'dairy', index: 2 },     // Almarai Plain Yogurt — likely A/B
  { category: 'dairy', index: 0 },     // Al Ain Full Cream Milk
  { category: 'beverages', index: 0 }, // Coca-Cola — E
  { category: 'snacks', index: 0 },
  { category: 'cereals', index: 0 },
  { category: 'beverages', index: 2 }, // Al Ain Water — A
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
  const [products, setProducts] = useState<Featured[]>([])

  useEffect(() => {
    setProducts(buildFeatured())
  }, [])

  if (products.length === 0) return null

  return (
    <div className="flex-shrink-0">
      <div className="flex items-center justify-between px-5 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8721C' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#E8721C' }}>Featured Today</span>
        </div>
        <Link href="/browse" className="text-[10px] font-semibold" style={{ color: '#5A574F' }}>
          See all →
        </Link>
      </div>

      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 pb-1">
        {products.map((p) => (
          <Link
            key={`${p.category}-${p.name}`}
            href="/browse"
            className="shrink-0 w-[120px] rounded-2xl bg-white relative overflow-hidden transition-transform active:scale-[0.97]"
            style={{ border: '1px solid #E2DDD5', height: 130 }}
          >
            <div className="absolute top-2 left-2 w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[13px] font-bold" style={{ background: GRADE_GRADIENTS[p.grade], boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              {p.grade}
            </div>
            <img
              src={p.image}
              alt={p.name}
              className="absolute"
              style={{ width: 80, height: 80, objectFit: 'contain', right: -6, top: 14, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute left-2 right-2 bottom-2">
              <p className="text-[10px] font-semibold leading-tight line-clamp-2" style={{ color: '#1A1917' }}>{p.name}</p>
              <p className="text-[9px] mt-0.5" style={{ color: '#9A9790' }}>Score: {p.score}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
