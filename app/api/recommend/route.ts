import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash } from '@/lib/gemini'
import { calculateGrade } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const { category, current_grade, product_name } = await request.json()
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(category || product_name)}&search_simple=1&action=process&json=1&page_size=20&sort_by=nutriscore_score`
    const response = await fetch(searchUrl, { headers: { 'User-Agent': 'DFQS-PoC/1.0' } })
    const data = await response.json()
    const products = data.products || []
    const alternatives = products
      .filter((p: any) => p.nutriments && p.product_name)
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
        const grade = calculateGrade(nutrition)
        return { product_name: p.product_name, image_url: p.image_small_url || null, grade: grade.grade, score: grade.score }
      })
      .filter((p: any) => {
        const gradeOrder = ['A', 'B', 'C', 'D', 'E']
        return gradeOrder.indexOf(p.grade) < gradeOrder.indexOf(current_grade)
      })
      .slice(0, 5)
    let summary = ''
    if (alternatives.length > 0) {
      const altNames = alternatives.map((a: any) => `${a.product_name} (Grade ${a.grade})`).join(', ')
      const result = await geminiFlash.generateContent(
        `The user scanned "${product_name}" which got grade ${current_grade}. Here are healthier alternatives: ${altNames}. Write a brief 2-sentence summary in Arabic explaining why these are better choices. Be concise.`
      )
      summary = result.response.text()
    }
    return NextResponse.json({ alternatives, summary })
  } catch (error) {
    console.error('Recommend error:', error)
    return NextResponse.json({ error: 'Failed to find alternatives' }, { status: 500 })
  }
}
