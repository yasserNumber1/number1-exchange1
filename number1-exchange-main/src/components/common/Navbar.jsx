// src/components/common/Navbar.jsx
import { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useTheme    from '../../context/useTheme'
import useLang     from '../../context/useLang'
import { AuthContext } from '../../context/AuthContext'

const NAV_ITEMS = [
  { path: '/',             ar: 'الرئيسية',         en: 'Home'         },
  { path: '/rates',        ar: 'الأسعار',           en: 'Rates'        },
  { path: '/how-it-works', ar: 'كيف تعمل',          en: 'How It Works' },
  { path: '/reviews',      ar: 'التقييمات',         en: 'Reviews'      },
  { path: '/faq',          ar: 'الأسئلة الشائعة',   en: 'FAQ'          },
  { path: '/contact',      ar: 'تواصل معنا',         en: 'Contact'      },
]

// ── Logo ───────────────────────────────────────────────────
function Logo({ onClick }) {
  return (
    <a onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:12, textDecoration:'none', cursor:'pointer', userSelect:'none', flexShrink:0 }}>
      <div style={{ position:'relative', width:40, height:48, perspective:260 }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', width:56, height:56, transform:'translate(-50%,-50%) rotateX(80deg)', borderRadius:'50%', border:'1.5px solid rgba(0,210,255,0.28)', animation:'ringPulse 2.2s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',sans-serif", fontWeight:900, fontSize:'2.6rem', background:'linear-gradient(160deg,#00eeff,#008fb3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', filter:'drop-shadow(0 0 14px rgba(0,210,255,0.9))', animation:'n1float 4s ease-in-out infinite' }}>1</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1, gap:3 }}>
        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.3rem', fontWeight:900, color:'var(--cyan)', letterSpacing:2, textShadow:'0 0 18px rgba(0,210,255,0.55)' }}>NUMBER 1</span>
        <span style={{ fontSize:'0.6rem', color:'var(--text-3)', letterSpacing:3, textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>EXCHANGE PLATFORM</span>
      </div>
    </a>
  )
}

// ── Theme Toggle ───────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle} title="Toggle theme"
      style={{ width:46, height:26, borderRadius:13, position:'relative', cursor:'pointer', background: isDark?'linear-gradient(135deg,#1a2a4a,#0d1a2e)':'linear-gradient(135deg,#87ceeb,#4da6d9)', border:'1.5px solid var(--border-1)', transition:'all 0.4s', flexShrink:0, overflow:'hidden', padding:0 }}>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 5px', pointerEvents:'none', fontSize:'0.7rem' }}>
        <span style={{ opacity:isDark?1:0.3,transition:'opacity 0.3s',display:'flex',alignItems:'center',color:'rgba(255,255,255,0.8)' }}><svg width='11' height='11' viewBox='0 0 24 24' fill='currentColor'><path d='M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z'/></svg></span>
        <span style={{ opacity:isDark?0.3:1,transition:'opacity 0.3s',display:'flex',alignItems:'center',color:'rgba(255,255,255,0.9)' }}><svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><circle cx='12' cy='12' r='4'/><line x1='12' y1='2' x2='12' y2='4'/><line x1='12' y1='20' x2='12' y2='22'/><line x1='4.22' y1='4.22' x2='5.64' y2='5.64'/><line x1='18.36' y1='18.36' x2='19.78' y2='19.78'/><line x1='2' y1='12' x2='4' y2='12'/><line x1='20' y1='12' x2='22' y2='12'/><line x1='4.22' y1='19.78' x2='5.64' y2='18.36'/><line x1='18.36' y1='5.64' x2='19.78' y2='4.22'/></svg></span>
      </div>
      <div style={{ position:'absolute', top:3, right:isDark?3:'auto', left:isDark?'auto':3, width:18, height:18, borderRadius:'50%', background: isDark?'radial-gradient(circle at 35% 35%,#e8f4ff,#a0c4e8)':'radial-gradient(circle at 35% 35%,#fffde0,#ffd700)', boxShadow: isDark?'0 2px 6px rgba(0,0,0,0.4)':'0 2px 8px rgba(255,200,0,0.5)', transition:'all 0.4s' }} />
    </button>
  )
}

// ── Lang Toggle ────────────────────────────────────────────
function LangToggle({ lang, onToggle }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onToggle} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:9, border:`1px solid ${hov?'var(--border-2)':'var(--border-1)'}`, background:hov?'var(--cyan-dim)':'transparent', cursor:'pointer', transition:'all 0.22s', flexShrink:0 }}>
      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.72rem', fontWeight:700, color:hov?'var(--cyan)':'var(--text-2)', letterSpacing:1, transition:'color 0.22s' }}>{lang==='ar'?'EN':'AR'}</span>
    </button>
  )
}

