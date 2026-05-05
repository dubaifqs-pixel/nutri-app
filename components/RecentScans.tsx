'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { getProductImage } from '@/lib/product-images'
import { calculateGrade } from '@/lib/scoring'

export default function RecentScans() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  if (history.length === 0) return null

  const handleEntryClick = (entry: HistoryEntry) => {
    const nutrition = entry.nutrition || {
      energy_kcal: null, sugars_g: null, saturated_fat_g: null,
      sodium_mg: null, protein_g: null, fiber_g: null, fruits_veg_percent: null,
    }
    sessionStorage.setItem('dfqs_product', JSON.stringify({
      product_name: entry.product_name, nutrition,
      image_url: entry.image_url, barcode: entry.barcode, source: entry.source,
    }))
    if (entry.nutrition) {
      sessionStorage.setItem('dfqs_grade', JSON.stringify(calculateGrade(entry.nutrition)))
    } else {
      sessionStorage.setItem('dfqs_grade', JSON.stringify({
        grade: entry.grade, score: entry.score,
        negative_points: { energy: 0, sugars: 0, saturated_fat: 0, sodium: 0, total: 0 },
        positive_points: { fruits_veg: 0, fiber: 0, protein: 0, total: 0 },
        protein_counted: true, partial_data: true,
      }))
    }
    router.push('/result')
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    setExitDirection(null)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const diff = e.clientX - startXRef.current
    setDragX(diff)
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 100
    if (Math.abs(dragX) > threshold) {
      // Swipe away
      const direction = dragX > 0 ? 'right' : 'left'
      setExitDirection(direction)
      setTimeout(() => {
        setCurrentIndex(prev => Math.min(prev + 1, history.length - 1))
        setDragX(0)
        setExitDirection(null)
      }, 300)
    } else {
      // Spring back
      setDragX(0)
    }
  }

  const currentEntry = history[currentIndex]
  const nextEntry = history[currentIndex + 1]
  const rotation = dragX * 0.08
  const opacity = 1 - Math.abs(dragX) / 400

  return (
    <div className="w-full">
      {/* Stats */}
      <div className="flex items-center gap-3 px-6 mb-5">
        <span className="text-[40px] font-bold text-[#1A1A1A] leading-none tracking-tight">{history.length}</span>
        <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-[0.12em] mt-2">Scanned</span>
        <div className="flex items-center gap-1 ml-auto">
          {history.slice(0, 5).map((entry, i) => (
            <span
              key={`${entry.scanned_at}-${i}`}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
            >
              {entry.grade}
            </span>
          ))}
        </div>
      </div>

      {/* Tinder-style stacked cards */}
      <div className="relative px-6" style={{ height: '280px' }}>
        {/* Card counter */}
        <div className="absolute top-0 right-6 z-10 flex items-center gap-1">
          <span className="text-[11px] font-semibold text-[#8A8A8A]">{currentIndex + 1}/{history.length}</span>
        </div>

        {/* Next card (behind) */}
        {nextEntry && (
          <div
            className="absolute inset-x-6 bg-white"
            style={{
              borderRadius: '28px',
              height: '260px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transform: 'scale(0.95) translateY(8px)',
              opacity: 0.6,
            }}
          >
            <div style={{ padding: '28px 24px 0', maxWidth: '55%' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.1, color: '#C4C4C4' }}>
                {nextEntry.product_name}
              </h3>
            </div>
          </div>
        )}

        {/* Current card (top, draggable) */}
        {currentEntry && (
          <div
            ref={cardRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => { if (isDragging) handlePointerUp() }}
            onClick={() => {
              if (Math.abs(dragX) < 5) handleEntryClick(currentEntry)
            }}
            className="absolute inset-x-6 bg-white cursor-grab active:cursor-grabbing select-none"
            style={{
              borderRadius: '28px',
              height: '260px',
              boxShadow: isDragging
                ? '0 16px 40px rgba(0,0,0,0.12)'
                : '0 4px 16px rgba(0,0,0,0.06)',
              transform: exitDirection
                ? `translateX(${exitDirection === 'right' ? '120%' : '-120%'}) rotate(${exitDirection === 'right' ? '15' : '-15'}deg)`
                : `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              opacity: exitDirection ? 0 : opacity,
              overflow: 'visible',
              touchAction: 'pan-y',
              zIndex: 5,
            }}
          >
            {/* Product name */}
            <div style={{ padding: '28px 24px 0', maxWidth: '50%' }}>
              <h3 style={{
                fontSize: '26px',
                fontWeight: 700,
                lineHeight: 1.08,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}>
                {currentEntry.product_name}
              </h3>
              <p style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '8px', fontWeight: 500 }}>
                nutri score
              </p>
            </div>

            {/* Product image — massive, overlapping */}
            <img
              src={getProductImage(currentEntry.product_name, currentEntry.grade)}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-16px',
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.12))',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />

            {/* Swipe indicators */}
            {isDragging && dragX > 30 && (
              <div style={{
                position: 'absolute', top: '24px', right: '24px',
                padding: '6px 16px', borderRadius: '12px',
                border: '2px solid #4CAF50', color: '#4CAF50',
                fontSize: '13px', fontWeight: 700, transform: 'rotate(12deg)',
              }}>
                VIEW
              </div>
            )}
            {isDragging && dragX < -30 && (
              <div style={{
                position: 'absolute', top: '24px', left: '24px',
                padding: '6px 16px', borderRadius: '12px',
                border: '2px solid #8A8A8A', color: '#8A8A8A',
                fontSize: '13px', fontWeight: 700, transform: 'rotate(-12deg)',
              }}>
                SKIP
              </div>
            )}

            {/* Grade badge + score */}
            <div style={{
              position: 'absolute', bottom: '24px', left: '24px',
              display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2,
            }}>
              <span style={{
                width: '42px', height: '42px', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '17px', fontWeight: 700,
                background: GRADE_GRADIENTS[currentEntry.grade as Grade],
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {currentEntry.grade}
              </span>
              <span style={{
                fontSize: '12px', color: '#8A8A8A', background: '#F2F0ED',
                padding: '6px 14px', borderRadius: '20px', fontWeight: 500,
              }}>
                Score: {currentEntry.score}
              </span>
            </div>
          </div>
        )}

        {/* All cards swiped */}
        {currentIndex >= history.length && (
          <div className="absolute inset-x-6 flex flex-col items-center justify-center" style={{ height: '260px' }}>
            <p className="text-[#8A8A8A] text-sm">No more products</p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="mt-3 text-sm text-[#4CAF50] font-semibold"
            >
              Start over
            </button>
          </div>
        )}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-[10px] text-[#C4C4C4] mt-2 px-6">
        Swipe to browse  ·  Tap to view details
      </p>

      {/* Clear history */}
      <button
        onClick={() => { clearHistory(); setHistory([]) }}
        className="flex items-center gap-1.5 mx-auto mt-2 text-xs text-[#8A8A8A] transition-colors hover:text-red-400 min-h-[44px] px-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Clear history
      </button>
    </div>
  )
}
