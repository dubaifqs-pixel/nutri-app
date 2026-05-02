import { NextRequest, NextResponse } from 'next/server'
import { calculateGrade } from '@/lib/scoring'
import { searchProducts } from '@/lib/food-api'
import { DEMO_PRODUCTS } from '@/lib/demo-products'

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

    // Load demo products immediately (always available)
    const demoProducts = DEMO_PRODUCTS[category] || []
    const gradedDemo = demoProducts.map((dp) => {
      const gradeResult = calculateGrade(dp.nutrition)
      return {
        product_name: dp.product_name,
        image_url: dp.image_url,
        grade: gradeResult.grade,
        score: gradeResult.score,
        nutrition: dp.nutrition,
        barcode: null as string | null,
        source: 'manual' as const,
        data_source: 'Demo',
      }
    })

    // Fetch Gemini + USDA results in parallel (AI-first)
    const { products, total } = await searchProducts(searchTerm, page)

    const gradedApi = products.map((p) => {
      const gradeResult = calculateGrade(p.nutrition)
      return {
        product_name: p.product_name,
        image_url: p.image_url,
        grade: gradeResult.grade,
        score: gradeResult.score,
        nutrition: p.nutrition,
        barcode: p.barcode,
        source: p.source,
        data_source: p.data_source,
      }
    })

    // Merge: demo first (instant), then Gemini/USDA, deduplicate by name
    const seenNames = new Set<string>()
    const allProducts: typeof gradedApi = []

    // Demo products first (always work, instant)
    for (const p of gradedDemo) {
      const key = p.product_name.toLowerCase()
      if (!seenNames.has(key)) {
        seenNames.add(key)
        allProducts.push(p)
      }
    }

    // API results (Gemini + USDA)
    for (const p of gradedApi) {
      const key = p.product_name.toLowerCase()
      if (!seenNames.has(key)) {
        seenNames.add(key)
        allProducts.push(p)
      }
    }

    if (allProducts.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        page,
        message: 'No products found. Please try again later.',
      })
    }

    return NextResponse.json({
      products: allProducts,
      total: total + demoProducts.length,
      page,
    })
  } catch (error) {
    console.error('Browse error:', error)

    // Even on error, return demo products so browse always works
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || ''
    const demoProducts = DEMO_PRODUCTS[category] || []
    const gradedDemo = demoProducts.map((dp) => {
      const gradeResult = calculateGrade(dp.nutrition)
      return {
        product_name: dp.product_name,
        image_url: dp.image_url,
        grade: gradeResult.grade,
        score: gradeResult.score,
        nutrition: dp.nutrition,
        barcode: null as string | null,
        source: 'manual' as const,
        data_source: 'Demo',
      }
    })

    return NextResponse.json({
      products: gradedDemo,
      total: gradedDemo.length,
      page: 1,
      message: gradedDemo.length > 0
        ? undefined
        : 'Could not load products. Please try again later.',
    })
  }
}
