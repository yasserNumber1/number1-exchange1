// src/components/home/FeaturesSection.jsx
import { useState } from 'react'
import { FEATURES } from './exchangeData'

function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: 'var(--card)', border: `1px solid ${hovered ? 'rgba(0,210,255,0.2)' : 'var(--border-1)'}`, borderRadius: 20, padding: '26px 22px', textAlign: 'center', transition: 'all 0.3s', transform: hovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.3)' : 'none', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: '25%', width: '50%', height: 1, background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }} />
      <div style={{ width: 62, height: 62, borderRadius: 18, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 17px', fontSize: '1.6rem', transition: 'transform 0.3s', transform: hovered ? 'scale(1.1) rotate(4deg)' : 'none' }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 8 }}>{feature.title}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{feature.desc}</p>
    </div>
  )
}

function FeaturesSection() {
  return (
    <div style={{ marginTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-block', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 11, padding: '3px 11px', border: '1px solid rgba(0,210,255,0.14)', borderRadius: 20, background: 'rgba(0,210,255,0.04)' }}>
          WHY NUMBER 1
        </div>
        <h2 style={{ fontSize: 'clamp(1.55rem,2.8vw,2.3rem)', fontWeight: 900, marginBottom: 9 }}>لماذا نحن الأفضل؟</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} />)}
      </div>
    </div>
  )
}

export default FeaturesSection