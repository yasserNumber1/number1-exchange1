// ============================================
// src/pages/Wallet.jsx
// ============================================
import { useEffect, useState, useRef } from 'react'
import { useNavigate }                 from 'react-router-dom'
import useAuth                         from '../context/useAuth'
import { walletAPI }                   from '../services/api'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = () => localStorage.getItem('n1_token')

const TX_CONFIG = {
  deposit:        { label: 'إيداع USDT',  color: '#00e5a0', icon: '↓', bg: '#064e3b' },
  withdraw:       { label: 'سحب USDT',    color: '#f85149', icon: '↑', bg: '#3d0a0a' },
  exchange_debit: { label: 'صرافة',       color: '#60a5fa', icon: '⇄', bg: '#1e3a5f' },
}

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
      background: s.bg, color: s.color, fontFamily: "'JetBrains Mono',monospace",
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

// ─── مودال الإيداع ────────────────────────────
function DepositModal({ isOpen, onClose, onSuccess }) {
  const [type,        setType]       = useState('bank_transfer')
  const [amount,      setAmount]     = useState('')
  const [txid,        setTxid]       = useState('')
  const [receipt,     setReceipt]    = useState(null)
  const [preview,     setPreview]    = useState(null)
  const [loading,     setLoading]    = useState(false)
  const [error,       setError]      = useState('')
  const [depositInfo, setDepositInfo] = useState(null)
  const [infoLoading, setInfoLoading] = useState(true)
  const fileRef = useRef(null)

  // ─── جلب بيانات الإيداع من الـ API ──────────
  useEffect(() => {
    if (!isOpen) return
    setInfoLoading(true)
    fetch(`${API}/api/public/deposit-info`)
      .then(r => r.json())
      .then(d => { if (d.success) setDepositInfo(d) })
      .catch(() => {})
      .finally(() => setInfoLoading(false))
  }, [isOpen])

  const handleClose = () => {
    setAmount(''); setTxid(''); setReceipt(null)
    setPreview(null); setError(''); setLoading(false)
    setType('bank_transfer')
    onClose()
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setReceipt(file)
    const r = new FileReader()
    r.onload = ev => setPreview(ev.target.result)
    r.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setError('')
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return setError('يرجى إدخال مبلغ صحيح')
    if (type === 'bank_transfer' && !receipt)
      return setError('يرجى رفع إيصال التحويل البنكي')
    if (type === 'usdt' && !txid.trim())
      return setError('يرجى إدخال رقم المعاملة (TXID)')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('type',     type)
      formData.append('amount',   amount)
      formData.append('currency', type === 'usdt' ? 'USDT' : 'EGP')
      if (type === 'usdt') formData.append('txid', txid)
      if (type === 'bank_transfer' && receipt) formData.append('receipt', receipt)

      const res  = await fetch(`${API}/api/wallet/deposit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })
      const data = await res.json()
      if (data.success) { onSuccess(); handleClose() }
      else setError(data.message || 'حدث خطأ، حاول مرة أخرى')
    } catch {
      setError('خطأ في الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
    >
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22,
        width: '100%', maxWidth: 480, maxHeight: '92vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', position: 'relative',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)' }}>إيداع N1 Credit</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>ستتم المراجعة خلال 24 ساعة</div>
            </div>
          </div>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── اختيار نوع الإيداع ── */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
              نوع الإيداع
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'bank_transfer', label: 'تحويل بنكي', icon: '🏦' },
                { id: 'usdt',          label: 'USDT TRC20',  icon: '₮'  }
              ].map(opt => (
                <button key={opt.id} onClick={() => setType(opt.id)} style={{
                  padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                  fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', fontWeight: 700,
                  border: type === opt.id ? '1px solid var(--cyan)' : '1px solid var(--border-1)',
                  background: type === opt.id ? 'rgba(0,210,255,0.08)' : 'rgba(0,0,0,0.15)',
                  color: type === opt.id ? 'var(--cyan)' : 'var(--text-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s'
                }}>
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ══ معلومات التحويل البنكي ══ */}
          {type === 'bank_transfer' && (
            <div style={{
              background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.18)',
              borderRadius: 14, overflow: 'hidden'
            }}>
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid rgba(0,210,255,0.1)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ fontSize: '0.95rem' }}>🏦</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan)' }}>
                  حوّل المبلغ على هذا الحساب البنكي
                </span>
              </div>

              {infoLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem' }}>
                  ⏳ جاري التحميل...
                </div>
              ) : depositInfo?.bank?.accountNumber ? (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'البنك',       value: depositInfo.bank.bankName      },
                    { label: 'اسم الحساب',  value: depositInfo.bank.accountName   },
                    { label: 'رقم الحساب',  value: depositInfo.bank.accountNumber },
                  ].map(row => row.value ? (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', flexShrink: 0 }}>{row.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace", fontSize: '0.85rem',
                          fontWeight: 700, color: 'var(--text-1)'
                        }}>{row.value}</span>
                        <CopyBtn value={row.value} />
                      </div>
                    </div>
                  ) : null)}

                  {depositInfo.note && (
                    <div style={{
                      marginTop: 4, padding: '8px 12px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px dashed rgba(245,158,11,0.3)',
                      borderRadius: 8, fontSize: '0.75rem', color: 'var(--gold)'
                    }}>
                      📌 {depositInfo.note}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>
                    ⚠️ لم يتم إعداد بيانات الحساب البنكي بعد
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                    تواصل مع الدعم للحصول على بيانات التحويل
                  </div>
                </div>
              )}

              <div style={{
                margin: '0 14px 14px',
                padding: '9px 12px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px dashed rgba(245,158,11,0.25)',
                borderRadius: 8, fontSize: '0.75rem', color: 'var(--gold)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                ⚠️ بعد التحويل، ارفع إيصال التحويل أدناه
              </div>
            </div>
          )}

          {/* ══ معلومات عنوان USDT ══ */}
          {type === 'usdt' && (
            <div style={{
              background: 'rgba(38,161,123,0.04)', border: '1px solid rgba(38,161,123,0.2)',
              borderRadius: 14, overflow: 'hidden'
            }}>
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid rgba(38,161,123,0.15)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ fontSize: '0.95rem' }}>₮</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#26a17b' }}>
                  أرسل USDT على هذا العنوان
                </span>
              </div>

              {infoLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem' }}>
                  ⏳ جاري التحميل...
                </div>
              ) : depositInfo?.usdt?.address ? (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* الشبكة */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>الشبكة</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem',
                      fontWeight: 700, color: '#26a17b',
                      background: 'rgba(38,161,123,0.1)', padding: '3px 10px',
                      borderRadius: 20, border: '1px solid rgba(38,161,123,0.2)'
                    }}>
                      {depositInfo.usdt.network}
                    </span>
                  </div>

                  {/* العنوان */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 6 }}>عنوان المحفظة</div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'rgba(0,0,0,0.2)', borderRadius: 10,
                      padding: '10px 12px', border: '1px solid var(--border-1)'
                    }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem',
                        color: '#26a17b', flex: 1, wordBreak: 'break-all', lineHeight: 1.6
                      }}>
                        {depositInfo.usdt.address}
                      </span>
                      <CopyBtn value={depositInfo.usdt.address} />
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(248,81,73,0.06)',
                    border: '1px dashed rgba(248,81,73,0.25)',
                    borderRadius: 8, fontSize: '0.75rem', color: '#f85149',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    🚨 أرسل على شبكة {depositInfo.usdt.network} فقط — شبكة مختلفة = خسارة الأموال
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>
                    ⚠️ لم يتم إعداد عنوان USDT بعد
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                    تواصل مع الدعم للحصول على عنوان المحفظة
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── المبلغ ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
                المبلغ الذي حولته
              </label>
              <input
                type="number" value={amount} min="1"
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem', boxSizing: 'border-box', outline: 'none', direction: 'ltr' }}
                onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border-1)'}
              />
            </div>
            <div style={{ padding: '12px 18px', background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--cyan)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {type === 'usdt' ? 'USDT' : 'EGP'}
            </div>
          </div>

          {/* ── TXID للـ USDT ── */}
          {type === 'usdt' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
                رقم المعاملة (TXID) — من محفظتك
              </label>
              <input
                type="text" value={txid}
                onChange={e => setTxid(e.target.value)}
                placeholder="أدخل TXID من محفظتك بعد الإرسال..."
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', boxSizing: 'border-box', outline: 'none', direction: 'ltr' }}
                onFocus={e => e.target.style.borderColor = '#26a17b'}
                onBlur={e  => e.target.style.borderColor = 'var(--border-1)'}
              />
            </div>
          )}

          {/* ── إيصال التحويل البنكي ── */}
          {type === 'bank_transfer' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
                إيصال التحويل البنكي
              </label>
              <div
                onClick={() => fileRef.current.click()}
                style={{ border: `1.5px dashed ${receipt ? 'var(--green)' : 'var(--border-2)'}`, borderRadius: 12, padding: receipt ? 10 : 22, textAlign: 'center', cursor: 'pointer', background: receipt ? 'rgba(0,229,160,0.04)' : 'rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
              >
                {preview ? (
                  <div>
                    <img src={preview} alt="receipt" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8 }} />
                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace" }}>✓ {receipt.name}</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📎</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif" }}>اضغط لرفع إيصال التحويل</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>JPG · PNG · PDF</div>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
            </div>
          )}

          {/* خطأ */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, fontSize: '0.82rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>
              ⚠️ {error}
            </div>
          )}

          {/* زر الإرسال */}
          <button
            onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: 14, background: loading ? 'rgba(0,159,192,0.3)' : 'linear-gradient(135deg,var(--cyan),var(--purple))', border: 'none', borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 800, color: loading ? 'var(--text-3)' : '#000', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
          >
            {loading ? '⏳ جاري الإرسال...' : '← إرسال طلب الإيداع'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── باقي الصفحة كما هي بدون تغيير ───────────
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
  const [showWithdraw,    setShowWithdraw]    = useState(false)
  const [withdrawAmount,  setWithdrawAmount]  = useState('')
  const [withdrawNote,    setWithdrawNote]    = useState('')
  const [withdrawing,     setWithdrawing]     = useState(false)
  const [withdrawError,   setWithdrawError]   = useState(null)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

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

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    setWithdrawing(true); setWithdrawError(null)
    try {
      const { data } = await walletAPI.withdraw({ amount: parseFloat(withdrawAmount), note: withdrawNote || null })
      setWallet(prev => ({ ...prev, balance: data.balance }))
      setTransactions(prev => [data.transaction, ...prev])
      setWithdrawSuccess(true)
      setTimeout(() => { setShowWithdraw(false); setWithdrawSuccess(false); setWithdrawAmount(''); setWithdrawNote('') }, 2000)
    } catch (err) { setWithdrawError(err.response?.data?.message || 'فشل السحب') }
    finally { setWithdrawing(false) }
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
        {wallet?.walletId && (
          <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', color: 'var(--text-3)' }}>
            رقم المحفظة: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{wallet.walletId}</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 12, color: '#00e5a0', fontSize: '0.88rem', fontFamily: "'Tajawal',sans-serif" }}>
          {successMsg}
        </div>
      )}

      {/* كارد USDT */}
      <div style={{ background: 'linear-gradient(135deg,#0d2137 0%,#0a1628 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '28px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,212,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6, letterSpacing: 2 }}>USDT BALANCE</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#26a17b', fontFamily: "'Orbitron',sans-serif", lineHeight: 1 }}>{wallet?.balance?.toFixed(2) || '0.00'}</span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>USDT</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'إجمالي الإيداع', value: `${wallet?.totalDeposited?.toFixed(2) || '0.00'} USDT`, color: '#00e5a0' },
            { label: 'إجمالي السحب',   value: `${wallet?.totalWithdrawn?.toFixed(2) || '0.00'} USDT`, color: '#f85149' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '11px 14px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowWithdraw(true)} disabled={!wallet?.isActive || wallet?.balance <= 0}
          style={{ width: '100%', padding: 12, background: wallet?.balance > 0 ? 'linear-gradient(135deg,#009fc0,#006e9e)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, color: wallet?.balance > 0 ? '#fff' : 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 700, cursor: wallet?.balance > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
          سحب USDT ↑
        </button>
        {!wallet?.isActive && <div style={{ marginTop: 10, textAlign: 'center', fontSize: '0.78rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>⚠️ المحفظة معطلة — تواصل مع الدعم</div>}
      </div>

      {/* كارد N1 Credit */}
      <div style={{ background: 'linear-gradient(135deg,rgba(0,210,255,0.06),rgba(124,92,252,0.06))', border: '1px solid rgba(0,210,255,0.18)', borderRadius: 20, padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--cyan),var(--purple))' }} />
        <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6, letterSpacing: 2 }}>N1 CREDIT BALANCE</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--cyan)', fontFamily: "'Orbitron',sans-serif", lineHeight: 1, textShadow: '0 0 20px rgba(0,210,255,0.35)' }}>{wallet?.n1Balance?.toFixed(2) || '0.00'}</span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>N1</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'إجمالي الإيداع N1', value: wallet?.totalN1Deposited?.toFixed(2) || '0.00', color: 'var(--cyan)'   },
            { label: 'إجمالي السحب N1',   value: wallet?.totalN1Withdrawn?.toFixed(2)  || '0.00', color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '11px 14px' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowDeposit(true)}
          style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,var(--cyan),var(--purple))', border: 'none', borderRadius: 12, color: '#000', fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 18px rgba(0,210,255,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(0,210,255,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,210,255,0.2)' }}>
          إيداع N1 Credit ↓
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-1)' }}>
          {[{ id: 'deposits', label: 'طلبات الإيداع N1' }, { id: 'transactions', label: 'معاملات USDT' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '13px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'deposits' && (
          deposits.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>📭</div>
              <div style={{ color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem' }}>لا يوجد طلبات إيداع حتى الآن</div>
              <div style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.78rem', marginTop: 4 }}>اضغط "إيداع N1 Credit" لإنشاء أول طلب</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                    {['النوع', 'المبلغ', 'العملة', 'الحالة', 'التاريخ'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d, i) => (
                    <tr key={d._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontFamily: "'Tajawal',sans-serif" }}>{d.type === 'bank_transfer' ? '🏦 بنكي' : '₮ USDT'}</td>
                      <td style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)' }}>{Number(d.amount).toFixed(2)}</td>
                      <td style={{ padding: '12px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: 'var(--text-3)' }}>{d.currency}</td>
                      <td style={{ padding: '12px 14px' }}><StatusBadge status={d.status} /></td>
                      <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: 'var(--text-3)', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono',monospace" }}>
                        {new Date(d.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
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
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: cfg.color, fontFamily: "'JetBrains Mono',monospace" }}>{tx.type === 'deposit' ? '+' : '-'}{tx.amount} USDT</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>→ {tx.balanceAfter?.toFixed(2)} USDT</div>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>

      <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} onSuccess={handleDepositSuccess} />

      {showWithdraw && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowWithdraw(false)}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontFamily: "'Tajawal',sans-serif", color: 'var(--text-1)', fontSize: '1.1rem' }}>سحب USDT</h3>
            {withdrawSuccess ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>✅</div>
                <div style={{ color: '#00e5a0', fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>تم السحب بنجاح!</div>
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>الرصيد المتاح: </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>{wallet?.balance?.toFixed(2)} USDT</span>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>المبلغ (USDT)</label>
                  <input type="number" min="0.01" max={wallet?.balance} step="0.01" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00"
                    style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem', outline: 'none', boxSizing: 'border-box', direction: 'ltr' }}
                    onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border-1)'} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>ملاحظة (اختياري)</label>
                  <input type="text" value={withdrawNote} onChange={e => setWithdrawNote(e.target.value)} placeholder="سبب السحب..."
                    style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {withdrawError && <div style={{ color: '#f85149', fontSize: '0.82rem', fontFamily: "'Tajawal',sans-serif", marginBottom: 12, textAlign: 'center' }}>{withdrawError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowWithdraw(false)} style={{ flex: 1, padding: 12, background: 'none', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", cursor: 'pointer' }}>إلغاء</button>
                  <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet?.balance}
                    style={{ flex: 2, padding: 12, background: 'linear-gradient(135deg,#f85149,#c0392b)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontWeight: 700, cursor: 'pointer', opacity: withdrawing ? 0.7 : 1 }}>
                    {withdrawing ? '⏳ جاري السحب...' : `سحب ${withdrawAmount || '0'} USDT`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}