'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  onBarcode: (barcode: string) => void
  onCapture: (imageBase64: string) => void
  onAutoDetect?: (data: any) => void
  mode: 'barcode' | 'label'
  startManual?: boolean
}

type Stage = 'name' | 'nutrition'

export default function Scanner({ onBarcode, onCapture, onAutoDetect, mode, startManual = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [showManual, setShowManual] = useState(startManual)
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected'>('idle')
  const [scanAttempts, setScanAttempts] = useState(0)
  const [stage, setStage] = useState<Stage>('name')
  const [stageFlash, setStageFlash] = useState(false) // brief tick when stage 1 completes
  const capturedNameRef = useRef<string | null>(null)
  const capturedServingRef = useRef<{ g: number | null; ml: number | null }>({ g: null, ml: null })
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

  // Barcode auto-detect — uses the browser's native BarcodeDetector when available.
  // Polls every 250ms; on hit, fires onBarcode and stops.
  useEffect(() => {
    if (mode !== 'barcode' || !videoReady || showManual) return
    // BarcodeDetector ships in Chrome and iOS Safari 17+.
    const BD: any = (window as any).BarcodeDetector
    if (!BD) return

    let stopped = false
    const detector = new BD({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] })

    const loop = async () => {
      if (stopped) return
      const video = videoRef.current
      if (!video || video.videoWidth === 0) {
        setTimeout(loop, 250)
        return
      }
      try {
        const codes = await detector.detect(video)
        if (codes && codes.length > 0 && !stopped) {
          const raw: string = String(codes[0].rawValue || '').trim()
          if (raw && raw.length >= 6) {
            stopped = true
            setScanStatus('detected')
            stopCamera()
            onBarcode(raw)
            return
          }
        }
      } catch {
        // Some browsers throw on detect() — fall through and retry.
      }
      setTimeout(loop, 250)
    }
    loop()
    return () => { stopped = true }
  }, [mode, videoReady, showManual, onBarcode, stopCamera])

  // Auto-detect loop (label mode — two-stage Gemini OCR).
  // Stage 1: find product name from the front of the package.
  // Stage 2: read the nutrition table from the back.
  // The captured name is preserved across the stage transition; once both are in hand,
  // the combined result fires onAutoDetect.
  useEffect(() => {
    if (mode !== 'label' || !videoReady || showManual || !onAutoDetect) return

    scanningRef.current = true
    setScanStatus('scanning')

    const runDetection = async () => {
      if (!scanningRef.current || busyRef.current) return
      if (!videoRef.current || videoRef.current.videoWidth === 0) return

      busyRef.current = true
      const currentStage = stage // snapshot per-tick

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
          body: JSON.stringify({ image: frame, stage: currentStage }),
        })
        const data = await res.json()

        if (!scanningRef.current) return

        if (currentStage === 'name') {
          // Stage 1: looking for product name only.
          if (data.detected && data.product_name) {
            capturedNameRef.current = data.product_name
            if (data.serving_size_g) capturedServingRef.current.g = data.serving_size_g
            if (data.serving_size_ml) capturedServingRef.current.ml = data.serving_size_ml
            setStageFlash(true)
            setTimeout(() => setStageFlash(false), 900)
            setStage('nutrition')
            setScanAttempts(0)
          } else {
            setScanAttempts(prev => prev + 1)
          }
        } else {
          // Stage 2: looking for nutrition values.
          if (data.detected && data.nutrition) {
            setScanStatus('detected')
            scanningRef.current = false
            const combined = {
              ...data,
              product_name: capturedNameRef.current || data.product_name || 'Scanned Product',
              serving_size_g: data.serving_size_g ?? capturedServingRef.current.g,
              serving_size_ml: data.serving_size_ml ?? capturedServingRef.current.ml,
            }
            setTimeout(() => {
              stopCamera()
              onAutoDetect(combined)
            }, 600)
          } else {
            setScanAttempts(prev => prev + 1)
          }
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
  }, [mode, videoReady, showManual, onAutoDetect, stopCamera, stage])

  // Capture the current frame as a JPEG base64.
  const grabFrame = (maxWidth = 1280): string | null => {
    if (!videoRef.current || !videoReady) return null
    const video = videoRef.current
    if (video.videoWidth === 0) return null
    const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.85)
  }

  // Capture button — honors the two-stage flow in label mode, single-shot otherwise.
  const capturePhoto = async () => {
    const base64 = grabFrame()
    if (!base64) return

    // Label mode with two-stage auto-detect: run the same stage-aware pipeline as the loop.
    if (mode === 'label' && onAutoDetect) {
      scanningRef.current = false
      busyRef.current = true
      try {
        const res = await fetch('/api/auto-detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, stage }),
        })
        const data = await res.json()

        if (stage === 'name' && data.detected && data.product_name) {
          capturedNameRef.current = data.product_name
          if (data.serving_size_g) capturedServingRef.current.g = data.serving_size_g
          if (data.serving_size_ml) capturedServingRef.current.ml = data.serving_size_ml
          setStageFlash(true)
          setTimeout(() => setStageFlash(false), 900)
          setStage('nutrition')
          setScanAttempts(0)
          // Restart the auto-detect loop in the new stage.
          scanningRef.current = true
        } else if (stage === 'nutrition' && data.detected && data.nutrition) {
          setScanStatus('detected')
          const combined = {
            ...data,
            product_name: capturedNameRef.current || data.product_name || 'Scanned Product',
            serving_size_g: data.serving_size_g ?? capturedServingRef.current.g,
            serving_size_ml: data.serving_size_ml ?? capturedServingRef.current.ml,
          }
          setTimeout(() => {
            stopCamera()
            onAutoDetect(combined)
          }, 600)
        } else {
          // Nothing detected — keep scanning, bump attempts so the hint text adapts.
          setScanAttempts(prev => prev + 1)
          scanningRef.current = true
        }
      } catch {
        scanningRef.current = true
      } finally {
        busyRef.current = false
      }
      return
    }

    // Barcode mode or full single-shot label scan — original behavior.
    scanningRef.current = false
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
            className="bg-white/10 text-white px-5 py-3.5 rounded-2xl text-sm transition-all hover:bg-white/20 min-h-[44px]"
          >
            Enter barcode manually
          </button>
        )}
      </div>
    )
  }

  if (showManual) {
    // Strip non-digits and clamp to 14 chars (UPC-A=12, EAN-13=13, EAN-14=14 max).
    const sanitize = (raw: string) => raw.replace(/\D/g, '').slice(0, 14)
    const digits = sanitize(manualBarcode)
    const valid = digits.length >= 8 && digits.length <= 14
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-8" style={{ height: '100vh' }}>
        <div className="text-white text-center mb-2">
          <p className="text-lg font-semibold">Enter Barcode Number</p>
          <p className="text-sm text-white/50 mt-1.5">Type the digits under the barcode</p>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-2">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={digits}
            onChange={(e) => setManualBarcode(sanitize(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && valid && onBarcode(digits)}
            placeholder="0 0 0 0 0 0 0 0 0 0 0 0 0"
            className="w-full bg-white/10 text-white text-center text-2xl px-5 py-4 rounded-2xl outline-none placeholder:text-white/15 focus:ring-2 focus:ring-[#B6F074]/40 transition-all tabular-nums"
            style={{ letterSpacing: '0.18em' }}
            dir="ltr"
            autoFocus
          />
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard?.readText()
                  if (text) setManualBarcode(sanitize(text))
                } catch { /* clipboard blocked */ }
              }}
              className="text-[11px] text-white/40 hover:text-white/80 transition-colors"
            >
              Paste
            </button>
            <span className="text-[11px] tabular-nums text-white/40">{digits.length} / 13</span>
          </div>
        </div>
        <button
          onClick={() => valid && onBarcode(digits)}
          disabled={!valid}
          className="w-full max-w-xs py-3.5 rounded-2xl btn-accent disabled:opacity-40 transition-all text-sm"
        >
          Look up
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
      guideText = 'All set!'
    } else if (stage === 'name') {
      if (scanAttempts === 0) guideText = 'Step 1 — show the front of the package'
      else if (scanAttempts <= 4) guideText = 'Hold steady, reading product name…'
      else if (scanAttempts <= 8) guideText = 'Move closer or improve lighting'
      else guideText = 'Tap capture if the name isn’t visible'
    } else {
      // stage === 'nutrition'
      if (scanAttempts === 0) guideText = 'Step 2 — now show the nutrition label'
      else if (scanAttempts <= 4) guideText = 'Hold steady, reading nutrition…'
      else if (scanAttempts <= 8) guideText = 'Move closer to the nutrition table'
      else guideText = 'Try better lighting or tap to capture'
    }
  } else {
    guideText = mode === 'barcode' ? 'Point camera at barcode' : 'Point camera at the package'
  }

  const frameW = mode === 'barcode' ? 280 : 300
  const frameH = mode === 'barcode' ? 140 : 220
  const cornerSize = 24
  const cornerThickness = 3
  const cornerColor = scanStatus === 'detected' ? '#B6F074' : '#B6F074'

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height: '100vh' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        {...{ 'webkit-playsinline': 'true', 'x-webkit-airplay': 'deny' }}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Top step indicator — two-stage flow: name → nutrition */}
      {videoReady && isAutoScanning && scanStatus !== 'detected' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-[88%]">
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                style={{ background: stage === 'name' ? '#B6F074' : 'rgba(182,240,116,0.25)', color: stage === 'name' ? '#1A1A1A' : '#B6F074' }}
              >
                {stage === 'nutrition' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ) : '1'}
              </span>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                style={{ background: stage === 'nutrition' ? '#B6F074' : 'rgba(182,240,116,0.15)', color: stage === 'nutrition' ? '#1A1A1A' : 'rgba(255,255,255,0.6)' }}
              >
                2
              </span>
            </div>
            <p className="text-white text-[12px] leading-tight font-medium">
              {stage === 'name' ? <>Step 1 — <span className="font-bold">front</span> of the package</> : <>Step 2 — <span className="font-bold">nutrition</span> label</>}
            </p>
          </div>
        </div>
      )}

      {/* Stage-1 → Stage-2 flash toast */}
      {stageFlash && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="px-4 py-2.5 rounded-2xl flex items-center gap-2" style={{ background: '#B6F074', color: '#1A1A1A', boxShadow: '0 8px 24px rgba(140,180,40,0.45)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[12px] font-bold leading-none">{capturedNameRef.current ? `Got it: ${capturedNameRef.current.length > 24 ? capturedNameRef.current.slice(0, 24) + '…' : capturedNameRef.current}` : 'Product name captured'}</p>
          </div>
        </div>
      )}

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

          {/* Glow effect on detection */}
          {scanStatus === 'detected' && (
            <div className="absolute -inset-2 rounded-2xl" style={{ boxShadow: '0 0 40px rgba(182, 240, 116, 0.4), inset 0 0 40px rgba(182, 240, 116, 0.1)' }} />
          )}

          {/* Scanning line animation */}
          {isAutoScanning && scanStatus === 'scanning' && videoReady && (
            <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-[#B6F074] to-transparent animate-scan-line" style={{ boxShadow: '0 0 8px rgba(182, 240, 116, 0.6)' }} />
          )}
        </div>
      </div>

      {/* Status pill */}
      <div className="absolute bottom-32 bg-black/70 backdrop-blur-sm px-5 py-2.5 rounded-full flex items-center gap-2.5">
        {isAutoScanning && scanStatus === 'scanning' && videoReady && (
          <div className="w-2 h-2 bg-[#B6F074] rounded-full animate-pulse" />
        )}
        {scanStatus === 'detected' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B6F074" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        )}
        <p className="text-white text-sm">{guideText}</p>
      </div>

      {/* Capture button */}
      <button
        onClick={capturePhoto}
        disabled={!videoReady}
        className="absolute bottom-8 z-10 disabled:opacity-50 transition-all active:scale-95"
        title="Tap to capture manually"
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-white/60" />
          {/* Inner fill */}
          <div
            className="w-14 h-14 rounded-full shadow-lg transition-colors"
            style={{
              background: scanStatus === 'detected' ? '#B6F074' : '#FFFFFF',
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
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M8 16h8"/></svg>
          Enter manually
        </button>
      )}
    </div>
  )
}
