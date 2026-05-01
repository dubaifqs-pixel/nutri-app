import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash } from '@/lib/gemini'
import { calculateGrade } from '@/lib/scoring'
import { searchProducts } from '@/lib/food-api'

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

    // Search for alternatives using the unified food data layer
    let searchQuery = product_name
    try {
      // Ask Gemini to translate product name to English food category
      const translateResult = await geminiFlash.generateContent(
        `Translate this food product name to a short English search term (1-3 words only, no quotes): "${product_name}"`
      )
      searchQuery = translateResult.response.text().trim()
    } catch {
      // Use original name if translation fails
    }

    // Search with translated term, fall back to original
    let { products } = await searchProducts(searchQuery)
    if (products.length === 0 && searchQuery !== product_name) {
      const fallback = await searchProducts(product_name)
      products = fallback.products
    }

    // Grade and filter alternatives
    const alternatives = products
      .map((p) => {
        const grade = calculateGrade(p.nutrition)
        return {
          product_name: p.product_name,
          image_url: p.image_url,
          grade: grade.grade,
          score: grade.score,
          source: p.source,
        }
      })
      .filter((p) => gradeOrder.indexOf(p.grade) < currentIndex)
      .slice(0, 5)

    // Use Gemini to provide recommendations
    const nutritionContext = nutrition
      ? `\nNutrition per 100g: Energy ${nutrition.energy_kcal}kcal, Sugar ${nutrition.sugars_g}g, Sat Fat ${nutrition.saturated_fat_g}g, Sodium ${nutrition.sodium_mg}mg, Protein ${nutrition.protein_g}g, Fiber ${nutrition.fiber_g}g`
      : ''

    let summary = ''
    if (alternatives.length > 0) {
      const altNames = alternatives.map((a) => `${a.product_name} (${a.grade})`).join(', ')
      const result = await geminiFlash.generateContent(
        `المستخدم مسح منتج "${product_name}" وحصل على تقييم ${current_grade}.${nutritionContext}\n\nبدائل صحية أفضل: ${altNames}\n\nاكتب ملخص مختصر بالعربية (2-3 جمل) يشرح لماذا هذه البدائل أفضل وما الذي يجب أن يبحث عنه المستخدم عند اختيار بديل صحي.`
      )
      summary = result.response.text()
    } else {
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
