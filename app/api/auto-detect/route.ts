import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash } from '@/lib/gemini'

const AUTO_DETECT_PROMPT = `You are a precise nutrition label reader. Carefully examine this food product photo.

Step 1: Check if there is a nutrition facts label or nutrition information table visible.
Step 2: If yes, identify the product name and brand from the packaging text (any language).
Step 3: Read EACH nutrition value precisely — do not estimate or guess.

If you CAN read nutrition values, return:
{"detected":true,"product_name":"exact name from package","energy_kcal":number or null,"sugars_g":number or null,"saturated_fat_g":number or null,"sodium_mg":number or null,"protein_g":number or null,"fiber_g":number or null,"fruits_veg_percent":number or null}

If you CANNOT read any nutrition values, return exactly: {"detected":false}

Critical rules:
- All values MUST be per 100g or per 100ml
- If label shows "per serving", you MUST convert to per 100g using the serving size
- Sodium from salt: sodium_mg = salt_g × 400
- Energy from kJ: energy_kcal = energy_kJ / 4.184
- Read the EXACT numbers, do not round or estimate
- Product name: read what's printed on the package, in the original language
- If you can read values in both English and Arabic, prefer the numerical values
- Use null ONLY if a value is truly not visible
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

    // If no product name detected, try to identify from nutrition values
    let productName = parsed.product_name
    if (!productName || productName === 'null' || productName === 'Unknown Product') {
      try {
        const identifyResult = await geminiFlash.generateContent([
          `Look at this food product photo. What product is this? Read any visible text, brand name, or logo. Reply with ONLY the product name, nothing else.`,
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        ])
        const name = identifyResult.response.text().trim().replace(/['"]/g, '')
        if (name && name.length < 60 && name !== 'Unknown') {
          productName = name
        }
      } catch {}
    }

    return NextResponse.json({
      detected: true,
      product_name: productName || 'Scanned Product',
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
