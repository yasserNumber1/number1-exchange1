// src/components/AuthModal.jsx
// ═══════════════════════════════════════════════════════
// نافذة تسجيل الدخول وإنشاء الحساب
//
// تسجيل الدخول — 3 خطوات:
//   1. بريد + كلمة مرور + كابتشا
//   2. OTP بريد إلكتروني
//   3. شاشة نجاح
//
// إنشاء حساب — 4 خطوات:
//   1. اسم + بريد + هاتف + كلمة مرور
//   2. OTP بريد
//   3. OTP هاتف
//   4. شاشة نجاح
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react'
import useLang from '../context/useLang'

// ══ مقياس قوة كلمة المرور ══
function getStrength(pw) {
  let s = 0
  if (pw.length >= 8)           s++
  if (/[A-Z]/.test(pw))         s++
  if (/[0-9]/.test(pw))         s++
  if (/[^A-Za-z0-9]/.test(pw))  s++
  return s
}

// ══ حقل OTP (6 خانات) ══
function OTPInput({ onComplete }) {
  const [vals, setVals] = useState(['','','','','',''])
  const refs = useRef([])

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...vals]
    next[i] = v
    setVals(next)
    if (v && i < 5) refs.current[i+1]?.focus()
    if (next.every(x => x !== '')) onComplete(next.join(''))
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) {
      refs.current[i-1]?.focus()
      const next = [...vals]; next[i-1] = ''; setVals(next)
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (text.length === 6) {
      setVals(text.split(''))
      onComplete(text)
      refs.current[5]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div style={{ display:'flex', gap:9, justifyContent:'center', margin:'20px 0', direction:'ltr' }}>
      {vals.map((v,i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width:46, height:52, borderRadius:11, textAlign:'center',
            background: v ? 'rgba(0,210,255,0.05)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${v ? 'rgba(0,210,255,0.4)' : 'var(--border-1)'}`,
            fontFamily:"'JetBrains Mono',monospace", fontSize:'1.5rem', fontWeight:700,
            color:'var(--cyan)', outline:'none', transition:'all 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor='var(--border-2)'; e.target.style.boxShadow='0 0 0 3px rgba(0,210,255,0.08)' }}
          onBlur={e  => { e.target.style.borderColor = v ? 'rgba(0,210,255,0.4)' : 'var(--border-1)'; e.target.style.boxShadow='none' }}
        />
      ))}
    </div>
  )
}

// ══ زر إرسال عام ══
function SubmitBtn({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width:'100%', padding:13, marginTop:13,
        background: disabled ? 'rgba(0,159,192,0.4)' : 'linear-gradient(135deg,#009fc0,#006e9e)',
        border:'none', borderRadius:12,
        fontFamily:"'Tajawal',sans-serif", fontSize:'1.02rem', fontWeight:800,
        color:'#fff', cursor: disabled ? 'not-allowed' : 'pointer',
        transition:'all 0.3s', opacity: loading ? 0.8 : 1,
        boxShadow: disabled ? 'none' : '0 4px 22px rgba(0,159,192,0.22)',
      }}
      onMouseEnter={e => { if (!disabled&&!loading) { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 34px rgba(0,210,255,0.38)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=disabled?'none':'0 4px 22px rgba(0,159,192,0.22)' }}
    >
      {loading ? <><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{animation:'spin 1s linear infinite'}}><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg> ...</> : children}
    </button>
  )
}

// ══ حقل إدخال عام ══
function Field({ label, type='text', value, onChange, placeholder, hint, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:'0.72rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.5, marginBottom:5 }}>{label}</label>}
      {children || (
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:'100%', padding:'10px 13px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-1)', borderRadius:9, color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', outline:'none', textAlign:'right', transition:'border-color 0.22s, box-shadow 0.22s' }}
          onFocus={e => { e.target.style.borderColor='var(--border-2)'; e.target.style.boxShadow='0 0 0 3px rgba(0,210,255,0.05)' }}
          onBlur={e  => { e.target.style.borderColor='var(--border-1)'; e.target.style.boxShadow='none' }}
        />
      )}
      {hint && <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:5 }}>{hint}</div>}
    </div>
  )
}

