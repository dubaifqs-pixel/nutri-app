import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { barcode } = await request.json()
    if (!barcode) {
      return NextResponse.json({ error: 'No barcode provided' }, { status: 400 })
    }
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { headers: { 'User-Agent': 'DFQS-PoC/1.0' } }
    )
    if (!response.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const data = await response.json()
    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const p = data.product
    const nutriments = p.nutriments || {}
    return NextResponse.json({
      product_name: p.product_name || p.product_name_en || 'Unknown Product',
      nutrition: {
        energy_kcal: nutriments['energy-kcal_100g'] ?? null,
        sugars_g: nutriments['sugars_100g'] ?? null,
        saturated_fat_g: nutriments['saturated-fat_100g'] ?? null,
        sodium_mg: nutriments['sodium_100g'] != null ? nutriments['sodium_100g'] * 1000 : null,
        protein_g: nutriments['proteins_100g'] ?? null,
        fiber_g: nutriments['fiber_100g'] ?? null,
        fruits_veg_percent: null,
      },
      image_url: p.image_url || null,
      barcode,
      source: 'barcode',
    })
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json({ error: 'Failed to look up product' }, { status: 500 })
  }
}
