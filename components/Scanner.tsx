'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  onBarcode: (barcode: string) => void
  onCapture: (imageBase64: string) => void
  mode: 'barcode' | 'label'
  startManual?: boolean
}

export default function Scanner({ onBarcode, onCapture, mode, startManual = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [showManual, setShowManual] = useState(startManual)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (showManual) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }
        })
        const track = stream.getVideoTracks()[0]
        try {
          const caps = track.getCapabilities?.() as any
          if (caps?.focusMode?.includes('continuous')) {
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as any] })
          }
        } catch {}
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setVideoReady(true)
        }
      } catch {
        setError('تعذر الوصول للكاميرا')
      }
    }
    startCamera()
    return stopCamera
  }, [stopCamera, showManual])

  const capturePhoto = () => {
    if (!videoRef.current || !videoReady) return
    const video = videoRef.current
    const maxWidth = 1280
    const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL('image/jpeg', 0.85)
    stopCamera()
    onCapture(base64)
  }

  const handleManualSubmit = () => {
    const trimmed = manualBarcode.trim()
    if (trimmed.length >= 8) {
      onBarcode(trimmed)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white text-center p-8 gap-4">
        <p>{error}</p>
        {mode === 'barcode' && (
          <button
            onClick={() => { setError(null); setShowManual(true) }}
            className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm"
          >
            أدخل الباركود يدوياً
          </button>
        )}
      </div>
    )
  }

  if (showManual) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8" style={{ height: '100vh' }}>
        <div className="text-white text-center mb-4" dir="rtl">
          <p className="text-lg font-semibold">أدخل رقم الباركود</p>
          <p className="text-sm text-white/60 mt-1">أدخل الرقم الموجود أسفل الباركود</p>
        </div>
        <input
          type="tel"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
          placeholder="مثال: 6281100120018"
          className="w-full max-w-xs bg-white/10 text-white text-center text-xl px-4 py-4 rounded-xl border border-white/20 outline-none placeholder:text-white/30 tracking-widest"
          dir="ltr"
          autoFocus
        />
        <button
          onClick={handleManualSubmit}
          disabled={manualBarcode.trim().length < 8}
          className="w-full max-w-xs py-3 rounded-xl bg-yellow-500 text-white font-semibold disabled:opacity-40"
        >
          بحث
        </button>
        <button
          onClick={() => { setShowManual(false); setManualBarcode('') }}
          className="text-white/50 text-sm mt-2"
        >
          العودة للكاميرا
        </button>
      </div>
    )
  }

  const guideText = mode === 'barcode'
    ? 'صوّر الباركود'
    : 'صوّر الملصق الغذائي'

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height: '100vh' }}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="border-2 border-yellow-400 rounded-xl"
          style={{
            width: mode === 'barcode' ? '280px' : '288px',
            height: mode === 'barcode' ? '140px' : '208px',
          }}
        />
      </div>
      <button
        onClick={capturePhoto}
        disabled={!videoReady}
        className="absolute bottom-8 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center z-10 disabled:opacity-50"
      >
        <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-white" />
      </button>
      <p className="absolute bottom-32 text-white text-sm bg-black/40 px-3 py-1 rounded-full" dir="rtl">
        {videoReady ? guideText : 'جارٍ تشغيل الكاميرا...'}
      </p>
      {mode === 'barcode' && (
        <button
          onClick={() => { stopCamera(); setShowManual(true) }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs z-10"
        >
          ⌨️ أدخل يدوياً
        </button>
      )}
    </div>
  )
}
