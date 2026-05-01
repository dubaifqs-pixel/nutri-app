import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#3A3F57] tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>DFQS</h1>
        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'var(--font-inter)' }}>Dubai Food Quality Standards</p>
        <p className="text-xs text-gray-400 mt-1 font-arabic">معايير دبي لجودة الغذاء</p>
        <p className="text-xs text-gray-400 mt-3 tracking-wide uppercase" style={{ fontFamily: 'var(--font-inter)', letterSpacing: '0.1em' }}>AI-powered food grading</p>
      </div>
      <div className="w-full flex flex-col gap-3">
        <Link href="/scan?mode=label" className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F1B123] to-[#D89A0E] text-white font-semibold text-base shadow-lg shadow-yellow-500/25 active:scale-[0.98] transition-all hover:shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Scan Nutrition Label
        </Link>
        <Link href="/scan?mode=barcode" className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-[#3A3F57] text-white font-semibold text-base shadow-lg shadow-gray-800/25 active:scale-[0.98] transition-all hover:shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
          Scan Barcode
        </Link>
        <Link href="/scan?mode=barcode&manual=1" className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-2xl border border-gray-200 text-gray-500 text-sm active:scale-[0.98] transition-all hover:border-gray-300 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M8 16h8"/></svg>
          Enter Barcode Manually
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-12" style={{ fontFamily: 'var(--font-inter)' }}>Powered by AI</p>
    </div>
  )
}
