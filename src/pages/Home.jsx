// src/pages/Home.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import useLang from "../context/useLang"
import { SEND_METHODS, RECEIVE_METHODS, EXCHANGE_RATES, TRANSFER_INFO } from "../data/currencies"

// ══ Currency Icon — صورة حقيقية مع fallback للدائرة الملونة ══
function CurrencyIcon({ method, size = 26 }) {
  const [imgErr, setImgErr] = useState(false)
  const showImg = method.img && !imgErr
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background: showImg?"#fff":method.color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:size*0.38+"px", fontWeight:700, color:"#fff", flexShrink:0, overflow:"hidden", border: showImg?"1.5px solid rgba(0,0,0,0.08)":"none" }}>
      {showImg ? (
        <img src={method.img} alt={method.name} onError={()=>setImgErr(true)} style={{ width:"78%", height:"78%", objectFit:"contain" }} />
      ) : (
        method.symbol
      )}
    </div>
  )
}

// ══ قاعدة التعليقات ══
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

// ══ Live Activity ══
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

// ══ OpRow — صف عملية واحدة مع صورة ══
function OpRow({op,lang,isNew}) {
  const {pair,amount}=op
  const sendMethod = SEND_METHODS.find(m=>m.id===pair.sendId)
  const recvMethod = RECEIVE_METHODS.find(m=>m.id===pair.recvId)
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:isNew?"rgba(0,210,255,0.06)":"transparent",transition:"background 1.5s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
        {sendMethod
          ? <CurrencyIcon method={sendMethod} size={22}/>
          : <div style={{width:22,height:22,borderRadius:6,background:pair.sendColor,flexShrink:0}}/>
        }
        <span style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",maxWidth:55,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="ar"?pair.sendName:pair.sendNameEn}</span>
      </div>
      <span style={{color:"rgba(0,210,255,0.3)",fontSize:"0.7rem",flexShrink:0}}>→</span>
      <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:0}}>
        {recvMethod
          ? <CurrencyIcon method={recvMethod} size={22}/>
          : <div style={{width:22,height:22,borderRadius:6,background:pair.recvColor,flexShrink:0}}/>
        }
        <span style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pair.recvName}</span>
      </div>
      <span style={{fontSize:"0.78rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,255,255,0.5)",flexShrink:0}}>{maskAmount(amount)}</span>
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
        const op=generateOp()
        op.ts=Date.now()
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg><span>{lang==="ar"?"الأرقام مخفية جزئياً لحماية خصوصية المستخدمين":"Amounts partially hidden to protect user privacy"}</span>
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
          <div style={{fontSize:"0.7rem",paddingRight:40,marginTop:3}}>
          <div style={{display:"flex",gap:2,marginTop:3}}>
            {[0,1,2,3,4].map(si=>(
              <svg key={si} width="11" height="11" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id={`sr-${ri}-${si}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd700"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#sr-${ri}-${si})`}/></svg>
            ))}
          </div>
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

