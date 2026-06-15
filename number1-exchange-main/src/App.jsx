// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { readOrderSession, getTimeRemaining, clearOrderSession } from './services/orderSession'
import { getRouteSeo } from './seo/routes'
import { toAbsoluteUrl } from './seo/site'

// ── Per-page SEO metadata ──────────────────────────────────
const PAGE_SEO = {
  '/': {
    title: 'Number1 Exchange | شراء وبيع USDT | تبادل العملات الرقمية',
    description: 'اشتري وبيع USDT TRC20 بأفضل الأسعار في مصر. حول من فودافون كاش وإنستا باي واتصالات كاش إلى USDT وMoneyGo USD بسرعة وأمان.',
  },
  '/rates': {
    title: 'أسعار الصرف اليومية | Number1 Exchange',
    description: 'تحقق من أحدث أسعار صرف USDT مقابل الجنيه المصري والدولار في الوقت الفعلي على منصة Number1 Exchange.',
  },
  '/how-it-works': {
    title: 'كيف تعمل المنصة | Number1 Exchange',
    description: 'دليل خطوة بخطوة لشراء وبيع USDT وتحويل الأموال عبر منصة Number1 Exchange بكل سهولة.',
  },
  '/reviews': {
    title: 'آراء العملاء | Number1 Exchange',
    description: 'اقرأ تقييمات وآراء عملاء منصة Number1 Exchange حول تجربتهم في تبادل العملات الرقمية.',
  },
  '/contact': {
    title: 'تواصل معنا | Number1 Exchange',
    description: 'تواصل مع فريق دعم Number1 Exchange للحصول على المساعدة في عمليات تبادل USDT.',
  },
  '/faq': {
    title: 'الأسئلة الشائعة | Number1 Exchange',
    description: 'إجابات على الأسئلة الأكثر شيوعاً حول منصة Number1 Exchange وعمليات شراء وبيع USDT.',
  },
  '/about': {
    title: 'من نحن | Number1 Exchange',
    description: 'تعرف على منصة Number1 Exchange — المنصة الموثوقة لتبادل العملات الرقمية وشراء وبيع USDT في مصر.',
  },
  '/track': {
    title: 'تتبع طلبك | Number1 Exchange',
    description: 'تتبع حالة طلب التبادل الخاص بك على منصة Number1 Exchange في الوقت الفعلي.',
  },
  '/my-orders': {
    title: 'طلباتي | Number1 Exchange',
    description: 'عرض جميع طلبات التبادل الخاصة بك على منصة Number1 Exchange.',
  },
  '/wallet': {
    title: 'المحفظة | Number1 Exchange',
    description: 'أدر محفظتك الرقمية على منصة Number1 Exchange.',
  },
}

const PAGE_SEO_EN = {
  '/': {
    title: 'Number1 Exchange | Buy & Sell USDT | Digital Currency Exchange',
    description: 'Buy and sell USDT TRC20 at the best rates in Egypt. Exchange from Vodafone Cash, Instapay, and Etisalat Cash to USDT and MoneyGo USD quickly and securely.',
  },
  '/rates': {
    title: 'Daily Exchange Rates | Number1 Exchange',
    description: 'Check the latest USDT exchange rates against the Egyptian Pound and US Dollar in real-time on Number1 Exchange.',
  },
  '/how-it-works': {
    title: 'How It Works | Number1 Exchange',
    description: 'Step-by-step guide to buying and selling USDT and exchanging money via Number1 Exchange with ease.',
  },
  '/reviews': {
    title: 'Customer Reviews | Number1 Exchange',
    description: 'Read reviews and ratings from Number1 Exchange customers about their digital currency exchange experience.',
  },
  '/contact': {
    title: 'Contact Us | Number1 Exchange',
    description: 'Contact the Number1 Exchange support team for assistance with USDT exchanges.',
  },
  '/faq': {
    title: 'FAQ | Number1 Exchange',
    description: 'Answers to the most frequently asked questions about Number1 Exchange and USDT transactions.',
  },
  '/about': {
    title: 'About Us | Number1 Exchange',
    description: 'Learn about Number1 Exchange — the trusted platform for exchanging digital currencies and buying/selling USDT in Egypt.',
  },
  '/track': {
    title: 'Track Your Order | Number1 Exchange',
    description: 'Track the status of your exchange order on Number1 Exchange in real-time.',
  },
  '/my-orders': {
    title: 'My Orders | Number1 Exchange',
    description: 'View all your exchange orders on Number1 Exchange.',
  },
  '/wallet': {
    title: 'Wallet | Number1 Exchange',
    description: 'Manage your digital wallet on Number1 Exchange.',
  },
}

