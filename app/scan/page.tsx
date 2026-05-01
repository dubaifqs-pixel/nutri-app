'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import Scanner from '@/components/Scanner'

function ScanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = (searchParams.get('mode') as 'barcode' | 'label') || 'label'
  const startManual = searchParams.get('manual') === '1'
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const lookupBarcode = async (barcode: string) => {
    setStatus(`جارٍ البحث عن المنتج: ${barcode}...`)
    const res = await fetch('/api/barcode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
    if (!res.ok) {
      throw new Error('المنتج غير موجود في قاعدة البيانات')
    }
    return await res.json()
  }

  const getGrade = async (nutrition: any) => {
    setStatus('جارٍ حساب التقييم...')
    const gradeRes = await fetch('/api/grade', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nutrition }),
    })
    return await gradeRes.json()
  }

  const goToResult = (product: any, gradeResult: any) => {
    sessionStorage.setItem('dfqs_product', JSON.stringify(product))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
  }

  const handleBarcode = async (barcode: string) => {
    setLoading(true)
    try {
      const product = await lookupBarcode(barcode)
      const gradeResult = await getGrade(product.nutrition)
      goToResult(product, gradeResult)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'حدث خطأ')
      setTimeout(() => setLoading(false), 3000)
    }
  }

  const handleCapture = async (imageBase64: string) => {
    setLoading(true)

    if (mode === 'barcode') {
      // Use AI to read barcode from photo, then look up product
      setStatus('جارٍ قراءة الباركود بالذكاء الاصطناعي...')
      try {
        const barcodeRes = await fetch('/api/scan-barcode', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        })
        if (!barcodeRes.ok) {
          const err = await barcodeRes.json().catch(() => ({}))
          setStatus(err.error || 'تعذر قراءة الباركود — جرّب الإدخال اليدوي')
          setTimeout(() => setLoading(false), 3000)
          return
        }
        const { barcode } = await barcodeRes.json()
        const product = await lookupBarcode(barcode)
        const gradeResult = await getGrade(product.nutrition)
        goToResult(product, gradeResult)
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'حدث خطأ — جرّب الإدخال اليدوي')
        setTimeout(() => setLoading(false), 3000)
      }
    } else {
      // Use AI to read nutrition label directly
      setStatus('جارٍ تحليل الملصق الغذائي...')
      try {
        const res = await fetch('/api/scan-label', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setStatus(err.error || 'تعذر قراءة الملصق — حاول بإضاءة أفضل')
          setTimeout(() => setLoading(false), 3000)
          return
        }
        const product = await res.json()
        const gradeResult = await getGrade(product.nutrition)
        goToResult(product, gradeResult)
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'حدث خطأ — حاول مرة أخرى')
        setTimeout(() => setLoading(false), 3000)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-8">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm text-center" dir="rtl">{status}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      <button onClick={() => router.push('/')} className="absolute top-4 right-4 z-50 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur">✕</button>
      <Scanner mode={mode} onBarcode={handleBarcode} onCapture={handleCapture} startManual={startManual} />
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <ScanContent />
    </Suspense>
  )
}
