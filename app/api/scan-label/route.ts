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

    // If the model could not read a brand/product name from text actually visible in the image,
    // fall back to a neutral label. Do NOT ask the model to "guess" from nutrition values —
    // that produced wildly wrong names (e.g. "M&S Chicken Breast Fillets" for a Barebells bar).
    let productName: string | null = nutrition.product_name
    if (!productName || productName === 'null' || productName === 'Unknown Product') {
      productName = null
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
