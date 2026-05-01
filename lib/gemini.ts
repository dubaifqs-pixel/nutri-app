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

export const CHAT_SYSTEM_PROMPT = `You are a nutrition advisor for DFQS (Dubai Food Quality Standards). You have the scanned product's nutrition data and grade. Answer questions about this product's health impact, suitability for dietary conditions (diabetes, heart disease, weight loss, children), and suggest alternatives. Respond in the same language the user writes in (Arabic or English). Be concise, evidence-based, and helpful. Do not give medical advice — recommend consulting a doctor for health conditions.`
