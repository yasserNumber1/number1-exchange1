// src/pages/FAQ.jsx
// ══════════════════════════════════════════════
//  Number1 Exchange — FAQ  |  Timeline Style
//  ألوان الموقع + scroll-driven animations
// ══════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react'
import useLang from '../context/useLang'

/* ─── useInView hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

/* ─── useCountUp hook ─── */
function useCountUp(target, duration = 1600, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0 = null
    const step = ts => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return val
}

/* ─── FAQ Data ─── */
export const FAQ_DATA = [
  {
    id: 'exchange',
    labelAr: 'عمليات الصرف',
    labelEn: 'Exchange',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
    items: [
      { qAr: 'ما هي العملات المدعومة؟',                    qEn: 'What currencies are supported?',               aAr: 'نقبل USDT (TRC-20)، فودافون كاش، إنستاباي. نرسل إلى MoneyGo USD وبعض المحافظ الإلكترونية الأخرى. يمكنك مراجعة صفحة الأسعار للتفاصيل الكاملة.',       aEn: 'We accept USDT (TRC-20), Vodafone Cash, InstaPay. We send to MoneyGo USD and other e-wallets. Check the Rates page for full details.' },
      { qAr: 'ما الحد الأدنى والأقصى للتحويل؟',             qEn: 'What are the min/max transfer limits?',         aAr: 'الحد الأدنى هو 10 USDT أو ما يعادلها. الحد الأقصى يعتمد على نوع الصرف وقد يتطلب تحقق الهوية للمبالغ الكبيرة.',                                         aEn: 'Minimum is 10 USDT or equivalent. Maximum depends on exchange type and may require identity verification for large amounts.' },
      { qAr: 'كم يستغرق التحويل؟',                          qEn: 'How long does a transfer take?',                aAr: 'تحويلات USDT: تلقائية خلال 5-15 دقيقة. المحافظ الإلكترونية المصرية: يدوي خلال 15-30 دقيقة خلال أوقات العمل.',                                         aEn: 'USDT transfers: automatic within 5-15 minutes. Egyptian e-wallets: manual within 15-30 minutes during working hours.' },
      { qAr: 'هل الأسعار ثابتة؟',                            qEn: 'Are rates fixed?',                              aAr: 'الأسعار تتحدث بانتظام حسب السوق. السعر الذي تراه عند تقديم الطلب هو السعر المضمون لك لمدة 15 دقيقة.',                                               aEn: 'Rates update regularly based on the market. The rate shown when you submit your order is guaranteed for 15 minutes.' },
    ]
  },
  {
    id: 'payment',
    labelAr: 'الدفع والتحقق',
    labelEn: 'Payment',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    items: [
      { qAr: 'كيف أرسل USDT؟',                               qEn: 'How do I send USDT?',                          aAr: 'انسخ عنوان TRC-20 المعروض في طلبك وأرسل المبلغ المحدد من محفظتك. تأكد من اختيار شبكة TRC-20 وليس ERC-20.',                                             aEn: 'Copy the TRC-20 address shown in your order and send the specified amount from your wallet. Make sure to select TRC-20, not ERC-20.' },
      { qAr: 'لماذا يطلب إيصال دفع؟',                         qEn: 'Why is a payment receipt required?',            aAr: 'للمحافظ الإلكترونية المصرية، نطلب إيصالاً للتحقق من وصول الدفع. هذا يحميك ويحمينا ويضمن سرعة المعالجة.',                                              aEn: 'For Egyptian e-wallets, we require a receipt to verify payment arrival. This protects both parties and ensures fast processing.' },
      { qAr: 'ماذا أفعل إذا أرسلت بشبكة خاطئة؟',             qEn: 'What if I sent via wrong network?',             aAr: 'تواصل معنا فوراً على تيليجرام برقم طلبك وتفاصيل المعاملة. سنحاول استرداد الأموال لكن لا يمكن ضمان ذلك دائماً.',                                        aEn: 'Contact us immediately on Telegram with your order number and transaction details. We will try to recover the funds but cannot always guarantee it.' },
    ]
  },
  {
    id: 'security',
    labelAr: 'الأمان والخصوصية',
    labelEn: 'Security',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    items: [
      { qAr: 'هل المنصة آمنة؟',                               qEn: 'Is the platform secure?',                      aAr: 'نعم. نستخدم TronGrid API الرسمي للتحقق من معاملات USDT. جميع الطلبات تُراجع يدوياً من فريقنا قبل الإرسال.',                                            aEn: 'Yes. We use the official TronGrid API to verify USDT transactions. All orders are manually reviewed by our team before sending.' },
      { qAr: 'هل تحتفظون ببياناتي؟',                           qEn: 'Do you store my data?',                         aAr: 'نحتفظ فقط بالبيانات الضرورية لإتمام الطلبات والامتثال لمتطلبات AML/KYC. راجع سياسة الخصوصية للتفاصيل.',                                              aEn: 'We only store data necessary to complete orders and comply with AML/KYC requirements. See our Privacy Policy for details.' },
      { qAr: 'هل يطلب التحقق من الهوية؟',                      qEn: 'Is identity verification required?',            aAr: 'للمبالغ العادية لا. للمبالغ الكبيرة (فوق حد معين) قد نطلب وثيقة هوية وفقاً لسياسة AML/KYC.',                                                          aEn: 'Not for normal amounts. For large amounts (above a certain limit) we may request an ID document per our AML/KYC policy.' },
    ]
  },
  {
    id: 'tracking',
    labelAr: 'تتبع الطلبات',
    labelEn: 'Tracking',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    items: [
      { qAr: 'كيف أتابع طلبي؟',                               qEn: 'How do I track my order?',                     aAr: 'بعد إتمام الطلب ستحصل على رقم طلب. أدخله في صفحة "تتبع الطلب" لمعرفة الحالة الحالية.',                                                               aEn: 'After completing your order you will receive an order number. Enter it in the "Track Order" page to see the current status.' },
      { qAr: 'ما هي حالات الطلب؟',                             qEn: 'What are the order statuses?',                 aAr: 'الحالات هي: معلق (انتظار الدفع) ← قيد المراجعة ← قيد المعالجة ← مكتمل. في حالة وجود مشكلة ستتلقى إشعاراً.',                                         aEn: 'Statuses are: Pending (awaiting payment) → Under Review → Processing → Completed. If there is an issue you will receive a notification.' },
      { qAr: 'ماذا أفعل إذا تأخر طلبي؟',                       qEn: 'What if my order is delayed?',                 aAr: 'إذا تجاوز وقت المعالجة 45 دقيقة، تواصل معنا على تيليجرام برقم الطلب وسنتابع معك فوراً.',                                                               aEn: 'If processing time exceeds 45 minutes, contact us on Telegram with your order number and we will follow up immediately.' },
    ]
  },
]

