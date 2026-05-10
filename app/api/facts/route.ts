import { geminiFlash } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { products } = await req.json() as { products: string[] }

    if (!products?.length) {
      return NextResponse.json({ error: 'No products' }, { status: 400 })
    }

    const prompt = `Give me one short nutrition fact (MAXIMUM 5 words) about each food product. Focus on key nutritional info like calories, vitamins, minerals, sugar, protein content. Keep it very short. Return ONLY valid JSON object mapping product name to fact string, no markdown.

Products: ${products.join(', ')}`

    const result = await geminiFlash.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim()
    const facts = JSON.parse(text)

    return NextResponse.json({ facts })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate facts' }, { status: 500 })
  }
}
