// src/pages/admin/AdminRates.jsx
// ═══════════════════════════════════════════════════════════════
// لوحة تحكم الأسعار الديناميكية — كل زوج له شراء وبيع
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Save, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { adminAPI } from "../../services/api";

// ── تعريف الخيارات المتاحة ──────────────────────────────────
const FROM_OPTIONS = [
  { value: 'EGP_VODAFONE', label: 'فودافون كاش (EGP)',  icon: '📱' },
  { value: 'EGP_INSTAPAY', label: 'إنستا باي (EGP)',    icon: '💳' },
  { value: 'EGP_FAWRY',    label: 'فاوري (EGP)',         icon: '🏪' },
  { value: 'EGP_ORANGE',   label: 'أورنج كاش (EGP)',    icon: '🟠' },
  { value: 'USDT',         label: 'USDT TRC20',          icon: '💵' },
  { value: 'MGO',          label: 'MoneyGo USD',         icon: '💚' },
  { value: 'INTERNAL',     label: 'محفظة داخلية',        icon: '🏦' },
];

const TO_OPTIONS = [
  { value: 'USDT',     label: 'USDT TRC20',   icon: '💵' },
  { value: 'MGO',      label: 'MoneyGo USD',  icon: '💚' },
  { value: 'INTERNAL', label: 'محفظة داخلية', icon: '🏦' },
];

const getLabel = (options, value) => options.find(o => o.value === value)?.label || value;
const getIcon  = (options, value) => options.find(o => o.value === value)?.icon  || '💱';

// ── حساب هامش الربح ─────────────────────────────────────────
function calcMargin(buyRate, sellRate) {
  if (!buyRate || !sellRate || buyRate <= 0) return null;
  return ((buyRate - sellRate) / buyRate * 100);
}

