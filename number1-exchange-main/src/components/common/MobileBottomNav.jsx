// src/components/common/MobileBottomNav.jsx — App-style bottom bar (mobile & tablet only; hidden on desktop via CSS)
import { useNavigate, useLocation } from 'react-router-dom'
import useLang from '../../context/useLang'

const ICONS = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  rates: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  how: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 8 12 12 14 14" />
    </svg>
  ),
  reviews: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
}

export default function MobileBottomNav({ onOpenMenu }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const path = location.pathname

  const isActive = (p) => (p === '/' ? path === '/' : path.startsWith(p))

  const tabs = [
    { path: '/', key: 'home', icon: ICONS.home, labelAr: 'الرئيسية', labelEn: 'Home' },
    { path: '/rates', key: 'rates', icon: ICONS.rates, labelAr: 'الأسعار', labelEn: 'Rates' },
    { path: '/how-it-works', key: 'how', icon: ICONS.how, labelAr: 'كيف تعمل', labelEn: 'How' },
    { path: '/reviews', key: 'reviews', icon: ICONS.reviews, labelAr: 'التقييمات', labelEn: 'Reviews' },
  ]

  return (
    <nav className="n1-bottom-nav" aria-label={isAr ? 'التنقل السفلي' : 'Bottom navigation'}>
      <div className="n1-bottom-nav__inner">
        {tabs.map((t) => {
          const active = isActive(t.path)
          return (
            <button
              key={t.key}
              type="button"
              className={`n1-bottom-nav__item${active ? ' n1-bottom-nav__item--active' : ''}`}
              onClick={() => navigate(t.path)}
            >
              <span className="n1-bottom-nav__ico">{t.icon}</span>
              <span className="n1-bottom-nav__lbl">{isAr ? t.labelAr : t.labelEn}</span>
            </button>
          )
        })}
        <button type="button" className="n1-bottom-nav__item" onClick={() => onOpenMenu?.()}>
          <span className="n1-bottom-nav__ico">{ICONS.menu}</span>
          <span className="n1-bottom-nav__lbl">{isAr ? 'المزيد' : 'More'}</span>
        </button>
      </div>
    </nav>
  )
}
