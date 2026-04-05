// src/pages/OrderConfirmPage.jsx
// صفحة تأكيد الدفع — تحل محل ConfirmModal
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useLang from '../context/useLang'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── STATUS config (for tracking section) ─────────────────
const STATUS_CONFIG = {
  pending:    { ar: 'في الانتظار',   color: '#f59e0b' },
  verifying:  { ar: 'جاري التحقق',  color: '#a78bfa' },
  verified:   { ar: 'تم التحقق',    color: '#60a5fa' },
  processing: { ar: 'قيد المعالجة', color: '#00b8d9' },
  completed:  { ar: 'مكتمل',        color: '#00e5a0' },
  rejected:   { ar: 'مرفوض',        color: '#f43f5e' },
  cancelled:  { ar: 'ملغي',         color: '#64748b' },
}

// ─────────────────────────────────────────────────────────
export default function OrderConfirmPage() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const { lang }    = useLang()
  const orderData   = location.state   // البيانات من Home.jsx

  // إذا وصل بدون بيانات → رجّعه للرئيسية
  useEffect(() => {
    if (!orderData) navigate('/', { replace: true })
  }, [orderData, navigate])

  if (!orderData) return null

  return <ConfirmFlow orderData={orderData} navigate={navigate} lang={lang} />
}

// ─────────────────────────────────────────────────────────
function ConfirmFlow({ orderData, navigate, lang }) {
  // مراحل الصفحة: 'transfer' → 'tracking'
  const [phase, setPhase]           = useState('transfer')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderId,     setOrderId]     = useState('')

  if (phase === 'tracking') {
    return (
      <TrackingSection
        orderNumber={orderNumber}
        orderId={orderId}
        orderData={orderData}
        navigate={navigate}
        lang={lang}
      />
    )
  }

  return (
    <TransferSection
      orderData={orderData}
      navigate={navigate}
      lang={lang}
      onSuccess={(num, id) => { setOrderNumber(num); setOrderId(id); setPhase('tracking') }}
    />
  )
}

