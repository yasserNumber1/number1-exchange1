// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react'

// ── Avatars List ─────────────────────────────────────────────
// Used in AuthModal AvatarPicker — exported so AuthModal can import it
export const AVATARS = [
  // Male group
  { id: 'm1', group: 'male',   label: 'رجل 1',   url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m1&backgroundColor=0d1117' },
  { id: 'm2', group: 'male',   label: 'رجل 2',   url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m2&backgroundColor=0d1117' },
  { id: 'm3', group: 'male',   label: 'رجل 3',   url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m3&backgroundColor=0d1117' },
  { id: 'm4', group: 'male',   label: 'رجل 4',   url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m4&backgroundColor=0d1117' },
  { id: 'm5', group: 'male',   label: 'رجل 5',   url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m5&backgroundColor=0d1117' },
  { id: 'm6', group: 'male',   label: 'رجل 6',   url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m6&backgroundColor=0d1117' },
  // Female group
  { id: 'f1', group: 'female', label: 'سيدة 1',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f1&backgroundColor=0d1117' },
  { id: 'f2', group: 'female', label: 'سيدة 2',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f2&backgroundColor=0d1117' },
  { id: 'f3', group: 'female', label: 'سيدة 3',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f3&backgroundColor=0d1117' },
  { id: 'f4', group: 'female', label: 'سيدة 4',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f4&backgroundColor=0d1117' },
  { id: 'f5', group: 'female', label: 'سيدة 5',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f5&backgroundColor=0d1117' },
  { id: 'f6', group: 'female', label: 'سيدة 6',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f6&backgroundColor=0d1117' },
]

// ── Context Creation ─────────────────────────────────────────
export const AuthContext = createContext(null)

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Load saved user from localStorage on first render
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('n1_user'))
      if (saved?.email) setUser(saved)
    } catch {
      // ignore corrupted data
    }
  }, [])

  // Login: save user to state + localStorage
  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('n1_user', JSON.stringify(userData))
  }

  // Logout: clear state + localStorage
  const logout = () => {
    setUser(null)
    localStorage.removeItem('n1_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext