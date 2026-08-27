// src/components/admin/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp,
  CreditCard, Users, Settings, Menu, X,
  LogOut, ChevronRight, ChevronLeft, Home, ShieldCheck, MessagesSquare,
} from 'lucide-react'
import useAuth from '../../context/useAuth'
import { adminAPI } from '../../services/api'

const NAV = [
  { path: '/admin',                 label: 'الرئيسية',           icon: LayoutDashboard, exact: true },
  { path: '/admin/orders',          label: 'الطلبات',            icon: ArrowLeftRight },
  { path: '/admin/support-chats',   label: 'محادثات العملاء',    icon: MessagesSquare },
  { path: '/admin/wallets',         label: 'المحافظ والإيداعات', icon: Wallet },
  { path: '/admin/rates',           label: 'الأسعار',            icon: TrendingUp },
  { path: '/admin/payment-methods', label: 'وسائل الدفع',        icon: CreditCard },
  { path: '/admin/users',           label: 'المستخدمون',         icon: Users },
  { path: '/admin/settings',        label: 'الإعدادات',          icon: Settings },
  { path: '/admin/audit-logs',      label: 'سجل التدقيق',        icon: ShieldCheck },
]

export default function AdminLayout({ children, title }) {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [unreadChats, setUnreadChats] = useState(0)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    let stopped = false
    const loadUnreadChats = async () => {
      try {
        const { data } = await adminAPI.getSupportChats({ status: 'open', limit: 100 })
        if (!stopped) setUnreadChats((data.chats || []).reduce((sum, chat) => sum + (chat.unreadCount || 0), 0))
      } catch {
        // Keep navigation usable when chat notifications are temporarily unavailable.
      }
    }
    loadUnreadChats()
    const timer = setInterval(loadUnreadChats, 10000)
    return () => { stopped = true; clearInterval(timer) }
  }, [location.pathname])

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)

  const currentPage = NAV.find(n => isActive(n)) || NAV[0]

  const handleLogout = () => { logout(); navigate('/') }

  const renderSidebarContent = (isMobile = false) => (
    <>
      <div className="al-logo-wrap" style={isMobile ? { justifyContent: 'space-between' } : {}}>
        {(!collapsed || isMobile) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div className="al-logo-icon">N1</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--al-text-primary)', letterSpacing: 0.3 }}>Number 1</div>
              <div style={{ fontSize: 9, color: 'var(--al-accent-muted)', letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 1, fontFamily: "'JetBrains Mono',monospace" }}>ADMIN PANEL</div>
            </div>
          </div>
        ) : (
          <div className="al-logo-icon" style={{ margin: '0 auto' }}>N1</div>
        )}
        {isMobile && (
          <button className="al-mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="al-nav">
        {(!collapsed || isMobile) && <div className="al-section-label">القائمة الرئيسية</div>}
        {NAV.slice(0, 5).map(item => {
          const active = isActive(item)
          const Icon   = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed && !isMobile ? item.label : undefined}
              className={`al-nav-item${active ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
              style={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}
            >
              <Icon size={17} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
              {(!collapsed || isMobile) && <span style={{ flex: 1 }}>{item.label}</span>}
              {item.path === '/admin/support-chats' && unreadChats > 0 && (
                <span className="al-chat-count">{unreadChats > 99 ? '99+' : unreadChats}</span>
              )}
              {active && <span className="al-active-bar" />}
            </Link>
          )
        })}

        {(!collapsed || isMobile) && (
          <>
            <div className="al-section-label" style={{ marginTop: 4 }}>الإدارة</div>
            <div style={{ height: 1, background: 'var(--al-divider)', margin: '0 4px 6px' }} />
          </>
        )}

        {NAV.slice(5).map(item => {
          const active = isActive(item)
          const Icon   = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed && !isMobile ? item.label : undefined}
              className={`al-nav-item${active ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
              style={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}
            >
              <Icon size={17} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
              {(!collapsed || isMobile) && <span style={{ flex: 1 }}>{item.label}</span>}
              {active && <span className="al-active-bar" />}
            </Link>
          )
        })}
      </nav>

      <div className="al-sidebar-bottom">
        {(!collapsed || isMobile) && (
          <div className="al-user-card">
            <div className="al-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--al-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0] || 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--al-text-muted)', marginTop: 2, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5 }}>ADMINISTRATOR</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)', flexShrink: 0 }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, padding: collapsed && !isMobile ? '0 10px' : '0 12px', marginBottom: 14 }}>
          <button className="al-icon-btn al-collapse-btn" onClick={() => setCollapsed(v => !v)} title={collapsed ? 'توسيع' : 'طي'}>
            {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
          <button
            className="al-icon-btn danger"
            onClick={handleLogout}
            title="تسجيل الخروج"
            style={{ flex: collapsed && !isMobile ? 0 : 1, color: '#ef4444' }}
          >
            <LogOut size={14} />
            {(!collapsed || isMobile) && <span>خروج</span>}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── Admin CSS Variables ── */
        :root {
          --al-sidebar-bg:    #0d1526;
          --al-header-bg:     #0d1526;
          --al-content-bg:    #080e1a;
          --al-sidebar-border: rgba(59,130,246,0.1);
          --al-divider:       rgba(255,255,255,0.04);
          --al-text-primary:  #e2e8f0;
          --al-text-secondary:#94a3b8;
          --al-text-muted:    #475569;
          --al-text-faint:    #334155;
          --al-accent-muted:  #3b5ea6;
          --al-row-bg:        rgba(255,255,255,0.02);
          --al-row-bg-hover:  rgba(255,255,255,0.05);
          --al-border:        rgba(255,255,255,0.06);
          --al-border-md:     rgba(255,255,255,0.07);
          --al-nav-hover:     rgba(59,130,246,0.07);
          --al-nav-active:    rgba(37,99,235,0.12);
          --al-nav-active-border: rgba(59,130,246,0.15);
          --al-nav-active-color: #60a5fa;
          --al-breadcrumb-1:  #334155;
          --al-breadcrumb-2:  #1e3a5f;
          --al-breadcrumb-3:  #3b82f6;
          --al-badge-bg:      rgba(37,99,235,0.08);
          --al-badge-border:  rgba(59,130,246,0.15);
          --al-badge-color:   #60a5fa;
          --al-back-btn-color:#64748b;
          --al-back-btn-bg:   rgba(255,255,255,0.02);
          --al-back-btn-border:rgba(255,255,255,0.07);
          --al-scrollbar:     rgba(59,130,246,0.15);
        }

        /* ── Light Mode Overrides ── */
        html.light {
          --al-sidebar-bg:    #ffffff;
          --al-header-bg:     #f8fafc;
          --al-content-bg:    #eef0f4;
          --al-sidebar-border: rgba(0,0,0,0.08);
          --al-divider:       rgba(0,0,0,0.06);
          --al-text-primary:  #0f172a;
          --al-text-secondary:#475569;
          --al-text-muted:    #64748b;
          --al-text-faint:    #94a3b8;
          --al-accent-muted:  #2563eb;
          --al-row-bg:        rgba(0,0,0,0.02);
          --al-row-bg-hover:  rgba(0,0,0,0.04);
          --al-border:        rgba(0,0,0,0.07);
          --al-border-md:     rgba(0,0,0,0.09);
          --al-nav-hover:     rgba(37,99,235,0.06);
          --al-nav-active:    rgba(37,99,235,0.09);
          --al-nav-active-border: rgba(37,99,235,0.2);
          --al-nav-active-color: #1d4ed8;
          --al-breadcrumb-1:  #94a3b8;
          --al-breadcrumb-2:  #cbd5e1;
          --al-breadcrumb-3:  #2563eb;
          --al-badge-bg:      rgba(37,99,235,0.07);
          --al-badge-border:  rgba(37,99,235,0.2);
          --al-badge-color:   #1d4ed8;
          --al-back-btn-color:#64748b;
          --al-back-btn-bg:   rgba(0,0,0,0.03);
          --al-back-btn-border:rgba(0,0,0,0.09);
          --al-scrollbar:     rgba(37,99,235,0.15);
        }

        .al-root {
          display: flex; height: 100vh; overflow: hidden;
          background: var(--al-content-bg); color: var(--al-text-secondary);
          font-family: 'Cairo','Tajawal',sans-serif; direction: rtl;
        }

        /* ── Sidebar ── */
        .al-sidebar {
          background: var(--al-sidebar-bg);
          border-left: 1px solid var(--al-sidebar-border);
          display: flex; flex-direction: column;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
          flex-shrink: 0; overflow: hidden; position: relative; z-index: 20;
          box-shadow: -4px 0 24px rgba(0,0,0,0.15);
        }
        .al-logo-wrap {
          padding: 18px 14px; border-bottom: 1px solid var(--al-divider);
          min-height: 70px; display: flex; align-items: center;
          background: var(--al-row-bg);
        }
        .al-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
        }

        /* ── Nav ── */
        .al-nav { flex: 1; padding: 10px 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; overflow-x: hidden; }
        .al-nav::-webkit-scrollbar { width: 3px; }
        .al-nav::-webkit-scrollbar-track { background: transparent; }
        .al-nav::-webkit-scrollbar-thumb { background: var(--al-scrollbar); border-radius: 3px; }

        .al-section-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: var(--al-text-faint);
          padding: 14px 12px 5px;
          font-family: 'JetBrains Mono', monospace;
        }
        .al-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 11px; border-radius: 9px;
          text-decoration: none; color: var(--al-text-muted);
          font-size: 13.5px; font-weight: 600;
          transition: all 0.18s ease; position: relative;
          cursor: pointer; white-space: nowrap; letter-spacing: 0.2px;
        }
        .al-nav-item:hover { background: var(--al-nav-hover); color: var(--al-text-secondary); }
        .al-nav-item.active {
          background: var(--al-nav-active); color: var(--al-nav-active-color);
          border: 1px solid var(--al-nav-active-border);
        }
        .al-active-bar {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 22px;
          background: linear-gradient(180deg, #3b82f6, #2563eb);
          border-radius: 3px 0 0 3px;
          box-shadow: 0 0 8px rgba(59,130,246,0.5);
        }
        .al-chat-count {
          min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #ef4444; color: #fff; font: 700 10px 'JetBrains Mono',monospace;
          box-shadow: 0 0 10px rgba(239,68,68,0.35); flex-shrink: 0;
        }

        /* ── Bottom / User card ── */
        .al-sidebar-bottom { border-top: 1px solid var(--al-divider); padding-top: 10px; }
        .al-user-card {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; margin-bottom: 6px;
        }
        .al-user-avatar {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg,#f59e0b,#d97706);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(245,158,11,0.3);
        }
        .al-icon-btn {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 8px 10px; background: var(--al-row-bg);
          border: 1px solid var(--al-border); border-radius: 8px;
          color: var(--al-text-muted); cursor: pointer; font-size: 12.5px;
          transition: all 0.15s; white-space: nowrap;
          font-family: 'Cairo',sans-serif; font-weight: 600;
        }
        .al-icon-btn:hover { background: var(--al-row-bg-hover); color: var(--al-text-secondary); border-color: var(--al-border-md); }
        .al-icon-btn.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; border-color: rgba(239,68,68,0.2); }

        /* ── Main area ── */
        .al-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

        .al-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; height: 64px;
          background: var(--al-header-bg);
          border-bottom: 1px solid var(--al-divider);
          flex-shrink: 0; gap: 12px;
        }
        .al-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .al-breadcrumb { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; flex-wrap: wrap; }
        .al-page-title { font-size: 17px; font-weight: 800; color: var(--al-text-primary); margin: 0; letter-spacing: -0.3px; }

        .al-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          border: 1px solid var(--al-back-btn-border);
          background: var(--al-back-btn-bg);
          color: var(--al-back-btn-color); cursor: pointer; font-size: 12.5px; font-weight: 600;
          transition: all 0.15s; font-family: 'Cairo',sans-serif; white-space: nowrap;
        }
        .al-back-btn:hover { border-color: rgba(59,130,246,0.3); color: #93c5fd; background: rgba(59,130,246,0.05); }

        .al-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          background: var(--al-badge-bg); border: 1px solid var(--al-badge-border);
          font-size: 12px; font-weight: 700; color: var(--al-badge-color); white-space: nowrap;
        }
        .al-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          box-shadow: 0 0 7px rgba(34,197,94,0.7);
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; box-shadow: 0 0 7px rgba(34,197,94,0.7); }
          50%      { opacity: 0.7; box-shadow: 0 0 12px rgba(34,197,94,0.4); }
        }

        .al-content { flex: 1; overflow-y: auto; padding: 28px; background: var(--al-content-bg); }
        .al-content::-webkit-scrollbar { width: 5px; }
        .al-content::-webkit-scrollbar-track { background: transparent; }
        .al-content::-webkit-scrollbar-thumb { background: var(--al-scrollbar); border-radius: 5px; }

        @keyframes adminFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .al-page-enter { animation: adminFadeIn 0.22s ease forwards; }

        /* ── Mobile hamburger ── */
        .al-hamburger {
          display: none; align-items: center; justify-content: center;
          width: 38px; height: 38px; flex-shrink: 0;
          border: 1px solid var(--al-border-md);
          border-radius: 9px; background: var(--al-row-bg);
          color: var(--al-text-muted); cursor: pointer;
        }
        .al-collapse-btn { display: flex; }

        /* ── Mobile drawer backdrop ── */
        .al-backdrop {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
          z-index: 29;
        }
        .al-backdrop.open { display: block; }

        /* ── Mobile sidebar drawer ── */
        .al-mobile-sidebar {
          display: none;
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 240px; z-index: 30;
          background: var(--al-sidebar-bg);
          border-left: 1px solid var(--al-sidebar-border);
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: -8px 0 40px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .al-mobile-sidebar.open { transform: translateX(0); }

        .al-mobile-close {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid var(--al-border);
          background: var(--al-row-bg);
          color: var(--al-text-muted); cursor: pointer; flex-shrink: 0;
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .al-sidebar       { display: none; }
          .al-hamburger     { display: flex; }
          .al-mobile-sidebar{ display: flex; }
          .al-collapse-btn  { display: none; }
          .al-back-btn span { display: none; }
          .al-header        { padding: 0 16px; }
          .al-content       { padding: 16px; }
        }

        @media (max-width: 480px) {
          .al-badge span    { display: none; }
          .al-page-title    { font-size: 15px; }
        }
      `}</style>

      {/* ── Mobile drawer backdrop ── */}
      <div className={`al-backdrop${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* ── Mobile sidebar drawer ── */}
      <aside className={`al-mobile-sidebar${mobileOpen ? ' open' : ''}`}>
        {renderSidebarContent(true)}
      </aside>

      <div className="al-root">

        {/* ── Desktop sidebar ── */}
        <aside className="al-sidebar" style={{ width: collapsed ? 64 : 235 }}>
          {renderSidebarContent()}
        </aside>

        {/* ── Main ── */}
        <div className="al-main">

          {/* Header */}
          <header className="al-header">
            <div className="al-header-left">
              <button className="al-hamburger" onClick={() => setMobileOpen(true)}>
                <Menu size={18} />
              </button>

              <div style={{ minWidth: 0 }}>
                <div className="al-breadcrumb">
                  <span style={{ fontSize: 11, color: 'var(--al-breadcrumb-1)' }}>لوحة التحكم</span>
                  <span style={{ fontSize: 11, color: 'var(--al-breadcrumb-2)' }}>/</span>
                  <span style={{ fontSize: 11, color: 'var(--al-breadcrumb-3)', fontWeight: 700 }}>{currentPage?.label}</span>
                </div>
                <h1 className="al-page-title">{title || currentPage?.label}</h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="al-back-btn" onClick={() => navigate('/')}>
                <Home size={13} />
                <span>الموقع الرئيسي</span>
              </button>

              <div className="al-badge">
                <div className="al-dot" />
                <span>مشرف</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="al-content al-page-enter">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
