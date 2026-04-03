// src/components/AuthModal.jsx — Phylum-Style Premium Dark Auth
import { useState, useEffect } from 'react'
import useLang from '../context/useLang'

/* ─── Keyframes ─── */
const AUTH_CSS = `
@keyframes auth-in   { from{opacity:0;transform:scale(.94) translateY(16px)} to{opacity:1;transform:none} }
@keyframes auth-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes auth-spin { to{transform:rotate(360deg)} }
@keyframes auth-pop  { 0%{transform:scale(.6)} 60%{transform:scale(1.1)} 100%{transform:scale(1)} }
@keyframes auth-shake{ 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
@keyframes auth-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
`

/* ─── Password strength ─── */
function getStrength(pw) {
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

/* ─── OTP Input ─── */
function OTPInput({ onComplete }) {
  const [vals, setVals] = useState(['','','','','',''])
  const refs = []

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...vals]; next[i] = v; setVals(next)
    if (v && i < 5 && refs[i+1]) refs[i+1].focus()
    if (next.every(x => x)) onComplete(next.join(''))
  }
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0 && refs[i-1]) {
      refs[i-1].focus()
      const next = [...vals]; next[i-1] = ''; setVals(next)
    }
  }
  const handlePaste = e => {
    const txt = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (txt.length === 6) { setVals(txt.split('')); onComplete(txt); if(refs[5]) refs[5].focus() }
    e.preventDefault()
  }

  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center', direction:'ltr', margin:'18px 0' }}>
      {vals.map((v,i) => (
        <input key={i}
          ref={el => refs[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          data-testid={`otp-input-${i}`}
          style={{
            width:44, height:50, borderRadius:10, textAlign:'center',
            background: v ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
            border:`1.5px solid ${v ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:'1.4rem', fontWeight:700,
            color:'#3b82f6', outline:'none', transition:'all 0.18s',
          }}
          onFocus={e => { e.target.style.borderColor='rgba(59,130,246,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)' }}
          onBlur={e => { e.target.style.boxShadow='none'; e.target.style.borderColor=v?'rgba(59,130,246,0.5)':'rgba(255,255,255,0.08)' }}
        />
      ))}
    </div>
  )
}

/* ─── Logo ─── */
function AuthLogo({ lang }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, marginBottom:8 }}>
      <div style={{ position:'relative', width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#1a3a5c,#0d1f35)', border:'1px solid rgba(59,130,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(59,130,246,0.15)' }}>
        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.6rem', fontWeight:900, background:'linear-gradient(135deg,#3b82f6,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>1</span>
        <div style={{ position:'absolute', inset:-1, borderRadius:14, border:'1px solid rgba(59,130,246,0.15)', pointerEvents:'none' }} />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'0.85rem', fontWeight:700, color:'#e2e8f0', letterSpacing:2 }}>
          {lang === 'ar' ? 'نمبر 1' : 'NUMBER 1'}
        </div>
        <div style={{ fontSize:'0.55rem', color:'rgba(148,163,184,0.6)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:3, marginTop:2 }}>EXCHANGE</div>
      </div>
    </div>
  )
}

/* ─── Input Field ─── */
function AuthInput({ type='text', value, onChange, placeholder, icon, error, ltr, showToggle, showPassword, onTogglePassword, autoFocus }) {
  const [focused, setFocused] = useState(false)
  const isPassword = type === 'password'
  const actualType = isPassword && showPassword ? 'text' : type

  return (
    <div style={{ position:'relative', marginBottom:14 }}>
      <div style={{ position:'absolute', left: ltr ? 14 : 'auto', right: ltr ? 'auto' : 14, top:'50%', transform:'translateY(-50%)', color: focused ? '#3b82f6' : 'rgba(148,163,184,0.4)', transition:'color 0.2s', display:'flex', alignItems:'center', zIndex:2 }}>
        {icon}
      </div>
      <input
        type={actualType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width:'100%',
          padding: ltr ? '13px 14px 13px 42px' : '13px 42px 13px 14px',
          background: error ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
          border:`1.5px solid ${error ? 'rgba(239,68,68,0.4)' : focused ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius:12,
          color:'#e2e8f0',
          fontSize:'0.88rem',
          fontFamily: ltr ? "'JetBrains Mono',monospace" : "'Tajawal',sans-serif",
          outline:'none',
          transition:'all 0.2s',
          direction: ltr ? 'ltr' : 'inherit',
          textAlign: ltr ? 'left' : 'right',
          boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,0.06)' : '0 0 0 3px rgba(59,130,246,0.06)') : 'none',
          boxSizing:'border-box',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          data-testid="password-toggle"
          style={{ position:'absolute', left: ltr ? 'auto' : 14, right: ltr ? 14 : 'auto', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,0.5)', padding:4, display:'flex', alignItems:'center', zIndex:2, transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color='#3b82f6'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(148,163,184,0.5)'}
        >
          <span style={{ fontSize:'0.72rem', fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </button>
      )}
      {error && <div style={{ fontSize:'0.7rem', color:'#ef4444', marginTop:4, paddingRight: ltr ? 0 : 4 }}>{error}</div>}
    </div>
  )
}

/* ─── Primary Button ─── */
function AuthBtn({ children, onClick, loading, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      data-testid="auth-submit-btn"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:'100%', padding:'13px 0', marginTop:4,
        background: (loading||disabled) ? 'rgba(59,130,246,0.3)' : hov ? '#2563eb' : '#3b82f6',
        border:'none', borderRadius:12,
        fontFamily:"'Tajawal',sans-serif", fontSize:'0.95rem', fontWeight:800,
        color: (loading||disabled) ? 'rgba(255,255,255,0.5)' : '#fff',
        cursor: (loading||disabled) ? 'not-allowed' : 'pointer',
        transition:'all 0.22s',
        boxShadow: hov && !loading && !disabled ? '0 8px 32px rgba(59,130,246,0.4)' : '0 4px 16px rgba(59,130,246,0.2)',
        transform: hov && !loading && !disabled ? 'translateY(-1px)' : 'none',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}
    >
      {loading
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'auth-spin 0.8s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        : children
      }
    </button>
  )
}

/* ─── Social Button ─── */
function SocialBtn({ icon, label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:1, padding:'11px 0',
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        border:`1.5px solid ${hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:12,
        color: hov ? '#e2e8f0' : '#94a3b8',
        cursor:'pointer', transition:'all 0.2s',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        fontFamily:"'Tajawal',sans-serif", fontSize:'0.82rem', fontWeight:700,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/* ─── Google Icon ─── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

/* ─── Apple Icon ─── */
const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.53-3.74 4.25z"/>
  </svg>
)

/* ─── Email Icon ─── */
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
  </svg>
)

/* ─── Lock Icon ─── */
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

/* ─── User Icon ─── */
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

/* ─── Phone Icon ─── */
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)

/* ─── OTP Screen ─── */
function OTPScreen({ icon, titleAr, titleEn, subtitleAr, subtitleEn, target, onComplete, onBack, loading, lang }) {
  return (
    <div style={{ animation:'auth-fade 0.3s ease', textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:18, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#3b82f6' }}>{icon}</div>
      <div style={{ fontSize:'1rem', fontWeight:800, color:'#e2e8f0', marginBottom:6 }}>{lang==='ar' ? titleAr : titleEn}</div>
      <div style={{ fontSize:'0.82rem', color:'#94a3b8', lineHeight:1.65, marginBottom:4 }}>
        {lang==='ar' ? subtitleAr : subtitleEn}
      </div>
      <div style={{ fontSize:'0.85rem', color:'#3b82f6', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, marginBottom:16 }}>{target}</div>
      <OTPInput onComplete={onComplete} />
      {loading && <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" style={{animation:'auth-spin 0.8s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>}
      <button onClick={onBack} data-testid="otp-back-btn" style={{ color:'#3b82f6', background:'none', border:'none', fontFamily:"'Tajawal',sans-serif", fontSize:'0.8rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, marginTop:8 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {lang==='ar' ? 'رجوع' : 'Back'}
      </button>
    </div>
  )
}

/* ─── Success Screen ─── */
function SuccessScreen({ titleAr, titleEn, descAr, descEn, btnAr, btnEn, onClose, lang }) {
  return (
    <div style={{ textAlign:'center', padding:'10px 0 16px', animation:'auth-fade 0.4s ease' }}>
      <div style={{ width:76, height:76, borderRadius:'50%', background:'rgba(34,197,94,0.08)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'auth-pop 0.5s ease' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ fontSize:'1.15rem', fontWeight:800, color:'#22c55e', marginBottom:10 }}>
        {lang==='ar' ? titleAr : titleEn}
      </div>
      <p style={{ fontSize:'0.86rem', color:'#94a3b8', lineHeight:1.75, marginBottom:24, maxWidth:300, margin:'0 auto 24px' }}>
        {lang==='ar' ? descAr : descEn}
      </p>
      <button onClick={onClose} data-testid="success-close-btn"
        style={{ padding:'12px 36px', background:'#22c55e', border:'none', borderRadius:12, color:'#fff', fontFamily:"'Tajawal',sans-serif", fontSize:'1rem', fontWeight:800, cursor:'pointer', transition:'all 0.22s', boxShadow:'0 4px 18px rgba(34,197,94,0.25)' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(34,197,94,0.35)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 18px rgba(34,197,94,0.25)' }}>
        {lang==='ar' ? btnAr : btnEn}
      </button>
    </div>
  )
}

/* ─── Password Strength ─── */
function PasswordStrength({ value, lang }) {
  const strength = getStrength(value)
  const colors = ['#ef4444','#f59e0b','#3b82f6','#22c55e']
  const labelsAr = ['ضعيفة','متوسطة','جيدة','قوية']
  const labelsEn = ['Weak','Fair','Good','Strong']

  if (!value) return null
  return (
    <div style={{ marginTop:6, marginBottom:8 }}>
      <div style={{ display:'flex', gap:3, marginBottom:4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:3, background: i < strength ? colors[strength-1] : 'rgba(255,255,255,0.06)', transition:'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize:'0.65rem', fontFamily:"'JetBrains Mono',monospace", color: colors[strength-1]||'#94a3b8' }}>
        {lang==='ar' ? labelsAr[strength-1] : labelsEn[strength-1]}
      </span>
    </div>
  )
}

/* ─── LOGIN SECTION ─── */
function LoginSection({ onClose, lang }) {
  const { login, error: authError, clearError } = useContext(AuthContext)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errs,     setErrs]     = useState({})
  const [success,  setSuccess]  = useState(false)

  // Clear auth errors when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setErrs(p => ({ ...p, email: '' }))
    clearError()
  }
  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setErrs(p => ({ ...p, password: '' }))
    clearError()
  }

  const validate = () => {
    const e = {}
    if (!email)              e.email    = lang === 'ar' ? 'مطلوب'         : 'Required'
    else if (!email.includes('@')) e.email = lang === 'ar' ? 'بريد غير صحيح' : 'Invalid email'
    if (!password)           e.password = lang === 'ar' ? 'مطلوب'         : 'Required'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)

    const result = await login({ email, password })

    setLoading(false)

    if (result.success) {
      setSuccess(true)
      // Close modal after short delay so user sees success
      setTimeout(onClose, 1200)
    }
    // if failed → authError will be set automatically by AuthContext
  }

  // ── Success Screen ──────────────────────────────────────
  if (success) return (
    <SuccessScreen
      titleAr="مرحباً بعودتك!"    titleEn="Welcome back!"
      descAr="تم تسجيل دخولك بنجاح إلى منصة Number 1 Exchange"
      descEn="You've successfully logged in to Number 1 Exchange"
      btnAr="ابدأ التداول" btnEn="Start Trading"
      onClose={onClose} lang={lang}
    />
  )

  return (
    <div style={{ animation:'auth-fade 0.3s ease' }}>
      <AuthInput
        type="email" value={email}
        placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
        onChange={handleEmailChange}
        icon={<EmailIcon />} error={errs.email} ltr autoFocus
      />
      <AuthInput
        type="password" value={password}
        placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
        onChange={handlePasswordChange}
        icon={<LockIcon />} error={errs.password} ltr
        showToggle showPassword={showPw} onTogglePassword={() => setShowPw(!showPw)}
      />

      {/* Backend error message */}
      {authError && (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 14,
          fontSize: '0.78rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {authError}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, marginTop:-4 }}>
        <label style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', userSelect:'none' }}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
            style={{ width:14, height:14, accentColor:'#3b82f6', cursor:'pointer' }}/>
          <span style={{ fontSize:'0.76rem', color:'#94a3b8' }}>
            {lang === 'ar' ? 'تذكرني' : 'Remember me'}
          </span>
        </label>
        <button onClick={() => {}}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.76rem', color:'#3b82f6', fontFamily:"'Tajawal',sans-serif", transition:'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
        </button>
      </div>

      <AuthBtn onClick={handleLogin} loading={loading}>
        {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
      </AuthBtn>

      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'rgba(148,163,184,0.4)', fontSize:'0.7rem', fontFamily:"'JetBrains Mono',monospace" }}>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
        {lang === 'ar' ? 'أو المتابعة عبر' : 'or continue with'}
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <SocialBtn icon={<GoogleIcon />} label="Google" onClick={() => {}} />
        <SocialBtn icon={<AppleIcon />} label="Apple"  onClick={() => {}} />
      </div>
    </div>
  )
}

/* ─── REGISTER SECTION ─── */
function RegisterSection({ onClose, lang }) {
  const { register, error: authError, clearError } = useContext(AuthContext)

  const [form,    setForm]    = useState({ fullName:'', email:'', phone:'', password:'', confirm:'' })
  const [showPw,  setShowPw]  = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [agreed,  setAgreed]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [errs,    setErrs]    = useState({})
  const [success, setSuccess] = useState(false)

  const upd = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrs(p => ({ ...p, [k]: '' }))
    clearError()
  }

  const validate = () => {
    const e = {}
    if (!form.fullName || form.fullName.trim().split(' ').length < 2)
      e.fullName = lang === 'ar' ? 'أدخل الاسم الثلاثي' : 'Enter full name'
    if (!form.email || !form.email.includes('@'))
      e.email    = lang === 'ar' ? 'بريد غير صحيح'    : 'Invalid email'
    if (!form.phone || form.phone.length < 8)
      e.phone    = lang === 'ar' ? 'رقم غير صحيح'     : 'Invalid number'
    if (getStrength(form.password) < 2)
      e.password = lang === 'ar' ? 'كلمة مرور ضعيفة'  : 'Too weak'
    if (form.password !== form.confirm)
      e.confirm  = lang === 'ar' ? 'لا تتطابق'         : 'Mismatch'
    if (!agreed) e.agreed = true
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    setLoading(true)

    const result = await register({
      name:     form.fullName.trim(),
      email:    form.email,
      phone:    form.phone,
      password: form.password,
    })

    setLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(onClose, 1200)
    }
  }

  // ── Success Screen ──────────────────────────────────────
  if (success) return (
    <SuccessScreen
      titleAr="تم إنشاء حسابك!" titleEn="Account Created!"
      descAr="مرحباً بك في منصة Number 1 Exchange"
      descEn="Welcome to Number 1 Exchange"
      btnAr="ابدأ الآن" btnEn="Get Started"
      onClose={onClose} lang={lang}
    />
  )

  return (
    <div style={{ animation:'auth-fade 0.3s ease' }}>
      <AuthInput
        value={form.fullName}
        placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'}
        onChange={e => upd('fullName', e.target.value)}
        icon={<UserIcon />} error={errs.fullName} autoFocus
      />
      <AuthInput
        type="email" value={form.email}
        placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
        onChange={e => upd('email', e.target.value)}
        icon={<EmailIcon />} error={errs.email} ltr
      />
      <AuthInput
        type="tel" value={form.phone} placeholder="+964 7XX XXX XXXX"
        onChange={e => upd('phone', e.target.value)}
        icon={<PhoneIcon />} error={errs.phone} ltr
      />
      <AuthInput
        type="password" value={form.password}
        placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
        onChange={e => upd('password', e.target.value)}
        icon={<LockIcon />} error={errs.password} ltr
        showToggle showPassword={showPw} onTogglePassword={() => setShowPw(!showPw)}
      />
      <PasswordStrength value={form.password} lang={lang} />
      <AuthInput
        type="password" value={form.confirm}
        placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}
        onChange={e => upd('confirm', e.target.value)}
        icon={<LockIcon />} error={errs.confirm} ltr
        showToggle showPassword={showCpw} onTogglePassword={() => setShowCpw(!showCpw)}
      />

      {/* Backend error message */}
      {authError && (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 14,
          fontSize: '0.78rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {authError}
        </div>
      )}

      <label style={{ display:'flex', alignItems:'flex-start', gap:9, cursor:'pointer', marginBottom:16, marginTop:4 }}>
        <input type="checkbox" checked={agreed}
          onChange={e => { setAgreed(e.target.checked); setErrs(p=>({...p,agreed:''})) }}
          style={{ width:14, height:14, marginTop:2, accentColor:'#3b82f6', cursor:'pointer', flexShrink:0 }}
        />
        <span style={{ fontSize:'0.75rem', color: errs.agreed ? '#ef4444' : '#94a3b8', lineHeight:1.55 }}>
          {lang === 'ar'
            ? <><span>أوافق على </span><span style={{color:'#3b82f6'}}>شروط الخدمة</span><span> و</span><span style={{color:'#3b82f6'}}>سياسة الخصوصية</span></>
            : <>I agree to the <span style={{color:'#3b82f6'}}>Terms of Service</span> and <span style={{color:'#3b82f6'}}>Privacy Policy</span></>
          }
        </span>
      </label>

      <AuthBtn onClick={handleRegister} loading={loading}>
        {lang === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
      </AuthBtn>

      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'rgba(148,163,184,0.4)', fontSize:'0.7rem', fontFamily:"'JetBrains Mono',monospace" }}>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
        {lang === 'ar' ? 'أو المتابعة عبر' : 'or continue with'}
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <SocialBtn icon={<GoogleIcon />} label="Google" onClick={() => {}} />
        <SocialBtn icon={<AppleIcon />} label="Apple"  onClick={() => {}} />
      </div>
    </div>
  )
}

/* ─── MAIN MODAL ─── */
function AuthModal({ isOpen, initialTab, onClose }) {
  const { lang } = useLang()
  const [tab, setTab] = useState(initialTab || 'login')

  useEffect(() => { if (isOpen) setTab(initialTab || 'login') }, [isOpen, initialTab])
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [isOpen])

  if (!isOpen) return null

  return (
    <div onClick={e => { if(e.target===e.currentTarget) onClose() }} data-testid="auth-modal-overlay"
      style={{
        position:'fixed', inset:0, zIndex:150,
        display:'flex', alignItems:'center', justifyContent:'center', padding:16,
        background:'radial-gradient(ellipse 120% 80% at 50% 20%, rgba(15,23,42,0.97), rgba(2,6,14,0.99))',
        backdropFilter:'blur(20px)',
      }}>
      <style>{AUTH_CSS}</style>

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-20%', left:'30%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(59,130,246,0.08),transparent 70%)', pointerEvents:'none', animation:'auth-glow 6s ease-in-out infinite' }} />
      <div style={{ position:'fixed', bottom:'-15%', right:'20%', width:'30vw', height:'30vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(6,182,212,0.05),transparent 70%)', pointerEvents:'none', animation:'auth-glow 8s ease-in-out infinite reverse' }} />

      <div onClick={e => e.stopPropagation()} data-testid="auth-modal-card"
        style={{
          background:'rgba(15,23,42,0.85)',
          border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:22,
          width:'100%', maxWidth:420,
          position:'relative',
          boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
          animation:'auth-in 0.32s cubic-bezier(.22,1,.36,1)',
          overflow:'hidden',
          display:'flex', flexDirection:'column',
          maxHeight:'95vh',
        }}>

        {/* Top gradient line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),rgba(6,182,212,0.3),transparent)' }} />

        {/* Header */}
        <div style={{ padding:'28px 28px 0', flexShrink:0, position:'relative' }}>
          {/* Close */}
          <button onClick={onClose} data-testid="auth-close-btn"
            style={{ position:'absolute', top:16, left:16, width:30, height:30, borderRadius:8, background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(148,163,184,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.18s', zIndex:10 }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(148,163,184,0.5)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <AuthLogo lang={lang} />

          {/* Heading */}
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:'1.2rem', fontWeight:900, color:'#e2e8f0', marginBottom:4 }}>
              {tab === 'login'
                ? (lang==='ar' ? 'تسجيل الدخول' : 'Sign in')
                : (lang==='ar' ? 'إنشاء حساب جديد' : 'Create an account')
              }
            </h2>
            <p style={{ fontSize:'0.78rem', color:'rgba(148,163,184,0.6)' }}>
              {tab === 'login'
                ? (lang==='ar' ? 'سجّل دخولك للوصول إلى حسابك' : 'Login to manage your account')
                : (lang==='ar' ? 'انضم لأكثر من 52,000 عميل يثقون بنا' : 'Join 52,000+ clients who trust us')
              }
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.03)', borderRadius:10, padding:3, marginBottom:20, border:'1px solid rgba(255,255,255,0.04)' }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => setTab(t)} data-testid={`auth-tab-${t}`}
                style={{
                  flex:1, padding:'8px 0', borderRadius:8,
                  background: tab===t ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: tab===t ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  fontFamily:"'Tajawal',sans-serif", fontSize:'0.85rem', fontWeight:700,
                  color: tab===t ? '#3b82f6' : 'rgba(148,163,184,0.5)',
                  cursor:'pointer', transition:'all 0.22s',
                }}>
                {t === 'login' ? (lang==='ar' ? 'تسجيل الدخول' : 'Sign In') : (lang==='ar' ? 'حساب جديد' : 'Register')}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'0 28px 28px', overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:'rgba(59,130,246,0.15) transparent' }}>
          {tab === 'login'
            ? <LoginSection onClose={onClose} lang={lang} key="login" />
            : <RegisterSection onClose={onClose} lang={lang} key="register" />
          }

          {/* Switch link */}
          <div style={{ textAlign:'center', marginTop:18, fontSize:'0.78rem', color:'rgba(148,163,184,0.5)' }}>
            {tab === 'login'
              ? <>{lang==='ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}<button onClick={() => setTab('register')} data-testid="switch-to-register" style={{ background:'none', border:'none', color:'#3b82f6', fontFamily:"'Tajawal',sans-serif", fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>{lang==='ar' ? 'أنشئ حساباً' : 'Create one'}</button></>
              : <>{lang==='ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}<button onClick={() => setTab('login')} data-testid="switch-to-login" style={{ background:'none', border:'none', color:'#3b82f6', fontFamily:"'Tajawal',sans-serif", fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>{lang==='ar' ? 'سجّل دخولك' : 'Sign in'}</button></>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
