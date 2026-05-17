// Adapter: turn the project's existing DEMO_PRODUCTS / scanned products into the
// design's HeroProduct shape. Keeps the real Nutri-Score logic + i18n + history
// flows intact while letting the new design's components render against them.

import type { Grade, NutritionData } from './types'
import { calculateGrade } from './scoring'
import { getProductImage } from './product-images'
import type { HeroProduct, HeroChip, ChipKind } from '@/components/v2/types'

const BRAND_MAP: Record<string, string> = {
  'Al Ain Full Cream Milk': 'Al Ain',
  'Coca-Cola Original': 'Coca-Cola',
  'KitKat 4 Finger': 'KitKat',
  "Kellogg's Corn Flakes": "Kellogg's",
  'Rani Orange Juice': 'Rani',
  "Lay's Classic Chips": "Lay's",
}
const BRAND_AR: Record<string, string> = {
  'Al Ain Full Cream Milk': 'العين',
  'Coca-Cola Original': 'كوكا كولا',
  'KitKat 4 Finger': 'كيت كات',
  "Kellogg's Corn Flakes": 'كيلوغز',
  'Rani Orange Juice': 'راني',
  "Lay's Classic Chips": 'ليز',
}
const NAME_AR: Record<string, string> = {
  'Al Ain Full Cream Milk': 'حليب العين كامل الدسم',
  'Coca-Cola Original': 'كوكا كولا الأصلية',
  'KitKat 4 Finger': 'كيت كات ٤ أصابع',
  "Kellogg's Corn Flakes": 'رقائق الذرة كيلوغز',
  'Rani Orange Juice': 'عصير راني برتقال',
  "Lay's Classic Chips": 'رقائق ليز الكلاسيكية',
}
const TAKE_EN: Record<string, string> = {
  'Al Ain Full Cream Milk': 'Pure dairy. Nothing else.',
  'Coca-Cola Original': '10 sugar cubes. Per can.',
  'KitKat 4 Finger': '218 calories. Treat, not snack.',
  "Kellogg's Corn Flakes": 'Fortified iron & vitamins.',
  'Rani Orange Juice': 'Real fruit pieces.',
  "Lay's Classic Chips": 'Salt-loaded. Treat, not snack.',
}
const TAKE_AR: Record<string, string> = {
  'Al Ain Full Cream Milk': 'حليب صافٍ. لا غير.',
  'Coca-Cola Original': '١٠ مكعّبات سكر في العلبة.',
  'KitKat 4 Finger': '٢١٨ سعرة لكل قطعة.',
  "Kellogg's Corn Flakes": 'مدعّم بالحديد والفيتامينات.',
  'Rani Orange Juice': 'قطع فاكهة حقيقية.',
  "Lay's Classic Chips": 'صوديوم مرتفع — ليس وجبة خفيفة.',
}
const SIZE_EN: Record<string, string> = {
  'Al Ain Full Cream Milk': '1 L · BOTTLE',
  'Coca-Cola Original': '330 ML · CAN',
  'KitKat 4 Finger': '45 G · BAR',
  "Kellogg's Corn Flakes": '500 G · BOX',
  'Rani Orange Juice': '240 ML · PACK',
  "Lay's Classic Chips": '40 G · BAG',
}
const SIZE_AR: Record<string, string> = {
  'Al Ain Full Cream Milk': '١ لتر · زجاجة',
  'Coca-Cola Original': '٣٣٠ مل · علبة',
  'KitKat 4 Finger': '٤٥ غ · لوح',
  "Kellogg's Corn Flakes": '٥٠٠ غ · علبة',
  'Rani Orange Juice': '٢٤٠ مل · عبوة',
  "Lay's Classic Chips": '٤٠ غ · كيس',
}

const BG_BY_NAME: { match: RegExp; bg: HeroProduct['bg'] }[] = [
  { match: /(milk|laban|cream|yogurt|cheese|butter)/i, bg: 'milk' },
  { match: /(juice|orange|rani|tropicana|vimto|tang)/i, bg: 'orange' },
  { match: /(green juice|press|smoothie)/i, bg: 'green' },
  { match: /(mango|peach)/i, bg: 'mango' },
  { match: /(cola|coke|pepsi)/i, bg: 'rose' },
  { match: /(7\s*up|sprite|soda|water|sparkling)/i, bg: 'lime' },
]

