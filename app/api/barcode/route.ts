import { NextRequest, NextResponse } from 'next/server'
import { lookupBarcode } from '@/lib/food-api'

export async function POST(request: NextRequest) {
  try {
    const { barcode } = await request.json()
    if (!barcode) {
      return NextResponse.json({ error: 'No barcode provided' }, { status: 400 })
    }

    const result = await lookupBarcode(barcode)
    if (!result) {
      // Tell the client this is a known-unknown so the UI can offer a label-scan fallback.
      return NextResponse.json({
        error: 'Product not in our databases',
        reason: 'unknown_barcode',
        barcode,
      }, { status: 404 })
    }

    return NextResponse.json({
      product_name: result.product_name,
      nutrition: result.nutrition,
      image_url: result.image_url,
      barcode,
      source: 'barcode',
      data_source: result.data_source || (result.source === 'ai_knowledge' ? 'AI Knowledge' : 'Open Food Facts'),
      confidence: result.confidence,
    })
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json({ error: 'Failed to look up product' }, { status: 500 })
  }
}