// ══ حقل كلمة المرور مع زر الإظهار ══
function PasswordField({ label, value, onChange, placeholder, showStrength }) {
  const { t } = useLang()
  const [show, setShow] = useState(false)
  const strength = getStrength(value)
  const strengthColors = ['var(--red)','var(--gold)','#7dc3f7','var(--green)']
  const strengthLabels = [t('auth_pw_strength_1'), t('auth_pw_strength_2'), t('auth_pw_strength_3'), t('auth_pw_strength_4')]
  const rules = [
    { key:'auth_rule_len', ok: value.length >= 8 },
    { key:'auth_rule_up',  ok: /[A-Z]/.test(value) },
    { key:'auth_rule_num', ok: /[0-9]/.test(value) },
    { key:'auth_rule_sym', ok: /[^A-Za-z0-9]/.test(value) },
  ]

  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:'block', fontSize:'0.72rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.5, marginBottom:5 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:'100%', padding:'10px 40px 10px 13px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-1)', borderRadius:9, color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.88rem', outline:'none', textAlign:'right', transition:'border-color 0.22s, box-shadow 0.22s' }}
          onFocus={e => { e.target.style.borderColor='var(--border-2)'; e.target.style.boxShadow='0 0 0 3px rgba(0,210,255,0.05)' }}
          onBlur={e  => { e.target.style.borderColor='var(--border-1)'; e.target.style.boxShadow='none' }}
        />
        <button type="button" onClick={() => setShow(!show)}
          style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'0.9rem', padding:4, transition:'color 0.2s', lineHeight:1 }}
          onMouseEnter={e => e.currentTarget.style.color='var(--cyan)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {showStrength && value && (
        <>
          <div style={{ display:'flex', gap:4, marginTop:7 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < strength ? strengthColors[strength-1] : 'rgba(255,255,255,0.06)', transition:'background 0.3s' }} />
            ))}
          </div>
          <div style={{ fontSize:'0.68rem', fontFamily:"'JetBrains Mono',monospace", color: strengthColors[strength-1]||'var(--text-3)', marginTop:5 }}>
            {value ? strengthLabels[strength-1] : ''}
          </div>
          <div style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--border-1)', borderRadius:9, padding:'10px 13px', marginTop:9, display:'flex', flexDirection:'column', gap:5 }}>
            {rules.map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.73rem', color: r.ok ? 'var(--green)' : 'var(--text-3)', transition:'color 0.2s' }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background: r.ok ? 'var(--green)' : 'var(--text-3)', flexShrink:0, transition:'background 0.2s' }} />
                {t(r.key)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ══ شاشة النجاح ══
function SuccessScreen({ title, desc, btnLabel, onClose }) {
  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(0,229,160,0.1)', border:'2px solid rgba(0,229,160,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:'2rem', animation:'popIn 0.5s ease' }}>✓</div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.1rem', fontWeight:700, color:'var(--green)', marginBottom:8 }}>{title}</div>
      <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.65, marginBottom:20 }}>{desc}</p>
      <button onClick={onClose}
        style={{ padding:'12px 30px', background:'linear-gradient(135deg,#00c97a,#009960)', border:'none', borderRadius:12, color:'#fff', fontFamily:"'Tajawal',sans-serif", fontSize:'1rem', fontWeight:800, cursor:'pointer', transition:'all 0.3s' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,229,160,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
        {btnLabel}
      </button>
    </div>
  )
}

// ══ رأس النافذة ══
function ModalHeader({ title, onClose }) {
  return (
    <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:11, background:'var(--cyan-dim)', border:'1px solid rgba(0,210,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'var(--cyan)', letterSpacing:1 }}>{title}</div>
      </div>
      <button onClick={onClose}
        style={{ width:32, height:32, borderRadius:8, background:'transparent', border:'1px solid var(--border-1)', color:'var(--text-2)', fontSize:'1.1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,61,90,0.1)'; e.currentTarget.style.borderColor='rgba(255,61,90,0.3)'; e.currentTarget.style.color='var(--red)' }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='var(--border-1)'; e.currentTarget.style.color='var(--text-2)' }}>
        ✕
      </button>
    </div>
  )
}

