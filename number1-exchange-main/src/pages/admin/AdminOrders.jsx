// src/pages/admin/AdminOrders.jsx
import { useEffect, useState, useCallback } from 'react'
import { Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import {
  AdminPageHeader, AdminRefreshBtn, AdminFilterTabs,
  AdminSearchBar, AdminPagination, AdminTableWrap,
  AdminModal, AdminModalHeader, AdminInfoGrid,
  thStyle, tdStyle,
} from '../../components/admin/adminShared'
import { adminAPI } from '../../services/api'

const ORDER_TYPE_LABELS = {
  EGP_TO_USDT:            'جنيه → USDT',
  EGP_TO_MONEYGO:         'جنيه → MoneyGo',
  USDT_TO_MONEYGO:        'USDT → MoneyGo',
  USDT_TO_WALLET:         'USDT → محفظة',
  WALLET_TO_USDT:         'محفظة → USDT',
  WALLET_TO_MONEYGO:      'محفظة → MoneyGo',
  MONEYGO_TO_USDT:        'MoneyGo → USDT',
  MONEYGO_TO_WALLET:      'MoneyGo → محفظة',
  EGP_WALLET_TO_MONEYGO:  'محفظة (EGP) → MoneyGo',
}

const STATUS_TABS = [
  { value: '',           label: 'الكل'      },
  { value: 'pending',    label: 'انتظار'    },
  { value: 'verifying',  label: 'تحقق'      },
  { value: 'verified',   label: 'تم التحقق' },
  { value: 'processing', label: 'معالجة'    },
  { value: 'completed',  label: 'مكتمل'     },
  { value: 'rejected',   label: 'مرفوض'     },
  { value: 'cancelled',  label: 'ملغي'      },
  { value: 'expired',    label: 'منتهي'     },
]

const LIMIT = 15

export default function AdminOrders() {
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [statusTab,     setStatusTab]     = useState('')
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [selected,      setSelected]      = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await adminAPI.getOrders({
        page,
        limit: LIMIT,
        ...(statusTab && { status: statusTab }),
        ...(search    && { search }),
      })
      setOrders(data.orders || [])
      setSelected(previous => previous ? (data.orders || []).find(order => order._id === previous._id) || previous : previous)
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, statusTab, search])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => fetchOrders({ silent: true }), 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (orderId, newStatus) => {
    setActionLoading(true)
    try {
      await adminAPI.updateStatus(orderId, { status: newStatus })
      await fetchOrders()
      setSelected(null)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleTabChange = (val) => { setStatusTab(val); setPage(1) }
  const handleSearch    = (val) => { setSearch(val);    setPage(1) }

  return (
    <AdminLayout>
      <AdminPageHeader title="إدارة الطلبات">
        <AdminRefreshBtn onClick={fetchOrders} label="تحديث" />
      </AdminPageHeader>

      <AdminFilterTabs tabs={STATUS_TABS} active={statusTab} onChange={handleTabChange} />

      <AdminSearchBar
        value={search}
        onChange={handleSearch}
        placeholder="ابحث بالإيميل أو رقم الطلب..."
      />

      <AdminTableWrap loading={loading} isEmpty={!loading && orders.length === 0} emptyText="لا يوجد طلبات">
        <table style={styles.table}>
          <thead>
            <tr>
              {['رقم الطلب', 'العميل', 'النوع', 'المرسَل', 'المستلَم', 'الطريقة', 'الحالة', 'التاريخ', ''].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={styles.tr}>
                <td style={tdStyle}><span style={styles.orderId}>{order.orderNumber || `#${order._id.slice(-6)}`}</span></td>
                <td style={tdStyle}>{order.customerEmail || '—'}</td>
                <td style={tdStyle}><span style={styles.typeBadge}>{ORDER_TYPE_LABELS[order.orderType] || order.orderType}</span></td>
                <td style={tdStyle}>{order.payment?.amountSent} {order.payment?.currencySent}</td>
                <td style={tdStyle}>{order.moneygo?.amountUSD} USD</td>
                <td style={tdStyle}>{order.payment?.method || '—'}</td>
                <td style={tdStyle}><AdminStatusBadge status={order.status} />{order.status === 'cancelled' && (order.cancelledBy === 'customer' || order.timeline?.some(item => item.status === 'cancelled' && item.by === 'customer')) && <div style={{ fontSize: 11, color: '#f59e0b' }}>ألغى العميل الطلب / Cancelled by customer</div>}</td>
                <td style={tdStyle}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                <td style={tdStyle}>
                  <button style={styles.viewBtn} onClick={() => setSelected(order)}>
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
      </AdminTableWrap>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={updateStatus}
          loading={actionLoading}
        />
      )}
    </AdminLayout>
  )
}

