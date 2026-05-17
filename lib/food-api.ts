import type { NutritionData } from './types'
import { geminiFlash } from './gemini'

// Unified interface for food data from any source
export interface FoodSearchResult {
  product_name: string
  image_url: string | null
  nutrition: NutritionData
  barcode: string | null
  source: 'usda' | 'openfoodfacts' | 'manual' | 'ai_knowledge'
  confidence?: 'high' | 'medium' | 'low'
  data_source?: string
}

// --- Timeout helper ---

async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

// --- Gemini AI Knowledge ---

const GEMINI_PRODUCT_PROMPT = `You are a food nutrition database with extensive knowledge of products sold worldwide, especially in UAE, Middle East, and global brands.

For the given product, return ONLY valid JSON (no markdown):
{
  "product_name": "Full product name",
  "brand": "Brand name",
  "nutrition": {
    "energy_kcal": number,
    "sugars_g": number,
    "saturated_fat_g": number,
    "sodium_mg": number,
    "protein_g": number,
    "fiber_g": number,
    "fruits_veg_percent": null
  },
  "confidence": "high" | "medium" | "low",
  "source": "AI Knowledge"
}

Rules:
- Values must be per 100g
- Use your training knowledge for accurate values
- If you're not confident about a product, set confidence to "low"
- If you don't know the product at all, return {"unknown": true}`

function buildCategorySearchPrompt(category: string): string {
  return `List 15 ${category} products commonly found in UAE supermarkets (Carrefour, Lulu, Spinneys, Choithrams). Include both local (Al Ain, Almarai, Al Rawabi, IFFCO) and international brands.

Return ONLY valid JSON array (no markdown):
[
  {
    "product_name": "Full name",
    "brand": "Brand",
    "nutrition": {
      "energy_kcal": number,
      "sugars_g": number,
      "saturated_fat_g": number,
      "sodium_mg": number,
      "protein_g": number,
      "fiber_g": number,
      "fruits_veg_percent": null
    }
  }
]

Rules:
- All values per 100g
- Include a mix of healthy (A/B grade) and unhealthy (D/E grade) products
- Include REAL products with accurate nutrition values
- Focus on products actually available in UAE`
}

interface GeminiProductResult {
  product_name?: string
  brand?: string
  nutrition?: {
    energy_kcal?: number | null
    sugars_g?: number | null
    saturated_fat_g?: number | null
    sodium_mg?: number | null
    protein_g?: number | null
    fiber_g?: number | null
    fruits_veg_percent?: number | null
  }
  confidence?: 'high' | 'medium' | 'low'
  source?: string
  unknown?: boolean
}

interface GeminiCategoryProduct {
  product_name?: string
  brand?: string
  nutrition?: {
    energy_kcal?: number | null
    sugars_g?: number | null
    saturated_fat_g?: number | null
    sodium_mg?: number | null
    protein_g?: number | null
    fiber_g?: number | null
    fruits_veg_percent?: number | null
  }
}

function parseGeminiNutrition(n: GeminiCategoryProduct['nutrition']): NutritionData {
  if (!n) {
    return {
      energy_kcal: null, sugars_g: null, saturated_fat_g: null,
      sodium_mg: null, protein_g: null, fiber_g: null, fruits_veg_percent: null,
    }
  }
  return {
    energy_kcal: typeof n.energy_kcal === 'number' ? n.energy_kcal : null,
    sugars_g: typeof n.sugars_g === 'number' ? n.sugars_g : null,
    saturated_fat_g: typeof n.saturated_fat_g === 'number' ? n.saturated_fat_g : null,
    sodium_mg: typeof n.sodium_mg === 'number' ? n.sodium_mg : null,
    protein_g: typeof n.protein_g === 'number' ? n.protein_g : null,
    fiber_g: typeof n.fiber_g === 'number' ? n.fiber_g : null,
    fruits_veg_percent: typeof n.fruits_veg_percent === 'number' ? n.fruits_veg_percent : null,
  }
}

function cleanJsonResponse(text: string): string {
  // Strip markdown code fences if present
  let cleaned = text.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  return cleaned.trim()
}

async function askGeminiForProduct(query: string): Promise<FoodSearchResult | null> {
  try {
    const result = await geminiFlash.generateContent(
      `${GEMINI_PRODUCT_PROMPT}\n\nProduct: ${query}`
    )
    const text = cleanJsonResponse(result.response.text())
    const parsed: GeminiProductResult = JSON.parse(text)

    if (parsed.unknown || !parsed.product_name || !parsed.nutrition) {
      return null
    }

    return {
      product_name: parsed.product_name,
      image_url: null,
      nutrition: parseGeminiNutrition(parsed.nutrition),
      barcode: null,
      source: 'ai_knowledge',
      confidence: parsed.confidence || 'medium',
      data_source: 'AI Knowledge',
    }
  } catch {
    return null
  }
}

