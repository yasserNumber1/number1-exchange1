// src/pages/admin/AdminPaymentMethods.jsx
// =============================================
// وسائل الدفع — نظام ديناميكي كامل
// الأدمن يضيف / يحذف / يعدّل:
//   1. شبكات Crypto (USDT TRC20, BNB, etc.)
//   2. محافظ إلكترونية (Vodafone, InstaPay, etc.)
// =============================================

import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../services/api'

// ── اقتراحات جاهزة للأدمن ────────────────────────────────
const CRYPTO_SUGGESTIONS = [
  { coin: 'USDT', network: 'TRC20',  label: 'USDT TRC20',  icon: '₮', color: '#26a17b' },
  { coin: 'USDT', network: 'BEP20',  label: 'USDT BEP20',  icon: '₮', color: '#f0b90b' },
  { coin: 'USDT', network: 'ERC20',  label: 'USDT ERC20',  icon: '₮', color: '#627eea' },
  { coin: 'BNB',  network: 'BEP20',  label: 'BNB BEP20',   icon: '◆', color: '#f0b90b' },
  { coin: 'ETH',  network: 'ERC20',  label: 'ETH ERC20',   icon: 'Ξ', color: '#627eea' },
  { coin: 'TRX',  network: 'TRC20',  label: 'TRX TRC20',   icon: '◈', color: '#ff060a' },
  { coin: 'BTC',  network: 'Bitcoin',label: 'Bitcoin',      icon: '₿', color: '#f7931a' },
  { coin: 'USDC', network: 'ERC20',  label: 'USDC ERC20',  icon: '$', color: '#2775ca' },
]

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

// ── ID generator ──────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

