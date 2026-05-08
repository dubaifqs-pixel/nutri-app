# Home Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scrollable home screen with a single-screen green grid layout — no scrolling, everything visible at once.

**Architecture:** Replace `app/page.tsx` entirely with the new layout. Extract a lightweight `RecentPills` component from the existing `RecentScans` logic to render compact grade pills (no swipe cards). Bottom nav and routing stay unchanged.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, existing `lib/history.ts` and `lib/types.ts`

---

### Task 1: Create RecentPills component

**Files:**
- Create: `components/RecentPills.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { getHistory, type HistoryEntry } from '@/lib/history'
import { GRADE_COLORS, type Grade } from '@/lib/types'

export default function RecentPills() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(getHistory().slice(0, 3))
  }, [])

  if (entries.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-5 pb-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-white/70 mr-1 whitespace-nowrap">
        Recent
      </span>
      {entries.map((entry, i) => (
        <div
          key={`${entry.scanned_at}-${i}`}
          className="flex items-center gap-1.5 rounded-full px-2 py-1"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: GRADE_COLORS[entry.grade as Grade] }}
          />
          <span className="text-[9px] font-medium text-white max-w-[48px] overflow-hidden text-ellipsis whitespace-nowrap">
            {entry.product_name}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Check GRADE_COLORS exists in lib/types.ts**

Run: `grep -n "GRADE_COLORS\|GRADE_GRADIENTS" /Users/nada/nutri-app/lib/types.ts`

If only `GRADE_GRADIENTS` exists (not `GRADE_COLORS`), replace `GRADE_COLORS` with `GRADE_GRADIENTS` in the component above. The gradient string still works as a CSS `background` value.

- [ ] **Step 3: Commit**

```bash
cd /Users/nada/nutri-app
git add components/RecentPills.tsx
git commit -m "feat: add RecentPills compact grade pill strip"
```

---

### Task 2: Rewrite app/page.tsx with green grid layout

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace page.tsx entirely**

```tsx
import Link from 'next/link'
import RecentPills from '@/components/RecentPills'

export default function Home() {
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#4CAF50' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-white flex items-center justify-center">
            <img src="/logo.png" alt="nutri" className="w-6 h-6 rounded-lg" />
          </div>
          <div>
            <p className="text-[10px] text-white/70 font-medium">Welcome back</p>
            <h1 className="text-[16px] font-semibold text-white leading-tight">nutri</h1>
          </div>
        </div>
        <Link
          href="/landing"
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
        </Link>
      </div>

      {/* Recent pills */}
      <RecentPills />

      {/* Action grid */}
      <div className="flex-1 grid grid-cols-2 gap-2 px-4 pb-4 min-h-0" style={{ gridTemplateRows: '1fr 1fr 1fr' }}>

        {/* Scan Now — full width */}
        <Link
          href="/scan?mode=label"
          className="col-span-2 flex items-center justify-between px-5 rounded-[22px] transition-opacity active:opacity-90"
          style={{ background: '#1A1A1A' }}
        >
          <div>
            <p className="text-[18px] font-bold text-white">Scan Now</p>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Label or barcode</p>
          </div>
          <div
            className="w-12 h-12 rounded-[15px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </Link>

        {/* Browse */}
        <Link
          href="/browse"
          className="flex flex-col items-start justify-end p-4 rounded-[22px] bg-white transition-transform active:scale-[0.98]"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center mb-2" style={{ background: '#F2F0ED' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[#1A1A1A]">Browse</p>
          <p className="text-[10px] text-[#8A8A8A] mt-0.5">By category</p>
        </Link>

        {/* Compare */}
        <Link
          href="/compare"
          className="flex flex-col items-start justify-end p-4 rounded-[22px] bg-white transition-transform active:scale-[0.98]"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center mb-2" style={{ background: '#F2F0ED' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[#1A1A1A]">Compare</p>
          <p className="text-[10px] text-[#8A8A8A] mt-0.5">Side by side</p>
        </Link>

        {/* AI Chat — full width */}
        <Link
          href="/chat"
          className="col-span-2 flex items-center justify-between px-5 rounded-[22px] bg-white transition-transform active:scale-[0.98]"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: '#F2F0ED' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A1A]">AI Chat</p>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Ask anything about your food</p>
            </div>
          </div>
          <span className="text-[#8A8A8A] text-lg leading-none">›</span>
        </Link>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 flex-shrink-0">
        <div
          className="flex items-center justify-around px-4 py-2"
          style={{ background: 'rgba(60,142,60,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.15)', height: '56px' }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-[10px] font-semibold text-white">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Browse</span>
          </Link>
          <Link href="/scan?mode=label" className="flex items-center justify-center -mt-4">
            <div
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full"
              style={{ background: 'white', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-[11px] font-bold text-[#4CAF50]">Scan</span>
            </div>
          </Link>
          <Link href="/compare" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Compare</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>AI Chat</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the dev server is running and open the app**

Run: `curl -s http://localhost:3000 | grep -c "html"` — should return 1.

Open http://localhost:3000 in the browser and confirm:
- Green background fills the screen
- No vertical scrolling
- Scan Now, Browse, Compare, AI Chat all visible
- Bottom nav has green tint

- [ ] **Step 3: Commit**

```bash
cd /Users/nada/nutri-app
git add app/page.tsx
git commit -m "feat: redesign home screen — green grid layout, no scroll"
```

---

### Task 3: Verify no regressions on other pages

- [ ] **Step 1: Check scan, result, browse, compare, chat pages still load**

Run each in the browser or via curl:
```bash
curl -s http://localhost:3000/browse | grep -c "html"
curl -s http://localhost:3000/compare | grep -c "html"
curl -s http://localhost:3000/chat | grep -c "html"
```
Each should return 1.

- [ ] **Step 2: Run the test suite**

```bash
cd /Users/nada/nutri-app
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npx vitest run
```

Expected: all 10 tests pass. If any fail, investigate before continuing.

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve any regressions from home redesign"
```
