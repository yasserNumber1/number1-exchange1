import { useEffect } from 'react'
import useLang from '../context/useLang'
import reviews from '../data/reviews.json'

const STATS = [
  {
    value: '10,000+',
    labelAr: 'صفقة منجزة',
    labelEn: 'Deals Completed',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>,
  },
  {
    value: '4.9/5',
    labelAr: 'متوسط التقييم',
    labelEn: 'Average Rating',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    value: '98%',
    labelAr: 'رضا العملاء',
    labelEn: 'Customer Satisfaction',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    value: '< 15m',
    labelAr: 'متوسط التحويل',
    labelEn: 'Average Transfer',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
]

const ACCENT_COLORS = ['#00b8d9', '#7c5cfc', '#f59e0b', '#00e5a0', '#f43f5e', '#06b6d4', '#a78bfa', '#34d399', '#fb923c', '#38bdf8']

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={star <= rating ? '#f59e0b' : 'none'}
          stroke={star <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review, idx, isEn }) {
  const col = ACCENT_COLORS[idx % ACCENT_COLORS.length]
  const name = isEn ? review.nameEn : review.nameAr
  const text = isEn ? review.textEn : review.textAr
  const date = isEn ? review.dateEn : review.dateAr

  return (
    <div
      style={{
        flexShrink: 0,
        width: 272,
        background: 'var(--card)',
        border: '1px solid var(--border-1)',
        borderRadius: 18,
        padding: '18px 18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        margin: '6px 8px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color .2s, box-shadow .2s',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = `${col}60`
        event.currentTarget.style.boxShadow = `0 8px 28px ${col}18`
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = 'var(--border-1)'
        event.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${col}90,transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${col},${col}77)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '.95rem', fontFamily: "'Tajawal',sans-serif", flexShrink: 0, boxShadow: `0 3px 10px ${col}44` }}>
          {name[0]}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'Tajawal',sans-serif", fontWeight: 700, fontSize: '.87rem', color: 'var(--text-1)' }}>{name}</span>
            <span style={{ fontSize: '.58rem', fontFamily: "'JetBrains Mono',monospace", color: col, background: `${col}18`, padding: '1px 5px', borderRadius: 4, border: `1px solid ${col}28` }}>{review.country}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Stars rating={review.rating} />
            <span style={{ fontSize: '.6rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{date}</span>
          </div>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '.83rem',
          color: 'var(--text-2)',
          lineHeight: 1.7,
          fontFamily: "'Tajawal',sans-serif",
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        "{text}"
      </p>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 7, background: `${col}12`, border: `1px solid ${col}28`, alignSelf: 'flex-start', marginTop: 'auto' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span style={{ fontSize: '.61rem', color: col, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{review.amount}</span>
      </div>
    </div>
  )
}

function CarouselTrack({ reviewsList, direction, isEn }) {
  const items = [...reviewsList, ...reviewsList, ...reviewsList, ...reviewsList]
  const duration = direction === 'left' ? '40s' : '48s'
  const animation = direction === 'left' ? 'scrollLeft' : 'scrollRight'

  return (
    <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 100, background: 'linear-gradient(90deg,var(--bg),transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 100, background: 'linear-gradient(-90deg,var(--bg),transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div className="rev-pauser" style={{ display: 'flex', width: 'max-content', animation: `${animation} ${duration} linear infinite`, willChange: 'transform' }}>
        {items.map((review, index) => (
          <ReviewCard key={`${direction}-${review.id}-${index}`} review={review} idx={review.id} isEn={isEn} />
        ))}
      </div>
    </div>
  )
}

export default function Reviews() {
  const { lang } = useLang()
  const isEn = lang === 'en'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const row1 = reviews.slice(0, 6)
  const row2 = reviews.slice(4)

  return (
    <div style={{ minHeight: '80vh', padding: '60px 0', direction: isEn ? 'ltr' : 'rtl', overflow: 'hidden' }}>
      <style>{`
        @keyframes scrollLeft  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes scrollRight { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        .rev-pauser:hover { animation-play-state: paused !important; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 18px', borderRadius: 20, border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.06)', marginBottom: 18 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} />
          <span style={{ fontSize: '.68rem', color: 'var(--cyan)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>
            {isEn ? 'CUSTOMER FEEDBACK' : 'آراء العملاء'}
          </span>
        </div>
        <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: 'var(--text-1)', margin: '0 0 14px' }}>
          {isEn ? 'Selected Customer Feedback' : 'آراء مختارة من العملاء'}
        </h1>
        <p style={{ fontSize: '.98rem', color: 'var(--text-3)', maxWidth: 560, margin: '0 auto', fontFamily: "'Tajawal',sans-serif", lineHeight: 1.8 }}>
          {isEn
            ? 'This page shows selected feedback shared by customers after completed exchanges. As public profiles on Trustpilot, Telegram, and other platforms grow, they can be linked here as additional proof.'
            : 'تعرض هذه الصفحة آراء مختارة شاركها العملاء بعد إتمام عمليات التبادل. ومع نمو التقييمات العامة على Trustpilot وتيليجرام والمنصات الأخرى يمكن ربطها هنا كدليل إضافي.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, padding: '0 24px', maxWidth: 960, margin: '0 auto 52px' }}>
        {STATS.map((stat) => (
          <div
            key={isEn ? stat.labelEn : stat.labelAr}
            style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '20px 14px', textAlign: 'center', transition: 'border-color .2s, transform .2s' }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
              event.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = 'var(--border-1)'
              event.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ color: 'var(--cyan)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1.25rem', fontWeight: 900, color: 'var(--cyan)', marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-3)', fontFamily: "'Tajawal',sans-serif" }}>{isEn ? stat.labelEn : stat.labelAr}</div>
          </div>
        ))}
      </div>

      <div className="reviews-carousel-row" style={{ marginBottom: 14 }}>
        <CarouselTrack reviewsList={row1} direction="left" isEn={isEn} />
      </div>

      <div className="reviews-carousel-row" style={{ marginBottom: 60 }}>
        <CarouselTrack reviewsList={row2} direction="right" isEn={isEn} />
      </div>
    </div>
  )
}
