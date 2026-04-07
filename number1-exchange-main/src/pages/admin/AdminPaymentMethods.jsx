// ═══════════════════════════════════════════════════════════════
// src/pages/admin/AdminPaymentMethods.jsx
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../services/api'
import { CRYPTO_PRESETS as CRYPTO_SUGGESTIONS, uid } from '../../components/admin/adminConstants'
import { SEND_METHODS, RECEIVE_METHODS } from '../../data/currencies'

const WALLET_SUGGESTIONS = [
  { name: 'Vodafone Cash', icon: '📱', color: '#ef4444', placeholder: '01XXXXXXXXX' },
  { name: 'Orange Cash',   icon: '🟠', color: '#f97316', placeholder: '01XXXXXXXXX' },
  { name: 'InstaPay',      icon: '⚡', color: '#8b5cf6', placeholder: 'اسم المستخدم أو رقم الهاتف' },
  { name: 'Fawry',         icon: '🏪', color: '#f59e0b', placeholder: 'رقم Fawry' },
  { name: 'WE Pay',        icon: '📡', color: '#06b6d4', placeholder: '01XXXXXXXXX' },
  { name: 'Meeza',         icon: '💳', color: '#10b981', placeholder: 'رقم البطاقة' },
  { name: 'Etisalat Cash', icon: '📶', color: '#6366f1', placeholder: '01XXXXXXXXX' },
  { name: 'Aman',          icon: '🏦', color: '#84cc16', placeholder: 'رقم Aman' },
  { name: 'MoneyGo',       icon: '💵', color: '#22d3ee', placeholder: 'رقم المستخدم' },
]

const newCrypto = (sug = {}) => ({
  id: uid(), coin: sug.coin || '', network: sug.network || '',
  label: sug.label || '', icon: sug.icon || '₮', color: sug.color || '#26a17b',
  address: '', enabled: true,
})

const newWallet = (sug = {}) => ({
  id: uid(), name: sug.name || '', icon: sug.icon || '📱', color: sug.color || '#3b82f6',
  placeholder: sug.placeholder || 'رقم الاستلام', number: '', enabled: true,
})

