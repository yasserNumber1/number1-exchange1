// src/pages/admin/AdminAuditLogs.jsx
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'

const ACTION_CONFIG = {
  CREATED:    { label: 'تم الإنشاء',   color: '#60a5fa', bg: 'rgba(37,99,235,0.12)'  },
  IN_PROGRESS:{ label: 'جاري التنفيذ', color: '#f59e0b', bg: 'rgba(120,53,15,0.25)'  },
  VERIFIED:   { label: 'تم التحقق',    color: '#a78bfa', bg: 'rgba(109,40,217,0.2)'  },
  PROCESSING: { label: 'معالجة',       color: '#00b8d9', bg: 'rgba(0,74,110,0.3)'    },
  COMPLETED:  { label: 'مكتمل',        color: '#00e5a0', bg: 'rgba(6,78,59,0.3)'     },
  FAILED:     { label: 'فشل / مرفوض',  color: '#f43f5e', bg: 'rgba(61,10,10,0.3)'   },
  CANCELLED:  { label: 'ملغي',         color: '#6e7681', bg: 'rgba(33,38,45,0.4)'   },
  EXPIRED:    { label: 'منتهي',        color: '#9ca3af', bg: 'rgba(31,41,55,0.4)'   },
}

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending',    label: 'انتظار'    },
  { value: 'verifying',  label: 'تحقق'     },
  { value: 'verified',   label: 'تم التحقق' },
  { value: 'processing', label: 'معالجة'   },
  { value: 'completed',  label: 'مكتمل'    },
  { value: 'rejected',   label: 'مرفوض'   },
  { value: 'cancelled',  label: 'ملغي'     },
  { value: 'expired',    label: 'منتهي'    },
]

const ACTION_OPTIONS = [
  { value: '', label: 'كل الأحداث' },
  { value: 'CREATED',     label: 'تم الإنشاء'   },
  { value: 'IN_PROGRESS', label: 'جاري التنفيذ' },
  { value: 'VERIFIED',    label: 'تم التحقق'    },
  { value: 'PROCESSING',  label: 'معالجة'       },
  { value: 'COMPLETED',   label: 'مكتمل'        },
  { value: 'FAILED',      label: 'فشل / مرفوض'  },
  { value: 'CANCELLED',   label: 'ملغي'         },
  { value: 'EXPIRED',     label: 'منتهي'        },
]

function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || { label: action, color: '#8b949e', bg: 'rgba(33,38,45,0.4)' }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
      fontFamily: "'Tajawal',sans-serif",
    }}>
      {cfg.label}
    </span>
  )
}