import Navbar         from './components/common/Navbar'
import Footer         from './components/common/Footer'
import AuthModal      from './components/common/AuthModal'
import SupportFAB     from './components/common/SupportFAB'
import { ReviewFloatingBtn } from './components/shared/ReviewPrompt'
import MobileBottomNav from './components/common/MobileBottomNav'

import Home       from './pages/Home'
import Rates      from './pages/Rates'
import HowItWorks from './pages/HowItWorks'
import Reviews    from './pages/Reviews'
import Contact    from './pages/Contact'
import FAQ        from './pages/FAQ'
import About      from './pages/About'
import OrderTrack from './pages/OrderTrack'
import NotFound   from './pages/NotFound'
import MyOrders from './pages/MyOrders'
import OrderConfirmPage from './pages/OrderConfirmPage'
import ExchangeFormPage from './pages/ExchangeFormPage'
import ExchangeOrder    from './pages/ExchangeOrder'
import WalletPage    from './pages/Wallet'
import AdminWallets  from './pages/admin/AdminWallets'

import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminOrders         from './pages/admin/AdminOrders'
import AdminRates          from './pages/admin/AdminRates'
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods'
import AdminUsers          from './pages/admin/AdminUsers'
import AdminSettings       from './pages/admin/AdminSettings'
import AdminDeposits   from './pages/admin/AdminDeposits'
import AdminLogin       from './pages/admin/AdminLogin'
import AdminAuditLogs   from './pages/admin/AdminAuditLogs'

import useAuth from './context/useAuth'
import useLang from './context/useLang'

import Terms   from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import AML     from './pages/legal/AML'
import Cookies from './pages/legal/Cookies'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'