function bgFor(name: string): HeroProduct['bg'] {
  for (const { match, bg } of BG_BY_NAME) if (match.test(name)) return bg
  return 'cream'
}

function brandOf(name: string, lang: 'en' | 'ar'): string {
  if (lang === 'ar' && BRAND_AR[name]) return BRAND_AR[name]
  return BRAND_MAP[name] || name.split(' ')[0]
}

function chipsFor(n: NutritionData, lang: 'en' | 'ar'): HeroChip[] {
  const out: { kind: ChipKind; text: string }[] = []
  if (n.sugars_g !== null) {
    if (n.sugars_g > 15) out.push({ kind: 'bad', text: lang === 'ar' ? `${Math.round(n.sugars_g)}غ سكر` : `${Math.round(n.sugars_g)}g sugar` })
    else if (n.sugars_g <= 5) out.push({ kind: 'pos', text: lang === 'ar' ? 'سكر منخفض' : 'Low sugar' })
  }
  if (n.protein_g !== null && n.protein_g > 5 && out.length < 2) {
    out.push({ kind: 'pos', text: lang === 'ar' ? `${Math.round(n.protein_g)}غ بروتين` : `${Math.round(n.protein_g)}g protein` })
  }
  if (n.sodium_mg !== null && n.sodium_mg > 500 && out.length < 2) {
    out.push({ kind: 'warn', text: lang === 'ar' ? 'صوديوم مرتفع' : 'High sodium' })
  }
  if (n.saturated_fat_g !== null && n.saturated_fat_g > 5 && out.length < 2) {
    out.push({ kind: 'warn', text: lang === 'ar' ? 'دهون مرتفعة' : 'High fat' })
  }
  if (n.fiber_g !== null && n.fiber_g > 3 && out.length < 2) {
    out.push({ kind: 'pos', text: lang === 'ar' ? `${Math.round(n.fiber_g)}غ ألياف` : `${Math.round(n.fiber_g)}g fiber` })
  }
  if (out.length === 0) out.push({ kind: 'neutral', text: lang === 'ar' ? 'تم المسح' : 'Scanned' })
  return out.slice(0, 2)
}

// Convert grade letter + Nutri-Score raw points to a 0-100 friendly score for
// the design's "82 / 100" pill. Lower raw points = higher friendly score.
function toFriendlyScore(grade: Grade, rawScore: number): number {
  // raw negative-only scores: -15 = A best, +40 = E worst. Map to 0-100.
  const clamped = Math.max(-15, Math.min(40, rawScore))
  return Math.round(100 - ((clamped + 15) / 55) * 100)
}

export function toHero(
  product: { product_name: string; nutrition: NutritionData; image_url?: string | null },
  lang: 'en' | 'ar',
): HeroProduct {
  const grade = calculateGrade(product.nutrition)
  return {
    id: product.product_name.toLowerCase().replace(/\s+/g, '-'),
    product_name: lang === 'ar' && NAME_AR[product.product_name]
      ? NAME_AR[product.product_name]
      : product.product_name,
    brand: brandOf(product.product_name, lang),
    take: (lang === 'ar' ? TAKE_AR : TAKE_EN)[product.product_name] || (lang === 'ar' ? 'تم المسح والتحقق' : 'Scanned & verified'),
    size_label: (lang === 'ar' ? SIZE_AR : SIZE_EN)[product.product_name] || (lang === 'ar' ? 'منتج' : 'PRODUCT'),
    grade: grade.grade,
    score: toFriendlyScore(grade.grade, grade.score),
    image: product.image_url || getProductImage(product.product_name, grade.grade),
    bg: bgFor(product.product_name),
    chips: chipsFor(product.nutrition, lang),
    nutrition: product.nutrition,
  }
}
