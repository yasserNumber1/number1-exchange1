// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

function getStoredTheme() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('theme') === 'dark'
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getStoredTheme)

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    if (isDark) {
      document.documentElement.classList.remove('light')
      window.localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      window.localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(p => !p)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export { ThemeContext }
