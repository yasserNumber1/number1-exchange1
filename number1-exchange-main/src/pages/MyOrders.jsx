// src/pages/MyOrders.jsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'
import useLang from '../context/useLang'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ACTION_CONFIG = {
  CREATED:    { ar: 'تم الإنشاء',   en: 'Created',      color: '#60a5fa', bg: 'rgba(37,99,235,0.15)'  },
  IN_PROGRESS:{ ar: 'جاري التنفيذ', en: 'In Progress',  color: '#f59e0b', bg: 'rgba(120,53,15,0.3)'   },
  VERIFIED:   { ar: 'تم التحقق',    en: 'Verified',     color: '#a78bfa', bg: 'rgba(109,40,217,0.2)'  },
  PROCESSING: { ar: 'معالجة',       en: 'Processing',   color: '#00b8d9', bg: 'rgba(0,74,110,0.3)'    },
  COMPLETED:  { ar: 'مكتمل',        en: 'Completed',    color: '#00e5a0', bg: 'rgba(6,78,59,0.3)'     },
  FAILED:     { ar: 'مرفوض',        en: 'Rejected',     color: '#f43f5e', bg: 'rgba(61,10,10,0.3)'    },
  CANCELLED:  { ar: 'ملغي',         en: 'Cancelled',    color: '#6e7681', bg: 'rgba(33,38,45,0.4)'    },
  EXPIRED:    { ar: 'منتهي',        en: 'Expired',      color: '#9ca3af', bg: 'rgba(31,41,55,0.4)'    },
}

// Fallback map for status strings
const STATUS_TO_ACTION = {
  pending: 'CREATED', verifying: 'IN_PROGRESS', verified: 'VERIFIED',
  processing: 'PROCESSING', completed: 'COMPLETED',
  rejected: 'FAILED', cancelled: 'CANCELLED', expired: 'EXPIRED',
}

function Badge({ action, status, isAr }) {
  const key = action || STATUS_TO_ACTION[status] || 'IN_PROGRESS'
  const cfg = ACTION_CONFIG[key] || { ar: status || action, en: status || action, color: '#8b949e', bg: 'rgba(33,38,45,0.4)' }
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color, fontFamily: "'Tajawal',sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {isAr ? cfg.ar : cfg.en}
    </span>
  )
}

