// src/pages/OtherPages.jsx — Premium News + Support + About
import { useState, useEffect, useRef } from 'react'
import useLang from '../context/useLang'
import { NEWS, FAQS } from '../data/currencies'

// ── Icon map ──
const ICONS = {
  trend:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  shield:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  rocket:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>,
  exchange: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  globe:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  lock:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  chart:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
}

const TAG_COLORS = {
  MARKET:   { bg:'rgba(247,147,26,0.12)',  border:'rgba(247,147,26,0.3)',  color:'#f7931a' },
  SECURITY: { bg:'rgba(0,229,160,0.1)',    border:'rgba(0,229,160,0.28)', color:'var(--green)' },
  UPDATE:   { bg:'rgba(124,92,252,0.12)',  border:'rgba(124,92,252,0.3)', color:'#a78bfa' },
  EXCHANGE: { bg:'rgba(0,210,255,0.1)',    border:'rgba(0,210,255,0.28)', color:'var(--cyan)' },
  EXPANSION:{ bg:'rgba(99,102,241,0.12)', border:'rgba(99,102,241,0.3)', color:'#818cf8' },
  REPORT:   { bg:'rgba(200,168,75,0.12)', border:'rgba(200,168,75,0.3)', color:'var(--gold)' },
}

function getTagColor(tagEn) {
  return TAG_COLORS[tagEn] || { bg:'rgba(0,210,255,0.1)', border:'rgba(0,210,255,0.25)', color:'var(--cyan)' }
}

// ══ Article Modal ══
function ArticleModal({ article, onClose }) {
  const { lang } = useLang()
  useEffect(() => {
    if (!article) return
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [article, onClose])
  if (!article) return null
  const tc = getTagColor(article.tagEn)
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(12px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border-2)', borderRadius:24, width:'100%', maxWidth:600, maxHeight:'82vh', overflow:'hidden', display:'flex', flexDirection:'column', position:'relative', boxShadow:'0 40px 100px rgba(0,0,0,0.7)', animation:'modalIn 0.3s cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${tc.color},transparent)` }}/>
        <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'flex-start', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:tc.bg, border:`1px solid ${tc.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:tc.color, flexShrink:0 }}>
            {ICONS[article.icon]}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 10px', borderRadius:20, background:tc.bg, border:`1px solid ${tc.border}`, fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace", color:tc.color, marginBottom:7 }}>
              {lang==='ar' ? article.tagAr : article.tagEn}
            </div>
            <div style={{ fontSize:'1.02rem', fontWeight:800, lineHeight:1.4, color:'var(--text-1)' }}>{lang==='ar' ? article.titleAr : article.titleEn}</div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:6 }}>{article.date}</div>
          </div>
          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:9, background:'transparent', border:'1px solid var(--border-1)', color:'var(--text-2)', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', flexShrink:0 }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,61,90,0.1)'; e.currentTarget.style.color='var(--red)' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)' }}><svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg></button>
        </div>
        <div style={{ padding:'20px 24px', overflowY:'auto', fontSize:'0.92rem', color:'var(--text-2)', lineHeight:1.9 }}>
          {lang==='ar' ? article.bodyAr : article.bodyEn}
        </div>
      </div>
    </div>
  )
}

