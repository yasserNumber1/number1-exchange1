// src/components/home/ReviewsSidebar.jsx
import { REVIEWS } from './exchangeData'

function ReviewsSidebar() {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '17px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⭐</div>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, flex: 1 }}>تقييمات العملاء</h3>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--green)', fontWeight: 700 }}>4.98/5</span>
      </div>
      {REVIEWS.map((r, i) => (
        <div key={i} style={{ padding: '13px 18px', borderBottom: i < REVIEWS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
            <div style={{ width: 31, height: 31, borderRadius: 9, background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0, color: '#fff' }}>{r.name[0]}</div>
            <span style={{ fontSize: '0.83rem', fontWeight: 700 }}>{r.name}</span>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-3)', marginRight: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{r.date}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', paddingRight: 40 }}>{r.text}</div>
          <div style={{ fontSize: '0.7rem', paddingRight: 40, marginTop: 3 }}>⭐⭐⭐⭐⭐</div>
        </div>
      ))}
      <button style={{ width: '100%', padding: 10, background: 'transparent', border: 'none', borderTop: '1px solid var(--border-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,210,255,0.04)'; e.currentTarget.style.color = 'var(--cyan)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}>
        عرض الكل — 1,240+ تقييم
      </button>
    </div>
  )
}

export default ReviewsSidebar