// ── Default empty items ───────────────────────────────────
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
  const [cryptos,  setCryptos]  = useState([])
  const [wallets,  setWallets]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [showCryptoMenu, setShowCryptoMenu] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)

  useEffect(() => { fetchData() }, [])

  // ── Fetch ─────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getPaymentMethods()
      setCryptos(data.cryptos  || [])
      setWallets(data.wallets  || [])
    } catch {
      // أول مرة — ابدأ فارغ
      setCryptos([])
      setWallets([])
    } finally {
      setLoading(false)
    }
  }

  // ── Save ──────────────────────────────────────────────
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

  // ── Crypto CRUD ───────────────────────────────────────
  const addCrypto  = (sug)  => { setCryptos(p => [...p, newCrypto(sug)]); setShowCryptoMenu(false); setSaved(false) }
  const editCrypto = (id, field, val) => setCryptos(p => p.map(c => c.id === id ? { ...c, [field]: val } : c))
  const removeCrypto = (id) => setCryptos(p => p.filter(c => c.id !== id))
  const toggleCrypto = (id) => editCrypto(id, 'enabled', !cryptos.find(c => c.id === id)?.enabled)

  // ── Wallet CRUD ───────────────────────────────────────
  const addWallet  = (sug)  => { setWallets(p => [...p, newWallet(sug)]); setShowWalletMenu(false); setSaved(false) }
  const editWallet = (id, field, val) => setWallets(p => p.map(w => w.id === id ? { ...w, [field]: val } : w))
  const removeWallet = (id) => setWallets(p => p.filter(w => w.id !== id))
  const toggleWallet = (id) => editWallet(id, 'enabled', !wallets.find(w => w.id === id)?.enabled)

  // ── Stats ─────────────────────────────────────────────
  const activeCryptos = cryptos.filter(c => c.enabled && c.address).length
  const activeWallets = wallets.filter(w => w.enabled && w.number).length

  if (loading) return (
    <AdminLayout title="وسائل الدفع">
      <div style={s.center}><div style={s.spinner} /><span style={{ color: '#64748b' }}>جاري التحميل...</span></div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="وسائل الدفع">

      {/* ── Page Header ─────────────────────────── */}
      <div style={s.pageHeader}>
        <div>
          <p style={s.pageDesc}>تحكم كامل في وسائل الدفع المقبولة وأرقام الاستلام</p>
          <div style={s.statsRow}>
            <Chip icon="₮" label={`${activeCryptos} شبكة crypto نشطة`} color="#26a17b" />
            <Chip icon="📱" label={`${activeWallets} محفظة نشطة`}      color="#3b82f6" />
          </div>
        </div>
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} />
      </div>

      {error  && <Banner type="error"   text={error} />}
      {saved  && <Banner type="success" text="✓ تم حفظ جميع التغييرات بنجاح" />}

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 1 — Crypto Networks           */}
      {/* ═══════════════════════════════════════ */}
      <SectionHeader
        icon="🔗"
        title="شبكات العملات الرقمية"
        desc="أضف أي عملة / شبكة تريد قبول التحويل عليها"
        action={
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
                    <span style={{ fontSize: 18, color: s.color, fontWeight: 800 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{s.network}</div>
                    </div>
                  </div>
                )}
              />
            )}
          </div>
        }
      />

      {cryptos.length === 0 ? (
        <EmptyState icon="🔗" text="لا يوجد شبكات — أضف شبكة للبدء" />
      ) : (
        <div style={s.cardsGrid}>
          {cryptos.map(c => (
            <CryptoCard
              key={c.id}
              item={c}
              onToggle={() => toggleCrypto(c.id)}
              onEdit={(f, v) => editCrypto(c.id, f, v)}
              onRemove={() => removeCrypto(c.id)}
            />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* SECTION 2 — Electronic Wallets        */}
      {/* ═══════════════════════════════════════ */}
      <SectionHeader
        icon="📱"
        title="المحافظ الإلكترونية"
        desc="أضف محافظ الدفع المحلية وأرقام الاستلام الخاصة بك"
        action={
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
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{s.name}</span>
                  </div>
                )}
              />
            )}
          </div>
        }
      />

      {wallets.length === 0 ? (
        <EmptyState icon="📱" text="لا يوجد محافظ — أضف محفظة للبدء" />
      ) : (
        <div style={s.cardsGrid}>
          {wallets.map(w => (
            <WalletCard
              key={w.id}
              item={w}
              onToggle={() => toggleWallet(w.id)}
              onEdit={(f, v) => editWallet(w.id, f, v)}
              onRemove={() => removeWallet(w.id)}
            />
          ))}
        </div>
      )}

      {/* ── Bottom Save ─────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} large />
      </div>

    </AdminLayout>
  )
}

// ═══════════════════════════════════════════════════════════
// CryptoCard
// ═══════════════════════════════════════════════════════════
function CryptoCard({ item, onToggle, onEdit, onRemove }) {
  const [focused, setFocused] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const isReady = item.enabled && item.address

  return (
    <div style={{
      ...s.card,
      borderColor: item.enabled ? `${item.color}44` : '#334155',
      background:  item.enabled ? `${item.color}08` : '#1e293b',
    }}>
      {/* Header */}
      <div style={s.cardTop}>
        <div style={s.cardTopLeft}>
          <div style={{ ...s.coinIcon, background: `${item.color}22`, color: item.color }}>
            {item.icon}
          </div>
          {/* Editable label */}
          <input
            style={{ ...s.inlineInput, color: item.enabled ? item.color : '#64748b', fontWeight: 800 }}
            value={item.label}
            onChange={e => onEdit('label', e.target.value)}
            placeholder="اسم الشبكة"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Toggle value={item.enabled} onChange={onToggle} color={item.color} />
          <DeleteBtn confirm={confirm} onConfirm={onRemove} onRequest={() => setConfirm(true)} onCancel={() => setConfirm(false)} />
        </div>
      </div>

      {/* Fields */}
      <div style={s.fields}>
        {/* Coin + Network row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Label>العملة</Label>
            <input
              style={s.input}
              placeholder="USDT"
              value={item.coin}
              onChange={e => onEdit('coin', e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label>الشبكة</Label>
            <input
              style={s.input}
              placeholder="TRC20"
              value={item.network}
              onChange={e => onEdit('network', e.target.value)}
            />
          </div>
          <div style={{ width: 60 }}>
            <Label>أيقونة</Label>
            <input
              style={{ ...s.input, textAlign: 'center', fontSize: 18 }}
              value={item.icon}
              onChange={e => onEdit('icon', e.target.value)}
              maxLength={2}
            />
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
                borderColor: focused && item.enabled ? item.color : '#334155',
                boxShadow:   focused && item.enabled ? `0 0 0 3px ${item.color}22` : 'none',
                paddingLeft: item.address ? 56 : 12,
              }}
              placeholder="0x... أو T..."
              value={item.address}
              onChange={e => onEdit('address', e.target.value)}
              disabled={!item.enabled}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {item.address && (
              <button
                style={s.copyBtn}
                onClick={() => navigator.clipboard.writeText(item.address)}
              >نسخ</button>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <StatusRow
        ready={isReady}
        enabled={item.enabled}
        missingText="أدخل عنوان المحفظة"
        readyText={`${item.coin} ${item.network} — جاهز للاستلام`}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// WalletCard
// ═══════════════════════════════════════════════════════════
function WalletCard({ item, onToggle, onEdit, onRemove }) {
  const [focused, setFocused] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const isReady = item.enabled && item.number

  return (
    <div style={{
      ...s.card,
      borderColor: item.enabled ? `${item.color}44` : '#334155',
      background:  item.enabled ? `${item.color}08` : '#1e293b',
    }}>
      {/* Header */}
      <div style={s.cardTop}>
        <div style={s.cardTopLeft}>
          {/* Editable emoji */}
          <input
            style={{ ...s.emojiInput }}
            value={item.icon}
            onChange={e => onEdit('icon', e.target.value)}
            maxLength={2}
            title="تغيير الأيقونة"
          />
          {/* Editable name */}
          <input
            style={{ ...s.inlineInput, color: item.enabled ? item.color : '#64748b', fontWeight: 800 }}
            value={item.name}
            onChange={e => onEdit('name', e.target.value)}
            placeholder="اسم المحفظة"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Toggle value={item.enabled} onChange={onToggle} color={item.color} />
          <DeleteBtn confirm={confirm} onConfirm={onRemove} onRequest={() => setConfirm(true)} onCancel={() => setConfirm(false)} />
        </div>
      </div>

      {/* Fields */}
      <div style={s.fields}>
        {/* Number */}
        <div>
          <Label>رقم الاستلام</Label>
          <input
            style={{
              ...s.input,
              direction: 'ltr', textAlign: 'left',
              borderColor: focused && item.enabled ? item.color : '#334155',
              boxShadow:   focused && item.enabled ? `0 0 0 3px ${item.color}22` : 'none',
            }}
            placeholder={item.placeholder || 'رقم الاستلام'}
            value={item.number}
            onChange={e => onEdit('number', e.target.value)}
            disabled={!item.enabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <Label>ملاحظة للمستخدم (اختياري)</Label>
          <input
            style={s.input}
            placeholder="مثال: حوّل المبلغ خلال 30 دقيقة"
            value={item.note || ''}
            onChange={e => onEdit('note', e.target.value)}
            disabled={!item.enabled}
          />
        </div>
      </div>

      {/* Status */}
      <StatusRow
        ready={isReady}
        enabled={item.enabled}
        missingText="أدخل رقم الاستلام"
        readyText={`${item.name} — ${item.number}`}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Shared Sub-components
// ═══════════════════════════════════════════════════════════

function SectionHeader({ icon, title, desc, action }) {
  return (
    <div style={s.sectionHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={s.sectionHeaderIcon}>{icon}</div>
        <div>
          <h2 style={s.sectionHeaderTitle}>{title}</h2>
          <p style={s.sectionHeaderDesc}>{desc}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function SuggestMenu({ items, onSelect, onClose, onCustom, renderItem }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      <div style={s.suggestMenu}>
        <div style={s.suggestHeader}>اختر من القائمة</div>
        {items.map((item, i) => (
          <button key={i} style={s.suggestItem} onClick={() => onSelect(item)}>
            {renderItem(item)}
          </button>
        ))}
        <div style={s.suggestDivider} />
        <button style={{ ...s.suggestItem, color: '#3b82f6' }} onClick={onCustom}>
          ✏ إضافة مخصصة (يدوي)
        </button>
      </div>
    </>
  )
}

function AddBtn({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{ ...s.addBtn, background: hov ? '#1d4ed8' : '#2563eb' }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </button>
  )
}

function DeleteBtn({ confirm, onConfirm, onRequest, onCancel }) {
  if (confirm) return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button style={{ ...s.smallBtn, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }} onClick={onConfirm}>حذف</button>
      <button style={{ ...s.smallBtn, background: '#1e293b', color: '#64748b', border: '1px solid #334155' }} onClick={onCancel}>إلغاء</button>
    </div>
  )
  return (
    <button style={{ ...s.smallBtn, background: 'transparent', color: '#475569', border: '1px solid #334155' }} onClick={onRequest} title="حذف">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    </button>
  )
}

function StatusRow({ ready, enabled, missingText, readyText }) {
  return (
    <div style={s.statusRow}>
      <div style={{
        ...s.statusDot,
        background: ready ? '#22c55e' : enabled ? '#f59e0b' : '#475569',
        boxShadow:  ready ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
      }} />
      <span style={{ fontSize: 11, color: ready ? '#4ade80' : enabled ? '#fbbf24' : '#475569' }}>
        {!enabled ? 'معطّل — لا يظهر للمستخدمين'
         : !ready  ? `⚠ ${missingText}`
         :           `✓ ${readyText}`}
      </span>
    </div>
  )
}

function Toggle({ value, onChange, color = '#3b82f6' }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11,
      border: 'none', cursor: 'pointer',
      background: value ? color : '#334155',
      position: 'relative',
      transition: 'background 0.25s',
      flexShrink: 0,
      boxShadow: value ? `0 0 8px ${color}44` : 'none',
    }}>
      <span style={{
        position: 'absolute', top: 3,
        right: value ? 3 : 'auto',
        left:  value ? 'auto' : 3,
        width: 16, height: 16,
        borderRadius: '50%', background: '#fff',
        transition: 'all 0.2s', display: 'block',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function Label({ children }) {
  return <label style={s.fieldLabel}>{children}</label>
}

function Chip({ icon, label, color }) {
  return (
    <span style={{ ...s.chip, borderColor: `${color}33`, color }}>
      <span>{icon}</span> {label}
    </span>
  )
}

function Banner({ type, text }) {
  const isErr = type === 'error'
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10, marginBottom: 16,
      fontSize: 14, fontWeight: 600,
      background: isErr ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      border: `1px solid ${isErr ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
      color: isErr ? '#f87171' : '#4ade80',
    }}>{text}</div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={s.emptyState}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{ color: '#475569', fontSize: 14 }}>{text}</span>
    </div>
  )
}

function SaveBtn({ saving, saved, onClick, large }) {
  return (
    <button
      style={{
        ...s.saveBtn,
        padding: large ? '12px 36px' : '10px 22px',
        fontSize: large ? 15 : 14,
        opacity: saving ? 0.7 : 1,
        background: saved
          ? 'linear-gradient(135deg,#22c55e,#16a34a)'
          : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
      }}
      onClick={onClick}
      disabled={saving}
    >
      {saving ? '⏳ جاري الحفظ...' : saved ? '✓ تم الحفظ' : '💾 حفظ التغييرات'}
    </button>
  )
}

// ── Styles ────────────────────────────────────────────────
const s = {
  center:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 80 },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #1e293b', borderTop: '3px solid #3b82f6', animation: 'spin 0.8s linear infinite' },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageDesc:   { fontSize: 14, color: '#64748b', margin: '4px 0 10px' },
  statsRow:   { display: 'flex', gap: 10, flexWrap: 'wrap' },

  chip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 600,
    background: '#1e293b', border: '1px solid',
    borderRadius: 8, padding: '4px 12px',
  },

  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    borderRadius: 10, border: 'none',
    color: '#fff', cursor: 'pointer', fontWeight: 700,
    boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
    transition: 'all 0.2s',
    fontFamily: "'Cairo','Tajawal',sans-serif",
  },

  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    margin: '28px 0 14px',
    padding: '0 0 14px',
    borderBottom: '1px solid #1e293b',
  },
  sectionHeaderIcon:  { width: 38, height: 38, borderRadius: 10, background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  sectionHeaderTitle: { fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  sectionHeaderDesc:  { fontSize: 12, color: '#64748b', margin: '3px 0 0' },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 14,
  },

  card: {
    border: '1px solid',
    borderRadius: 14,
    padding: 18,
    transition: 'all 0.2s',
  },

  cardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTopLeft:{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },

  coinIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 900, flexShrink: 0,
  },

  inlineInput: {
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: 14, fontFamily: "'Cairo','Tajawal',sans-serif",
    width: '100%', minWidth: 0,
    transition: 'color 0.2s',
  },

  emojiInput: {
    width: 36, height: 36, borderRadius: 8,
    background: '#0f172a', border: '1px solid #334155',
    textAlign: 'center', fontSize: 20,
    cursor: 'pointer', outline: 'none',
    flexShrink: 0,
    fontFamily: 'inherit',
    color: '#e2e8f0',
  },

  fields: { display: 'flex', flexDirection: 'column', gap: 10 },

  fieldLabel: {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#64748b', marginBottom: 5, letterSpacing: 0.3,
  },

  input: {
    width: '100%', padding: '9px 12px',
    background: '#0f172a',
    border: '1px solid #334155', borderRadius: 8,
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
  },

  statusRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid #1e293b' },
  statusDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s' },

  addBtn: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    color: '#fff', fontWeight: 700, fontSize: 13,
    cursor: 'pointer', transition: 'background 0.15s',
    fontFamily: "'Cairo','Tajawal',sans-serif",
    whiteSpace: 'nowrap',
  },

  suggestMenu: {
    position: 'absolute', left: 0, top: 'calc(100% + 6px)',
    minWidth: 220, zIndex: 50,
    background: '#1e293b', border: '1px solid #334155',
    borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
    maxHeight: 360, overflowY: 'auto',
  },
  suggestHeader: { padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #334155', letterSpacing: 1 },
  suggestItem: {
    width: '100%', padding: '10px 14px',
    background: 'transparent', border: 'none',
    textAlign: 'right', cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: "'Cairo','Tajawal',sans-serif",
  },
  suggestDivider: { height: 1, background: '#334155', margin: '4px 0' },

  smallBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '5px 10px', borderRadius: 6,
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    fontFamily: "'Cairo','Tajawal',sans-serif",
    whiteSpace: 'nowrap',
  },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    padding: '40px 20px',
    background: '#1e293b', border: '1px dashed #334155',
    borderRadius: 14, marginBottom: 4,
  },
}
