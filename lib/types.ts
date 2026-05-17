export interface NutritionData {
  energy_kcal: number | null
  sugars_g: number | null
  saturated_fat_g: number | null
  sodium_mg: number | null
  protein_g: number | null
  fiber_g: number | null
  fruits_veg_percent: number | null
  // Optional: marks this product as a beverage so Nutri-Score uses the
  // beverage-specific thresholds (much tighter on sugar/energy) and caps
  // the grade at C. Defaults to false when omitted.
  is_beverage?: boolean
  // Optional: pure water gets an automatic A in the official Nutri-Score
  // beverage rules.
  is_water?: boolean
}

// Numeric keys of NutritionData, useful for callers that iterate the per-nutrient
// values and need a precise type that excludes the boolean flags.
export type NutrientKey =
  | 'energy_kcal'
  | 'sugars_g'
  | 'saturated_fat_g'
  | 'sodium_mg'
  | 'protein_g'
  | 'fiber_g'
  | 'fruits_veg_percent'

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
  nutrition: NutritionData // per 100g/ml — used by the grade algorithm
  serving_nutrition?: NutritionData // exact values printed on the label, per one serving
  serving_size_g?: number | null // serving size in grams (e.g. 55 for a 55g bar)
  serving_size_ml?: number | null // serving size in millilitres (e.g. 240 for a glass)
  serving_label?: string | null // free-text "1 bar", "1 cup", "1 piece" if known
  image_url?: string
  barcode?: string
  source: 'barcode' | 'vision' | 'manual'
  confidence?: 'high' | 'medium' | 'low'
  data_source?: string // e.g., "Open Food Facts", "USDA", "AI Knowledge", "Label Scan"
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#2E7D32',
  B: '#558B2F',
  C: '#F9A825',
  D: '#E65100',
  E: '#C62828',
}

export const GRADE_GRADIENTS: Record<Grade, string> = {
  A: 'linear-gradient(135deg, #66BB6A, #2E7D32)',
  B: 'linear-gradient(135deg, #8BC34A, #558B2F)',
  C: 'linear-gradient(135deg, #FFC107, #F9A825)',
  D: 'linear-gradient(135deg, #FF9800, #E65100)',
  E: 'linear-gradient(135deg, #F44336, #C62828)',
}

export const GRADE_GLOWS: Record<Grade, string> = {
  A: '0 0 30px rgba(102, 187, 106, 0.3)',
  B: '0 0 30px rgba(139, 195, 74, 0.3)',
  C: '0 0 30px rgba(255, 193, 7, 0.3)',
  D: '0 0 30px rgba(255, 152, 0, 0.3)',
  E: '0 0 30px rgba(244, 67, 54, 0.3)',
}

export const GRADE_LABELS_AR: Record<Grade, string> = {
  A: 'ممتاز',
  B: 'جيد',
  C: 'متوسط',
  D: 'ضعيف',
  E: 'سيء',
}

export const GRADE_LABELS_EN: Record<Grade, string> = {
  A: 'Great',
  B: 'Good',
  C: 'Okay',
  D: 'Poor',
  E: 'Bad',
}
