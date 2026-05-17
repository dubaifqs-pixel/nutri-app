'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useRef, useState, Suspense } from 'react'
import Scanner from '@/components/Scanner'
import { addToHistory } from '@/lib/history'
import type { GradeResult } from '@/lib/types'

function ScanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = (searchParams.get('mode') as 'barcode' | 'label') || 'label'
  const startManual = searchParams.get('manual') === '1'
  const returnTo = searchParams.get('return')
  const slot = searchParams.get('slot')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  // Two-stage barcode flow state.
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null)
  const [pendingMatch, setPendingMatch] = useState<any | null>(null)
  const [pendingGrade, setPendingGrade] = useState<GradeResult | null>(null)
  const [unknownBarcode, setUnknownBarcode] = useState<string | null>(null)
  const autoLabelTimerRef = useRef<number | null>(null)
  const cancelledRef = useRef(false)
  // Prefilled product context — set when the label scanner is reached from
  // the barcode flow (Stage 1 result becomes the label scanner's input).
  const prefilledName = searchParams.get('prefilled_name')
  const prefilledImage = searchParams.get('prefilled_image')
  const prefilledBarcode = searchParams.get('barcode')

  const lookupBarcode = async (barcode: string) => {
    setStatus(`Looking up product: ${barcode}...`)
    const res = await fetch('/api/barcode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode }),
    })
    if (!res.ok) {
      // Surface the structured reason so handleBarcode can route the user properly.
      const err = await res.json().catch(() => ({}))
      const e: Error & { reason?: string; barcode?: string } = new Error(err.error || 'Product not found in database')
      e.reason = err.reason
      e.barcode = err.barcode || barcode
      throw e
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
    setDetectedBarcode(barcode)
    try {
      const product = await lookupBarcode(barcode)
      // Two-stage barcode flow:
      //   Stage 1 (just completed): barcode → product name + image
      //   Stage 2 (next): scan the printed nutrition label for accurate values
      // Brief preview screen lets the user confirm the matched product, then auto-routes
      // to label mode. The label scanner skips its own Stage 1 (name) because we already
      // have the name from the barcode.
      setPendingMatch(product)
      const gradeResult = await getGrade(product.nutrition)
      setPendingGrade(gradeResult)
      // Auto-progress to label scan after a short preview so the user can spot wrong matches.
      autoLabelTimerRef.current = window.setTimeout(() => {
        if (!cancelledRef.current) routeToLabel(product)
      }, 1800)
    } catch (err) {
      const e = err as Error & { reason?: string; barcode?: string }
      if (e.reason === 'unknown_barcode') {
        setUnknownBarcode(e.barcode || barcode)
        setLoading(false)
        return
      }
      setStatus(e.message || 'Something went wrong')
      setTimeout(() => setLoading(false), 3000)
    }
  }

  const cancelMatch = () => {
    cancelledRef.current = true
    if (autoLabelTimerRef.current) {
      clearTimeout(autoLabelTimerRef.current)
      autoLabelTimerRef.current = null
    }
    setPendingMatch(null)
    setPendingGrade(null)
    setDetectedBarcode(null)
    setLoading(false)
    cancelledRef.current = false
  }

  // Skip the label scan and accept the OFF/AI database values as-is.
  const useDatabaseValues = () => {
    if (autoLabelTimerRef.current) {
      clearTimeout(autoLabelTimerRef.current)
      autoLabelTimerRef.current = null
    }
    cancelledRef.current = true
    if (!pendingMatch || !pendingGrade) return
    goToResult(pendingMatch, pendingGrade)
  }

  // Route the user to label mode, preserving the product name + image we already have.
  // The label scanner will skip stage 1 and read nutrition values from the printed label.
  const routeToLabel = (product: any) => {
    const params = new URLSearchParams()
    params.set('mode', 'label')
    if (product.product_name) params.set('prefilled_name', product.product_name)
    if (product.image_url) params.set('prefilled_image', product.image_url)
    if (product.barcode || detectedBarcode) params.set('barcode', product.barcode || detectedBarcode || '')
    router.push(`/scan?${params.toString()}`)
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
        const raw = await res.json()
        const product = {
          // Prefer the prefilled name (from barcode → verify-with-label path) over what the
          // OCR read off the label, since the barcode-derived name is usually more complete.
          product_name: prefilledName || raw.product_name,
          nutrition: raw.nutrition, // per 100g — used by the grade algorithm
          serving_nutrition: raw.serving_nutrition ?? null,
          serving_size_g: raw.serving_size_g ?? null,
          serving_size_ml: raw.serving_size_ml ?? null,
          image_url: prefilledImage || undefined,
          barcode: prefilledBarcode || undefined,
          source: raw.source || 'vision',
          data_source: prefilledBarcode ? 'Label Scan (verified)' : 'Label Scan',
        }
        const gradeResult = await getGrade(product.nutrition)
        goToResult(product, gradeResult)
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Something went wrong -- please try again')
        setTimeout(() => setLoading(false), 3000)
      }
    }
  }

  // Unknown barcode — offer label scan instead.
  if (unknownBarcode) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.15)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div>
          <p className="text-white text-lg font-bold">Barcode not in our database</p>
          <p className="text-white/50 text-xs mt-1.5" dir="ltr">{unknownBarcode}</p>
          <p className="text-white/40 text-sm mt-3 max-w-xs">We couldn’t find this product. Scan the nutrition label on the back instead — we’ll read the values directly.</p>
        </div>
        <div className="flex flex-col gap-2.5 w-full max-w-xs">
          <button onClick={() => { setUnknownBarcode(null); router.push('/scan?mode=label') }} className="w-full py-3.5 rounded-2xl btn-accent text-sm flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan nutrition label
          </button>
          <button onClick={() => { setUnknownBarcode(null); setLoading(false) }} className="w-full py-3 rounded-2xl text-white/60 text-sm hover:text-white transition-colors min-h-[44px]">
            Try a different barcode
          </button>
        </div>
      </div>
    )
  }

  // Step 1 complete — show matched product, then auto-progress to label scan.
  if (pendingMatch && pendingGrade) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center gap-5 px-8 text-center animate-fade-in pb-8">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#B6F074', color: '#1A1A1A' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          <span className="w-8 h-px bg-white/20" />
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: 'rgba(182,240,116,0.15)', color: 'rgba(255,255,255,0.5)' }}>2</span>
        </div>

        <div className="max-w-xs flex flex-col items-center gap-2">
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Step 1 complete · Product identified</p>
          <p className="text-white text-xl font-bold leading-tight">{pendingMatch.product_name}</p>
          {detectedBarcode && <p className="text-white/40 text-[10px]" dir="ltr">{detectedBarcode}</p>}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#B6F074] animate-pulse" />
          <p className="text-white/80 text-[13px]">Step 2 — opening label scanner…</p>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
          <button onClick={useDatabaseValues} className="w-full py-2.5 rounded-2xl text-white/50 text-[12px] hover:text-white/80 transition-colors min-h-[40px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
            Skip — use database values
          </button>
          <button onClick={cancelMatch} className="w-full py-2 text-white/40 text-[12px] hover:text-white/60 transition-colors min-h-[36px]">
            Wrong product — rescan
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center gap-6 px-8">
        {/* Animated rings */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-[#B6F074]/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-[#B6F074] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-2 border-[#D4F5A8]/20 rounded-full" />
          <div className="absolute inset-2 border-2 border-[#D4F5A8] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B6F074" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
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
        skipNameStage={!!prefilledName}
        onBarcode={handleBarcode}
        onCapture={handleCapture}
        onAutoDetect={mode === 'label' ? async (data: any) => {
          setLoading(true)
          setStatus('Label detected! Calculating grade...')
          try {
            const product = {
              // Prefilled name (from barcode verify-with-label) wins over OCR-read name.
              product_name: prefilledName || data.product_name,
              nutrition: data.nutrition, // per 100g
              serving_nutrition: data.serving_nutrition ?? null,
              serving_size_g: data.serving_size_g ?? null,
              serving_size_ml: data.serving_size_ml ?? null,
              image_url: prefilledImage || undefined,
              barcode: prefilledBarcode || undefined,
              source: data.source,
              data_source: prefilledBarcode ? 'Label Scan (verified)' : 'Label Scan',
            }
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
    <Suspense fallback={<div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#B6F074] border-t-transparent rounded-full animate-spin" /></div>}>
      <ScanContent />
    </Suspense>
  )
}
