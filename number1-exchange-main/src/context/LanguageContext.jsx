// src/context/LanguageContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import arLocale from '../locales/ar'
import enLocale from '../locales/en'

const LanguageContext = createContext()

const translations = { ar: arLocale, en: enLocale }

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ar')
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = dir
    localStorage.setItem('lang', lang)
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
