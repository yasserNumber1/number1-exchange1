// src/components/auth/AuthModal.jsx
import { useState, useEffect } from 'react'
import useAuth from '../../context/useAuth'
import { AVATARS } from '../../context/AuthContext'

// ── Avatar Picker with male/female groups ──────────────────
function AvatarPicker({ selected, onSelect }) {
  const males   = AVATARS.filter(a => a.group === 'male')
  const females = AVATARS.filter(a => a.group === 'female')

  const Grid = ({ list }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
      {list.map(av => (
        <button key={av.id} onClick={() => onSelect(av)} title={av.label}
          style={{
            padding: 3, borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s',
            border: selected?.id === av.id ? '2px solid var(--cyan)' : '2px solid transparent',
            background: selected?.id === av.id ? 'var(--cyan-dim)' : 'transparent',
            transform: selected?.id === av.id ? 'scale(1.12)' : 'scale(1)',
            boxShadow: selected?.id === av.id ? '0 0 14px rgba(0,210,255,0.4)' : 'none',
          }}>
          <img src={av.url} alt={av.label} style={{ width: '100%', borderRadius: 9, display: 'block' }} />
        </button>
      ))}
    </div>
  )

  const GroupLabel = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 6px', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
      <span>{icon}</span><span>{text}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-1)', marginRight: 4 }} />
    </div>
  )

  return (
    <div>
      <GroupLabel icon="👨" text="MALE · رجال" />
      <Grid list={males} />
      <GroupLabel icon="👩" text="FEMALE · نساء" />
      <Grid list={females} />
      {selected && (
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: '0.72rem', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>
          ✓ {selected.label}
        </div>
      )}
    </div>
  )
}

