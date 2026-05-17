import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash } from '@/lib/gemini'
import { calculateGrade } from '@/lib/scoring'
import { searchAlternatives } from '@/lib/food-api'
import { DEMO_PRODUCTS } from '@/lib/demo-products'

export async function POST(request: NextRequest) {
  let isAr = false
  try {
    const { current_grade, product_name, nutrition, lang } = await request.json()
    isAr = lang === 'ar'

    const gradeOrder = ['A', 'B', 'C', 'D', 'E']
    const currentIndex = gradeOrder.indexOf(current_grade)

    // If already grade A, no better alternatives exist
    if (currentIndex === 0) {
      return NextResponse.json({
        alternatives: [],
        summary: isAr
          ? 'هذا المنتج حصل بالفعل على أعلى تقدير (A) — ممتاز! لا حاجة للبحث عن بدائل.'
          : 'This product already has the highest grade (A) -- excellent! No need to look for alternatives.',
        category: null,
      })
    }

    // Detect category using Gemini
    let category: string | null = null
    try {
      const catResult = await geminiFlash.generateContent(
        `What food category does '${product_name}' belong to? Reply with one word only, lowercase. Choose from: dairy, beverages, snacks, confectionery, cereals, bread, meat, fruits, frozen. Use 'confectionery' for chocolate bars, candy, sweets, or biscuits. Use 'snacks' for chips, crackers, savory snacks. Use 'frozen' only for frozen meals or ice cream.`
      )
      const catText = catResult.response.text().trim().toLowerCase()
      const validCategories = ['dairy', 'beverages', 'snacks', 'confectionery', 'cereals', 'bread', 'meat', 'fruits', 'frozen']
      if (validCategories.includes(catText)) {
        category = catText
      }
    } catch {
      // Category detection failed, continue without it
    }

    interface AlternativeResult {
      product_name: string
      brand: string
      image_url: string | null
      grade: string
      score: number
      nutrition: {
        energy_kcal: number | null
        sugars_g: number | null
        saturated_fat_g: number | null
        sodium_mg: number | null
        protein_g: number | null
        fiber_g: number | null
        fruits_veg_percent: number | null
      }
      source: 'usda' | 'openfoodfacts' | 'manual' | 'ai_knowledge'
      data_source?: string
    }

    // Ask Gemini for healthier alternatives commonly available in UAE
    const geminiAlts = await searchAlternatives(product_name, category, current_grade)

    const geminiAlternatives: AlternativeResult[] = geminiAlts
      .map((p) => {
        const grade = calculateGrade(p.nutrition)
        return {
          product_name: p.product_name,
          brand: extractBrand(p.product_name),
          image_url: p.image_url || null,
          grade: grade.grade,
          score: grade.score,
          nutrition: p.nutrition,
          source: 'ai_knowledge' as const,
          data_source: 'AI Knowledge',
        }
      })
      .filter((p) => gradeOrder.indexOf(p.grade) < currentIndex)

    // Include matching demo products with better grade
    const demoAlternatives: AlternativeResult[] = []
    const categoriesToSearch = category ? [category] : Object.keys(DEMO_PRODUCTS)
    for (const cat of categoriesToSearch) {
      const demoProducts = DEMO_PRODUCTS[cat]
      if (!demoProducts) continue
      for (const dp of demoProducts) {
        const grade = calculateGrade(dp.nutrition)
        if (gradeOrder.indexOf(grade.grade) < currentIndex) {
          // Don't add if same name as original product
          if (dp.product_name.toLowerCase() === product_name.toLowerCase()) continue
          demoAlternatives.push({
            product_name: dp.product_name,
            brand: dp.brand,
            image_url: null,
            grade: grade.grade,
            score: grade.score,
            nutrition: dp.nutrition,
            source: 'manual' as const,
          })
        }
      }
    }

    // Merge and deduplicate: Gemini alternatives first, then demo
    const seenNames = new Set<string>()
    const allAlternatives = [...geminiAlternatives, ...demoAlternatives]
      .filter(a => {
        const key = a.product_name.toLowerCase()
        if (seenNames.has(key)) return false
        seenNames.add(key)
        return true
      })
      .sort((a, b) => {
        const gradeA = gradeOrder.indexOf(a.grade)
        const gradeB = gradeOrder.indexOf(b.grade)
        if (gradeA !== gradeB) return gradeA - gradeB
        return a.score - b.score
      })
      .slice(0, 10)

    // Use Gemini to provide recommendations in English
    const nutritionContext = nutrition
      ? `\nNutrition per 100g: Energy ${nutrition.energy_kcal}kcal, Sugar ${nutrition.sugars_g}g, Sat Fat ${nutrition.saturated_fat_g}g, Sodium ${nutrition.sodium_mg}mg, Protein ${nutrition.protein_g}g, Fiber ${nutrition.fiber_g}g`
      : ''

    const langInstruction = isAr ? 'Arabic (modern standard Arabic, MSA)' : 'English'
    let summary = ''
    if (allAlternatives.length > 0) {
      const altNames = allAlternatives.slice(0, 5).map((a) => `${a.product_name} (${a.grade})`).join(', ')
      const result = await geminiFlash.generateContent(
        `The user scanned "${product_name}" which got grade ${current_grade}.${nutritionContext}\n\nHealthier alternatives found: ${altNames}\n\nWrite a brief summary in ${langInstruction} (2-3 sentences) explaining why these alternatives are better and what the user should look for when choosing a healthier option.`
      )
      summary = result.response.text()
    } else {
      const result = await geminiFlash.generateContent(
        `The user scanned "${product_name}" which got grade ${current_grade}.${nutritionContext}\n\nNo alternatives were found in the database. Write brief advice in ${langInstruction} (3-4 sentences) including:\n1. Why this product got this grade\n2. What types of alternatives to look for (in general)\n3. A practical consumer tip`
      )
      summary = result.response.text()
    }

    return NextResponse.json({ alternatives: allAlternatives, summary, category })
  } catch (error) {
    console.error('Recommend error:', error)
    return NextResponse.json({
      alternatives: [],
      summary: isAr
        ? 'تعذّر البحث عن بدائل الآن. حاول مرة أخرى لاحقاً.'
        : 'Could not search for alternatives right now. Please try again later.',
      category: null,
    })
  }
}

function extractBrand(productName: string): string {
  // Try to extract the first word as brand name
  const parts = productName.split(/[\s,]+/)
  if (parts.length > 1) return parts[0]
  return ''
}