// ── Order detail modal ──────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdateStatus, loading }) {
  const rows = [
    ['رقم الطلب',    order.orderNumber || order._id],
    ['اسم العميل',   order.customerName  || '—'],
    ['إيميل العميل', order.customerEmail || '—'],
    ['هاتف العميل',  order.customerPhone || '—'],
    ['نوع العملية',  ORDER_TYPE_LABELS[order.orderType] || order.orderType],
    ['المبلغ المرسل',  `${order.payment?.amountSent} ${order.payment?.currencySent}`],
    ['المبلغ المستلم', `${order.moneygo?.amountUSD} USD`],
    ['طريقة الدفع',  order.payment?.method || '—'],
    ['اسم المستلم',  order.moneygo?.recipientName  || '—'],
    ['هاتف المستلم', order.moneygo?.recipientPhone || '—'],
    ['الحالة',       <AdminStatusBadge key="s" status={order.status} />],
    ...(order.status === 'cancelled' ? [['جهة الإلغاء / Cancelled by', order.cancelledBy === 'customer' || order.timeline?.some(item => item.status === 'cancelled' && item.by === 'customer') ? 'العميل / Customer' : order.cancelledBy === 'admin' || order.timeline?.some(item => item.status === 'cancelled' && item.by?.startsWith('admin:')) ? 'الإدارة / Administration' : 'غير محدد / Unknown']] : []),
    ['تاريخ الإنشاء', new Date(order.createdAt).toLocaleString('ar-EG')],
  ]

  return (
    <AdminModal onClose={onClose} maxWidth={520}>
      <AdminModalHeader title={`تفاصيل الطلب — ${order.orderNumber}`} onClose={onClose} />

      {order.payment?.receiptImageUrl && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img
            src={order.payment.receiptImageUrl}
            alt="receipt"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #21262d' }}
          />
          <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>إيصال الدفع</div>
        </div>
      )}

      <AdminInfoGrid rows={rows} />

      {order.adminNote && (
        <div style={{ fontSize: 13, color: '#c9d1d9', background: '#21262d', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <span style={{ color: '#6e7681', fontSize: 12 }}>ملاحظة الأدمن: </span>
          {order.adminNote}
        </div>
      )}

      {!['completed', 'rejected', 'cancelled', 'expired'].includes(order.status) && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button style={modal.approveBtn} disabled={loading} onClick={() => onUpdateStatus(order._id, 'completed')}>
            <CheckCircle size={16} />
            {loading ? '...' : 'إكمال الطلب'}
          </button>
          <button style={modal.rejectBtn} disabled={loading} onClick={() => onUpdateStatus(order._id, 'rejected')}>
            <XCircle size={16} />
            {loading ? '...' : 'رفض الطلب'}
          </button>
        </div>
      )}

      {!['completed', 'rejected', 'cancelled', 'expired'].includes(order.status) && (
        <button style={{ ...modal.rejectBtn, marginTop: 10, width: '100%' }} disabled={loading} onClick={() => onUpdateStatus(order._id, 'cancelled')}>
          <XCircle size={16} /> إلغاء الطلب من جهة الإدارة
        </button>
      )}

      {order.status === 'pending' && (
        <button
          style={{ ...modal.approveBtn, background: '#3b1f6e', color: '#a78bfa', marginTop: 10, width: '100%' }}
          disabled={loading}
          onClick={() => onUpdateStatus(order._id, 'verifying')}
        >
          <Clock size={16} />
          بدء التحقق
        </button>
      )}
    </AdminModal>
  )
}

const styles = {
  table:    { width: '100%', borderCollapse: 'collapse', minWidth: 720 },
  tr:       { transition: 'background 0.12s' },
  orderId:  { fontFamily: 'monospace', color: '#8b949e', fontSize: 12 },
  typeBadge:{ fontSize: 11, color: '#2563eb', background: '#1e3a5f', padding: '2px 8px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' },
  viewBtn:  { background: '#21262d', border: 'none', color: '#8b949e', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
}

const modal = {
  approveBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 8, border: 'none', background: '#064e3b', color: '#34d399', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  rejectBtn:  { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 8, border: 'none', background: '#3d0a0a', color: '#f87171', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
