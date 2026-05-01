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
      sessionStorage.setItem('dfqs_recommendations', JSON.stringify({ alternatives: [], summary: 'تعذر البحث عن بدائل — حاول مرة أخرى' }))
      router.push('/chat?tab=recommend')
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6">
      <div className="text-center" dir="rtl">
        <p className="text-sm text-gray-500">نتيجة التقييم</p>
        <h1 className="text-xl font-bold text-gray-800 mt-1">{product.product_name}</h1>
        {product.source === 'vision' && (
          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full mt-2 inline-block">📷 تم التحليل بالذكاء الاصطناعي</span>
        )}
      </div>
      <GradeBadge grade={gradeResult.grade} score={gradeResult.score} />
      <NutritionBreakdown gradeResult={gradeResult} nutrition={product.nutrition} />
      <div className="flex gap-3 mt-2">
        <button onClick={() => router.push('/chat')} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-sm shadow-lg shadow-yellow-500/25">
          💬 اسأل AI
        </button>
        <button
          onClick={handleRecommend}
          disabled={loadingRec}
          className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-semibold text-sm shadow-lg disabled:opacity-60"
        >
          {loadingRec ? '⏳ جارٍ البحث...' : '🔍 بدائل'}
        </button>
      </div>
      <button onClick={() => router.push('/')} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm">امسح منتج آخر</button>
    </div>
  )
}