// ── Nav Link ───────────────────────────────────────────────
function NavLink({ label, isActive, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ fontSize:'0.88rem', color: isActive?'var(--cyan)':hov?'var(--text-1)':'var(--text-2)', background:hov&&!isActive?'var(--cyan-dim)':'transparent', border:'none', padding:'7px 13px', borderRadius:8, cursor:'pointer', fontFamily:"'Tajawal',sans-serif", fontWeight:700, position:'relative', overflow:'hidden', transition:'color 0.2s, background 0.2s', whiteSpace:'nowrap' }}>
      {label}
      {isActive && <span style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:18, height:2, background:'var(--cyan)', borderRadius:2, boxShadow:'0 0 8px var(--cyan)', display:'block' }} />}
    </button>
  )
}

// ── Mobile Drawer ──────────────────────────────────────────
// NAV_ICONS — أيقونات SVG لكل صفحة
const NAV_ICONS = {
  '/':             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  '/rates':        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  '/how-it-works': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>,
  '/reviews':      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  '/faq':          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  '/contact':      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
}

function MobileDrawer({ isOpen, items, currentPath, onNavigate, onClose, isAr, onOpenAuth, user, isDark, onToggleTheme, lang, onToggleLang }) {
  if (!isOpen) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(10px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:0, left:0, right:0, background:'var(--card)', borderRadius:'0 0 28px 28px', boxShadow:'0 20px 60px rgba(0,0,0,0.55)', overflow:'hidden' }}>

        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid var(--border-1)' }}>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'0.9rem', fontWeight:900, color:'var(--cyan)', letterSpacing:2 }}>MENU</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Lang toggle */}
            <button onClick={onToggleLang} style={{ padding:'5px 10px', borderRadius:8, border:'1px solid var(--border-1)', background:'transparent', color:'var(--text-2)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.72rem', fontWeight:700, cursor:'pointer', minHeight:34 }}>
              {lang==='ar' ? 'EN' : 'AR'}
            </button>
            {/* Theme toggle */}
            <button onClick={onToggleTheme} style={{ width:34, height:34, borderRadius:8, border:'1px solid var(--border-1)', background:'transparent', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
              }
            </button>
            {/* Close */}
            <button onClick={onClose} style={{ width:34, height:34, borderRadius:8, border:'1px solid var(--border-1)', background:'transparent', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ padding:'8px 12px', display:'flex', flexDirection:'column', gap:2 }}>
          {items.map(item => {
            const active = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)
            return (
              <button key={item.path} onClick={()=>{ onNavigate(item.path); onClose() }}
                style={{ display:'flex', alignItems:'center', gap:12, textAlign:isAr?'right':'left', padding:'12px 14px', borderRadius:14, border:'none', background:active?'var(--cyan-dim)':'transparent', color:active?'var(--cyan)':'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.97rem', fontWeight:700, cursor:'pointer', transition:'all 0.18s', minHeight:48, flexDirection:isAr?'row':'row' }}>
                <span style={{ color:active?'var(--cyan)':'var(--text-3)', flexShrink:0 }}>{NAV_ICONS[item.path]}</span>
                <span style={{ flex:1 }}>{isAr ? item.ar : item.en}</span>
                {active && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', flexShrink:0 }}/>}
              </button>
            )
          })}
        </div>

        {/* Auth Buttons — للزوار فقط */}
        {!user && (
          <div style={{ display:'flex', gap:10, padding:'12px 18px 20px', borderTop:'1px solid var(--border-1)', marginTop:6 }}>
            <button onClick={()=>{ onOpenAuth('login'); onClose() }}
              style={{ flex:1, padding:'12px', borderRadius:14, border:'1.5px solid var(--border-2)', background:'transparent', color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.92rem', fontWeight:700, cursor:'pointer', minHeight:48 }}>
              {isAr ? 'تسجيل الدخول' : 'Login'}
            </button>
            <button onClick={()=>{ onOpenAuth('register'); onClose() }}
              style={{ flex:1, padding:'12px', borderRadius:14, border:'none', background:'linear-gradient(135deg,var(--cyan),var(--purple))', color:'#000', fontFamily:"'Tajawal',sans-serif", fontSize:'0.92rem', fontWeight:800, cursor:'pointer', minHeight:48 }}>
              {isAr ? 'إنشاء حساب' : 'Sign Up'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── User Menu (when logged in) ─────────────────────────────
function UserMenu({ user, onLogout, isAr, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [hov,  setHov]  = useState(false)

  const initial  = user?.name?.charAt(0)?.toUpperCase() || '?'
  const isAdmin  = user?.role === 'admin'   // ← هل هو أدمن؟

  return (
    <div style={{ position:'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: hov ? 'var(--cyan-dim)' : 'transparent',
          border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border-1)'}`,
          borderRadius: 10, padding: '6px 12px 6px 8px',
          cursor: 'pointer', transition: 'all 0.22s',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: isAdmin
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'   // ذهبي للأدمن
            : 'linear-gradient(135deg,#00b8d9,#0086b3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem',
          fontWeight: 800, color: '#fff', flexShrink: 0,
          boxShadow: isAdmin
            ? '0 0 10px rgba(245,158,11,0.5)'
            : '0 0 10px rgba(0,210,255,0.35)',
        }}>
          {isAdmin ? <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'/></svg> : initial}
        </div>

        {/* Name */}
        <span style={{
          fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
          fontWeight: 700, color: 'var(--text-1)',
          maxWidth: 90, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {isAdmin
            ? (isAr ? 'المشرف' : 'Admin')
            : (user?.name?.split(' ')[0] || (isAr ? 'حسابي' : 'Account'))
          }
        </span>

        {/* Chevron */}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98 }} />

          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)',
            right: isAr ? 'auto' : 0, left: isAr ? 0 : 'auto',
            minWidth: 190, zIndex: 99,
            background: 'var(--card)',
            border: '1px solid var(--border-1)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            animation: 'auth-fade 0.18s ease',
          }}>
            {/* User info */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-1)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif" }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2, direction: 'ltr', textAlign: isAr ? 'right' : 'left' }}>
                {user?.email}
              </div>
              {/* Admin badge */}
              {isAdmin && (
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '2px 8px', fontFamily: "'JetBrains Mono',monospace" }}>
                  ADMIN
                </div>
              )}
            </div>

            {/* ── لوحة التحكم — يظهر فقط للأدمن ── */}
            {isAdmin && (
              <button
                onClick={() => { onNavigate('/admin'); setOpen(false) }}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'transparent', border: 'none',
                  textAlign: isAr ? 'right' : 'left',
                  fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
                  fontWeight: 700, color: '#d97706',
                  cursor: 'pointer', transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderBottom: '1px solid var(--border-1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                {isAr ? 'لوحة التحكم' : 'Admin Panel'}
              </button>
            )}

            {/* طلباتي — للمستخدم العادي فقط */}
            {!isAdmin && (
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'transparent', border: 'none',
                  textAlign: isAr ? 'right' : 'left',
                  fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
                  fontWeight: 700, color: 'var(--text-2)',
                  cursor: 'pointer', transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--cyan-dim)'; e.currentTarget.style.color = 'var(--cyan)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {isAr ? 'طلباتي' : 'My Orders'}
              </button>
            )}

            {!isAdmin && (
  <button
    onClick={() => { onNavigate('/wallet'); setOpen(false) }}
    style={{
      width:'100%', padding:'10px 14px',
      background:'transparent', border:'none',
      textAlign: isAr ? 'right' : 'left',
      fontFamily:"'Tajawal',sans-serif", fontSize:'0.85rem',
      fontWeight:700, color:'var(--text-2)',
      cursor:'pointer', transition:'all 0.18s',
      display:'flex', alignItems:'center', gap:8,
      borderBottom:'1px solid var(--border-1)',
    }}
    onMouseEnter={e => { e.currentTarget.style.background='var(--cyan-dim)'; e.currentTarget.style.color='var(--cyan)' }}
    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)' }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
      <path d="M3 5v14a2 2 0 002 2h16v-5"/>
      <path d="M18 12a2 2 0 000 4h4v-4z"/>
    </svg>
    {isAr ? 'محفظتي' : 'My Wallet'}
  </button>
)}

            {/* Logout */}
            <button
              onClick={() => { onLogout(); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'transparent',
                borderTop: '1px solid var(--border-1)', border: 'none',
                borderTop: '1px solid var(--border-1)',
                textAlign: isAr ? 'right' : 'left',
                fontFamily: "'Tajawal',sans-serif", fontSize: '0.85rem',
                fontWeight: 700, color: '#ef4444',
                cursor: 'pointer', transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Navbar ────────────────────────────────────────────
function Navbar({ onOpenAuth, mobileMenuOpen, setMobileMenuOpen }) {
  const { isDark, toggleTheme } = useTheme()
  const { lang, toggleLang }    = useLang()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled,   setScrolled]   = useState(false)
  const [lHov,       setLHov]       = useState(false)
  const [rHov,       setRHov]       = useState(false)
  const [localMenuOpen, setLocalMenuOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)

  const menuOpen = mobileMenuOpen !== undefined ? mobileMenuOpen : localMenuOpen
  const setMenuOpen = setMobileMenuOpen || setLocalMenuOpen

  const isAr    = lang === 'ar'
  const curPath = location.pathname

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [curPath])

  const isActive = (path) =>
    path === '/' ? curPath === '/' : curPath.startsWith(path)

  return (
    <>
      <style>{`
        .nav-links { display:flex; align-items:center; gap:2px; }
        .nav-hamburger { display:none !important; }
        @media (max-width:1024px) {
          .nav-links { display:none !important; }
          .nav-hamburger { display:flex !important; }
        }
      `}</style>

      <nav style={{ position:'sticky', top:0, zIndex:100, padding:'11px 0', backdropFilter:'blur(28px) saturate(180%)', background:'var(--nav-bg)', borderBottom:'1px solid var(--border-1)', transition:'box-shadow 0.3s', boxShadow:scrolled?'0 4px 40px rgba(0,210,255,0.07)':'none', direction:isAr?'rtl':'ltr' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>

          {/* Logo */}
          <Logo onClick={() => navigate('/')} />

          {/* Desktop nav links */}
          <div className="nav-links" style={{ flex:1, justifyContent:'center' }}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                label={isAr ? item.ar : item.en}
                isActive={isActive(item.path)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>

          {/* Right controls — Lang/Theme/Auth hidden on mobile/tablet (see .n1-nav-desktop-ctl in mobile.css) */}
          <div style={{ display:'flex', gap:9, alignItems:'center', flexShrink:0 }}>
            <div className="n1-nav-desktop-ctl" style={{ display:'flex', gap:9, alignItems:'center' }}>
              <LangToggle lang={lang} onToggle={toggleLang} />
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>

            {user ? (
              <UserMenu
                user={user}
                onLogout={logout}
                isAr={isAr}
                onNavigate={navigate}
              />
            ) : (
              <div className="n1-nav-desktop-ctl" style={{ display:'flex', gap:9, alignItems:'center' }}>
                <button onClick={() => onOpenAuth('login')}
                  onMouseEnter={() => setLHov(true)} onMouseLeave={() => setLHov(false)}
                  style={{ background:lHov?'var(--cyan-dim)':'transparent', border:`1px solid ${lHov?'var(--border-2)':'var(--border-1)'}`, color:lHov?'var(--text-1)':'var(--text-2)', padding:'9px 20px', borderRadius:9, fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', fontWeight:700, cursor:'pointer', transition:'all 0.22s', whiteSpace:'nowrap' }}>
                  {isAr ? 'تسجيل الدخول' : 'Login'}
                </button>

                <button onClick={() => onOpenAuth('register')}
                  onMouseEnter={() => setRHov(true)} onMouseLeave={() => setRHov(false)}
                  style={{ background:'linear-gradient(135deg,#00b8d9,#0086b3)', border:'none', color:'#fff', padding:'9px 20px', borderRadius:9, fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', fontWeight:700, cursor:'pointer', transform:rHov?'translateY(-2px)':'translateY(0)', boxShadow:rHov?'0 6px 26px rgba(0,210,255,0.38)':'0 0 18px rgba(0,210,255,0.18)', transition:'all 0.22s', whiteSpace:'nowrap' }}>
                  {isAr ? 'إنشاء حساب' : 'Sign Up'}
                </button>
              </div>
            )}

            <button onClick={() => setMenuOpen(v => !v)} className="nav-hamburger"
              style={{ background:'transparent', border:'1px solid var(--border-1)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'var(--text-1)', display:'flex', alignItems:'center' }}>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><line x1='3' y1='6' x2='21' y2='6'/><line x1='3' y1='12' x2='21' y2='12'/><line x1='3' y1='18' x2='21' y2='18'/></svg>
            </button>
          </div>
        </div>
      </nav>

      <MobileDrawer
        isOpen={menuOpen}
        items={NAV_ITEMS}
        currentPath={curPath}
        onNavigate={navigate}
        onClose={() => setMenuOpen(false)}
        isAr={isAr}
        onOpenAuth={onOpenAuth}
        user={user}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        lang={lang}
        onToggleLang={toggleLang}
      />
    </>
  )
}

export default Navbar