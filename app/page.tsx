import Link from 'next/link'
import FeaturedProducts from '@/components/FeaturedProducts'

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col pb-[72px]"
      style={{
        background: '#F1EEE8',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(232,114,28,0.06) 0px, transparent 50%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-9 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[11px] flex items-center justify-center" style={{ background: '#E8721C' }}>
            <span className="text-white font-bold text-[13px] tracking-tight">DQ</span>
          </div>
          <h1 className="text-[17px] font-bold leading-tight" style={{ color: '#1A1917' }}>nutri</h1>
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

      {/* Tagline */}
      <div className="px-5 pt-6 pb-6 flex-shrink-0">
        <p className="text-[28px] leading-[1.05] font-bold tracking-tight" style={{ color: '#1A1917' }}>
          Scan your food.<br/>
          <span style={{ color: '#E8721C' }}>Eat smarter.</span>
        </p>
      </div>

      {/* Featured products carousel */}
      <FeaturedProducts />

      {/* Big Scan CTA */}
      <div className="px-4 pt-5">
        <Link
          href="/scan?mode=label"
          className="relative overflow-hidden flex items-center justify-between px-5 py-5 rounded-[24px] transition-opacity active:opacity-90"
          style={{ background: '#1A1917' }}
        >
          <div className="absolute pointer-events-none" style={{ width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -100, right: -60 }} />
          <div className="relative">
            <p className="text-[20px] font-bold text-white leading-tight">Scan a product</p>
            <p className="text-[11px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Label or barcode</p>
          </div>
          <div
            className="relative w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0"
            style={{ background: '#E8721C', boxShadow: '0 4px 16px rgba(232,114,28,0.4)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* Quick actions row */}
      <div className="px-4 pt-3 grid grid-cols-3 gap-2 flex-shrink-0">
        <Link
          href="/browse"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid #E2DDD5', height: 86 }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#FEF0E6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8721C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
              <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
            </svg>
          </div>
          <p className="text-[12px] font-bold" style={{ color: '#1A1917' }}>Browse</p>
        </Link>

        <Link
          href="/compare"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid #E2DDD5', height: 86 }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#FEF0E6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8721C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
            </svg>
          </div>
          <p className="text-[12px] font-bold" style={{ color: '#1A1917' }}>Compare</p>
        </Link>

        <Link
          href="/chat"
          className="flex flex-col items-start justify-between p-3 rounded-[18px] bg-white transition-transform active:scale-[0.97]"
          style={{ border: '1px solid #E2DDD5', height: 86 }}
        >
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: '#FEF0E6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8721C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-[12px] font-bold" style={{ color: '#1A1917' }}>AI Chat</p>
        </Link>
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
