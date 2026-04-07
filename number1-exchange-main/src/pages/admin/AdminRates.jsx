// src/pages/admin/AdminRates.jsx
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Save, RefreshCw, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { adminAPI } from "../../services/api";

function calcMargin(buyRate, sellRate) {
  const b = parseFloat(buyRate);
  const s = parseFloat(sellRate);
  if (!b || !s || b <= 0) return null;
  return ((b - s) / b * 100);
}

export default function AdminRates() {
  const [rates, setRates] = useState({
    egpBuyRate:       '',
    egpSellRate:      '',
    moneyGoBuyRate:   '',
    moneyGoSellRate:  '',
    egpMgoBuyRate:    '', // EGP → MoneyGo (المستخدم يرسل EGP ويستلم MoneyGo)
    egpMgoSellRate:   '', // MoneyGo → EGP (المستخدم يرسل MoneyGo ويستلم EGP)
    internalBuyRate:  '',
    internalSellRate: '',
    minOrderUsdt:     '',
    maxOrderUsdt:     '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await adminAPI.getRates();
      const pairs = data?.pairs || [];
      const find  = (from, to) => pairs.find(p => p.from === from && p.to === to);

      const egp      = find('EGP_VODAFONE', 'USDT') || find('EGP_INSTAPAY', 'USDT');
      const mgo      = find('USDT', 'MGO');
      const egpMgo   = find('EGP_VODAFONE', 'MGO') || find('EGP', 'MGO');
      const internal = find('USDT', 'INTERNAL');

      setRates({
        egpBuyRate:       egp?.buyRate       ?? data?.usdtBuyRate      ?? '',
        egpSellRate:      egp?.sellRate      ?? data?.usdtSellRate     ?? '',
        moneyGoBuyRate:   mgo?.buyRate       ?? data?.moneygoRate      ?? '',
        moneyGoSellRate:  mgo?.sellRate      ?? data?.moneygoSellRate  ?? '',
        egpMgoBuyRate:    egpMgo?.buyRate    ?? '',
        egpMgoSellRate:   egpMgo?.sellRate   ?? '',
        internalBuyRate:  internal?.buyRate  ?? '',
        internalSellRate: internal?.sellRate ?? '',
        minOrderUsdt:     data?.minOrderUsdt ?? '',
        maxOrderUsdt:     data?.maxOrderUsdt ?? '',
      });
    } catch {
      setError('فشل تحميل الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, value) => {
    setRates(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const egpBuy    = parseFloat(rates.egpBuyRate)       || 0;
      const egpSell   = parseFloat(rates.egpSellRate)      || 0;
      const mgoBuy    = parseFloat(rates.moneyGoBuyRate)   || 0;
      const mgoSell   = parseFloat(rates.moneyGoSellRate)  || 0;
      const egpMgoBuy = parseFloat(rates.egpMgoBuyRate)    || 0;
      const egpMgoSell= parseFloat(rates.egpMgoSellRate)   || 0;
      const intBuy    = parseFloat(rates.internalBuyRate)  || 0;
      const intSell   = parseFloat(rates.internalSellRate) || 0;

      const pairs = [
        // EGP ↔ USDT
        { from: 'EGP_VODAFONE', to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'فودافون كاش ↔ USDT',     enabled: true },
        { from: 'EGP_INSTAPAY', to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'إنستا باي ↔ USDT',       enabled: true },
        { from: 'EGP_FAWRY',    to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'فاوري ↔ USDT',           enabled: true },
        { from: 'EGP_ORANGE',   to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'أورنج كاش ↔ USDT',      enabled: true },
        // USDT ↔ MoneyGo
        { from: 'USDT',         to: 'MGO',      buyRate: mgoBuy,    sellRate: mgoSell,    label: 'USDT ↔ MoneyGo',          enabled: true },
        // EGP ↔ MoneyGo
        { from: 'EGP_VODAFONE', to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'فودافون كاش ↔ MoneyGo',  enabled: true },
        { from: 'EGP_INSTAPAY', to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'إنستا باي ↔ MoneyGo',   enabled: true },
        { from: 'EGP_FAWRY',    to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'فاوري ↔ MoneyGo',        enabled: true },
        { from: 'EGP_ORANGE',   to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'أورنج كاش ↔ MoneyGo',   enabled: true },
        // USDT ↔ Internal
        { from: 'USDT',         to: 'INTERNAL', buyRate: intBuy,    sellRate: intSell,    label: 'USDT ↔ محفظة داخلية',   enabled: true },
        { from: 'INTERNAL',     to: 'USDT',     buyRate: intBuy,    sellRate: intSell,    label: 'محفظة داخلية ↔ USDT',   enabled: true },
        { from: 'INTERNAL',     to: 'MGO',      buyRate: mgoBuy,    sellRate: mgoSell,    label: 'محفظة داخلية ↔ MoneyGo', enabled: true },
      ];

      await adminAPI.saveRates({ pairs });
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

  const egpMargin      = calcMargin(rates.egpBuyRate,      rates.egpSellRate);
  const moneyGoMargin  = calcMargin(rates.moneyGoBuyRate,  rates.moneyGoSellRate);
  const egpMgoMargin   = calcMargin(rates.egpMgoBuyRate,   rates.egpMgoSellRate);
  const internalMargin = calcMargin(rates.internalBuyRate, rates.internalSellRate);

  return (
    <AdminLayout>
      <style>{`
        .ar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .ar-grid { grid-template-columns: 1fr; } }
        .ar-card { background: #0d1117; border: 1px solid #21262d; border-radius: 14px; padding: 22px 20px; margin-bottom: 14px; transition: border-color 0.2s; }
        .ar-card:hover { border-color: #30363d; }
        .ar-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #21262d; flex-wrap: wrap; gap: 8px; }
        .ar-card-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #e6edf3; font-family: 'Cairo', sans-serif; }
        .ar-section-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
        .ar-field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .ar-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; font-family: 'Cairo', sans-serif; letter-spacing: 0.3px; }
        .ar-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .ar-input { width: 100%; padding: 12px 14px; background: #161b22; border: 1.5px solid #21262d; border-radius: 10px; color: #e6edf3; font-size: 18px; font-weight: 700; outline: none; transition: all 0.15s; text-align: center; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; -moz-appearance: textfield; }
        .ar-input::-webkit-outer-spin-button, .ar-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .ar-input.buy:focus  { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.15); color: #34d399; }
        .ar-input.sell:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); color: #f87171; }
        .ar-input.limit:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); color: #fbbf24; }
        .ar-input::placeholder { color: #484f58; font-size: 15px; }
        .ar-margin-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .ar-sub { font-size: 11px; color: #6e7681; margin-top: 4px; font-family: 'Cairo', sans-serif; text-align: center; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', margin: 0, fontFamily: 'Cairo, sans-serif' }}>الأسعار</h2>
          <p style={{ fontSize: 13, color: '#6e7681', marginTop: 3, fontFamily: 'Cairo, sans-serif' }}>تحديث أسعار الصرف لجميع العمليات</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.iconBtn} onClick={load} title="تحديث"><RefreshCw size={15} /></button>
          <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /><span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </div>

      {error && <div style={{ ...S.alert, background: '#3d0a0a', color: '#f85149', marginBottom: 16 }}><AlertCircle size={15} /> {error}</div>}
      {saved && <div style={{ ...S.alert, background: '#064e3b', color: '#34d399', marginBottom: 16 }}><CheckCircle size={15} /> تم حفظ جميع الأسعار بنجاح ✅</div>}

      {/* ١. EGP ↔ USDT */}
      <RateSection
        icon="🇪🇬" iconBg="rgba(0,180,100,0.12)"
        title="USDT ↔ جنيه مصري (EGP)"
        subtitle="يُطبَّق على: فودافون كاش · إنستا باي · فاوري · أورنج كاش"
        margin={egpMargin}
        buyLabel="سعر شراء USDT" buyHint="المستخدم يرسل EGP ← نعطيه USDT"
        buyValue={rates.egpBuyRate} onBuyChange={v => set('egpBuyRate', v)}
        sellLabel="سعر بيع USDT" sellHint="المستخدم يرسل USDT ← نعطيه EGP"
        sellValue={rates.egpSellRate} onSellChange={v => set('egpSellRate', v)}
        unit="EGP"
      />

      {/* ٢. USDT ↔ MoneyGo */}
      <RateSection
        icon="💚" iconBg="rgba(5,150,105,0.12)"
        title="USDT ↔ MoneyGo USD"
        subtitle="تحويل بين USDT و MoneyGo مباشرة"
        margin={moneyGoMargin}
        buyLabel="سعر شراء MoneyGo" buyHint="المستخدم يرسل MoneyGo ← نعطيه USDT"
        buyValue={rates.moneyGoBuyRate} onBuyChange={v => set('moneyGoBuyRate', v)}
        sellLabel="سعر بيع MoneyGo" sellHint="المستخدم يرسل USDT ← نعطيه MoneyGo"
        sellValue={rates.moneyGoSellRate} onSellChange={v => set('moneyGoSellRate', v)}
        unit="USDT"
      />

      {/* ٣. EGP ↔ MoneyGo (الجديد) */}
      <RateSection
        icon="🔄" iconBg="rgba(0,193,124,0.12)"
        title="MoneyGo ↔ جنيه مصري (EGP)"
        subtitle="يُطبَّق على: فودافون كاش · إنستا باي · فاوري · أورنج كاش → MoneyGo"
        margin={egpMgoMargin}
        buyLabel="سعر شراء MoneyGo بالجنيه" buyHint="المستخدم يرسل EGP ← نعطيه MoneyGo"
        buyValue={rates.egpMgoBuyRate} onBuyChange={v => set('egpMgoBuyRate', v)}
        sellLabel="سعر بيع MoneyGo بالجنيه" sellHint="المستخدم يرسل MoneyGo ← نعطيه EGP"
        sellValue={rates.egpMgoSellRate} onSellChange={v => set('egpMgoSellRate', v)}
        unit="EGP"
      />

      {/* ٤. USDT داخلي */}
      <RateSection
        icon="🏦" iconBg="rgba(37,99,235,0.12)"
        title="USDT داخلي (المحفظة الداخلية)"
        subtitle="سعر التحويل داخل منصة Number1"
        margin={internalMargin}
        buyLabel="سعر شراء داخلي" buyHint="شراء USDT عبر المحفظة الداخلية"
        buyValue={rates.internalBuyRate} onBuyChange={v => set('internalBuyRate', v)}
        sellLabel="سعر بيع داخلي" sellHint="بيع USDT عبر المحفظة الداخلية"
        sellValue={rates.internalSellRate} onSellChange={v => set('internalSellRate', v)}
        unit="USDT"
      />

      {/* حدود المعاملات */}
      <div className="ar-card">
        <div className="ar-card-header">
          <div className="ar-card-title">
            <div className="ar-section-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>⚖️</div>
            <div>
              <div>حدود المعاملات</div>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 400, marginTop: 2 }}>أقل وأعلى مبلغ USDT مقبول</div>
            </div>
          </div>
        </div>
        <div className="ar-grid">
          <div className="ar-field-wrap">
            <div className="ar-label" style={{ color: '#fbbf24' }}><span className="ar-dot" style={{ background: '#f59e0b' }} />الحد الأدنى للطلب</div>
            <div style={{ position: 'relative' }}>
              <input type="number" className="ar-input limit" placeholder="مثال: 10" value={rates.minOrderUsdt} onChange={e => set('minOrderUsdt', e.target.value)} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#484f58', fontFamily: 'monospace', fontWeight: 700 }}>USDT</span>
            </div>
            <div className="ar-sub">أقل مبلغ USDT مقبول لأي عملية</div>
          </div>
          <div className="ar-field-wrap">
            <div className="ar-label" style={{ color: '#fbbf24' }}><span className="ar-dot" style={{ background: '#f59e0b' }} />الحد الأقصى للطلب</div>
            <div style={{ position: 'relative' }}>
              <input type="number" className="ar-input limit" placeholder="مثال: 5000" value={rates.maxOrderUsdt} onChange={e => set('maxOrderUsdt', e.target.value)} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#484f58', fontFamily: 'monospace', fontWeight: 700 }}>USDT</span>
            </div>
            <div className="ar-sub">أعلى مبلغ USDT مقبول لأي عملية</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingBottom: 24 }}>
        <button style={{ ...S.saveBtn, padding: '12px 32px', fontSize: 14 }} onClick={handleSave} disabled={saving}>
          <Save size={16} /><span>{saving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}</span>
        </button>
      </div>
    </AdminLayout>
  );
}

function RateSection({ icon, iconBg, title, subtitle, margin, buyLabel, buyHint, buyValue, onBuyChange, sellLabel, sellHint, sellValue, onSellChange, unit }) {
  const hasError  = parseFloat(sellValue) > parseFloat(buyValue) && buyValue !== '' && sellValue !== '';
  const lowMargin = margin !== null && margin < 0.5 && margin >= 0;
  return (
    <div className="ar-card" style={{ borderColor: hasError ? 'rgba(220,38,38,0.35)' : lowMargin ? 'rgba(245,158,11,0.3)' : '#21262d' }}>
      <div className="ar-card-header">
        <div className="ar-card-title">
          <div className="ar-section-icon" style={{ background: iconBg }}>{icon}</div>
          <div>
            <div>{title}</div>
            <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 400, marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>
        {margin !== null && (
          <div className="ar-margin-badge" style={{
            background: hasError ? 'rgba(220,38,38,0.12)' : lowMargin ? 'rgba(245,158,11,0.12)' : 'rgba(5,150,105,0.12)',
            color:      hasError ? '#f87171' : lowMargin ? '#fbbf24' : '#34d399',
            border: `1px solid ${hasError ? 'rgba(220,38,38,0.25)' : lowMargin ? 'rgba(245,158,11,0.25)' : 'rgba(5,150,105,0.25)'}`,
          }}>
            {hasError ? <><AlertCircle size={10} /> سعر البيع أعلى من الشراء!</> : lowMargin ? <><TrendingDown size={10} /> هامش منخفض {margin.toFixed(2)}%</> : <><TrendingUp size={10} /> هامش {margin.toFixed(2)}%</>}
          </div>
        )}
      </div>
      <div className="ar-grid">
        <div className="ar-field-wrap">
          <div className="ar-label" style={{ color: '#34d399' }}><span className="ar-dot" style={{ background: '#059669' }} />🟢 {buyLabel}</div>
          <div style={{ position: 'relative' }}>
            <input type="number" step="0.001" min="0" className="ar-input buy" placeholder="0.00" value={buyValue} onChange={e => onBuyChange(e.target.value)} />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#484f58', fontFamily: 'monospace', fontWeight: 700 }}>{unit}</span>
          </div>
          <div className="ar-sub">{buyHint}</div>
        </div>
        <div className="ar-field-wrap">
          <div className="ar-label" style={{ color: '#f87171' }}><span className="ar-dot" style={{ background: '#dc2626' }} />🔴 {sellLabel}</div>
          <div style={{ position: 'relative' }}>
            <input type="number" step="0.001" min="0" className="ar-input sell" placeholder="0.00" value={sellValue} onChange={e => onSellChange(e.target.value)} style={hasError ? { borderColor: '#dc2626', color: '#f87171' } : {}} />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#484f58', fontFamily: 'monospace', fontWeight: 700 }}>{unit}</span>
          </div>
          <div className="ar-sub">{sellHint}</div>
        </div>
      </div>
    </div>
  );
}

const S = {
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #21262d', borderRadius: 8, background: '#161b22', color: '#8b949e', cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Cairo, sans-serif' },
  alert:   { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif' },
};