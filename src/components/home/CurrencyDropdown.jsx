// src/components/home/CurrencyDropdown.jsx
// قائمة اختيار العملة المنسدلة — تُستخدم في نموذج التبادل

import { useState, useEffect, useRef } from 'react'

function CurrencyDropdown({ options, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* الزر الرئيسي */}
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: open ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.05)', border: `1px solid ${open ? 'var(--border-2)' : 'var(--border-1)'}`, borderRadius: 9, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, userSelect: 'none', minWidth: 150 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {selected.symbol}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selected.name}</div>
          {selected.flag && (
            <div style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>
              {selected.flag} {selected.type === 'egp' ? 'جنيه مصري' : 'رقمي'}
            </div>
          )}
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>

      {/* القائمة المنسدلة */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 210, background: 'var(--drop-bg)', border: '1px solid var(--border-2)', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,0.8)', zIndex: 500, overflow: 'hidden' }}>
          {options.map(c => (
            <div key={c.id} onClick={() => { onSelect(c); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: selected.id === c.id ? 'var(--cyan-dim)' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (selected.id !== c.id) e.currentTarget.style.background = 'var(--cyan-dim)' }}
              onMouseLeave={e => { if (selected.id !== c.id) e.currentTarget.style.background = 'transparent' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', fontWeight: 700, color: '#fff' }}>
                {c.symbol}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.name}</div>
                {c.flag && <div style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>{c.flag} {c.type === 'egp' ? 'جنيه مصري' : 'رقمي'}</div>}
              </div>
              {selected.id === c.id && (
                <span style={{ marginRight: 'auto', color: 'var(--cyan)', fontSize: '0.8rem' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CurrencyDropdown