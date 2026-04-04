// src/pages/ExchangeSelect.jsx
// الصفحة 1 — اختيار وسيلة الإرسال ووسيلة الاستلام
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useLang from '../context/useLang'
import { SEND_METHODS, RECEIVE_METHODS } from '../data/currencies'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Method icon: صورة حقيقية أو fallback دائرة ────────
function MethodIcon({ method, size = 36 }) {
  const [err, setErr] = useState(false)
  if (method.img && !err) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <img src={method.img} alt={method.name} onError={() => setErr(true)} style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: method.color || '#26a17b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: size * 0.38, fontWeight: 700, color: '#fff' }}>
      {method.symbol}
    </div>
  )
}

// ── بطاقة وسيلة دفع ────────────────────────────────────
function MethodCard({ method, selected, onSelect, disabled }) {
  const isSelected = selected?.id === method.id
  return (
    <button
      onClick={() => !disabled && onSelect(method)}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', borderRadius: 14, width: '100%',
        border: isSelected
          ? `2px solid ${method.color || 'var(--cyan)'}`
          : '1.5px solid var(--border-1)',
        background: isSelected
          ? `${method.color || 'var(--cyan)'}12`
          : 'var(--card)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.18s',
        opacity: disabled ? 0.45 : 1,
        textAlign: 'right',
        boxShadow: isSelected ? `0 0 0 3px ${method.color || 'var(--cyan)'}22` : 'none',
      }}
    >
      <MethodIcon method={method} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? (method.color || 'var(--cyan)') : 'var(--text-1)', lineHeight: 1.2 }}>
          {method.name}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>
          {method.type === 'egp' ? 'جنيه مصري · EGP' : method.type === 'wallet' ? 'محفظة داخلية' : `${method.symbol} · رقمي`}
        </div>
      </div>
      {isSelected && (
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: method.color || 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
    </button>
  )
}