// ── Register ────────────────────────────────────────────────
function RegisterForm({ onSuccess, onSwitch }) {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar]     = useState(null)
  const [code, setCode]         = useState('')
  const [fakeCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)))
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')

  const inp = {
    width: '100%', padding: '10px 13px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-1)',
    borderRadius: 9, color: 'var(--text-1)',
    fontFamily: "'Tajawal',sans-serif",
    fontSize: '0.88rem', outline: 'none',
    textAlign: 'right', transition: 'border-color 0.2s',
  }

  const handleStep1 = () => {
    if (!fullName.trim() || fullName.trim().split(' ').length < 2) { setErr('يرجى إدخال الاسم الثلاثي كاملاً'); return }
    if (!email.includes('@')) { setErr('البريد الإلكتروني غير صحيح'); return }
    if (!phone || phone.length < 8) { setErr('رقم الهاتف غير صحيح'); return }
    if (!password || password.length < 6) { setErr('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setErr(''); setStep(2)
  }

  const handleStep2 = () => {
    if (!avatar) { setErr('يرجى اختيار أفتار'); return }
    setErr(''); setLoading(true)
    setTimeout(() => { setLoading(false); setStep(3) }, 800)
  }

  const handleStep3 = () => {
    if (code !== fakeCode) { setErr('الكود غير صحيح، تحقق من بريدك'); return }
    setErr('')
    onSuccess({ fullName: fullName.trim(), email, phone, password, avatar })
  }

  const progressBar = (n) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {[1,2,3].map(s => (
        <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: s <= n ? 'var(--cyan)' : 'var(--border-1)', transition: 'background 0.3s', boxShadow: s <= n ? '0 0 8px rgba(0,210,255,0.4)' : 'none' }} />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {step === 1 && (<>
        {progressBar(1)}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>STEP 1 · البيانات الشخصية</div>
        <div><label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>الاسم الثلاثي</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="محمد أحمد علي" style={inp} onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/></div>
        <div><label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" style={{ ...inp, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/></div>
        <div><label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>رقم الهاتف</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXXX" style={{ ...inp, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/></div>
        <div><label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>كلمة المرور</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/></div>
        {err && <div style={{ fontSize: '0.78rem', color: 'var(--red)', textAlign: 'center' }}>{err}</div>}
        <button onClick={handleStep1} style={{ width: '100%', padding: 11, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 11, fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>التالي ←</button>
      </>)}

      {step === 2 && (<>
        {progressBar(2)}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>STEP 2 · اختر أفتارك</div>
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        {err && <div style={{ fontSize: '0.78rem', color: 'var(--red)', textAlign: 'center' }}>{err}</div>}
        <button onClick={handleStep2} disabled={loading} style={{ width: '100%', padding: 11, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 11, fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#fff', cursor: 'pointer', marginTop: 8 }}>
          {loading ? '⏳ إرسال كود التحقق...' : 'إرسال كود التحقق للبريد ←'}
        </button>
      </>)}

      {step === 3 && (<>
        {progressBar(3)}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>STEP 3 · تأكيد البريد الإلكتروني</div>
        <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, padding: '12px 15px', fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
          📧 تم إرسال كود إلى <strong style={{ color: 'var(--cyan)' }}>{email}</strong>
        </div>
        <div style={{ background: 'rgba(200,168,75,0.07)', border: '1px dashed rgba(200,168,75,0.25)', borderRadius: 9, padding: '9px 13px', fontSize: '0.75rem', color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace" }}>
          DEMO — الكود: {fakeCode}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>أدخل كود التحقق</label>
          <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="XXXXXX"
            style={{ ...inp, direction: 'ltr', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '1.4rem', letterSpacing: 8 }}
            onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/>
        </div>
        {err && <div style={{ fontSize: '0.78rem', color: 'var(--red)', textAlign: 'center' }}>{err}</div>}
        <button onClick={handleStep3} style={{ width: '100%', padding: 11, background: 'linear-gradient(135deg,#00c97a,#009960)', border: 'none', borderRadius: 11, fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>
          تأكيد وإنشاء الحساب ✓
        </button>
      </>)}

      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-3)' }}>
        لديك حساب؟ <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>تسجيل الدخول</button>
      </div>
    </div>
  )
}

// ── Login ────────────────────────────────────────────────────
function LoginForm({ onSuccess, onSwitch }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr]           = useState('')

  const inp = {
    width: '100%', padding: '10px 13px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-1)',
    borderRadius: 9, color: 'var(--text-1)',
    fontFamily: "'Tajawal',sans-serif",
    fontSize: '0.88rem', outline: 'none',
    direction: 'ltr', textAlign: 'left', transition: 'border-color 0.2s',
  }

  const handle = () => {
    if (!email || !password) { setErr('يرجى تعبئة جميع الحقول'); return }
    setErr('')
    let saved = null
    try { saved = JSON.parse(localStorage.getItem('n1_user')) } catch {}
    if (saved && saved.email === email) {
      onSuccess(saved)
    } else {
      onSuccess({ fullName: email.split('@')[0], email, phone: '', avatar: AVATARS[0] })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>البريد الإلكتروني</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" style={inp} onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>كلمة المرور</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inp, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.target.style.borderColor='var(--border-2)'} onBlur={e => e.target.style.borderColor='var(--border-1)'}/>
      </div>
      {err && <div style={{ fontSize: '0.78rem', color: 'var(--red)', textAlign: 'center' }}>{err}</div>}
      <button onClick={handle} style={{ width: '100%', padding: 11, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 11, fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>
        تسجيل الدخول ←
      </button>
      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-3)' }}>
        ليس لديك حساب؟ <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>إنشاء حساب</button>
      </div>
    </div>
  )
}

// ── Main Modal ───────────────────────────────────────────────
function AuthModal({ isOpen, type, onClose, onSuccess }) {
  const { login } = useAuth()
  const [mode, setMode] = useState(type || 'register')

  useEffect(() => { setMode(type || 'register') }, [type])

  if (!isOpen) return null

  const handleSuccess = (userData) => {
    login(userData)
    onClose()
    if (onSuccess) onSuccess()
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, width: '100%', maxWidth: 460, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
            {mode === 'register' ? '🚀' : '🔑'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: 1 }}>
              {mode === 'register' ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>NUMBER 1 EXCHANGE</div>
          </div>
          <button onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,61,90,0.1)'; e.currentTarget.style.color='var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)' }}>
            ✕
          </button>
        </div>
        <div style={{ padding: 22, overflowY: 'auto' }}>
          {mode === 'register'
            ? <RegisterForm onSuccess={handleSuccess} onSwitch={() => setMode('login')} />
            : <LoginForm    onSuccess={handleSuccess} onSwitch={() => setMode('register')} />
          }
        </div>
      </div>
    </div>
  )
}

export default AuthModal
