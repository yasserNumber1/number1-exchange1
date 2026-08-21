// src/components/shared/ReviewPrompt.jsx
// ─── Persistent Trustpilot Review Button + Celebration Modal ───
import { useState, useEffect } from 'react'
import useLang from '../../context/useLang'

const TRUSTPILOT_URL = 'https://www.trustpilot.com/review/yasser-number1.com'
const STORAGE_KEY = 'n1_review_dismissed'

// ── Animated Stars ─────────────────────────────────────────────
function Stars({ animate }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', margin: '6px 0' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="#f59e0b"
          stroke="none"
          style={{
            opacity: animate ? 1 : 0.3,
            transform: animate ? 'scale(1)' : 'scale(0.7)',
            transition: `opacity 0.3s ${i * 0.08}s, transform 0.35s ${i * 0.08}s`,
          }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

// ── Celebration Modal ─────────────────────────────────────────
export function ReviewModal({ open, onClose }) {
  const [animate, setAnimate] = useState(false)

  const { lang } = useLang()
  const isAr = lang === 'ar'
  const tr = (ar, en) => (isAr ? ar : en)

  useEffect(() => {
    if (open) setTimeout(() => setAnimate(true), 80)
    else setAnimate(false)
  }, [open])

  if (!open) return null

  const handleClose = () => {
    onClose()
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'rp-fade-in 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)',
          border: '1px solid rgba(0,229,160,0.25)',
          borderRadius: 20,
          padding: '32px 28px 28px',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'Cairo','Tajawal',sans-serif",
          direction: isAr ? 'rtl' : 'ltr',
          position: 'relative',
          boxShadow:
            '0 0 40px rgba(0,229,160,0.12), 0 20px 60px rgba(0,0,0,0.5)',
          animation: 'rp-slide-up 0.3s ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 14,
            left: isAr ? 14 : 'auto',
            right: !isAr ? 14 : 'auto',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#8b949e',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Celebration Icon */}
        <div style={{ fontSize: 52, marginBottom: 4, lineHeight: 1 }}>
          🎉
        </div>

        <h2
          style={{
            margin: '8px 0 4px',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#00e5a0',
          }}
        >
          {tr(
            'تم إتمام طلبك بنجاح!',
            'Your order has been completed successfully!'
          )}
        </h2>

        <p
          style={{
            margin: '6px 0 4px',
            fontSize: '0.88rem',
            color: '#8b949e',
            lineHeight: 1.6,
          }}
        >
          {tr(
            'لو كنت راضي عن الخدمة، يهمنا جداً تكتب تقييم بسيط عن تجربتك',
            "If you're satisfied with our service, we'd really appreciate a short review about your experience."
          )}
        </p>

        <Stars animate={animate} />

        <p
          style={{
            margin: '4px 0 20px',
            fontSize: '0.8rem',
            color: '#6e7681',
          }}
        >
          {tr(
            'مش هيأخد منك دقيقتين، ويفرق معانا جداً 🙏',
            'It will only take a couple of minutes and would mean a lot to us 🙏'
          )}
        </p>

        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, '1')
            } catch {}
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #00b67a, #00e5a0)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.95rem',
            padding: '13px 24px',
            borderRadius: 12,
            textDecoration: 'none',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 4px 20px rgba(0,229,160,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow =
              '0 6px 28px rgba(0,229,160,0.45)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow =
              '0 4px 20px rgba(0,229,160,0.3)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>

          {tr(
            'اكتب تقييمك على Trustpilot',
            'Write a review on Trustpilot'
          )}
        </a>

        <button
          onClick={handleClose}
          style={{
            marginTop: 10,
            background: 'transparent',
            border: 'none',
            color: '#6e7681',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: "'Cairo','Tajawal',sans-serif",
          }}
        >
          {tr('ربما لاحقاً', 'Maybe later')}
        </button>

        <style>{`
          @keyframes rp-fade-in {
            from { opacity: 0 }
            to { opacity: 1 }
          }

          @keyframes rp-slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

// ── Floating Button ───────────────────────────────────────────
export function ReviewFloatingBtn() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  const { lang } = useLang()
  const isAr = lang === 'ar'
  const tr = (ar, en) => (isAr ? ar : en)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={tr('قيّم خدمتنا', 'Rate our service')}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'linear-gradient(135deg, #00b67a, #00875a)',
          color: '#fff',
          border: 'none',
          borderRadius: 50,
          padding: '10px 16px 10px 12px',
          cursor: 'pointer',
          fontFamily: "'Cairo','Tajawal',sans-serif",
          fontWeight: 700,
          fontSize: '0.82rem',
          boxShadow: '0 4px 20px rgba(0,182,122,0.4)',
          transition: 'opacity 0.4s, transform 0.4s',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: visible ? 'auto' : 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {tr('قيّم الخدمة', 'Rate Service')}
      </button>

      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}