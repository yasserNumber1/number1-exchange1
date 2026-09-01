// src/pages/ExchangeFormPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuth  from '../context/useAuth'
import useLang from '../context/useLang'
import FlowDots from '../components/shared/FlowDots'
import { displayCurrencySymbol, displayMethodSymbol } from '../utils/currencyDisplay'
import {
  getRate,
  getRateDisplay,
  toOrderType,
  toPaymentMethod,
  getCurrencySent,
  getDynamicLimits,
} from '../services/rateEngine'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'

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
      {displayMethodSymbol(method)}
    </div>
  )
}

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

// ── onOpenAuth: لفتح modal تسجيل الدخول ──────
export default function ExchangeFormPage({ onOpenAuth }) {
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const { user }  = useAuth()
  const { lang }  = useLang()
  const isAr = lang === 'ar'
  const tr = (ar, en) => (isAr ? ar : en)

  const fromId = params.get('from')
  const toId   = params.get('to')

  useEffect(() => {
    if (!fromId || !toId) navigate('/', { replace: true })
  }, [fromId, toId, navigate])

  // Dynamic methods from API
  const [dynamicSend, setDynamicSend] = useState([])
  const [dynamicRecv, setDynamicRecv] = useState([])

  const sendMethod = dynamicSend.find(m => m.id === fromId) || null
  const recvMethod = dynamicRecv.find(m => m.id === toId) || null

  const isWalletRecv  = recvMethod?.type === 'wallet' || toId === 'wallet-recv'
  const isWalletSend  = sendMethod?.type === 'wallet' || fromId === 'wallet-usdt'
  const isMoneyGoRecv = recvMethod?.type === 'moneygo' || toId === 'mgo-recv'
  const isEgpRecv     = recvMethod?.type === 'egp'
  // BNB treated as USDT-like crypto for recv/send detection
  const isUsdtRecv    = (recvMethod?.type === 'crypto' && (recvMethod?.symbol === 'USDT' || recvMethod?.symbol === 'BNB')) || toId === 'usdt-trc' || toId === 'usdt-bnb'
  const isEgpSend     = sendMethod?.type === 'egp' || sendMethod?.symbol === 'EGP'
  const isUsdtSend    = (sendMethod?.type === 'crypto' && (sendMethod?.symbol === 'USDT' || sendMethod?.symbol === 'BNB')) || fromId === 'usdt-trc' || fromId === 'usdt-bnb'
  const sendNetwork   = sendMethod?.network || (fromId === 'usdt-bnb' || sendMethod?.symbol === 'BNB' ? 'BEP20' : 'TRC20')
  const recvNetwork   = recvMethod?.network || (toId === 'usdt-bnb' || recvMethod?.symbol === 'BNB' ? 'BEP20' : 'TRC20')
  const sendNetworkLabel = sendNetwork === 'BEP20' ? (sendMethod?.symbol === 'BNB' ? 'BNB BEP20' : 'USDT BNB') : 'USDT TRC20'
  const recvNetworkLabel = recvNetwork === 'BEP20' ? (recvMethod?.symbol === 'BNB' ? 'BNB BEP20' : 'USDT BNB') : 'USDT TRC20'

  // ── منع الأزواج غير المتوافقة (تحقق إضافي في حال وصل المستخدم عبر URL مباشر) ──
  useEffect(() => {
    if (!sendMethod || !recvMethod) return
    const isUsdtLike = (m) => m.type === 'crypto' && (m.symbol === 'USDT' || m.symbol === 'BNB')
    const incompatible =
      sendMethod.id === recvMethod.id ||
      (sendMethod.type === 'egp' && recvMethod.type === 'egp') ||
      (sendMethod.type === 'moneygo' && recvMethod.type === 'moneygo') ||
      (isUsdtLike(sendMethod) && isUsdtLike(recvMethod))
    if (incompatible) navigate('/', { replace: true })
  }, [sendMethod, recvMethod, navigate])

  // ── إذا المحفظة الداخلية وغير مسجل — ارجع وافتح Modal ──
  useEffect(() => {
    if ((isWalletSend || isWalletRecv) && !user) {
      navigate('/', { replace: true })
      setTimeout(() => onOpenAuth?.('login'), 150)
    }
  }, [isWalletSend, isWalletRecv, user])

  // ── بيانات API + Auto-refetch ──────────────────────────
  const [rates,      setRates]    = useState(null)
  const [apiLoading, setLoading]  = useState(true)

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/public/rates`)
      const data = await res.json()
      if (data.success) setRates(data)
    } catch {}
  }, [])

  const fetchMethods = useCallback(async () => {
    try {
      const emRes = await fetch(`${API}/api/public/exchange-methods`)
      const emData = await emRes.json()
      if (emData.success) {
        setDynamicSend(emData.allSendMethods || emData.sendMethods || [])
        setDynamicRecv(emData.allReceiveMethods || emData.receiveMethods || [])
      }
    } catch {}
  }, [])

  // Initial fetch
  useEffect(() => {
    if (!fromId) return
    Promise.all([fetchRates(), fetchMethods()]).finally(() => setLoading(false))
  }, [fromId, fetchRates, fetchMethods])

  // Auto-refetch every 30s
  useEffect(() => {
    if (!fromId) return
    const interval = setInterval(fetchRates, 30000)
    return () => clearInterval(interval)
  }, [fromId, fetchRates])

  // Refetch on amount input focus
  useEffect(() => {
    const amountInput = document.querySelector('#field-amount input[type="number"]')
    if (!amountInput) return

    const handleFocus = () => fetchRates()
    amountInput.addEventListener('focus', handleFocus)
    return () => amountInput.removeEventListener('focus', handleFocus)
  }, [fetchRates])

  // ── خطوة النموذج: 1 = بيانات الطلب، 2 = إرسال المبلغ + تأكيد ──
  const [formStep, setFormStep] = useState(() => {
    try { return parseInt(sessionStorage.getItem('ef_step') || '1', 10) || 1 } catch { return 1 }
  })

  // ── helper: read/write sessionStorage safely ────────────
  const ss = {
    get: (k, def = '') => { try { return sessionStorage.getItem(`ef_${k}`) ?? def } catch { return def } },
    set: (k, v)        => { try { sessionStorage.setItem(`ef_${k}`, v) } catch {} },
    del: (...keys)     => { try { keys.forEach(k => sessionStorage.removeItem(`ef_${k}`)) } catch {} },
  }

  // ── حالة المبالغ المتزامنة ──────────────────────────────
  const [sendAmount,    setSendAmount]    = useState(() => ss.get('sendAmount'))
  const [receiveAmount, setReceiveAmount] = useState(() => ss.get('receiveAmount'))
  const [lastEdited,    setLastEdited]    = useState(() => ss.get('lastEdited') || 'send')

  // ── باقي الحالة ─────────────────────────────────────────
  const [recipientId, setRecipientId] = useState(() => ss.get('recipientId'))
  const [usdtAddress, setUsdtAddress] = useState(() => ss.get('usdtAddress'))
  const [email,       setEmail]       = useState(() => user?.email || ss.get('email'))
  const [userPhone,   setUserPhone]   = useState(() => ss.get('userPhone'))
  const [txid,        setTxid]        = useState('')
  const [receipt,     setReceipt]     = useState(null)
  const [receiptPrev, setReceiptPrev] = useState(null)
  const [agreed,      setAgreed]      = useState(false)
  const [math,        setMath]        = useState(() => genMath())
  const [mathInput,   setMathInput]   = useState('')
  const [loading,       setLoading2]      = useState(false)
  const [error,         setError]         = useState('')
  const [walletId,      setWalletId]      = useState('')
  const [walletBalance, setWalletBalance] = useState(null)
  const [submitted,     setSubmitted]     = useState(false)
  const [fieldErrors,   setFieldErrors]   = useState({})

  // ── حفظ البيانات في sessionStorage عند التغيير ─────────
  useEffect(() => { ss.set('sendAmount',    sendAmount)    }, [sendAmount])
  useEffect(() => { ss.set('receiveAmount', receiveAmount) }, [receiveAmount])
  useEffect(() => { ss.set('lastEdited',    lastEdited)    }, [lastEdited])
  useEffect(() => { ss.set('recipientId',   recipientId)   }, [recipientId])
  useEffect(() => { ss.set('usdtAddress',   usdtAddress)   }, [usdtAddress])
  useEffect(() => { ss.set('email',         email)         }, [email])
  useEffect(() => { ss.set('userPhone',     userPhone)     }, [userPhone])

  useEffect(() => { if (user?.email) setEmail(user.email) }, [user?.email])

  useEffect(() => {
    if (!isWalletRecv || !user) return
    fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${localStorage.getItem('n1_token')}` } })
      .then(r => r.json()).then(d => { if (d.success) setWalletId(d.wallet.walletId) }).catch(() => {})
  }, [isWalletRecv, user])

  useEffect(() => {
    if (!isWalletSend || !user) return
    fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${localStorage.getItem('n1_token')}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setWalletBalance(d.wallet.balance ?? 0) })
      .catch(() => {})
  }, [isWalletSend, user])

  // ── السعر ──────────────────────────────────────────────
  const rateDisplay = useMemo(() => {
    if (!rates) return '...'
    return getRateDisplay(fromId, toId, rates, sendMethod?.symbol, recvMethod?.symbol, sendMethod, recvMethod)
  }, [fromId, toId, rates, sendMethod, recvMethod])

  const { rate: appliedRate, divide } = useMemo(() => {
    if (!rates) return { rate: 1, divide: false }
    return getRate(fromId, toId, rates, sendMethod, recvMethod)
  }, [fromId, toId, rates, sendMethod, recvMethod])

  // ── كتبت في Send ────────────────────────────────────────
  const handleSendChange = useCallback((val) => {
    setSendAmount(val)
    setLastEdited('send')
    if (fieldErrors.amount) setFieldErrors(p => ({ ...p, amount: '' }))
    if (!val || !appliedRate) { setReceiveAmount(''); return }
    const amt = parseFloat(val)
    if (isNaN(amt) || amt <= 0) { setReceiveAmount(''); return }
    const recv = divide ? (amt / appliedRate) : (amt * appliedRate)
    setReceiveAmount(recv.toFixed(4))
  }, [appliedRate, divide, fieldErrors.amount])

  // ── كتبت في Receive ─────────────────────────────────────
  const handleReceiveChange = useCallback((val) => {
    setReceiveAmount(val)
    setLastEdited('recv')
    if (fieldErrors.amount) setFieldErrors(p => ({ ...p, amount: '' }))
    if (!val || !appliedRate) { setSendAmount(''); return }
    const amt = parseFloat(val)
    if (isNaN(amt) || amt <= 0) { setSendAmount(''); return }
    const send = divide ? (amt * appliedRate) : (amt / appliedRate)
    setSendAmount(send.toFixed(4))
  }, [appliedRate, divide, fieldErrors.amount])

