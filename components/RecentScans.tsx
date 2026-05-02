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
    <div className="w-full mt-8">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <h2 className="text-xs font-semibold text-[#6B7194] uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-inter)' }}>Recent Scans</h2>
      </div>

      <div className="glass-card p-1.5 flex flex-col gap-1" style={{ borderRadius: '20px' }}>
        {history.map((entry, i) => (
          <button
            key={`${entry.scanned_at}-${i}`}
            onClick={() => handleEntryClick(entry)}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[16px] text-left transition-all hover:bg-[#1A1D2E]/[0.03] active:scale-[0.99]"
          >
            <span
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: GRADE_GRADIENTS[entry.grade as Grade] }}
            >
              {entry.grade}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1D2E] truncate">{entry.product_name}</p>
              <p className="text-[11px] text-[#6B7194]/60 mt-0.5">{timeAgo(entry.scanned_at)}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 shrink-0"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ))}
      </div>

      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 mx-auto mt-3 text-xs text-[#6B7194]/50 transition-colors hover:text-red-400 min-h-[44px] px-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Clear history
      </button>
    </div>
  )
}
