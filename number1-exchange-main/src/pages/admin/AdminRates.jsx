// src/pages/admin/AdminRates.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { adminAPI } from "../../services/api";

const SECTIONS = [
  {
    id:    "usdt_egp",
    title: "USDT ↔ الجنيه المصري",
    color: "#2563eb",
    icon:  "💵",
    fields: [
      {
        key:   "usdtBuyRate",
        label: "سعر شراء USDT",
        help:  "العميل يدفع جنيه ← يستلم USDT",
        ex:    "مثال: 50 يعني 50 جنيه = 1 USDT",
        unit:  "جنيه / USDT",
        tag:   "🟢 العميل يشتري منك",
      },
      {
        key:   "usdtSellRate",
        label: "سعر بيع USDT",
        help:  "العميل يرسل USDT ← يستلم جنيه",
        ex:    "مثال: 49 يعني 1 USDT = 49 جنيه",
        unit:  "جنيه / USDT",
        tag:   "🔴 العميل يبيع لك",
      },
    ],
  },
  {
    id:    "moneygo",
    title: "MoneyGo USD",
    color: "#059669",
    icon:  "💚",
    fields: [
      {
        key:   "moneygoRate",
        label: "سعر شراء MoneyGo",
        help:  "العميل يرسل MoneyGo ← يستلم USDT",
        ex:    "مثال: 1.005 يعني 1 MoneyGo = 1.005 USDT",
        unit:  "USDT / MGO",
        tag:   "🟢 العميل يبيع MoneyGo لك",
        step:  "0.001",
      },
      {
        key:   "moneygoSellRate",
        label: "سعر بيع MoneyGo",
        help:  "العميل يرسل USDT ← يستلم MoneyGo",
        ex:    "مثال: 0.995 يعني 1 USDT = 0.995 MoneyGo",
        unit:  "MGO / USDT",
        tag:   "🔴 العميل يشتري MoneyGo منك",
        step:  "0.001",
      },
    ],
  },
  {
    id:       "egp_wallets",
    title:    "المحافظ الإلكترونية المصرية",
    subtitle: "فودافون كاش · إنستا باي · فاوري · أورنج كاش",
    color:    "#d97706",
    icon:     "📱",
    fields: [
      {
        key:   "vodafoneBuyRate",
        label: "فودافون كاش",
        help:  "كم جنيه فودافون = 1 USDT",
        ex:    "مثال: 50 يعني 50 جنيه فودافون = 1 USDT",
        unit:  "جنيه / USDT",
        tag:   "🟢 شراء من العميل",
      },
      {
        key:   "instaPayRate",
        label: "إنستا باي",
        help:  "كم جنيه إنستا = 1 USDT",
        ex:    "مثال: 45 يعني 45 جنيه إنستا = 1 USDT",
        unit:  "جنيه / USDT",
        tag:   "🟢 شراء من العميل",
      },
      {
        key:   "fawryRate",
        label: "فاوري",
        help:  "كم جنيه فاوري = 1 USDT",
        ex:    "مثال: 46 يعني 46 جنيه فاوري = 1 USDT",
        unit:  "جنيه / USDT",
        tag:   "🟢 شراء من العميل",
      },
      {
        key:   "orangeRate",
        label: "أورنج كاش",
        help:  "كم جنيه أورنج = 1 USDT",
        ex:    "مثال: 47 يعني 47 جنيه أورنج = 1 USDT",
        unit:  "جنيه / USDT",
        tag:   "🟢 شراء من العميل",
      },
    ],
  },
  {
    id:    "limits",
    title: "حدود المعاملات",
    color: "#dc2626",
    icon:  "⚡",
    fields: [
      {
        key:   "minOrderUsdt",
        label: "الحد الأدنى للطلب",
        help:  "أقل مبلغ USDT مقبول لأي عملية",
        ex:    "مثال: 10 يعني أقل طلب هو 10 USDT",
        unit:  "USDT",
        tag:   "📉 الحد الأدنى",
        step:  "1",
      },
      {
        key:   "maxOrderUsdt",
        label: "الحد الأقصى للطلب",
        help:  "أعلى مبلغ USDT مقبول لأي عملية",
        ex:    "مثال: 5000 يعني أعلى طلب هو 5000 USDT",
        unit:  "USDT",
        tag:   "📈 الحد الأقصى",
        step:  "1",
      },
    ],
  },
];

