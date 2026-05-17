import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash, VISION_PROMPT } from '@/lib/gemini'

type Num = number | null

function n(x: unknown): Num {
  if (typeof x === 'number' && Number.isFinite(x)) return x
  if (typeof x === 'string') {
    const v = Number(x.replace(/[^\d.\-]/g, ''))
    return Number.isFinite(v) ? v : null
  }
  return null
}

function to100g(perServing: Num, servingSize: Num): Num {
  if (perServing === null || servingSize === null || servingSize <= 0) return null
  return (perServing / servingSize) * 100
}

function reconcile(per100: Num, computed: Num): Num {
  if (computed !== null) return computed
  return per100
}

// Auto-detect uses the same precise OCR prompt as the explicit scan.
// We ask Gemini for serving-size + per-serving + per-100g, then compute per-100g
// from per-serving so the per-100g math is reliable even if the label's per-100g
// column is missing.
const PRECISE_PROMPT = VISION_PROMPT + `\n\nADDITIONAL RULE: If you do not actually see a nutrition facts table in this photo, return exactly: {"detected":false}`

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ detected: false })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const result = await geminiFlash.generateContent([
      PRECISE_PROMPT,
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
    ])
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ detected: false })
    }

    let parsed: any
    try { parsed = JSON.parse(jsonMatch[0]) } catch { return NextResponse.json({ detected: false }) }

    if (parsed.detected === false) {
      return NextResponse.json({ detected: false })
    }

    const ps = parsed.per_serving || {}
    const p100 = parsed.per_100g || {}
    const serving: Num = n(parsed.serving_size_g) ?? n(parsed.serving_size_ml)

    // Energy fallback from kJ.
    let energyServing = n(ps.energy_kcal)
    if (energyServing === null && n(ps.energy_kj) !== null) {
      energyServing = (n(ps.energy_kj) as number) / 4.184
    }
    // Sodium fallback from salt.
    let sodiumServing = n(ps.sodium_mg)
    if (sodiumServing === null && n(ps.salt_g) !== null) {
      sodiumServing = (n(ps.salt_g) as number) * 400
    }

    const computed = {
      energy_kcal: to100g(energyServing, serving),
      sugars_g: to100g(n(ps.sugars_g), serving),
      saturated_fat_g: to100g(n(ps.saturated_fat_g), serving),
      sodium_mg: to100g(sodiumServing, serving),
      protein_g: to100g(n(ps.protein_g), serving),
      fiber_g: to100g(n(ps.fiber_g), serving),
    }

    const nutrition = {
      energy_kcal: reconcile(n(p100.energy_kcal), computed.energy_kcal),
      sugars_g: reconcile(n(p100.sugars_g), computed.sugars_g),
      saturated_fat_g: reconcile(n(p100.saturated_fat_g), computed.saturated_fat_g),
      sodium_mg: reconcile(n(p100.sodium_mg), computed.sodium_mg),
      protein_g: reconcile(n(p100.protein_g), computed.protein_g),
      fiber_g: reconcile(n(p100.fiber_g), computed.fiber_g),
      fruits_veg_percent: n(parsed.fruits_veg_percent),
    }

    // Need at least 2 nutrient values to consider this a successful detection.
    const filled = [nutrition.energy_kcal, nutrition.sugars_g, nutrition.saturated_fat_g, nutrition.sodium_mg, nutrition.protein_g, nutrition.fiber_g].filter(v => v !== null).length
    if (filled < 2) {
      return NextResponse.json({ detected: false })
    }

    let productName: string | null = parsed.product_name
    if (!productName || productName === 'null' || productName === 'Unknown Product') {
      productName = null
    }

    const serving_nutrition = {
      energy_kcal: energyServing,
      sugars_g: n(ps.sugars_g),
      saturated_fat_g: n(ps.saturated_fat_g),
      sodium_mg: sodiumServing,
      protein_g: n(ps.protein_g),
      fiber_g: n(ps.fiber_g),
      fruits_veg_percent: n(parsed.fruits_veg_percent),
    }

    return NextResponse.json({
      detected: true,
      product_name: productName || 'Scanned Product',
      nutrition, // per 100g
      serving_nutrition, // per one serving (matches label)
      serving_size_g: parsed.serving_size_g ?? null,
      serving_size_ml: parsed.serving_size_ml ?? null,
      source: 'vision',
    })
  } catch (error) {
    console.error('Auto-detect error:', error)
    return NextResponse.json({ detected: false })
  }
}