// ── Return to Active Order Banner ──────────────────────────────
function ReturnToOrderBanner() {
  const [session, setSession] = useState(null)
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const { lang } = useLang()

 useEffect(() => {
  const sess = readOrderSession()
  if (!sess || getTimeRemaining(sess.expiresAt) <= 0) return

  // ✅ تحقق من حالة الطلب قبل إظهار البانر
  fetch(`${API}/api/orders/track/${sess.orderNumber}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) return
      const doneStatuses = ['completed', 'rejected', 'cancelled']
      if (doneStatuses.includes(data.order.status)) {
        // الطلب منتهي — امسح الجلسة ولا تُظهر البانر
        clearOrderSession()
        return
      }
      setSession(sess)
      setTimeLeft(getTimeRemaining(sess.expiresAt))
      setVisible(true)
    })
    .catch(() => {
      // في حالة فشل الاتصال، أظهر البانر بشكل احتياطي
      setSession(sess)
      setTimeLeft(getTimeRemaining(sess.expiresAt))
      setVisible(true)
    })
}, [])

  useEffect(() => {
    if (!session) return
    const id = setInterval(() => {
      const rem = getTimeRemaining(session.expiresAt)
      setTimeLeft(rem)
      if (rem <= 0) { setVisible(false); clearInterval(id) }
    }, 1000)
    return () => clearInterval(id)
  }, [session])

  if (!visible || !session) return null

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const fmt  = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  const isAr = lang === 'ar'

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px', borderRadius: 16,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(0,212,255,0.35)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'bannerSlideUp 0.4s ease',
      maxWidth: 'calc(100vw - 40px)',
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      <style>{`
        @keyframes bannerSlideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes bannerPulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
      <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', flexShrink:0,
        boxShadow:'0 0 8px var(--cyan)', animation:'bannerPulse 2s infinite' }} />
      <div>
        <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>{isAr ? 'طلب نشط' : 'ACTIVE ORDER'}</div>
        <div style={{ fontSize:'0.88rem', color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontWeight:600 }}>
          {isAr ? 'طلبك' : 'Your order'} <span style={{ color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace" }}>{session.orderNumber}</span>
          &nbsp;— <span style={{ color: timeLeft < 120 ? '#f43f5e' : '#f59e0b', fontFamily:"'JetBrains Mono',monospace" }}>{fmt}</span>
        </div>
      </div>
      <a href="/track" style={{
        padding:'7px 16px', background:'var(--cyan)', borderRadius:10,
        color:'#000', fontWeight:700, fontFamily:"'Tajawal',sans-serif",
        fontSize:'0.82rem', textDecoration:'none', flexShrink:0, whiteSpace:'nowrap'
      }}>{isAr ? 'تتبع الطلب' : 'Track Order'}</a>
      <button onClick={() => setVisible(false)} style={{
        background:'transparent', border:'none', color:'var(--text-3)',
        cursor:'pointer', padding:'2px 4px', fontSize:'1rem', lineHeight:1, flexShrink:0
      }}>×</button>
    </div>
  )
}

// ── Maintenance Page ───────────────────────────────────────
function MaintenancePage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', direction: isAr ? 'rtl' : 'ltr', padding: 24,
      textAlign: 'center', gap: 20,
    }}>
      <div style={{ fontSize: 64 }}>🔧</div>
      <h1 style={{
        fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.4rem,4vw,2rem)',
        fontWeight: 900, color: 'var(--cyan)', margin: 0,
      }}>
        {isAr ? 'المنصة تحت الصيانة' : 'Platform Under Maintenance'}
      </h1>
      <p style={{
        fontSize: '1rem', color: 'var(--text-3)', maxWidth: 400,
        fontFamily: "'Tajawal',sans-serif", lineHeight: 1.8, margin: 0,
      }}>
        {isAr ? 'نعمل على تحسين المنصة لخدمتك بشكل أفضل. يرجى المراجعة لاحقاً.' : 'We are improving the platform to serve you better. Please check back later.'}
      </p>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border-1)',
        borderRadius: 12, padding: '12px 24px',
        fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem',
        color: 'var(--text-3)',
      }}>
        NUMBER1 EXCHANGE — MAINTENANCE MODE
      </div>
    </div>
  )
}

// ── Admin Route Guard ──────────────────────────────────────
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

