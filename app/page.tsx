import Link from 'next/link'
import FeaturedProducts from '@/components/FeaturedProducts'
import RecentPills from '@/components/RecentPills'

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col pb-[72px]"
      style={{
        background: '#F1EEE8',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(232,114,28,0.07) 0px, transparent 45%), radial-gradient(at 100% 100%, rgba(232,114,28,0.05) 0px, transparent 45%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-9 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[11px] flex items-center justify-center" style={{ background: '#E8721C' }}>
            <span className="text-white font-bold text-[13px] tracking-tight">DQ</span>
          </div>
          <div>
            <p className="text-[10px] font-medium" style={{ color: '#9A9790' }}>Welcome back</p>
            <h1 className="text-[17px] font-bold leading-tight" style={{ color: '#1A1917' }}>nutri</h1>
          </div>
        </div>
        <Link
          href="/landing"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white"
          style={{ border: '1px solid #E2DDD5' }}
          aria-label="About nutri"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
          </svg>
        </Link>
      </div>

      {/* Tagline + Stats card */}
      <div className="px-5 pt-3 pb-5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8721C' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: '#E8721C' }}>Scan · Score · Decide</span>
        </div>
        <p className="text-[26px] leading-[1.05] font-bold tracking-tight" style={{ color: '#1A1917' }}>
          Scan your food.<br/>
          <span style={{ color: '#E8721C' }}>Eat smarter.</span>
        </p>
        <p className="text-[12px] mt-2 leading-relaxed" style={{ color: '#5A574F' }}>
          AI-powered food quality scoring — adapted for the UAE.
        </p>
      </div>

      {/* Recent (only when history exists) */}
      <RecentPills />

      {/* Featured products carousel */}
      <FeaturedProducts />

      {/* Big Scan CTA */}
      <div className="px-4 pt-4">
        <Link
          href="/scan?mode=label"
          className="relative overflow-hidden flex items-center justify-between px-5 py-5 rounded-[24px] transition-opacity active:opacity-90"
          style={{ background: '#1A1917' }}
        >
          <div className="absolute pointer-events-none" style={{ width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -100, right: -60 }} />
          <div className="absolute pointer-events-none" style={{ width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', bottom: -60, right: 100 }} />
          <div className="relative">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#F5C4A0' }}>Tap to start</div>
            <p className="text-[22px] font-bold text-white leading-tight">Scan a product</p>
            <p className="text-[11px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Label or barcode · AI-read in seconds</p>
          </div>
          <div
            className="relative w-16 h-16 rounded-[18px] flex items-center justify-center flex-shrink-0"
            style={{ background: '#E8721C', boxShadow: '0 4px 16px rgba(232,114,28,0.45)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* Quick actions row */}
      <div className="px-4 pt-3 grid grid-cols-3 gap-2">
        <Link
          href="/browse"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid #E2DDD5', height: 92 }}
        >
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: '#FEF0E6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8721C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-bold" style={{ color: '#1A1917' }}>Browse</p>
            <p className="text-[9px]" style={{ color: '#9A9790' }}>8 categories</p>
          </div>
        </Link>

        <Link
          href="/compare"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid #E2DDD5', height: 92 }}
        >
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: '#FEF0E6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8721C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-bold" style={{ color: '#1A1917' }}>Compare</p>
            <p className="text-[9px]" style={{ color: '#9A9790' }}>Side by side</p>
          </div>
        </Link>

        <Link
          href="/chat"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] transition-transform active:scale-[0.97]"
          style={{ background: '#FEF0E6', border: '1px solid #F5C4A0', height: 92 }}
        >
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8721C, #D8651A)', boxShadow: '0 2px 6px rgba(232,114,28,0.3)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-[12px] font-bold" style={{ color: '#1A1917' }}>AI Chat</p>
            <p className="text-[9px]" style={{ color: '#5A574F' }}>Ask anything</p>
          </div>
        </Link>
      </div>

      {/* Trust footer */}
      <div className="px-5 pt-5 pb-3 flex-1 flex items-end justify-center">
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#9A9790' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Built for Dubai Municipality · Food Safety</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
        <div
          className="flex items-center justify-around px-4 py-2"
          style={{ background: 'rgba(241,238,232,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid #E2DDD5', height: '56px' }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: '#1A1917' }}>Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A9790" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: '#9A9790' }}>Browse</span>
          </Link>
          <Link href="/scan?mode=label" className="flex items-center justify-center -mt-4">
            <div
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full"
              style={{ background: '#E8721C', boxShadow: '0 3px 10px rgba(232,114,28,0.35)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-[11px] font-bold text-white">Scan</span>
            </div>
          </Link>
          <Link href="/compare" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A9790" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: '#9A9790' }}>Compare</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A9790" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[10px] font-medium" style={{ color: '#9A9790' }}>AI Chat</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
