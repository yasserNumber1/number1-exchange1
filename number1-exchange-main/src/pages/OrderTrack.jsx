// src/pages/OrderTrack.jsx — نظام تتبع الطلب الكامل
// يدعم: Session Cookie | SSE | Countdown | Auto-refresh | Offline recovery
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useLang from '../context/useLang'
import { readOrderSession, clearOrderSession, getTimeRemaining } from '../services/orderSession'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const DONE_STATUSES = ['completed', 'rejected', 'cancelled']

const IcClock   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcSearch  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IcZap     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IcCheck   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcX       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
const IcBig     = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IcRefresh = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
const IcArrow   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>

const STATUS_CONFIG = {
  pending:    { ar: 'في الانتظار',    en: 'Pending',    color: '#f59e0b', icon: <IcClock  />, descAr: 'في انتظار استلام دفعتك',        descEn: 'Waiting to receive your payment',  steps: [true, false, false, false] },
  verifying:  { ar: 'جاري التحقق',   en: 'Verifying',  color: '#a78bfa', icon: <IcSearch />, descAr: 'يراجع الفريق دفعتك',             descEn: 'Team is reviewing your payment',   steps: [true, true,  false, false] },
  verified:   { ar: 'تم التحقق',     en: 'Verified',   color: '#60a5fa', icon: <IcSearch />, descAr: 'تم التحقق من الدفع',             descEn: 'Payment verified',                 steps: [true, true,  false, false] },
  processing: { ar: 'قيد المعالجة',  en: 'Processing', color: '#00b8d9', icon: <IcZap    />, descAr: 'جاري إرسال المبلغ',              descEn: 'Amount is being sent',             steps: [true, true,  true,  false] },
  completed:  { ar: 'مكتمل ✓',       en: 'Completed ✓',color: '#00e5a0', icon: <IcCheck  />, descAr: 'تم إرسال المبلغ بنجاح 🎉',      descEn: 'Amount sent successfully 🎉',      steps: [true, true,  true,  true]  },
  rejected:   { ar: 'مرفوض',         en: 'Rejected',   color: '#f43f5e', icon: <IcX      />, descAr: 'تم رفض الطلب، تواصل مع الدعم',  descEn: 'Order rejected, contact support',  steps: [true, false, false, false] },
  cancelled:  { ar: 'ملغي',          en: 'Cancelled',  color: '#6e7681', icon: <IcX      />, descAr: 'تم إلغاء الطلب',                 descEn: 'Order cancelled',                  steps: [true, false, false, false] },
}
const STEPS_AR = ['استلام الدفعة', 'مراجعة الطلب', 'معالجة التحويل', 'اكتمال الإرسال']
const STEPS_EN = ['Payment Received', 'Order Review', 'Processing Transfer', 'Complete']

function fmtTime(secs) {
  if (secs <= 0) return '00:00'
  const m = Math.floor(secs / 60), s = secs % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function Countdown({ expiresAt, isEn, onExpired }) {
  const [secs, setSecs] = useState(() => getTimeRemaining(expiresAt))
  useEffect(() => {
    if (!expiresAt) return
    setSecs(getTimeRemaining(expiresAt))
    const id = setInterval(() => {
      const rem = getTimeRemaining(expiresAt)
      setSecs(rem)
      if (rem <= 0) { clearInterval(id); onExpired?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpired])
  if (!expiresAt) return null
  const urgent = secs < 120, warning = secs < 600
  const color  = urgent ? '#f43f5e' : warning ? '#f59e0b' : 'var(--cyan)'
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:12, background:color+'12', border:`1px solid ${color}30` }}>
      <IcClock />
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.05rem', fontWeight:700, color, letterSpacing:2 }}>{fmtTime(secs)}</span>
      <span style={{ fontSize:'0.72rem', color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif" }}>{isEn?'remaining':'متبقي'}</span>
    </div>
  )
}

function StatusBadge({ status, isEn }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:20, background:cfg.color+'18', border:`1px solid ${cfg.color}40`, fontSize:'0.82rem', fontWeight:700, color:cfg.color, fontFamily:"'Tajawal',sans-serif" }}>
      {cfg.icon}&nbsp;{isEn ? cfg.en : cfg.ar}
    </span>
  )
}

