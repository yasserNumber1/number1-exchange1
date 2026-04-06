// src/pages/admin/AdminRates.jsx
// =============================================
// لوحة تحكم الأسعار — واجهة واضحة ومنطقية
// الأدمن يتحكم في كل سعر بشكل مستقل
// =============================================

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Save, RefreshCw, TrendingUp, AlertCircle, CheckCircle, ArrowDownUp } from "lucide-react";
import { adminAPI } from "../../services/api";

// ══════════════════════════════════════════════
// تعريف الأسعار — منطق واضح لكل حقل
// ══════════════════════════════════════════════
const RATE_SECTIONS = [
  {
    id: "usdt_egp",
    title: "USDT ↔ الجنيه المصري",
    subtitle: "سعر الدولار USDT مقابل الجنيه",
    color: "#2563eb",
    icon: "💵",
    pairs: [
      {
        buyKey:  "usdtBuyRate",
        sellKey: "usdtSellRate",
        label:   "USDT / جنيه مصري",
        buyDesc:  "العميل يدفع جنيه ويستلم USDT — (كم جنيه = 1 USDT)",
        sellDesc: "العميل يرسل USDT ويستلم جنيه — (كم جنيه يحصل عليه لكل USDT)",
        buyExample:  "مثال: 50 يعني العميل يدفع 50 جنيه ← يستلم 1 USDT",
        sellExample: "مثال: 49.5 يعني العميل يرسل 1 USDT ← يستلم 49.5 جنيه",
        buyUnit:  "جنيه / USDT",
        sellUnit: "جنيه / USDT",
      }
    ]
  },
  {
    id: "moneygo_egp",
    title: "MoneyGo ↔ الجنيه المصري",
    subtitle: "سعر MoneyGo مقابل الجنيه",
    color: "#059669",
    icon: "💚",
    pairs: [
      {
        buyKey:  "moneygoEgpBuyRate",
        sellKey: "moneygoEgpSellRate",
        label:   "MoneyGo / جنيه مصري",
        buyDesc:  "العميل يدفع جنيه ويستلم MoneyGo — (كم جنيه = 1 MoneyGo)",
        sellDesc: "العميل يرسل MoneyGo ويستلم جنيه — (كم جنيه لكل MoneyGo)",
        buyExample:  "مثال: 52 يعني العميل يدفع 52 جنيه ← يستلم 1 MoneyGo",
        sellExample: "مثال: 51 يعني العميل يرسل 1 MoneyGo ← يستلم 51 جنيه",
        buyUnit:  "جنيه / MGO",
        sellUnit: "جنيه / MGO",
      }
    ]
  },
  {
    id: "moneygo_usdt",
    title: "MoneyGo ↔ USDT",
    subtitle: "سعر MoneyGo مقابل الدولار USDT",
    color: "#7c3aed",
    icon: "🔄",
    single: true,
    fields: [
      {
        key:     "moneygoRate",
        label:   "سعر MoneyGo بالـ USDT",
        desc:    "كم USDT يساوي 1 MoneyGo USD",
        example: "مثال: 1.002 يعني العميل يرسل 1 MoneyGo ← يستلم 1.002 USDT",
        unit:    "USDT / MGO",
        placeholder: "1.002",
      }
    ]
  },
  {
    id: "egp_wallets",
    title: "المحافظ الإلكترونية المصرية",
    subtitle: "سعر موحد لـ فودافون كاش / إنستا باي / فاوري / أورنج كاش",
    color: "#d97706",
    icon: "📱",
    pairs: [
      {
        buyKey:  "egpWalletBuyRate",
        sellKey: "egpWalletSellRate",
        label:   "جنيه مصري / USDT",
        buyDesc:  "العميل يدفع جنيه عبر محفظة ويستلم USDT — (كم جنيه = 1 USDT)",
        sellDesc: "العميل يرسل USDT ويستلم جنيه عبر محفظة — (كم جنيه لكل USDT)",
        buyExample:  "مثال: 50 يعني العميل يدفع 50 جنيه فودافون ← يستلم 1 USDT",
        sellExample: "مثال: 49.5 يعني العميل يرسل 1 USDT ← يستلم 49.5 جنيه",
        buyUnit:  "جنيه / USDT",
        sellUnit: "جنيه / USDT",
      }
    ]
  },
  {
    id: "limits",
    title: "حدود المعاملات",
    subtitle: "الحد الأدنى والأقصى للطلبات",
    color: "#dc2626",
    icon: "⚡",
    single: true,
    fields: [
      {
        key:         "minOrderUsdt",
        label:       "الحد الأدنى للطلب",
        desc:        "أقل مبلغ USDT مقبول لأي عملية",
        example:     "مثال: 10 يعني أقل طلب هو 10 USDT",
        unit:        "USDT",
        placeholder: "10",
      },
      {
        key:         "maxOrderUsdt",
        label:       "الحد الأقصى للطلب",
        desc:        "أعلى مبلغ USDT مقبول لأي عملية",
        example:     "مثال: 5000 يعني أعلى طلب هو 5000 USDT",
        unit:        "USDT",
        placeholder: "5000",
      }
    ]
  },
];