// ═══════════════════════════════════════════════════════
// TransferSection — خطوة الدفع وإرفاق الإيصال
// ═══════════════════════════════════════════════════════
function TransferSection({ orderData, navigate, lang, onSuccess }) {
  const [copied,   setCopied]   = useState(false)
  const [receipt,  setReceipt]  = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [txid,     setTxid]     = useState('')
  const [txidErr,  setTxidErr]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const fileRef = useRef(null)

  const isWalletDeposit  = orderData.receiveMethod?.id === 'wallet-recv'
  const isWalletTransfer = orderData.sendMethod?.id   === 'wallet-usdt'
  const isEgp = !isWalletDeposit && !isWalletTransfer && orderData.sendMethod?.type === 'egp'
  const adminItem = orderData.sendItem

  const TRANSFER_INFO = {
    'usdt-trc': { value: '', labelAr: 'عنوان USDT TRC20',       noteAr: 'أرسل USDT على شبكة TRC20 فقط' },
    'vodafone': { value: '', labelAr: 'رقم فودافون كاش',        noteAr: 'حوّل من رقمك المسجل فقط' },
    'instapay': { value: '', labelAr: 'رقم InstaPay',           noteAr: 'حوّل من حسابك المسجل فقط' },
    'etisalat': { value: '', labelAr: 'رقم اتصالات كاش',        noteAr: 'حوّل من رقمك المسجل فقط' },
  }
  const fallback = TRANSFER_INFO[orderData.sendMethod?.id] || {}

  const info = {
    value:   adminItem ? (isEgp ? adminItem.number  : adminItem.address) : fallback.value,
    labelAr: adminItem
      ? (isEgp
          ? `رقم ${adminItem.name || orderData.sendMethod?.name} للتحويل`
          : `عنوان ${adminItem.coin || 'USDT'} (${adminItem.network || 'TRC20'})`)
      : fallback.labelAr,
    noteAr: adminItem?.note
      || (adminItem?.accountName ? `حوّل باسم: ${adminItem.accountName}` : fallback.noteAr),
    accountName: adminItem?.accountName || null,
  }

  const handleCopy = () => {
    if (!info.value) return
    navigator.clipboard.writeText(info.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    setReceipt(file)
    const r = new FileReader()
    r.onload = ev => setPreview(ev.target.result)
    r.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('n1_token')

      // ── إيداع محفظة داخلية ──
      if (isWalletDeposit) {
        if (!txid.trim()) { setTxidErr('يرجى إدخال رقم المعاملة (TXID)'); setLoading(false); return }
        const res = await fetch(`${API}/api/wallet/deposit`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ amount: parseFloat(orderData.sendAmount), txid: txid.trim() })
        })
        const data = await res.json()
        if (data.success) onSuccess('', '')
        else setError(data.message || 'حدث خطأ')
        setLoading(false); return
      }

      // ── تحويل من المحفظة ──
      if (isWalletTransfer) {
        const res = await fetch(`${API}/api/wallet/transfer-to-moneygo`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({
            amount:        parseFloat(orderData.sendAmount),
            recipientId:   orderData.recipientId,
            recipientName: orderData.email?.split('@')[0] || ''
          })
        })
        const data = await res.json()
        if (data.success) onSuccess('', '')
        else setError(data.message || 'حدث خطأ')
        setLoading(false); return
      }

      // ── طلب عادي ──
      let receiptImageUrl = ''
      if (receipt) {
        try {
          const fd = new FormData()
          fd.append('receipt', receipt)
          const up = await fetch(`${API}/api/orders/upload-receipt`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          })
          const upData = await up.json()
          if (upData.url) receiptImageUrl = upData.url
        } catch(e) { console.warn('upload failed:', e.message) }
      }

      const resolveMethod = (method) => {
        if (method?.type === 'crypto') return 'USDT_TRC20'
        const name = (method?.name || '').toLowerCase()
        if (name.includes('vodafone'))  return 'VODAFONE_CASH'
        if (name.includes('instapay'))  return 'INSTAPAY'
        if (name.includes('orange'))    return 'ORANGE_CASH'
        if (name.includes('fawry'))     return 'FAWRY'
        if (name.includes('etisalat'))  return 'VODAFONE_CASH'
        return 'VODAFONE_CASH'
      }

      const res = await fetch(`${API}/api/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  orderData.email?.split('@')[0] || 'مستخدم',
          customerEmail: orderData.email || '',
          customerPhone: orderData.userPhone || '',
          orderType:     isEgp ? 'EGP_WALLET_TO_MONEYGO' : 'USDT_TO_MONEYGO',
          payment: {
            method:            resolveMethod(orderData.sendMethod),
            amountSent:        parseFloat(orderData.sendAmount),
            currencySent:      isEgp ? 'EGP' : 'USDT',
            receiptImageUrl,
            senderPhoneNumber: orderData.userPhone || '',
            txHash:            txid.trim() || null,
          },
          moneygo: {
            recipientName:  orderData.email?.split('@')[0] || 'مستخدم',
            recipientPhone: orderData.recipientId || '',
            amountUSD:      parseFloat(orderData.receiveAmount),
          },
          exchangeRate: {
            appliedRate:    parseFloat(orderData.receiveAmount) / parseFloat(orderData.sendAmount) || 1,
            finalAmountUSD: parseFloat(orderData.receiveAmount),
          },
        })
      })
      const data = await res.json()
      if (data.success) {
        // ── حفظ الجلسة للتتبع لاحقاً ──────────
        if (data.order?.sessionToken) {
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
        onSuccess(data.order?.orderNumber || '', data.order?._id || '')
      } else {
        setError(data.message || 'حدث خطأ، حاول مرة أخرى')
      }
    } catch(err) {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => navigate('/')

  const isCrypto    = !isEgp && !isWalletDeposit && !isWalletTransfer
  const isLargeAddr = isCrypto || isWalletDeposit
  const transferVal = info.value

  return (
    <div style={styles.page}>
      <style>{pageCSS}</style>

      {/* ── Header ── */}
      <div style={styles.header}>
        <button onClick={handleCancel} style={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          رجوع
        </button>
        <div style={styles.headerTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
          <span>تأكيد الطلب</span>
        </div>
        <div style={{ width: 72 }} />
      </div>

      {/* ── Progress bar (just visual) ── */}
      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressStep, ...styles.progressActive }}>
          <div style={styles.progressDot}>1</div>
          <span>التحويل</span>
        </div>
        <div style={styles.progressLine} />
        <div style={styles.progressStep}>
          <div style={{ ...styles.progressDot, background: 'var(--border-2)', color: 'var(--text-3)' }}>2</div>
          <span style={{ color: 'var(--text-3)' }}>تتبع الطلب</span>
        </div>
      </div>

      <div style={styles.content}>

        {/* ── ملخص الطلب ── */}
        <div style={styles.summaryCard}>
          <div style={styles.sectionLabel}>ملخص الطلب</div>
          <div style={styles.summaryRow}>
            <span style={{ color: 'var(--text-2)' }}>ترسل</span>
            <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: 'var(--red)' }}>
              {orderData.sendAmount} {orderData.sendMethod?.symbol || ''}
            </span>
          </div>
          <div style={styles.summaryRow}>
            <span style={{ color: 'var(--text-2)' }}>تستلم</span>
            <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: 'var(--green)' }}>
              {orderData.receiveAmount} {orderData.receiveMethod?.symbol || ''}
            </span>
          </div>
          {isWalletTransfer && (
            <div style={{ ...styles.summaryRow, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-1)' }}>
              <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>المستلِم</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--cyan)', fontSize: '0.82rem' }}>
                {orderData.recipientId}
              </span>
            </div>
          )}
        </div>

        {/* ── تحويل المحفظة: رسالة مختصرة ── */}
        {isWalletTransfer && (
          <div style={styles.infoBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            سيتم خصم المبلغ من محفظتك فوراً وإرساله على MoneyGo خلال دقائق
          </div>
        )}

        {/* ── خطوة 1: معلومات التحويل ── */}
        {!isWalletTransfer && (
          <div>
            <StepLabel n={1} text={`أرسل المبلغ على هذا ${isEgp ? 'الرقم' : 'العنوان'}`} />

            <div style={styles.transferCard}>
              <div style={styles.sectionLabel}>{info.labelAr}</div>

              {/* القيمة + نسخ */}
              <div style={styles.transferValueRow}>
                <div style={{
                  flex: 1,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: isLargeAddr ? '0.74rem' : '1.35rem',
                  fontWeight: 700,
                  color: 'var(--cyan)',
                  wordBreak: 'break-all',
                  letterSpacing: isLargeAddr ? 0.8 : 2,
                  lineHeight: 1.5,
                }}>
                  {transferVal || (
                    <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                      ⚠ لم يُضبط بعد — تواصل مع الدعم
                    </span>
                  )}
                </div>
                {transferVal && (
                  <button
                    onClick={handleCopy}
                    style={{ ...styles.copyBtn, ...(copied ? styles.copyBtnDone : {}) }}
                  >
                    {copied
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> تم</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> نسخ</>
                    }
                  </button>
                )}
              </div>

              {info.accountName && (
                <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                  حوّل باسم: <strong style={{ color: 'var(--text-2)' }}>{info.accountName}</strong>
                </div>
              )}
              {info.noteAr && (
                <div style={styles.noteText}>⚠ {info.noteAr}</div>
              )}
            </div>

            {/* تحذير الوقت */}
            <div style={styles.timeWarning}>
              <span>⏱</span>
              <span>لديك <strong>30 دقيقة</strong> لإتمام التحويل ورفع الإيصال</span>
            </div>
          </div>
        )}

        {/* ── TXID (للطلبات الـ USDT أو إيداع المحفظة) ── */}
        {(isCrypto || isWalletDeposit) && (
          <div>
            <StepLabel n={isWalletDeposit ? 2 : 2} text={isWalletDeposit ? 'رقم المعاملة TXID (إلزامي)' : 'رقم المعاملة TXID (اختياري)'} />
            <div style={styles.inputBox}>
              <input
                type="text"
                value={txid}
                onChange={e => { setTxid(e.target.value); setTxidErr('') }}
                placeholder="الصق رقم المعاملة هنا..."
                style={styles.txidInput}
              />
              {txidErr && <div style={styles.fieldError}>{txidErr}</div>}
              <div style={styles.txidNote}>
                {isWalletDeposit
                  ? '📌 TXID إلزامي لتأكيد الإيداع في محفظتك الداخلية'
                  : 'ℹ️ أدخل الـ TXID لتسريع التحقق من طلبك'}
              </div>
            </div>
          </div>
        )}

        {/* ── رفع الإيصال (غير إيداع المحفظة) ── */}
        {!isWalletTransfer && !isWalletDeposit && (
          <div>
            <StepLabel n={isCrypto ? 3 : 2} text="ارفع صورة الإيصال (اختياري)" />
            <div
              className="oc-dropzone"
              onClick={() => fileRef.current.click()}
              style={receipt ? { borderColor: 'var(--green)', background: 'rgba(0,229,160,0.04)' } : {}}
            >
              {preview ? (
                <div>
                  <img src={preview} alt="الإيصال" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8 }} />
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace" }}>
                    ✓ {receipt.name}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: 4 }}>اضغط لرفع صورة الإيصال</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>JPG, PNG, PDF — حتى 5MB</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        )}

        {/* ── Error ── */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* ── أزرار تأكيد / إلغاء ── */}
        <div style={styles.actionRow}>
          <button onClick={handleCancel} style={styles.cancelBtn}>
            ✕ إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...styles.confirmBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? '⏳ جاري الإرسال...'
              : isWalletTransfer
                ? 'تأكيد التحويل ✓'
                : 'تأكيد الدفع ✓'
            }
          </button>
        </div>

      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// TrackingSection — تتبع الطلب بعد الإرسال
// ═══════════════════════════════════════════════════════
function TrackingSection({ orderNumber, orderId, orderData, navigate, lang }) {
  const [status,     setStatus]     = useState('pending')
  const [orderInfo,  setOrderInfo]  = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh,setLastRefresh]= useState(new Date())

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  const fetchStatus = async () => {
    if (!orderNumber) return
    setRefreshing(true)
    try {
      const res  = await fetch(`${API}/api/orders/track/${orderNumber}`)
      const data = await res.json()
      if (data.success && data.order) {
        setStatus(data.order.status)
        setOrderInfo(data.order)
      }
    } catch(e) { /* ignore */ }
    finally {
      setRefreshing(false)
      setLastRefresh(new Date())
    }
  }

  // جلب الحالة عند تحميل الصفحة
  useEffect(() => { fetchStatus() }, [])

  const isWalletDeposit  = orderData.receiveMethod?.id === 'wallet-recv'
  const isWalletTransfer = orderData.sendMethod?.id   === 'wallet-usdt'
  const isSpecial = isWalletDeposit || isWalletTransfer

  return (
    <div style={styles.page}>
      <style>{pageCSS}</style>

      {/* ── Header ── */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          الرئيسية
        </button>
        <div style={styles.headerTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>تم إرسال الطلب</span>
        </div>
        <div style={{ width: 72 }} />
      </div>

      {/* ── Progress (step 2 active) ── */}
      <div style={styles.progressWrap}>
        <div style={styles.progressStep}>
          <div style={{ ...styles.progressDot, background: 'rgba(0,229,160,0.2)', color: 'var(--green)', border: '1.5px solid rgba(0,229,160,0.35)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span style={{ color: 'var(--green)' }}>التحويل</span>
        </div>
        <div style={{ ...styles.progressLine, background: 'var(--green)' }} />
        <div style={{ ...styles.progressStep, ...styles.progressActive }}>
          <div style={styles.progressDot}>2</div>
          <span>تتبع الطلب</span>
        </div>
      </div>

      <div style={styles.content}>

        {/* ── Success banner ── */}
        <div style={styles.successBanner}>
          <div style={styles.successIcon}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="18" fill="rgba(0,229,160,0.12)" stroke="#00e5a0" strokeWidth="1.5"/>
              <polyline points="10,19 16,26 28,12" fill="none" stroke="#00e5a0" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>
              تم إرسال طلبك بنجاح!
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {isSpecial
                ? 'سيتم مراجعة طلبك وتنفيذه قريباً'
                : 'سيقوم فريقنا بمراجعة الإيصال وتحويل المبلغ خلال 15-30 دقيقة'
              }
            </div>
          </div>
        </div>

        {/* ── رقم الطلب ── */}
        {orderNumber && (
          <div style={styles.orderNumCard}>
            <div style={styles.sectionLabel}>رقم طلبك</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '1.2rem', fontWeight: 800, color: 'var(--cyan)', letterSpacing: 2 }}>
              {orderNumber}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 6 }}>
              احتفظ بهذا الرقم لتتبع طلبك لاحقاً
            </div>
          </div>
        )}

        {/* ── ملخص الطلب ── */}
        <div style={styles.summaryCard}>
          <div style={styles.sectionLabel}>ملخص الطلب</div>
          <InfoRow label="ترسل"    value={`${orderData.sendAmount} ${orderData.sendMethod?.symbol || ''}`}    valueColor="var(--red)" />
          <InfoRow label="تستلم"   value={`${orderData.receiveAmount} ${orderData.receiveMethod?.symbol || ''}`} valueColor="var(--green)" />
          {orderData.recipientId && (
            <InfoRow label="معرّف الاستلام" value={orderData.recipientId} valueColor="var(--cyan)" mono />
          )}
          {orderData.email && (
            <InfoRow label="الإيميل" value={orderData.email} />
          )}
        </div>

        {/* ── حالة الطلب (فقط لو فيه orderNumber) ── */}
        {orderNumber && (
          <div style={styles.statusCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={styles.sectionLabel}>حالة الطلب</div>
              <button onClick={fetchStatus} disabled={refreshing} style={styles.refreshBtn}>
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: refreshing ? 'oc-spin 0.8s linear infinite' : 'none' }}
                >
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg>
                {refreshing ? 'يتحدث...' : 'تحديث الحالة'}
              </button>
            </div>

            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}77`, flexShrink: 0 }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color }}>{cfg.ar}</span>
            </div>

            {/* Timeline */}
            {orderInfo?.timeline?.length > 0 && (
              <div style={styles.timeline}>
                {orderInfo.timeline.slice().reverse().map((t, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)' }}>{t.status}</div>
                      {t.note && <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2 }}>{t.note}</div>}
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
                        {new Date(t.at).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 10, fontFamily: "'JetBrains Mono',monospace" }}>
              آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
            </div>
          </div>
        )}

        {/* ── أزرار ── */}
        <div style={styles.actionRow}>
          <button onClick={() => navigate('/track')} style={styles.cancelBtn}>
            تتبع طلباتي
          </button>
          <button onClick={() => navigate('/')} style={styles.confirmBtn}>
            طلب جديد
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────
function StepLabel({ n, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: 'var(--cyan-dim)', border: '1px solid var(--border-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)',
      }}>{n}</div>
      <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{text}</span>
    </div>
  )
}

