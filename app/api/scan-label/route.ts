import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash, VISION_PROMPT } from '@/lib/gemini'

type Num = number | null

interface PerServing {
  energy_kcal: Num
  energy_kj: Num
  sugars_g: Num
  saturated_fat_g: Num
  sodium_mg: Num
  salt_g: Num
  protein_g: Num
  fiber_g: Num
}

interface Per100g {
  energy_kcal: Num
  sugars_g: Num
  saturated_fat_g: Num
  sodium_mg: Num
  protein_g: Num
  fiber_g: Num
}

interface VisionPayload {
  product_name: string | null
  serving_size_g: Num
  serving_size_ml: Num
  per_serving: Partial<PerServing>
  per_100g: Partial<Per100g>
  fruits_veg_percent: Num
}

function n(x: unknown): Num {
  if (typeof x === 'number' && Number.isFinite(x)) return x
  if (typeof x === 'string') {
    const v = Number(x.replace(/[^\d.\-]/g, ''))
    return Number.isFinite(v) ? v : null
  }
  return null
}

// Compute per-100g from per-serving and serving size. Returns null if either is missing.
function to100g(perServing: Num, servingSize: Num): Num {
  if (perServing === null || servingSize === null || servingSize <= 0) return null
  return (perServing / servingSize) * 100
}

// Pick the most reliable per-100g value:
// - If only Gemini's per-100g is present, use it.
// - If only per-serving is present, compute from serving size.
// - If both are present and agree within 8%, prefer the computed value (per-serving is read first-hand).
// - If they disagree by more than 8%, prefer the COMPUTED value (per-serving × 100/serving_size)
//   because the per-serving reading is the source of truth on the label.
function reconcile(per100: Num, computed: Num): Num {
  if (per100 === null && computed === null) return null
  if (computed !== null) return computed
  return per100
}

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

    let parsed: VisionPayload
    try {
      parsed = JSON.parse(jsonMatch[0]) as VisionPayload
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from vision model' }, { status: 422 })
    }

    // Normalize all numbers.
    const ps: PerServing = {
      energy_kcal: n(parsed.per_serving?.energy_kcal),
      energy_kj: n(parsed.per_serving?.energy_kj),
      sugars_g: n(parsed.per_serving?.sugars_g),
      saturated_fat_g: n(parsed.per_serving?.saturated_fat_g),
      sodium_mg: n(parsed.per_serving?.sodium_mg),
      salt_g: n(parsed.per_serving?.salt_g),
      protein_g: n(parsed.per_serving?.protein_g),
      fiber_g: n(parsed.per_serving?.fiber_g),
    }
    const p100: Per100g = {
      energy_kcal: n(parsed.per_100g?.energy_kcal),
      sugars_g: n(parsed.per_100g?.sugars_g),
      saturated_fat_g: n(parsed.per_100g?.saturated_fat_g),
      sodium_mg: n(parsed.per_100g?.sodium_mg),
      protein_g: n(parsed.per_100g?.protein_g),
      fiber_g: n(parsed.per_100g?.fiber_g),
    }

    // Derive energy_kcal from kJ if the label only printed kJ.
    if (ps.energy_kcal === null && ps.energy_kj !== null) {
      ps.energy_kcal = ps.energy_kj / 4.184
    }
    // Derive sodium from salt: sodium_mg = salt_g × 400.
    if (ps.sodium_mg === null && ps.salt_g !== null) {
      ps.sodium_mg = ps.salt_g * 400
    }

    const serving = parsed.serving_size_g ?? parsed.serving_size_ml ?? null

    // Per-100g values: prefer computed-from-per-serving (more reliable than label's per-100g column,
    // and serves as a sanity check when the label-printed per-100g is missing).
    const computed: Per100g = {
      energy_kcal: to100g(ps.energy_kcal, serving),
      sugars_g: to100g(ps.sugars_g, serving),
      saturated_fat_g: to100g(ps.saturated_fat_g, serving),
      sodium_mg: to100g(ps.sodium_mg, serving),
      protein_g: to100g(ps.protein_g, serving),
      fiber_g: to100g(ps.fiber_g, serving),
    }

    // Beverage detection: when the label gives a serving in ml (volume) rather
    // than g (mass), or the product name is clearly a drink, the Nutri-Score
    // beverage scale should kick in. Front-of-pack scans don't include enough
    // signal otherwise.
    const productNameRaw = (parsed.product_name || '').toLowerCase()
    const beverageNameSignal = /\b(juice|drink|soda|cola|coke|pepsi|sprite|fanta|mirinda|7up|red bull|monster|rani|vimto|tang|lemonade|water|milk drink|beverage|smoothie|tea|coffee latte|iced tea|nectar|kombucha|laban|buttermilk|cordial|squash|عصير|مشروب|ماء|كولا|بيبسي)\b/.test(productNameRaw)
    const isBeverage = parsed.serving_size_ml !== null || beverageNameSignal
    const energyForWaterCheck = computed.energy_kcal ?? p100.energy_kcal ?? null
    const isWater = /\b(water|sparkling water|mineral water|ماء)\b/.test(productNameRaw)
      && (energyForWaterCheck === null || energyForWaterCheck === 0)

    const nutrition = {
      energy_kcal: reconcile(p100.energy_kcal, computed.energy_kcal),
      sugars_g: reconcile(p100.sugars_g, computed.sugars_g),
      saturated_fat_g: reconcile(p100.saturated_fat_g, computed.saturated_fat_g),
      sodium_mg: reconcile(p100.sodium_mg, computed.sodium_mg),
      protein_g: reconcile(p100.protein_g, computed.protein_g),
      fiber_g: reconcile(p100.fiber_g, computed.fiber_g),
      fruits_veg_percent: n(parsed.fruits_veg_percent),
      ...(isBeverage ? { is_beverage: true as const } : {}),
      ...(isWater ? { is_water: true as const } : {}),
    }

    // Product name — only use text actually read off the package.
    let productName: string | null = parsed.product_name
    if (!productName || productName === 'null' || productName === 'Unknown Product') {
      productName = null
    }

    // Per-serving values shaped to the NutritionData type the UI expects.
    const serving_nutrition = {
      energy_kcal: ps.energy_kcal,
      sugars_g: ps.sugars_g,
      saturated_fat_g: ps.saturated_fat_g,
      sodium_mg: ps.sodium_mg,
      protein_g: ps.protein_g,
      fiber_g: ps.fiber_g,
      fruits_veg_percent: n(parsed.fruits_veg_percent),
    }

    return NextResponse.json({
      product_name: productName || 'Scanned Product',
      nutrition, // per 100g — required for Nutri-Score
      serving_nutrition, // exact values printed on the label
      serving_size_g: parsed.serving_size_g ?? null,
      serving_size_ml: parsed.serving_size_ml ?? null,
      per_serving: ps,
      source: 'vision',
    })
  } catch (error) {
    console.error('Scan label error:', error)
    return NextResponse.json({ error: 'Failed to analyze image. Please try again.' }, { status: 500 })
  }
}
