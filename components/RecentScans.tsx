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
          <span className="text-[38px] font-bold text-[#2D2A26] leading-none">{history.length}</span>
          <span className="text-[11px] font-semibold text-[#B0A89E] uppercase tracking-wider">Scanned</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {history.slice(0, 5).map((entry, i) => (
            <span
              key={`${entry.scanned_at}-${i}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
            >
              {entry.grade}
            </span>
          ))}
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-6 pb-2">
        {history.map((entry, i) => (
          <button
            key={`${entry.scanned_at}-${i}`}
            onClick={() => handleEntryClick(entry)}
            className="shrink-0 w-[200px] relative rounded-3xl p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
          >
            <div className="flex flex-col gap-1 pr-2 min-h-[80px]">
              <p className="text-[16px] font-bold text-[#2D2A26] line-clamp-3 leading-snug">{entry.product_name}</p>
            </div>

            {/* Category image — always shows */}
            <img
              src={getProductImage(entry.product_name, entry.grade)}
              alt=""
              className="absolute -right-2 -bottom-2 w-[100px] h-[100px] object-contain"
              style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }}
            />

            {/* Grade badge + score at bottom */}
            <div className="flex items-center gap-2 mt-3 relative z-10">
              <span
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-xs font-bold"
                style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
              >
                {entry.grade}
              </span>
              <span className="text-[10px] text-[#9B8E82] bg-[#F5F3EF] px-2 py-1 rounded-full font-medium">Score: {entry.score}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 mx-auto mt-3 text-xs text-[#B0A89E] transition-colors hover:text-red-400 min-h-[44px] px-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Clear history
      </button>
    </div>
  )
}
