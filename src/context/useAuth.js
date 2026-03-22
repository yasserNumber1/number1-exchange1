// src/context/useAuth.js
import { useContext } from 'react'
import { AuthContext, AVATARS } from './AuthContext'

export { AVATARS }

export default function useAuth() {
  return useContext(AuthContext)
}
