// src/pages/Home.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import useLang from "../context/useLang"
import { GooeyText } from "../components/ui/gooey-text-morphing"
import { SEND_METHODS, RECEIVE_METHODS, EXCHANGE_RATES, TRANSFER_INFO } from "../data/currencies"
import useAuth from '../context/useAuth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function CurrencyIcon({ method, size = 26 }) {
  const [imgErr, setImgErr] = useState(false)
  const isWalletType = method.type === 'wallet'
  const showImg = method.img && !imgErr && !isWalletType
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background: showImg?"#fff":method.color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:size*0.38+"px", fontWeight:700, color:"#fff", flexShrink:0, overflow:"hidden", border: showImg?"1.5px solid rgba(0,0,0,0.08)":"none" }}>
      {showImg ? (
        <img src={method.img} alt={method.name} loading="lazy" onError={()=>setImgErr(true)} style={{ width:"78%", height:"78%", objectFit:"contain" }} />
      ) : isWalletType ? (
        <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
          <circle cx="17" cy="16" r="1.5" fill="#fff" stroke="none"/>
        </svg>
      ) : (
        method.symbol
      )}
    </div>
  )
}

const ALL_REVIEWS = [
  { nameAr:"زكريا عمر",     nameEn:"Zakaria Omar",     color:"linear-gradient(135deg,#00d2ff,#7c5cfc)", textAr:"أفضل خدمة تبادل! سريع وموثوق جداً",                   textEn:"Best exchange service! Very fast and reliable" },
  { nameAr:"محتار عدن",     nameEn:"Mokhtar Aden",     color:"linear-gradient(135deg,#c8a84b,#f59e0b)", textAr:"خدمة ممتازة وسريعة، أنصح بها للجميع",                  textEn:"Excellent and fast service, recommend to everyone" },
  { nameAr:"أحمد سالم",     nameEn:"Ahmed Salem",      color:"linear-gradient(135deg,#00e5a0,#00b3d9)", textAr:"تجربة رائعة أنصح بها بشدة، الدعم ممتاز",               textEn:"Wonderful experience, strongly recommend it" },
  { nameAr:"فاطمة الزهراء", nameEn:"Fatima Al-Zahra",  color:"linear-gradient(135deg,#e91e63,#ff6090)", textAr:"تحويل سريع جداً! وصل المبلغ في دقيقتين",               textEn:"Very fast transfer! Amount arrived in two minutes" },
  { nameAr:"محمد الخالدي",  nameEn:"Mohammed Khalidi", color:"linear-gradient(135deg,#f7931a,#ffd700)", textAr:"منصة موثوقة استخدمها منذ سنة ولم أواجه أي مشكلة",      textEn:"Trusted platform, using it for a year with no issues" },
  { nameAr:"نورة القحطاني", nameEn:"Noura Al-Qahtani", color:"linear-gradient(135deg,#9945ff,#c084fc)", textAr:"أسعار ممتازة وسرعة عالية في التنفيذ",                   textEn:"Excellent rates and high execution speed" },
  { nameAr:"عمر الشريف",    nameEn:"Omar Al-Shareef",  color:"linear-gradient(135deg,#0098ea,#38bdf8)", textAr:"خدمة العملاء متجاوبة جداً وحلوا مشكلتي بسرعة",         textEn:"Very responsive customer service, solved my issue quickly" },
  { nameAr:"سارة المنصور",  nameEn:"Sara Al-Mansour",  color:"linear-gradient(135deg,#00c97a,#34d399)", textAr:"أفضل سعر صرف وجدته في السوق حتى الآن",                 textEn:"Best exchange rate I found in the market so far" },
  { nameAr:"خالد البكري",   nameEn:"Khalid Al-Bakri",  color:"linear-gradient(135deg,#ff3d5a,#fb7185)", textAr:"سهل الاستخدام وآمن تماماً، أنصح به",                   textEn:"Easy to use and completely secure, recommended" },
  { nameAr:"ريم الحربي",    nameEn:"Reem Al-Harbi",    color:"linear-gradient(135deg,#c8a84b,#78350f)", textAr:"استخدمته أكثر من 20 مرة ودائماً ممتاز",                 textEn:"Used it more than 20 times, always excellent" },
  { nameAr:"يوسف الأمين",   nameEn:"Yousef Al-Amin",   color:"linear-gradient(135deg,#7c5cfc,#a78bfa)", textAr:"التحويل للجنيه المصري سريع جداً والسعر ممتاز",          textEn:"EGP transfer is very fast and rate is excellent" },
  { nameAr:"منى الغامدي",   nameEn:"Mona Al-Ghamdi",   color:"linear-gradient(135deg,#00d2ff,#0098ea)", textAr:"تعاملت معهم مرات عديدة ولم يخذلوني أبداً",             textEn:"Dealt with them many times, they never let me down" },
  { nameAr:"أنس العتيبي",   nameEn:"Anas Al-Otaibi",   color:"linear-gradient(135deg,#10b981,#34d399)", textAr:"رسوم منخفضة جداً مقارنة بالمنافسين",                   textEn:"Very low fees compared to competitors" },
  { nameAr:"هند الدوسري",   nameEn:"Hind Al-Dosari",   color:"linear-gradient(135deg,#f59e0b,#fcd34d)", textAr:"أنصح كل من يريد تحويل USDT باستخدام هذه المنصة",       textEn:"Recommend to everyone who wants to transfer USDT" },
  { nameAr:"طارق نجيب",     nameEn:"Tarek Najeeb",     color:"linear-gradient(135deg,#6366f1,#818cf8)", textAr:"واجهة سهلة وعملية التحويل لا تأخذ أكثر من 3 دقائق",   textEn:"Easy interface, transfer process takes no more than 3 minutes" },
]
function getRandomReviews(count=3) {
  return [...ALL_REVIEWS].sort(()=>Math.random()-0.5).slice(0,count)
}

