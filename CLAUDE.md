# Nutri — AI Food Quality Scanner

## Project
- **Name:** nutri
- **Tagline:** "Eat smarter."
- **Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Gemini 2.5 Flash API
- **Deployed:** https://nutri-app-mocha.vercel.app
- **Repo:** https://github.com/dubaifqs-pixel/nutri-app

## Design System (Swipe Drinks palette)
- **Background:** #F5F4F0 (warm light gray)
- **Cards:** #FFFFFF, border 1px rgba(0,0,0,0.06), border-radius 20px, shadow 0 1px 4px rgba(0,0,0,0.04)
- **Text:** #1A1A1A (primary), #7A7A7A (secondary), #ACACAC (tertiary)
- **Accent (Scan button):** #B6F074 (lime green) with black text — THE signature color
- **Pastel accents:** #FFEC89 (yellow), #DAB8F1 (lavender), #B6E1FA (blue) — used sparingly on quick-action icon backgrounds
- **Dark cards/nav:** #1A1A1A
- **Border:** rgba(0,0,0,0.06)
- **Font:** Nunito (Google Fonts: 400, 500, 600, 700, 800). Headings 700-800, body 400-500, labels 600 uppercase tracking.
- **Icons:** Outlined, stroke-width 1.5, black outlined
- **Bottom nav:** #F5F4F0 bg, center Scan pill is #B6F074 lime green + black text, active icon black, inactive #ACACAC
- **Style:** Very clean, lots of whitespace, no heavy shadows, no gradients on buttons. Light, airy, premium.
- **No emojis** — use SVG icons only.

## Grade Colors
- A: #66BB6A → #2E7D32 (Great)
- B: #8BC34A → #558B2F (Good)
- C: #FFC107 → #F9A825 (Okay)
- D: #FF9800 → #E65100 (Poor)
- E: #F44336 → #C62828 (Bad)

## Key Files
- `lib/scoring.ts` — Nutri-Score algorithm
- `lib/gemini.ts` — AI prompts (vision, chat, auto-detect)
- `lib/food-api.ts` — AI-first data layer (Gemini + USDA + Open Food Facts)
- `lib/product-images.ts` — Category image library mapping
- `lib/demo-products.ts` — 69 curated UAE products across 8 categories
- `lib/types.ts` — TypeScript types, grade colors/gradients
- `lib/history.ts` — Local scan history

## Product Images
- Located in `/public/products/`
- Generated with Recraft AI (transparent backgrounds)
- Category images: `cat-chocolate.png`, `cat-milk.png`, etc.

## Nutrition Data Sources

The 69 demo products in `lib/demo-products.ts` come from a mix of sources.
Coverage is uneven by region — verified 2026-05-08:

| Source | UAE-local brands | Global packaged brands | Raw produce / meats | API endpoint |
|---|---|---|---|---|
| **USDA FoodData Central** | none | partial | strong (authoritative) | `api.nal.usda.gov/fdc/v1` |
| **Open Food Facts** | very thin | strong | partial | `world.openfoodfacts.org/cgi/search.pl` |
| **Product label (manual)** | strong | strong | strong | n/a |

What this means in practice:
- **Al Ain, Almarai, Al Rawabi, Al Islami, Al Kabeer, Wooden Bakery, Tanmiah, Al Rawdah, etc.** — the only reliable verification is the printed nutrition label on the package. Neither USDA nor OFF has these.
- **Coca-Cola, KitKat, Lay's, Pringles, Lurpak, Quaker, Weetabix, etc.** — Open Food Facts has good coverage. Cross-check by barcode.
- **Raw produce, raw meats, generic dairy** — USDA FDC is authoritative.
- Products that have been verified against an external source carry a `// Source: ...` comment with the FDC ID or OFF barcode. Anything without that comment is a label-based estimate.

When adding new UAE-branded products, prefer pulling values from the actual package and add a `// Source: package label` comment so future audits know the provenance.

## Environment Variables
- `GEMINI_API_KEY` — Google Gemini API key (required)
- `USDA_API_KEY` — USDA FoodData Central API key (optional, falls back to `DEMO_KEY` with 30 req/hour limit). Sign up at https://fdc.nal.usda.gov/api-key-signup.html

## Commands
- `npm run dev` — local development
- `npm run build` — production build
- `npx vitest run` — run tests
- `vercel --prod` — deploy to Vercel

## Conventions
- English-first, LTR layout
- AI chat returns structured JSON (rich cards, badges, bilingual EN/AR)
- All API routes in `/app/api/`
- Product cards use Tinder-style swipe on home page