function InfoRow({ label, value, valueColor, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: '0.88rem' }}>
      <span style={{ color: 'var(--text-2)' }}>{label}</span>
      <span style={{
        fontWeight: 700,
        color: valueColor || 'var(--text-1)',
        fontFamily: mono ? "'JetBrains Mono',monospace" : undefined,
        maxWidth: '60%', textAlign: 'left', wordBreak: 'break-all',
      }}>{value}</span>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    fontFamily: "'Cairo','Tajawal',sans-serif",
    direction: 'rtl',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px',
    background: 'var(--card)',
    borderBottom: '1px solid var(--border-1)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 9,
    border: '1px solid var(--border-1)', background: 'transparent',
    color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
    fontFamily: "'Cairo',sans-serif",
  },
  headerTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-1)',
    fontFamily: "'Orbitron',sans-serif", letterSpacing: 0.5,
  },
  progressWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 0, padding: '16px 24px',
    background: 'var(--card)', borderBottom: '1px solid var(--border-1)',
  },
  progressStep: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-2)',
  },
  progressActive: { color: 'var(--cyan)' },
  progressDot: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--cyan-dim)', border: '1.5px solid var(--border-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)',
    flexShrink: 0,
  },
  progressLine: {
    width: 48, height: 2, background: 'var(--border-1)', margin: '0 12px',
  },
  content: {
    maxWidth: 520, margin: '0 auto',
    padding: '24px 16px 48px',
    display: 'flex', flexDirection: 'column', gap: 18,
  },
  summaryCard: {
    background: 'rgba(0,210,255,0.04)',
    border: '1px solid var(--border-1)',
    borderRadius: 14, padding: '14px 18px',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, fontSize: '0.9rem',
  },
  sectionLabel: {
    fontSize: '0.66rem', color: 'var(--text-3)',
    fontFamily: "'JetBrains Mono',monospace",
    letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase',
  },
  infoBox: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: 'rgba(245,158,11,0.06)',
    border: '1px dashed rgba(245,158,11,0.25)',
    borderRadius: 10, padding: '10px 14px',
    fontSize: '0.82rem', color: 'var(--gold)', lineHeight: 1.55,
  },
  transferCard: {
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid var(--border-1)',
    borderRadius: 14, padding: '14px 16px',
  },
  transferValueRow: {
    display: 'flex', alignItems: 'center', gap: 12, marginTop: 6,
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    flexShrink: 0, padding: '8px 14px',
    border: '1px solid var(--border-2)',
    borderRadius: 9, fontFamily: "'JetBrains Mono',monospace",
    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
    background: 'var(--cyan-dim)', color: 'var(--cyan)', transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  copyBtnDone: {
    background: 'rgba(0,229,160,0.12)', color: 'var(--green)',
    borderColor: 'rgba(0,229,160,0.3)',
  },
  noteText: {
    marginTop: 8, fontSize: '0.7rem', color: 'var(--text-3)',
    fontFamily: "'JetBrains Mono',monospace",
  },
  timeWarning: {
    marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(200,168,75,0.06)', border: '1px dashed rgba(200,168,75,0.25)',
    borderRadius: 9, padding: '9px 13px', fontSize: '0.78rem', color: 'var(--gold)',
  },
  inputBox: {
    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-1)',
    borderRadius: 12, padding: '12px 14px',
  },
  txidInput: {
    width: '100%', background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace",
    fontSize: '0.78rem', direction: 'ltr', boxSizing: 'border-box',
  },
  txidNote: {
    marginTop: 8, fontSize: '0.68rem', color: 'var(--text-3)',
    fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6,
  },
  fieldError: {
    fontSize: '0.72rem', color: '#f87171', marginTop: 4,
    fontFamily: "'JetBrains Mono',monospace",
  },
  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 10, padding: '11px 14px',
    color: '#f87171', fontSize: '0.85rem', textAlign: 'center',
  },
  actionRow: {
    display: 'flex', gap: 10,
  },
  cancelBtn: {
    flex: 1, padding: '13px 0',
    background: 'transparent', border: '1px solid var(--border-2)',
    borderRadius: 12, color: 'var(--text-2)', cursor: 'pointer',
    fontFamily: "'Cairo','Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 700,
    transition: 'all 0.2s',
  },
  confirmBtn: {
    flex: 2, padding: '13px 0',
    background: 'linear-gradient(135deg,#009fc0,#006e9e)',
    border: 'none', borderRadius: 12,
    color: '#fff', cursor: 'pointer',
    fontFamily: "'Cairo','Tajawal',sans-serif",
    fontSize: '0.98rem', fontWeight: 800,
    boxShadow: '0 4px 20px rgba(0,159,192,0.25)',
    transition: 'all 0.2s',
  },
  successBanner: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)',
    borderRadius: 14, padding: '16px 18px',
  },
  successIcon: { flexShrink: 0 },
  orderNumCard: {
    background: 'rgba(0,210,255,0.05)', border: '1px solid var(--border-2)',
    borderRadius: 14, padding: '16px 18px', textAlign: 'center',
  },
  statusCard: {
    background: 'var(--card)', border: '1px solid var(--border-1)',
    borderRadius: 14, padding: '16px 18px',
  },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8,
    border: '1px solid var(--border-1)', background: 'var(--cyan-dim)',
    color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
    fontFamily: "'Cairo',sans-serif",
  },
  timeline: {
    display: 'flex', flexDirection: 'column', gap: 10,
    paddingTop: 10, borderTop: '1px solid var(--border-1)',
  },
  timelineItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
  },
  timelineDot: {
    width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)',
    flexShrink: 0, marginTop: 4,
  },
}

const pageCSS = `
  @keyframes oc-spin { to { transform: rotate(360deg) } }

  .oc-dropzone {
    border: 1.5px dashed var(--border-2);
    border-radius: 12px;
    padding: 24px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.22s;
    background: transparent;
  }
  .oc-dropzone:hover {
    border-color: var(--cyan);
    background: rgba(0,210,255,0.03);
  }

  @media (max-width: 480px) {
    .oc-action-row { flex-direction: column !important; }
  }
`
