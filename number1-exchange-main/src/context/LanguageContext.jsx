// src/context/LanguageContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import arLocale from '../locales/ar'
import enLocale from '../locales/en'

const LanguageContext = createContext()

const translations = { ar: arLocale, en: enLocale }

function getStoredLanguage() {
  if (typeof window === 'undefined') return 'ar'
  return window.localStorage.getItem('lang') || 'ar'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getStoredLanguage)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    document.documentElement.lang = lang
    document.documentElement.dir  = dir
    window.localStorage.setItem('lang', lang)
  }, [lang, dir])

  const t = useCallback((key) => translations[lang][key] || key, [lang])
  const toggleLang = () => setLang(p => p === 'ar' ? 'en' : 'ar')

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext }
