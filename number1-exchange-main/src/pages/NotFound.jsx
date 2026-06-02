// src/pages/NotFound.jsx
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useLang from '../context/useLang'

export default function NotFound() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(4rem,15vw,7rem)', fontWeight: 900, color: 'var(--cyan)', opacity: 0.18, lineHeight: 1, marginBottom: 16 }}>404</div>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 14px' }}>
          {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.8, marginBottom: 28 }}>
          {isAr ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.' : 'The page you are looking for does not exist or has been moved.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')}
            style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
          <button onClick={() => navigate('/contact')}
            style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            {isAr ? 'تواصل معنا' : 'Contact Us'}
          </button>
        </div>
      </div>
    </div>
  )
}