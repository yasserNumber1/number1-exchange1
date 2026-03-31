// ============================================
// src/pages/admin/AdminDeposits.jsx
// إدارة طلبات إيداع N1 Credit
// ============================================
import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = () => localStorage.getItem('n1_token')

// ─── بادج الحالة ─────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { ar: 'قيد المراجعة', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    approved: { ar: 'موافق عليه',   color: '#00e5a0', bg: 'rgba(0,229,160,0.12)'   },
    rejected: { ar: 'مرفوض',        color: '#f85149', bg: 'rgba(248,81,73,0.12)'   },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px',
      borderRadius: 20, background: s.bg, color: s.color,
      fontFamily: "'JetBrains Mono',monospace",
      border: `1px solid ${s.color}33`, whiteSpace: 'nowrap'
    }}>
      {s.ar}
    </span>
  )
}

// ─── مودال التفاصيل + الموافقة/الرفض ─────────
function DepositDetailModal({ deposit, onClose, onApprove, onReject }) {
  const [rejectMode,  setRejectMode]  = useState(false)
  const [reason,      setReason]      = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  if (!deposit) return null

  const isPending = deposit.status === 'pending'

  const handleApprove = async () => {
    setLoading(true); setError('')
    try {
      await onApprove(deposit._id)
      onClose()
    } catch (err) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) return setError('يرجى إدخال سبب الرفض')
    setLoading(true); setError('')
    try {
      await onReject(deposit._id, reason)
      onClose()
    } catch (err) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)', zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
    >
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border-2)',
        borderRadius: 22, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)'
      }}>
        {/* خط علوي */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)' }}>تفاصيل طلب الإيداع</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
              {deposit._id}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* بيانات المستخدم */}
          <div style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 10 }}>بيانات المستخدم</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'الاسم',         value: deposit.user?.name  || '—' },
                { label: 'الإيميل',       value: deposit.user?.email || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* تفاصيل الطلب */}
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 10 }}>تفاصيل الطلب</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'النوع',    value: deposit.type === 'bank_transfer' ? '🏦 تحويل بنكي' : '₮ USDT TRC20' },
                { label: 'المبلغ',   value: `${Number(deposit.amount).toFixed(2)} ${deposit.currency}` },
                { label: 'الحالة',   value: <StatusBadge status={deposit.status} /> },
                { label: 'التاريخ',  value: new Date(deposit.createdAt).toLocaleString('ar-EG') },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
                  <span style={{ color: 'var(--cyan)', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{row.value}</span>
                </div>
              ))}

              {/* TXID */}
              {deposit.txid && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: 4 }}>TXID</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', color: 'var(--text-2)', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-1)' }}>
                    {deposit.txid}
                  </div>
                </div>
              )}

              {/* سبب الرفض */}
              {deposit.rejectionReason && (
                <div style={{ marginTop: 4, padding: '10px 12px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.68rem', color: '#f85149', marginBottom: 3, fontWeight: 700 }}>سبب الرفض</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif" }}>{deposit.rejectionReason}</div>
                </div>
              )}
            </div>
          </div>

          {/* الإيصال */}
          {deposit.receiptUrl && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>إيصال التحويل</div>
              <a href={deposit.receiptUrl} target="_blank" rel="noreferrer">
                <img
                  src={deposit.receiptUrl} alt="receipt"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border-1)', cursor: 'pointer' }}
                />
              </a>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textAlign: 'center', marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>
                اضغط للعرض الكامل
              </div>
            </div>
          )}

          {/* خطأ */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, fontSize: '0.82rem', color: '#f85149', fontFamily: "'Tajawal',sans-serif" }}>
              ⚠️ {error}
            </div>
          )}

          {/* أزرار الموافقة/الرفض — فقط للطلبات المعلقة */}
          {isPending && !rejectMode && (
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={handleApprove} disabled={loading}
                style={{ flex: 1, padding: '13px 0', background: 'linear-gradient(135deg,#00c97a,#009960)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                {loading ? '⏳...' : '✅ موافقة وإضافة الرصيد'}
              </button>
              <button
                onClick={() => setRejectMode(true)} disabled={loading}
                style={{ flex: 1, padding: '13px 0', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 12, color: '#f85149', fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                ❌ رفض الطلب
              </button>
            </div>
          )}

          {/* نموذج الرفض */}
          {isPending && rejectMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
                سبب الرفض <span style={{ color: '#f85149' }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="اكتب سبب الرفض للمستخدم..."
                rows={3}
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box', direction: 'rtl' }}
                onFocus={e => e.target.style.borderColor = '#f85149'}
                onBlur={e  => e.target.style.borderColor = 'var(--border-1)'}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setRejectMode(false); setReason(''); setError('') }}
                  style={{ flex: 1, padding: 12, background: 'none', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", cursor: 'pointer' }}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReject} disabled={loading || !reason.trim()}
                  style={{ flex: 2, padding: 12, background: 'linear-gradient(135deg,#f85149,#c0392b)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: "'Tajawal',sans-serif", fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
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

// ─── الصفحة الرئيسية ──────────────────────────
export default function AdminDeposits() {
  const [deposits,  setDeposits]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('pending') // pending | approved | rejected | all
  const [selected,  setSelected]  = useState(null)
  const [toast,     setToast]     = useState('')
  const [stats,     setStats]     = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })

  // ─── جلب الطلبات ──────────────────────────
  const fetchDeposits = async (status = filter) => {
    setLoading(true)
    try {
      const query = status === 'all' ? '' : `?status=${status}`
      const res   = await fetch(`${API}/api/admin/deposits${query}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data  = await res.json()
      if (data.success) setDeposits(data.deposits || [])
    } catch (err) {
      console.error('Fetch deposits error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ─── جلب الإحصائيات ───────────────────────
  const fetchStats = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.all([
        fetch(`${API}/api/admin/deposits?status=pending`,  { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API}/api/admin/deposits?status=approved`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API}/api/admin/deposits?status=rejected`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API}/api/admin/deposits`,                 { headers: { Authorization: `Bearer ${getToken()}` } }),
      ])
      const [p, a, r, all] = await Promise.all([pendingRes.json(), approvedRes.json(), rejectedRes.json(), allRes.json()])
      setStats({
        pending:  p.pagination?.total  || 0,
        approved: a.pagination?.total  || 0,
        rejected: r.pagination?.total  || 0,
        total:    all.pagination?.total || 0,
      })
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchDeposits()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchDeposits(filter)
  }, [filter])

  // ─── موافقة ────────────────────────────────
  const handleApprove = async (id) => {
    const res  = await fetch(`${API}/api/admin/deposits/${id}/approve`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    showToast(`✅ تمت الموافقة — تم إضافة ${data.n1Balance?.toFixed(2) || ''} N1`)
    fetchDeposits(); fetchStats()
  }

  // ─── رفض ───────────────────────────────────
  const handleReject = async (id, reason) => {
    const res  = await fetch(`${API}/api/admin/deposits/${id}/reject`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body:    JSON.stringify({ reason })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    showToast('❌ تم رفض الطلب')
    fetchDeposits(); fetchStats()
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // ─── الفلاتر ───────────────────────────────
  const FILTERS = [
    { id: 'pending',  label: 'معلقة',    color: '#f59e0b' },
    { id: 'approved', label: 'موافق',    color: '#00e5a0' },
    { id: 'rejected', label: 'مرفوضة',   color: '#f85149' },
    { id: 'all',      label: 'الكل',     color: 'var(--text-3)' },
  ]

  return (
    <div style={{ padding: '28px 24px', direction: 'rtl', fontFamily: "'Tajawal',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--card)', border: '1px solid var(--border-2)',
          borderRadius: 12, padding: '12px 24px', zIndex: 500,
          fontSize: '0.9rem', color: 'var(--text-1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          fontFamily: "'Tajawal',sans-serif", fontWeight: 700
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 4px' }}>
          طلبات الإيداع N1
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', margin: 0 }}>
          مراجعة وإدارة طلبات إيداع N1 Credit من المستخدمين
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'معلقة',     value: stats.pending,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
          { label: 'موافق',     value: stats.approved, color: '#00e5a0', bg: 'rgba(0,229,160,0.08)'   },
          { label: 'مرفوضة',    value: stats.rejected, color: '#f85149', bg: 'rgba(248,81,73,0.08)'   },
          { label: 'الإجمالي',  value: stats.total,    color: 'var(--cyan)', bg: 'rgba(0,210,255,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, fontFamily: "'Orbitron',sans-serif", lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
              fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem', fontWeight: 700,
              border: filter === f.id ? `1px solid ${f.color}` : '1px solid var(--border-1)',
              background: filter === f.id ? `${f.color}15` : 'transparent',
              color: filter === f.id ? f.color : 'var(--text-3)',
              transition: 'all 0.2s'
            }}
          >
            {f.label}
          </button>
        ))}

        {/* زر تحديث */}
        <button
          onClick={() => { fetchDeposits(); fetchStats() }}
          style={{ marginRight: 'auto', padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border-1)', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Tajawal',sans-serif", transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          تحديث
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 18, overflow: 'hidden' }}>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border-1)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            جاري التحميل...
          </div>
        ) : deposits.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <div style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>لا يوجد طلبات في هذا القسم</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-1)', background: 'rgba(0,0,0,0.15)' }}>
                  {['المستخدم', 'النوع', 'المبلغ', 'العملة', 'الحالة', 'التاريخ', 'إجراء'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deposits.map((d, i) => (
                  <tr
                    key={d._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    onClick={() => setSelected(d)}
                  >
                    {/* المستخدم */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)' }}>{d.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{d.user?.email || '—'}</div>
                    </td>

                    {/* النوع */}
                    <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                      {d.type === 'bank_transfer' ? '🏦 بنكي' : '₮ USDT'}
                    </td>

                    {/* المبلغ */}
                    <td style={{ padding: '13px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.92rem', fontWeight: 700, color: 'var(--cyan)' }}>
                      {Number(d.amount).toFixed(2)}
                    </td>

                    {/* العملة */}
                    <td style={{ padding: '13px 16px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      {d.currency}
                    </td>

                    {/* الحالة */}
                    <td style={{ padding: '13px 16px' }}>
                      <StatusBadge status={d.status} />
                    </td>

                    {/* التاريخ */}
                    <td style={{ padding: '13px 16px', fontSize: '0.72rem', color: 'var(--text-3)', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono',monospace" }}>
                      {new Date(d.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* إجراء */}
                    <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                      {d.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => { setSelected(d) }}
                            style={{ padding: '6px 14px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 8, color: '#00e5a0', fontFamily: "'Tajawal',sans-serif", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,160,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,229,160,0.1)'}
                          >
                            مراجعة
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelected(d)}
                          style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-1)', borderRadius: 8, color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          عرض
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal التفاصيل */}
      {selected && (
        <DepositDetailModal
          deposit={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}