/* ─── Stat Counter ─── */
function StatCounter({ target, suffix, labelAr, labelEn, delay, started, lang }) {
  const val = useCountUp(target, 1500, started)
  return (
    <div style={{
      textAlign: 'center',
      padding: '20px 12px',
      animation: started ? `pageIn 0.6s ${delay}s both` : 'none',
    }}>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
        fontWeight: 900,
        color: 'var(--cyan)',
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {target === 4.9 ? '4.9' : val.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
        {lang === 'ar' ? labelAr : labelEn}
      </div>
    </div>
  )
}

/* ─── Timeline Item ─── */
function TimelineItem({ item, index, isOpen, onToggle, inView, lang }) {
  const relatedLinks = {
    exchange: [
      { href: '/rates', labelAr: 'الأسعار', labelEn: 'Rates' },
      { href: '/how-it-works', labelAr: 'كيف تعمل المنصة', labelEn: 'How It Works' },
    ],
    payment: [
      { href: '/how-it-works', labelAr: 'خطوات التحويل', labelEn: 'Transfer Steps' },
      { href: '/contact', labelAr: 'الدعم', labelEn: 'Support' },
    ],
    security: [
      { href: '/aml', labelAr: 'سياسة AML/KYC', labelEn: 'AML/KYC Policy' },
      { href: '/privacy', labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy' },
    ],
    tracking: [
      { href: '/track', labelAr: 'تتبع الطلب', labelEn: 'Track Order' },
      { href: '/contact', labelAr: 'تواصل معنا', labelEn: 'Contact Us' },
    ],
  }[item.sectionId] || []

  return (
    <div
      style={{
        position: 'relative',
        paddingRight: lang === 'ar' ? 28 : 0,
        paddingLeft: lang === 'ar' ? 0 : 28,
        marginBottom: 4,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateX(12px)',
        transition: `opacity 0.5s ${index * 0.07}s, transform 0.5s ${index * 0.07}s cubic-bezier(.22,1,.36,1)`,
      }}
    >
      {/* timeline dot */}
      <div style={{
        position: 'absolute',
        [lang === 'ar' ? 'right' : 'left']: 2,
        top: 14,
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: isOpen ? 'var(--cyan)' : 'var(--text-3)',
        border: '2px solid var(--bg)',
        boxShadow: isOpen ? '0 0 10px rgba(0,210,255,0.6)' : 'none',
        transition: 'all 0.25s',
        zIndex: 2,
      }}/>

      <div
        onClick={onToggle}
        style={{
          background: isOpen ? 'rgba(0,210,255,0.05)' : 'var(--card)',
          border: `1px solid ${isOpen ? 'rgba(0,210,255,0.28)' : 'var(--border-1)'}`,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'rgba(0,210,255,0.2)'
            e.currentTarget.style.background = 'rgba(0,210,255,0.02)'
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--border-1)'
            e.currentTarget.style.background = 'var(--card)'
          }
        }}
      >
        {/* Question row */}
        <div style={{
          padding: '13px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{
            fontFamily: "'Tajawal', sans-serif",
            fontWeight: 700,
            fontSize: '0.88rem',
            color: isOpen ? 'var(--cyan)' : 'var(--text-1)',
            lineHeight: 1.45,
            transition: 'color 0.2s',
            flex: 1,
            textAlign: lang === 'ar' ? 'right' : 'left',
          }}>
            {lang === 'ar' ? item.qAr : item.qEn}
          </span>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            background: isOpen ? 'rgba(0,210,255,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isOpen ? 'rgba(0,210,255,0.3)' : 'var(--border-1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: isOpen ? 'var(--cyan)' : 'var(--text-3)',
            transition: 'all 0.25s',
          }}>
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'none' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* Answer */}
        <div style={{
          maxHeight: isOpen ? 200 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.38s cubic-bezier(.22,1,.36,1)',
        }}>
          <div style={{
            padding: '0 16px 15px',
            borderTop: '1px solid var(--border-1)',
            paddingTop: 12,
          }}>
            <p style={{
              margin: 0,
              fontFamily: "'Tajawal', sans-serif",
              fontSize: '0.84rem',
              color: 'var(--text-2)',
              lineHeight: 1.85,
              textAlign: lang === 'ar' ? 'right' : 'left',
            }}>
              {lang === 'ar' ? item.aAr : item.aEn}
            </p>
            {relatedLinks.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {relatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      padding: '5px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(0,210,255,0.18)',
                      background: 'rgba(0,210,255,0.05)',
                      color: 'var(--cyan)',
                      fontSize: '0.72rem',
                      fontFamily: "'Tajawal', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {lang === 'ar' ? link.labelAr : link.labelEn}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN FAQ COMPONENT
══════════════════════════════════════ */
export default function FAQ() {
  const { lang } = useLang()
  const [activeSection, setActiveSection] = useState('exchange')
  const [openItem, setOpenItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)

  const [heroRef, heroInView]   = useInView(0.1)
  const [timeRef, timeInView]   = useInView(0.1)
  const [statsRef, statsInView] = useInView(0.3)
  const [ctaRef, ctaInView]     = useInView(0.2)

  /* scroll progress bar */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100
      setScrollProgress(Math.min(100, pct))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  /* reset open item when section changes */
  const handleSectionChange = (id) => {
    setActiveSection(id)
    setOpenItem(null)
    setSearchQuery('')
  }

  /* search filter */
  const currentSection = FAQ_DATA.find(s => s.id === activeSection)

  const filteredItems = searchQuery.trim()
    ? FAQ_DATA.flatMap(s => s.items.map(item => ({ ...item, sectionId: s.id }))).filter(item => {
        const q = lang === 'ar' ? item.qAr : item.qEn
        const a = lang === 'ar' ? item.aAr : item.aEn
        return (q + a).toLowerCase().includes(searchQuery.toLowerCase())
      })
    : (currentSection?.items || []).map(item => ({ ...item, sectionId: currentSection.id }))

  const totalQ = FAQ_DATA.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      zIndex: 2,
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>

      {/* ── Scroll Progress Bar ── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 3,
        width: `${scrollProgress}%`,
        background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
        zIndex: 9999,
        transition: 'width 0.1s linear',
        boxShadow: '0 0 8px rgba(0,210,255,0.5)',
      }}/>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 20px 96px' }}>

        {/* ══ HERO ══ */}
        <div
          ref={heroRef}
          style={{
            textAlign: 'center',
            marginBottom: 52,
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.7s, transform 0.7s cubic-bezier(.22,1,.36,1)',
          }}
        >
          {/* badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 14px', borderRadius: 50,
            border: '1px solid rgba(0,210,255,0.25)',
            background: 'rgba(0,210,255,0.06)',
            marginBottom: 16,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--cyan)',
              animation: 'blink 1.4s ease-in-out infinite',
              display: 'inline-block',
            }}/>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.62rem',
              letterSpacing: '0.12em',
              color: 'var(--cyan)',
            }}>
              {lang === 'ar' ? 'مركز المساعدة · FAQ' : 'FAQ · HELP CENTER'}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
            fontWeight: 900,
            color: 'var(--text-1)',
            marginBottom: 10,
            lineHeight: 1.2,
          }}>
            {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h1>

          {/* cyan underline accent */}
          <div style={{
            width: 48, height: 2,
            background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
            borderRadius: 2,
            margin: '0 auto 14px',
          }}/>

          <p style={{
            fontFamily: "'Tajawal', sans-serif",
            fontSize: '0.95rem',
            color: 'var(--text-2)',
            maxWidth: 440,
            margin: '0 auto 28px',
            lineHeight: 1.8,
          }}>
            {lang === 'ar'
              ? 'إجابات شاملة ومباشرة على كل ما يخطر ببالك'
              : 'Comprehensive and direct answers to everything on your mind'}
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 18px',
            background: 'var(--card)',
            border: '1px solid var(--border-1)',
            borderRadius: 14,
            maxWidth: 460,
            margin: '0 auto',
            transition: 'border-color 0.2s',
          }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,210,255,0.35)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.7 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في الأسئلة...' : 'Search questions...'}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: "'Tajawal', sans-serif",
                fontSize: '0.88rem',
                color: 'var(--text-1)',
                direction: lang === 'ar' ? 'rtl' : 'ltr',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-3)', padding: 0, lineHeight: 1,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ══ MAIN LAYOUT ══ */}
        <div ref={timeRef} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Sidebar Filters ── */}
          {!searchQuery && (
            <div style={{
              flexShrink: 0,
              width: 170,
              position: 'sticky',
              top: 88,
              opacity: heroInView ? 1 : 0,
              transition: 'opacity 0.7s 0.2s',
            }}>
              {/* section label */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem',
                letterSpacing: '0.15em',
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                marginBottom: 10,
                paddingRight: 4,
              }}>
                {lang === 'ar' ? '// الأقسام' : '// SECTIONS'}
              </div>

              {FAQ_DATA.map((section, i) => {
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '10px 14px',
                      marginBottom: 4,
                      borderRadius: 11,
                      border: `1px solid ${isActive ? 'rgba(0,210,255,0.32)' : 'transparent'}`,
                      background: isActive ? 'rgba(0,210,255,0.07)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      opacity: heroInView ? 1 : 0,
                      transform: heroInView ? 'none' : 'translateX(10px)',
                      animation: `none`,
                      transitionDelay: `${i * 0.07}s`,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(0,210,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(0,210,255,0.12)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = 'transparent'
                      }
                    }}
                  >
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: isActive ? 'rgba(0,210,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(0,210,255,0.3)' : 'var(--border-1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'var(--cyan)' : 'var(--text-3)',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {section.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Tajawal', sans-serif",
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: isActive ? 'var(--cyan)' : 'var(--text-2)',
                        transition: 'color 0.2s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {lang === 'ar' ? section.labelAr : section.labelEn}
                      </div>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6rem',
                        color: 'var(--text-3)',
                        marginTop: 1,
                      }}>
                        {section.items.length} {lang === 'ar' ? 'سؤال' : 'questions'}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--cyan)',
                        animation: 'blink 1.4s ease-in-out infinite',
                        flexShrink: 0,
                      }}/>
                    )}
                  </button>
                )
              })}

              {/* divider */}
              <div style={{
                height: 1,
                background: 'var(--border-1)',
                margin: '12px 0',
              }}/>

              {/* section progress */}
              <div style={{
                padding: '10px 14px',
                background: 'var(--card)',
                border: '1px solid var(--border-1)',
                borderRadius: 11,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'var(--text-3)' }}>
                    {lang === 'ar' ? 'القسم' : 'SECTION'}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'var(--cyan)',
                    fontWeight: 700,
                  }}>
                    {FAQ_DATA.findIndex(s => s.id === activeSection) + 1}/{FAQ_DATA.length}
                  </span>
                </div>
                <div style={{
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--border-1)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
                    width: `${((FAQ_DATA.findIndex(s => s.id === activeSection) + 1) / FAQ_DATA.length) * 100}%`,
                    transition: 'width 0.4s cubic-bezier(.22,1,.36,1)',
                  }}/>
                </div>
              </div>
            </div>
          )}

          {/* ── Timeline Content ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Section header (only when not searching) */}
            {!searchQuery && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                opacity: timeInView ? 1 : 0,
                transform: timeInView ? 'none' : 'translateY(10px)',
                transition: 'opacity 0.5s, transform 0.5s cubic-bezier(.22,1,.36,1)',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--cyan-dim)',
                  border: '1px solid rgba(0,210,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)',
                }}>
                  {currentSection?.icon}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Tajawal', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: 'var(--text-1)',
                    margin: 0,
                  }}>
                    {lang === 'ar' ? currentSection?.labelAr : currentSection?.labelEn}
                  </h2>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.62rem',
                    color: 'var(--text-3)',
                    marginTop: 2,
                  }}>
                    {currentSection?.items.length} {lang === 'ar' ? 'سؤال وإجابة' : 'questions'}
                  </div>
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border-1)', marginRight: 'auto' }}/>
              </div>
            )}

            {/* Search results label */}
            {searchQuery && (
              <div style={{
                marginBottom: 16,
                padding: '8px 14px',
                background: 'var(--card)',
                border: '1px solid var(--border-1)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span style={{ fontFamily: "'Tajawal', sans-serif", fontSize: '0.82rem', color: 'var(--text-2)' }}>
                  {lang === 'ar'
                    ? `${filteredItems.length} نتيجة لـ "${searchQuery}"`
                    : `${filteredItems.length} results for "${searchQuery}"`}
                </span>
              </div>
            )}

            {/* Timeline line + items */}
            <div style={{
              position: 'relative',
              paddingRight: lang === 'ar' ? 16 : 0,
              paddingLeft: lang === 'ar' ? 0 : 16,
            }}>
              {/* vertical line */}
              <div style={{
                position: 'absolute',
                [lang === 'ar' ? 'right' : 'left']: 7,
                top: 0,
                bottom: 0,
                width: 1,
                background: `linear-gradient(180deg, var(--cyan) 0%, rgba(0,210,255,0.15) 60%, transparent 100%)`,
                opacity: 0.35,
              }}/>

              {filteredItems.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  color: 'var(--text-3)',
                  fontFamily: "'Tajawal', sans-serif",
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                </div>
              ) : (
                filteredItems.map((item, i) => (
                  <TimelineItem
                    key={lang === 'ar' ? item.qAr : item.qEn}
                    item={item}
                    index={i}
                    isOpen={openItem === i}
                    onToggle={() => setOpenItem(openItem === i ? null : i)}
                    inView={timeInView}
                    lang={lang}
                  />
                ))
              )}
            </div>

            {/* Section navigation arrows */}
            {!searchQuery && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-1)',
              }}>
                {(() => {
                  const idx = FAQ_DATA.findIndex(s => s.id === activeSection)
                  const prev = FAQ_DATA[idx - 1]
                  const next = FAQ_DATA[idx + 1]
                  return (
                    <>
                      <button
                        onClick={() => prev && handleSectionChange(prev.id)}
                        disabled={!prev}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '8px 14px',
                          background: 'transparent',
                          border: `1px solid ${prev ? 'var(--border-1)' : 'transparent'}`,
                          borderRadius: 9,
                          color: prev ? 'var(--text-2)' : 'transparent',
                          fontFamily: "'Tajawal', sans-serif",
                          fontSize: '0.8rem',
                          cursor: prev ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (prev) { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.25)'; e.currentTarget.style.color = 'var(--cyan)' }}}
                        onMouseLeave={e => { if (prev) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)' }}}
                      >
                        {lang === 'ar' ? '←' : '→'} {lang === 'ar' ? prev?.labelAr : prev?.labelEn}
                      </button>
                      <button
                        onClick={() => next && handleSectionChange(next.id)}
                        disabled={!next}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '8px 14px',
                          background: 'transparent',
                          border: `1px solid ${next ? 'var(--border-1)' : 'transparent'}`,
                          borderRadius: 9,
                          color: next ? 'var(--text-2)' : 'transparent',
                          fontFamily: "'Tajawal', sans-serif",
                          fontSize: '0.8rem',
                          cursor: next ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (next) { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.25)'; e.currentTarget.style.color = 'var(--cyan)' }}}
                        onMouseLeave={e => { if (next) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)' }}}
                      >
                        {lang === 'ar' ? next?.labelAr : next?.labelEn} {lang === 'ar' ? '→' : '←'}
                      </button>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {/* ══ STATS ══ */}
        <div
          ref={statsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'var(--border-1)',
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid var(--border-1)',
            margin: '52px 0',
          }}
        >
          {[
            { target: totalQ,  suffix: '+',  labelAr: 'سؤال وإجابة',      labelEn: 'Q&A covered',     delay: 0    },
            { target: 5,       suffix: 'م',  labelAr: 'وقت الرد',          labelEn: 'min response',    delay: 0.1  },
            { target: 4.9,     suffix: '★',  labelAr: 'رضا العملاء',       labelEn: 'customer rating', delay: 0.2  },
            { target: 24,      suffix: '/7', labelAr: 'دعم متواصل',        labelEn: 'support hours',   delay: 0.3  },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--card)' }}>
              <StatCounter {...s} started={statsInView} lang={lang} />
            </div>
          ))}
        </div>

        {/* ══ CTA ══ */}
        <div
          ref={ctaRef}
          style={{
            padding: '32px 28px',
            background: 'var(--card)',
            border: '1px solid var(--border-1)',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            opacity: ctaInView ? 1 : 0,
            transform: ctaInView ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.6s, transform 0.6s cubic-bezier(.22,1,.36,1)',
          }}
        >
          {/* top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, var(--cyan) 40%, var(--purple) 60%, transparent)',
          }}/>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--text-1)',
              marginBottom: 6,
            }}>
              {lang === 'ar' ? 'لم تجد إجابة على سؤالك؟' : "Didn't find your answer?"}
            </h3>
            <p style={{
              fontFamily: "'Tajawal', sans-serif",
              fontSize: '0.84rem',
              color: 'var(--text-2)',
              margin: 0,
              lineHeight: 1.65,
            }}>
              {lang === 'ar'
                ? 'فريقنا جاهز لمساعدتك مباشرة — تواصل معنا الآن'
                : 'Our team is ready to help you directly — contact us now'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href="https://t.me/nimber1"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                background: 'linear-gradient(135deg, var(--cyan), #0098ea)',
                color: '#030810',
                borderRadius: 10,
                textDecoration: 'none',
                fontFamily: "'Tajawal', sans-serif",
                fontSize: '0.84rem',
                fontWeight: 800,
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0,210,255,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,210,255,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,210,255,0.25)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {lang === 'ar' ? 'تيليجرام' : 'Telegram'}
            </a>
            <a
              href="https://wa.me/201080835986"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                background: 'transparent',
                color: 'var(--text-1)',
                border: '1px solid var(--border-1)',
                borderRadius: 10,
                textDecoration: 'none',
                fontFamily: "'Tajawal', sans-serif",
                fontSize: '0.84rem',
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.3)'; e.currentTarget.style.color = 'var(--cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-1)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
              {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
