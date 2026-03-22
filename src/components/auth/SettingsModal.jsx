// src/components/auth/SettingsModal.jsx
import { useState } from 'react'
import useAuth from '../../context/useAuth'
import { AVATARS } from '../../context/AuthContext'

// ── Toggle Switch ─────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
        background: value ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${value ? 'var(--cyan)' : 'var(--border-1)'}`,
        position: 'relative', transition: 'all 0.3s', flexShrink: 0,
        boxShadow: value ? '0 0 10px rgba(0,210,255,0.4)' : 'none',
      }}>
      <div style={{
        position: 'absolute', top: 2,
        right: value ? 2 : 'auto', left: value ? 'auto' : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'all 0.3s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

// ── Avatar Picker (Grouped: Male / Female) ───────────────
function AvatarPicker({ selected, onSelect }) {
  const males   = AVATARS.filter(a => a.group === 'male')
  const females = AVATARS.filter(a => a.group === 'female')

  const btnStyle = (av) => ({
    padding: 3, borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s',
    border: selected?.id === av.id ? '2px solid var(--cyan)' : '2px solid transparent',
    background: selected?.id === av.id ? 'var(--cyan-dim)' : 'transparent',
    transform: selected?.id === av.id ? 'scale(1.12)' : 'scale(1)',
    boxShadow: selected?.id === av.id ? '0 0 14px rgba(0,210,255,0.4)' : 'none',
  })

  const Grid = ({ list }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 7 }}>
      {list.map(av => (
        <button key={av.id} onClick={() => onSelect(av)} title={av.label} style={btnStyle(av)}>
          <img src={av.url} alt={av.label} style={{ width: '100%', borderRadius: 9, display: 'block' }} />
        </button>
      ))}
    </div>
  )

  const GroupLabel = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 6px', fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
      <span>{icon}</span><span>{text}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-1)', marginRight: 4 }} />
    </div>
  )

  return (
    <div style={{ marginTop: 8 }}>
      <GroupLabel icon="👨" text="MALE · رجال" />
      <Grid list={males} />
      <GroupLabel icon="👩" text="FEMALE · نساء" />
      <Grid list={females} />
      {selected && (
        <div style={{ marginTop: 6, textAlign: 'center', fontSize: '0.7rem', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace" }}>✓ {selected.label}</div>
      )}
    </div>
  )
}

// ── Section Header ────────────────────────────────────────
function SectionTitle({ iconUrl, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={iconUrl} alt={title} style={{ width: 17, height: 17, objectFit: 'contain' }} />
      </div>
      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-1)' }}>{title}</span>
    </div>
  )
}

// ── Row item (for preferences / security) ────────────────
function SettingRow({ icon, title, desc, right, onClick, chevron }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 13,
        padding: '13px 16px',
        background: hov && onClick ? 'rgba(0,210,255,0.04)' : 'transparent',
        borderRadius: 12, cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.2s',
      }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>{title}</div>
        {desc && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
      {chevron && <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>›</span>}
    </div>
  )
}

// ── Collapsible password change ──────────────────────────
function PasswordChange() {
  const [open, setOpen] = useState(false)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState(false)

  const inp = { width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', outline: 'none', direction: 'ltr', textAlign: 'left', transition: 'border-color 0.2s' }

  const handle = () => {
    if (!oldPass) { setErr('أدخل كلمة المرور القديمة'); return }
    if (newPass.length < 6) { setErr('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return }
    if (newPass !== confirmPass) { setErr('كلمتا المرور غير متطابقتين'); return }
    setErr(''); setSuccess(true)
    setOldPass(''); setNewPass(''); setConfirmPass('')
    setTimeout(() => { setSuccess(false); setOpen(false) }, 2500)
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-1)', borderRadius: 14, overflow: 'hidden' }}>
      <div onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,210,255,0.07)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><img src="https://cdn-icons-png.flaticon.com/32/3064/3064197.png" alt="password" style={{ width: 18, height: 18, objectFit: 'contain' }} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>تغيير كلمة المرور</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>تحديث رمز الدخول</div>
        </div>
        <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
      </div>
      {open && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 1, background: 'var(--border-1)', margin: '0 0 4px' }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>كلمة المرور القديمة</div>
            <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••" style={inp}
              onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>كلمة المرور الجديدة</div>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" style={inp}
              onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>تأكيد كلمة المرور الجديدة</div>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" style={inp}
              onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
          </div>
          {err && <div style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{err}</div>}
          {success && <div style={{ fontSize: '0.78rem', color: 'var(--green)' }}>✓ تم تغيير كلمة المرور بنجاح</div>}
          <button onClick={handle} style={{ width: '100%', padding: 10, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 10, fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>
            حفظ كلمة المرور
          </button>
        </div>
      )}
    </div>
  )
}

// ── Wallet row ────────────────────────────────────────────
function WalletRow({ icon, name, placeholder, color }) {
  const [val, setVal] = useState('')
  const [linked, setLinked] = useState(false)

  return (
    <div style={{ background: linked ? 'rgba(0,229,160,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${linked ? 'rgba(0,229,160,0.2)' : 'var(--border-1)'}`, borderRadius: 14, padding: '13px 16px', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: linked ? 0 : 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-1)' }}>
          <img src={icon} alt={name} style={{ width: 26, height: 26, objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-1)' }}>{name}</div>
          <div style={{ fontSize: '0.7rem', color: linked ? 'var(--green)' : 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>
            {linked ? '✓ مرتبطة' : 'غير مربوطة'}
          </div>
        </div>
        <button
          onClick={() => { if (!linked && val) setLinked(true); else if (linked) setLinked(false) }}
          style={{
            padding: '7px 18px', borderRadius: 9, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            background: linked ? 'rgba(255,61,90,0.1)' : 'var(--cyan-dim)',
            border: `1px solid ${linked ? 'rgba(255,61,90,0.3)' : 'var(--border-2)'}`,
            color: linked ? 'var(--red)' : 'var(--cyan)',
          }}>
          {linked ? 'فصل' : 'ربط'}
        </button>
      </div>
      {!linked && (
        <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, color: 'var(--text-1)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.78rem', outline: 'none', direction: 'ltr' }}
          onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
      )}
    </div>
  )
}

