// src/components/home/ExchangeForm.jsx
// ═══════════════════════════════════════════════════════
// نموذج التبادل الذكي
// المنطق الصحيح للحقول:
//
// يرسل EGP (فودافون/إنستا/اتصالات):
//   ← يطلب: رقم هاتفه الذي سيحول منه
//   ← يطلب: معرف محفظة الاستلام
//
// يرسل USDT:
//   ← لا يطلب عنوان المحفظة المرسلة (غير مطلوب)
//   ← يطلب فقط: معرف الاستلام (MoneyGo أو USDT)
//
// يرسل MoneyGo:
//   ← لا يطلب عنوان المحفظة المرسلة (غير مطلوب)
//   ← يطلب فقط: عنوان USDT للاستلام
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react'
import CurrencyDropdown from './CurrencyDropdown'
import ConfirmModal from './ConfirmModal'
import { SEND_METHODS, RECEIVE_METHODS, EXCHANGE_RATES } from './exchangeData'

function ExchangeForm() {
  const [sendMethod, setSendMethod]       = useState(SEND_METHODS[0])
  const [receiveMethod, setReceiveMethod] = useState(RECEIVE_METHODS[0])
  const [sendAmount, setSendAmount]       = useState('100')
  const [rateFactor, setRateFactor]       = useState(1)
  const [rateDir, setRateDir]             = useState(null)

  // ── بيانات المستخدم ──
  const [userPhone, setUserPhone]         = useState('') // رقم هاتف المرسل (EGP فقط)
  const [recipientId, setRecipientId]     = useState('') // معرف/عنوان الاستلام (دائماً)
  const [email, setEmail]                 = useState('')
  const [amlChecked, setAmlChecked]       = useState(false)
  const [tosChecked, setTosChecked]       = useState(false)

  // ── حالة النافذة ──
  const [modalOpen, setModalOpen]         = useState(false)
  const [orderData, setOrderData]         = useState(null)

  // ── المنطق: هل وسيلة الإرسال مصرية؟ ──
  const isEgp    = sendMethod.type === 'egp'
  const isUSDT   = sendMethod.id === 'usdt-trc'
  const isMoneyGo = sendMethod.id === 'mgo-send'

  // ── السعر الأساسي من جدول الأسعار ──
  const baseRate = useMemo(() => {
    const key = `${sendMethod.id}_${receiveMethod.id}`
    return EXCHANGE_RATES[key] || 1
  }, [sendMethod, receiveMethod])

  // ── السعر الكلي = الأساسي × عامل التذبذب ──
  const currentRate = baseRate * rateFactor

  // ── المبلغ المستلم يُحسب مباشرة بدون state ──
  const receiveAmount = useMemo(() => {
    const amt = parseFloat(sendAmount) || 0
    return amt > 0 ? (amt * currentRate).toFixed(4) : ''
  }, [sendAmount, currentRate])

  // ── تذبذب السعر كل 3.5 ثانية ──
useEffect(() => {
  const timer = setInterval(() => {
    const change = (Math.random() - 0.5) * 0.002
    const dir = change >= 0 ? 'up' : 'dn'

    // نحدث الاثنين في نفس الـ tick بدون تداخل
    setRateFactor(prev =>
      Math.max(0.998, Math.min(1.002, prev + change))
    )
    setRateDir(dir)
    setTimeout(() => setRateDir(null), 800)
  }, 3500)
  return () => clearInterval(timer)
}, [])
// ── عند تغيير وسيلة الإرسال — نعيد تعيين الحقول مباشرة ──
const handleSendMethodChange = (newMethod) => {
  setSendMethod(newMethod)
  setUserPhone('')
  setRecipientId('')
}

  const rateColor = rateDir === 'up' ? 'var(--green)' : rateDir === 'dn' ? 'var(--red)' : 'var(--gold)'

  // ── نص label و placeholder لحقل الاستلام ──
  const recipientLabel = useMemo(() => {
    if (receiveMethod.id === 'mgo-recv') return 'معرف محفظة MoneyGo للاستلام'
    return 'عنوان محفظة USDT TRC20 للاستلام'
  }, [receiveMethod])

  const recipientPlaceholder = useMemo(() => {
    if (receiveMethod.id === 'mgo-recv') return 'MGO-XXXXXXXXX'
    return 'T... — عنوان TRC20'
  }, [receiveMethod])

  // ── التحقق من البيانات وفتح Modal ──
  const handleSubmit = () => {
    if (!email) {
      alert('يرجى إدخال البريد الإلكتروني')
      return
    }
    // رقم الهاتف مطلوب فقط للوسائل المصرية
    if (isEgp && !userPhone) {
      alert(`يرجى إدخال رقم هاتفك على ${sendMethod.name}`)
      return
    }
    // معرف الاستلام مطلوب دائماً
    if (!recipientId) {
      alert(`يرجى إدخال ${recipientLabel}`)
      return
    }
    if (!amlChecked || !tosChecked) {
      alert('يرجى الموافقة على الشروط')
      return
    }
    if (parseFloat(sendAmount) < 10) {
      alert('الحد الأدنى 10 وحدة')
      return
    }

    setOrderData({ sendMethod, receiveMethod, sendAmount, receiveAmount })
    setModalOpen(true)
  }

  // ── أنماط CSS المشتركة ──
  const inputStyle = {
    width: '100%', padding: '10px 13px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-1)',
    borderRadius: 9, color: 'var(--text-1)',
    fontFamily: "'Tajawal',sans-serif",
    fontSize: '0.88rem', outline: 'none',
    textAlign: 'right',
    transition: 'border-color 0.22s, box-shadow 0.22s',
  }

  const labelStyle = {
    display: 'block', fontSize: '0.72rem',
    color: 'var(--text-3)',
    fontFamily: "'JetBrains Mono',monospace",
    letterSpacing: 0.5, marginBottom: 5,
  }

  const onFocus = (e) => {
    e.target.style.borderColor = 'var(--border-2)'
    e.target.style.boxShadow = '0 0 0 3px rgba(0,210,255,0.05)'
  }
  const onBlur = (e) => {
    e.target.style.borderColor = 'var(--border-1)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, backdropFilter: 'blur(16px)' }}>

        {/* ── رأس البطاقة ── */}
        <div style={{ padding: '17px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            💱
          </div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, flex: 1 }}>تبادل العملات</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.66rem', color: 'var(--green)', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.14)', padding: '2px 8px', borderRadius: 20 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'blink 1.5s ease-in-out infinite', display: 'inline-block' }} />
            LIVE
          </div>
        </div>

        <div style={{ padding: 22 }}>

          {/* ── حقل الإرسال ── */}
          <div style={{ background: 'rgba(0,210,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 15, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>
              <span>أنت ترسل · SEND</span>
              <span>MIN: 10</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <input
                type="number"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                placeholder="0.00"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-1)', direction: 'ltr', minWidth: 0 }}
              />
<CurrencyDropdown options={SEND_METHODS} selected={sendMethod} onSelect={handleSendMethodChange} />            </div>
          </div>

          {/* ── سهم التبادل ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 0' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--cyan)' }}>
              ↓
            </div>
          </div>

          {/* ── حقل الاستلام ── */}
          <div style={{ background: 'rgba(0,210,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 15, marginBottom: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>
              <span>أنت تستلم · RECEIVE</span>
              <span style={{ color: rateColor, transition: 'color 0.4s' }}>
                1 {sendMethod.name} = {currentRate.toFixed(5)} {receiveMethod.name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <input
                type="number"
                value={receiveAmount}
                readOnly
                placeholder="0.00"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: '1.55rem', fontWeight: 700, color: 'var(--green)', direction: 'ltr', minWidth: 0 }}
              />
              <CurrencyDropdown options={RECEIVE_METHODS} selected={receiveMethod} onSelect={setReceiveMethod} />
            </div>
          </div>

          {/* ── شريط سعر الصرف ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(200,168,75,0.05)', border: '1px dashed rgba(200,168,75,0.2)', borderRadius: 9, padding: '9px 13px', marginBottom: 18 }}>
            <span style={{ color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem' }}>EXCHANGE RATE</span>
            <span style={{ color: rateColor, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '0.82rem', transition: 'color 0.4s' }}>
              1 {sendMethod.name} = {currentRate.toFixed(5)} {receiveMethod.name}
            </span>
          </div>

          {/* ── خط فاصل ── */}
          <div style={{ borderTop: '1px solid var(--border-1)', margin: '0 0 18px' }} />
          <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 13 }}>
            RECIPIENT · بيانات الطلب
          </p>

          {/* ── البريد الإلكتروني — يظهر دائماً ── */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>EMAIL · البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {/* ══════════════════════════════════════════════
              الحقل الديناميكي — يتغير حسب وسيلة الإرسال
              ══════════════════════════════════════════════

              حالة 1: EGP (فودافون / إنستا / اتصالات)
              ← يطلب رقم هاتف المرسل
          */}
          {isEgp && (
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>
                رقم هاتفك الذي ستحول منه ({sendMethod.name})
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                ℹ️ هذا الرقم للتحقق من هويتك فقط
              </div>
            </div>
          )}

          {/*
              حالة 2: USDT أو MoneyGo
              ← لا نطلب عنوان المحفظة المرسلة
              ← نعرض فقط معلومة توضيحية
          */}
          {(isUSDT || isMoneyGo) && (
            <div style={{ marginBottom: 12, background: 'rgba(0,210,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, padding: '10px 13px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>
                ℹ️ {isUSDT ? 'USDT TRC20 · معلومة' : 'MoneyGo USD · معلومة'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                {isUSDT
                  ? 'ستظهر لك عنوان محفظتنا لإرسال USDT بعد الضغط على إرسال الطلب'
                  : 'ستظهر لك معرف حساب MoneyGo الخاص بنا بعد الضغط على إرسال الطلب'
                }
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              حقل معرف/عنوان الاستلام — يظهر دائماً
              لكن النص يتغير حسب وسيلة الاستلام
          */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{recipientLabel}</label>
            <input
              type="text"
              value={recipientId}
              onChange={e => setRecipientId(e.target.value)}
              placeholder={recipientPlaceholder}
              style={{
                ...inputStyle,
                direction: 'ltr',
                textAlign: 'left',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '0.8rem',
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {/* ── الموافقات ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
            <input
              type="checkbox"
              id="aml"
              checked={amlChecked}
              onChange={e => setAmlChecked(e.target.checked)}
              style={{ width: 15, height: 15, marginTop: 3, accentColor: 'var(--cyan)', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="aml" style={{ fontSize: '0.76rem', color: 'var(--text-2)', lineHeight: 1.55, cursor: 'pointer' }}>
              أقر بأن الأموال مشروعة وأوافق على{' '}
              <span style={{ color: 'var(--cyan)' }}>سياسة AML</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
            <input
              type="checkbox"
              id="tos"
              checked={tosChecked}
              onChange={e => setTosChecked(e.target.checked)}
              style={{ width: 15, height: 15, marginTop: 3, accentColor: 'var(--cyan)', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="tos" style={{ fontSize: '0.76rem', color: 'var(--text-2)', lineHeight: 1.55, cursor: 'pointer' }}>
              أوافق على{' '}
              <span style={{ color: 'var(--cyan)' }}>شروط الخدمة</span>
              {' '}و
              <span style={{ color: 'var(--cyan)' }}>سياسة الخصوصية</span>
            </label>
          </div>

          {/* ── زر الإرسال ── */}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%', padding: 13, marginTop: 13,
              background: 'linear-gradient(135deg,#009fc0,#006e9e)',
              border: 'none', borderRadius: 12,
              fontFamily: "'Tajawal',sans-serif",
              fontSize: '1.02rem', fontWeight: 800,
              color: '#fff', cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 22px rgba(0,159,192,0.22)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 10px 34px rgba(0,210,255,0.38)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 22px rgba(0,159,192,0.22)'
            }}
          >
            إرسال طلب التبادل ←
          </button>

        </div>
      </div>

      {/* ── نافذة التأكيد ── */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orderData={orderData}
      />
    </>
  )
}

export default ExchangeForm