function ProgressTracker({ steps, isEn }) {
  const labels = isEn ? STEPS_EN : STEPS_AR
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:0, marginTop:22 }}>
      {labels.map((label, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', flex: i < labels.length-1 ? 1 : 'unset' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background: steps[i] ? 'var(--cyan)' : 'var(--border-1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', color: steps[i] ? '#000' : 'var(--text-3)', fontWeight:700, transition:'all 0.4s', boxShadow: steps[i] ? '0 0 16px rgba(0,212,255,0.5)' : 'none' }}>
              {steps[i] ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : i+1}
            </div>
            <span style={{ fontSize:'0.6rem', color: steps[i] ? 'var(--cyan)' : 'var(--text-3)', fontFamily:"'Tajawal',sans-serif", textAlign:'center', whiteSpace:'nowrap', maxWidth:70, lineHeight:1.3 }}>{label}</span>
          </div>
          {i < labels.length-1 && <div style={{ flex:1, height:2, background: steps[i] && steps[i+1] ? 'var(--cyan)' : 'var(--border-1)', margin:'0 4px', marginBottom:22, transition:'background 0.4s' }} />}
        </div>
      ))}
    </div>
  )
}

export default function OrderTrack() {
  const { lang } = useLang()
  const isEn     = lang === 'en'
  const t        = (ar, en) => isEn ? en : ar

  const [orderId,      setOrderId]      = useState('')
  const [order,        setOrder]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [notFound,     setNotFound]     = useState(false)
  const [error,        setError]        = useState(null)
  const [expired,      setExpired]      = useState(false)
  const [sseConn,      setSseConn]      = useState(false)
  const [lastUpdated,  setLastUpdated]  = useState(null)
  const [sessionInfo,  setSessionInfo]  = useState(null)
  const [hasSession,   setHasSession]   = useState(false)

  const sseRef  = useRef(null)
  const pollRef = useRef(null)

  const cleanup = useCallback(() => {
    if (sseRef.current)  { sseRef.current.close();    sseRef.current  = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  useEffect(() => {
    window.scrollTo(0,0)
    const session = readOrderSession()
    if (session) {
      setHasSession(true)
      setSessionInfo(session)
      setOrderId(session.orderNumber)
      loadBySession(session.sessionToken)
    } else {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      if (id) { setOrderId(id); doSearchByNumber(id) }
    }
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Load by Session Token ─────────────────────── */
  const loadBySession = useCallback(async (token) => {
    if (!token) return
    setLoading(true); setNotFound(false); setError(null); setExpired(false)
    try {
      const res  = await fetch(`${API}/api/orders/by-session/${token}`)
      const data = await res.json()
      if (res.status === 410 || data.expired) {
        setExpired(true); clearOrderSession(); setHasSession(false); return
      }
      if (!res.ok || !data.success) { setNotFound(true); return }
      setOrder(data.order); setLastUpdated(new Date())
      if (!DONE_STATUSES.includes(data.order.status)) connectSSE(token)
    } catch { setError(t('خطأ في الاتصال. حاول مرة أخرى.', 'Connection error. Try again.')) }
    finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Search by Order Number ────────────────────── */
  const doSearchByNumber = useCallback(async (idOverride) => {
    const clean = (idOverride || orderId).trim().toUpperCase()
    if (!clean) return
    cleanup(); setSseConn(false)
    setLoading(true); setOrder(null); setNotFound(false); setError(null); setExpired(false)
    try {
      const res  = await fetch(`${API}/api/orders/track/${clean}`)
      const data = await res.json()
      if (!res.ok || !data.success) { setNotFound(true); return }
      setOrder(data.order); setLastUpdated(new Date())
      const sess = readOrderSession()
      if (sess && sess.orderNumber === clean && !DONE_STATUSES.includes(data.order.status)) {
        connectSSE(sess.sessionToken)
      } else if (!DONE_STATUSES.includes(data.order.status)) {
        startPollNumber(clean)
      }
    } catch { setError(t('تعذر الاتصال بالخادم.', 'Could not connect to server.')) }
    finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  /* ── SSE ───────────────────────────────────────── */
  const connectSSE = useCallback((token) => {
    if (sseRef.current) sseRef.current.close()
    if (!window.EventSource) { startPollToken(token); return }
    const es = new EventSource(`${API}/api/orders/sse/${token}`)
    sseRef.current = es
    es.onopen    = () => setSseConn(true)
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'EXPIRED')        { setExpired(true); clearOrderSession(); setHasSession(false); es.close(); return }
        if (msg.type === 'NOT_FOUND')      { setNotFound(true); es.close(); return }
        if (msg.type === 'STATUS_UPDATE')  {
          setOrder(prev => prev ? { ...prev, status: msg.status, updatedAt: msg.updatedAt } : prev)
          setLastUpdated(new Date())
          if (DONE_STATUSES.includes(msg.status)) { es.close(); setSseConn(false) }
        }
      } catch {}
    }
    es.onerror = () => { setSseConn(false); es.close(); startPollToken(token) }
  }, [])

  /* ── Polling (fallback) ────────────────────────── */
  const startPollToken = useCallback((token) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/api/orders/by-session/${token}`)
        const data = await res.json()
        if (data.success && data.order) {
          setOrder(prev => { if (prev?.status !== data.order.status) setLastUpdated(new Date()); return data.order })
          if (DONE_STATUSES.includes(data.order.status)) clearInterval(pollRef.current)
        }
        if (data.expired) { setExpired(true); clearOrderSession(); clearInterval(pollRef.current) }
      } catch {}
    }, 15000)
  }, [])

  const startPollNumber = useCallback((num) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API}/api/orders/track/${num}`)
        const data = await res.json()
        if (data.success && data.order) {
          setOrder(prev => { if (prev?.status !== data.order.status) setLastUpdated(new Date()); return data.order })
          if (DONE_STATUSES.includes(data.order.status)) clearInterval(pollRef.current)
        }
      } catch {}
    }, 30000)
  }, [])

  const handleExpired = useCallback(() => {
    setExpired(true); clearOrderSession(); setHasSession(false); cleanup()
  }, [cleanup])

  const handleNewSearch = () => {
    clearOrderSession(); setHasSession(false); setSessionInfo(null)
    setOrder(null); setOrderId(''); setExpired(false); setNotFound(false); setError(null)
    cleanup()
  }

  const cfg   = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null
  const steps = cfg?.steps || [false, false, false, false]

  return (
    <div style={{ minHeight:'80vh', padding:'60px 24px 80px', maxWidth:720, margin:'0 auto', direction: isEn ? 'ltr' : 'rtl' }}>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ot-ani { animation: fadeIn 0.35s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:40 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', borderRadius:20, border:'1px solid rgba(0,212,255,0.3)', background:'rgba(0,212,255,0.06)', marginBottom:18 }}>
          <span style={{ fontSize:'0.7rem', color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2 }}>ORDER TRACKING</span>
        </div>
        <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'clamp(1.5rem,4vw,2.1rem)', fontWeight:900, color:'var(--text-1)', margin:'0 0 12px' }}>
          {t('تتبع طلبك', 'Track Your Order')}
        </h1>
        <p style={{ fontSize:'0.93rem', color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", lineHeight:1.8, maxWidth:380, margin:'0 auto' }}>
          {t('تحديث تلقائي لحظي لحالة طلبك بدون الحاجة لتحديث الصفحة', 'Live automatic updates — no page refresh needed')}
        </p>
      </div>

      {/* Active session banner */}
      {hasSession && sessionInfo && !order && !loading && !expired && (
        <div className="ot-ani" style={{ background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.25)', borderRadius:16, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:'0.68rem', color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, marginBottom:4 }}>ACTIVE SESSION</div>
            <div style={{ fontFamily:"'Tajawal',sans-serif", color:'var(--text-1)', fontWeight:600, fontSize:'0.9rem' }}>
              {t('لديك طلب نشط:', 'You have an active order:')}&nbsp;
              <span style={{ color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace" }}>{sessionInfo.orderNumber}</span>
            </div>
          </div>
          <button onClick={() => loadBySession(sessionInfo.sessionToken)}
            style={{ padding:'8px 18px', background:'var(--cyan)', border:'none', borderRadius:10, color:'#000', fontWeight:700, fontFamily:"'Tajawal',sans-serif", cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            {t('عرض الطلب','View Order')} <IcArrow />
          </button>
        </div>
      )}

      {/* Search box */}
      {!order && !expired && (
        <div className="ot-ani" style={{ background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:20, padding:'24px', marginBottom:24 }}>
          <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:10, letterSpacing:1 }}>
            {t('رقم الطلب','ORDER NUMBER')}
          </label>
          <div style={{ display:'flex', gap:10 }}>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} onKeyDown={e => e.key==='Enter' && doSearchByNumber()}
              placeholder="N1-00001" dir="ltr"
              style={{ flex:1, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-1)', borderRadius:11, color:'var(--text-1)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.95rem', outline:'none', letterSpacing:1 }}
              onFocus={e => e.target.style.borderColor='var(--cyan)'}
              onBlur={e  => e.target.style.borderColor='var(--border-1)'} />
            <button onClick={() => doSearchByNumber()} disabled={!orderId.trim() || loading}
              style={{ padding:'12px 22px', background:'linear-gradient(135deg,#009fc0,#006e9e)', border:'none', borderRadius:11, color:'#fff', fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', fontWeight:700, cursor: !orderId.trim() || loading ? 'not-allowed':'pointer', opacity:!orderId.trim()?0.5:1, minWidth:90 }}>
              {loading
                ? <span style={{ display:'inline-block', width:18, height:18, border:'2px solid #fff4', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                : t('بحث','Search')}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="ot-ani" style={{ padding:'16px 20px', background:'var(--card)', border:'1px solid rgba(244,63,94,0.3)', borderRadius:14, marginBottom:16 }}>
          <p style={{ color:'#f43f5e', fontFamily:"'Tajawal',sans-serif", margin:0, fontSize:'0.9rem' }}>{error}</p>
        </div>
      )}

      {/* Not found */}
      {notFound && (
        <div className="ot-ani" style={{ textAlign:'center', padding:'36px', background:'var(--card)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:20 }}>
          <div style={{ color:'var(--text-3)', marginBottom:14 }}><IcBig /></div>
          <h3 style={{ fontFamily:"'Tajawal',sans-serif", color:'var(--text-1)', margin:'0 0 8px' }}>{t('الطلب غير موجود','Order Not Found')}</h3>
          <p style={{ color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.86rem' }}>
            {t('تأكد من رقم الطلب أو ','Check the order number or ')}
            <a href="/contact" style={{ color:'var(--cyan)' }}>{t('تواصل مع الدعم','contact support')}</a>
          </p>
        </div>
      )}

      {/* Expired */}
      {expired && (
        <div className="ot-ani" style={{ textAlign:'center', padding:'40px 24px', background:'var(--card)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20 }}>
          <div style={{ fontSize:52, marginBottom:12 }}>⏰</div>
          <h3 style={{ fontFamily:"'Tajawal',sans-serif", color:'#f59e0b', margin:'0 0 10px' }}>{t('انتهت مدة الطلب','Session Expired')}</h3>
          <p style={{ color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', marginBottom:22, maxWidth:360, margin:'0 auto 22px' }}>
            {t('مضت 30 دقيقة. يمكنك البحث برقم الطلب إذا كنت تعرفه.', 'The 30-minute window has passed. You can still search using your order number.')}
          </p>
          <button onClick={handleNewSearch}
            style={{ padding:'10px 26px', background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:12, color:'#f59e0b', fontFamily:"'Tajawal',sans-serif", fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
            {t('بحث بالرقم','Search by Number')}
          </button>
        </div>
      )}

      {/* ── Order result card ───────────────────────── */}
      {order && cfg && (
        <div className="ot-ani" style={{ background:'var(--card)', border:`1px solid ${cfg.color}40`, borderRadius:20, padding:'28px 24px' }}>

          {/* Top row: order number + status + live dot */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>ORDER ID</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.1rem', fontWeight:700, color:'var(--text-1)' }}>{order.orderNumber}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:7 }}>
              <StatusBadge status={order.status} isEn={isEn} />
              {/* Live / Offline indicator */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background: sseConn ? 'rgba(0,229,160,0.08)' : 'rgba(100,100,100,0.1)', border:`1px solid ${sseConn ? 'rgba(0,229,160,0.3)' : 'rgba(100,100,100,0.2)'}` }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: sseConn ? '#00e5a0' : '#888', boxShadow: sseConn ? '0 0 6px #00e5a0' : 'none', animation: sseConn ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize:'0.62rem', color: sseConn ? '#00e5a0' : '#888', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>{sseConn ? 'LIVE' : 'POLLING'}</span>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {order.expiresAt && !DONE_STATUSES.includes(order.status) && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:1 }}>{t('الوقت المتبقي للطلب','TIME REMAINING')}</div>
              <Countdown expiresAt={order.expiresAt} isEn={isEn} onExpired={handleExpired} />
            </div>
          )}

          {/* Progress */}
          <ProgressTracker steps={steps} isEn={isEn} />

          {/* Details */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginTop:24 }}>
            {[
              { ar:'المبلغ المرسل',  en:'Amount Sent',     val:`${order.payment?.amountSent} ${order.payment?.currencySent}` },
              { ar:'المبلغ المستلم', en:'Amount Received',  val:`${order.moneygo?.amountUSD} USD` },
              { ar:'حالة التحويل',   en:'Transfer Status',  val: order.moneygo?.transferStatus || '—' },
              { ar:'تاريخ الطلب',    en:'Order Date',       val: new Date(order.createdAt).toLocaleString(isEn?'en-US':'ar-EG') },
            ].map(d => (
              <div key={d.en} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-1)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:'0.64rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:4, letterSpacing:1 }}>{isEn ? d.en : d.ar}</div>
                <div style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:700, color:'var(--text-1)', fontSize:'0.88rem' }}>{d.val}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div style={{ marginTop:22 }}>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:10, letterSpacing:1 }}>{t('سجل الأحداث','EVENT LOG')}</div>
              {[...order.timeline].reverse().map((ev, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom:'1px solid var(--border-1)' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--cyan)', marginTop:7, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif" }}>{ev.message}</div>
                    <div style={{ fontSize:'0.67rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{new Date(ev.timestamp).toLocaleString(isEn?'en-US':'ar-EG')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status message */}
          <div style={{ marginTop:18, padding:'12px 16px', borderRadius:12, background:cfg.color+'10', border:`1px solid ${cfg.color}25`, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:cfg.color, flexShrink:0 }}>{cfg.icon}</span>
            <span style={{ fontSize:'0.88rem', color:cfg.color, fontFamily:"'Tajawal',sans-serif" }}>{isEn ? cfg.descEn : cfg.descAr}</span>
          </div>

          {/* Footer */}
          <div style={{ marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {lastUpdated && (
                <span style={{ fontSize:'0.67rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>
                  {t('آخر تحديث:','Updated:')} {lastUpdated.toLocaleTimeString(isEn?'en-US':'ar-EG')}
                </span>
              )}
              <button
                onClick={() => sessionInfo ? loadBySession(sessionInfo.sessionToken) : doSearchByNumber(order.orderNumber)}
                style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'transparent', border:'1px solid var(--border-1)', borderRadius:8, color:'var(--text-3)', cursor:'pointer', fontSize:'0.68rem', fontFamily:"'JetBrains Mono',monospace" }}>
                <IcRefresh /> {t('تحديث','Refresh')}
              </button>
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              {order.status !== 'completed' && (
                <a href="/contact" style={{ fontSize:'0.78rem', color:'var(--cyan)', fontFamily:"'Tajawal',sans-serif", textDecoration:'none' }}>
                  {t('تواصل مع الدعم','Contact support')}
                </a>
              )}
              {hasSession && (
                <button onClick={handleNewSearch} style={{ background:'transparent', border:'none', color:'var(--text-3)', fontSize:'0.75rem', cursor:'pointer', fontFamily:"'Tajawal',sans-serif", padding:0 }}>
                  {t('بحث آخر','New search')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