// ══ تبويبات ══
function AuthTabs({ active, onSwitch, t }) {
  return (
    <div style={{ display:'flex', marginBottom:22, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3 }}>
      {['login','register'].map(tab => (
        <button key={tab} onClick={() => onSwitch(tab)}
          style={{ flex:1, padding:9, borderRadius:8, background: active===tab ? 'var(--cyan-dim)' : 'transparent', border:'none', fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', fontWeight:700, color: active===tab ? 'var(--cyan)' : 'var(--text-2)', cursor:'pointer', transition:'all 0.22s', boxShadow: active===tab ? '0 2px 12px rgba(0,210,255,0.15)' : 'none' }}>
          {tab === 'login' ? t('auth_login') : t('auth_register')}
        </button>
      ))}
    </div>
  )
}

// ══ الكابتشا ══
function Captcha({ onVerify, t }) {
  const [a, setA] = useState(() => Math.floor(Math.random()*9)+1)
  const [b, setB] = useState(() => Math.floor(Math.random()*9)+1)
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)

  const refresh = () => { setA(Math.floor(Math.random()*9)+1); setB(Math.floor(Math.random()*9)+1); setVal(''); setErr(false) }

  const verify = useCallback(() => {
    if (parseInt(val) === a * b) { onVerify(true); setErr(false) }
    else { setErr(true); refresh(); onVerify(false) }
  }, [val, a, b, onVerify])

  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-1)', borderRadius:9, padding:11, margin:'12px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.8rem', fontWeight:700, color:'var(--cyan)', textShadow:'0 0 18px rgba(0,210,255,0.7)', letterSpacing:2, fontStyle:'italic', textDecoration:'line-through', textDecorationColor:'rgba(0,210,255,0.22)' }}>{a}</span>
      <span style={{ fontSize:'1.3rem', color:'var(--text-3)' }}>✕</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'1.8rem', fontWeight:700, color:'var(--cyan)', textShadow:'0 0 18px rgba(0,210,255,0.7)', letterSpacing:2, fontStyle:'italic', textDecoration:'line-through', textDecorationColor:'rgba(0,210,255,0.22)' }}>{b}</span>
      <span style={{ fontSize:'1.3rem', color:'var(--text-3)' }}>=</span>
      <input
        type="number" value={val} onChange={e => { setVal(e.target.value); setErr(false) }}
        onBlur={verify}
        placeholder="?"
        style={{ width:50, height:38, textAlign:'center', background: err ? 'rgba(255,61,90,0.08)' : 'rgba(0,210,255,0.06)', border: `1px solid ${err ? 'var(--red)' : 'var(--border-1)'}`, borderRadius:8, fontFamily:"'JetBrains Mono',monospace", fontSize:'1rem', fontWeight:700, color:'var(--text-1)', outline:'none', transition:'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor='var(--border-2)'}
      />
    </div>
  )
}

// ══ قسم تسجيل الدخول ══
function LoginSection({ onClose, t }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaOk, setCaptchaOk] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStep1 = () => {
    if (!email || !password) { alert(t('auth_fill_all')); return }
    if (!captchaOk) { alert(t('auth_captcha_wrong')); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(2) }, 800)
  }

  const handleStep2 = (otp) => {
    if (otp.length === 6) {
      setLoading(true)
      setTimeout(() => { setLoading(false); setStep(3) }, 1000)
    }
  }

  if (step === 3) return (
    <SuccessScreen
      title={t('auth_success_login')}
      desc={t('auth_welcome')}
      btnLabel={t('auth_continue')}
      onClose={onClose}
    />
  )

  if (step === 2) return (
    <div>
      <div style={{ width:60, height:60, borderRadius:18, background:'var(--cyan-dim)', border:'1px solid rgba(0,210,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'1.8rem' }}>📧</div>
      <div style={{ textAlign:'center', fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.65, marginBottom:20 }}>
        {t('auth_otp_title')}<br />
        <span style={{ color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{email}</span>
      </div>
      <OTPInput onComplete={handleStep2} />
      {loading && <div style={{ textAlign:'center', color:'var(--text-3)', fontSize:'0.85rem' }}style={{display:'flex',justifyContent:'center'}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{animation:'spin 1s linear infinite'}}><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg></div>}
      <div style={{ textAlign:'center', fontSize:'0.76rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:10 }}>
        {t('auth_otp_title')}?{' '}
        <button onClick={() => {}} style={{ color:'var(--cyan)', background:'none', border:'none', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.76rem', cursor:'pointer', textDecoration:'underline' }}>
          {t('auth_otp_resend')}
        </button>
      </div>
      <div style={{ textAlign:'center', marginTop:8, fontSize:'0.75rem', color:'var(--text-3)' }}>
        <button onClick={() => setStep(1)} style={{ color:'var(--cyan)', background:'none', border:'none', fontFamily:"'Tajawal',sans-serif", fontSize:'0.75rem', cursor:'pointer' }}>← {t('nav_home') === 'الرئيسية' ? 'العودة' : 'Back'}</button>
      </div>
    </div>
  )

  return (
    <div>
      <Field label={t('auth_email')} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('ex_email_ph')} />
      <PasswordField label={t('auth_password')} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
      <Captcha onVerify={setCaptchaOk} t={t} />
      <SubmitBtn onClick={handleStep1} loading={loading}>{t('auth_login_btn')}</SubmitBtn>
      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0', color:'var(--text-3)', fontSize:'0.75rem', fontFamily:"'JetBrains Mono',monospace" }}>
        <div style={{ flex:1, height:1, background:'var(--border-1)' }} />
        {t('auth_or')}
        <div style={{ flex:1, height:1, background:'var(--border-1)' }} />
      </div>
      <button style={{ width:'100%', padding:'10px', background:'transparent', border:'1px solid var(--border-1)', borderRadius:9, fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', fontWeight:700, color:'var(--text-2)', cursor:'pointer', transition:'all 0.2s' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.background='var(--cyan-dim)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-1)';e.currentTarget.style.background='transparent'}}>
        🔍 {t('auth_google')}
      </button>
      <div style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--text-3)', marginTop:10 }}>
        <button onClick={() => {}} style={{ color:'var(--cyan)', background:'none', border:'none', fontFamily:"'Tajawal',sans-serif", fontSize:'0.75rem', cursor:'pointer' }}>
          {t('auth_forgot')}
        </button>
      </div>
    </div>
  )
}

// ══ قسم إنشاء الحساب ══
function RegisterSection({ onClose, t }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ username:'', email:'', phone:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)

  const upd = (k, v) => setForm(p => ({ ...p, [k]:v }))

  const handleStep1 = () => {
    const { username, email, phone, password, confirm } = form
    if (!username||!email||!phone||!password) { alert(t('auth_fill_all')); return }
    if (password !== confirm) { alert(t('auth_pw_mismatch')); return }
    if (getStrength(password) < 2) { alert(t('auth_pw_weak')); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(2) }, 800)
  }

  const handleEmailOtp = (otp) => {
    if (otp.length === 6) { setLoading(true); setTimeout(()=>{ setLoading(false); setStep(3) }, 1000) }
  }

  const handlePhoneOtp = (otp) => {
    if (otp.length === 6) { setLoading(true); setTimeout(()=>{ setLoading(false); setStep(4) }, 1000) }
  }

  // شاشة النجاح
  if (step === 4) return (
    <SuccessScreen
      title={t('auth_success_register')}
      desc={t('auth_welcome')}
      btnLabel={t('auth_start')}
      onClose={onClose}
    />
  )

  // OTP الهاتف
  if (step === 3) return (
    <div>
      <div style={{ width:60, height:60, borderRadius:18, background:'var(--cyan-dim)', border:'1px solid rgba(0,210,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>  <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='5' y='2' width='14' height='20' rx='2' ry='2'/><line x1='12' y1='18' x2='12.01' y2='18'/></svg></div>
      <div style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6 }}>STEP 2 / 2 · تأكيد الهاتف</div>
      <div style={{ textAlign:'center', fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.65, marginBottom:20 }}>
        {t('auth_otp_title')} SMS<br />
        <span style={{ color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{form.phone}</span>
      </div>
      <OTPInput onComplete={handlePhoneOtp} />
      {loading && <div style={{ textAlign:'center', color:'var(--text-3)', fontSize:'0.85rem' }}style={{display:'flex',justifyContent:'center'}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{animation:'spin 1s linear infinite'}}><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg></div>}
      <div style={{ textAlign:'center', fontSize:'0.76rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:10 }}>
        <button onClick={()=>setStep(2)} style={{ color:'var(--cyan)', background:'none', border:'none', fontFamily:"'Tajawal',sans-serif", fontSize:'0.75rem', cursor:'pointer' }}>← {t('nav_home') === 'الرئيسية' ? 'العودة' : 'Back'}</button>
      </div>
    </div>
  )

  // OTP البريد
  if (step === 2) return (
    <div>
      <div style={{ width:60, height:60, borderRadius:18, background:'var(--cyan-dim)', border:'1px solid rgba(0,210,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'1.8rem' }}>📧</div>
      <div style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6 }}>STEP 1 / 2 · تأكيد البريد</div>
      <div style={{ textAlign:'center', fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.65, marginBottom:20 }}>
        {t('auth_otp_title')}<br />
        <span style={{ color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{form.email}</span>
      </div>
      <OTPInput onComplete={handleEmailOtp} />
      {loading && <div style={{ textAlign:'center', color:'var(--text-3)', fontSize:'0.85rem' }}style={{display:'flex',justifyContent:'center'}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{animation:'spin 1s linear infinite'}}><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg></div>}
      <div style={{ textAlign:'center', fontSize:'0.76rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:10 }}>
        <button onClick={()=>setStep(1)} style={{ color:'var(--cyan)', background:'none', border:'none', fontFamily:"'Tajawal',sans-serif", fontSize:'0.75rem', cursor:'pointer' }}>← {t('nav_home') === 'الرئيسية' ? 'العودة' : 'Back'}</button>
      </div>
    </div>
  )

  // الخطوة 1 — البيانات
  return (
    <div>
      <Field label={t('auth_username')} value={form.username} onChange={e=>upd('username',e.target.value)} placeholder="@username" />
      <Field label={t('auth_email')} type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder={t('ex_email_ph')} />
      <Field label={t('auth_phone')} value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="+967 7XX XXX XXX">
        <input
          type="tel" value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="+967 7XX XXX XXX" dir="ltr"
          style={{ width:'100%', padding:'10px 13px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-1)', borderRadius:9, color:'var(--text-1)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.88rem', outline:'none', textAlign:'left', transition:'border-color 0.22s, box-shadow 0.22s' }}
          onFocus={e=>{ e.target.style.borderColor='var(--border-2)'; e.target.style.boxShadow='0 0 0 3px rgba(0,210,255,0.05)' }}
          onBlur={e =>{ e.target.style.borderColor='var(--border-1)'; e.target.style.boxShadow='none' }}
        />
      </Field>
      <PasswordField label={t('auth_password')} value={form.password} onChange={e=>upd('password',e.target.value)} placeholder={t('nav_home')==='الرئيسية'?'اختر رمزاً قوياً':'Choose a strong password'} showStrength />
      <PasswordField label={t('auth_confirm_pw')} value={form.confirm} onChange={e=>upd('confirm',e.target.value)} placeholder={t('nav_home')==='الرئيسية'?'أعد كتابة الرمز':'Repeat password'} />
      <SubmitBtn onClick={handleStep1} loading={loading}>{t('auth_register_btn')}</SubmitBtn>
    </div>
  )
}

// ══ النافذة الرئيسية ══
function AuthModal({ isOpen, initialTab, onClose }) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState(initialTab || 'login')

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab || 'login')
  }, [isOpen, initialTab])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const title = activeTab === 'login' ? t('auth_login') : t('auth_register')

  return (
    <div
      onClick={e => { if(e.target===e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:150, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'var(--card)', border:'1px solid var(--border-2)', borderRadius:22, width:'100%', maxWidth:440, overflow:'hidden', position:'relative', boxShadow:'0 30px 80px rgba(0,0,0,0.7)', animation:'pageIn 0.3s ease' }}
      >
        {/* خط سيان */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

        <ModalHeader title={`${activeTab==='login'?'LOGIN':'REGISTER'} · ${title}`} onClose={onClose} />

        <div style={{ padding:24, maxHeight:'78vh', overflowY:'auto' }}>
          <div style={{ '::-webkit-scrollbar':{width:4} }}>
            <AuthTabs active={activeTab} onSwitch={setActiveTab} t={t} />
            {activeTab === 'login'
              ? <LoginSection    onClose={onClose} t={t} key="login"    />
              : <RegisterSection onClose={onClose} t={t} key="register" />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
