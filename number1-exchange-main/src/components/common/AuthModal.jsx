// src/components/common/AuthModal.jsx — Number 1 Exchange — Premium Auth + Real Backend
import { useState, useEffect } from 'react'
import useLang  from '../../context/useLang'
import useAuth  from '../../context/useAuth'
import useTheme from '../../context/useTheme'
import { authAPI } from '../../services/api'

/* ─────────────────────────────── CSS ─────────────────────────────── */
const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;700&display=swap');

@keyframes n1-in    { from{opacity:0;transform:scale(.93) translateY(22px)} to{opacity:1;transform:none} }
@keyframes n1-fade  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes n1-spin  { to{transform:rotate(360deg)} }
@keyframes n1-pop   { 0%{transform:scale(.5)} 60%{transform:scale(1.12)} 100%{transform:scale(1)} }
@keyframes n1-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
@keyframes n1-glow  { 0%,100%{opacity:.3} 50%{opacity:.7} }
@keyframes n1-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes n1-rot   { to{transform:rotate(360deg)} }
@keyframes n1-blob1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,15px) scale(1.07)} }
@keyframes n1-blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,-20px) scale(1.08)} }
@keyframes n1-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,210,255,.45)} 70%{box-shadow:0 0 0 12px rgba(0,210,255,0)} }
@keyframes n1-sweep { from{left:-100%} to{left:110%} }

