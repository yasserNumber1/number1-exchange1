// src/pages/ExchangeSelect.jsx
// الصفحة 1 — اختيار وسيلة الإرسال والاستلام (تصميم لوحتين جانبيتين)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEND_METHODS, RECEIVE_METHODS } from '../data/currencies'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Method icon ──────────────────────────────────────
function MethodIcon({ method, size = 32 }) {
  const [err, setErr] = useState(false)
  if (method.img && !err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: '#fff', flexShrink: 0, overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={method.img} alt={method.name}
          onError={() => setErr(true)}
          style={{ width: '78%', height: '78%', objectFit: 'contain' }}
        />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: method.color || '#26a17b', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: size * 0.38, fontWeight: 700, color: '#fff',
    }}>
      {method.symbol}
    </div>
  )
}

// ── حساب السعر ──────────────────────────────────────
function resolveRate(rates, sendId, recvId) {
  if (!rates) return null
  if (sendId === 'mgo-send')    return rates.moneygoRate   || null
  if (sendId === 'wallet-usdt') return rates.usdtBuyRate   || null
  if (recvId  === 'usdt-recv')  return rates.usdtBuyRate   || null
  if (recvId  === 'mgo-recv')   return rates.vodafoneBuyRate || rates.usdtBuyRate || null
  return rates.usdtBuyRate || null
}

// ── قواعد التوافق ────────────────────────────────────
function isCompatible(send, recv) {
  if (!send || !recv) return true
  if (send.id === 'mgo-send')    return recv.id === 'usdt-recv'
  if (send.id === 'wallet-usdt') return recv.id === 'mgo-recv'
  if (send.id === 'usdt-trc' && recv.id === 'usdt-recv') return false
  return true
}

// ── صف وسيلة الإرسال ────────────────────────────────
function SendRow({ method, selected, onSelect }) {
  const isSelected = selected?.id === method.id
  return (
    <div
      onClick={() => onSelect(method)}
      className={`es-row ${isSelected ? 'es-row--active' : ''}`}
    >
      <MethodIcon method={method} size={34} />
      <div className="es-row-info">
        <span className="es-row-name">{method.name}</span>
        <span className="es-row-sub">
          {method.type === 'egp' ? 'EGP · جنيه مصري'
            : method.type === 'wallet' ? 'محفظة داخلية'
            : `${method.symbol} · رقمي`}
        </span>
      </div>
    </div>
  )
}

