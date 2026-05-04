'use client'

import { useRouter } from 'next/navigation'
import { getDemoProductCount } from '@/lib/demo-products'
import { getCategoryImage } from '@/lib/product-images'

const CATEGORIES = [
  { id: 'dairy', name: 'Dairy', description: 'Milk, cheese, yogurt' },
  { id: 'beverages', name: 'Beverages', description: 'Juices, sodas, water' },
  { id: 'snacks', name: 'Snacks', description: 'Chips, cookies, crackers' },
  { id: 'cereals', name: 'Cereals', description: 'Breakfast cereals, oats' },
  { id: 'bread', name: 'Bread & Bakery', description: 'Bread, pastries' },
  { id: 'meat', name: 'Meat & Poultry', description: 'Chicken, beef, seafood' },
  { id: 'fruits', name: 'Fruits & Veg', description: 'Fresh produce' },
  { id: 'frozen', name: 'Frozen Foods', description: 'Frozen meals, ice cream' },
]

export default function BrowsePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen px-5 py-8 flex flex-col gap-5 mesh-bg pb-24">
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="text-[#9B8E82] transition-colors hover:text-[#2D2A26] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#2D2A26]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-semibold text-[#2D2A26]">Categories</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => {
          const imageUrl = getCategoryImage(cat.id)
          const count = getDemoProductCount(cat.id)
          return (
            <button
              key={cat.id}
              onClick={() => router.push(`/browse/${cat.id}`)}
              className="relative bg-white flex flex-col items-start p-4 animate-slide-up overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
              style={{
                animationDelay: `${i * 50}ms`,
                borderRadius: '22px',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                minHeight: '160px',
              }}
            >
              {/* Text content */}
              <span className="text-[15px] font-bold text-[#2D2A26] relative z-10">{cat.name}</span>
              <span className="text-[11px] text-[#9B8E82] mt-1 relative z-10">{cat.description}</span>
              {count > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#FF8C42] px-2.5 py-1 rounded-full mt-2 font-semibold relative z-10" style={{ background: 'rgba(255, 140, 66, 0.08)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
                  {count} curated
                </span>
              )}

              {/* Product image — large, visible, floating bottom-right */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="absolute -right-3 -bottom-3 w-[110px] h-[110px] object-contain transition-transform duration-300"
                  style={{
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))',
                  }}
                  onMouseOver={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.1) rotate(-5deg)' }}
                  onMouseOut={(e) => { (e.target as HTMLImageElement).style.transform = '' }}
                  loading="lazy"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
