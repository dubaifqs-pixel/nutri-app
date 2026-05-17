import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash, VISION_PROMPT } from '@/lib/gemini'

type Num = number | null
type Stage = 'name' | 'nutrition'

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

// Stage 1 prompt — product identification.
// Asks Gemini to read the brand/product name from packaging text, with NO requirement
// that a nutrition table be visible. Front-of-pack photos work here.
const NAME_PROMPT = `You are a product identifier. Look at this food package photo.

Read text actually printed on the package — brand wordmark, product name, flavor. The text may be in any language.

Rules:
- ONLY return text that is clearly readable from the photo.
- If you can read the brand and product, return both (e.g. "Barebells Cookies & Cream Bar").
- If you can only read the brand, return the brand alone (e.g. "Barebells").
- If no clear brand/product text is readable — only a barcode, nutrition table, or partial colors — return null.
- DO NOT GUESS plausible names from packaging colors, shapes, or nutrition values.
- If a serving size is visible (e.g. "1 bar (55g)"), report it.

Return ONLY this JSON (no markdown):
{"product_name": "exact name from package" | null, "serving_size_g": number | null, "serving_size_ml": number | null}`

// Stage 2 prompt — nutrition extraction. Same as the manual-capture VISION_PROMPT but with
// a detected:false fallback when no nutrition table is in view.
const NUTRITION_PROMPT = VISION_PROMPT + `\n\nADDITIONAL RULE: If you do not actually see a nutrition facts table in this photo, return exactly: {"detected":false}`

export async function POST(request: NextRequest) {
  try {
    const { image, stage } = (await request.json()) as { image?: string; stage?: Stage }
    if (!image) {
      return NextResponse.json({ detected: false })
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

    if (stage === 'name') {
      // Stage 1: identify the product name from the front of the package.
      const result = await geminiFlash.generateContent([
        NAME_PROMPT,
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
      ])
      const text = result.response.text().trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return NextResponse.json({ detected: false })
      let parsed: any
      try { parsed = JSON.parse(jsonMatch[0]) } catch { return NextResponse.json({ detected: false }) }
      const name = parsed.product_name
      if (!name || typeof name !== 'string' || name.toLowerCase() === 'null' || name.length < 2) {
        return NextResponse.json({ detected: false })
      }
      return NextResponse.json({
        detected: true,
        product_name: name,
        serving_size_g: n(parsed.serving_size_g),
        serving_size_ml: n(parsed.serving_size_ml),
      })
    }

    // Stage 2 (default): read the nutrition table.
    const result = await geminiFlash.generateContent([
      NUTRITION_PROMPT,
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
    ])
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ detected: false })
    let parsed: any
    try { parsed = JSON.parse(jsonMatch[0]) } catch { return NextResponse.json({ detected: false }) }

    if (parsed.detected === false) return NextResponse.json({ detected: false })

    const ps = parsed.per_serving || {}
    const p100 = parsed.per_100g || {}
    const serving: Num = n(parsed.serving_size_g) ?? n(parsed.serving_size_ml)

    let energyServing = n(ps.energy_kcal)
    if (energyServing === null && n(ps.energy_kj) !== null) {
      energyServing = (n(ps.energy_kj) as number) / 4.184
    }
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

    // Beverage detection — same rules as scan-label: ml serving or drink-y name.
    const productNameRaw = (parsed.product_name || '').toLowerCase()
    const beverageNameSignal = /\b(juice|drink|soda|cola|water|milk drink|beverage|smoothie|tea|coffee latte|iced tea|nectar|kombucha|laban|عصير|مشروب|ماء)\b/.test(productNameRaw)
    const isBeverage = parsed.serving_size_ml !== null || beverageNameSignal
    const energyForWaterCheck = computed.energy_kcal ?? n(p100.energy_kcal)
    const isWater = /\b(water|sparkling water|mineral water|ماء)\b/.test(productNameRaw)
      && (energyForWaterCheck === null || energyForWaterCheck === 0)

    const nutrition = {
      energy_kcal: reconcile(n(p100.energy_kcal), computed.energy_kcal),
      sugars_g: reconcile(n(p100.sugars_g), computed.sugars_g),
      saturated_fat_g: reconcile(n(p100.saturated_fat_g), computed.saturated_fat_g),
      sodium_mg: reconcile(n(p100.sodium_mg), computed.sodium_mg),
      protein_g: reconcile(n(p100.protein_g), computed.protein_g),
      fiber_g: reconcile(n(p100.fiber_g), computed.fiber_g),
      fruits_veg_percent: n(parsed.fruits_veg_percent),
      ...(isBeverage ? { is_beverage: true as const } : {}),
      ...(isWater ? { is_water: true as const } : {}),
    }

    const filled = [nutrition.energy_kcal, nutrition.sugars_g, nutrition.saturated_fat_g, nutrition.sodium_mg, nutrition.protein_g, nutrition.fiber_g].filter(v => v !== null).length
    if (filled < 2) return NextResponse.json({ detected: false })

    const serving_nutrition = {
      energy_kcal: energyServing,
      sugars_g: n(ps.sugars_g),
      saturated_fat_g: n(ps.saturated_fat_g),
      sodium_mg: sodiumServing,
      protein_g: n(ps.protein_g),
      fiber_g: n(ps.fiber_g),
      fruits_veg_percent: n(parsed.fruits_veg_percent),
    }

    let productName: string | null = parsed.product_name
    if (!productName || productName === 'null' || productName === 'Unknown Product') {
      productName = null
    }

    return NextResponse.json({
      detected: true,
      product_name: productName, // may still be null — that's fine, stage 1 already provided one
      nutrition,
      serving_nutrition,
      serving_size_g: parsed.serving_size_g ?? null,
      serving_size_ml: parsed.serving_size_ml ?? null,
      source: 'vision',
    })
  } catch (error) {
    console.error('Auto-detect error:', error)
    return NextResponse.json({ detected: false })
  }
}
