'use client'

import { useEffect, useState } from 'react'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_COLORS, type Grade } from '@/lib/types'

export default function RecentPills() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(getHistory().slice(0, 3))
  }, [])

  if (entries.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-5 pb-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-white/70 mr-1 whitespace-nowrap">
        Recent
      </span>
      {entries.map((entry, i) => (
        <div
          key={`${entry.scanned_at}-${i}`}
          className="flex items-center gap-1.5 rounded-full px-2 py-1"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: GRADE_COLORS[entry.grade as Grade] }}
          />
          <span className="text-[9px] font-medium text-white max-w-[48px] overflow-hidden text-ellipsis whitespace-nowrap">
            {entry.product_name}
          </span>
        </div>
      ))}
    </div>
  )
}
