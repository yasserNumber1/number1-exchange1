// src/components/home/ReviewsSidebar.jsx
import { useState } from 'react'
import useAuth from '../../context/useAuth'
import { REVIEWS } from './exchangeData'

function Stars({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2, direction: 'ltr' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: '0.85rem', color: i <= count ? '#f59e0b' : 'var(--border-1)' }}>★</span>
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 3, direction: 'ltr' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(0)}
          onClick={() => onChange(i)}
          style={{ fontSize: '1.2rem', cursor: 'pointer', color: i <= (hov || value) ? '#f59e0b' : 'var(--border-1)', transition: 'color 0.15s' }}>
          ★
        </span>
      ))}
    </div>
  )
}

function ReviewsSidebar() {
  const { user, isLoggedIn } = useAuth()
  const [localReviews, setLocalReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [stars, setStars] = useState(5)
  const [submitted, setSubmitted] = useState(false)

  const allReviews = [...localReviews, ...REVIEWS]

  const handleSubmit = () => {
    if (!text.trim()) return
    const now = new Date()
    const date = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`
    setLocalReviews(prev => [{
      name: user.fullName,
      avatarIcon: user.avatar?.url || null,
      color: '#00d2ff',
      date,
      text: text.trim(),
      stars,
      isUser: true,
    }, ...prev])
    setText(''); setStars(5); setShowForm(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '17px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="https://cdn-icons-png.flaticon.com/32/1828/1828884.png" alt="star" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        </div>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, flex: 1 }}>تقييمات العملاء</h3>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--green)', fontWeight: 700 }}>4.98/5</span>
      </div>

      {/* Reviews list */}
      {allReviews.map((r, i) => (
        <div key={i} style={{ padding: '13px 18px', borderBottom: i < allReviews.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
            {/* Avatar */}
            <div style={{ width: 31, height: 31, borderRadius: 9, overflow: 'hidden', border: '1px solid rgba(0,210,255,0.2)', flexShrink: 0, background: r.color ? `${r.color}22` : 'var(--cyan-dim)' }}>
              <img
                src={r.avatarIcon || `https://cdn-icons-png.flaticon.com/64/4140/4140048.png`}
                alt={r.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <span style={{ fontSize: '0.83rem', fontWeight: 700 }}>{r.name}</span>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-3)', marginRight: 'auto', fontFamily: "'JetBrains Mono',monospace" }}>{r.date}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', paddingRight: 40 }}>{r.text}</div>
          <div style={{ paddingRight: 40, marginTop: 3 }}>
            <Stars count={r.stars || 5} />
          </div>
        </div>
      ))}

      {/* Logged-in: add review */}
      {isLoggedIn ? (
        <div style={{ borderTop: '1px solid var(--border-1)' }}>
          {submitted && (
            <div style={{ padding: '8px 16px', fontSize: '0.78rem', color: 'var(--green)', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <img src="https://cdn-icons-png.flaticon.com/32/4315/4315445.png" style={{ width: 13, height: 13 }} />
              تم إرسال تقييمك
            </div>
          )}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              style={{ width: '100%', padding: 10, background: 'transparent', border: 'none', fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              + أضف تقييمك
            </button>
          ) : (
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>
                تقييمك كـ: {user.fullName}
              </div>
              <StarPicker value={stars} onChange={setStars} />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="شاركنا تجربتك..."
                rows={2}
                style={{ width: '100%', marginTop: 8, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.83rem', outline: 'none', resize: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-1)'}
              />
              <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                <button onClick={handleSubmit} style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 9, fontFamily: "'Tajawal',sans-serif", fontSize: '0.83rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>إرسال</button>
                <button onClick={() => setShowForm(false)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--border-1)', borderRadius: 9, fontFamily: "'Tajawal',sans-serif", fontSize: '0.83rem', color: 'var(--text-2)', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ borderTop: '1px solid var(--border-1)', padding: '10px 16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <img src="https://cdn-icons-png.flaticon.com/32/3064/3064197.png" style={{ width: 13, height: 13, opacity: 0.5 }} alt="lock"/>
          سجّل دخولك لإضافة تقييم
        </div>
      )}
    </div>
  )
}

export default ReviewsSidebar
