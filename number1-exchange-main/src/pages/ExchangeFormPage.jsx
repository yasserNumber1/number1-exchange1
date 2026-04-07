// src/pages/ExchangeFormPage.jsx
// ═══════════════════════════════════════════════════════════════
// الصفحة 2 — تفاصيل الطلب
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useLang  from '../context/useLang'
import useAuth  from '../context/useAuth'
import FlowDots from '../components/shared/FlowDots'
import { SEND_METHODS, RECEIVE_METHODS } from '../data/currencies'
import {
  getRate,
  calcReceiveAmount,
  getRateDisplay,
  toOrderType,
  toPaymentMethod,
  getCurrencySent,
} from '../services/rateEngine'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function MethodIcon({ method, size = 32 }) {
  const [err, setErr] = useState(false)
  if (method?.img && !err) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <img src={method.img} alt={method.name} onError={() => setErr(true)} style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: method?.color || '#26a17b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: size * 0.38, fontWeight: 700, color: '#fff' }}>
      {method?.symbol}
    </div>
  )
}

// ── رسالة خطأ inline ─────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: '0.76rem', color: '#f87171', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </div>
  )
}

function genMath() {
  const a = Math.floor(Math.random() * 12) + 1
  const b = Math.floor(Math.random() * 12) + 1
  return { a, b, ans: String(a + b) }
}

