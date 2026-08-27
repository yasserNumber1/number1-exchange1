// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

// ── Avatars List ─────────────────────────────────────────────
export const AVATARS = [
  { id: 'm1', group: 'male',   label: 'رجل 1',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m1&backgroundColor=0d1117' },
  { id: 'm2', group: 'male',   label: 'رجل 2',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m2&backgroundColor=0d1117' },
  { id: 'm3', group: 'male',   label: 'رجل 3',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m3&backgroundColor=0d1117' },
  { id: 'm4', group: 'male',   label: 'رجل 4',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m4&backgroundColor=0d1117' },
  { id: 'm5', group: 'male',   label: 'رجل 5',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m5&backgroundColor=0d1117' },
  { id: 'm6', group: 'male',   label: 'رجل 6',  url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=m6&backgroundColor=0d1117' },
  { id: 'f1', group: 'female', label: 'سيدة 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f1&backgroundColor=0d1117' },
  { id: 'f2', group: 'female', label: 'سيدة 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f2&backgroundColor=0d1117' },
  { id: 'f3', group: 'female', label: 'سيدة 3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f3&backgroundColor=0d1117' },
  { id: 'f4', group: 'female', label: 'سيدة 4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f4&backgroundColor=0d1117' },
  { id: 'f5', group: 'female', label: 'سيدة 5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f5&backgroundColor=0d1117' },
  { id: 'f6', group: 'female', label: 'سيدة 6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=f6&backgroundColor=0d1117' },
]

// ── Helpers ───────────────────────────────────────────────────
const TOKEN_KEY = 'n1_token'
const USER_KEY  = 'n1_user'

const saveSession  = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Context ───────────────────────────────────────────────────
export const AuthContext = createContext(null)

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // true on first load
  const [error,   setError]   = useState(null)

  // ── On App Start: verify saved token with backend ──────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setLoading(false)
      return
    }

    // Ask backend: is this token still valid?
    authAPI.me()
      .then(({ data }) => {
        setUser(data.user)
      })
      .catch(() => {
        // Token expired or invalid → clean up
        clearSession()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // ── Register ───────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setError(null)
    try {
      const { data } = await authAPI.register(formData)
      saveSession(data.token, data.user)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى'
      setError(msg)
      return { success: false, message: msg }
    }
  }, [])

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    setError(null)
    try {
      const { data } = await authAPI.login(formData)
      saveSession(data.token, data.user)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'بيانات غير صحيحة'
      setError(msg)
      return { success: false, message: msg }
    }
  }, [])

  // ── Logout ─────────────────────────────────────────────────
  const loginDirect = useCallback((user, token) => {
  saveSession(token, user)
  setUser(user)
}, [])

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])
  
  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setError(null)
  }, [])

  // ── Clear error manually (useful for forms) ────────────────
  const clearError = useCallback(() => setError(null), [])

  return (
<AuthContext.Provider value={{ user, loading, error, register, login, loginDirect, updateUser, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
