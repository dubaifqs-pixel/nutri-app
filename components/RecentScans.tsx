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
    sessionStorage.setItem(
      'dfqs_product',
      JSON.stringify({
        product_name: entry.product_name,
        nutrition,
        image_url: entry.image_url,
        barcode: entry.barcode,
        source: entry.source,
      })
    )
    if (entry.nutrition) {
      const gradeResult = calculateGrade(entry.nutrition)
      sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    } else {
      sessionStorage.setItem(
        'dfqs_grade',
        JSON.stringify({
          grade: entry.grade,
          score: entry.score,
          negative_points: { energy: 0, sugars: 0, saturated_fat: 0, sodium: 0, total: 0 },
          positive_points: { fruits_veg: 0, fiber: 0, protein: 0, total: 0 },
          protein_counted: true,
          partial_data: true,
        })
      )
    }
    router.push('/result')
  }

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  return (
    <div className="w-full">
      {/* Stats row */}
      <div className="flex items-center gap-4 px-6 mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[36px] font-bold text-[#1A1A1A] leading-none">{history.length}</span>
          <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Scanned</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {history.slice(0, 5).map((entry, i) => (
            <span
              key={`${entry.scanned_at}-${i}`}
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
            >
              {entry.grade}
            </span>
          ))}
        </div>
      </div>

      {/* Full-width swipeable hero cards */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6 pb-4 snap-x snap-mandatory">
        {history.map((entry, i) => (
          <button
            key={`${entry.scanned_at}-${i}`}
            onClick={() => handleEntryClick(entry)}
            className="shrink-0 relative rounded-[28px] p-6 text-left transition-all active:scale-[0.98] bg-white snap-center"
            style={{
              width: 'calc(100vw - 80px)',
              maxWidth: '340px',
              minHeight: '240px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              overflow: 'visible',
            }}
          >
            {/* Product name — large, bold, left side */}
            <div className="max-w-[50%]">
              <p className="text-[22px] font-bold text-[#1A1A1A] leading-[1.15]">{entry.product_name}</p>
            </div>

            {/* Category image — massive, floating right, overlapping card */}
            <img
              src={getProductImage(entry.product_name, entry.grade)}
              alt=""
              className="absolute right-[-16px] bottom-[-12px] w-[180px] h-[180px] object-contain pointer-events-none"
              style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.12))' }}
            />

            {/* Grade badge + score at bottom left */}
            <div className="flex items-center gap-2 absolute bottom-6 left-6 z-10">
              <span
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-sm font-bold"
                style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
              >
                {entry.grade}
              </span>
              <span className="text-[11px] text-[#8A8A8A] bg-[#F2F0ED] px-3 py-1.5 rounded-full font-medium">Score: {entry.score}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 mx-auto mt-3 text-xs text-[#8A8A8A] transition-colors hover:text-red-400 min-h-[44px] px-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Clear history
      </button>
    </div>
  )
}
