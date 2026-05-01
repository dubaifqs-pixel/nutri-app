'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onBarcode: (barcode: string) => void
  onCapture: (imageBase64: string) => void
  mode: 'barcode' | 'label'
}

export default function Scanner({ onBarcode, onCapture, mode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mode === 'barcode') {
      const scanner = new Html5Qrcode('scanner-region')
      scannerRef.current = scanner
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => { scanner.stop().catch(() => {}); onBarcode(decodedText) },
        () => {}
      ).catch(() => setError('تعذر الوصول للكاميرا'))
    } else {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => { streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream })
        .catch(() => setError('تعذر الوصول للكاميرا'))
    }
    return stopCamera
  }, [mode, onBarcode, stopCamera])

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(videoRef.current, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.8)
    stopCamera()
    onCapture(base64)
  }

  if (error) return <div className="flex items-center justify-center h-full text-white text-center p-8"><p>{error}</p></div>
  if (mode === 'barcode') return <div id="scanner-region" className="w-full h-full" />
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-48 border-2 border-yellow-400 rounded-xl" />
      </div>
      <button onClick={capturePhoto} className="absolute bottom-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
        <div className="w-12 h-12 bg-yellow-400 rounded-full" />
      </button>
      <p className="absolute bottom-28 text-white text-sm" dir="rtl">وجّه الكاميرا نحو الملصق الغذائي</p>
    </div>
  )
}
