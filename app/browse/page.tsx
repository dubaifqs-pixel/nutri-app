'use client'

import { useRouter } from 'next/navigation'
import { getDemoProductCount } from '@/lib/demo-products'

const CATEGORY_COLORS: Record<string, string> = {
  dairy: '#3B82F6',
  beverages: '#8B5CF6',
  snacks: '#FF8C42',
  cereals: '#4A9E3F',
  bread: '#E85D26',
  meat: '#C62828',
  fruits: '#6BBF59',
  frozen: '#06B6D4',
}

const CATEGORY_IMAGES: Record<string, string> = {
  dairy: '/products/milk.png',
  beverages: '/products/orange-juice.png',
  snacks: '/products/chips.png',
  cereals: '/products/cereal.png',
  bread: '/products/bread.png',
  meat: '/products/chicken.png',
  fruits: '/products/yogurt.png',
  frozen: '/products/cocacola.png',
}

const CATEGORIES = [
  {
    id: 'dairy',
    name: 'Dairy',
    description: 'Milk, cheese, yogurt',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Juices, sodas, water',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    description: 'Chips, cookies, crackers',
  },
  {
    id: 'cereals',
    name: 'Cereals',
    description: 'Breakfast cereals, oats',
  },
  {
    id: 'bread',
    name: 'Bread & Bakery',
    description: 'Bread, pastries, baked goods',
  },
  {
    id: 'meat',
    name: 'Meat & Poultry',
    description: 'Chicken, beef, seafood',
  },
  {
    id: 'fruits',
    name: 'Fruits & Vegetables',
    description: 'Fresh produce',
  },
  {
    id: 'frozen',
    name: 'Frozen Foods',
    description: 'Frozen meals, ice cream',
  },
]

export default function BrowsePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6 mesh-bg">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="text-[#9B8E82] transition-colors hover:text-[#2D2A26] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#2D2A26]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#2D2A26]">Browse by Category</h1>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => {
          const accentColor = CATEGORY_COLORS[cat.id] || '#9B8E82'
          const imageUrl = CATEGORY_IMAGES[cat.id]
          return (
            <button
              key={cat.id}
              onClick={() => router.push(`/browse/${cat.id}`)}
              className="relative bg-white flex flex-col items-start gap-2 p-4 pb-3 animate-slide-up overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
              style={{
                animationDelay: `${i * 50}ms`,
                borderRadius: '24px',
                border: '1px solid #EAE6E0',
              }}
            >
              {/* Product image thumbnail */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="absolute -right-2 -bottom-2 w-[70px] h-[70px] object-contain opacity-20"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                />
              )}
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${accentColor}12` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: accentColor }} />
              </div>
              <span className="text-[14px] font-bold text-[#2D2A26] relative z-10">{cat.name}</span>
              <span className="text-[11px] text-[#9B8E82] leading-tight relative z-10">{cat.description}</span>
              {getDemoProductCount(cat.id) > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#FF8C42] px-2.5 py-1 rounded-full mt-0.5 font-semibold relative z-10" style={{ background: 'rgba(255, 140, 66, 0.08)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
                  {getDemoProductCount(cat.id)} curated
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
