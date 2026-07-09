import { Link } from 'react-router-dom'
import useLang from '../context/useLang'

const POSTS = [
  {
    slug: 'buy-usdt-trc20',
    titleEn: 'How to buy USDT TRC20 safely',
    titleAr: 'كيف تشتري USDT TRC20 بأمان',
    summaryEn: 'Check the network, confirm the rate, keep your order number, and wait for transaction confirmation before considering the transfer complete.',
    summaryAr: 'تأكد من الشبكة، راجع السعر، احتفظ برقم الطلب، وانتظر تأكيد المعاملة قبل اعتبار التحويل مكتملًا.',
  },
  {
    slug: 'exchange-rates',
    titleEn: 'What affects USDT exchange rates?',
    titleAr: 'ما الذي يؤثر على أسعار صرف USDT؟',
    summaryEn: 'Rates can change because of liquidity, local payment demand, market movement, and network conditions.',
    summaryAr: 'تتغير الأسعار حسب السيولة، طلب طرق الدفع المحلية، حركة السوق، وظروف الشبكة.',
  },
  {
    slug: 'track-exchange-order',
    titleEn: 'Why order tracking matters',
    titleAr: 'لماذا تتبع الطلب مهم؟',
    summaryEn: 'Tracking lets you confirm whether your payment is pending, under review, processing, completed, delayed, or needs support.',
    summaryAr: 'يساعدك التتبع على معرفة ما إذا كان الدفع معلقًا أو قيد المراجعة أو المعالجة أو مكتملًا أو يحتاج للدعم.',
  },
]

export default function Blog() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr', padding: '70px 24px 96px' }}>
      <section style={{ maxWidth: 1050, margin: '0 auto 38px' }}>
        <div style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', letterSpacing: 2, marginBottom: 14 }}>
          NUMBER1 EXCHANGE GUIDES
        </div>
        <h1 style={{ margin: '0 0 18px', color: 'var(--text-1)', fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(2rem,5vw,3.25rem)', lineHeight: 1.12 }}>
          {isAr ? 'دليل تبادل العملات الرقمية' : 'Digital Currency Exchange Guides'}
        </h1>
        <p style={{ maxWidth: 760, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', lineHeight: 1.9, margin: 0 }}>
          {isAr
            ? 'مقالات قصيرة تساعد المستخدمين على فهم شراء وبيع USDT، أسعار الصرف، تتبع الطلبات، واختيار الشبكة الصحيحة قبل إرسال الأموال.'
            : 'Short guides that help users understand USDT buying and selling, exchange rates, order tracking, and choosing the correct transfer network.'}
        </p>
      </section>

      <section style={{ maxWidth: 1050, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        {POSTS.map((post) => (
          <article key={post.slug} style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 24 }}>
            <div style={{ color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.66rem', letterSpacing: 1.5, marginBottom: 12 }}>
              GUIDE
            </div>
            <h2 style={{ margin: '0 0 12px', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '1.08rem', lineHeight: 1.4 }}>
              {isAr ? post.titleAr : post.titleEn}
            </h2>
            <p style={{ margin: '0 0 18px', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.8, fontSize: '0.9rem' }}>
              {isAr ? post.summaryAr : post.summaryEn}
            </p>
            <Link to="/faq" style={{ color: 'var(--cyan)', fontFamily: "'Tajawal',sans-serif", fontWeight: 700, textDecoration: 'none' }}>
              {isAr ? 'اقرأ الأسئلة الشائعة' : 'Read related FAQ'}
            </Link>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: 1050, margin: '34px auto 0', background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.18)', borderRadius: 12, padding: 26 }}>
        <h2 style={{ margin: '0 0 12px', color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '1.05rem' }}>
          {isAr ? 'ملاحظة مهمة قبل التحويل' : 'Important note before exchanging'}
        </h2>
        <p style={{ margin: 0, color: 'var(--text-2)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.9 }}>
          {isAr
            ? 'استخدم دائمًا الشبكة الصحيحة، راجع بيانات الطلب قبل الدفع، ولا ترسل أي مبلغ إلى عنوان أو محفظة غير معروضة داخل طلبك.'
            : 'Always use the correct network, review the order details before paying, and never send funds to an address or wallet that is not shown inside your order.'}
        </p>
      </section>
    </div>
  )
}
