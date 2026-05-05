import Link from 'next/link'
import RecentScans from '@/components/RecentScans'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0ED] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-2 animate-fade-in">
        <div>
          <p className="text-[13px] text-[#8A8A8A] font-medium">Welcome back</p>
          <h1 className="text-[22px] font-medium text-[#1A1A1A] tracking-tight">nutri</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/landing" className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[rgba(0,0,0,0.06)] transition-colors hover:border-[rgba(0,0,0,0.12)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </Link>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[rgba(0,0,0,0.06)] transition-colors hover:border-[rgba(0,0,0,0.12)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
          </button>
        </div>
      </div>

      {/* Hero text */}
      <div className="px-6 mt-4 mb-6 animate-slide-up stagger-1">
        <p className="text-[24px] leading-tight text-[#1A1A1A]" style={{ fontWeight: 400 }}>
          Scan your food<br/>
          <span style={{ fontWeight: 700 }}>Eat smarter</span>
        </p>
      </div>

      {/* Recent Scans (horizontal cards) */}
      <div className="w-full animate-slide-up stagger-2">
        <RecentScans />
      </div>

      {/* Scan CTA card */}
      <div className="px-6 mt-6 animate-slide-up stagger-3">
        <Link href="/scan?mode=label" className="flex items-center justify-between p-5 rounded-[28px] bg-white transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div>
            <p className="text-[17px] font-bold text-[#1A1A1A]">Scan Now</p>
            <p className="text-[13px] text-[#8A8A8A] mt-1">Label or barcode</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#1A1A1A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
        </Link>
      </div>

      {/* Enter Barcode Link */}
      <Link href="/scan?mode=barcode&manual=1" className="text-[12px] text-[#8A8A8A] mt-3 hover:text-[#1A1A1A] transition-colors animate-slide-up stagger-3 text-center">
        Enter barcode manually
      </Link>

      {/* Secondary Actions */}
      <div className="px-6 flex gap-3 mt-6 animate-slide-up stagger-4">
        <Link href="/compare" className="flex-1 bg-white rounded-[28px] flex items-center justify-center gap-2 py-3.5 px-4 text-[13px] font-medium text-[#1A1A1A] transition-all hover:-translate-y-0.5 active:scale-[0.98]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
          Compare
        </Link>
        <Link href="/browse" className="flex-1 bg-white rounded-[28px] flex items-center justify-center gap-2 py-3.5 px-4 text-[13px] font-medium text-[#1A1A1A] transition-all hover:-translate-y-0.5 active:scale-[0.98]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
          Browse
        </Link>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 mt-12 animate-fade-in stagger-5 px-6">
        <div className="flex items-center gap-1.5 text-xs text-[#8A8A8A]">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          <span>Powered by AI</span>
        </div>
        <Link href="/landing" className="text-[11px] text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">About nutri</Link>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
        <div className="bg-[#F2F0ED]/80 backdrop-blur-md px-4 py-2 flex items-center justify-around" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <Link href="/" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-semibold text-[#1A1A1A]">Home</span>
          </Link>
          <Link href="/browse" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            <span className="text-[10px] font-medium text-[#8A8A8A]">Browse</span>
          </Link>
          <Link href="/scan?mode=label" className="flex items-center justify-center -mt-4">
            <div className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-[#4CAF50] text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span className="text-sm font-semibold">Scan</span>
            </div>
          </Link>
          <Link href="/compare" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
            <span className="text-[10px] font-medium text-[#8A8A8A]">Compare</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="text-[10px] font-medium text-[#8A8A8A]">AI Chat</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