function DetailModal({ log, onClose }) {
  if (!log) return null
  const d = log.requestDetails || {}
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--al-sidebar-bg)', border: '1px solid var(--al-border-md)',
        borderRadius: 16, padding: 28, maxWidth: 680, width: '100%',
        maxHeight: '85vh', overflowY: 'auto', direction: 'rtl',
        fontFamily: "'Tajawal',sans-serif",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--al-text-primary)' }}>
            تفاصيل السجل
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--al-border)',
            borderRadius: 8, color: 'var(--al-text-muted)', cursor: 'pointer',
            padding: '4px 10px', fontSize: '1rem',
          }}>×</button>
        </div>

        <Row label="رقم السجل"      value={log._id} mono />
        <Row label="الحدث"           value={<ActionBadge action={log.action} />} />
        <Row label="الحالة"          value={log.status} />
        <Row label="المستخدم"        value={log.userName} />
        <Row label="البريد"          value={log.userEmail} />
        <Row label="نُفِّذ بواسطة"   value={log.performedBy} />
        <Row label="ملاحظة"          value={log.note || '—'} />
        <Row label="التاريخ"         value={new Date(log.timestamp).toLocaleString('ar-EG')} />

        {d.orderNumber && (
          <>
            <div style={{ borderTop: '1px solid var(--al-border)', margin: '16px 0' }} />
            <h3 style={{ fontSize: '0.85rem', color: 'var(--al-text-muted)', marginBottom: 12, fontWeight: 700 }}>
              تفاصيل الطلب (snapshot)
            </h3>
            <Row label="رقم الطلب"   value={d.orderNumber} mono />
            <Row label="نوع الطلب"   value={d.orderType} />
            <Row label="وسيلة الدفع" value={d.payment?.method} />
            <Row label="المبلغ المرسل" value={`${d.payment?.amountSent} ${d.payment?.currencySent}`} />
            <Row label="المبلغ USD"  value={`${d.moneygo?.amountUSD} USD`} />
            <Row label="السعر المطبق" value={d.exchangeRate?.appliedRate} />
            <Row label="المستلم"     value={d.moneygo?.recipientName} />
            <Row label="رقم المستلم" value={d.moneygo?.recipientPhone || '—'} />
            {d.payment?.txHash && <Row label="TXID" value={d.payment.txHash} mono />}
            <Row label="تاريخ الإنشاء" value={d.createdAt ? new Date(d.createdAt).toLocaleString('ar-EG') : '—'} />
          </>
        )}

        {d.timeline?.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid var(--al-border)', margin: '16px 0' }} />
            <h3 style={{ fontSize: '0.85rem', color: 'var(--al-text-muted)', marginBottom: 10, fontWeight: 700 }}>
              المسار الزمني
            </h3>
            {d.timeline.map((t, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '6px 0',
                borderBottom: '1px solid var(--al-divider)',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--al-text-muted)', whiteSpace: 'nowrap' }}>
                  {t.timestamp ? new Date(t.timestamp).toLocaleString('ar-EG') : ''}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--al-text-secondary)' }}>{t.message}</span>
                <span style={{ marginRight: 'auto', fontSize: '0.7rem', color: 'var(--al-text-faint)' }}>{t.by}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--al-divider)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--al-text-muted)', minWidth: 120, fontWeight: 600, paddingTop: 2 }}>{label}</span>
      <span style={{
        fontSize: '0.82rem', color: 'var(--al-text-primary)',
        fontFamily: mono ? "'JetBrains Mono',monospace" : undefined,
        wordBreak: 'break-all',
      }}>
        {typeof value === 'object' ? value : (value ?? '—')}
      </span>
    </div>
  )
}

function FilterInput({ label, value, onChange, type = 'text', options }) {
  const base = {
    padding: '7px 12px', borderRadius: 8, fontSize: '0.82rem',
    border: '1px solid var(--al-border-md)', background: 'var(--al-row-bg)',
    color: 'var(--al-text-primary)', fontFamily: "'Tajawal',sans-serif", outline: 'none',
    minWidth: 140,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '0.72rem', color: 'var(--al-text-muted)', fontWeight: 600 }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={base} placeholder={label} />
      )}
    </div>
  )
}

