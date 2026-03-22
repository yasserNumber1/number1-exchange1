// src/components/home/PromoBanner.jsx
function PromoBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 18, padding: '20px 26px', marginBottom: 36, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
      <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src="https://cdn-icons-png.flaticon.com/64/3523/3523887.png" alt="offer" style={{ width: 28, height: 28, objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '0.93rem', fontWeight: 800, marginBottom: 3 }}>عرض ترحيبي حصري للمستخدمين الجدد!</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>رسوم مخفضة على أول 5 عمليات تبادل وكوبون خصم 20% على الرسوم الشهرية.</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {['FEE 0.1%', 'INSTANT', '24/7 SUPPORT', 'NO MINIMUM'].map(tag => (
            <span key={tag} style={{ padding: '2px 10px', background: 'rgba(200,168,75,0.07)', border: '1px solid rgba(200,168,75,0.18)', borderRadius: 20, fontSize: '0.67rem', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromoBanner
