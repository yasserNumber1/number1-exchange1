// src/components/common/Footer.jsx — Enhanced v2
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useLang from '../../context/useLang'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Footer() {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'

  const [contacts, setContacts] = useState({ telegram: '', whatsapp: '', email: '' })
  useEffect(() => {
    fetch(`${API}/api/public/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setContacts({
            telegram: d.data.contactTelegram || '',
            whatsapp: d.data.contactWhatsapp?.replace(/\D/g, '') || '',
            email:    d.data.contactEmail    || 'support@number1.exchange',
          })
        }
      })
      .catch(() => {})
  }, [])

  const companyLinks = [
    { label: isAr ? 'من نحن'          : 'About Us',     path: '/about'        },
    { label: isAr ? 'كيف تعمل'        : 'How It Works', path: '/how-it-works' },
    { label: isAr ? 'التقييمات'       : 'Reviews',      path: '/reviews'      },
    { label: isAr ? 'تواصل معنا'      : 'Contact Us',   path: '/contact'      },
    { label: isAr ? 'الأسئلة الشائعة' : 'FAQ',          path: '/faq'          },
  ]

  const legalLinks = [
    { label: isAr ? 'شروط الخدمة'    : 'Terms of Service', path: '/terms'   },
    { label: isAr ? 'سياسة الخصوصية' : 'Privacy Policy',   path: '/privacy' },
    { label: 'AML / KYC Policy',                             path: '/aml'     },
    { label: isAr ? 'سياسة الكوكيز'  : 'Cookie Policy',    path: '/cookies' },
  ]

  const supportLinks = [
    { label: isAr ? 'الأسعار'     : 'Rates',       path: '/rates'   },
    { label: isAr ? 'تتبع الطلب'  : 'Track Order', path: '/track'   },
    { label: isAr ? 'الدعم الفني' : 'Help Center', path: '/contact' },
  ]

  const socials = [
    {
      label: 'Telegram',
      href: contacts.telegram ? `https://t.me/${contacts.telegram.replace(/^@/, '')}` : '#',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: contacts.whatsapp ? `https://wa.me/${contacts.whatsapp}` : '#',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      href: `mailto:${contacts.email}`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ]

  const LinkItem = ({ label, path }) => (
    <button
      onClick={() => navigate(path)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        width: '100%', textAlign: isAr ? 'right' : 'left',
        background: 'none', border: 'none',
        fontSize: '0.82rem', color: 'var(--text-3)',
        cursor: 'pointer', padding: '4px 0',
        fontFamily: "'Tajawal',sans-serif",
        transition: 'color 0.18s',
        marginBottom: 4,
        justifyContent: isAr ? 'flex-start' : 'flex-start',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--cyan)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)' }}
    >
      <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" style={{ flexShrink: 0, opacity: 0.5 }}>
        <circle cx="3" cy="3" r="3" />
      </svg>
      {label}
    </button>
  )

  const ColTitle = ({ text }) => (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: '0.6rem', letterSpacing: 2.5,
        textTransform: 'uppercase', color: 'var(--cyan)',
        margin: 0, marginBottom: 10,
      }}>
        {text}
      </h4>
      <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(0,212,255,0.3), transparent)' }} />
    </div>
  )

  return (
    <>
      <style>{`
        .footer-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 9px;
          border: 1px solid var(--border-1);
          color: var(--text-3); background: transparent;
          text-decoration: none;
          transition: all 0.2s;
        }
        .footer-social-btn:hover {
          border-color: var(--cyan);
          color: var(--cyan);
          background: rgba(0,212,255,0.05);
          transform: translateY(-2px);
        }
        .footer-bottom-link {
          background: none; border: none;
          color: var(--text-3); font-size: 0.7rem;
          cursor: pointer; padding: 0;
          font-family: 'JetBrains Mono', monospace;
          transition: color 0.18s; letter-spacing: 0.5px;
        }
        .footer-bottom-link:hover { color: var(--cyan); }

        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <footer className="n1-site-footer" style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border-1)',
        padding: '52px 0 24px',
        direction: isAr ? 'rtl' : 'ltr',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>

          {/* Grid */}
          <div className="footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 44,
            marginBottom: 44,
          }}>

            {/* Brand */}
            <div className="footer-brand">
              {/* Logo */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', width: 'fit-content' }}
                onClick={() => navigate('/')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(118,36,194,0.2))',
                  border: '1px solid rgba(0,212,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                  fontWeight: 700, color: 'var(--cyan)',
                }}>N1</div>
                <div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1rem', fontWeight: 900, color: 'var(--cyan)', letterSpacing: 2 }}>NUMBER 1</div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 3 }}>EXCHANGE</div>
                </div>
              </div>

              <p style={{
                fontSize: '0.81rem', color: 'var(--text-3)',
                lineHeight: 1.85, margin: '0 0 20px',
                maxWidth: 250, fontFamily: "'Tajawal',sans-serif",
              }}>
                {t('footer_desc')}
              </p>

              {/* Socials */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="footer-social-btn" title={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Trust badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20,
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.15)',
                fontSize: '0.65rem', color: '#4ade80',
                fontFamily: "'JetBrains Mono',monospace",
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.6)' }} />
                {isAr ? 'معتمد ومرخص' : 'LICENSED & REGULATED'}
              </div>
            </div>

            {/* Company */}
            <div>
              <ColTitle text={isAr ? 'الشركة' : 'Company'} />
              {companyLinks.map(l => <LinkItem key={l.path} {...l} />)}
            </div>

            {/* Legal */}
            <div>
              <ColTitle text={isAr ? 'قانوني' : 'Legal'} />
              {legalLinks.map(l => <LinkItem key={l.path} {...l} />)}
            </div>

            {/* Support */}
            <div>
              <ColTitle text={isAr ? 'الدعم' : 'Support'} />
              {supportLinks.map(l => <LinkItem key={l.path} {...l} />)}

              {/* Support card */}
              <div style={{
                marginTop: 16,
                padding: '12px 14px', borderRadius: 10,
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.12)',
              }}>
                <div style={{
                  fontSize: '0.6rem', color: 'var(--cyan)',
                  fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  {isAr ? 'البريد الإلكتروني' : 'SUPPORT EMAIL'}
                </div>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--text-2)',
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  {contacts.email}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border-1) 20%, var(--border-1) 80%, transparent)',
            marginBottom: 20,
          }} />

          {/* Bottom bar */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{
              fontSize: '0.68rem', color: 'var(--text-3)',
              fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: 0.4,
            }}>
              {t('footer_copy')} — ALL RIGHTS RESERVED
            </span>

            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              {[
                { label: isAr ? 'الشروط' : 'Terms',     path: '/terms'   },
                { label: isAr ? 'الخصوصية' : 'Privacy', path: '/privacy' },
                { label: 'AML',                           path: '/aml'     },
                { label: isAr ? 'الكوكيز' : 'Cookies',  path: '/cookies' },
              ].map((l, i, arr) => (
                <span key={l.path} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button className="footer-bottom-link" onClick={() => navigate(l.path)}>
                    {l.label}
                  </button>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'var(--border-1)', fontSize: '0.7rem', userSelect: 'none' }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}

export default Footer
