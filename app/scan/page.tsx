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

  const handleBarcode = async (barcode: string) => {
    setLoading(true)
    setStatus('جارٍ البحث عن المنتج...')
    try {
      const res = await fetch('/api/barcode', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      })
      if (!res.ok) {
        setStatus('المنتج غير موجود — جرّب مسح الملصق الغذائي')
        setLoading(false)
        setTimeout(() => router.push('/scan?mode=label'), 2000)
        return
      }
      const product = await res.json()
      sessionStorage.setItem('dfqs_product', JSON.stringify(product))
      const gradeRes = await fetch('/api/grade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nutrition: product.nutrition }),
      })
      const gradeResult = await gradeRes.json()
      sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
      router.push('/result')
    } catch {
      setStatus('حدث خطأ — حاول مرة أخرى')
      setLoading(false)
    }
  }

  const handleCapture = async (imageBase64: string) => {
    setLoading(true)
    setStatus('جارٍ التحليل بالذكاء الاصطناعي...')
    try {
      const res = await fetch('/api/scan-label', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      })
      if (!res.ok) {
        setStatus('تعذر قراءة الملصق — حاول مرة أخرى بإضاءة أفضل')
        setLoading(false)
        return
      }
      const product = await res.json()
      sessionStorage.setItem('dfqs_product', JSON.stringify(product))
      const gradeRes = await fetch('/api/grade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nutrition: product.nutrition }),
      })
      const gradeResult = await gradeRes.json()
      sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
      router.push('/result')
    } catch {
      setStatus('حدث خطأ — حاول مرة أخرى')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm" dir="rtl">{status}</p>
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
