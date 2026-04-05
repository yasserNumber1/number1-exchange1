// src/pages/ExchangeOrder.jsx
// الصفحة 3 + 4 — تتبع الطلب مع SSE + إلغاء + شاشة الاكتمال
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import FlowDots from '../components/shared/FlowDots'
import { readOrderSession, clearOrderSession } from '../services/orderSession'

const API            = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ORDER_LIFETIME = 30 * 60   // 30 دقيقة

const DONE_STATUSES     = ['completed', 'rejected', 'cancelled']
const APPROVED_STATUSES = ['verified', 'processing', 'completed']

// ── خريطة الحالات ──────────────────────────────────────
const STATUS_MAP = {
  pending:    { ar: 'في انتظار التأكيد', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
  verifying:  { ar: 'جاري التحقق',       color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  dot: '#60a5fa' },
  verified:   { ar: 'تم التحقق ✓',       color: '#34d399', bg: 'rgba(52,211,153,0.1)',  dot: '#34d399' },
  processing: { ar: 'جاري المعالجة',     color: '#00d4ff', bg: 'rgba(0,210,255,0.08)',  dot: '#00d4ff' },
  completed:  { ar: 'مكتمل 🎉',          color: '#00e5a0', bg: 'rgba(0,229,160,0.1)',   dot: '#00e5a0' },
  rejected:   { ar: 'مرفوض',             color: '#f87171', bg: 'rgba(239,68,68,0.1)',   dot: '#f87171' },
  cancelled:  { ar: 'ملغي',              color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', dot: '#9ca3af' },
}

// ── الخطوة التي يجب أن تكون نشطة ────────────────────
function getActiveWizardStep(status) {
  if (status === 'completed')                          return 4
  if (['verified','processing'].includes(status))      return 3
  if (['verifying'].includes(status))                  return 3
  if (status === 'pending')                            return 3
  return 3
}

function fmtTime(s) {
  const m = Math.floor(s / 60), sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

// ── Sub-components ──────────────────────────────────────
function MethodIcon({ method, size = 34 }) {
  const [err, setErr] = useState(false)
  if (!method) return null
  if (method.img && !err) return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid rgba(0,0,0,0.08)', overflow:'hidden' }}>
      <img src={method.img} alt={method.name} onError={() => setErr(true)} style={{ width:'76%', height:'76%', objectFit:'contain' }} />
    </div>
  )
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:method.color||'#26a17b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:"'JetBrains Mono',monospace", fontSize:size*0.38, fontWeight:700, color:'#fff' }}>
      {method.symbol}
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 14px', borderRadius:50, background:cfg.bg, border:`1px solid ${cfg.color}33` }}>
      <span style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot, flexShrink:0, boxShadow:`0 0 6px ${cfg.dot}` }} />
      <span style={{ fontSize:'0.82rem', fontWeight:700, color:cfg.color, fontFamily:"'Cairo','Tajawal',sans-serif" }}>{cfg.ar}</span>
    </div>
  )
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }}
      style={{ padding:'4px 10px', borderRadius:7, border:'1px solid var(--border-1)', background:copied?'rgba(0,229,160,0.12)':'transparent', color:copied?'var(--green)':'var(--text-3)', cursor:'pointer', fontSize:'0.72rem', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:4 }}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> تم</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> نسخ</>}
    </button>
  )
}