/* theme vars defined in index.css */
.n1-sb { scrollbar-width:thin; scrollbar-color:rgba(0,210,255,0.12) transparent; }
.n1-sb::-webkit-scrollbar { width:4px; }
.n1-sb::-webkit-scrollbar-thumb { background:rgba(0,210,255,0.12); border-radius:4px; }
`

/* ─────────────────────── pw strength ─────────────────────────────── */
function pwStrength(pw) {
  let s = 0
  if (pw.length >= 6)          s++
  if (pw.length >= 10)         s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}

/* ─────────────────────────────── Icons ───────────────────────────── */
const IcEmail  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
const IcLock   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
const IcUser   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcPhone  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
const IcCheck  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcLogin  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
const IcAdd    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
const IcSpin   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'n1-spin .75s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
const IcEye    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IcEyeOff = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const IcWarn   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.53-3.74 4.25z"/>
  </svg>
)

/* ─────────────────────── 3D Logo ──────────────────────────────────── */
function Logo3D() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
      <div style={{ position:'relative', width:62, height:62, flexShrink:0 }}>
        <div style={{ position:'absolute', bottom:-8, left:'50%', transform:'translateX(-50%)', width:46, height:10, background:'radial-gradient(ellipse,rgba(0,210,255,0.4),transparent 70%)', borderRadius:'50%', filter:'blur(5px)', animation:'n1-glow 3s ease-in-out infinite' }}/>
        <div style={{ width:62, height:62, borderRadius:18, background:'linear-gradient(145deg,#0c2040,#081525)', border:'1px solid rgba(0,210,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', boxShadow:'0 12px 40px rgba(0,120,255,0.25),inset 0 1px 0 rgba(255,255,255,0.07)', animation:'n1-pulse 3.5s infinite' }}>
          <div style={{ position:'absolute', inset:-5, background:'conic-gradient(from 0deg,transparent,rgba(0,210,255,0.09) 25%,transparent 50%,rgba(124,92,252,0.07) 75%,transparent)', animation:'n1-rot 5s linear infinite', borderRadius:18 }}/>
          <div style={{ position:'absolute', top:0, left:'-100%', width:'55%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', animation:'n1-sweep 3.2s ease-in-out infinite' }}/>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'2.1rem', fontWeight:900, background:'linear-gradient(135deg,#00eeff,#00b0d9 45%,#7c5cfc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', position:'relative', zIndex:2, filter:'drop-shadow(0 0 16px rgba(0,210,255,0.85))', animation:'n1-float 3.2s ease-in-out infinite' }}>1</span>
        </div>
      </div>
      <div style={{ lineHeight:1 }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.05rem', fontWeight:900, color:'var(--n1-accent)', letterSpacing:2.5 }}>NUMBER 1</div>
        <div style={{ fontFamily:"'Tajawal',sans-serif", fontSize:'.8rem', fontWeight:700, color:'var(--n1-accent)', opacity:0.55, letterSpacing:1.5, marginTop:4 }}>نمبر ١ للصرافة</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.42rem', color:'rgba(80,120,155,0.45)', letterSpacing:4, textTransform:'uppercase', marginTop:3 }}>EXCHANGE PLATFORM</div>
      </div>
    </div>
  )
}

/* ─────────────────────── BlobDecor ───────────────────────────────── */
function BlobDecor() {
  const { isDark } = useTheme()
  if (!isDark) return null
  return (
    <>
      <div style={{ position:'absolute', top:-100, right:-80, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,180,255,0.2),rgba(0,80,200,0.07) 55%,transparent 80%)', filter:'blur(44px)', pointerEvents:'none', animation:'n1-blob1 9s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', bottom:-70, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,92,252,0.2),rgba(60,30,150,0.05) 55%,transparent 80%)', filter:'blur(34px)', pointerEvents:'none', animation:'n1-blob2 11s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', top:'40%', right:-25, width:130, height:130, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,229,160,0.06),transparent 70%)', filter:'blur(22px)', pointerEvents:'none' }}/>
    </>
  )
}

/* ─────────────────────── Field ────────────────────────────────────── */
function Field({ label, type='text', value, onChange, placeholder, icon, error, ltr, showToggle, showPw, onTogglePw, autoFocus }) {
  const [foc, setFoc] = useState(false)
  const atype = type === 'password' && showPw ? 'text' : type
  const bc = error ? 'rgba(255,70,70,0.5)' : foc ? 'rgba(0,210,255,0.55)' : 'rgba(0,210,255,0.1)'
  const sh = error ? '0 0 0 4px rgba(255,70,70,0.07)' : foc ? '0 0 0 4px rgba(0,210,255,0.07)' : 'none'

  return (
    <div style={{ marginBottom:13 }}>
      {label && <div style={{ fontSize:'.65rem', fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:foc?'var(--n1-accent)':'var(--n1-text2)', marginBottom:6, transition:'color .2s', fontFamily:"'JetBrains Mono',monospace" }}>{label}</div>}
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', color:foc?'#00d2ff':'rgba(100,140,165,0.35)', display:'flex', alignItems:'center', pointerEvents:'none', transition:'color .2s', zIndex:2, ...(ltr?{left:13,right:'auto'}:{right:13,left:'auto'}) }}>{icon}</span>
        <input type={atype} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
          onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{ width:'100%', padding:ltr?`12px ${showToggle?42:14}px 12px 38px`:'12px 38px 12px 14px', background:error?'rgba(255,50,50,0.04)':'var(--n1-input)', border:`1.5px solid ${bc}`, borderRadius:13, color:'var(--n1-text1)', fontSize:'.86rem', fontFamily:ltr?"'JetBrains Mono',monospace":"'Tajawal',sans-serif", outline:'none', transition:'all .2s', direction:ltr?'ltr':'inherit', textAlign:ltr?'left':'inherit', boxShadow:sh, boxSizing:'border-box' }}
        />
        {showToggle && (
          <button type="button" onClick={onTogglePw}
            style={{ position:'absolute', ...(ltr?{right:12,left:'auto'}:{left:12,right:'auto'}), top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(100,140,165,0.4)', display:'flex', alignItems:'center', zIndex:2, transition:'color .2s', padding:3 }}
            onMouseEnter={e=>e.currentTarget.style.color='#00d2ff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(100,140,165,0.4)'}>
            {showPw?<IcEyeOff/>:<IcEye/>}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize:'.68rem', color:'#ff5050', marginTop:4, display:'flex', alignItems:'center', gap:4 }}><IcWarn/>{error}</div>}
    </div>
  )
}

/* ─────────────────────── PwStrength ──────────────────────────────── */
function PwStrength({ value, lang }) {
  const s = pwStrength(value)
  const COLS = ['#ef4444','#f59e0b','#3b82f6','#22c55e']
  const LAR  = ['ضعيفة','متوسطة','جيدة','قوية']
  const LEN  = ['Weak','Fair','Good','Strong']
  if (!value) return null
  return (
    <div style={{ marginTop:-7, marginBottom:11 }}>
      <div style={{ display:'flex', gap:3 }}>{[0,1,2,3].map(i=><div key={i} style={{ flex:1, height:2.5, borderRadius:3, transition:'background .3s', background:i<s?COLS[s-1]:'var(--n1-border)' }}/>)}</div>
      <span style={{ fontSize:'.62rem', fontFamily:"'JetBrains Mono',monospace", color:COLS[s-1]||'#555', marginTop:3, display:'inline-block' }}>{lang==='ar'?LAR[s-1]:LEN[s-1]}</span>
    </div>
  )
}

/* ─────────────────────── Btn ──────────────────────────────────────── */
function Btn({ children, onClick, loading, icon, green }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={!loading?onClick:undefined} onMouseEnter={()=>!loading&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:'100%', padding:'13px 0', marginTop:4, background:loading?'rgba(0,180,255,0.18)':green?(hov?'#00b36a':'#00c97a'):hov?'#0092d9':'linear-gradient(135deg,#00c2ec,#007ec7)', border:'none', borderRadius:15, fontFamily:"'Tajawal',sans-serif", fontSize:'.96rem', fontWeight:800, color:loading?'rgba(0,210,255,0.4)':'#000', cursor:loading?'not-allowed':'pointer', transition:'all .22s', boxShadow:hov&&!loading?'0 12px 40px rgba(0,200,255,0.4)':'0 5px 20px rgba(0,180,255,0.2)', transform:hov&&!loading?'translateY(-2px)':'none', display:'flex', alignItems:'center', justifyContent:'center', gap:9, position:'relative', overflow:'hidden' }}>
      {hov&&!loading&&<span style={{ position:'absolute', top:0, left:'-100%', width:'55%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.17),transparent)', animation:'n1-sweep .55s ease-in-out forwards', pointerEvents:'none' }}/>}
      {loading?<><IcSpin/>{children}</>:<>{icon}{children}</>}
    </button>
  )
}

/* ─────────────────────── SocialBtn ───────────────────────────────── */
function SocialBtn({ icon, label }) {
  const [hov, setHov] = useState(false)
  return (
    <button onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ flex:1, padding:'11px 0', background:hov?'var(--n1-input)':'transparent', border:`1.5px solid ${hov?'var(--n1-border)':'transparent'}`, borderRadius:13, color:hov?'var(--n1-text1)':'var(--n1-text2)', cursor:'pointer', transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:"'Tajawal',sans-serif", fontSize:'.82rem', fontWeight:700, transform:hov?'translateY(-1px)':'none' }}>
      {icon}{label}
    </button>
  )
}

/* ─────────────────────── Divider ──────────────────────────────────── */
function Divider({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:11, margin:'20px 0', color:'rgba(80,115,145,0.3)', fontSize:'.65rem', fontFamily:"'JetBrains Mono',monospace" }}>
      <div style={{ flex:1, height:1, background:'rgba(0,210,255,0.07)' }}/>{children}<div style={{ flex:1, height:1, background:'rgba(0,210,255,0.07)' }}/>
    </div>
  )
}

/* ─────────────────────── ApiError banner ──────────────────────────── */
function ApiError({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background:'rgba(255,60,60,0.07)', border:'1px solid rgba(255,60,60,0.22)', borderRadius:11, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:9, animation:'n1-fade .25s ease' }}>
      <span style={{ color:'#ff5050', flexShrink:0 }}><IcWarn/></span>
      <span style={{ fontSize:'.8rem', color:'#e05050', fontFamily:"'Tajawal',sans-serif", lineHeight:1.5 }}>{msg}</span>
    </div>
  )
}

/* ─────────────────────── SuccessScreen ────────────────────────────── */
function SuccessScreen({ titleAr, titleEn, descAr, descEn, btnAr, btnEn, onClose, lang }) {
  return (
    <div style={{ textAlign:'center', padding:'14px 0 20px', animation:'n1-fade .4s ease' }}>
      <div style={{ width:84, height:84, borderRadius:'50%', background:'rgba(0,229,160,0.09)', border:'2px solid rgba(0,229,160,0.32)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', animation:'n1-pop .5s ease', color:'#00e5a0' }}>
        <IcCheck/>
      </div>
      <div style={{ fontSize:'1.2rem', fontWeight:900, color:'#00e5a0', marginBottom:10 }}>{lang==='ar'?titleAr:titleEn}</div>
      <p style={{ fontSize:'.85rem', color:'rgba(130,160,188,0.6)', lineHeight:1.8, maxWidth:310, margin:'0 auto 28px' }}>{lang==='ar'?descAr:descEn}</p>
      <Btn onClick={onClose} green icon={<IcCheck/>}>{lang==='ar'?btnAr:btnEn}</Btn>
    </div>
  )
}

/* ──────────────────────────── LOGIN ───────────────────────────────── */
function ForgotPasswordSection({ onBack, lang }) {
  const ar = lang === 'ar'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setEmailErr(ar ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Enter a valid email address')
      return
    }

    setEmailErr('')
    setApiErr('')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: normalizedEmail })
      setDone(true)
    } catch (err) {
      setApiErr(err.response?.data?.message || (ar ? 'تعذر إرسال رابط إعادة التعيين' : 'Unable to send the reset link'))
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <SuccessScreen
      titleAr="تحقق من بريدك الإلكتروني"
      titleEn="Check your email"
      descAr="إذا كان البريد مسجلاً، ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور."
      descEn="If this email is registered, you will receive a link to reset your password."
      btnAr="العودة لتسجيل الدخول"
      btnEn="Back to sign in"
      onClose={onBack}
      lang={lang}
    />
  )

  return (
    <div style={{ animation:'n1-fade .28s ease' }}>
      <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#e8f4ff', marginBottom:5 }}>
        {ar ? 'إعادة تعيين كلمة المرور' : 'Reset your password'}
      </div>
      <div style={{ fontSize:'.8rem', color:'rgba(120,152,180,0.55)', marginBottom:22, lineHeight:1.6 }}>
        {ar ? 'أدخل بريدك الإلكتروني لنرسل لك رابط إعادة التعيين.' : 'Enter your email and we’ll send you a reset link.'}
      </div>

      <ApiError msg={apiErr}/>
      <Field
        type="email"
        label={ar ? 'البريد الإلكتروني' : 'Email Address'}
        value={email}
        placeholder="example@email.com"
        onChange={e => { setEmail(e.target.value); setEmailErr(''); setApiErr('') }}
        icon={<IcEmail/>}
        error={emailErr}
        ltr
        autoFocus
      />
      <Btn onClick={handleSubmit} loading={loading} icon={<IcEmail/>}>
        {ar ? 'إرسال رابط التعيين' : 'Send reset link'}
      </Btn>
      <button
        type="button"
        onClick={onBack}
        style={{ width:'100%', marginTop:14, background:'none', border:'none', color:'rgba(0,210,255,0.75)', fontFamily:"'Tajawal',sans-serif", fontSize:'.8rem', cursor:'pointer' }}
      >
        {ar ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
      </button>
    </div>
  )
}

function ResetPasswordSection({ token, onBack, lang }) {
  const ar = lang === 'ar'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr] = useState('')
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    const nextErrors = {}
    if (!token) nextErrors.form = ar ? 'رابط إعادة التعيين غير صالح' : 'This reset link is invalid'
    if (password.length < 6) nextErrors.password = ar ? 'كلمة المرور يجب أن تكون 6 أحرف أو أكثر' : 'Password must be at least 6 characters'
    if (password !== confirm) nextErrors.confirm = ar ? 'كلمتا المرور لا تتطابقان' : 'Passwords do not match'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setApiErr('')
    setLoading(true)
    try {
      await authAPI.resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setApiErr(err.response?.data?.message || (ar ? 'تعذر إعادة تعيين كلمة المرور' : 'Unable to reset your password'))
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <SuccessScreen
      titleAr="تم تغيير كلمة المرور"
      titleEn="Password updated"
      descAr="يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
      descEn="You can now sign in with your new password."
      btnAr="العودة لتسجيل الدخول"
      btnEn="Back to sign in"
      onClose={onBack}
      lang={lang}
    />
  )

  return (
    <div style={{ animation:'n1-fade .28s ease' }}>
      <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#e8f4ff', marginBottom:5 }}>
        {ar ? 'اختر كلمة مرور جديدة' : 'Choose a new password'}
      </div>
      <div style={{ fontSize:'.8rem', color:'rgba(120,152,180,0.55)', marginBottom:22, lineHeight:1.6 }}>
        {ar ? 'يجب أن تتكون كلمة المرور من 6 أحرف أو أكثر.' : 'Your password must be at least 6 characters.'}
      </div>

      <ApiError msg={apiErr || errors.form}/>
      <Field
        type="password"
        label={ar ? 'كلمة المرور الجديدة' : 'New Password'}
        value={password}
        placeholder="••••••••••••"
        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password:'', form:'' })) }}
        icon={<IcLock/>}
        error={errors.password}
        ltr
        showToggle
        showPw={showPw}
        onTogglePw={() => setShowPw(v => !v)}
        autoFocus
      />
      <PwStrength value={password} lang={lang}/>
      <Field
        type="password"
        label={ar ? 'تأكيد كلمة المرور' : 'Confirm Password'}
        value={confirm}
        placeholder="••••••••••••"
        onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm:'', form:'' })) }}
        icon={<IcLock/>}
        error={errors.confirm}
        ltr
        showToggle
        showPw={showConfirm}
        onTogglePw={() => setShowConfirm(v => !v)}
      />
      <Btn onClick={handleSubmit} loading={loading} icon={<IcCheck/>}>
        {ar ? 'تغيير كلمة المرور' : 'Update password'}
      </Btn>
      <button
        type="button"
        onClick={onBack}
        style={{ width:'100%', marginTop:14, background:'none', border:'none', color:'rgba(0,210,255,0.75)', fontFamily:"'Tajawal',sans-serif", fontSize:'.8rem', cursor:'pointer' }}
      >
        {ar ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
      </button>
    </div>
  )
}

function LoginSection({ onClose, onForgot, lang }) {
  const { login, clearError } = useAuth()
  const ar = lang === 'ar'
  const [email, setEmail]       = useState('')
  const [pw, setPw]             = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [apiErr, setApiErr]     = useState('')
  const [errs, setErrs]         = useState({})
  const [shake, setShake]       = useState(false)
  const [done, setDone]         = useState(false)

  useEffect(() => { clearError?.() }, [])

  const validate = () => {
    const e = {}
    if (!email)                         e.email = ar?'البريد مطلوب':'Email required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = ar?'بريد غير صحيح':'Invalid email'
    if (!pw)                            e.pw    = ar?'كلمة المرور مطلوبة':'Password required'
    setErrs(e)
    if (Object.keys(e).length) { setShake(true); setTimeout(()=>setShake(false),540) }
    return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true); setApiErr('')
    const res = await login({ email: email.trim().toLowerCase(), password: pw })
    setLoading(false)
    if (res.success) {
      setDone(true)
    } else {
      const m = res.message || ''
      setApiErr(ar
        ? (m.includes('Invalid')||m.includes('password'))  ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        : m.includes('deactivated') ? 'الحساب موقوف، تواصل مع الدعم'
        : m || 'حدث خطأ، حاول مرة أخرى'
        : m || 'Something went wrong, try again'
      )
      setShake(true); setTimeout(()=>setShake(false),540)
    }
  }

  if (done) return (
    <SuccessScreen
      titleAr="مرحباً بعودتك!" titleEn="Welcome back!"
      descAr="تم تسجيل دخولك بنجاح إلى منصة Number 1 Exchange"
      descEn="You've successfully signed in to Number 1 Exchange"
      btnAr="ابدأ الآن" btnEn="Let's go"
      onClose={onClose} lang={lang}
    />
  )

  return (
    <div style={{ animation:'n1-fade .28s ease' }}>
      <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#e8f4ff', marginBottom:4, lineHeight:1.2 }}>{ar?'أهلاً بعودتك':'Welcome back'}</div>
      <div style={{ fontSize:'.8rem', color:'rgba(120,152,180,0.55)', marginBottom:22 }}>{ar?'سجّل دخولك للوصول إلى حسابك':'Sign in to access your account'}</div>

      <ApiError msg={apiErr}/>

      <div style={{ animation:shake?'n1-shake .45s ease':'none' }}>
        <Field type="email" label={ar?'البريد الإلكتروني':'Email Address'} value={email} placeholder="example@email.com"
          onChange={e=>{setEmail(e.target.value);setErrs(p=>({...p,email:''}));setApiErr('')}}
          icon={<IcEmail/>} error={errs.email} ltr autoFocus />
        <Field type="password" label={ar?'كلمة المرور':'Password'} value={pw} placeholder="••••••••••••"
          onChange={e=>{setPw(e.target.value);setErrs(p=>({...p,pw:''}));setApiErr('')}}
          icon={<IcLock/>} error={errs.pw} ltr showToggle showPw={showPw} onTogglePw={()=>setShowPw(v=>!v)} />
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'10px 0 18px' }}>
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
          <div onClick={()=>setRemember(v=>!v)}
            style={{ width:17, height:17, borderRadius:5, border:`1.5px solid ${remember?'#00d2ff':'rgba(0,210,255,0.2)'}`, background:remember?'#00d2ff':'rgba(0,210,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .17s', flexShrink:0 }}>
            {remember&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span style={{ fontSize:'.74rem', color:'rgba(120,150,175,0.55)' }}>{ar?'تذكرني':'Remember me'}</span>
        </label>
        <button type="button" onClick={onForgot} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'.74rem', color:'rgba(0,210,255,0.65)', fontFamily:"'Tajawal',sans-serif", transition:'color .2s' }}
          onMouseEnter={e=>e.currentTarget.style.color='#00d2ff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(0,210,255,0.65)'}>
          {ar?'نسيت كلمة المرور؟':'Forgot password?'}
        </button>
      </div>

      <Btn onClick={handleSubmit} loading={loading} icon={<IcLogin/>}>{ar?'تسجيل الدخول':'Sign In'}</Btn>
      <Divider>{ar?'أو المتابعة عبر':'or continue with'}</Divider>
      <div style={{ display:'flex', gap:9 }}>
        <SocialBtn icon={<GoogleIcon/>} label="Google"/>
        <SocialBtn icon={<AppleIcon/>}  label="Apple"/>
      </div>
    </div>
  )
}

/* ──────────────────────────── REGISTER ────────────────────────────── */
function RegisterSection({ onClose, lang }) {
  const { register, clearError } = useAuth()
  const ar = lang === 'ar'
  const [form, setForm]       = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [showPw, setShowPw]   = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [agreed, setAgreed]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')
  const [errs, setErrs]       = useState({})
  const [done, setDone]       = useState(false)
  const upd = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(() => { clearError?.() }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().split(/\s+/).length < 2)
      e.name     = ar?'أدخل الاسم الثلاثي كاملاً':'Enter full name (at least 2 words)'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email    = ar?'بريد إلكتروني غير صحيح':'Invalid email address'
    if (form.phone && form.phone.trim().length < 7)
      e.phone    = ar?'رقم الهاتف غير صحيح':'Invalid phone number'
    if (!form.password || form.password.length < 6)
      e.password = ar?'كلمة المرور يجب أن تكون 6 أحرف أو أكثر':'Password must be at least 6 characters'
    if (form.password !== form.confirm)
      e.confirm  = ar?'كلمتا المرور لا تتطابقان':'Passwords do not match'
    if (!agreed)
      e.agreed   = true
    setErrs(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true); setApiErr('')
    const payload = {
      name:     form.name.trim(),
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      ...(form.phone.trim() && { phone: form.phone.trim() }),
    }
    const res = await register(payload)
    setLoading(false)
    if (res.success) {
      setDone(true)
    } else {
      const m = res.message || ''
      setApiErr(ar
        ? m.includes('already') ? 'هذا البريد الإلكتروني مسجّل مسبقاً'
        : m.includes('Password') ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        : m || 'حدث خطأ، حاول مرة أخرى'
        : m || 'Something went wrong, try again'
      )
    }
  }

  if (done) return (
    <SuccessScreen
      titleAr="تم إنشاء حسابك!" titleEn="Account Created!"
      descAr="مرحباً بك في عائلة Number 1 Exchange. يمكنك الآن بدء التداول."
      descEn="Welcome to Number 1 Exchange! You can now start trading."
      btnAr="ابدأ التداول" btnEn="Start Trading"
      onClose={onClose} lang={lang}
    />
  )

  return (
    <div style={{ animation:'n1-fade .28s ease' }}>
      <div style={{ fontSize:'1.42rem', fontWeight:900, color:'#e8f4ff', marginBottom:4, lineHeight:1.2 }}>{ar?'إنشاء حساب جديد':'Create an account'}</div>
      <div style={{ fontSize:'.8rem', color:'rgba(120,152,180,0.55)', marginBottom:20 }}>{ar?'انضم لأكثر من ٥٢،٠٠٠ عميل يثقون بنا':'Join 52,000+ clients who trust us'}</div>

      <ApiError msg={apiErr}/>

      <Field label={ar?'الاسم الكامل':'Full Name'} value={form.name}
        placeholder={ar?'محمد أحمد علي':'John Smith'}
        onChange={e=>{upd('name',e.target.value);setErrs(p=>({...p,name:''}))}}
        icon={<IcUser/>} error={errs.name} autoFocus />
      <Field type="email" label={ar?'البريد الإلكتروني':'Email Address'} value={form.email}
        placeholder="example@email.com"
        onChange={e=>{upd('email',e.target.value);setErrs(p=>({...p,email:''}));setApiErr('')}}
        icon={<IcEmail/>} error={errs.email} ltr />
      <Field type="tel" label={ar?'رقم الهاتف (اختياري)':'Phone Number (optional)'} value={form.phone}
        placeholder="+964 7XX XXX XXXX"
        onChange={e=>{upd('phone',e.target.value);setErrs(p=>({...p,phone:''}))}}
        icon={<IcPhone/>} error={errs.phone} ltr />
      <Field type="password" label={ar?'كلمة المرور':'Password'} value={form.password}
        placeholder="••••••••••••"
        onChange={e=>{upd('password',e.target.value);setErrs(p=>({...p,password:''}))}}
        icon={<IcLock/>} error={errs.password} ltr showToggle showPw={showPw} onTogglePw={()=>setShowPw(v=>!v)} />
      <PwStrength value={form.password} lang={lang}/>
      <Field type="password" label={ar?'تأكيد كلمة المرور':'Confirm Password'} value={form.confirm}
        placeholder="••••••••••••"
        onChange={e=>{upd('confirm',e.target.value);setErrs(p=>({...p,confirm:''}))}}
        icon={<IcLock/>} error={errs.confirm} ltr showToggle showPw={showCpw} onTogglePw={()=>setShowCpw(v=>!v)} />

      {/* Terms */}
      <label style={{ display:'flex', alignItems:'flex-start', gap:9, cursor:'pointer', marginBottom:15, marginTop:4 }}>
        <div onClick={()=>{setAgreed(v=>!v);setErrs(p=>({...p,agreed:''}))}}
          style={{ width:17, height:17, borderRadius:5, marginTop:2, border:`1.5px solid ${errs.agreed?'#ff5050':agreed?'#00d2ff':'rgba(0,210,255,0.2)'}`, background:agreed?'#00d2ff':errs.agreed?'rgba(255,50,50,0.06)':'rgba(0,210,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .17s', flexShrink:0 }}>
          {agreed&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontSize:'.74rem', color:errs.agreed?'#ff5050':'rgba(120,150,175,0.55)', lineHeight:1.6 }}>
          {ar
            ? <>{`أوافق على `}<span style={{color:'#00d2ff',cursor:'pointer'}}>شروط الخدمة</span>{` و`}<span style={{color:'#00d2ff',cursor:'pointer'}}>سياسة الخصوصية</span></>
            : <>I agree to the <span style={{color:'#00d2ff',cursor:'pointer'}}>Terms of Service</span> and <span style={{color:'#00d2ff',cursor:'pointer'}}>Privacy Policy</span></>
          }
        </span>
      </label>

      <Btn onClick={handleSubmit} loading={loading} icon={<IcAdd/>}>{ar?'إنشاء الحساب':'Create Account'}</Btn>
      <Divider>{ar?'أو المتابعة عبر':'or continue with'}</Divider>
      <div style={{ display:'flex', gap:9 }}>
        <SocialBtn icon={<GoogleIcon/>} label="Google"/>
        <SocialBtn icon={<AppleIcon/>}  label="Apple"/>
      </div>
    </div>
  )
}

/* ─────────────────────── MAIN MODAL ───────────────────────────────── */
function AuthModal({ isOpen, type, initialTab, onClose, resetToken }) {
  const { lang } = useLang()
  const activeTab = type || initialTab || 'login'
  const [tab, setTab] = useState(activeTab)

  useEffect(() => { if (isOpen) setTab(activeTab) }, [isOpen, activeTab])
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null
  const ar = lang === 'ar'

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}}
      style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'var(--n1-overlay)', backdropFilter:'blur(24px)' }}>
      <style>{AUTH_CSS}</style>

      {/* ambient BG - dark only */}
      <div style={{ position:'fixed', top:'-18%', right:'22%', width:'42vw', height:'42vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(0,175,255,0.07),transparent 70%)', pointerEvents:'none', animation:'n1-glow 7s ease-in-out infinite' }}/>
      <div style={{ position:'fixed', bottom:'-12%', left:'12%', width:'34vw', height:'34vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(124,92,252,0.06),transparent 70%)', pointerEvents:'none', animation:'n1-glow 9s ease-in-out infinite reverse' }}/>

      {/* Card */}
      <div onClick={e=>e.stopPropagation()}
        style={{ background:'var(--n1-card)', border:'1px solid var(--n1-border)', borderRadius:28, width:'100%', maxWidth:436, position:'relative', boxShadow:'var(--shadow,0 40px 100px rgba(0,0,0,0.5))', animation:'n1-in .35s cubic-bezier(.22,1,.36,1)', overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'95vh' }}>

        {/* top line */}
        <div style={{ position:'absolute', top:0, left:26, right:26, height:2, background:'linear-gradient(90deg,transparent,var(--n1-accent) 30%,#7c5cfc 70%,transparent)', borderRadius:2 }}/>

        <BlobDecor/>

        {/* ── Header ── */}
        <div style={{ padding:'28px 28px 0', flexShrink:0, position:'relative', zIndex:2 }}>
          {/* close */}
          <button onClick={onClose}
            style={{ position:'absolute', top:17, left:17, width:31, height:31, borderRadius:9, background:'transparent', border:'1px solid var(--n1-border)', color:'var(--n1-text2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s', zIndex:10 }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,55,55,0.08)';e.currentTarget.style.borderColor='rgba(255,55,55,0.22)';e.currentTarget.style.color='#ff5050'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(0,210,255,0.09)';e.currentTarget.style.color='rgba(120,150,175,0.4)'}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <Logo3D/>

          {/* tabs */}
          {!['forgot', 'reset'].includes(tab) && (
            <div style={{ display:'flex', background:'rgba(255,255,255,0.022)', borderRadius:12, padding:3, marginBottom:22, border:'1px solid var(--n1-border)' }}>
            {['login','register'].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ flex:1, padding:'9px 0', borderRadius:10, background:tab===t?'rgba(0,210,255,0.1)':'transparent', border:tab===t?'1px solid rgba(0,210,255,0.2)':'1px solid transparent', fontFamily:"'Tajawal',sans-serif", fontSize:'.86rem', fontWeight:700, color:tab===t?'#00d2ff':'rgba(100,135,162,0.38)', cursor:'pointer', transition:'all .22s' }}>
                {t==='login'?(ar?'تسجيل الدخول':'Sign In'):(ar?'حساب جديد':'Register')}
              </button>
            ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="n1-sb" style={{ padding:'0 28px 28px', overflowY:'auto', flex:1, position:'relative', zIndex:2 }}>
          {tab === 'forgot'
            ? <ForgotPasswordSection onBack={() => setTab('login')} lang={lang} key="forgot" />
            : tab === 'reset'
              ? <ResetPasswordSection token={resetToken} onBack={() => setTab('login')} lang={lang} key="reset" />
              : tab === 'login'
                ? <LoginSection onClose={onClose} onForgot={() => setTab('forgot')} lang={lang} key="login" />
                : <RegisterSection onClose={onClose} lang={lang} key="register" />
          }

          {/* switch */}
          {!['forgot', 'reset'].includes(tab) && (
            <div style={{ textAlign:'center', marginTop:18, fontSize:'.76rem', color:'rgba(100,135,162,0.42)' }}>
            {tab==='login'
              ? <>{ar?'ليس لديك حساب؟ ':"Don't have an account? "}
                  <button onClick={()=>setTab('register')} style={{ background:'none', border:'none', color:'rgba(0,210,255,0.75)', fontFamily:"'Tajawal',sans-serif", fontSize:'.76rem', fontWeight:700, cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.color='#00d2ff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(0,210,255,0.75)'}>
                    {ar?'أنشئ حساباً':'Create one'}
                  </button></>
              : <>{ar?'لديك حساب بالفعل؟ ':'Already have an account? '}
                  <button onClick={()=>setTab('login')} style={{ background:'none', border:'none', color:'rgba(0,210,255,0.75)', fontFamily:"'Tajawal',sans-serif", fontSize:'.76rem', fontWeight:700, cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.color='#00d2ff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(0,210,255,0.75)'}>
                    {ar?'سجّل دخولك':'Sign in'}
                  </button></>
            }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
