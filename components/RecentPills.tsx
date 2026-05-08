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
      <span className="text-[9px] font-bold uppercase tracking-[0.06em] mr-1 whitespace-nowrap" style={{ color: '#9A9790' }}>
        Recent
      </span>
      {entries.map((entry, i) => (
        <div
          key={`${entry.scanned_at}-${i}`}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 bg-white"
          style={{ border: '1px solid #E2DDD5' }}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: GRADE_COLORS[entry.grade as Grade] }}
          />
          <span className="text-[9px] font-medium max-w-[48px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#1A1917' }}>
            {entry.product_name}
          </span>
        </div>
      ))}
    </div>
  )
}
