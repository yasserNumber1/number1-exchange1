// src/App.jsx
import { useState } from 'react'
import Ticker from './components/Ticker'
import Navbar from './components/Navbar'
import Home from './pages/Home'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleNavigate = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenAuth = (type) => {
    console.log('فتح نافذة:', type)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Ticker />
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage !== 'home' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '2rem', color: 'var(--cyan)' }}>
            صفحة {currentPage} — قريباً
          </h1>
        </div>
      )}
    </div>
  )
}

export default App