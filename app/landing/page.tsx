import Link from 'next/link'
import { GRADE_COLORS } from '@/lib/types'

const GRADES = [
  { grade: 'A', label: 'Excellent', range: '-15 to -1', description: 'Highest nutritional quality' },
  { grade: 'B', label: 'Good', range: '0 to 2', description: 'Good nutritional quality' },
  { grade: 'C', label: 'Average', range: '3 to 10', description: 'Moderate nutritional quality' },
  { grade: 'D', label: 'Poor', range: '11 to 18', description: 'Low nutritional quality' },
  { grade: 'E', label: 'Bad', range: '19 to 40', description: 'Lowest nutritional quality' },
] as const

const FEATURES = [
  {
    title: 'AI Vision Scanner',
    description: 'Point your camera at any nutrition label in any language and get instant grading',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    ),
  },
  {
    title: 'Barcode Lookup',
    description: 'Scan any barcode for instant product data from global food databases',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
    ),
  },
  {
    title: 'AI Chat',
    description: 'Ask health questions about any product and get evidence-based answers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
  },
  {
    title: 'Smart Alternatives',
    description: 'Find healthier options instantly when a product scores low',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    ),
  },
  {
    title: 'Product Comparison',
    description: 'Compare two products side by side to make better choices',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>
    ),
  },
  {
    title: 'Category Browser',
    description: 'Explore curated UAE products across 8 food categories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
    ),
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Scan',
    description: 'Point your camera at any product — nutrition label or barcode',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    ),
  },
  {
    number: '02',
    title: 'Grade',
    description: 'AI analyzes nutrition data and assigns an A-E grade using the Nutri-Score algorithm',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
    ),
  },
  {
    number: '03',
    title: 'Decide',
    description: 'Get AI recommendations, chat about health impacts, and compare products',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    ),
  },
]

export default function LandingPage() {
  return (
    <div className="landing-fullwidth">
      {/* Back to App */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-gray-400 text-sm flex items-center gap-1 transition-colors hover:text-gray-600 min-h-[44px] w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to App
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3A3F57 0%, #2a2f47 50%, #1a1f37 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, #F1B123 0%, transparent 70%)' }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #F1B123 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>
            DFQS
          </h1>
          <p className="text-lg md:text-xl text-white/70 mt-3" style={{ fontFamily: 'var(--font-inter)' }}>
            Dubai Food Quality Standards
          </p>
          <div className="w-12 h-0.5 mx-auto mt-6 mb-6" style={{ backgroundColor: '#F1B123' }} />
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
            Empowering consumers with AI-powered food quality grading
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-2xl text-white font-semibold text-base shadow-lg shadow-yellow-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #F1B123, #D89A0E)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            Try the App
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3A3F57] text-center" style={{ fontFamily: 'var(--font-inter)' }}>How It Works</h2>
          <p className="text-sm text-gray-400 text-center mt-2">Three simple steps to healthier choices</p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connection lines (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(33.333%+12px)] right-[calc(33.333%+12px)] h-px bg-gray-200" />

            {STEPS.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center relative">
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#3A3F57] mb-5 relative z-10">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-[#F1B123] tracking-wider uppercase mb-2">{step.number}</span>
                <h3 className="text-lg font-bold text-[#3A3F57]" style={{ fontFamily: 'var(--font-inter)' }}>{step.title}</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xs">{step.description}</p>
                {/* Arrow between steps (mobile) */}
                {i < STEPS.length - 1 && (
                  <div className="md:hidden mt-6 mb-2 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grading Scale */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3A3F57] text-center" style={{ fontFamily: 'var(--font-inter)' }}>The Grading Scale</h2>
          <p className="text-sm text-gray-400 text-center mt-2">Based on the internationally recognized Nutri-Score algorithm</p>

          <div className="mt-14 flex flex-col gap-3 max-w-lg mx-auto">
            {GRADES.map((g) => (
              <div key={g.grade} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <span
                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: GRADE_COLORS[g.grade] }}
                >
                  {g.grade}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#3A3F57]">{g.label}</span>
                    <span className="text-xs text-gray-400">Score: {g.range}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3A3F57] text-center" style={{ fontFamily: 'var(--font-inter)' }}>Key Features</h2>
          <p className="text-sm text-gray-400 text-center mt-2">Everything you need to make informed food choices</p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col p-6 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="text-[#3A3F57] mb-4">{feature.icon}</div>
                <h3 className="text-sm font-bold text-[#3A3F57]" style={{ fontFamily: 'var(--font-inter)' }}>{feature.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3A3F57]" style={{ fontFamily: 'var(--font-inter)' }}>Powered By</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
            DFQS adapts France&apos;s proven Nutri-Score system for Dubai, enhanced with AI for instant access
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#3A3F57]/5 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A3F57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
              </div>
              <h3 className="text-sm font-bold text-[#3A3F57]">Gemini AI</h3>
              <p className="text-xs text-gray-400 mt-1">Vision and language AI</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#3A3F57]/5 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A3F57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-sm font-bold text-[#3A3F57]">Nutri-Score</h3>
              <p className="text-xs text-gray-400 mt-1">Proven grading algorithm</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#3A3F57]/5 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A3F57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
              </div>
              <h3 className="text-sm font-bold text-[#3A3F57]">Open Food Facts</h3>
              <p className="text-xs text-gray-400 mt-1">Global product database</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: 'linear-gradient(135deg, #3A3F57 0%, #2a2f47 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, #F1B123 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-inter)' }}>
            Make Healthier Choices Today
          </h2>
          <p className="text-sm text-white/50 mt-3 max-w-md mx-auto leading-relaxed">
            Scan, grade, and understand the food you buy. Free and instant.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-2xl text-white font-semibold text-base shadow-lg shadow-yellow-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #F1B123, #D89A0E)' }}
          >
            Try DFQS Now
          </Link>
          <p className="text-xs text-white/30 mt-8" style={{ fontFamily: 'var(--font-inter)' }}>
            Built for Dubai Municipality -- Food Safety Department
          </p>
        </div>
      </section>

      {/* Override body max-w-md */}
      <style>{`
        .landing-fullwidth {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          max-width: none;
        }
      `}</style>
    </div>
  )
}
