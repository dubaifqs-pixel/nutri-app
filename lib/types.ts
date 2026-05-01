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
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#1B5234',
  B: '#7A9A2A',
  C: '#D89A0E',
  D: '#C65D3E',
  E: '#8B3528',
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
