import Link from 'next/link'
import { GRADE_GRADIENTS } from '@/lib/types'

const PROBLEMS = [
  { num: '01', title: 'No unified standard', body: 'No national benchmark for food quality classification exists in Dubai — making instant, meaningful product comparison impossible.' },
  { num: '02', title: 'Uninformed purchasing', body: 'Consumers rely on packaging and branding rather than nutritional value when making everyday food decisions.' },
  { num: '03', title: 'Rising health risks', body: 'Diet-related diseases — diabetes, cardiovascular disease — are increasing across the emirate, demanding proactive preventive action.' },
  { num: '04', title: 'Labels no one can read', body: 'Nutrition labels are dense, technical, and often unavailable in Arabic — useless without an interpretation tool.' },
] as const

const STEPS = [
  { num: '01', title: 'Scan the product', body: 'Point your camera at the nutrition label or scan the barcode — Arabic and English labels both supported.' },
  { num: '02', title: 'AI reads the values', body: 'Computer vision extracts all nutritional data from the label automatically — no typing required.' },
  { num: '03', title: 'Grade in seconds', body: 'The DFQS algorithm runs instantly and delivers a clear A–E grade with a full per-nutrient breakdown.' },
] as const

const GRADES = [
  { grade: 'A' as const, label: 'Excellent', range: '≤ −1' },
  { grade: 'B' as const, label: 'Good', range: '0 – 2' },
  { grade: 'C' as const, label: 'Average', range: '3 – 10' },
  { grade: 'D' as const, label: 'Poor', range: '11 – 18' },
  { grade: 'E' as const, label: 'Bad', range: '19+' },
]

const FEATURES = [
  { title: 'Product Showdown', body: 'Compare any two products head-to-head — calories, sugar, fat, sodium, protein, fiber. AI verdict on which wins nutritionally.' },
  { title: 'AI Assistant', body: '"Is this good for diabetics?" Ask any question about a product, answered in Arabic and English.' },
  { title: 'Healthier alternatives', body: 'After scanning a low-grade product, surface better options filterable by Low Sugar, Low Fat, High Protein.' },
  { title: 'Browse by category', body: 'Curated UAE product lists across 8 categories: Dairy, Beverages, Snacks, Cereals, Bakery, Meat, Produce, Frozen.' },
  { title: 'Bilingual verdict', body: 'Each scan produces a bilingual verdict with colour-coded concerns and percentage of daily intake.' },
  { title: 'Scan history', body: 'Every product saved with its grade. Revisit past scans or add them directly to a comparison.' },
] as const

