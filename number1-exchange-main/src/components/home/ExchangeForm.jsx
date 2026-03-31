// src/components/home/ExchangeForm.jsx
// ═══════════════════════════════════════════════════════
// نموذج التبادل — متصل بالـ API
// الأسعار حقيقية من الأدمن
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react'
import ConfirmModal from './ConfirmModal'

// ✅ FIX: نجلب مباشرة من public API بدل paymentAPI (admin)
const API = import.meta.env.VITE_API_URL

const FALLBACK = { cryptos: [], wallets: [] }

// ══════════════════════════════════════════════
// دالة مساعدة: حساب السعر الصحيح
// حسب نوع الإرسال والاستلام
// ══════════════════════════════════════════════
function resolveRate(rates, sendType, recvType, sendItem, recvItem) {
  if (!rates) return 50

  if (sendType === 'wallet' && recvType === 'crypto') {
    // ✅ إصلاح: id بدل key
    const id = sendItem?.id || ''
    if (id.includes('vodafone')) return rates.vodafoneBuyRate
    if (id.includes('instapay')) return rates.instaPayRate
    if (id.includes('fawry'))    return rates.fawryRate
    if (id.includes('orange'))   return rates.orangeRate
    return rates.usdtSellRate
  }

  if (sendType === 'crypto' && recvType === 'wallet') {
    return rates.usdtBuyRate
  }

  if (sendType === 'crypto' && recvType === 'crypto') {
    return 1
  }

  if (sendType === 'wallet' && recvType === 'wallet') {
    return 1
  }

  return rates.usdtBuyRate
}

  // crypto → محفظة  (مستخدم يرسل USDT ويستلم EGP)
  if (sendType === 'crypto' && recvType === 'wallet') {
    return rates.usdtBuyRate
  }

  // crypto → crypto  (USDT → USDT شبكة مختلفة)
  if (sendType === 'crypto' && recvType === 'crypto') {
    return 1
  }

  // wallet → wallet
  if (sendType === 'wallet' && recvType === 'wallet') {
    return 1
  }

  return rates.usdtBuyRate
}

