// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// هذا الملف يصدّر Component واحد فقط (ThemeProvider)
// useTheme منقولة لملف منفصل لتجنب التحذير
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved !== 'light'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// نصدّر الـ Context نفسه فقط — الـ hook سينتقل لملف منفصل
export { ThemeContext }