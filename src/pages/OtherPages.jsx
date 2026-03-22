// src/pages/OtherPages.jsx — News + Support + About
import { useState } from 'react'
import useLang from '../context/useLang'
import { NEWS, FAQS } from '../data/currencies'

// ── SVG Icon renderer (replaces emoji strings) ──
const ICON_SVG = {
  trend:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  shield:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  rocket:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>,
  exchange: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  globe:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  report:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  zap:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  lock:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  chat:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  dollar:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  chart:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
}
function RenderIcon({icon, size=18}) {
  if(typeof icon !== 'string') return icon
  return ICON_SVG[icon] || null
}


// ══ NEWS ══
function ArticleModal({ article, onClose }) {
  const { lang } = useLang()
  if (!article) return null
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(10px)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'var(--card)',border:'1px solid var(--border-2)',borderRadius:22,width:'100%',maxWidth:600,maxHeight:'80vh',overflow:'hidden',display:'flex',flexDirection:'column',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)'}}/>
        <div style={{padding:'20px 22px 16px',borderBottom:'1px solid var(--border-1)',display:'flex',alignItems:'flex-start',gap:12}}>
          <span style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,color:'var(--cyan)'}}><RenderIcon icon={article.icon} size={18}/></span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.67rem',color:'var(--cyan)',marginBottom:5}}>{lang==='ar'?article.tagAr:article.tagEn}</div>
            <div style={{fontSize:'1rem',fontWeight:800,lineHeight:1.4}}>{lang==='ar'?article.titleAr:article.titleEn}</div>
            <div style={{fontSize:'0.7rem',color:'var(--text-3)',fontFamily:"'JetBrains Mono',monospace",marginTop:5}}>{article.date}</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:'transparent',border:'1px solid var(--border-1)',color:'var(--text-2)',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,61,90,0.1)';e.currentTarget.style.color='var(--red)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-2)'}}>✕</button>
        </div>
        <div style={{padding:22,overflowY:'auto',fontSize:'0.9rem',color:'var(--text-2)',lineHeight:1.85}}>
          {lang==='ar'?article.bodyAr:article.bodyEn}
        </div>
      </div>
    </div>
  )
}

function NewsCard({ article, onClick }) {
  const { lang } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:'var(--card)',border:`1px solid ${hov?'rgba(0,210,255,0.25)':'var(--border-1)'}`,borderRadius:16,overflow:'hidden',cursor:'pointer',transition:'all 0.25s',transform:hov?'translateY(-4px)':'translateY(0)',boxShadow:hov?'0 14px 40px rgba(0,0,0,0.3)':'none'}}>
      <div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',borderBottom:'1px solid var(--border-1)',background:'linear-gradient(135deg,rgba(0,210,255,0.08),rgba(124,92,252,0.08))'}}>
        <span style={{width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--cyan)'}}><RenderIcon icon={article.icon} size={18}/></span>
      </div>
      <div style={{padding:14}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:'var(--cyan)',marginBottom:6}}>{lang==='ar'?article.tagAr:article.tagEn}</div>
        <div style={{fontSize:'0.88rem',fontWeight:700,marginBottom:6,lineHeight:1.4}}>{lang==='ar'?article.titleAr:article.titleEn}</div>
        <div style={{fontSize:'0.7rem',color:'var(--text-3)',fontFamily:"'JetBrains Mono',monospace"}}>{article.date}</div>
      </div>
    </div>
  )
}

export function News() {
  const { t } = useLang()
  const [selected, setSelected] = useState(null)
  return (
    <div style={{position:'relative',zIndex:2}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'55px 22px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,textTransform:'uppercase',color:'var(--cyan)',marginBottom:11,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)'}}>{t('news_badge')}</div>
          <h2 style={{fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9,direction:'ltr'}}>{t('news_title')}</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
          {NEWS.map((article,i)=><NewsCard key={i} article={article} onClick={()=>setSelected(article)}/>)}
        </div>
      </div>
      <ArticleModal article={selected} onClose={()=>setSelected(null)}/>
    </div>
  )
}

