import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash } from '@/lib/gemini'
import { calculateGrade } from '@/lib/scoring'

async function searchOpenFoodFacts(query: string) {
  try {
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&sort_by=nutriscore_score`
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'DFQS-PoC/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.products || []
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { current_grade, product_name, nutrition } = await request.json()

    const gradeOrder = ['A', 'B', 'C', 'D', 'E']
    const currentIndex = gradeOrder.indexOf(current_grade)

    // If already grade A, no better alternatives exist
    if (currentIndex === 0) {
      return NextResponse.json({
        alternatives: [],
        summary: 'هذا المنتج حصل على أعلى تقييم (A) — ممتاز! لا حاجة للبحث عن بدائل.',
      })
    }

    // Try searching Open Food Facts with English translation
    let products: any[] = []
    try {
      // Ask Gemini to translate product name to English food category
      const translateResult = await geminiFlash.generateContent(
        `Translate this food product name to a short English search term (1-3 words only, no quotes): "${product_name}"`
      )
      const englishName = translateResult.response.text().trim()
      products = await searchOpenFoodFacts(englishName)

      // If no results, try the original name
      if (products.length === 0) {
        products = await searchOpenFoodFacts(product_name)
      }
    } catch {
      products = await searchOpenFoodFacts(product_name)
    }

    // Grade and filter alternatives from Open Food Facts
    const alternatives = products
      .filter((p: any) => p.nutriments && p.product_name)
      .map((p: any) => {
        const n = {
          energy_kcal: p.nutriments['energy-kcal_100g'] ?? null,
          sugars_g: p.nutriments['sugars_100g'] ?? null,
          saturated_fat_g: p.nutriments['saturated-fat_100g'] ?? null,
          sodium_mg: p.nutriments['sodium_100g'] != null ? p.nutriments['sodium_100g'] * 1000 : null,
          protein_g: p.nutriments['proteins_100g'] ?? null,
          fiber_g: p.nutriments['fiber_100g'] ?? null,
          fruits_veg_percent: null,
        }
        const grade = calculateGrade(n)
        return {
          product_name: p.product_name,
          image_url: p.image_small_url || null,
          grade: grade.grade,
          score: grade.score,
        }
      })
      .filter((p: any) => gradeOrder.indexOf(p.grade) < currentIndex)
      .slice(0, 5)

    // Use Gemini to provide recommendations (with or without Open Food Facts results)
    const nutritionContext = nutrition
      ? `\nNutrition per 100g: Energy ${nutrition.energy_kcal}kcal, Sugar ${nutrition.sugars_g}g, Sat Fat ${nutrition.saturated_fat_g}g, Sodium ${nutrition.sodium_mg}mg, Protein ${nutrition.protein_g}g, Fiber ${nutrition.fiber_g}g`
      : ''

    let summary = ''
    if (alternatives.length > 0) {
      const altNames = alternatives.map((a: any) => `${a.product_name} (${a.grade})`).join(', ')
      const result = await geminiFlash.generateContent(
        `المستخدم مسح منتج "${product_name}" وحصل على تقييم ${current_grade}.${nutritionContext}\n\nبدائل صحية أفضل: ${altNames}\n\nاكتب ملخص مختصر بالعربية (2-3 جمل) يشرح لماذا هذه البدائل أفضل وما الذي يجب أن يبحث عنه المستخدم عند اختيار بديل صحي.`
      )
      summary = result.response.text()
    } else {
      // No alternatives found in database — ask Gemini for general advice
      const result = await geminiFlash.generateContent(
        `المستخدم مسح منتج "${product_name}" وحصل على تقييم ${current_grade}.${nutritionContext}\n\nلم أجد بدائل في قاعدة البيانات. اكتب نصيحة مختصرة بالعربية (3-4 جمل) تشمل:\n1. لماذا حصل هذا المنتج على هذا التقييم\n2. ما نوع البدائل التي يجب البحث عنها (بشكل عام)\n3. نصيحة عملية للمستهلك`
      )
      summary = result.response.text()
    }

    return NextResponse.json({ alternatives, summary })
  } catch (error) {
    console.error('Recommend error:', error)
    return NextResponse.json({
      alternatives: [],
      summary: 'تعذر البحث عن بدائل حالياً. حاول مرة أخرى لاحقاً.',
    })
  }
}