export default function AdminPaymentMethods() {
  const [cryptos,        setCryptos]        = useState([])
  const [wallets,        setWallets]        = useState([])
  const [sendMethods,    setSendMethods]    = useState([])
  const [receiveMethods, setReceiveMethods] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [error,          setError]          = useState('')
  const [showCryptoMenu, setShowCryptoMenu] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pmRes, emRes] = await Promise.all([
        adminAPI.getPaymentMethods(),
        adminAPI.getExchangeMethods(),
      ])
      setCryptos(pmRes.data.cryptos || [])
      setWallets(pmRes.data.wallets || [])

      // دمج الوسائل من الـ DB مع بيانات currencies.js
      const dbSend = emRes.data.sendMethods || []
      const dbRecv = emRes.data.receiveMethods || []

      setSendMethods(SEND_METHODS.map(m => ({
        ...m,
        enabled: dbSend.find(d => d.id === m.id)?.enabled ?? true,
      })))
      setReceiveMethods(RECEIVE_METHODS.map(m => ({
        ...m,
        enabled: dbRecv.find(d => d.id === m.id)?.enabled ?? true,
      })))
    } catch {
      setSendMethods(SEND_METHODS.map(m => ({ ...m, enabled: true })))
      setReceiveMethods(RECEIVE_METHODS.map(m => ({ ...m, enabled: true })))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await Promise.all([
        adminAPI.savePaymentMethods({ cryptos, wallets }),
        adminAPI.saveExchangeMethods({
          sendMethods:    sendMethods.map(m => ({ id: m.id, enabled: m.enabled })),
          receiveMethods: receiveMethods.map(m => ({ id: m.id, enabled: m.enabled })),
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const toggleSend = (id) =>
    setSendMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  const toggleRecv = (id) =>
    setReceiveMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))

  const addCrypto    = (sug) => { setCryptos(p => [...p, newCrypto(sug)]); setShowCryptoMenu(false) }
  const editCrypto   = (id, f, v) => setCryptos(p => p.map(c => c.id === id ? { ...c, [f]: v } : c))
  const removeCrypto = (id) => setCryptos(p => p.filter(c => c.id !== id))
  const toggleCrypto = (id) => editCrypto(id, 'enabled', !cryptos.find(c => c.id === id)?.enabled)

  const addWallet    = (sug) => { setWallets(p => [...p, newWallet(sug)]); setShowWalletMenu(false) }
  const editWallet   = (id, f, v) => setWallets(p => p.map(w => w.id === id ? { ...w, [f]: v } : w))
  const removeWallet = (id) => setWallets(p => p.filter(w => w.id !== id))
  const toggleWallet = (id) => editWallet(id, 'enabled', !wallets.find(w => w.id === id)?.enabled)

  if (loading) return (
    <AdminLayout title="وسائل الدفع">
      <div className="pm-center"><div className="pm-spinner" /></div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="وسائل الدفع">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="pm-page-header">
        <div>
          <p className="pm-page-desc">تحكم في وسائل الدفع وما يظهر في صفحة التبادل</p>
        </div>
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} />
      </div>

      {error && <Banner type="error"   text={error} />}
      {saved && <Banner type="success" text="✓ تم حفظ جميع التغييرات بنجاح" />}

      {/* ══════════════════════════════════════════════════
          القسم الجديد — وسائل الإرسال والاستلام
      ══════════════════════════════════════════════════ */}
      <div className="em-section">
        <div className="em-section-title">
          <span className="em-icon">↕️</span>
          وسائل التبادل — ما يظهر للعميل
        </div>
        <p className="em-section-desc">تحكم في أي وسيلة تظهر في صفحة "أنت ترسل" و"أنت تستلم"</p>

        <div className="em-grid">
          {/* عمود الإرسال */}
          <div className="em-col">
            <div className="em-col-header">
              <span>📤 أنت ترسل</span>
              <span className="em-count">{sendMethods.filter(m => m.enabled).length} / {sendMethods.length} مفعّل</span>
            </div>
            {sendMethods.map(m => (
              <MethodToggleRow key={m.id} method={m} onToggle={() => toggleSend(m.id)} />
            ))}
          </div>

          {/* عمود الاستلام */}
          <div className="em-col">
            <div className="em-col-header">
              <span>📥 أنت تستلم</span>
              <span className="em-count">{receiveMethods.filter(m => m.enabled).length} / {receiveMethods.length} مفعّل</span>
            </div>
            {receiveMethods.map(m => (
              <MethodToggleRow key={m.id} method={m} onToggle={() => toggleRecv(m.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* ══ وسائل الدفع (العناوين) ══ */}
      <SectionHeader
        icon="🔗" title="شبكات العملات الرقمية"
        desc="أضف عناوين المحافظ لاستقبال التحويلات"
        addLabel="+ إضافة شبكة"
        showMenu={showCryptoMenu}
        onToggleMenu={() => { setShowCryptoMenu(v => !v); setShowWalletMenu(false) }}
        onCloseMenu={() => setShowCryptoMenu(false)}
        menuItems={CRYPTO_SUGGESTIONS}
        onSelect={addCrypto}
        onCustom={() => { addCrypto({}); setShowCryptoMenu(false) }}
        renderItem={s => (
          <div className="pm-suggest-row">
            <span style={{ fontSize: 16, color: s.color, fontWeight: 800, minWidth: 22, textAlign: 'center' }}>{s.icon}</span>
            <div><div className="pm-suggest-name">{s.label}</div><div className="pm-suggest-sub">{s.network}</div></div>
          </div>
        )}
      />

      {cryptos.length === 0
        ? <EmptyState icon="🔗" text='لا توجد شبكات — اضغط "+ إضافة شبكة" للبدء' />
        : <div className="pm-grid">
            {cryptos.map(c => (
              <CryptoCard key={c.id} item={c}
                onToggle={() => toggleCrypto(c.id)}
                onEdit={(f, v) => editCrypto(c.id, f, v)}
                onRemove={() => removeCrypto(c.id)} />
            ))}
          </div>
      }

      <SectionHeader
        icon="📱" title="المحافظ الإلكترونية"
        desc="أضف أرقام الاستلام للمحافظ المحلية"
        addLabel="+ إضافة محفظة"
        showMenu={showWalletMenu}
        onToggleMenu={() => { setShowWalletMenu(v => !v); setShowCryptoMenu(false) }}
        onCloseMenu={() => setShowWalletMenu(false)}
        menuItems={WALLET_SUGGESTIONS}
        onSelect={addWallet}
        onCustom={() => { addWallet({}); setShowWalletMenu(false) }}
        renderItem={s => (
          <div className="pm-suggest-row">
            <span style={{ fontSize: 16, minWidth: 22, textAlign: 'center' }}>{s.icon}</span>
            <span className="pm-suggest-name">{s.name}</span>
          </div>
        )}
      />

      {wallets.length === 0
        ? <EmptyState icon="📱" text='لا توجد محافظ — اضغط "+ إضافة محفظة" للبدء' />
        : <div className="pm-grid">
            {wallets.map(w => (
              <WalletCard key={w.id} item={w}
                onToggle={() => toggleWallet(w.id)}
                onEdit={(f, v) => editWallet(w.id, f, v)}
                onRemove={() => removeWallet(w.id)} />
            ))}
          </div>
      }

      <div className="pm-save-wrap">
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} large />
      </div>
    </AdminLayout>
  )
}

// ── MethodToggleRow ──────────────────────────────────────────
function MethodToggleRow({ method, onToggle }) {
  return (
    <div className={`em-row${method.enabled ? '' : ' em-row--off'}`}>
      <div className="em-row-icon" style={{ background: `${method.color}20`, border: `1.5px solid ${method.color}40` }}>
        {method.img
          ? <img src={method.img} alt={method.name} style={{ width: '70%', height: '70%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
          : <span style={{ fontSize: 11, fontWeight: 800, color: method.color }}>{method.symbol}</span>
        }
      </div>
      <div className="em-row-info">
        <span className="em-row-name">{method.name}</span>
        <span className="em-row-sub">{method.symbol}</span>
      </div>
      <button
        onClick={onToggle}
        className="em-toggle"
        style={{ background: method.enabled ? method.color : '#334155', boxShadow: method.enabled ? `0 0 8px ${method.color}44` : 'none' }}
      >
        <span className="em-toggle-thumb" style={{ transform: method.enabled ? 'translateX(-19px)' : 'translateX(0)' }} />
      </button>
    </div>
  )
}

// ── باقي المكونات (نفس الأصلية) ──────────────────────────────
function SectionHeader({ icon, title, desc, addLabel, showMenu, onToggleMenu, onCloseMenu, menuItems, onSelect, onCustom, renderItem }) {
  return (
    <div className="pm-section-header">
      <div className="pm-section-left">
        <div className="pm-section-icon">{icon}</div>
        <div><div className="pm-section-title">{title}</div><div className="pm-section-desc">{desc}</div></div>
      </div>
      <div style={{ position: 'relative' }}>
        <button className="pm-add-btn" onClick={onToggleMenu}>{addLabel}</button>
        {showMenu && <SuggestMenu items={menuItems} onSelect={onSelect} onClose={onCloseMenu} onCustom={onCustom} renderItem={renderItem} />}
      </div>
    </div>
  )
}

function CryptoCard({ item, onToggle, onEdit, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  const [copied,   setCopied]   = useState(false)
  const isReady     = item.enabled && item.address
  const accentColor = item.enabled ? item.color : '#475569'
  const displayLabel = item.label || [item.coin, item.network].filter(Boolean).join(' ') || 'شبكة جديدة'
  const shortAddr = item.address ? (item.address.length > 22 ? `${item.address.slice(0,10)}...${item.address.slice(-8)}` : item.address) : null
  const handleCopy = () => { if (!item.address) return; navigator.clipboard.writeText(item.address); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className={`pm-card${item.enabled ? '' : ' pm-card-disabled'}`} style={{ borderColor: item.enabled ? `${item.color}30` : 'var(--al-border)' }}>
      <div className="pm-card-bar" style={{ background: isReady ? item.color : item.enabled ? '#f59e0b' : '#334155' }} />
      <div className="pm-card-body">
        <div className="pm-card-top">
          <div className="pm-card-icon" style={{ background: `${item.color}18`, border: `1.5px solid ${item.color}35` }}><span style={{ fontSize: 17, color: item.color }}>{item.icon}</span></div>
          <div className="pm-card-meta"><div className="pm-card-title" style={{ color: accentColor }}>{displayLabel}</div><div className="pm-card-subtitle">{item.coin || '—'} · {item.network || '—'}</div></div>
          <StatusBadge enabled={item.enabled} ready={isReady} />
        </div>
        {shortAddr
          ? <div className="pm-info-row"><span className="pm-info-text">{shortAddr}</span><button className={`pm-copy-btn${copied?' pm-copy-btn--done':''}`} onClick={handleCopy}>{copied ? <CheckIcon /> : <CopyIcon />}</button></div>
          : <div className="pm-info-row pm-info-row--empty"><span>لم يُدخَل عنوان بعد</span></div>
        }
        <div className="pm-actions">
          <button className="pm-edit-btn" onClick={() => { setExpanded(v => !v); setConfirm(false) }}>{expanded ? <CollapseIcon /> : <EditIcon />}<span>{expanded ? 'إخفاء' : 'تعديل'}</span></button>
          <div className="pm-actions-end">
            <Toggle value={item.enabled} onChange={onToggle} color={item.color} />
            <div className="pm-sep" />
            {confirm
              ? <div className="pm-confirm"><button className="pm-confirm-yes" onClick={onRemove}>حذف</button><button className="pm-confirm-no" onClick={() => setConfirm(false)}>لا</button></div>
              : <button className="pm-delete-btn" onClick={() => setConfirm(true)}><TrashIcon /></button>
            }
          </div>
        </div>
        {expanded && (
          <div className="pm-edit-panel">
            <div className="pm-field-grid pm-field-grid--3">
              <Field label="العملة"><input className="pm-input" placeholder="USDT" value={item.coin} onChange={e => onEdit('coin', e.target.value)} /></Field>
              <Field label="الشبكة"><input className="pm-input" placeholder="TRC20" value={item.network} onChange={e => onEdit('network', e.target.value)} /></Field>
              <Field label="الاسم"><input className="pm-input" placeholder="USDT TRC20" value={item.label} onChange={e => onEdit('label', e.target.value)} /></Field>
            </div>
            <Field label="عنوان المحفظة"><input className="pm-input pm-input--mono" placeholder="T..." value={item.address} onChange={e => onEdit('address', e.target.value)} style={{ direction: 'ltr', textAlign: 'left' }} /></Field>
            <div className="pm-field-grid pm-field-grid--2">
              <Field label="رمز"><input className="pm-input pm-input--center" value={item.icon} onChange={e => onEdit('icon', e.target.value)} maxLength={2} /></Field>
              <Field label="اللون"><div className="pm-color-row"><input type="color" className="pm-color-swatch" value={item.color} onChange={e => onEdit('color', e.target.value)} /><input className="pm-input pm-input--mono" value={item.color} onChange={e => onEdit('color', e.target.value)} maxLength={7} style={{ direction: 'ltr' }} /></div></Field>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WalletCard({ item, onToggle, onEdit, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  const [copied,   setCopied]   = useState(false)
  const isReady     = item.enabled && item.number
  const accentColor = item.enabled ? item.color : '#475569'
  const displayName = item.name || 'محفظة جديدة'
  const shortNum    = item.number ? (item.number.length > 18 ? `${item.number.slice(0,9)}...${item.number.slice(-4)}` : item.number) : null
  const handleCopy  = () => { if (!item.number) return; navigator.clipboard.writeText(item.number); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className={`pm-card${item.enabled ? '' : ' pm-card-disabled'}`} style={{ borderColor: item.enabled ? `${item.color}30` : 'var(--al-border)' }}>
      <div className="pm-card-bar" style={{ background: isReady ? item.color : item.enabled ? '#f59e0b' : '#334155' }} />
      <div className="pm-card-body">
        <div className="pm-card-top">
          <div className="pm-card-icon" style={{ background: `${item.color}18`, border: `1.5px solid ${item.color}35` }}><span style={{ fontSize: 20 }}>{item.icon}</span></div>
          <div className="pm-card-meta"><div className="pm-card-title" style={{ color: accentColor }}>{displayName}</div><div className="pm-card-subtitle" style={{ fontStyle: item.accountName ? 'normal' : 'italic' }}>{item.accountName || 'بدون اسم حساب'}</div></div>
          <StatusBadge enabled={item.enabled} ready={isReady} />
        </div>
        {shortNum
          ? <div className="pm-info-row"><span className="pm-info-text">{shortNum}</span><button className={`pm-copy-btn${copied?' pm-copy-btn--done':''}`} onClick={handleCopy}>{copied ? <CheckIcon /> : <CopyIcon />}</button></div>
          : <div className="pm-info-row pm-info-row--empty"><span>لم يُدخَل رقم بعد</span></div>
        }
        <div className="pm-actions">
          <button className="pm-edit-btn" onClick={() => { setExpanded(v => !v); setConfirm(false) }}>{expanded ? <CollapseIcon /> : <EditIcon />}<span>{expanded ? 'إخفاء' : 'تعديل'}</span></button>
          <div className="pm-actions-end">
            <Toggle value={item.enabled} onChange={onToggle} color={item.color} />
            <div className="pm-sep" />
            {confirm
              ? <div className="pm-confirm"><button className="pm-confirm-yes" onClick={onRemove}>حذف</button><button className="pm-confirm-no" onClick={() => setConfirm(false)}>لا</button></div>
              : <button className="pm-delete-btn" onClick={() => setConfirm(true)}><TrashIcon /></button>
            }
          </div>
        </div>
        {expanded && (
          <div className="pm-edit-panel">
            <div className="pm-field-grid pm-field-grid--2">
              <Field label="اسم المحفظة"><input className="pm-input" placeholder="Vodafone Cash" value={item.name} onChange={e => onEdit('name', e.target.value)} /></Field>
              <Field label="الأيقونة"><input className="pm-input pm-input--center" value={item.icon} maxLength={2} onChange={e => onEdit('icon', e.target.value.slice(0,2) || '📱')} /></Field>
            </div>
            <Field label="رقم الاستلام"><input className="pm-input pm-input--mono" placeholder={item.placeholder || '01XXXXXXXXX'} value={item.number} onChange={e => onEdit('number', e.target.value)} style={{ direction: 'ltr', textAlign: 'left' }} /></Field>
            <Field label="اسم الحساب"><input className="pm-input" placeholder="NUMBER 1 EXCHANGE" value={item.accountName || ''} onChange={e => onEdit('accountName', e.target.value)} /></Field>
            <Field label="ملاحظة للمستخدم"><input className="pm-input" placeholder="حوّل المبلغ خلال 30 دقيقة" value={item.note || ''} onChange={e => onEdit('note', e.target.value)} /></Field>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ enabled, ready }) {
  if (!enabled) return <span className="pm-badge pm-badge--off">معطّل</span>
  if (!ready)   return <span className="pm-badge pm-badge--warn">ناقص</span>
  return              <span className="pm-badge pm-badge--on">نشط</span>
}
function Toggle({ value, onChange, color = '#3b82f6' }) {
  return (
    <button onClick={onChange} className="pm-toggle" style={{ background: value ? color : '#334155', boxShadow: value ? `0 0 8px ${color}44` : 'none' }}>
      <span className="pm-toggle-thumb" style={{ transform: value ? 'translateX(-19px)' : 'translateX(0)' }} />
    </button>
  )
}
function SuggestMenu({ items, onSelect, onClose, onCustom, renderItem }) {
  return (
    <><div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
    <div className="pm-suggest-menu">
      <div className="pm-suggest-header">اختر من القائمة</div>
      {items.map((item, i) => (<button key={i} className="pm-suggest-btn" onClick={() => onSelect(item)}>{renderItem(item)}</button>))}
      <div className="pm-suggest-divider" />
      <button className="pm-suggest-btn pm-suggest-btn--custom" onClick={onCustom}>✏ إضافة مخصصة</button>
    </div></>
  )
}
function Field({ label, children }) { return <div><label className="pm-field-label">{label}</label>{children}</div> }
function Banner({ type, text }) { return <div className={`pm-banner pm-banner--${type}`}>{text}</div> }
function SaveBtn({ saving, saved, onClick, large }) {
  return (
    <button className="pm-save-btn" style={{ padding: large ? '12px 32px' : '10px 22px', fontSize: large ? 15 : 14, opacity: saving ? 0.7 : 1, background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }} onClick={onClick} disabled={saving}>
      {saving ? '⏳ جاري الحفظ...' : saved ? '✓ تم الحفظ' : '💾 حفظ التغييرات'}
    </button>
  )
}
function EmptyState({ icon, text }) { return <div className="pm-empty"><span style={{ fontSize: 28 }}>{icon}</span><span className="pm-empty-text">{text}</span></div> }
const CopyIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
const CheckIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const EditIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const CollapseIcon= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
const TrashIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>

const CSS = `
  @keyframes pm-spin  { to { transform: rotate(360deg) } }
  @keyframes pm-slide { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }

  /* ── Exchange Methods Section ── */
  .em-section {
    background: var(--al-row-bg);
    border: 1px solid var(--al-border);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 28px;
  }
  .em-section-title {
    display: flex; align-items: center; gap: 10px;
    font-size: 15px; font-weight: 800; color: var(--al-text-primary);
    margin-bottom: 6px;
  }
  .em-icon { font-size: 18px; }
  .em-section-desc { font-size: 12px; color: var(--al-text-muted); margin: 0 0 16px; }
  .em-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .em-col {
    background: var(--al-content-bg);
    border: 1px solid var(--al-border);
    border-radius: 12px; overflow: hidden;
  }
  .em-col-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; border-bottom: 1px solid var(--al-divider);
    font-size: 13px; font-weight: 700; color: var(--al-text-secondary);
  }
  .em-count {
    font-size: 11px; font-weight: 600; color: var(--al-text-muted);
    background: var(--al-row-bg); padding: 2px 8px; border-radius: 10px;
  }
  .em-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-bottom: 1px solid var(--al-divider);
    transition: background 0.15s;
  }
  .em-row:last-child { border-bottom: none; }
  .em-row:hover { background: var(--al-row-bg-hover); }
  .em-row--off { opacity: 0.5; }
  .em-row-icon {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .em-row-info { flex: 1; min-width: 0; }
  .em-row-name { font-size: 13px; font-weight: 700; color: var(--al-text-primary); display: block; }
  .em-row-sub  { font-size: 10px; color: var(--al-text-muted); font-family: 'JetBrains Mono',monospace; }
  .em-toggle {
    width: 42px; height: 23px; min-width: 42px; padding: 0; border: none;
    border-radius: 12px; cursor: pointer; position: relative; flex-shrink: 0;
    transition: background 0.25s, box-shadow 0.25s;
  }
  .em-toggle-thumb {
    position: absolute; top: 2px; right: 2px;
    width: 19px; height: 19px; border-radius: 50%;
    background: #fff; display: block;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── باقي الستايلات (نفس الأصلية) ── */
  .pm-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
  .pm-page-desc   { font-size: 13px; color: var(--al-text-muted); margin: 0; }
  .pm-section-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin: 28px 0 16px; padding-bottom: 16px; border-bottom: 1px solid var(--al-divider); }
  .pm-section-left  { display: flex; align-items: center; gap: 12px; }
  .pm-section-icon  { width: 38px; height: 38px; border-radius: 10px; font-size: 17px; flex-shrink: 0; background: var(--al-row-bg); border: 1px solid var(--al-border); display: flex; align-items: center; justify-content: center; }
  .pm-section-title { font-size: 15px; font-weight: 800; color: var(--al-text-primary); }
  .pm-section-desc  { font-size: 12px; color: var(--al-text-muted); margin-top: 2px; }
  .pm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .pm-card { border: 1px solid var(--al-border); border-radius: 14px; overflow: hidden; background: var(--al-row-bg); display: flex; flex-direction: column; transition: border-color 0.2s, box-shadow 0.2s; }
  .pm-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.25); }
  .pm-card-disabled { opacity: 0.72; }
  .pm-card-bar  { height: 3px; flex-shrink: 0; }
  .pm-card-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 11px; }
  .pm-card-top  { display: flex; align-items: center; gap: 10px; }
  .pm-card-icon { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .pm-card-meta { flex: 1; min-width: 0; }
  .pm-card-title { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pm-card-subtitle { font-size: 11px; color: var(--al-text-muted); margin-top: 2px; font-family: 'JetBrains Mono',monospace; }
  .pm-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; padding: 3px 8px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; border: 1px solid transparent; }
  .pm-badge--on   { background: rgba(34,197,94,0.12);  color: #4ade80; border-color: rgba(34,197,94,0.25); }
  .pm-badge--off  { background: rgba(100,116,139,0.1); color: #64748b; border-color: rgba(100,116,139,0.2); }
  .pm-badge--warn { background: rgba(251,191,36,0.1);  color: #fbbf24; border-color: rgba(251,191,36,0.25); }
  .pm-info-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--al-content-bg); border: 1px solid var(--al-border); border-radius: 8px; padding: 7px 10px; min-height: 36px; }
  .pm-info-text { font-size: 12px; font-family: 'JetBrains Mono',monospace; color: var(--al-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
  .pm-info-row--empty { color: var(--al-text-muted); font-size: 12px; font-style: italic; }
  .pm-copy-btn { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0; border: 1px solid var(--al-border); background: var(--al-row-bg); color: var(--al-text-muted); cursor: pointer; transition: all 0.15s; }
  .pm-copy-btn:hover { border-color: rgba(59,130,246,0.4); color: #60a5fa; }
  .pm-copy-btn--done { border-color: rgba(34,197,94,0.4); color: #4ade80; }
  .pm-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 10px; border-top: 1px solid var(--al-divider); }
  .pm-actions-end { display: flex; align-items: center; gap: 8px; }
  .pm-edit-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 7px; border: 1px solid var(--al-border); background: var(--al-row-bg); color: var(--al-text-muted); cursor: pointer; font-size: 12px; font-weight: 600; font-family: 'Cairo',sans-serif; transition: all 0.15s; }
  .pm-edit-btn:hover { border-color: rgba(59,130,246,0.35); color: #60a5fa; }
  .pm-sep { width: 1px; height: 20px; background: var(--al-divider); }
  .pm-toggle { width: 42px; height: 23px; min-width: 42px; padding: 0; border: none; border-radius: 12px; cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.25s, box-shadow 0.25s; }
  .pm-toggle-thumb { position: absolute; top: 2px; right: 2px; width: 19px; height: 19px; border-radius: 50%; background: #fff; display: block; box-shadow: 0 1px 4px rgba(0,0,0,0.3); transition: transform 0.22s cubic-bezier(0.4,0,0.2,1); }
  .pm-delete-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0; border: 1px solid var(--al-border); background: transparent; color: var(--al-text-muted); cursor: pointer; transition: all 0.15s; }
  .pm-delete-btn:hover { border-color: rgba(239,68,68,0.4); color: #f87171; background: rgba(239,68,68,0.08); }
  .pm-confirm { display: flex; gap: 4px; align-items: center; }
  .pm-confirm-yes { padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.35); background: rgba(239,68,68,0.12); color: #f87171; cursor: pointer; font-size: 11px; font-weight: 700; font-family: 'Cairo',sans-serif; }
  .pm-confirm-no  { padding: 4px 8px; border-radius: 6px; border: 1px solid var(--al-border); background: transparent; color: var(--al-text-muted); cursor: pointer; font-size: 11px; font-weight: 600; font-family: 'Cairo',sans-serif; }
  .pm-edit-panel { display: flex; flex-direction: column; gap: 10px; padding-top: 12px; border-top: 1px solid var(--al-divider); animation: pm-slide 0.16s ease; }
  .pm-field-grid    { display: grid; gap: 8px; }
  .pm-field-grid--2 { grid-template-columns: 1fr 1fr; }
  .pm-field-grid--3 { grid-template-columns: 1fr 1fr 1fr; }
  .pm-field-label { display: block; font-size: 10.5px; font-weight: 700; color: var(--al-text-muted); margin-bottom: 5px; letter-spacing: 0.3px; }
  .pm-input { width: 100%; padding: 8px 10px; box-sizing: border-box; background: var(--al-content-bg); border: 1px solid var(--al-border); border-radius: 8px; color: var(--al-text-primary); font-size: 12.5px; outline: none; font-family: 'Cairo','Tajawal',sans-serif; transition: border-color 0.18s; }
  .pm-input:focus    { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .pm-input--mono    { font-family: 'JetBrains Mono',monospace; font-size: 12px; }
  .pm-input--center  { text-align: center; font-size: 16px; padding: 7px 4px; }
  .pm-color-row   { display: flex; gap: 6px; align-items: center; }
  .pm-color-swatch { width: 36px; height: 36px; flex-shrink: 0; border: 1px solid var(--al-border); border-radius: 7px; cursor: pointer; padding: 2px; background: transparent; }
  .pm-suggest-menu { position: absolute; left: 0; top: calc(100% + 6px); z-index: 50; min-width: 220px; max-width: 90vw; max-height: 320px; overflow-y: auto; background: var(--al-sidebar-bg); border: 1px solid var(--al-border-md); border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,0.4); }  .pm-suggest-header { padding: 10px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--al-text-muted); border-bottom: 1px solid var(--al-divider); }
  .pm-suggest-btn { width: 100%; padding: 10px 14px; background: transparent; border: none; text-align: right; cursor: pointer; font-family: 'Cairo',sans-serif; color: var(--al-text-primary); transition: background 0.1s; }
  .pm-suggest-btn:hover { background: var(--al-row-bg-hover); }
  .pm-suggest-btn--custom { color: #60a5fa !important; }
  .pm-suggest-divider { height: 1px; background: var(--al-divider); margin: 4px 0; }
  .pm-suggest-row  { display: flex; align-items: center; gap: 10px; }
  .pm-suggest-name { font-size: 13px; font-weight: 700; color: var(--al-text-primary); }
  .pm-suggest-sub  { font-size: 11px; color: var(--al-text-muted); }
  .pm-add-btn { padding: 9px 16px; border-radius: 8px; border: none; background: #2563eb; color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Cairo',sans-serif; white-space: nowrap; transition: background 0.15s; }
  .pm-add-btn:hover { background: #1d4ed8; }
  .pm-save-btn { display: flex; align-items: center; gap: 8px; border-radius: 10px; border: none; color: #fff; cursor: pointer; font-weight: 700; white-space: nowrap; font-family: 'Cairo','Tajawal',sans-serif; box-shadow: 0 4px 14px rgba(59,130,246,0.3); transition: transform 0.18s, opacity 0.18s; }
  .pm-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .pm-save-btn:disabled { cursor: not-allowed; }
  .pm-save-wrap { display: flex; justify-content: flex-end; margin-top: 32px; }
  .pm-banner { padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; font-weight: 600; border: 1px solid transparent; }
  .pm-banner--error   { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.25);  color: #f87171; }
  .pm-banner--success { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.25);  color: #4ade80; }
  .pm-center  { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 20px; }
  .pm-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--al-border); border-top-color: #3b82f6; animation: pm-spin 0.8s linear infinite; }
  .pm-empty   { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 40px 20px; background: var(--al-row-bg); border: 1px dashed var(--al-border-md); border-radius: 14px; }
  .pm-empty-text { color: var(--al-text-muted); font-size: 13px; }
  @media (max-width: 1100px) { .pm-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 768px)  { .em-grid { grid-template-columns: 1fr; } }
  @media (max-width: 640px)  { .pm-grid { grid-template-columns: 1fr; } .pm-field-grid--3 { grid-template-columns: 1fr 1fr; } }
`