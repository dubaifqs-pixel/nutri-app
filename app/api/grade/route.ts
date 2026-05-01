import { NextRequest, NextResponse } from 'next/server'
import { calculateGrade } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    const { nutrition } = await request.json()
    if (!nutrition) {
      return NextResponse.json({ error: 'No nutrition data provided' }, { status: 400 })
    }
    const result = calculateGrade(nutrition)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Grade calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate grade' }, { status: 500 })
  }
}
