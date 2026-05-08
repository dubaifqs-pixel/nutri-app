'use client'

import { useEffect, useState } from 'react'
import { en, type TranslationKey } from './translations/en'
import { ar } from './translations/ar'

export type Lang = 'en' | 'ar'

const STORAGE_KEY = 'dfqs_lang'
const EVENT = 'dfqs-lang-change'

const dictionaries: Record<Lang, Record<TranslationKey, string>> = { en, ar }

function readLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'ar' ? 'ar' : 'en'
}

export function setLang(lang: Lang) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, lang)
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  window.dispatchEvent(new Event(EVENT))
}

/**
 * Returns the active language. Always 'en' on first render to match SSR,
 * then updates to the stored value via useEffect to avoid hydration mismatch.
 */
export function useLang(): Lang {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(readLang())
    const handler = () => setLangState(readLang())
    window.addEventListener(EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return lang
}

export function useT() {
  const lang = useLang()
  return (key: TranslationKey) => dictionaries[lang][key] ?? key
}

// Apply lang/dir on mount in case the inline pre-paint script didn't run
export function useApplyLang() {
  const lang = useLang()
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  }, [lang])
}