async function askGeminiForBarcode(barcode: string): Promise<FoodSearchResult | null> {
  try {
    const result = await geminiFlash.generateContent(
      `${GEMINI_PRODUCT_PROMPT}\n\nWhat product has barcode ${barcode}? Provide the product name, brand, and nutrition facts per 100g.`
    )
    const text = cleanJsonResponse(result.response.text())
    const parsed: GeminiProductResult = JSON.parse(text)

    if (parsed.unknown || !parsed.product_name || !parsed.nutrition) {
      return null
    }

    return {
      product_name: parsed.product_name,
      image_url: null,
      nutrition: parseGeminiNutrition(parsed.nutrition),
      barcode,
      source: 'ai_knowledge',
      confidence: parsed.confidence || 'medium',
      data_source: 'AI Knowledge',
    }
  } catch {
    return null
  }
}

async function askGeminiForCategory(category: string): Promise<FoodSearchResult[]> {
  try {
    const prompt = buildCategorySearchPrompt(category)
    const result = await geminiFlash.generateContent(prompt)
    const text = cleanJsonResponse(result.response.text())
    const parsed: GeminiCategoryProduct[] = JSON.parse(text)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((p) => p.product_name && p.nutrition)
      .map((p) => ({
        product_name: p.product_name!,
        image_url: null,
        nutrition: parseGeminiNutrition(p.nutrition),
        barcode: null,
        source: 'ai_knowledge' as const,
        confidence: 'medium' as const,
        data_source: 'AI Knowledge',
      }))
  } catch {
    return []
  }
}

// --- USDA FoodData Central ---

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY'

interface USDANutrient {
  nutrientName: string
  value: number
  unitName: string
}

interface USDAFood {
  fdcId: number
  description: string
  foodNutrients: USDANutrient[]
  gtinUpc?: string
}

function mapUSDANutrition(nutrients: USDANutrient[]): NutritionData {
  let energy_kcal: number | null = null
  let sugars_g: number | null = null
  let saturated_fat_g: number | null = null
  let sodium_mg: number | null = null
  let protein_g: number | null = null
  let fiber_g: number | null = null

  for (const n of nutrients) {
    const name = n.nutrientName
    if (name === 'Energy' && n.unitName === 'KCAL') {
      energy_kcal = n.value
    } else if (name === 'Total Sugars') {
      sugars_g = n.value
    } else if (name === 'Fatty acids, total saturated') {
      saturated_fat_g = n.value
    } else if (name === 'Sodium, Na') {
      sodium_mg = n.value
    } else if (name === 'Protein') {
      protein_g = n.value
    } else if (name === 'Fiber, total dietary') {
      fiber_g = n.value
    }
  }

  return {
    energy_kcal,
    sugars_g,
    saturated_fat_g,
    sodium_mg,
    protein_g,
    fiber_g,
    fruits_veg_percent: null,
  }
}

function usdaFoodToResult(food: USDAFood): FoodSearchResult {
  return {
    product_name: food.description,
    image_url: null, // USDA doesn't provide images
    nutrition: mapUSDANutrition(food.foodNutrients),
    barcode: food.gtinUpc || null,
    source: 'usda',
    data_source: 'USDA',
  }
}

async function searchUSDA(query: string, pageSize = 20): Promise<{ products: FoodSearchResult[]; total: number }> {
  try {
    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${USDA_API_KEY}`
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Nutri-PoC/1.0 (https://nutri-app-mocha.vercel.app)' },
    })
    if (!res.ok) return { products: [], total: 0 }
    const data = await res.json()
    const foods: USDAFood[] = data.foods || []
    return {
      products: foods.map(usdaFoodToResult),
      total: data.totalHits || 0,
    }
  } catch {
    return { products: [], total: 0 }
  }
}

// --- Open Food Facts ---

function mapOFFNutrition(nutriments: Record<string, number | undefined>): NutritionData {
  return {
    energy_kcal: nutriments['energy-kcal_100g'] ?? null,
    sugars_g: nutriments['sugars_100g'] ?? null,
    saturated_fat_g: nutriments['saturated-fat_100g'] ?? null,
    sodium_mg: nutriments['sodium_100g'] != null ? nutriments['sodium_100g'] * 1000 : null,
    protein_g: nutriments['proteins_100g'] ?? null,
    fiber_g: nutriments['fiber_100g'] ?? null,
    fruits_veg_percent: null,
  }
}

interface OFFProduct {
  product_name?: string
  product_name_en?: string
  nutriments?: Record<string, number | undefined>
  image_small_url?: string
  image_url?: string
  code?: string
}

function offProductToResult(p: OFFProduct): FoodSearchResult {
  return {
    product_name: p.product_name || p.product_name_en || 'Unknown',
    image_url: p.image_small_url || p.image_url || null,
    nutrition: mapOFFNutrition(p.nutriments || {}),
    barcode: p.code || null,
    source: 'openfoodfacts',
    data_source: 'Open Food Facts',
  }
}

async function searchOFF(query: string, page = 1, pageSize = 20): Promise<{ products: FoodSearchResult[]; total: number }> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}&sort_by=nutriscore_score`
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Nutri-PoC/1.0 (https://nutri-app-mocha.vercel.app)' },
    })
    if (!res.ok) return { products: [], total: 0 }
    const text = await res.text()
    if (!text.startsWith('{')) return { products: [], total: 0 }
    const data = JSON.parse(text)
    const products: OFFProduct[] = (data.products || []).filter(
      (p: OFFProduct) => (p.product_name || p.product_name_en) && p.nutriments
    )
    return {
      products: products.map(offProductToResult),
      total: data.count || 0,
    }
  } catch {
    return { products: [], total: 0 }
  }
}

async function lookupOFFBarcode(barcode: string): Promise<FoodSearchResult | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'Nutri-PoC/1.0 (https://nutri-app-mocha.vercel.app)' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null
    const p = data.product
    return {
      product_name: p.product_name || p.product_name_en || 'Unknown Product',
      image_url: p.image_url || null,
      nutrition: mapOFFNutrition(p.nutriments || {}),
      barcode,
      source: 'openfoodfacts',
      data_source: 'Open Food Facts',
    }
  } catch {
    return null
  }
}

// --- Unified public API ---

/**
 * Search products by text query.
 * AI-first: Ask Gemini first for UAE-relevant results, then USDA as supplementary.
 * Merges and deduplicates results (Gemini first).
 */
export async function searchProducts(
  query: string,
  page = 1
): Promise<{ products: FoodSearchResult[]; total: number }> {
  // Run Gemini and USDA in parallel
  const [geminiResults, usdaResult] = await Promise.all([
    askGeminiForCategory(query),
    searchUSDA(query, 20),
  ])

  const seenNames = new Set<string>()
  const merged: FoodSearchResult[] = []

  // Add Gemini results first (AI-first, UAE-focused)
  for (const p of geminiResults) {
    const key = p.product_name.toLowerCase()
    if (!seenNames.has(key)) {
      seenNames.add(key)
      merged.push(p)
    }
  }

  // Add USDA results as supplementary
  for (const p of usdaResult.products) {
    const key = p.product_name.toLowerCase()
    if (!seenNames.has(key)) {
      seenNames.add(key)
      merged.push(p)
    }
  }

  if (merged.length > 0) {
    return {
      products: merged.slice(0, 30),
      total: geminiResults.length + usdaResult.total,
    }
  }

  // Both failed
  return { products: [], total: 0 }
}

/**
 * Lookup a product by barcode.
 * 1. Try Open Food Facts barcode API (fast, specific)
 * 2. If not found -> Ask Gemini AI
 * 3. If Gemini doesn't know -> return null
 */
// Count how many of the 6 graded nutrition fields are populated.
function countFilledNutrition(n: NutritionData): number {
  return (
    (n.energy_kcal !== null ? 1 : 0) +
    (n.sugars_g !== null ? 1 : 0) +
    (n.saturated_fat_g !== null ? 1 : 0) +
    (n.sodium_mg !== null ? 1 : 0) +
    (n.protein_g !== null ? 1 : 0) +
    (n.fiber_g !== null ? 1 : 0)
  )
}

// Merge two nutrition records — primary wins for non-null fields, secondary fills nulls.
function mergeNutrition(primary: NutritionData, secondary: NutritionData): NutritionData {
  return {
    energy_kcal: primary.energy_kcal ?? secondary.energy_kcal,
    sugars_g: primary.sugars_g ?? secondary.sugars_g,
    saturated_fat_g: primary.saturated_fat_g ?? secondary.saturated_fat_g,
    sodium_mg: primary.sodium_mg ?? secondary.sodium_mg,
    protein_g: primary.protein_g ?? secondary.protein_g,
    fiber_g: primary.fiber_g ?? secondary.fiber_g,
    fruits_veg_percent: primary.fruits_veg_percent ?? secondary.fruits_veg_percent,
  }
}

// Sniff the product name for beverage signals so Nutri-Score uses the
// beverage scale and not the solid-food one. OFF has category tags but they
// are inconsistent across UAE products; the name itself is a reliable signal.
const BEVERAGE_PATTERN = /\b(juice|drink|soda|cola|beverage|smoothie|nectar|kombucha|laban|cordial|squash|ice tea|iced tea|water|sparkling water|mineral water|energy drink|sports drink|عصير|مشروب|ماء)\b/i
const WATER_PATTERN = /\b(water|sparkling water|mineral water|ماء)\b/i

function tagBeverage(result: FoodSearchResult): FoodSearchResult {
  const name = (result.product_name || '').toLowerCase()
  if (!BEVERAGE_PATTERN.test(name)) return result
  const isWater = WATER_PATTERN.test(name) &&
    (result.nutrition.energy_kcal === null || result.nutrition.energy_kcal === 0)
  result.nutrition = {
    ...result.nutrition,
    is_beverage: true,
    ...(isWater ? { is_water: true } : {}),
  }
  return result
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  // Try Open Food Facts barcode API first (fast, specific)
  const offResult = await lookupOFFBarcode(barcode)
  if (offResult) {
    // Partial-data fallback: if OFF returned fewer than 5 of 6 graded nutrients,
    // ask Gemini for the same product by name and fill the gaps. The OFF values
    // still win for any field both sources have.
    const filled = countFilledNutrition(offResult.nutrition)
    if (filled < 5 && offResult.product_name && offResult.product_name !== 'Unknown Product') {
      try {
        const aiSupplement = await askGeminiForProduct(offResult.product_name)
        if (aiSupplement?.nutrition) {
          offResult.nutrition = mergeNutrition(offResult.nutrition, aiSupplement.nutrition)
          offResult.data_source = 'Open Food Facts + AI'
        }
      } catch { /* keep OFF-only data */ }
    }
    return tagBeverage(offResult)
  }

  // Fallback: Ask Gemini for barcode knowledge
  const geminiResult = await askGeminiForBarcode(barcode)
  if (geminiResult) return tagBeverage(geminiResult)

  return null
}

/**
 * Recognize a product by name using AI knowledge.
 * Used when AI Vision reads a product name but couldn't read all nutrition values.
 */
export async function recognizeProduct(name: string): Promise<FoodSearchResult | null> {
  return askGeminiForProduct(name)
}

/**
 * Search for healthier alternatives using Gemini AI knowledge.
 * Returns products commonly available in UAE supermarkets.
 */
export async function searchAlternatives(
  productName: string,
  category: string | null,
  currentGrade: string
): Promise<FoodSearchResult[]> {
  try {
    const prompt = `Suggest 10 healthier alternatives to "${productName}" (currently grade ${currentGrade}) available in UAE supermarkets (Carrefour, Lulu, Spinneys, Choithrams). Include both local and international brands.
${category ? `Category: ${category}` : ''}

CRITICAL: Alternatives MUST be the same TYPE of product as "${productName}", just healthier. Stay inside the same product category.
Examples of correct same-type alternatives:
- Chocolate bar → healthier chocolate bars (dark chocolate ≥70% cacao, lower-sugar chocolate, protein chocolate bars)
- Soda → healthier sodas (zero-sugar soda, flavored sparkling water, kombucha)
- Potato chips → healthier chips (baked chips, lentil/chickpea chips, popcorn, vegetable crisps)
- Sugary cereal → healthier cereals (rolled oats, low-sugar whole-grain cereal, muesli)
- Full-cream milk → skim or low-fat milk, almond milk, plain yogurt
- Cookies / biscuits → healthier biscuits (whole-grain, oat-based, low-sugar)
- Juice → 100% juice or water-based fruit drinks with no added sugar
- Ice cream → low-sugar / Greek yogurt / sorbet alternatives

Do NOT suggest products from a different food type. If "${productName}" is a chocolate, every alternative must be a chocolate or chocolate-style snack. If it is a beverage, every alternative must be a beverage.

Return ONLY valid JSON array (no markdown):
[
  {
    "product_name": "Full name",
    "brand": "Brand",
    "nutrition": {
      "energy_kcal": number,
      "sugars_g": number,
      "saturated_fat_g": number,
      "sodium_mg": number,
      "protein_g": number,
      "fiber_g": number,
      "fruits_veg_percent": null
    }
  }
]

Rules:
- All values per 100g
- Focus on products with BETTER nutrition (lower sugar, less saturated fat, less sodium)
- Include REAL products with accurate nutrition values
- Products must be commonly available in UAE
- Every item must be the same product type as "${productName}"`

    const result = await geminiFlash.generateContent(prompt)
    const text = cleanJsonResponse(result.response.text())
    const parsed: GeminiCategoryProduct[] = JSON.parse(text)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((p) => p.product_name && p.nutrition)
      .map((p) => ({
        product_name: p.product_name!,
        image_url: null,
        nutrition: parseGeminiNutrition(p.nutrition),
        barcode: null,
        source: 'ai_knowledge' as const,
        confidence: 'medium' as const,
        data_source: 'AI Knowledge',
      }))
  } catch {
    return []
  }
}