export default function ExchangeFormPage() {
  const navigate     = useNavigate()
  const [params]     = useSearchParams()
  const { user }     = useAuth()

  const fromId = params.get('from')
  const toId   = params.get('to')

  useEffect(() => {
    if (!fromId || !toId) navigate('/exchange', { replace: true })
  }, [fromId, toId, navigate])

  const sendMethod = SEND_METHODS.find(m => m.id === fromId)  || null
  const recvMethod = RECEIVE_METHODS.find(m => m.id === toId) || null

  const isWalletRecv  = toId   === 'wallet-recv'
  const isWalletSend  = fromId === 'wallet-usdt'
  useEffect(() => {
  if (isWalletSend && !user) navigate('/exchange', { replace: true })
}, [isWalletSend, user])
  const isMoneyGoRecv = toId   === 'mgo-recv'
  const isUsdtRecv    = toId   === 'usdt-recv'
  const isEgpSend     = sendMethod?.type === 'egp'
  const isUsdtSend    = fromId === 'usdt-trc'

  // ── بيانات من الـ API ───────────────────────────────────────
  const [rates,      setRates]     = useState(null)
  const [adminItem,  setAdminItem] = useState(null)
  const [apiLoading, setLoading]   = useState(true)

  useEffect(() => {
    if (!fromId) return
    Promise.all([
      fetch(`${API}/api/public/rates`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/public/payment-methods`).then(r => r.json()).catch(() => null),
    ]).then(([ratesRes, methodsRes]) => {
      if (ratesRes?.success)   setRates(ratesRes)
      if (methodsRes?.success) {
        if (isEgpSend) {
          const found = methodsRes.wallets?.find(w =>
            (w.name || '').toLowerCase().includes(fromId)
          )
          setAdminItem(found || methodsRes.wallets?.[0] || null)
        } else if (isUsdtSend) {
          setAdminItem(methodsRes.cryptos?.[0] || null)
        }
      }
    }).finally(() => setLoading(false))
  }, [fromId])

  // ── حالة النموذج ────────────────────────────────────────────
  const [sendAmount,  setSendAmount]  = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [usdtAddress, setUsdtAddress] = useState('')
  const [usdtNetwork, setUsdtNetwork] = useState('TRC20')
  const [email,       setEmail]       = useState(() => user?.email || '')
  const [userPhone,   setUserPhone]   = useState('')
  const [txid,        setTxid]        = useState('')
  const [receipt,     setReceipt]     = useState(null)
  const [receiptPrev, setReceiptPrev] = useState(null)
  const [agreed,      setAgreed]      = useState(false)
  const [math,        setMath]        = useState(() => genMath())
  const [mathInput,   setMathInput]   = useState('')
  const [loading,     setLoading2]    = useState(false)
  const [error,       setError]       = useState('')
  const [walletId,    setWalletId]    = useState('')
  const [submitted,   setSubmitted]   = useState(false) // لإظهار الأخطاء عند الضغط

  // ── أخطاء الحقول ────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])

  useEffect(() => {
    if (!isWalletRecv || !user) return
    fetch(`${API}/api/wallet`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('n1_token')}` }
    }).then(r => r.json()).then(d => { if (d.success) setWalletId(d.wallet.walletId) }).catch(() => {})
  }, [isWalletRecv, user])

  // ── حساب المبلغ المستلَم ────────────────────────────────────
  const receiveAmount = useMemo(() => {
    if (!rates) return ''
    return calcReceiveAmount(sendAmount, fromId, toId, rates)
  }, [sendAmount, fromId, toId, rates])

  const rateDisplay = useMemo(() => {
    if (!rates) return '...'
    return getRateDisplay(fromId, toId, rates, sendMethod?.symbol, recvMethod?.symbol)
  }, [fromId, toId, rates, sendMethod, recvMethod])

  // ── حدود الطلب حسب العملة ──────────────────────────────────
  const limits = useMemo(() => {
    if (!rates) return { min: 10, max: 5000, unit: 'USDT' }
    if (isEgpSend) return {
      min:  rates.minEgp  || 100,
      max:  rates.maxEgp  || 300000,
      unit: 'EGP',
    }
    if (isMoneyGoRecv && !isEgpSend) return {
      min:  rates.minMgo  || 10,
      max:  rates.maxMgo  || 10000,
      unit: 'MGO',
    }
    return {
      min:  rates.minUsdt || rates.minOrderUsdt || 10,
      max:  rates.maxUsdt || rates.maxOrderUsdt || 5000,
      unit: 'USDT',
    }
  }, [rates, isEgpSend, isMoneyGoRecv])

  // ── التحقق من البيانات ──────────────────────────────────────
  const validate = () => {
    const errs = {}
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const amt = parseFloat(sendAmount)

    // المبلغ
    if (!sendAmount || isNaN(amt) || amt <= 0) {
      errs.amount = 'يرجى إدخال مبلغ صحيح'
    } else if (amt < limits.min) {
      errs.amount = `الحد الأدنى هو ${limits.min.toLocaleString()} ${limits.unit}`
    } else if (amt > limits.max) {
      errs.amount = `الحد الأقصى هو ${limits.max.toLocaleString()} ${limits.unit}`
    }

    // البريد الإلكتروني
    if (!email || !emailRx.test(email)) {
      errs.email = 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)'
    }

    // رقم الهاتف للوسائل المصرية
    if (isEgpSend && userPhone && !/^\+?[0-9\s\-]{7,20}$/.test(userPhone.trim())) {
      errs.phone = 'رقم الهاتف غير صحيح'
    }

    // بيانات الاستلام
    if (isMoneyGoRecv && recipientId.trim().length < 3) {
      errs.recipient = 'يرجى إدخال معرّف محفظة MoneyGo صحيح (3 أحرف على الأقل)'
    }
    if (isUsdtRecv && usdtAddress.trim().length < 10) {
      errs.recipient = 'يرجى إدخال عنوان محفظة USDT صحيح'
    }
    if (isWalletRecv && !user) {
      errs.recipient = 'يجب تسجيل الدخول لاستخدام المحفظة الداخلية'
    }
    if (isWalletRecv && user && !walletId) {
      errs.recipient = 'جاري تحميل بيانات المحفظة، حاول مرة أخرى'
    }

    // الموافقة
    if (!agreed) {
      errs.agreed = 'يجب الموافقة على الشروط والأحكام للمتابعة'
    }

    // التحقق الرياضي
    if (mathInput.trim() !== math.ans) {
      errs.math = 'إجابة خاطئة — تحقق من الحساب مرة أخرى'
    }

    return errs
  }

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setReceipt(f)
    const r = new FileReader()
    r.onload = ev => setReceiptPrev(ev.target.result)
    r.readAsDataURL(f)
  }

  // ── مسح خطأ حقل عند الكتابة ─────────────────────────────
  const clearErr = (key) => {
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  // ── الإرسال ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitted(true)
    const errs = validate()
    setFieldErrors(errs)

    if (Object.keys(errs).length > 0) {
      // اسكرول لأول خطأ
      const firstErrKey = Object.keys(errs)[0]
      document.getElementById(`field-${firstErrKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading2(true)
    setError('')
    try {
      let receiptImageUrl = ''
      if (receipt) {
        try {
          const fd    = new FormData()
          fd.append('receipt', receipt)
          const token = localStorage.getItem('n1_token')
          const up    = await fetch(`${API}/api/orders/upload-receipt`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          })
          const upData = await up.json()
          if (upData.url) receiptImageUrl = upData.url
        } catch(e) { console.warn('receipt upload failed:', e.message) }
      }

      const recipientPhone = isMoneyGoRecv ? recipientId
                           : isUsdtRecv    ? usdtAddress
                           : isWalletRecv  ? walletId
                           : ''

      const { rate: appliedRate } = getRate(fromId, toId, rates || {})
      const finalAmountUSD = parseFloat(receiveAmount) || 0

const token = localStorage.getItem('n1_token')
const res = await fetch(`${API}/api/orders`, {
  method:  'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  body: JSON.stringify({
    customerName:  email.split('@')[0],
    customerEmail: email,
    customerPhone: userPhone || '',
    orderType:     toOrderType(fromId, toId),
    payment: {
      method:            toPaymentMethod(fromId),
      amountSent:        parseFloat(sendAmount),
      currencySent:      getCurrencySent(fromId),
      receiptImageUrl,
      senderPhoneNumber: userPhone || '',
      txHash:            txid.trim() || null,
    },
    moneygo: {
      recipientName:  email.split('@')[0],
      recipientPhone,
      amountUSD:      finalAmountUSD,
    },
    exchangeRate: {
      appliedRate,
      finalAmountUSD,
    },
  }),
})

      const data = await res.json()
      if (data.success && data.order) {
        if (data.order.sessionToken) {
          try {
            const sessionData = JSON.stringify({
              sessionToken: data.order.sessionToken,
              orderNumber:  data.order.orderNumber,
              expiresAt:    data.order.expiresAt,
            })
            localStorage.setItem('n1_order_session', sessionData)
            const expires = new Date(data.order.expiresAt)
            document.cookie = `n1_order_session=${encodeURIComponent(sessionData)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
          } catch (_) {}
        }
        navigate(`/exchange/order/${data.order.orderNumber}`, {
          state: { sendMethod, recvMethod, sendAmount, receiveAmount, recipientId: recipientPhone, usdtNetwork, adminItem, email }
        })
      } else {
        setError(data.message || 'حدث خطأ، حاول مرة أخرى')
        setMath(genMath()); setMathInput('')
      }
    } catch(err) {
      setError('خطأ في الاتصال بالسيرفر، حاول مرة أخرى')
      setMath(genMath()); setMathInput('')
    } finally {
      setLoading2(false)
    }
  }

  if (!sendMethod || !recvMethod) return null

  const canSubmit = !loading

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{CSS}</style>

      <div className="ef-header">
        <button onClick={() => navigate('/exchange')} className="ef-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          رجوع
        </button>
        <div className="ef-header-title"><span>تفاصيل الطلب</span></div>
        <div style={{ width: 72 }} />
      </div>

      <div className="ef-steps">
        <div className="ef-step ef-step--done">
          <span className="ef-step-dot ef-step-dot--done">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>الطريقة</span>
        </div>
        <div className="ef-step-line ef-step-line--done" />
        <div className="ef-step ef-step--active">
          <span className="ef-step-dot">2</span>
          <span>تفاصيل الطلب</span>
        </div>
        <div className="ef-step-line" />
        <div className="ef-step ef-step--inactive">
          <span className="ef-step-dot ef-step-dot--off">3</span>
          <span style={{ color: 'var(--text-3)' }}>تتبع الطلب</span>
        </div>
      </div>

      <div className="ef-content">

        {/* ── بطاقة الزوج ── */}
        <div className="ef-pair-card">
          <div className="ef-pair-side">
            <MethodIcon method={sendMethod} size={40} />
            <div><div className="ef-pair-label">ترسل</div><div className="ef-pair-name">{sendMethod.name}</div></div>
          </div>
          <div className="ef-pair-arrow">
            {apiLoading ? (
              <span className="ef-rate-loading" />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <FlowDots />
                <div style={{ fontSize: '0.62rem', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace", marginTop: 4, whiteSpace: 'nowrap' }}>
                  {rateDisplay}
                </div>
              </div>
            )}
          </div>
          <div className="ef-pair-side ef-pair-side--right">
            <div style={{ textAlign: 'right' }}><div className="ef-pair-label">تستلم</div><div className="ef-pair-name">{recvMethod.name}</div></div>
            <MethodIcon method={recvMethod} size={40} />
          </div>
        </div>

        {/* ── المبلغ ── */}
        <div className="ef-card" id="field-amount">
          <label className="ef-label">المبلغ المُرسَل <span style={{ color: 'var(--red)' }}>*</span></label>
          <div className={`ef-amount-row ${fieldErrors.amount ? 'ef-amount-row--error' : ''}`}>
            <input
              type="number" min="0" step="any"
              value={sendAmount}
              onChange={e => { setSendAmount(e.target.value); clearErr('amount') }}
              placeholder="0.00"
              className="ef-input ef-amount-input"
            />
            <div className="ef-currency-badge">
              <MethodIcon method={sendMethod} size={20} />
              <span>{sendMethod.symbol}</span>
            </div>
          </div>
          <FieldError msg={fieldErrors.amount} />
          {receiveAmount && !fieldErrors.amount && (
            <div className="ef-receive-row">
              <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
                {isWalletRecv ? 'سيُضاف لمحفظتك' : 'تستلم تقريباً'}
              </span>
              <span style={{ color: 'var(--green)', fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", fontSize: '1.05rem' }}>
                {receiveAmount} <span style={{ fontSize: '0.78rem' }}>{recvMethod.symbol}</span>
              </span>
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>
            الحد الأدنى: {limits.min.toLocaleString()} {limits.unit} · الأقصى: {limits.max.toLocaleString()} {limits.unit}
          </div>
        </div>

        {/* ── بيانات الاستلام ── */}
        <div className="ef-card" id="field-recipient">
          {isMoneyGoRecv && (
            <>
              <label className="ef-label">معرّف محفظة MoneyGo <span style={{ color: 'var(--red)' }}>*</span></label>
              <input
                type="text" value={recipientId}
                onChange={e => { setRecipientId(e.target.value); clearErr('recipient') }}
                placeholder="U-XXXXXXXX"
                className={`ef-input ef-mono ${fieldErrors.recipient ? 'ef-input--error' : ''}`}
                style={{ direction: 'ltr' }}
              />
              <FieldError msg={fieldErrors.recipient} />
              <p className="ef-hint">أدخل معرّف محفظة MoneyGo الذي ستستلم عليه المبلغ</p>
            </>
          )}
          {isUsdtRecv && (
            <>
              <label className="ef-label">عنوان محفظة USDT للاستلام <span style={{ color: 'var(--red)' }}>*</span></label>
              <input
                type="text" value={usdtAddress}
                onChange={e => { setUsdtAddress(e.target.value); clearErr('recipient') }}
                placeholder="T... أو 0x..."
                className={`ef-input ef-mono ${fieldErrors.recipient ? 'ef-input--error' : ''}`}
                style={{ direction: 'ltr' }}
              />
              <FieldError msg={fieldErrors.recipient} />
              <label className="ef-label" style={{ marginTop: 14 }}>الشبكة</label>
              <div className="ef-network-row">
                {['TRC20', 'BEP20'].map(net => (
                  <button key={net} onClick={() => setUsdtNetwork(net)} className={`ef-net-btn ${usdtNetwork === net ? 'ef-net-btn--active' : ''}`}>{net}</button>
                ))}
              </div>
              <div className="ef-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>⚠ تأكد من اختيار الشبكة الصحيحة ({usdtNetwork}). الإرسال على شبكة خاطئة قد يؤدي إلى فقدان الأموال نهائياً.</span>
              </div>
            </>
          )}
          {isWalletRecv && (
            <>
              <div className="ef-wallet-info">
                <div className="ef-wallet-info-icon">🏦</div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)' }}>سيتم الإيداع في محفظتك الداخلية تلقائياً</div>
                  {walletId ? (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>رقم المحفظة: {walletId}</div>
                  ) : !user ? (
                    <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4 }}>⚠ يجب تسجيل الدخول لاستخدام المحفظة الداخلية</div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>جاري تحميل بيانات المحفظة...</div>
                  )}
                </div>
              </div>
              <FieldError msg={fieldErrors.recipient} />
            </>
          )}
        </div>

        {/* ── بيانات المُرسِل ── */}
        <div className="ef-card" id="field-email">
          <label className="ef-label">البريد الإلكتروني <span style={{ color: 'var(--red)' }}>*</span></label>
          <input
            type="email" value={email}
            onChange={e => { if (!user?.email) { setEmail(e.target.value); clearErr('email') } }}
            placeholder="example@email.com"
            className={`ef-input ef-mono ${fieldErrors.email ? 'ef-input--error' : ''}`}
            readOnly={!!user?.email}
            style={{ direction: 'ltr', opacity: user?.email ? 0.75 : 1 }}
          />
          <FieldError msg={fieldErrors.email} />
          {isEgpSend && (
            <>
              <label className="ef-label" style={{ marginTop: 14 }}>رقم هاتف المُرسِل <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>(اختياري)</span></label>
              <input
                type="tel" value={userPhone}
                onChange={e => { setUserPhone(e.target.value); clearErr('phone') }}
                placeholder="01XXXXXXXXX"
                className={`ef-input ef-mono ${fieldErrors.phone ? 'ef-input--error' : ''}`}
                style={{ direction: 'ltr' }}
              />
              <FieldError msg={fieldErrors.phone} />
            </>
          )}
        </div>

        {/* ── TXID ── */}
        {isUsdtSend && !isWalletRecv && !isMoneyGoRecv && (
          <div className="ef-card">
            <label className="ef-label">رقم المعاملة TXID <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>(اختياري)</span></label>
            <input type="text" value={txid} onChange={e => setTxid(e.target.value)} placeholder="الصق رقم المعاملة هنا..." className="ef-input ef-mono" style={{ direction: 'ltr' }} />
            <p className="ef-hint">ℹ️ أدخل الـ TXID لتسريع التحقق من طلبك</p>
          </div>
        )}

        {/* ── رفع إيصال ── */}
        {isEgpSend && (
          <div className="ef-card">
            <label className="ef-label">صورة إيصال التحويل <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>(اختياري)</span></label>
            <label className="ef-dropzone" style={receiptPrev ? { borderColor: 'var(--green)', background: 'rgba(0,229,160,0.04)' } : {}}>
              {receiptPrev ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={receiptPrev} alt="الإيصال" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                  <div style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--green)' }}>✓ {receipt?.name}</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📸</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>اضغط لرفع صورة الإيصال</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>JPG, PNG — حتى 5MB</div>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {/* ── التحقق الرياضي ── */}
        <div className="ef-card ef-math-card" id="field-math">
          <label className="ef-label">
            تحقق أمني: ما هو ناتج{' '}
            <strong style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{math.a} + {math.b}</strong> ؟
            <span style={{ color: 'var(--red)' }}> *</span>
          </label>
          <input
            type="number" value={mathInput}
            onChange={e => { setMathInput(e.target.value); clearErr('math') }}
            placeholder="اكتب الناتج هنا"
            className={`ef-input ${fieldErrors.math ? 'ef-input--error' : ''}`}
            style={{ maxWidth: 160 }}
          />
          {mathInput && mathInput.trim() === math.ans && !fieldErrors.math && (
            <span style={{ fontSize: '0.74rem', color: 'var(--green)', marginTop: 4 }}>✓ صحيح</span>
          )}
          <FieldError msg={fieldErrors.math} />
        </div>

        {/* ── الموافقة ── */}
        <div id="field-agreed">
          <label className="ef-checkbox-row" style={{ border: fieldErrors.agreed ? '1px solid rgba(239,68,68,0.35)' : 'none', borderRadius: 10, padding: fieldErrors.agreed ? '10px 12px' : '0', background: fieldErrors.agreed ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
            <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); clearErr('agreed') }} className="ef-checkbox" />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
              أوافق على <a href="/terms" target="_blank" style={{ color: 'var(--cyan)' }}>الشروط والأحكام</a> و<a href="/aml" target="_blank" style={{ color: 'var(--cyan)' }}>سياسة AML</a>
            </span>
          </label>
          <FieldError msg={fieldErrors.agreed} />
        </div>

        {/* ── خطأ عام ── */}
        {error && <div className="ef-error">⚠ {error}</div>}

        {/* ── ملخص الأخطاء عند الضغط ── */}
        {submitted && Object.keys(fieldErrors).length > 0 && (
          <div className="ef-errors-summary">
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: 6 }}>
              ⚠ يرجى تصحيح الأخطاء التالية:
            </div>
            {Object.values(fieldErrors).filter(Boolean).map((msg, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: 3 }}>• {msg}</div>
            ))}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="ef-submit-btn">
          {loading ? <><span className="ef-btn-spinner" /> جاري إرسال الطلب...</> : 'إرسال الطلب ✓'}
        </button>

      </div>
    </div>
  )
}

