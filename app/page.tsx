import Link from 'next/link'
import RecentScans from '@/components/RecentScans'
import AnimatedBackground from '@/components/illustrations/AnimatedBackground'
import FoodScanIllustration from '@/components/illustrations/FoodScanIllustration'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 mesh-bg relative">
      <AnimatedBackground />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-5xl font-bold text-[#1A1D2E] tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>DFQS</h1>
          <div className="gold-underline w-16 mx-auto mt-3" />
          <p className="text-sm text-[#6B7194] mt-3" style={{ fontFamily: 'var(--font-inter)' }}>Dubai Food Quality Standards</p>
          <p className="text-xs text-[#6B7194]/60 mt-1 font-arabic">معايير دبي لجودة الغذاء</p>
          <p className="text-[11px] text-[#6B7194]/50 mt-3 tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-inter)' }}>AI-powered food grading</p>
        </div>

        {/* Hero Illustration */}
        <div className="animate-scale-in mb-6">
          <FoodScanIllustration size={140} />
        </div>

        {/* Main Action Cards */}
        <div className="w-full flex flex-col gap-3 animate-slide-up stagger-1">
          <Link href="/scan?mode=label" className="glass-card card-3d flex items-center gap-4 w-full py-5 px-5 group" style={{ borderColor: 'rgba(241, 177, 35, 0.15)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(241, 177, 35, 0.15), rgba(241, 177, 35, 0.05))' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F1B123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#1A1D2E]">Scan Label</p>
              <p className="text-xs text-[#6B7194] mt-0.5">Point camera at nutrition facts</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:opacity-70 transition-opacity"><path d="m9 18 6-6-6-6"/></svg>
          </Link>

          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
            <span className="text-[10px] text-[#6B7194]/50 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1A1D2E]/10 to-transparent" />
          </div>

          <Link href="/scan?mode=barcode" className="glass-card card-3d flex items-center gap-4 w-full py-5 px-5 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(26, 29, 46, 0.08), rgba(26, 29, 46, 0.03))' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#1A1D2E]">Scan Barcode</p>
              <p className="text-xs text-[#6B7194] mt-0.5">Scan or enter barcode number</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7194" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:opacity-70 transition-opacity"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>

        {/* Enter Barcode Link */}
        <Link href="/scan?mode=barcode&manual=1" className="text-[12px] text-[#6B7194]/60 mt-3 hover:text-[#F1B123] transition-colors animate-slide-up stagger-2" style={{ fontFamily: 'var(--font-inter)' }}>
          Enter barcode manually
        </Link>

        {/* Secondary Actions */}
        <div className="w-full flex gap-3 mt-6 animate-slide-up stagger-3">
          <Link href="/compare" className="flex-1 glass-card card-3d flex items-center justify-center gap-2 py-3.5 px-4 text-[13px] font-medium text-[#3A3F57]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
            Compare
          </Link>
          <Link href="/browse" className="flex-1 glass-card card-3d flex items-center justify-center gap-2 py-3.5 px-4 text-[13px] font-medium text-[#3A3F57]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            Browse
          </Link>
        </div>

        {/* History */}
        <div className="w-full animate-slide-up stagger-4">
          <RecentScans />
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 mt-12 animate-fade-in stagger-5">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7194]/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            <span style={{ fontFamily: 'var(--font-inter)' }}>Powered by AI</span>
          </div>
          <Link href="/landing" className="text-[11px] text-[#6B7194]/40 hover:text-[#F1B123] transition-colors" style={{ fontFamily: 'var(--font-inter)' }}>About DFQS</Link>
        </div>
      </div>
    </div>
  )
}
