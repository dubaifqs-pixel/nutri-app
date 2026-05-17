import { NextRequest, NextResponse } from 'next/server'
import { calculateGrade } from '@/lib/scoring'
import { searchProducts } from '@/lib/food-api'
import { DEMO_PRODUCTS } from '@/lib/demo-products'
/* eslint-disable @typescript-eslint/no-explicit-any */

const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  dairy: 'dairy milk yogurt cheese',
  beverages: 'beverages juice soda water drink',
  snacks: 'snacks chips cookies crackers',
  cereals: 'cereals oats breakfast granola',
  bread: 'bread bakery biscuit',
  meat: 'meat chicken beef poultry',
  fruits: 'fruits vegetables fresh produce',
  frozen: 'frozen pizza ice cream frozen food',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)

    const searchTerm = CATEGORY_SEARCH_TERMS[category]
    if (!searchTerm) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // The frontend already renders curated demo products separately, so the
    // API only returns external database results. Pre-build a name set so we
    // can filter out anything that overlaps with curated.
    const demoProducts = DEMO_PRODUCTS[category] || []
    const demoNames = new Set(demoProducts.map((d) => d.product_name.toLowerCase()))

    // Fetch Gemini + USDA results in parallel (AI-first)
    const { products, total } = await searchProducts(searchTerm, page)

    const seenNames = new Set<string>(demoNames)
    const allProducts: any[] = []
    for (const p of products) {
      const key = p.product_name.toLowerCase()
      if (seenNames.has(key)) continue
      seenNames.add(key)
      const gradeResult = calculateGrade(p.nutrition)
      allProducts.push({
        product_name: p.product_name,
        image_url: p.image_url,
        grade: gradeResult.grade,
        score: gradeResult.score,
        nutrition: p.nutrition,
        barcode: p.barcode,
        source: p.source,
        data_source: p.data_source,
      })
    }

    return NextResponse.json({
      products: allProducts,
      total,
      page,
    })
  } catch (error) {
    console.error('Browse error:', error)
    // Curated demo products are rendered by the frontend independently, so
    // returning an empty list on external-API failure is the correct fallback.
    return NextResponse.json({ products: [], total: 0, page: 1 })
  }
}
