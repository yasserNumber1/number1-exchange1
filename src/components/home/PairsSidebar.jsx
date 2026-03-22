// src/components/home/PairsSidebar.jsx
import { PAIRS } from '../../data/currencies'

function PairsSidebar() {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '17px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>أزواج التبادل المدعومة</h3>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PAIRS.map((p, i) => (
          <div key={i}
            style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 13, padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

            {/* Coin stack */}
            <div style={{ display: 'flex', width: 46, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--bg)', flexShrink: 0 }}>
                <img src={p.fromIcon} alt={p.from} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--bg)', marginRight: -12, flexShrink: 0 }}>
                <img src={p.toIcon} alt={p.to} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-1)' }}>
                {p.from} <span style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{p.fromNet}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>→ {p.to} {p.toNet}</div>
            </div>

            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.7, flexShrink: 0 }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PairsSidebar
