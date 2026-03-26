// src/components/common/Footer.jsx
import { Link } from 'react-router-dom'
import useLang from '../../context/useLang'

function Footer() {
  const { t, lang } = useLang()

  const links = [
    { label: lang === 'ar' ? 'الرئيسية'    : 'Home',    to: '/'        },
    { label: lang === 'ar' ? 'الأسعار'     : 'Rates',   to: '/rates'   },
    { label: lang === 'ar' ? 'الأخبار'     : 'News',    to: '/news'    },
    { label: lang === 'ar' ? 'الدعم'       : 'Support', to: '/support' },
    { label: lang === 'ar' ? 'عن المنصة'   : 'About',   to: '/about'   },
  ]

  const legal = [
    { label: lang === 'ar' ? 'شروط الخدمة' : 'Terms',   to: '/terms'   },
    { label: lang === 'ar' ? 'الخصوصية'    : 'Privacy', to: '/privacy' },
    { label: 'AML',                                       to: '/aml'     },
    { label: lang === 'ar' ? 'الكوكيز'     : 'Cookies', to: '/cookies' },
  ]

  return (
    <footer style={{
      background: 'var(--footer-bg, var(--card))',
      borderTop: '1px solid var(--border-1)',
      padding: '50px 0 26px',
      marginTop: 60,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 22px' }}>

        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 38,
          marginBottom: 36,
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              textDecoration: 'none', marginBottom: 12,
            }}>
              <div style={{
                fontFamily: "'Orbitron',sans-serif", fontWeight: 900,
                fontSize: '2.1rem',
                background: 'linear-gradient(160deg,#00eeff,#008fb3)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 14px rgba(0,210,255,0.9))',
              }}>1</div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 3 }}>
                <span style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: '1.05rem',
                  fontWeight: 900, color: 'var(--cyan)', letterSpacing: 2,
                }}>NUMBER 1</span>
                <span style={{
                  fontSize: '0.6rem', color: 'var(--text-3)', letterSpacing: 3,
                  textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace",
                }}>EXCHANGE</span>
              </div>
            </Link>
            <p style={{
              fontSize: '0.82rem', color: 'var(--text-2)',
              lineHeight: 1.75, maxWidth: 290,
            }}>
              {t('footer_desc')}
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem',
              letterSpacing: 2, textTransform: 'uppercase',
              color: 'var(--text-3)', marginBottom: 15,
            }}>{t('footer_links')}</h4>
            {links.map((l, i) => (
              <Link key={i} to={l.to} style={{
                display: 'block', fontSize: '0.8rem', color: 'var(--text-2)',
                textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem',
              letterSpacing: 2, textTransform: 'uppercase',
              color: 'var(--text-3)', marginBottom: 15,
            }}>{t('footer_legal')}</h4>
            {legal.map((l, i) => (
              <Link key={i} to={l.to} style={{
                display: 'block', fontSize: '0.8rem', color: 'var(--text-2)',
                textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem',
              letterSpacing: 2, textTransform: 'uppercase',
              color: 'var(--text-3)', marginBottom: 15,
            }}>{t('footer_contact')}</h4>
            {[
              { label: 'support@number1.exchange' },
              { label: t('footer_chat') },
              { label: t('footer_tg') },
            ].map((l, i) => (
              <span key={i} style={{
                display: 'block', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: 8,
              }}>{l.label}</span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-1)', paddingTop: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.75rem', color: 'var(--text-3)',
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          <span>{t('footer_copy')} — ALL RIGHTS RESERVED</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer