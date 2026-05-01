import type { NutritionData } from './types'

// Unified interface for food data from any source
export interface FoodSearchResult {
  product_name: string
  image_url: string | null
  nutrition: NutritionData
  barcode: string | null
  source: 'usda' | 'openfoodfacts' | 'manual'
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
  }
}

async function searchUSDA(query: string, pageSize = 20): Promise<{ products: FoodSearchResult[]; total: number }> {
  try {
    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${USDA_API_KEY}`
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'DFQS-PoC/1.0 (https://dfqs.vercel.app)' },
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
  }
}

async function searchOFF(query: string, page = 1, pageSize = 20): Promise<{ products: FoodSearchResult[]; total: number }> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}&sort_by=nutriscore_score`
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'DFQS-PoC/1.0 (https://dfqs.vercel.app)' },
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
      headers: { 'User-Agent': 'DFQS-PoC/1.0 (https://dfqs.vercel.app)' },
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
    }
  } catch {
    return null
  }
}

// --- Unified public API ---

/**
 * Search products by text query.
 * Tries USDA first (more reliable uptime), then Open Food Facts.
 * Merges results if both succeed, deduplicating by product name.
 */
export async function searchProducts(
  query: string,
  page = 1
): Promise<{ products: FoodSearchResult[]; total: number }> {
  // Run both searches in parallel
  const [usdaResult, offResult] = await Promise.all([
    searchUSDA(query, 20),
    searchOFF(query, page, 20),
  ])

  // If both returned results, merge them (USDA first, then OFF)
  if (usdaResult.products.length > 0 && offResult.products.length > 0) {
    const seenNames = new Set<string>()
    const merged: FoodSearchResult[] = []

    // Add USDA results first (more reliable)
    for (const p of usdaResult.products) {
      const key = p.product_name.toLowerCase()
      if (!seenNames.has(key)) {
        seenNames.add(key)
        merged.push(p)
      }
    }

    // Add OFF results that aren't duplicates
    for (const p of offResult.products) {
      const key = p.product_name.toLowerCase()
      if (!seenNames.has(key)) {
        seenNames.add(key)
        merged.push(p)
      }
    }

    return {
      products: merged.slice(0, 30), // Cap at 30 for merged results
      total: usdaResult.total + offResult.total,
    }
  }

  // If only one succeeded, use that
  if (usdaResult.products.length > 0) return usdaResult
  if (offResult.products.length > 0) return offResult

  // Both failed
  return { products: [], total: 0 }
}

/**
 * Lookup a product by barcode.
 * Tries Open Food Facts first (better barcode coverage), then falls back to USDA search.
 */
export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  // Try Open Food Facts barcode API first
  const offResult = await lookupOFFBarcode(barcode)
  if (offResult) return offResult

  // Fallback: search USDA with the barcode number
  const usdaResult = await searchUSDA(barcode, 5)
  if (usdaResult.products.length > 0) {
    return usdaResult.products[0]
  }

  return null
}