function ExchangeForm() {
  // ── بيانات من الـ API ──────────────────────────────
  const [methods,    setMethods]    = useState(null)
  const [rates,      setRates]      = useState(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError,   setApiError]   = useState(false)

  // ── اختيار المستخدم ───────────────────────────────
  const [sendType, setSendType] = useState('wallet')
  const [sendItem, setSendItem] = useState(null)
  const [recvType, setRecvType] = useState('crypto')
  const [recvItem, setRecvItem] = useState(null)

  // ── المبالغ ────────────────────────────────────────
  const [sendAmount, setSendAmount] = useState('100')

  // ── بيانات المستخدم ────────────────────────────────
  const [email,       setEmail]       = useState('')
  const [userPhone,   setUserPhone]   = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [amlChecked,  setAmlChecked]  = useState(false)
  const [tosChecked,  setTosChecked]  = useState(false)

  // ── Modal ──────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [orderData, setOrderData] = useState(null)

  // ── Rate Animation ─────────────────────────────────
  const [rateFactor, setRateFactor] = useState(1)
  const [rateDir,    setRateDir]    = useState(null)

  // ══════════════════════════════════════════════════
  // ✅ FIX: جلب وسائل الدفع + الأسعار من public API مباشرة
  // بدون cache — كل مرة يفتح الصفحة يجلب أحدث بيانات
  // ══════════════════════════════════════════════════
  useEffect(() => {
    const loadAll = async () => {
      try {
        // ✅ نجلب الاثنين بالتوازي من public routes
        const [methodsRes, ratesRes] = await Promise.all([
          fetch(`${API}/api/public/payment-methods`, {
            // ✅ no-cache: يمنع المتصفح من استخدام البيانات القديمة
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          }).then(r => r.json()),
          fetch(`${API}/api/public/rates`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          }).then(r => r.json()),
        ])

        // ✅ وسائل الدفع — من public API مباشرة
        if (methodsRes.success) {
          setMethods(methodsRes)

          // اختيار أول وسيلة تلقائياً
          if (methodsRes.wallets?.length > 0) {
            setSendItem(methodsRes.wallets[0])
            setSendType('wallet')
          } else if (methodsRes.cryptos?.length > 0) {
            setSendItem(methodsRes.cryptos[0])
            setSendType('crypto')
          }

          if (methodsRes.cryptos?.length > 0) {
            setRecvItem(methodsRes.cryptos[0])
            setRecvType('crypto')
          } else if (methodsRes.wallets?.length > 0) {
            setRecvItem(methodsRes.wallets[0])
            setRecvType('wallet')
          }
        } else {
          setMethods(FALLBACK)
        }

        // الأسعار
        if (ratesRes.success) setRates(ratesRes)

      } catch {
        setApiError(true)
        setMethods(FALLBACK)
      } finally {
        setApiLoading(false)
      }
    }
    loadAll()
  }, [])

  // ── Rate fluctuation animation ─────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.002
      setRateFactor(p => Math.max(0.998, Math.min(1.002, p + change)))
      setRateDir(change >= 0 ? 'up' : 'dn')
      setTimeout(() => setRateDir(null), 800)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  // ── السعر الحقيقي ──────────────────────────────────
  const baseRate    = resolveRate(rates, sendType, recvType, sendItem, recvItem)
  const currentRate = baseRate * rateFactor
  const rateColor   = rateDir === 'up' ? 'var(--green)' : rateDir === 'dn' ? 'var(--red)' : 'var(--gold)'

  // ── الحد الأدنى والأقصى من الـ rates ──────────────
  const minOrder = rates?.minOrderUsdt || 10
  const maxOrder = rates?.maxOrderUsdt || 5000

  const receiveAmount = useMemo(() => {
    const amt = parseFloat(sendAmount) || 0
    return amt > 0 ? (amt * currentRate).toFixed(2) : ''
  }, [sendAmount, currentRate])

  const sendIsWallet = sendType === 'wallet'
  const sendIsCrypto = sendType === 'crypto'

  // ══════════════════════════════════════════════════
  // Submit
  // ══════════════════════════════════════════════════
  const handleSubmit = () => {
    const amt = parseFloat(sendAmount)
    if (!email)                     return alert('يرجى إدخال البريد الإلكتروني')
    if (sendIsWallet && !userPhone) return alert(`يرجى إدخال رقم هاتفك على ${sendItem?.name}`)
    if (!recipientId)               return alert('يرجى إدخال بيانات الاستلام')
    if (!amlChecked || !tosChecked) return alert('يرجى الموافقة على الشروط')
    if (amt < minOrder)             return alert(`الحد الأدنى ${minOrder} وحدة`)
    if (amt > maxOrder)             return alert(`الحد الأقصى ${maxOrder} وحدة`)

    setOrderData({
      sendItem,       // ✅ يحتوي على address (crypto) أو number (wallet) من public API
      recvItem,
      sendType,
      recvType,
      sendAmount,
      receiveAmount,
      email,
      userPhone,
      recipientId,
      rate: currentRate,
    })
    setModalOpen(true)
  }

  // ── Loading ────────────────────────────────────────
  if (apiLoading) return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={spinner} />
        <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: 12, fontFamily: "'JetBrains Mono',monospace" }}>
          جاري تحميل وسائل الدفع...
        </div>
      </div>
    </div>
  )

  const hasAnything = (methods?.wallets?.length || 0) + (methods?.cryptos?.length || 0) > 0
  if (!hasAnything) return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260, flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 32 }}>🔧</span>
      <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center' }}>
        المنصة تحت الإعداد — يرجى المراجعة لاحقاً
      </div>
    </div>
  )

  return (
    <>
      <div style={card}>

        {/* ── رأس البطاقة ───────────────────────── */}
        <div style={cardHeader}>
          <div style={cardHeaderIcon}>💱</div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, flex: 1 }}>تبادل العملات</h3>
          <LiveBadge />
        </div>

        <div style={{ padding: 22 }}>

          {apiError && (
            <div style={errorBanner}>⚠ تعذّر الاتصال — يُعرض الوضع المؤقت</div>
          )}

          {/* ── قسم الإرسال ─────────────────────── */}
          <div style={amountBox}>
            <div style={boxLabel}>
              <span>أنت ترسل · SEND</span>
              <span>MIN: {minOrder} / MAX: {maxOrder}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <input
                type="number"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                placeholder="0.00"
                style={amountInput}
              />
              <MethodPicker
                wallets={methods?.wallets || []}
                cryptos={methods?.cryptos || []}
                selectedType={sendType}
                selectedItem={sendItem}
                onSelect={(type, item) => {
                  setSendType(type)
                  setSendItem(item)
                  setUserPhone('')
                  setRecipientId('')
                }}
              />
            </div>
          </div>

          {/* ── سهم التبادل ─────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <div style={swapArrow}>↕</div>
          </div>

          {/* ── قسم الاستلام ────────────────────── */}
          <div style={{ ...amountBox, marginBottom: 13 }}>
            <div style={boxLabel}>
              <span>أنت تستلم · RECEIVE</span>
              <span style={{ color: rateColor, transition: 'color 0.4s' }}>
                1 {sendItem?.coin || sendItem?.name || '—'} = {currentRate.toFixed(4)} {recvItem?.coin || recvItem?.name || '—'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <input
                type="number"
                value={receiveAmount}
                readOnly
                placeholder="0.00"
                style={{ ...amountInput, color: 'var(--green)' }}
              />
              <MethodPicker
                wallets={methods?.wallets || []}
                cryptos={methods?.cryptos || []}
                selectedType={recvType}
                selectedItem={recvItem}
                onSelect={(type, item) => { setRecvType(type); setRecvItem(item) }}
              />
            </div>
          </div>

          {/* ── شريط السعر ─────────────────────── */}
          <div style={rateBar}>
            <span style={{ color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem' }}>
              EXCHANGE RATE {!rates && '(مؤقت)'}
            </span>
            <span style={{ color: rateColor, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '0.82rem', transition: 'color 0.4s' }}>
              1 {sendItem?.coin || sendItem?.name || '—'} = {currentRate.toFixed(4)} {recvItem?.coin || recvItem?.name || '—'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-1)', margin: '18px 0' }} />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 13 }}>
            RECIPIENT · بيانات الطلب
          </p>

          {/* ── البريد الإلكتروني ──────────────── */}
          <Field label="EMAIL · البريد الإلكتروني">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com" style={inp} onFocus={focusOn} onBlur={focusOff} />
          </Field>

          {/* ── رقم هاتف المرسل ─────────────────── */}
          {sendIsWallet && sendItem && (
            <Field label={`رقم هاتفك على ${sendItem.name}`}>
              <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                style={{ ...inp, direction: 'ltr', textAlign: 'left' }}
                onFocus={focusOn} onBlur={focusOff} />
              <Hint text="ℹ️ هذا الرقم للتحقق من هويتك فقط" />
            </Field>
          )}

          {/* ── معلومة USDT ─────────────────────── */}
          {sendIsCrypto && sendItem && (
            <div style={infoBanner}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 4 }}>
                {sendItem.coin} {sendItem.network} · معلومة
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                ستظهر لك عنوان محفظتنا لإرسال {sendItem.coin} بعد الضغط على إرسال الطلب
              </span>
            </div>
          )}

          {/* ── بيانات الاستلام ──────────────────── */}
          <Field label={
            recvType === 'crypto'
              ? `عنوان محفظة ${recvItem?.coin || ''} ${recvItem?.network || ''} للاستلام`
              : `معرّف ${recvItem?.name || ''} للاستلام`
          }>
            <input type="text" value={recipientId} onChange={e => setRecipientId(e.target.value)}
              placeholder={
                recvType === 'crypto'
                  ? `T... أو 0x... — عنوان ${recvItem?.network || ''}`
                  : recvItem?.placeholder || 'رقم أو معرّف الاستلام'
              }
              style={{ ...inp, direction: 'ltr', textAlign: 'left', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}
              onFocus={focusOn} onBlur={focusOff} />
          </Field>

          {/* ── الموافقات ────────────────────────── */}
          <CheckRow id="aml" checked={amlChecked} onChange={setAmlChecked}>
            أقر بأن الأموال مشروعة وأوافق على <span style={{ color: 'var(--cyan)' }}>سياسة AML</span>
          </CheckRow>
          <CheckRow id="tos" checked={tosChecked} onChange={setTosChecked}>
            أوافق على <span style={{ color: 'var(--cyan)' }}>شروط الخدمة</span> و<span style={{ color: 'var(--cyan)' }}>سياسة الخصوصية</span>
          </CheckRow>

          {/* ── زر الإرسال ──────────────────────── */}
          <button onClick={handleSubmit} style={submitBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(0,210,255,0.38)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 22px rgba(0,159,192,0.22)' }}>
            إرسال طلب التبادل ←
          </button>

        </div>
      </div>

      <ConfirmModal isOpen={modalOpen} onClose={() => setModalOpen(false)} orderData={orderData} />
    </>
  )
}

// ══════════════════════════════════════════════════════════
// MethodPicker
// ══════════════════════════════════════════════════════════
function MethodPicker({ wallets, cryptos, selectedType, selectedItem, onSelect }) {
  const [open, setOpen] = useState(false)

  const label = selectedItem
    ? selectedType === 'crypto'
      ? `${selectedItem.icon || '₮'} ${selectedItem.coin} ${selectedItem.network}`
      : `${selectedItem.icon || '📱'} ${selectedItem.name}`
    : '— اختر —'

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(v => !v)} style={pickerBtn}>
        <span style={{ fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
          <div style={pickerDropdown}>
            {wallets.length > 0 && (
              <>
                <div style={pickerGroupLabel}>📱 محافظ إلكترونية</div>
                {wallets.map(w => (
                  <button key={w.id} style={{ ...pickerItem, background: selectedType === 'wallet' && selectedItem?.id === w.id ? 'var(--cyan-dim)' : 'transparent' }}
                    onClick={() => { onSelect('wallet', w); setOpen(false) }}>
                    <span style={{ fontSize: 16 }}>{w.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{w.name}</div>
                      {w.note && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{w.note}</div>}
                    </div>
                  </button>
                ))}
              </>
            )}
            {cryptos.length > 0 && (
              <>
                <div style={{ ...pickerGroupLabel, marginTop: wallets.length ? 8 : 0 }}>🔗 عملات رقمية</div>
                {cryptos.map(c => (
                  <button key={c.id} style={{ ...pickerItem, background: selectedType === 'crypto' && selectedItem?.id === c.id ? 'var(--cyan-dim)' : 'transparent' }}
                    onClick={() => { onSelect('crypto', c); setOpen(false) }}>
                    <span style={{ fontSize: 16, color: c.color, fontWeight: 800 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.network}</div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
function Hint({ text }) {
  return <div style={{ marginTop: 5, fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{text}</div>
}
function CheckRow({ id, checked, onChange, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ width: 15, height: 15, marginTop: 3, accentColor: 'var(--cyan)', cursor: 'pointer', flexShrink: 0 }} />
      <label htmlFor={id} style={{ fontSize: '0.76rem', color: 'var(--text-2)', lineHeight: 1.55, cursor: 'pointer' }}>
        {children}
      </label>
    </div>
  )
}
function LiveBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.66rem', color: 'var(--green)', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.14)', padding: '2px 8px', borderRadius: 20 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'blink 1.5s ease-in-out infinite', display: 'inline-block' }} />
      LIVE
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────
const focusOn  = e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,210,255,0.05)' }
const focusOff = e => { e.target.style.borderColor = 'var(--border-1)'; e.target.style.boxShadow = 'none' }
const card = { background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, backdropFilter: 'blur(16px)' }
const cardHeader = { padding: '17px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }
const cardHeaderIcon = { width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }
const amountBox = { background: 'rgba(0,210,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 15, marginBottom: 4 }
const boxLabel  = { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }
const amountInput = { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-1)', direction: 'ltr', minWidth: 0 }
const rateBar = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(200,168,75,0.05)', border: '1px dashed rgba(200,168,75,0.2)', borderRadius: 9, padding: '9px 13px', marginBottom: 18 }
const inp = { width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', outline: 'none', textAlign: 'right', transition: 'border-color 0.22s, box-shadow 0.22s', boxSizing: 'border-box' }
const infoBanner = { marginBottom: 12, background: 'rgba(0,210,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, padding: '10px 13px' }
const errorBanner = { marginBottom: 12, padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.8rem', fontFamily: "'JetBrains Mono',monospace" }
const submitBtn = { width: '100%', padding: 13, marginTop: 13, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1.02rem', fontWeight: 800, color: '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 22px rgba(0,159,192,0.22)' }
const swapArrow = { width: 44, height: 44, borderRadius: 12, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--cyan)', fontSize: 18 }
const pickerBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-1)', cursor: 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', minWidth: 130 }
const pickerDropdown = { position: 'absolute', left: 0, top: 'calc(100% + 6px)', minWidth: 220, zIndex: 50, background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.45)', padding: '8px 0' }
const pickerGroupLabel = { padding: '6px 14px', fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, fontWeight: 700 }
const pickerItem = { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', border: 'none', cursor: 'pointer', textAlign: 'right', fontFamily: "'Tajawal',sans-serif", transition: 'background 0.15s' }
const spinner = { width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border-1)', borderTop: '3px solid var(--cyan)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }

export default ExchangeForm