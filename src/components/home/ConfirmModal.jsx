// src/components/home/ConfirmModal.jsx
// نافذة تأكيد الطلب — تظهر بعد الضغط على إرسال الطلب

import { useState, useRef } from 'react'
import { TRANSFER_INFO } from './exchangeData'

function ConfirmModal({ isOpen, onClose, orderData }) {
  const [copied, setCopied] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  if (!isOpen || !orderData) return null

  const transferInfo = TRANSFER_INFO[orderData.sendMethod.id]

  // نسخ العنوان أو الرقم
  const handleCopy = () => {
    navigator.clipboard.writeText(transferInfo.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // رفع صورة الإيصال
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setReceipt(file)
    const reader = new FileReader()
    reader.onload = (ev) => setReceiptPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  // إرسال الطلب النهائي
  const handleFinalSubmit = () => {
    if (!receipt) { alert('يرجى رفع صورة الإيصال أولاً'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1800)
  }

  // إعادة تعيين عند الإغلاق
  const handleClose = () => {
    setReceipt(null)
    setReceiptPreview(null)
    setSubmitted(false)
    setLoading(false)
    setCopied(false)
    onClose()
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>

        {/* خط سيان في الأعلى */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

        {/* رأس النافذة */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📋</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: 1 }}>تأكيد الطلب</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>ORDER CONFIRMATION</div>
          </div>
          <button onClick={handleClose}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,90,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,61,90,0.3)'; e.currentTarget.style.color = '#ff3d5a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)' }}>
            ✕
          </button>
        </div>

        {/* المحتوى */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {submitted ? (
            // ── شاشة النجاح ──
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,229,160,0.1)', border: '2px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '2rem' }}>✓</div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>تم إرسال الطلب!</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.65 }}>
                سيقوم فريقنا بمراجعة الإيصال وتحويل المبلغ خلال 15-30 دقيقة
              </p>
              <button onClick={handleClose}
                style={{ marginTop: 20, padding: '12px 30px', background: 'linear-gradient(135deg,#00c97a,#009960)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>
                حسناً ✓
              </button>
            </div>
          ) : (
            <>
              {/* ── ملخص الطلب ── */}
              <div style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '13px 16px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10, letterSpacing: 1 }}>ORDER SUMMARY</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>ترسل</span>
                  <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{orderData.sendAmount} {orderData.sendMethod.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>تستلم</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace" }}>{orderData.receiveAmount} {orderData.receiveMethod.name}</span>
                </div>
              </div>

              {/* ── خطوة 1: معلومات التحويل ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>1</div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                    أرسل المبلغ على هذا {orderData.sendMethod.type === 'egp' ? 'الرقم' : 'العنوان'}
                  </span>
                </div>

                {/* الرقم أو العنوان + زر النسخ */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>
                    {transferInfo.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: orderData.sendMethod.type === 'egp' ? '1.4rem' : '0.75rem', fontWeight: 700, color: 'var(--cyan)', wordBreak: 'break-all', letterSpacing: orderData.sendMethod.type === 'egp' ? 2 : 1 }}>
                      {transferInfo.value}
                    </div>
                    <button onClick={handleCopy}
                      style={{ flexShrink: 0, padding: '8px 14px', background: copied ? 'rgba(0,229,160,0.15)' : 'var(--cyan-dim)', border: `1px solid ${copied ? 'rgba(0,229,160,0.3)' : 'var(--border-2)'}`, borderRadius: 9, color: copied ? 'var(--green)' : 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap' }}>
                      {copied ? '✓ تم' : '📋 نسخ'}
                    </button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                    ⚠ {transferInfo.note}
                  </div>
                </div>

                {/* تحذير الوقت */}
                <div style={{ marginTop: 10, background: 'rgba(200,168,75,0.06)', border: '1px dashed rgba(200,168,75,0.25)', borderRadius: 9, padding: '9px 13px', fontSize: '0.78rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⏱</span>
                  <span>لديك <strong>30 دقيقة</strong> لإتمام التحويل ورفع الإيصال</span>
                </div>
              </div>

              {/* ── خطوة 2: رفع الإيصال ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>2</div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>ارفع صورة الإيصال</span>
                </div>

                <div onClick={() => fileRef.current.click()}
                  style={{ border: `1.5px dashed ${receipt ? 'var(--green)' : 'var(--border-2)'}`, borderRadius: 12, padding: receipt ? 10 : 20, textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', background: receipt ? 'rgba(0,229,160,0.04)' : 'transparent' }}
                  onMouseEnter={e => { if (!receipt) e.currentTarget.style.borderColor = 'var(--cyan)' }}
                  onMouseLeave={e => { if (!receipt) e.currentTarget.style.borderColor = 'var(--border-2)' }}>
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

              {/* ── زر الإرسال النهائي ── */}
              <button onClick={handleFinalSubmit} disabled={loading || !receipt}
                style={{ width: '100%', padding: 13, background: !receipt ? 'rgba(0,159,192,0.4)' : 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1.02rem', fontWeight: 800, color: '#fff', cursor: !receipt ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: receipt ? '0 4px 22px rgba(0,159,192,0.22)' : 'none' }}
                onMouseEnter={e => { if (receipt && !loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,210,255,0.35)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = receipt ? '0 4px 22px rgba(0,159,192,0.22)' : 'none' }}>
                {loading ? '⏳ جاري الإرسال...' : !receipt ? '↑ ارفع الإيصال أولاً' : 'إرسال الطلب نهائياً ✓'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal