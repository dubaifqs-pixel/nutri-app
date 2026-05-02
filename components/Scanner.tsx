'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  onBarcode: (barcode: string) => void
  onCapture: (imageBase64: string) => void
  onAutoDetect?: (data: any) => void
  mode: 'barcode' | 'label'
  startManual?: boolean
}

export default function Scanner({ onBarcode, onCapture, onAutoDetect, mode, startManual = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [showManual, setShowManual] = useState(startManual)
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected'>('idle')
  const [scanAttempts, setScanAttempts] = useState(0)
  const scanningRef = useRef(false)
  const busyRef = useRef(false)

  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // Start camera
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
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setVideoReady(true)
          }
        }
      } catch {
        setError('Could not access camera')
      }
    }
    startCamera()
    return stopCamera
  }, [stopCamera, showManual])

  // Auto-detect loop
  useEffect(() => {
    if (mode !== 'label' || !videoReady || showManual || !onAutoDetect) return

    scanningRef.current = true
    setScanStatus('scanning')

    const runDetection = async () => {
      if (!scanningRef.current || busyRef.current) return
      if (!videoRef.current || videoRef.current.videoWidth === 0) return

      busyRef.current = true

      try {
        const video = videoRef.current
        const maxW = 1024
        const scale = video.videoWidth > maxW ? maxW / video.videoWidth : 1
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frame = canvas.toDataURL('image/jpeg', 0.8)

        const res = await fetch('/api/auto-detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: frame }),
        })
        const data = await res.json()

        if (!scanningRef.current) return

        if (data.detected) {
          setScanStatus('detected')
          scanningRef.current = false
          setTimeout(() => {
            stopCamera()
            onAutoDetect(data)
          }, 600)
        } else {
          setScanAttempts(prev => prev + 1)
        }
      } catch {
        // Silent fail, keep scanning
      } finally {
        busyRef.current = false
      }
    }

    const startTimeout = setTimeout(runDetection, 1000)
    const interval = setInterval(runDetection, 2500)

    return () => {
      scanningRef.current = false
      clearTimeout(startTimeout)
      clearInterval(interval)
    }
  }, [mode, videoReady, showManual, onAutoDetect, stopCamera])

  const capturePhoto = () => {
    if (!videoRef.current || !videoReady) return
    const video = videoRef.current
    if (video.videoWidth === 0) return
    scanningRef.current = false
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
            className="glass-dark text-white px-5 py-3.5 rounded-2xl text-sm transition-all hover:bg-white/20 min-h-[44px]"
          >
            Enter barcode manually
          </button>
        )}
      </div>
    )
  }

  if (showManual) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-8" style={{ height: '100vh' }}>
        <div className="text-white text-center mb-4">
          <p className="text-lg font-semibold">Enter Barcode Number</p>
          <p className="text-sm text-white/50 mt-1.5">Type the number below the barcode</p>
        </div>
        <input
          type="tel"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
          placeholder="e.g. 6281100120018"
          className="w-full max-w-xs glass-dark text-white text-center text-xl px-5 py-4 rounded-2xl outline-none placeholder:text-white/25 tracking-widest focus:ring-2 focus:ring-[#F1B123]/40 transition-all"
          dir="ltr"
          autoFocus
        />
        <button
          onClick={handleManualSubmit}
          disabled={manualBarcode.trim().length < 8}
          className="w-full max-w-xs py-3.5 rounded-2xl btn-gold disabled:opacity-40 transition-all text-sm"
        >
          Search
        </button>
        <button
          onClick={() => { setShowManual(false); setManualBarcode('') }}
          className="text-white/40 text-sm mt-2 transition-colors hover:text-white/70 min-h-[44px] px-4"
        >
          Back to camera
        </button>
      </div>
    )
  }

  // Status text & colors
  const isAutoScanning = mode === 'label' && !!onAutoDetect
  let guideText = ''

  if (!videoReady) {
    guideText = 'Starting camera...'
  } else if (isAutoScanning) {
    if (scanStatus === 'detected') {
      guideText = 'Label detected!'
    } else if (scanAttempts === 0) {
      guideText = 'Scanning for nutrition label...'
    } else if (scanAttempts <= 3) {
      guideText = 'Hold steady, reading label...'
    } else if (scanAttempts <= 6) {
      guideText = 'Move closer to the label'
    } else {
      guideText = 'Try better lighting or tap to capture'
    }
  } else {
    guideText = mode === 'barcode' ? 'Point camera at barcode' : 'Point camera at nutrition label'
  }

  const frameW = mode === 'barcode' ? 280 : 300
  const frameH = mode === 'barcode' ? 140 : 220
  const cornerSize = 24
  const cornerThickness = 3
  const cornerColor = scanStatus === 'detected' ? '#34D399' : '#F1B123'

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height: '100vh' }}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Scan frame with animated corners */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative"
          style={{ width: `${frameW}px`, height: `${frameH}px` }}
        >
          {/* Corner brackets */}
          {/* Top-left */}
          <div className="absolute top-0 left-0" style={{ width: cornerSize, height: cornerThickness, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite' }} />
          <div className="absolute top-0 left-0" style={{ width: cornerThickness, height: cornerSize, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite' }} />
          {/* Top-right */}
          <div className="absolute top-0 right-0" style={{ width: cornerSize, height: cornerThickness, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite 0.2s' }} />
          <div className="absolute top-0 right-0" style={{ width: cornerThickness, height: cornerSize, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite 0.2s' }} />
          {/* Bottom-left */}
          <div className="absolute bottom-0 left-0" style={{ width: cornerSize, height: cornerThickness, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite 0.4s' }} />
          <div className="absolute bottom-0 left-0" style={{ width: cornerThickness, height: cornerSize, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite 0.4s' }} />
          {/* Bottom-right */}
          <div className="absolute bottom-0 right-0" style={{ width: cornerSize, height: cornerThickness, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite 0.6s' }} />
          <div className="absolute bottom-0 right-0" style={{ width: cornerThickness, height: cornerSize, background: cornerColor, borderRadius: 2, animation: 'corner-pulse 2s ease-in-out infinite 0.6s' }} />

          {/* Glow effect */}
          {scanStatus === 'detected' && (
            <div className="absolute -inset-2 rounded-2xl" style={{ boxShadow: '0 0 40px rgba(52, 211, 153, 0.4), inset 0 0 40px rgba(52, 211, 153, 0.1)' }} />
          )}
          {isAutoScanning && scanStatus === 'scanning' && videoReady && (
            <div className="absolute -inset-1 rounded-xl" style={{ boxShadow: '0 0 25px rgba(241, 177, 35, 0.2)' }} />
          )}

          {/* Scanning line animation */}
          {isAutoScanning && scanStatus === 'scanning' && videoReady && (
            <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-[#F1B123] to-transparent animate-scan-line" style={{ boxShadow: '0 0 8px rgba(241, 177, 35, 0.6)' }} />
          )}
        </div>
      </div>

      {/* Status pill */}
      <div className="absolute bottom-32 glass-dark px-5 py-2.5 rounded-full flex items-center gap-2.5">
        {isAutoScanning && scanStatus === 'scanning' && videoReady && (
          <div className="w-2 h-2 bg-[#F1B123] rounded-full animate-gold-pulse" />
        )}
        {scanStatus === 'detected' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        )}
        <p className="text-white text-sm">{guideText}</p>
      </div>

      {/* Capture button with concentric rings */}
      <button
        onClick={capturePhoto}
        disabled={!videoReady}
        className="absolute bottom-8 z-10 disabled:opacity-50 transition-all active:scale-95"
        title="Tap to capture manually"
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-white/60" />
          {/* Middle ring (pulsing) */}
          <div className="absolute inset-1.5 rounded-full border-2 border-white/30" style={{ animation: isAutoScanning && scanStatus === 'scanning' ? 'pulse-ring 2s ease-in-out infinite' : 'none' }} />
          {/* Inner fill */}
          <div
            className="w-14 h-14 rounded-full shadow-lg transition-colors"
            style={{
              background: scanStatus === 'detected'
                ? 'linear-gradient(135deg, #34D399, #059669)'
                : 'linear-gradient(135deg, #F1B123, #D89A0E)',
              boxShadow: scanStatus === 'detected'
                ? '0 4px 20px rgba(52, 211, 153, 0.4)'
                : '0 4px 20px rgba(241, 177, 35, 0.4)',
            }}
          />
        </div>
      </button>

      {/* Hints */}
      {isAutoScanning && videoReady && scanStatus === 'scanning' && (
        <p className="absolute bottom-2 text-white/30 text-xs">
          Auto-scanning -- or tap button to capture manually
        </p>
      )}

      {mode === 'barcode' && (
        <button
          onClick={() => { stopCamera(); setShowManual(true) }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs z-10 flex items-center gap-1.5 transition-colors hover:text-white/80 min-h-[44px] px-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M8 16h8"/></svg>
          Enter manually
        </button>
      )}
    </div>
  )
}