export default function AdminRates() {
  const [rates,   setRates]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await adminAPI.getRates();
      setRates(data || {});
    } catch { setError("فشل تحميل الأسعار"); }
    finally  { setLoading(false); }
  };

  const handleChange = (key, val) => { setRates(p => ({ ...p, [key]: val })); setSaved(false); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await adminAPI.saveRates(rates);
      setSaved(true); setTimeout(() => setSaved(false), 4000);
    } catch (e) { setError(e.message || "فشل الحفظ"); }
    finally     { setSaving(false); }
  };

  if (loading) return <AdminLayout><div style={{ padding: 80, textAlign: "center", color: "#6e7681" }}>جاري التحميل...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>الأسعار</h2>
          <p style={S.sub}>تحديث أسعار الصرف لجميع العمليات</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.iconBtn} onClick={load}><RefreshCw size={15} /></button>
          <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /><span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </button>
        </div>
      </div>

      {error && <div style={{ ...S.alert, background: "#3d0a0a", color: "#f85149" }}><AlertCircle size={15} /> {error}</div>}
      {saved && <div style={{ ...S.alert, background: "#064e3b", color: "#34d399" }}><CheckCircle size={15} /> تم حفظ جميع الأسعار بنجاح ✅</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SECTIONS.map(sec => (
          <div key={sec.id} style={S.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, marginBottom: 18, borderBottom: `1px solid ${sec.color}33` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: sec.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {sec.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: sec.color }}>{sec.title}</div>
                {sec.subtitle && <div style={{ fontSize: 12, color: "#6e7681", marginTop: 2 }}>{sec.subtitle}</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
              {sec.fields.map(f => (
                <RateField key={f.key} field={f} value={rates[f.key] ?? ""} color={sec.color} onChange={v => handleChange(f.key, v)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingBottom: 24 }}>
        <button style={{ ...S.saveBtn, padding: "11px 28px", fontSize: 14 }} onClick={handleSave} disabled={saving}>
          <Save size={16} /><span>{saving ? "جاري الحفظ..." : "حفظ كل التغييرات"}</span>
        </button>
      </div>
    </AdminLayout>
  );
}

function RateField({ field, value, color, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.field}>
      <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginBottom: 10, display: "inline-block", alignSelf: "flex-start", background: color + "18", color, border: `1px solid ${color}33` }}>
        {field.tag}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#c9d1d9" }}>{field.label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "#21262d", color: "#8b949e" }}>{field.unit}</span>
      </div>
      <p style={{ fontSize: 11, color: "#6e7681", margin: "0 0 10px", lineHeight: 1.5 }}>{field.help}</p>
      <input
        type="number"
        step={field.step || "0.01"}
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "10px 12px", background: "#0d1117",
          border: `1.5px solid ${focused ? color : "#21262d"}`,
          borderRadius: 8, color: focused ? color : "#e6edf3",
          fontSize: 20, fontWeight: 700, outline: "none",
          transition: "all 0.18s",
          boxShadow: focused ? `0 0 0 3px ${color}22` : "none",
          boxSizing: "border-box", textAlign: "center", fontFamily: "monospace",
        }}
      />
      <p style={{ fontSize: 10, color: "#484f58", margin: "6px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>{field.ex}</p>
    </div>
  );
}

const S = {
  header:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title:   { fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: 0 },
  sub:     { fontSize: 13, color: "#6e7681", marginTop: 3 },
  iconBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, border: "1px solid #21262d", borderRadius: 8, background: "#161b22", color: "#8b949e", cursor: "pointer" },
  saveBtn: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  alert:   { display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 },
  card:    { backgroundColor: "#161b22", border: "1px solid #21262d", borderRadius: 12, padding: 20 },
  field:   { background: "#0d1117", border: "1px solid #21262d", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column" },
};