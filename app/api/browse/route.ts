import { NextRequest, NextResponse } from 'next/server'
import { calculateGrade } from '@/lib/scoring'
import { searchProducts } from '@/lib/food-api'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)

    const searchTerm = CATEGORY_SEARCH_TERMS[category]
    if (!searchTerm) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const { products, total } = await searchProducts(searchTerm, page)

    if (products.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        page,
        message: 'No products found. Please try again later.',
      })
    }

    const graded = products.map((p) => {
      const gradeResult = calculateGrade(p.nutrition)
      return {
        product_name: p.product_name,
        image_url: p.image_url,
        grade: gradeResult.grade,
        score: gradeResult.score,
        nutrition: p.nutrition,
        barcode: p.barcode,
        source: p.source,
      }
    })

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
