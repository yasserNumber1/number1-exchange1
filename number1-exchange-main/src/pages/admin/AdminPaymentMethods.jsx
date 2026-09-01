// ═══════════════════════════════════════════════════════════════
// src/pages/admin/AdminPaymentMethods.jsx
// Dynamic wallet/currency management with send/receive rules
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../services/api'
import { uid } from '../../components/admin/adminConstants'
import { displayCurrencySymbol, displayMethodSymbol } from '../../utils/currencyDisplay'

// ── Presets for quick-add (Send) ──────────────────────────────────
const SEND_PRESETS = [
  // ── محافظ مصرية ──
  { id: 'vodafone-send', name: 'Vodafone Cash', symbol: 'EGP', type: 'egp', color: '#e50000', img: '/images/vodafone.png', rateKey: 'EGP_VODAFONE', paymentMethodKey: 'VODAFONE_CASH', _cat: 'محافظ مصرية' },
  { id: 'instapay-send', name: 'InstaPay', symbol: 'EGP', type: 'egp', color: '#6a0dad', img: '/images/instapay.png', rateKey: 'EGP_INSTAPAY', paymentMethodKey: 'INSTAPAY', _cat: 'محافظ مصرية' },
  { id: 'fawry-send', name: 'Fawry', symbol: 'EGP', type: 'egp', color: '#f97316', img: '/images/fawry.png', rateKey: 'EGP_FAWRY', paymentMethodKey: 'FAWRY', _cat: 'محافظ مصرية' },
  { id: 'orange-send', name: 'Orange Cash', symbol: 'EGP', type: 'egp', color: '#ff7700', img: '/images/orange.png', rateKey: 'EGP_ORANGE', paymentMethodKey: 'ORANGE_CASH', _cat: 'محافظ مصرية' },
  { id: 'wepay-send', name: 'WE Pay', symbol: 'EGP', type: 'egp', color: '#06b6d4', img: null, icon: '📡', rateKey: 'EGP_WEPAY', paymentMethodKey: 'WE_PAY', _cat: 'محافظ مصرية' },
  { id: 'etisalat-send', name: 'Etisalat Cash', symbol: 'EGP', type: 'egp', color: '#059669', img: null, icon: '📱', rateKey: 'EGP_ETISALAT', paymentMethodKey: 'ETISALAT_CASH', _cat: 'محافظ مصرية' },
  { id: 'meeza-send', name: 'Meeza', symbol: 'EGP', type: 'egp', color: '#10b981', img: null, icon: '💳', rateKey: 'EGP_MEEZA', paymentMethodKey: 'MEEZA', _cat: 'محافظ مصرية' },
  // ── عملات رقمية ──
  { id: 'usdt-trc-send', name: 'Tether TRC20 USDT', symbol: 'USDT', type: 'crypto', color: '#26a17b', img: '/images/usdt.png', rateKey: 'USDT', paymentMethodKey: 'USDT_TRC20', _cat: 'عملات رقمية' },
  { id: 'usdt-erc-send', name: 'USDT ERC20', symbol: 'USDT', type: 'crypto', color: '#26a17b', img: '/images/usdt.png', rateKey: 'USDT', paymentMethodKey: 'USDT_ERC20', _cat: 'عملات رقمية' },
  { id: 'btc-send', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', color: '#f7931a', img: null, icon: '₿', rateKey: 'BTC', paymentMethodKey: 'BTC', _cat: 'عملات رقمية' },
  { id: 'eth-send', name: 'Ethereum', symbol: 'ETH', type: 'crypto', color: '#627eea', img: null, icon: 'Ξ', rateKey: 'ETH', paymentMethodKey: 'ETH', _cat: 'عملات رقمية' },
  { id: 'bnb-send', name: 'BNB', symbol: 'BNB', type: 'crypto', color: '#f3ba2f', img: null, icon: '⬡', rateKey: 'BNB', paymentMethodKey: 'BNB', _cat: 'عملات رقمية' },
  { id: 'ltc-send', name: 'Litecoin', symbol: 'LTC', type: 'crypto', color: '#bfbbbb', img: null, icon: 'Ł', rateKey: 'LTC', paymentMethodKey: 'LTC', _cat: 'عملات رقمية' },
  { id: 'sol-send', name: 'Solana', symbol: 'SOL', type: 'crypto', color: '#00ffa3', img: null, icon: '◎', rateKey: 'SOL', paymentMethodKey: 'SOL', _cat: 'عملات رقمية' },
  { id: 'ton-send', name: 'Toncoin', symbol: 'TON', type: 'crypto', color: '#0098ea', img: null, icon: '💎', rateKey: 'TON', paymentMethodKey: 'TON', _cat: 'عملات رقمية' },
  // ── أخرى ──
  { id: 'mgo-send', name: 'MoneyGo USD', symbol: 'MGO', type: 'moneygo', color: '#00c17c', img: '/images/moneygo.png', rateKey: 'MGO', paymentMethodKey: 'MONEYGO', _cat: 'أخرى' },
  { id: 'wallet-send', name: 'محفظة داخلية', symbol: 'USDT', type: 'wallet', color: '#378ADD', img: null, icon: '💼', rateKey: 'INTERNAL', paymentMethodKey: 'WALLET', _cat: 'أخرى' },
]

// ── Presets for quick-add (Receive) ──────────────────────────────
const RECV_PRESETS = [
  // ── محافظ مصرية ──
  { id: 'vodafone-recv', name: 'Vodafone Cash', symbol: 'EGP', type: 'egp', color: '#e50000', img: '/images/vodafone.png', rateKey: 'EGP_VODAFONE', placeholder: '01XXXXXXXXX', _cat: 'محافظ مصرية' },
  { id: 'instapay-recv', name: 'InstaPay', symbol: 'EGP', type: 'egp', color: '#6a0dad', img: '/images/instapay.png', rateKey: 'EGP_INSTAPAY', placeholder: 'اسم المستخدم أو رقم الهاتف', _cat: 'محافظ مصرية' },
  { id: 'fawry-recv', name: 'Fawry', symbol: 'EGP', type: 'egp', color: '#f97316', img: '/images/fawry.png', rateKey: 'EGP_FAWRY', placeholder: 'رقم Fawry', _cat: 'محافظ مصرية' },
  { id: 'orange-recv', name: 'Orange Cash', symbol: 'EGP', type: 'egp', color: '#ff7700', img: '/images/orange.png', rateKey: 'EGP_ORANGE', placeholder: '01XXXXXXXXX', _cat: 'محافظ مصرية' },
  { id: 'wepay-recv', name: 'WE Pay', symbol: 'EGP', type: 'egp', color: '#06b6d4', img: null, icon: '📡', rateKey: 'EGP_WEPAY', placeholder: '01XXXXXXXXX', _cat: 'محافظ مصرية' },
  { id: 'etisalat-recv', name: 'Etisalat Cash', symbol: 'EGP', type: 'egp', color: '#059669', img: null, icon: '📱', rateKey: 'EGP_ETISALAT', placeholder: '01XXXXXXXXX', _cat: 'محافظ مصرية' },
  { id: 'meeza-recv', name: 'Meeza', symbol: 'EGP', type: 'egp', color: '#10b981', img: null, icon: '💳', rateKey: 'EGP_MEEZA', placeholder: 'رقم البطاقة', _cat: 'محافظ مصرية' },
  // ── عملات رقمية ──
  { id: 'usdt-recv', name: 'Tether TRC20 USDT', symbol: 'USDT', type: 'crypto', color: '#26a17b', img: '/images/usdt.png', rateKey: 'USDT', placeholder: 'T...', _cat: 'عملات رقمية' },
  { id: 'usdt-erc-recv', name: 'USDT ERC20', symbol: 'USDT', type: 'crypto', color: '#26a17b', img: '/images/usdt.png', rateKey: 'USDT', placeholder: '0x...', _cat: 'عملات رقمية' },
  { id: 'btc-recv', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', color: '#f7931a', img: null, icon: '₿', rateKey: 'BTC', placeholder: 'bc1... or 1...', _cat: 'عملات رقمية' },
  { id: 'eth-recv', name: 'Ethereum', symbol: 'ETH', type: 'crypto', color: '#627eea', img: null, icon: 'Ξ', rateKey: 'ETH', placeholder: '0x...', _cat: 'عملات رقمية' },
  { id: 'bnb-recv', name: 'BNB', symbol: 'BNB', type: 'crypto', color: '#f3ba2f', img: null, icon: '⬡', rateKey: 'BNB', placeholder: 'bnb1...', _cat: 'عملات رقمية' },
  { id: 'ltc-recv', name: 'Litecoin', symbol: 'LTC', type: 'crypto', color: '#bfbbbb', img: null, icon: 'Ł', rateKey: 'LTC', placeholder: 'L... or ltc1...', _cat: 'عملات رقمية' },
  { id: 'sol-recv', name: 'Solana', symbol: 'SOL', type: 'crypto', color: '#00ffa3', img: null, icon: '◎', rateKey: 'SOL', placeholder: 'عنوان Solana', _cat: 'عملات رقمية' },
  { id: 'ton-recv', name: 'Toncoin', symbol: 'TON', type: 'crypto', color: '#0098ea', img: null, icon: '💎', rateKey: 'TON', placeholder: 'EQ...', _cat: 'عملات رقمية' },
  // ── أخرى ──
  { id: 'mgo-recv', name: 'MoneyGo USD', symbol: 'MGO', type: 'moneygo', color: '#00c17c', img: '/images/moneygo.png', rateKey: 'MGO', placeholder: 'U-XXXXXXXX', _cat: 'أخرى' },
  { id: 'wallet-recv', name: 'محفظة داخلية', symbol: 'USDT', type: 'wallet', color: '#378ADD', img: null, icon: '💼', rateKey: 'INTERNAL', placeholder: '', _cat: 'أخرى' },
]



function newSendMethod(preset = {}) {
  return {
    id: preset.id || `send-${uid()}`,
    name: preset.name || '\u0648\u0633\u064a\u0644\u0629 \u062c\u062f\u064a\u062f\u0629',
    symbol: preset.symbol || 'EGP',
    type: preset.type || 'custom',
    color: preset.color || '#3b82f6',
    img: preset.img || null,
    icon: preset.icon || null,
    enabled: true,
    mode: 'default',
    rateKey: preset.rateKey || '',
    paymentMethodKey: preset.paymentMethodKey || '',
    compatibleWith: preset.compatibleWith || [],
    minAmount: 0,
    maxAmount: 0,
    sortOrder: 99,
  }
}

function newRecvMethod(preset = {}) {
  return {
    id: preset.id || `recv-${uid()}`,
    name: preset.name || '\u0648\u0633\u064a\u0644\u0629 \u062c\u062f\u064a\u062f\u0629',
    symbol: preset.symbol || 'USDT',
    type: preset.type || 'custom',
    color: preset.color || '#3b82f6',
    img: preset.img || null,
    icon: preset.icon || null,
    enabled: true,
    mode: 'default',
    rateKey: preset.rateKey || '',
    placeholder: preset.placeholder || '',
    compatibleWith: preset.compatibleWith || [],
    minAmount: 0,
    maxAmount: 0,
    sortOrder: 99,
  }
}

export default function AdminPaymentMethods() {
  const [sendMethods,    setSendMethods]    = useState([])
  const [receiveMethods, setReceiveMethods] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [error,          setError]          = useState('')
  const [showAddSend,    setShowAddSend]    = useState(false)
  const [showAddRecv,    setShowAddRecv]    = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const emRes = await adminAPI.getExchangeMethods()
      setSendMethods(emRes.data.sendMethods || [])
      setReceiveMethods(emRes.data.receiveMethods || [])
    } catch {
      setSendMethods([])
      setReceiveMethods([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    const sendIds = sendMethods.map(m => m.id)
    const recvIds = receiveMethods.map(m => m.id)
    if (new Set(sendIds).size !== sendIds.length) {
      setError('توجد معرفات مكررة في وسائل الإرسال')
      setSaving(false); return
    }
    if (new Set(recvIds).size !== recvIds.length) {
      setError('توجد معرفات مكررة في وسائل الاستلام')
      setSaving(false); return
    }
    try {
      await adminAPI.saveExchangeMethods({ sendMethods, receiveMethods })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.response?.data?.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  // ── Send methods handlers ─────────────────────────────────
  const toggleSendEnabled = (id) =>
    setSendMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  const editSendMethod = (id, field, value) =>
    setSendMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  const removeSendMethod = (id) =>
    setSendMethods(prev => prev.filter(m => m.id !== id))
  const addSendMethod = (preset) => {
    setSendMethods(prev => [...prev, newSendMethod(preset)])
    setShowAddSend(false)
  }

  // ── Receive methods handlers ──────────────────────────────
  const toggleRecvEnabled = (id) =>
    setReceiveMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  const editRecvMethod = (id, field, value) =>
    setReceiveMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  const removeRecvMethod = (id) =>
    setReceiveMethods(prev => prev.filter(m => m.id !== id))
  const addRecvMethod = (preset) => {
    setReceiveMethods(prev => [...prev, newRecvMethod(preset)])
    setShowAddRecv(false)
  }

  // Toggle compatibility
  const toggleSendCompat = (sendId, recvId) => {
    setSendMethods(prev => prev.map(m => {
      if (m.id !== sendId) return m
      const compat = m.compatibleWith || []
      return {
        ...m,
        compatibleWith: compat.includes(recvId)
          ? compat.filter(id => id !== recvId)
          : [...compat, recvId]
      }
    }))
  }

  if (loading) return (
    <AdminLayout title="وسائل الدفع">
      <div className="pm-center"><div className="pm-spinner" /></div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="وسائل الدفع والعملات">
      <style>{CSS}</style>

      {/* Header */}
      <div className="pm-page-header">
        <div>
          <p className="pm-page-desc">{'\u062a\u062d\u0643\u0645 \u0641\u064a \u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062f\u0641\u0639 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0648\u0645\u0627 \u064a\u0638\u0647\u0631 \u0641\u064a \u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u0628\u0627\u062f\u0644'}</p>
        </div>
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} />
      </div>

      {error && <Banner type="error" text={error} />}
      {saved && <Banner type="success" text={'\u2713 \u062a\u0645 \u062d\u0641\u0638 \u062c\u0645\u064a\u0639 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a \u0628\u0646\u062c\u0627\u062d'} />}

      {/* ══════════════════════════════════════════════════
          Dynamic Exchange Methods — Send
      ══════════════════════════════════════════════════ */}
      <div className="em-section" style={{ border: 'none', background: 'transparent', padding: 0 }}>
        <div className="pm-section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}>
          <div className="pm-section-left">
            <div className="pm-section-icon">{'\ud83d\udce4'}</div>
            <div>
              <div className="pm-section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {'\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u2014 \u0623\u0646\u062a \u062a\u0631\u0633\u0644'}
                <span className="em-count">{sendMethods.filter(m => m.enabled).length} / {sendMethods.length} {'\u0645\u0641\u0639\u0651\u0644'}</span>
              </div>
              <div className="pm-section-desc">{'\u0623\u0636\u0641 \u0648\u0633\u0627\u0626\u0644 \u0625\u0631\u0633\u0627\u0644 \u062c\u062f\u064a\u062f\u0629 \u0623\u0648 \u0641\u0639\u0651\u0644/\u0639\u0637\u0651\u0644 \u0627\u0644\u062d\u0627\u0644\u064a\u0629'}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="pm-add-btn" onClick={() => { setShowAddSend(v => !v); setShowAddRecv(false) }}>+ {'\u0625\u0636\u0627\u0641\u0629 \u0648\u0633\u064a\u0644\u0629 \u0625\u0631\u0633\u0627\u0644'}</button>
            {showAddSend && (
              <AddMethodMenu
                presets={SEND_PRESETS}
                existingIds={sendMethods.map(m => m.id)}
                onSelect={addSendMethod}
                onCustom={() => addSendMethod({})}
                onClose={() => setShowAddSend(false)}
              />
            )}
          </div>
        </div>
        <p className="em-section-desc">{'\u0623\u0636\u0641 \u0648\u0633\u0627\u0626\u0644 \u0625\u0631\u0633\u0627\u0644 \u062c\u062f\u064a\u062f\u0629 \u0623\u0648 \u0641\u0639\u0651\u0644/\u0639\u0637\u0651\u0644 \u0627\u0644\u062d\u0627\u0644\u064a\u0629. \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a \u062a\u0638\u0647\u0631 \u0641\u0648\u0631\u0627\u064b \u0641\u064a \u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u0628\u0627\u062f\u0644'}</p>


        <div className="em-methods-list">
          {sendMethods.length === 0 ? (
            <EmptyState icon={'\ud83d\udce4'} text={'\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0633\u0627\u0626\u0644 \u0625\u0631\u0633\u0627\u0644 \u2014 \u0627\u0636\u063a\u0637 "+ \u0625\u0636\u0627\u0641\u0629" \u0644\u0644\u0628\u062f\u0621'} />
          ) : sendMethods.map(m => (
            <ExchangeMethodCard
              key={m.id}
              method={m}
              direction="send"
              otherMethods={receiveMethods}
              onToggle={() => toggleSendEnabled(m.id)}
              onEdit={(f, v) => editSendMethod(m.id, f, v)}
              onRemove={() => removeSendMethod(m.id)}
              onToggleCompat={(recvId) => toggleSendCompat(m.id, recvId)}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          Dynamic Exchange Methods — Receive
      ══════════════════════════════════════════════════ */}
      <div className="em-section" style={{ border: 'none', background: 'transparent', padding: 0 }}>
        <div className="pm-section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}>
          <div className="pm-section-left">
            <div className="pm-section-icon">{'\ud83d\udce5'}</div>
            <div>
              <div className="pm-section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {'\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u2014 \u0623\u0646\u062a \u062a\u0633\u062a\u0644\u0645'}
                <span className="em-count">{receiveMethods.filter(m => m.enabled).length} / {receiveMethods.length} {'\u0645\u0641\u0639\u0651\u0644'}</span>
              </div>
              <div className="pm-section-desc">{'\u0623\u0636\u0641 \u0648\u0633\u0627\u0626\u0644 \u0627\u0633\u062a\u0644\u0627\u0645 \u062c\u062f\u064a\u062f\u0629. \u0627\u0644\u0639\u0645\u064a\u0644 \u0644\u0627 \u064a\u0645\u0643\u0646\u0647 \u0627\u062e\u062a\u064a\u0627\u0631 \u0646\u0641\u0633 \u0627\u0644\u0639\u0645\u0644\u0629 \u0644\u0644\u0625\u0631\u0633\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645'}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="pm-add-btn" onClick={() => { setShowAddRecv(v => !v); setShowAddSend(false) }}>+ {'\u0625\u0636\u0627\u0641\u0629 \u0648\u0633\u064a\u0644\u0629 \u0627\u0633\u062a\u0644\u0627\u0645'}</button>
            {showAddRecv && (
              <AddMethodMenu
                presets={RECV_PRESETS}
                existingIds={receiveMethods.map(m => m.id)}
                onSelect={addRecvMethod}
                onCustom={() => addRecvMethod({})}
                onClose={() => setShowAddRecv(false)}
              />
            )}
          </div>
        </div>
        <p className="em-section-desc">{'\u0623\u0636\u0641 \u0648\u0633\u0627\u0626\u0644 \u0627\u0633\u062a\u0644\u0627\u0645 \u062c\u062f\u064a\u062f\u0629. \u0627\u0644\u0639\u0645\u064a\u0644 \u0644\u0627 \u064a\u0645\u0643\u0646\u0647 \u0627\u062e\u062a\u064a\u0627\u0631 \u0646\u0641\u0633 \u0627\u0644\u0639\u0645\u0644\u0629 \u0644\u0644\u0625\u0631\u0633\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645'}</p>

        <div className="em-methods-list">
          {receiveMethods.length === 0 ? (
            <EmptyState icon={'\ud83d\udce5'} text={'\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0633\u0627\u0626\u0644 \u0627\u0633\u062a\u0644\u0627\u0645 \u2014 \u0627\u0636\u063a\u0637 "+ \u0625\u0636\u0627\u0641\u0629" \u0644\u0644\u0628\u062f\u0621'} />
          ) : receiveMethods.map(m => (
            <ExchangeMethodCard
              key={m.id}
              method={m}
              direction="receive"
              otherMethods={sendMethods}
              onToggle={() => toggleRecvEnabled(m.id)}
              onEdit={(f, v) => editRecvMethod(m.id, f, v)}
              onRemove={() => removeRecvMethod(m.id)}
              onToggleCompat={() => {}}
            />
          ))}
        </div>
      </div>

      <div className="pm-save-wrap">
        <SaveBtn saving={saving} saved={saved} onClick={handleSave} large />
      </div>
    </AdminLayout>
  )
}

// ══════════════════════════════════════════════════════════════
// ExchangeMethodCard — Full editable card for send/receive methods
// ══════════════════════════════════════════════════════════════
function ExchangeMethodCard({ method, direction, otherMethods, onToggle, onEdit, onRemove, onToggleCompat }) {
  const [expanded, setExpanded] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const m = method

  return (
    <div className={`emc-card${m.enabled ? '' : ' emc-card--disabled'}`} style={{ borderColor: m.enabled ? `${m.color}30` : undefined }}>
      <div className="emc-card-bar" style={{ background: m.enabled ? m.color : '#334155' }} />
      <div className="emc-card-body">
        {/* Top row */}
        <div className="emc-top">
          <div className="emc-icon" style={{ background: `${m.color}18`, border: `1.5px solid ${m.color}35` }}>
            {m.img
              ? <img src={m.img} alt={m.name} style={{ width: '70%', height: '70%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
              : m.icon
                ? <span style={{ fontSize: 17 }}>{m.icon}</span>
                : <span style={{ fontSize: 10, fontWeight: 800, color: m.color }}>{displayMethodSymbol(m)}</span>
            }
          </div>
          <div className="emc-meta">
            <div className="emc-name" style={{ color: m.enabled ? m.color : '#64748b' }}>{m.name}</div>
            <div className="emc-sub">{displayMethodSymbol(m)} {'\u00b7'} {m.type} {'\u00b7'} {m.mode === 'custom' ? '\u0645\u062e\u0635\u0635' : '\u0627\u0641\u062a\u0631\u0627\u0636\u064a'}</div>
          </div>
          <StatusBadge enabled={m.enabled} />
        </div>

        {/* ID + rateKey info */}
        <div className="emc-info-row">
          <span className="emc-info-label">ID:</span>
          <span className="emc-info-val">{m.id}</span>
          {m.rateKey && <>
            <span className="emc-info-sep">{'\u00b7'}</span>
            <span className="emc-info-label">Rate:</span>
            <span className="emc-info-val">{displayCurrencySymbol(m.rateKey)}</span>
          </>}
        </div>

        {/* Compatible methods chips */}
        {direction === 'send' && (
          <div className="emc-compat">
            <span className="emc-compat-label">{'\u0645\u062a\u0648\u0627\u0641\u0642 \u0645\u0639:'}</span>
            <div className="emc-compat-chips">
              {otherMethods.map(rm => {
                const isCompat = (m.compatibleWith || []).includes(rm.id)
                return (
                  <button
                    key={rm.id}
                    onClick={() => onToggleCompat(rm.id)}
                    className={`emc-chip${isCompat ? ' emc-chip--on' : ''}`}
                    style={isCompat ? { borderColor: `${rm.color}60`, background: `${rm.color}15`, color: rm.color } : {}}
                  >
                    {rm.name}
                  </button>
                )
              })}
              {otherMethods.length === 0 && <span className="emc-compat-empty">{'\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0633\u0627\u0626\u0644 \u0627\u0633\u062a\u0644\u0627\u0645'}</span>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pm-actions">
          <button className="pm-edit-btn" onClick={() => { setExpanded(v => !v); setConfirm(false) }}>
            {expanded ? <CollapseIcon /> : <EditIcon />}
            <span>{expanded ? '\u0625\u062e\u0641\u0627\u0621' : '\u062a\u0639\u062f\u064a\u0644'}</span>
          </button>
          <div className="pm-actions-end">
            <Toggle value={m.enabled} onChange={onToggle} color={m.color} />
            <div className="pm-sep" />
            {confirm
              ? <div className="pm-confirm">
                  <button className="pm-confirm-yes" onClick={onRemove}>{'\u062d\u0630\u0641'}</button>
                  <button className="pm-confirm-no" onClick={() => setConfirm(false)}>{'\u0644\u0627'}</button>
                </div>
              : <button className="pm-delete-btn" onClick={() => setConfirm(true)}><TrashIcon /></button>
            }
          </div>
        </div>

        {/* Expanded edit panel */}
        {expanded && (
          <div className="pm-edit-panel">

            {/* ── رقم الاستلام (للمحافظ المصرية وMoneyGo) — فقط في وسائل الإرسال ── */}
            {direction === 'send' && (m.type === 'egp' || m.type === 'moneygo') && (
              <Field label="رقم الاستلام — يظهر للعميل ليحول عليه">
                <input
                  className="pm-input pm-input--mono"
                  placeholder="01XXXXXXXXX أو U-XXXXXXXX"
                  value={m.receiverNumber || ''}
                  onChange={e => onEdit('receiverNumber', e.target.value)}
                  style={{ direction: 'ltr', textAlign: 'left', fontSize: '1.05rem', fontWeight: 800, letterSpacing: 1 }}
                />
              </Field>
            )}

            {/* ── شبكات USDT مع عناوينها — فقط في وسائل الإرسال ── */}
            {direction === 'send' && m.type === 'crypto' && (
              <div>
                <label className="pm-field-label">شبكات الاستلام وعناوينها — يختار العميل منها</label>
                {(m.networks || []).map((net, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <input
                      className="pm-input pm-input--mono"
                      placeholder="TRC20"
                      value={net.networkKey || ''}
                      onChange={e => {
                        const nets = [...(m.networks || [])]
                        nets[idx] = { ...nets[idx], networkKey: e.target.value.toUpperCase() }
                        onEdit('networks', nets)
                      }}
                      style={{ direction: 'ltr', width: 90, flexShrink: 0 }}
                    />
                    <input
                      className="pm-input pm-input--mono"
                      placeholder="عنوان المحفظة T... أو 0x..."
                      value={net.address || ''}
                      onChange={e => {
                        const nets = [...(m.networks || [])]
                        nets[idx] = { ...nets[idx], address: e.target.value }
                        onEdit('networks', nets)
                      }}
                      style={{ direction: 'ltr', flex: 1 }}
                    />
                    <button
                      onClick={() => { const nets = (m.networks || []).filter((_, i) => i !== idx); onEdit('networks', nets) }}
                      style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}
                    >✕</button>
                  </div>
                ))}
                <button
                  onClick={() => onEdit('networks', [...(m.networks || []), { networkKey: '', address: '', enabled: true }])}
                  style={{ marginTop: 4, padding: '6px 14px', background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.25)', borderRadius: 6, color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.8rem' }}
                >+ إضافة شبكة</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── AddMethodMenu — categorized with section headers ─────────
function AddMethodMenu({ presets, existingIds, onSelect, onCustom, onClose }) {
  const available = presets.filter(p => !existingIds.includes(p.id))
  const groups = {}
  available.forEach(item => {
    const cat = item._cat || '\u0623\u062e\u0631\u0649'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })
  const catOrder = ['\u0645\u062d\u0627\u0641\u0638 \u0645\u0635\u0631\u064a\u0629', '\u0639\u0645\u0644\u0627\u062a \u0631\u0642\u0645\u064a\u0629', '\u0623\u062e\u0631\u0649']
  const sortedCats = catOrder.filter(c => groups[c])

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      <div className="pm-suggest-menu" style={{ maxHeight: 420, overflowY: 'auto' }}>
        <div className="pm-suggest-header">{'\u0627\u062e\u062a\u0631 \u0645\u062d\u0641\u0638\u0629 \u0623\u0648 \u0639\u0645\u0644\u0629 \u0644\u0644\u0625\u0636\u0627\u0641\u0629'}</div>
        {available.length === 0 && (
          <div style={{ padding: '16px 14px', color: '#64748b', fontSize: '0.78rem', textAlign: 'center' }}>
            {'\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u062c\u0645\u064a\u0639 \u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629'}
          </div>
        )}
        {sortedCats.map(cat => (
          <div key={cat}>
            <div style={{
              padding: '8px 14px 4px', fontSize: '0.65rem', fontWeight: 800,
              color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: 0.5, borderTop: '1px solid var(--al-border)',
              background: 'rgba(0,210,255,0.03)'
            }}>
              {cat}
            </div>
            {groups[cat].map((item, i) => (
              <button key={i} className="pm-suggest-btn" onClick={() => onSelect(item)}>
                <div className="pm-suggest-row">
                  {item.img
                    ? <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}>
                        <img src={item.img} alt={item.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                      </div>
                    : <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${item.color}20`, border: `1.5px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: item.color, fontWeight: 800 }}>{item.icon || displayMethodSymbol(item)}</span>
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pm-suggest-name">{item.name}</div>
                    <div className="pm-suggest-sub">{displayMethodSymbol(item)} {'\u00b7'} {item.type}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
        <div className="pm-suggest-divider" />
        <button className="pm-suggest-btn pm-suggest-btn--custom" onClick={onCustom}>
          {'\u270f \u0625\u0636\u0627\u0641\u0629 \u0645\u062e\u0635\u0635\u0629 (\u0645\u062d\u0641\u0638\u0629 \u0623\u0648 \u0639\u0645\u0644\u0629 \u062c\u062f\u064a\u062f\u0629)'}
        </button>
      </div>
    </>
  )
}

// ── Shared sub-components ───────────────────────────────────
function StatusBadge({ enabled, ready }) {
  if (!enabled) return <span className="pm-badge pm-badge--off">{'\u0645\u0639\u0637\u0651\u0644'}</span>
  if (ready === false) return <span className="pm-badge pm-badge--warn">{'\u0646\u0627\u0642\u0635'}</span>
  return <span className="pm-badge pm-badge--on">{'\u0646\u0634\u0637'}</span>
}

function Toggle({ value, onChange, color = '#3b82f6' }) {
  return (
    <button onClick={onChange} className="pm-toggle" style={{ background: value ? color : '#334155', boxShadow: value ? `0 0 8px ${color}44` : 'none' }}>
      <span className="pm-toggle-thumb" style={{ transform: value ? 'translateX(-19px)' : 'translateX(0)' }} />
    </button>
  )
}

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

function SuggestMenu({ items, onSelect, onClose, onCustom, renderItem }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      <div className="pm-suggest-menu">
        <div className="pm-suggest-header">{'\u0627\u062e\u062a\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629'}</div>
        {items.map((item, i) => (<button key={i} className="pm-suggest-btn" onClick={() => onSelect(item)}>{renderItem(item)}</button>))}
        <div className="pm-suggest-divider" />
        <button className="pm-suggest-btn pm-suggest-btn--custom" onClick={onCustom}>{'\u270f \u0625\u0636\u0627\u0641\u0629 \u0645\u062e\u0635\u0635\u0629'}</button>
      </div>
    </>
  )
}

function Field({ label, children }) { return <div><label className="pm-field-label">{label}</label>{children}</div> }
function Banner({ type, text }) { return <div className={`pm-banner pm-banner--${type}`}>{text}</div> }
function SaveBtn({ saving, saved, onClick, large }) {
  return (
    <button className="pm-save-btn" style={{ padding: large ? '12px 32px' : '10px 22px', fontSize: large ? 15 : 14, opacity: saving ? 0.7 : 1, background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }} onClick={onClick} disabled={saving}>
      {saving ? '\u23f3 \u062c\u0627\u0631\u064a \u0627\u0644\u062d\u0641\u0638...' : saved ? '\u2713 \u062a\u0645 \u0627\u0644\u062d\u0641\u0638' : '\ud83d\udcbe \u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a'}
    </button>
  )
}
function EmptyState({ icon, text }) { return <div className="pm-empty"><span style={{ fontSize: 28 }}>{icon}</span><span className="pm-empty-text">{text}</span></div> }

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
    display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
    font-size: 15px; font-weight: 800; color: var(--al-text-primary);
    margin-bottom: 6px; position: relative;
  }
  .em-icon { font-size: 18px; }
  .em-section-desc { font-size: 12px; color: var(--al-text-muted); margin: 0 0 16px; }
  .em-methods-list { display: flex; flex-direction: column; gap: 12px; }
  .em-count {
    font-size: 11px; font-weight: 600; color: var(--al-text-muted);
    background: var(--al-content-bg); padding: 2px 8px; border-radius: 10px;
  }

  /* ── Exchange Method Card ── */
  .emc-card {
    border: 1px solid var(--al-border); border-radius: 14px;
    overflow: hidden; background: var(--al-content-bg);
    display: flex; flex-direction: column;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .emc-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .emc-card--disabled { opacity: 0.65; }
  .emc-card-bar { height: 3px; flex-shrink: 0; }
  .emc-card-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
  .emc-top { display: flex; align-items: center; gap: 10px; }
  .emc-icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .emc-meta { flex: 1; min-width: 0; }
  .emc-name { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .emc-sub { font-size: 11px; color: var(--al-text-muted); font-family: 'JetBrains Mono',monospace; margin-top: 2px; }
  .emc-info-row {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px; background: var(--al-row-bg);
    border: 1px solid var(--al-border); border-radius: 8px;
    font-size: 11px; font-family: 'JetBrains Mono',monospace;
  }
  .emc-info-label { color: var(--al-text-muted); }
  .emc-info-val { color: var(--al-text-secondary); }
  .emc-info-sep { color: var(--al-text-muted); }

  /* ── Compatibility chips ── */
  .emc-compat { display: flex; flex-direction: column; gap: 6px; }
  .emc-compat-label { font-size: 10.5px; font-weight: 700; color: var(--al-text-muted); letter-spacing: 0.3px; }
  .emc-compat-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .emc-chip {
    padding: 4px 10px; border-radius: 8px; border: 1px solid var(--al-border);
    background: transparent; color: var(--al-text-muted);
    font-size: 11px; font-weight: 600; cursor: pointer;
    font-family: 'Cairo','Tajawal',sans-serif;
    transition: all 0.15s;
  }
  .emc-chip:hover { border-color: rgba(59,130,246,0.4); color: #60a5fa; }
  .emc-chip--on { font-weight: 700; }
  .emc-compat-empty { font-size: 11px; color: var(--al-text-muted); font-style: italic; }

  /* ── Rest of styles (unchanged) ── */
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
  .pm-suggest-menu { position: absolute; left: 0; top: calc(100% + 6px); z-index: 50; min-width: 220px; max-width: 90vw; max-height: 320px; overflow-y: auto; background: var(--al-sidebar-bg); border: 1px solid var(--al-border-md); border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
  .pm-suggest-header { padding: 10px 14px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--al-text-muted); border-bottom: 1px solid var(--al-divider); }
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
