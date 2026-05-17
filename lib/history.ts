import type { Grade, NutritionData, ProductData, GradeResult } from './types'

export interface HistoryEntry {
  product_name: string
  grade: Grade
  score: number
  source: ProductData['source']
  scanned_at: string
  nutrition?: NutritionData
  image_url?: string
  barcode?: string
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
    nutrition: product.nutrition,
    image_url: product.image_url,
    barcode: product.barcode,
  }

  // Dedupe by product name: if the same product is viewed again, drop the
  // older entry so Recent shows it once (in its most-recent position).
  const existing = getHistory().filter((e) => e.product_name !== entry.product_name)
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