// ══ SUPPORT — مع صور حقيقية ══
function ContactCard({ icon, img, title, desc, onClick }) {
  const [hov, setHov] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:'var(--card)',border:`1px solid ${hov?'rgba(0,210,255,0.25)':'var(--border-1)'}`,borderRadius:16,padding:24,textAlign:'center',cursor:'pointer',transition:'all 0.25s',transform:hov?'translateY(-4px)':'translateY(0)',boxShadow:hov?'0 14px 40px rgba(0,0,0,0.3)':'none'}}>
      <div style={{width:64,height:64,borderRadius:18,background:'var(--cyan-dim)',border:'1px solid rgba(0,210,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',transition:'transform 0.3s',transform:hov?'scale(1.1) rotate(-5deg)':'none',overflow:'hidden'}}>
        {img && !imgErr ? (
          <img src={img} alt={title} onError={()=>setImgErr(true)} style={{width:'72%',height:'72%',objectFit:'contain'}}/>
        ) : (
          <span style={{width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center'}}><RenderIcon icon={icon} size={22}/></span>
        )}
      </div>
      <h3 style={{fontSize:'0.95rem',fontWeight:700,marginBottom:6}}>{title}</h3>
      <p style={{fontSize:'0.8rem',color:'var(--text-2)'}}>{desc}</p>
    </div>
  )
}

