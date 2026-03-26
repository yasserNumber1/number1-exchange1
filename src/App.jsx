// src/App.jsx
import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Ticker     from './components/common/Ticker'
import Navbar     from './components/common/Navbar'
import AuthModal  from './components/common/AuthModal'
import SupportFAB from './components/common/SupportFAB'

// ✅ لا Footer هنا — كل صفحة تدير Footer خاص بها
import Home    from './pages/Home'
import Rates   from './pages/Rates'
import { News, Support, About } from './pages/OtherPages'

import Terms   from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import AML     from './pages/legal/AML'
import Cookies from './pages/legal/Cookies'

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab,  setAuthTab]  = useState('login')

  const openAuth = (tab = 'login') => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Ticker />
      <Navbar onOpenAuth={openAuth} />

      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/rates"   element={<Rates />} />
        <Route path="/news"    element={<News />} />
        <Route path="/support" element={<Support />} />
        <Route path="/about"   element={<About />} />

        <Route path="/terms"   element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/aml"     element={<AML />} />
        <Route path="/cookies" element={<Cookies />} />
      </Routes>

      <AuthModal
        isOpen={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
      />

      <SupportFAB />
    </div>
  )
}

export default App