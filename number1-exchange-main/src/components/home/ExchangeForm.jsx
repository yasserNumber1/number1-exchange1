// src/components/home/ExchangeForm.jsx
// ═══════════════════════════════════════════════════════
// نموذج التبادل — متصل بالـ API
// الأسعار حقيقية من الأدمن
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react'
import ConfirmModal from './ConfirmModal'
import useAuth from '../../context/useAuth'

const API = import.meta.env.VITE_API_URL

const FALLBACK = { cryptos: [], wallets: [] }

// MoneyGo كـ وسيلة إرسال ثابتة
const MONEYGO_ITEM = {
  id: 'moneygo', name: 'MoneyGo', icon: '💚',
  coin: 'MoneyGo', network: 'USD', color: '#00c17c'
}

// ══════════════════════════════════════════════
// دالة مساعدة: حساب السعر الصحيح
// ══════════════════════════════════════════════
function resolveRate(rates, sendType, recvType, sendItem) {
  if (!rates) return 50

  if (sendType === 'moneygo') return rates.moneygoRate || 1

  if (sendType === 'wallet' && recvType === 'crypto') {
    const id = sendItem?.id || ''
    if (id.includes('vodafone')) return rates.vodafoneBuyRate
    if (id.includes('instapay')) return rates.instaPayRate
    if (id.includes('fawry'))    return rates.fawryRate
    if (id.includes('orange'))   return rates.orangeRate
    return rates.usdtSellRate
  }

  if (sendType === 'crypto' && recvType === 'wallet') return rates.usdtBuyRate
  if (sendType === 'crypto' && recvType === 'crypto') return 1
  if (sendType === 'wallet' && recvType === 'wallet') return 1

  return rates.usdtBuyRate
}

function ExchangeForm() {
  const { user } = useAuth()

  // ── بيانات من الـ API ──────────────────────────────
  const [methods,      setMethods]      = useState(null)
  const [rates,        setRates]        = useState(null)
  const [contactInfo,  setContactInfo]  = useState(null)
  const [apiLoading,   setApiLoading]   = useState(true)
  const [apiError,     setApiError]     = useState(false)

  // ── اختيار المستخدم ───────────────────────────────
  const [sendType, setSendType] = useState('wallet')
  const [sendItem, setSendItem] = useState(null)
  const [recvType, setRecvType] = useState('crypto')
  const [recvItem, setRecvItem] = useState(null)

  // ── المبالغ ────────────────────────────────────────
  const [sendAmount, setSendAmount] = useState('100')

  // ── بيانات المستخدم ────────────────────────────────
  const [email,          setEmail]          = useState(user?.email || '')
  const [userPhone,      setUserPhone]      = useState('')
  const [recipientId,    setRecipientId]    = useState('')
  const [moneygoWallet,  setMoneygoWallet]  = useState('') // عنوان MoneyGo للإرسال منه
  const [usdtAddress,    setUsdtAddress]    = useState('') // عنوان USDT للاستلام عليه (وضع MoneyGo)
  const [amlChecked,     setAmlChecked]     = useState(false)
  const [tosChecked,     setTosChecked]     = useState(false)

  // ── Modal ──────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [orderData, setOrderData] = useState(null)

  // ── Rate Animation ─────────────────────────────────
  const [rateFactor, setRateFactor] = useState(1)
  const [rateDir,    setRateDir]    = useState(null)

  // ══════════════════════════════════════════════════
  // جلب وسائل الدفع + الأسعار + معلومات التواصل
  // ══════════════════════════════════════════════════
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [methodsRes, ratesRes, settingsRes] = await Promise.all([
          fetch(`${API}/api/public/payment-methods`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          }).then(r => r.json()),
          fetch(`${API}/api/public/rates`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          }).then(r => r.json()),
          fetch(`${API}/api/public/settings`).then(r => r.json()).catch(() => null),
        ])

        if (methodsRes.success) {
          setMethods(methodsRes)
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

        if (ratesRes.success)    setRates(ratesRes)
        if (settingsRes?.success) setContactInfo(settingsRes)

      } catch {
        setApiError(true)
        setMethods(FALLBACK)
      } finally {
        setApiLoading(false)
      }
    }
    loadAll()
  }, [])

  // ── ملء الإيميل تلقائياً إذا كان المستخدم مسجلاً ──
  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user])

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
  const baseRate    = resolveRate(rates, sendType, recvType, sendItem)
  const currentRate = baseRate * rateFactor
  const rateColor   = rateDir === 'up' ? 'var(--green)' : rateDir === 'dn' ? 'var(--red)' : 'var(--gold)'

  const minOrder = rates?.minOrderUsdt || 10
  const maxOrder = rates?.maxOrderUsdt || 5000

  const receiveAmount = useMemo(() => {
    const amt = parseFloat(sendAmount) || 0
    return amt > 0 ? (amt * currentRate).toFixed(2) : ''
  }, [sendAmount, currentRate])

  const sendIsWallet  = sendType === 'wallet'
  const sendIsMoneygo = sendType === 'moneygo'

  // ── عند اختيار MoneyGo: نقفل الاستلام على USDT ────
  const handleSendSelect = (type, item) => {
    setSendType(type)
    setSendItem(item)
    setUserPhone('')
    setRecipientId('')
    setMoneygoWallet('')
    setUsdtAddress('')
    if (type === 'moneygo') {
      // قفل الاستلام على أول USDT متاح
      const firstCrypto = methods?.cryptos?.[0] || null
      setRecvType('crypto')
      setRecvItem(firstCrypto)
    }
  }

  // ── زر تواصل معنا (وضع MoneyGo) ──────────────────
  const buildContactMessage = () => {
    return encodeURIComponent(
      `مرحباً، أريد تبادل MoneyGo → USDT\n` +
      `المبلغ: ${sendAmount} MoneyGo USD\n` +
      `أستلم: ${receiveAmount} USDT\n` +
      `عنوان MoneyGo: ${moneygoWallet || '—'}\n` +
      `عنوان USDT للاستلام: ${usdtAddress || '—'}\n` +
      `البريد: ${email || '—'}`
    )
  }

  const handleContactUs = () => {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!email || !emailRx.test(email))
      return alert('يرجى إدخال بريد إلكتروني صحيح')
    if (!moneygoWallet || moneygoWallet.trim().length < 5)
      return alert('يرجى إدخال عنوان محفظة MoneyGo الخاصة بك')
    if (!usdtAddress || usdtAddress.trim().length < 10)
      return alert('يرجى إدخال عنوان محفظة USDT للاستلام')
    if (!amlChecked || !tosChecked)
      return alert('يرجى الموافقة على الشروط')

    const msg  = buildContactMessage()
    const wa   = contactInfo?.contactWhatsapp
    const tg   = contactInfo?.contactTelegram

    if (wa) {
      const phone = wa.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    } else if (tg) {
      window.open(`https://t.me/${tg.replace('@', '')}?text=${msg}`, '_blank')
    } else {
      // fallback: navigate to contact page
      window.location.href = '/contact'
    }
  }

  // ══════════════════════════════════════════════════
  // Submit (الوضع العادي — غير MoneyGo)
  // ══════════════════════════════════════════════════
  const handleSubmit = () => {
    const amt = parseFloat(sendAmount)

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    // قبول أرقام دولية: + اختياري، 7-20 رقم وفراغات وشرطات
    const phoneRx = /^\+?[0-9\s\-]{7,20}$/

    if (!email || !emailRx.test(email))
      return alert('يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)')

    if (sendIsWallet) {
      if (!userPhone)
        return alert(`يرجى إدخال رقم هاتفك على ${sendItem?.name}`)
      if (!phoneRx.test(userPhone.trim()))
        return alert('رقم الهاتف غير صحيح — أدخل رقمك مع كود الدولة (مثال: 01012345678 أو +966501234567)')
    }

    if (!recipientId || recipientId.trim().length < 5)
      return alert('يرجى إدخال بيانات الاستلام بشكل صحيح (5 أحرف على الأقل)')

    if (!amlChecked || !tosChecked) return alert('يرجى الموافقة على الشروط')
    if (amt < minOrder)             return alert(`الحد الأدنى ${minOrder} وحدة`)
    if (amt > maxOrder)             return alert(`الحد الأقصى ${maxOrder} وحدة`)

    setOrderData({
      sendItem,
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
                showMoneygo
                onSelect={handleSendSelect}
              />
            </div>
          </div>

          {/* ── سهم التبادل ─────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <div style={swapArrow}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4"/>
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </div>
          </div>

          {/* ── قسم الاستلام ────────────────────── */}
          <div style={{ ...amountBox, marginBottom: 13 }}>
            <div style={boxLabel}>
              <span>أنت تستلم · RECEIVE</span>
              <span style={{ color: rateColor, transition: 'color 0.4s' }}>
                1 {sendIsMoneygo ? 'MoneyGo USD' : (sendItem?.coin || sendItem?.name || '—')} = {currentRate.toFixed(sendIsMoneygo ? 4 : 4)} {recvItem?.coin || recvItem?.label || recvItem?.name || '—'}
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
              {/* عند MoneyGo: الاستلام مقفول على USDT */}
              {sendIsMoneygo ? (
                <div style={{ ...pickerBtn, cursor: 'default', opacity: 0.75, userSelect: 'none', minWidth: 130, justifyContent: 'center' }}>
                  <span style={{ color: '#26a17b', fontWeight: 800 }}>₮</span>
                  <span style={{ fontSize: 13 }}>
                    {recvItem ? `${recvItem.coin} ${recvItem.network}` : 'USDT'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', marginRight: 2 }}>🔒</span>
                </div>
              ) : (
                <MethodPicker
                  wallets={methods?.wallets || []}
                  cryptos={methods?.cryptos || []}
                  selectedType={recvType}
                  selectedItem={recvItem}
                  onSelect={(type, item) => { setRecvType(type); setRecvItem(item) }}
                />
              )}
            </div>
          </div>

          {/* ── شريط السعر ─────────────────────── */}
          <div style={rateBar}>
            <span style={{ color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem' }}>
              EXCHANGE RATE {!rates && '(مؤقت)'}
            </span>
            <span style={{ color: rateColor, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '0.82rem', transition: 'color 0.4s' }}>
              1 {sendIsMoneygo ? 'MoneyGo USD' : (sendItem?.coin || sendItem?.name || '—')} = {currentRate.toFixed(4)} {recvItem?.coin || recvItem?.label || recvItem?.name || '—'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-1)', margin: '18px 0' }} />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 13 }}>
            {sendIsMoneygo ? 'MONEYGO → USDT · تفاصيل الطلب' : 'RECIPIENT · بيانات الطلب'}
          </p>

          {/* ════════════════════════════════════
              وضع MoneyGo: حقول خاصة
          ════════════════════════════════════ */}
          {sendIsMoneygo ? (
            <>
              {/* تنبيه توضيحي */}
              <div style={moneygoInfoBox}>
                <div style={{ fontSize: '0.72rem', color: '#00c17c', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, marginBottom: 6 }}>
                  💚 كيف يعمل MoneyGo → USDT
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
                  أرسل مبلغك من محفظة MoneyGo الخاصة بك إلى محفظتنا، وسنحول لك USDT على الشبكة التي اخترتها.
                  أدخل بياناتك أدناه ثم اضغط <b>تواصل معنا</b> لإتمام الطلب.
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <Field label="EMAIL · البريد الإلكتروني">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com" style={inp} onFocus={focusOn} onBlur={focusOff} />
              </Field>

              {/* عنوان محفظة MoneyGo للإرسال منها */}
              <Field label="عنوان محفظة MoneyGo · للإرسال منها">
                <input type="text" value={moneygoWallet} onChange={e => setMoneygoWallet(e.target.value)}
                  placeholder="أدخل عنوان أو ID محفظتك على MoneyGo"
                  style={{ ...inp, direction: 'ltr', textAlign: 'left', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}
                  onFocus={focusOn} onBlur={focusOff} />
                <Hint text="ℹ️ العنوان الذي ستحوّل منه — للتحقق من العملية" />
              </Field>

              {/* عنوان USDT للاستلام */}
              <Field label={`عنوان محفظة ${recvItem?.coin || 'USDT'} ${recvItem?.network || ''} · للاستلام`}>
                <input type="text" value={usdtAddress} onChange={e => setUsdtAddress(e.target.value)}
                  placeholder={`T... أو 0x... — عنوان ${recvItem?.network || 'USDT'}`}
                  style={{ ...inp, direction: 'ltr', textAlign: 'left', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}
                  onFocus={focusOn} onBlur={focusOff} />
                <Hint text={`⚠️ تأكد من أن العنوان صحيح على شبكة ${recvItem?.network || 'USDT'} — العناوين الخاطئة تؤدي لخسارة الأموال`} />
              </Field>

              {/* الموافقات */}
              <CheckRow id="aml" checked={amlChecked} onChange={setAmlChecked}>
                أقر بأن الأموال مشروعة وأوافق على <span style={{ color: 'var(--cyan)' }}>سياسة AML</span>
              </CheckRow>
              <CheckRow id="tos" checked={tosChecked} onChange={setTosChecked}>
                أوافق على <span style={{ color: 'var(--cyan)' }}>شروط الخدمة</span> و<span style={{ color: 'var(--cyan)' }}>سياسة الخصوصية</span>
              </CheckRow>

              {/* زر تواصل معنا */}
              <button onClick={handleContactUs} style={contactBtn}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(0,193,124,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 22px rgba(0,193,124,0.22)' }}>
                💬 تواصل معنا لإتمام الطلب
              </button>

              {/* معلومة التواصل */}
              {(contactInfo?.contactWhatsapp || contactInfo?.contactTelegram) && (
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {contactInfo.contactWhatsapp && <span>WhatsApp: {contactInfo.contactWhatsapp}</span>}
                  {contactInfo.contactWhatsapp && contactInfo.contactTelegram && <span style={{ margin: '0 8px' }}>·</span>}
                  {contactInfo.contactTelegram && <span>Telegram: {contactInfo.contactTelegram}</span>}
                </div>
              )}
            </>
          ) : (
            /* ════════════════════════════════════
               الوضع العادي: محافظ / USDT
            ════════════════════════════════════ */
            <>
              {/* البريد الإلكتروني */}
              <Field label="EMAIL · البريد الإلكتروني">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com" style={inp} onFocus={focusOn} onBlur={focusOff} />
              </Field>

              {/* رقم هاتف المرسل */}
              {sendIsWallet && sendItem && (
                <Field label={`رقم هاتفك على ${sendItem.name}`}>
                  <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    style={{ ...inp, direction: 'ltr', textAlign: 'left' }}
                    onFocus={focusOn} onBlur={focusOff} />
                  <Hint text="ℹ️ هذا الرقم للتحقق من هويتك فقط" />
                </Field>
              )}

              {/* معلومة USDT */}
              {sendType === 'crypto' && sendItem && (
                <div style={infoBanner}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", display: 'block', marginBottom: 4 }}>
                    {sendItem.coin} {sendItem.network} · معلومة
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                    ستظهر لك عنوان محفظتنا لإرسال {sendItem.coin} بعد الضغط على إرسال الطلب
                  </span>
                </div>
              )}

              {/* بيانات الاستلام */}
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

              {/* الموافقات */}
              <CheckRow id="aml" checked={amlChecked} onChange={setAmlChecked}>
                أقر بأن الأموال مشروعة وأوافق على <span style={{ color: 'var(--cyan)' }}>سياسة AML</span>
              </CheckRow>
              <CheckRow id="tos" checked={tosChecked} onChange={setTosChecked}>
                أوافق على <span style={{ color: 'var(--cyan)' }}>شروط الخدمة</span> و<span style={{ color: 'var(--cyan)' }}>سياسة الخصوصية</span>
              </CheckRow>

              {/* زر الإرسال */}
              <button onClick={handleSubmit} style={submitBtn}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(0,210,255,0.38)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 22px rgba(0,159,192,0.22)' }}>
                إرسال طلب التبادل ←
              </button>
            </>
          )}

        </div>
      </div>

      <ConfirmModal isOpen={modalOpen} onClose={() => setModalOpen(false)} orderData={orderData} />
    </>
  )
}

// ══════════════════════════════════════════════════════════
// MethodPicker
// ══════════════════════════════════════════════════════════
function MethodPicker({ wallets, cryptos, selectedType, selectedItem, onSelect, showMoneygo }) {
  const [open, setOpen] = useState(false)

  const isMoneygo = selectedType === 'moneygo'

  const label = isMoneygo
    ? '💚 MoneyGo USD'
    : selectedItem
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

            {/* MoneyGo — يظهر فقط في جانب الإرسال */}
            {showMoneygo && (
              <>
                <div style={pickerGroupLabel}>💚 MoneyGo</div>
                <button
                  style={{ ...pickerItem, background: isMoneygo ? 'rgba(0,193,124,0.12)' : 'transparent' }}
                  onClick={() => { onSelect('moneygo', MONEYGO_ITEM); setOpen(false) }}>
                  <span style={{ fontSize: 16 }}>💚</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>MoneyGo USD</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>تحويل MoneyGo → USDT</div>
                  </div>
                </button>
              </>
            )}

            {wallets.length > 0 && (
              <>
                <div style={{ ...pickerGroupLabel, marginTop: showMoneygo ? 8 : 0 }}>📱 محافظ إلكترونية</div>
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
                <div style={{ ...pickerGroupLabel, marginTop: wallets.length || showMoneygo ? 8 : 0 }}>🔗 عملات رقمية</div>
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
const moneygoInfoBox = { marginBottom: 16, background: 'rgba(0,193,124,0.05)', border: '1px solid rgba(0,193,124,0.2)', borderRadius: 12, padding: '12px 14px' }
const errorBanner = { marginBottom: 12, padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.8rem', fontFamily: "'JetBrains Mono',monospace" }
const submitBtn = { width: '100%', padding: 13, marginTop: 13, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1.02rem', fontWeight: 800, color: '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 22px rgba(0,159,192,0.22)' }
const contactBtn = { width: '100%', padding: 13, marginTop: 13, background: 'linear-gradient(135deg,#00c17c,#009960)', border: 'none', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1.02rem', fontWeight: 800, color: '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 22px rgba(0,193,124,0.22)' }
const swapArrow = { width: 44, height: 44, borderRadius: 12, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--cyan)', fontSize: 18 }
const pickerBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-1)', cursor: 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', minWidth: 130 }
const pickerDropdown = { position: 'absolute', left: 0, top: 'calc(100% + 6px)', minWidth: 220, zIndex: 50, background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.45)', padding: '8px 0' }
const pickerGroupLabel = { padding: '6px 14px', fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, fontWeight: 700 }
const pickerItem = { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', border: 'none', cursor: 'pointer', textAlign: 'right', fontFamily: "'Tajawal',sans-serif", transition: 'background 0.15s' }
const spinner = { width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border-1)', borderTop: '3px solid var(--cyan)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }

export default ExchangeForm
