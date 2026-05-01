'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GradeBadge from '@/components/GradeBadge'
import NutritionBreakdown from '@/components/NutritionBreakdown'
import type { ProductData, GradeResult } from '@/lib/types'

export default function ResultPage() {
  const router = useRouter()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [loadingRec, setLoadingRec] = useState(false)

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

  const handleRecommend = async () => {
    setLoadingRec(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_grade: gradeResult.grade, product_name: product.product_name, nutrition: product.nutrition }),
      })
      const data = await res.json()
      if (data.error) {
        sessionStorage.setItem('dfqs_recommendations', JSON.stringify({ alternatives: [], summary: data.error }))
      } else {
        sessionStorage.setItem('dfqs_recommendations', JSON.stringify(data))
      }
      router.push('/chat?tab=recommend')
    } catch {
      sessionStorage.setItem('dfqs_recommendations', JSON.stringify({ alternatives: [], summary: 'Could not find alternatives -- please try again' }))
      router.push('/chat?tab=recommend')
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wide" style={{ fontFamily: 'var(--font-inter)', letterSpacing: '0.05em' }}>Scan Result</p>
        <h1 className="text-xl font-bold text-[#3A3F57] mt-1">{product.product_name}</h1>
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
          onClick={handleRecommend}
          disabled={loadingRec}
          className="flex-1 py-3 rounded-xl bg-[#3A3F57] text-white font-semibold text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          {loadingRec ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Alternatives
            </>
          )}
        </button>
      </div>
      <button onClick={() => router.push('/')} className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 hover:text-gray-600 active:scale-[0.98]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        Scan another product
      </button>
    </div>
  )
}
