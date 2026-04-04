// src/pages/admin/AdminPaymentMethods.jsx
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../services/api'
import { CRYPTO_PRESETS as CRYPTO_SUGGESTIONS, uid } from '../../components/admin/adminConstants'

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
  id:      uid(),
  coin:    sug.coin    || '',
  network: sug.network || '',
  label:   sug.label   || '',
  icon:    sug.icon    || '₮',
  color:   sug.color   || '#26a17b',
  address: '',
  enabled: true,
})

const newWallet = (sug = {}) => ({
  id:          uid(),
  name:        sug.name        || '',
  icon:        sug.icon        || '📱',
  color:       sug.color       || '#3b82f6',
  placeholder: sug.placeholder || 'رقم الاستلام',
  number:      '',
  enabled:     true,
})

// ═══════════════════════════════════════════════════════════
export default function AdminPaymentMethods() {
  const [cryptos,        setCryptos]        = useState([])
  const [wallets,        setWallets]        = useState([])
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
      const { data } = await adminAPI.getPaymentMethods()
      setCryptos(data.cryptos || [])
      setWallets(data.wallets || [])
    } catch {
      setCryptos([])
      setWallets([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await adminAPI.savePaymentMethods({ cryptos, wallets })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'فشل الحفظ، تحقق من الاتصال بالسيرفر')
    } finally {
      setSaving(false)
    }
  }

  const addCrypto    = (sug)          => { setCryptos(p => [...p, newCrypto(sug)]); setShowCryptoMenu(false); setSaved(false) }
  const editCrypto   = (id, f, v)     => setCryptos(p => p.map(c => c.id === id ? { ...c, [f]: v } : c))
  const removeCrypto = (id)           => setCryptos(p => p.filter(c => c.id !== id))
  const toggleCrypto = (id)           => editCrypto(id, 'enabled', !cryptos.find(c => c.id === id)?.enabled)

  const addWallet    = (sug)          => { setWallets(p => [...p, newWallet(sug)]); setShowWalletMenu(false); setSaved(false) }
  const editWallet   = (id, f, v)     => setWallets(p => p.map(w => w.id === id ? { ...w, [f]: v } : w))
  const removeWallet = (id)           => setWallets(p => p.filter(w => w.id !== id))
  const toggleWallet = (id)           => editWallet(id, 'enabled', !wallets.find(w => w.id === id)?.enabled)

  const activeCryptos = cryptos.filter(c => c.enabled && c.address).length
  const activeWallets = wallets.filter(w => w.enabled && w.number).length

  if (loading) return (
    <AdminLayout title="وسائل الدفع">
      <div className="pm-center"><div className="pm-spinner" /><span style={{ color: '#64748b' }}>جاري التحميل...</span></div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="وسائل الدفع">

      {/* ── Responsive CSS ── */}
      <style>{`
        @keyframes pm-spin { to { transform: rotate(360deg) } }

        /* ── Page header ── */
        .pm-page-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
        }
        .pm-stats-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

        /* ── Section header ── */
        .pm-section-header {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 10px;
          margin: 28px 0 16px; padding-bottom: 14px;
          border-bottom: 1px solid #1e293b;
        }
        .pm-section-left { display: flex; align-items: center; gap: 12px; }

        /* ── Cards grid ── */
        .pm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: 14px;
        }

        /* ── Card ── */
        .pm-card {
          border: 1px solid; border-radius: 16px;
          overflow: hidden; transition: all 0.2s;
          display: flex; flex-direction: column;
        }

        /* Card top bar (accent color line) */
        .pm-card-bar { height: 3px; flex-shrink: 0; }

        /* Card body padding */
        .pm-card-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

        /* ── Card header row ── */
        .pm-card-head {
          display: flex; align-items: center; gap: 10px;
        }
        .pm-card-head-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .pm-card-head-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* ── Fields ── */
        .pm-fields { display: flex; flex-direction: column; gap: 10px; }

        /* Coin/Network row — 2 cols on mobile, 3 with icon */
        .pm-cn-row {
          display: grid;
          grid-template-columns: 1fr 1fr 56px;
          gap: 8px;
        }

        /* ── Loading / empty ── */
        .pm-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 20px; }
        .pm-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #1e293b; border-top: 3px solid #3b82f6; animation: pm-spin 0.8s linear infinite; }
        .pm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 36px 20px; background: #1e293b; border: 1px dashed #334155; border-radius: 14px; }

        /* ── Save button (full width on mobile) ── */
        .pm-save-wrap { display: flex; justify-content: flex-end; margin-top: 28px; }

        /* ── Suggest menu (dropdown) ── */
        .pm-suggest-menu {
          position: absolute; left: 0; top: calc(100% + 6px);
          min-width: 220px; max-width: 90vw; z-index: 50;
          background: #1e293b; border: 1px solid #334155;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          max-height: 320px; overflow-y: auto;
        }

        /* ── Mobile overrides ── */
        @media (max-width: 520px) {
          .pm-cn-row { grid-template-columns: 1fr 1fr; }
          .pm-cn-icon { display: none; }          /* hide icon field on very small */
          .pm-card-body { padding: 14px 12px; }
          .pm-save-wrap { justify-content: stretch; }
          .pm-save-wrap button { width: 100%; justify-content: center; }
          .pm-section-header { margin-top: 20px; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="pm-page-header">
        <div>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>
            تحكم في وسائل الدفع المقبولة وأرقام الاستلام
          </p>
          <div className="pm-stats-row">
            <Chip icon="₮" label={`${activeCryptos} شبكة نشطة`}  color="#26a17b" />
            <Chip icon="📱" label={`${activeWallets} محفظة نشطة`} color="#3b82f6" />
          </div>
        </div>
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} />
      </div>

      {error && <Banner type="error"   text={error} />}
      {saved && <Banner type="success" text="✓ تم حفظ جميع التغييرات بنجاح" />}

      {/* ══ SECTION 1 — Crypto Networks ══ */}
      <div className="pm-section-header">
        <div className="pm-section-left">
          <div style={s.sectionIcon}>🔗</div>
          <div>
            <div style={s.sectionTitle}>شبكات العملات الرقمية</div>
            <div style={s.sectionDesc}>أضف أي عملة / شبكة تريد قبول التحويل عليها</div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <AddBtn label="+ إضافة شبكة" onClick={() => { setShowCryptoMenu(v => !v); setShowWalletMenu(false) }} />
          {showCryptoMenu && (
            <SuggestMenu
              items={CRYPTO_SUGGESTIONS}
              onSelect={addCrypto}
              onClose={() => setShowCryptoMenu(false)}
              onCustom={() => { addCrypto({}); setShowCryptoMenu(false) }}
              renderItem={s => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: s.color, fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{s.network}</div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {cryptos.length === 0
        ? <div className="pm-empty"><span style={{ fontSize: 28 }}>🔗</span><span style={{ color: '#475569', fontSize: 13 }}>لا يوجد شبكات — اضغط "إضافة شبكة" للبدء</span></div>
        : <div className="pm-grid">
            {cryptos.map(c => (
              <CryptoCard key={c.id} item={c}
                onToggle={() => toggleCrypto(c.id)}
                onEdit={(f, v) => editCrypto(c.id, f, v)}
                onRemove={() => removeCrypto(c.id)}
              />
            ))}
          </div>
      }

      {/* ══ SECTION 2 — Electronic Wallets ══ */}
      <div className="pm-section-header">
        <div className="pm-section-left">
          <div style={s.sectionIcon}>📱</div>
          <div>
            <div style={s.sectionTitle}>المحافظ الإلكترونية</div>
            <div style={s.sectionDesc}>أضف محافظ الدفع المحلية وأرقام الاستلام</div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <AddBtn label="+ إضافة محفظة" onClick={() => { setShowWalletMenu(v => !v); setShowCryptoMenu(false) }} />
          {showWalletMenu && (
            <SuggestMenu
              items={WALLET_SUGGESTIONS}
              onSelect={addWallet}
              onClose={() => setShowWalletMenu(false)}
              onCustom={() => { addWallet({}); setShowWalletMenu(false) }}
              renderItem={s => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{s.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.name}</span>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {wallets.length === 0
        ? <div className="pm-empty"><span style={{ fontSize: 28 }}>📱</span><span style={{ color: '#475569', fontSize: 13 }}>لا يوجد محافظ — اضغط "إضافة محفظة" للبدء</span></div>
        : <div className="pm-grid">
            {wallets.map(w => (
              <WalletCard key={w.id} item={w}
                onToggle={() => toggleWallet(w.id)}
                onEdit={(f, v) => editWallet(w.id, f, v)}
                onRemove={() => removeWallet(w.id)}
              />
            ))}
          </div>
      }

      {/* ── Bottom Save ── */}
      <div className="pm-save-wrap">
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} large />
      </div>

    </AdminLayout>
  )
}

// ═══════════════════════════════════════════════════════════
// CryptoCard
// ═══════════════════════════════════════════════════════════
function CryptoCard({ item, onToggle, onEdit, onRemove }) {
  const [focusedAddr, setFocusedAddr] = useState(false)
  const [confirm,     setConfirm]     = useState(false)
  const [copied,      setCopied]      = useState(false)

  const isReady = item.enabled && item.address

  const handleCopy = () => {
    navigator.clipboard.writeText(item.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accentColor = item.enabled ? item.color : '#475569'

  return (
    <div className="pm-card" style={{ borderColor: item.enabled ? `${item.color}40` : '#334155', background: item.enabled ? `${item.color}06` : '#161b22' }}>

      {/* Top accent bar */}
      <div className="pm-card-bar" style={{ background: isReady ? item.color : item.enabled ? '#f59e0b' : '#334155' }} />

      <div className="pm-card-body">

        {/* ── Header row ── */}
        <div className="pm-card-head">
          {/* Icon circle */}
          <div style={{ ...s.iconCircle, background: `${item.color}20`, color: item.color, border: `1.5px solid ${item.color}40` }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
          </div>

          {/* Name + meta */}
          <div className="pm-card-head-info">
            <input
              style={{ ...s.nameInput, color: accentColor }}
              value={item.label}
              onChange={e => onEdit('label', e.target.value)}
              placeholder="اسم الشبكة"
            />
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
              {item.coin || '—'} · {item.network || '—'}
            </div>
          </div>

          {/* Controls */}
          <div className="pm-card-head-controls">
            <Toggle value={item.enabled} onChange={onToggle} color={item.color} />
            <DeleteBtn confirm={confirm} onConfirm={onRemove} onRequest={() => setConfirm(true)} onCancel={() => setConfirm(false)} />
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="pm-fields">

          {/* Coin / Network / Icon */}
          <div className="pm-cn-row">
            <div>
              <Label>العملة</Label>
              <input style={s.input} placeholder="USDT" value={item.coin} onChange={e => onEdit('coin', e.target.value)} />
            </div>
            <div>
              <Label>الشبكة</Label>
              <input style={s.input} placeholder="TRC20" value={item.network} onChange={e => onEdit('network', e.target.value)} />
            </div>
            <div className="pm-cn-icon">
              <Label>رمز</Label>
              <input style={{ ...s.input, textAlign: 'center', fontSize: 16, padding: '9px 4px' }} value={item.icon} onChange={e => onEdit('icon', e.target.value)} maxLength={2} />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label>عنوان المحفظة</Label>
            <div style={{ position: 'relative' }}>
              <input
                style={{
                  ...s.input,
                  direction: 'ltr', textAlign: 'left',
                  fontFamily: 'monospace', fontSize: 12,
                  paddingLeft: item.address ? 52 : 12,
                  borderColor: focusedAddr && item.enabled ? item.color : '#334155',
                  boxShadow:   focusedAddr && item.enabled ? `0 0 0 3px ${item.color}22` : 'none',
                  opacity:     item.enabled ? 1 : 0.5,
                }}
                placeholder="0x... أو T..."
                value={item.address}
                onChange={e => onEdit('address', e.target.value)}
                disabled={!item.enabled}
                onFocus={() => setFocusedAddr(true)}
                onBlur={() => setFocusedAddr(false)}
              />
              {item.address && (
                <button style={s.copyBtn} onClick={handleCopy}>
                  {copied ? '✓' : 'نسخ'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Status footer ── */}
        <StatusRow ready={isReady} enabled={item.enabled} missingText="أدخل عنوان المحفظة" readyText={`${item.coin} ${item.network} — جاهز للاستلام`} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// WalletCard
// ═══════════════════════════════════════════════════════════
function WalletCard({ item, onToggle, onEdit, onRemove }) {
  const [focusedNum, setFocusedNum] = useState(false)
  const [confirm,    setConfirm]    = useState(false)
  const [copied,     setCopied]     = useState(false)

  const isReady = item.enabled && item.number

  const handleCopy = () => {
    navigator.clipboard.writeText(item.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accentColor = item.enabled ? item.color : '#475569'

  return (
    <div className="pm-card" style={{ borderColor: item.enabled ? `${item.color}40` : '#334155', background: item.enabled ? `${item.color}06` : '#161b22' }}>

      {/* Top accent bar */}
      <div className="pm-card-bar" style={{ background: isReady ? item.color : item.enabled ? '#f59e0b' : '#334155' }} />

      <div className="pm-card-body">

        {/* ── Header row ── */}
        <div className="pm-card-head">
          {/* Emoji icon — editable */}
          <button
            style={{ ...s.iconCircle, background: `${item.color}20`, border: `1.5px solid ${item.color}40`, cursor: 'text', fontSize: 20 }}
            title="انقر لتغيير الأيقونة"
            onClick={e => { const el = e.currentTarget.querySelector('span'); if (el) el.focus() }}
          >
            <span
              contentEditable suppressContentEditableWarning
              style={{ outline: 'none', userSelect: 'text', fontSize: 20, lineHeight: 1 }}
              onBlur={e => onEdit('icon', e.currentTarget.textContent.slice(0, 2) || '📱')}
            >
              {item.icon}
            </span>
          </button>

          {/* Name */}
          <div className="pm-card-head-info">
            <input
              style={{ ...s.nameInput, color: accentColor }}
              value={item.name}
              onChange={e => onEdit('name', e.target.value)}
              placeholder="اسم المحفظة"
            />
            <div style={{ fontSize: 11, color: '#475569' }}>
              {item.number ? item.number : 'لم يُدخَل رقم بعد'}
            </div>
          </div>

          {/* Controls */}
          <div className="pm-card-head-controls">
            <Toggle value={item.enabled} onChange={onToggle} color={item.color} />
            <DeleteBtn confirm={confirm} onConfirm={onRemove} onRequest={() => setConfirm(true)} onCancel={() => setConfirm(false)} />
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="pm-fields">

          {/* Number */}
          <div>
            <Label>رقم الاستلام</Label>
            <div style={{ position: 'relative' }}>
              <input
                style={{
                  ...s.input,
                  direction: 'ltr', textAlign: 'left',
                  borderColor: focusedNum && item.enabled ? item.color : '#334155',
                  boxShadow:   focusedNum && item.enabled ? `0 0 0 3px ${item.color}22` : 'none',
                  opacity:     item.enabled ? 1 : 0.5,
                  paddingLeft: item.number ? 52 : 12,
                }}
                placeholder={item.placeholder || 'رقم الاستلام'}
                value={item.number}
                onChange={e => onEdit('number', e.target.value)}
                disabled={!item.enabled}
                onFocus={() => setFocusedNum(true)}
                onBlur={() => setFocusedNum(false)}
              />
              {item.number && (
                <button style={s.copyBtn} onClick={handleCopy}>
                  {copied ? '✓' : 'نسخ'}
                </button>
              )}
            </div>
          </div>

          {/* Account Name */}
          <div>
            <Label>اسم الحساب (يظهر للمستخدم)</Label>
            <input
              style={{ ...s.input, opacity: item.enabled ? 1 : 0.5 }}
              placeholder="NUMBER 1 EXCHANGE"
              value={item.accountName || ''}
              onChange={e => onEdit('accountName', e.target.value)}
              disabled={!item.enabled}
            />
          </div>

          {/* Note */}
          <div>
            <Label>ملاحظة للمستخدم (اختياري)</Label>
            <input
              style={{ ...s.input, opacity: item.enabled ? 1 : 0.5 }}
              placeholder="مثال: حوّل المبلغ خلال 30 دقيقة"
              value={item.note || ''}
              onChange={e => onEdit('note', e.target.value)}
              disabled={!item.enabled}
            />
          </div>
        </div>

        {/* ── Status footer ── */}
        <StatusRow ready={isReady} enabled={item.enabled} missingText="أدخل رقم الاستلام" readyText={`${item.name} — ${item.number}`} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Shared sub-components
// ═══════════════════════════════════════════════════════════

function StatusRow({ ready, enabled, missingText, readyText }) {
  const color = ready ? '#4ade80' : enabled ? '#fbbf24' : '#475569'
  const dot   = ready ? '#22c55e' : enabled ? '#f59e0b' : '#475569'
  const text  = !enabled ? 'معطّل — لا يظهر للمستخدمين' : !ready ? `⚠ ${missingText}` : `✓ ${readyText}`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingTop: 10, borderTop: '1px solid #1e293b' }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: dot, boxShadow: ready ? '0 0 6px rgba(34,197,94,0.5)' : 'none' }} />
      <span style={{ fontSize: 11, color, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  )
}

function Toggle({ value, onChange, color = '#3b82f6' }) {
  return (
    <button
      onClick={onChange}
      title={value ? 'تعطيل' : 'تفعيل'}
      style={{ width: 44, height: 24, minWidth: 44, minHeight: 24, padding: 0, boxSizing: 'content-box', borderRadius: 12, border: 'none', cursor: 'pointer', background: value ? color : '#334155', position: 'relative', transition: 'background 0.25s', flexShrink: 0, boxShadow: value ? `0 0 8px ${color}44` : 'none' }}
    >
      <span style={{ position: 'absolute', top: 2, right: value ? 2 : 'auto', left: value ? 'auto' : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 0.2s', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

function DeleteBtn({ confirm, onConfirm, onRequest, onCancel }) {
  if (confirm) return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button style={{ ...s.smallBtn, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }} onClick={onConfirm}>حذف</button>
      <button style={{ ...s.smallBtn, background: 'transparent', color: '#64748b', border: '1px solid #334155' }} onClick={onCancel}>إلغاء</button>
    </div>
  )
  return (
    <button style={{ ...s.smallBtn, background: 'transparent', color: '#475569', border: '1px solid #2d3748', padding: '5px 9px' }} onClick={onRequest} title="حذف">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    </button>
  )
}

function SuggestMenu({ items, onSelect, onClose, onCustom, renderItem }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      <div className="pm-suggest-menu">
        <div style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #334155', letterSpacing: 1 }}>اختر من القائمة</div>
        {items.map((item, i) => (
          <button key={i} style={s.suggestItem} onClick={() => onSelect(item)}>
            {renderItem(item)}
          </button>
        ))}
        <div style={{ height: 1, background: '#334155', margin: '4px 0' }} />
        <button style={{ ...s.suggestItem, color: '#3b82f6' }} onClick={onCustom}>✏ إضافة مخصصة (يدوي)</button>
      </div>
    </>
  )
}

function AddBtn({ label, onClick }) {
  return (
    <button style={s.addBtn} onClick={onClick}>{label}</button>
  )
}

function Chip({ icon, label, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, background: '#1e293b', border: `1px solid ${color}33`, borderRadius: 8, padding: '4px 10px', color }}>
      <span>{icon}</span> {label}
    </span>
  )
}

function Banner({ type, text }) {
  const isErr = type === 'error'
  return (
    <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, background: isErr ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${isErr ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, color: isErr ? '#f87171' : '#4ade80' }}>{text}</div>
  )
}

function SaveBtn({ saving, saved, onClick, large }) {
  return (
    <button
      style={{ ...s.saveBtn, padding: large ? '12px 32px' : '10px 22px', fontSize: large ? 15 : 14, opacity: saving ? 0.7 : 1, background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
      onClick={onClick}
      disabled={saving}
    >
      {saving ? '⏳ جاري الحفظ...' : saved ? '✓ تم الحفظ' : '💾 حفظ التغييرات'}
    </button>
  )
}

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5, letterSpacing: 0.3 }}>{children}</label>
}

// ── Styles ────────────────────────────────────────────────
const s = {
  sectionIcon:  { width: 36, height: 36, borderRadius: 10, background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  sectionDesc:  { fontSize: 12, color: '#64748b', margin: '2px 0 0' },

  iconCircle: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  nameInput: {
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: 15, fontWeight: 800,
    fontFamily: "'Cairo','Tajawal',sans-serif",
    width: '100%', minWidth: 0, padding: 0,
    color: '#e2e8f0',
  },

  input: {
    width: '100%', padding: '9px 12px',
    background: '#0d1117',
    border: '1px solid #334155', borderRadius: 9,
    color: '#e2e8f0', fontSize: 13, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: "'Cairo','Tajawal',sans-serif",
  },

  copyBtn: {
    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
    padding: '3px 8px', borderRadius: 5,
    border: '1px solid #334155', background: '#1e293b',
    color: '#3b82f6', fontSize: 10, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Cairo',sans-serif",
  },

  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    borderRadius: 10, border: 'none', color: '#fff',
    cursor: 'pointer', fontWeight: 700,
    boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
    transition: 'all 0.2s', fontFamily: "'Cairo','Tajawal',sans-serif",
    whiteSpace: 'nowrap',
  },

  addBtn: {
    padding: '9px 16px', borderRadius: 8, border: 'none',
    background: '#2563eb', color: '#fff',
    fontWeight: 700, fontSize: 13, cursor: 'pointer',
    fontFamily: "'Cairo','Tajawal',sans-serif", whiteSpace: 'nowrap',
  },

  smallBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '5px 10px', borderRadius: 7,
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    fontFamily: "'Cairo','Tajawal',sans-serif", whiteSpace: 'nowrap',
  },

  suggestItem: {
    width: '100%', padding: '10px 14px',
    background: 'transparent', border: 'none',
    textAlign: 'right', cursor: 'pointer',
    fontFamily: "'Cairo','Tajawal',sans-serif",
    color: '#e2e8f0',
  },
}
