// src/pages/About.jsx
import { useEffect, useRef, useState } from 'react'
import useLang from '../context/useLang'

/* ─── SVG Icons ─── */
const IcShield    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IcZap       = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IcEye2      = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IcSupport   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcClipboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
const IcTarget    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IcStar      = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IcGlobe     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IcHeart     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IcCheck     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

/* ─── Data ─── */
const VALUES = [
  { icon: <IcShield />, titleAr: 'الأمان أولاً',   titleEn: 'Security First',     descAr: 'كل معاملة تمر عبر مراجعة يدوية وتحقق تلقائي من blockchain قبل الإرسال.', descEn: 'Every transaction goes through manual review and automatic blockchain verification before sending.', color: '#00d2ff' },
  { icon: <IcZap />,    titleAr: 'السرعة',          titleEn: 'Speed',               descAr: 'معظم التحويلات تكتمل خلال 5 إلى 30 دقيقة، 7 أيام في الأسبوع.', descEn: 'Most transfers are completed within 5 to 30 minutes, 7 days a week.', color: '#00e5a0' },
  { icon: <IcEye2 />,   titleAr: 'الشفافية',        titleEn: 'Transparency',        descAr: 'أسعارنا واضحة بلا رسوم خفية. السعر الذي تراه هو ما ستدفعه.', descEn: 'Our rates are clear with no hidden fees. The price you see is what you pay.', color: '#a78bfa' },
  { icon: <IcSupport/>, titleAr: 'دعم حقيقي',       titleEn: 'Real Support',        descAr: 'فريق بشري يتابع كل طلب ويرد على استفساراتك بسرعة عبر تيليغرام.', descEn: 'A human team follows up every request and responds quickly via Telegram.', color: '#f59e0b' },
  { icon: <IcGlobe />,  titleAr: 'انتشار واسع',     titleEn: 'Wide Reach',          descAr: 'نخدم عملاء في عدة دول حول العالم عبر عملات رقمية ومحافظ إلكترونية متعددة.', descEn: 'We serve clients in multiple countries through various digital currencies and e-wallets.', color: '#00d2ff' },
  { icon: <IcHeart />,  titleAr: 'ثقة متبادلة',     titleEn: 'Mutual Trust',        descAr: 'كل طلب يتم حفظه لتسهيل التتبع والمراجعة.', descEn: 'Each order is saved for easy tracking and review.', color: '#00e5a0' },
]

const STATS = [
  { value: '2026',   labelAr: 'سنة التأسيس', labelEn: 'Year Founded' },
  { value: '+200',  labelAr: 'صفقة منجزة',  labelEn: 'Deals Completed' },
  { value: '99.8%', labelAr: 'نسبة النجاح',  labelEn: 'Success Rate' },
  { value: '24/7',  labelAr: 'الدعم الفني',  labelEn: 'Tech Support' },
]

const WHY_US = [
  { ar: 'تحقق فوري من blockchain لكل معاملة', en: 'Instant blockchain verification for every transaction' },
  { ar: 'أسعار تنافسية بدون رسوم مخفية',     en: 'Competitive rates with no hidden fees' },
  { ar: 'فريق دعم بشري على تيليغرام',        en: 'Human support team on Telegram' },
  { ar: 'مسجلون على BestChange.com',          en: 'Registered on BestChange.com' },
  { ar: 'مراجعة يدوية من فريق متخصص',        en: 'Manual review by a specialized team' },
  { ar: 'تغطية واسعة حول العالم',            en: 'Wide global coverage' },
]

/* ─── Scroll-reveal hook ─── */
function useInView(threshold) {
  var t = threshold === undefined ? 0.15 : threshold
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: t })
    obs.observe(el)
    return function() { obs.disconnect() }
  }, [t])
  return [ref, inView]
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay, direction }) {
  var d = delay || 0
  var dir = direction || 'up'
  const [ref, inView] = useInView()
  const transforms = { up: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)' }
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : (transforms[dir] || transforms.up),
      transition: 'opacity 0.65s ease ' + d + 'ms, transform 0.65s ease ' + d + 'ms',
    }}>
      {children}
    </div>
  )
}

