// src/pages/admin/AdminRates.jsx
import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Save, RefreshCw, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Droplets } from "lucide-react";
import { adminAPI } from "../../services/api";

function calcMargin(buyRate, sellRate) {
  const b = parseFloat(buyRate), s = parseFloat(sellRate);
  if (!b || !s || b <= 0) return null;
  return ((b - s) / b * 100);
}

export default function AdminRates() {
  const [rates, setRates] = useState({
    egpBuyRate: '', egpSellRate: '',
    moneyGoBuyRate: '', moneyGoSellRate: '',
    egpMgoBuyRate: '', egpMgoSellRate: '',
    internalBuyRate: '', internalSellRate: '',   // USDT <-> wallet
    walletMgoBuyRate: '', walletMgoSellRate: '', // wallet <-> MGO (independent)
    minEgp: '', minUsdt: '', minMgo: '',
    availableEgp: '', availableUsdt: '', availableMgo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const [liquidityRefreshing, setLiquidityRefreshing] = useState(false);

  // تحديث السيولة فقط بدون المساس بحقول الأسعار
  const loadLiquidity = useCallback(async () => {
    try {
      const { data } = await adminAPI.getRates();
      setRates(prev => ({
        ...prev,
        availableEgp:  data?.availableEgp  ?? data?.maxEgp  ?? prev.availableEgp,
        availableUsdt: data?.availableUsdt ?? data?.maxUsdt ?? prev.availableUsdt,
        availableMgo:  data?.availableMgo  ?? data?.maxMgo  ?? prev.availableMgo,
      }));
    } catch (e) { console.error('loadLiquidity', e); }
  }, []);

  const handleRefreshLiquidity = async () => {
    setLiquidityRefreshing(true);
    await loadLiquidity();
    setLiquidityRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh السيولة كل 15 ثانية
  useEffect(() => {
    const id = setInterval(loadLiquidity, 15000);
    return () => clearInterval(id);
  }, [loadLiquidity]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await adminAPI.getRates();
      const pairs = data?.pairs || [];
      const find  = (from, to) => pairs.find(p => p.from === from && p.to === to);
      const egp        = find('EGP_VODAFONE', 'USDT') || find('EGP_INSTAPAY', 'USDT');
      const mgo        = find('USDT', 'MGO');
      const egpMgo     = find('EGP_VODAFONE', 'MGO');
      const internal   = find('USDT', 'INTERNAL');
      const walletMgo  = find('INTERNAL', 'MGO');
      setRates({
        egpBuyRate:        egp?.buyRate        ?? data?.usdtBuyRate     ?? '',
        egpSellRate:       egp?.sellRate       ?? data?.usdtSellRate    ?? '',
        moneyGoBuyRate:    mgo?.buyRate        ?? data?.moneygoRate     ?? '',
        moneyGoSellRate:   mgo?.sellRate       ?? data?.moneygoSellRate ?? '',
        egpMgoBuyRate:     egpMgo?.buyRate     ?? '',
        egpMgoSellRate:    egpMgo?.sellRate    ?? '',
        internalBuyRate:   internal?.buyRate   ?? '',
        internalSellRate:  internal?.sellRate  ?? '',
        walletMgoBuyRate:  walletMgo?.buyRate  ?? '',
        walletMgoSellRate: walletMgo?.sellRate ?? '',
        minEgp:       data?.minEgp  ?? '',
        minUsdt:      data?.minUsdt ?? data?.minOrderUsdt ?? '',
        minMgo:       data?.minMgo  ?? '',
        availableEgp:  data?.availableEgp  ?? '',
        availableUsdt: data?.availableUsdt ?? '',
        availableMgo:  data?.availableMgo  ?? '',
      });
    } catch { setError('فشل تحميل الأسعار'); }
    finally  { setLoading(false); }
  };

  const set = (field, value) => { setRates(prev => ({ ...prev, [field]: value })); setSaved(false); };

  const handleSave = async () => {
  setSaving(true); setError('');
  try {
    const egpBuy       = parseFloat(rates.egpBuyRate)        || 0;
    const egpSell      = parseFloat(rates.egpSellRate)       || 0;
    const mgoBuy       = parseFloat(rates.moneyGoBuyRate)    || 0;
    const mgoSell      = parseFloat(rates.moneyGoSellRate)   || 0;
    const egpMgoBuy    = parseFloat(rates.egpMgoBuyRate)     || 0;
    const egpMgoSell   = parseFloat(rates.egpMgoSellRate)    || 0;
    const intBuy       = parseFloat(rates.internalBuyRate)   || 0;
    const intSell      = parseFloat(rates.internalSellRate)  || 0;
    const wMgoBuy      = parseFloat(rates.walletMgoBuyRate)  || 0;
    const wMgoSell     = parseFloat(rates.walletMgoSellRate) || 0;

    const pairs = [
      { from: 'EGP_VODAFONE', to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'فودافون كاش ↔ USDT',       enabled: true },
      { from: 'EGP_INSTAPAY', to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'إنستا باي ↔ USDT',         enabled: true },
      { from: 'EGP_FAWRY',    to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'فاوري ↔ USDT',             enabled: true },
      { from: 'EGP_ORANGE',   to: 'USDT',     buyRate: egpBuy,    sellRate: egpSell,    label: 'أورنج كاش ↔ USDT',        enabled: true },
      { from: 'USDT',         to: 'MGO',      buyRate: mgoBuy,    sellRate: mgoSell,    label: 'USDT ↔ MoneyGo',           enabled: true },
      { from: 'EGP_VODAFONE', to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'فودافون كاش ↔ MoneyGo',   enabled: true },
      { from: 'EGP_INSTAPAY', to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'إنستا باي ↔ MoneyGo',     enabled: true },
      { from: 'EGP_FAWRY',    to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'فاوري ↔ MoneyGo',         enabled: true },
      { from: 'EGP_ORANGE',   to: 'MGO',      buyRate: egpMgoBuy, sellRate: egpMgoSell, label: 'أورنج كاش ↔ MoneyGo',    enabled: true },
      { from: 'USDT',         to: 'INTERNAL', buyRate: intBuy,    sellRate: intSell,    label: 'USDT ↔ محفظة داخلية',     enabled: true },
      { from: 'INTERNAL',     to: 'USDT',     buyRate: intBuy,    sellRate: intSell,    label: 'محفظة داخلية ↔ USDT',     enabled: true },
      { from: 'INTERNAL',     to: 'MGO',      buyRate: wMgoBuy,   sellRate: wMgoSell,   label: 'محفظة داخلية → MoneyGo',  enabled: true },
      { from: 'MGO',          to: 'INTERNAL', buyRate: wMgoBuy,   sellRate: wMgoSell,   label: 'MoneyGo → محفظة داخلية', enabled: true },
    ];

    // ── جلب أحدث السيولة من السيرفر أولاً (لا نكتب فوق قيم محدثة) ──
    let latestEgp, latestUsdt, latestMgo;
    try {
      const { data: fresh } = await adminAPI.getRates();
      latestEgp  = fresh?.availableEgp  ?? 0;
      latestUsdt = fresh?.availableUsdt ?? 0;
      latestMgo  = fresh?.availableMgo  ?? 0;
    } catch {
      latestEgp  = parseFloat(rates.availableEgp)  || 0;
      latestUsdt = parseFloat(rates.availableUsdt) || 0;
      latestMgo  = parseFloat(rates.availableMgo)  || 0;
    }

    // ── إذا الأدمن غيّر القيمة يدوياً في الحقل، استخدم قيمته ──
    // نقارن القيمة الحالية في state مع اللي جاءت من السيرفر
    // لو مختلفة → الأدمن عدّلها يدوياً → نستخدم قيمة الأدمن
    const stateEgp  = parseFloat(rates.availableEgp);
    const stateUsdt = parseFloat(rates.availableUsdt);
    const stateMgo  = parseFloat(rates.availableMgo);

    // نستخدم قيمة السيرفر دائماً ما لم يكن الأدمن عدّل يدوياً
    // الطريقة: لو state != latest بفارق > 0.01 → الأدمن عدّل
    const avEgp  = Math.abs(stateEgp  - latestEgp)  > 0.01 ? stateEgp  : latestEgp;
    const avUsdt = Math.abs(stateUsdt - latestUsdt) > 0.01 ? stateUsdt : latestUsdt;
    const avMgo  = Math.abs(stateMgo  - latestMgo)  > 0.01 ? stateMgo  : latestMgo;

    await adminAPI.saveRates({
      pairs,
      minEgp:        parseFloat(rates.minEgp)  || 0,
      minUsdt:       parseFloat(rates.minUsdt) || 0,
      minMgo:        parseFloat(rates.minMgo)  || 0,
      maxEgp:        avEgp,
      maxUsdt:       avUsdt,
      maxMgo:        avMgo,
      availableEgp:  avEgp,
      availableUsdt: avUsdt,
      availableMgo:  avMgo,
      minOrderUsdt:  parseFloat(rates.minUsdt) || 0,
      maxOrderUsdt:  avUsdt,
    });

    // ── بعد الحفظ، حدّث الـ state بالقيم الفعلية ──
    setRates(prev => ({
      ...prev,
      availableEgp:  avEgp,
      availableUsdt: avUsdt,
      availableMgo:  avMgo,
    }));

    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  } catch (e) {
    setError(e.message || 'فشل الحفظ');
  } finally {
    setSaving(false);
  }
};

  if (loading) return <AdminLayout><div style={{ padding: 80, textAlign: 'center', color: '#6e7681' }}>جاري التحميل...</div></AdminLayout>;

  const liquidityColor = (val) => parseFloat(val) <= 0 ? '#f87171' : parseFloat(val) < 500 ? '#fbbf24' : '#34d399'

  return (
    <AdminLayout>
      <style>{`
        .ar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ar-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) { .ar-grid-3 { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .ar-grid { grid-template-columns: 1fr; } }
        .ar-card { background: #0d1117; border: 1px solid #21262d; border-radius: 14px; padding: 22px 20px; margin-bottom: 14px; transition: border-color 0.2s; }
        .ar-card:hover { border-color: #30363d; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ar-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #21262d; flex-wrap: wrap; gap: 8px; }
        .ar-card-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #e6edf3; font-family: 'Cairo', sans-serif; }
        .ar-section-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
        .ar-field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .ar-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; font-family: 'Cairo', sans-serif; letter-spacing: 0.3px; }
        .ar-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .ar-input { width: 100%; padding: 12px 14px; background: #161b22; border: 1.5px solid #21262d; border-radius: 10px; color: #e6edf3; font-size: 18px; font-weight: 700; outline: none; transition: all 0.15s; text-align: center; font-family: 'JetBrains Mono', monospace; box-sizing: border-box; -moz-appearance: textfield; }
        .ar-input::-webkit-outer-spin-button, .ar-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .ar-input.buy:focus   { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.15); color: #34d399; }
        .ar-input.sell:focus  { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); color: #f87171; }
        .ar-input.limit:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); color: #fbbf24; }
        .ar-input.liquid:focus { border-color: #06b6d4; box-shadow: 0 0 0 3px rgba(6,182,212,0.15); color: #22d3ee; }
        .ar-input::placeholder { color: #484f58; font-size: 15px; }
        .ar-margin-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .ar-sub { font-size: 11px; color: #6e7681; margin-top: 4px; font-family: 'Cairo', sans-serif; text-align: center; }
        .ar-limit-box { background: #161b22; border: 1px solid #21262d; border-radius: 12px; padding: 16px; }
        .ar-progress-bar { height: 6px; border-radius: 3px; background: #21262d; overflow: hidden; margin-top: 8px; }
        .ar-progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', margin: 0, fontFamily: 'Cairo, sans-serif' }}>الأسعار والسيولة</h2>
          <p style={{ fontSize: 13, color: '#6e7681', marginTop: 3, fontFamily: 'Cairo, sans-serif' }}>تحديث أسعار الصرف وإدارة السيولة المتاحة</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.iconBtn} onClick={load} title="تحديث"><RefreshCw size={15} /></button>
          <button style={S.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /><span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </div>

      {error && <div style={{ ...S.alert, background: '#3d0a0a', color: '#f85149', marginBottom: 16 }}><AlertCircle size={15} /> {error}</div>}
      {saved  && <div style={{ ...S.alert, background: '#064e3b', color: '#34d399', marginBottom: 16 }}><CheckCircle size={15} /> تم حفظ جميع الأسعار والسيولة بنجاح ✅</div>}

      {/* أقسام الأسعار */}
      <RateSection icon="🇪🇬" iconBg="rgba(0,180,100,0.12)" title="USDT ↔ جنيه مصري (EGP)" subtitle="يُطبَّق على: فودافون كاش · إنستا باي · فاوري · أورنج كاش"
        margin={calcMargin(rates.egpBuyRate, rates.egpSellRate)}
        buyLabel="سعر شراء USDT" buyHint="المستخدم يرسل EGP ← نعطيه USDT" buyValue={rates.egpBuyRate} onBuyChange={v => set('egpBuyRate', v)}
        sellLabel="سعر بيع USDT" sellHint="المستخدم يرسل USDT ← نعطيه EGP" sellValue={rates.egpSellRate} onSellChange={v => set('egpSellRate', v)} unit="EGP" />

      <RateSection icon="💚" iconBg="rgba(5,150,105,0.12)" title="USDT ↔ MoneyGo USD" subtitle="تحويل بين USDT و MoneyGo مباشرة"
        margin={calcMargin(rates.moneyGoBuyRate, rates.moneyGoSellRate)}
        buyLabel="سعر شراء MoneyGo" buyHint="المستخدم يرسل USDT ← نعطيه MoneyGo" buyValue={rates.moneyGoBuyRate} onBuyChange={v => set('moneyGoBuyRate', v)}
        sellLabel="سعر بيع MoneyGo" sellHint="المستخدم يرسل MoneyGo ← نعطيه USDT" sellValue={rates.moneyGoSellRate} onSellChange={v => set('moneyGoSellRate', v)} unit="USDT" />

      <RateSection icon="🔄" iconBg="rgba(0,193,124,0.12)" title="MoneyGo ↔ جنيه مصري (EGP)" subtitle="فودافون كاش · إنستا باي · فاوري · أورنج كاش → MoneyGo"
        margin={calcMargin(rates.egpMgoBuyRate, rates.egpMgoSellRate)}
        buyLabel="سعر شراء MoneyGo بالجنيه" buyHint="المستخدم يرسل EGP ← نعطيه MoneyGo" buyValue={rates.egpMgoBuyRate} onBuyChange={v => set('egpMgoBuyRate', v)}
        sellLabel="سعر بيع MoneyGo بالجنيه" sellHint="المستخدم يرسل MoneyGo ← نعطيه EGP" sellValue={rates.egpMgoSellRate} onSellChange={v => set('egpMgoSellRate', v)} unit="EGP" />

      <RateSection icon="🏦" iconBg="rgba(37,99,235,0.12)" title="USDT ↔ المحفظة الداخلية" subtitle="إيداع USDT في المحفظة · سحب USDT من المحفظة"
        margin={calcMargin(rates.internalBuyRate, rates.internalSellRate)}
        buyLabel="سعر الإيداع (USDT → محفظة)" buyHint="المستخدم يرسل USDT ← نضيفه للمحفظة" buyValue={rates.internalBuyRate} onBuyChange={v => set('internalBuyRate', v)}
        sellLabel="سعر السحب (محفظة → USDT)" sellHint="المستخدم يسحب من المحفظة ← نرسل USDT" sellValue={rates.internalSellRate} onSellChange={v => set('internalSellRate', v)} unit="USDT" />

      <RateSection icon="💼" iconBg="rgba(0,193,124,0.12)" title="المحفظة الداخلية ↔ MoneyGo" subtitle="تحويل بين المحفظة الداخلية و MoneyGo — سعر مستقل"
        margin={calcMargin(rates.walletMgoBuyRate, rates.walletMgoSellRate)}
        buyLabel="سعر شراء MoneyGo (محفظة → MGO)" buyHint="المستخدم يحول من محفظته ← نرسل MoneyGo" buyValue={rates.walletMgoBuyRate} onBuyChange={v => set('walletMgoBuyRate', v)}
        sellLabel="سعر بيع MoneyGo (MGO → محفظة)" sellHint="المستخدم يرسل MoneyGo ← نضيف لمحفظته" sellValue={rates.walletMgoSellRate} onSellChange={v => set('walletMgoSellRate', v)} unit="USDT" />

      {/* حدود المعاملات */}
      <div className="ar-card">
        <div className="ar-card-header">
          <div className="ar-card-title">
            <div className="ar-section-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>⚖️</div>
            <div><div>حدود المعاملات</div><div style={{ fontSize: 12, color: '#6e7681', fontWeight: 400, marginTop: 2 }}>أقل وأعلى مبلغ مقبول لكل عملة</div></div>
          </div>
        </div>
        <div className="ar-grid-3">
          {[
            { label: '🇪🇬 جنيه مصري', unit: 'EGP',  minKey: 'minEgp',  badge: 'rgba(0,180,100,0.12)',  badgeColor: '#34d399', badgeBorder: 'rgba(5,150,105,0.25)'  },
            { label: '💵 USDT / دولار', unit: 'USDT', minKey: 'minUsdt', badge: 'rgba(38,161,123,0.12)', badgeColor: '#26a17b', badgeBorder: 'rgba(38,161,123,0.25)' },
            { label: '💚 MoneyGo USD', unit: 'MGO',  minKey: 'minMgo',  badge: 'rgba(0,193,124,0.12)',  badgeColor: '#00c17c', badgeBorder: 'rgba(0,193,124,0.25)'  },
          ].map(({ label, unit, minKey, badge, badgeColor, badgeBorder }) => (
            <div key={unit} className="ar-limit-box">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#c9d1d9', fontFamily: 'Cairo, sans-serif', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                {label}
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: badge, color: badgeColor, border: `1px solid ${badgeBorder}`, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{unit}</span>
              </div>
              <div className="ar-field-wrap">
                <div className="ar-label" style={{ color: '#fbbf24' }}><span className="ar-dot" style={{ background: '#f59e0b' }} />الحد الأدنى</div>
                <div style={{ position: 'relative' }}>
                  <input type="number" className="ar-input limit" placeholder="0" value={rates[minKey]} onChange={e => set(minKey, e.target.value)} style={{ fontSize: 15 }} />
                  <span style={unitStyle}>{unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ السيولة المتاحة = الحد الأقصى ══ */}
      <div className="ar-card" style={{ borderColor: '#1e3a5f' }}>
        <div className="ar-card-header">
          <div className="ar-card-title">
            <div className="ar-section-icon" style={{ background: 'rgba(6,182,212,0.12)' }}><Droplets size={18} color="#22d3ee" /></div>
            <div>
              <div>السيولة المتاحة — الحد الأقصى</div>
              <div style={{ fontSize: 12, color: '#6e7681', fontWeight: 400, marginTop: 2 }}>يتحدث تلقائياً مع كل طلب مكتمل · يمكنك ضبطه يدوياً</div>
            </div>
          </div>
          <button
            onClick={handleRefreshLiquidity}
            disabled={liquidityRefreshing}
            title="تحديث السيولة"
            style={{ background: 'transparent', border: '1px solid #1e3a5f', borderRadius: 8, padding: '6px 10px', cursor: liquidityRefreshing ? 'not-allowed' : 'pointer', color: '#22d3ee', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, opacity: liquidityRefreshing ? 0.5 : 1 }}
          >
            <RefreshCw size={14} style={{ animation: liquidityRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {liquidityRefreshing ? '...' : 'تحديث'}
          </button>
        </div>
        <div className="ar-grid-3">
          {[
            { label: '🇪🇬 EGP', unit: 'EGP',  key: 'availableEgp'  },
            { label: '💵 USDT', unit: 'USDT', key: 'availableUsdt' },
            { label: '💚 MGO',  unit: 'MGO',  key: 'availableMgo'  },
          ].map(({ label, unit, key }) => {
            const col = liquidityColor(rates[key])
            return (
              <div key={unit} className="ar-limit-box" style={{ borderColor: '#1e2d3d' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#c9d1d9', fontFamily: 'Cairo, sans-serif', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 12, fontFamily: 'JetBrains Mono' }}>
                  الحد الأقصى الفعلي للمعاملات
                </div>
                <div className="ar-field-wrap">
                  <div className="ar-label" style={{ color: '#22d3ee' }}><span className="ar-dot" style={{ background: '#06b6d4' }} />الرصيد المتاح</div>
                  <div style={{ position: 'relative' }}>
                    <input type="number" className="ar-input liquid" placeholder="0" value={rates[key]} onChange={e => set(key, e.target.value)} style={{ fontSize: 15, color: col }} />
                    <span style={unitStyle}>{unit}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: col, fontFamily: 'JetBrains Mono', textAlign: 'center', fontWeight: 700 }}>
                  {parseFloat(rates[key]) <= 0 ? '⛔ نفد الرصيد' : parseFloat(rates[key]) < 500 ? '⚠ رصيد منخفض' : '✓ متاح'}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', fontSize: 12, color: '#6e7681', fontFamily: 'Cairo, sans-serif' }}>
          💡 عند إكمال طلب: العملة التي يرسلها العميل <strong style={{ color: '#34d399' }}>تزيد</strong> في رصيدك · العملة التي يستلمها <strong style={{ color: '#f87171' }}>تنقص</strong> من رصيدك
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
          <div><div>{title}</div><div style={{ fontSize: 12, color: '#6e7681', fontWeight: 400, marginTop: 2 }}>{subtitle}</div></div>
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
            <span style={{ ...unitStyle, fontSize: 10 }}>{unit}</span>
          </div>
          <div className="ar-sub">{buyHint}</div>
        </div>
        <div className="ar-field-wrap">
          <div className="ar-label" style={{ color: '#f87171' }}><span className="ar-dot" style={{ background: '#dc2626' }} />🔴 {sellLabel}</div>
          <div style={{ position: 'relative' }}>
            <input type="number" step="0.001" min="0" className="ar-input sell" placeholder="0.00" value={sellValue} onChange={e => onSellChange(e.target.value)} style={hasError ? { borderColor: '#dc2626', color: '#f87171' } : {}} />
            <span style={{ ...unitStyle, fontSize: 10 }}>{unit}</span>
          </div>
          <div className="ar-sub">{sellHint}</div>
        </div>
      </div>
    </div>
  );
}

const unitStyle = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#484f58', fontFamily: 'monospace', fontWeight: 700 };
const S = {
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #21262d', borderRadius: 8, background: '#161b22', color: '#8b949e', cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Cairo, sans-serif' },
  alert:   { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif' },
};