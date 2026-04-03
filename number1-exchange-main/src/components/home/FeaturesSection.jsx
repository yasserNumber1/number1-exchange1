// src/components/home/FeaturesSection.jsx
import { useState } from 'react'
import { FEATURES } from './exchangeData'

function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`feature-card${hovered ? ' hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* top shimmer line */}
      <div className="feature-shimmer" style={{ opacity: hovered ? 1 : 0 }} />

      {/* Icon box */}
      <div className={`feature-icon-box${hovered ? ' hovered' : ''}`}>
        <img
          src={feature.iconUrl}
          alt={feature.title}
          loading="lazy"
          width="56"
          height="56"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-desc">{feature.desc}</p>
    </div>
  )
}

function FeaturesSection() {
  return (
    <>
      <style>{`
        /* ── Feature Cards — Dark Mode (default) ── */
        .feature-card {
          background: var(--card);
          border: 1px solid var(--border-1);
          border-radius: 20px;
          padding: 30px 24px;
          text-align: center;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 0 rgba(0,0,0,0.2);
        }
        .feature-card.hovered {
          border-color: rgba(0,210,255,0.28);
          transform: translateY(-6px);
          box-shadow: 0 24px 56px rgba(0,0,0,0.3);
        }

        .feature-shimmer {
          position: absolute; top: 0; left: 20%; width: 60%; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          transition: opacity 0.3s;
        }

        .feature-icon-box {
          width: 80px; height: 80px; border-radius: 22px;
          background: rgba(0,210,255,0.08);
          border: 1.5px solid rgba(0,210,255,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          padding: 12px;
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s, border-color 0.3s;
        }
        .feature-icon-box.hovered {
          transform: scale(1.1) rotate(3deg);
          background: rgba(0,210,255,0.14);
          border-color: rgba(0,210,255,0.4);
          box-shadow: 0 0 28px rgba(0,210,255,0.2);
        }

        .feature-title {
          font-size: 0.98rem;
          font-weight: 800;
          margin: 0 0 10px;
          color: var(--text-1);
          letter-spacing: -0.2px;
        }

        .feature-desc {
          font-size: 0.82rem;
          color: var(--text-2);
          line-height: 1.85;
          margin: 0;
        }

        /* ── Light Mode Overrides ── */
        html.light .feature-card {
          border: 1.5px solid rgba(0, 0, 0, 0.12);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0,0,0,0.05);
        }
        html.light .feature-card.hovered {
          border-color: rgba(0, 119, 182, 0.45);
          box-shadow: 0 16px 44px rgba(0, 119, 182, 0.12), 0 4px 12px rgba(0,0,0,0.08);
        }

        html.light .feature-shimmer {
          background: linear-gradient(90deg, transparent, rgba(0,119,182,0.7), transparent);
        }

        html.light .feature-icon-box {
          background: rgba(0, 119, 182, 0.08);
          border-color: rgba(0, 119, 182, 0.25);
        }
        html.light .feature-icon-box.hovered {
          background: rgba(0, 119, 182, 0.14);
          border-color: rgba(0, 119, 182, 0.5);
          box-shadow: 0 0 24px rgba(0, 119, 182, 0.18);
        }

        html.light .feature-title {
          color: #0d1b2a;
          font-weight: 800;
        }

        html.light .feature-desc {
          color: #2d4a63;
          font-weight: 500;
        }

        /* ── Section header light overrides ── */
        html.light .features-badge {
          border-color: rgba(0, 119, 182, 0.3) !important;
          background: rgba(0, 119, 182, 0.07) !important;
        }
        html.light .features-heading {
          color: #0d1b2a !important;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            className="features-badge"
            style={{
              display: 'inline-block',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: '0.68rem', letterSpacing: 3, textTransform: 'uppercase',
              color: 'var(--cyan)', marginBottom: 12, padding: '4px 14px',
              border: '1px solid rgba(0,210,255,0.18)', borderRadius: 20,
              background: 'rgba(0,210,255,0.05)',
            }}
          >
            WHY NUMBER 1
          </div>
          <h2
            className="features-heading"
            style={{
              fontSize: 'clamp(1.55rem,2.8vw,2.3rem)',
              fontWeight: 900, marginBottom: 9,
              color: 'var(--text-1)',
            }}
          >
            لماذا نحن الأفضل؟
          </h2>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} />)}
        </div>
      </div>
    </>
  )
}

export default FeaturesSection
