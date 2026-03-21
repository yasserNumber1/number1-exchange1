// src/pages/OtherPages.jsx — News + Support + About
import { useState } from 'react'
import useLang from '../context/useLang'
import { NEWS, FAQS } from '../data/currencies'

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
          <span style={{fontSize:'2rem',flexShrink:0,marginTop:2}}>{article.icon}</span>
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
        {article.icon}
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
          <h2 style={{fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9}}>{t('news_title')}</h2>
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
          <span style={{fontSize:'1.6rem'}}>{icon}</span>
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
    { icon:'🤖', img:'/images/chatbot.png',  title:t('support_bot'), desc:t('support_bot_desc'), onClick:()=>{} },
    { icon:'✈️', img:'/images/telegram.png', title:t('support_tg'),  desc:t('support_tg_desc'),  onClick:()=>window.open('https://t.me/Number1Exchange','_blank') },
    { icon:'📱', img:'/images/whatsapp.png', title:t('support_wa'),  desc:t('support_wa_desc'),  onClick:()=>window.open('https://wa.me/967700000001','_blank') },
  ]

  return (
    <div style={{position:'relative',zIndex:2}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'55px 22px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,textTransform:'uppercase',color:'var(--cyan)',marginBottom:11,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)'}}>{t('support_badge')}</div>
          <h2 style={{fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9}}>{t('support_title')}</h2>
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
  { icon:'📈', titleAr:'6,753+',    titleEn:'6,753+',       descAr:'مستخدم نشط يثق في منصتنا يومياً',                 descEn:'Active users who trust our platform daily' },
  { icon:'🔐', titleAr:'ISO 27001',  titleEn:'ISO 27001',     descAr:'شهادة أمان دولية معتمدة',                         descEn:'International certified security standard' },
  { icon:'🌍', titleAr:'6+ دولة',   titleEn:'6+ Countries', descAr:'تغطية جغرافية واسعة في المنطقة العربية والعالم',  descEn:'Wide geographic coverage across the Arab region and globally' },
]

const TEAM = [
  { nameAr:'أحمد الرشيد',  nameEn:'Ahmed Al-Rashid',  roleAr:'المدير التنفيذي',       roleEn:'CEO',                color:'linear-gradient(135deg,#00d2ff,#7c5cfc)' },
  { nameAr:'كرم محمود',   nameEn:'Karam Mahmoud',     roleAr:'مديرة تقنية المعلومات', roleEn:'CTO',                color:'linear-gradient(135deg,#c8a84b,#f59e0b)' },
  { nameAr:'خالد عبدالله', nameEn:'Khalid Abdullah',  roleAr:'مدير العمليات',         roleEn:'Operations Director', color:'linear-gradient(135deg,#00e5a0,#00b3d9)' },
]

function StatCard({ stat }) {
  const { lang } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:'var(--card)',border:`1px solid ${hov?'rgba(0,210,255,0.2)':'var(--border-1)'}`,borderRadius:20,padding:'26px 22px',textAlign:'center',transition:'all 0.3s',transform:hov?'translateY(-5px)':'translateY(0)',boxShadow:hov?'0 20px 50px rgba(0,0,0,0.3)':'none'}}>
      <div style={{fontSize:'2rem',marginBottom:12}}>{stat.icon}</div>
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
          <h2 style={{fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9}}>{t('about_title')}</h2>
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