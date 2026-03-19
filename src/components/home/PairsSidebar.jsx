// src/components/home/PairsSidebar.jsx
import { PAIRS } from '../../data/currencies'

function PairsSidebar() {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '17px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💱</div>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>أزواج التبادل</h3>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PAIRS.map((p, i) => (
          <div key={i}
            style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 13, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ display: 'flex', width: 42, flexShrink: 0 }}>
              <div style={{ width: 25, height: 25, borderRadius: '50%', background: p.fromColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', fontWeight: 700, color: '#fff', border: '2px solid var(--bg)' }}>{p.fromSym}</div>
              <div style={{ width: 25, height: 25, borderRadius: '50%', background: p.toColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', fontWeight: 700, color: '#fff', border: '2px solid var(--bg)', marginRight: -10 }}>{p.toSym}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{p.from} {p.fromNet}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>→ {p.to} {p.toNet}</div>
            </div>
            <span style={{ color: 'var(--cyan)', fontSize: '0.95rem', flexShrink: 0 }}>←</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PairsSidebar