function HeroSection({onAbout}) {
  const {t}=useLang()
  const [counts,setCounts]=useState({users:0,tx:0,pairs:0})
  useEffect(()=>{
    const targets={users:52000,tx:980000,pairs:50}; let step=0
    const timer=setInterval(()=>{step++;const p=step/60;setCounts({users:Math.floor(targets.users*p),tx:Math.floor(targets.tx*p),pairs:Math.floor(targets.pairs*p)});if(step>=60)clearInterval(timer)},25)
    return()=>clearInterval(timer)
  },[])
  const fmt=n=>n>=1000?(n/1000).toFixed(1)+"K":n+""
  return (
    <div style={{textAlign:"center",marginBottom:36}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 14px",border:"1px solid rgba(0,210,255,0.2)",borderRadius:30,background:"rgba(0,210,255,0.05)",fontSize:"0.73rem",color:"var(--cyan)",letterSpacing:1,fontFamily:"'JetBrains Mono',monospace",marginBottom:22}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"blink 1.5s ease-in-out infinite",boxShadow:"0 0 8px var(--cyan)",display:"inline-block"}}/>
        {t("hero_badge")}
      </div>
      <h1 style={{fontSize:"clamp(1.8rem,3.5vw,2.8rem)",fontWeight:900,marginBottom:12,lineHeight:1.2}}>
        {t("hero_title")}
        <span style={{fontFamily:"'Orbitron',sans-serif",background:"linear-gradient(90deg,var(--cyan),var(--purple))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginRight:10}}> NUMBER 1</span>
      </h1>
      <p style={{color:"var(--text-2)",fontSize:"0.95rem",maxWidth:520,margin:"0 auto 18px",lineHeight:1.75}}>{t("hero_desc")}</p>
      <button onClick={onAbout} style={{background:"transparent",border:"1px solid var(--border-1)",color:"var(--text-2)",padding:"13px 30px",borderRadius:12,fontFamily:"'Tajawal',sans-serif",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all 0.22s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border-2)";e.currentTarget.style.color="var(--text-1)";e.currentTarget.style.background="var(--cyan-dim)"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-1)";e.currentTarget.style.color="var(--text-2)";e.currentTarget.style.background="transparent"}}>
        {t("hero_btn")}
      </button>
      <div style={{display:"flex",gap:30,justifyContent:"center",marginTop:26}}>
        {[{val:fmt(counts.users),label:t("hero_users")},{val:fmt(counts.tx)+"+",label:t("hero_tx")},{val:counts.pairs+"+",label:t("hero_pairs")}].map((k,i)=>(
          <div key={i}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.5rem",fontWeight:700,color:"var(--cyan)",display:"block",textShadow:"0 0 18px rgba(0,210,255,0.5)"}}>{k.val}</span>
            <div style={{fontSize:"0.7rem",color:"var(--text-3)",marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>
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

  // حساب ارتفاع الموجة — الماء يبدأ من الأسفل ويرتفع
  const waveTop=Math.max(0,(1-pct/100)*52)

  const wave1=`M0,${waveTop} C55,${waveTop-10} 110,${waveTop+10} 165,${waveTop-6} C185,${waveTop-10} 205,${waveTop+6} 220,${waveTop} L220,52 L0,52 Z`
  const wave2=`M0,${waveTop+4} C55,${waveTop+12} 110,${waveTop-6} 165,${waveTop+6} C185,${waveTop+12} 205,${waveTop-4} 220,${waveTop+4} L220,52 L0,52 Z`

  const handleClick=()=>{
    if(ready) alert(lang==="ar"?"🎉 تهانينا! سيتم إضافة البونص لمحفظتك":"🎉 Congratulations! Bonus added to your wallet")
  }

  // حساب strokeDashoffset للدائرة — 239 = محيط الدائرة كامل
  const circumference=239
  const progressOffset=circumference-(pct/100)*circumference

  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex",alignItems:"center",gap:24,
        background:"var(--card)",
        border:`1px solid ${hov?"rgba(200,168,75,0.32)":"rgba(200,168,75,0.18)"}`,
        borderRadius:16,padding:"22px 28px",
        marginBottom:36,position:"relative",overflow:"hidden",
        transition:"border-color .25s,box-shadow .25s",
        boxShadow:hov?"0 0 0 4px rgba(200,168,75,0.05)":"none",
      }}>
      {/* خط علوي */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#c8a84b 40%,#f59e0b 60%,transparent)"}}/>

      {/* دائرة الهدية مع تقدم ديناميكي */}
      <div style={{flexShrink:0,width:90,height:90}}>
        <svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pg1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c8a84b"/>
              <stop offset="100%" stopColor="#f59e0b"/>
            </linearGradient>
          </defs>
          <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(200,168,75,0.12)" strokeWidth="6" transform="rotate(-90 45 45)"/>
          <circle cx="45" cy="45" r="38" fill="none" stroke="url(#pg1)" strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={progressOffset}
            strokeLinecap="round" transform="rotate(-90 45 45)"
            style={{transition:"stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)"}}/>
          <rect x="29" y="46" width="32" height="20" rx="2" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          <rect x="27" y="38" width="36" height="8" rx="2" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          <line x1="45" y1="66" x2="45" y2="38" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" style={{transition:"stroke 0.4s"}}/>
          <path d="M45 38 C42 32 34 32 35 37 C36 40 45 38 45 38Z" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          <path d="M45 38 C48 32 56 32 55 37 C54 40 45 38 45 38Z" fill="none" stroke={ready?"#f59e0b":"rgba(200,168,75,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"stroke 0.4s"}}/>
          {/* نص التقدم في المركز */}
          {transfers>0&&!ready&&(
            <text x="45" y="70" textAnchor="middle" fontSize="9" fontWeight="700" fill="#c8a84b" fontFamily="'JetBrains Mono',monospace">{transfers}/10</text>
          )}
          {ready&&(
            <text x="45" y="70" textAnchor="middle" fontSize="9" fontWeight="700" fill="#f59e0b" fontFamily="monospace">✓</text>
          )}
        </svg>
      </div>

      {/* النص */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:"0.68rem",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"2px",color:"var(--gold)",textTransform:"uppercase",marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",animation:"blink 1.4s ease-in-out infinite",display:"inline-block"}}/>
          {lang==="ar"?"عرض حصري للمستخدمين الجدد":"Exclusive Offer for New Users"}
        </div>
        <h3 style={{fontSize:"0.95rem",fontWeight:900,lineHeight:1.3,marginBottom:6}}>
          {lang==="ar"
            ?<>أكمل <span style={{color:"var(--gold)"}}>10 تحويلات</span> واحصل على هدية مجانية في محفظتك</>
            :<>Complete <span style={{color:"var(--gold)"}}>10 transfers</span> and get a free gift in your wallet</>}
        </h3>
        <p style={{fontSize:"0.8rem",color:"var(--text-2)",lineHeight:1.65,marginBottom:12}}>
          {lang==="ar"
            ?"كل مستخدم جديد يُكمل 10 عمليات تحويل بأي مبلغ يحصل فوراً على بونص يُضاف تلقائياً لمحفظته."
            :"Every new user who completes 10 transfers of any amount instantly receives a bonus added to their wallet."}
        </p>
        {/* شريط التقدم */}
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:20,height:5,overflow:"hidden",marginBottom:5}}>
          <div style={{height:"100%",borderRadius:20,background:"linear-gradient(90deg,#c8a84b,#f59e0b)",width:`${pct}%`,transition:"width 0.6s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:13}}>
          <span>{lang==="ar"?`تقدّمك: ${transfers} / 10`:`Progress: ${transfers} / 10`}</span>
          <span style={{color:ready?"var(--green)":"var(--text-3)"}}>
            {ready
              ?(lang==="ar"?"✓ اكتمل!":"✓ Complete!")
              :(lang==="ar"?`${MAX-transfers} متبقية`:`${MAX-transfers} remaining`)}
          </span>
        </div>
        {/* شارات */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[
            {ar:"بونص تلقائي",en:"Auto Bonus",c:"var(--green)",bg:"rgba(0,229,160,0.1)",b:"rgba(0,229,160,0.2)"},
            {ar:"بدون حد أدنى",en:"No Minimum",c:"var(--cyan)",bg:"rgba(0,210,255,0.1)",b:"rgba(0,210,255,0.2)"},
            {ar:"عرض محدود",en:"Limited Offer",c:"var(--gold)",bg:"rgba(200,168,75,0.1)",b:"rgba(200,168,75,0.2)"},
          ].map((tag,i)=>(
            <span key={i} style={{fontSize:"0.62rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",padding:"2px 9px",borderRadius:20,background:tag.bg,border:`1px solid ${tag.b}`,color:tag.c}}>
              {lang==="ar"?tag.ar:tag.en}
            </span>
          ))}
        </div>
      </div>

      {/* زر الماء V2 Gold Lava */}
      <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
        <button
          onClick={handleClick}
          style={{
            position:"relative",overflow:"hidden",
            width:180,height:50,
            border:ready?"2px solid rgba(245,158,11,0.8)":"2px solid rgba(200,168,75,0.35)",
            borderRadius:26,
            background:"#120e04",
            cursor:ready?"pointer":"not-allowed",
            transition:"box-shadow .4s,border-color .4s,transform .2s",
            boxShadow:ready?"0 0 28px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2)":"none",
            transform:ready&&hov?"translateY(-2px)":"none",
            padding:0,
          }}>
          {/* طبقة الماء */}
          <div style={{position:"absolute",bottom:0,left:"-5%",width:"110%",height:"100%",pointerEvents:"none"}}>
            <svg viewBox="0 0 220 52" preserveAspectRatio="none" style={{width:"100%",height:"100%",display:"block"}}>
              <defs>
                <linearGradient id="wgPB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,200,50,0.95)"/>
                  <stop offset="60%" stopColor="rgba(245,158,11,0.95)"/>
                  <stop offset="100%" stopColor="rgba(180,90,0,0.98)"/>
                </linearGradient>
                <clipPath id="btnClip">
                  <rect x="0" y="0" width="220" height="52" rx="26"/>
                </clipPath>
              </defs>
              <g clipPath="url(#btnClip)">
                <path fill="url(#wgPB)" style={{transition:"d 0s"}}>
                  <animate attributeName="d" dur="1.9s" repeatCount="indefinite"
                    values={`${wave1};${wave2};${wave1}`}/>
                </path>
                {/* فقاعات */}
                {pct>10&&<circle cx="40" cy={waveTop-5} r="2.2" fill="rgba(255,240,150,0.5)">
                  <animate attributeName="cy" dur="2s" repeatCount="indefinite" values={`${waveTop-5};${waveTop-14};${waveTop-5}`}/>
                  <animate attributeName="r" dur="2s" repeatCount="indefinite" values="2.2;0.6;2.2"/>
                </circle>}
                {pct>30&&<circle cx="120" cy={waveTop-3} r="1.6" fill="rgba(255,240,150,0.4)">
                  <animate attributeName="cy" dur="2.6s" repeatCount="indefinite" values={`${waveTop-3};${waveTop-13};${waveTop-3}`}/>
                </circle>}
                {pct>50&&<circle cx="175" cy={waveTop-7} r="2.5" fill="rgba(255,240,150,0.45)">
                  <animate attributeName="cy" dur="1.7s" repeatCount="indefinite" values={`${waveTop-7};${waveTop-17};${waveTop-7}`}/>
                  <animate attributeName="r" dur="1.7s" repeatCount="indefinite" values="2.5;0.8;2.5"/>
                </circle>}
                {/* بريق الضوء */}
                {pct>5&&<ellipse cx="100" cy={waveTop+8} rx="40" ry="3.5" fill="rgba(255,230,100,0.1)">
                  <animate attributeName="cx" dur="2.8s" repeatCount="indefinite" values="100;130;100"/>
                </ellipse>}
              </g>
            </svg>
          </div>
          {/* النص */}
          <div style={{
            position:"relative",zIndex:10,
            display:"flex",alignItems:"center",justifyContent:"center",gap:7,
            height:"100%",
            color:ready?"#000":"rgba(200,168,75,0.5)",
            fontWeight:800,fontSize:"0.83rem",
            fontFamily:"'Tajawal',sans-serif",
            transition:"color 0.5s",
            textShadow:ready?"none":"none",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
            </svg>
            {ready
              ?(lang==="ar"?"🎉 استلم هديتك!":"🎉 Claim Bonus!")
              :(lang==="ar"?"احصل على البونص":"Get Bonus")}
          </div>
        </button>
        <span style={{fontSize:"0.64rem",color:ready?"var(--green)":"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",transition:"color 0.4s"}}>
          {ready
            ?(lang==="ar"?"✓ مكتمل — اضغط لاستلام هديتك":"✓ Complete — click to claim")
            :(lang==="ar"?"سجّل مجاناً · لا شروط":"Free signup · No conditions")}
        </span>
      </div>
    </div>
  )
}

// ══ Currency Inline Dropdown — قائمة منسدلة بسيطة داخل الصفحة ══
function CurrencyInlineDropdown({options, selected, onSelect, open, onClose}) {
  const {lang,t}=useLang()
  const ref=useRef(null)
  useEffect(()=>{
    if(!open) return undefined
    const fn=e=>{
      const node=ref.current
      if(!node||node.contains(e.target)) return
      onClose()
    }
    document.addEventListener("click",fn)
    return()=>document.removeEventListener("click",fn)
  },[open,onClose])
  if(!open) return null
  return (
    <div ref={ref} style={{
      position:"absolute", top:"calc(100% + 6px)", right:0, left:0,
      background:"var(--drop-bg,#0d1520)",
      border:"1px solid var(--border-2)",
      borderRadius:12,
      boxShadow:"0 16px 48px rgba(0,0,0,0.75)",
      zIndex:999,
      overflow:"hidden",
      minWidth:200,
    }}>
      {options.map(c=>{
        const isSel=selected.id===c.id
        return (
          <div key={c.id} onClick={()=>{onSelect(c);onClose()}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",
              background:isSel?"var(--cyan-dim)":"transparent",transition:"background .15s"}}
            onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="var(--cyan-dim)"}}
            onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent"}}>
            <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:c.color||"#222"}}>
              <CurrencyIcon method={c} size={34}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"0.87rem",fontWeight:700,color:"var(--text-1)",lineHeight:1.2}}>{lang==="ar"?c.name:c.nameEn||c.name}</div>
              <div style={{fontSize:"0.65rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
                {c.symbol} · {c.type==="egp"?t("curr_egp"):t("curr_crypto")}
              </div>
            </div>
            {isSel&&(
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </div>
        )
      })}
    </div>
  )
}
// ══ Confirm Modal — مع صور ══
function ConfirmModal({isOpen,onClose,orderData}) {
  const {t,lang}=useLang()
  const [copied,setCopied]=useState(false)
  const [receipt,setReceipt]=useState(null)
  const [preview,setPreview]=useState(null)
  const [submitted,setSubmitted]=useState(false)
  const [loading,setLoading]=useState(false)
  const fileRef=useRef(null)
  if(!isOpen||!orderData) return null
  const info=TRANSFER_INFO[orderData.sendMethod.id]
  const isEgp=orderData.sendMethod.type==="egp"
  const handleCopy=()=>{navigator.clipboard.writeText(info.value);setCopied(true);setTimeout(()=>setCopied(false),2000)}
  const handleFile=e=>{const file=e.target.files[0];if(!file)return;setReceipt(file);const r=new FileReader();r.onload=ev=>setPreview(ev.target.result);r.readAsDataURL(file)}
  const handleSubmit=()=>{if(!receipt){alert(lang==="ar"?"يرجى رفع صورة الإيصال أولاً":"Please upload receipt first");return}setLoading(true);setTimeout(()=>{setLoading(false);setSubmitted(true)},1800)}
  const handleClose=()=>{setReceipt(null);setPreview(null);setSubmitted(false);setLoading(false);setCopied(false);onClose()}
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)handleClose()}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(8px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"var(--card)",border:"1px solid var(--border-2)",borderRadius:22,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",position:"relative",boxShadow:"0 30px 80px rgba(0,0,0,0.7)"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)"}}/>
        <div style={{padding:"22px 24px 18px",borderBottom:"1px solid var(--border-1)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:11,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg></div>
          <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"var(--cyan)",letterSpacing:1}}>{t("confirm_title")}</div></div>
          <button onClick={handleClose} style={{width:32,height:32,borderRadius:8,background:"transparent",border:"1px solid var(--border-1)",color:"var(--text-2)",fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,61,90,0.1)";e.currentTarget.style.color="var(--red)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text-2)"}}>✕</button>
        </div>
        <div style={{padding:24,overflowY:"auto",display:"flex",flexDirection:"column",gap:16}}>
          {submitted?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(0,229,160,0.1)",border:"2px solid rgba(0,229,160,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",animation:"popIn 0.5s ease"}}><svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="succ" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5a0"/><stop offset="100%" stopColor="#00b37a"/></linearGradient></defs><circle cx="20" cy="20" r="19" fill="url(#succ)" opacity="0.18"/><circle cx="20" cy="20" r="19" fill="none" stroke="#00e5a0" strokeWidth="1.5"/><polyline points="11,20 17,27 30,13" fill="none" stroke="#00e5a0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"1.1rem",fontWeight:700,color:"var(--green)",marginBottom:8}}>{t("confirm_success_title")}</div>
              <p style={{fontSize:"0.85rem",color:"var(--text-2)",lineHeight:1.65}}>{t("confirm_success_desc")}</p>
              <button onClick={handleClose} style={{marginTop:20,padding:"12px 30px",background:"linear-gradient(135deg,#00c97a,#009960)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'Tajawal',sans-serif",fontSize:"1rem",fontWeight:800,cursor:"pointer"}}>{t("confirm_success_btn")}</button>
            </div>
          ):(
            <>
              {/* ملخص مع صور العملات */}
              <div style={{background:"rgba(0,210,255,0.04)",border:"1px solid var(--border-1)",borderRadius:12,padding:"13px 16px"}}>
                <div style={{fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:10,letterSpacing:1}}>{t("confirm_summary").toUpperCase()}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,fontSize:"0.88rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <CurrencyIcon method={orderData.sendMethod} size={24}/>
                    <span style={{color:"var(--text-2)"}}>{t("confirm_send")}</span>
                  </div>
                  <span style={{fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{orderData.sendAmount} {orderData.sendMethod.name}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"0.88rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <CurrencyIcon method={orderData.receiveMethod} size={24}/>
                    <span style={{color:"var(--text-2)"}}>{t("confirm_recv")}</span>
                  </div>
                  <span style={{fontWeight:700,color:"var(--green)",fontFamily:"'JetBrains Mono',monospace"}}>{orderData.receiveAmount} {orderData.receiveMethod.name}</span>
                </div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"var(--cyan-dim)",border:"1px solid var(--border-2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,color:"var(--cyan)",flexShrink:0}}>1</div>
                  <span style={{fontSize:"0.88rem",fontWeight:700}}>{isEgp?t("confirm_step1_num"):t("confirm_step1_addr")}</span>
                </div>
                <div style={{background:"rgba(0,0,0,0.25)",border:"1px solid var(--border-1)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <CurrencyIcon method={orderData.sendMethod} size={20}/>
                    <div style={{fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>{lang==="ar"?info.labelAr:info.labelEn}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:isEgp?"1.4rem":"0.75rem",fontWeight:700,color:"var(--cyan)",wordBreak:"break-all",letterSpacing:isEgp?2:1}}>{info.value}</div>
                    <button onClick={handleCopy} style={{flexShrink:0,padding:"8px 14px",background:copied?"rgba(0,229,160,0.15)":"var(--cyan-dim)",border:`1px solid ${copied?"rgba(0,229,160,0.3)":"var(--border-2)"}`,borderRadius:9,color:copied?"var(--green)":"var(--cyan)",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",transition:"all 0.25s",whiteSpace:"nowrap"}}>{copied?t("confirm_copied"):t("confirm_copy")}</button>
                  </div>
                  <div style={{marginTop:8,fontSize:"0.7rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,display:"inline-block",verticalAlign:"middle",marginLeft:3}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> {lang==="ar"?info.noteAr:info.noteEn}</div>
                </div>
                <div style={{marginTop:10,background:"rgba(200,168,75,0.06)",border:"1px dashed rgba(200,168,75,0.25)",borderRadius:9,padding:"9px 13px",fontSize:"0.78rem",color:"var(--gold)",display:"flex",alignItems:"center",gap:8}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>{t("confirm_timer")}</span></div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"var(--cyan-dim)",border:"1px solid var(--border-2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,color:"var(--cyan)",flexShrink:0}}>2</div>
                  <span style={{fontSize:"0.88rem",fontWeight:700}}>{t("confirm_step2")}</span>
                </div>
                <div onClick={()=>fileRef.current.click()} style={{border:`1.5px dashed ${receipt?"var(--green)":"var(--border-2)"}`,borderRadius:12,padding:receipt?10:20,textAlign:"center",cursor:"pointer",transition:"all 0.25s",background:receipt?"rgba(0,229,160,0.04)":"transparent"}}
                  onMouseEnter={e=>{if(!receipt)e.currentTarget.style.borderColor="var(--cyan)"}}
                  onMouseLeave={e=>{if(!receipt)e.currentTarget.style.borderColor="var(--border-2)"}}>
                  {preview?(<div><img src={preview} alt="receipt" style={{width:"100%",maxHeight:160,objectFit:"contain",borderRadius:8}}/><div style={{marginTop:8,fontSize:"0.75rem",color:"var(--green)",fontFamily:"'JetBrains Mono',monospace"}}>✓ {receipt.name}</div></div>):(<><div style={{marginBottom:8,display:"flex",justifyContent:"center"}}><svg width="42" height="42" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="upl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(0,210,255,0.3)"/><stop offset="100%" stopColor="rgba(0,210,255,0.05)"/></linearGradient></defs><rect x="4" y="4" width="36" height="36" rx="10" fill="url(#upl)" stroke="rgba(0,210,255,0.25)" strokeWidth="1.5" strokeDasharray="4 2"/><path d="M22 28V16" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round"/><polyline points="15,22 22,15 29,22" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><line x1="14" y1="31" x2="30" y2="31" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/></svg></div><div style={{fontSize:"0.88rem",color:"var(--text-2)",marginBottom:4}}>{t("confirm_upload")}</div><div style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>{t("confirm_upload_hint")}</div></>)}
                </div>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{display:"none"}}/>
              </div>
              <button onClick={handleSubmit} disabled={loading||!receipt}
                style={{width:"100%",padding:13,background:!receipt?"rgba(0,159,192,0.4)":"linear-gradient(135deg,#009fc0,#006e9e)",border:"none",borderRadius:12,fontFamily:"'Tajawal',sans-serif",fontSize:"1.02rem",fontWeight:800,color:"#fff",cursor:!receipt?"not-allowed":"pointer",transition:"all 0.3s",boxShadow:receipt?"0 4px 22px rgba(0,159,192,0.22)":"none"}}
                onMouseEnter={e=>{if(receipt&&!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,210,255,0.35)"}}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=receipt?"0 4px 22px rgba(0,159,192,0.22)":"none"}}>
                {loading?t("confirm_loading"):!receipt?t("confirm_no_receipt"):t("confirm_submit")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  WALLET BANNERS — 3 تصاميم مختلفة كلياً
//  النموذج المفعّل حالياً: WalletBannerActive
// ══════════════════════════════════════════════════════

/* ─────────────────────────────────────────
   نموذج 1 — "Glass Split"
   بطاقة مقسومة: أيقونة + نص يسار، CTA يمين
   خلفية زجاجية مع خط gradient علوي
───────────────────────────────────────── */
function WalletBannerV1() {
  const {lang}=useLang()
  const [hov,setHov]=useState(false)
  const perks=[
    {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, ar:"إرسال واستقبال فوري", en:"Instant send & receive"},
    {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, ar:"بدون رسوم إنشاء", en:"Zero setup fees"},
    {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, ar:"أمان بنكي AES-256", en:"Bank-grade AES-256"},
    {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, ar:"دعم 24/7", en:"24/7 support"},
  ]
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      display:"flex",alignItems:"stretch",gap:0,borderRadius:18,overflow:"hidden",
      border:`1px solid ${hov?"rgba(0,210,255,0.3)":"rgba(0,210,255,0.1)"}`,
      background:"var(--card)",
      transition:"border-color .25s,box-shadow .25s",
      boxShadow:hov?"0 0 0 4px rgba(0,210,255,0.06)":"none",
      position:"relative",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,var(--cyan) 30%,var(--purple) 70%,transparent)"}}/>

      {/* Left — icon + text */}
      <div style={{flex:1,padding:"22px 28px",display:"flex",alignItems:"center",gap:20}}>
        <div style={{width:56,height:56,borderRadius:16,flexShrink:0,
          background:"linear-gradient(135deg,rgba(0,210,255,0.15),rgba(124,92,252,0.2))",
          border:"1px solid rgba(0,210,255,0.2)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 6px 22px rgba(0,210,255,0.18)",
          transition:"transform .3s",transform:hov?"scale(1.08) rotate(-5deg)":"none",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <defs><linearGradient id="v1g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--cyan)"/><stop offset="100%" stopColor="var(--purple)"/></linearGradient></defs>
            <path d="M21 12V7H5a2 2 0 010-4h14v4" stroke="url(#v1g)" strokeWidth="1.7"/>
            <path d="M3 5v14a2 2 0 002 2h16v-5" stroke="url(#v1g)" strokeWidth="1.7"/>
            <path d="M18 12a2 2 0 000 4h4v-4z" stroke="url(#v1g)" strokeWidth="1.7"/>
          </svg>
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <h3 style={{fontSize:"0.97rem",fontWeight:800}}>{lang==="ar"?"افتح محفظتك المجانية":"Open Your Free Wallet"}</h3>
            <span style={{fontSize:"0.58rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,
              background:"linear-gradient(90deg,var(--cyan),var(--purple))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              border:"1px solid rgba(0,210,255,0.25)",padding:"1px 7px",borderRadius:20}}>FREE</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px 18px"}}>
            {perks.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.75rem",color:"var(--text-2)"}}>
                {p.icon}{lang==="ar"?p.ar:p.en}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — CTA */}
      <div style={{width:1,background:"var(--border-1)",flexShrink:0}}/>
      <div style={{padding:"22px 28px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,flexShrink:0,minWidth:190,background:"rgba(0,210,255,0.02)"}}>
        <button style={{
          padding:"12px 28px",width:"100%",
          background:"linear-gradient(135deg,var(--cyan),var(--purple))",
          border:"none",borderRadius:10,color:"#000",fontWeight:800,
          fontSize:"0.88rem",fontFamily:"'Tajawal',sans-serif",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:7,
          boxShadow:"0 4px 18px rgba(0,210,255,0.28)",
          transition:"transform .2s,filter .2s",
          transform:hov?"translateY(-2px)":"none",filter:hov?"brightness(1.08)":"none",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>
          {lang==="ar"?"إنشاء محفظة":"Create Wallet"}
        </button>
        <p style={{fontSize:"0.68rem",color:"var(--text-3)",textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>
          {lang==="ar"?"مجاني تماماً · لا بطاقة مطلوبة":"100% free · no card required"}
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   نموذج 2 — "Dark Gradient Full"
   بطاقة بخلفية داكنة كاملة مع 4 أيقونات أفقية
   وزر مضيء في المنتصف
───────────────────────────────────────── */
function WalletBannerV2() {
  const {lang}=useLang()
  const [hov,setHov]=useState(false)
  const steps=[
    {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, ar:"سجّل مجاناً", en:"Sign Up Free"},
    {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/><circle cx="18" cy="14" r="1" fill="var(--gold)"/></svg>, ar:"أنشئ المحفظة", en:"Create Wallet"},
    {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15l4-8 4 5 3-3 4 6"/><path d="M21 19H3"/></svg>, ar:"اشحن بالبطاقة", en:"Fund by Card"},
    {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>, ar:"ابدأ التبادل", en:"Start Trading"},
  ]
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      borderRadius:18,overflow:"hidden",position:"relative",
      background:"linear-gradient(135deg,#080f1a 0%,#0d1520 50%,#080f1a 100%)",
      border:`1px solid ${hov?"rgba(0,210,255,0.25)":"rgba(255,255,255,0.06)"}`,
      padding:"28px 32px",
      transition:"border-color .25s,box-shadow .25s",
      boxShadow:hov?"0 8px 40px rgba(0,210,255,0.1)":"none",
    }}>
      {/* BG decoration */}
      <div style={{position:"absolute",top:-40,left:"10%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,210,255,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-40,right:"10%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,92,252,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>

      {/* Top row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:"0.65rem",fontFamily:"'JetBrains Mono',monospace",letterSpacing:2,color:"var(--cyan)",marginBottom:6,textTransform:"uppercase"}}>
            {lang==="ar"?"محفظة رقمية مجانية":"FREE DIGITAL WALLET"}
          </div>
          <h3 style={{fontSize:"1.05rem",fontWeight:900,lineHeight:1.2}}>
            {lang==="ar"?"أدِر أموالك الرقمية بكل سهولة":"Manage Your Crypto With Ease"}
          </h3>
        </div>
        <button style={{
          padding:"12px 24px",
          background:"linear-gradient(135deg,var(--cyan),var(--purple))",
          border:"none",borderRadius:10,color:"#000",fontWeight:800,
          fontSize:"0.88rem",fontFamily:"'Tajawal',sans-serif",cursor:"pointer",
          display:"flex",alignItems:"center",gap:7,
          boxShadow:"0 4px 20px rgba(0,210,255,0.32)",
          transition:"transform .2s,box-shadow .2s",
          transform:hov?"translateY(-2px)":"none",
          boxShadow:hov?"0 8px 28px rgba(0,210,255,0.44)":"0 4px 20px rgba(0,210,255,0.25)",
        }}>
          {lang==="ar"?"ابدأ الآن":"Get Started"}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

      {/* Steps row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:9,padding:"14px 10px",
            background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,
            textAlign:"center",transition:"background .2s,border-color .2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,210,255,0.06)";e.currentTarget.style.borderColor="rgba(0,210,255,0.18)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}}>
            <div style={{width:42,height:42,borderRadius:11,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {s.icon}
            </div>
            <span style={{fontSize:"0.75rem",fontWeight:700,color:"var(--text-2)"}}>{lang==="ar"?s.ar:s.en}</span>
            <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(0,210,255,0.1)",border:"1px solid rgba(0,210,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",fontWeight:700,color:"var(--cyan)"}}>{i+1}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   نموذج 3 — "Neon Minimal"
   شريط ضيق أنيق مع أيقونات وزر واحد بارز
   تصميم بسيط وحديث
───────────────────────────────────────── */
function WalletBannerV3() {
  const {lang}=useLang()
  const [hov,setHov]=useState(false)
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex",alignItems:"center",gap:32,
        paddingTop:7,paddingBottom:7,paddingLeft:26,paddingRight:26,
        width:"789px",
        height:"181px",
        maxWidth:"100%",
        textAlign:"right",
        justifyContent:"center",
        verticalAlign:"middle",
        boxSizing:"border-box",
        borderRadius:"0 0 14px 14px",
        background:"rgba(255,255,255,0.018)",
        border:"1px solid rgba(255,255,255,0.06)",
        borderTop:"none",
        transition:"border-color .25s,background .25s,box-shadow .25s",
        boxShadow:hov?"0 0 0 3px rgba(0,210,255,0.05)":"none",
      }}>

      {/* أيقونة المحفظة */}
      <div style={{
        width:54,height:54,borderRadius:14,flexShrink:0,
        background:"rgba(0,210,255,0.08)",
        border:"1px solid rgba(0,210,255,0.15)",
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"transform .3s",
        transform:hov?"scale(1.07) rotate(-5deg)":"none",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--cyan)"/>
              <stop offset="100%" stopColor="var(--purple)"/>
            </linearGradient>
          </defs>
          <path d="M21 12V7H5a2 2 0 010-4h14v4" stroke="url(#wbg)" strokeWidth="1.7"/>
          <path d="M3 5v14a2 2 0 002 2h16v-5" stroke="url(#wbg)" strokeWidth="1.7"/>
          <path d="M18 12a2 2 0 000 4h4v-4z" stroke="url(#wbg)" strokeWidth="1.7"/>
        </svg>
      </div>

      {/* النص + المميزات */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5,flexWrap:"wrap"}}>
          <span style={{fontSize:"0.93rem",fontWeight:800,color:"var(--text-1)"}}>
            {lang==="ar"?"خزّن وأرسل عملاتك في أي وقت":"Store & send your crypto anytime"}
          </span>
          <span style={{
            fontSize:"0.58rem",fontWeight:700,letterSpacing:"1.5px",
            border:"1px solid rgba(0,210,255,0.22)",
            padding:"2px 9px",borderRadius:20,
            background:"linear-gradient(90deg,var(--cyan),var(--purple))",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            fontFamily:"'JetBrains Mono',monospace",flexShrink:0,
          }}>FREE</span>
        </div>

        <p style={{fontSize:"0.78rem",color:"var(--text-3)",lineHeight:1.62,margin:"0 0 14px"}}>
          {lang==="ar"
            ?"محفظة Number 1 مجانية — اشحن بالبطاقة، حوّل للجنيه أو USDT، واستقبل في ثوانٍ بدون رسوم إنشاء."
            :"Free Number 1 wallet — fund by card, convert to EGP or USDT, receive in seconds with zero setup fees."}
        </p>

        {/* 3 بطاقات المميزات */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {
              ico:<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#00e5a0"/></svg>,
              bg:"rgba(0,229,160,0.07)",border:"rgba(0,229,160,0.13)",
              titleAr:"تحويل فوري",titleEn:"Instant Transfer",
              subAr:"خلال ثوانٍ",subEn:"Within seconds",
            },
            {
              ico:<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" rx="2" fill="#00d2ff" opacity="0.85"/><path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="#00d2ff" strokeWidth="2.2" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="rgba(255,255,255,0.95)"/></svg>,
              bg:"rgba(0,210,255,0.06)",border:"rgba(0,210,255,0.12)",
              titleAr:"أمان عالي",titleEn:"High Security",
              subAr:"AES-256",subEn:"AES-256",
            },
            {
              ico:<svg width="28" height="20" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="12" r="11" fill="#EB001B"/>
                <circle cx="24" cy="12" r="11" fill="#F79E1B"/>
                <path d="M19 4.8a11 11 0 010 14.4A11 11 0 0119 4.8z" fill="#FF5F00"/>
              </svg>,
              bg:"rgba(245,158,11,0.06)",border:"rgba(245,158,11,0.12)",
              titleAr:"شحن بالبطاقة",titleEn:"Card Funding",
              subAr:"Visa · Mastercard",subEn:"Visa · Mastercard",
            },
          ].map((f,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:10,
              padding:"9px 14px",flex:1,minWidth:140,
              background:f.bg,
              border:`1px solid ${f.border}`,
              borderRadius:10,
              transition:"border-color .2s,background .2s",
            }}>
              <div style={{
                width:30,height:30,borderRadius:8,
                background:"rgba(255,255,255,0.05)",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,
              }}>{f.ico}</div>
              <div>
                <div style={{fontSize:"0.8rem",fontWeight:700,lineHeight:1.2,color:"var(--text-1)"}}>
                  {lang==="ar"?f.titleAr:f.titleEn}
                </div>
                <div style={{fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
                  {lang==="ar"?f.subAr:f.subEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* زر CTA */}
      <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        <button style={{
          padding:"12px 26px",
          background:"linear-gradient(135deg,var(--cyan),var(--purple))",
          border:"none",borderRadius:11,
          color:"#000",fontWeight:800,fontSize:"0.87rem",
          fontFamily:"'Tajawal',sans-serif",cursor:"pointer",
          display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap",
          boxShadow:hov?"0 8px 26px rgba(0,210,255,0.34)":"0 4px 16px rgba(0,210,255,0.18)",
          transition:"transform .2s,box-shadow .2s",
          transform:hov?"translateY(-2px)":"none",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
            <path d="M3 5v14a2 2 0 002 2h16v-5"/>
            <path d="M18 12a2 2 0 000 4h4v-4z"/>
          </svg>
          {lang==="ar"?"إنشاء محفظة":"Create Wallet"}
        </button>
        <span style={{fontSize:"0.65rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>
          {lang==="ar"?"مجاني · لا بطاقة مطلوبة":"free · no card needed"}
        </span>
      </div>
    </div>
  )
}

// ── النموذج المفعّل
const WalletBanner = WalletBannerV3

// ══ Exchange Form — التصميم الجديد (-62.html) ══
function ExchangeForm() {
  const {t,lang}=useLang()
  const [sendMethod,setSendMethod]=useState(SEND_METHODS[0])
  const [receiveMethod,setReceiveMethod]=useState(RECEIVE_METHODS[0])
  const [sendAmount,setSendAmount]=useState("100")
  const [rateFactor,setRateFactor]=useState(1)
  const [rateDir,setRateDir]=useState(null)
  const [userPhone,setUserPhone]=useState("")
  const [recipientId,setRecipientId]=useState("")
  const [email,setEmail]=useState("")
  const [aml,setAml]=useState(false)
  const [tos,setTos]=useState(false)
  const [modalOpen,setModalOpen]=useState(false)
  const [orderData,setOrderData]=useState(null)
  const [openPicker,setOpenPicker]=useState(null) // "send" | "receive"
  const [swapping,setSwapping]=useState(false)
  const closePicker=useCallback(()=>setOpenPicker(null),[])

  const isEgp=sendMethod.type==="egp"
  const isUSDT=sendMethod.id==="usdt-trc"
  const baseRate=useMemo(()=>{const key=`${sendMethod.id}_${receiveMethod.id}`;return EXCHANGE_RATES[key]||1},[sendMethod,receiveMethod])
  const currentRate=baseRate*rateFactor
  const receiveAmount=useMemo(()=>{const amt=parseFloat(sendAmount)||0;return amt>0?(amt*currentRate).toFixed(4):""},[sendAmount,currentRate])

  useEffect(()=>{
    const timer=setInterval(()=>{
      const change=(Math.random()-0.5)*0.002
      const dir=change>=0?"up":"dn"
      setRateFactor(prev=>Math.max(0.998,Math.min(1.002,prev+change)))
      setRateDir(dir)
      setTimeout(()=>setRateDir(null),800)
    },3500)
    return()=>clearInterval(timer)
  },[])

  const handleSendMethodChange=m=>{setSendMethod(m);setUserPhone("");setRecipientId("")}
  const rateColor=rateDir==="up"?"var(--green)":rateDir==="dn"?"var(--red)":"var(--gold)"
  const recipientLabel=receiveMethod.id==="mgo-recv"?t("ex_recv_mgo"):t("ex_recv_usdt")
  const recipientPh=receiveMethod.id==="mgo-recv"?"MGO-XXXXXXXXX":"T... — TRC20"

  const handleSubmit=()=>{
    if(!email){alert(lang==="ar"?"يرجى إدخال البريد الإلكتروني":"Please enter your email");return}
    if(isEgp&&!userPhone){alert(lang==="ar"?`يرجى إدخال رقم هاتفك على ${sendMethod.name}`:`Enter your ${sendMethod.name} phone number`);return}
    if(!recipientId){alert(lang==="ar"?`يرجى إدخال ${recipientLabel}`:`Please enter ${recipientLabel}`);return}
    if(!aml||!tos){alert(lang==="ar"?"يرجى الموافقة على الشروط":"Please agree to the terms");return}
    if(parseFloat(sendAmount)<10){alert(lang==="ar"?"الحد الأدنى 10 وحدة":"Minimum is 10 units");return}
    setOrderData({sendMethod,receiveMethod,sendAmount,receiveAmount}); setModalOpen(true)
  }

  // ── sec-label helper ──
  const SecLabel=({color, icon, children})=>(
    <div style={{display:"flex",alignItems:"center",gap:8,fontSize:"10.5px",fontWeight:700,letterSpacing:"1.3px",textTransform:"uppercase",color:"var(--text-3)",marginBottom:15}}>
      <div style={{width:22,height:22,borderRadius:6,background:color==="blue"?"rgba(0,210,255,0.18)":"rgba(0,229,160,0.14)",color:color==="blue"?"var(--cyan)":"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {icon}
      </div>
      {children}
    </div>
  )

  return (
    <>


      {/* ─── Internal 2-col grid ─── */}
      <div className="ex-inner-grid" style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:18,alignItems:"start"}}>

        {/* ══ RIGHT (first in DOM = right in RTL): Your Details form ══ */}
        <div className="ex-card">
          {/* Form title */}
          <div style={{fontSize:16,fontWeight:800,textAlign:"center",paddingBottom:14,marginBottom:16,borderBottom:"1px solid var(--border-1)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"var(--text-1)"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {lang==="ar"?"بياناتك":"Your Details"}
          </div>

          {/* Email */}
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:"10.5px",fontWeight:700,textTransform:"uppercase",letterSpacing:".9px",color:"var(--text-3)",marginBottom:5}}>{t("ex_email")}</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-3)",display:"flex",alignItems:"center",pointerEvents:"none"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input className="ex-inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("ex_email_ph")}/>
            </div>
          </div>

          {/* Phone (EGP only) */}
          {isEgp&&(
            <div style={{marginBottom:11}}>
              <label style={{display:"block",fontSize:"10.5px",fontWeight:700,textTransform:"uppercase",letterSpacing:".9px",color:"var(--text-3)",marginBottom:5}}>{t("ex_phone_lbl")} ({sendMethod.name})</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-3)",display:"flex",alignItems:"center",pointerEvents:"none"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 8.63 19.79 19.79 0 011.08 2a2 2 0 012-2.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 6.91a16 16 0 006 6l.22-.22a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </span>
                <input className="ex-inp ltr" type="tel" value={userPhone} onChange={e=>setUserPhone(e.target.value)} placeholder={t("ex_phone_ph")}/>
              </div>
              <div style={{marginTop:5,fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>{t("ex_phone_hint")}</div>
            </div>
          )}

          {/* Crypto note (non-EGP) */}
          {!isEgp&&(
            <div style={{marginBottom:11,background:"rgba(0,210,255,0.03)",border:"1px solid var(--border-1)",borderRadius:9,padding:"9px 13px"}}>
              <div style={{fontSize:"0.68rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:3}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle",marginLeft:4,flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg> {isUSDT?"USDT TRC20":"MoneyGo USD"}</div>
              <div style={{fontSize:"0.78rem",color:"var(--text-2)",lineHeight:1.6}}>{isUSDT?t("ex_note_usdt"):t("ex_note_mgo")}</div>
            </div>
          )}

          {/* Recipient wallet */}
          <div style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:"10.5px",fontWeight:700,textTransform:"uppercase",letterSpacing:".9px",color:"var(--text-3)",marginBottom:5}}>{recipientLabel}</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--text-3)",display:"flex",alignItems:"center",pointerEvents:"none"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 3h-8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
                  <circle cx="18" cy="14" r="1" fill="currentColor"/>
                </svg>
              </span>
              <input className="ex-inp ltr" type="text" value={recipientId} onChange={e=>setRecipientId(e.target.value)} placeholder={recipientPh}/>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="ex-chk" style={{margin:"13px 0"}}>
            <label style={{display:"flex",alignItems:"flex-start",gap:9,fontSize:"0.75rem",color:"var(--text-2)",marginBottom:9,cursor:"pointer",lineHeight:1.55}}>
              <input type="checkbox" id="ex-aml" checked={aml} onChange={e=>setAml(e.target.checked)}/>
              <span>{t("ex_aml")}</span>
            </label>
            <label style={{display:"flex",alignItems:"flex-start",gap:9,fontSize:"0.75rem",color:"var(--text-2)",cursor:"pointer",lineHeight:1.55}}>
              <input type="checkbox" id="ex-tos" checked={tos} onChange={e=>setTos(e.target.checked)}/>
              <span>{t("ex_tos")}</span>
            </label>
          </div>

          {/* Submit */}
          <button className="ex-submit-btn" onClick={handleSubmit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            {t("ex_submit")}
          </button>
        </div>{/* end RIGHT/Details */}

        {/* ══ LEFT (second in DOM = left in RTL): You Send + Swap + You Get ══ */}
        <div style={{display:"flex",flexDirection:"column",gap:0}}>

          {/* YOU SEND */}
          <div className="ex-card">
            <SecLabel color="blue" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
            }>{lang==="ar"?"ترسل":"YOU SEND"}</SecLabel>

            <div style={{display:"flex",gap:10,alignItems:"stretch"}}>
              {/* Currency selector */}
              <div style={{position:"relative"}}>
                <div
                  className="ex-currency-box"
                  onClick={(e)=>{
                    e.stopPropagation()
                    setOpenPicker(openPicker==="send"?null:"send")
                  }}
                >
                  <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,overflow:"hidden",transition:"transform .2s"}}>
                    <CurrencyIcon method={sendMethod} size={32}/>
                  </div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
                    <span style={{fontSize:"13.5px",fontWeight:700,color:"var(--text-1)",lineHeight:1}}>{sendMethod.symbol||sendMethod.name.split(" ")[0]}</span>
                    <span style={{fontSize:"10px",color:"var(--text-3)",lineHeight:1}}>{lang==="ar"?sendMethod.name:sendMethod.nameEn||sendMethod.name}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" style={{transition:"transform .2s",transform:openPicker==="send"?"rotate(180deg)":"none"}}><polyline points="2,4 7,9 12,4"/></svg>
                </div>
                <CurrencyInlineDropdown options={SEND_METHODS} selected={sendMethod} onSelect={handleSendMethodChange} open={openPicker==="send"} onClose={closePicker}/>
              </div>
              {/* Amount */}
              <div style={{flex:1,position:"relative"}}>
                <input className="ex-amount-input" type="number" value={sendAmount}
                  onChange={e=>setSendAmount(e.target.value)} placeholder="0.00" min="0" step="any"/>
                <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:700,letterSpacing:".4px",color:"var(--text-3)",background:"rgba(255,255,255,0.06)",border:"1px solid var(--border-1)",padding:"2px 7px",borderRadius:5,fontFamily:"'JetBrains Mono',monospace"}}>
                  {sendMethod.symbol}
                </span>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <div style={{flex:1,fontSize:"10.5px",color:"var(--text-3)",paddingLeft:2}}>{lang==="ar"?"العملة":"Currency"}</div>
              <div style={{flex:1,fontSize:"10.5px",color:"var(--text-3)",paddingLeft:2}}>{lang==="ar"?"المبلغ":"Amount"}</div>
            </div>
          </div>

          {/* SWAP ROW */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0"}}>
            <div style={{flex:1,height:1,background:"var(--border-1)"}}/>
            <button className="ex-swap-btn" title={lang==="ar"?"تبديل العملات":"Swap currencies"} onClick={() => { 
              if(swapping) return
              setSwapping(true)

              // Map receive → send and send → receive
              const recvToSend = {"mgo-recv":"mgo-send","usdt-recv":"usdt-trc"}
              const sendToRecv = {"mgo-send":"mgo-recv","usdt-trc":"usdt-recv","vodafone":"mgo-recv","instapay":"mgo-recv","etisalat":"mgo-recv"}
              const newSendId = recvToSend[receiveMethod.id]
              const newRecvId = sendToRecv[sendMethod.id]
              if(newSendId && newRecvId){
                const newSend = SEND_METHODS.find(m=>m.id===newSendId)
                const newRecv = RECEIVE_METHODS.find(m=>m.id===newRecvId)
                if(newSend && newRecv){ setSendMethod(newSend); setReceiveMethod(newRecv); setUserPhone(""); setRecipientId("") }
              }
              setTimeout(()=>setSwapping(false),500)
            }}
            >
              <span style={{display:"flex",alignItems:"center",gap:5,transition:"transform 0.5s cubic-bezier(.22,1,.36,1)",transform:swapping?"rotate(180deg)":"none"}}>
                {/* السهم الأيسر — لأعلى */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="20" x2="8" y2="4"/><polyline points="4 8 8 4 12 8"/>
                </svg>
                {/* السهم الأيمن — لأسفل */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="16" y1="4" x2="16" y2="20"/><polyline points="12 16 16 20 20 16"/>
                </svg>
              </span>
            </button>
            <div style={{flex:1,height:1,background:"var(--border-1)"}}/>
          </div>

          {/* YOU GET */}
          <div className="ex-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}>
              <SecLabel color="green" icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
              } >{lang==="ar"?"تستلم":"YOU GET"}</SecLabel>
              <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,210,255,0.1)",border:"1px solid rgba(0,210,255,0.22)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:700,color:"#93c5fd",marginBottom:15}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                0% Fee
              </div>
            </div>

            <div style={{display:"flex",gap:10,alignItems:"stretch"}}>
              <div className="ex-currency-box-wrapper">
  <div
    className="ex-currency-box"
    onClick={(e)=>{
      e.stopPropagation()
      setOpenPicker(openPicker==="receive"?null:"receive")
    }}
  >
                  <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,overflow:"hidden"}}>
                    <CurrencyIcon method={receiveMethod} size={32}/>
                  </div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
                    <span style={{fontSize:"13.5px",fontWeight:700,color:"var(--text-1)",lineHeight:1}}>{receiveMethod.symbol||receiveMethod.name.split(" ")[0]}</span>
                    <span style={{fontSize:"10px",color:"var(--text-3)",lineHeight:1}}>{lang==="ar"?receiveMethod.name:receiveMethod.nameEn||receiveMethod.name}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" style={{transition:"transform .2s",transform:openPicker==="receive"?"rotate(180deg)":"none"}}><polyline points="2,4 7,9 12,4"/></svg>
                </div>
                <CurrencyInlineDropdown options={RECEIVE_METHODS} selected={receiveMethod} onSelect={setReceiveMethod} open={openPicker==="receive"} onClose={closePicker}/>
              </div>
              <div style={{flex:1,position:"relative"}}>
                <input className="ex-amount-input ex-readonly" type="number" readOnly value={receiveAmount} placeholder="0.00"/>
                <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:700,letterSpacing:".4px",color:"var(--text-3)",background:"rgba(255,255,255,0.06)",border:"1px solid var(--border-1)",padding:"2px 7px",borderRadius:5,fontFamily:"'JetBrains Mono',monospace"}}>
                  {receiveMethod.symbol}
                </span>
              </div>
            </div>

            {/* Rate bar */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:11,paddingTop:11,borderTop:"1px solid var(--border-1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-3)"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/>
                  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                </svg>
                {lang==="ar"?"الاحتياطي :":"Reserve:"}
                <strong style={{color:"var(--red)",fontFamily:"'JetBrains Mono',monospace"}}>{receiveMethod.symbol}</strong>
              </div>
            </div>
          </div>
        </div>{/* end exchange col */}

      </div>{/* end inner grid */}

      <ConfirmModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} orderData={orderData}/>
    </>
  )
}

function FeatureCard({feature,lang}) {
  const [hov,setHov]=useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:"var(--card)",border:`1px solid ${hov?"rgba(0,210,255,0.2)":"var(--border-1)"}`,borderRadius:20,padding:"26px 22px",textAlign:"center",transition:"all 0.3s",transform:hov?"translateY(-5px)":"translateY(0)",boxShadow:hov?"0 20px 50px rgba(0,0,0,0.3)":"0 2px 12px var(--shadow)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
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
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fz" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#0086b3"/></linearGradient></defs><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="url(#fz)" opacity="0.9"/><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="var(--cyan)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,titleAr:"معاملات فورية",titleEn:"Instant Transactions",descAr:"تتم عمليات التبادل خلال ثوانٍ مع تأكيد فوري وإشعارات لحظية",descEn:"Exchange operations complete in seconds with instant confirmation"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#0066aa"/></linearGradient></defs><rect x="3" y="11" width="18" height="11" rx="2.5" fill="url(#fl)" opacity="0.85"/><path d="M7 11V7a5 5 0 0110 0v4" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round"/><circle cx="12" cy="16" r="1.8" fill="rgba(255,255,255,0.9)"/><rect x="11.2" y="16" width="1.6" height="2.5" rx="0.8" fill="rgba(255,255,255,0.9)"/></svg>,titleAr:"أمان عالي المستوى",titleEn:"High-Level Security",descAr:"تشفير AES-256 وحماية متعددة الطبقات لضمان سلامة أموالك وبياناتك",descEn:"AES-256 encryption and multi-layer protection for your funds"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#7c5cfc"/></linearGradient></defs><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="url(#fc)" opacity="0.85"/><circle cx="8" cy="11" r="1.2" fill="rgba(255,255,255,0.9)"/><circle cx="12" cy="11" r="1.2" fill="rgba(255,255,255,0.9)"/><circle cx="16" cy="11" r="1.2" fill="rgba(255,255,255,0.9)"/></svg>,titleAr:"دعم 24/7",titleEn:"24/7 Support",descAr:"فريق متخصص متاح على مدار الساعة عبر الدردشة والبريد والتيليجرام",descEn:"Specialized team available around the clock via chat and Telegram"},
    {icon:<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00e5a0"/><stop offset="100%" stopColor="#00b3d9"/></linearGradient></defs><circle cx="13" cy="13" r="12" fill="url(#fd)" opacity="0.15"/><circle cx="13" cy="13" r="12" fill="none" stroke="var(--green)" strokeWidth="1.5"/><text x="13" y="18" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--green)" fontFamily="sans-serif">$</text></svg>,titleAr:"أفضل الأسعار",titleEn:"Best Rates",descAr:"رسوم تنافسية تبدأ من 0.1% فقط مع أفضل أسعار الصرف في السوق",descEn:"Competitive fees starting from just 0.1% with the best market rates"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="fg" cx="35%" cy="35%"><stop offset="0%" stopColor="rgba(0,210,255,0.3)"/><stop offset="100%" stopColor="rgba(0,100,180,0.15)"/></radialGradient></defs><circle cx="12" cy="12" r="10" fill="url(#fg)"/><circle cx="12" cy="12" r="10" fill="none" stroke="var(--cyan)" strokeWidth="1.5"/><line x1="2" y1="12" x2="22" y2="12" stroke="var(--cyan)" strokeWidth="1" opacity="0.6"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" fill="none" stroke="var(--cyan)" strokeWidth="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="var(--cyan)" strokeWidth="1" opacity="0.4"/></svg>,titleAr:"تغطية عالمية",titleEn:"Global Coverage",descAr:"خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل للعملات الرقمية",descEn:"Our services available in 50+ countries with full crypto support"},
    {icon:<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fch" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d2ff"/><stop offset="100%" stopColor="#004466"/></linearGradient></defs><rect x="4" y="14" width="4" height="7" rx="1" fill="url(#fch)" opacity="0.7"/><rect x="10" y="8" width="4" height="13" rx="1" fill="url(#fch)" opacity="0.85"/><rect x="16" y="4" width="4" height="17" rx="1" fill="url(#fch)"/><line x1="2" y1="21" x2="22" y2="21" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/></svg>,titleAr:"أزواج متنوعة",titleEn:"Diverse Pairs",descAr:"أكثر من 50 زوج تبادل متاح بين العملات الرقمية والمحافظ الإلكترونية",descEn:"50+ trading pairs available between digital currencies and e-wallets"},
  ]
  return (
    <div style={{
      marginTop: 60,
      position: "relative",
      top: -14, // رفع القسم قليلا للأعلى
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      opacity: 1,
      borderRadius: 0,
      background: "unset",
      backgroundImage: "none",
      backgroundColor: "unset",
      backgroundClip: "unset",
      WebkitBackgroundClip: "unset",
      color: "rgba(232, 244, 255, 1)",
      textAlign: "right",
      verticalAlign: "middle",
    }}>
      <div style={{textAlign:"center",marginBottom:48,width:"100%"}}>
        <div style={{display:"inline-block",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",letterSpacing:3,textTransform:"uppercase",color:"var(--cyan)",marginBottom:11,padding:"3px 11px",border:"1px solid rgba(0,210,255,0.14)",borderRadius:20,background:"rgba(0,210,255,0.04)"}}>{t("features_badge")}</div>
        <h2 style={{fontSize:"clamp(1.55rem,2.8vw,2.3rem)",fontWeight:900,marginBottom:9,direction:lang==="ar"?"rtl":"ltr"}}>{t("features_title")}</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18,width:"100%",background:"unset",backgroundColor:"unset",backgroundImage:"none"}}>
        {FEATURES.map((f,i)=><FeatureCard key={i} feature={f} lang={lang}/>)}
      </div>
    </div>
  )
}

function Footer({onNavigate}) {
  const {t}=useLang()
  return (
    <footer style={{background:"var(--footer-bg)",borderTop:"1px solid var(--border-1)",padding:"50px 0 26px",marginTop:60}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 22px"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:38,marginBottom:36}}>
          <div>
            <a onClick={()=>onNavigate("home")} style={{display:"inline-flex",alignItems:"center",gap:12,textDecoration:"none",cursor:"pointer",marginBottom:12}}>
              <div style={{position:"relative",width:33,height:40}}>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:"2.1rem",background:"linear-gradient(160deg,#00eeff,#008fb3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 0 14px rgba(0,210,255,0.9))"}}>1</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",lineHeight:1,gap:3}}>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:"1.05rem",fontWeight:900,color:"var(--cyan)",letterSpacing:2}}>NUMBER 1</span>
                <span style={{fontSize:"0.6rem",color:"var(--text-3)",letterSpacing:3,textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>EXCHANGE</span>
              </div>
            </a>
            <p style={{fontSize:"0.82rem",color:"var(--text-2)",lineHeight:1.75,marginBottom:18,maxWidth:290}}>{t("footer_desc")}</p>
          </div>
          {[
            {title:t("footer_links"),links:[{label:t("nav_home"),id:"home"},{label:t("nav_rates"),id:"rates"},{label:t("nav_news"),id:"news"},{label:t("nav_support"),id:"support"}]},
            {title:t("footer_legal"),links:[{label:t("footer_terms")},{label:t("footer_privacy")},{label:t("footer_aml")},{label:t("footer_cookies")}]},
            {title:t("footer_contact"),links:[{label:"support@number1.exchange"},{label:t("footer_chat")},{label:t("footer_tg")},{label:t("footer_support"),id:"support"}]},
          ].map((col,i)=>(
            <div key={i}>
              <h4 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",letterSpacing:2,textTransform:"uppercase",color:"var(--text-3)",marginBottom:15}}>{col.title}</h4>
              {col.links.map((l,j)=>(
                <a key={j} onClick={l.id?()=>onNavigate(l.id):undefined} style={{display:"block",fontSize:"0.8rem",color:"var(--text-2)",textDecoration:"none",marginBottom:8,transition:"color 0.2s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--cyan)"}
                  onMouseLeave={e=>e.currentTarget.style.color="var(--text-2)"}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid var(--border-1)",paddingTop:20,display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"0.75rem",color:"var(--text-3)",flexWrap:"wrap",gap:11,fontFamily:"'JetBrains Mono',monospace"}}>
          <span>{t("footer_copy")} — ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  )
}

// ✅ جديد — بدون Footer وبدون onNavigate
function Home() {
  const navigate=useNavigate()
  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <section style={{ padding: '45px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 22px' }}>
          <HeroSection onAbout={()=>navigate("/about")}/>
          <PromoBanner />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 20,
            alignItems: 'start',
          }}>
            {/* العمود الأيسر — ExchangeForm */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <ExchangeForm />
            </div>

            {/* العمود الأيمن — Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ReviewsSidebar />
              <LiveActivitySidebar />
            </div>

            {/* المحفظة: طفل ثالث داخل نفس شبكة الصف — أسفل ex-inner-grid والعمودين */}
            <div style={{ gridColumn: '1 / -1', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <WalletBanner />
            </div>
          </div>

          <FeaturesSection />
        </div>
      </section>
    </div>
  )
}

export default Home