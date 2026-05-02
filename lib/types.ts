export interface NutritionData {
  energy_kcal: number | null
  sugars_g: number | null
  saturated_fat_g: number | null
  sodium_mg: number | null
  protein_g: number | null
  fiber_g: number | null
  fruits_veg_percent: number | null
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E'

export interface GradeResult {
  score: number
  grade: Grade
  negative_points: {
    energy: number
    sugars: number
    saturated_fat: number
    sodium: number
    total: number
  }
  positive_points: {
    fruits_veg: number
    fiber: number
    protein: number
    total: number
  }
  protein_counted: boolean
  partial_data: boolean
}

export interface ProductData {
  product_name: string
  nutrition: NutritionData
  image_url?: string
  barcode?: string
  source: 'barcode' | 'vision' | 'manual'
  confidence?: 'high' | 'medium' | 'low'
  data_source?: string // e.g., "Open Food Facts", "USDA", "AI Knowledge", "Label Scan"
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#059669',
  B: '#65A30D',
  C: '#D97706',
  D: '#EA580C',
  E: '#DC2626',
}

export const GRADE_GRADIENTS: Record<Grade, string> = {
  A: 'linear-gradient(135deg, #34D399, #059669)',
  B: 'linear-gradient(135deg, #A3E635, #65A30D)',
  C: 'linear-gradient(135deg, #FBBF24, #D97706)',
  D: 'linear-gradient(135deg, #FB923C, #EA580C)',
  E: 'linear-gradient(135deg, #F87171, #DC2626)',
}

export const GRADE_GLOWS: Record<Grade, string> = {
  A: '0 0 30px rgba(52, 211, 153, 0.3)',
  B: '0 0 30px rgba(163, 230, 53, 0.3)',
  C: '0 0 30px rgba(251, 191, 36, 0.3)',
  D: '0 0 30px rgba(251, 146, 60, 0.3)',
  E: '0 0 30px rgba(248, 113, 113, 0.3)',
}

export const GRADE_LABELS_AR: Record<Grade, string> = {
  A: 'ممتاز',
  B: 'جيد',
  C: 'متوسط',
  D: 'ضعيف',
  E: 'سيء',
}

export const GRADE_LABELS_EN: Record<Grade, string> = {
  A: 'Excellent',
  B: 'Good',
  C: 'Average',
  D: 'Poor',
  E: 'Bad',
}
