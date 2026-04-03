// src/pages/Reviews.jsx — Horizontal Auto-Scroll Carousel (two rows)
import { useEffect } from 'react'

const REVIEWS = [
  { id:1,  name:'أحمد محمد',     country:'SA', rating:5, date:'مارس 2025',    amount:'500 USDT → MoneyGo',  text:'خدمة ممتازة! التحويل تم خلال 10 دقائق فقط. السعر أفضل مما وجدته في أي مكان آخر.' },
  { id:2,  name:'محمود علي',     country:'EG', rating:5, date:'مارس 2025',    amount:'200 USDT → فودافون',  text:'تعاملت معهم مرات عديدة ودائماً الخدمة سريعة وأمينة. فريق الدعم متجاوب جداً على تيليغرام.' },
  { id:3,  name:'خالد العمري',   country:'SA', rating:4, date:'فبراير 2025',  amount:'1000 USDT → MoneyGo', text:'تجربة جيدة جداً. انتظرت 20 دقيقة بسبب ازدحام لكن المبلغ وصل كاملاً. أنصح بهم.' },
  { id:4,  name:'ياسمين حسن',   country:'EG', rating:5, date:'فبراير 2025',  amount:'300 USDT → إنستاباي', text:'أول تعامل معهم وكان رائعاً. الموقع واضح وسهل، والتحويل وصل بسرعة. شكراً!' },
  { id:5,  name:'عمر الزهراني', country:'SA', rating:5, date:'يناير 2025',   amount:'750 USDT → MoneyGo',  text:'من أفضل منصات الصرف التي استخدمتها. شفافية كاملة في الأسعار وسرعة في التنفيذ.' },
  { id:6,  name:'نورة القحطاني',country:'SA', rating:4, date:'يناير 2025',   amount:'150 USDT → فودافون',  text:'الخدمة ممتازة والفريق محترف. السعر منافس جداً مقارنة بالبدائل الأخرى.' },
  { id:7,  name:'مصطفى إبراهيم',country:'EG', rating:5, date:'ديسمبر 2024', amount:'2000 USDT → MoneyGo', text:'أثق بهم بمبالغ كبيرة منذ سنة. لم يخذلوني أبداً. الدعم متاح على مدار الساعة.' },
  { id:8,  name:'سارة الأنصاري',country:'SA', rating:5, date:'ديسمبر 2024', amount:'400 USDT → إنستاباي', text:'تحويل سلس ومريح. الموقع جميل ومنظم. استمروا هكذا.' },
  { id:9,  name:'فيصل المطيري', country:'SA', rating:5, date:'نوفمبر 2024', amount:'600 USDT → MoneyGo',  text:'من أفضل تجاربي في تحويل الأموال. سرعة التنفيذ لا تصدق والأسعار منافسة جداً.' },
  { id:10, name:'رنا الشهراني', country:'SA', rating:5, date:'أكتوبر 2024', amount:'350 USDT → إنستاباي', text:'خدمة عملاء رائعة وتعامل احترافي. التحويل وصل قبل الوقت المتوقع. سأعود دائماً.' },
]

