// src/pages/admin/AdminSettings.jsx
// =============================================
// Admin Settings — 5 Tabs
// =============================================
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../services/api'

import TabGeneral       from './settings/TabGeneral'
import TabOrders        from './settings/TabOrders'
import TabNotifications from './settings/TabNotifications'
import TabIntegrations  from './settings/TabIntegrations'
import TabSecurity      from './settings/TabSecurity'

// ── Tabs config ───────────────────────────────────────────
const TABS = [
  { id: 'general',       label: 'عام',          icon: '⚙️'  },
  { id: 'orders',        label: 'الطلبات',       icon: '📋'  },
  { id: 'notifications', label: 'الإشعارات',     icon: '🔔'  },
  { id: 'integrations',  label: 'API & تكامل',   icon: '🔗', badge: 'جديد' },
  { id: 'security',      label: 'الأمان',         icon: '🔒', badge: 'جديد' },
]

// ── Default settings ──────────────────────────────────────
const DEFAULT = {
  // General
  platformEnabled:     true,
  maintenanceMode:     false,
  registrationEnabled: true,
  platformNameAr:      'نمبر ون',
  platformNameEn:      'Number1',
  platformUrl:         '',
  supportEmail:        '',
  supportTelegram:     '',
  contactWhatsapp:     '+201080835986',

  // Orders
  usdtOrdersEnabled:    true,
  walletOrdersEnabled:  true,
  bankTransferEnabled:  false,
  minOrderUsd:          10,
  maxOrderUsd:          10000,
  orderExpiryMinutes:   30,
  maxDailyOrdersUser:   5,

  // Notifications
  telegramNotifications: true,
  emailNotifications:    true,
  telegramBotToken:      '',
  telegramChatId:        '',
  smtpHost:              '',
  smtpPort:              587,
  smtpEmail:             '',
  smtpPassword:          '',
  resendApiKey:          '',
  resendFromEmail:       'Number1 Exchange <no-reply@yasser-number1.com>',

  // Integrations
  moneygoApiKey:      '',
  cryptoApiKey:       '',
  webhookUrl:         '',
  environment:        'sandbox',

  // Security
  jwtRefreshEnabled:  true,
  twoFactorAdmin:     false,
  auditLogEnabled:    true,
  sessionExpireHours: 24,
  maxLoginAttempts:   5,
  ipBanMinutes:       30,
  maxConcurrentSessions: 3,
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings,  setSettings]  = useState(DEFAULT)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState(null)   // { type, text }
  const [confirmDialog, setConfirmDialog] = useState(null) // { message, onConfirm }

  // ── Fetch ───────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await adminAPI.getSettings()
        if (data) setSettings(prev => ({ ...prev, ...data }))
      } catch { /* استخدم الـ defaults */ }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  // ── Toast helper ────────────────────────────────────────
  const showToast = useCallback((type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Confirm helper ──────────────────────────────────────
  const confirm = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm })
  }, [])

  // ── Update field ────────────────────────────────────────
  const set = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // ── Save ────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.saveSettings(settings)
      showToast('success', '✓ تم حفظ الإعدادات بنجاح')
    } catch {
      showToast('error', '✗ فشل الحفظ — تحقق من الاتصال')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle platform with confirm ────────────────────────
  const togglePlatform = () => {
    if (settings.platformEnabled) {
      confirm('هل أنت متأكد من تعطيل المنصة؟ سيتوقف جميع المستخدمين عن الوصول.', () => {
        set('platformEnabled', false)
        setConfirmDialog(null)
      })
    } else {
      set('platformEnabled', true)
    }
  }

  if (loading) return (
    <AdminLayout title="الإعدادات">
      <div style={s.center}><div style={s.spinner} /></div>
    </AdminLayout>
  )

  const tabProps = { settings, set, confirm, showToast, togglePlatform }

  return (
    <AdminLayout title="الإعدادات">

      {/* ── Sticky Top Bar ──────────────────────── */}
      <div style={s.stickyBar}>
        <div style={s.stickyLeft}>
          <span style={s.stickyTitle}>الإعدادات</span>
          {settings.maintenanceMode && (
            <span style={s.maintenanceBadge}>⚠ وضع الصيانة مفعّل</span>
          )}
          {!settings.platformEnabled && (
            <span style={s.offlineBadge}>🔴 المنصة معطّلة</span>
          )}
        </div>
        <button
          style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────── */}
      <div style={s.tabsRow}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={{
              ...s.tab,
              ...(activeTab === tab.id ? s.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && <span style={s.tabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────── */}
      <div style={s.tabContent}>
        {activeTab === 'general'       && <TabGeneral       {...tabProps} />}
        {activeTab === 'orders'        && <TabOrders        {...tabProps} />}
        {activeTab === 'notifications' && <TabNotifications {...tabProps} />}
        {activeTab === 'integrations'  && <TabIntegrations  {...tabProps} />}
        {activeTab === 'security'      && <TabSecurity      {...tabProps} />}
      </div>

      {/* ── Toast ───────────────────────────────── */}
      {toast && (
        <div style={{
          ...s.toast,
          background: toast.type === 'success' ? '#064e3b' : '#3d0a0a',
          borderColor: toast.type === 'success' ? '#22c55e' : '#f87171',
          color:       toast.type === 'success' ? '#4ade80' : '#f87171',
        }}>
          {toast.text}
        </div>
      )}

      {/* ── Confirm Dialog ──────────────────────── */}
      {confirmDialog && (
        <div style={s.overlay}>
          <div style={s.dialog}>
            <div style={s.dialogIcon}>⚠️</div>
            <p style={s.dialogMsg}>{confirmDialog.message}</p>
            <div style={s.dialogBtns}>
              <button style={s.dialogConfirm} onClick={confirmDialog.onConfirm}>
                تأكيد
              </button>
              <button style={s.dialogCancel} onClick={() => setConfirmDialog(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

// ── Styles ────────────────────────────────────────────────
const s = {
  center:  { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #1e293b', borderTop: '3px solid #3b82f6', animation: 'spin 0.8s linear infinite' },

  stickyBar: {
    position: 'sticky', top: 0, zIndex: 20,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 10,
    background: '#0f172a', borderBottom: '1px solid #1e293b',
    padding: '12px 0', marginBottom: 20,
  },
  stickyLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  stickyTitle: { fontSize: 16, fontWeight: 800, color: '#f1f5f9' },
  maintenanceBadge: { fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '3px 10px' },
  offlineBadge:     { fontSize: 11, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.3)',  borderRadius: 6, padding: '3px 10px' },

  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 22px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
    boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
    fontFamily: "'Cairo','Tajawal',sans-serif",
  },

  tabsRow: {
    display: 'flex', gap: 4, flexWrap: 'wrap',
    marginBottom: 24,
    borderBottom: '1px solid #1e293b',
    paddingBottom: 0,
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', borderRadius: '8px 8px 0 0',
    border: '1px solid transparent', borderBottom: 'none',
    background: 'transparent', color: '#64748b',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
    fontFamily: "'Cairo','Tajawal',sans-serif",
    transition: 'all 0.15s',
    position: 'relative', bottom: -1,
  },
  tabActive: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderBottom: '1px solid #1e293b',
    color: '#3b82f6',
  },
  tabBadge: {
    fontSize: 9, fontWeight: 800,
    color: '#3b82f6', background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: 6, padding: '1px 5px',
  },
  tabContent: { minHeight: 400 },

  toast: {
    position: 'fixed', bottom: 28, left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px', borderRadius: 10,
    border: '1px solid', fontSize: 14, fontWeight: 700,
    zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    fontFamily: "'Cairo','Tajawal',sans-serif",
    animation: 'fadeIn 0.25s ease',
    whiteSpace: 'nowrap',
  },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  dialog:  { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%', textAlign: 'center' },
  dialogIcon: { fontSize: 36, marginBottom: 12 },
  dialogMsg:  { fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 20 },
  dialogBtns: { display: 'flex', gap: 10, justifyContent: 'center' },
  dialogConfirm: { padding: '9px 24px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'Cairo','Tajawal',sans-serif" },
  dialogCancel:  { padding: '9px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: "'Cairo','Tajawal',sans-serif" },
}