const OPERATION_PAIRS = [
  { sendId:"vodafone",  sendName:"فودافون كاش", sendNameEn:"Vodafone Cash", recvId:"mgo-recv",  recvName:"MoneyGo USD", sendColor:"#e40000", recvColor:"#e91e63" },
  { sendId:"instapay",  sendName:"إنستا باي",   sendNameEn:"Instapay",      recvId:"mgo-recv",  recvName:"MoneyGo USD", sendColor:"#1a56db", recvColor:"#e91e63" },
  { sendId:"etisalat",  sendName:"اتصالات كاش", sendNameEn:"Etisalat Cash", recvId:"mgo-recv",  recvName:"MoneyGo USD", sendColor:"#009a44", recvColor:"#e91e63" },
  { sendId:"vodafone",  sendName:"فودافون كاش", sendNameEn:"Vodafone Cash", recvId:"usdt-recv", recvName:"USDT TRC20",  sendColor:"#e40000", recvColor:"#26a17b" },
  { sendId:"usdt-trc",  sendName:"USDT TRC20",  sendNameEn:"USDT TRC20",    recvId:"mgo-recv",  recvName:"MoneyGo USD", sendColor:"#26a17b", recvColor:"#e91e63" },
  { sendId:"mgo-send",  sendName:"MoneyGo USD", sendNameEn:"MoneyGo USD",   recvId:"usdt-recv", recvName:"USDT TRC20",  sendColor:"#e91e63", recvColor:"#26a17b" },
  { sendId:"instapay",  sendName:"إنستا باي",   sendNameEn:"Instapay",      recvId:"usdt-recv", recvName:"USDT TRC20",  sendColor:"#1a56db", recvColor:"#26a17b" },
]
function timeAgo(ms,lang) {
  const d=Math.floor((Date.now()-ms)/1000)
  if(lang==="ar"){if(d<60)return d+" ث";if(d<3600)return Math.floor(d/60)+" د";return Math.floor(d/3600)+" س"}
  if(d<60)return d+"s";if(d<3600)return Math.floor(d/60)+"m";return Math.floor(d/3600)+"h"
}
function maskAmount(n){const s=String(Math.round(n));return s.length>2?s.slice(0,s.length-2)+"**":s[0]+"*"}
function generateOp(){
  const pair=OPERATION_PAIRS[Math.floor(Math.random()*OPERATION_PAIRS.length)]
  const amounts={vodafone:[500,5000],instapay:[300,3000],etisalat:[400,4000],"usdt-trc":[10,500],"mgo-send":[10,300]}
  const [min,max]=amounts[pair.sendId]||[100,1000]
  const amount=Math.floor(Math.random()*(max-min)+min)
  return {id:Math.random().toString(36).slice(2),pair,amount,ts:Date.now()-Math.floor(Math.random()*7200+60)*1000}
}
function seedOperations(){return Array.from({length:5},generateOp).sort((a,b)=>b.ts-a.ts)}