// ── App ────────────────────────────────────────────────────
function App() {
  const location    = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')
  const { user }    = useAuth()
  const { lang }    = useLang()
  const routeSeo = getRouteSeo(location.pathname)
  const pageSeo = isAdminPage
    ? {
        title: 'Admin | Number1 Exchange',
        description: 'Administrative area',
        canonical: toAbsoluteUrl(location.pathname),
        robots: 'noindex,nofollow',
      }
    : routeSeo

  // ── Update title + meta description on every route change ──
  useEffect(() => {
    if (pageSeo) {
      document.title = pageSeo.title
      let desc = document.querySelector('meta[name="description"]')
      if (desc) desc.setAttribute('content', pageSeo.description)
      let robots = document.querySelector('meta[name="robots"]')
      if (robots) robots.setAttribute('content', pageSeo.robots || 'index,follow')

      let canonical = document.querySelector('link[rel="canonical"]')
      if (canonical) canonical.setAttribute('href', pageSeo.canonical)

      let ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) ogTitle.setAttribute('content', pageSeo.ogTitle || pageSeo.title)

      let ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) ogDescription.setAttribute('content', pageSeo.ogDescription || pageSeo.description)

      let ogUrl = document.querySelector('meta[property="og:url"]')
      if (ogUrl) ogUrl.setAttribute('content', pageSeo.canonical)

      let ogImage = document.querySelector('meta[property="og:image"]')
      if (ogImage && pageSeo.ogImage) ogImage.setAttribute('content', pageSeo.ogImage)

      let twitterTitle = document.querySelector('meta[name="twitter:title"]')
      if (twitterTitle) twitterTitle.setAttribute('content', pageSeo.ogTitle || pageSeo.title)

      let twitterDescription = document.querySelector('meta[name="twitter:description"]')
      if (twitterDescription) twitterDescription.setAttribute('content', pageSeo.ogDescription || pageSeo.description)

      let twitterImage = document.querySelector('meta[name="twitter:image"]')
      if (twitterImage && pageSeo.ogImage) twitterImage.setAttribute('content', pageSeo.ogImage)
    }
  }, [pageSeo])

  const [authOpen,     setAuthOpen]     = useState(false)
  const [authTab,      setAuthTab]      = useState('login')
  const [maintenance,  setMaintenance]  = useState(false)
  const [siteSettings, setSiteSettings] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openAuth = (tab = 'login') => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  // ── جلب إعدادات المنصة ──────────────────────
  useEffect(() => {
    fetch(`${API}/api/public/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSiteSettings(data)
          setMaintenance(data.maintenanceMode || false)
        }
      })
      .catch(() => {})
  }, [])

  // ── وضع الصيانة — يظهر لكل شيء ماعدا الأدمن ──
  if (maintenance && !isAdminPage) {
    // الأدمن يقدر يدخل حتى في وضع الصيانة
    if (!user || user.role !== 'admin') {
      return <MaintenancePage />
    }
  }

  // ══════════════════════════════════════════
  // ADMIN
  // ══════════════════════════════════════════
  if (isAdminPage) {
    return (
      <>
        <Routes key={`admin-${lang}`}>
          <Route path="/admin"                 element={<AdminRoute><AdminDashboard      /></AdminRoute>} />
          <Route path="/admin/orders"          element={<AdminRoute><AdminOrders         /></AdminRoute>} />
          <Route path="/admin/rates"           element={<AdminRoute><AdminRates          /></AdminRoute>} />
          <Route path="/admin/payment-methods" element={<AdminRoute><AdminPaymentMethods /></AdminRoute>} />
          <Route path="/admin/users"           element={<AdminRoute><AdminUsers          /></AdminRoute>} />
          <Route path="/admin/settings"        element={<AdminRoute><AdminSettings       /></AdminRoute>} />
          <Route path="/admin/wallets"         element={<AdminRoute><AdminWallets /></AdminRoute>} />
          <Route path="/admin/deposits"        element={<AdminDeposits />} />
          <Route path="/admin/audit-logs"      element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
          <Route path="/admin/login"           element={<AdminLogin />} />
        </Routes>
      </>
    )
  }

  // ══════════════════════════════════════════
  // PUBLIC
  // ══════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAuth={openAuth}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="n1-main-pad" style={{ flex: 1 }}>
        <Routes key={`public-${lang}`}>
          <Route path="/"             element={<Home onOpenAuth={openAuth} />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/rates"        element={<Rates />}      />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/reviews"      element={<Reviews />}    />
          <Route path="/contact"      element={<Contact />}    />
          <Route path="/faq"          element={<FAQ />}        />
          <Route path="/about"        element={<About />}      />
          <Route path="/track"        element={<OrderTrack />} />
          <Route path="/terms"        element={<Terms />}      />
          <Route path="/privacy"      element={<Privacy />}    />
          <Route path="/aml"          element={<AML />}        />
          <Route path="/cookies"      element={<Cookies />}    />
          <Route path="*"             element={<NotFound />}   />
          <Route path="/my-orders"             element={<MyOrders />} />
          <Route path="/order-confirm"         element={<OrderConfirmPage />} />
          <Route path="/exchange/form"         element={<ExchangeFormPage />} />
          <Route path="/exchange/order/:orderId" element={<ExchangeOrder />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      <AuthModal isOpen={authOpen} type={authTab} onClose={() => setAuthOpen(false)} />
      <SupportFAB />
      <ReviewFloatingBtn />
      <ReturnToOrderBanner />
    </div>
  )
}

export default App