const Eyebrow = ({ num, label }: { num: string; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#B6F074' }} />
    <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#B6F074' }}>
      {num} · {label}
    </span>
  </div>
)

export default function LandingPage() {
  return (
    <div className="landing-fullwidth" style={{ background: '#F5F4F0' }}>

      {/* Sticky back link */}
      <div className="sticky top-0 z-50 px-6 py-3" style={{ background: 'rgba(241,238,232,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-sm flex items-center gap-1 transition-colors min-h-[44px] w-fit" style={{ color: '#7A7A7A' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to App
          </Link>
        </div>
      </div>

      {/* HERO — dark cover */}
      <section className="relative overflow-hidden" style={{ background: '#1A1A1A' }}>
        <div className="absolute pointer-events-none" style={{ width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', top: -180, right: -180 }} />
        <div className="absolute pointer-events-none" style={{ width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', bottom: -120, left: -120 }} />

        <div className="relative max-w-3xl mx-auto px-6 py-28 md:py-36 text-center">
          <div className="inline-block mb-12 px-5 py-1.5 rounded-full text-[11px] font-medium tracking-[0.12em] uppercase" style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
            Dubai Municipality · Food Safety
          </div>
          <div className="w-20 h-20 mx-auto mb-8 rounded-[22px] flex items-center justify-center text-[20px] font-bold tracking-tight" style={{ background: '#B6F074', color: '#1A1A1A' }}>
            DFQS
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
            Dubai <span style={{ color: '#D4F5A8' }}>Food Quality</span><br/>Standards
          </h1>
          <p className="text-base md:text-lg mt-4" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            نظام معايير دبي لجودة الغذاء
          </p>
          <p className="text-sm md:text-base mt-3 mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
            AI-powered food quality scoring — built for Dubai
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: '#B6F074', color: '#1A1A1A', boxShadow: '0 8px 30px rgba(182,240,116,0.35)' }}
          >
            Try the App
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 md:py-28" style={{ background: '#F5F4F0' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow num="01" label="Problem" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#1A1A1A' }}>The problem we&apos;re solving</h2>
          <p className="text-base md:text-lg mb-10 max-w-2xl" style={{ color: '#7A7A7A' }}>
            Consumers in Dubai have no fast, scientific, government-grade way to evaluate food quality at the point of purchase.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROBLEMS.map((p) => (
              <div key={p.num} className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#ACACAC' }}>Challenge {p.num}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1A1A1A' }}>{p.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#7A7A7A' }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl p-7" style={{ background: '#B6F074' }}>
            <h3 className="text-base font-bold mb-2" style={{ color: '#1A1A1A' }}>The strategic opportunity</h3>
            <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(26,26,26,0.75)' }}>
              A unified, AI-powered food quality scoring system — letting any Dubai resident make an informed dietary choice simply by pointing their phone at a product. Directly supports Dubai&apos;s Digital Transformation Strategy and Public Health goals for 2040.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow num="02" label="How it works" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#1A1A1A' }}>Scan. Score. Decide.</h2>
          <p className="text-base md:text-lg mb-10 max-w-2xl" style={{ color: '#7A7A7A' }}>
            Three steps from product to insight — fully automatic, no manual entry, no guesswork.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STEPS.map((s) => (
              <div key={s.num} className="rounded-2xl p-6 text-center" style={{ background: '#F5F4F0', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="w-10 h-10 mx-auto mb-4 rounded-full flex items-center justify-center text-[14px] font-bold" style={{ background: '#F0FBDF', color: '#B6F074', border: '1px solid #D4F5A8' }}>
                  {s.num.replace('0', '')}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1A1A1A' }}>{s.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#7A7A7A' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRADING SCALE */}
      <section className="py-20 md:py-28" style={{ background: '#F5F4F0' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow num="03" label="Algorithm" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#1A1A1A' }}>The grading scale</h2>
          <p className="text-base md:text-lg mb-10 max-w-2xl" style={{ color: '#7A7A7A' }}>
            Based on Nutri-Score — Europe&apos;s leading food quality standard — adapted specifically for Dubai&apos;s market.
          </p>

          <div className="grid grid-cols-5 gap-2 mb-3">
            {GRADES.map((g) => (
              <div key={g.grade} className="rounded-2xl px-3 py-5 flex flex-col items-center justify-center text-white" style={{ background: GRADE_GRADIENTS[g.grade] }}>
                <span className="text-3xl md:text-4xl font-bold leading-none">{g.grade}</span>
                <span className="text-[11px] md:text-[12px] font-semibold mt-2">{g.label}</span>
                <span className="text-[10px] md:text-[11px] mt-1" style={{ opacity: 0.7 }}>{g.range}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-4" style={{ color: '#ACACAC' }}>
            Score = N (negative points: energy, sugar, sat. fat, sodium) − P (positive points: fiber, protein, fruits & veg)
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow num="04" label="Features" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: '#1A1A1A' }}>A complete food intelligence platform</h2>
          <p className="text-base md:text-lg mb-10 max-w-2xl" style={{ color: '#7A7A7A' }}>
            DFQS goes far beyond a simple grade — a full toolkit for smarter eating decisions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-6" style={{ background: '#F5F4F0', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: '#ACACAC' }}>Feature</div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1A1A1A' }}>{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#7A7A7A' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #B6F074 0%, #A8E866 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #1A1A1A 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #1A1A1A 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>Eat smarter. Today.</h2>
          <p className="text-base mt-3 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(26,26,26,0.7)' }}>
            Scan, grade, and understand the food you buy. Free and instant.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'white', color: '#1A1A1A', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
          >
            Try nutri Now
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 text-center" style={{ background: '#1A1A1A' }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-bold" style={{ background: '#B6F074', color: '#1A1A1A' }}>
              DQ
            </div>
            <span className="text-[16px] font-bold text-white">DFQS</span>
          </div>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Dubai Food Quality Standards · معايير دبي لجودة الغذاء
          </p>
          <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Nada Nabil Bin Haider · Dubai Municipality · Food Safety Department
          </p>
        </div>
      </footer>

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
