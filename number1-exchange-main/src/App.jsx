// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

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
import WalletPage    from './pages/Wallet'
import AdminWallets  from './pages/admin/AdminWallets'

import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminOrders         from './pages/admin/AdminOrders'
import AdminRates          from './pages/admin/AdminRates'
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods'
import AdminUsers          from './pages/admin/AdminUsers'
import AdminSettings       from './pages/admin/AdminSettings'
import AdminDeposits from './pages/admin/AdminDeposits'

import useAuth from './context/useAuth'

import Terms   from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import AML     from './pages/legal/AML'
import Cookies from './pages/legal/Cookies'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// ── App ────────────────────────────────────────────────────
function App() {
  const location    = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')
  const { user }    = useAuth()

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
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      <AuthModal isOpen={authOpen} type={authTab} onClose={() => setAuthOpen(false)} />
      <SupportFAB />
    </div>
  )
}

export default App