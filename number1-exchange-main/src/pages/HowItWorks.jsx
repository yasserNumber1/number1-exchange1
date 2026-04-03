// src/pages/HowItWorks.jsx
import { useEffect, useRef, useState, useCallback } from 'react'

const PHONE_MQ = '(max-width: 768px)'

function useIsPhone() {
  const [phone, setPhone] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(PHONE_MQ).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(PHONE_MQ)
    const onChange = () => setPhone(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return phone
}

/* ─── SVG Icons (same as before) ─── */
const IcCalculator = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>
const IcClipHow   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
const IcSend2     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IcCamera    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
const IcCheckCirc = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcCreditCard= () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
const IcMobile    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
const IcBank      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
const IcUSDT      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8"/></svg>

/* ─── Data (unchanged) ─── */
const STEPS = [
  { num: '01', icon: <IcCalculator />, title: 'اختر العملة والمبلغ',    desc: 'حدد العملة التي تريد إرسالها والعملة التي تريد استقبالها. سيظهر لك السعر الحالي والمبلغ الذي ستحصل عليه بشكل فوري.', color: '#00d2ff' },
  { num: '02', icon: <IcClipHow />,   title: 'أدخل بيانات المستلم',     desc: 'أدخل رقم المحفظة أو العنوان الذي تريد إرسال المبلغ إليه. تأكد من صحة البيانات قبل المتابعة.',                          color: '#00e5a0' },
  { num: '03', icon: <IcSend2 />,     title: 'أرسل الدفعة',             desc: 'أرسل المبلغ المطلوب إلى عنوان الدفع الظاهر. للـ USDT: انسخ عنوان TRC-20 وأرسل المبلغ مباشرة.',                         color: '#a78bfa' },
  { num: '04', icon: <IcCamera />,    title: 'أرفع إيصال الدفع',        desc: 'بعد إتمام الدفع، ارفع صورة الإيصال أو أرسل رقم المعاملة. سيتم مراجعتها من قِبل فريقنا خلال دقائق.',                    color: '#f59e0b' },
  { num: '05', icon: <IcCheckCirc />, title: 'استقبل أموالك',           desc: 'بعد التأكيد، يتم تحويل المبلغ فوراً إلى حسابك. ستصلك رسالة تأكيد برقم الطلب لمتابعته.',                               color: '#00e5a0' },
]

const METHODS = [
  { icon: <IcUSDT />,       name: 'USDT TRC-20',  desc: 'تحويل آلي فوري',        badge: 'تلقائي',   color: '#26a17b' },
  { icon: <IcCreditCard />, name: 'فودافون كاش',  desc: 'تحويل شبه فوري',        badge: 'يدوي',     color: '#e40613' },
  { icon: <IcMobile />,     name: 'إنستاباي',     desc: 'تحويل سريع',            badge: 'يدوي',     color: '#6c35de' },
  { icon: <IcBank />,       name: 'MoneyGo USD',  desc: 'الاستقبال الرئيسي',     badge: 'استقبال',  color: '#00b8d9' },
]

const FAQS_MINI = [
  { q: 'كم يستغرق التحويل؟',      a: 'من 5 دقائق إلى 30 دقيقة حسب طريقة الدفع.' },
  { q: 'هل هناك رسوم خفية؟',      a: 'لا. السعر المعروض هو السعر النهائي شامل جميع الرسوم.' },
  { q: 'ما الحد الأدنى للتحويل؟',  a: 'الحد الأدنى 10 USDT أو ما يعادلها.' },
  { q: 'هل تحويلاتي آمنة؟',       a: 'نعم. نستخدم TronGrid API ونتحقق من كل معاملة يدوياً.' },
]

/* ─── Animated Canvas ─── */
function StepCanvas({ activeStep }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const stepRef   = useRef(activeStep)

  useEffect(() => { stepRef.current = activeStep }, [activeStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width  = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS  = ['#00d2ff', '#00e5a0', '#a78bfa', '#f59e0b', '#00e5a0']
    const NUMS    = ['01', '02', '03', '04', '05']
    const LABELS  = ['اختر العملة', 'أدخل البيانات', 'أرسل الدفعة', 'ارفع الإيصال', 'استقبل أموالك']

    let t = 0
    function draw() {
      const step = stepRef.current
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)
      t += 0.016

      const cx = W / 2
      const cy = H / 2
      const R  = Math.min(W, H) * 0.27
      const ac = COLORS[step]

      // outer glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.9)
      grd.addColorStop(0, ac + '18')
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.9, 0, Math.PI * 2)
      ctx.fill()

      // rotating dashed ring
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t * 0.35)
      ctx.strokeStyle = ac + '28'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 9])
      ctx.beginPath()
      ctx.arc(0, 0, R * 1.28, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // progress arc (how many steps done)
      const arcFrac = (step + 1) / 5
      ctx.strokeStyle = ac
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.shadowColor = ac
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.08, -Math.PI / 2, -Math.PI / 2 + arcFrac * Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // inner filled circle
      const ig = ctx.createRadialGradient(cx - R * 0.18, cy - R * 0.18, 0, cx, cy, R)
      ig.addColorStop(0, ac + 'cc')
      ig.addColorStop(1, ac + '44')
      ctx.fillStyle = ig
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()

      // step number text
      ctx.fillStyle = '#000a'
      ctx.font = `bold ${Math.round(R * 0.52)}px "Orbitron", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(NUMS[step], cx, cy)

      // label below circle
      ctx.fillStyle = '#e8f4ff'
      ctx.font = `600 ${Math.max(11, Math.round(R * 0.21))}px "Tajawal", sans-serif`
      ctx.fillText(LABELS[step], cx, cy + R * 1.52)

      // progress dots
      const dotY = cy + R * 1.92
      const gap  = R * 0.42
      const sx   = cx - (4 * gap) / 2
      for (let i = 0; i < 5; i++) {
        const dx = sx + i * gap
        const cur = i === step
        ctx.beginPath()
        ctx.arc(dx, dotY, cur ? 6 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = i <= step
          ? (cur ? ac : ac + '66')
          : 'rgba(255,255,255,0.10)'
        if (cur) { ctx.shadowColor = ac; ctx.shadowBlur = 8 }
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // pulse ring
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2)
      ctx.strokeStyle = ac + Math.round(pulse * 55 + 10).toString(16).padStart(2, '0')
      ctx.lineWidth = 1.8
      ctx.beginPath()
      ctx.arc(cx, cy, R * (1.14 + pulse * 0.055), 0, Math.PI * 2)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="hiw-step-canvas"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

/* ─── Count-up ─── */
function useCountUp(target, suffix = '', go = false) {
  const [v, setV] = useState('0' + suffix)
  useEffect(() => {
    if (!go) return
    const dur = 1800
    const t0  = performance.now()
    const ease = p => 1 - Math.pow(2, -10 * p)
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1)
      const c = ease(p) * target
      setV((target % 1 === 0 ? Math.floor(c).toLocaleString('ar') : c.toFixed(1)) + suffix)
      if (p < 1) requestAnimationFrame(tick)
      else setV((Number.isInteger(target) ? target.toLocaleString('ar') : target) + suffix)
    }
    requestAnimationFrame(tick)
  }, [go, target, suffix])
  return v
}

/* ─── Main ─── */
export default function HowItWorks() {
  const isPhone = useIsPhone()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  /* scroll-stop — سطح المكتب والتابلت العريض فقط (ليس الهاتف) */
  const sectionRef = useRef(null)
  const [activeStep, setActiveStep]   = useState(0)
  const snapLockedRef = useRef(false)

  const goPrev = useCallback(() => {
    setActiveStep(s => Math.max(0, s - 1))
  }, [])
  const goNext = useCallback(() => {
    setActiveStep(s => Math.min(STEPS.length - 1, s + 1))
  }, [])

  const touchStartX = useRef(null)

  const onTouchStart = useCallback(e => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback(e => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 48) return
    if (dx < 0) goNext()
    else goPrev()
  }, [goNext, goPrev])

  useEffect(() => {
    if (isPhone) return undefined

    const SNAP_ZONE  = 0.065
    const HOLD       = 530
    const SNAP_PTS   = [0.10, 0.28, 0.50, 0.72, 0.90]
    let lastSnap     = -1

    function onScroll() {
      if (snapLockedRef.current) return
      const el = sectionRef.current
      if (!el) return
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const scrolled   = -el.getBoundingClientRect().top
      const raw        = Math.max(0, Math.min(1, scrolled / scrollable))

      setActiveStep(Math.min(4, Math.floor(raw * 5)))

      for (let i = 0; i < SNAP_PTS.length; i++) {
        if (Math.abs(raw - SNAP_PTS[i]) < SNAP_ZONE && lastSnap !== i) {
          lastSnap = i
          snapLockedRef.current = true
          const sTop   = el.getBoundingClientRect().top + window.scrollY
          const target = sTop + SNAP_PTS[i] * scrollable
          window.scrollTo({ top: target, behavior: 'smooth' })
          setTimeout(() => { snapLockedRef.current = false }, HOLD)
          break
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isPhone])

  /* scroll progress bar */
  useEffect(() => {
    const bar = document.getElementById('hiw-pbar')
    function upd() {
      if (bar) bar.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%'
    }
    window.addEventListener('scroll', upd, { passive: true })
    return () => window.removeEventListener('scroll', upd)
  }, [])

  /* stars */
  const starsRef = useRef(null)
  useEffect(() => {
    const cv  = starsRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const resize = () => { cv.width = cv.offsetWidth * dpr; cv.height = cv.offsetHeight * dpr }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r:  Math.random() * 1 + 0.2,
      base: Math.random() * 0.5 + 0.12,
      dx: (Math.random() - 0.5) * 0.022, dy: (Math.random() - 0.5) * 0.011,
      ts: Math.random() * 0.0009 + 0.0003, tp: Math.random() * Math.PI * 2,
    }))
    let raf
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height)
      const now = Date.now()
      stars.forEach(s => {
        s.x += s.dx; s.y += s.dy
        if (s.x < 0) s.x = cv.width;  if (s.x > cv.width)  s.x = 0
        if (s.y < 0) s.y = cv.height; if (s.y > cv.height) s.y = 0
        const op = Math.max(0, s.base + Math.sin(now * s.ts + s.tp) * 0.2)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160,210,255,${op})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* specs count-up */
  const specsRef = useRef(null)
  const [specsOn, setSpecsOn] = useState(false)
  useEffect(() => {
    const el = specsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSpecsOn(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  const v1 = useCountUp(50000, '+', specsOn)
  const v2 = useCountUp(99.9,  '%', specsOn)
  const v3 = useCountUp(2.4,   'M', specsOn)
  const v4 = useCountUp(180,   '+', specsOn)

  const ac = STEPS[activeStep].color

  return (
    <div style={{ direction: 'rtl', position: 'relative' }}>

      {/* scroll progress */}
      <div id="hiw-pbar" style={{
        position: 'fixed', top: 0, left: 0, height: 2, width: 0,
        background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
        zIndex: 9999, transition: 'width .1s linear', pointerEvents: 'none',
      }} />

      {/* stars */}
      <canvas ref={starsRef} style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', opacity: 0.42,
      }} />

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px 56px', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -180, right: -140, width: 500, height: 500, borderRadius: '50%', background: 'var(--cyan)', filter: 'blur(130px)', opacity: 0.055, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -130, left: -110, width: 400, height: 400, borderRadius: '50%', background: 'var(--purple)', filter: 'blur(110px)', opacity: 0.055, pointerEvents: 'none' }} />
        {/* grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,210,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,255,0.018) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 20, border: '1px solid rgba(0,210,255,0.28)', background: 'rgba(0,210,255,0.06)', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'blink 1.4s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>HOW IT WORKS</span>
          </div>

          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.6rem,4.5vw,2.6rem)', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 16px', lineHeight: 1.2 }}>
            كيف تعمل المنصة؟
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-3)', maxWidth: 500, margin: '0 auto 42px', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.85 }}>
            5 خطوات بسيطة تفصلك عن إتمام عملية التحويل بأمان وسرعة
          </p>

          {/* scroll hint */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontSize: '0.76rem', letterSpacing: 1 }}>
            <span>{isPhone ? 'استخدم الأسهم أو اسحب يمين/يسار في الخطوات' : 'مرّر للأسفل لاستعراض الخطوات'}</span>
            <div style={{ width: 17, height: 17, borderRight: '2px solid rgba(0,210,255,0.35)', borderBottom: '2px solid rgba(0,210,255,0.35)', transform: 'rotate(45deg)', animation: 'hiwBounce 1.6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── STEPS: سكرول + سناب (ديسكتوب) | أسهم + سحب (هاتف ≤768px) ── */}
      <section
        ref={sectionRef}
        className="hiw-steps-section"
        style={{
          height: isPhone ? 'auto' : '550vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="hiw-swipe-zone"
          onTouchStart={isPhone ? onTouchStart : undefined}
          onTouchEnd={isPhone ? onTouchEnd : undefined}
          style={{
            position: isPhone ? 'relative' : 'sticky',
            top: isPhone ? undefined : 0,
            height: isPhone ? 'auto' : '100vh',
            minHeight: isPhone ? 'min(82vh, 720px)' : undefined,
            width: '100%',
            display: 'flex',
            flexDirection: isPhone ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: isPhone ? 'flex-start' : 'center',
            overflow: 'hidden',
            touchAction: isPhone ? 'pan-y' : undefined,
            paddingBottom: isPhone ? 'env(safe-area-inset-bottom, 0px)' : undefined,
          }}
        >

          {/* scanlines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(0,210,255,0.007) 3px,rgba(0,210,255,0.007) 4px)' }} />
          {/* ambient orb that follows step color */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: ac, filter: 'blur(140px)', opacity: 0.055, transition: 'background 0.6s ease', pointerEvents: 'none' }} />

          <div
            className="hiw-layout"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: isPhone ? 'column' : undefined,
              gap: isPhone ? 20 : 'clamp(20px,4vw,64px)',
              maxWidth: 980,
              width: '100%',
              padding: isPhone ? '20px 18px 28px' : '0 clamp(16px,4vw,48px)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Canvas */}
            <div
              style={{
                flex: isPhone ? '0 0 auto' : '0 0 clamp(180px,36%,360px)',
                width: isPhone ? 'min(260px, 72vw)' : undefined,
                height: isPhone ? 'min(260px, 72vw)' : 'clamp(180px,36vw,360px)',
              }}
            >
              <StepCanvas activeStep={activeStep} />
            </div>

            {/* Step info */}
            <div style={{ flex: 1, minWidth: 0, width: isPhone ? '100%' : undefined }}>
              {/* step tag */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 8, marginBottom: 16, border: `1px solid ${ac}40`, background: `${ac}10`, transition: 'all .4s' }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', letterSpacing: 2, color: ac, transition: 'color .4s' }}>STEP {STEPS[activeStep].num}</span>
              </div>

              {/* title */}
              <h2
                key={activeStep}
                className="hiw-step-animate"
                style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.1rem,2.8vw,1.8rem)', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 14px', lineHeight: 1.25, transition: 'all .35s' }}
              >
                {STEPS[activeStep].title}
              </h2>

              {/* desc */}
              <p
                key={`d-${activeStep}`}
                className="hiw-step-animate"
                style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.85, margin: '0 0 22px', maxWidth: 400, transition: 'all .35s' }}
              >
                {STEPS[activeStep].desc}
              </p>

              {/* progress pills — على الهاتف: نقرة للانتقال */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: isPhone ? 18 : 28, flexWrap: 'wrap' }}>
                {STEPS.map((s, i) => {
                  const pillStyle = {
                    height: 7,
                    borderRadius: 4,
                    width: i === activeStep ? 32 : 8,
                    background: i <= activeStep ? STEPS[i].color : 'rgba(255,255,255,0.10)',
                    opacity: i === activeStep ? 1 : i < activeStep ? 0.5 : 0.2,
                    boxShadow: i === activeStep ? `0 0 10px ${s.color}80` : 'none',
                    transition: 'all .4s ease',
                    border: 'none',
                    padding: 0,
                  }
                  return isPhone ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveStep(i)}
                      style={{ ...pillStyle, cursor: 'pointer', minHeight: 12, minWidth: i === activeStep ? 32 : 12 }}
                      aria-label={`الخطوة ${i + 1}`}
                      aria-current={i === activeStep ? 'step' : undefined}
                    />
                  ) : (
                    <div key={i} style={pillStyle} aria-hidden />
                  )
                })}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: 'var(--text-3)', marginRight: 4 }}>
                  {activeStep + 1} / 5
                </span>
              </div>

              {/* icon card */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                padding: '13px 20px',
                background: 'var(--card)',
                border: `1px solid ${ac}35`,
                borderRadius: 12, transition: 'border-color .4s',
              }}>
                <span style={{ color: ac, display: 'flex', transition: 'color .4s' }}>{STEPS[activeStep].icon}</span>
                <span style={{ fontFamily: "'Tajawal',sans-serif", fontSize: '0.88rem', color: 'var(--text-2)' }}>
                  {STEPS[activeStep].title}
                </span>
              </div>
            </div>

          </div>

          {isPhone && (
            <div className="hiw-phone-nav">
              <button
                type="button"
                className="hiw-phone-nav__btn"
                onClick={goPrev}
                disabled={activeStep <= 0}
                aria-label="الخطوة السابقة"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="15 6 9 12 15 18" />
                </svg>
                <span>السابق</span>
              </button>
              <p className="hiw-phone-nav__hint">اسحب لليمين أو لليسار</p>
              <button
                type="button"
                className="hiw-phone-nav__btn"
                onClick={goNext}
                disabled={activeStep >= STEPS.length - 1}
                aria-label="الخطوة التالية"
              >
                <span>التالي</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SPECS ── */}
      <section ref={specsRef} style={{ position: 'relative', zIndex: 1, padding: '96px 24px', background: 'linear-gradient(to bottom, transparent, rgba(0,210,255,0.022), transparent)' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>PLATFORM STATS</div>
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.2rem,3vw,1.8rem)', fontWeight: 900, color: 'var(--text-1)' }}>أرقام تُثير الثقة</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 28, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          {[
            { val: v1, label: 'تاجر نشط على المنصة', color: 'var(--cyan)' },
            { val: v2, label: 'وقت تشغيل مضمون',    color: 'var(--green)' },
            { val: v3, label: 'تحويل ناجح شهرياً',   color: 'var(--purple)' },
            { val: v4, label: 'دولة مدعومة',          color: 'var(--gold)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '30px 18px', transition: 'border-color .25s, transform .25s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: s.color, marginBottom: 10, textShadow: specsOn ? `0 0 18px ${s.color}55` : 'none', transition: 'text-shadow .3s' }}>
                {s.val}
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAYMENT METHODS ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 76px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 22px', letterSpacing: 1 }}>
          طرق الدفع المقبولة
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 14 }}>
          {METHODS.map(m => (
            <div key={m.name} style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', transition: 'border-color .2s, transform .2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + '55'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ marginBottom: 10, color: m.color, display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
              <div style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 700, color: 'var(--text-1)', fontSize: '0.9rem', marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 10 }}>{m.desc}</div>
              <span style={{ fontSize: '0.62rem', padding: '3px 10px', borderRadius: 6, background: m.color + '20', color: m.color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>{m.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MINI FAQ ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 18px', letterSpacing: 1 }}>
          أسئلة سريعة
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS_MINI.map(f => (
            <div key={f.q} style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 12, padding: '15px 20px', transition: 'border-color .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,210,255,0.28)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-1)'}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.9rem', marginBottom: 6 }}>{f.q}</div>
              <div style={{ color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif", fontSize: '0.84rem', lineHeight: 1.75 }}>← {f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes hiwBounce {
          0%,100% { transform: rotate(45deg) translateY(0); }
          50%      { transform: rotate(45deg) translateY(6px); }
        }
        @keyframes hiwStepIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hiw-step-animate {
          animation: hiwStepIn 0.35s ease-out;
        }
        @media (max-width: 768px) {
          .hiw-phone-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
            max-width: 420px;
            margin: 0 auto;
            padding: 12px 14px 16px;
            z-index: 6;
            flex-shrink: 0;
          }
          .hiw-phone-nav__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 48px;
            padding: 0 16px;
            border-radius: 14px;
            border: 1px solid var(--border-1);
            background: var(--card);
            color: var(--text-1);
            font-family: 'Tajawal', sans-serif;
            font-size: 0.82rem;
            font-weight: 800;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s, opacity 0.2s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          }
          .hiw-phone-nav__btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
          .hiw-phone-nav__btn:active:not(:disabled) {
            transform: scale(0.98);
          }
          .hiw-phone-nav__hint {
            flex: 1;
            text-align: center;
            margin: 0;
            font-size: 0.62rem;
            color: var(--text-3);
            font-family: 'JetBrains Mono', monospace;
            line-height: 1.35;
            max-width: 120px;
          }
        }
        @media (max-width: 600px) {
          .hiw-layout { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}
