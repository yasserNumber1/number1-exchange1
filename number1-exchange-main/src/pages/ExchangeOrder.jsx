// src/pages/ExchangeOrder.jsx
// الصفحة 3 — تفاصيل الطلب + تتبع الحالة
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const POLL_INTERVAL   = 30_000   // 30 ثانية
const ORDER_LIFETIME  = 30 * 60  // 30 دقيقة بالثواني

// ── Status config ───────────────────────────────────────
const STATUS_MAP = {
  pending:    { ar: 'في انتظار التأكيد', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
  verifying:  { ar: 'جاري التحقق',       color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  dot: '#60a5fa' },
  verified:   { ar: 'تم التحقق',          color: '#34d399', bg: 'rgba(52,211,153,0.1)',  dot: '#34d399' },
  processing: { ar: 'جاري المعالجة',      color: 'var(--cyan)', bg: 'rgba(0,210,255,0.08)', dot: 'var(--cyan)' },
  completed:  { ar: 'مكتمل',             color: '#00e5a0', bg: 'rgba(0,229,160,0.1)',   dot: '#00e5a0' },
  rejected:   { ar: 'مرفوض',             color: '#f87171', bg: 'rgba(239,68,68,0.1)',   dot: '#f87171' },
  cancelled:  { ar: 'ملغي',              color: '#f87171', bg: 'rgba(239,68,68,0.1)',   dot: '#f87171' },
}

const DONE_STATUSES = ['completed', 'rejected', 'cancelled']

// ── Method icon ─────────────────────────────────────────
function MethodIcon({ method, size = 34 }) {
  const [err, setErr] = useState(false)
  if (!method) return null
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

// ── Status badge ────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 50,
      background: cfg.bg, border: `1px solid ${cfg.color}33`,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0, boxShadow: `0 0 6px ${cfg.dot}` }} />
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: cfg.color, fontFamily: "'Cairo','Tajawal',sans-serif" }}>
        {cfg.ar}
      </span>
    </div>
  )
}

// ── Copy button ─────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} title="نسخ" style={{
      padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border-1)',
      background: copied ? 'rgba(0,229,160,0.12)' : 'transparent',
      color: copied ? 'var(--green)' : 'var(--text-3)',
      cursor: 'pointer', fontSize: '0.72rem', fontFamily: "'JetBrains Mono',monospace",
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {copied ? (
        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> تم النسخ</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> نسخ</>
      )}
    </button>
  )
}

