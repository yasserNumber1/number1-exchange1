// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import useTheme from '../../context/useTheme'
import useLang from '../../context/useLang'

const NAV_KEYS = [
  { id:'home',    key:'nav_home'    },
  { id:'rates',   key:'nav_rates'   },
  { id:'news',    key:'nav_news'    },
  { id:'support', key:'nav_support' },
  { id:'about',   key:'nav_about'   },
]

function ripple(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 1.5
  const el = document.createElement('span')
  el.className = 'ripple'
  el.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
  if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative'
  btn.appendChild(el)
  setTimeout(() => el.remove(), 600)
}

function Logo({ onClick }) {
  return (
    <a onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:12, textDecoration:'none', cursor:'pointer', userSelect:'none' }}>
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

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle} title="Toggle theme" style={{ width:46, height:26, borderRadius:13, position:'relative', cursor:'pointer', background: isDark ? 'linear-gradient(135deg,#1a2a4a,#0d1a2e)' : 'linear-gradient(135deg,#87ceeb,#4da6d9)', border:'1.5px solid var(--border-1)', transition:'all 0.4s', flexShrink:0, overflow:'hidden', padding:0 }}>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 5px', pointerEvents:'none', fontSize:'0.7rem' }}>
        <span style={{ opacity: isDark ? 1 : 0.3, transition:'opacity 0.3s' }}>🌙</span>
        <span style={{ opacity: isDark ? 0.3 : 1, transition:'opacity 0.3s' }}>☀️</span>
      </div>
      {isDark && (
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          {[{t:5,l:8,d:'0s'},{t:10,l:14,d:'0.4s'},{t:6,l:20,d:'0.8s'}].map((s,i)=>(
            <span key={i} style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'#fff', top:s.t, left:s.l, animation:'twinkle 2s ease-in-out infinite', animationDelay:s.d }} />
          ))}
        </div>
      )}
      {!isDark && (
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', width:10, height:7, borderRadius:'50%', background:'rgba(255,255,255,0.6)', top:5, right:6 }} />
          <div style={{ position:'absolute', width:7, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.6)', top:7, right:14 }} />
        </div>
      )}
      <div style={{ position:'absolute', top:3, right: isDark?3:'auto', left: isDark?'auto':3, width:18, height:18, borderRadius:'50%', background: isDark ? 'radial-gradient(circle at 35% 35%,#e8f4ff,#a0c4e8)' : 'radial-gradient(circle at 35% 35%,#fffde0,#ffd700)', boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 8px rgba(255,200,0,0.5)', transition:'all 0.4s' }} />
    </button>
  )
}

function LangToggle({ lang, onToggle }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onToggle} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:9, border:`1px solid ${hov?'var(--border-2)':'var(--border-1)'}`, background: hov?'var(--cyan-dim)':'transparent', cursor:'pointer', transition:'all 0.22s', flexShrink:0 }}>
      <span style={{ fontSize:'0.85rem' }}>{lang==='ar'?'🇬🇧':'🇸🇦'}</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.72rem', fontWeight:700, color: hov?'var(--cyan)':'var(--text-2)', letterSpacing:1, transition:'color 0.22s' }}>{lang==='ar'?'EN':'AR'}</span>
    </button>
  )
}

function NavLink({ label, isActive, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <li>
      <button onClick={(e)=>{ripple(e);onClick()}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ fontSize:'0.88rem', color: isActive?'var(--cyan)': hov?'var(--text-1)':'var(--text-2)', background: hov&&!isActive?'var(--cyan-dim)':'transparent', border:'none', padding:'7px 13px', borderRadius:8, cursor:'pointer', fontFamily:"'Tajawal',sans-serif", fontWeight:700, position:'relative', overflow:'hidden', transition:'color 0.2s, background 0.2s' }}>
        {label}
        {isActive && <span style={{ position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:18, height:2, background:'var(--cyan)', borderRadius:2, boxShadow:'0 0 8px var(--cyan)', display:'block' }} />}
      </button>
    </li>
  )
}

function Navbar({ currentPage, onNavigate, onOpenAuth }) {
  const { isDark, toggleTheme } = useTheme()
  const { lang, t, toggleLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [lHov, setLHov] = useState(false)
  const [rHov, setRHov] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{ position:'sticky', top:33, zIndex:100, padding:'11px 0', backdropFilter:'blur(28px) saturate(180%)', background:'var(--nav-bg)', borderBottom:'1px solid var(--border-1)', transition:'box-shadow 0.3s, background 0.4s', boxShadow: scrolled?'0 4px 40px rgba(0,210,255,0.07)':'none' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <Logo onClick={()=>onNavigate('home')} />
        <ul style={{ display:'flex', alignItems:'center', gap:2, listStyle:'none', margin:0, padding:0 }}>
          {NAV_KEYS.map(l => <NavLink key={l.id} label={t(l.key)} isActive={currentPage===l.id} onClick={()=>onNavigate(l.id)} />)}
        </ul>
        <div style={{ display:'flex', gap:9, alignItems:'center' }}>
          <LangToggle lang={lang} onToggle={toggleLang} />
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <button onClick={(e)=>{ripple(e);onOpenAuth('login')}} onMouseEnter={()=>setLHov(true)} onMouseLeave={()=>setLHov(false)}
            style={{ background: lHov?'var(--cyan-dim)':'transparent', border:`1px solid ${lHov?'var(--border-2)':'var(--border-1)'}`, color: lHov?'var(--text-1)':'var(--text-2)', padding:'9px 20px', borderRadius:9, fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', fontWeight:700, cursor:'pointer', transition:'all 0.22s', position:'relative', overflow:'hidden' }}>
            {t('nav_login')}
          </button>
          <button onClick={(e)=>{ripple(e);onOpenAuth('register')}} onMouseEnter={()=>setRHov(true)} onMouseLeave={()=>setRHov(false)}
            style={{ background:'linear-gradient(135deg,#00b8d9,#0086b3)', border:'none', color:'#fff', padding:'9px 20px', borderRadius:9, fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', fontWeight:700, cursor:'pointer', position:'relative', overflow:'hidden', transform: rHov?'translateY(-2px)':'translateY(0)', boxShadow: rHov?'0 6px 26px rgba(0,210,255,0.38)':'0 0 18px rgba(0,210,255,0.18)', transition:'all 0.22s' }}>
            {t('nav_register')}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
