import { NextRequest, NextResponse } from 'next/server'
import { calculateGrade } from '@/lib/scoring'

const CATEGORY_TAGS: Record<string, string[]> = {
  dairy: ['en:dairies', 'en:milks', 'en:yogurts', 'en:cheeses'],
  beverages: ['en:beverages', 'en:juices', 'en:sodas', 'en:waters'],
  snacks: ['en:snacks', 'en:chips', 'en:cookies', 'en:crackers'],
  cereals: ['en:breakfast-cereals', 'en:cereals', 'en:mueslis'],
  bread: ['en:breads', 'en:bakery', 'en:biscuits'],
  meat: ['en:meats', 'en:poultry', 'en:beef', 'en:chicken'],
  fruits: ['en:fruits', 'en:vegetables', 'en:canned-fruits'],
  frozen: ['en:frozen-foods', 'en:frozen-meals', 'en:ice-creams'],
}

const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  dairy: 'milk yogurt cheese',
  beverages: 'juice soda water drink',
  snacks: 'chips cookies crackers snack',
  cereals: 'cereal oats breakfast granola',
  bread: 'bread bakery biscuit',
  meat: 'chicken beef meat poultry',
  fruits: 'fruit vegetable apple',
  frozen: 'frozen pizza ice cream',
}

async function fetchWithTimeout(url: string, timeoutMs: number = 8000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DFQS-PoC/1.0 (https://dfqs.vercel.app)' },
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

function gradeProduct(p: any) {
  const nutrition = {
    energy_kcal: p.nutriments?.['energy-kcal_100g'] ?? null,
    sugars_g: p.nutriments?.['sugars_100g'] ?? null,
    saturated_fat_g: p.nutriments?.['saturated-fat_100g'] ?? null,
    sodium_mg: p.nutriments?.['sodium_100g'] != null ? p.nutriments['sodium_100g'] * 1000 : null,
    protein_g: p.nutriments?.['proteins_100g'] ?? null,
    fiber_g: p.nutriments?.['fiber_100g'] ?? null,
    fruits_veg_percent: null,
  }
  const gradeResult = calculateGrade(nutrition)
  return {
    product_name: p.product_name || p.product_name_en || 'Unknown',
    image_url: p.image_small_url || p.image_url || null,
    grade: gradeResult.grade,
    score: gradeResult.score,
    nutrition,
    barcode: p.code || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)

    const tags = CATEGORY_TAGS[category]
    const searchTerm = CATEGORY_SEARCH_TERMS[category]
    if (!tags) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Try multiple approaches in order of preference
    let products: any[] = []
    let total = 0

    // Approach 1: Category tag search (v2 API)
    try {
      const res = await fetchWithTimeout(
        `https://world.openfoodfacts.org/api/v2/search?categories_tags=${tags[0]}&page=${page}&page_size=20&sort_by=nutriscore_score&fields=product_name,product_name_en,nutriments,image_small_url,image_url,code`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.products?.length > 0) {
          products = data.products
          total = data.count || 0
        }
      }
    } catch {}

    // Approach 2: Search terms fallback
    if (products.length === 0 && searchTerm) {
      try {
        const res = await fetchWithTimeout(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page=${page}&page_size=20&sort_by=nutriscore_score`
        )
        if (res.ok) {
          const text = await res.text()
          if (text.startsWith('{')) {
            const data = JSON.parse(text)
            if (data.products?.length > 0) {
              products = data.products
              total = data.count || 0
            }
          }
        }
      } catch {}
    }

    // Approach 3: Try each tag individually
    if (products.length === 0) {
      for (const tag of tags) {
        try {
          const res = await fetchWithTimeout(
            `https://world.openfoodfacts.org/category/${tag.replace('en:', '')}.json?page=${page}&page_size=20`
          )
          if (res.ok) {
            const text = await res.text()
            if (text.startsWith('{')) {
              const data = JSON.parse(text)
              if (data.products?.length > 0) {
                products = data.products
                total = data.count || 0
                break
              }
            }
          }
        } catch {}
      }
    }

    if (products.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        page,
        message: 'Open Food Facts is temporarily unavailable. Please try again later.',
      })
    }

    const graded = products
      .filter((p: any) => p.product_name || p.product_name_en)
      .filter((p: any) => p.nutriments)
      .map(gradeProduct)

    return NextResponse.json({ products: graded, total, page })
  } catch (error) {
    console.error('Browse error:', error)
    return NextResponse.json({
      products: [],
      total: 0,
      page: 1,
      message: 'Could not load products. Please try again later.',
    })
  }
}