const STATS = [
  { value:'10,000+', label:'صفقة منجزة',
    icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg> },
  { value:'4.9/5',   label:'متوسط التقييم',
    icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { value:'98%',     label:'رضا العملاء',
    icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { value:'< 15 دق', label:'متوسط التحويل',
    icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
]

const ACCENT_COLORS = ['#00b8d9','#7c5cfc','#f59e0b','#00e5a0','#f43f5e','#06b6d4','#a78bfa','#34d399','#fb923c','#38bdf8']

function Stars({ rating }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24"
          fill={s <= rating ? '#f59e0b' : 'none'}
          stroke={s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review, idx }) {
  const col = ACCENT_COLORS[idx % ACCENT_COLORS.length]
  return (
    <div style={{
      flexShrink: 0,
      width: 272,
      background: 'var(--card)',
      border: '1px solid var(--border-1)',
      borderRadius: 18,
      padding: '18px 18px 16px',
      display: 'flex', flexDirection: 'column', gap: 11,
      margin: '6px 8px',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color .2s, box-shadow .2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor=col+'60'; e.currentTarget.style.boxShadow=`0 8px 28px ${col}18` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-1)'; e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${col}90,transparent)` }}/>

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${col},${col}77)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'.95rem', fontFamily:"'Tajawal',sans-serif", flexShrink:0, boxShadow:`0 3px 10px ${col}44` }}>
          {review.name[0]}
        </div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:700, fontSize:'.87rem', color:'var(--text-1)' }}>{review.name}</span>
            <span style={{ fontSize:'.58rem', fontFamily:"'JetBrains Mono',monospace", color:col, background:`${col}18`, padding:'1px 5px', borderRadius:4, border:`1px solid ${col}28` }}>{review.country}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3 }}>
            <Stars rating={review.rating}/>
            <span style={{ fontSize:'.6rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{review.date}</span>
          </div>
        </div>
      </div>

      <p style={{ margin:0, fontSize:'.83rem', color:'var(--text-2)', lineHeight:1.7, fontFamily:"'Tajawal',sans-serif",
        display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        "{review.text}"
      </p>

      <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:7, background:`${col}12`, border:`1px solid ${col}28`, alignSelf:'flex-start', marginTop:'auto' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span style={{ fontSize:'.61rem', color:col, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{review.amount}</span>
      </div>
    </div>
  )
}

function CarouselTrack({ reviews, direction }) {
  const items = [...reviews, ...reviews, ...reviews, ...reviews]
  const dur = direction === 'left' ? '40s' : '48s'
  const anim = direction === 'left' ? 'scrollLeft' : 'scrollRight'
  return (
    <div style={{ overflow:'hidden', position:'relative', width:'100%' }}>
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:100, background:'linear-gradient(90deg,var(--bg),transparent)', zIndex:2, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:0, right:0, bottom:0, width:100, background:'linear-gradient(-90deg,var(--bg),transparent)', zIndex:2, pointerEvents:'none' }}/>
      <div className="rev-pauser" style={{ display:'flex', width:'max-content', animation:`${anim} ${dur} linear infinite`, willChange:'transform' }}>
        {items.map((r, i) => <ReviewCard key={`${direction}-${r.id}-${i}`} review={r} idx={r.id}/>)}
      </div>
    </div>
  )
}

export default function Reviews() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const row1 = REVIEWS.slice(0, 6)
  const row2 = REVIEWS.slice(4)

  return (
    <div style={{ minHeight:'80vh', padding:'60px 0', direction:'rtl', overflow:'hidden' }}>
      <style>{`
        @keyframes scrollLeft  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes scrollRight { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        .rev-pauser:hover { animation-play-state: paused !important; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:48, padding:'0 24px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 18px', borderRadius:20, border:'1px solid rgba(0,212,255,0.3)', background:'rgba(0,212,255,0.06)', marginBottom:18 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 6px var(--cyan)' }}/>
          <span style={{ fontSize:'.68rem', color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2 }}>CUSTOMER REVIEWS</span>
        </div>
        <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:900, color:'var(--text-1)', margin:'0 0 14px' }}>ماذا يقول عملاؤنا؟</h1>
        <p style={{ fontSize:'.98rem', color:'var(--text-3)', maxWidth:440, margin:'0 auto', fontFamily:"'Tajawal',sans-serif", lineHeight:1.8 }}>
          آلاف العملاء يثقون بنا يومياً. اقرأ تجاربهم الحقيقية.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:52, padding:'0 24px', maxWidth:960, margin:'0 auto 52px' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:16, padding:'20px 14px', textAlign:'center', transition:'border-color .2s, transform .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,212,255,0.4)';e.currentTarget.style.transform='translateY(-3px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-1)';e.currentTarget.style.transform='translateY(0)'}}>
            <div style={{ color:'var(--cyan)', marginBottom:8, display:'flex', justifyContent:'center' }}>{s.icon}</div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.25rem', fontWeight:900, color:'var(--cyan)', marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:'.72rem', color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1 — scrolls LEFT */}
      <div className="reviews-carousel-row" style={{ marginBottom:14 }}>
        <CarouselTrack reviews={row1} direction="left"/>
      </div>

      {/* Row 2 — scrolls RIGHT */}
      <div className="reviews-carousel-row" style={{ marginBottom:60 }}>
        <CarouselTrack reviews={row2} direction="right"/>
      </div>

      {/* BestChange */}
      <div style={{ padding:'0 24px', maxWidth:680, margin:'0 auto' }}>
        <div style={{ textAlign:'center', padding:'26px 24px', background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--cyan),transparent)' }}/>
          <div style={{ fontSize:'.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:6, letterSpacing:2 }}>VERIFIED ON</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'1.1rem', color:'var(--cyan)', fontWeight:700, marginBottom:8 }}>BestChange.com</div>
          <p style={{ fontSize:'.82rem', color:'var(--text-3)', margin:0, fontFamily:"'Tajawal',sans-serif", lineHeight:1.7 }}>
            منصتنا مسجلة ومراجعة على BestChange — أكبر مجمع لمقارنة أسعار الصرافات
          </p>
        </div>
      </div>
    </div>
  )
}