export default function About() {
  const { lang } = useLang()
  const isEn = lang === 'en'
  useEffect(function() { window.scrollTo(0, 0) }, [])

  /* Stars canvas */
  const starsRef = useRef(null)
  useEffect(function() {
    const cv = starsRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const resize = function() { cv.width = cv.offsetWidth * dpr; cv.height = cv.offsetHeight * dpr }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 120 }, function() { return {
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r: Math.random() * 0.9 + 0.15,
      base: Math.random() * 0.4 + 0.08,
      ts: Math.random() * 0.0008 + 0.0002, tp: Math.random() * Math.PI * 2,
    }})
    var raf
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height)
      const now = Date.now()
      stars.forEach(function(s) {
        const op = Math.max(0, s.base + Math.sin(now * s.ts + s.tp) * 0.18)
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(160,210,255,' + op + ')'; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return function() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const [statsRef] = useInView(0.3)

  return (
    <div style={{ direction: isEn ? 'ltr' : 'rtl', position: 'relative', overflow: 'hidden' }}>

      {/* Stars */}
      <canvas ref={starsRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.35 }} />

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 70px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -150, width: 550, height: 550, borderRadius: '50%', background: 'var(--cyan)', filter: 'blur(150px)', opacity: 0.045, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -100, width: 420, height: 420, borderRadius: '50%', background: 'var(--purple)', filter: 'blur(120px)', opacity: 0.045, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,210,255,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,255,0.016) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 720 }}>
          <div className="about-badge-anim" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 18px', borderRadius: 20, border: '1px solid rgba(0,210,255,0.3)', background: 'rgba(0,210,255,0.06)', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'blink 1.4s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>ABOUT US</span>
          </div>
          <h1 className="about-hero-title" style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 10px', lineHeight: 1.15 }}>
            {isEn ? 'About Us' : 'من نحن'}
          </h1>
          <h2 className="about-hero-sub" style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(0.9rem,2vw,1.2rem)', fontWeight: 400, color: 'var(--cyan)', margin: '0 0 26px', letterSpacing: 2, opacity: 0.75 }}>
            NUMBER 1 EXCHANGE
          </h2>
          <p className="about-hero-desc" style={{ fontSize: '1.08rem', color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', fontFamily: "'Tajawal',sans-serif", lineHeight: 2 }}>
            {isEn
              ? 'A platform specialized in exchanging digital currencies and e-wallets. Founded to provide a fast, secure, and transparent exchange service for Arabs everywhere — without complexity and without hidden fees.'
              : 'منصة متخصصة في تحويل العملات الرقمية والمحافظ الإلكترونية. أُسست لتقديم خدمة صرف سريعة وآمنة وشفافة للعرب في كل مكان — بلا تعقيد، وبلا رسوم مخفية.'}
          </p>
          <div style={{ marginTop: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontSize: '0.75rem', letterSpacing: 1 }}>
            <span>{isEn ? 'Scroll to explore our story' : 'مرّر لاستكشاف قصتنا'}</span>
            <div style={{ width: 16, height: 16, borderRight: '2px solid rgba(0,210,255,0.35)', borderBottom: '2px solid rgba(0,210,255,0.35)', transform: 'rotate(45deg)', animation: 'aboutBounce 1.6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, maxWidth: 860, margin: '0 auto' }}>
          {STATS.map(function(s, i) { return (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '26px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden', transition: 'border-color .2s, transform .2s' }}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)', opacity: 0.6 }} />
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 900, color: 'var(--cyan)', marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>{isEn ? s.labelEn : s.labelAr}</div>
              </div>
            </Reveal>
          )})}
        </div>
      </section>

      {/* VISION + MISSION */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, padding: '34px 28px', position: 'relative', overflow: 'hidden', transition: 'border-color .3s, transform .3s' }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)' }} />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: 'var(--cyan)' }}>
                <IcTarget />
              </div>
              <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan)', margin: '0 0 14px', letterSpacing: 1 }}>{isEn ? 'Our Vision' : 'رؤيتنا'}</h2>
              <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-2)', lineHeight: 2, fontFamily: "'Tajawal',sans-serif" }}>
                {isEn
                  ? 'To be the most trusted and leading digital currency exchange platform in the Arab world — where every user finds a smooth and secure experience regardless of their expertise level.'
                  : 'أن نكون المنصة الأولى والأكثر موثوقية لتبادل العملات الرقمية في العالم العربي — حيث يجد كل مستخدم تجربة سلسة وآمنة بغض النظر عن مستوى خبرته.'}
              </p>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, padding: '34px 28px', position: 'relative', overflow: 'hidden', transition: 'border-color .3s, transform .3s' }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(124,92,252,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--purple),transparent)' }} />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: 'var(--purple)' }}>
                <IcStar />
              </div>
              <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--purple)', margin: '0 0 14px', letterSpacing: 1 }}>{isEn ? 'Our Mission' : 'رسالتنا'}</h2>
              <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-2)', lineHeight: 2, fontFamily: "'Tajawal',sans-serif" }}>
                {isEn
                  ? 'We believe that money transfer should be easy, fast, and secure for everyone. Our goal is to reduce the time and complexity of digital currency exchange while providing a fair and transparent rate with no surprises.'
                  : 'نؤمن بأن تحويل الأموال يجب أن يكون سهلاً وسريعاً وآمناً للجميع. هدفنا تقليص الوقت والتعقيد في عمليات صرف العملات الرقمية وتوفير سعر عادل شفاف بدون مفاجآت.'}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* WHY US */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: '0.68rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>WHY CHOOSE US</div>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.1rem,2.5vw,1.6rem)', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>{isEn ? 'Why Us?' : 'لماذا نحن؟'}</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          {WHY_US.map(function(item, i) { return (
            <Reveal key={i} delay={i * 60}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color .2s, transform .2s' }}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(0,210,255,0.3)'; e.currentTarget.style.transform = 'translateX(-3px)' }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateX(0)' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,210,255,0.12)', border: '1px solid rgba(0,210,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--cyan)' }}>
                  <IcCheck />
                </div>
                <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{isEn ? item.en : item.ar}</span>
              </div>
            </Reveal>
          )})}
        </div>
      </section>

      {/* VALUES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: '0.68rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>OUR VALUES</div>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.1rem,2.5vw,1.6rem)', fontWeight: 900, color: 'var(--text-1)', margin: 0 }}>{isEn ? 'Our Values' : 'قيمنا'}</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {VALUES.map(function(v, i) { return (
            <Reveal key={i} delay={i * 70}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 18, padding: '26px 22px', position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s', height: '100%' }}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = v.color + '50'; e.currentTarget.style.transform = 'translateY(-5px)' }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, ' + v.color + '07 0%, transparent 65%)', pointerEvents: 'none' }} />
                <div style={{ width: 50, height: 50, borderRadius: 13, background: v.color + '15', border: '1px solid ' + v.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: v.color, position: 'relative' }}>
                  {v.icon}
                </div>
                <h3 style={{ margin: '0 0 10px', fontFamily: "'Tajawal',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', position: 'relative' }}>{isEn ? v.titleEn : v.titleAr}</h3>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-3)', lineHeight: 1.85, fontFamily: "'Tajawal',sans-serif", position: 'relative' }}>{isEn ? v.descEn : v.descAr}</p>
              </div>
            </Reveal>
          )})}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 100px', maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <div style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.18)', borderRadius: 20, padding: '28px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(0,210,255,0.6),transparent)' }} />
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 2 }}><IcClipboard /></span>
              <div>
                <h3 style={{ margin: '0 0 10px', fontFamily: "'Tajawal',sans-serif", fontWeight: 700, color: 'var(--text-1)', fontSize: '0.98rem' }}>{isEn ? 'Compliance & Registration' : 'الامتثال والتسجيل'}</h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-3)', lineHeight: 1.9, fontFamily: "'Tajawal',sans-serif" }}>
                  {isEn
                    ? 'Our platform is registered on BestChange.com and operates in accordance with international AML/KYC standards. We are committed to full transparency in all our operations and continuously monitor regulations related to digital currency exchange.'
                    : 'منصتنا مسجلة على BestChange.com وتعمل وفق معايير AML/KYC الدولية. نلتزم بالشفافية الكاملة في جميع عملياتنا ونتابع باستمرار اللوائح المتعلقة بصرف العملات الرقمية.'}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes aboutBounce { 0%,100%{transform:rotate(45deg) translateY(0)} 50%{transform:rotate(45deg) translateY(6px)} }
        .about-badge-anim  { animation: aboutFadeIn 0.7s ease both; }
        .about-hero-title  { animation: aboutFadeIn 0.7s ease 0.1s both; }
        .about-hero-sub    { animation: aboutFadeIn 0.7s ease 0.2s both; }
        .about-hero-desc   { animation: aboutFadeIn 0.7s ease 0.3s both; }
        @keyframes aboutFadeIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
