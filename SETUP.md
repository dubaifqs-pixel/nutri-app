# Nutri — Developer Setup Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- A Claude Code account (sign up at claude.ai)
- Access to the GitHub repo: https://github.com/dubaifqs-pixel/nutri-app

---

## Setup for Mohammad (MBinHaider)

Your code is already at `~/Desktop/Work/DFQS/dfqs/`. Just make sure it's connected to the right repo:

```bash
cd ~/Desktop/Work/DFQS/dfqs
git remote set-url origin https://github.com/dubaifqs-pixel/nutri-app.git
git pull
npm install
```

Create `.env.local` if missing:
```bash
echo "GEMINI_API_KEY=AIzaSyAewvSEFVVM6nIpXkhwS-xDutW1NMwqtME" > .env.local
```

Start working:
```bash
claude
```

---

## Setup for Nada

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

---

## Daily Workflow (Both)

### Before starting work:
```bash
cd nutri-app          # or ~/Desktop/Work/DFQS/dfqs for Mohammad
git pull              # get latest changes from the other person
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
# Fix the conflicted files
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
- **Mohammad:** Backend, API routes, AI prompts, data layer, deployment
- **Nada:** Frontend, design, UI components, landing page, content

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local dev server (http://localhost:3000) |
| `npm run build` | Build for production (check for errors) |
| `npx vitest run` | Run tests |
| `git status` | See what files changed |
| `git log --oneline -10` | See recent commits |
| `vercel --prod` | Manual deploy to Vercel |

---

## Project Structure

```
nutri-app/
├── app/                  ← Pages and API routes
│   ├── page.tsx          ← Home screen
│   ├── scan/             ← Camera scanning
│   ├── result/           ← Grade result
│   ├── chat/             ← AI chat
│   ├── alternatives/     ← Healthier options
│   ├── compare/          ← Product comparison
│   ├── browse/           ← Category browser
│   ├── landing/          ← Stakeholder landing page
│   └── api/              ← Backend API routes
├── components/           ← Reusable UI components
├── lib/                  ← Business logic
│   ├── scoring.ts        ← Nutri-Score algorithm
│   ├── gemini.ts         ← AI prompts
│   ├── food-api.ts       ← Data layer (AI + databases)
│   ├── product-images.ts ← Image library mapping
│   └── types.ts          ← TypeScript types
├── public/products/      ← Product images (transparent PNGs)
├── CLAUDE.md             ← Project context for Claude Code
└── .env.local            ← API keys (not in git)
```

---

## Links

- **Live app:** https://nutri-app-mocha.vercel.app
- **GitHub:** https://github.com/dubaifqs-pixel/nutri-app
- **Vercel dashboard:** https://vercel.com/dubaifqs-pixels-projects/nutri-app
