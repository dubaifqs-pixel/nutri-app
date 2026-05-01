import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash } from '@/lib/gemini'

const AUTO_DETECT_PROMPT = `Can you see and read a nutrition facts label or nutrition information table in this image?

If you CAN read nutrition values, extract them and return:
{"detected":true,"product_name":"string or null","energy_kcal":number or null,"sugars_g":number or null,"saturated_fat_g":number or null,"sodium_mg":number or null,"protein_g":number or null,"fiber_g":number or null,"fruits_veg_percent":number or null}

If you CANNOT read any nutrition values, return exactly: {"detected":false}

Important:
- All values per 100g. Convert from per-serving using serving size if needed.
- Sodium from salt: sodium_mg = salt_g × 400
- Energy from kJ: energy_kcal = energy_kJ / 4.184
- Use null for values you can't read. It's OK to have some nulls.
- The label may be in English, Arabic, or any language — read whatever you can see.
- Return ONLY raw JSON, no markdown, no explanation.`

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ detected: false })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

    const result = await geminiFlash.generateContent([
      AUTO_DETECT_PROMPT,
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
    ])

    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ detected: false })
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.detected) {
      return NextResponse.json({ detected: false })
    }

    // Verify we got enough data (at least 2 non-null nutrition values)
    const values = [parsed.energy_kcal, parsed.sugars_g, parsed.saturated_fat_g, parsed.sodium_mg, parsed.protein_g, parsed.fiber_g]
    const filledCount = values.filter((v: any) => v !== null && v !== undefined).length
    if (filledCount < 2) {
      return NextResponse.json({ detected: false })
    }

    return NextResponse.json({
      detected: true,
      product_name: parsed.product_name || 'Unknown Product',
      nutrition: {
        energy_kcal: parsed.energy_kcal ?? null,
        sugars_g: parsed.sugars_g ?? null,
        saturated_fat_g: parsed.saturated_fat_g ?? null,
        sodium_mg: parsed.sodium_mg ?? null,
        protein_g: parsed.protein_g ?? null,
        fiber_g: parsed.fiber_g ?? null,
        fruits_veg_percent: parsed.fruits_veg_percent ?? null,
      },
      source: 'vision',
    })
  } catch (error) {
    console.error('Auto-detect error:', error)
    return NextResponse.json({ detected: false })
  }
}
