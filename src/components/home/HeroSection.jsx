// src/components/home/HeroSection.jsx
// العنوان الرئيسي مع الأرقام المتحركة

import { useState, useEffect } from 'react'

function HeroSection({ onAbout }) {
  const [counts, setCounts] = useState({ users: 0, transactions: 0, pairs: 0 })

  useEffect(() => {
    const targets = { users: 52000, transactions: 980000, pairs: 50 }
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / 60
      setCounts({
        users: Math.floor(targets.users * progress),
        transactions: Math.floor(targets.transactions * progress),
        pairs: Math.floor(targets.pairs * progress),
      })
      if (step >= 60) clearInterval(timer)
    }, 25)
    return () => clearInterval(timer)
  }, [])

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n + ''

  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>

      {/* شارة LIVE */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: '1px solid rgba(0,210,255,0.2)', borderRadius: 30, background: 'rgba(0,210,255,0.05)', fontSize: '0.73rem', color: 'var(--cyan)', letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace", marginBottom: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'blink 1.5s ease-in-out infinite', boxShadow: '0 0 8px var(--cyan)', display: 'inline-block' }} />
        LIVE · منصة موثوقة ومرخصة
      </div>

      {/* العنوان */}
      <h1 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
        تبادل العملات الرقمية
        <span style={{ fontFamily: "'Orbitron',sans-serif", background: 'linear-gradient(90deg,var(--cyan),var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginRight: 10 }}>
          NUMBER 1
        </span>
      </h1>

      {/* الوصف */}
      <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 18px', lineHeight: 1.75 }}>
        منصة Number 1 تقدم أفضل أسعار الصرف وأسرع معالجة للمعاملات مع حماية متكاملة لأموالك.
      </p>

      {/* زر تعرف علينا */}
      <button onClick={onAbout}
        style={{ background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', padding: '13px 30px', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.22s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--cyan-dim)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' }}>
        تعرف علينا
      </button>

      {/* الأرقام الإحصائية */}
      <div style={{ display: 'flex', gap: 30, justifyContent: 'center', marginTop: 26 }}>
        {[
          { val: fmt(counts.users),            label: 'مستخدم نشط' },
          { val: fmt(counts.transactions) + '+', label: 'معاملة ناجحة' },
          { val: counts.pairs + '+',             label: 'زوج تبادل' },
        ].map((k, i) => (
          <div key={i}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--cyan)', display: 'block', textShadow: '0 0 18px rgba(0,210,255,0.5)' }}>
              {k.val}
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeroSection