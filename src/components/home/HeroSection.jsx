// src/components/home/HeroSection.jsx
import { useState, useEffect, useRef } from 'react'

// hook قابل للاستدعاء من الخارج لإعادة تشغيل العداد
export function useCounterTrigger() {
  const [tick, setTick] = useState(0)
  const fire = () => setTick(t => t + 1)
  return { tick, fire }
}

function AnimatedCounter({ target, suffix = '', duration = 1500 }) {
  const [value, setValue] = useState(0)
  const [running, setRunning] = useState(false)
  const rafRef = useRef(null)

  const start = () => {
    if (running) return
    setRunning(true)
    setValue(0)
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.floor(target * ease))
      if (progress < 1) { rafRef.current = requestAnimationFrame(step) }
      else { setValue(target); setRunning(false) }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  // تشغيل عند أول تحميل
  useEffect(() => { start(); return () => cancelAnimationFrame(rafRef.current) }, [])

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)

  return <span>{fmt(value)}{suffix}</span>
}

function HeroSection({ onAbout, counterKey = 0 }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 36 }}>

      {/* LIVE badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: '1px solid rgba(0,210,255,0.2)', borderRadius: 30, background: 'rgba(0,210,255,0.05)', fontSize: '0.73rem', color: 'var(--cyan)', letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace", marginBottom: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'blink 1.5s ease-in-out infinite', boxShadow: '0 0 8px var(--cyan)', display: 'inline-block' }} />
        LIVE · منصة موثوقة ومرخصة
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
        تبادل العملات الرقمية
        <span style={{ fontFamily: "'Orbitron',sans-serif", background: 'linear-gradient(90deg,var(--cyan),var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginRight: 10 }}>
          NUMBER 1
        </span>
      </h1>

      <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 18px', lineHeight: 1.75 }}>
        منصة Number 1 تقدم أفضل أسعار الصرف وأسرع معالجة للمعاملات مع حماية متكاملة لأموالك.
      </p>

      <button onClick={onAbout}
        style={{ background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', padding: '13px 30px', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.22s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--cyan-dim)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' }}>
        تعرف علينا
      </button>

      {/* Stats — key prop triggers remount = rerun animation */}
      <div key={counterKey} style={{ display: 'flex', gap: 30, justifyContent: 'center', marginTop: 26 }}>
        {[
          { target: 52000,  suffix: '',  label: 'مستخدم نشط'   },
          { target: 980000, suffix: '+', label: 'معاملة ناجحة' },
          { target: 50,     suffix: '+', label: 'زوج تبادل'    },
        ].map((k, i) => (
          <div key={i}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--cyan)', display: 'block', textShadow: '0 0 18px rgba(0,210,255,0.5)' }}>
              <AnimatedCounter key={`${counterKey}-${i}`} target={k.target} suffix={k.suffix} />
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeroSection
