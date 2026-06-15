// ============================================
// src/pages/admin/AdminWallets.jsx
// إدارة المحافظ + طلبات الإيداع — مدمجة في صفحة واحدة
// ============================================
import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { walletAPI, adminAPI } from '../../services/api'
import { CRYPTO_PRESETS, uid } from '../../components/admin/adminConstants'

const API      = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'
const getToken = () => localStorage.getItem('n1_token')

const newNet = (s = {}) => ({
  id: uid(),
  coin:    s.coin    || 'USDT',
  network: s.network || 'TRC20',
  label:   s.label   || `${s.coin || 'USDT'} ${s.network || 'TRC20'}`,
  icon:    s.icon    || '₮',
  color:   s.color   || '#26a17b',
  address: '',
  enabled: true,
})

// ═══════════════════════════════════════════════
// StatusBadge
// ═══════════════════════════════════════════════
function StatusBadge({ status, size = 'sm' }) {
  const map = {
    pending:  { ar: 'قيد المراجعة', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    approved: { ar: 'موافق عليه',   color: '#00e5a0', bg: 'rgba(0,229,160,0.10)'  },
    rejected: { ar: 'مرفوض',        color: '#f85149', bg: 'rgba(248,81,73,0.10)'   },
    active:   { ar: 'نشطة',         color: '#00e5a0', bg: 'rgba(0,229,160,0.10)'  },
    inactive: { ar: 'معطلة',        color: '#f85149', bg: 'rgba(248,81,73,0.10)'   },
  }
  const s = map[status] || map.pending
  const fontSize = size === 'lg' ? '0.78rem' : '0.68rem'
  const padding  = size === 'lg' ? '4px 14px' : '3px 10px'
  return (
    <span style={{
      fontSize, fontWeight: 700, padding,
      borderRadius: 20, background: s.bg, color: s.color,
      fontFamily: "'Tajawal',sans-serif",
      border: `1px solid ${s.color}25`, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 4
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {s.ar}
    </span>
  )
}

// ═══════════════════════════════════════════════
// StatCard
// ═══════════════════════════════════════════════
function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border-1)',
      borderRadius: 16, padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}12`, border: `1px solid ${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color, fontFamily: "'Orbitron','JetBrains Mono',monospace", lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 3, fontFamily: "'Tajawal',sans-serif" }}>{label}</div>
          {subtitle && <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// DepositDetailModal
// ═══════════════════════════════════════════════
function DepositDetailModal({ deposit, onClose, onApprove, onReject }) {
  const [rejectMode, setRejectMode] = useState(false)
  const [reason,     setReason]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  if (!deposit) return null
  const isPending = deposit.status === 'pending'

  const handleApprove = async () => {
    setLoading(true); setError('')
    try { await onApprove(deposit._id); onClose() }
    catch (err) { setError(err.message || 'حدث خطأ') }
    finally { setLoading(false) }
  }

  const handleReject = async () => {
    if (!reason.trim()) return setError('يرجى إدخال سبب الرفض')
    setLoading(true); setError('')
    try { await onReject(deposit._id, reason); onClose() }
    catch (err) { setError(err.message || 'حدث خطأ') }
    finally { setLoading(false) }
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border-2)',
        borderRadius: 22, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif" }}>تفاصيل طلب الإيداع</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{deposit._id}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--cyan-dim)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>بيانات المستخدم</div>
            {[
              { label: 'الاسم',   value: deposit.user?.name  || '—' },
              { label: 'الإيميل', value: deposit.user?.email || '—' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: 5 }}>
                <span style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>{row.label}</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--row-bg)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>تفاصيل الطلب</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-3)' }}>المبلغ</span>
                <span style={{ color: '#26a17b', fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem' }}>{Number(deposit.amount).toFixed(2)} USDT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-3)' }}>الحالة</span>
                <StatusBadge status={deposit.status} size="lg" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-3)' }}>التاريخ</span>
                <span style={{ color: 'var(--text-2)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem' }}>{new Date(deposit.createdAt).toLocaleString('ar-EG')}</span>
              </div>

              {deposit.txid && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>TXID</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: '#26a17b',
                    wordBreak: 'break-all', background: 'rgba(38,161,123,0.06)', padding: '8px 12px',
                    borderRadius: 8, border: '1px solid rgba(38,161,123,0.15)'
                  }}>{deposit.txid}</div>
                  <a href={`https://tronscan.org/#/transaction/${deposit.txid}`} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.65rem', color: 'var(--cyan)', textDecoration: 'none', fontFamily: "'JetBrains Mono',monospace" }}>
                    🔗 تحقق على TronScan
                  </a>
                </div>
              )}

              {deposit.rejectionReason && (
                <div style={{ marginTop: 4, padding: '10px 12px', background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.15)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.65rem', color: '#f85149', marginBottom: 3, fontWeight: 700 }}>سبب الرفض</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif" }}>{deposit.rejectionReason}</div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.06)', border: '1px solid rgba(248,81,73,0.15)', borderRadius: 10, fontSize: '0.82rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>
              ⚠️ {error}
            </div>
          )}

          {isPending && !rejectMode && (
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={handleApprove} disabled={loading}
                style={{ flex: 1, padding: '12px 0', background: 'linear-gradient(135deg,#00c97a,#009960)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: '0.92rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳...' : '✅ موافقة وإضافة الرصيد'}
              </button>
              <button onClick={() => setRejectMode(true)} disabled={loading}
                style={{ flex: 1, padding: '12px 0', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: 12, color: '#f85149', fontFamily: "'Tajawal',sans-serif", fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>
                ❌ رفض الطلب
              </button>
            </div>
          )}

          {isPending && rejectMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
                سبب الرفض <span style={{ color: '#f85149' }}>*</span>
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="اكتب سبب الرفض للمستخدم..." rows={3}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--row-bg)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box', direction: 'rtl' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setRejectMode(false); setReason(''); setError('') }}
                  style={{ flex: 1, padding: 11, background: 'none', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", cursor: 'pointer' }}>
                  إلغاء
                </button>
                <button onClick={handleReject} disabled={loading || !reason.trim()}
                  style={{ flex: 2, padding: 11, background: 'linear-gradient(135deg,#f85149,#c0392b)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '⏳...' : 'تأكيد الرفض'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// WalletActionModal
// ═══════════════════════════════════════════════
function WalletActionModal({ wallet, mode, onClose, onDone }) {
  const [amount,     setAmount]     = useState('')
  const [adjustType, setAdjustType] = useState('add')
  const [note,       setNote]       = useState('')
  const [loading,    setLoading]    = useState(false)
  const [msg,        setMsg]        = useState(null)

  if (!wallet) return null

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true); setMsg(null)
    try {
      await walletAPI.adminDeposit(wallet.user._id, { amount: parseFloat(amount), note: note || 'Admin deposit' })
      setMsg({ type: 'success', text: `تم إيداع ${amount} USDT بنجاح ✅` })
      setAmount(''); setNote('')
      onDone()
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'فشل الإيداع' })
    } finally { setLoading(false) }
  }

  const handleAdjust = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true); setMsg(null)
    try {
      const finalAmount = adjustType === 'subtract' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount))
      const res = await fetch(`${API}/api/admin/wallets/${wallet.user._id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ amount: finalAmount, note: note || `Admin adjust: ${finalAmount > 0 ? '+' : ''}${finalAmount}` })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setMsg({ type: 'success', text: `تم التعديل — الرصيد الجديد: ${data.balance?.toFixed(2)} USDT ✅` })
      setAmount(''); setNote('')
      onDone()
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'فشل التعديل' })
    } finally { setLoading(false) }
  }

  const isDeposit = mode === 'deposit'

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 18, padding: 24, width: '100%', maxWidth: 420, position: 'relative' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isDeposit ? 'linear-gradient(90deg,transparent,#00e5a0,transparent)' : 'linear-gradient(90deg,transparent,#f59e0b,transparent)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif" }}>
              {isDeposit ? '➕ إيداع USDT' : '✎ تعديل الرصيد'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
              {wallet.user?.name} — {wallet.user?.email}
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16, background: 'var(--cyan-dim)', border: '1px solid var(--border-2)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>الرصيد الحالي: </span>
          <span style={{ fontWeight: 800, color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", fontSize: '1.15rem' }}>{wallet.balance?.toFixed(2)} USDT</span>
        </div>

        {!isDeposit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { id: 'add',      label: '+ إضافة', color: '#00e5a0', bg: 'rgba(0,229,160,0.08)' },
              { id: 'subtract', label: '- خصم',   color: '#f85149', bg: 'rgba(248,81,73,0.08)' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setAdjustType(opt.id)} style={{
                padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', fontWeight: 700,
                border: adjustType === opt.id ? `1px solid ${opt.color}` : '1px solid var(--border-1)',
                background: adjustType === opt.id ? opt.bg : 'var(--row-bg)',
                color: adjustType === opt.id ? opt.color : 'var(--text-3)',
                transition: 'all 0.2s'
              }}>{opt.label}</button>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>المبلغ (USDT)</label>
          <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            style={{ width: '100%', padding: '11px 14px', background: 'var(--row-bg)', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '1rem', outline: 'none', boxSizing: 'border-box', direction: 'ltr' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>ملاحظة (اختياري)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder={isDeposit ? 'سبب الإيداع...' : 'سبب التعديل...'}
            style={{ width: '100%', padding: '11px 14px', background: 'var(--row-bg)', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', direction: 'rtl' }} />
        </div>

        {msg && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: msg.type === 'success' ? 'rgba(0,229,160,0.08)' : 'rgba(248,81,73,0.08)', color: msg.type === 'success' ? '#00e5a0' : '#f85149', fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', textAlign: 'center', border: `1px solid ${msg.type === 'success' ? 'rgba(0,229,160,0.2)' : 'rgba(248,81,73,0.2)'}` }}>
            {msg.text}
          </div>
        )}

        <button
          onClick={isDeposit ? handleDeposit : handleAdjust}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          style={{
            width: '100%', padding: 13, border: 'none', borderRadius: 12,
            fontFamily: "'Tajawal',sans-serif", fontWeight: 800, fontSize: '0.95rem',
            cursor: loading || !amount ? 'not-allowed' : 'pointer',
            opacity: loading || !amount ? 0.6 : 1,
            background: isDeposit
              ? 'linear-gradient(135deg,#059669,#047857)'
              : adjustType === 'add' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#f85149,#c0392b)',
            color: '#fff', transition: 'opacity 0.2s'
          }}
        >
          {loading ? '⏳ جاري التنفيذ...'
            : isDeposit ? `إيداع ${amount || '0'} USDT`
            : adjustType === 'add' ? `إضافة ${amount || '0'} USDT` : `خصم ${amount || '0'} USDT`}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--card)', border: '1px solid var(--border-2)',
      borderRadius: 14, padding: '12px 24px', zIndex: 600,
      fontSize: '0.88rem', color: 'var(--text-1)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      fontFamily: "'Tajawal',sans-serif", fontWeight: 700,
      animation: 'slideDown 0.3s ease'
    }}>{message}</div>
  )
}

// ═══════════════════════════════════════════════
// NetEditModal
// ═══════════════════════════════════════════════
function NetEditModal({ net, onSave, onClose }) {
  const [form, setForm] = useState({ ...net })
  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))
  const COLOR_OPTS = ['#26a17b','#f0b90b','#627eea','#f7931a','#ff060a','#2775ca','#00d4ff','#7c3aed']

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.80)', backdropFilter:'blur(8px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border-2)', borderRadius:22, width:'100%', maxWidth:480, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${form.color},transparent)` }} />

        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${form.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', fontWeight:900, color:form.color }}>
              {form.icon}
            </div>
            <span style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif" }}>
              {net.address ? 'تعديل شبكة الإيداع' : 'إضافة شبكة إيداع جديدة'}
            </span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>

        <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10 }}>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:1 }}>اسم الشبكة (يظهر للمستخدم)</label>
              <input value={form.label} onChange={e => set('label', e.target.value)}
                placeholder="مثال: USDT TRC20"
                style={{ width:'100%', padding:'10px 12px', background:'var(--row-bg)', border:`1px solid ${form.color}40`, borderRadius:10, color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:1 }}>رمز</label>
              <input value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={2}
                style={{ width:52, padding:'10px 0', background:'var(--row-bg)', border:`1px solid ${form.color}40`, borderRadius:10, color:form.color, fontSize:'1.2rem', textAlign:'center', outline:'none' }} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:1 }}>العملة</label>
              <input value={form.coin} onChange={e => set('coin', e.target.value)}
                placeholder="USDT"
                style={{ width:'100%', padding:'10px 12px', background:'var(--row-bg)', border:'1px solid var(--border-1)', borderRadius:10, color:'var(--text-1)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:1 }}>الشبكة</label>
              <input value={form.network} onChange={e => set('network', e.target.value)}
                placeholder="TRC20"
                style={{ width:'100%', padding:'10px 12px', background:'var(--row-bg)', border:'1px solid var(--border-1)', borderRadius:10, color:'var(--text-1)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:1 }}>عنوان المحفظة (Address)</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="أدخل عنوان المحفظة كاملاً..."
              style={{ width:'100%', padding:'10px 12px', background:'var(--row-bg)', border:`1px solid ${form.address ? form.color+'40' : 'var(--border-1)'}`, borderRadius:10, color:form.color, fontFamily:"'JetBrains Mono',monospace", fontSize:'0.75rem', outline:'none', boxSizing:'border-box', direction:'ltr', letterSpacing:0.5 }} />
            {!form.address && (
              <div style={{ marginTop:5, fontSize:'0.65rem', color:'#f59e0b', fontFamily:"'Tajawal',sans-serif" }}>
                ⚠️ العنوان مطلوب لتفعيل هذه الشبكة
              </div>
            )}
          </div>

          <div>
            <label style={{ display:'block', fontSize:'0.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:8, letterSpacing:1 }}>اللون</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLOR_OPTS.map(c => (
                <button key={c} onClick={() => set('color', c)}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, border: form.color===c ? '3px solid var(--text-1)' : '2px solid transparent', cursor:'pointer', transition:'all 0.15s' }} />
              ))}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--row-bg)', borderRadius:10, border:'1px solid var(--border-1)' }}>
            <span style={{ fontSize:'0.85rem', color:'var(--text-2)', fontFamily:"'Tajawal',sans-serif" }}>تفعيل هذه الشبكة</span>
            <button onClick={() => set('enabled', !form.enabled)}
              style={{ width:42, height:22, borderRadius:11, border:'none', cursor:'pointer', position:'relative', background: form.enabled ? form.color : 'var(--border-1)', transition:'all 0.25s', flexShrink: 0 }}>
              <div style={{ position:'absolute', top:2, left: form.enabled ? 22 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.4)' }} />
            </button>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:11, background:'none', border:'1px solid var(--border-1)', borderRadius:10, color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", cursor:'pointer', fontSize:'0.88rem' }}>
              إلغاء
            </button>
            <button onClick={() => onSave(form)} disabled={!form.label || !form.address}
              style={{ flex:2, padding:11, background: form.label && form.address ? `linear-gradient(135deg,${form.color},${form.color}bb)` : 'var(--border-1)', border:'none', borderRadius:10, color: form.label && form.address ? '#fff' : 'var(--text-3)', fontFamily:"'Tajawal',sans-serif", fontWeight:800, cursor: form.label && form.address ? 'pointer' : 'not-allowed', fontSize:'0.88rem', transition:'all 0.2s' }}>
              {net.address ? '✓ حفظ التعديلات' : '+ إضافة الشبكة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// MAIN: AdminWallets
// ═══════════════════════════════════════════════
export default function AdminWallets() {
  const [activeTab, setActiveTab] = useState('wallets')

  const [wallets,      setWallets]      = useState([])
  const [walletsLoad,  setWalletsLoad]  = useState(true)
  const [walletModal,  setWalletModal]  = useState(null)
  const [searchWallet, setSearchWallet] = useState('')

  const [deposits,       setDeposits]       = useState([])
  const [depositsLoad,   setDepositsLoad]   = useState(true)
  const [depositFilter,  setDepositFilter]  = useState('pending')
  const [selectedDeposit,setSelectedDeposit]= useState(null)
  const [depositStats,   setDepositStats]   = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })

  const [toast, setToast] = useState('')

  const [depositNets,  setDepositNets]  = useState([])
  const [netsLoad,     setNetsLoad]     = useState(false)
  const [netsSaving,   setNetsSaving]   = useState(false)
  const [netsSaved,    setNetsSaved]    = useState(false)
  const [editNet,      setEditNet]      = useState(null)
  const [showPresets,  setShowPresets]  = useState(false)

  const fetchWallets = useCallback(async () => {
    setWalletsLoad(true)
    try {
      const { data } = await walletAPI.getAllWallets()
      setWallets(data.wallets || [])
    } catch (err) { console.error(err) }
    finally { setWalletsLoad(false) }
  }, [])

  const fetchDeposits = useCallback(async (status) => {
    setDepositsLoad(true)
    try {
      const s = status || depositFilter
      const query = s === 'all' ? '' : `?status=${s}`
      const res   = await fetch(`${API}/api/admin/deposits${query}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data  = await res.json()
      if (data.success) setDeposits(data.deposits || [])
    } catch (err) { console.error(err) }
    finally { setDepositsLoad(false) }
  }, [depositFilter])

  const fetchDepositStats = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [p, a, r, all] = await Promise.all([
        fetch(`${API}/api/admin/deposits?status=pending`,  { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/deposits?status=approved`, { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/deposits?status=rejected`, { headers }).then(r => r.json()),
        fetch(`${API}/api/admin/deposits`,                 { headers }).then(r => r.json()),
      ])
      setDepositStats({
        pending:  p.pagination?.total || 0,
        approved: a.pagination?.total || 0,
        rejected: r.pagination?.total || 0,
        total:    all.pagination?.total || 0,
      })
    } catch {}
  }, [])

  const fetchDepositNets = async () => {
    setNetsLoad(true)
    try {
      const { data } = await adminAPI.getWalletDepositAddresses()
      setDepositNets(data.cryptos || [])
    } catch { setDepositNets([]) }
    finally { setNetsLoad(false) }
  }

  const saveDepositNets = async () => {
    setNetsSaving(true)
    try {
      await adminAPI.saveWalletDepositAddresses({ cryptos: depositNets })
      setNetsSaved(true)
      setToast('✅ تم حفظ عناوين الإيداع بنجاح')
      setTimeout(() => setNetsSaved(false), 3000)
    } catch {
      setToast('❌ فشل حفظ العناوين، تحقق من الاتصال')
    } finally { setNetsSaving(false) }
  }

  const updateNet  = (id, field, val) => setDepositNets(p => p.map(n => n.id === id ? { ...n, [field]: val } : n))
  const removeNet  = (id) => setDepositNets(p => p.filter(n => n.id !== id))
  const toggleNet  = (id) => updateNet(id, 'enabled', !depositNets.find(n => n.id === id)?.enabled)
  const addNet     = (preset = {}) => { setDepositNets(p => [...p, newNet(preset)]); setShowPresets(false) }
  const saveNetEdit = (updated) => { setDepositNets(p => p.map(n => n.id === updated.id ? updated : n)); setEditNet(null) }

  useEffect(() => { fetchWallets(); fetchDeposits(); fetchDepositStats(); fetchDepositNets() }, [])
  useEffect(() => { fetchDeposits(depositFilter) }, [depositFilter])

  const handleApproveDeposit = async (id) => {
    const res  = await fetch(`${API}/api/admin/deposits/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    setToast(`✅ تمت الموافقة — تم إضافة ${data.balance?.toFixed(2) || ''} USDT`)
    fetchDeposits(); fetchDepositStats(); fetchWallets()
  }

  const handleRejectDeposit = async (id, reason) => {
    const res  = await fetch(`${API}/api/admin/deposits/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ reason })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    setToast('❌ تم رفض الطلب')
    fetchDeposits(); fetchDepositStats()
  }

  const handleToggleWallet = async (userId) => {
    try {
      await walletAPI.toggleWallet(userId)
      await fetchWallets()
    } catch (err) { console.error(err) }
  }

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0)
  const activeWallets = wallets.filter(w => w.isActive).length
  const filteredWallets = wallets.filter(w => {
    if (!searchWallet) return true
    const q = searchWallet.toLowerCase()
    return (w.user?.name || '').toLowerCase().includes(q) || (w.user?.email || '').toLowerCase().includes(q)
  })

  const DEPOSIT_FILTERS = [
    { id: 'pending',  label: 'معلقة',  color: '#f59e0b', count: depositStats.pending  },
    { id: 'approved', label: 'مكتملة', color: '#00e5a0', count: depositStats.approved },
    { id: 'rejected', label: 'مرفوضة', color: '#f85149', count: depositStats.rejected },
    { id: 'all',      label: 'الكل',   color: 'var(--text-3)', count: depositStats.total },
  ]

  const TABS = [
    { id: 'wallets',   label: 'المحافظ',        icon: '💰', count: wallets.length },
    { id: 'deposits',  label: 'طلبات الإيداع',  icon: '📥', count: depositStats.pending },
    { id: 'addresses', label: 'عناوين الإيداع', icon: '🔗', count: depositNets.filter(n => n.enabled && n.address).length },
  ]

  return (
    <AdminLayout>
    <div style={{ direction: 'rtl', fontFamily: "'Tajawal',sans-serif" }}>

      <Toast message={toast} onClose={() => setToast('')} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 4px', fontFamily: "'Tajawal',sans-serif" }}>
          💼 إدارة المحافظ والإيداعات
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', margin: 0 }}>
          إدارة محافظ المستخدمين، مراجعة طلبات الإيداع، وتعديل الأرصدة
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard icon="💰" label="إجمالي الأرصدة" value={`${totalBalance.toFixed(2)}`} color="#00d4ff" subtitle="USDT" />
        <StatCard icon="👥" label="محافظ نشطة" value={activeWallets} color="#00e5a0" subtitle={`من ${wallets.length}`} />
        <StatCard icon="⏳" label="طلبات معلقة" value={depositStats.pending} color="#f59e0b" subtitle="بانتظار المراجعة" />
        <StatCard icon="✅" label="إيداعات مكتملة" value={depositStats.approved} color="#00e5a0" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-1)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', cursor: 'pointer',
              fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', fontWeight: 700,
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-3)',
              transition: 'all 0.2s', position: 'relative', bottom: -1,
            }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 800,
                padding: '2px 7px', borderRadius: 10,
                background: activeTab === tab.id ? 'var(--cyan-dim)' : 'var(--row-bg)',
                color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-3)',
                fontFamily: "'JetBrains Mono',monospace"
              }}>{tab.count}</span>
            )}
          </button>
        ))}

        <button onClick={() => { fetchWallets(); fetchDeposits(); fetchDepositStats() }}
          style={{
            marginRight: 'auto', padding: '8px 14px', border: '1px solid var(--border-1)',
            borderRadius: 8, background: 'transparent', color: 'var(--text-3)',
            cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: "'Tajawal',sans-serif", transition: 'all 0.15s', marginBottom: 4
          }}>
          🔄 تحديث
        </button>
      </div>

      {/* TAB 1: المحافظ */}
      {activeTab === 'wallets' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text" value={searchWallet} onChange={e => setSearchWallet(e.target.value)}
              placeholder="🔍 بحث بالاسم أو الإيميل..."
              style={{
                width: '100%', maxWidth: 360, padding: '10px 16px',
                background: 'var(--row-bg)', border: '1px solid var(--border-1)',
                borderRadius: 10, color: 'var(--text-1)',
                fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
                outline: 'none', boxSizing: 'border-box', direction: 'rtl'
              }}
            />
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 16, overflow: 'hidden' }}>
            {walletsLoad ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border-1)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                جاري التحميل...
              </div>
            ) : filteredWallets.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <div style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>
                  {searchWallet ? 'لا توجد نتائج' : 'لا يوجد محافظ'}
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--row-bg)' }}>
                      {['المستخدم', 'الرصيد (USDT)', 'إجمالي الإيداع', 'إجمالي السحب', 'الحالة', 'إجراء'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWallets.map((w, i) => (
                      <tr key={w._id}
                        style={{ borderBottom: '1px solid var(--border-1)', background: i % 2 === 0 ? 'transparent' : 'var(--row-bg)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cyan-dim)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--row-bg)'}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
                            }}>{(w.user?.name || 'U')[0].toUpperCase()}</div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>{w.user?.name || '—'}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{w.user?.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '0.95rem' }}>
                            {w.balance?.toFixed(2)}
                          </span>
                          <span style={{ color: 'var(--text-3)', fontSize: '0.65rem', marginRight: 4 }}> USDT</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', color: '#00e5a0' }}>
                          {w.totalDeposited?.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.82rem', color: '#f85149' }}>
                          {w.totalWithdrawn?.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={w.isActive ? 'active' : 'inactive'} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <ActionBtn color="#00e5a0" bg="rgba(0,229,160,0.08)" title="إيداع" icon="+"
                              onClick={() => setWalletModal({ wallet: w, mode: 'deposit' })} />
                            <ActionBtn color="#f59e0b" bg="rgba(245,158,11,0.08)" title="تعديل" icon="✎"
                              onClick={() => setWalletModal({ wallet: w, mode: 'adjust' })} />
                            <ActionBtn
                              color={w.isActive ? '#f85149' : '#00e5a0'}
                              bg={w.isActive ? 'rgba(248,81,73,0.08)' : 'rgba(0,229,160,0.08)'}
                              title={w.isActive ? 'تعطيل' : 'تفعيل'}
                              icon={w.isActive ? '🔒' : '🔓'}
                              onClick={() => handleToggleWallet(w.user._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: طلبات الإيداع */}
      {activeTab === 'deposits' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {DEPOSIT_FILTERS.map(f => (
              <button key={f.id} onClick={() => setDepositFilter(f.id)}
                style={{
                  padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
                  fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', fontWeight: 700,
                  border: depositFilter === f.id ? `1px solid ${f.color}` : '1px solid var(--border-1)',
                  background: depositFilter === f.id ? `${f.color}12` : 'transparent',
                  color: depositFilter === f.id ? f.color : 'var(--text-3)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                }}>
                {f.label}
                {f.count > 0 && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 800,
                    padding: '1px 6px', borderRadius: 8,
                    background: depositFilter === f.id ? `${f.color}20` : 'var(--row-bg)',
                    color: depositFilter === f.id ? f.color : 'var(--text-3)',
                    fontFamily: "'JetBrains Mono',monospace"
                  }}>{f.count}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 16, overflow: 'hidden' }}>
            {depositsLoad ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border-1)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                جاري التحميل...
              </div>
            ) : deposits.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <div style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>لا يوجد طلبات في هذا القسم</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--row-bg)' }}>
                      {['المستخدم', 'المبلغ', 'TXID', 'الحالة', 'التاريخ', 'إجراء'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((d, i) => (
                      <tr key={d._id}
                        style={{ borderBottom: '1px solid var(--border-1)', background: i % 2 === 0 ? 'transparent' : 'var(--row-bg)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cyan-dim)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--row-bg)'}
                        onClick={() => setSelectedDeposit(d)}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
                            }}>{(d.user?.name || 'U')[0].toUpperCase()}</div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>{d.user?.name || '—'}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{d.user?.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.92rem', fontWeight: 800, color: '#26a17b' }}>
                          {Number(d.amount).toFixed(2)} <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>USDT</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--text-3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.txid || '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}><StatusBadge status={d.status} /></td>
                        <td style={{ padding: '12px 16px', fontSize: '0.7rem', color: 'var(--text-3)', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono',monospace" }}>
                          {new Date(d.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelectedDeposit(d)}
                            style={{
                              padding: '6px 16px',
                              background: d.status === 'pending' ? 'rgba(0,229,160,0.08)' : 'transparent',
                              border: `1px solid ${d.status === 'pending' ? 'rgba(0,229,160,0.2)' : 'var(--border-1)'}`,
                              borderRadius: 8,
                              color: d.status === 'pending' ? '#00e5a0' : 'var(--text-3)',
                              fontFamily: "'Tajawal',sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                            }}>
                            {d.status === 'pending' ? '⚡ مراجعة' : 'عرض'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: عناوين الإيداع */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div>
              <h3 style={{ margin:'0 0 4px', fontSize:'1rem', fontWeight:800, color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif" }}>
                🔗 عناوين استلام الإيداع
              </h3>
              <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif" }}>
                هذه الشبكات ستظهر للمستخدم عند ضغطه على "إيداع" في محفظته
              </p>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ position:'relative' }}>
                <button onClick={() => setShowPresets(v => !v)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', background:'var(--cyan-dim)', border:'1px solid var(--border-2)', borderRadius:10, color:'var(--cyan)', fontFamily:"'Tajawal',sans-serif", fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
                  + إضافة شبكة
                </button>
                {showPresets && (
                  <>
                    <div onClick={() => setShowPresets(false)} style={{ position:'fixed', inset:0, zIndex:50 }} />
                    <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:51, background:'var(--card)', border:'1px solid var(--border-2)', borderRadius:14, overflow:'hidden', minWidth:200, boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
                      {CRYPTO_PRESETS.map(p => (
                        <button key={p.label} onClick={() => { addNet(p); setEditNet(newNet(p)) }}
                          style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', gap:10, textAlign:'right', transition:'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--row-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background='none'}>
                          <span style={{ fontSize:'1rem', color:p.color, fontWeight:900 }}>{p.icon}</span>
                          <div>
                            <div style={{ fontSize:'0.85rem', fontWeight:700, fontFamily:"'Tajawal',sans-serif" }}>{p.label}</div>
                            <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{p.network}</div>
                          </div>
                        </button>
                      ))}
                      <button onClick={() => { addNet(); setShowPresets(false) }}
                        style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontFamily:"'Tajawal',sans-serif", fontSize:'0.82rem' }}>
                        ✚ شبكة مخصصة
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button onClick={saveDepositNets} disabled={netsSaving}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 20px', background: netsSaved ? 'rgba(0,229,160,0.12)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: netsSaved ? '1px solid rgba(0,229,160,0.3)' : 'none', borderRadius:10, color: netsSaved ? '#00e5a0' : '#fff', fontFamily:"'Tajawal',sans-serif", fontWeight:700, fontSize:'0.85rem', cursor: netsSaving ? 'not-allowed' : 'pointer', opacity: netsSaving ? 0.7 : 1 }}>
                {netsSaving ? '⏳ جاري الحفظ...' : netsSaved ? '✓ تم الحفظ' : '💾 حفظ التغييرات'}
              </button>
            </div>
          </div>

          <div style={{ padding:'12px 16px', background:'var(--cyan-dim)', border:'1px solid var(--border-2)', borderRadius:12, marginBottom:20, display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:'1rem', flexShrink:0 }}>💡</span>
            <div style={{ fontSize:'0.8rem', color:'var(--text-2)', fontFamily:"'Tajawal',sans-serif", lineHeight:1.7 }}>
              <strong style={{ color:'var(--cyan)' }}>كيف يعمل:</strong> الشبكات المفعّلة ستظهر للمستخدم في نافذة الإيداع — سيختار الشبكة ثم يرسل على العنوان ويدخل رقم المعاملة (TXID) للمراجعة.
            </div>
          </div>

          {netsLoad ? (
            <div style={{ padding:'60px 0', textAlign:'center', color:'var(--text-3)' }}>
              <div style={{ width:32, height:32, border:'3px solid var(--border-1)', borderTopColor:'var(--cyan)', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
              جاري التحميل...
            </div>
          ) : depositNets.length === 0 ? (
            <div style={{ padding:'60px 20px', textAlign:'center', background:'var(--card)', border:'1px dashed var(--border-2)', borderRadius:16 }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🔗</div>
              <div style={{ color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', marginBottom:6 }}>لا توجد شبكات إيداع بعد</div>
              <div style={{ color:'var(--text-3)', fontSize:'0.78rem' }}>اضغط "+ إضافة شبكة" لإضافة أول عنوان استلام</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {depositNets.map((net, i) => (
                <div key={net.id || i} style={{ background:'var(--card)', border:`1px solid ${net.enabled && net.address ? net.color+'30' : 'var(--border-1)'}`, borderRadius:14, overflow:'hidden', transition:'all 0.2s' }}>
                  {net.enabled && net.address && (
                    <div style={{ height:2, background:`linear-gradient(90deg,${net.color},transparent)` }} />
                  )}
                  <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${net.color}15`, border:`1px solid ${net.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', fontWeight:900, color:net.color, flexShrink:0 }}>
                      {net.icon}
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.92rem', fontWeight:800, color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif" }}>{net.label}</span>
                        <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${net.color}15`, color:net.color, border:`1px solid ${net.color}25`, fontFamily:"'JetBrains Mono',monospace" }}>{net.network}</span>
                        <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background: net.enabled && net.address ? 'rgba(0,229,160,0.1)' : 'rgba(248,81,73,0.08)', color: net.enabled && net.address ? '#00e5a0' : '#f85149', border:`1px solid ${net.enabled && net.address ? '#00e5a060' : '#f8514950'}` }}>
                          {net.enabled && net.address ? '● نشطة' : !net.address ? '⚠ بدون عنوان' : '○ معطلة'}
                        </span>
                      </div>
                      {net.address ? (
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.72rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:320, direction:'ltr' }}>
                          {net.address}
                        </div>
                      ) : (
                        <div style={{ fontSize:'0.72rem', color:'#f59e0b', fontFamily:"'Tajawal',sans-serif" }}>
                          ⚠️ يجب إضافة العنوان لتفعيل هذه الشبكة
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      {/* Toggle — الإصلاح النهائي */}
                      <button
                        onClick={() => toggleNet(net.id)}
                        title={net.enabled ? 'تعطيل' : 'تفعيل'}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none',
                          cursor: 'pointer', position: 'relative', flexShrink: 0,
                          background: net.enabled ? net.color : 'var(--border-1)',
                          transition: 'background 0.25s',
                          padding: 0,
                        }}>
                        <div style={{
                          position: 'absolute', top: 3,
                          left: net.enabled ? 23 : 3,
                          width: 18, height: 18, borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.25s',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                          pointerEvents: 'none',
                        }} />
                      </button>
                      <button onClick={() => setEditNet(net)}
                        style={{ padding:'6px 12px', background:'var(--cyan-dim)', border:'1px solid var(--border-2)', borderRadius:8, color:'var(--cyan)', cursor:'pointer', fontSize:'0.78rem', fontFamily:"'Tajawal',sans-serif", fontWeight:700 }}>
                        ✎ تعديل
                      </button>
                      <button onClick={() => { if (confirm('حذف هذه الشبكة؟')) removeNet(net.id) }}
                        style={{ padding:'6px 10px', background:'rgba(248,81,73,0.06)', border:'1px solid rgba(248,81,73,0.2)', borderRadius:8, color:'#f85149', cursor:'pointer', fontSize:'0.78rem' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {depositNets.length > 0 && (
            <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
              <button onClick={saveDepositNets} disabled={netsSaving}
                style={{ padding:'11px 28px', background: netsSaved ? 'rgba(0,229,160,0.12)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: netsSaved ? '1px solid rgba(0,229,160,0.3)' : 'none', borderRadius:12, color: netsSaved ? '#00e5a0' : '#fff', fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'0.92rem', cursor: netsSaving ? 'not-allowed' : 'pointer', opacity: netsSaving ? 0.7 : 1 }}>
                {netsSaving ? '⏳ جاري الحفظ...' : netsSaved ? '✓ تم الحفظ' : '💾 حفظ جميع التغييرات'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {walletModal && (
        <WalletActionModal
          wallet={walletModal.wallet}
          mode={walletModal.mode}
          onClose={() => setWalletModal(null)}
          onDone={fetchWallets}
        />
      )}

      {selectedDeposit && (
        <DepositDetailModal
          deposit={selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          onApprove={handleApproveDeposit}
          onReject={handleRejectDeposit}
        />
      )}

      {editNet && (
        <NetEditModal
          net={editNet}
          onSave={saveNetEdit}
          onClose={() => setEditNet(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
    </AdminLayout>
  )
}

// ═══════════════════════════════════════════════
// ActionBtn
// ═══════════════════════════════════════════════
function ActionBtn({ color, bg, title, icon, onClick }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        background: bg, border: `1px solid ${color}30`, color,
        borderRadius: 8, padding: '6px 10px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.15s',
        minWidth: 32, minHeight: 32, flexShrink: 0,
      }}>
      {icon}
    </button>
  )
}
