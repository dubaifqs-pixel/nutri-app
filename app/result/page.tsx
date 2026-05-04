'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GradeBadge from '@/components/GradeBadge'
import NutritionBreakdown from '@/components/NutritionBreakdown'
import type { ProductData, GradeResult } from '@/lib/types'
import { GRADE_LABELS_EN } from '@/lib/types'

export default function ResultPage() {
  const router = useRouter()
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
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="w-10 h-10 border-2 border-[#FF8C42] border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6 mesh-bg">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/')} className="text-[#9B8E82] transition-colors hover:text-[#2D2A26] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#2D2A26]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <p className="text-xs text-[#B0A89E] uppercase tracking-[0.1em] flex-1">Scan Result</p>
      </div>

      {/* Product Card */}
      {product.image_url && (
        <div className="flex justify-center animate-slide-up stagger-1">
          <div className="w-[160px] h-[160px] rounded-3xl bg-white border border-[#EAE6E0] flex items-center justify-center overflow-hidden p-4">
            <img
              src={product.image_url}
              alt={product.product_name}
              className="max-w-full max-h-full object-contain"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        </div>
      )}

      {/* Product Name */}
      <div className="text-center animate-slide-up stagger-1">
        <h1 className="text-xl font-bold text-[#2D2A26]">{product.product_name}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {product.source === 'vision' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#FF8C42] glass-subtle px-3 py-1.5 rounded-full" style={{ borderColor: 'rgba(255, 140, 66, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
              Analyzed by AI
            </span>
          )}
          {product.data_source && (
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass-subtle ${
              product.data_source === 'AI Knowledge'
                ? 'text-[#FF8C42]'
                : product.data_source === 'Open Food Facts'
                ? 'text-[#3B82F6]'
                : product.data_source === 'USDA'
                ? 'text-[#4A9E3F]'
                : product.data_source === 'Label Scan'
                ? 'text-[#8B5CF6]'
                : 'text-[#9B8E82]'
            }`} style={{ borderColor: product.data_source === 'AI Knowledge'
                ? 'rgba(255, 140, 66, 0.2)'
                : product.data_source === 'Open Food Facts'
                ? 'rgba(59, 130, 246, 0.2)'
                : product.data_source === 'USDA'
                ? 'rgba(74, 158, 63, 0.2)'
                : product.data_source === 'Label Scan'
                ? 'rgba(139, 92, 246, 0.2)'
                : 'rgba(155, 142, 130, 0.2)'
            }}>
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
            <span className="inline-flex items-center gap-1.5 text-xs text-[#E85D26] glass-subtle px-3 py-1.5 rounded-full" style={{ borderColor: 'rgba(232, 93, 38, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Verify data
            </span>
          )}
        </div>
      </div>

      {/* Grade Badge */}
      <div className="animate-scale-in stagger-2">
        <GradeBadge grade={gradeResult.grade} score={gradeResult.score} />
      </div>

      {/* Nutrition Breakdown */}
      <div className="bg-white rounded-3xl p-5 animate-slide-up stagger-3" style={{ border: '1px solid #EAE6E0' }}>
        <NutritionBreakdown gradeResult={gradeResult} nutrition={product.nutrition} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-2 animate-slide-up stagger-4">
        <button onClick={() => router.push('/chat')} className="flex-1 py-3.5 rounded-2xl btn-tangerine text-sm flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Ask AI
        </button>
        <button
          onClick={() => router.push('/alternatives')}
          className="flex-1 py-3.5 rounded-2xl btn-green text-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Alternatives
        </button>
      </div>

      <button onClick={() => router.push('/')} className="w-full py-3.5 rounded-2xl btn-outline text-sm flex items-center justify-center gap-2 animate-slide-up stagger-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        Scan another product
      </button>

      <button onClick={handleShare} className="w-full py-3.5 rounded-2xl btn-outline text-sm flex items-center justify-center gap-2 animate-slide-up stagger-6">
        {shareState === 'copied' ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A9E3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share result
          </>
        )}
      </button>
    </div>
  )
}