export default function AdminRates() {
  const [rates,   setRates]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getRates();
      setRates(data || {});
    } catch (err) {
      setError("فشل تحميل الأسعار");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setRates(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await adminAPI.saveRates(rates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: 80, textAlign: "center", color: "#6e7681" }}>
        جاري التحميل...
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>

      {/* ── Header ─────────────────────────── */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>الأسعار</h2>
          <p style={s.pageSub}>تحديث أسعار الصرف لجميع العمليات</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.refreshBtn} onClick={fetchRates} title="تحديث">
            <RefreshCw size={15} />
          </button>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving
              ? <span>جاري الحفظ...</span>
              : <><Save size={16} /><span>حفظ التغييرات</span></>
            }
          </button>
        </div>
      </div>

      {/* ── Feedback ───────────────────────── */}
      {error && (
        <div style={s.errorBanner}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {saved && (
        <div style={s.successBanner}>
          <CheckCircle size={16} /> تم حفظ الأسعار بنجاح ✅
        </div>
      )}

      {/* ── Sections ───────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {RATE_SECTIONS.map(section => (
          <div key={section.id} style={s.card}>

            {/* Section Header */}
            <div style={{ ...s.sectionHeader, borderColor: section.color + "44" }}>
              <div style={{ ...s.sectionIcon, background: section.color + "18", color: section.color }}>
                {section.icon}
              </div>
              <div>
                <div style={{ ...s.sectionTitle, color: section.color }}>
                  {section.title}
                </div>
                <div style={s.sectionSub}>{section.subtitle}</div>
              </div>
            </div>

            {/* Buy/Sell Pairs */}
            {section.pairs && section.pairs.map(pair => (
              <BuySellPair
                key={pair.buyKey}
                pair={pair}
                rates={rates}
                color={section.color}
                onChange={handleChange}
              />
            ))}

            {/* Single Fields */}
            {section.single && section.fields && (
              <div style={s.singleGrid}>
                {section.fields.map(field => (
                  <SingleField
                    key={field.key}
                    field={field}
                    value={rates[field.key] ?? ""}
                    color={section.color}
                    onChange={v => handleChange(field.key, v)}
                  />
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* ── Bottom Save ────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, marginBottom: 8 }}>
        <button
          style={{ ...s.saveBtn, padding: "12px 32px", fontSize: 15 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "جاري الحفظ..."
            : <><Save size={16} /><span>حفظ كل التغييرات</span></>
          }
        </button>
      </div>

    </AdminLayout>
  );
}

// ══════════════════════════════════════════════
// BuySellPair — زوج الشراء والبيع
// ══════════════════════════════════════════════
function BuySellPair({ pair, rates, color, onChange }) {
  const buyVal  = rates[pair.buyKey]  ?? "";
  const sellVal = rates[pair.sellKey] ?? "";

  // حساب هامش الربح
  const margin = buyVal && sellVal
    ? ((parseFloat(buyVal) - parseFloat(sellVal)) / parseFloat(buyVal) * 100).toFixed(2)
    : null;

  return (
    <div style={p.wrap}>

      {/* Label row */}
      <div style={p.labelRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowDownUp size={14} style={{ color }} />
          <span style={p.pairLabel}>{pair.label}</span>
        </div>
        {margin !== null && (
          <div style={{ ...p.marginBadge, color, background: color + "18", border: `1px solid ${color}33` }}>
            هامش: {margin}%
          </div>
        )}
      </div>

      {/* Buy + Sell inputs */}
      <div style={p.inputsRow}>

        {/* BUY — العميل يدفع جنيه ويستلم USDT */}
        <div style={p.inputBox}>
          <div style={p.inputHeader}>
            <div style={{ ...p.badge, background: "#06402822", color: "#059669", border: "1px solid #05966933" }}>
              🟢 شراء منك
            </div>
            <span style={{ ...p.unitBadge, color, background: color + "18" }}>{pair.buyUnit}</span>
          </div>
          <PriceInput
            value={buyVal}
            color="#059669"
            onChange={v => onChange(pair.buyKey, v)}
            placeholder="0.00"
          />
          <p style={p.desc}>{pair.buyDesc}</p>
          <p style={p.example}>{pair.buyExample}</p>
        </div>

        {/* Divider */}
        <div style={p.divider}>
          <div style={{ ...p.dividerLine, background: color + "33" }} />
          <div style={{ ...p.dividerIcon, color, border: `1px solid ${color}44` }}>⇄</div>
          <div style={{ ...p.dividerLine, background: color + "33" }} />
        </div>

        {/* SELL — العميل يرسل USDT ويستلم جنيه */}
        <div style={p.inputBox}>
          <div style={p.inputHeader}>
            <div style={{ ...p.badge, background: "#3d0a0a22", color: "#f87171", border: "1px solid #f8717133" }}>
              🔴 بيع لك
            </div>
            <span style={{ ...p.unitBadge, color, background: color + "18" }}>{pair.sellUnit}</span>
          </div>
          <PriceInput
            value={sellVal}
            color="#f87171"
            onChange={v => onChange(pair.sellKey, v)}
            placeholder="0.00"
          />
          <p style={p.desc}>{pair.sellDesc}</p>
          <p style={p.example}>{pair.sellExample}</p>
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// SingleField — حقل منفرد
// ══════════════════════════════════════════════
function SingleField({ field, value, color, onChange }) {
  return (
    <div style={sf.wrap}>
      <div style={sf.header}>
        <span style={sf.label}>{field.label}</span>
        <span style={{ ...sf.unit, color, background: color + "18", border: `1px solid ${color}33` }}>
          {field.unit}
        </span>
      </div>
      <p style={sf.desc}>{field.desc}</p>
      <PriceInput
        value={value}
        color={color}
        onChange={onChange}
        placeholder={field.placeholder}
      />
      <p style={sf.example}>{field.example}</p>
    </div>
  );
}

// ══════════════════════════════════════════════
// PriceInput — حقل إدخال السعر
// ══════════════════════════════════════════════
function PriceInput({ value, color, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "11px 14px",
        background: "#0d1117",
        border: `1.5px solid ${focused ? color : "#21262d"}`,
        borderRadius: 10,
        color: focused ? color : "#e6edf3",
        fontSize: 20,
        fontWeight: 700,
        outline: "none",
        transition: "all 0.2s",
        boxShadow: focused ? `0 0 0 3px ${color}22` : "none",
        boxSizing: "border-box",
        textAlign: "center",
        letterSpacing: 1,
        fontFamily: "monospace",
      }}
    />
  );
}

// ── Styles ──────────────────────────────────────────────
const s = {
  pageHeader:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  pageTitle:     { fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: 0 },
  pageSub:       { fontSize: 13, color: "#6e7681", marginTop: 4 },
  refreshBtn:    { display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, border: "1px solid #21262d", borderRadius: 8, background: "#161b22", color: "#8b949e", cursor: "pointer" },
  saveBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  errorBanner:   { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, background: "#3d0a0a", color: "#f85149", marginBottom: 16, fontSize: 14 },
  successBanner: { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, background: "#064e3b", color: "#059669", marginBottom: 16, fontSize: 14 },
  card:          { backgroundColor: "#161b22", border: "1px solid #21262d", borderRadius: 14, padding: 24 },
  sectionHeader: { display: "flex", alignItems: "center", gap: 14, paddingBottom: 18, marginBottom: 20, borderBottom: "1px solid" },
  sectionIcon:   { width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  sectionTitle:  { fontSize: 16, fontWeight: 700 },
  sectionSub:    { fontSize: 12, color: "#6e7681", marginTop: 2 },
  singleGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 },
};

const p = {
  wrap:       { marginBottom: 4 },
  labelRow:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  pairLabel:  { fontSize: 14, fontWeight: 600, color: "#c9d1d9" },
  marginBadge:{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  inputsRow:  { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, alignItems: "start" },
  inputBox:   { background: "#0d1117", border: "1px solid #21262d", borderRadius: 12, padding: 16 },
  inputHeader:{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  badge:      { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  unitBadge:  { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  desc:       { fontSize: 12, color: "#6e7681", margin: "10px 0 4px", lineHeight: 1.5 },
  example:    { fontSize: 11, color: "#484f58", margin: 0, fontStyle: "italic", lineHeight: 1.5 },
  divider:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 12px", paddingTop: 16 },
  dividerLine:{ width: 1, flex: 1, minHeight: 20 },
  dividerIcon:{ fontSize: 16, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#161b22", flexShrink: 0 },
};

const sf = {
  wrap:    { background: "#0d1117", border: "1px solid #21262d", borderRadius: 12, padding: 16 },
  header:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  label:   { fontSize: 14, fontWeight: 600, color: "#c9d1d9" },
  unit:    { fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
  desc:    { fontSize: 12, color: "#6e7681", margin: "0 0 10px", lineHeight: 1.5 },
  example: { fontSize: 11, color: "#484f58", margin: "8px 0 0", fontStyle: "italic", lineHeight: 1.5 },
};