export default function AdminAuditLogs() {
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [selected,   setSelected]   = useState(null)

  const [filters, setFilters] = useState({
    search:    '',
    status:    '',
    action:    '',
    userId:    '',
    startDate: '',
    endDate:   '',
  })
  const [page, setPage] = useState(1)

  const setFilter = (key) => (val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('n1_token')
      const params = new URLSearchParams({ page, limit: 20 })
      if (filters.search)    params.set('search',    filters.search)
      if (filters.status)    params.set('status',    filters.status)
      if (filters.action)    params.set('action',    filters.action)
      if (filters.userId)    params.set('userId',    filters.userId)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate)   params.set('endDate',   filters.endDate)

      const res  = await fetch(`${API}/api/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setLogs(data.logs || [])
        setPagination(data.pagination || { page: 1, total: 0, pages: 1 })
      }
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const resetFilters = () => {
    setFilters({ search: '', status: '', action: '', userId: '', startDate: '', endDate: '' })
    setPage(1)
  }

  return (
    <AdminLayout title="سجل التدقيق الدائم">
      <div style={{ direction: 'rtl', fontFamily: "'Tajawal',sans-serif" }}>

        {/* Header info */}
        <div style={{
          background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.15)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 24,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔒</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00e5a0' }}>
              سجل دائم غير قابل للحذف أو التعديل
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--al-text-muted)', marginTop: 2 }}>
              إجمالي السجلات: <strong style={{ color: 'var(--al-text-primary)' }}>{pagination.total}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--al-sidebar-bg)', border: '1px solid var(--al-border)',
          borderRadius: 12, padding: 20, marginBottom: 20,
          display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end',
        }}>
          <FilterInput label="بحث (اسم / بريد / رقم طلب)" value={filters.search} onChange={setFilter('search')} />
          <FilterInput label="الحالة"  value={filters.status} onChange={setFilter('status')} options={STATUS_OPTIONS} />
          <FilterInput label="الحدث"   value={filters.action} onChange={setFilter('action')} options={ACTION_OPTIONS} />
          <FilterInput label="من تاريخ" value={filters.startDate} onChange={setFilter('startDate')} type="date" />
          <FilterInput label="إلى تاريخ" value={filters.endDate} onChange={setFilter('endDate')} type="date" />
          <button
            onClick={resetFilters}
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: '0.82rem',
              border: '1px solid var(--al-border-md)', background: 'var(--al-row-bg)',
              color: 'var(--al-text-secondary)', cursor: 'pointer', fontFamily: "'Tajawal',sans-serif",
              alignSelf: 'flex-end',
            }}
          >
            مسح الفلاتر
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--al-sidebar-bg)', border: '1px solid var(--al-border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--al-text-muted)' }}>
              ⏳ جاري التحميل...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--al-text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <div>لا توجد سجلات بعد</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--al-border)', background: 'var(--al-row-bg)' }}>
                    {['رقم الطلب','اسم المستخدم','نوع الحدث','الحالة','نُفِّذ بواسطة','التاريخ',''].map((h, i) => (
                      <th key={i} style={{
                        padding: '11px 14px', textAlign: 'right', fontSize: '0.73rem',
                        fontWeight: 700, color: 'var(--al-text-muted)', letterSpacing: 0.5,
                        fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} style={{
                      borderBottom: '1px solid var(--al-divider)',
                      transition: 'background 0.12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--al-row-bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', color: 'var(--al-badge-color)' }}>
                        {log.requestDetails?.orderNumber || '—'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: 'var(--al-text-primary)' }}>
                        <div style={{ fontWeight: 600 }}>{log.userName || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--al-text-muted)', marginTop: 2 }}>{log.userEmail || ''}</div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <ActionBadge action={log.action} />
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.78rem', color: 'var(--al-text-secondary)' }}>
                        {log.status}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.75rem', color: 'var(--al-text-muted)', fontFamily: "'JetBrains Mono',monospace" }}>
                        {log.performedBy || 'system'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '0.75rem', color: 'var(--al-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button
                          onClick={() => setSelected(log)}
                          style={{
                            padding: '5px 12px', borderRadius: 7, fontSize: '0.75rem',
                            border: '1px solid var(--al-border)', background: 'var(--al-row-bg)',
                            color: 'var(--al-text-secondary)', cursor: 'pointer',
                            fontFamily: "'Tajawal',sans-serif",
                          }}
                        >
                          تفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--al-border)', background: 'var(--al-row-bg)', color: 'var(--al-text-secondary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontSize: '0.82rem', fontFamily: "'Tajawal',sans-serif" }}
            >
              السابق
            </button>
            <span style={{ padding: '6px 14px', fontSize: '0.82rem', color: 'var(--al-text-muted)' }}>
              {page} / {pagination.pages} — إجمالي {pagination.total}
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--al-border)', background: 'var(--al-row-bg)', color: 'var(--al-text-secondary)', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer', opacity: page >= pagination.pages ? 0.4 : 1, fontSize: '0.82rem', fontFamily: "'Tajawal',sans-serif" }}
            >
              التالي
            </button>
          </div>
        )}
      </div>

      <DetailModal log={selected} onClose={() => setSelected(null)} />
    </AdminLayout>
  )
}
