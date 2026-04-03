// src/components/admin/AdminLayout.jsx — Enhanced v3
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../context/useAuth'

const NAV = [
  {
    path: '/admin',
    label: 'Dashboard',
    labelAr: 'الرئيسية',
    exact: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/admin/orders',
    label: 'Orders',
    labelAr: 'الطلبات',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    path: '/admin/wallets',
    label: 'Wallets',
    labelAr: 'المحافظ والإيداعات',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" />
        <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
  },
  {
    path: '/admin/rates',
    label: 'Rates',
    labelAr: 'الأسعار',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    path: '/admin/payment-methods',
    label: 'Payment Methods',
    labelAr: 'وسائل الدفع',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    path: '/admin/users',
    label: 'Users',
    labelAr: 'المستخدمون',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function AdminLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)

  const currentPage = NAV.find(n => isActive(n)) || NAV[0]

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        .admin-root { display:flex; height:100vh; overflow:hidden; background:#080e1a; color:#cbd5e1; font-family:'Cairo','Tajawal',sans-serif; direction:rtl; }

        .admin-sidebar {
          background: linear-gradient(180deg, #0d1526 0%, #0a1020 100%);
          border-left: 1px solid rgba(59,130,246,0.1);
          display:flex; flex-direction:column;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
          flex-shrink:0; overflow:hidden; position:relative; z-index:20;
          box-shadow: -4px 0 24px rgba(0,0,0,0.4);
        }

        .admin-logo-wrap {
          padding: 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          min-height: 70px;
          display: flex; align-items: center;
          background: rgba(59,130,246,0.03);
        }

        .admin-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .admin-nav { flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:1px; overflow-y:auto; overflow-x:hidden; }
        .admin-nav::-webkit-scrollbar { width: 3px; }
        .admin-nav::-webkit-scrollbar-track { background: transparent; }
        .admin-nav::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 3px; }

        .admin-nav-item {
          display:flex; align-items:center; gap:11px;
          padding: 10px 11px; border-radius:9px;
          text-decoration:none; color:#64748b;
          font-size:13.5px; font-weight:600;
          transition: all 0.18s ease; position:relative;
          cursor:pointer; white-space:nowrap;
          letter-spacing: 0.2px;
        }
        .admin-nav-item:hover { background:rgba(59,130,246,0.07); color:#94a3b8; }
        .admin-nav-item.active {
          background: rgba(37,99,235,0.12);
          color: #60a5fa;
          border: 1px solid rgba(59,130,246,0.15);
        }
        .admin-nav-item.active .admin-nav-icon { color:#3b82f6; }
        .admin-active-bar {
          position:absolute; right:0; top:50%;
          transform:translateY(-50%);
          width:3px; height:22px;
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border-radius:3px 0 0 3px;
          box-shadow: 0 0 8px rgba(59,130,246,0.5);
        }

        .admin-section-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: #334155;
          padding: 14px 12px 5px;
          font-family: 'JetBrains Mono', monospace;
        }

        .admin-sidebar-bottom { border-top:1px solid rgba(255,255,255,0.05); padding-top:10px; }
        .admin-user-card {
          display:flex; align-items:center; gap:10px;
          padding:10px 14px; margin-bottom:6px;
          border-radius:0; cursor:default;
        }
        .admin-user-avatar {
          width:32px; height:32px; border-radius:9px;
          background: linear-gradient(135deg,#f59e0b,#d97706);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:800; color:#fff; flex-shrink:0;
          box-shadow: 0 2px 8px rgba(245,158,11,0.3);
        }

        .admin-icon-btn {
          display:flex; align-items:center; justify-content:center;
          gap:5px; padding:8px 10px;
          background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:8px; color:#475569; cursor:pointer;
          font-size:12.5px; transition:all 0.15s;
          white-space:nowrap;
          font-family:'Cairo',sans-serif; font-weight:600;
        }
        .admin-icon-btn:hover { background:rgba(255,255,255,0.05); color:#94a3b8; border-color:rgba(255,255,255,0.1); }
        .admin-icon-btn.danger:hover { background:rgba(239,68,68,0.08); color:#f87171; border-color:rgba(239,68,68,0.2); }

        .admin-main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }

        .admin-header {
          display:flex; align-items:center; justify-content:space-between;
          padding: 0 28px; height:64px;
          background: linear-gradient(90deg, #0d1526 0%, #0a1020 100%);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink:0;
        }

        .admin-breadcrumb { display:flex; align-items:center; gap:5px; margin-bottom:3px; }
        .admin-page-title { font-size:17px; font-weight:800; color:#e2e8f0; margin:0; letter-spacing:-0.3px; }

        .admin-back-btn {
          display:flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:8px;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.02);
          color:#64748b; cursor:pointer;
          font-size:12.5px; font-weight:600;
          transition:all 0.15s;
          font-family:'Cairo',sans-serif;
        }
        .admin-back-btn:hover { border-color:rgba(59,130,246,0.3); color:#93c5fd; background:rgba(59,130,246,0.05); }

        .admin-badge {
          display:flex; align-items:center; gap:6px;
          padding:6px 12px; border-radius:8px;
          background:rgba(37,99,235,0.08);
          border:1px solid rgba(59,130,246,0.15);
          font-size:12px; font-weight:700; color:#60a5fa;
        }
        .admin-dot {
          width:6px; height:6px; border-radius:50%;
          background:#22c55e;
          box-shadow:0 0 7px rgba(34,197,94,0.7);
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; box-shadow:0 0 7px rgba(34,197,94,0.7); }
          50% { opacity:0.7; box-shadow:0 0 12px rgba(34,197,94,0.4); }
        }

        .admin-content {
          flex:1; overflow-y:auto; padding:28px;
          background:#080e1a;
        }
        .admin-content::-webkit-scrollbar { width:5px; }
        .admin-content::-webkit-scrollbar-track { background:transparent; }
        .admin-content::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.15); border-radius:5px; }

        @keyframes adminFadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .admin-page-enter { animation: adminFadeIn 0.22s ease forwards; }
      `}</style>

      <div className="admin-root">

        {/* ══ SIDEBAR ══ */}
        <aside className="admin-sidebar" style={{ width: collapsed ? 64 : 235 }}>

          {/* Logo */}
          <div className="admin-logo-wrap">
            {!collapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div className="admin-logo-icon">N1</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: 0.3 }}>Number 1</div>
                  <div style={{ fontSize: 9, color: '#3b5ea6', letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 1, fontFamily: "'JetBrains Mono',monospace" }}>ADMIN PANEL</div>
                </div>
              </div>
            ) : (
              <div className="admin-logo-icon" style={{ margin: '0 auto' }}>N1</div>
            )}
          </div>

          {/* Nav */}
          <nav className="admin-nav">
            {!collapsed && <div className="admin-section-label">القائمة الرئيسية</div>}
            {NAV.slice(0, 4).map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.labelAr : undefined}
                  className={`admin-nav-item${active ? ' active' : ''}`}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                  <span className="admin-nav-icon" style={{ flexShrink: 0, display: 'flex', opacity: active ? 1 : 0.7 }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1 }}>{item.labelAr}</span>}
                  {active && <span className="admin-active-bar" />}
                </Link>
              )
            })}

            {!collapsed && <div className="admin-section-label" style={{ marginTop: 4 }}>الإدارة</div>}
            {!collapsed && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 4px 6px' }} />}

            {NAV.slice(4).map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.labelAr : undefined}
                  className={`admin-nav-item${active ? ' active' : ''}`}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                  <span className="admin-nav-icon" style={{ flexShrink: 0, display: 'flex', opacity: active ? 1 : 0.7 }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={{ flex: 1 }}>{item.labelAr}</span>}
                  {active && <span className="admin-active-bar" />}
                </Link>
              )
            })}
          </nav>

          {/* Bottom */}
          <div className="admin-sidebar-bottom">
            {!collapsed && (
              <div className="admin-user-card">
                <div className="admin-user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'Admin'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#475569', marginTop: 2, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5 }}>ADMINISTRATOR</div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)', flexShrink: 0 }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, padding: collapsed ? '0 10px' : '0 12px', marginBottom: 14 }}>
              <button className="admin-icon-btn" onClick={() => setCollapsed(v => !v)} title={collapsed ? 'توسيع' : 'طي'} style={{ flex: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {collapsed
                    ? <><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></>
                    : <><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></>
                  }
                </svg>
              </button>
              <button
                className="admin-icon-btn danger"
                onClick={handleLogout}
                title="تسجيل الخروج"
                style={{ flex: collapsed ? 0 : 1, color: '#ef4444' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {!collapsed && <span>خروج</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div className="admin-main">

          {/* Header */}
          <header className="admin-header">
            <div>
              <div className="admin-breadcrumb">
                <span style={{ fontSize: 11, color: '#334155' }}>لوحة التحكم</span>
                <span style={{ fontSize: 11, color: '#1e3a5f' }}>/</span>
                <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700 }}>{currentPage?.labelAr}</span>
              </div>
              <h1 className="admin-page-title">{title || currentPage?.labelAr}</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="admin-back-btn" onClick={() => navigate('/')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>الموقع الرئيسي</span>
              </button>

              <div className="admin-badge">
                <div className="admin-dot" />
                <span>مشرف</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="admin-content admin-page-enter">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