export default function ExchangeSelect() {
  const navigate = useNavigate()
  const { lang } = useLang()

  const [sendMethod,   setSendMethod]   = useState(null)
  const [recvMethod,   setRecvMethod]   = useState(null)
  const [adminMethods, setAdminMethods] = useState(null)  // من الـ API
  const [loading,      setLoading]      = useState(true)

  // جلب وسائل الدفع المفعّلة من الأدمن
  useEffect(() => {
    fetch(`${API}/api/public/payment-methods`)
      .then(r => r.json())
      .then(d => { if (d.success) setAdminMethods(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── فلترة الوسائل بناءً على ما فعّله الأدمن ──────────
  // وسائل الإرسال: إخفاء wallet-usdt إذا لم يسجّل دخول (نتركها مبدئياً)
  const sendMethods = SEND_METHODS

  // وسائل الاستلام: نُخفي wallet-recv دائماً من هنا (لحالة خاصة)
  const recvMethods = RECEIVE_METHODS.filter(m => m.id !== 'wallet-recv')

  // ── قواعد التوافق بين الوسائل ─────────────────────────
  const isCompatible = (send, recv) => {
    if (!send || !recv) return true
    // MoneyGo إرسال → USDT استلام فقط
    if (send.id === 'mgo-send') return recv.id === 'usdt-recv'
    // محفظة داخلية إرسال → MoneyGo استلام فقط
    if (send.id === 'wallet-usdt') return recv.id === 'mgo-recv'
    // USDT إرسال → لا يستلم USDT (نفس العملة بدون فائدة)
    if (send.id === 'usdt-trc' && recv.id === 'usdt-recv') return false
    return true
  }

  const handleContinue = () => {
    if (!sendMethod || !recvMethod) return
    navigate(`/exchange/form?from=${sendMethod.id}&to=${recvMethod.id}`)
  }

  const canContinue = sendMethod && recvMethod && isCompatible(sendMethod, recvMethod)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', direction: lang === 'ar' ? 'rtl' : 'ltr', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="es-header">
        <button onClick={() => navigate('/')} className="es-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          الرئيسية
        </button>
        <div className="es-header-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
          <span>اختيار طريقة التبادل</span>
        </div>
        <div style={{ width: 90 }} />
      </div>

      {/* ── Step indicator ── */}
      <div className="es-steps">
        <div className="es-step es-step--active">
          <span className="es-step-dot">1</span>
          <span>اختيار الطريقة</span>
        </div>
        <div className="es-step-line" />
        <div className="es-step es-step--inactive">
          <span className="es-step-dot es-step-dot--off">2</span>
          <span style={{ color: 'var(--text-3)' }}>تفاصيل الطلب</span>
        </div>
        <div className="es-step-line" />
        <div className="es-step es-step--inactive">
          <span className="es-step-dot es-step-dot--off">3</span>
          <span style={{ color: 'var(--text-3)' }}>تتبع الطلب</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="es-content">

        <p className="es-subtitle">اختر وسيلة الإرسال ووسيلة الاستلام للمتابعة</p>

        {loading ? (
          <div className="es-loading">
            <div className="es-spinner" />
            <span style={{ color: 'var(--text-3)' }}>جاري التحميل...</span>
          </div>
        ) : (
          <div className="es-columns">

            {/* ── عمود الإرسال ── */}
            <div className="es-column">
              <div className="es-column-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                <span style={{ color: 'var(--red)' }}>أنت ترسل</span>
              </div>
              <div className="es-methods-list">
                {sendMethods.map(m => (
                  <MethodCard
                    key={m.id}
                    method={m}
                    selected={sendMethod}
                    onSelect={(picked) => {
                      setSendMethod(picked)
                      // إذا الاختيار الحالي للاستلام غير متوافق → نصفّيه
                      if (recvMethod && !isCompatible(picked, recvMethod)) setRecvMethod(null)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── فاصل السهم ── */}
            <div className="es-arrow-divider">
              <div className="es-arrow-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>

            {/* ── عمود الاستلام ── */}
            <div className="es-column">
              <div className="es-column-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                <span style={{ color: 'var(--green)' }}>أنت تستلم</span>
              </div>
              <div className="es-methods-list">
                {recvMethods.map(m => {
                  const incompatible = sendMethod && !isCompatible(sendMethod, m)
                  return (
                    <MethodCard
                      key={m.id}
                      method={m}
                      selected={recvMethod}
                      onSelect={setRecvMethod}
                      disabled={incompatible}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ملخص الاختيار ── */}
        {sendMethod && recvMethod && (
          <div className="es-summary">
            <MethodIcon method={sendMethod} size={28} />
            <span className="es-summary-name">{sendMethod.name}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            <MethodIcon method={recvMethod} size={28} />
            <span className="es-summary-name">{recvMethod.name}</span>
          </div>
        )}

        {/* ── زر المتابعة ── */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="es-continue-btn"
          style={{ opacity: canContinue ? 1 : 0.45 }}
        >
          متابعة
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

      </div>
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────
const CSS = `
  @keyframes es-spin { to { transform: rotate(360deg) } }

  .es-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    background: var(--card); border-bottom: 1px solid var(--border-1);
    position: sticky; top: 0; z-index: 40;
  }
  .es-back {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px;
    border: 1px solid var(--border-1); background: transparent;
    color: var(--text-2); cursor: pointer; font-size: 0.85rem; font-weight: 600;
    font-family: 'Cairo',sans-serif; transition: all 0.15s;
  }
  .es-back:hover { border-color: var(--cyan); color: var(--cyan); }
  .es-header-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.95rem; font-weight: 800; color: var(--text-1);
    font-family: 'Orbitron',sans-serif; letter-spacing: 0.3px;
  }
  .es-steps {
    display: flex; align-items: center; justify-content: center;
    gap: 0; padding: 14px 24px;
    background: var(--card); border-bottom: 1px solid var(--border-1);
  }
  .es-step { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; }
  .es-step--active { color: var(--cyan); }
  .es-step--inactive { color: var(--text-3); }
  .es-step-dot {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: var(--cyan-dim); border: 1.5px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: var(--cyan);
  }
  .es-step-dot--off {
    background: transparent; border-color: var(--border-1); color: var(--text-3);
  }
  .es-step-line { width: 36px; height: 2px; background: var(--border-1); margin: 0 10px; }

  .es-content {
    max-width: 860px; margin: 0 auto;
    padding: 28px 16px 60px;
  }
  .es-subtitle {
    text-align: center; font-size: 0.9rem; color: var(--text-3);
    margin: 0 0 24px; font-family: 'Tajawal',sans-serif;
  }
  .es-loading {
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    padding: 60px 0;
  }
  .es-spinner {
    width: 30px; height: 30px; border-radius: 50%;
    border: 3px solid var(--border-1); border-top-color: var(--cyan);
    animation: es-spin 0.8s linear infinite;
  }
  .es-columns {
    display: grid;
    grid-template-columns: 1fr 48px 1fr;
    gap: 0; align-items: start;
  }
  .es-column { display: flex; flex-direction: column; gap: 0; }
  .es-column-header {
    display: flex; align-items: center; gap: 7px;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.8px;
    text-transform: uppercase; font-family: 'JetBrains Mono',monospace;
    padding: 0 4px 10px; margin-bottom: 10px;
    border-bottom: 1px solid var(--border-1);
  }
  .es-methods-list { display: flex; flex-direction: column; gap: 8px; }
  .es-arrow-divider {
    display: flex; align-items: center; justify-content: center;
    padding-top: 54px;
  }
  .es-arrow-circle {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--cyan-dim); border: 1.5px solid var(--border-2);
    display: flex; align-items: center; justify-content: center;
  }
  .es-summary {
    display: flex; align-items: center; gap: 10px; justify-content: center;
    margin: 22px 0 0;
    padding: 14px 20px; border-radius: 12px;
    background: rgba(0,210,255,0.05); border: 1px solid var(--border-2);
  }
  .es-summary-name { font-size: 0.88rem; font-weight: 700; color: var(--text-1); }
  .es-continue-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; max-width: 360px; margin: 20px auto 0;
    padding: 14px 0;
    background: linear-gradient(135deg,#009fc0,#006e9e);
    border: none; border-radius: 13px; color: #fff;
    font-family: 'Cairo','Tajawal',sans-serif;
    font-size: 1rem; font-weight: 800; cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,159,192,0.28);
    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
  }
  .es-continue-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(0,159,192,0.38);
  }
  .es-continue-btn:disabled { cursor: not-allowed; }

  @media (max-width: 640px) {
    .es-columns {
      grid-template-columns: 1fr;
      gap: 24px;
    }
    .es-arrow-divider {
      padding-top: 0;
      transform: rotate(90deg);
    }
    .es-step span:not(.es-step-dot) { display: none; }
    .es-step-line { width: 20px; }
  }
`