// ── شاشة الاكتمال (الخطوة 4) ───────────────────────────
function CompletedScreen({ orderId, sendMethod, recvMethod, sendAmount, receiveAmount, navigate }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'48px 24px 32px', gap:20 }}>
      <style>{`
        @keyframes eo-pop    { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes eo-glow   { 0%,100%{box-shadow:0 0 24px rgba(0,229,160,0.4)} 50%{box-shadow:0 0 48px rgba(0,229,160,0.8)} }
        @keyframes eo-rise   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes eo-confetti { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-60px) rotate(360deg);opacity:0} }
      `}</style>

      {/* الأيقونة المتحركة */}
      <div style={{ width:100, height:100, borderRadius:'50%', background:'linear-gradient(135deg,rgba(0,229,160,0.15),rgba(0,210,255,0.1))', border:'2.5px solid #00e5a0', display:'flex', alignItems:'center', justifyContent:'center', animation:'eo-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both, eo-glow 2s ease-in-out 0.6s infinite' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      {/* النص */}
      <div style={{ animation:'eo-rise 0.5s ease 0.3s both' }}>
        <div style={{ fontSize:'0.72rem', color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2, marginBottom:10 }}>TRANSFER COMPLETE</div>
        <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'clamp(1.4rem,5vw,1.9rem)', fontWeight:900, color:'var(--text-1)', margin:'0 0 10px', lineHeight:1.2 }}>
          مبروك! تم إتمام طلبك بنجاح 🎉
        </h2>
        <p style={{ color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.95rem', lineHeight:1.8, margin:0 }}>
          تمت العملية وتم إرسال المبلغ إلى حسابك المحدد
        </p>
      </div>

      {/* ملخص المبالغ */}
      {(sendAmount || receiveAmount) && (
        <div style={{ animation:'eo-rise 0.5s ease 0.45s both', background:'var(--card)', border:'1px solid rgba(0,229,160,0.25)', borderRadius:16, padding:'20px 28px', width:'100%', maxWidth:340 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            {sendMethod && sendAmount && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, marginBottom:4 }}>أرسلت</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.05rem', fontWeight:700, color:'var(--text-1)' }}>{sendAmount}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{sendMethod?.name}</div>
              </div>
            )}
            <div style={{ color:'var(--cyan)', fontSize:'1.3rem' }}>→</div>
            {recvMethod && receiveAmount && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, marginBottom:4 }}>استلمت</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.15rem', fontWeight:700, color:'#00e5a0' }}>{receiveAmount}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{recvMethod?.name}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* رقم الطلب */}
      <div style={{ animation:'eo-rise 0.5s ease 0.55s both', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:10, padding:'10px 20px' }}>
        <span style={{ fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>رقم الطلب: </span>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'var(--cyan)' }}>{orderId}</span>
      </div>

      {/* أزرار */}
      <div style={{ animation:'eo-rise 0.5s ease 0.65s both', display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        <button onClick={() => { clearOrderSession(); navigate('/') }}
          style={{ padding:'12px 28px', background:'linear-gradient(135deg,#00e5a0,#009fc0)', border:'none', borderRadius:12, color:'#000', fontWeight:800, fontFamily:"'Cairo','Tajawal',sans-serif", fontSize:'0.95rem', cursor:'pointer' }}>
          العودة للرئيسية
        </button>
        <a href="https://t.me/nimber1" target="_blank" rel="noopener noreferrer"
          style={{ padding:'12px 20px', background:'transparent', border:'1px solid rgba(0,212,255,0.3)', borderRadius:12, color:'var(--cyan)', fontWeight:700, fontFamily:"'Cairo',sans-serif", fontSize:'0.88rem', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          تواصل معنا
        </a>
      </div>
    </div>
  )
}

// ── نافذة تأكيد الإلغاء ──────────────────────────────────
function CancelModal({ orderId, sessionToken, onClose, onCancelled }) {
  const [reason,  setReason]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const doCancel = async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/api/orders/${orderId}/cancel`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionToken, reason: reason.trim() || 'لم يحدد العميل سبباً' })
      })
      const data = await res.json()
      if (data.success) {
        clearOrderSession()
        onCancelled()
      } else {
        setError(data.message || 'حدث خطأ')
      }
    } catch {
      setError('خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--card)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:20, padding:'28px 24px', maxWidth:420, width:'100%', direction:'rtl' }}>
        <div style={{ fontSize:'1.4rem', marginBottom:6, textAlign:'center' }}>⚠️</div>
        <h3 style={{ fontFamily:"'Tajawal',sans-serif", color:'#f87171', textAlign:'center', margin:'0 0 8px', fontSize:'1.05rem', fontWeight:800 }}>
          إلغاء الطلب
        </h3>
        <p style={{ fontFamily:"'Tajawal',sans-serif", color:'var(--text-3)', fontSize:'0.85rem', textAlign:'center', margin:'0 0 20px', lineHeight:1.7 }}>
          هل أنت متأكد؟ سيتم إلغاء الطلب <strong style={{ color:'var(--cyan)' }}>{orderId}</strong> وإرسال إشعار للإدارة.
        </p>

        <label style={{ fontSize:'0.72rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, display:'block', marginBottom:6 }}>
          سبب الإلغاء (اختياري)
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="مثال: تغيير طريقة الدفع، خطأ في البيانات..."
          rows={3}
          style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-1)', borderRadius:10, color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', resize:'vertical', outline:'none', boxSizing:'border-box' }}
          onFocus={e => e.target.style.borderColor='rgba(239,68,68,0.5)'}
          onBlur={e  => e.target.style.borderColor='var(--border-1)'}
        />
        {error && <p style={{ color:'#f87171', fontSize:'0.8rem', fontFamily:"'Tajawal',sans-serif", margin:'8px 0 0' }}>{error}</p>}

        <div style={{ display:'flex', gap:10, marginTop:18 }}>
          <button onClick={onClose} disabled={loading}
            style={{ flex:1, padding:'11px', background:'transparent', border:'1px solid var(--border-1)', borderRadius:10, color:'var(--text-2)', fontFamily:"'Tajawal',sans-serif", fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
            تراجع
          </button>
          <button onClick={doCancel} disabled={loading}
            style={{ flex:1, padding:'11px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:10, color:'#f87171', fontFamily:"'Tajawal',sans-serif", fontWeight:800, cursor:loading?'not-allowed':'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            {loading
              ? <span style={{ width:16, height:16, border:'2px solid #f8717144', borderTopColor:'#f87171', borderRadius:'50%', display:'inline-block', animation:'eo-spin 0.8s linear infinite' }} />
              : '🚫 تأكيد الإلغاء'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
export default function ExchangeOrder() {
  const { orderId }  = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()

  const stateData = location.state || {}
  const { sendMethod, recvMethod, sendAmount, receiveAmount, recipientId, usdtNetwork, adminItem, email } = stateData

  // ── API State ───────────────────────────────────────────
  const [order,       setOrder]       = useState(null)
  const [apiError,    setApiError]    = useState('')
  const [fetching,    setFetching]    = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // ── Countdown ───────────────────────────────────────────
  const [secondsLeft,  setSecondsLeft]  = useState(ORDER_LIFETIME)
  const [showCancel,   setShowCancel]   = useState(false)
  const [sseConnected, setSseConnected] = useState(false)

  const sseRef  = useRef(null)
  const pollRef = useRef(null)

  const currentStatus  = order?.status || 'pending'
  const statusCfg      = STATUS_MAP[currentStatus] || STATUS_MAP.pending
  const isDone         = DONE_STATUSES.includes(currentStatus)
  const isCompleted    = currentStatus === 'completed'
  const isRejected     = currentStatus === 'rejected'
  const isCancelled    = currentStatus === 'cancelled'
  const isApproved     = APPROVED_STATUSES.includes(currentStatus)
  const canCancel      = ['pending', 'verifying'].includes(currentStatus)
  const wizardStep     = isCompleted ? 4 : 3

  // ── Fetch order ─────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    setFetching(true)
    try {
      const res  = await fetch(`${API}/api/orders/track/${orderId}`)
      const data = await res.json()
      if (data.success) { setOrder(data.order); setApiError('') }
      else setApiError(data.message || 'لم يُعثر على الطلب')
    } catch { setApiError('خطأ في الاتصال') }
    finally  { setFetching(false); setLastRefresh(new Date()) }
  }, [orderId])

  // ── SSE Connection ──────────────────────────────────────
  const connectSSE = useCallback((token) => {
    if (sseRef.current) sseRef.current.close()
    if (!window.EventSource) return
    const es = new EventSource(`${API}/api/orders/sse/${token}`)
    sseRef.current = es
    es.onopen    = () => setSseConnected(true)
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'STATUS_UPDATE') {
          setOrder(prev => prev ? { ...prev, status: msg.status, updatedAt: msg.updatedAt } : prev)
          setLastRefresh(new Date())
          if (DONE_STATUSES.includes(msg.status)) { es.close(); setSseConnected(false) }
        }
      } catch {}
    }
    es.onerror = () => { setSseConnected(false); es.close() }
  }, [])

  // ── Initial setup ───────────────────────────────────────
  useEffect(() => {
    fetchOrder()
    // محاولة الاتصال بـ SSE إذا كان هناك session token
    const sess = readOrderSession()
    if (sess && sess.orderNumber === orderId) connectSSE(sess.sessionToken)
    return () => {
      if (sseRef.current) sseRef.current.close()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // ── Polling fallback ────────────────────────────────────
  useEffect(() => {
    if (isDone || isApproved || sseConnected) return
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchOrder, 30000)
    return () => clearInterval(pollRef.current)
  }, [fetchOrder, isDone, isApproved, sseConnected])

  // ── SSE polling upgrade when SSE connects ───────────────
  useEffect(() => {
    if (sseConnected && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [sseConnected])

  // ── Countdown ───────────────────────────────────────────
  useEffect(() => {
    if (isDone || isApproved) return
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [isDone, isApproved])

  const expired = secondsLeft <= 0 && !isDone && !isApproved

  const displaySendAmt   = sendAmount    || order?.payment?.amountSent
  const displayRecvAmt   = receiveAmount || order?.moneygo?.amountUSD
  const displayRecipient = recipientId   || order?.moneygo?.recipientPhone
  const isEgpSend        = sendMethod?.type === 'egp'
  const isUsdtSend       = sendMethod?.id   === 'usdt-trc'
  const isMgoSend        = sendMethod?.id   === 'mgo-send'
  const isWalletSend     = sendMethod?.id   === 'wallet-usdt'

  // ── render ──────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', direction:'rtl', fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <style>{CSS}</style>

      {/* نافذة الإلغاء */}
      {showCancel && (
        <CancelModal
          orderId={orderId}
          sessionToken={readOrderSession()?.sessionToken}
          onClose={() => setShowCancel(false)}
          onCancelled={() => { setShowCancel(false); fetchOrder() }}
        />
      )}

      {/* ── Header ─────────────────────────────────────── */}
      <div className="eo-header">
        <button onClick={() => navigate('/')} className="eo-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          الرئيسية
        </button>
        <div className="eo-header-title">
          {isCompleted ? '🎉 اكتمل الطلب' : 'تفاصيل الطلب'}
        </div>
        <div style={{ width:80 }} />
      </div>

      {/* ── Wizard Steps (1–4) ─────────────────────────── */}
      <div className="eo-steps">
        {/* 1 */}
        <div className="eo-step eo-step--done">
          <span className="eo-dot eo-dot--done"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span>الطريقة</span>
        </div>
        <div className="eo-line eo-line--done" />
        {/* 2 */}
        <div className="eo-step eo-step--done">
          <span className="eo-dot eo-dot--done"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span>تفاصيل الطلب</span>
        </div>
        <div className={`eo-line ${wizardStep >= 3 ? 'eo-line--done' : ''}`} />
        {/* 3 */}
        <div className={`eo-step ${wizardStep === 3 ? 'eo-step--active' : wizardStep > 3 ? 'eo-step--done' : ''}`}>
          <span className={`eo-dot ${wizardStep > 3 ? 'eo-dot--done' : ''}`}>
            {wizardStep > 3
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : '3'}
          </span>
          <span>تتبع الطلب</span>
        </div>
        <div className={`eo-line ${wizardStep >= 4 ? 'eo-line--done' : ''}`} />
        {/* 4 */}
        <div className={`eo-step ${wizardStep === 4 ? 'eo-step--done' : ''}`} style={{ opacity: wizardStep < 4 ? 0.45 : 1 }}>
          <span className={`eo-dot ${wizardStep === 4 ? 'eo-dot--done' : ''}`} style={{ borderColor: wizardStep === 4 ? 'var(--green)' : undefined }}>
            {wizardStep === 4
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : '4'}
          </span>
          <span>مكتمل</span>
        </div>
      </div>

      {/* ══ الخطوة 4 — شاشة الاكتمال ══════════════════ */}
      {isCompleted ? (
        <div className="eo-content">
          <CompletedScreen
            orderId={orderId}
            sendMethod={sendMethod}
            recvMethod={recvMethod}
            sendAmount={displaySendAmt}
            receiveAmount={displayRecvAmt}
            navigate={navigate}
          />
        </div>
      ) : (

      /* ══ الخطوة 3 — تتبع الطلب ═══════════════════════ */
      <div className="eo-content">

        {/* بطاقة الحالة */}
        <div className="eo-status-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontSize:'0.64rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.8px', marginBottom:5 }}>رقم الطلب</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1rem', fontWeight:700, color:'var(--cyan)' }}>{orderId}</span>
                <CopyBtn text={orderId} />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
              <StatusBadge status={currentStatus} />
              {/* مؤشر LIVE/POLLING */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, background: sseConnected ? 'rgba(0,229,160,0.07)' : 'rgba(100,100,100,0.08)', border:`1px solid ${sseConnected ? 'rgba(0,229,160,0.25)' : 'rgba(100,100,100,0.18)'}` }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background: sseConnected ? '#00e5a0' : '#888', boxShadow: sseConnected ? '0 0 5px #00e5a0' : 'none', animation: sseConnected ? 'eo-blink 2s infinite' : 'none' }} />
                <span style={{ fontSize:'0.6rem', color: sseConnected ? '#00e5a0' : '#888', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>{sseConnected ? 'LIVE' : 'POLLING'}</span>
              </div>
            </div>
          </div>

          {/* إشعار الموافقة */}
          {isApproved && !isCompleted && (
            <div className="eo-approved-banner">
              <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(52,211,153,0.15)', border:'2px solid #34d399', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#34d399' }}>تمت الموافقة على طلبك ✅</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:2 }}>جارٍ معالجة التحويل الآن، ستنتقل لشاشة الاكتمال تلقائياً</div>
              </div>
            </div>
          )}

          {/* العداد التنازلي */}
          {!isDone && !isApproved && (
            <div className={`eo-timer ${expired ? 'eo-timer--expired' : secondsLeft < 300 ? 'eo-timer--warning' : ''}`}>
              {expired
                ? <><span>⏰</span> انتهت مهلة الطلب</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    الوقت المتبقي:&nbsp;<span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmtTime(secondsLeft)}</span>
                  </>}
            </div>
          )}

          {/* حالة رفض / إلغاء */}
          {(isRejected || isCancelled) && (
            <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontFamily:"'Tajawal',sans-serif", fontSize:'0.85rem' }}>
              {isRejected ? '❌ تم رفض الطلب. للاستفسار تواصل مع الدعم.' : '🚫 تم إلغاء الطلب.'}
            </div>
          )}

          {/* آخر تحديث + زر تحديث */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {lastRefresh && <span style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}</span>}
            <button onClick={fetchOrder} disabled={fetching} className="eo-refresh-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ animation: fetching ? 'eo-spin 0.8s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              {fetching ? 'جاري التحديث...' : 'تحديث'}
            </button>
          </div>

          {apiError && <div style={{ padding:'8px 12px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:'0.8rem' }}>{apiError}</div>}
        </div>

        {/* ملخص التبادل */}
        {(sendMethod || recvMethod) && (
          <div className="eo-card">
            <div className="eo-section-label">ملخص التبادل</div>
            <div className="eo-pair-row">
              <div className="eo-pair-side">
                <MethodIcon method={sendMethod} size={38} />
                <div>
                  <div style={{ fontSize:'0.62rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.7px', textTransform:'uppercase' }}>ترسل</div>
                  <div style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-1)', marginTop:2 }}>{sendMethod?.name}</div>
                  {displaySendAmt && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.05rem', fontWeight:700, color:'var(--text-1)', marginTop:3 }}>{displaySendAmt} <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{sendMethod?.symbol}</span></div>}
                </div>
              </div>
              <div className="eo-pair-arrow"><FlowDots /></div>
              <div className="eo-pair-side eo-pair-side--right">
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.62rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.7px', textTransform:'uppercase' }}>تستلم</div>
                  <div style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-1)', marginTop:2 }}>{recvMethod?.name}</div>
                  {displayRecvAmt && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.05rem', fontWeight:700, color:'var(--green)', marginTop:3 }}>{displayRecvAmt} <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{recvMethod?.symbol}</span></div>}
                </div>
                <MethodIcon method={recvMethod} size={38} />
              </div>
            </div>
            {displayRecipient && (
              <div className="eo-info-row">
                <span style={{ color:'var(--text-3)', fontSize:'0.78rem' }}>{recvMethod?.id === 'mgo-recv' ? 'معرّف MoneyGo' : 'عنوان المحفظة'}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem', color:'var(--text-2)', wordBreak:'break-all', textAlign:'left', direction:'ltr' }}>{displayRecipient}</span>
                  <CopyBtn text={displayRecipient} />
                </div>
              </div>
            )}
            {email && (
              <div className="eo-info-row">
                <span style={{ color:'var(--text-3)', fontSize:'0.78rem' }}>البريد الإلكتروني</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.78rem', color:'var(--text-2)', direction:'ltr' }}>{email}</span>
              </div>
            )}
          </div>
        )}

        {/* تعليمات الدفع */}
        {isEgpSend && adminItem && !isApproved && (
          <div className="eo-card eo-instr-card">
            <div className="eo-section-label">📲 تعليمات التحويل</div>
            <p style={{ fontSize:'0.83rem', color:'var(--text-2)', margin:'0 0 14px', lineHeight:1.7 }}>يرجى تحويل المبلغ إلى الحساب التالي ثم الانتظار حتى يتم التحقق من الدفع:</p>
            <div className="eo-instr-box">
              <div className="eo-instr-row">
                <span className="eo-instr-key">{adminItem.name || 'الوسيلة'}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}><span className="eo-instr-val">{adminItem.number}</span><CopyBtn text={adminItem.number} /></div>
              </div>
              {displaySendAmt && <div className="eo-instr-row"><span className="eo-instr-key">المبلغ المطلوب</span><span className="eo-instr-val" style={{ color:'var(--gold)' }}>{displaySendAmt} جنيه</span></div>}
            </div>
            <div className="eo-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>تأكد من إرسال المبلغ بالضبط. احتفظ بصورة الإيصال للرجوع إليها.</span>
            </div>
          </div>
        )}

        {isUsdtSend && !isApproved && (
          <div className="eo-card eo-instr-card">
            <div className="eo-section-label">💎 عنوان استلام USDT</div>
            <div className="eo-instr-box">
              {adminItem?.address
                ? <div className="eo-instr-row eo-instr-row--col">
                    <span className="eo-instr-key">عنوان المحفظة ({adminItem.network || usdtNetwork || 'TRC20'})</span>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginTop:4 }}><span className="eo-instr-val eo-instr-addr">{adminItem.address}</span><CopyBtn text={adminItem.address} /></div>
                  </div>
                : <div style={{ color:'var(--text-3)', fontSize:'0.8rem', padding:'8px 0' }}>تواصل مع الدعم للحصول على العنوان</div>}
              {displaySendAmt && <div className="eo-instr-row" style={{ marginTop:10 }}><span className="eo-instr-key">المبلغ</span><span className="eo-instr-val" style={{ color:'var(--gold)' }}>{displaySendAmt} USDT</span></div>}
            </div>
            <div className="eo-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>⚠ استخدم شبكة <strong>{adminItem?.network || usdtNetwork || 'TRC20'}</strong> فقط.</span>
            </div>
          </div>
        )}

        {/* خطوات حالة الطلب */}
        <div className="eo-card">
          <div className="eo-section-label">حالة الطلب</div>
          <div className="eo-status-steps">
            {[
              { key:'pending',    label:'تم استلام الطلب',       icon:'📥' },
              { key:'verifying',  label:'جاري التحقق من الدفع',  icon:'🔍' },
              { key:'verified',   label:'تم التحقق من الدفع',    icon:'✅' },
              { key:'processing', label:'جاري إرسال MoneyGo',    icon:'⚡' },
              { key:'completed',  label:'تم الإرسال بنجاح',      icon:'🎉' },
            ].map((step, i, arr) => {
              const order_ = ['pending','verifying','verified','processing','completed','rejected','cancelled']
              const curIdx  = order_.indexOf(currentStatus)
              const stepIdx = order_.indexOf(step.key)
              const isActive    = step.key === currentStatus && !isDone
              const isCompleted_ = stepIdx < curIdx || (currentStatus === 'completed' && stepIdx <= order_.indexOf('completed'))
              return (
                <div key={step.key} className={`eo-status-step ${isActive ? 'eo-status-step--active' : ''} ${isCompleted_ ? 'eo-status-step--done' : ''}`}>
                  <div className="eo-status-step-dot">
                    {isCompleted_
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : isActive
                        ? <span className="eo-pulse-dot" />
                        : <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--border-2)', display:'block' }} />}
                  </div>
                  {i < arr.length-1 && <div className={`eo-status-step-line ${isCompleted_ ? 'eo-status-step-line--done' : ''}`} />}
                  <span className="eo-status-step-label">{step.icon} {step.label}</span>
                </div>
              )
            })}
            {(isRejected || isCancelled) && (
              <div className="eo-status-step eo-status-step--rejected">
                <div className="eo-status-step-dot" style={{ borderColor:'#f87171', color:'#f87171' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <span className="eo-status-step-label" style={{ color:'#f87171' }}>❌ {isRejected ? 'تم رفض الطلب' : 'تم إلغاء الطلب'}</span>
              </div>
            )}
          </div>
        </div>

        {/* أزرار المساعدة + الإلغاء */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <a href="https://t.me/nimber1" target="_blank" rel="noopener noreferrer" className="eo-help-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            تواصل عبر Telegram
          </a>
          <button onClick={() => navigate('/track')} className="eo-help-btn eo-help-btn--ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            تتبع طلب آخر
          </button>

          {/* زر الإلغاء — يظهر فقط إذا كان الطلب قابلاً للإلغاء */}
          {canCancel && !expired && (
            <button
              onClick={() => setShowCancel(true)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, color:'#f87171', fontFamily:"'Tajawal',sans-serif", fontWeight:700, cursor:'pointer', fontSize:'0.82rem', marginRight:'auto' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              إلغاء العملية
            </button>
          )}
        </div>

      </div>
      )}
    </div>
  )
}

// ── CSS ────────────────────────────────────────────────────
const CSS = `
  @keyframes eo-spin  { to { transform: rotate(360deg) } }
  @keyframes eo-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes eo-pulse { 0%,100%{box-shadow:0 0 0 0 currentColor;opacity:1} 50%{box-shadow:0 0 0 5px transparent;opacity:0.7} }

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
  .eo-header-title { font-size: 0.95rem; font-weight: 800; color: var(--text-1); font-family: 'Orbitron',sans-serif; }

  .eo-steps {
    display: flex; align-items: center; justify-content: center;
    padding: 12px 24px; background: var(--card);
    border-bottom: 1px solid var(--border-1);
  }
  .eo-step { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; color: var(--text-3); }
  .eo-step--active { color: var(--cyan); }
  .eo-step--done   { color: var(--green); }
  .eo-dot {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: var(--cyan-dim); border: 1.5px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: var(--cyan);
  }
  .eo-dot--done { background: rgba(0,229,160,0.15); border-color: var(--green); color: var(--green); }
  .eo-line { width: 28px; height: 2px; background: var(--border-1); margin: 0 6px; flex-shrink: 0; }
  .eo-line--done { background: var(--green); }

  .eo-content { max-width: 560px; margin: 0 auto; padding: 24px 16px 80px; display: flex; flex-direction: column; gap: 16px; }

  .eo-status-card { background: var(--card); border: 1px solid var(--border-1); border-radius: 16px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }

  .eo-approved-banner {
    display: flex; align-items: center; gap: 12;
    padding: 14px 16px; border-radius: 12px;
    background: linear-gradient(135deg,rgba(52,211,153,0.1),rgba(0,229,160,0.07));
    border: 1.5px solid rgba(52,211,153,0.3);
  }

  .eo-timer { display: flex; align-items: center; gap: 7px; padding: 8px 13px; border-radius: 9px; background: rgba(0,210,255,0.06); border: 1px solid rgba(0,210,255,0.18); font-size: 0.82rem; color: var(--cyan); }
  .eo-timer--warning { background: rgba(245,158,11,0.07); border-color: rgba(245,158,11,0.3); color: var(--gold); }
  .eo-timer--expired { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); color: #f87171; }

  .eo-refresh-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 7px; border: 1px solid var(--border-1); background: transparent; color: var(--text-3); cursor: pointer; font-size: 0.74rem; font-family: 'Cairo','Tajawal',sans-serif; margin-right: auto; }
  .eo-refresh-btn:hover:not(:disabled) { border-color: var(--cyan); color: var(--cyan); }
  .eo-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .eo-card { background: var(--card); border: 1px solid var(--border-1); border-radius: 14px; padding: 16px 18px; }
  .eo-section-label { font-size: 0.7rem; font-weight: 700; color: var(--text-3); font-family: 'JetBrains Mono',monospace; letter-spacing: 1px; margin-bottom: 14px; text-transform: uppercase; }

  .eo-pair-row { display: flex; align-items: center; gap: 12px; }
  .eo-pair-side { display: flex; align-items: center; gap: 10px; flex: 1; }
  .eo-pair-side--right { flex-direction: row-reverse; }
  .eo-pair-arrow { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .eo-info-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 0; border-top: 1px solid var(--border-1); flex-wrap: wrap; }

  .eo-instr-card { background: rgba(0,210,255,0.025); border-color: rgba(0,210,255,0.15); }
  .eo-instr-box { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
  .eo-instr-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .eo-instr-row--col { flex-direction: column; align-items: flex-start; }
  .eo-instr-key { font-size: 0.75rem; color: var(--text-3); font-family: 'Tajawal',sans-serif; }
  .eo-instr-val { font-family: 'JetBrains Mono',monospace; font-size: 0.88rem; color: var(--text-1); font-weight: 600; }
  .eo-instr-addr { word-break: break-all; direction: ltr; text-align: left; line-height: 1.5; }
  .eo-warning { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: 8px; background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); font-size: 0.78rem; color: var(--gold); font-family: 'Tajawal',sans-serif; margin-top: 10px; line-height: 1.5; }

  .eo-status-steps { display: flex; flex-direction: column; gap: 0; }
  .eo-status-step { display: flex; align-items: flex-start; gap: 12px; padding: 0; }
  .eo-status-step-dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--text-3); font-size: 0.7rem; background: var(--bg); }
  .eo-status-step--done .eo-status-step-dot { border-color: var(--green); background: rgba(0,229,160,0.12); color: var(--green); }
  .eo-status-step--active .eo-status-step-dot { border-color: var(--cyan); background: rgba(0,210,255,0.1); }
  .eo-status-step--rejected .eo-status-step-dot { border-color: #f87171; background: rgba(239,68,68,0.1); }
  .eo-status-step-line { width: 2px; height: 20px; background: var(--border-1); margin: 3px 0 3px 11px; }
  .eo-status-step-line--done { background: var(--green); }
  .eo-status-step-label { font-size: 0.82rem; color: var(--text-2); font-family: 'Tajawal',sans-serif; padding: 4px 0; }
  .eo-status-step--done .eo-status-step-label { color: var(--green); }
  .eo-status-step--active .eo-status-step-label { color: var(--cyan); font-weight: 700; }

  .eo-pulse-dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); animation: eo-blink 1.2s ease-in-out infinite; }

  .eo-help-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 10px; border: 1px solid var(--border-1); background: transparent; color: var(--text-2); cursor: pointer; font-size: 0.82rem; font-weight: 600; font-family: 'Cairo',sans-serif; text-decoration: none; transition: all 0.15s; }
  .eo-help-btn:hover { border-color: var(--cyan); color: var(--cyan); }
  .eo-help-btn--ghost { color: var(--text-3); }
`
