// src/pages/legal/LegalLayout.jsx — Unified Legal Hub v2
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useLang from '../../context/useLang'

const POLICIES = [
  {
    path: '/terms',
    labelAr: 'شروط الخدمة',
    labelEn: 'Terms of Service',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    path: '/privacy',
    labelAr: 'سياسة الخصوصية',
    labelEn: 'Privacy Policy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    path: '/aml',
    labelAr: 'سياسة AML / KYC',
    labelEn: 'AML / KYC Policy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    path: '/cookies',
    labelAr: 'سياسة الكوكيز',
    labelEn: 'Cookie Policy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

function LegalLayout({ children }) {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  const isAr = lang === 'ar'

  const current = POLICIES.find(p => p.path === location.pathname) || POLICIES[0]
  const currentIndex = POLICIES.findIndex(p => p.path === location.pathname)

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const prevPolicy = currentIndex > 0 ? POLICIES[currentIndex - 1] : null
  const nextPolicy = currentIndex < POLICIES.length - 1 ? POLICIES[currentIndex + 1] : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap');

        .legal-root {
          min-height: 100vh;
          background: var(--bg);
          padding: 40px 20px 80px;
          direction: ${isAr ? 'rtl' : 'ltr'};
        }

        .legal-container {
          max-width: 860px;
          margin: 0 auto;
        }

        /* ── Policy Switcher ── */
        .legal-nav-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .legal-dropdown-wrap { position: relative; }

        .legal-dropdown-trigger {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; border-radius: 10px;
          border: 1px solid rgba(0,212,255,0.2);
          background: var(--card);
          color: var(--text-1); cursor: pointer;
          font-family: 'Cairo', sans-serif;
          font-size: 14px; font-weight: 700;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .legal-dropdown-trigger:hover {
          border-color: rgba(0,212,255,0.45);
          background: rgba(0,212,255,0.04);
        }
        .legal-dropdown-trigger .chevron {
          color: var(--cyan);
          transition: transform 0.22s;
        }
        .legal-dropdown-trigger.open .chevron { transform: rotate(180deg); }

        .legal-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          ${isAr ? 'right' : 'left'}: 0;
          min-width: 240px;
          background: var(--card);
          border: 1px solid rgba(0,212,255,0.18);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          z-index: 100;
          animation: legalDropDown 0.17s ease;
        }
        @keyframes legalDropDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .legal-drop-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          border: none; width: 100%; text-align: ${isAr ? 'right' : 'left'};
          background: transparent; cursor: pointer;
          color: var(--text-2); font-family: 'Cairo', sans-serif;
          font-size: 13.5px; font-weight: 600;
          transition: all 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .legal-drop-item:last-child { border-bottom: none; }
        .legal-drop-item:hover { background: rgba(0,212,255,0.05); color: var(--text-1); }
        .legal-drop-item.active {
          background: rgba(0,212,255,0.08);
          color: var(--cyan);
          border-${isAr ? 'right' : 'left'}: 3px solid var(--cyan);
        }
        .legal-drop-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: var(--cyan); flex-shrink: 0;
        }
        .legal-drop-item.active .legal-drop-icon {
          background: rgba(0,212,255,0.12);
          border-color: rgba(0,212,255,0.25);
        }

        /* ── Tabs (desktop) ── */
        .legal-tabs {
          display: flex; gap: 6px; flex: 1;
          overflow-x: auto; padding-bottom: 2px;
        }
        .legal-tabs::-webkit-scrollbar { height: 0; }
        .legal-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent; cursor: pointer;
          color: var(--text-3); font-family: 'Cairo', sans-serif;
          font-size: 12.5px; font-weight: 600;
          transition: all 0.18s; white-space: nowrap;
        }
        .legal-tab:hover { color: var(--text-2); border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.02); }
        .legal-tab.active {
          background: rgba(0,212,255,0.07);
          border-color: rgba(0,212,255,0.25);
          color: var(--cyan);
        }

        /* ── Main Card ── */
        .legal-card {
          background: var(--card);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.3);
        }

        .legal-card-header {
          padding: 28px 32px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(${isAr ? '135deg' : '45deg'}, rgba(0,212,255,0.03), transparent);
          display: flex; align-items: flex-start; gap: 16px;
        }

        .legal-header-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: var(--cyan); flex-shrink: 0;
        }

        .legal-title {
          font-family: 'Cairo', sans-serif;
          font-size: clamp(1.2rem, 3vw, 1.55rem);
          font-weight: 800;
          color: var(--text-1);
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }

        .legal-meta {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap;
        }
        .legal-meta-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.3px;
        }
        .legal-meta-badge.updated {
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.15);
          color: var(--cyan);
        }
        .legal-meta-badge.version {
          background: rgba(118,36,194,0.08);
          border: 1px solid rgba(118,36,194,0.2);
          color: #a78bfa;
        }

        /* ── Content Area ── */
        .legal-content {
          padding: 32px;
          color: var(--text-2);
          font-family: 'Cairo', sans-serif;
          line-height: 1.9;
          font-size: 14.5px;
        }

        .legal-content h2 {
          font-size: 17px; font-weight: 800;
          color: var(--text-1);
          margin: 32px 0 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px;
        }
        .legal-content h2::before {
          content: '';
          display: inline-block;
          width: 4px; height: 18px;
          background: linear-gradient(180deg, var(--cyan), #7c3aed);
          border-radius: 4px;
          flex-shrink: 0;
        }

        .legal-content h3 {
          font-size: 15px; font-weight: 700;
          color: var(--text-1); margin: 24px 0 8px;
        }

        .legal-content h4 {
          font-size: 13.5px; font-weight: 700;
          color: var(--cyan); margin: 20px 0 8px;
          text-transform: uppercase; letter-spacing: 0.8px;
          font-family: 'JetBrains Mono', monospace;
        }

        .legal-content p { margin: 0 0 14px; }

        .legal-content ul, .legal-content ol {
          padding-${isAr ? 'right' : 'left'}: 20px;
          margin: 10px 0 14px;
        }
        .legal-content li { margin-bottom: 8px; }

        .legal-content .highlight-box {
          background: rgba(0,212,255,0.05);
          border: 1px solid rgba(0,212,255,0.15);
          border-radius: 10px;
          padding: 16px 18px;
          margin: 20px 0;
          font-size: 13.5px;
          color: var(--text-2);
        }
        .legal-content .highlight-box strong { color: var(--cyan); }

        .legal-content .warn-box {
          background: rgba(234,179,8,0.06);
          border: 1px solid rgba(234,179,8,0.2);
          border-radius: 10px;
          padding: 14px 18px;
          margin: 16px 0;
          font-size: 13px;
          color: #fbbf24;
        }

        .legal-content a {
          color: var(--cyan);
          text-decoration: none;
          border-bottom: 1px solid rgba(0,212,255,0.3);
          transition: border-color 0.15s;
        }
        .legal-content a:hover { border-color: var(--cyan); }

        .legal-content table {
          width: 100%; border-collapse: collapse;
          margin: 16px 0; font-size: 13px;
        }
        .legal-content th {
          background: rgba(0,212,255,0.06);
          color: var(--cyan); font-weight: 700;
          padding: 10px 14px; text-align: ${isAr ? 'right' : 'left'};
          border-bottom: 1px solid rgba(0,212,255,0.15);
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
          font-family: 'JetBrains Mono', monospace;
        }
        .legal-content td {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: var(--text-2);
          vertical-align: top;
        }
        .legal-content tr:last-child td { border-bottom: none; }
        .legal-content tr:hover td { background: rgba(255,255,255,0.01); }

        /* ── Navigation Footer ── */
        .legal-nav-footer {
          padding: 20px 32px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          background: rgba(0,0,0,0.15);
        }

        .legal-nav-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent; cursor: pointer;
          color: var(--text-3); font-family: 'Cairo', sans-serif;
          font-size: 13px; font-weight: 600;
          transition: all 0.18s;
        }
        .legal-nav-btn:hover {
          border-color: rgba(0,212,255,0.3);
          color: var(--cyan); background: rgba(0,212,255,0.04);
        }
        .legal-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; }

        @media (max-width: 640px) {
          .legal-content { padding: 20px; }
          .legal-card-header { padding: 20px; }
          .legal-tabs { display: none; }
          .legal-nav-footer { padding: 16px 20px; }
        }
      `}</style>

      <div className="legal-root">
        <div className="legal-container">

          {/* ── Navigation Bar ── */}
          <div className="legal-nav-bar">

            {/* Dropdown (mobile-friendly) */}
            <div className="legal-dropdown-wrap" ref={dropRef}>
              <button
                className={`legal-dropdown-trigger${dropOpen ? ' open' : ''}`}
                onClick={() => setDropOpen(v => !v)}
              >
                <span style={{ color: 'var(--cyan)', display: 'flex' }}>{current.icon}</span>
                <span>{isAr ? current.labelAr : current.labelEn}</span>
                <svg className="chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropOpen && (
                <div className="legal-dropdown-menu">
                  {POLICIES.map(p => (
                    <button
                      key={p.path}
                      className={`legal-drop-item${p.path === location.pathname ? ' active' : ''}`}
                      onClick={() => { navigate(p.path); setDropOpen(false) }}
                    >
                      <div className="legal-drop-icon">{p.icon}</div>
                      <span>{isAr ? p.labelAr : p.labelEn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs (desktop) */}
            <div className="legal-tabs">
              {POLICIES.map(p => (
                <button
                  key={p.path}
                  className={`legal-tab${p.path === location.pathname ? ' active' : ''}`}
                  onClick={() => navigate(p.path)}
                >
                  <span style={{ display: 'flex', opacity: 0.8 }}>{p.icon}</span>
                  <span>{isAr ? p.labelAr : p.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Main Card ── */}
          <div className="legal-card">

            {/* Card Header */}
            <div className="legal-card-header">
              <div className="legal-header-icon">
                {current.icon}
              </div>
              <div>
                <h1 className="legal-title">{isAr ? current.labelAr : current.labelEn}</h1>
                <div className="legal-meta">
                  <span className="legal-meta-badge updated">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {isAr ? 'آخر تحديث: يناير 2026' : 'Last Updated: Jan 2026'}
                  </span>
                  <span className="legal-meta-badge version">v2.0</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="legal-content">
              {children}
            </div>

            {/* Footer Nav */}
            <div className="legal-nav-footer">
              <button
                className="legal-nav-btn"
                disabled={!prevPolicy}
                onClick={() => prevPolicy && navigate(prevPolicy.path)}
              >
                {isAr ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    {prevPolicy ? (isAr ? prevPolicy.labelAr : prevPolicy.labelEn) : '—'}
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                    {prevPolicy ? (isAr ? prevPolicy.labelAr : prevPolicy.labelEn) : '—'}
                  </>
                )}
              </button>

              <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                {currentIndex + 1} / {POLICIES.length}
              </span>

              <button
                className="legal-nav-btn"
                disabled={!nextPolicy}
                onClick={() => nextPolicy && navigate(nextPolicy.path)}
              >
                {isAr ? (
                  <>
                    {nextPolicy ? (isAr ? nextPolicy.labelAr : nextPolicy.labelEn) : '—'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </>
                ) : (
                  <>
                    {nextPolicy ? (isAr ? nextPolicy.labelAr : nextPolicy.labelEn) : '—'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default LegalLayout
