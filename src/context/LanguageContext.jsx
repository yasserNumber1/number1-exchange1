// src/context/LanguageContext.jsx
// ═══════════════════════════════════════════════════
// نظام اللغة — يوفر:
// - lang: 'ar' | 'en'
// - dir: 'rtl' | 'ltr'
// - t(key): دالة الترجمة
// - toggleLang(): تبديل اللغة
// ═══════════════════════════════════════════════════

import { createContext, useState, useEffect, useCallback } from 'react'
import ar from '../locales/ar'
import en from '../locales/en'

// Context بدون export هنا
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'ar'
  })

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const translations = lang === 'ar' ? ar : en

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = dir
    localStorage.setItem('lang', lang)
  }, [lang, dir])

  const t = useCallback((key) => {
    return translations[key] || key
  }, [translations])

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar')
  }

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

// نصدّر الـ Context منفصلاً
export { LanguageContext }