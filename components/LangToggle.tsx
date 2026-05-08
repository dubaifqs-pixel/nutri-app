'use client'

import { useLang, setLang } from '@/lib/i18n'

export default function LangToggle() {
  const lang = useLang()
  const next = lang === 'en' ? 'ar' : 'en'

  return (
    <button
      onClick={() => setLang(next)}
      className="h-9 rounded-full bg-white flex items-center px-1 gap-0.5"
      style={{ border: '1px solid #E2DDD5' }}
      aria-label="Toggle language"
    >
      <span
        className="text-[10px] font-bold rounded-full px-2.5 py-1 transition-colors"
        style={{
          background: lang === 'en' ? '#E8721C' : 'transparent',
          color: lang === 'en' ? 'white' : '#9A9790',
        }}
      >
        EN
      </span>
      <span
        className="text-[11px] font-bold rounded-full px-2.5 py-1 transition-colors"
        style={{
          background: lang === 'ar' ? '#E8721C' : 'transparent',
          color: lang === 'ar' ? 'white' : '#9A9790',
          fontFamily: "'SF Arabic', 'Segoe UI Arabic', 'Cairo', sans-serif",
        }}
      >
        عربي
      </span>
    </button>
  )
}