function OpRow({op,lang,isNew}) {
  const {pair,amount}=op
  const sendMethod = SEND_METHODS.find(m=>m.id===pair.sendId)
  const recvMethod = RECEIVE_METHODS.find(m=>m.id===pair.recvId)
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:isNew?"rgba(0,210,255,0.06)":"transparent",transition:"background 1.5s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
        {sendMethod ? <CurrencyIcon method={sendMethod} size={22}/> : <div style={{width:22,height:22,borderRadius:6,background:pair.sendColor,flexShrink:0}}/>}
        <span style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",maxWidth:55,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="ar"?pair.sendName:pair.sendNameEn}</span>
      </div>
      <span style={{color:"rgba(0,210,255,0.3)",fontSize:"0.7rem",flexShrink:0}}>→</span>
      <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:0}}>
        {recvMethod ? <CurrencyIcon method={recvMethod} size={22}/> : <div style={{width:22,height:22,borderRadius:6,background:pair.recvColor,flexShrink:0}}/>}
        <span style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pair.recvName}</span>
      </div>
      <span style={{fontSize:"0.78rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"var(--text-3)",flexShrink:0}}>{maskAmount(amount)}</span>
      <span style={{fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",flexShrink:0,minWidth:30,textAlign:"left"}}>{timeAgo(op.ts,lang)}</span>
    </div>
  )
}

function LiveActivitySidebar() {
  const {lang}=useLang()
  const [ops,setOps]=useState(()=>seedOperations())
  const [newId,setNewId]=useState(null)
  const [,setTick]=useState(0)
  const liveTimerRef=useRef(null)
  const newIdTimerRef=useRef(null)
  useEffect(()=>{const t=setInterval(()=>setTick(p=>p+1),30000);return()=>clearInterval(t)},[])
  useEffect(()=>{
    const schedule=()=>{
      const delay=(Math.random()*5+3)*60*1000
      liveTimerRef.current=window.setTimeout(()=>{
        const op=generateOp(); op.ts=Date.now()
        setOps(prev=>[op,...prev.slice(0,4)])
        setNewId(op.id)
        if(newIdTimerRef.current) window.clearTimeout(newIdTimerRef.current)
        newIdTimerRef.current=window.setTimeout(()=>setNewId(null),2000)
        schedule()
      },delay)
    }
    schedule()
    return()=>{
      if(liveTimerRef.current) window.clearTimeout(liveTimerRef.current)
      if(newIdTimerRef.current) window.clearTimeout(newIdTimerRef.current)
    }
  },[])
  return (
    <div style={{background:"var(--card)",border:"1px solid var(--border-1)",borderRadius:20,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border-1)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:33,height:33,borderRadius:9,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}><svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="laz" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#0086b3"/></linearGradient></defs><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="url(#laz)"/></svg></div>
          <div>
            <div style={{fontSize:"0.88rem",fontWeight:700}}>{lang==="ar"?"آخر العمليات":"Live Activity"}</div>
            <div style={{fontSize:"0.65rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>{lang==="ar"?"مخفية جزئياً للخصوصية":"Partially hidden for privacy"}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.65rem",color:"var(--green)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",animation:"blink 1.2s ease-in-out infinite",display:"inline-block",boxShadow:"0 0 6px var(--green)"}}/>LIVE
        </div>
      </div>
      <div>{ops.map(op=><OpRow key={op.id} op={op} lang={lang} isNew={op.id===newId}/>)}</div>
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--border-1)",background:"rgba(0,210,255,0.02)"}}>
        <div style={{fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <span>{lang==="ar"?"الأرقام مخفية جزئياً لحماية خصوصية المستخدمين":"Amounts partially hidden to protect user privacy"}</span>
        </div>
      </div>
    </div>
  )
}

function ReviewsSidebar() {
  const {lang,t}=useLang()
  const reviews=useMemo(()=>getRandomReviews(3),[])
  return (
    <div style={{background:"var(--card)",border:"1px solid var(--border-1)",borderRadius:20,overflow:"hidden"}}>
      <div style={{padding:"17px 22px",borderBottom:"1px solid var(--border-1)",display:"flex",alignItems:"center",gap:11}}>
        <div style={{width:33,height:33,borderRadius:9,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="str" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd700"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#str)" stroke="#f59e0b" strokeWidth="0.5"/></svg></div>
        <h3 style={{fontSize:"0.92rem",fontWeight:700,flex:1}}>{t("reviews_title")}</h3>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",color:"var(--green)",fontWeight:700}}>4.98/5</span>
      </div>
      {reviews.map((r,ri)=>(
        <div key={ri} style={{padding:"13px 18px",borderBottom:ri<reviews.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
            <div style={{width:31,height:31,borderRadius:9,background:r.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"0.8rem",flexShrink:0,color:"#fff"}}>{(lang==="ar"?r.nameAr:r.nameEn)[0]}</div>
            <span style={{fontSize:"0.83rem",fontWeight:700}}>{lang==="ar"?r.nameAr:r.nameEn}</span>
            <span style={{fontSize:"0.66rem",color:"var(--text-3)",marginRight:"auto",fontFamily:"'JetBrains Mono',monospace"}}>{new Date(Date.now()-Math.floor(Math.random()*30)*86400000).toLocaleDateString("en",{month:"2-digit",day:"2-digit"})}</span>
          </div>
          <div style={{fontSize:"0.78rem",color:"var(--text-2)",paddingRight:40}}>{lang==="ar"?r.textAr:r.textEn}</div>
          <div style={{display:"flex",gap:2,marginTop:3,paddingRight:40}}>
            {[0,1,2,3,4].map(si=>(
              <svg key={si} width="11" height="11" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id={`sr-${ri}-${si}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd700"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#sr-${ri}-${si})`}/></svg>
            ))}
          </div>
        </div>
      ))}
      <button style={{width:"100%",padding:10,background:"transparent",border:"none",borderTop:"1px solid var(--border-1)",fontFamily:"'Tajawal',sans-serif",fontSize:"0.82rem",fontWeight:700,color:"var(--text-2)",cursor:"pointer",transition:"all 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,210,255,0.04)";e.currentTarget.style.color="var(--cyan)"}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text-2)"}}>
        {t("reviews_more")}
      </button>
    </div>
  )
}

const HERO_GOOEY_AR = ["بشكل آمن", "وسهل", "وفوري"]
const HERO_GOOEY_EN = ["Securely", "Easily", "Instantly"]

function HeroSection({onAbout}) {
  const {t, lang}=useLang()
  const gooeyTexts = lang === "ar" ? HERO_GOOEY_AR : HERO_GOOEY_EN
  return (
    <div className="n1-hero-block" style={{textAlign:"center",marginBottom:36}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",border:"1px solid rgba(0,210,255,0.2)",borderRadius:30,background:"rgba(0,210,255,0.05)",fontSize:"0.73rem",color:"var(--cyan)",letterSpacing:1,fontFamily:"'JetBrains Mono',monospace",marginBottom:22}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"blink 1.5s ease-in-out infinite",boxShadow:"0 0 8px var(--cyan)",display:"inline-block"}}/>
        {t("hero_badge")}
      </div>
      <h1 style={{fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:900,marginBottom:0,lineHeight:1.15}}>
        {lang === "ar" ? "تبادل العملات" : "Exchange Currencies"}
      </h1>
      <div style={{position:"relative",height:"80px",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
        <GooeyText texts={gooeyTexts} morphTime={1.2} cooldownTime={1.5} style={{width:"100%"}} textClassName="hero-gooey-text"/>
      </div>
      <p style={{color:"var(--text-2)",fontSize:"0.95rem",maxWidth:520,margin:"0 auto 18px",lineHeight:1.75}}>{t("hero_desc")}</p>
      <button onClick={onAbout} style={{background:"transparent",border:"1px solid var(--border-1)",color:"var(--text-2)",padding:"13px 30px",borderRadius:12,fontFamily:"'Tajawal',sans-serif",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all 0.22s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-2)";e.currentTarget.style.color="var(--text-1)";e.currentTarget.style.background="var(--cyan-dim)"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-1)";e.currentTarget.style.color="var(--text-2)";e.currentTarget.style.background="transparent"}}>
        {t("hero_btn")}
      </button>
    </div>
  )
}

function PromoBanner() {
  const {lang}=useLang()
  const [hov,setHov]=useState(false)
  const [transfers,setTransfers]=useState(0)
  const MAX=10
  const pct=Math.min((transfers/MAX)*100,100)
  const ready=transfers>=MAX
  const waveTop=Math.max(0,(1-pct/100)*52)
  const wave1=`M0,${waveTop} C55,${waveTop-10} 110,${waveTop+10} 165,${waveTop-6} C185,${waveTop-10} 205,${waveTop+6} 220,${waveTop} L220,52 L0,52 Z`
  const wave2=`M0,${waveTop+4} C55,${waveTop+12} 110,${waveTop-6} 165,${waveTop+6} C185,${waveTop+12} 205,${waveTop-4} 220,${waveTop+4} L220,52 L0,52 Z`
  const handleClick=()=>{if(ready) alert(lang==="ar"?"تهانينا! سيتم إضافة البونص لمحفظتك":"Congratulations! Bonus added to your wallet")}
  const circumference=239
  const progressOffset=circumference-(pct/100)*circumference
  return (
    <div className="promo-banner-app" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{display:"flex",flexDirection:"column",gap:0,background:"var(--card)",border:`1px solid ${hov?"rgba(200,168,75,0.32)":"rgba(200,168,75,0.18)"}`,borderRadius:16,padding:"22px 28px",marginBottom:36,position:"relative",overflow:"visible",transition:"border-color .25s,box-shadow .25s",boxShadow:hov?"0 0 0 4px rgba(200,168,75,0.05)":"none",zIndex:2}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#c8a84b 40%,#f59e0b 60%,transparent)",borderRadius:"16px 16px 0 0"}}/>
      <div className="promo-app-main" style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:20,width:"100%"}}>
      <div className="promo-app-visual" style={{flexShrink:0,width:90,height:90}}>
        <svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="pg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#c8a84b"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs>
          <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(200,168,75,0.12)" strokeWidth="6" transform="rotate(-90 45 45)"/>
          <circle cx="45" cy="45" r="38" fill="none" stroke="url(#pg1)" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={progressOffset} strokeLinecap="round" transform="rotate(-90 45 45)" style={{transition:"stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)"}}/>
          <rect x="29" y="46" width="32" height="20" rx="2" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          <rect x="27" y="38" width="36" height="8" rx="2" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          <line x1="45" y1="66" x2="45" y2="38" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" style={{transition:"stroke 0.4s"}}/>
          <path d="M45 38 C42 32 34 32 35 37 C36 40 45 38 45 38Z" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          <path d="M45 38 C48 32 56 32 55 37 C54 40 45 38 45 38Z" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          {transfers>0&&!ready&&(<text x="45" y="70" textAnchor="middle" fontSize="9" fontWeight="700" fill="#c8a84b" fontFamily="'JetBrains Mono',monospace">{transfers}/10</text>)}
          {ready&&(<text x="45" y="70" textAnchor="middle" fontSize="9" fontWeight="700" fill="#f59e0b" fontFamily="monospace">OK</text>)}
        </svg>
      </div>
      <div className="promo-app-body" style={{flex:1,minWidth:220}}>
        <div className="promo-app-head" style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{fontSize:"0.68rem",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"1.2px",color:"var(--gold)",textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",animation:"blink 1.4s ease-in-out infinite",display:"inline-block"}}/>
            {lang==="ar"?"بونص ترحيبي · مستخدم جديد":"Welcome bonus · New users"}
          </div>
          <h3 style={{fontSize:"0.95rem",fontWeight:900,lineHeight:1.25,margin:0,flex:"1 1 200px"}}>
            {lang==="ar"?<>أكمل <span style={{color:"var(--gold)"}}>10 تحويلات</span> — هدية في محفظتك</>:<>Complete <span style={{color:"var(--gold)"}}>10 transfers</span> — wallet gift</>}
          </h3>
        </div>
        <p className="promo-app-desc" style={{fontSize:"0.8rem",color:"var(--text-2)",lineHeight:1.55,margin:"0 0 10px"}}>
          {lang==="ar"?"أكمل 10 عمليات بأي مبلغ — يُضاف البونص تلقائياً لمحفظتك فور الإكمال.":"Complete 10 transfers of any amount — bonus credits to your wallet automatically."}
        </p>
        <div className="promo-app-progress-row" style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
          <div style={{flex:"1 1 140px",background:"rgba(255,255,255,0.05)",borderRadius:20,height:5,overflow:"hidden",minWidth:100}}>
            <div style={{height:"100%",borderRadius:20,background:"linear-gradient(90deg,#c8a84b,#f59e0b)",width:`${pct}%`,transition:"width 0.6s cubic-bezier(.4,0,.2,1)"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
            <span>{`${transfers}/10`}</span>
            <span style={{color:ready?"var(--green)":"var(--text-3)"}}>{ready?(lang==="ar"?"جاهز":"Ready"):(lang==="ar"?`${MAX-transfers} متبقي`:`${MAX-transfers} left`)}</span>
          </div>
        </div>
        <div className="promo-app-tags" style={{display:"flex",flexDirection:"row",flexWrap:"wrap",alignItems:"center",gap:6}}>
          {[{ar:"بونص تلقائي",en:"Auto credit",c:"var(--green)",bg:"rgba(0,229,160,0.1)",b:"rgba(0,229,160,0.2)"},{ar:"بدون حد أدنى",en:"No minimum",c:"var(--cyan)",bg:"rgba(0,210,255,0.1)",b:"rgba(0,210,255,0.2)"},{ar:"لفترة محدودة",en:"Limited time",c:"var(--gold)",bg:"rgba(200,168,75,0.1)",b:"rgba(200,168,75,0.2)"}].map((tag,i)=>(
            <span key={i} style={{fontSize:"0.62rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",padding:"4px 10px",borderRadius:20,background:tag.bg,border:`1px solid ${tag.b}`,color:tag.c,whiteSpace:"nowrap"}}>{lang==="ar"?tag.ar:tag.en}</span>
          ))}
        </div>
      </div>
      <div className="promo-app-aside" style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:7,minWidth:160}}>
        <button onClick={handleClick} style={{position:"relative",overflow:"hidden",width:180,height:50,border:ready?"2px solid rgba(245,158,11,0.8)":"2px solid rgba(200,168,75,0.35)",borderRadius:26,background:"#120e04",cursor:ready?"pointer":"not-allowed",transition:"box-shadow .4s,border-color .4s,transform .2s",boxShadow:ready?"0 0 28px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2)":"none",transform:ready&&hov?"translateY(-2px)":"none",padding:0}}>
          <div style={{position:"absolute",bottom:0,left:"-5%",width:"110%",height:"100%",pointerEvents:"none"}}>
            <svg viewBox="0 0 220 52" preserveAspectRatio="none" style={{width:"100%",height:"100%",display:"block"}}>
              <defs>
                <linearGradient id="wgPB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(255,200,50,0.95)"/><stop offset="60%" stopColor="rgba(245,158,11,0.95)"/><stop offset="100%" stopColor="rgba(180,90,0,0.98)"/></linearGradient>
                <clipPath id="btnClip"><rect x="0" y="0" width="220" height="52" rx="26"/></clipPath>
              </defs>
              <g clipPath="url(#btnClip)">
                <path fill="url(#wgPB)" style={{transition:"d 0s"}}><animate attributeName="d" dur="1.9s" repeatCount="indefinite" values={`${wave1};${wave2};${wave1}`}/></path>
              </g>
            </svg>
          </div>
          <div style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",gap:7,height:"100%",color:ready?"#000":"rgba(200,168,75,0.5)",fontWeight:800,fontSize:"0.83rem",fontFamily:"'Tajawal',sans-serif",transition:"color 0.5s"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
            {ready?(lang==="ar"?"استلم هديتك!":"Claim Bonus!"):(lang==="ar"?"احصل على البونص":"Get Bonus")}
          </div>
        </button>
        <span style={{fontSize:"0.64rem",color:ready?"var(--green)":"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",transition:"color 0.4s",textAlign:"center"}}>{ready?(lang==="ar"?"اضغط لاستلام الهدية":"Tap to claim"):(lang==="ar"?"مجاناً · بلا شروط":"Free · No strings")}</span>
      </div>
      </div>
    </div>
  )
}

// ══ Wallet Banner ══
function WalletBannerV3({ onOpenAuth }) {
  const { lang } = useLang()
  const { user } = useAuth()
  const [hov, setHov] = useState(false)
  if (user) return null
  return (
    <div className="wallet-banner-mob" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:16,padding:"14px 20px",width:"789px",minHeight:0,maxWidth:"100%",textAlign:"right",justifyContent:"space-between",boxSizing:"border-box",borderRadius:16,background:"var(--card)",border:"1px solid var(--border-1)",transition:"border-color .25s,background .25s,box-shadow .25s",boxShadow:hov?"0 0 0 3px rgba(0,210,255,0.05)":"none",position:"relative",zIndex:2}}>
      <div className="wallet-banner-mob__lead" style={{display:"flex",alignItems:"center",gap:14,flex:"1 1 260px",minWidth:0}}>
        <div style={{width:54,height:54,borderRadius:14,flexShrink:0,background:"rgba(0,210,255,0.08)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .3s",transform:hov?"scale(1.07) rotate(-5deg)":"none"}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <defs><linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--cyan)"/><stop offset="100%" stopColor="var(--purple)"/></linearGradient></defs>
            <path d="M21 12V7H5a2 2 0 010-4h14v4" stroke="url(#wbg)" strokeWidth="1.7"/>
            <path d="M3 5v14a2 2 0 002 2h16v-5" stroke="url(#wbg)" strokeWidth="1.7"/>
            <path d="M18 12a2 2 0 000 4h4v-4z" stroke="url(#wbg)" strokeWidth="1.7"/>
          </svg>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:"0.92rem",fontWeight:800,color:"var(--text-1)"}}>{lang==="ar"?"محفظة Number 1 — آمنة وسريعة":"Number 1 Wallet — fast & secure"}</span>
            <span style={{fontSize:"0.58rem",fontWeight:700,letterSpacing:"1.5px",border:"1px solid rgba(0,210,255,0.22)",padding:"2px 9px",borderRadius:20,background:"linear-gradient(90deg,var(--cyan),var(--purple))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>FREE</span>
          </div>
          <p style={{fontSize:"0.76rem",color:"var(--text-3)",lineHeight:1.55,margin:0}}>{lang==="ar"?"تخزين وتحويل بالجنيه أو USDT · شحن بالبطاقة متاح · بلا رسوم تفعيل.":"Hold & transfer EGP or USDT · optional card top-up · zero activation fees."}</p>
        </div>
      </div>
      <div className="wallet-banner-mob__features" style={{display:"flex",flexDirection:"row",flexWrap:"wrap",alignItems:"center",gap:8,flex:"2 1 320px",justifyContent:"center"}}>
        {[
          {bg:"rgba(0,229,160,0.07)",border:"rgba(0,229,160,0.13)",titleAr:"فوري",titleEn:"Instant",subAr:"ثوانٍ",subEn:"Seconds",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>},
          {bg:"rgba(0,210,255,0.06)",border:"rgba(0,210,255,0.12)",titleAr:"AES-256",titleEn:"AES-256",subAr:"تشفير",subEn:"Encrypted",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>},
          {bg:"rgba(245,158,11,0.06)",border:"rgba(245,158,11,0.12)",titleAr:"بطاقة",titleEn:"Card",subAr:"Visa / MC",subEn:"Visa / MC",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>},
        ].map((f,i)=>(
          <div key={i} className="wallet-banner-mob__feat" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 12px",flex:"0 1 auto",minWidth:0,background:f.bg,border:`1px solid ${f.border}`,borderRadius:12}}>
            <span style={{display:"flex",flexShrink:0}}>{f.icon}</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"0.76rem",fontWeight:800,color:"var(--text-1)",lineHeight:1.2}}>{lang==="ar"?f.titleAr:f.titleEn}</div>
              <div style={{fontSize:"0.62rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>{lang==="ar"?f.subAr:f.subEn}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="wallet-banner-mob__cta" style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <button onClick={()=>onOpenAuth('register')} style={{padding:"12px 26px",background:"linear-gradient(135deg,var(--cyan),var(--purple))",border:"none",borderRadius:11,color:"#000",fontWeight:800,fontSize:"0.87rem",fontFamily:"'Tajawal',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap",boxShadow:hov?"0 8px 26px rgba(0,210,255,0.34)":"0 4px 16px rgba(0,210,255,0.18)",transition:"transform .2s,box-shadow .2s",transform:hov?"translateY(-2px)":"none"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>
          {lang==="ar"?"إنشاء محفظة":"Create Wallet"}
        </button>
        <span style={{fontSize:"0.62rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",textAlign:"center"}}>{lang==="ar"?"مجاني بالكامل":"100% free"}</span>
      </div>
    </div>
  )
}

const WalletBanner = WalletBannerV3

// ══ Exchange CTA — يوجه المستخدم لصفحة الاختيار ══
function ExchangeForm() {
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <div className="ex-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>💱</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)', marginBottom: 10, fontFamily: "'Tajawal',sans-serif" }}>
        {lang === 'ar' ? 'ابدأ عملية التبادل' : 'Start Exchange'}
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
        {lang === 'ar'
          ? 'اختر وسيلة الإرسال والاستلام وابدأ عملية التبادل بخطوات بسيطة'
          : 'Choose your send and receive method and start exchanging in simple steps'}
      </p>
      <button
        onClick={() => navigate('/exchange')}
        className="ex-submit-btn"
        style={{ maxWidth: 320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 014-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
        {lang === 'ar' ? 'ابدأ التبادل الآن' : 'Start Exchange Now'}
      </button>

      {/* عرض الأزواج المتاحة */}
      <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {[
          { from: 'فودافون كاش', to: 'MoneyGo USD', color: '#e40000' },
          { from: 'إنستا باي', to: 'MoneyGo USD', color: '#1a56db' },
          { from: 'USDT TRC20', to: 'MoneyGo USD', color: '#26a17b' },
          { from: 'MoneyGo USD', to: 'USDT TRC20', color: '#e91e63' },
        ].map((pair, i) => (
          <div key={i} onClick={() => navigate('/exchange')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
            background: 'var(--row-bg)', border: '1px solid var(--border-1)',
            fontSize: '0.72rem', color: 'var(--text-2)',
            fontFamily: "'Tajawal',sans-serif", fontWeight: 600,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = pair.color; e.currentTarget.style.color = 'var(--text-1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.color = 'var(--text-2)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: pair.color, flexShrink: 0 }} />
            {pair.from} → {pair.to}
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({feature,lang}) {
  const [hov,setHov]=useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:"var(--card)",border:`1px solid ${hov?"rgba(0,210,255,0.2)":"var(--border-1)"}`,borderRadius:20,padding:"26px 22px",textAlign:"center",transition:"all 0.3s",transform:hov?"translateY(-5px)":"translateY(0)",boxShadow:hov?"0 20px 50px rgba(0,0,0,0.3)":"0 2px 12px var(--shadow)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:"25%",width:"50%",height:1,background:"linear-gradient(90deg,transparent,var(--cyan),transparent)",opacity:hov?1:0,transition:"opacity 0.3s"}}/>
      <div style={{width:62,height:62,borderRadius:18,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 17px",transition:"transform 0.3s",transform:hov?"scale(1.1) rotate(4deg)":"none"}}>{feature.icon}</div>
      <h3 style={{fontSize:"0.92rem",fontWeight:800,marginBottom:8}}>{lang==="ar"?feature.titleAr:feature.titleEn}</h3>
      <p style={{fontSize:"0.8rem",color:"var(--text-2)",lineHeight:1.7}}>{lang==="ar"?feature.descAr:feature.descEn}</p>
    </div>
  )
}

function FeaturesSection() {
  const {t,lang}=useLang()
  const FEATURES=[
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fz" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#0086b3"/></linearGradient></defs><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="url(#fz)" opacity="0.9"/></svg>,titleAr:"معاملات فورية",titleEn:"Instant Transactions",descAr:"تتم عمليات التبادل خلال ثوانٍ مع تأكيد فوري وإشعارات لحظية",descEn:"Exchanges complete in seconds with real-time confirmation and instant alerts"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#0066aa"/></linearGradient></defs><rect x="3" y="11" width="18" height="11" rx="2.5" fill="url(#fl)" opacity="0.85"/><path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round"/></svg>,titleAr:"أمان عالي المستوى",titleEn:"High-Level Security",descAr:"تشفير AES-256 وحماية متعددة الطبقات لضمان سلامة أموالك وبياناتك",descEn:"AES-256 encryption with multi-layer protection for your funds and data"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#7c5cfc"/></linearGradient></defs><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="url(#fc)" opacity="0.85"/></svg>,titleAr:"دعم 24/7",titleEn:"24/7 Support",descAr:"فريق متخصص متاح على مدار الساعة عبر الدردشة والبريد والتيليجرام",descEn:"Our dedicated team is available 24/7 via live chat and Telegram"},
    {icon:<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5a0"/><stop offset="100%" stopColor="#00b3d9"/></linearGradient></defs><circle cx="13" cy="13" r="12" fill="url(#fd)" opacity="0.15"/><circle cx="13" cy="13" r="12" fill="none" stroke="var(--green)" strokeWidth="1.5"/><text x="13" y="18" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--green)" fontFamily="sans-serif">$</text></svg>,titleAr:"أفضل الأسعار",titleEn:"Best Rates",descAr:"رسوم تنافسية تبدأ من 0.1% فقط مع أفضل أسعار الصرف في السوق",descEn:"Competitive fees from 0.1% with the best exchange rates on the market"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="fg" cx="35%" cy="35%"><stop offset="0%" stopColor="rgba(0,210,255,0.3)"/><stop offset="100%" stopColor="rgba(0,100,180,0.15)"/></radialGradient></defs><circle cx="12" cy="12" r="10" fill="url(#fg)"/><circle cx="12" cy="12" r="10" fill="none" stroke="var(--cyan)" strokeWidth="1.5"/></svg>,titleAr:"تغطية عالمية",titleEn:"Global Coverage",descAr:"خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل للعملات الرقمية",descEn:"Our services available in 50+ countries with full crypto support"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#004466"/></linearGradient></defs><rect x="4" y="14" width="4" height="7" rx="1" fill="url(#fch)" opacity="0.7"/><rect x="10" y="8" width="4" height="13" rx="1" fill="url(#fch)" opacity="0.85"/><rect x="16" y="4" width="4" height="17" rx="1" fill="url(#fch)"/></svg>,titleAr:"أزواج متنوعة",titleEn:"Diverse Pairs",descAr:"أكثر من 50 زوج تبادل متاح بين العملات الرقمية والمحافظ الإلكترونية",descEn:"A wide range of trading pairs between digital currencies and e-wallets"},
  ]
  return (
    <div style={{marginTop:60,position:"relative",top:-14,display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"flex-end",alignItems:"flex-start",color:"var(--text-1)",textAlign:"right"}}>
      <div style={{textAlign:"center",marginBottom:48,width:"100%"}}>
        <div style={{display:"inline-block",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",letterSpacing:3,textTransform:"uppercase",color:"var(--cyan)",marginBottom:11,padding:"3px 11px",border:"1px solid rgba(0,210,255,0.14)",borderRadius:20,background:"rgba(0,210,255,0.04)"}}>{t("features_badge")}</div>
        <h2 style={{fontSize:"clamp(1.55rem,2.8vw,2.3rem)",fontWeight:900,marginBottom:9,direction:lang==="ar"?"rtl":"ltr"}}>{t("features_title")}</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,width:"100%"}}>
        {FEATURES.map((f,i)=><FeatureCard key={i} feature={f} lang={lang}/>)}
      </div>
    </div>
  )
}

function Home({ onOpenAuth }) {
  const navigate = useNavigate()
  return (
    <div style={{ position:'relative', zIndex:2 }}>
      <section style={{ padding:'45px 0 0' }}>
        <div className="mobile-home-root n1-home-shell" style={{ maxWidth:1200, margin:'0 auto', padding:'0 22px' }}>
          <div className="mobile-order-hero">
            <HeroSection onAbout={() => navigate("/about")} />
          </div>
          <div className="mobile-order-promo"><PromoBanner /></div>
          <div className="mobile-home-layout" style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20, alignItems:'start' }}>
            <div className="mobile-order-exchange" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <ExchangeForm />
              <WalletBanner onOpenAuth={onOpenAuth} />
            </div>
            <div className="mobile-order-sidebars mobile-sidebars-col" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <ReviewsSidebar />
              <LiveActivitySidebar />
            </div>
          </div>
          <div className="mobile-order-features"><FeaturesSection /></div>
        </div>
      </section>
    </div>
  )
}

export default Home