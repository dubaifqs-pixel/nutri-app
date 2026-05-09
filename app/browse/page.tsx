'use client'

import { useRouter } from 'next/navigation'
import { getDemoProductCount } from '@/lib/demo-products'
import { getCategoryImage } from '@/lib/product-images'
import { useT } from '@/lib/i18n'

const CATEGORY_IDS = ['dairy', 'beverages', 'snacks', 'cereals', 'bread', 'meat', 'fruits', 'frozen'] as const
type CategoryId = typeof CATEGORY_IDS[number]

export default function BrowsePage() {
  const router = useRouter()
  const t = useT()

  return (
    <div className="min-h-screen px-5 py-8 flex flex-col gap-5 pb-24" style={{ background: '#F5F4F0' }}>
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl transition-colors" style={{ color: '#7A7A7A' }} aria-label="Back home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1A1A1A' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#1A1A1A' }}>{t('browse.section')}</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{t('browse.title')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORY_IDS.map((catId: CategoryId, i) => {
          const imageUrl = getCategoryImage(catId)
          const count = getDemoProductCount(catId)
          const name = t(`browse.cat.${catId}` as const)
          const description = t(`browse.cat.${catId}.desc` as const)
          return (
            <button
              key={catId}
              onClick={() => router.push(`/browse/${catId}`)}
              className="group relative flex flex-col items-start p-4 animate-slide-up overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              style={{
                animationDelay: `${i * 50}ms`,
                borderRadius: '22px',
                border: '1px solid rgba(0,0,0,0.06)',
                minHeight: '160px',
                background: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
                  background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 60%)',
                  filter: 'blur(6px)',
                }}
              />

              <span className="text-[15px] font-bold relative z-10" style={{ color: '#1A1A1A' }}>{name}</span>
              <span className="text-[11px] mt-1 relative z-10" style={{ color: '#ACACAC' }}>{description}</span>
              {count > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full mt-2 font-semibold relative z-10" style={{ color: '#1A1A1A', background: '#F0FBDF', border: '1px solid #D4F5A8' }}>
                  {count} {t('browse.curated')}
                </span>
              )}

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={name}
                  className="absolute w-[120px] h-[120px] object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
                  style={{
                    insetInlineEnd: -12,
                    bottom: -12,
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12)) drop-shadow(0 3px 6px rgba(0,0,0,0.06))',
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
