// ============================================
// src/pages/Wallet.jsx — محفظة المستخدم (رصيد USDT واحد)
// ✅ محدّث: DepositModal يعرض وسائل الدفع من AdminPaymentMethods
// ✅ باقي الصفحة بدون أي تعديل
// ============================================
import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import useAuth                 from '../context/useAuth'
import { walletAPI }           from '../services/api'

const API      = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = () => localStorage.getItem('n1_token')

// ─── أنواع المعاملات ──────────────────────────
const TX_CONFIG = {
  deposit:       { label: 'إيداع USDT',    color: '#00e5a0', icon: '↓', bg: '#064e3b' },
  withdraw:      { label: 'سحب USDT',      color: '#f85149', icon: '↑', bg: '#3d0a0a' },
  exchange_debit:{ label: 'صرافة',         color: '#60a5fa', icon: '⇄', bg: '#1e3a5f' },
  admin_adjust:  { label: 'تعديل يدوي',    color: '#f59e0b', icon: '✎', bg: '#3d2800' },
}

// ─── بادج الحالة ─────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { ar: 'قيد المراجعة', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    approved: { ar: 'موافق عليه',   color: '#00e5a0', bg: 'rgba(0,229,160,0.12)'  },
    rejected: { ar: 'مرفوض',        color: '#f85149', bg: 'rgba(248,81,73,0.12)'  },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontFamily: "'JetBrains Mono',monospace",
      border: `1px solid ${s.color}33`, whiteSpace: 'nowrap'
    }}>{s.ar}</span>
  )
}

// ─── زر النسخ ─────────────────────────────────
function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      flexShrink: 0, padding: '5px 12px',
      background: copied ? 'rgba(0,229,160,0.1)' : 'rgba(0,210,255,0.08)',
      border: `1px solid ${copied ? 'rgba(0,229,160,0.3)' : 'rgba(0,210,255,0.2)'}`,
      borderRadius: 7, color: copied ? '#00e5a0' : 'var(--cyan)',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem',
      fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
    }}>
      {copied ? '✓ تم النسخ' : 'نسخ'}
    </button>
  )
}

// ══════════════════════════════════════════════
// مودال الإيداع — ✅ محدّث بخطوتين
// الخطوة 1: اختيار وسيلة الدفع (من AdminPaymentMethods)
// الخطوة 2: إدخال المبلغ + TXID
// Fallback: لو ما في وسائل دفع، يستخدم deposit-info القديم
// ══════════════════════════════════════════════
function DepositModal({ isOpen, onClose, onSuccess }) {
  const [step,        setStep]        = useState('method')
  const [method,      setMethod]      = useState(null)
  const [amount,      setAmount]      = useState('')
  const [txid,        setTxid]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [depositInfo, setDepositInfo] = useState(null)
  const [payMethods,  setPayMethods]  = useState(null)
  const [infoLoading, setInfoLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setInfoLoading(true)
    setStep('method'); setMethod(null); setAmount(''); setTxid(''); setError('')

    Promise.all([
      fetch(`${API}/api/public/wallet-deposit-addresses`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/wallet/deposit-info`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      }).then(r => r.json()).catch(() => null),
    ]).then(([pmData, diData]) => {
      if (pmData?.success) setPayMethods(pmData)
      if (diData?.success) setDepositInfo(diData.depositInfo)
    }).finally(() => setInfoLoading(false))
  }, [isOpen])

  const handleClose = () => {
    setAmount(''); setTxid(''); setError(''); setLoading(false)
    setStep('method'); setMethod(null)
    onClose()
  }

  const handleSubmit = async () => {
    setError('')
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return setError('يرجى إدخال مبلغ صحيح')
    if (!txid.trim())
      return setError('يرجى إدخال رقم المعاملة (TXID)')

    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ amount: Number(amount), txid: txid.trim() })
      })
      const data = await res.json()
      if (data.success) { onSuccess(); handleClose() }
      else setError(data.message || 'حدث خطأ، حاول مرة أخرى')
    } catch { setError('خطأ في الاتصال بالسيرفر') }
    finally { setLoading(false) }
  }

  if (!isOpen) return null

  const cryptos = (payMethods?.cryptos || []).filter(c => c.enabled && c.address)
  const ewallets = []
  const hasPayMethods = cryptos.length > 0
  const useLegacy = !hasPayMethods && depositInfo?.usdtAddress

  return (
    <div onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, width: '100%', maxWidth: 480, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#26a17b,transparent)' }} />

        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(38,161,123,0.1)', border: '1px solid rgba(38,161,123,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>₮</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)' }}>
                {step === 'method' ? 'اختر وسيلة الإيداع' : 'إيداع USDT'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>ستتم المراجعة خلال 24 ساعة</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {infoLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem' }}>⏳ جاري التحميل...</div>
          ) : (
            <>
              {/* ══ الخطوة 1: اختيار وسيلة الدفع ══ */}
              {step === 'method' && (
                <>
                  {hasPayMethods && (
                    <>
                      {cryptos.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 10 }}>🔗 عملات رقمية</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {cryptos.map(c => (
                              <button key={c.id || c.address} onClick={() => { setMethod({ type: 'crypto', ...c }); setStep('form') }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: `${c.color}08`, border: `1px solid ${c.color}25`, borderRadius: 14, cursor: 'pointer', textAlign: 'right', width: '100%', transition: 'all 0.15s', fontFamily: "'Tajawal',sans-serif" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}60`; e.currentTarget.style.background = `${c.color}12` }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}25`; e.currentTarget.style.background = `${c.color}08` }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, color: c.color, flexShrink: 0 }}>{c.icon}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)' }}>{c.label || `${c.coin} ${c.network}`}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{c.address.substring(0, 10)}...{c.address.substring(c.address.length - 6)}</div>
                                </div>
                                <span style={{ color: c.color, fontSize: '0.8rem' }}>←</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {ewallets.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 10 }}>📱 محافظ إلكترونية</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {ewallets.map(w => (
                              <button key={w.id || w.number} onClick={() => { setMethod({ type: 'wallet', ...w }); setStep('form') }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: `${w.color}08`, border: `1px solid ${w.color}25`, borderRadius: 14, cursor: 'pointer', textAlign: 'right', width: '100%', transition: 'all 0.15s', fontFamily: "'Tajawal',sans-serif" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = `${w.color}60`; e.currentTarget.style.background = `${w.color}12` }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = `${w.color}25`; e.currentTarget.style.background = `${w.color}08` }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${w.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{w.icon}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)' }}>{w.name}</div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{w.number}</div>
                                </div>
                                <span style={{ color: w.color, fontSize: '0.8rem' }}>←</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {useLegacy && (
                    <button onClick={() => { setMethod({ type: 'crypto', icon: '₮', color: '#26a17b', label: `USDT ${depositInfo.usdtNetwork || 'TRC20'}`, network: depositInfo.usdtNetwork || 'TRC20', address: depositInfo.usdtAddress, note: depositInfo.note || '' }); setStep('form') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(38,161,123,0.06)', border: '1px solid rgba(38,161,123,0.25)', borderRadius: 14, cursor: 'pointer', textAlign: 'right', width: '100%', fontFamily: "'Tajawal',sans-serif" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(38,161,123,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, color: '#26a17b', flexShrink: 0 }}>₮</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)' }}>USDT {depositInfo.usdtNetwork || 'TRC20'}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{depositInfo.usdtAddress.substring(0, 10)}...{depositInfo.usdtAddress.substring(depositInfo.usdtAddress.length - 6)}</div>
                      </div>
                      <span style={{ color: '#26a17b', fontSize: '0.8rem' }}>←</span>
                    </button>
                  )}

                  {!hasPayMethods && !useLegacy && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>🚫</div>
                      <div style={{ fontSize: '0.88rem' }}>لا توجد وسائل إيداع متاحة حالياً</div>
                      <div style={{ fontSize: '0.75rem', marginTop: 6 }}>تواصل مع الدعم الفني</div>
                    </div>
                  )}
                </>
              )}

              {/* ══ الخطوة 2: إدخال البيانات ══ */}
              {step === 'form' && method && (
                <>
                  <button onClick={() => { setStep('method'); setMethod(null); setError('') }}
                    style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Tajawal',sans-serif" }}>
                    → رجوع
                  </button>

                  {/* معلومات الوسيلة */}
                  <div style={{ background: `${method.color}06`, border: `1px solid ${method.color}20`, borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${method.color}15`, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.95rem' }}>{method.icon}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: method.color }}>أرسل على {method.label || method.name}</span>
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {method.type === 'crypto' && method.network && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>الشبكة</span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', fontWeight: 700, color: method.color, background: `${method.color}12`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${method.color}25` }}>{method.network}</span>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 6 }}>{method.type === 'crypto' ? 'عنوان المحفظة' : 'رقم الاستلام'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border-1)' }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: method.color, flex: 1, wordBreak: 'break-all', lineHeight: 1.6 }}>{method.type === 'crypto' ? method.address : method.number}</span>
                          <CopyBtn value={method.type === 'crypto' ? method.address : method.number} />
                        </div>
                      </div>
                      {method.type === 'crypto' && (
                        <div style={{ background: 'rgba(248,81,73,0.07)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 12, overflow: 'hidden' }}>
                          {/* Warning header */}
                          <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.12)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(248,81,73,0.2)' }}>
                            <span style={{ fontSize: '1rem' }}>🚨</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>تحذير مهم — اقرأ قبل الإرسال</span>
                          </div>
                          {/* Warning points */}
                          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {[
                              `أرسل على شبكة ${method.network} فقط — أي شبكة أخرى ستؤدي لخسارة أموالك`,
                              'تأكد من نسخ العنوان كاملاً دون أي تعديل',
                              'لا ترسل إلا العملة المحددة أعلاه',
                              'احتفظ برقم المعاملة (TXID) بعد الإرسال لإدخاله في الخطوة التالية',
                            ].map((txt, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span style={{ color: '#f85149', fontWeight: 900, flexShrink: 0, marginTop: 1, fontSize: '0.8rem' }}>✕</span>
                                <span style={{ fontSize: '0.75rem', color: '#e2a0a0', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.5 }}>{txt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {method.note && (
                        <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.06)', border: '1px dashed rgba(245,158,11,0.3)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--gold, #f59e0b)' }}>📌 {method.note}</div>
                      )}
                    </div>
                  </div>

                  {/* المبلغ */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>المبلغ الذي أرسلته</label>
                      <input type="number" value={amount} min="1" onChange={e => setAmount(e.target.value)} placeholder="0.00"
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem', boxSizing: 'border-box', outline: 'none', direction: 'ltr' }}
                        onFocus={e => e.target.style.borderColor = method.color} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
                    </div>
                    <div style={{ padding: '12px 18px', background: `${method.color}10`, border: `1px solid ${method.color}25`, borderRadius: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: method.color, fontSize: '0.9rem' }}>USDT</div>
                  </div>

                  {/* TXID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>رقم المعاملة (TXID) — من محفظتك بعد الإرسال</label>
                    <input type="text" value={txid} onChange={e => setTxid(e.target.value)} placeholder="أدخل TXID هنا..."
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', boxSizing: 'border-box', outline: 'none', direction: 'ltr' }}
                      onFocus={e => e.target.style.borderColor = method.color} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
                  </div>

                  {error && (
                    <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, fontSize: '0.82rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>⚠️ {error}</div>
                  )}

                  <button onClick={handleSubmit} disabled={loading}
                    style={{ width: '100%', padding: 14, background: loading ? `${method.color}40` : `linear-gradient(135deg,${method.color},${method.color}cc)`, border: 'none', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 800, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}>
                    {loading ? '⏳ جاري الإرسال...' : '← إرسال طلب الإيداع'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// مودال السحب — بدون أي تعديل (نفس الكود الأصلي)
// ══════════════════════════════════════════════
function WithdrawModal({ isOpen, onClose, balance }) {
  const [amount,       setAmount]       = useState('')
  const [method,       setMethod]       = useState('moneygo')
  const [withdrawInfo, setWithdrawInfo] = useState(null)
  const [infoLoading,  setInfoLoading]  = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setInfoLoading(true)
    fetch(`${API}/api/wallet/withdraw-info`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setWithdrawInfo(d.withdrawInfo) })
      .catch(() => {})
      .finally(() => setInfoLoading(false))
  }, [isOpen])

  const handleClose = () => { setAmount(''); setMethod('moneygo'); onClose() }

  const buildMessage = () => {
    const methodLabel = method === 'moneygo' ? 'MoneyGo USD' : 'USDT TRC20'
    return `مرحباً، أريد سحب ${amount || '...'} USDT من رصيد محفظتي إلى ${methodLabel}`
  }

  const openWhatsApp = () => {
    if (!withdrawInfo?.whatsapp) return
    const num = withdrawInfo.whatsapp.replace(/\D/g, '')
    const msg = encodeURIComponent(buildMessage())
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
  }

  const openTelegram = () => {
    if (!withdrawInfo?.telegram) return
    const username = withdrawInfo.telegram.replace('@', '')
    const msg      = encodeURIComponent(buildMessage())
    window.open(`https://t.me/${username}?text=${msg}`, '_blank')
  }

  if (!isOpen) return null

  const amountValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance

  return (
    <div onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#f85149,transparent)' }} />
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>↑</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)' }}>طلب سحب</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>الرصيد المتاح: {balance?.toFixed(2)} USDT</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>المبلغ المراد سحبه (USDT)</label>
            <input type="number" value={amount} min="1" max={balance} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem', boxSizing: 'border-box', outline: 'none', direction: 'ltr' }}
              onFocus={e => e.target.style.borderColor = '#f85149'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
            {amount && parseFloat(amount) > balance && <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>⚠️ المبلغ أكبر من الرصيد المتاح</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>طريقة الاستلام</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ id: 'moneygo', label: 'MoneyGo USD', icon: '💳' }, { id: 'usdt', label: 'USDT TRC20', icon: '₮' }].map(opt => (
                <button key={opt.id} onClick={() => setMethod(opt.id)} style={{ padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', fontWeight: 700, border: method === opt.id ? '1px solid var(--cyan)' : '1px solid var(--border-1)', background: method === opt.id ? 'rgba(0,210,255,0.08)' : 'rgba(0,0,0,0.15)', color: method === opt.id ? 'var(--cyan)' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>
          {amountValid && (
            <div style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.15)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, letterSpacing: 1 }}>الرسالة التي ستُرسل للأدمن</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8 }}>{buildMessage()}</div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'center', fontFamily: "'Tajawal',sans-serif" }}>اختر طريقة التواصل مع الأدمن</div>
            {infoLoading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem' }}>⏳ جاري التحميل...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={openWhatsApp} disabled={!amountValid || !withdrawInfo?.whatsapp}
                  style={{ padding: '13px 16px', borderRadius: 12, cursor: amountValid && withdrawInfo?.whatsapp ? 'pointer' : 'not-allowed', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', fontWeight: 700, background: amountValid && withdrawInfo?.whatsapp ? 'rgba(37,211,102,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${amountValid && withdrawInfo?.whatsapp ? 'rgba(37,211,102,0.3)' : 'var(--border-1)'}`, color: amountValid && withdrawInfo?.whatsapp ? '#25d366' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: amountValid ? 1 : 0.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  واتساب
                </button>
                <button onClick={openTelegram} disabled={!amountValid || !withdrawInfo?.telegram}
                  style={{ padding: '13px 16px', borderRadius: 12, cursor: amountValid && withdrawInfo?.telegram ? 'pointer' : 'not-allowed', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', fontWeight: 700, background: amountValid && withdrawInfo?.telegram ? 'rgba(0,136,204,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${amountValid && withdrawInfo?.telegram ? 'rgba(0,136,204,0.3)' : 'var(--border-1)'}`, color: amountValid && withdrawInfo?.telegram ? '#0088cc' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: amountValid ? 1 : 0.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  تيليجرام
                </button>
              </div>
            )}
            {!amountValid && <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>أدخل مبلغاً صحيحاً أولاً لتفعيل أزرار التواصل</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// الصفحة الرئيسية — بدون أي تعديل
// ══════════════════════════════════════════════
export default function WalletPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [wallet,       setWallet]       = useState(null)
  const [transactions, setTransactions] = useState([])
  const [deposits,     setDeposits]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [activeTab,    setActiveTab]    = useState('deposits')
  const [successMsg,   setSuccessMsg]   = useState('')
  const [showDeposit,  setShowDeposit]  = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) { navigate('/'); return }
    fetchAll()
  }, [user])

  const fetchAll = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await walletAPI.getWallet()
      setWallet(data.wallet)
      setTransactions(data.transactions || [])
    } catch { setError('تعذر تحميل المحفظة') }
    finally  { setLoading(false) }
    fetchDeposits()
  }

  const fetchDeposits = async () => {
    try {
      const res  = await fetch(`${API}/api/wallet/deposits`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (data.success) setDeposits(data.deposits || [])
    } catch {}
  }

  const handleDepositSuccess = () => {
    setSuccessMsg('✅ تم إرسال طلبك! سيتم مراجعته خلال 24 ساعة.')
    fetchAll()
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border-1)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>جاري تحميل المحفظة...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>{error}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', padding: '50px 24px 80px', maxWidth: 720, margin: '0 auto', direction: 'rtl' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.06)', marginBottom: 14 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>VIRTUAL WALLET</span>
        </div>
        <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>محفظتي</h1>
        {wallet?.walletId && <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', color: 'var(--text-3)' }}>رقم المحفظة: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{wallet.walletId}</span></div>}
      </div>

      {successMsg && <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 12, color: '#00e5a0', fontSize: '0.88rem', fontFamily: "'Tajawal',sans-serif" }}>{successMsg}</div>}

      {/* كارد الرصيد */}
      <div style={{ background: 'linear-gradient(135deg,#0d2137 0%,#0a1628 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '28px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)' }} />
        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,212,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6, letterSpacing: 2 }}>USDT BALANCE</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 22 }}>
          <span style={{ fontSize: '3rem', fontWeight: 900, color: '#26a17b', fontFamily: "'Orbitron',sans-serif", lineHeight: 1 }}>{wallet?.balance?.toFixed(2) || '0.00'}</span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>USDT</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[{ label: 'إجمالي الإيداع', value: `${wallet?.totalDeposited?.toFixed(2) || '0.00'} USDT`, color: '#00e5a0' }, { label: 'إجمالي السحب', value: `${wallet?.totalWithdrawn?.toFixed(2) || '0.00'} USDT`, color: '#f85149' }].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '11px 14px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={() => setShowDeposit(true)} disabled={!wallet?.isActive} style={{ padding: 13, background: 'linear-gradient(135deg,#26a17b,#1a7a5e)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, cursor: wallet?.isActive ? 'pointer' : 'not-allowed', opacity: wallet?.isActive ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>₮ إيداع USDT ↓</button>
          <button onClick={() => setShowWithdraw(true)} disabled={!wallet?.isActive || !wallet?.balance || wallet?.balance <= 0} style={{ padding: 13, background: wallet?.balance > 0 ? 'linear-gradient(135deg,#009fc0,#006e9e)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, color: wallet?.balance > 0 ? '#fff' : 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, cursor: wallet?.balance > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>سحب ↑</button>
        </div>
        {!wallet?.isActive && <div style={{ marginTop: 12, textAlign: 'center', fontSize: '0.78rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>⚠️ المحفظة معطلة — تواصل مع الدعم</div>}
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-1)' }}>
          {[{ id: 'deposits', label: 'طلبات الإيداع' }, { id: 'transactions', label: 'المعاملات' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '13px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer' }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'deposits' && (
          deposits.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>📭</div>
              <div style={{ color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem' }}>لا يوجد طلبات إيداع حتى الآن</div>
              <div style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.78rem', marginTop: 4 }}>اضغط "إيداع USDT" لإنشاء أول طلب</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border-1)' }}>{['المبلغ', 'TXID', 'الحالة', 'التاريخ'].map(h => (<th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>))}</tr></thead>
                <tbody>
                  {deposits.map((d, i) => (
                    <tr key={d._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.9rem', fontWeight: 700, color: '#26a17b' }}>{Number(d.amount).toFixed(2)} USDT</td>
                      <td style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem', color: 'var(--text-3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.txid || '—'}</td>
                      <td style={{ padding: '12px 14px' }}><StatusBadge status={d.status} /></td>
                      <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: 'var(--text-3)', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono',monospace" }}>{new Date(d.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'transactions' && (
          transactions.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>لا يوجد معاملات بعد</div>
          ) : (
            transactions.map(tx => {
              const cfg = TX_CONFIG[tx.type] || { label: tx.type, color: '#8b949e', icon: '•', bg: '#21262d' }
              return (
                <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: cfg.color, fontWeight: 700 }}>{cfg.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif" }}>{cfg.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{new Date(tx.createdAt).toLocaleString('ar-EG')}</div>
                      {tx.note && <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", marginTop: 2 }}>{tx.note}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: cfg.color, fontFamily: "'JetBrains Mono',monospace" }}>
                      {tx.type === 'deposit' || (tx.type === 'admin_adjust' && tx.balanceAfter > tx.balanceBefore) ? '+' : '-'}{tx.amount} USDT
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>→ {tx.balanceAfter?.toFixed(2)} USDT</div>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>

      <DepositModal  isOpen={showDeposit}  onClose={() => setShowDeposit(false)}  onSuccess={handleDepositSuccess} />
      <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} balance={wallet?.balance || 0} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}