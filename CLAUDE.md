# Nutri — AI Food Quality Scanner

## Project
- **Name:** nutri
- **Tagline:** "Eat smarter."
- **Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Gemini 2.5 Flash API
- **Deployed:** https://nutri-app-mocha.vercel.app
- **Repo:** https://github.com/dubaifqs-pixel/nutri-app

## Design System
- **Background:** #F2F0ED (warm gray)
- **Cards:** #FFFFFF, border-radius 28px, shadow 0 2px 8px rgba(0,0,0,0.04)
- **Text:** #1A1A1A (primary), #8A8A8A (secondary)
- **Accent:** #4CAF50 (green, scan button only)
- **Font:** System font (-apple-system, SF Pro, Segoe UI)
- **Icons:** Black outlined, stroke-width 1.5
- **Style:** Minimal, monochrome + green. Inspired by Swipe Drinks app.
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
- `lib/demo-products.ts` — 53 curated UAE products
- `lib/types.ts` — TypeScript types, grade colors/gradients
- `lib/history.ts` — Local scan history

## Product Images
- Located in `/public/products/`
- Generated with Recraft AI (transparent backgrounds)
- Category images: `cat-chocolate.png`, `cat-milk.png`, etc.

## Environment Variables
- `GEMINI_API_KEY` — Google Gemini API key (required)

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
