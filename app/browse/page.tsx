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
    <div className="min-h-screen px-5 py-8 flex flex-col gap-5 pb-24" style={{ background: '#F1EEE8' }}>
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl transition-colors" style={{ color: '#5A574F' }} aria-label="Back home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8721C' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#E8721C' }}>Browse</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1917' }}>Categories</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => {
          const imageUrl = getCategoryImage(cat.id)
          const count = getDemoProductCount(cat.id)
          return (
            <button
              key={cat.id}
              onClick={() => router.push(`/browse/${cat.id}`)}
              className="group relative flex flex-col items-start p-4 animate-slide-up overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              style={{
                animationDelay: `${i * 50}ms`,
                borderRadius: '22px',
                border: '1px solid #E2DDD5',
                minHeight: '160px',
                background: 'linear-gradient(165deg, #FFFFFF 0%, #FAF8F4 100%)',
                boxShadow: '0 1px 2px rgba(26,25,23,0.04), 0 6px 16px rgba(26,25,23,0.05)',
              }}
            >
              {/* Soft warm glow behind product image */}
              <div
                className="absolute pointer-events-none"
                style={{
                  width: 140,
                  height: 140,
                  insetInlineEnd: -50,
                  bottom: -50,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(232,114,28,0.08) 0%, transparent 60%)',
                  filter: 'blur(6px)',
                }}
              />

              <span className="text-[15px] font-bold relative z-10" style={{ color: '#1A1917' }}>{cat.name}</span>
              <span className="text-[11px] mt-1 relative z-10" style={{ color: '#9A9790' }}>{cat.description}</span>
              {count > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full mt-2 font-semibold relative z-10" style={{ color: '#E8721C', background: '#FEF0E6', border: '1px solid #F5C4A0' }}>
                  {count} curated
                </span>
              )}

              {/* Frozen gets a 3-item composition for variety */}
              {cat.id === 'frozen' ? (
                <div className="absolute w-[140px] h-[140px] pointer-events-none" style={{ insetInlineEnd: -16, bottom: -16 }}>
                  <img
                    src="/products/cat-icecream.png"
                    alt="ice cream"
                    className="absolute transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    style={{ width: 70, height: 70, objectFit: 'contain', insetInlineEnd: 8, bottom: 56, filter: 'drop-shadow(0 6px 12px rgba(26,25,23,0.18)) drop-shadow(0 2px 4px rgba(26,25,23,0.08))', zIndex: 3 }}
                    loading="lazy"
                  />
                  <img
                    src="/products/cat-chicken.png"
                    alt="frozen chicken"
                    className="absolute transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3"
                    style={{ width: 78, height: 78, objectFit: 'contain', insetInlineEnd: 50, bottom: 6, filter: 'drop-shadow(0 6px 12px rgba(26,25,23,0.16)) drop-shadow(0 2px 4px rgba(26,25,23,0.08))', zIndex: 2 }}
                    loading="lazy"
                  />
                  <img
                    src="/products/cat-fruit.png"
                    alt="frozen vegetables"
                    className="absolute transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-6"
                    style={{ width: 64, height: 64, objectFit: 'contain', insetInlineEnd: -4, bottom: 12, filter: 'drop-shadow(0 6px 12px rgba(26,25,23,0.16)) drop-shadow(0 2px 4px rgba(26,25,23,0.08))', zIndex: 1 }}
                    loading="lazy"
                  />
                </div>
              ) : imageUrl && (
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="absolute w-[120px] h-[120px] object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
                  style={{
                    insetInlineEnd: -12,
                    bottom: -12,
                    filter: 'drop-shadow(0 8px 16px rgba(26,25,23,0.16)) drop-shadow(0 3px 6px rgba(26,25,23,0.08))',
                  }}
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
