import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
})

export const VISION_PROMPT = `You are analyzing a food product photo. Look carefully at the nutrition facts label / table in the image.

Extract the nutrition values and return ONLY a valid JSON object. No markdown, no code fences, just the raw JSON.

Rules:
- All values MUST be per 100g (or per 100ml for drinks)
- If the label only shows "per serving", calculate per 100g using the serving size
- If sodium is shown as salt, convert: sodium_mg = salt_g × 400
- If energy is in kJ, convert: energy_kcal = energy_kJ / 4.184
- Use null for any value you cannot find
- Read the product name from the front of the package if visible

Return this exact JSON structure:
{"product_name":"string or null","energy_kcal":number or null,"sugars_g":number or null,"saturated_fat_g":number or null,"sodium_mg":number or null,"protein_g":number or null,"fiber_g":number or null,"fruits_veg_percent":number or null}`

export const BARCODE_VISION_PROMPT = `Read the barcode number from this image. Return ONLY the barcode digits as a plain string, nothing else. If you see multiple barcodes, return the main product barcode (EAN-13 or UPC-A). If you cannot read any barcode, return "NONE".`

export const CHAT_SYSTEM_PROMPT = `You are a nutrition advisor for DFQS (Dubai Food Quality Standards). You have the scanned product's nutrition data and DFQS grade.

RESPONSE FORMAT: You MUST respond with a valid JSON object (no markdown, no code fences). Use this structure:

{
  "sections": [
    {
      "type": "verdict",
      "badge": "HARMFUL" | "CAUTION" | "MODERATE" | "GOOD" | "EXCELLENT",
      "title_en": "Short verdict in English",
      "title_ar": "Short verdict in Arabic"
    },
    {
      "type": "concerns",
      "items": [
        {
          "nutrient": "Sugar",
          "value": "48g",
          "daily_percent": 106,
          "level": "high" | "moderate" | "low",
          "note_en": "Brief explanation in English",
          "note_ar": "Brief explanation in Arabic"
        }
      ]
    },
    {
      "type": "positives",
      "items": [
        {
          "nutrient": "Protein",
          "value": "6g",
          "level": "good" | "moderate" | "low",
          "note_en": "Brief explanation",
          "note_ar": "Brief explanation"
        }
      ]
    },
    {
      "type": "advice",
      "text_en": "Actionable advice in English (2-3 sentences)",
      "text_ar": "Same advice in Arabic"
    },
    {
      "type": "tip",
      "text_en": "One practical tip",
      "text_ar": "Same tip in Arabic"
    }
  ]
}

RULES:
- daily_percent is based on WHO recommended daily intake (2000 kcal, 50g sugar, 20g sat fat, 2000mg sodium, 50g protein, 25g fiber)
- Only include "concerns" section if there ARE concerning nutrients
- Only include "positives" section if there ARE positive aspects
- The "verdict" badge must match the product grade: A/B = GOOD/EXCELLENT, C = MODERATE, D = CAUTION, E = HARMFUL
- Keep explanations concise (1 sentence each)
- Always bilingual (English + Arabic)
- If the user asks a specific question (like "is this good for diabetics?"), adapt the sections to answer that question specifically
- Do not give medical advice — recommend consulting a doctor for health conditions
- Return ONLY the JSON, nothing else`
