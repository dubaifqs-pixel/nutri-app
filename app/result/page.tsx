'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GradeBadge from '@/components/GradeBadge'
import NutritionBreakdown from '@/components/NutritionBreakdown'
import type { ProductData, GradeResult } from '@/lib/types'
import { GRADE_LABELS_EN } from '@/lib/types'
import { getProductImage } from '@/lib/product-images'
import { useT } from '@/lib/i18n'

export default function ResultPage() {
  const router = useRouter()
  const t = useT()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

  useEffect(() => {
    const productData = sessionStorage.getItem('dfqs_product')
    const gradeData = sessionStorage.getItem('dfqs_grade')
    if (!productData || !gradeData) { router.push('/'); return }
    setProduct(JSON.parse(productData))
    setGradeResult(JSON.parse(gradeData))
  }, [router])

  if (!product || !gradeResult) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F4F0' }}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1A1A1A', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const handleShare = async () => {
    const label = GRADE_LABELS_EN[gradeResult!.grade]
    const text = `I scanned ${product!.product_name} on nutri and it got a grade ${gradeResult!.grade} (${label})! Try it: https://nutri.vercel.app`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // user cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setShareState('copied')
        setTimeout(() => setShareState('idle'), 2000)
      } catch {
        // clipboard API unavailable
      }
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6" style={{ background: '#F5F4F0' }}>
      {/* Header with eyebrow tag */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl transition-colors" style={{ color: '#7A7A7A' }} aria-label="Back home">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1A1A1A' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#1A1A1A' }}>{t('result.scanResult')}</span>
        </div>
      </div>

      {/* Product Image */}
      <div className="flex justify-center animate-slide-up stagger-1">
        <div className="w-[140px] h-[140px] flex items-center justify-center p-2">
          <img
            src={product.image_url || getProductImage(product.product_name, gradeResult.grade)}
            alt={product.product_name}
            className="max-w-full max-h-full object-contain"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}
            onError={(e) => { (e.target as HTMLImageElement).src = getProductImage(product.product_name, gradeResult.grade) }}
          />
        </div>
      </div>

      {/* Product Name + meta pills */}
      <div className="text-center animate-slide-up stagger-1">
        <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{product.product_name}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {product.source === 'vision' && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-full" style={{ color: '#7A7A7A', border: '1px solid rgba(0,0,0,0.06)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
              {t('result.analyzedByAI')}
            </span>
          )}
          {product.data_source && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white" style={{ color: '#7A7A7A', border: '1px solid rgba(0,0,0,0.06)' }}>
              {product.data_source === 'AI Knowledge' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
              )}
              {product.data_source === 'Open Food Facts' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              )}
              {product.data_source === 'USDA' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              )}
              {product.data_source === 'Label Scan' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              )}
              {product.data_source}
            </span>
          )}
          {product.confidence === 'low' && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-full" style={{ color: '#C62828', border: '1px solid rgba(0,0,0,0.06)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              {t('result.verifyData')}
            </span>
          )}
        </div>
      </div>

      {/* Grade Badge */}
      <div className="animate-scale-in stagger-2">
        <GradeBadge grade={gradeResult.grade} score={gradeResult.score} />
      </div>

      {/* Nutrition Breakdown */}
      <div className="bg-white rounded-[28px] p-5 animate-slide-up stagger-3" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
        <NutritionBreakdown gradeResult={gradeResult} nutrition={product.nutrition} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-2 animate-slide-up stagger-4">
        <button onClick={() => router.push('/chat')} className="flex-1 py-3.5 rounded-2xl btn-accent text-sm flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {t('result.askAI')}
        </button>
        <button
          onClick={() => router.push('/alternatives')}
          className="flex-1 py-3.5 rounded-2xl btn-outline-accent text-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          {t('result.alternatives')}
        </button>
      </div>

      <button onClick={() => router.push('/')} className="w-full py-3.5 rounded-2xl btn-outline text-sm flex items-center justify-center gap-2 animate-slide-up stagger-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        {t('result.scanAnother')}
      </button>

      <button onClick={handleShare} className="w-full py-3.5 rounded-2xl btn-outline text-sm flex items-center justify-center gap-2 animate-slide-up stagger-6">
        {shareState === 'copied' ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            {t('result.copied')}
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            {t('result.share')}
          </>
        )}
      </button>
    </div>
  )
}
