'use client'

import { useRouter } from 'next/navigation'
import { getDemoProductCount } from '@/lib/demo-products'
import FoodCategory from '@/components/illustrations/FoodCategory'

const CATEGORY_COLORS: Record<string, string> = {
  dairy: '#3B82F6',
  beverages: '#8B5CF6',
  snacks: '#F59E0B',
  cereals: '#10B981',
  bread: '#D97706',
  meat: '#EF4444',
  fruits: '#22C55E',
  frozen: '#06B6D4',
}

const CATEGORIES = [
  { id: 'dairy', name: 'Dairy', description: 'Milk, cheese, yogurt' },
  { id: 'beverages', name: 'Beverages', description: 'Juices, sodas, water' },
  { id: 'snacks', name: 'Snacks', description: 'Chips, cookies, crackers' },
  { id: 'cereals', name: 'Cereals', description: 'Breakfast cereals, oats' },
  { id: 'bread', name: 'Bread & Bakery', description: 'Bread, pastries, baked goods' },
  { id: 'meat', name: 'Meat & Poultry', description: 'Chicken, beef, seafood' },
  { id: 'fruits', name: 'Fruits & Vegetables', description: 'Fresh produce' },
  { id: 'frozen', name: 'Frozen Foods', description: 'Frozen meals, ice cream' },
] as const

export default function BrowsePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6 mesh-bg">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="text-[#6B7194] transition-colors hover:text-[#1A1D2E] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#1A1D2E]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#1A1D2E]">Browse by Category</h1>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => {
          const accentColor = CATEGORY_COLORS[cat.id] || '#6B7194'
          return (
            <button
              key={cat.id}
              onClick={() => router.push(`/browse/${cat.id}`)}
              className="glass-card card-3d flex flex-col items-center gap-2 p-4 animate-slide-up"
              style={{
                animationDelay: `${i * 50}ms`,
                borderRadius: '20px',
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <FoodCategory category={cat.id as any} size={52} />
              <span className="text-sm font-semibold text-[#1A1D2E]">{cat.name}</span>
              <span className="text-[11px] text-[#6B7194] text-center leading-tight">{cat.description}</span>
              {getDemoProductCount(cat.id) > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#D89A0E] px-2.5 py-1 rounded-full mt-0.5" style={{ background: 'rgba(241, 177, 35, 0.08)' }}>
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
