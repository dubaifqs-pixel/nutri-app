'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { getProductImage } from '@/lib/product-images'
import { calculateGrade } from '@/lib/scoring'

export default function RecentScans() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])

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

      {/* Swipe Cards — one card takes most of screen width */}
      <div
        className="flex gap-4 overflow-x-auto hide-scrollbar px-6 pb-3"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {history.map((entry, i) => (
          <div
            key={`${entry.scanned_at}-${i}`}
            onClick={() => handleEntryClick(entry)}
            className="shrink-0 relative bg-white cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              width: 'calc(100vw - 90px)',
              maxWidth: '320px',
              minHeight: '260px',
              borderRadius: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              scrollSnapAlign: 'center',
              overflow: 'visible',
            }}
          >
            {/* Text — left side, top */}
            <div style={{ padding: '28px 24px 0', maxWidth: '55%' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: 1.1,
                color: '#1A1A1A',
                letterSpacing: '-0.01em',
              }}>
                {entry.product_name}
              </h3>
              <p style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '6px', fontWeight: 500 }}>
                nutri score
              </p>
            </div>

            {/* Product image — massive, bottom right, overlapping */}
            <img
              src={getProductImage(entry.product_name, entry.grade)}
              alt=""
              style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-16px',
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.12))',
                pointerEvents: 'none',
              }}
            />

            {/* Grade + Score — bottom left */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 2,
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
                background: GRADE_GRADIENTS[entry.grade as Grade],
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}>
                {entry.grade}
              </span>
              <span style={{
                fontSize: '11px',
                color: '#8A8A8A',
                background: '#F2F0ED',
                padding: '5px 12px',
                borderRadius: '20px',
                fontWeight: 500,
              }}>
                Score: {entry.score}
              </span>
            </div>

            {/* Swipe arrow indicator — right side middle */}
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '28px',
              width: '28px',
              height: '28px',
              borderRadius: '14px',
              background: 'rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        ))}

        {/* "Scan more" end card */}
        <div
          className="shrink-0 flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => router.push('/scan?mode=label')}
          style={{
            width: '120px',
            minHeight: '260px',
            borderRadius: '28px',
            border: '2px dashed rgba(0,0,0,0.08)',
            scrollSnapAlign: 'center',
          }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '22px',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <span style={{ fontSize: '11px', color: '#8A8A8A', marginTop: '8px', fontWeight: 500 }}>Scan</span>
        </div>
      </div>

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
