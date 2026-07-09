import { Link } from 'react-router-dom'
import useLang from '../context/useLang'

const SERVICES = [
  {
    titleEn: 'Buy USDT TRC20',
    titleAr: 'شراء USDT TRC20',
    textEn: 'Convert supported local payment methods to USDT on the TRC20 network with clear order tracking and manual review.',
    textAr: 'حوّل طرق الدفع المحلية المدعومة إلى USDT على شبكة TRC20 مع تتبع واضح ومراجعة يدوية لكل طلب.',
  },
  {
    titleEn: 'Sell USDT',
    titleAr: 'بيع USDT',
    textEn: 'Send USDT and receive payout through supported wallets after transaction confirmation and order verification.',
    textAr: 'أرسل USDT واستلم المقابل عبر المحافظ المدعومة بعد تأكيد المعاملة والتحقق من الطلب.',
  },
  {
    titleEn: 'E-wallet Exchange',
    titleAr: 'تحويل المحافظ الإلكترونية',
    textEn: 'Exchange between supported digital wallets such as Vodafone Cash, InstaPay, Etisalat Cash, and other available methods.',
    textAr: 'بدّل بين المحافظ الرقمية المدعومة مثل فودافون كاش وإنستا باي واتصالات كاش والطرق المتاحة الأخرى.',
  },
  {
    titleEn: 'Order Tracking',
    titleAr: 'تتبع الطلبات',
    textEn: 'Follow each exchange order by order number, from payment review to processing and completion.',
    textAr: 'تابع كل طلب صرف برقم الطلب من مراجعة الدفع إلى المعالجة ثم الاكتمال.',
  },
]

const BENEFITS = [
  { en: 'Transparent rates before submitting the order', ar: 'أسعار واضحة قبل إرسال الطلب' },
  { en: 'Support for USDT TRC20 and popular local payment methods', ar: 'دعم USDT TRC20 وطرق دفع محلية شائعة' },
  { en: 'Human support for delayed or unclear transfers', ar: 'دعم بشري للطلبات المتأخرة أو غير الواضحة' },
  { en: 'AML/KYC review for safer exchange activity', ar: 'مراجعة AML/KYC لحماية عمليات التبادل' },
]

export default function Services() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr', padding: '70px 24px 96px' }}>
      <section style={{ maxWidth: 1080, margin: '0 auto 44px' }}>
        <div style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', letterSpacing: 2, marginBottom: 14 }}>
          NUMBER1 EXCHANGE SERVICES
        </div>
        <h1 style={{ margin: '0 0 18px', color: 'var(--text-1)', fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(2rem,5vw,3.4rem)', lineHeight: 1.12 }}>
          {isAr ? 'خدمات شراء وبيع USDT' : 'USDT Buying and Selling Services'}
        </h1>
        <p style={{ maxWidth: 760, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', lineHeight: 1.9, margin: 0 }}>
          {isAr
            ? 'تساعدك Number1 Exchange على تنفيذ طلبات شراء وبيع USDT وتحويل المحافظ الإلكترونية بطريقة واضحة، مع عرض السعر قبل تأكيد الطلب وتوفير تتبع لحالة المعاملة.'
            : 'Number1 Exchange helps customers buy and sell USDT and exchange supported e-wallet balances with clear pricing before confirmation and order tracking after submission.'}
        </p>
      </section>

      <section style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
        {SERVICES.map((service) => (
          <article key={service.titleEn} style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ margin: '0 0 12px', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '1.08rem' }}>
              {isAr ? service.titleAr : service.titleEn}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.8, fontSize: '0.9rem' }}>
              {isAr ? service.textAr : service.textEn}
            </p>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: 1080, margin: '34px auto 0', display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(260px,0.9fr)', gap: 18 }}>
        <div style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.18)', borderRadius: 12, padding: 26 }}>
          <h2 style={{ margin: '0 0 14px', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '1.05rem' }}>
            {isAr ? 'لماذا هذه الصفحة مهمة؟' : 'Why this page matters'}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.9 }}>
            {isAr
              ? 'هذه الصفحة توضح الخدمات الأساسية التي يبحث عنها المستخدمون في Google مثل شراء USDT، بيع USDT، تحويل المحافظ، وتتبع الطلبات. وجود محتوى واضح لكل خدمة يساعد Google على فهم صفحات الموقع بشكل أفضل.'
              : 'This page gives Google and users a clear service overview for common searches such as buy USDT, sell USDT, wallet exchange, and order tracking.'}
          </p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 26 }}>
          <h2 style={{ margin: '0 0 14px', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '1.05rem' }}>
            {isAr ? 'مميزات الخدمة' : 'Service Benefits'}
          </h2>
          <ul style={{ margin: 0, padding: isAr ? '0 18px 0 0' : '0 0 0 18px', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.9 }}>
            {BENEFITS.map((item) => <li key={item.en}>{isAr ? item.ar : item.en}</li>)}
          </ul>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: '34px auto 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/rates" style={{ textDecoration: 'none', padding: '11px 22px', borderRadius: 10, background: 'var(--cyan)', color: '#03111a', fontFamily: "'Tajawal',sans-serif", fontWeight: 800 }}>
          {isAr ? 'عرض الأسعار' : 'View Rates'}
        </Link>
        <Link to="/how-it-works" style={{ textDecoration: 'none', padding: '11px 22px', borderRadius: 10, border: '1px solid var(--border-1)', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
          {isAr ? 'كيف تعمل المنصة' : 'How It Works'}
        </Link>
      </section>
    </div>
  )
}
