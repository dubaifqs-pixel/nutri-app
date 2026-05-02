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
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /></div>
  }

  const handleShare = async () => {
    const label = GRADE_LABELS_EN[gradeResult!.grade]
    const text = `I scanned ${product!.product_name} on DFQS and it got a grade ${gradeResult!.grade} (${label})! Try it: https://dfqs.vercel.app`

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
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-400 transition-colors hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <p className="text-sm text-gray-400 uppercase tracking-wide flex-1" style={{ fontFamily: 'var(--font-inter)', letterSpacing: '0.05em' }}>Scan Result</p>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#3A3F57]">{product.product_name}</h1>
        {product.source === 'vision' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#D89A0E] bg-yellow-50 px-2.5 py-1 rounded-full mt-2 border border-yellow-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            Analyzed by AI
          </span>
        )}
      </div>
      <GradeBadge grade={gradeResult.grade} score={gradeResult.score} />
      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
        <NutritionBreakdown gradeResult={gradeResult} nutrition={product.nutrition} />
      </div>
      <div className="flex gap-3 mt-2">
        <button onClick={() => router.push('/chat')} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F1B123] to-[#D89A0E] text-white font-semibold text-sm shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Ask AI
        </button>
        <button
          onClick={() => router.push('/alternatives')}
          className="flex-1 py-3 rounded-xl bg-[#3A3F57] text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Alternatives
        </button>
      </div>
      <button onClick={() => router.push('/')} className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 hover:text-gray-600 active:scale-[0.98]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        Scan another product
      </button>
      <button onClick={handleShare} className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 hover:text-gray-600 active:scale-[0.98]">
        {shareState === 'copied' ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Copied!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share result
          </>
        )}
      </button>
    </div>
  )
}
