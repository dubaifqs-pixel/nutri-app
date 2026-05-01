import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
})

export const VISION_PROMPT = `Extract all nutrition facts from this food label image. Return ONLY valid JSON with these fields (use null if not visible):
{
  "product_name": "string or null",
  "energy_kcal": number or null,
  "sugars_g": number or null,
  "saturated_fat_g": number or null,
  "sodium_mg": number or null,
  "protein_g": number or null,
  "fiber_g": number or null,
  "fruits_veg_percent": number or null
}
All values must be per 100g. If the label shows per serving, convert to per 100g using the serving size. Return ONLY the JSON, no markdown.`

export const CHAT_SYSTEM_PROMPT = `You are a nutrition advisor for DFQS (Dubai Food Quality Standards). You have the scanned product's nutrition data and grade. Answer questions about this product's health impact, suitability for dietary conditions (diabetes, heart disease, weight loss, children), and suggest alternatives. Respond in the same language the user writes in (Arabic or English). Be concise, evidence-based, and helpful. Do not give medical advice — recommend consulting a doctor for health conditions.`