export default function AdminRates() {
  const [pairs,   setPairs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await adminAPI.getRates();
      setPairs(data?.pairs || []);
    } catch {
      setError('فشل تحميل الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx, field, value) => {
    setPairs(prev => prev.map((p, i) =>
      i === idx ? { ...p, [field]: field === 'enabled' ? value : value } : p
    ));
    setSaved(false);
  };

  const handleAdd = () => {
    setPairs(prev => [...prev, {
      from: 'USDT', to: 'MGO', buyRate: '', sellRate: '', label: '', enabled: true
    }]);
  };

  const handleDelete = (idx) => {
    setPairs(prev => prev.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleSave = async () => {
    // تحقق من صحة البيانات
    for (const p of pairs) {
      if (!p.from || !p.to) { setError('كل زوج يجب أن يحتوي على من وإلى'); return; }
      if (parseFloat(p.buyRate) < 0 || parseFloat(p.sellRate) < 0) {
        setError('الأسعار لا يمكن أن تكون سالبة'); return;
      }
    }

    setSaving(true); setError('');
    try {
      const cleaned = pairs.map(p => ({
        from:     p.from,
        to:       p.to,
        buyRate:  parseFloat(p.buyRate)  || 0,
        sellRate: parseFloat(p.sellRate) || 0,
        label:    p.label || '',
        enabled:  p.enabled !== false,
      }));
      await adminAPI.saveRates({ pairs: cleaned });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setError(e.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: 80, textAlign: 'center', color: '#6e7681' }}>جاري التحميل...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>الأسعار</h2>
          <p style={S.sub}>تحكم كامل في أسعار الشراء والبيع لكل زوج</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.iconBtn} onClick={load} title="تحديث">
            <RefreshCw size={15} />
          </button>
          <button style={S.addBtn} onClick={handleAdd}>
            <Plus size={15} /> <span>إضافة زوج</span>
          </button>
          <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /> <span>{saving ? 'جاري الحفظ...' : 'حفظ الأسعار'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ ...S.alert, background: '#3d0a0a', color: '#f85149' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {saved && (
        <div style={{ ...S.alert, background: '#064e3b', color: '#34d399' }}>
          <CheckCircle size={15} /> تم حفظ جميع الأسعار بنجاح ✅
        </div>
      )}

      {/* Legend */}
      <div style={S.legend}>
        <div style={S.legendItem}>
          <span style={{ ...S.legendDot, background: '#059669' }} />
          <span style={{ color: '#6e7681', fontSize: 12 }}>
            <b style={{ color: '#c9d1d9' }}>سعر الشراء (BUY)</b> — العميل يدفع "من" ويستلم "إلى"
          </span>
        </div>
        <div style={S.legendItem}>
          <span style={{ ...S.legendDot, background: '#dc2626' }} />
          <span style={{ color: '#6e7681', fontSize: 12 }}>
            <b style={{ color: '#c9d1d9' }}>سعر البيع (SELL)</b> — العميل يرسل "إلى" ويستلم "من"
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div style={S.tableHeader}>
        <div style={{ flex: 2 }}>من</div>
        <div style={{ flex: 2 }}>إلى</div>
        <div style={{ flex: 2, color: '#059669' }}>🟢 سعر الشراء (BUY)</div>
        <div style={{ flex: 2, color: '#dc2626' }}>🔴 سعر البيع (SELL)</div>
        <div style={{ flex: 1.5, color: '#f59e0b' }}>هامش الربح</div>
        <div style={{ flex: 1 }}>مفعّل</div>
        <div style={{ width: 36 }}></div>
      </div>

      {/* Pairs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pairs.map((pair, idx) => {
          const margin      = calcMargin(parseFloat(pair.buyRate), parseFloat(pair.sellRate));
          const hasError    = parseFloat(pair.sellRate) > parseFloat(pair.buyRate);
          const lowMargin   = margin !== null && margin < 0.5 && margin >= 0;

          return (
            <PairRow
              key={idx}
              pair={pair}
              idx={idx}
              margin={margin}
              hasError={hasError}
              lowMargin={lowMargin}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          );
        })}

        {pairs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#484f58', fontSize: 14 }}>
            لا توجد أزواج — اضغط "إضافة زوج" للبدء
          </div>
        )}
      </div>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingBottom: 24 }}>
        <button style={S.addBtn} onClick={handleAdd}>
          <Plus size={15} /> <span>إضافة زوج جديد</span>
        </button>
        <button style={{ ...S.saveBtn, padding: '11px 28px', fontSize: 14 }} onClick={handleSave} disabled={saving}>
          <Save size={16} /> <span>{saving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}</span>
        </button>
      </div>

    </AdminLayout>
  );
}

// ── PairRow Component ────────────────────────────────────────
function PairRow({ pair, idx, margin, hasError, lowMargin, onChange, onDelete }) {
  return (
    <div style={{
      ...S.row,
      borderColor: hasError ? '#dc262644' : lowMargin ? '#f59e0b44' : '#21262d',
      background: hasError ? 'rgba(220,38,38,0.04)' : pair.enabled === false ? 'rgba(255,255,255,0.01)' : '#161b22',
      opacity: pair.enabled === false ? 0.6 : 1,
    }}>

      {/* من */}
      <div style={{ flex: 2 }}>
        <select
          value={pair.from}
          onChange={e => onChange(idx, 'from', e.target.value)}
          style={S.select}
        >
          {FROM_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
          ))}
        </select>
      </div>

      {/* إلى */}
      <div style={{ flex: 2 }}>
        <select
          value={pair.to}
          onChange={e => onChange(idx, 'to', e.target.value)}
          style={S.select}
        >
          {TO_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
          ))}
        </select>
      </div>

      {/* سعر الشراء */}
      <div style={{ flex: 2 }}>
        <RateInput
          value={pair.buyRate}
          color="#059669"
          placeholder="0.00"
          onChange={v => onChange(idx, 'buyRate', v)}
        />
      </div>

      {/* سعر البيع */}
      <div style={{ flex: 2 }}>
        <RateInput
          value={pair.sellRate}
          color={hasError ? '#dc2626' : '#dc2626'}
          placeholder="0.00"
          onChange={v => onChange(idx, 'sellRate', v)}
        />
      </div>

      {/* هامش الربح */}
      <div style={{ flex: 1.5, display: 'flex', alignItems: 'center' }}>
        {margin !== null ? (
          <span style={{
            fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
            padding: '3px 10px', borderRadius: 20,
            background: hasError  ? 'rgba(220,38,38,0.15)'
                       : lowMargin ? 'rgba(245,158,11,0.15)'
                       : 'rgba(5,150,105,0.15)',
            color:      hasError  ? '#f87171'
                       : lowMargin ? '#fbbf24'
                       : '#34d399',
            border: `1px solid ${hasError ? '#dc262633' : lowMargin ? '#f59e0b33' : '#05966933'}`,
          }}>
            {hasError ? '⚠ خطأ' : `${margin.toFixed(2)}%`}
          </span>
        ) : (
          <span style={{ color: '#484f58', fontSize: 12 }}>—</span>
        )}
      </div>

      {/* مفعّل */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={pair.enabled !== false}
          onChange={e => onChange(idx, 'enabled', e.target.checked)}
          style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
        />
      </div>

      {/* حذف */}
      <button
        onClick={() => onDelete(idx)}
        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #21262d', background: 'transparent', color: '#6e7681', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#f87171'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.color = '#6e7681'; }}
      >
        <Trash2 size={14} />
      </button>

    </div>
  );
}

// ── RateInput ────────────────────────────────────────────────
function RateInput({ value, color, placeholder, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      step="0.001"
      min="0"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        padding: '9px 10px',
        background: '#0d1117',
        border: `1.5px solid ${focused ? color : '#21262d'}`,
        borderRadius: 8,
        color: focused ? color : '#e6edf3',
        fontSize: 16,
        fontWeight: 700,
        outline: 'none',
        transition: 'all 0.15s',
        boxShadow: focused ? `0 0 0 3px ${color}22` : 'none',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'monospace',
      }}
    />
  );
}

// ── Styles ───────────────────────────────────────────────────
const S = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  title:       { fontSize: 20, fontWeight: 700, color: '#e6edf3', margin: 0 },
  sub:         { fontSize: 13, color: '#6e7681', marginTop: 3 },
  iconBtn:     { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #21262d', borderRadius: 8, background: '#161b22', color: '#8b949e', cursor: 'pointer' },
  addBtn:      { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #21262d', background: '#161b22', color: '#c9d1d9', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  saveBtn:     { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  alert:       { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 },
  legend:      { display: 'flex', gap: 24, marginBottom: 12, padding: '10px 16px', background: '#161b22', borderRadius: 8, border: '1px solid #21262d', flexWrap: 'wrap' },
  legendItem:  { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot:   { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  tableHeader: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#6e7681', fontFamily: 'monospace', letterSpacing: 0.5, marginBottom: 4 },
  row:         { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '1px solid', borderRadius: 10, transition: 'all 0.15s' },
  select:      { width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, color: '#c9d1d9', fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: "'Tajawal',sans-serif" },
};