function OrderTypeLabel({ orderType, isAr }) {
  const map = {
    EGP_TO_USDT:           { ar: 'EGP → USDT', en: 'EGP → USDT' },
    EGP_TO_MONEYGO:        { ar: 'EGP → MoneyGo', en: 'EGP → MoneyGo' },
    USDT_TO_MONEYGO:       { ar: 'USDT → MoneyGo', en: 'USDT → MoneyGo' },
    USDT_TO_WALLET:        { ar: 'USDT → محفظة', en: 'USDT → Wallet' },
    USDT_TO_EGP:           { ar: 'USDT → EGP', en: 'USDT → EGP' },
    WALLET_TO_USDT:        { ar: 'محفظة → USDT', en: 'Wallet → USDT' },
    WALLET_TO_MONEYGO:     { ar: 'محفظة → MoneyGo', en: 'Wallet → MoneyGo' },
    MONEYGO_TO_USDT:       { ar: 'MoneyGo → USDT', en: 'MoneyGo → USDT' },
    MONEYGO_TO_EGP:        { ar: 'MoneyGo → EGP', en: 'MoneyGo → EGP' },
    MONEYGO_TO_WALLET:     { ar: 'MoneyGo → محفظة', en: 'MoneyGo → Wallet' },
    EGP_WALLET_TO_MONEYGO: { ar: 'EGP محفظة → MoneyGo', en: 'EGP Wallet → MoneyGo' },
  }
  const label = map[orderType]
  return (
    <span style={{
      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6,
      background: 'rgba(0,184,217,0.1)', color: 'var(--cyan)',
      fontFamily: "'JetBrains Mono',monospace",
    }}>
      {label ? (isAr ? label.ar : label.en) : orderType}
    </span>
  )
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const tr = (ar, en) => (isAr ? ar : en)

  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [page,       setPage]       = useState(1)

  useEffect(() => {
    if (authLoading) return
    window.scrollTo(0, 0)
    if (!user) { navigate('/'); return }
  }, [user, authLoading, navigate])

  const fetchLogs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('n1_token')

      // محاولة جلب السجل الدائم أولاً
      const auditRes  = await fetch(
        `${API}/api/audit-logs/user/${user._id}?page=${page}&limit=15`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const auditData = await auditRes.json()

      if (auditData.success && auditData.logs?.length > 0) {
        setLogs(auditData.logs)
        setPagination(auditData.pagination)
        return
      }

      // fallback: جلب الطلبات العادية
      const ordersRes  = await fetch(
        `${API}/api/orders/my?page=${page}&limit=15`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const ordersData = await ordersRes.json()
      if (ordersData.success) {
        // تحويل الطلبات إلى صيغة AuditLog مؤقتة
        const mapped = (ordersData.orders || []).map(o => ({
          _id: o._id,
          action: STATUS_TO_ACTION[o.status] || 'IN_PROGRESS',
          status: o.status,
          userName: o.customerName,
          userEmail: o.customerEmail,
          timestamp: o.updatedAt || o.createdAt,
          performedBy: 'system',
          requestDetails: {
            orderNumber: o.orderNumber,
            orderType:   o.orderType,
            payment:     o.payment,
            moneygo:     o.moneygo,
            exchangeRate: o.exchangeRate,
            createdAt:   o.createdAt,
          },
        }))
        setLogs(mapped)
        setPagination(ordersData.pagination || { page: 1, total: mapped.length, pages: 1 })
      } else {
        setError(ordersData.message || 'حدث خطأ')
      }
    } catch {
      setError(isAr ? 'تعذر الاتصال بالخادم' : 'Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }, [user, page, isAr])

  useEffect(() => {
    if (!authLoading && user) fetchLogs()
  }, [fetchLogs, authLoading, user])

  const d = (log) => log.requestDetails || {}

  return (
    <div style={{ minHeight: '80vh', padding: '60px 24px', maxWidth: 860, margin: '0 auto', direction: isAr ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 6px' }}>
          {tr('📋 سجل طلباتي', '📋 My Orders')}
        </h1>
        <p style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", margin: 0, fontSize: '0.9rem' }}>
          {tr('سجل دائم بجميع طلبات الصرافة — يبقى حتى بعد انتهاء الطلب الأصلي', 'Permanent history of your exchange orders, even after the original order expires')}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>
          {tr('⏳ جاري التحميل...', '⏳ Loading...')}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: 20, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
          borderRadius: 12, color: '#f43f5e', fontFamily: "'Tajawal',sans-serif", textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && logs.length === 0 && (
        <div style={{
          textAlign: 'center', padding: 60, background: 'var(--card)',
          border: '1px solid var(--border-1)', borderRadius: 20,
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <h3 style={{ fontFamily: "'Tajawal',sans-serif", color: 'var(--text-1)', margin: '0 0 8px' }}>
            {tr('لا يوجد طلبات بعد', 'No orders yet')}
          </h3>
          <p style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', marginBottom: 20 }}>
            {tr('ابدأ أول عملية صرافة الآن', 'Start your first exchange now')}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 24px', background: 'linear-gradient(135deg,#009fc0,#006e9e)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontFamily: "'Tajawal',sans-serif", fontWeight: 700, cursor: 'pointer',
            }}
          >
            {tr('ابدأ الآن', 'Start Now')}
          </button>
        </div>
      )}

      {/* Logs list */}
      {!loading && logs.map((log) => {
        const details = d(log)
        return (
          <div
            key={log._id}
            style={{
              background: 'var(--card)', border: '1px solid var(--border-1)',
              borderRadius: 16, padding: '18px 22px', marginBottom: 14,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              flexWrap: 'wrap', gap: 14,
            }}
          >
            {/* Right: order info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: '0.88rem',
                  fontWeight: 700, color: 'var(--cyan)',
                }}>
                  {details.orderNumber || '—'}
                </span>
                {details.orderType && <OrderTypeLabel orderType={details.orderType} isAr={isAr} />}
              </div>

              <div style={{
                fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
                color: 'var(--text-2)', marginBottom: 4,
              }}>
                {details.payment?.amountSent} {details.payment?.currencySent}
                {' → '}
                {details.moneygo?.amountUSD} USD
              </div>

              {details.moneygo?.recipientName && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", marginBottom: 3 }}>
                  {tr('المستلم', 'Recipient')}: {details.moneygo.recipientName}
                </div>
              )}

              <div style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-3)',
              }}>
                {new Date(log.timestamp).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
              </div>
            </div>

            {/* Left: badge + action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <Badge action={log.action} status={log.status} isAr={isAr} />

              <div style={{ display: 'flex', gap: 8 }}>
                {details.orderNumber && (
                  <button
                    onClick={() => navigate(`/track?id=${details.orderNumber}`)}
                    style={{
                      padding: '6px 14px', background: 'transparent',
                      border: '1px solid var(--border-1)', borderRadius: 8,
                      color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif",
                      fontSize: '0.78rem', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >
                    {tr('تتبع ←', 'Track →')}
                  </button>
                )}
              </div>

              {log.note && (
                <div style={{
                  fontSize: '0.72rem', color: 'var(--text-3)',
                    fontFamily: "'Tajawal',sans-serif", maxWidth: 200, textAlign: isAr ? 'end' : 'start',
                }}>
                  {log.note}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: '8px 18px', borderRadius: 10,
              border: '1px solid var(--border-1)', background: 'var(--card)',
              color: 'var(--text-2)', cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.4 : 1, fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
            }}
          >
            {tr('السابق', 'Previous')}
          </button>
          <span style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>
            {page} / {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '8px 18px', borderRadius: 10,
              border: '1px solid var(--border-1)', background: 'var(--card)',
              color: 'var(--text-2)', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer',
              opacity: page >= pagination.pages ? 0.4 : 1, fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
            }}
          >
            {tr('التالي', 'Next')}
          </button>
        </div>
      )}
    </div>
  )
}
