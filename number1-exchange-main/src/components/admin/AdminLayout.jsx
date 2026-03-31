// src/components/admin/AdminLayout.jsx
// =============================================
// Admin Layout v2 — تصميم احترافي كامل
// Sidebar ثابت + Header + Content
// =============================================

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'

// ── Navigation Config ─────────────────────────────────────
const NAV = [
  {
    path:  '/admin',
    label: 'Dashboard',
    labelAr: 'الرئيسية',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    path:  '/admin/orders',
    label: 'Orders',
    labelAr: 'الطلبات',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  { path: '/admin/wallets',
    label: 'المحافظ',
    icon: '💰' },
  {
    path:  '/admin/rates',
    label: 'Rates',
    labelAr: 'الأسعار',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  
  {
    path:  '/admin/payment-methods',
    label: 'Payment Methods',
    labelAr: 'وسائل الدفع',
    badge: 'جديد',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    path:  '/admin/users',
    label: 'Users',
    labelAr: 'المستخدمون',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    path:  '/admin/settings',
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
  { path: '/admin/deposits', label: 'طلبات الإيداع', icon: '💳' }
]

// ── AdminLayout ───────────────────────────────────────────
export default function AdminLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)

  const currentPage = NAV.find(n => isActive(n)) || NAV[0]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={s.root}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{ ...s.sidebar, width: collapsed ? 68 : 240 }}>

        {/* Logo */}
        <div style={s.logoWrap}>
          {!collapsed && (
            <div style={s.logoInner}>
              <div style={s.logoIcon}>N1</div>
              <div>
                <div style={s.logoTitle}>Number1</div>
                <div style={s.logoSub}>Admin Panel</div>
              </div>
            </div>
          )}
          {collapsed && <div style={{ ...s.logoIcon, margin: '0 auto' }}>N1</div>}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {NAV.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.labelAr : undefined}
                style={{
                  ...s.navItem,
                  ...(active ? s.navItemActive : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span style={{ ...s.navIcon, color: active ? '#3b82f6' : '#94a3b8' }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={s.navLabel}>{item.labelAr}</span>
                    {item.badge && (
                      <span style={s.navBadge}>{item.badge}</span>
                    )}
                  </>
                )}
                {active && <span style={s.activeBar} />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — user info + logout */}
        <div style={s.sidebarBottom}>
          {!collapsed && (
            <div style={s.userCard}>
              <div style={s.userAvatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div style={s.userInfo}>
                <div style={s.userName}>{user?.name?.split(' ')[0] || 'Admin'}</div>
                <div style={s.userRole}>مشرف النظام</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, padding: collapsed ? '0 10px' : '0 16px', marginBottom: 16 }}>
            {/* Collapse toggle */}
            <button
              style={s.iconBtn}
              onClick={() => setCollapsed(v => !v)}
              title={collapsed ? 'توسيع' : 'طي'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {collapsed
                  ? <><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></>
                  : <><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></>
                }
              </svg>
            </button>

            {/* Logout */}
            <button
              style={{ ...s.iconBtn, color: '#f87171', flex: collapsed ? 'none' : 1 }}
              onClick={handleLogout}
              title="تسجيل الخروج"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {!collapsed && <span style={{ marginRight: 6, fontSize: 13 }}>خروج</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div style={s.main}>

        {/* Top Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            {/* Breadcrumb */}
            <div style={s.breadcrumb}>
              <span style={s.breadcrumbRoot}>لوحة التحكم</span>
              <span style={s.breadcrumbSep}>/</span>
              <span style={s.breadcrumbCurrent}>{currentPage?.labelAr}</span>
            </div>
            <h1 style={s.pageTitle}>{title || currentPage?.labelAr}</h1>
          </div>

          <div style={s.headerRight}>
            {/* Back to site */}
            <button style={s.backBtn} onClick={() => navigate('/')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>الموقع</span>
            </button>

            {/* Admin badge */}
            <div style={s.adminBadge}>
              <div style={s.adminDot} />
              <span>مشرف</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={s.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────
const s = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    direction: 'rtl',
  },

  // ── Sidebar
  sidebar: {
    backgroundColor: '#1e293b',
    borderLeft: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },

  logoWrap: {
    padding: '20px 16px',
    borderBottom: '1px solid #334155',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
  },
  logoInner: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 38, height: 38,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 13, fontWeight: 900, color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
  },
  logoTitle: { fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: 0.5 },
  logoSub:   { fontSize: 10, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 },

  // ── Nav
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    textDecoration: 'none',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.15s ease',
    position: 'relative',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    backgroundColor: '#1e3a5f',
    color: '#3b82f6',
  },
  navIcon:  { flexShrink: 0, display: 'flex' },
  navLabel: { flex: 1 },
  navBadge: {
    fontSize: 9, fontWeight: 800,
    color: '#3b82f6',
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: 6,
    padding: '1px 6px',
    letterSpacing: 0.5,
  },
  activeBar: {
    position: 'absolute',
    right: 0, top: '50%',
    transform: 'translateY(-50%)',
    width: 3, height: 20,
    background: '#3b82f6',
    borderRadius: 3,
  },

  // ── Sidebar Bottom
  sidebarBottom: {
    borderTop: '1px solid #334155',
    paddingTop: 12,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    marginBottom: 8,
  },
  userAvatar: {
    width: 34, height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: 11, color: '#64748b', marginTop: 1 },
  iconBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: '8px 10px',
    background: '#0f172a', border: '1px solid #334155',
    borderRadius: 8, color: '#64748b',
    cursor: 'pointer', fontSize: 13,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  // ── Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: 68,
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    flexShrink: 0,
  },
  headerLeft: {},
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 },
  breadcrumbRoot:    { fontSize: 11, color: '#64748b' },
  breadcrumbSep:     { fontSize: 11, color: '#475569' },
  breadcrumbCurrent: { fontSize: 11, color: '#3b82f6', fontWeight: 600 },
  pageTitle: { fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: -0.3 },

  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    border: '1px solid #334155', background: 'transparent',
    color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    transition: 'all 0.15s',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8,
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
    fontSize: 12, fontWeight: 700, color: '#3b82f6',
  },
  adminDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px rgba(34,197,94,0.6)',
  },

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '28px',
    backgroundColor: '#0f172a',
  },
}