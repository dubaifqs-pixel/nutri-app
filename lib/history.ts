import type { Grade, ProductData, GradeResult } from './types'

export interface HistoryEntry {
  product_name: string
  grade: Grade
  score: number
  source: ProductData['source']
  scanned_at: string
}

const STORAGE_KEY = 'dfqs_history'
const MAX_ENTRIES = 10

export function addToHistory(product: ProductData, gradeResult: GradeResult): void {
  if (typeof window === 'undefined') return

  const entry: HistoryEntry = {
    product_name: product.product_name,
    grade: gradeResult.grade,
    score: gradeResult.score,
    source: product.source,
    scanned_at: new Date().toISOString(),
  }

  const existing = getHistory()
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
