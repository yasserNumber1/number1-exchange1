// src/components/home/ConfirmModal.jsx
// =============================================
// نافذة تأكيد الطلب — متصلة بالـ API الحقيقي
// =============================================

import { useState, useRef } from 'react'
import { ordersAPI } from '../../services/api'

function ConfirmModal({ isOpen, onClose, orderData }) {
  const [copied,         setCopied]         = useState(false)
  const [receipt,        setReceipt]        = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [submitted,      setSubmitted]      = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')
  const [orderNumber,    setOrderNumber]    = useState('')
  const [txid,           setTxid]           = useState('')
  const fileRef = useRef(null)

  const isUSDT = orderData?.sendType === 'crypto'

  if (!isOpen || !orderData) return null

  // ── استخراج بيانات وسيلة الإرسال من الـ API ──
  const transferValue = orderData.sendType === 'crypto'
    ? orderData.sendItem?.address  || ''
    : orderData.sendItem?.number   || ''

  const transferLabel = orderData.sendType === 'crypto'
    ? `عنوان محفظة ${orderData.sendItem?.coin || 'USDT'} (${orderData.sendItem?.network || 'TRC20'})`
    : `رقم ${orderData.sendItem?.name || ''} للتحويل`

  const transferNote = orderData.sendType === 'crypto'
    ? `تأكد من إرسال ${orderData.sendItem?.coin || 'USDT'} على شبكة ${orderData.sendItem?.network || 'TRC20'} فقط`
    : orderData.sendItem?.note || 'حوّل المبلغ من رقمك المسجّل فقط'

  const accountName = orderData.sendType !== 'crypto' && orderData.sendItem?.accountName
    ? orderData.sendItem.accountName
    : null

  const isLargeAddress = orderData.sendType === 'crypto'

  // ── نسخ العنوان ───────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(transferValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── رفع صورة الإيصال ──────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setReceipt(file)
    const reader = new FileReader()
    reader.onload = ev => setReceiptPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  // ── رفع الصورة للسيرفر ────────────────────
  const uploadReceipt = async (file) => {
    const formData = new FormData()
    formData.append('receipt', file)

    const token = localStorage.getItem('n1_token')
    const res   = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/upload-receipt`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'فشل رفع الصورة')
    return data.url
  }

  // ✅ دالة مساعدة: تحويل اسم الوسيلة إلى enum صحيح للباك إند
  const resolvePaymentMethod = (sendType, sendItem) => {
    if (sendType === 'crypto') return 'USDT_TRC20'

    // wallet — نطابق اسم الوسيلة مع الـ enum
    const name = (sendItem?.name || sendItem?.key || '').toLowerCase()
    if (name.includes('vodafone'))  return 'VODAFONE_CASH'
    if (name.includes('instapay') || name.includes('insta')) return 'INSTAPAY'
    if (name.includes('orange'))    return 'ORANGE_CASH'
    if (name.includes('fawry'))     return 'FAWRY'
    if (name.includes('we') || name.includes('wepay')) return 'WE_PAY'
    if (name.includes('meeza'))     return 'MEEZA'
    return 'VODAFONE_CASH' // fallback
  }

  // ✅ دالة مساعدة: تحويل نوع الطلب إلى enum صحيح للباك إند
  const resolveOrderType = (sendType) => {
    if (sendType === 'crypto') return 'USDT_TO_MONEYGO'
    return 'EGP_WALLET_TO_MONEYGO'
  }

  // ── إرسال الطلب النهائي للـ API ───────────
  const handleFinalSubmit = async () => {

    setLoading(true)
    setError('')

    try {
      console.log('🚀 1 — بدأ الإرسال')

      // 1 — رفع صورة الإيصال
      let receiptImageUrl = ''
      try {
        receiptImageUrl = await uploadReceipt(receipt)
        console.log('✅ 2 — رُفعت الصورة:', receiptImageUrl)
      } catch(e) {
        console.warn('⚠️ 2 — فشل رفع الصورة:', e.message)
      }

      console.log('📦 3 — جاري تحضير الطلب...')

      // 2 — تحضير بيانات الطلب بالشكل الصح للباك إند
      const payload = {
        customerName:  orderData.userName  || orderData.email?.split('@')[0] || 'مستخدم',
        customerEmail: orderData.email     || '',
        customerPhone: orderData.userPhone || '',

        // ✅ orderType يطابق الـ enum في Model
        orderType: resolveOrderType(orderData.sendType),

        // بيانات الدفع
        payment: {
          // ✅ method يطابق الـ enum في Model
          method:        resolvePaymentMethod(orderData.sendType, orderData.sendItem),
          amountSent:    parseFloat(orderData.sendAmount),
          currencySent:  orderData.sendType === 'crypto' ? 'USDT' : 'EGP',
          receiptImageUrl,
          senderPhoneNumber: orderData.userPhone || '',
          txHash: txid.trim() || null,
        },

        // بيانات الاستلام
        moneygo: {
          recipientName:  orderData.userName || orderData.email?.split('@')[0] || 'مستخدم',
          recipientPhone: orderData.recipientId || orderData.userPhone || '',
          amountUSD:      parseFloat(orderData.receiveAmount),
        },

        // سعر الصرف
        exchangeRate: {
          appliedRate:    parseFloat(orderData.rate) || 1,
          finalAmountUSD: parseFloat(orderData.receiveAmount),
        },
      }

      // 3 — إرسال الطلب
      console.log('📤 4 — جاري الإرسال للـ API...')
      const { data } = await ordersAPI.create(payload)
      console.log('🎉 5 — وصل الرد:', data)

      // 4 — حفظ رقم الطلب وعرض شاشة النجاح
      setOrderNumber(data.order?.orderNumber || '')
      setSubmitted(true)

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  // ── إعادة تعيين عند الإغلاق ───────────────
  const handleClose = () => {
    setReceipt(null)
    setReceiptPreview(null)
    setSubmitted(false)
    setLoading(false)
    setCopied(false)
    setError('')
    setOrderNumber('')
    onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={overlay}
    >
      <div style={modal}>

        {/* خط سيان في الأعلى */}
        <div style={topLine} />

        {/* رأس النافذة */}
        <div style={modalHeader}>
          <div style={modalIcon}>📋</div>
          <div style={{ flex: 1 }}>
            <div style={modalTitle}>تأكيد الطلب</div>
            <div style={modalSubtitle}>ORDER CONFIRMATION</div>
          </div>
          <button onClick={handleClose} style={closeBtn}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,90,0.1)'; e.currentTarget.style.color = '#ff3d5a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}>
            ✕
          </button>
        </div>

        {/* المحتوى */}
        <div style={content}>
          {submitted ? (

            /* ── شاشة النجاح ────────────────── */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={successIcon}>✓</div>
              <div style={successTitle}>تم إرسال الطلب!</div>
              {orderNumber && (
                <div style={orderNumBox}>
                  رقم طلبك: <strong style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{orderNumber}</strong>
                </div>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.65, margin: '12px 0' }}>
                سيقوم فريقنا بمراجعة الإيصال وتحويل المبلغ خلال 15-30 دقيقة
              </p>
              {orderNumber && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                  يمكنك تتبع طلبك من صفحة <span style={{ color: 'var(--cyan)' }}>تتبع الطلب</span>
                </p>
              )}
              <button onClick={handleClose} style={successBtn}>
                حسناً ✓
              </button>
            </div>

          ) : (
            <>
              {/* ── ملخص الطلب ──────────────── */}
              <div style={summaryBox}>
                <div style={sectionLabel}>ORDER SUMMARY</div>
                <Row label="ترسل" value={`${orderData.sendAmount} ${orderData.sendItem?.coin || orderData.sendItem?.name || ''}`} />
                <Row label="تستلم" value={`${orderData.receiveAmount} ${orderData.recvItem?.coin || orderData.recvItem?.name || ''}`} green />
              </div>

              {/* ── خطوة 1: معلومات التحويل ── */}
              <div>
                <StepHeader n={1} text={`أرسل المبلغ على هذا ${orderData.sendType === 'crypto' ? 'العنوان' : 'الرقم'}`} />
                <div style={transferBox}>
                  <div style={sectionLabel}>{transferLabel}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div style={{
                      flex: 1,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: isLargeAddress ? '0.75rem' : '1.4rem',
                      fontWeight: 700,
                      color: 'var(--cyan)',
                      wordBreak: 'break-all',
                      letterSpacing: isLargeAddress ? 1 : 2,
                    }}>
                      {transferValue || (
                        <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                          ⚠ لم يُضبط رقم الاستلام بعد
                        </span>
                      )}
                    </div>
                    {transferValue && (
                      <button onClick={handleCopy} style={{
                        ...copyBtn,
                        background: copied ? 'rgba(0,229,160,0.15)' : 'var(--cyan-dim)',
                        borderColor: copied ? 'rgba(0,229,160,0.3)' : 'var(--border-2)',
                        color: copied ? 'var(--green)' : 'var(--cyan)',
                      }}>
                        {copied ? '✓ تم' : '📋 نسخ'}
                      </button>
                    )}
                  </div>
                  {accountName && (
                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                      حوّل باسم: <strong style={{ color: 'var(--text-2)' }}>{accountName}</strong>
                    </div>
                  )}
                  <div style={noteText}>⚠ {transferNote}</div>
                </div>

                {/* تحذير الوقت */}
                <div style={timeWarning}>
                  <span>⏱</span>
                  <span>لديك <strong>30 دقيقة</strong> لإتمام التحويل ورفع الإيصال</span>
                </div>
              </div>

              {/* ── TXID (لطلبات USDT فقط) ───── */}
              {isUSDT && (
                <div>
                  <StepHeader n={2} text="رقم المعاملة TXID (اختياري)" />
                  <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '12px 14px' }}>
                    <input
                      type="text"
                      value={txid}
                      onChange={e => setTxid(e.target.value)}
                      placeholder="الصق رقم المعاملة هنا — مثال: abc123def456..."
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        outline: 'none', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '0.72rem', direction: 'ltr', boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
                      ℹ️ أدخل الـ TXID لتسريع التحقق من طلبك — إذا لم يتأكد الطلب تلقائياً تواصل معنا وأرسل الـ TXID
                    </div>
                  </div>
                </div>
              )}

              {/* ── خطوة 2/3: رفع الإيصال ────── */}
              <div>
                <StepHeader n={isUSDT ? 3 : 2} text="ارفع صورة الإيصال (اختياري)" />
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: `1.5px dashed ${receipt ? 'var(--green)' : 'var(--border-2)'}`,
                    borderRadius: 12, padding: receipt ? 10 : 20,
                    textAlign: 'center', cursor: 'pointer',
                    background: receipt ? 'rgba(0,229,160,0.04)' : 'transparent',
                    transition: 'all 0.25s',
                  }}
                  onMouseEnter={e => { if (!receipt) e.currentTarget.style.borderColor = 'var(--cyan)' }}
                  onMouseLeave={e => { if (!receipt) e.currentTarget.style.borderColor = 'var(--border-2)' }}
                >
                  {receiptPreview ? (
                    <div>
                      <img src={receiptPreview} alt="الإيصال" style={{ width: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8 }} />
                      <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace" }}>✓ {receipt.name}</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-2)', marginBottom: 4 }}>اضغط لرفع صورة الإيصال</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>JPG, PNG, PDF — حتى 5MB</div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              {/* ── Error ───────────────────── */}
              {error && (
                <div style={errorBox}>{error}</div>
              )}

              {/* ── زر الإرسال النهائي ──────── */}
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: 13,
                  background: 'linear-gradient(135deg,#009fc0,#006e9e)',
                  border: 'none', borderRadius: 12,
                  fontFamily: "'Tajawal',sans-serif",
                  fontSize: '1.02rem', fontWeight: 800,
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 22px rgba(0,159,192,0.22)',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {loading ? '⏳ جاري الإرسال...' : 'إرسال الطلب ✓'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────

function Row({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
      <span style={{ color: 'var(--text-2)' }}>{label}</span>
      <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: green ? 'var(--green)' : 'var(--text-1)' }}>{value}</span>
    </div>
  )
}

function StepHeader({ n, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>{n}</div>
      <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{text}</span>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────
const overlay     = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modal       = { background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }
const topLine     = { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }
const modalHeader = { padding: '22px 24px 18px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 12 }
const modalIcon   = { width: 40, height: 40, borderRadius: 11, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }
const modalTitle  = { fontFamily: "'Orbitron',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: 1 }
const modalSubtitle = { fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }
const closeBtn    = { width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }
const content     = { padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }
const summaryBox  = { background: 'rgba(0,210,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '13px 16px' }
const sectionLabel = { fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10, letterSpacing: 1 }
const transferBox = { background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }
const noteText    = { marginTop: 8, fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }
const timeWarning = { marginTop: 10, background: 'rgba(200,168,75,0.06)', border: '1px dashed rgba(200,168,75,0.25)', borderRadius: 9, padding: '9px 13px', fontSize: '0.78rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }
const copyBtn     = { flexShrink: 0, padding: '8px 14px', border: '1px solid', borderRadius: 9, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap' }
const errorBox    = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 9, padding: '10px 14px', color: '#f87171', fontSize: '0.82rem', textAlign: 'center' }
const successIcon = { width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,229,160,0.1)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '2rem' }
const successTitle = { fontFamily: "'Orbitron',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)', marginBottom: 8 }
const orderNumBox = { background: 'rgba(0,210,255,0.06)', border: '1px solid var(--border-1)', borderRadius: 9, padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-2)', margin: '10px 0' }
const successBtn  = { marginTop: 20, padding: '12px 30px', background: 'linear-gradient(135deg,#00c97a,#009960)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }

export default ConfirmModal