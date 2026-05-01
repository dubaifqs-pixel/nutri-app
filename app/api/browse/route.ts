import { NextRequest, NextResponse } from 'next/server'
import { calculateGrade } from '@/lib/scoring'

const CATEGORY_TAGS: Record<string, string> = {
  dairy: 'dairies',
  beverages: 'beverages',
  snacks: 'snacks',
  cereals: 'breakfast-cereals',
  bread: 'breads',
  meat: 'meats',
  fruits: 'fruits',
  frozen: 'frozen-foods',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)

    const tag = CATEGORY_TAGS[category]
    if (!tag) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const url = `https://world.openfoodfacts.org/cgi/search.pl?tagtype_0=categories&tag_contains_0=contains&tag_0=${tag}&json=1&page=${page}&page_size=20&sort_by=nutriscore_score`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'DFQS-PoC/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 502 })
    }

    const data = await response.json()
    const rawProducts = data.products || []

    const products = rawProducts
      .filter((p: any) => p.product_name && p.nutriments)
      .map((p: any) => {
        const nutrition = {
          energy_kcal: p.nutriments['energy-kcal_100g'] ?? null,
          sugars_g: p.nutriments['sugars_100g'] ?? null,
          saturated_fat_g: p.nutriments['saturated-fat_100g'] ?? null,
          sodium_mg: p.nutriments['sodium_100g'] != null ? p.nutriments['sodium_100g'] * 1000 : null,
          protein_g: p.nutriments['proteins_100g'] ?? null,
          fiber_g: p.nutriments['fiber_100g'] ?? null,
          fruits_veg_percent: null,
        }
        const gradeResult = calculateGrade(nutrition)
        return {
          product_name: p.product_name,
          image_url: p.image_small_url || p.image_url || null,
          grade: gradeResult.grade,
          score: gradeResult.score,
          nutrition,
          barcode: p.code || null,
        }
      })

    return NextResponse.json({
      products,
      total: data.count || 0,
      page,
    })
  } catch (error) {
    console.error('Browse error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
