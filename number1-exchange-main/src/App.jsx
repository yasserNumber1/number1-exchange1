// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

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

function applyPageSEO(pathname) {
  const seo = PAGE_SEO[pathname]
  if (!seo) return
  document.title = seo.title
  let desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', seo.description)
}

import Navbar         from './components/common/Navbar'
import Footer         from './components/common/Footer'
import AuthModal      from './components/common/AuthModal'
import SupportFAB     from './components/common/SupportFAB'
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
import ExchangeSelect   from './pages/ExchangeSelect'
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
import AdminDeposits from './pages/admin/AdminDeposits'
import AdminLogin    from './pages/admin/AdminLogin'

import useAuth from './context/useAuth'
import { readOrderSession, getTimeRemaining } from './services/orderSession'

import Terms   from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import AML     from './pages/legal/AML'
import Cookies from './pages/legal/Cookies'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Return to Active Order Banner ──────────────────────────────
function ReturnToOrderBanner() {
  const [session, setSession] = useState(null)
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const sess = readOrderSession()
    if (sess && getTimeRemaining(sess.expiresAt) > 0) {
      setSession(sess)
      setTimeLeft(getTimeRemaining(sess.expiresAt))
      setVisible(true)
    }
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
    }}>
      <style>{`
        @keyframes bannerSlideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes bannerPulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
      <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', flexShrink:0,
        boxShadow:'0 0 8px var(--cyan)', animation:'bannerPulse 2s infinite' }} />
      <div>
        <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>ACTIVE ORDER</div>
        <div style={{ fontSize:'0.88rem', color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontWeight:600 }}>
          طلبك <span style={{ color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace" }}>{session.orderNumber}</span>
          &nbsp;— <span style={{ color: timeLeft < 120 ? '#f43f5e' : '#f59e0b', fontFamily:"'JetBrains Mono',monospace" }}>{fmt}</span>
        </div>
      </div>
      <a href="/track" style={{
        padding:'7px 16px', background:'var(--cyan)', borderRadius:10,
        color:'#000', fontWeight:700, fontFamily:"'Tajawal',sans-serif",
        fontSize:'0.82rem', textDecoration:'none', flexShrink:0, whiteSpace:'nowrap'
      }}>تتبع الطلب</a>
      <button onClick={() => setVisible(false)} style={{
        background:'transparent', border:'none', color:'var(--text-3)',
        cursor:'pointer', padding:'2px 4px', fontSize:'1rem', lineHeight:1, flexShrink:0
      }}>×</button>
    </div>
  )
}

// ── Maintenance Page ───────────────────────────────────────
function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', direction: 'rtl', padding: 24,
      textAlign: 'center', gap: 20,
    }}>
      <div style={{ fontSize: 64 }}>🔧</div>
      <h1 style={{
        fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.4rem,4vw,2rem)',
        fontWeight: 900, color: 'var(--cyan)', margin: 0,
      }}>
        المنصة تحت الصيانة
      </h1>
      <p style={{
        fontSize: '1rem', color: 'var(--text-3)', maxWidth: 400,
        fontFamily: "'Tajawal',sans-serif", lineHeight: 1.8, margin: 0,
      }}>
        نعمل على تحسين المنصة لخدمتك بشكل أفضل.
        يرجى المراجعة لاحقاً.
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

  // ── Update title + meta description on every route change ──
  useEffect(() => { applyPageSEO(location.pathname) }, [location.pathname])

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
      <Routes>
        <Route path="/admin"                 element={<AdminRoute><AdminDashboard      /></AdminRoute>} />
        <Route path="/admin/orders"          element={<AdminRoute><AdminOrders         /></AdminRoute>} />
        <Route path="/admin/rates"           element={<AdminRoute><AdminRates          /></AdminRoute>} />
        <Route path="/admin/payment-methods" element={<AdminRoute><AdminPaymentMethods /></AdminRoute>} />
        <Route path="/admin/users"           element={<AdminRoute><AdminUsers          /></AdminRoute>} />
        <Route path="/admin/settings"        element={<AdminRoute><AdminSettings       /></AdminRoute>} />
        <Route path="/admin/wallets" element={<AdminRoute><AdminWallets /></AdminRoute>} />
        <Route path="/admin/deposits" element={<AdminDeposits />} />
        <Route path="/admin/login"    element={<AdminLogin />} />
      </Routes>
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
        <Routes>
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
          <Route path="/exchange"              element={<ExchangeSelect />} />
          <Route path="/exchange/form"         element={<ExchangeFormPage />} />
          <Route path="/exchange/order/:orderId" element={<ExchangeOrder />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      <AuthModal isOpen={authOpen} type={authTab} onClose={() => setAuthOpen(false)} />
      <SupportFAB />
      <ReturnToOrderBanner />
    </div>
  )
}

export default App