// ── حدود العملة + المتاح (dynamic) ─────────────────────────
  const limits = useMemo(() => {
    const recvSymbol = recvMethod?.symbol || 'USDT'
    if (!rates || !recvMethod) return { min: 10, max: 5000, unit: displayCurrencySymbol(recvSymbol), available: 5000 }

    const getLimits = (minKey, maxKey, availKey, unit) => ({
      min: rates[minKey] || 10,
      max: Math.min(rates[maxKey] ?? Infinity, rates[availKey] ?? rates[maxKey] ?? Infinity),
      available: rates[availKey] ?? rates[maxKey] ?? Infinity,
      unit: displayCurrencySymbol(unit)
    })

    // Use recv method limits if available from API
    if (recvMethod?.limits) {
      return {
        min: recvMethod.limits.min ?? 10,
        max: recvMethod.limits.max ?? 5000,
        available: recvMethod.limits.available ?? recvMethod.limits.max ?? 5000,
        unit: displayCurrencySymbol(recvSymbol)
      }
    }

    // Fallback: Receive-side limits (what platform can PAY OUT)
    if (isMoneyGoRecv || recvSymbol === 'MGO') return getLimits('minMgo', 'maxMgo', 'availableMgo', 'MGO')
    if (isUsdtRecv || recvSymbol === 'USDT')   return getLimits('minUsdt', 'maxUsdt', 'availableUsdt', 'USDT')
    if (recvSymbol === 'EGP')                  return getLimits('minEgp', 'maxEgp', 'availableEgp', 'EGP')

    // Default
    return getLimits('minUsdt', 'maxUsdt', 'availableUsdt', 'USDT')
  }, [rates, recvMethod, isMoneyGoRecv, isUsdtRecv])

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const errs  = {}
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const amt   = parseFloat(sendAmount)
    const recvAmt = parseFloat(receiveAmount)

    // Method enabled checks
    if (sendMethod && sendMethod.enabled === false) errs.amount = tr(`وسيلة الإرسال "${sendMethod.name}" معطّلة حالياً`, `Send method "${sendMethod.name}" is currently disabled`)
    if (recvMethod && recvMethod.enabled === false) errs.amount = tr(`وسيلة الاستلام "${recvMethod.name}" معطّلة حالياً`, `Receive method "${recvMethod.name}" is currently disabled`)

    if (!errs.amount) {
      if (!sendAmount || isNaN(amt) || amt <= 0 || recvAmt <= 0) errs.amount = tr('يرجى إدخال مبلغ صحيح', 'Please enter a valid amount')
      // Limits are in recv currency — compare recvAmt against them
      else if (recvAmt < limits.min) errs.amount = tr(`الحد الأدنى هو ${limits.min.toLocaleString()} ${limits.unit}`, `Minimum is ${limits.min.toLocaleString()} ${limits.unit}`)
      else if (limits.max < Infinity && recvAmt > limits.max) errs.amount = tr(`الحد الأقصى هو ${limits.max.toLocaleString()} ${limits.unit}`, `Maximum is ${limits.max.toLocaleString()} ${limits.unit}`)
      else if (limits.available < Infinity && recvAmt > limits.available) {
        errs.amount = tr(`المبلغ يتجاوز الرصيد المتاح (${limits.available.toLocaleString()} ${limits.unit})`, `Amount exceeds available liquidity (${limits.available.toLocaleString()} ${limits.unit})`)
      } else if (isWalletSend && walletBalance !== null && amt > walletBalance) {
        errs.amount = tr(`رصيد محفظتك الداخلية غير كافٍ — رصيدك: ${walletBalance.toFixed(4)} USDT`, `Insufficient wallet balance — your balance: ${walletBalance.toFixed(4)} USDT`)
      }
    }

    if (!email || !emailRx.test(email)) errs.email = tr('يرجى إدخال بريد إلكتروني صحيح', 'Please enter a valid email address')
    if (isEgpSend && userPhone && !/^\+?[0-9\s\-]{7,20}$/.test(userPhone.trim())) errs.phone = tr('رقم الهاتف غير صحيح', 'Invalid phone number')
    if (isEgpRecv && recipientId.trim().length < 5) errs.recipient = tr(`يرجى إدخال رقم ${recvMethod?.name || ''} للاستلام`, `Please enter your ${recvMethod?.name || ''} number to receive`)
    if (isMoneyGoRecv && recipientId.trim().length < 3) errs.recipient = tr('يرجى إدخال معرّف محفظة MoneyGo صحيح', 'Please enter a valid MoneyGo wallet ID')
    if (isUsdtRecv) {
      const addr = usdtAddress.trim()
      if (!addr || addr.length < 10) {
        errs.recipient = tr('يرجى إدخال عنوان محفظة USDT صحيح', 'Please enter a valid USDT wallet address')
      } else if (recvNetwork === 'TRC20' && !addr.startsWith('T')) {
        errs.recipient = tr('عنوان TRC20 يجب أن يبدأ بحرف T', 'TRC20 address must start with T')
      } else if (recvNetwork === 'BEP20' && !addr.startsWith('0x')) {
        errs.recipient = tr('عنوان BEP20 يجب أن يبدأ بـ 0x', 'BEP20 address must start with 0x')
      } else if (recvNetwork === 'TRC20' && addr.length !== 34) {
        errs.recipient = tr('عنوان TRC20 يجب أن يكون 34 حرفاً', 'TRC20 address must be 34 characters')
      } else if (recvNetwork === 'BEP20' && addr.length !== 42) {
        errs.recipient = tr('عنوان BEP20 يجب أن يكون 42 حرفاً', 'BEP20 address must be 42 characters')
      }
    }
    if (isWalletRecv  && !user)           errs.recipient = tr('يجب تسجيل الدخول لاستخدام المحفظة الداخلية', 'You must be logged in to use the internal wallet')
    if (isWalletRecv  && user && !walletId) errs.recipient = tr('جاري تحميل بيانات المحفظة، حاول مرة أخرى', 'Loading wallet data, please try again')
    if (!agreed) errs.agreed = tr('يجب الموافقة على الشروط والأحكام للمتابعة', 'You must agree to the Terms & Conditions to proceed')
    if (mathInput.trim() !== math.ans) errs.math = tr('إجابة خاطئة — تحقق من الحساب مرة أخرى', 'Wrong answer — please check your calculation')
    return errs
  }

  const clearErr = (key) => { if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' })) }

  // ── التحقق من حقول الخطوة الأولى فقط ────────────────────
  const validateStep1 = () => {
    const errs = {}
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const amt = parseFloat(sendAmount)
    const recvAmt = parseFloat(receiveAmount)

    if (sendMethod && sendMethod.enabled === false) errs.amount = tr(`وسيلة الإرسال "${sendMethod.name}" معطّلة حالياً`, `Send method "${sendMethod.name}" is currently disabled`)
    if (recvMethod && recvMethod.enabled === false) errs.amount = tr(`وسيلة الاستلام "${recvMethod.name}" معطّلة حالياً`, `Receive method "${recvMethod.name}" is currently disabled`)
    if (!errs.amount) {
      if (!sendAmount || isNaN(amt) || amt <= 0 || recvAmt <= 0) errs.amount = tr('يرجى إدخال مبلغ صحيح', 'Please enter a valid amount')
      else if (recvAmt < limits.min) errs.amount = tr(`الحد الأدنى هو ${limits.min.toLocaleString()} ${limits.unit}`, `Minimum is ${limits.min.toLocaleString()} ${limits.unit}`)
      else if (limits.max < Infinity && recvAmt > limits.max) errs.amount = tr(`الحد الأقصى هو ${limits.max.toLocaleString()} ${limits.unit}`, `Maximum is ${limits.max.toLocaleString()} ${limits.unit}`)
      else if (limits.available < Infinity && recvAmt > limits.available)
        errs.amount = tr(`المبلغ يتجاوز الرصيد المتاح (${limits.available.toLocaleString()} ${limits.unit})`, `Amount exceeds available liquidity (${limits.available.toLocaleString()} ${limits.unit})`)
      else if (isWalletSend && walletBalance !== null && amt > walletBalance)
        errs.amount = tr(`رصيد محفظتك الداخلية غير كافٍ — رصيدك: ${walletBalance.toFixed(4)} USDT`, `Insufficient wallet balance — your balance: ${walletBalance.toFixed(4)} USDT`)
    }
    if (!email || !emailRx.test(email)) errs.email = tr('يرجى إدخال بريد إلكتروني صحيح', 'Please enter a valid email address')
    if (isEgpSend && userPhone && !/^\+?[0-9\s\-]{7,20}$/.test(userPhone.trim())) errs.phone = tr('رقم الهاتف غير صحيح', 'Invalid phone number')
    if (isEgpRecv && recipientId.trim().length < 5) errs.recipient = tr(`يرجى إدخال رقم ${recvMethod?.name || ''} للاستلام`, `Please enter your ${recvMethod?.name || ''} number to receive`)
    if (isMoneyGoRecv && recipientId.trim().length < 3) errs.recipient = tr('يرجى إدخال معرّف محفظة MoneyGo صحيح', 'Please enter a valid MoneyGo wallet ID')
    if (isUsdtRecv) {
      const addr = usdtAddress.trim()
      if (!addr || addr.length < 10) {
        errs.recipient = tr('يرجى إدخال عنوان محفظة صحيح', 'Please enter a valid wallet address')
      } else if (recvNetwork === 'TRC20' && !addr.startsWith('T')) {
        errs.recipient = tr('عنوان TRC20 يجب أن يبدأ بحرف T', 'TRC20 address must start with T')
      } else if (recvNetwork === 'BEP20' && !addr.startsWith('0x')) {
        errs.recipient = tr('عنوان BEP20 يجب أن يبدأ بـ 0x', 'BEP20 address must start with 0x')
      } else if (recvNetwork === 'TRC20' && addr.length !== 34) {
        errs.recipient = tr('عنوان TRC20 يجب أن يكون 34 حرفاً', 'TRC20 address must be 34 characters')
      } else if (recvNetwork === 'BEP20' && addr.length !== 42) {
        errs.recipient = tr('عنوان BEP20 يجب أن يكون 42 حرفاً', 'BEP20 address must be 42 characters')
      }
    }
    if (isWalletRecv && !user) errs.recipient = tr('يجب تسجيل الدخول لاستخدام المحفظة الداخلية', 'You must be logged in to use the internal wallet')
    if (isWalletRecv && user && !walletId) errs.recipient = tr('جاري تحميل بيانات المحفظة، حاول مرة أخرى', 'Loading wallet data, please try again')
    return errs
  }


  
  const handleContinueToStep2 = () => {
    setSubmitted(true)
    const errs = validateStep1()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitted(false)
    setFieldErrors({})
    setFormStep(2)
    ss.set('step', '2')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return
    setReceipt(f)
    const r = new FileReader(); r.onload = ev => setReceiptPrev(ev.target.result); r.readAsDataURL(f)
  }

  // ── الإرسال ─────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitted(true)
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setLoading2(true); setError('')
    try {
      let receiptImageUrl = ''
      if (receipt) {
        try {
          const fd = new FormData(); fd.append('receipt', receipt)
          const tk = localStorage.getItem('n1_token')
          const up = await fetch(`${API}/api/orders/upload-receipt`, { method: 'POST', headers: tk ? { Authorization: `Bearer ${tk}` } : {}, body: fd })
          const upData = await up.json()
          if (upData.url) receiptImageUrl = upData.url
        } catch(e) { console.warn('receipt upload failed:', e.message) }
      }

      const recipientPhone = isMoneyGoRecv ? recipientId : isUsdtRecv ? usdtAddress : isWalletRecv ? walletId : isEgpRecv ? recipientId : ''
      const finalAmountUSD = parseFloat(receiveAmount) || 0
      const token = localStorage.getItem('n1_token')

      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          customerName:  email.split('@')[0],
          customerEmail: email,
          customerPhone: userPhone || '',
          orderType:     toOrderType(fromId, toId, sendMethod, recvMethod),
          payment: {
            method:            toPaymentMethod(fromId, sendMethod),
            amountSent:        parseFloat(sendAmount),
            currencySent:      getCurrencySent(fromId, sendMethod),
            receiptImageUrl,
            senderPhoneNumber: userPhone || '',
            txHash:            txid.trim() || null,
          },
          moneygo:      { recipientName: email.split('@')[0], recipientPhone, amountUSD: finalAmountUSD },
          exchangeRate: { appliedRate, finalAmountUSD },
        }),
      })


      
      const data = await res.json()
      if (data.success && data.order) {
        if (data.order.sessionToken) {
          try {
            const sd = JSON.stringify({ sessionToken: data.order.sessionToken, orderNumber: data.order.orderNumber, expiresAt: data.order.expiresAt })
            localStorage.setItem('n1_order_session', sd)
            document.cookie = `n1_order_session=${encodeURIComponent(sd)}; expires=${new Date(data.order.expiresAt).toUTCString()}; path=/; SameSite=Lax`
          } catch (_) {}
        }
        ss.del('step', 'sendAmount', 'receiveAmount', 'lastEdited', 'recipientId', 'usdtAddress', 'email', 'userPhone')
        navigate(`/exchange/order/${data.order.orderNumber}`, {
          state: { sendMethod, recvMethod, sendAmount, receiveAmount, recipientId: recipientPhone, usdtNetwork: recvNetwork, email }
        })
      } else {
        setError(data.message || tr('حدث خطأ، حاول مرة أخرى', 'An error occurred, please try again'))
        setMath(genMath()); setMathInput('')
      }
    } catch {
      setError(tr('خطأ في الاتصال بالسيرفر، حاول مرة أخرى', 'Server connection error, please try again'))
      setMath(genMath()); setMathInput('')
    } finally { setLoading2(false) }
  }

  if (!sendMethod || !recvMethod) return null


  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', direction: isAr ? 'rtl' : 'ltr', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div className="ef-header">
        <button onClick={() => { if (formStep === 2) { ss.del('step'); setFormStep(1) } else { navigate('/') } }} className="ef-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          {tr('رجوع', 'Back')}
        </button>
        <div className="ef-header-title">{formStep === 1 ? tr('بيانات الطلب', 'Order Details') : tr('إرسال المبلغ', 'Send Amount')}</div>
        <div style={{ width: 72 }} />
      </div>

      {/* Steps */}
      <div className="ef-steps">
        <div className="ef-step ef-step--done">
          <span className="ef-step-dot ef-step-dot--done"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span>{tr('الطريقة', 'Method')}</span>
        </div>
        <div className="ef-step-line ef-step-line--done" />
        <div className={`ef-step ${formStep === 1 ? 'ef-step--active' : 'ef-step--done'}`}>
          <span className={`ef-step-dot ${formStep === 2 ? 'ef-step-dot--done' : ''}`}>
            {formStep === 2
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              : '2'}
          </span>
          <span>{tr('بيانات الطلب', 'Order Details')}</span>
        </div>
        <div className={`ef-step-line ${formStep === 2 ? 'ef-step-line--done' : ''}`} />
        <div className={`ef-step ${formStep === 2 ? 'ef-step--active' : 'ef-step--inactive'}`}>
          <span className={`ef-step-dot ${formStep === 2 ? '' : 'ef-step-dot--off'}`}>3</span>
          <span style={formStep !== 2 ? { color: 'var(--text-3)' } : {}}>{tr('إرسال المبلغ', 'Send Amount')}</span>
        </div>
        <div className="ef-step-line" />
        <div className="ef-step ef-step--inactive">
          <span className="ef-step-dot ef-step-dot--off">4</span>
          <span style={{ color: 'var(--text-3)' }}>{tr('تتبع الطلب', 'Track Order')}</span>
        </div>
      </div>

      <div className="ef-content">

        {/* بطاقة الزوج — تظهر في الخطوتين */}
        <div className="ef-pair-card">
          <div className="ef-pair-side">
            <MethodIcon method={sendMethod} size={40} />
            <div><div className="ef-pair-label">{tr('ترسل', 'SEND')}</div><div className="ef-pair-name">{sendMethod.name}</div></div>
          </div>
          <div className="ef-pair-arrow">
            {apiLoading ? <span className="ef-rate-loading" /> : (
              <div style={{ textAlign: 'center' }}>
                <FlowDots />
                <div style={{ fontSize: '0.62rem', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace", marginTop: 4, whiteSpace: 'nowrap' }}>{rateDisplay}</div>
              </div>
            )}
          </div>
          <div className="ef-pair-side ef-pair-side--right">
            <div style={{ textAlign: isAr ? 'right' : 'left' }}><div className="ef-pair-label">{tr('تستلم', 'RECEIVE')}</div><div className="ef-pair-name">{recvMethod.name}</div></div>
            <MethodIcon method={recvMethod} size={40} />
          </div>
        </div>

        {/* ══════════════════════════════════════
            الخطوة 1: المبلغ + بيانات الاستلام + البريد
        ══════════════════════════════════════ */}
        {formStep === 1 && (<>

          {/* المبلغان المتزامنان */}
          <div className="ef-card" id="field-amount">
            <label className="ef-label">{tr('المبلغ المُرسَل', 'Amount Sent')} <span style={{ color: 'var(--red)' }}>*</span></label>
            <div className={`ef-amount-row ${fieldErrors.amount && lastEdited === 'send' ? 'ef-amount-row--error' : ''} ${receiveAmount && parseFloat(receiveAmount) > limits.available * 0.9 ? 'ef-amount-row--near-max' : ''}`}>
              <input type="number" min="0" step="any" value={sendAmount} onChange={e => handleSendChange(e.target.value)} placeholder="0.00" className="ef-input ef-amount-input" />
              <div className="ef-currency-badge">
                <MethodIcon method={sendMethod} size={20} />
                <span>{displayMethodSymbol(sendMethod)}</span>
              </div>
            </div>
            <div className="ef-swap-divider">
              <div className="ef-swap-line" />
              <div className="ef-swap-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
              </div>
              <div className="ef-swap-line" />
            </div>
            <label className="ef-label">{tr('المبلغ المُستلَم', 'Amount Received')} <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>{tr('(تقريبي)', '(Estimated)')}</span></label>
            <div className={`ef-amount-row ef-amount-row--recv ${fieldErrors.amount && lastEdited === 'recv' ? 'ef-amount-row--error' : ''}`}>
              <input type="number" min="0" step="any" value={receiveAmount} onChange={e => handleReceiveChange(e.target.value)} placeholder="0.00" className="ef-input ef-amount-input ef-amount-input--recv" disabled={isWalletRecv} />
              <div className="ef-currency-badge ef-currency-badge--recv">
                <MethodIcon method={recvMethod} size={20} />
                <span>{displayMethodSymbol(recvMethod)}</span>
              </div>
            </div>
            <FieldError msg={fieldErrors.amount} />
            {isWalletSend && walletBalance !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: walletBalance <= 0 ? 'rgba(239,68,68,0.12)' : parseFloat(sendAmount) > walletBalance ? 'rgba(239,68,68,0.12)' : 'rgba(0,229,160,0.12)', border: `1px solid ${walletBalance <= 0 || parseFloat(sendAmount) > walletBalance ? 'rgba(239,68,68,0.4)' : 'rgba(0,229,160,0.4)'}`, borderRadius: 10, marginTop: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                <div style={{ fontSize: '1.1rem' }}>💼</div>
                <span>{tr('رصيد محفظتك الداخلية', 'Your wallet balance')}: <strong style={{ color: walletBalance <= 0 || parseFloat(sendAmount) > walletBalance ? 'var(--red)' : 'var(--green)' }}>{walletBalance.toFixed(4)} USDT</strong></span>
                {walletBalance <= 0 && <span style={{ fontSize: '0.74rem', color: 'var(--red)' }}>{tr('⛔ رصيد فارغ', '⛔ Empty balance')}</span>}
                {walletBalance > 0 && parseFloat(sendAmount) > walletBalance && <span style={{ fontSize: '0.74rem', color: 'var(--red)' }}>{tr('⛔ غير كافٍ', '⛔ Insufficient')}</span>}
              </div>
            )}
            {limits.available !== undefined && limits.available < Infinity && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: limits.available <= 0 ? 'rgba(239,68,68,0.12)' : limits.available < 500 ? 'rgba(245,158,11,0.12)' : 'rgba(0,229,160,0.12)', border: `1px solid ${limits.available <= 0 ? 'rgba(239,68,68,0.4)' : limits.available < 500 ? 'rgba(245,158,11,0.4)' : 'rgba(0,229,160,0.4)'}`, borderRadius: 10, marginTop: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                <div style={{ fontSize: '1.1rem' }}>💰</div>
                <span>{tr('الرصيد المتاح', 'Available liquidity')}: <strong style={{ color: limits.available <= 0 ? 'var(--red)' : limits.available < 500 ? 'var(--gold)' : 'var(--green)' }}>{limits.available.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {limits.unit}</strong></span>
                {limits.available <= 0 && <span style={{ fontSize: '0.74rem', color: 'var(--red)' }}>{tr('⛔ نفد الرصيد', '⛔ Out of liquidity')}</span>}
                {limits.available > 0 && limits.available < 500 && <span style={{ fontSize: '0.74rem', color: 'var(--gold)' }}>{tr('⚠️ منخفض', '⚠️ Low')}</span>}
              </div>
            )}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 8 }}>
              {tr('الحد الأدنى', 'Min')}: {limits.min.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {limits.unit} · {tr('الأقصى', 'Max')}: {limits.max.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {limits.unit}
            </div>
          </div>

          {/* عنوان/رقم الاستلام */}
          <div className="ef-card" id="field-recipient">
            {isMoneyGoRecv && (
              <>
                <label className="ef-label">{tr('معرّف محفظة MoneyGo', 'MoneyGo Wallet ID')} <span style={{ color: 'var(--red)' }}>*</span></label>
                <input type="text" value={recipientId} onChange={e => { setRecipientId(e.target.value); clearErr('recipient') }} placeholder="U-XXXXXXXX" className={`ef-input ef-mono ${fieldErrors.recipient ? 'ef-input--error' : ''}`} style={{ direction: 'ltr' }} />
                <FieldError msg={fieldErrors.recipient} />
                <p className="ef-hint">{tr('أدخل معرّف محفظة MoneyGo الذي ستستلم عليه المبلغ', 'Enter your MoneyGo wallet ID to receive the amount')}</p>
              </>
            )}
            {isUsdtRecv && (
              <>
                <label className="ef-label">{tr(`عنوان محفظتك (${recvNetworkLabel}) للاستلام`, `Your ${recvNetworkLabel} wallet address`)} <span style={{ color: 'var(--red)' }}>*</span></label>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: "'Cairo','Tajawal',sans-serif", marginBottom: 6, lineHeight: 1.5 }}>{tr('هذا العنوان سيتم استخدامه لإرسال الأموال إليك', 'This address will be used to send funds to you')}</div>
                <input type="text" value={usdtAddress} onChange={e => { setUsdtAddress(e.target.value); clearErr('recipient') }} placeholder={recvNetwork === 'BEP20' ? '0x...' : 'T...'} className={`ef-input ef-mono ${fieldErrors.recipient ? 'ef-input--error' : ''}`} style={{ direction: 'ltr' }} />
                <FieldError msg={fieldErrors.recipient} />
                {usdtAddress.trim() && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.74rem', fontFamily: "'JetBrains Mono',monospace" }}>
                    {((recvNetwork === 'TRC20' && usdtAddress.trim().startsWith('T') && usdtAddress.trim().length === 34) || (recvNetwork === 'BEP20' && usdtAddress.trim().startsWith('0x') && usdtAddress.trim().length === 42))
                      ? <span style={{ color: 'var(--green)' }}>{tr(`✓ عنوان ${recvNetwork} صحيح`, `✓ Valid ${recvNetwork} address`)}</span>
                      : <span style={{ color: '#f87171' }}>✗ {recvNetwork === 'TRC20' ? tr('يجب أن يبدأ بـ T ويكون 34 حرفاً', 'Must start with T and be 34 characters') : tr('يجب أن يبدأ بـ 0x ويكون 42 حرفاً', 'Must start with 0x and be 42 characters')}</span>}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)', marginTop: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{tr('الشبكة:', 'Network:')}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{recvNetwork}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginRight: 'auto' }}>({recvNetworkLabel})</span>
                </div>
                <div className="ef-warning" style={{ marginTop: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>{tr(`⚠ تأكد من إدخال عنوان شبكة ${recvNetwork} الصحيح. الإرسال على شبكة خاطئة قد يؤدي إلى فقدان الأموال نهائياً.`, `⚠ Make sure to enter a correct ${recvNetwork} network address. Sending to the wrong network may result in permanent loss of funds.`)}</span>
                </div>
              </>
            )}
            {isEgpRecv && (
              <>
                <label className="ef-label">
                  {isAr ? `رقم ${recvMethod?.name} للاستلام` : `Receive ${recvMethod?.name} Number`} <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={recipientId}
                  onChange={e => { setRecipientId(e.target.value); clearErr('recipient') }}
                  placeholder={isAr ? recvMethod?.placeholder : 'username or phone number'}
                  className={`ef-input ef-mono ${fieldErrors.recipient ? 'ef-input--error' : ''}`}
                  style={{ direction: 'ltr' }}
                />
                <FieldError msg={fieldErrors.recipient} />
                <p className="ef-hint">{tr('أدخل الرقم أو المعرّف الذي تريد استلام المبلغ عليه', 'Enter the number or ID where you want to receive the amount')}</p>
              </>
            )}
            {isWalletRecv && (
              <>
                <div className="ef-wallet-info">
                  <div className="ef-wallet-info-icon">🏦</div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)' }}>{tr('سيتم الإيداع في محفظتك الداخلية تلقائياً', 'Funds will be deposited to your internal wallet automatically')}</div>
                    {walletId ? <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>{tr('رقم المحفظة:', 'Wallet ID:')} {walletId}</div>
                      : !user ? <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4 }}>⚠ {tr('يجب تسجيل الدخول لاستخدام المحفظة الداخلية', 'You must be logged in to use the internal wallet')}</div>
                      : <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>{tr('جاري تحميل بيانات المحفظة...', 'Loading wallet data...')}</div>}
                  </div>
                </div>
                <FieldError msg={fieldErrors.recipient} />
              </>
            )}
          </div>

          {/* البريد الإلكتروني + الهاتف */}
          <div className="ef-card" id="field-email">
            <label className="ef-label">{tr('البريد الإلكتروني', 'Email')} <span style={{ color: 'var(--red)' }}>*</span></label>
            <input type="email" value={email} onChange={e => { if (!user?.email) { setEmail(e.target.value); clearErr('email') } }} placeholder="example@email.com" className={`ef-input ef-mono ${fieldErrors.email ? 'ef-input--error' : ''}`} readOnly={!!user?.email} style={{ direction: 'ltr', opacity: user?.email ? 0.75 : 1 }} />
            <FieldError msg={fieldErrors.email} />
            {isEgpSend && (
              <>
                <label className="ef-label" style={{ marginTop: 14 }}>{tr('رقم هاتف المُرسِل', 'Sender Phone Number')} <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>({tr('اختياري', 'Optional')})</span></label>
                <input type="tel" value={userPhone} onChange={e => { setUserPhone(e.target.value); clearErr('phone') }} placeholder="01XXXXXXXXX" className={`ef-input ef-mono ${fieldErrors.phone ? 'ef-input--error' : ''}`} style={{ direction: 'ltr' }} />
                <FieldError msg={fieldErrors.phone} />
              </>
            )}
          </div>

          {submitted && Object.keys(fieldErrors).length > 0 && (
            <div className="ef-errors-summary">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: 6 }}>{tr('⚠ يرجى تصحيح الأخطاء التالية:', '⚠ Please fix the following errors:')}</div>
              {Object.values(fieldErrors).filter(Boolean).map((msg, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: 3 }}>• {msg}</div>
              ))}
            </div>
          )}

          <button onClick={handleContinueToStep2} className="ef-submit-btn">
            {tr('متابعة ←', 'Continue →')}
          </button>
        </>)}

        {/* ══════════════════════════════════════
            الخطوة 2: بيانات التحويل + الموافقة + الإرسال
        ══════════════════════════════════════ */}
        {formStep === 2 && (<>

          {/* ملخص الطلب */}
          <div className="ef-card" style={{ background: 'rgba(0,229,160,0.04)', borderColor: 'rgba(0,229,160,0.2)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, letterSpacing: 0.5 }}>{tr('ملخص الطلب', 'Order Summary')}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-2)' }}>{tr('ترسل', 'You Send')}</span>
              <strong style={{ color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace" }}>{sendAmount} {displayMethodSymbol(sendMethod)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', marginTop: 6 }}>
              <span style={{ color: 'var(--text-2)' }}>{tr('تستلم (تقريباً)', 'You Receive (estimated)')}</span>
              <strong style={{ color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace" }}>{receiveAmount} {displayMethodSymbol(recvMethod)}</strong>
            </div>
          </div>

          {/* بيانات التحويل — أين يرسل العميل */}
          {isEgpSend && (
            <div className="ef-card" style={{ background: 'rgba(0,210,255,0.04)', borderColor: 'rgba(0,210,255,0.25)' }}>
              <label className="ef-label">{tr('حوّل المبلغ إلى', 'Transfer the amount to')}</label>
              {sendMethod?.receiverNumber ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(0,229,160,0.07)', borderRadius: 10, border: '1px solid rgba(0,229,160,0.25)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 3 }}>{tr('الرقم', 'Number')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>{sendMethod.receiverNumber}</div>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(sendMethod.receiverNumber)} style={{ padding: '6px 14px', border: '1px solid rgba(0,229,160,0.4)', borderRadius: 8, background: 'transparent', color: 'var(--green)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Cairo',sans-serif", flexShrink: 0 }}>{tr('نسخ', 'Copy')}</button>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.84rem', color: 'var(--gold)', textAlign: 'center' }}>{tr('تواصل مع الدعم للحصول على بيانات التحويل', 'Contact support to get transfer details')}</div>
              )}
            </div>
          )}

          {(sendMethod?.type === 'moneygo' || fromId === 'mgo-send') && (
            <div className="ef-card" style={{ background: 'rgba(0,210,255,0.04)', borderColor: 'rgba(0,210,255,0.25)' }}>
              <label className="ef-label">{tr('حوّل المبلغ إلى معرّف MoneyGo التالي', 'Transfer the amount to the following MoneyGo ID')}</label>
              {sendMethod?.receiverNumber ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(0,229,160,0.07)', borderRadius: 10, border: '1px solid rgba(0,229,160,0.25)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 3 }}>{tr('معرّف المحفظة', 'Wallet ID')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>{sendMethod.receiverNumber}</div>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(sendMethod.receiverNumber)} style={{ padding: '6px 14px', border: '1px solid rgba(0,229,160,0.4)', borderRadius: 8, background: 'transparent', color: 'var(--green)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Cairo',sans-serif", flexShrink: 0 }}>📋 {tr('نسخ', 'Copy')}</button>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.84rem', color: 'var(--gold)', textAlign: 'center' }}>{tr('تواصل مع الدعم للحصول على بيانات التحويل', 'Contact support to get transfer details')}</div>
              )}
            </div>
          )}

          {isUsdtSend && (() => {
            const adminAddr = sendMethod?.networks?.find(n => n.networkKey === sendNetwork && n.address)?.address || sendMethod?.receiverNumber || ''
            return (
              <div className="ef-card" style={{ background: 'rgba(0,210,255,0.04)', borderColor: 'rgba(0,210,255,0.25)' }}>
                <label className="ef-label">{isAr ? 'قم بتحويل المبلغ إلى العنوان التالي' : 'Transfer the amount to the following address'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.15)', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{tr('الشبكة:', 'Network:')}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{sendNetwork}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginRight: 'auto' }}>({sendNetworkLabel})</span>
                </div>
                {adminAddr ? (
                  <div style={{ padding: '14px 16px', background: 'rgba(0,229,160,0.07)', borderRadius: 12, border: '1px solid rgba(0,229,160,0.25)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>{tr(`عنوان محفظة ${sendNetworkLabel}`, `${sendNetworkLabel} wallet address`)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", wordBreak: 'break-all', lineHeight: 1.5 }}>{adminAddr}</div>
                      <button onClick={() => navigator.clipboard?.writeText(adminAddr)} style={{ padding: '8px 16px', border: '1px solid rgba(0,229,160,0.4)', borderRadius: 8, background: 'rgba(0,229,160,0.08)', color: 'var(--green)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Cairo',sans-serif", flexShrink: 0 }}>📋 {tr('نسخ', 'Copy')}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.84rem', color: 'var(--gold)', textAlign: 'center' }}>{tr('⚠ لم يتم تحديد عنوان المحفظة لهذه الشبكة بعد — تواصل مع الدعم', '⚠ No wallet address set for this network yet — contact support')}</div>
                )}
                <div className="ef-warning" style={{ marginTop: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>{tr(`⚠ تأكد من الإرسال على شبكة ${sendNetwork} فقط. الإرسال على شبكة خاطئة يؤدي لفقدان الأموال نهائياً.`, `⚠ Only send on the ${sendNetwork} network. Sending on the wrong network will result in permanent loss of funds.`)}</span>
                </div>
              </div>
            )
          })()}

          {/* TXID */}
          {isUsdtSend && !isWalletRecv && !isMoneyGoRecv && (
            <div className="ef-card">
              <label className="ef-label">{tr('رقم المعاملة TXID', 'Transaction ID (TXID)')} <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>({tr('اختياري', 'Optional')})</span></label>
              <input type="text" value={txid} onChange={e => setTxid(e.target.value)} placeholder={tr("الصق رقم المعاملة هنا...", "Paste transaction ID here...")} className="ef-input ef-mono" style={{ direction: 'ltr' }} />
              <p className="ef-hint">{tr('ℹ️ أدخل الـ TXID لتسريع التحقق من طلبك', 'ℹ️ Enter the TXID to speed up verification of your order')}</p>
            </div>
          )}

          {/* رفع إيصال */}
          {isEgpSend && (
            <div className="ef-card">
              <label className="ef-label">{tr('صورة إيصال التحويل', 'Transfer Receipt Image')} <span style={{ color: 'var(--text-3)', fontSize: '0.65rem' }}>({tr('اختياري', 'Optional')})</span></label>
              <label className="ef-dropzone" style={receiptPrev ? { borderColor: 'var(--green)', background: 'rgba(0,229,160,0.04)' } : {}}>
                {receiptPrev ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={receiptPrev} alt={tr("الإيصال", "Receipt")} style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                    <div style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--green)' }}>✓ {receipt?.name}</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📸</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{tr('اضغط لرفع صورة الإيصال', 'Click to upload receipt image')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{tr('JPG, PNG — حتى 5MB', 'JPG, PNG — up to 5MB')}</div>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </div>
          )}

          {/* التحقق الرياضي */}
          <div className="ef-card ef-math-card" id="field-math">
            <label className="ef-label">
              {tr('تحقق أمني: ما هو ناتج', 'Security check: what is')} <strong style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{math.a} + {math.b}</strong> ؟
              <span style={{ color: 'var(--red)' }}> *</span>
            </label>
            <input type="number" value={mathInput} onChange={e => { setMathInput(e.target.value); clearErr('math') }} placeholder={tr("اكتب الناتج هنا", "Type the result here")} className={`ef-input ${fieldErrors.math ? 'ef-input--error' : ''}`} style={{ maxWidth: 160 }} />
            {mathInput && mathInput.trim() === math.ans && !fieldErrors.math && <span style={{ fontSize: '0.74rem', color: 'var(--green)', marginTop: 4 }}>✓ {tr('صحيح', 'Correct')}</span>}
            <FieldError msg={fieldErrors.math} />
          </div>

          {/* الموافقة على الشروط */}
          <div id="field-agreed">
            <label className="ef-checkbox-row" style={{ border: fieldErrors.agreed ? '1px solid rgba(239,68,68,0.35)' : 'none', borderRadius: 10, padding: fieldErrors.agreed ? '10px 12px' : '0', background: fieldErrors.agreed ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
              <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); clearErr('agreed') }} className="ef-checkbox" />
              <span style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
                {tr('أوافق على', 'I agree to the')} <a href="/terms" target="_blank" style={{ color: 'var(--cyan)' }}>{tr('الشروط والأحكام', 'Terms & Conditions')}</a> {tr('و', 'and')} <a href="/aml" target="_blank" style={{ color: 'var(--cyan)' }}>AML {tr('سياسة', 'Policy')}</a>
              </span>
            </label>
            <FieldError msg={fieldErrors.agreed} />
            {agreed && (
              <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', fontSize: '0.84rem', color: '#22d3ee', textAlign: 'center' }}>
                {tr('إذا قمت بإرسال الأموال، اضغط زر', 'If you have already sent the funds, press the')} <strong>{tr('إرسال الطلب', 'Submit Order')}</strong> {tr('أدناه للتأكيد', 'button below to confirm')}
              </div>
            )}
          </div>

          {error && <div className="ef-error">⚠ {error}</div>}

          {submitted && Object.keys(fieldErrors).length > 0 && (
            <div className="ef-errors-summary">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: 6 }}>{tr('⚠ يرجى تصحيح الأخطاء التالية:', '⚠ Please fix the following errors:')}</div>
              {Object.values(fieldErrors).filter(Boolean).map((msg, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: 3 }}>• {msg}</div>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !agreed} className="ef-submit-btn">
            {loading ? <><span className="ef-btn-spinner" /> {tr('جاري إرسال الطلب...', 'Submitting order...')}</> : tr('إرسال الطلب ✓', 'Submit Order ✓')}
          </button>
        </>)}
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
  .ef-step--done   { color: var(--green); }
  .ef-step--inactive { color: var(--text-3); }
  .ef-step-dot { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: var(--cyan-dim); border: 1.5px solid var(--cyan); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: var(--cyan); }
  .ef-step-dot--done { background: rgba(0,229,160,0.15); border-color: var(--green); color: var(--green); }
  .ef-step-dot--off  { background: transparent; border-color: var(--border-1); color: var(--text-3); }
  .ef-step-line { width: 32px; height: 2px; background: var(--border-1); margin: 0 8px; }
  .ef-step-line--done { background: var(--green); }
  .ef-content { max-width: 540px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 16px; }
  .ef-pair-card { display: flex; align-items: center; justify-content: space-between; background: var(--card); border: 1px solid var(--border-1); border-radius: 16px; padding: 16px 20px; gap: 8px; }
  .ef-pair-side { display: flex; align-items: center; gap: 10px; flex: 1; }
  .ef-pair-side--right { flex-direction: row-reverse; }
  .ef-pair-label { font-size: 0.64rem; color: var(--text-3); font-family: 'JetBrains Mono',monospace; letter-spacing: 0.8px; text-transform: uppercase; }
  .ef-pair-name  { font-size: 0.9rem; font-weight: 800; color: var(--text-1); margin-top: 2px; }
  .ef-pair-arrow { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ef-rate-loading { display: inline-block; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-1); border-top-color: var(--cyan); animation: ef-spin 0.8s linear infinite; }
  .ef-card { background: var(--card); border: 1px solid var(--border-1); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
  .ef-math-card { background: rgba(0,210,255,0.04); border-color: var(--border-2); }
  .ef-label { font-size: 0.71rem; font-weight: 700; color: var(--text-3); font-family: 'JetBrains Mono',monospace; letter-spacing: 0.5px; text-transform: uppercase; }
  .ef-input { width: 100%; padding: 10px 13px; box-sizing: border-box; background: rgba(255,255,255,0.03); border: 1px solid var(--border-1); border-radius: 10px; color: var(--text-1); font-size: 0.9rem; outline: none; font-family: 'Cairo','Tajawal',sans-serif; transition: border-color 0.18s, box-shadow 0.18s; }
  .ef-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,210,255,0.1); }
  .ef-input--error { border-color: rgba(239,68,68,0.6) !important; background: rgba(239,68,68,0.04); }
  .ef-mono { font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; }
  .ef-amount-row { display: flex; gap: 0; align-items: stretch; border: 1px solid var(--border-1); border-radius: 10px; overflow: hidden; transition: border-color 0.18s; }
  .ef-amount-row--recv { background: rgba(0,229,160,0.03); border-color: rgba(0,229,160,0.25); }
  .ef-amount-row--error { border-color: rgba(239,68,68,0.6) !important; background: rgba(239,68,68,0.04); }
  .ef-amount-row:focus-within:not(.ef-amount-row--error):not(.ef-amount-row--recv) { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,210,255,0.1); }
  .ef-amount-row--recv:focus-within { border-color: rgba(0,229,160,0.5); box-shadow: 0 0 0 3px rgba(0,229,160,0.1); }
  .ef-amount-row--near-max { border-color: var(--gold) !important; background: rgba(245,158,11,0.06) !important; }
  .ef-amount-input { flex: 1; border: none !important; border-radius: 0 !important; font-size: 1.1rem !important; font-weight: 700; box-shadow: none !important; background: transparent !important; }
  .ef-amount-input--recv { color: var(--green) !important; }
  .ef-amount-input--recv::placeholder { color: rgba(0,229,160,0.3); }
  .ef-amount-input:disabled { opacity: 0.7; cursor: not-allowed; }
  .ef-currency-badge { display: flex; align-items: center; gap: 6px; padding: 0 14px; background: rgba(255,255,255,0.04); border-right: 1px solid var(--border-1); font-size: 0.82rem; font-weight: 700; color: var(--text-2); flex-shrink: 0; }
  .ef-currency-badge--recv { background: rgba(0,229,160,0.06); border-right-color: rgba(0,229,160,0.2); color: var(--green); }
  .ef-swap-divider { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
  .ef-swap-line { flex: 1; height: 1px; background: var(--border-1); }
  .ef-swap-icon { width: 28px; height: 28px; border-radius: 50%; background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2); display: flex; align-items: center; justify-content: center; color: var(--green); flex-shrink: 0; }
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