// ── صف وسيلة الاستلام ───────────────────────────────
function RecvRow({ method, selected, onSelect, disabled, rate }) {
  const isSelected = selected?.id === method.id
  return (
    <div
      onClick={() => !disabled && onSelect(method)}
      className={`es-row es-row--recv ${isSelected ? 'es-row--active' : ''} ${disabled ? 'es-row--disabled' : ''}`}
    >
      <MethodIcon method={method} size={34} />
      <div className="es-row-info">
        <span className="es-row-name">{method.name}</span>
        <span className="es-row-sub">{method.symbol}</span>
      </div>
      <div className="es-row-rate">
        {rate != null
          ? <span className="es-rate-val">1 → {Number(rate).toFixed(4)}</span>
          : <span className="es-rate-dash">—</span>
        }
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
export default function ExchangeSelect() {
  const navigate = useNavigate()

  const [sendMethod, setSendMethod] = useState(null)
  const [recvMethod, setRecvMethod] = useState(null)
  const [rates,      setRates]      = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    fetch(`${API}/api/public/rates`)
      .then(r => r.json())
      .then(d => { if (d.success) setRates(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const recvMethods = RECEIVE_METHODS.filter(m => m.id !== 'wallet-recv')

  const handleSendSelect = (m) => {
    setSendMethod(m)
    if (recvMethod && !isCompatible(m, recvMethod)) setRecvMethod(null)
  }

  const canContinue = sendMethod && recvMethod && isCompatible(sendMethod, recvMethod)

  const handleContinue = () => {
    if (!canContinue) return
    navigate(`/exchange/form?from=${sendMethod.id}&to=${recvMethod.id}`)
  }

  return (
    <div className="es-page">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="es-header">
        <button onClick={() => navigate('/')} className="es-back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          الرئيسية
        </button>
        <div className="es-header-title">تبادل العملات</div>
        <div style={{ width: 80 }} />
      </div>

      {/* ── Steps ── */}
      <div className="es-steps">
        <div className="es-step es-step--active">
          <span className="es-dot">1</span>
          <span>الطريقة</span>
        </div>
        <div className="es-step-line" />
        <div className="es-step">
          <span className="es-dot es-dot--off">2</span>
          <span style={{ color: 'var(--text-3)' }}>تفاصيل الطلب</span>
        </div>
        <div className="es-step-line" />
        <div className="es-step">
          <span className="es-dot es-dot--off">3</span>
          <span style={{ color: 'var(--text-3)' }}>تتبع الطلب</span>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="es-main">

        {loading ? (
          <div className="es-loader">
            <div className="es-spinner" />
          </div>
        ) : (
          <div className="es-panels">

            {/* ── لوحة الإرسال ── */}
            <div className="es-panel">
              <div className="es-panel-header">
                <span className="es-panel-title">أنت ترسل</span>
              </div>
              <div className="es-panel-body">
                {SEND_METHODS.map(m => (
                  <SendRow
                    key={m.id}
                    method={m}
                    selected={sendMethod}
                    onSelect={handleSendSelect}
                  />
                ))}
              </div>
            </div>

            {/* ── فاصل ── */}
            <div className="es-divider-arrow">
              <div className="es-arrow-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>

            {/* ── لوحة الاستلام ── */}
            <div className="es-panel">
              <div className="es-panel-header">
                <span className="es-panel-title">أنت تستلم</span>
                <span className="es-panel-col-label">السعر</span>
              </div>
              <div className="es-panel-body">
                {recvMethods.map(m => {
                  const incompat = sendMethod && !isCompatible(sendMethod, m)
                  const rate = sendMethod ? resolveRate(rates, sendMethod.id, m.id) : null
                  return (
                    <RecvRow
                      key={m.id}
                      method={m}
                      selected={recvMethod}
                      onSelect={setRecvMethod}
                      disabled={incompat}
                      rate={rate}
                    />
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── زر المتابعة ── */}
        <div className="es-footer">
          {sendMethod && recvMethod && (
            <div className="es-selection-pill">
              <MethodIcon method={sendMethod} size={22} />
              <span>{sendMethod.name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              <MethodIcon method={recvMethod} size={22} />
              <span>{recvMethod.name}</span>
            </div>
          )}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="es-continue-btn"
          >
            {canContinue ? 'متابعة →' : 'اختر وسيلة الإرسال والاستلام'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────
const CSS = `
  @keyframes es-spin { to { transform: rotate(360deg) } }

  .es-page {
    min-height: 100vh;
    background: var(--bg);
    direction: rtl;
    font-family: 'Cairo','Tajawal',sans-serif;
  }

  /* Header */
  .es-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 20px;
    background: var(--card); border-bottom: 1px solid var(--border-1);
    position: sticky; top: 0; z-index: 40;
  }
  .es-back {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 13px; border-radius: 9px;
    border: 1px solid var(--border-1); background: transparent;
    color: var(--text-2); cursor: pointer; font-size: 0.84rem; font-weight: 600;
    font-family: 'Cairo',sans-serif; transition: all 0.15s;
  }
  .es-back:hover { border-color: var(--cyan); color: var(--cyan); }
  .es-header-title {
    font-size: 0.95rem; font-weight: 800; color: var(--text-1);
    font-family: 'Orbitron',sans-serif;
  }

  /* Steps */
  .es-steps {
    display: flex; align-items: center; justify-content: center;
    padding: 11px 24px;
    background: var(--card); border-bottom: 1px solid var(--border-1);
  }
  .es-step { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; color: var(--text-3); }
  .es-step--active { color: var(--cyan); }
  .es-dot {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: var(--cyan-dim); border: 1.5px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: var(--cyan);
  }
  .es-dot--off {
    background: transparent; border-color: var(--border-1); color: var(--text-3);
  }
  .es-step-line { width: 32px; height: 2px; background: var(--border-1); margin: 0 8px; }

  /* Main layout */
  .es-main {
    max-width: 920px; margin: 0 auto;
    padding: 28px 16px 20px;
    display: flex; flex-direction: column; gap: 0;
  }
  .es-loader {
    display: flex; justify-content: center; padding: 60px 0;
  }
  .es-spinner {
    width: 30px; height: 30px; border-radius: 50%;
    border: 3px solid var(--border-1); border-top-color: var(--cyan);
    animation: es-spin 0.8s linear infinite;
  }

  /* Panels grid */
  .es-panels {
    display: grid;
    grid-template-columns: 1fr 52px 1fr;
    align-items: start;
    gap: 0;
  }

  /* Panel box */
  .es-panel {
    background: var(--card);
    border: 1px solid var(--border-1);
    border-radius: 16px;
    overflow: hidden;
  }
  .es-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--border-1);
    background: rgba(255,255,255,0.02);
  }
  .es-panel-title {
    font-size: 0.82rem; font-weight: 800; color: var(--text-2);
    font-family: 'JetBrains Mono',monospace; letter-spacing: 0.5px;
  }
  .es-panel-col-label {
    font-size: 0.72rem; color: var(--text-3);
    font-family: 'JetBrains Mono',monospace;
  }
  .es-panel-body {
    overflow-y: auto;
    max-height: 420px;
  }
  .es-panel-body::-webkit-scrollbar { width: 4px; }
  .es-panel-body::-webkit-scrollbar-track { background: transparent; }
  .es-panel-body::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 4px; }

  /* Row */
  .es-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--border-1);
    transition: background 0.12s;
  }
  .es-row:last-child { border-bottom: none; }
  .es-row:hover:not(.es-row--disabled):not(.es-row--active) {
    background: rgba(255,255,255,0.03);
  }
  .es-row--active {
    background: rgba(0,210,255,0.07);
  }
  .es-row--disabled {
    opacity: 0.35; cursor: not-allowed;
  }
  .es-row--recv { display: grid; grid-template-columns: 34px 1fr auto; gap: 12px; }

  .es-row-info {
    display: flex; flex-direction: column; gap: 2px; min-width: 0;
  }
  .es-row-name {
    font-size: 0.88rem; font-weight: 700; color: var(--text-1);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .es-row--active .es-row-name { color: var(--cyan); }
  .es-row-sub {
    font-size: 0.68rem; color: var(--text-3);
    font-family: 'JetBrains Mono',monospace;
  }

  /* Rate column */
  .es-row-rate {
    display: flex; align-items: center; justify-content: flex-end;
    min-width: 80px; flex-shrink: 0;
  }
  .es-rate-val {
    font-size: 0.74rem; color: var(--text-2);
    font-family: 'JetBrains Mono',monospace; white-space: nowrap;
  }
  .es-rate-dash { color: var(--border-2); font-size: 0.8rem; }

  /* Arrow divider */
  .es-divider-arrow {
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 70px;
  }
  .es-arrow-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--card); border: 1.5px solid var(--border-2);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  /* Footer */
  .es-footer {
    margin-top: 20px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .es-selection-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 18px; border-radius: 50px;
    background: rgba(0,210,255,0.06); border: 1px solid var(--border-2);
    font-size: 0.82rem; font-weight: 700; color: var(--text-1);
  }
  .es-continue-btn {
    width: 100%; max-width: 380px;
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
  .es-continue-btn:disabled {
    opacity: 0.45; cursor: not-allowed;
    background: var(--border-2); box-shadow: none;
  }

  /* Mobile */
  @media (max-width: 640px) {
    .es-panels {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .es-divider-arrow {
      padding-top: 0;
      order: 99;
      display: none;
    }
    .es-step span:not(.es-dot) { display: none; }
    .es-step-line { width: 20px; }
    .es-panel-body { max-height: 280px; }
  }
`
