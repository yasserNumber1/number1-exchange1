// src/pages/admin/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const result = await login({ email, password })
    setBusy(false)
    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.message || 'بيانات الدخول غير صحيحة')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Tajawal, sans-serif',
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid rgba(0,210,255,0.15)',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'center',
      }}>
        <div style={{ color: '#00d2ff', fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>
          NUMBER1 EXCHANGE
        </div>
        <h2 style={{ color: '#fff', margin: '0 0 28px', fontSize: 20 }}>
          دخول لوحة التحكم
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {error && (
            <div style={{ color: '#ff4d6d', fontSize: 13, padding: '8px 12px', background: 'rgba(255,77,109,0.1)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              background: busy ? 'rgba(0,210,255,0.3)' : 'linear-gradient(135deg,#00d2ff,#0090ff)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 0',
              fontSize: 15,
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'Tajawal, sans-serif',
            }}
          >
            {busy ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '11px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Tajawal, sans-serif',
  outline: 'none',
  direction: 'rtl',
}
