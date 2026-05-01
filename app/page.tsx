import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: 'var(--font-inter)' }}>DFQS</h1>
        <p className="text-sm text-gray-500 mt-2">معايير دبي لجودة الغذاء</p>
        <p className="text-xs text-gray-400 mt-1">Dubai Food Quality Standards</p>
      </div>
      <div className="w-full flex flex-col gap-3">
        <Link href="/scan?mode=label" className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-base shadow-lg shadow-yellow-500/30 active:scale-[0.98] transition-transform">
          📷 امسح الملصق الغذائي
        </Link>
        <Link href="/scan?mode=barcode" className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gray-800 text-white font-semibold text-base shadow-lg active:scale-[0.98] transition-transform">
          ⬛ امسح الباركود
        </Link>
        <Link href="/scan?mode=barcode&manual=1" className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-2xl border border-gray-200 text-gray-600 text-sm active:scale-[0.98] transition-transform">
          ⌨️ أدخل الباركود يدوياً
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-12">مدعوم بالذكاء الاصطناعي</p>
    </div>
  )
}