// ── Main SettingsModal ────────────────────────────────────
function SettingsModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth()

  // Profile state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [saved, setSaved] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // Preferences state
  const [prefPrice, setPrefPrice] = useState(true)
  const [prefTx, setPrefTx] = useState(true)
  const [prefLive, setPrefLive] = useState(true)

  // 2FA state
  const [twoFA, setTwoFA] = useState(false)

  // Sync user into local state when modal opens
  const [lastUser, setLastUser] = useState(null)
  if (user && user !== lastUser) {
    setLastUser(user)
    setFullName(user.fullName || '')
    setEmail(user.email || '')
    setPhone(user.phone || '')
    setAvatar(user.avatar || null)
  }

  if (!isOpen || !user) return null

  const handleSave = () => {
    updateUser({ fullName, email, phone, avatar })
    setSaved(true)
    setEditOpen(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const inp = { width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 9, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', outline: 'none', textAlign: 'right', transition: 'border-color 0.2s' }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, width: '100%', maxWidth: 480, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

        {/* ── Page Header ── */}
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="https://cdn-icons-png.flaticon.com/32/3524/3524659.png" alt="settings" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: 1 }}>الإعدادات</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2, marginRight: 28 }}>إدارة حسابك وتفضيلاتك</div>
          </div>
          <button onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,90,0.1)'; e.currentTarget.style.color = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}>
            ✕
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ══ 1. الملف الشخصي ══ */}
          <div>
            <SectionTitle iconUrl="https://cdn-icons-png.flaticon.com/32/1077/1077114.png" title="الملف الشخصي" />
            <div style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Avatar with edit pencil */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 62, height: 62, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(0,210,255,0.3)' }}>
                    {avatar?.url
                      ? <img src={avatar.url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--cyan)', fontSize: '1.4rem' }}>{fullName?.[0]}</div>
                    }
                  </div>
                  <div style={{ position: 'absolute', bottom: -4, left: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)', cursor: 'pointer' }}
                    onClick={() => setEditOpen(p => !p)}><img src="https://cdn-icons-png.flaticon.com/32/1250/1250615.png" style={{ width: 10, height: 10, filter: 'brightness(10)' }} alt="edit"/></div>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName || '—'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{email}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>{phone}</div>
                  {saved && <div style={{ fontSize: '0.72rem', color: 'var(--green)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><img src='https://cdn-icons-png.flaticon.com/32/4315/4315445.png' style={{ width: 11, height: 11 }}/> تم الحفظ</div>}
                </div>
                {/* Edit button */}
                <button onClick={() => setEditOpen(p => !p)}
                  style={{ padding: '8px 16px', background: editOpen ? 'rgba(0,229,160,0.1)' : 'var(--cyan-dim)', border: `1px solid ${editOpen ? 'rgba(0,229,160,0.3)' : 'var(--border-2)'}`, borderRadius: 10, color: editOpen ? 'var(--green)' : 'var(--cyan)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {editOpen ? '✕ إغلاق' : 'تعديل'}
                </button>
              </div>

              {/* Badge */}
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                <span style={{ padding: '3px 10px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 20, fontSize: '0.68rem', color: 'var(--green)', fontFamily: "'JetBrains Mono',monospace" }}>عضو نشط</span>
              </div>

              {/* Edit form (collapsible) */}
              {editOpen && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-1)', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>الاسم الثلاثي</div>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} style={inp}
                      onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>البريد الإلكتروني</div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inp, direction: 'ltr', textAlign: 'left' }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>رقم الهاتف</div>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inp, direction: 'ltr', textAlign: 'left' }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-2)'} onBlur={e => e.target.style.borderColor = 'var(--border-1)'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>تغيير الأفتار</div>
                    <AvatarPicker selected={avatar} onSelect={setAvatar} />
                  </div>
                  <button onClick={handleSave}
                    style={{ width: '100%', padding: 11, background: 'linear-gradient(135deg,#009fc0,#006e9e)', border: 'none', borderRadius: 11, fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#fff', cursor: 'pointer', marginTop: 4 }}>
                    حفظ التغييرات
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ══ 2. التفضيلات ══ */}
          <div>
            <SectionTitle iconUrl="https://cdn-icons-png.flaticon.com/32/3602/3602145.png" title="التفضيلات" />
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-1)', borderRadius: 16, overflow: 'hidden' }}>
              <SettingRow
                icon="https://cdn-icons-png.flaticon.com/32/2091/2091539.png"
                title="تنبيهات الأسعار"
                desc="إشعار عند الوصول للسعر المحدد"
                right={<Toggle value={prefPrice} onChange={setPrefPrice} />}
              />
              <div style={{ height: 1, background: 'var(--border-1)', margin: '0 16px' }} />
              <SettingRow
                icon="https://cdn-icons-png.flaticon.com/32/4315/4315445.png"
                title="تأكيد العمليات"
                desc="تأكيد قبل تنفيذ كل تحويل"
                right={<Toggle value={prefTx} onChange={setPrefTx} />}
              />
              <div style={{ height: 1, background: 'var(--border-1)', margin: '0 16px' }} />
              <SettingRow
                icon="https://cdn-icons-png.flaticon.com/32/2917/2917995.png"
                title="تحديث الأسعار المباشر"
                desc="تحديث تلقائي كل 3 ثوانٍ"
                right={<Toggle value={prefLive} onChange={setPrefLive} />}
              />
            </div>
          </div>

          {/* ══ 3. الأمان ══ */}
          <div>
            <SectionTitle iconUrl="https://cdn-icons-png.flaticon.com/32/2092/2092663.png" title="الأمان" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 2FA row */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-1)', borderRadius: 14, overflow: 'hidden' }}>
                <SettingRow
                  icon="https://cdn-icons-png.flaticon.com/32/4305/4305512.png"
                  title="المصادقة الثنائية (2FA)"
                  desc="حماية إضافية للحساب"
                  right={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: twoFA ? 'var(--green)' : 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                        {twoFA ? '✓ مفعّل' : 'معطّل'}
                      </span>
                      <Toggle value={twoFA} onChange={setTwoFA} />
                    </div>
                  }
                />
                {twoFA && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
                      المصادقة الثنائية مفعّلة. سيتم طلب رمز التحقق عند كل تسجيل دخول.
                    </div>
                  </div>
                )}
              </div>
              {/* Password change collapsible */}
              <PasswordChange />
            </div>
          </div>

          {/* ══ 4. ربط المحافظ ══ */}
          <div>
            <SectionTitle iconUrl="https://cdn-icons-png.flaticon.com/32/2489/2489756.png" title="ربط المحافظ" />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>
              اربط محفظتك لتبادل الأموال بدون إدخال البيانات في كل مرة
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <WalletRow
                icon="https://cdn-icons-png.flaticon.com/128/14446/14446064.png"
                name="Binance"
                placeholder="UID أو عنوان المحفظة"
                color="#F0B90B"
              />
              <WalletRow
                icon="https://cdn-icons-png.flaticon.com/128/14446/14446042.png"
                name="OKX"
                placeholder="عنوان محفظة OKX"
                color="#1a1a1a"
              />
              <WalletRow
                icon="https://cdn-icons-png.flaticon.com/128/4108/4108814.png"
                name="MoneyGo"
                placeholder="MGO-XXXXXXXXX"
                color="#e91e63"
              />
            </div>
          </div>

          {/* bottom spacing */}
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