export function Support() {
  const { t, lang } = useLang()
  const [openFaq, setOpenFaq] = useState(null)

  const contacts = [
    { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='10' rx='2'/><path d='M9 11V9a3 3 0 016 0v2'/><circle cx='9' cy='15' r='1' fill='var(--cyan)'/><circle cx='15' cy='15' r='1' fill='var(--cyan)'/><line x1='12' y1='3' x2='12' y2='5'/></svg>, img:'/images/chatbot.png',  title:t('support_bot'), desc:t('support_bot_desc'), onClick:()=>{} },
    { icon:'✈️', img:'/images/telegram.png', title:t('support_tg'),  desc:t('support_tg_desc'),  onClick:()=>window.open('https://t.me/Number1Exchange','_blank') },
    { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#25D366' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'/></svg>, img:'/images/whatsapp.png', title:t('support_wa'),  desc:t('support_wa_desc'),  onClick:()=>window.open('https://wa.me/967700000001','_blank') },
  ]

  return (
    <div style={{position:'relative',zIndex:2}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'55px 22px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,textTransform:'uppercase',color:'var(--cyan)',marginBottom:11,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)'}}>{t('support_badge')}</div>
          <h2 style={{fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9,direction:'ltr'}}>{t('support_title')}</h2>
        </div>

        {/* بطاقات التواصل بصور حقيقية */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginBottom:40}}>
          {contacts.map((c,i)=><ContactCard key={i} {...c}/>)}
        </div>

        {/* FAQ */}
        <div style={{background:'var(--card)',border:'1px solid var(--border-1)',borderRadius:20,overflow:'hidden'}}>
          <div style={{padding:'17px 22px',borderBottom:'1px solid var(--border-1)',display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:33,height:33,borderRadius:9,background:'var(--cyan-dim)',border:'1px solid rgba(0,210,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>❓</div>
            <h3 style={{fontSize:'0.92rem',fontWeight:700}}>{t('faq_title')}</h3>
          </div>
          <div style={{padding:'0 22px'}}>
            {FAQS.map((f,i)=>(
              <div key={i} style={{borderBottom:'1px solid var(--border-1)'}}>
                <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0',cursor:'pointer',userSelect:'none',transition:'color 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--cyan)'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--text-1)'}>
                  <span style={{fontWeight:700,fontSize:'0.92rem'}}>{lang==='ar'?f.qAr:f.qEn}</span>
                  <span style={{color:'var(--cyan)',fontSize:'0.8rem',transition:'transform 0.3s',transform:openFaq===i?'rotate(180deg)':'none',flexShrink:0,marginRight:12}}>▾</span>
                </div>
                {openFaq===i && (
                  <div style={{fontSize:'0.85rem',color:'var(--text-2)',lineHeight:1.75,paddingBottom:14,animation:'pageIn 0.3s ease'}}>
                    {lang==='ar'?f.aAr:f.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══ ABOUT ══
const STATS = [
  { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 00-3-3.87'/><path d='M16 3.13a4 4 0 010 7.75'/></svg>, titleAr:'52,000+',    titleEn:'52,000+',       descAr:'مستخدم نشط يثق في منصتنا يومياً',                 descEn:'Active users who trust our platform daily' },
  { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>, titleAr:'ISO 27001',  titleEn:'ISO 27001',     descAr:'شهادة أمان دولية معتمدة',                         descEn:'International certified security standard' },
  { icon:<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='var(--cyan)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'/></svg>, titleAr:'50+ دولة',   titleEn:'50+ Countries', descAr:'تغطية جغرافية واسعة في المنطقة العربية والعالم',  descEn:'Wide geographic coverage across the Arab region and globally' },
]

const TEAM = [
  { nameAr:'أحمد الرشيد',  nameEn:'Ahmed Al-Rashid',  roleAr:'المدير التنفيذي',       roleEn:'CEO',                color:'linear-gradient(135deg,#00d2ff,#7c5cfc)' },
  { nameAr:'سارة محمود',   nameEn:'Sara Mahmoud',     roleAr:'مديرة تقنية المعلومات', roleEn:'CTO',                color:'linear-gradient(135deg,#c8a84b,#f59e0b)' },
  { nameAr:'خالد عبدالله', nameEn:'Khalid Abdullah',  roleAr:'مدير العمليات',         roleEn:'Operations Director', color:'linear-gradient(135deg,#00e5a0,#00b3d9)' },
]

function StatCard({ stat }) {
  const { lang } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:'var(--card)',border:`1px solid ${hov?'rgba(0,210,255,0.2)':'var(--border-1)'}`,borderRadius:20,padding:'26px 22px',textAlign:'center',transition:'all 0.3s',transform:hov?'translateY(-5px)':'translateY(0)',boxShadow:hov?'0 20px 50px rgba(0,0,0,0.3)':'0 2px 12px var(--shadow)'}}>
      <div style={{width:48,height:48,borderRadius:14,background:'var(--cyan-dim)',border:'1px solid rgba(0,210,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><RenderIcon icon={stat.icon} size={22}/></div>
      <h3 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'1.2rem',fontWeight:900,color:'var(--cyan)',marginBottom:8,textShadow:'0 0 18px rgba(0,210,255,0.4)'}}>{lang==='ar'?stat.titleAr:stat.titleEn}</h3>
      <p style={{fontSize:'0.82rem',color:'var(--text-2)',lineHeight:1.6}}>{lang==='ar'?stat.descAr:stat.descEn}</p>
    </div>
  )
}

function TeamCard({ member }) {
  const { lang } = useLang()
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--border-1)',borderRadius:20,padding:'28px 22px',textAlign:'center',transition:'all 0.3s'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,210,255,0.2)';e.currentTarget.style.transform='translateY(-4px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-1)';e.currentTarget.style.transform='translateY(0)'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:member.color,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:'1.8rem',fontWeight:900,color:'#fff'}}>
        {(lang==='ar'?member.nameAr:member.nameEn)[0]}
      </div>
      <h3 style={{fontSize:'1rem',fontWeight:800,marginBottom:6}}>{lang==='ar'?member.nameAr:member.nameEn}</h3>
      <p style={{fontSize:'0.82rem',color:'var(--text-2)'}}>{lang==='ar'?member.roleAr:member.roleEn}</p>
    </div>
  )
}

export function About({ onNavigate }) {
  const { t, lang } = useLang()
  return (
    <div style={{position:'relative',zIndex:2}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'55px 22px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,textTransform:'uppercase',color:'var(--cyan)',marginBottom:11,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)'}}>{t('about_badge')}</div>
          <h2 style={{fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9,direction:'ltr'}}>{t('about_title')}</h2>
        </div>
        {/* الرؤية */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:50,alignItems:'center',marginBottom:60}}>
          <div>
            <div style={{display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,color:'var(--cyan)',marginBottom:14,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)'}}>{t('about_vision')}</div>
            <h3 style={{fontSize:'1.4rem',fontWeight:900,marginBottom:14,lineHeight:1.4}}>{t('about_h')}</h3>
            <p style={{fontSize:'0.9rem',color:'var(--text-2)',lineHeight:1.8,marginBottom:14}}>{t('about_p1')}</p>
            <p style={{fontSize:'0.9rem',color:'var(--text-2)',lineHeight:1.8,marginBottom:22}}>{t('about_p2')}</p>
            <button onClick={()=>onNavigate('home')} style={{padding:'13px 30px',background:'linear-gradient(135deg,#00b8d9,#0086b3)',border:'none',borderRadius:12,color:'#fff',fontFamily:"'Tajawal',sans-serif",fontSize:'1rem',fontWeight:800,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 22px rgba(0,159,192,0.22)'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(0,210,255,0.35)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 22px rgba(0,159,192,0.22)'}}>
              {t('about_btn')}
            </button>
          </div>
          <div style={{background:'var(--card)',border:'1px solid var(--border-1)',borderRadius:20,height:280,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'5rem',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,var(--cyan),transparent)'}}/>
            🏆
          </div>
        </div>
        {/* الإحصائيات */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginBottom:60}}>
          {STATS.map((s,i)=><StatCard key={i} stat={s}/>)}
        </div>
        {/* الفريق */}
        <div>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,color:'var(--cyan)',marginBottom:11,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)'}}>TEAM</div>
            <h2 style={{fontSize:'1.6rem',fontWeight:900}}>{t('about_team')}</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
            {TEAM.map((m,i)=><TeamCard key={i} member={m}/>)}
          </div>
        </div>
      </div>
    </div>
  )
}