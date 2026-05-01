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
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'error'>('idle')
  const [scanAttempts, setScanAttempts] = useState(0)
  const scanningRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const captureFrame = useCallback((maxWidth: number, quality: number) => {
    if (!videoRef.current) return null
    const video = videoRef.current
    if (video.videoWidth === 0) return null
    const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  }, [])

  // Auto-detect loop for label mode
  useEffect(() => {
    if (mode !== 'label' || !videoReady || showManual || !onAutoDetect) return

    scanningRef.current = true
    setScanStatus('scanning')

    const runDetection = async () => {
      if (!scanningRef.current || !videoRef.current) return

      const frame = captureFrame(800, 0.7) // Low-res for speed
      if (!frame) return

      try {
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
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          // Small delay for the user to see "detected" state
          setTimeout(() => {
            stopCamera()
            onAutoDetect(data)
          }, 600)
        } else {
          setScanAttempts(prev => prev + 1)
        }
      } catch {
        // Silent fail, keep scanning
      }
    }

    // Start scanning every 3 seconds
    runDetection()
    intervalRef.current = setInterval(runDetection, 3000)

    return () => {
      scanningRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [mode, videoReady, showManual, onAutoDetect, captureFrame, stopCamera])

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
        setError('Could not access camera')
      }
    }
    startCamera()
    return stopCamera
  }, [stopCamera, showManual])

  const capturePhoto = () => {
    if (!videoRef.current || !videoReady) return
    const base64 = captureFrame(1280, 0.85)
    if (!base64) return
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
            className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/30"
          >
            Enter barcode manually
          </button>
        )}
      </div>
    )
  }

  if (showManual) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8" style={{ height: '100vh' }}>
        <div className="text-white text-center mb-4">
          <p className="text-lg font-semibold">Enter Barcode Number</p>
          <p className="text-sm text-white/60 mt-1">Type the number below the barcode</p>
        </div>
        <input
          type="tel"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
          placeholder="e.g. 6281100120018"
          className="w-full max-w-xs bg-white/10 text-white text-center text-xl px-4 py-4 rounded-xl border border-white/20 outline-none placeholder:text-white/30 tracking-widest focus:border-[#F1B123]/60 transition-colors"
          dir="ltr"
          autoFocus
        />
        <button
          onClick={handleManualSubmit}
          disabled={manualBarcode.trim().length < 8}
          className="w-full max-w-xs py-3 rounded-xl bg-[#F1B123] text-white font-semibold disabled:opacity-40 transition-opacity"
        >
          Search
        </button>
        <button
          onClick={() => { setShowManual(false); setManualBarcode('') }}
          className="text-white/50 text-sm mt-2 transition-colors hover:text-white/70"
        >
          Back to camera
        </button>
      </div>
    )
  }

  // Determine guide text and scan indicator
  const isAutoScanning = mode === 'label' && onAutoDetect
  let guideText = ''
  let borderColor = 'border-yellow-400'

  if (!videoReady) {
    guideText = 'Starting camera...'
  } else if (isAutoScanning) {
    if (scanStatus === 'detected') {
      guideText = 'Label detected!'
      borderColor = 'border-green-400'
    } else {
      guideText = scanAttempts === 0 ? 'Scanning for nutrition label...' : `Scanning... hold steady`
    }
  } else {
    guideText = mode === 'barcode' ? 'Point camera at barcode' : 'Point camera at nutrition label'
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height: '100vh' }}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Scan frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`rounded-xl transition-all duration-300 ${borderColor}`}
          style={{
            width: mode === 'barcode' ? '280px' : '300px',
            height: mode === 'barcode' ? '140px' : '220px',
            borderWidth: scanStatus === 'detected' ? '3px' : '2px',
            boxShadow: scanStatus === 'detected'
              ? '0 0 30px rgba(74, 222, 128, 0.4), inset 0 0 30px rgba(74, 222, 128, 0.1)'
              : isAutoScanning && scanStatus === 'scanning'
                ? '0 0 20px rgba(250, 204, 21, 0.2), inset 0 0 20px rgba(250, 204, 21, 0.05)'
                : 'none',
          }}
        >
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl" style={{ borderColor: 'inherit' }} />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-xl" style={{ borderColor: 'inherit' }} />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-xl" style={{ borderColor: 'inherit' }} />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-xl" style={{ borderColor: 'inherit' }} />

          {/* Scanning line animation */}
          {isAutoScanning && scanStatus === 'scanning' && (
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-[#F1B123] to-transparent animate-scan-line" />
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-32 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
        {isAutoScanning && scanStatus === 'scanning' && (
          <div className="w-2 h-2 bg-[#F1B123] rounded-full animate-pulse" />
        )}
        {scanStatus === 'detected' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        )}
        <p className="text-white text-sm">{guideText}</p>
      </div>

      {/* Manual capture button - always available as fallback */}
      <button
        onClick={capturePhoto}
        disabled={!videoReady}
        className="absolute bottom-8 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center z-10 disabled:opacity-50 transition-all"
        title={isAutoScanning ? 'Tap to capture manually' : 'Capture'}
      >
        <div
          className="w-16 h-16 rounded-full border-4 border-white transition-colors"
          style={{
            backgroundColor: scanStatus === 'detected' ? '#4ade80' : '#F1B123',
          }}
        />
      </button>

      {/* Auto-scan hint */}
      {isAutoScanning && videoReady && scanStatus === 'scanning' && (
        <p className="absolute bottom-2 text-white/40 text-xs">
          Auto-scanning every 3s — or tap to capture manually
        </p>
      )}

      {mode === 'barcode' && (
        <button
          onClick={() => { stopCamera(); setShowManual(true) }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs z-10 flex items-center gap-1.5 transition-colors hover:text-white/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M8 16h8"/></svg>
          Enter manually
        </button>
      )}
    </div>
  )
}
