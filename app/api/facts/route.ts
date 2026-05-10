import { geminiFlash } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { products } = await req.json() as { products: string[] }

    if (!products?.length) {
      return NextResponse.json({ error: 'No products' }, { status: 400 })
    }

    const prompt = `Give me one short fun fact (under 8 words) about each of these food products. Make them interesting, surprising, or historical — NOT about nutrition or health. Return ONLY valid JSON object mapping product name to fact string, no markdown.

Products: ${products.join(', ')}`

    const result = await geminiFlash.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    const facts = JSON.parse(text)

    return NextResponse.json({ facts })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate facts' }, { status: 500 })
  }
}
