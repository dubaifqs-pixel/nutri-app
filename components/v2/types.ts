import type { Grade, NutritionData } from '@/lib/types'

export type ChipKind = 'pos' | 'warn' | 'bad' | 'neutral'

export interface HeroChip {
  kind: ChipKind
  text: string
}

// HeroProduct is the design's adapter shape — used by HeroCard, ThumbChip,
// CompareSide, and the detail HeroPoster. Built from a real DEMO_PRODUCTS
// entry by lib/v2-product.ts so the design renders against live scoring.
export interface HeroProduct {
  id: string
  product_name: string
  brand: string
  take: string
  size_label: string
  grade: Grade
  score: number
  image: string
  bg: 'orange' | 'milk' | 'lime' | 'mango' | 'green' | 'rose' | 'cream'
  chips: HeroChip[]
  nutrition: NutritionData
}

export const BG_PALETTE: Record<HeroProduct['bg'], { tint: string; accent: string; ink: string }> = {
  orange: { tint: '#ffd97a', accent: '#ffa92a', ink: '#2a1700' },
  milk:   { tint: '#f5ecd5', accent: '#caa052', ink: '#2a1f08' },
  lime:   { tint: '#bdf272', accent: '#7fbf3a', ink: '#1a2a0a' },
  mango:  { tint: '#ffd97a', accent: '#ff9a2b', ink: '#2a1500' },
  green:  { tint: '#bdf272', accent: '#6fa838', ink: '#1a2a0a' },
  rose:   { tint: '#ffcad2', accent: '#ff5a78', ink: '#2a0810' },
  cream:  { tint: '#ffd97a', accent: '#caa052', ink: '#2a1f0a' },
}

export const GRADE_TILE: Record<Grade, { bg: string; verdict_en: 'GOOD' | 'FAIR' | 'BAD'; verdict_ar: 'جيد' | 'متوسط' | 'سيء' }> = {
  A: { bg: '#b8e845', verdict_en: 'GOOD', verdict_ar: 'جيد' },
  B: { bg: '#9bc93a', verdict_en: 'GOOD', verdict_ar: 'جيد' },
  C: { bg: '#ffd23d', verdict_en: 'FAIR', verdict_ar: 'متوسط' },
  D: { bg: '#ff9a4f', verdict_en: 'BAD',  verdict_ar: 'سيء' },
  E: { bg: '#ff5a3a', verdict_en: 'BAD',  verdict_ar: 'سيء' },
}

export const GRADE_COLOR: Record<Grade, { bg: string; ink: string; accent: string }> = {
  A: { bg: '#cdeebe', ink: '#1f3a14', accent: '#5da840' },
  B: { bg: '#e2f0bd', ink: '#2a3a0e', accent: '#9bc93a' },
  C: { bg: '#ffe7a8', ink: '#5a3d05', accent: '#ffb547' },
  D: { bg: '#ffd0a8', ink: '#5a2a05', accent: '#ff7a2b' },
  E: { bg: '#ffc6be', ink: '#5a1810', accent: '#ff5a3a' },
}
