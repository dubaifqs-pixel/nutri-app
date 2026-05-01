import { NextRequest, NextResponse } from 'next/server'
import { geminiFlash, CHAT_SYSTEM_PROMPT } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { message, product_context } = await request.json()
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }
    const contextPrompt = product_context
      ? `\n\nProduct context:\nName: ${product_context.product_name}\nGrade: ${product_context.grade} (Score: ${product_context.score})\nNutrition per 100g: ${JSON.stringify(product_context.nutrition)}`
      : ''
    const result = await geminiFlash.generateContent(
      `${CHAT_SYSTEM_PROMPT}${contextPrompt}\n\nUser question: ${message}`
    )
    return NextResponse.json({ response: result.response.text() })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
