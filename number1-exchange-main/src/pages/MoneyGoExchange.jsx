import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLang from '../context/useLang'
import { SEND_METHODS, RECEIVE_METHODS } from '../data/currencies'
import { getRate } from '../services/rateEngine'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'
const sendMethod = SEND_METHODS.find(method => method.id === 'usdt-trc')
const receiveMethod = RECEIVE_METHODS.find(method => method.id === 'mgo-recv')

const Icon = ({ name, size = 20 }) => {
  const paths = {
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Token({ method, label }) {
  return (
    <div className="mgo-token" aria-label={label}>
      <img src={method.img} alt="" />
      <span>{label}</span>
    </div>
  )
}

export default function MoneyGoExchange() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [amount, setAmount] = useState('100')
  const [rateData, setRateData] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/public/rates`, { headers: { 'Cache-Control': 'no-cache' } })
      .then(response => response.json())
      .then(data => { if (data.success) setRateData(data) })
      .catch(() => {})
  }, [])

  const { rate } = useMemo(() => getRate('usdt-trc', 'mgo-recv', rateData, sendMethod, receiveMethod), [rateData])
  const receiveAmount = useMemo(() => {
    const parsed = Number.parseFloat(amount)
    return Number.isFinite(parsed) && parsed > 0 ? (parsed * rate).toFixed(2) : '0.00'
  }, [amount, rate])

  const t = (ar, en) => isAr ? ar : en
  const goToOrder = () => navigate('/exchange/form?from=usdt-trc&to=mgo-recv')

  return (
    <div className="mgo-page" dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        .mgo-page { position:relative; overflow:hidden; padding:62px 22px 90px; color:var(--text-1); }
        .mgo-page:before { content:''; position:absolute; width:620px; height:620px; top:-250px; left:50%; transform:translateX(-50%); background:radial-gradient(circle,rgba(0,210,255,.13),transparent 66%); pointer-events:none; }
        .mgo-wrap { position:relative; max-width:1120px; margin:0 auto; }
        .mgo-crumb { display:flex; align-items:center; gap:8px; color:var(--text-3); font:700 .7rem 'JetBrains Mono',monospace; letter-spacing:.8px; margin-bottom:30px; }
        .mgo-crumb button { color:var(--cyan); border:0; background:none; cursor:pointer; font:inherit; padding:0; }
        .mgo-hero { display:grid; grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr); gap:68px; align-items:center; }
        .mgo-kicker { display:inline-flex; align-items:center; gap:8px; padding:7px 13px; border-radius:30px; color:var(--cyan); border:1px solid rgba(0,210,255,.23); background:rgba(0,210,255,.06); font:700 .66rem 'JetBrains Mono',monospace; letter-spacing:1.7px; text-transform:uppercase; }
        .mgo-kicker i { width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 12px var(--green); }
        .mgo-title { max-width:690px; font:900 clamp(2.15rem,5vw,4.1rem)/1.06 'Orbitron',sans-serif; letter-spacing:-1.8px; margin:18px 0; }
        .mgo-title em { color:var(--cyan); font-style:normal; text-shadow:0 0 26px rgba(0,210,255,.28); }
        .mgo-copy { max-width:590px; color:var(--text-2); font-size:1rem; line-height:1.9; margin:0 0 25px; }
        .mgo-actions { display:flex; gap:12px; flex-wrap:wrap; }
        .mgo-primary,.mgo-secondary { min-height:46px; padding:0 20px; border-radius:11px; cursor:pointer; font:800 .9rem 'Tajawal',sans-serif; transition:transform .2s,box-shadow .2s,border-color .2s; }
        .mgo-primary { display:inline-flex; align-items:center; gap:9px; border:0; color:#00131b; background:linear-gradient(135deg,#00e5a0,#00b8d9); box-shadow:0 12px 28px rgba(0,210,255,.18); }
        .mgo-secondary { color:var(--text-1); border:1px solid var(--border-2); background:rgba(255,255,255,.03); }
        .mgo-primary:hover,.mgo-secondary:hover { transform:translateY(-2px); }
        .mgo-card { position:relative; padding:22px; border:1px solid var(--border-2); border-radius:24px; background:linear-gradient(145deg,rgba(7,22,42,.96),rgba(5,12,25,.92)); box-shadow:0 24px 70px rgba(0,0,0,.28),0 0 0 1px rgba(0,210,255,.04); }
        html.light .mgo-card { background:linear-gradient(145deg,#fff,#f3f7fb); }
        .mgo-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .mgo-card-title { font:800 1rem 'Tajawal',sans-serif; }
        .mgo-live { display:flex; align-items:center; gap:6px; color:var(--green); font:700 .62rem 'JetBrains Mono',monospace; letter-spacing:1px; }
        .mgo-live i { width:6px; height:6px; border-radius:50%; background:var(--green); }
        .mgo-field { padding:14px 15px; border:1px solid var(--border-1); border-radius:15px; background:rgba(255,255,255,.035); }
        html.light .mgo-field { background:rgba(0,0,0,.025); }
        .mgo-field-label { display:flex; justify-content:space-between; color:var(--text-3); font:700 .66rem 'JetBrains Mono',monospace; letter-spacing:.8px; margin-bottom:8px; }
        .mgo-field-row { display:flex; align-items:center; gap:12px; }
        .mgo-field input { min-width:0; flex:1; border:0; outline:0; background:none; color:var(--text-1); font:800 1.55rem 'JetBrains Mono',monospace; }
        .mgo-field input::placeholder { color:var(--text-3); }
        .mgo-token { display:flex; align-items:center; gap:8px; flex-shrink:0; padding:7px 10px; border-radius:10px; background:rgba(0,210,255,.08); color:var(--text-1); font:800 .78rem 'Tajawal',sans-serif; }
        .mgo-token img { width:24px; height:24px; object-fit:contain; border-radius:50%; }
        .mgo-equals { width:30px; height:30px; display:grid; place-items:center; margin:-1px auto; border:1px solid var(--border-1); border-radius:50%; background:var(--card); color:var(--cyan); font:800 1rem 'JetBrains Mono',monospace; }
        .mgo-rate { display:flex; justify-content:space-between; gap:12px; padding:14px 2px 4px; color:var(--text-3); font-size:.73rem; }
        .mgo-rate strong { color:var(--gold); font-family:'JetBrains Mono',monospace; }
        .mgo-order { width:100%; justify-content:center; margin-top:10px; }
        .mgo-note { display:flex; gap:7px; align-items:flex-start; color:var(--text-3); font-size:.7rem; line-height:1.5; margin:13px 2px 0; }
        .mgo-trust { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:76px 0 92px; }
        .mgo-trust-item { display:flex; gap:12px; align-items:flex-start; padding:20px; border:1px solid var(--border-1); border-radius:17px; background:rgba(255,255,255,.025); }
        .mgo-trust-icon { display:grid; place-items:center; width:35px; height:35px; flex:0 0 35px; color:var(--cyan); background:var(--cyan-dim); border-radius:10px; }
        .mgo-trust h3 { font:800 .9rem 'Tajawal',sans-serif; margin-bottom:4px; }
        .mgo-trust p { color:var(--text-3); font-size:.75rem; line-height:1.55; }
        .mgo-section-head { max-width:670px; margin:0 auto 28px; text-align:center; }
        .mgo-section-head span { color:var(--cyan); font:700 .64rem 'JetBrains Mono',monospace; letter-spacing:2px; text-transform:uppercase; }
        .mgo-section-head h2 { font:900 clamp(1.45rem,3vw,2.3rem)/1.2 'Orbitron',sans-serif; margin:10px 0; }
        .mgo-section-head p { color:var(--text-2); line-height:1.7; font-size:.9rem; }
        .mgo-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .mgo-step { position:relative; padding:24px; border:1px solid var(--border-1); border-radius:18px; background:var(--card); }
        .mgo-step-num { color:var(--cyan); font:900 .75rem 'JetBrains Mono',monospace; letter-spacing:1px; }
        .mgo-step h3 { font:800 1rem 'Tajawal',sans-serif; margin:16px 0 8px; }
        .mgo-step p { color:var(--text-2); font-size:.8rem; line-height:1.7; }
        .mgo-faq { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin-top:30px; }
        .mgo-faq details { padding:17px 19px; border:1px solid var(--border-1); border-radius:14px; background:rgba(255,255,255,.02); }
        .mgo-faq summary { cursor:pointer; font-weight:800; font-size:.86rem; }
        .mgo-faq p { color:var(--text-2); font-size:.78rem; line-height:1.7; padding-top:12px; }
        .mgo-bottom-cta { display:flex; align-items:center; justify-content:space-between; gap:24px; margin-top:80px; padding:30px 34px; border:1px solid rgba(0,210,255,.22); border-radius:20px; background:linear-gradient(100deg,rgba(0,210,255,.08),rgba(124,92,252,.08)); }
        .mgo-bottom-cta h2 { font:900 clamp(1.25rem,3vw,2rem) 'Orbitron',sans-serif; margin-bottom:7px; }
        .mgo-bottom-cta p { color:var(--text-2); font-size:.84rem; }
        @media (max-width:850px) { .mgo-hero { grid-template-columns:1fr; gap:38px; } .mgo-copy { max-width:680px; } .mgo-trust { margin:54px 0 68px; } }
        @media (max-width:620px) { .mgo-page { padding:35px 15px 60px; } .mgo-title { letter-spacing:-1px; } .mgo-card { padding:15px; border-radius:18px; } .mgo-trust,.mgo-steps,.mgo-faq { grid-template-columns:1fr; } .mgo-trust { margin:48px 0 60px; } .mgo-bottom-cta { align-items:flex-start; flex-direction:column; padding:23px; margin-top:55px; } .mgo-field input { font-size:1.2rem; } }
      `}</style>

      <div className="mgo-wrap">
        <div className="mgo-crumb"><button onClick={() => navigate('/')}>{t('الرئيسية', 'Home')}</button><span>/</span><span>{t('تحويل USDT إلى MoneyGo', 'USDT to MoneyGo')}</span></div>

        <section className="mgo-hero">
          <div>
            <div className="mgo-kicker"><i /> {t('خدمة تحويل موثوقة', 'Trusted exchange service')}</div>
            <h1 className="mgo-title">{t('حوّل USDT إلى', 'Convert USDT to')} <em>MoneyGo</em><br />{t('بسرعة وأمان', 'fast & securely')}</h1>
            <p className="mgo-copy">{t('أرسل USDT عبر شبكة TRC20 واستلم رصيدك بالدولار على محفظة MoneyGo. سعر واضح، متابعة سهلة، ودعم مباشر في كل خطوة.', 'Send USDT through the TRC20 network and receive USD in your MoneyGo wallet. Clear rates, simple tracking, and direct support at every step.')}</p>
            {/* <div className="mgo-actions"><button className="mgo-primary" onClick={goToOrder}>{t('ابدأ التحويل الآن', 'Start exchange')} <Icon name="arrow" size={17} /></button><button className="mgo-secondary" onClick={() => navigate('/how-it-works')}>{t('كيف تعمل الخدمة؟', 'How it works')}</button></div> */}
          </div>

          {/* <div className="mgo-card">
            <div className="mgo-card-head"><div className="mgo-card-title">{t('حاسبة التحويل', 'Exchange calculator')}</div><div className="mgo-live"><i /> LIVE RATE</div></div>
            <div className="mgo-field"><div className="mgo-field-label"><span>{t('أنت ترسل', 'You send')}</span><span>{t('الحد الأدنى 10 USDT', 'Minimum 10 USDT')}</span></div><div className="mgo-field-row"><input value={amount} onChange={event => setAmount(event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" aria-label="USDT amount" /><Token method={sendMethod} label="USDT" /></div></div>
            <div className="mgo-equals">↓</div>
            <div className="mgo-field"><div className="mgo-field-label"><span>{t('أنت تستلم', 'You receive')}</span><span>USD</span></div><div className="mgo-field-row"><input value={receiveAmount} readOnly aria-label="MoneyGo amount" /><Token method={receiveMethod} label="MoneyGo" /></div></div>
            <div className="mgo-rate"><span>{t('سعر الصرف الحالي', 'Current exchange rate')}</span><strong>1 USDT = {rate.toFixed(4)} MGO</strong></div>
            <button className="mgo-primary mgo-order" onClick={goToOrder}>{t('متابعة الطلب', 'Continue to order')} <Icon name="arrow" size={16} /></button>
            <p className="mgo-note"><Icon name="shield" size={14} />{t('السعر النهائي يظهر قبل تأكيد الطلب، وقد يتغير حسب السيولة والوقت.', 'The final rate is shown before you confirm and may change with liquidity and timing.')}</p>
          </div> */}
        </section>

        <section className="mgo-trust" aria-label="Service benefits">
          {[
            ['shield', t('حماية وأمان', 'Secure by design'), t('نراجع كل طلب ونحافظ على بياناتك محمية.', 'Every order is reviewed and your data stays protected.')],
            ['bolt', t('تنفيذ سريع', 'Fast processing'), t('معالجة USDT عادةً خلال 5–15 دقيقة.', 'USDT transfers are usually processed in 5–15 minutes.')],
            ['clock', t('دعم مباشر', 'Direct support'), t('نساعدك في التتبع حتى وصول المبلغ.', 'We help you track the order until delivery.')],
          ].map(([icon, title, copy]) => <div className="mgo-trust-item" key={title}><div className="mgo-trust-icon"><Icon name={icon} size={18} /></div><div><h3>{title}</h3><p>{copy}</p></div></div>)}
        </section>

        <section>
          <div className="mgo-section-head"><span>Simple process</span><h2>{t('ثلاث خطوات لإتمام التحويل', 'A simple three-step exchange')}</h2><p>{t('كل ما تحتاجه هو USDT، ومعرّف محفظة MoneyGo، وبريد إلكتروني لمتابعة طلبك.', 'All you need is USDT, your MoneyGo wallet ID, and an email to follow your order.')}</p></div>
          <div className="mgo-steps">
            {[
              [t('01 / أدخل التفاصيل', '01 / Enter details'), t('حدد الكمية وأدخل معرّف MoneyGo الذي ستستلم عليه.', 'Choose the amount and enter the MoneyGo ID that will receive your funds.')],
              [t('02 / أرسل USDT', '02 / Send USDT'), t('أرسل USDT إلى العنوان الذي يظهر لك داخل صفحة الطلب.', 'Send USDT to the address shown inside your order page.')],
              [t('03 / استلم أموالك', '03 / Receive funds'), t('نتحقق من المعاملة ونرسل الدولار إلى محفظتك مع رقم للتتبع.', 'We verify the transaction and send USD to your wallet with a tracking number.')],
            ].map(([title, copy]) => <article className="mgo-step" key={title}><div className="mgo-step-num">{title}</div><h3>{title.split('/')[1]}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section style={{ marginTop: 82 }}>
          <div className="mgo-section-head"><span>Good to know</span><h2>{t('أسئلة شائعة عن تحويل USDT إلى MoneyGo', 'USDT to MoneyGo FAQ')}</h2></div>
          <div className="mgo-faq">
            <details><summary>{t('ما الحد الأدنى للتحويل؟', 'What is the minimum amount?')}</summary><p>{t('الحد الأدنى المعتاد هو 10 USDT، وقد تتغير الحدود حسب الرصيد المتاح.', 'The usual minimum is 10 USDT. Limits can vary with available liquidity.')}</p></details>
            <details><summary>{t('كم يستغرق وصول MoneyGo؟', 'How long does delivery take?')}</summary><p>{t('تحويلات USDT تتم عادة خلال 5–15 دقيقة بعد تأكيد الشبكة.', 'USDT transfers are usually completed within 5–15 minutes after network confirmation.')}</p></details>
            <details><summary>{t('ما الشبكة المدعومة؟', 'Which network is supported?')}</summary><p>{t('هذه الصفحة مخصصة لـ USDT عبر شبكة TRC20. تأكد من اختيار الشبكة نفسها عند الإرسال.', 'This page is for USDT on TRC20. Select the same network when sending.')}</p></details>
            <details><summary>{t('أين أجد معرّف MoneyGo؟', 'Where do I find my MoneyGo ID?')}</summary><p>{t('ستدخل معرّف المحفظة في نموذج الطلب، ويمكنك التواصل مع الدعم إذا احتجت مساعدة.', 'Enter your wallet ID in the order form, or contact support if you need help.')}</p></details>
          </div>
        </section>

        {/* <section className="mgo-bottom-cta"><div><h2>{t('جاهز لتحويل USDT؟', 'Ready to exchange USDT?')}</h2><p>{t('ابدأ طلبك الآن واحصل على سعر محدث قبل التأكيد.', 'Start your order and see the updated rate before you confirm.')}</p></div><button className="mgo-primary" onClick={goToOrder}>{t('ابدأ الآن', 'Start now')} <Icon name="arrow" size={17} /></button></section> */}
      </div>
    </div>
  )
}
