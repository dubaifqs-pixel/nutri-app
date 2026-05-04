import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash, VISION_PROMPT } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const result = await geminiFlash.generateContent([
      VISION_PROMPT,
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
    ])
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse nutrition data from image' }, { status: 422 })
    }
    const nutrition = JSON.parse(jsonMatch[0])

    // If product name is missing, ask AI to identify it from the nutrition profile
    let productName = nutrition.product_name
    if (!productName || productName === 'null' || productName === 'Unknown Product') {
      try {
        const identifyResult = await geminiFlash.generateContent(
          `Based on this nutrition label photo and these values per 100g: Energy ${nutrition.energy_kcal}kcal, Sugar ${nutrition.sugars_g}g, Sat Fat ${nutrition.saturated_fat_g}g, Sodium ${nutrition.sodium_mg}mg, Protein ${nutrition.protein_g}g — what product is this most likely? Look at ANY visible text, brand logos, colors, or packaging clues in the image. Reply with ONLY the product name (e.g. "KitKat 4 Finger" or "Lay's Classic Chips"), nothing else.`
        )
        const name = identifyResult.response.text().trim().replace(/['"]/g, '')
        if (name && name.length < 60 && name !== 'Unknown') {
          productName = name
        }
      } catch {}
    }

    return NextResponse.json({
      product_name: productName || 'Scanned Product',
      nutrition: {
        energy_kcal: nutrition.energy_kcal, sugars_g: nutrition.sugars_g,
        saturated_fat_g: nutrition.saturated_fat_g, sodium_mg: nutrition.sodium_mg,
        protein_g: nutrition.protein_g, fiber_g: nutrition.fiber_g,
        fruits_veg_percent: nutrition.fruits_veg_percent,
      },
      source: 'vision',
    })
  } catch (error) {
    console.error('Scan label error:', error)
    return NextResponse.json({ error: 'Failed to analyze image. Please try again.' }, { status: 500 })
  }
}
