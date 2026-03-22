// src/components/home/FeaturesSection.jsx
import { useState } from 'react'
import { FEATURES } from './exchangeData'

function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card)',
        border: `1px solid ${hovered ? 'rgba(0,210,255,0.22)' : 'var(--border-1)'}`,
        borderRadius: 20, padding: '30px 24px', textAlign: 'center',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 56px rgba(0,0,0,0.3)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
      {/* top shimmer */}
      <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: 1, background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }} />

      {/* Icon box */}
      <div style={{
        width: 80, height: 80, borderRadius: 22,
        background: 'rgba(0,210,255,0.07)',
        border: '1px solid rgba(0,210,255,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        transition: 'transform 0.3s, box-shadow 0.3s',
        transform: hovered ? 'scale(1.1) rotate(3deg)' : 'none',
        boxShadow: hovered ? '0 0 28px rgba(0,210,255,0.18)' : 'none',
        padding: 12,
      }}>
        <img
          src={feature.iconUrl}
          alt={feature.title}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-1)' }}>{feature.title}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.8 }}>{feature.desc}</p>
    </div>
  )
}

function FeaturesSection() {
  return (
    <div style={{ marginTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-block', fontFamily: "'JetBrains Mono',monospace",
          fontSize: '0.68rem', letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--cyan)', marginBottom: 11, padding: '3px 11px',
          border: '1px solid rgba(0,210,255,0.14)', borderRadius: 20,
          background: 'rgba(0,210,255,0.04)',
        }}>
          WHY NUMBER 1
        </div>
        <h2 style={{ fontSize: 'clamp(1.55rem,2.8vw,2.3rem)', fontWeight: 900, marginBottom: 9 }}>لماذا نحن الأفضل؟</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} />)}
      </div>
    </div>
  )
}

export default FeaturesSection
