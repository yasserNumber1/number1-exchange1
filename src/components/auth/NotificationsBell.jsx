// src/components/auth/NotificationsBell.jsx
import { useState, useRef, useEffect } from 'react'

const DEMO_NOTIFS = [
  { id: 1, icon: 'https://cdn-icons-png.flaticon.com/32/2091/2091539.png', title: 'سعر BTC ارتفع 2.4%',              time: 'منذ 5 دقائق',   read: false },
  { id: 2, icon: 'https://cdn-icons-png.flaticon.com/32/4315/4315445.png', title: 'تم تأكيد طلب التبادل #1042',       time: 'منذ 18 دقيقة',  read: false },
  { id: 3, icon: 'https://cdn-icons-png.flaticon.com/32/2092/2092663.png', title: 'تسجيل دخول جديد من جهازك',         time: 'منذ ساعة',       read: true  },
  { id: 4, icon: 'https://cdn-icons-png.flaticon.com/32/3523/3523887.png', title: 'عرض خاص: رسوم 0% لمدة 24 ساعة',   time: 'منذ 3 ساعات',   read: true  },
]

function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(DEMO_NOTIFS)
  const ref = useRef(null)

  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--cyan-dim)' : 'transparent',
          border: `1px solid ${open ? 'var(--border-2)' : 'var(--border-1)'}`,
          cursor: 'pointer', transition: 'all 0.22s', position: 'relative',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--cyan-dim)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-1)' } }}>
        <img src="https://cdn-icons-png.flaticon.com/32/3602/3602145.png" alt="notifications" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 17, height: 17, borderRadius: '50%',
            background: 'var(--red)', color: '#fff',
            fontSize: '0.6rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)', fontFamily: "'JetBrains Mono',monospace",
          }}>{unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          width: 300, background: 'var(--drop-bg)',
          border: '1px solid var(--border-1)', borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          zIndex: 200, overflow: 'hidden', animation: 'fadeDown 0.15s ease',
        }}>
          {/* header */}
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-1)' }}>الإشعارات</span>
            {unread > 0 && (
              <button onClick={markAll} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.75rem', fontFamily: "'Tajawal',sans-serif", cursor: 'pointer', fontWeight: 700 }}>
                تحديد الكل مقروء
              </button>
            )}
          </div>

          {/* list */}
          {notifs.map((n, i) => (
            <div
              key={n.id}
              onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 11,
                padding: '12px 16px',
                background: n.read ? 'transparent' : 'rgba(0,210,255,0.04)',
                borderBottom: i < notifs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,210,255,0.04)'}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={n.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: n.read ? 400 : 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{n.title}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>{n.time}</div>
              </div>
              {!n.read && (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, marginTop: 4, boxShadow: '0 0 6px var(--cyan)' }} />
              )}
            </div>
          ))}

          {notifs.every(n => n.read) && (
            <div style={{ padding: '18px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-3)' }}>لا توجد إشعارات جديدة ✓</div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsBell
