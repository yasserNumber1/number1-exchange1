// src/context/useAuth.js
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

// ── useAuth Hook ─────────────────────────────────────────────
// Usage: const { user, login, logout } = useAuth()
// Must be used inside <AuthProvider> — otherwise throws a clear error
function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Check your main.jsx!')
  }
  return ctx
}

export default useAuth