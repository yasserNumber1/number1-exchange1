// src/components/home/CurrencyDropdown.jsx
import { useState, useEffect, useRef } from 'react'

function CurrencyDropdown({ options, selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    // اغلاق القائمة فقط عند الضغط خارج الصندوق
    const handleOutsideClick = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  const CoinIcon = ({ method, size = 28 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
      <img src={method.icon} alt={method.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )

  return (
    <div ref={ref} style={{
      position: 'relative',
      minWidth: 155,
      flexShrink: 0,
    }}>
      <div
        onClick={(event) => {
          // منع أي مستمعات خارجية من التدخل مع toggle
          event.stopPropagation()
          setOpen((prev) => !prev)
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          background: open ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'var(--border-2)' : 'var(--border-1)'}`,
          borderRadius: 9, cursor: 'pointer', transition: 'all 0.2s',
          flexShrink: 0, userSelect: 'none', minWidth: 155,
        }}
      >
        <CoinIcon method={selected} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>{selected.name}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
            {selected.type === 'egp' ? 'جنيه مصري' : 'رقمي'}
          </div>
        </div>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ opacity: 0.4, transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* القائمة */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          minWidth: 220, background: 'var(--drop-bg, #0d1117)',
          border: '1px solid var(--border-2)', borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          zIndex: 9999, overflow: 'hidden', padding: '4px',
        }}>
          {options.map(c => (
            <div
              key={c.id}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(c)
                setOpen(false)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', cursor: 'pointer', borderRadius: 8,
                background: selected.id === c.id ? 'var(--cyan-dim)' : 'transparent',
                transition: 'background 0.13s',
              }}
              onMouseEnter={e => { if (selected.id !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (selected.id !== c.id) e.currentTarget.style.background = 'transparent' }}
            >
              <CoinIcon method={c} size={26} />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-1)' }}>{c.name}</span>
              {selected.id === c.id && (
                <svg style={{ marginRight: 'auto', color: 'var(--cyan)', flexShrink: 0 }} width="13" height="13" viewBox="0 0 24 24" fill="none">
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