// ══ News Featured Card (large) ══
function NewsFeatured({ article, onClick }) {
  const { lang } = useLang()
  const [hov, setHov] = useState(false)
  const tc = getTagColor(article.tagEn)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        gridColumn: 'span 2', background:'var(--card)',
        border:`1px solid ${hov ? tc.color+'55' : 'var(--border-1)'}`,
        borderRadius: 22, overflow:'hidden', cursor:'pointer',
        transition:'all 0.3s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-5px)' : 'none',
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px ${tc.color}22` : '0 4px 16px rgba(0,0,0,0.15)',
        display:'flex', flexDirection:'column',
        position:'relative',
      }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${tc.color},transparent)`, opacity: hov ? 1 : 0, transition:'opacity 0.3s' }}/>
      {/* Banner */}
      <div style={{
        height:160, display:'flex', alignItems:'center', justifyContent:'center',
        background:`linear-gradient(135deg,${tc.color}22 0%,rgba(0,0,0,0) 60%)`,
        borderBottom:'1px solid var(--border-1)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          width:80, height:80, borderRadius:22,
          background: tc.bg, border:`2px solid ${tc.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: tc.color,
          transition:'transform 0.4s cubic-bezier(.22,1,.36,1)',
          transform: hov ? 'scale(1.18) rotate(-6deg)' : 'scale(1) rotate(0)',
        }}>
          <span style={{ transform:'scale(2.2)', display:'block' }}>{ICONS[article.icon]}</span>
        </div>
        <div style={{ position:'absolute', top:14, right:14 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, background:tc.bg, border:`1px solid ${tc.border}`, fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace", color:tc.color, fontWeight:700 }}>
            <svg width='10' height='10' viewBox='0 0 24 24' fill='currentColor' stroke='none'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg> {lang==='ar'?'مميز':'FEATURED'}
          </span>
        </div>
      </div>
      <div style={{ padding:'20px 22px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:tc.bg, border:`1px solid ${tc.border}`, fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace", color:tc.color, marginBottom:10 }}>
          {lang==='ar' ? article.tagAr : article.tagEn}
        </div>
        <h3 style={{ fontSize:'1.02rem', fontWeight:800, lineHeight:1.4, marginBottom:8, color:'var(--text-1)' }}>
          {lang==='ar' ? article.titleAr : article.titleEn}
        </h3>
        <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.7, marginBottom:12 }}>
          {lang==='ar' ? article.bodyAr.slice(0,120)+'...' : article.bodyEn.slice(0,120)+'...'}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{article.date}</span>
          <span style={{ fontSize:'0.75rem', fontWeight:700, color:tc.color, display:'flex', alignItems:'center', gap:4, transition:'gap 0.2s', gap: hov ? 8 : 4 }}>
            {lang==='ar'?'اقرأ المزيد':'Read More'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </div>
    </div>
  )
}

// ══ News Small Card ══
function NewsCard({ article, onClick }) {
  const { lang } = useLang()
  const [hov, setHov] = useState(false)
  const tc = getTagColor(article.tagEn)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background:'var(--card)',
        border:`1px solid ${hov ? tc.color+'44' : 'var(--border-1)'}`,
        borderRadius:18, overflow:'hidden', cursor:'pointer',
        transition:'all 0.3s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 14px 36px rgba(0,0,0,0.3)` : 'none',
        display:'flex', flexDirection:'column',
      }}>
      <div style={{
        height:90, display:'flex', alignItems:'center', justifyContent:'center',
        background:`linear-gradient(135deg,${tc.color}15,rgba(0,0,0,0))`,
        borderBottom:'1px solid var(--border-1)',
      }}>
        <div style={{
          width:50, height:50, borderRadius:14,
          background:tc.bg, border:`1.5px solid ${tc.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:tc.color,
          transition:'transform 0.35s',
          transform: hov ? 'scale(1.15) rotate(-4deg)' : 'none',
        }}>
          <span style={{ transform:'scale(1.4)', display:'block' }}>{ICONS[article.icon]}</span>
        </div>
      </div>
      <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'inline-flex', marginBottom:8 }}>
          <span style={{ padding:'2px 9px', borderRadius:20, background:tc.bg, border:`1px solid ${tc.border}`, fontSize:'0.6rem', fontFamily:"'JetBrains Mono',monospace", color:tc.color, fontWeight:700 }}>
            {lang==='ar' ? article.tagAr : article.tagEn}
          </span>
        </div>
        <h4 style={{ fontSize:'0.84rem', fontWeight:700, lineHeight:1.45, marginBottom:8, color:'var(--text-1)', flex:1 }}>
          {lang==='ar' ? article.titleAr : article.titleEn}
        </h4>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto' }}>
          <span style={{ fontSize:'0.62rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{article.date}</span>
          <span style={{ fontSize:'0.68rem', color:tc.color, fontWeight:700, opacity: hov ? 1 : 0.5, transition:'opacity 0.2s' }}>
            {lang==='ar'?'عرض ←':'View →'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ══ NEWS PAGE — Premium Redesign ══
export function News() {
  const { t, lang } = useLang()
  const [selected, setSelected] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const featured = NEWS[0]
  const rest = NEWS.slice(1)
  const filters = ['ALL','MARKET','SECURITY','UPDATE','EXCHANGE','EXPANSION','REPORT']
  const filterLabels = { ALL: lang==='ar'?'الكل':'All', MARKET: lang==='ar'?'السوق':'Market', SECURITY: lang==='ar'?'الأمان':'Security', UPDATE: lang==='ar'?'تحديثات':'Updates', EXCHANGE: lang==='ar'?'تبادل':'Exchange', EXPANSION: lang==='ar'?'توسع':'Expansion', REPORT: lang==='ar'?'تقارير':'Reports' }
  const filteredRest = activeFilter === 'ALL' ? rest : rest.filter(a => a.tagEn === activeFilter)

  return (
    <div style={{ position:'relative', zIndex:2 }} data-testid="news-page">
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
        @keyframes newsHeroGlow { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes newsLiveScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes newsFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,229,160,0.4)} 50%{box-shadow:0 0 0 6px rgba(0,229,160,0)} }
      `}</style>

      {/* ══ HERO SECTION ══ */}
      <div data-testid="news-hero" style={{ position:'relative', overflow:'hidden', padding:'70px 22px 50px', textAlign:'center' }}>
        {/* Background ambient glow */}
        <div style={{ position:'absolute', top:'-30%', left:'20%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(0,210,255,0.06),transparent 65%)', pointerEvents:'none', animation:'newsHeroGlow 6s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'10%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(124,92,252,0.04),transparent 65%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', maxWidth:700, margin:'0 auto' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:'0.68rem', letterSpacing:3, textTransform:'uppercase', color:'var(--cyan)', marginBottom:16, padding:'5px 16px', border:'1px solid rgba(0,210,255,0.2)', borderRadius:50, background:'rgba(0,210,255,0.05)', animation:'newsFadeUp 0.5s ease both' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', animation:'blink 1.5s ease-in-out infinite', display:'inline-block', boxShadow:'0 0 8px var(--cyan)' }}/>
            {t('news_badge')}
          </div>

          {/* Title */}
          <h1 data-testid="news-title" style={{ fontSize:'clamp(1.6rem,4vw,3rem)', fontWeight:900, marginBottom:14, lineHeight:1.2, animation:'newsFadeUp 0.5s 0.1s ease both', background:'linear-gradient(135deg,var(--text-1),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', overflowWrap:'break-word', wordBreak:'break-word' }}>
            {t('news_title')}
          </h1>

          {/* Description */}
          <p style={{ color:'var(--text-2)', fontSize:'0.95rem', maxWidth:480, margin:'0 auto 28px', lineHeight:1.75, animation:'newsFadeUp 0.5s 0.2s ease both' }}>
            {lang==='ar'?'آخر المستجدات والتحديثات من عالم العملات الرقمية والأسواق المالية':'Latest updates from the digital currency world and financial markets'}
          </p>

          {/* Stats row */}
          <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap', animation:'newsFadeUp 0.5s 0.3s ease both' }}>
            {[
              { num: '6+', labelAr:'مقال جديد', labelEn:'New Articles' },
              { num: 'LIVE', labelAr:'تحديث مباشر', labelEn:'Live Updates' },
              { num: '24/7', labelAr:'تغطية مستمرة', labelEn:'Coverage' },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.2rem', fontWeight:900, color:'var(--cyan)', marginBottom:2 }}>{s.num}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{lang==='ar'?s.labelAr:s.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ LIVE NEWS TICKER ══ */}
      <div data-testid="news-live-ticker" style={{ margin:'0 22px 32px', padding:'12px 18px', background:'rgba(0,229,160,0.04)', border:'1px solid rgba(0,229,160,0.12)', borderRadius:14, display:'flex', alignItems:'center', gap:14, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0, padding:'4px 12px', background:'rgba(0,229,160,0.08)', borderRadius:8, border:'1px solid rgba(0,229,160,0.15)' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'livePulse 2s ease-in-out infinite' }}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.7rem', color:'var(--green)', fontWeight:700, letterSpacing:1.5 }}>LIVE</span>
        </div>
        <div style={{ flex:1, overflow:'hidden', WebkitMaskImage:'linear-gradient(to right,transparent,black 6%,black 94%,transparent)', maskImage:'linear-gradient(to right,transparent,black 6%,black 94%,transparent)' }}>
          <div style={{ display:'flex', gap:40, animation:'newsLiveScroll 35s linear infinite', width:'max-content' }}>
            {[...NEWS, ...NEWS, ...NEWS].map((a, i) => {
              const tc = getTagColor(a.tagEn)
              return (
                <span key={i} style={{ fontSize:'0.74rem', color:'var(--text-2)', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, transition:'color 0.2s' }}
                  onClick={() => setSelected(a)}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text-1)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text-2)'}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:tc.color, display:'inline-block', flexShrink:0 }}/>
                  <span style={{ color:tc.color, fontSize:'0.6rem', fontWeight:700 }}>{lang==='ar' ? a.tagAr : a.tagEn}</span>
                  {lang==='ar' ? a.titleAr : a.titleEn}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 22px 60px' }}>

        {/* ══ FEATURED ARTICLE (Large Hero Card) ══ */}
        <div data-testid="news-featured-article" onClick={() => setSelected(featured)} style={{ marginBottom:32, cursor:'pointer', position:'relative', borderRadius:24, overflow:'hidden', background:'var(--card)', border:'1px solid var(--border-1)', transition:'all 0.4s cubic-bezier(.22,1,.36,1)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,210,255,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 24px 60px rgba(0,0,0,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-1)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
          {/* Top gradient */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${getTagColor(featured.tagEn).color},transparent)`, zIndex:1 }}/>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:280 }}>
            {/* Left side: icon area */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${getTagColor(featured.tagEn).color}12,rgba(0,0,0,0))`, position:'relative' }}>
              <div style={{ width:120, height:120, borderRadius:28, background:getTagColor(featured.tagEn).bg, border:`2px solid ${getTagColor(featured.tagEn).border}`, display:'flex', alignItems:'center', justifyContent:'center', color:getTagColor(featured.tagEn).color }}>
                <span style={{ transform:'scale(3.5)', display:'block' }}>{ICONS[featured.icon]}</span>
              </div>
              <div style={{ position:'absolute', top:20, right:20 }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 14px', borderRadius:50, background:getTagColor(featured.tagEn).bg, border:`1px solid ${getTagColor(featured.tagEn).border}`, fontSize:'0.65rem', fontFamily:"'JetBrains Mono',monospace", color:getTagColor(featured.tagEn).color, fontWeight:700 }}>
                  {lang==='ar'?'مميز':'FEATURED'}
                </span>
              </div>
            </div>
            {/* Right side: content */}
            <div style={{ padding:'32px 28px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ display:'inline-flex', marginBottom:12 }}>
                <span style={{ padding:'3px 11px', borderRadius:50, background:getTagColor(featured.tagEn).bg, border:`1px solid ${getTagColor(featured.tagEn).border}`, fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace", color:getTagColor(featured.tagEn).color, fontWeight:700 }}>
                  {lang==='ar' ? featured.tagAr : featured.tagEn}
                </span>
              </div>
              <h2 style={{ fontSize:'clamp(1.1rem,2vw,1.5rem)', fontWeight:900, lineHeight:1.4, marginBottom:12, color:'var(--text-1)' }}>
                {lang==='ar' ? featured.titleAr : featured.titleEn}
              </h2>
              <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.8, marginBottom:16, flex:1 }}>
                {lang==='ar' ? featured.bodyAr : featured.bodyEn}
              </p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{featured.date}</span>
                <span style={{ fontSize:'0.8rem', fontWeight:700, color:getTagColor(featured.tagEn).color, display:'flex', alignItems:'center', gap:6 }}>
                  {lang==='ar'?'اقرأ المزيد':'Read More'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ FILTER TABS ══ */}
        <div data-testid="news-filters" style={{ display:'flex', gap:6, marginBottom:24, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {filters.filter(f => f === 'ALL' || rest.some(a => a.tagEn === f)).map(f => {
            const isActive = activeFilter === f
            const tc = f === 'ALL' ? { color:'var(--cyan)', bg:'rgba(0,210,255,0.08)', border:'rgba(0,210,255,0.2)' } : getTagColor(f)
            return (
              <button key={f} onClick={() => setActiveFilter(f)} data-testid={`news-filter-${f}`}
                style={{
                  padding:'6px 16px', borderRadius:50, border:`1px solid ${isActive ? tc.border || tc.color+'44' : 'var(--border-1)'}`,
                  background: isActive ? (tc.bg || tc.color+'15') : 'transparent',
                  color: isActive ? (tc.color || 'var(--cyan)') : 'var(--text-3)',
                  fontFamily:"'Tajawal',sans-serif", fontSize:'0.78rem', fontWeight:700,
                  cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap', flexShrink:0,
                }}>
                {filterLabels[f]}
              </button>
            )
          })}
        </div>

        {/* ══ NEWS GRID ══ */}
        <div className="news-grid" data-testid="news-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
          {filteredRest.map((a,i) => (
            <NewsCard key={`${a.tagEn}-${i}`} article={a} onClick={() => setSelected(a)} />
          ))}
        </div>

        {filteredRest.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto 16px', display:'block', opacity:0.3 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <div style={{ fontSize:'0.9rem', fontWeight:700 }}>{lang==='ar' ? 'لا توجد أخبار في هذا التصنيف' : 'No articles in this category'}</div>
          </div>
        )}

      </div>
      <ArticleModal article={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

// ══ Support Contact Card ══
function ContactCard({ icon, img, title, desc, badge, badgeColor, action, actionLabel }) {
  const [hov, setHov] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'linear-gradient(135deg,rgba(0,210,255,0.06),rgba(0,210,255,0.02))' : 'var(--card)',
        border:`1px solid ${hov ? 'rgba(0,210,255,0.35)' : 'var(--border-1)'}`,
        borderRadius:20, padding:'28px 24px',
        display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
        cursor:'pointer', transition:'all 0.3s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-6px)' : 'none',
        boxShadow: hov ? '0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,210,255,0.1)' : '0 2px 8px rgba(0,0,0,0.1)',
        position:'relative', overflow:'hidden',
      }}
      onClick={action}
    >
      {/* Glow */}
      <div style={{ position:'absolute', top:-40, left:'50%', transform:'translateX(-50%)', width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,210,255,0.15) 0%,transparent 70%)', pointerEvents:'none', opacity: hov ? 1 : 0, transition:'opacity 0.3s' }}/>

      {/* Icon circle */}
      <div style={{
        width:76, height:76, borderRadius:22, overflow:'hidden',
        background: hov ? 'rgba(0,210,255,0.12)' : 'var(--cyan-dim)',
        border:`1.5px solid ${hov ? 'rgba(0,210,255,0.4)' : 'rgba(0,210,255,0.15)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:16, transition:'all 0.4s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'scale(1.1) rotate(-5deg)' : 'none',
        flexShrink:0,
      }}>
        {img && !imgErr
          ? <img src={img} alt={title} onError={() => setImgErr(true)} style={{ width:'68%', height:'68%', objectFit:'contain' }}/>
          : <span style={{ color:'var(--cyan)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</span>
        }
      </div>

      {badge && (
        <span style={{ position:'absolute', top:16, right:16, padding:'2px 9px', borderRadius:20, background:`${badgeColor}22`, border:`1px solid ${badgeColor}44`, fontSize:'0.6rem', fontFamily:"'JetBrains Mono',monospace", color:badgeColor, fontWeight:700 }}>
          {badge}
        </span>
      )}

      <h3 style={{ fontSize:'1rem', fontWeight:800, marginBottom:8, color:'var(--text-1)' }}>{title}</h3>
      <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.7, marginBottom:18, flex:1 }}>{desc}</p>

      <div style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'9px 20px', borderRadius:12,
        background: hov ? 'var(--cyan)' : 'rgba(0,210,255,0.08)',
        border:`1px solid ${hov ? 'var(--cyan)' : 'rgba(0,210,255,0.2)'}`,
        color: hov ? '#000' : 'var(--cyan)',
        fontSize:'0.8rem', fontWeight:700,
        transition:'all 0.25s',
      }}>
        {actionLabel}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </div>
  )
}

// ══ FAQ Item ══
function FaqItem({ q, a, open, onToggle, index }) {
  return (
    <div style={{ borderBottom:'1px solid var(--border-1)' }}>
      <div
        onClick={onToggle}
        style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'17px 4px', cursor:'pointer', userSelect:'none',
          transition:'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-1)'}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:26, height:26, borderRadius:8, flexShrink:0,
            background: open ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${open ? 'rgba(0,210,255,0.3)' : 'var(--border-1)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'JetBrains Mono',monospace", fontSize:'0.68rem',
            fontWeight:700, color: open ? 'var(--cyan)' : 'var(--text-3)',
            transition:'all 0.25s',
          }}>
            {String(index+1).padStart(2,'0')}
          </div>
          <span style={{ fontWeight:700, fontSize:'0.92rem' }}>{q}</span>
        </div>
        <div style={{
          width:28, height:28, borderRadius:8, flexShrink:0,
          background: open ? 'rgba(0,210,255,0.12)' : 'transparent',
          border:`1px solid ${open ? 'rgba(0,210,255,0.3)' : 'var(--border-1)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: open ? 'var(--cyan)' : 'var(--text-3)',
          transition:'all 0.25s',
          transform: open ? 'rotate(45deg)' : 'none',
          marginRight:12,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      </div>
      <div style={{
        fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.8,
        paddingBottom: open ? 16 : 0, paddingRight: 38,
        maxHeight: open ? '200px' : '0',
        overflow:'hidden',
        transition:'max-height 0.35s cubic-bezier(.22,1,.36,1), padding-bottom 0.35s',
      }}>
        {a}
      </div>
    </div>
  )
}

// ══ SUPPORT PAGE ══
export function Support() {
  const { t, lang } = useLang()
  const [openFaq, setOpenFaq] = useState(null)

  const contacts = [
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
      img: '/images/chatbot.png',
      title: t('support_bot'),
      desc: t('support_bot_desc'),
      badge: lang==='ar'?'متاح 24/7':'24/7',
      badgeColor: 'var(--green)',
      action: () => {},
      actionLabel: lang==='ar'?'ابدأ المحادثة':'Start Chat',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
      img: '/images/telegram.png',
      title: t('support_tg'),
      desc: t('support_tg_desc'),
      badge: lang==='ar'?'سريع':'Fast',
      badgeColor: 'var(--cyan)',
      action: () => window.open('https://t.me/nimber1','_blank'),
      actionLabel: lang==='ar'?'فتح تيليجرام':'Open Telegram',
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
      img: '/images/whatsapp.png',
      title: t('support_wa'),
      desc: t('support_wa_desc'),
      badge: lang==='ar'?'مباشر':'Direct',
      badgeColor: '#25D366',
      action: () => window.open('https://wa.me/201080835986','_blank'),
      actionLabel: lang==='ar'?'فتح واتساب':'Open WhatsApp',
    },
  ]

  return (
    <div style={{ position:'relative', zIndex:2 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'55px 22px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:'0.68rem', letterSpacing:3, textTransform:'uppercase', color:'var(--cyan)', marginBottom:12, padding:'4px 14px', border:'1px solid rgba(0,210,255,0.2)', borderRadius:20, background:'rgba(0,210,255,0.05)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', animation:'blink 1.5s ease-in-out infinite', display:'inline-block' }}/>
            {t('support_badge')}
          </div>
          <h2 style={{ fontSize:'clamp(1.55rem,2.8vw,2.3rem)', fontWeight:900, marginBottom:12 }}>{t('support_title')}</h2>
          <p style={{ color:'var(--text-2)', fontSize:'0.92rem', maxWidth:480, margin:'0 auto', lineHeight:1.75 }}>
            {lang==='ar'?'فريقنا جاهز دائماً لمساعدتك على مدار الساعة. تواصل معنا عبر القناة المفضلة لديك.':'Our team is always ready to help you around the clock. Contact us through your preferred channel.'}
          </p>
        </div>

        {/* Status bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, marginBottom:36, padding:'12px 24px', background:'rgba(0,229,160,0.05)', border:'1px solid rgba(0,229,160,0.15)', borderRadius:14, flexWrap:'wrap' }}>
          {[
            { label: lang==='ar'?'المساعد الذكي':'AI Assistant',  status: lang==='ar'?'متاح':'Online',  color:'var(--green)' },
            { label: lang==='ar'?'تيليجرام':'Telegram',           status: lang==='ar'?'متاح':'Online',  color:'var(--cyan)'  },
            { label: lang==='ar'?'واتساب':'WhatsApp',              status: lang==='ar'?'متاح':'Online',  color:'#25D366'      },
            { label: lang==='ar'?'وقت الرد':'Response Time',       status: lang==='ar'?'< 5 دقائق':'< 5 min', color:'var(--gold)' },
          ].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:s.color, animation:'blink 1.8s ease-in-out infinite', display:'inline-block', boxShadow:`0 0 8px ${s.color}` }}/>
              <span style={{ fontSize:'0.75rem', color:'var(--text-2)', fontFamily:"'JetBrains Mono',monospace" }}>
                {s.label}: <strong style={{ color:s.color }}>{s.status}</strong>
              </span>
            </div>
          ))}
        </div>

        {/* Contact cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18, marginBottom:44 }}>
          {contacts.map((c,i) => <ContactCard key={i} {...c} />)}
        </div>

        {/* FAQ */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:22, overflow:'hidden' }}>
          <div style={{ padding:'20px 26px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--cyan-dim)', border:'1px solid rgba(0,210,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <h3 style={{ fontSize:'0.95rem', fontWeight:800 }}>{t('faq_title')}</h3>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>
                {FAQS.length} {lang==='ar'?'سؤال متكرر':'frequently asked questions'}
              </div>
            </div>
          </div>
          <div style={{ padding:'4px 22px 8px' }}>
            {FAQS.map((f,i) => (
              <FaqItem
                key={i}
                index={i}
                q={lang==='ar' ? f.qAr : f.qEn}
                a={lang==='ar' ? f.aAr : f.aEn}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ══ ABOUT ══
const STATS = [
  { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 00-3-3.87'/><path d='M16 3.13a4 4 0 010 7.75'/></svg>, titleAr:'52,000+', titleEn:'52,000+', descAr:'مستخدم نشط يثق في منصتنا يومياً', descEn:'Active users who trust our platform daily' },
  { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>, titleAr:'ISO 27001', titleEn:'ISO 27001', descAr:'شهادة أمان دولية معتمدة', descEn:'International certified security standard' },
  { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'/></svg>, titleAr:'تغطية عالمية', titleEn:'Global Reach', descAr:'تغطية جغرافية واسعة في المنطقة العربية والعالم', descEn:'Wide geographic reach across the Arab world and beyond' },
]

const TEAM = [
  { nameAr:'أحمد الرشيد',  nameEn:'Ahmed Al-Rashid',  roleAr:'المدير التنفيذي',       roleEn:'CEO',                color:'linear-gradient(135deg,#00d2ff,#7c5cfc)' },
  { nameAr:'سارة محمود',   nameEn:'Sara Mahmoud',     roleAr:'مديرة تقنية المعلومات', roleEn:'CTO',                color:'linear-gradient(135deg,#c8a84b,#f59e0b)' },
  { nameAr:'خالد عبدالله', nameEn:'Khalid Abdullah',  roleAr:'مدير العمليات',         roleEn:'Operations Director', color:'linear-gradient(135deg,#00e5a0,#00b3d9)' },
]

const teamColors = [
  { bg:'linear-gradient(135deg,rgba(0,210,255,0.25),rgba(124,92,252,0.2))', badge:'rgba(0,210,255,0.12)', badgeBorder:'rgba(0,210,255,0.25)', badgeColor:'var(--cyan)' },
  { bg:'linear-gradient(135deg,rgba(200,168,75,0.25),rgba(245,158,11,0.2))', badge:'rgba(200,168,75,0.12)', badgeBorder:'rgba(200,168,75,0.25)', badgeColor:'var(--gold)' },
  { bg:'linear-gradient(135deg,rgba(0,229,160,0.25),rgba(0,179,217,0.2))', badge:'rgba(0,229,160,0.12)', badgeBorder:'rgba(0,229,160,0.25)', badgeColor:'var(--green)' },
]
const teamBadges = { ar:['قيادة','تقنية','عمليات'], en:['Leadership','Tech','Operations'] }


/* ──────────────────────────────────────────────────────────────
   About Page — Premium, adapted to site CSS variables
   ────────────────────────────────────────────────────────────── */
const ABOUT_STYLES = `
@keyframes ab-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
@keyframes ab-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
@keyframes ab-pulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes ab-ticker  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes ab-countUp { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
`

function useCountUp(target, duration=1800, start=false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0 = null
    const step = ts => {
      if (!t0) t0 = ts
      const p = Math.min((ts-t0)/duration,1)
      setVal(Math.floor((1-Math.pow(1-p,3))*target))
      if (p<1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start,target,duration])
  return val
}

function useVisible(threshold=0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const AbIcon = {
  shield:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  bolt:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  globe:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  star:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  users:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  check:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  diamond: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41l-7.59-7.59a2.41 2.41 0 00-3.41 0z"/></svg>,
  heart:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  eye:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  chart:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  medal:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
}

function AbSectionLabel({ text }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 14px', borderRadius:50, border:'1px solid rgba(200,168,75,0.3)', background:'rgba(200,168,75,0.07)', fontFamily:"'JetBrains Mono',monospace", fontSize:'0.62rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:14 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold)', animation:'ab-pulse 1.6s ease-in-out infinite', display:'inline-block' }}/>
      {text}
    </div>
  )
}

function AbGoldDivider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'0 auto 10px', maxWidth:140 }}>
      <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(200,168,75,0.45))' }}/>
      <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 8px rgba(200,168,75,0.5)' }}/>
      <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(200,168,75,0.45),transparent)' }}/>
    </div>
  )
}

function AbStatCard({ num, suffix, displayValue, labelAr, labelEn, icon, delay, visible, lang }) {
  const count = useCountUp(num, 1600, visible)
  return (
    <div style={{ background:'var(--card)', border:'1px solid rgba(200,168,75,0.14)', borderRadius:18, padding:'28px 22px', textAlign:'center', transition:'all 0.3s', cursor:'default', animation: visible ? `ab-fadeUp 0.6s ${delay}s both` : 'none' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(200,168,75,0.35)'; e.currentTarget.style.background='rgba(200,168,75,0.05)'; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(200,168,75,0.14)'; e.currentTarget.style.background='var(--card)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
      <div style={{ width:52, height:52, borderRadius:14, background:'rgba(200,168,75,0.1)', border:'1px solid rgba(200,168,75,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', margin:'0 auto 16px' }}>{icon}</div>
      <div style={{ fontSize:'clamp(1.8rem,3.5vw,2.4rem)', fontWeight:900, fontFamily:"'Orbitron',monospace", background:'linear-gradient(135deg,var(--cyan),var(--purple),var(--green))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1, marginBottom:8 }}>
        {displayValue || `${count.toLocaleString()}${suffix}`}
      </div>
      <div style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.5 }}>
        {lang==='ar' ? labelAr : labelEn}
      </div>
    </div>
  )
}

function AbFeatureCard({ icon, titleAr, titleEn, descAr, descEn, index, lang }) {
  const [hov, setHov] = useState(false)
  const colors = [
    { line:'var(--gold)', glow:'rgba(200,168,75,0.08)' },
    { line:'var(--cyan)', glow:'rgba(0,210,255,0.07)'  },
    { line:'var(--green)',glow:'rgba(0,229,160,0.07)'  },
    { line:'#a78bfa',    glow:'rgba(124,92,252,0.07)'  },
  ]
  const c = colors[index % 4]
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov ? c.glow : 'var(--card)', border:`1px solid ${hov ? c.line+'55' : 'var(--border-1)'}`, borderRadius:18, padding:'26px 22px', transition:'all 0.3s', transform: hov ? 'translateY(-5px)' : 'none', boxShadow: hov ? '0 20px 50px rgba(0,0,0,0.2)' : 'none', position:'relative', overflow:'hidden', cursor:'default' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.line},transparent)`, opacity: hov ? 1 : 0, transition:'opacity 0.3s' }}/>
      <div style={{ width:48, height:48, borderRadius:13, background:`${c.line}18`, border:`1px solid ${c.line}33`, display:'flex', alignItems:'center', justifyContent:'center', color:c.line, marginBottom:16, transition:'transform 0.35s', transform: hov ? 'scale(1.1) rotate(-6deg)' : 'none' }}>{icon}</div>
      <div style={{ fontSize:'0.95rem', fontWeight:800, marginBottom:8, color:'var(--text-1)' }}>{lang==='ar' ? titleAr : titleEn}</div>
      <div style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.75 }}>{lang==='ar' ? descAr : descEn}</div>
    </div>
  )
}

function AbValueCard({ icon, titleAr, titleEn, descAr, descEn, lang }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', gap:16, padding:'20px 22px', border:`1px solid ${hov ? 'rgba(200,168,75,0.3)' : 'var(--border-1)'}`, borderRadius:16, background: hov ? 'rgba(200,168,75,0.04)' : 'var(--card)', transition:'all 0.25s', transform: hov ? 'translateX(-4px)' : 'none', cursor:'default' }}>
      <div style={{ width:42, height:42, borderRadius:11, background:'rgba(200,168,75,0.1)', border:'1px solid rgba(200,168,75,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', flexShrink:0, transition:'transform 0.3s', transform: hov ? 'scale(1.1)' : 'none' }}>{icon}</div>
      <div>
        <div style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-1)', marginBottom:5 }}>{lang==='ar' ? titleAr : titleEn}</div>
        <div style={{ fontSize:'0.78rem', color:'var(--text-2)', lineHeight:1.7 }}>{lang==='ar' ? descAr : descEn}</div>
      </div>
    </div>
  )
}

function AbTeamCard({ nameAr, nameEn, roleAr, roleEn, subtitleAr, subtitleEn, gradient, badgeColor, lang }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov ? 'rgba(200,168,75,0.05)' : 'var(--card)', border:`1px solid ${hov ? 'rgba(200,168,75,0.3)' : 'var(--border-1)'}`, borderRadius:18, padding:'24px 20px', textAlign:'center', transition:'all 0.3s', transform: hov ? 'translateY(-6px)' : 'none', boxShadow: hov ? '0 20px 50px rgba(0,0,0,0.2)' : 'none', cursor:'default', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${badgeColor},transparent)`, opacity: hov ? 0.8 : 0, transition:'opacity 0.3s' }}/>
      <div style={{ width:72, height:72, borderRadius:20, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', fontWeight:900, color:'#fff', margin:'0 auto 14px', transition:'transform 0.35s', transform: hov ? 'scale(1.1) rotate(-4deg)' : 'none' }}>
        {(lang==='ar' ? nameAr : nameEn)[0]}
      </div>
      <div style={{ fontSize:'0.95rem', fontWeight:800, color:'var(--text-1)', marginBottom:4 }}>{lang==='ar' ? nameAr : nameEn}</div>
      <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:12 }}>{lang==='ar' ? roleAr : roleEn}</div>
      <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:20, background:`${badgeColor}18`, border:`1px solid ${badgeColor}44`, fontSize:'0.62rem', fontFamily:"'JetBrains Mono',monospace", color:badgeColor, fontWeight:700, letterSpacing:'0.08em' }}>
        {lang==='ar' ? subtitleAr : subtitleEn}
      </div>
    </div>
  )
}

export function About({ onNavigate }) {
  const { t, lang } = useLang()
  const [heroRef,  heroVisible]  = useVisible(0.1)
  const [statsRef, statsVisible] = useVisible(0.2)
  const [featRef,  featVisible]  = useVisible(0.15)
  const [teamRef,  teamVisible]  = useVisible(0.15)
  const [ctaRef,   ctaVisible]   = useVisible(0.2)

  const STATS = [
    { num:52000,  suffix:'+', labelAr:'عميل نشط يثق بمنصتنا يومياً', labelEn:'Active users trust us daily',      icon:AbIcon.users,  delay:0   },
    { num:980000, suffix:'+', labelAr:'عملية تحويل ناجحة حتى الآن',  labelEn:'Successful transfers completed',   icon:AbIcon.chart,  delay:0.1 },
    { num:50,     suffix:'+', labelAr:'زوج عملات مدعوم',              labelEn:'Supported currency pairs',         icon:AbIcon.globe,  delay:0.2 },
    { num:498,    suffix:'‱', labelAr:'متوسط تقييم عملائنا /500',    labelEn:'Average customer rating /500',     icon:AbIcon.medal,  delay:0.3 },
  ]

  const FEATURES = [
    { icon:AbIcon.bolt,    titleAr:'تحويل في ثوانٍ',       titleEn:'Lightning Transfer',    descAr:'تتم عمليات التحويل خلال دقائق — أسرع من أي منصة أخرى في السوق',                   descEn:'Transfers complete in minutes — faster than any other platform in the market' },
    { icon:AbIcon.shield,  titleAr:'أمان بنكي متكامل',     titleEn:'Bank-Grade Security',   descAr:'تشفير AES-256 مع مصادقة ثنائية وحماية متعددة الطبقات تحمي أموالك دائماً',          descEn:'AES-256 encryption with 2FA and multi-layer protection guarding your funds' },
    { icon:AbIcon.diamond, titleAr:'أسعار صرف ذهبية',      titleEn:'Golden Exchange Rates', descAr:'نقدم أفضل أسعار الصرف مع رسوم شفافة وبدون أي تكاليف مخفية',                        descEn:'Best exchange rates with transparent fees and absolutely no hidden costs' },
    { icon:AbIcon.star,    titleAr:'دعم احترافي 24/7',     titleEn:'Professional Support',  descAr:'فريق من الخبراء على أتم الاستعداد لمساعدتك في أي وقت',                             descEn:'A team of experts always ready to assist you at any hour of the day' },
    { icon:AbIcon.globe,   titleAr:'تغطية عالمية واسعة',   titleEn:'Global Coverage',       descAr:'خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل لجميع العملات الرقمية والمحلية',       descEn:'Available in 50+ countries with full support for all digital and local currencies' },
    { icon:AbIcon.chart,   titleAr:'أسعار لحظية دقيقة',    titleEn:'Real-Time Rates',       descAr:'أسعار صرف محدّثة لحظة بلحظة من أكبر البورصات العالمية',                            descEn:'Exchange rates updated in real-time from the world\'s largest exchanges' },
  ]

  const VALUES = [
    { icon:AbIcon.shield, titleAr:'الأمانة والشفافية',   titleEn:'Honesty & Transparency', descAr:'لا رسوم مخفية — ما تراه هو بالضبط ما تدفعه وما تستلمه',              descEn:'No hidden fees — what you see is exactly what you pay and receive' },
    { icon:AbIcon.heart,  titleAr:'العميل في المركز',     titleEn:'Customer First',          descAr:'كل قرار مبني على سؤال: هل هذا يخدم عميلنا بأفضل شكل ممكن؟',        descEn:'Every decision built on: does this serve our customer in the best way?' },
    { icon:AbIcon.bolt,   titleAr:'الابتكار المستمر',     titleEn:'Continuous Innovation',   descAr:'نستثمر في التكنولوجيا الحديثة لنقدم تجربة تبادل أفضل كل يوم',       descEn:'We invest in modern tech to deliver a better exchange experience every day' },
    { icon:AbIcon.eye,    titleAr:'المسؤولية والمصداقية', titleEn:'Accountability',           descAr:'نتحمل مسؤولية كاملة عن كل معاملة ونقف خلف كل وعد لعملائنا',         descEn:'Full responsibility for every transaction and every promise we make' },
  ]

  const TEAM = [
    { nameAr:'أحمد الرشيد',  nameEn:'Ahmed Al-Rashid',  roleAr:'المدير التنفيذي',      roleEn:'Chief Executive Officer',  subtitleAr:'قيادة استراتيجية',  subtitleEn:'Strategic Leadership',    gradient:'linear-gradient(135deg,var(--cyan),var(--purple))', badgeColor:'var(--gold)' },
    { nameAr:'سارة محمود',   nameEn:'Sara Mahmoud',     roleAr:'مديرة التكنولوجيا',   roleEn:'Chief Technology Officer', subtitleAr:'بنية تحتية متطورة', subtitleEn:'Advanced Infrastructure', gradient:'linear-gradient(135deg,#00d2ff,#0098ea)', badgeColor:'var(--cyan)' },
    { nameAr:'خالد عبدالله', nameEn:'Khalid Abdullah',  roleAr:'مدير العمليات',        roleEn:'Operations Director',      subtitleAr:'تميّز تشغيلي',      subtitleEn:'Operational Excellence',  gradient:'linear-gradient(135deg,#00e5a0,#00b3d9)', badgeColor:'var(--green)' },
    { nameAr:'نورا السالم',  nameEn:'Nora Al-Salem',    roleAr:'مديرة تجربة العملاء', roleEn:'Customer Experience',      subtitleAr:'رضا العملاء',       subtitleEn:'Customer Satisfaction',   gradient:'linear-gradient(135deg,#7c5cfc,#c084fc)', badgeColor:'#a78bfa' },
  ]

  const REVIEWS = [
    { nameAr:'زكريا عمر',     nameEn:'Zakaria',   textAr:'أفضل خدمة تبادل! سريع وموثوق',       textEn:'Best exchange! Fast and reliable',      color:'linear-gradient(135deg,#00d2ff,#7c5cfc)' },
    { nameAr:'فاطمة الزهراء', nameEn:'Fatima',    textAr:'التحويل وصل في دقيقتين!',             textEn:'Transfer arrived in two minutes!',      color:'linear-gradient(135deg,#e91e63,#ff6090)' },
    { nameAr:'محمد الخالدي',  nameEn:'Mohammed',  textAr:'منصة موثوقة أستخدمها منذ سنة',       textEn:'Trusted, using it for a year',          color:'linear-gradient(135deg,#f7931a,#ffd700)' },
    { nameAr:'نورة القحطاني', nameEn:'Noura',     textAr:'أسعار ممتازة وسرعة عالية',            textEn:'Excellent rates and high speed',         color:'linear-gradient(135deg,#9945ff,#c084fc)' },
    { nameAr:'عمر الشريف',    nameEn:'Omar',      textAr:'خدمة العملاء متجاوبة جداً',            textEn:'Very responsive support',                color:'linear-gradient(135deg,#0098ea,#38bdf8)' },
    { nameAr:'هند الدوسري',   nameEn:'Hind',      textAr:'أنصح بها لكل من يريد تحويل USDT',    textEn:'Recommend for USDT transfers',           color:'linear-gradient(135deg,#f59e0b,#fcd34d)' },
  ]

  const goldShimmer = { background:'linear-gradient(90deg,var(--cyan),var(--purple),var(--green),var(--cyan))', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'ab-shimmer 4s linear infinite' }

  return (
    <div style={{ position:'relative', zIndex:2, minHeight:'100vh', direction: lang==='ar'?'rtl':'ltr' }}>
      <style>{ABOUT_STYLES}</style>

      {/* Decorative BG radials */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-15%', right:'-5%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(200,168,75,0.05) 0%,transparent 65%)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:'40vw', height:'40vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(0,210,255,0.03) 0%,transparent 65%)', filter:'blur(50px)' }}/>
      </div>

      <div style={{ maxWidth:1180, margin:'0 auto', padding:'60px 22px 80px', position:'relative', zIndex:1 }}>

        {/* ══ HERO ══ */}
        <section ref={heroRef} style={{ textAlign:'center', marginBottom:80 }}>
          <div style={{ animation: heroVisible ? 'ab-fadeUp 0.7s 0s both' : 'none' }}>
            <AbSectionLabel text={lang==='ar' ? '— من نحن —' : '— ABOUT US —'} />
            <h1 style={{ fontSize:'clamp(2rem,5.5vw,3.4rem)', fontWeight:900, lineHeight:1.15, marginBottom:10, ...goldShimmer }}>
              {lang==='ar' ? 'حيث الثقة تلتقي' : 'Where Trust Meets'}
              <br/>{lang==='ar' ? 'بالسرعة والفخامة' : 'Speed & Excellence'}
            </h1>
            <AbGoldDivider/>
            <p style={{ fontSize:'clamp(0.88rem,1.5vw,1rem)', color:'var(--text-2)', maxWidth:560, margin:'14px auto 32px', lineHeight:1.8 }}>
              {lang==='ar'
                ? 'Number1 Exchange — منصة تبادل عملات رقمية ومحلية مبنية على الثقة والشفافية، نخدم أكثر من 52,000 عميل في المنطقة العربية والعالم'
                : 'Number1 Exchange — a digital and local currency exchange platform built on trust and transparency, serving 52,000+ clients across the Arab region and beyond'}
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>onNavigate&&onNavigate('home')}
                style={{ padding:'13px 32px', background:'linear-gradient(135deg,var(--cyan),#006e9e)', color:'#fff', border:'none', borderRadius:12, fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.2s', boxShadow:'0 8px 24px rgba(0,210,255,0.25)' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 14px 32px rgba(200,168,75,0.4)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 24px rgba(200,168,75,0.3)'}}>
                {lang==='ar' ? 'ابدأ التبادل الآن' : 'Start Trading Now'} {AbIcon.arrow}
              </button>
              <button onClick={()=>onNavigate&&onNavigate('support')}
                style={{ padding:'13px 32px', background:'transparent', color:'var(--gold)', border:'1px solid rgba(200,168,75,0.35)', borderRadius:12, fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,168,75,0.07)';e.currentTarget.style.borderColor='rgba(200,168,75,0.6)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(200,168,75,0.35)'}}>
                {lang==='ar' ? 'تواصل معنا' : 'Contact Us'}
              </button>
            </div>
          </div>

          {/* Trust Bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap', marginTop:44, padding:'14px 24px', background:'rgba(200,168,75,0.04)', border:'1px solid rgba(200,168,75,0.1)', borderRadius:50, maxWidth:680, margin:'44px auto 0', animation: heroVisible ? 'ab-fadeUp 0.7s 0.3s both' : 'none' }}>
            {[
              { ar:'ISO 27001 معتمد', en:'ISO 27001 Certified' },
              { ar:'تحويل فوري', en:'Instant Transfer' },
              { ar:'50+ دولة', en:'50+ Countries' },
              { ar:'⭐ تقييم 4.98/5',   en:'⭐ Rating 4.98/5'       },
            ].map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", padding: i>0 ? (lang==='ar'?'0 16px 0 0':'0 0 0 16px') : '0', borderRight: lang==='ar' ? (i>0?'1px solid rgba(200,168,75,0.15)':'none') : 'none', borderLeft: lang!=='ar' ? (i>0?'1px solid rgba(200,168,75,0.15)':'none') : 'none' }}>
                {lang==='ar' ? item.ar : item.en}
              </div>
            ))}
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section ref={statsRef} style={{ marginBottom:80 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <AbSectionLabel text={lang==='ar' ? 'أرقامنا تتحدث' : 'OUR NUMBERS'} />
            <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'var(--text-1)' }}>
              {lang==='ar' ? 'إنجازات نفخر بها' : 'Achievements We Are Proud Of'}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            {STATS.map((s,i) => (
              <AbStatCard
                key={i}
                {...s}
                displayValue={s.labelEn === 'Successful transfers completed' ? '+200' : undefined}
                visible={statsVisible}
                lang={lang}
              />
            ))}
          </div>
        </section>

        {/* ══ STORY ══ */}
        <section style={{ marginBottom:80 }}>
          <div style={{ background:'var(--card)', border:'1px solid rgba(200,168,75,0.12)', borderRadius:22, padding:'44px 40px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--cyan) 30%,var(--purple) 50%,var(--cyan) 70%,transparent)' }}/>
            <div style={{ position:'absolute', top:-60, right:-60, width:180, height:180, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(200,168,75,0.07),transparent 70%)', pointerEvents:'none' }}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
              <div>
                <AbSectionLabel text={lang==='ar' ? 'قصتنا' : 'OUR STORY'} />
                <h2 style={{ fontSize:'clamp(1.3rem,2.8vw,1.9rem)', fontWeight:900, color:'var(--text-1)', marginBottom:18, lineHeight:1.3 }}>
                  {lang==='ar' ? 'بنينا منصتنا على أساس الثقة' : 'We Built Our Platform on Trust'}
                </h2>
                <p style={{ fontSize:'0.88rem', color:'var(--text-2)', lineHeight:1.95, marginBottom:16 }}>
                  {lang==='ar'
                    ? 'Number1 Exchange لم تكن مجرد فكرة — كانت استجابةً لحاجة حقيقية. نشأت من إيمان بأن كل شخص يستحق خدمات تبادل شفافة وسريعة وآمنة دون رسوم مخفية.'
                    : 'Number1 Exchange was not just an idea — it was a response to a real need. Born from a belief that everyone deserves transparent, fast, and secure exchange without hidden fees.'}
                </p>
                <p style={{ fontSize:'0.88rem', color:'var(--text-2)', lineHeight:1.95 }}>
                  {lang==='ar'
                    ? 'منذ انطلاقنا، شققنا طريقنا بثقة مستندين على تكنولوجيا متطورة وفريق متفانٍ يضع رضا العميل فوق كل اعتبار.'
                    : 'Since our launch, we have confidently grown, relying on advanced technology and a dedicated team that places customer satisfaction above everything.'}
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { num:'2025', labelAr:'سنة التأسيس', labelEn:'Founded'         },
                  { num:'#1',   labelAr:'منصة موثوقة',  labelEn:'Trusted Platform'},
                  { num:'< 3m', labelAr:'زمن التحويل',  labelEn:'Transfer Time'   },
                  { num:'99.9%',labelAr:'وقت التشغيل',  labelEn:'Uptime'          },
                ].map((item,i) => (
                  <div key={i} style={{ background:'rgba(200,168,75,0.04)', border:'1px solid rgba(200,168,75,0.12)', borderRadius:14, padding:'20px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:'1.4rem', fontWeight:900, fontFamily:"'Orbitron',monospace", color:'var(--gold)', marginBottom:6 }}>{item.num}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{lang==='ar' ? item.labelAr : item.labelEn}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ VISION & MISSION ══ */}
        <section style={{ marginBottom:80 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <AbSectionLabel text={lang==='ar' ? 'رؤيتنا ورسالتنا' : 'VISION & MISSION'} />
            <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'var(--text-1)' }}>
              {lang==='ar' ? 'نحو أفق أوسع' : 'Towards a Broader Horizon'}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='var(--gold)' stroke='var(--gold)' strokeWidth='1'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>, colorMain:'var(--gold)',  colorBg:'rgba(200,168,75,0.05)',  labelAr:'الرؤية',  labelEn:'VISION',  titleAr:'القيادة الإقليمية',       titleEn:'Regional Leadership',             textAr:'أن نكون المنصة المرجعية الأولى في تحويل العملات على مستوى المنطقة العربية والعالم.', textEn:'To be the premier reference platform for currency exchange across the Arab region and beyond.', points: lang==='ar' ? ['قيادة السوق إقليمياً بحلول 2026','توسع لـ 80 دولة بحلول 2027','أعلى معدل رضا في القطاع'] : ['Regional market leadership by 2026','Expansion to 80 countries by 2027','Highest customer satisfaction in the sector'] },
              { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='1.8' strokeLinecap='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/></svg>, colorMain:'var(--cyan)', colorBg:'rgba(0,210,255,0.04)',   labelAr:'الرسالة', labelEn:'MISSION', titleAr:'تمكين مالي للجميع',       titleEn:'Financial Empowerment for All',    textAr:'تقديم خدمات صرف عادلة وآمنة وسريعة لكل شخص مع الحفاظ على أعلى مستويات الشفافية.', textEn:'Delivering fair, secure, and fast exchange for everyone while maintaining the highest standards of transparency.', points: lang==='ar' ? ['رسوم عادلة وشفافة 100%','أمان بمستوى بنكي لكل معاملة','دعم بشري حقيقي على مدار الساعة'] : ['100% fair and transparent fees','Bank-level security per transaction','Real human support around the clock'] },
            ].map((item,i) => (
              <div key={i} style={{ background:item.colorBg, border:`1px solid ${item.colorMain}28`, borderRadius:20, padding:'30px 26px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${item.colorMain},transparent)`, opacity:0.6 }}/>
                <div style={{ fontSize:'2rem', marginBottom:14 }}>{item.icon}</div>
                <div style={{ fontSize:'0.6rem', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.15em', color:item.colorMain, marginBottom:8 }}>
                  {lang==='ar' ? item.labelAr : item.labelEn}
                </div>
                <h3 style={{ fontSize:'1.1rem', fontWeight:900, color:'var(--text-1)', marginBottom:12 }}>
                  {lang==='ar' ? item.titleAr : item.titleEn}
                </h3>
                <p style={{ fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.8, marginBottom:18 }}>
                  {lang==='ar' ? item.textAr : item.textEn}
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {item.points.map((pt,j) => (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.8rem', color:'var(--text-1)' }}>
                      <div style={{ width:20, height:20, borderRadius:6, background:`${item.colorMain}22`, border:`1px solid ${item.colorMain}44`, display:'flex', alignItems:'center', justifyContent:'center', color:item.colorMain, flexShrink:0 }}>
                        {AbIcon.check}
                      </div>
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section ref={featRef} style={{ marginBottom:80 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <AbSectionLabel text={lang==='ar' ? 'لماذا نحن' : 'WHY CHOOSE US'} />
            <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'var(--text-1)', marginBottom:10 }}>
              {lang==='ar' ? 'ما يجعلنا مختلفين' : 'What Makes Us Different'}
            </h2>
            <p style={{ fontSize:'0.85rem', color:'var(--text-3)', maxWidth:480, margin:'0 auto' }}>
              {lang==='ar' ? 'ستة أسباب تجعل Number1 Exchange الخيار الأول' : 'Six reasons that make Number1 Exchange the first choice'}
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14 }}>
            {FEATURES.map((f,i) => <AbFeatureCard key={i} {...f} index={i} lang={lang}/>)}
          </div>
        </section>

        {/* ══ CORE VALUES ══ */}
        <section style={{ marginBottom:80 }}>
          <div style={{ background:'var(--card)', border:'1px solid rgba(200,168,75,0.1)', borderRadius:22, padding:'44px 40px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,168,75,0.5),transparent)' }}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:48, alignItems:'start' }}>
              <div>
                <AbSectionLabel text={lang==='ar' ? 'قيمنا الجوهرية' : 'CORE VALUES'} />
                <h2 style={{ fontSize:'clamp(1.3rem,2.8vw,1.9rem)', fontWeight:900, color:'var(--text-1)', lineHeight:1.3, marginBottom:14 }}>
                  {lang==='ar' ? 'المبادئ التي نبني عليها كل شيء' : 'The Principles We Build Everything Upon'}
                </h2>
                <p style={{ fontSize:'0.83rem', color:'var(--text-2)', lineHeight:1.85 }}>
                  {lang==='ar' ? 'قيمنا ليست مجرد كلمات — هي المرساة التي تثبّت كل قرار نتخذه' : 'Our values are not just words — they are the anchor behind every decision we make'}
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {VALUES.map((v,i) => <AbValueCard key={i} {...v} lang={lang}/>)}
              </div>
            </div>
          </div>
        </section>

        {/* ══ TEAM ══ */}
        <section ref={teamRef} style={{ marginBottom:80 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <AbSectionLabel text={lang==='ar' ? 'فريق القيادة' : 'LEADERSHIP TEAM'} />
            <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'var(--text-1)', marginBottom:10 }}>
              {lang==='ar' ? 'العقول التي تقود المنصة' : 'The Minds Behind the Platform'}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {TEAM.map((m,i) => (
              <div key={i} style={{ animation: teamVisible ? `ab-fadeUp 0.6s ${i*0.1}s both` : 'none' }}>
                <AbTeamCard {...m} lang={lang}/>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SCROLLING REVIEWS ══ */}
        <section style={{ marginBottom:80, overflow:'hidden' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <AbSectionLabel text={lang==='ar' ? 'يقولون عنّا' : 'WHAT THEY SAY'} />
            <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'var(--text-1)' }}>
              {lang==='ar' ? 'تجارب عملائنا الحقيقية' : 'Real Customer Experiences'}
            </h2>
          </div>
          <div style={{ position:'relative', maskImage:'linear-gradient(to right,transparent,black 8%,black 92%,transparent)', WebkitMaskImage:'linear-gradient(to right,transparent,black 8%,black 92%,transparent)' }}>
            <div style={{ display:'flex', gap:14, width:'max-content', animation:'ab-ticker 28s linear infinite' }}>
              {[...REVIEWS,...REVIEWS].map((r,i) => (
                <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 16px', background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:50, flexShrink:0 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'#fff', flexShrink:0 }}>
                    {(lang==='ar' ? r.nameAr : r.nameEn)[0]}
                  </div>
                  <div>
                    <div style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--text-1)' }}>{lang==='ar' ? r.nameAr : r.nameEn}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--gold)' }}><span style={{display:'flex',gap:1}}>{[0,1,2,3,4].map(i=><svg key={i} width='11' height='11' viewBox='0 0 24 24' fill='#f59e0b' stroke='#f59e0b' strokeWidth='1'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>)}</span></div>
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-2)', maxWidth:160, lineHeight:1.4, borderRight:'1px solid var(--border-1)', paddingRight:10 }}>
                    "{lang==='ar' ? r.textAr : r.textEn}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section ref={ctaRef}>
          <div style={{ background:'var(--card)', border:'1px solid rgba(200,168,75,0.2)', borderRadius:24, padding:'56px 40px', textAlign:'center', position:'relative', overflow:'hidden', animation: ctaVisible ? 'ab-fadeUp 0.7s 0s both' : 'none' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--cyan) 30%,var(--purple) 50%,var(--cyan) 70%,transparent)' }}/>
            <div style={{ position:'absolute', top:-80, right:'50%', transform:'translateX(50%)', width:300, height:150, background:'radial-gradient(ellipse,rgba(200,168,75,0.08),transparent 70%)', pointerEvents:'none' }}/>
            <div style={{ color:'var(--cyan)', marginBottom:16 }}><svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'><line x1='12' y1='2' x2='12' y2='22'/><line x1='2' y1='12' x2='22' y2='12'/><line x1='4.93' y1='4.93' x2='19.07' y2='19.07'/><line x1='19.07' y1='4.93' x2='4.93' y2='19.07'/></svg></div>
            <h2 style={{ fontSize:'clamp(1.5rem,3.5vw,2.2rem)', fontWeight:900, marginBottom:12, ...goldShimmer }}>
              {lang==='ar' ? 'انضم لـ 52,000+ عميل يثقون بنا' : 'Join 52,000+ Clients Who Trust Us'}
            </h2>
            <p style={{ fontSize:'0.88rem', color:'var(--text-2)', maxWidth:500, margin:'0 auto 32px', lineHeight:1.8 }}>
              {lang==='ar'
                ? 'تجربة Premium في تبادل العملات — بدون تعقيدات، بدون رسوم خفية، بدون انتظار'
                : 'A premium currency exchange experience — no complexity, no hidden fees, no waiting'}
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>onNavigate&&onNavigate('home')}
                style={{ padding:'14px 36px', background:'linear-gradient(135deg,var(--cyan),#006e9e)', color:'#fff', border:'none', borderRadius:13, fontFamily:"'Tajawal',sans-serif", fontSize:'0.95rem', fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 10px 30px rgba(0,210,255,0.25)', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(200,168,75,0.4)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 10px 30px rgba(200,168,75,0.3)'}}>
                {lang==='ar' ? 'ابدأ التبادل الآن' : 'Start Trading Now'} {AbIcon.arrow}
              </button>
              <button onClick={()=>onNavigate&&onNavigate('support')}
                style={{ padding:'14px 32px', background:'transparent', color:'var(--gold)', border:'1px solid rgba(200,168,75,0.35)', borderRadius:13, fontFamily:"'Tajawal',sans-serif", fontSize:'0.9rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,168,75,0.07)';e.currentTarget.style.borderColor='rgba(200,168,75,0.55)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(200,168,75,0.35)'}}>
                {lang==='ar' ? 'تواصل مع فريقنا' : 'Contact Our Team'}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