const CSS = `
  @keyframes ef-spin { to { transform: rotate(360deg) } }
  .ef-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: var(--card); border-bottom: 1px solid var(--border-1); position: sticky; top: 0; z-index: 40; }
  .ef-back { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 9px; border: 1px solid var(--border-1); background: transparent; color: var(--text-2); cursor: pointer; font-size: 0.85rem; font-weight: 600; font-family: 'Cairo',sans-serif; transition: all 0.15s; }
  .ef-back:hover { border-color: var(--cyan); color: var(--cyan); }
  .ef-header-title { font-size: 0.95rem; font-weight: 800; color: var(--text-1); font-family: 'Orbitron',sans-serif; }
  .ef-steps { display: flex; align-items: center; justify-content: center; padding: 12px 24px; background: var(--card); border-bottom: 1px solid var(--border-1); }
  .ef-step { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; }
  .ef-step--active { color: var(--cyan); }
  .ef-step--done { color: var(--green); }
  .ef-step--inactive { color: var(--text-3); }
  .ef-step-dot { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: var(--cyan-dim); border: 1.5px solid var(--cyan); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: var(--cyan); }
  .ef-step-dot--done { background: rgba(0,229,160,0.15); border-color: var(--green); color: var(--green); }
  .ef-step-dot--off { background: transparent; border-color: var(--border-1); color: var(--text-3); }
  .ef-step-line { width: 32px; height: 2px; background: var(--border-1); margin: 0 8px; }
  .ef-step-line--done { background: var(--green); }
  .ef-content { max-width: 540px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 16px; }
  .ef-pair-card { display: flex; align-items: center; justify-content: space-between; background: var(--card); border: 1px solid var(--border-1); border-radius: 16px; padding: 16px 20px; gap: 8px; }
  .ef-pair-side { display: flex; align-items: center; gap: 10px; flex: 1; }
  .ef-pair-side--right { flex-direction: row-reverse; }
  .ef-pair-label { font-size: 0.64rem; color: var(--text-3); font-family: 'JetBrains Mono',monospace; letter-spacing: 0.8px; text-transform: uppercase; }
  .ef-pair-name { font-size: 0.9rem; font-weight: 800; color: var(--text-1); margin-top: 2px; }
  .ef-pair-arrow { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ef-rate-loading { display: inline-block; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-1); border-top-color: var(--cyan); animation: ef-spin 0.8s linear infinite; }
  .ef-card { background: var(--card); border: 1px solid var(--border-1); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
  .ef-math-card { background: rgba(0,210,255,0.04); border-color: var(--border-2); }
  .ef-label { font-size: 0.71rem; font-weight: 700; color: var(--text-3); font-family: 'JetBrains Mono',monospace; letter-spacing: 0.5px; text-transform: uppercase; }
  .ef-input { width: 100%; padding: 10px 13px; box-sizing: border-box; background: rgba(255,255,255,0.03); border: 1px solid var(--border-1); border-radius: 10px; color: var(--text-1); font-size: 0.9rem; outline: none; font-family: 'Cairo','Tajawal',sans-serif; transition: border-color 0.18s, box-shadow 0.18s; }
  .ef-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,210,255,0.1); }
  .ef-input--error { border-color: rgba(239,68,68,0.6) !important; background: rgba(239,68,68,0.04); }
  .ef-input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }
  .ef-mono { font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; }
  .ef-amount-row { display: flex; gap: 0; align-items: stretch; border: 1px solid var(--border-1); border-radius: 10px; overflow: hidden; transition: border-color 0.18s; }
  .ef-amount-row--error { border-color: rgba(239,68,68,0.6) !important; background: rgba(239,68,68,0.04); }
  .ef-amount-input { flex: 1; border: none !important; border-radius: 0 !important; font-size: 1.1rem !important; font-weight: 700; box-shadow: none !important; background: transparent !important; }
  .ef-amount-row:focus-within:not(.ef-amount-row--error) { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,210,255,0.1); }
  .ef-currency-badge { display: flex; align-items: center; gap: 6px; padding: 0 14px; background: rgba(255,255,255,0.04); border-right: 1px solid var(--border-1); font-size: 0.82rem; font-weight: 700; color: var(--text-2); flex-shrink: 0; }
  .ef-receive-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 13px; border-radius: 9px; background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.18); }
  .ef-hint { font-size: 0.72rem; color: var(--text-3); font-family: 'JetBrains Mono',monospace; margin: 0; }
  .ef-network-row { display: flex; gap: 8px; }
  .ef-net-btn { padding: 7px 18px; border-radius: 8px; cursor: pointer; border: 1.5px solid var(--border-1); background: transparent; color: var(--text-2); font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; font-weight: 700; transition: all 0.15s; }
  .ef-net-btn--active { border-color: var(--cyan); background: var(--cyan-dim); color: var(--cyan); }
  .ef-warning { display: flex; gap: 8px; align-items: flex-start; padding: 10px 13px; border-radius: 9px; background: rgba(245,158,11,0.07); border: 1px dashed rgba(245,158,11,0.3); font-size: 0.76rem; color: var(--gold); line-height: 1.55; }
  .ef-wallet-info { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.2); }
  .ef-wallet-info-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 1px; }
  .ef-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 16px; border: 1.5px dashed var(--border-2); border-radius: 11px; cursor: pointer; text-align: center; transition: all 0.2s; gap: 4px; }
  .ef-dropzone:hover { border-color: var(--cyan); background: rgba(0,210,255,0.03); }
  .ef-checkbox-row { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; transition: all 0.15s; }
  .ef-checkbox { width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px; accent-color: var(--cyan); cursor: pointer; }
  .ef-error { padding: 11px 14px; border-radius: 10px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #f87171; font-size: 0.84rem; text-align: center; font-family: 'Cairo','Tajawal',sans-serif; }
  .ef-errors-summary { padding: 13px 16px; border-radius: 10px; background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); font-family: 'Cairo','Tajawal',sans-serif; }
  .ef-submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 0; background: linear-gradient(135deg,#009fc0,#006e9e); border: none; border-radius: 13px; color: #fff; font-family: 'Cairo','Tajawal',sans-serif; font-size: 1rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 20px rgba(0,159,192,0.28); transition: transform 0.18s, box-shadow 0.18s; }
  .ef-submit-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(0,159,192,0.38); }
  .ef-submit-btn:disabled { cursor: not-allowed; opacity: 0.6; }
  .ef-btn-spinner { display: inline-block; width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: ef-spin 0.8s linear infinite; }
  @media (max-width: 480px) {
    .ef-step span:not(.ef-step-dot) { display: none; }
    .ef-step-line { width: 20px; }
    .ef-pair-card { padding: 12px 14px; }
  }
`