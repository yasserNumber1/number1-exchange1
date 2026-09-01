// src/pages/Rates.jsx — Premium Rates UI
import { useState, useEffect, useRef } from 'react'
import useLang from '../context/useLang'
import { RATES_DATA } from '../data/currencies'
import { displayCurrencySymbol } from '../utils/currencyDisplay'

const COIN_COLORS = {
  BTC:'#f7931a', ETH:'#627eea', USDT:'#26a17b', MGO:'#e91e63',
  BNB:'#f0b90b', TON:'#0098ea', LTC:'#bfbbbb', XRP:'#00aae4',
  SOL:'#9945ff', ADA:'#0033ad',
}

const COIN_SYMBOLS = {
  BTC:'₿', ETH:'Ξ', USDT:'₮', MGO:'M', BNB:'B', TON:'T',
  LTC:'Ł', XRP:'X', SOL:'◎', ADA:'₳',
}

function MiniSparkline({ up, color }) {
  const pts = up
    ? "0,18 8,15 16,12 24,10 32,7 40,4 48,2"
    : "0,2  8,5  16,8  24,10 32,13 40,15 48,18"
  return (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon
        points={`${pts} 48,20 0,20`}
        fill={`url(#sg-${color.replace('#','')})`}
      />
      <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function RateCard({ rate, flashing }) {
  const [hov, setHov] = useState(false)
  const color = COIN_COLORS[rate.symbol] || '#00d2ff'
  const sym = COIN_SYMBOLS[rate.symbol] || rate.symbol[0]
  const priceStr = rate.price >= 1
    ? '$' + rate.price.toLocaleString('en', { maximumFractionDigits: 2 })
    : '$' + rate.price.toFixed(5)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(135deg,rgba(${hexToRgb(color)},0.08),rgba(${hexToRgb(color)},0.03))`
          : 'var(--card)',
        border: `1px solid ${hov ? color + '44' : 'var(--border-1)'}`,
        borderRadius: 18,
        padding: '18px 20px',
        transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? `0 16px 40px ${color}22, 0 4px 16px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow on flash */}
      {flashing && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: `radial-gradient(ellipse at center,${color}22 0%,transparent 70%)`,
          pointerEvents: 'none',
          animation: 'flashFade 0.5s ease forwards',
        }}/>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${color}22`,
            border: `1.5px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: '1rem', fontWeight: 800, color,
            flexShrink: 0,
            transition: 'transform 0.3s',
            transform: hov ? 'scale(1.1) rotate(-5deg)' : 'none',
          }}>
            {sym}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)' }}>{rate.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 1 }}>{displayCurrencySymbol(rate.symbol)}</div>
          </div>
        </div>
        <div style={{
          padding: '3px 9px', borderRadius: 20,
          fontSize: '0.65rem', fontWeight: 700,
          fontFamily: "'JetBrains Mono',monospace",
          background: rate.up ? 'rgba(0,229,160,0.1)' : 'rgba(255,61,90,0.1)',
          color: rate.up ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${rate.up ? 'rgba(0,229,160,0.25)' : 'rgba(255,61,90,0.25)'}`,
          transition: 'all 0.4s',
        }}>
          {rate.up ? '▲' : '▼'} {Math.abs(rate.change).toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: '1.25rem', fontWeight: 800,
        color: 'var(--text-1)',
        marginBottom: 10,
        transition: 'color 0.3s',
        letterSpacing: '-0.5px',
      }}>
        {priceStr}
      </div>

      {/* Sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <MiniSparkline up={rate.up} color={color} />
        <div style={{
          fontSize: '0.62rem', fontWeight: 700,
          fontFamily: "'JetBrains Mono',monospace",
          padding: '2px 7px', borderRadius: 6,
          background: 'rgba(0,229,160,0.08)',
          color: 'var(--green)',
          border: '1px solid rgba(0,229,160,0.15)',
        }}>
          LIVE
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

function MarketStat({ label, value, sub, color, icon }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card)',
        border: `1px solid ${hov ? 'rgba(0,210,255,0.3)' : 'var(--border-1)'}`,
        borderRadius: 16, padding: '20px 22px',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 10px 28px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 13,
        background: `${color}18`,
        border: `1.5px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'transform 0.3s',
        transform: hov ? 'scale(1.1)' : 'none',
        color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</div>
        {sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Rates() {
  const { t, lang } = useLang()
  const [rates, setRates] = useState(() =>
    RATES_DATA.map(r => ({ ...r, color: COIN_COLORS[r.symbol] || '#00d2ff', up: true }))
  )
  const [flashing, setFlashing] = useState({})
  const [filter, setFilter] = useState('all') // 'all' | 'gainers' | 'losers'
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setRates(prev => prev.map(r => {
        const d = (Math.random() - 0.5) * r.price * 0.006
        return { ...r, price: Math.max(0.0001, r.price + d), change: Math.abs(d / r.price * 100), up: d >= 0 }
      }))
      const f = {}
      RATES_DATA.forEach(r => { f[r.symbol] = true })
      setFlashing(f)
      setTick(p => p + 1)
      setTimeout(() => setFlashing({}), 500)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const filtered = rates.filter(r =>
    filter === 'gainers' ? r.up :
    filter === 'losers'  ? !r.up : true
  )

  const topGainer = [...rates].sort((a,b) => (b.up?1:-1)*b.change - (a.up?1:-1)*a.change)[0]
  const topLoser  = [...rates].sort((a,b) => (a.up?1:-1)*a.change - (b.up?1:-1)*b.change)[0]

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <style>{`
        @keyframes flashFade { 0%{opacity:1} 100%{opacity:0} }
        @keyframes ratesPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '55px 22px' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: "'JetBrains Mono',monospace", fontSize: '0.68rem',
            letterSpacing: 3, textTransform: 'uppercase', color: 'var(--cyan)',
            marginBottom: 12, padding: '4px 14px',
            border: '1px solid rgba(0,210,255,0.2)', borderRadius: 20,
            background: 'rgba(0,210,255,0.05)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'blink 1.5s ease-in-out infinite', display: 'inline-block', boxShadow: '0 0 8px var(--cyan)' }}/>
            {t('rates_badge')}
          </div>
          <h2 style={{ fontSize: 'clamp(1.55rem,2.8vw,2.3rem)', fontWeight: 900, marginBottom: 10 }}>
            {t('rates_title')}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', maxWidth: 480, margin: '0 auto' }}>
            {t('rates_desc')}
          </p>
        </div>

        {/* ── Market Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          <MarketStat
            label="TOP GAINER 24H"
            value={topGainer ? `${displayCurrencySymbol(topGainer.symbol)} +${topGainer.change.toFixed(2)}%` : '—'}
            sub={topGainer?.name}
            color="var(--green)"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
          />
          <MarketStat
            label="TOP LOSER 24H"
            value={topLoser ? `${displayCurrencySymbol(topLoser.symbol)} -${topLoser.change.toFixed(2)}%` : '—'}
            sub={topLoser?.name}
            color="var(--red)"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
          />
          <MarketStat
            label="MARKET VOL 24H"
            value="$2.4B"
            sub={lang==='ar'?'حجم السوق اليومي':'Daily market volume'}
            color="var(--cyan)"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h5"/><path d="M16 12h5"/><path d="M19 3v18"/></svg>}
          />
        </div>

        {/* ── Filters + Last update ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all',     label: lang==='ar'?'الكل':'All',    count: rates.length },
              { id: 'gainers', label: lang==='ar'?'صاعدة':'Gainers', count: rates.filter(r=>r.up).length },
              { id: 'losers',  label: lang==='ar'?'هابطة':'Losers',  count: rates.filter(r=>!r.up).length },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono',monospace", fontSize: '0.72rem', fontWeight: 700,
                  transition: 'all 0.2s',
                  background: filter===f.id ? 'var(--cyan)' : 'transparent',
                  color: filter===f.id ? '#000' : 'var(--text-3)',
                  border: `1px solid ${filter===f.id ? 'var(--cyan)' : 'var(--border-1)'}`,
                }}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'ratesPulse 1.5s ease-in-out infinite', display: 'inline-block' }}/>
            {lang==='ar'?'تحديث كل 3.5 ثانية':'Updates every 3.5s'} · {lang==='ar'?`تحديث رقم ${tick}`:`Update #${tick}`}
          </div>
        </div>

        {/* ── Grid of cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
          gap: 14,
          marginBottom: 28,
        }}>
          {filtered.map(r => (
            <RateCard key={r.symbol} rate={r} flashing={flashing[r.symbol]} />
          ))}
        </div>

        {/* ── Full table ── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border-1)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--cyan-dim)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, flex: 1 }}>{t('rates_table')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--green)', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.14)', padding: '3px 9px', borderRadius: 20 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'blink 1.5s ease-in-out infinite', display: 'inline-block' }}/>
              LIVE
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: 'rgba(0,210,255,0.03)' }}>
                  {[t('rates_col1'), t('rates_col2'), t('rates_col3'), 'SPARKLINE', t('rates_col4')].map((h, i) => (
                    <th key={i} style={{
                      padding: '11px 18px', borderBottom: '1px solid var(--border-1)',
                      textAlign: i === 0 ? 'right' : 'left',
                      fontSize: '0.68rem', color: 'var(--text-3)',
                      fontFamily: "'JetBrains Mono',monospace",
                      letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.map((r, idx) => {
                  const color = COIN_COLORS[r.symbol] || '#00d2ff'
                  const sym = COIN_SYMBOLS[r.symbol] || r.symbol[0]
                  return (
                    <tr key={r.symbol}
                      style={{
                        background: flashing[r.symbol] ? `${color}0a` : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        transition: 'background 0.4s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = flashing[r.symbol] ? `${color}0a` : idx%2===0?'transparent':'rgba(255,255,255,0.01)'}
                    >
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${color}22`, border: `1.5px solid ${color}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'JetBrains Mono',monospace", fontSize: '0.9rem',
                            fontWeight: 800, color, flexShrink: 0,
                          }}>{sym}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-1)' }}>{r.name}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>{displayCurrencySymbol(r.symbol)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '0.9rem', direction: 'ltr' }}>
                        {r.price >= 1 ? '$' + r.price.toLocaleString('en', { maximumFractionDigits: 2 }) : '$' + r.price.toFixed(5)}
                      </td>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: 20,
                          fontSize: '0.72rem', fontWeight: 700,
                          fontFamily: "'JetBrains Mono',monospace",
                          background: r.up ? 'rgba(0,229,160,0.1)' : 'rgba(255,61,90,0.1)',
                          color: r.up ? 'var(--green)' : 'var(--red)',
                          border: `1px solid ${r.up?'rgba(0,229,160,0.2)':'rgba(255,61,90,0.2)'}`,
                          transition: 'all 0.4s',
                        }}>
                          {r.up ? '▲' : '▼'} {Math.abs(r.change).toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <MiniSparkline up={r.up} color={color} />
                      </td>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: '0.68rem', fontFamily: "'JetBrains Mono',monospace",
                          background: 'rgba(0,229,160,0.08)',
                          color: 'var(--green)',
                          border: '1px solid rgba(0,229,160,0.18)',
                        }}>ACTIVE</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
