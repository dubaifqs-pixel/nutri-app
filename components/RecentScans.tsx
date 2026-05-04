'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_COLORS, GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.max(0, now - then)

  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`
}

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
            className="shrink-0 w-[200px] relative bg-white rounded-3xl p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden"
            style={{ border: '1px solid #EAE6E0' }}
          >
            <div className="flex flex-col gap-1 pr-16 min-h-[80px]">
              <p className="text-[15px] font-bold text-[#2D2A26] line-clamp-2 leading-tight">{entry.product_name}</p>
              <p className="text-[10px] text-[#B0A89E] font-medium mt-auto">{timeAgo(entry.scanned_at)}</p>
            </div>

            {/* Product image or grade badge as visual */}
            {entry.image_url ? (
              <img
                src={entry.image_url}
                alt=""
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-[80px] h-[80px] object-contain"
                style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: GRADE_GRADIENTS[entry.grade as Grade], boxShadow: `0 8px 16px ${GRADE_COLORS[entry.grade as Grade]}30` }}
              >
                {entry.grade}
              </div>
            )}

            {/* Grade badge + score at bottom */}
            <div className="flex items-center gap-2 mt-3">
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
