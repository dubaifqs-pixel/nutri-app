import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash, BARCODE_VISION_PROMPT } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const result = await geminiFlash.generateContent([
      BARCODE_VISION_PROMPT,
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
    ])
    const barcode = result.response.text().trim().replace(/\D/g, '')
    if (!barcode || barcode === 'NONE' || barcode.length < 8) {
      return NextResponse.json({ error: 'Could not read barcode from image' }, { status: 422 })
    }
    return NextResponse.json({ barcode })
  } catch (error) {
    console.error('Scan barcode error:', error)
    return NextResponse.json({ error: 'Failed to read barcode' }, { status: 500 })
  }
}
