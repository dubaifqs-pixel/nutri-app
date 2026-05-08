'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import Scanner from '@/components/Scanner'
import { addToHistory } from '@/lib/history'

function ScanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = (searchParams.get('mode') as 'barcode' | 'label') || 'label'
  const startManual = searchParams.get('manual') === '1'
  const returnTo = searchParams.get('return')
  const slot = searchParams.get('slot')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const lookupBarcode = async (barcode: string) => {
    setStatus(`Looking up product: ${barcode}...`)
    const res = await fetch('/api/barcode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
    if (!res.ok) {
      throw new Error('Product not found in database')
    }
    return await res.json()
  }

  const getGrade = async (nutrition: any) => {
    setStatus('Calculating grade...')
    const gradeRes = await fetch('/api/grade', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nutrition }),
    })
    return await gradeRes.json()
  }

  const goToResult = (product: any, gradeResult: any) => {
    addToHistory(product, gradeResult)
    if (returnTo === 'compare' && (slot === '1' || slot === '2')) {
      sessionStorage.setItem(`dfqs_compare_${slot}`, JSON.stringify(product))
      sessionStorage.setItem(`dfqs_compare_${slot}_grade`, JSON.stringify(gradeResult))
      router.push('/compare')
      return
    }
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
      setStatus(err instanceof Error ? err.message : 'Something went wrong')
      setTimeout(() => setLoading(false), 3000)
    }
  }

  const handleCapture = async (imageBase64: string) => {
    setLoading(true)

    if (mode === 'barcode') {
      setStatus('Reading barcode with AI...')
      try {
        const barcodeRes = await fetch('/api/scan-barcode', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        })
        if (!barcodeRes.ok) {
          const err = await barcodeRes.json().catch(() => ({}))
          setStatus(err.error || 'Could not read barcode -- try entering it manually')
          setTimeout(() => setLoading(false), 3000)
          return
        }
        const { barcode } = await barcodeRes.json()
        const product = await lookupBarcode(barcode)
        const gradeResult = await getGrade(product.nutrition)
        goToResult(product, gradeResult)
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Something went wrong -- try entering manually')
        setTimeout(() => setLoading(false), 3000)
      }
    } else {
      setStatus('Reading nutrition label...')
      try {
        // Progress messages while waiting
        const progressTimer = setTimeout(() => setStatus('Extracting nutrition values...'), 2000)
        const progressTimer2 = setTimeout(() => setStatus('Identifying product...'), 4000)
        const progressTimer3 = setTimeout(() => setStatus('Almost done...'), 6000)

        const res = await fetch('/api/scan-label', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 }),
        })

        clearTimeout(progressTimer)
        clearTimeout(progressTimer2)
        clearTimeout(progressTimer3)

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setStatus(err.error || 'Could not read label -- try with better lighting')
          setTimeout(() => setLoading(false), 3000)
          return
        }
        setStatus('Calculating grade...')
        const product = await res.json()
        const gradeResult = await getGrade(product.nutrition)
        goToResult(product, gradeResult)
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Something went wrong -- please try again')
        setTimeout(() => setLoading(false), 3000)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1917] flex flex-col items-center justify-center gap-6 px-8">
        {/* Animated rings */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[#E8721C]/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-[#E8721C] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-[#F5C4A0]/20 rounded-full" />
          <div className="absolute inset-2 border-2 border-[#F5C4A0] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8721C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-medium">{status}</p>
          <p className="text-white/40 text-xs mt-2">Powered by AI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      <button onClick={() => router.push('/')} className="absolute top-4 right-4 z-50 glass-dark text-white rounded-full w-11 h-11 flex items-center justify-center transition-all hover:bg-white/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <Scanner
        mode={mode}
        onBarcode={handleBarcode}
        onCapture={handleCapture}
        onAutoDetect={mode === 'label' ? async (data: any) => {
          setLoading(true)
          setStatus('Label detected! Calculating grade...')
          try {
            const product = { product_name: data.product_name, nutrition: data.nutrition, source: data.source }
            const gradeResult = await getGrade(product.nutrition)
            goToResult(product, gradeResult)
          } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Something went wrong')
            setTimeout(() => setLoading(false), 3000)
          }
        } : undefined}
        startManual={startManual}
      />
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1A1917] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#E8721C] border-t-transparent rounded-full animate-spin" /></div>}>
      <ScanContent />
    </Suspense>
  )
}