// ── Countdown format ────────────────────────────────────
function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// ══════════════════════════════════════════════════════
export default function ExchangeOrder() {
  const { orderId }  = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()

  // State passed from ExchangeFormPage
  const stateData    = location.state || {}
  const {
    sendMethod,
    recvMethod,
    sendAmount,
    receiveAmount,
    recipientId,
    usdtNetwork,
    adminItem,
    email,
  } = stateData

  // ── API order data ──────────────────────────────────
  const [order,    setOrder]   = useState(null)
  const [apiError, setApiError] = useState('')
  const [fetching, setFetching] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // ── Countdown (30 min) ──────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(ORDER_LIFETIME)
  const expired = secondsLeft <= 0
  const isDone  = DONE_STATUSES.includes(order?.status)

  // ── Fetch order ─────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    setFetching(true)
    try {
      const res  = await fetch(`${API}/api/orders/track/${orderId}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.order)
        setApiError('')
      } else {
        setApiError(data.message || 'لم يُعثر على الطلب')
      }
    } catch {
      setApiError('خطأ في الاتصال بالسيرفر')
    } finally {
      setFetching(false)
      setLastRefresh(new Date())
    }
  }, [orderId])

  // Initial fetch
  useEffect(() => { fetchOrder() }, [fetchOrder])

  // Polling every 30 s (stop when done or expired)
  useEffect(() => {
    if (isDone || expired) return
    const id = setInterval(fetchOrder, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchOrder, isDone, expired])

  // Countdown timer
  useEffect(() => {
    if (expired || isDone) return
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [expired, isDone])

  // ── Derived display values ──────────────────────────
  const displaySendMethod = sendMethod   // from state (richer)
  const displayRecvMethod = recvMethod
  const displaySendAmt    = sendAmount   || order?.payment?.amountSent
  const displayRecvAmt    = receiveAmount || order?.moneygo?.amountUSD
  const displayRecipient  = recipientId  || order?.moneygo?.recipientPhone
  const displayEmail      = email

  const isEgpSend    = displaySendMethod?.type === 'egp'
  const isUsdtSend   = displaySendMethod?.id === 'usdt-trc'
  const isMgoSend    = displaySendMethod?.id === 'mgo-send'
  const isWalletSend = displaySendMethod?.id === 'wallet-usdt'

  const currentStatus = order?.status || 'pending'
  const statusCfg     = STATUS_MAP[currentStatus] || STATUS_MAP.pending

  // ── Render ──────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="eo-header">
        <button onClick={() => navigate('/')} className="eo-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          الرئيسية
        </button>
        <div className="eo-header-title">
          <span>تفاصيل الطلب</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* ── Steps ── */}
      <div className="eo-steps">
        {/* Step 1 */}
        <div className="eo-step eo-step--done">
          <span className="eo-dot eo-dot--done">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>الطريقة</span>
        </div>
        <div className="eo-line eo-line--done" />
        {/* Step 2 */}
        <div className="eo-step eo-step--done">
          <span className="eo-dot eo-dot--done">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>تفاصيل الطلب</span>
        </div>
        <div className="eo-line eo-line--done" />
        {/* Step 3 */}
        <div className="eo-step eo-step--active">
          <span className="eo-dot">3</span>
          <span>تتبع الطلب</span>
        </div>
      </div>

      <div className="eo-content">

        {/* ── بطاقة الحالة ── */}
        <div className="eo-status-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.8px', marginBottom: 5 }}>رقم الطلب</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem', fontWeight: 700, color: 'var(--cyan)' }}>
                  {orderId}
                </span>
                <CopyBtn text={orderId} />
              </div>
            </div>
            <StatusBadge status={currentStatus} />
          </div>

          {/* Countdown or done */}
          {!isDone && (
            <div className={`eo-timer ${expired ? 'eo-timer--expired' : secondsLeft < 300 ? 'eo-timer--warning' : ''}`}>
              {expired ? (
                <><span>⏰</span> انتهت مهلة الطلب</>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  الوقت المتبقي: <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{fmtTime(secondsLeft)}</span>
                </>
              )}
            </div>
          )}
          {isDone && currentStatus === 'completed' && (
            <div className="eo-timer eo-timer--done">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              تم اكتمال الطلب بنجاح
            </div>
          )}

          {/* Last refresh + manual refresh */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            {lastRefresh && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
              </span>
            )}
            <button onClick={fetchOrder} disabled={fetching} className="eo-refresh-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ animation: fetching ? 'eo-spin 0.8s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              {fetching ? 'جاري التحديث...' : 'تحديث'}
            </button>
          </div>

          {apiError && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.8rem', marginTop: 4 }}>
              {apiError}
            </div>
          )}
        </div>

        {/* ── ملخص التبادل ── */}
        {(displaySendMethod || displayRecvMethod) && (
          <div className="eo-card">
            <div className="eo-section-label">ملخص التبادل</div>
            <div className="eo-pair-row">
              {/* إرسال */}
              <div className="eo-pair-side">
                <MethodIcon method={displaySendMethod} size={38} />
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.7px', textTransform: 'uppercase' }}>ترسل</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>{displaySendMethod?.name}</div>
                  {displaySendAmt && (
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', marginTop: 3 }}>
                      {displaySendAmt} <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{displaySendMethod?.symbol}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="eo-pair-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>

              {/* استلام */}
              <div className="eo-pair-side eo-pair-side--right">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.7px', textTransform: 'uppercase' }}>تستلم</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>{displayRecvMethod?.name}</div>
                  {displayRecvAmt && (
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.05rem', fontWeight: 700, color: 'var(--green)', marginTop: 3 }}>
                      {displayRecvAmt} <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{displayRecvMethod?.symbol}</span>
                    </div>
                  )}
                </div>
                <MethodIcon method={displayRecvMethod} size={38} />
              </div>
            </div>

            {/* الجهة المستلِمة */}
            {displayRecipient && (
              <div className="eo-info-row">
                <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>
                  {displayRecvMethod?.id === 'mgo-recv' ? 'معرّف MoneyGo' : 'عنوان المحفظة'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--text-2)', wordBreak: 'break-all', textAlign: 'left', direction: 'ltr' }}>
                    {displayRecipient}
                  </span>
                  <CopyBtn text={displayRecipient} />
                </div>
              </div>
            )}

            {displayEmail && (
              <div className="eo-info-row">
                <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>البريد الإلكتروني</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--text-2)', direction: 'ltr' }}>{displayEmail}</span>
              </div>
            )}
          </div>
        )}

        {/* ── تعليمات الدفع ── */}
        {isEgpSend && adminItem && (
          <div className="eo-card eo-instr-card">
            <div className="eo-section-label">📲 تعليمات التحويل</div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', margin: '0 0 14px', lineHeight: 1.7 }}>
              يرجى تحويل المبلغ إلى الحساب التالي ثم الانتظار حتى يتم التحقق من الدفع:
            </p>

            <div className="eo-instr-box">
              <div className="eo-instr-row">
                <span className="eo-instr-key">{adminItem.name || 'الوسيلة'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="eo-instr-val">{adminItem.number}</span>
                  <CopyBtn text={adminItem.number} />
                </div>
              </div>
              {displaySendAmt && (
                <div className="eo-instr-row">
                  <span className="eo-instr-key">المبلغ المطلوب</span>
                  <span className="eo-instr-val" style={{ color: 'var(--gold)' }}>{displaySendAmt} جنيه</span>
                </div>
              )}
            </div>

            <div className="eo-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>تأكد من إرسال المبلغ بالضبط. احتفظ بصورة الإيصال للرجوع إليها عند الحاجة.</span>
            </div>
          </div>
        )}

        {isUsdtSend && (
          <div className="eo-card eo-instr-card">
            <div className="eo-section-label">💎 عنوان استلام USDT</div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', margin: '0 0 14px', lineHeight: 1.7 }}>
              أرسل USDT إلى العنوان التالي. تأكد من اختيار الشبكة الصحيحة:
            </p>

            <div className="eo-instr-box">
              {adminItem?.address ? (
                <div className="eo-instr-row eo-instr-row--col">
                  <span className="eo-instr-key">عنوان المحفظة ({adminItem.network || usdtNetwork || 'TRC20'})</span>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                    <span className="eo-instr-val eo-instr-addr">{adminItem.address}</span>
                    <CopyBtn text={adminItem.address} />
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', padding: '8px 0' }}>
                  يرجى التواصل مع الدعم للحصول على عنوان المحفظة
                </div>
              )}
              {displaySendAmt && (
                <div className="eo-instr-row" style={{ marginTop: 10 }}>
                  <span className="eo-instr-key">المبلغ المطلوب</span>
                  <span className="eo-instr-val" style={{ color: 'var(--gold)' }}>{displaySendAmt} USDT</span>
                </div>
              )}
            </div>

            <div className="eo-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>⚠ تأكد من استخدام شبكة <strong>{adminItem?.network || usdtNetwork || 'TRC20'}</strong> فقط. الإرسال على شبكة خاطئة يؤدي إلى فقدان الأموال نهائياً.</span>
            </div>
          </div>
        )}

        {isMgoSend && adminItem && (
          <div className="eo-card eo-instr-card">
            <div className="eo-section-label">💳 معرّف MoneyGo للإرسال</div>
            <div className="eo-instr-box">
              <div className="eo-instr-row">
                <span className="eo-instr-key">معرّف المحفظة</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="eo-instr-val">{adminItem.address || adminItem.number || '—'}</span>
                  {(adminItem.address || adminItem.number) && <CopyBtn text={adminItem.address || adminItem.number} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {isWalletSend && (
          <div className="eo-card eo-instr-card">
            <div className="eo-section-label">🏦 تحويل من الحساب الداخلي</div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.7 }}>
              سيتم خصم المبلغ تلقائياً من رصيد حسابك الداخلي. لا توجد خطوات إضافية مطلوبة.
            </p>
          </div>
        )}

        {/* ── حالة الطلب التفصيلية ── */}
        <div className="eo-card">
          <div className="eo-section-label">حالة الطلب</div>
          <div className="eo-status-steps">
            {[
              { key: 'pending',    label: 'تم استلام الطلب',      icon: '📥' },
              { key: 'verifying',  label: 'جاري التحقق من الدفع', icon: '🔍' },
              { key: 'verified',   label: 'تم التحقق من الدفع',   icon: '✅' },
              { key: 'processing', label: 'جاري إرسال MoneyGo',   icon: '⚡' },
              { key: 'completed',  label: 'تم الإرسال بنجاح',     icon: '🎉' },
            ].map((step, i, arr) => {
              const statusOrder = ['pending','verifying','verified','processing','completed','rejected','cancelled']
              const curIdx  = statusOrder.indexOf(currentStatus)
              const stepIdx = statusOrder.indexOf(step.key)
              const isActive  = step.key === currentStatus && !DONE_STATUSES.includes(currentStatus)
              const isDoneStep = stepIdx < curIdx || currentStatus === step.key && DONE_STATUSES.includes(currentStatus) && currentStatus === 'completed' && step.key === 'completed'
              const isCompleted = stepIdx < curIdx || (currentStatus === 'completed' && stepIdx <= statusOrder.indexOf('completed'))
              return (
                <div key={step.key} className={`eo-status-step ${isActive ? 'eo-status-step--active' : ''} ${isCompleted ? 'eo-status-step--done' : ''}`}>
                  <div className="eo-status-step-dot">
                    {isCompleted
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : isActive
                        ? <span className="eo-pulse-dot" />
                        : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-2)', display: 'block' }} />
                    }
                  </div>
                  {i < arr.length - 1 && <div className={`eo-status-step-line ${isCompleted ? 'eo-status-step-line--done' : ''}`} />}
                  <span className="eo-status-step-label">{step.icon} {step.label}</span>
                </div>
              )
            })}

            {(currentStatus === 'rejected' || currentStatus === 'cancelled') && (
              <div className="eo-status-step eo-status-step--rejected">
                <div className="eo-status-step-dot" style={{ borderColor: '#f87171', color: '#f87171' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <span className="eo-status-step-label" style={{ color: '#f87171' }}>
                  ❌ {currentStatus === 'rejected' ? 'تم رفض الطلب' : 'تم إلغاء الطلب'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── روابط مساعدة ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="https://t.me/nimber1"
            target="_blank"
            rel="noopener noreferrer"
            className="eo-help-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            تواصل عبر Telegram
          </a>
          <button onClick={() => navigate('/track')} className="eo-help-btn eo-help-btn--ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            تتبع طلب آخر
          </button>
        </div>

      </div>
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────
const CSS = `
  @keyframes eo-spin { to { transform: rotate(360deg) } }
  @keyframes eo-pulse {
    0%,100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
    50%      { box-shadow: 0 0 0 5px transparent; opacity: 0.7; }
  }

  .eo-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: var(--card);
    border-bottom: 1px solid var(--border-1);
    position: sticky; top: 0; z-index: 40;
  }
  .eo-back {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px;
    border: 1px solid var(--border-1); background: transparent;
    color: var(--text-2); cursor: pointer; font-size: 0.85rem; font-weight: 600;
    font-family: 'Cairo',sans-serif; transition: all 0.15s;
  }
  .eo-back:hover { border-color: var(--cyan); color: var(--cyan); }
  .eo-header-title {
    font-size: 0.95rem; font-weight: 800; color: var(--text-1);
    font-family: 'Orbitron',sans-serif;
  }

  .eo-steps {
    display: flex; align-items: center; justify-content: center;
    padding: 12px 24px; background: var(--card);
    border-bottom: 1px solid var(--border-1);
  }
  .eo-step { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; }
  .eo-step--active { color: var(--cyan); }
  .eo-step--done   { color: var(--green); }
  .eo-dot {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: var(--cyan-dim); border: 1.5px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: var(--cyan);
  }
  .eo-dot--done { background: rgba(0,229,160,0.15); border-color: var(--green); color: var(--green); }
  .eo-line { width: 32px; height: 2px; background: var(--border-1); margin: 0 8px; }
  .eo-line--done { background: var(--green); }

  .eo-content {
    max-width: 560px; margin: 0 auto;
    padding: 24px 16px 70px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* Status card */
  .eo-status-card {
    background: var(--card); border: 1px solid var(--border-1);
    border-radius: 16px; padding: 18px 20px;
    display: flex; flex-direction: column; gap: 14px;
  }

  .eo-timer {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 13px; border-radius: 9px;
    background: rgba(0,210,255,0.06); border: 1px solid rgba(0,210,255,0.18);
    font-size: 0.82rem; color: var(--cyan); font-family: 'Cairo','Tajawal',sans-serif;
  }
  .eo-timer--warning {
    background: rgba(245,158,11,0.07); border-color: rgba(245,158,11,0.3); color: var(--gold);
  }
  .eo-timer--expired {
    background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); color: #f87171;
  }
  .eo-timer--done {
    background: rgba(0,229,160,0.07); border-color: rgba(0,229,160,0.25); color: var(--green);
  }

  .eo-refresh-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 7px;
    border: 1px solid var(--border-1); background: transparent;
    color: var(--text-3); cursor: pointer; font-size: 0.74rem;
    font-family: 'Cairo','Tajawal',sans-serif; transition: all 0.15s;
    margin-right: auto;
  }
  .eo-refresh-btn:hover:not(:disabled) { border-color: var(--cyan); color: var(--cyan); }
  .eo-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Generic card */
  .eo-card {
    background: var(--card); border: 1px solid var(--border-1);
    border-radius: 14px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .eo-instr-card { border-color: rgba(0,210,255,0.2); background: rgba(0,210,255,0.025); }

  .eo-section-label {
    font-size: 0.7rem; font-weight: 700; color: var(--text-3);
    font-family: 'JetBrains Mono',monospace; letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  /* Pair row */
  .eo-pair-row {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .eo-pair-side { display: flex; align-items: center; gap: 10px; flex: 1; }
  .eo-pair-side--right { flex-direction: row-reverse; }
  .eo-pair-arrow { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .eo-info-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 10px; flex-wrap: wrap;
    padding-top: 10px; border-top: 1px solid var(--border-1);
  }

  /* Instructions box */
  .eo-instr-box {
    background: rgba(255,255,255,0.025); border: 1px solid var(--border-1);
    border-radius: 11px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .eo-instr-row {
    display: flex; justify-content: space-between; align-items: center;
    gap: 10px; flex-wrap: wrap;
  }
  .eo-instr-row--col { flex-direction: column; align-items: flex-start; }
  .eo-instr-key {
    font-size: 0.75rem; color: var(--text-3);
    font-family: 'JetBrains Mono',monospace;
  }
  .eo-instr-val {
    font-size: 0.88rem; font-weight: 700; color: var(--text-1);
    font-family: 'JetBrains Mono',monospace; direction: ltr;
  }
  .eo-instr-addr {
    word-break: break-all; font-size: 0.78rem;
  }

  /* Warning */
  .eo-warning {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 10px 13px; border-radius: 9px;
    background: rgba(245,158,11,0.07); border: 1px dashed rgba(245,158,11,0.3);
    font-size: 0.76rem; color: var(--gold); line-height: 1.55;
  }

  /* Status timeline */
  .eo-status-steps {
    display: flex; flex-direction: column; gap: 0;
  }
  .eo-status-step {
    display: grid;
    grid-template-columns: 28px 1fr;
    grid-template-rows: auto 1fr;
    column-gap: 12px;
    position: relative;
  }
  .eo-status-step-dot {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid var(--border-2); background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-3); font-size: 0.7rem;
    grid-row: 1; grid-column: 1;
    z-index: 1;
  }
  .eo-status-step--done .eo-status-step-dot {
    border-color: var(--green); background: rgba(0,229,160,0.12); color: var(--green);
  }
  .eo-status-step--active .eo-status-step-dot {
    border-color: var(--cyan); background: rgba(0,210,255,0.12); color: var(--cyan);
  }
  .eo-status-step--rejected .eo-status-step-dot {
    border-color: #f87171; background: rgba(239,68,68,0.1); color: #f87171;
  }
  .eo-status-step-line {
    width: 2px; height: 22px; background: var(--border-1);
    grid-row: 2; grid-column: 1;
    margin: 2px auto 2px;
  }
  .eo-status-step-line--done { background: var(--green); }
  .eo-status-step-label {
    font-size: 0.82rem; font-weight: 600; color: var(--text-3);
    grid-row: 1; grid-column: 2;
    display: flex; align-items: center;
    padding: 4px 0;
  }
  .eo-status-step--done .eo-status-step-label { color: var(--green); }
  .eo-status-step--active .eo-status-step-label { color: var(--cyan); font-weight: 800; }
  .eo-status-step--rejected .eo-status-step-label { color: #f87171; }

  .eo-pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--cyan); display: block;
    animation: eo-pulse 1.5s ease-in-out infinite;
  }

  /* Help buttons */
  .eo-help-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    background: linear-gradient(135deg,#0088cc,#005f8e);
    border: none; color: #fff; cursor: pointer; font-size: 0.84rem; font-weight: 700;
    font-family: 'Cairo','Tajawal',sans-serif;
    text-decoration: none; transition: opacity 0.15s;
  }
  .eo-help-btn:hover { opacity: 0.88; }
  .eo-help-btn--ghost {
    background: transparent; border: 1.5px solid var(--border-1);
    color: var(--text-2);
  }
  .eo-help-btn--ghost:hover { border-color: var(--cyan); color: var(--cyan); }

  @media (max-width: 480px) {
    .eo-step span:not(.eo-dot) { display: none; }
    .eo-line { width: 20px; }
    .eo-pair-row { flex-direction: column; align-items: flex-start; gap: 14px; }
    .eo-pair-side--right { flex-direction: row; align-self: flex-end; }
    .eo-pair-arrow { transform: rotate(90deg); align-self: center; }
  }
`
