// src/pages/ExchangeFormPage.jsx
// الصفحة 2 — نموذج التبادل: المبلغ + التفاصيل + الإرسال
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useLang from '../context/useLang'
import { SEND_METHODS, RECEIVE_METHODS } from '../data/currencies'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Method icon ─────────────────────────────────────────
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

// ── حساب السعر من الـ API ───────────────────────────────
function resolveRate(rates, sendId, recvId) {
  if (!rates) return 1
  const s = sendId || ''
  const r = recvId || ''
  if (s === 'mgo-send')    return rates.moneygoRate   || 1
  if (s === 'wallet-usdt') return rates.usdtBuyRate   || 1
  if (r === 'usdt-recv')   return rates.usdtBuyRate   || 1
  if (r === 'mgo-recv') {
    if (s === 'usdt-trc')  return rates.usdtBuyRate   || 1
    return rates.vodafoneBuyRate || rates.usdtBuyRate || 1
  }
  return rates.usdtBuyRate || 1
}

// ── توليد math check ────────────────────────────────────
function genMath() {
  const a = Math.floor(Math.random() * 12) + 1
  const b = Math.floor(Math.random() * 12) + 1
  return { a, b, ans: String(a + b) }
}

// ── تحويل اسم الوسيلة → enum للـ API ───────────────────
function toPaymentMethod(sendId) {
  const map = {
    'vodafone':   'VODAFONE_CASH',
    'instapay':   'INSTAPAY',
    'etisalat':   'VODAFONE_CASH',
    'usdt-trc':   'USDT_TRC20',
    'mgo-send':   'VODAFONE_CASH',
    'wallet-usdt':'VODAFONE_CASH',
  }
  return map[sendId] || 'VODAFONE_CASH'
}

function toOrderType(sendId, recvId) {
  if (sendId === 'wallet-usdt') return 'EGP_WALLET_TO_MONEYGO'
  if (sendId === 'usdt-trc')    return 'USDT_TO_MONEYGO'
  return 'EGP_WALLET_TO_MONEYGO'
}

