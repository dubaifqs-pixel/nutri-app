# Nutri — Developer Setup Guide

## Team
- **Mohammad (MBinHaider)** — GitHub collaborator, backend/AI/deployment
- **Nada (dubaifqs-pixel)** — Repo owner, frontend/design/content

## Prerequisites
- Node.js 18+ installed
- Git installed
- A Claude Code account (sign up at claude.ai)
- GitHub access to: https://github.com/dubaifqs-pixel/nutri-app

---

## Setup for Mohammad (MBinHaider)

You are a collaborator on Nada's repo. Your code is at `~/Desktop/Work/DFQS/dfqs/`.

### First time (already done):
```bash
cd ~/Desktop/Work/DFQS/dfqs
git remote set-url origin https://github.com/dubaifqs-pixel/nutri-app.git
gh auth login          # login as MBinHaider
gh auth setup-git      # configure git credentials
git pull
npm install
```

### Create `.env.local` if missing:
```bash
echo "GEMINI_API_KEY=AIzaSyAewvSEFVVM6nIpXkhwS-xDutW1NMwqtME" > .env.local
```

### Start working:
```bash
cd ~/Desktop/Work/DFQS/dfqs
git pull
claude
```

---

## Setup for Nada (dubaifqs-pixel)

You own the repo. This is your main project.

### One-time setup (do once):

**1. Install Claude Code:**
```bash
npm install -g @anthropic-ai/claude-code
```

**2. Login to Claude Code:**
```bash
claude login
```
Follow the prompts — use your own Anthropic/Claude account.

**3. Clone the project:**
```bash
git clone https://github.com/dubaifqs-pixel/nutri-app.git
cd nutri-app
npm install
```

**4. Create environment file:**
```bash
echo "GEMINI_API_KEY=AIzaSyAewvSEFVVM6nIpXkhwS-xDutW1NMwqtME" > .env.local
```

**5. Setup your Git identity:**
```bash
git config user.name "Nada"
git config user.email "your-email@example.com"
```

**6. Verify everything works:**
```bash
npm run dev
```
Open http://localhost:3000 — you should see the Nutri app.

**7. Run tests:**
```bash
npx vitest run
```
All 10 tests should pass.

### Start working:
```bash
cd nutri-app
git pull
claude
```

---

## Accounts & Access

| Service | Mohammad (MBinHaider) | Nada (dubaifqs-pixel) |
|---------|----------------------|----------------------|
| **GitHub** | Collaborator (push access) | Owner |
| **Vercel** | Own account (dfqs.vercel.app) | Own account (nutri-app-mocha.vercel.app) |
| **Claude Code** | Own Anthropic account | Own Anthropic account |
| **Gemini API** | Shared key | Shared key |

---

## Daily Workflow (Both)

### Before starting work:
```bash
cd nutri-app          # or ~/Desktop/Work/DFQS/dfqs for Mohammad
git pull              # ALWAYS pull first to get each other's changes
claude                # start Claude Code
```

### While working:
- Tell Claude what you want to build or fix
- Claude reads CLAUDE.md automatically to understand the project
- Test locally with `npm run dev`

### When done:
```bash
git add -A
git commit -m "describe what you changed"
git push
```
Vercel auto-deploys to https://nutri-app-mocha.vercel.app on every push.

### If you get merge conflicts:
```bash
git pull              # this might show conflicts
# Fix the conflicted files (or ask Claude to help)
git add -A
git commit -m "resolve merge conflict"
git push
```

---

## How to Avoid Conflicts

| Rule | Why |
|------|-----|
| Always `git pull` before starting | Get each other's latest code |
| Work on different features | Don't edit the same file at the same time |
| Commit and push often | Small changes = fewer conflicts |
| Communicate | Tell each other what you're working on |

### Suggested Task Split:
- **Mohammad:** Backend, API routes, AI prompts, data layer, scoring algorithm, deployment
- **Nada:** Frontend, design, UI components, landing page, content, product images

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local dev server (http://localhost:3000) |
| `npm run build` | Build for production (check for errors) |
| `npx vitest run` | Run tests |
| `git status` | See what files changed |
| `git log --oneline -10` | See recent commits |
| `git pull` | Get latest changes |
| `git push` | Push your changes |
| `vercel --prod` | Manual deploy to Vercel |

---

## Project Structure

```
nutri-app/
├── app/                  <- Pages and API routes
|   ├── page.tsx          <- Home screen
|   ├── scan/             <- Camera scanning
|   ├── result/           <- Grade result
|   ├── chat/             <- AI chat
|   ├── alternatives/     <- Healthier options
|   ├── compare/          <- Product comparison
|   ├── browse/           <- Category browser
|   ├── landing/          <- Stakeholder landing page
|   └── api/              <- Backend API routes
|       ├── scan-label/   <- Gemini Vision (read nutrition labels)
|       ├── scan-barcode/ <- Gemini Vision (read barcodes)
|       ├── barcode/      <- Open Food Facts / AI lookup
|       ├── grade/        <- Nutri-Score calculation
|       ├── chat/         <- AI chat with product context
|       ├── recommend/    <- Find healthier alternatives
|       ├── browse/       <- Category product search
|       └── auto-detect/  <- Auto-detect nutrition labels
├── components/           <- Reusable UI components
|   ├── GradeBadge.tsx    <- A-E grade display
|   ├── NutritionBreakdown.tsx <- Nutrient bars
|   ├── Scanner.tsx       <- Camera + auto-detect
|   ├── ChatMessage.tsx   <- Rich AI chat responses
|   └── RecentScans.tsx   <- Tinder-style swipe cards
├── lib/                  <- Business logic
|   ├── scoring.ts        <- Nutri-Score algorithm
|   ├── scoring.test.ts   <- Algorithm tests
|   ├── gemini.ts         <- AI prompts (vision, chat)
|   ├── food-api.ts       <- AI-first data layer
|   ├── product-images.ts <- Category image library
|   ├── demo-products.ts  <- 53 curated UAE products
|   ├── history.ts        <- Local scan history
|   └── types.ts          <- TypeScript types
├── public/products/      <- Product images (transparent PNGs)
├── CLAUDE.md             <- Project context for Claude Code
├── SETUP.md              <- This file
└── .env.local            <- API keys (NOT in git)
```

---

## Links

- **Live app:** https://nutri-app-mocha.vercel.app
- **GitHub:** https://github.com/dubaifqs-pixel/nutri-app
- **Vercel dashboard:** https://vercel.com/dubaifqs-pixels-projects/nutri-app
- **Gemini API console:** https://aistudio.google.com/apikey
- **Recraft AI (product images):** https://www.recraft.ai
