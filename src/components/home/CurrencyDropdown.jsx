// src/components/home/CurrencyDropdown.jsx
import { useState, useEffect, useRef } from 'react'

function CurrencyDropdown({ options, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // عرض أيقونة العملة كصورة كاملة بدون تلوين
  const CoinIcon = ({ method, size = 28 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
      <img
        src={method.icon}
        alt={method.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: open ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.05)', border: `1px solid ${open ? 'var(--border-2)' : 'var(--border-1)'}`, borderRadius: 9, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, userSelect: 'none', minWidth: 155 }}>
        <CoinIcon method={selected} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>{selected.name}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
            {selected.type === 'egp' ? 'جنيه مصري' : 'رقمي'}
          </div>
        </div>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.4, transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 210, background: 'var(--drop-bg)', border: '1px solid var(--border-2)', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,0.8)', zIndex: 500, overflow: 'hidden' }}>
          {options.map(c => (
            <div
              key={c.id}
              onClick={() => { onSelect(c); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: selected.id === c.id ? 'var(--cyan-dim)' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (selected.id !== c.id) e.currentTarget.style.background = 'var(--cyan-dim)' }}
              onMouseLeave={e => { if (selected.id !== c.id) e.currentTarget.style.background = 'transparent' }}>
              <CoinIcon method={c} size={32} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>{c.name}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {c.type === 'egp' ? 'جنيه مصري' : 'رقمي'}
                </div>
              </div>
              {selected.id === c.id && (
                <svg style={{ marginRight: 'auto', color: 'var(--cyan)' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CurrencyDropdown