export default function ExchangeFormPage() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const { lang }       = useLang()

  const fromId = params.get('from')
  const toId   = params.get('to')

  // إعادة التوجيه لو مفيش params
  useEffect(() => {
    if (!fromId || !toId) navigate('/exchange', { replace: true })
  }, [fromId, toId, navigate])

  const sendMethod = SEND_METHODS.find(m => m.id === fromId)   || null
  const recvMethod = RECEIVE_METHODS.find(m => m.id === toId)  || null

  // ── بيانات من الـ API ──────────────────────────────────
  const [rates,       setRates]      = useState(null)
  const [adminItem,   setAdminItem]  = useState(null)  // وسيلة الدفع من الأدمن (رقم / عنوان)
  const [apiLoading,  setApiLoading] = useState(true)

  useEffect(() => {
    if (!fromId) return
    Promise.all([
      fetch(`${API}/api/public/rates`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/public/payment-methods`).then(r => r.json()).catch(() => null),
    ]).then(([ratesRes, methodsRes]) => {
      if (ratesRes?.success)   setRates(ratesRes)
      if (methodsRes?.success) {
        // نجد الوسيلة المناسبة من الأدمن
        const isEgp = sendMethod?.type === 'egp'
        const isCrypto = sendMethod?.type === 'crypto'
        if (isEgp) {
          const id = fromId
          const found = methodsRes.wallets?.find(w => (w.name || '').toLowerCase().includes(id))
          setAdminItem(found || methodsRes.wallets?.[0] || null)
        } else if (isCrypto && fromId !== 'mgo-send' && fromId !== 'wallet-usdt') {
          setAdminItem(methodsRes.cryptos?.[0] || null)
        }
      }
    }).finally(() => setApiLoading(false))
  }, [fromId])

  // ── حالة النموذج ───────────────────────────────────────
  const [sendAmount,   setSendAmount]   = useState('')
  const [recipientId,  setRecipientId]  = useState('')  // MoneyGo ID
  const [usdtAddress,  setUsdtAddress]  = useState('')  // عنوان USDT للاستلام
  const [usdtNetwork,  setUsdtNetwork]  = useState('TRC20')
  const [email,        setEmail]        = useState('')
  const [userPhone,    setUserPhone]    = useState('')
  const [txid,         setTxid]         = useState('')
  const [receipt,      setReceipt]      = useState(null)
  const [receiptPrev,  setReceiptPrev]  = useState(null)
  const [agreed,       setAgreed]       = useState(false)
  const [math,         setMath]         = useState(() => genMath())
  const [mathInput,    setMathInput]    = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  // ── حسابات ────────────────────────────────────────────
  const currentRate   = resolveRate(rates, fromId, toId)
  const receiveAmount = useMemo(() => {
    const amt = parseFloat(sendAmount) || 0
    return amt > 0 ? (amt * currentRate).toFixed(4) : ''
  }, [sendAmount, currentRate])

  const isMoneyGoRecv = toId === 'mgo-recv'
  const isUsdtRecv    = toId === 'usdt-recv'
  const isUsdtSend    = fromId === 'usdt-trc'
  const isEgpSend     = sendMethod?.type === 'egp'

  // ── Validation ─────────────────────────────────────────
  const emailOk   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  const amountOk  = parseFloat(sendAmount) > 0
  const mathOk    = mathInput.trim() === math.ans
  const recipOk   = isMoneyGoRecv ? recipientId.trim().length >= 3
                  : isUsdtRecv    ? usdtAddress.trim().length >= 10
                  : true

  const canSubmit = amountOk && emailOk && recipOk && agreed && mathOk && !loading

  // ── رفع الإيصال ────────────────────────────────────────
  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setReceipt(f)
    const r = new FileReader()
    r.onload = ev => setReceiptPrev(ev.target.result)
    r.readAsDataURL(f)
  }

  // ── الإرسال ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      // 1 — رفع الإيصال
      let receiptImageUrl = ''
      if (receipt) {
        try {
          const fd = new FormData()
          fd.append('receipt', receipt)
          const token = localStorage.getItem('n1_token')
          const up = await fetch(`${API}/api/orders/upload-receipt`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          })
          const upData = await up.json()
          if (upData.url) receiptImageUrl = upData.url
        } catch(e) { console.warn('receipt upload failed:', e.message) }
      }

      // 2 — إرسال الطلب
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  email.split('@')[0],
          customerEmail: email,
          customerPhone: userPhone || '',
          orderType:     toOrderType(fromId, toId),
          payment: {
            method:            toPaymentMethod(fromId),
            amountSent:        parseFloat(sendAmount),
            currencySent:      isEgpSend ? 'EGP' : 'USDT',
            receiptImageUrl,
            senderPhoneNumber: userPhone || '',
            txHash:            txid.trim() || null,
          },
          moneygo: {
            recipientName:  email.split('@')[0],
            recipientPhone: isMoneyGoRecv ? recipientId : (isUsdtRecv ? usdtAddress : ''),
            amountUSD:      parseFloat(receiveAmount) || 0,
          },
          exchangeRate: {
            appliedRate:    currentRate,
            finalAmountUSD: parseFloat(receiveAmount) || 0,
          },
        }),
      })
      const data = await res.json()
      if (data.success && data.order) {
        navigate(`/exchange/order/${data.order.orderNumber}`, {
          state: {
            sendMethod, recvMethod,
            sendAmount, receiveAmount,
            recipientId: isMoneyGoRecv ? recipientId : usdtAddress,
            usdtNetwork,
            adminItem,
            email,
          }
        })
      } else {
        setError(data.message || 'حدث خطأ، حاول مرة أخرى')
        setMath(genMath()); setMathInput('')
      }
    } catch(err) {
      setError('خطأ في الاتصال بالسيرفر، حاول مرة أخرى')
      setMath(genMath()); setMathInput('')
    } finally {
      setLoading(false)
    }
  }

  if (!sendMethod || !recvMethod) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="ef-header">
        <button onClick={() => navigate('/exchange')} className="ef-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          رجوع
        </button>
        <div className="ef-header-title">
          <span>تفاصيل الطلب</span>
        </div>
        <div style={{ width: 72 }} />
      </div>

      {/* ── Steps ── */}
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
            <div>
              <div className="ef-pair-label">ترسل</div>
              <div className="ef-pair-name">{sendMethod.name}</div>
            </div>
          </div>
          <div className="ef-pair-arrow">
            {apiLoading ? (
              <span className="ef-rate-loading" />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <div style={{ fontSize: '0.62rem', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace", marginTop: 4, whiteSpace: 'nowrap' }}>
                  1 {sendMethod.symbol} = {currentRate.toFixed(4)} {recvMethod.symbol}
                </div>
              </div>
            )}
          </div>
          <div className="ef-pair-side ef-pair-side--right">
            <div style={{ textAlign: 'right' }}>
              <div className="ef-pair-label">تستلم</div>
              <div className="ef-pair-name">{recvMethod.name}</div>
            </div>
            <MethodIcon method={recvMethod} size={40} />
          </div>
        </div>

        {/* ── المبلغ ── */}
        <div className="ef-card">
          <label className="ef-label">المبلغ المُرسَل <span style={{ color: 'var(--red)' }}>*</span></label>
          <div className="ef-amount-row">
            <input
              type="number" min="0" step="any"
              value={sendAmount}
              onChange={e => setSendAmount(e.target.value)}
              placeholder="0.00"
              className="ef-input ef-amount-input"
            />
            <div className="ef-currency-badge">
              <MethodIcon method={sendMethod} size={20} />
              <span>{sendMethod.symbol}</span>
            </div>
          </div>

          {/* المبلغ المستلَم (للقراءة فقط) */}
          {receiveAmount && (
            <div className="ef-receive-row">
              <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>تستلم تقريباً</span>
              <span style={{ color: 'var(--green)', fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", fontSize: '1.05rem' }}>
                {receiveAmount} <span style={{ fontSize: '0.78rem' }}>{recvMethod.symbol}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── بيانات الاستلام ── */}
        <div className="ef-card">
          {isMoneyGoRecv && (
            <>
              <label className="ef-label">معرّف محفظة MoneyGo <span style={{ color: 'var(--red)' }}>*</span></label>
              <input
                type="text" value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
                placeholder="MGO-XXXXXXXX"
                className="ef-input ef-mono"
                style={{ direction: 'ltr' }}
              />
              <p className="ef-hint">أدخل معرّف محفظة MoneyGo الذي ستستلم عليه المبلغ</p>
            </>
          )}

          {isUsdtRecv && (
            <>
              <label className="ef-label">عنوان محفظة USDT للاستلام <span style={{ color: 'var(--red)' }}>*</span></label>
              <input
                type="text" value={usdtAddress}
                onChange={e => setUsdtAddress(e.target.value)}
                placeholder="T... أو 0x..."
                className="ef-input ef-mono"
                style={{ direction: 'ltr' }}
              />

              <label className="ef-label" style={{ marginTop: 14 }}>الشبكة</label>
              <div className="ef-network-row">
                {['TRC20', 'BEP20'].map(net => (
                  <button
                    key={net}
                    onClick={() => setUsdtNetwork(net)}
                    className={`ef-net-btn ${usdtNetwork === net ? 'ef-net-btn--active' : ''}`}
                  >
                    {net}
                  </button>
                ))}
              </div>

              <div className="ef-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><triangle/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>⚠ تأكد من اختيار الشبكة الصحيحة ({usdtNetwork}). الإرسال على شبكة خاطئة قد يؤدي إلى فقدان الأموال نهائياً.</span>
              </div>
            </>
          )}
        </div>

        {/* ── بيانات المُرسِل ── */}
        <div className="ef-card">
          <label className="ef-label">البريد الإلكتروني <span style={{ color: 'var(--red)' }}>*</span></label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="ef-input ef-mono"
            style={{ direction: 'ltr' }}
          />

          {isEgpSend && (
            <>
              <label className="ef-label" style={{ marginTop: 14 }}>رقم هاتف المُرسِل</label>
              <input
                type="tel" value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="ef-input ef-mono"
                style={{ direction: 'ltr' }}
              />
            </>
          )}

          {isUsdtSend && (
            <>
              <label className="ef-label" style={{ marginTop: 14 }}>رقم المعاملة TXID (اختياري)</label>
              <input
                type="text" value={txid}
                onChange={e => setTxid(e.target.value)}
                placeholder="الصق الـ TXID هنا لتسريع التحقق..."
                className="ef-input ef-mono"
                style={{ direction: 'ltr' }}
              />
            </>
          )}
        </div>

        {/* ── رفع إيصال (للـ EGP) ── */}
        {isEgpSend && (
          <div className="ef-card">
            <label className="ef-label">صورة إيصال التحويل (اختياري)</label>
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
        <div className="ef-card ef-math-card">
          <label className="ef-label">تحقق بسيط: ما هو ناتج <strong style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{math.a} + {math.b}</strong> ؟</label>
          <input
            type="number" value={mathInput}
            onChange={e => setMathInput(e.target.value)}
            placeholder="اكتب الناتج هنا"
            className="ef-input"
            style={{ maxWidth: 160 }}
          />
          {mathInput && !mathOk && (
            <span style={{ fontSize: '0.74rem', color: 'var(--red)', marginTop: 4 }}>إجابة خاطئة</span>
          )}
          {mathOk && (
            <span style={{ fontSize: '0.74rem', color: 'var(--green)', marginTop: 4 }}>✓ صحيح</span>
          )}
        </div>

        {/* ── الموافقة على الشروط ── */}
        <label className="ef-checkbox-row">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="ef-checkbox" />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
            أوافق على <a href="/terms" target="_blank" style={{ color: 'var(--cyan)' }}>الشروط والأحكام</a> و<a href="/aml" target="_blank" style={{ color: 'var(--cyan)' }}>سياسة AML</a>
          </span>
        </label>

        {/* ── Error ── */}
        {error && <div className="ef-error">{error}</div>}

        {/* ── زر الإرسال ── */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="ef-submit-btn"
          style={{ opacity: canSubmit ? 1 : 0.5 }}
        >
          {loading
            ? <><span className="ef-btn-spinner" /> جاري إرسال الطلب...</>
            : 'إرسال الطلب ✓'
          }
        </button>

      </div>
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────
const CSS = `
  @keyframes ef-spin { to { transform: rotate(360deg) } }

  .ef-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: var(--card);
    border-bottom: 1px solid var(--border-1);
    position: sticky; top: 0; z-index: 40;
  }
  .ef-back {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px;
    border: 1px solid var(--border-1); background: transparent;
    color: var(--text-2); cursor: pointer; font-size: 0.85rem; font-weight: 600;
    font-family: 'Cairo',sans-serif; transition: all 0.15s;
  }
  .ef-back:hover { border-color: var(--cyan); color: var(--cyan); }
  .ef-header-title {
    font-size: 0.95rem; font-weight: 800; color: var(--text-1);
    font-family: 'Orbitron',sans-serif;
  }

  .ef-steps {
    display: flex; align-items: center; justify-content: center; gap: 0;
    padding: 12px 24px; background: var(--card);
    border-bottom: 1px solid var(--border-1);
  }
  .ef-step { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; }
  .ef-step--active { color: var(--cyan); }
  .ef-step--done   { color: var(--green); }
  .ef-step--inactive { color: var(--text-3); }
  .ef-step-dot {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: var(--cyan-dim); border: 1.5px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; color: var(--cyan);
  }
  .ef-step-dot--done {
    background: rgba(0,229,160,0.15); border-color: var(--green); color: var(--green);
  }
  .ef-step-dot--off {
    background: transparent; border-color: var(--border-1); color: var(--text-3);
  }
  .ef-step-line { width: 32px; height: 2px; background: var(--border-1); margin: 0 8px; }
  .ef-step-line--done { background: var(--green); }

  .ef-content {
    max-width: 540px; margin: 0 auto;
    padding: 24px 16px 60px;
    display: flex; flex-direction: column; gap: 16px;
  }

  /* Pair card */
  .ef-pair-card {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--card); border: 1px solid var(--border-1);
    border-radius: 16px; padding: 16px 20px; gap: 8px;
  }
  .ef-pair-side { display: flex; align-items: center; gap: 10px; flex: 1; }
  .ef-pair-side--right { flex-direction: row-reverse; }
  .ef-pair-label { font-size: 0.64rem; color: var(--text-3); font-family: 'JetBrains Mono',monospace; letter-spacing: 0.8px; text-transform: uppercase; }
  .ef-pair-name  { font-size: 0.9rem; font-weight: 800; color: var(--text-1); margin-top: 2px; }
  .ef-pair-arrow { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ef-rate-loading {
    display: inline-block; width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid var(--border-1); border-top-color: var(--cyan);
    animation: ef-spin 0.8s linear infinite;
  }

  /* Card */
  .ef-card {
    background: var(--card); border: 1px solid var(--border-1);
    border-radius: 14px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .ef-math-card { background: rgba(0,210,255,0.04); border-color: var(--border-2); }

  .ef-label {
    font-size: 0.71rem; font-weight: 700; color: var(--text-3);
    font-family: 'JetBrains Mono',monospace; letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .ef-input {
    width: 100%; padding: 10px 13px; box-sizing: border-box;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-1); border-radius: 10px;
    color: var(--text-1); font-size: 0.9rem; outline: none;
    font-family: 'Cairo','Tajawal',sans-serif;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .ef-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,210,255,0.1); }
  .ef-mono { font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; }

  /* Amount row */
  .ef-amount-row {
    display: flex; gap: 0; align-items: stretch;
    border: 1px solid var(--border-1); border-radius: 10px; overflow: hidden;
  }
  .ef-amount-input {
    flex: 1; border: none !important; border-radius: 0 !important;
    font-size: 1.1rem !important; font-weight: 700;
    box-shadow: none !important;
  }
  .ef-amount-input:focus { box-shadow: none !important; }
  .ef-amount-row:focus-within { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,210,255,0.1); }
  .ef-currency-badge {
    display: flex; align-items: center; gap: 6px; padding: 0 14px;
    background: rgba(255,255,255,0.04); border-right: 1px solid var(--border-1);
    font-size: 0.82rem; font-weight: 700; color: var(--text-2); flex-shrink: 0;
  }

  .ef-receive-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 13px; border-radius: 9px;
    background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.18);
  }

  .ef-hint { font-size: 0.72rem; color: var(--text-3); font-family: 'JetBrains Mono',monospace; margin: 0; }

  /* Network selector */
  .ef-network-row { display: flex; gap: 8px; }
  .ef-net-btn {
    padding: 7px 18px; border-radius: 8px; cursor: pointer;
    border: 1.5px solid var(--border-1); background: transparent;
    color: var(--text-2); font-family: 'JetBrains Mono',monospace;
    font-size: 0.82rem; font-weight: 700; transition: all 0.15s;
  }
  .ef-net-btn--active {
    border-color: var(--cyan); background: var(--cyan-dim); color: var(--cyan);
  }

  /* Warning */
  .ef-warning {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 10px 13px; border-radius: 9px;
    background: rgba(245,158,11,0.07); border: 1px dashed rgba(245,158,11,0.3);
    font-size: 0.76rem; color: var(--gold); line-height: 1.55;
  }

  /* Dropzone */
  .ef-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 22px 16px; border: 1.5px dashed var(--border-2);
    border-radius: 11px; cursor: pointer; text-align: center;
    transition: all 0.2s; gap: 4px;
  }
  .ef-dropzone:hover { border-color: var(--cyan); background: rgba(0,210,255,0.03); }

  /* Checkbox */
  .ef-checkbox-row {
    display: flex; align-items: flex-start; gap: 10px;
    cursor: pointer;
  }
  .ef-checkbox {
    width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px;
    accent-color: var(--cyan); cursor: pointer;
  }

  /* Error */
  .ef-error {
    padding: 11px 14px; border-radius: 10px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
    color: #f87171; font-size: 0.84rem; text-align: center;
  }

  /* Submit button */
  .ef-submit-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px 0;
    background: linear-gradient(135deg,#009fc0,#006e9e);
    border: none; border-radius: 13px; color: #fff;
    font-family: 'Cairo','Tajawal',sans-serif;
    font-size: 1rem; font-weight: 800; cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,159,192,0.28);
    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
  }
  .ef-submit-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(0,159,192,0.38);
  }
  .ef-submit-btn:disabled { cursor: not-allowed; }
  .ef-btn-spinner {
    display: inline-block; width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    animation: ef-spin 0.8s linear infinite;
  }

  @media (max-width: 480px) {
    .ef-step span:not(.ef-step-dot) { display: none; }
    .ef-step-line { width: 20px; }
    .ef-pair-card { padding: 12px 14px; }
  }
`
