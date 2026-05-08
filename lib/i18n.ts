'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
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

function subscribe(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

export function setLang(lang: Lang) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, lang)
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  window.dispatchEvent(new Event(EVENT))
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, readLang, () => 'en')
}

export function useT() {
  const lang = useLang()
  return (key: TranslationKey) => dictionaries[lang][key] ?? key
}

// Apply lang/dir on initial mount (in case localStorage was set in a prior session)
export function useApplyLang() {
  const lang = useLang()
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  }, [lang])
}
