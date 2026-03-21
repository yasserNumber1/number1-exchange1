// src/pages/Home.jsx
import { useState, useEffect, useRef, useMemo } from "react"
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

// ══ Ripple ══
function ripple(e) {
  const btn=e.currentTarget; const rect=btn.getBoundingClientRect()
  const size=Math.max(rect.width,rect.height)*1.5
  const el=document.createElement("span"); el.className="ripple"
  el.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`
  if(getComputedStyle(btn).position==="static") btn.style.position="relative"
  btn.appendChild(el); setTimeout(()=>el.remove(),600)
}

// ══ قاعدة التعليقات ══
const ALL_REVIEWS = [
  { nameAr:"زكريا عمر",     nameEn:"Zakaria Omar",     color:"linear-gradient(135deg,#00d2ff,#7c5cfc)", textAr:"أفضل خدمة تبادل! سريع وموثوق جداً",                   textEn:"Best exchange service! Very fast and reliable" },
  { nameAr:"ايسر عدن",     nameEn:"Mokhtar Aden",     color:"linear-gradient(135deg,#c8a84b,#f59e0b)", textAr:"خدمة ممتازة وسريعة، أنصح بها للجميع",                  textEn:"Excellent and fast service, recommend to everyone" },
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
  useEffect(()=>{const t=setInterval(()=>setTick(p=>p+1),30000);return()=>clearInterval(t)},[])
  useEffect(()=>{
    const schedule=()=>{
      const delay=(Math.random()*5+3)*60*1000
      return setTimeout(()=>{const op=generateOp();op.ts=Date.now();setOps(prev=>[op,...prev.slice(0,4)]);setNewId(op.id);setTimeout(()=>setNewId(null),2000);timer=schedule()},delay)
    }
    let timer=schedule(); return()=>clearTimeout(timer)
  },[])
  return (
    <div style={{background:"var(--card)",border:"1px solid var(--border-1)",borderRadius:20,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border-1)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:33,height:33,borderRadius:9,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>⚡</div>
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
          <span>🔒</span><span>{lang==="ar"?"الأرقام مخفية جزئياً لحماية خصوصية المستخدمين":"Amounts partially hidden to protect user privacy"}</span>
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
        <div style={{width:33,height:33,borderRadius:9,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>⭐</div>
        <h3 style={{fontSize:"0.92rem",fontWeight:700,flex:1}}>{t("reviews_title")}</h3>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.7rem",color:"var(--green)",fontWeight:700}}>4.98/5</span>
      </div>
      {reviews.map((r,i)=>(
        <div key={i} style={{padding:"13px 18px",borderBottom:i<reviews.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
            <div style={{width:31,height:31,borderRadius:9,background:r.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"0.8rem",flexShrink:0,color:"#fff"}}>{(lang==="ar"?r.nameAr:r.nameEn)[0]}</div>
            <span style={{fontSize:"0.83rem",fontWeight:700}}>{lang==="ar"?r.nameAr:r.nameEn}</span>
            <span style={{fontSize:"0.66rem",color:"var(--text-3)",marginRight:"auto",fontFamily:"'JetBrains Mono',monospace"}}>{new Date(Date.now()-Math.floor(Math.random()*30)*86400000).toLocaleDateString("en",{month:"2-digit",day:"2-digit"})}</span>
          </div>
          <div style={{fontSize:"0.78rem",color:"var(--text-2)",paddingRight:40}}>{lang==="ar"?r.textAr:r.textEn}</div>
          <div style={{fontSize:"0.7rem",paddingRight:40,marginTop:3}}>⭐⭐⭐⭐⭐</div>
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
  const {t}=useLang()
  return (
    <div style={{display:"flex",alignItems:"center",gap:20,background:"var(--card)",border:"1px solid var(--border-1)",borderRadius:18,padding:"20px 26px",marginBottom:36,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)"}}/>
      <div style={{width:50,height:50,borderRadius:13,background:"rgba(200,168,75,0.08)",border:"1px solid rgba(200,168,75,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1.4rem"}}>🎁</div>
      <div style={{flex:1}}>
        <h3 style={{fontSize:"0.93rem",fontWeight:800,marginBottom:3}}>{t("promo_title")}</h3>
        <p style={{fontSize:"0.8rem",color:"var(--text-2)",lineHeight:1.6}}>{t("promo_desc")}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
          {["FEE 0.1%","INSTANT","24/7 SUPPORT","NO MINIMUM"].map(tag=>(
            <span key={tag} style={{padding:"2px 10px",background:"rgba(200,168,75,0.07)",border:"1px solid rgba(200,168,75,0.18)",borderRadius:20,fontSize:"0.67rem",color:"var(--gold)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══ Currency Dropdown — مع صور حقيقية ══
function CurrencyDropdown({options,selected,onSelect}) {
  const {lang,t}=useLang()
  const [open,setOpen]=useState(false)
  const ref=useRef(null)
  useEffect(()=>{
    const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)}
    document.addEventListener("mousedown",fn); return()=>document.removeEventListener("mousedown",fn)
  },[])
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:open?"var(--cyan-dim)":"rgba(255,255,255,0.05)",border:`1px solid ${open?"var(--border-2)":"var(--border-1)"}`,borderRadius:9,cursor:"pointer",transition:"all 0.2s",flexShrink:0,userSelect:"none",minWidth:155}}>
        <CurrencyIcon method={selected} size={26}/>
        <div style={{flex:1}}>
          <div style={{fontSize:"0.85rem",fontWeight:700}}>{selected.name}</div>
          {selected.flag&&<div style={{fontSize:"0.6rem",color:"var(--text-3)"}}>{selected.flag} {selected.type==="egp"?t("curr_egp"):t("curr_crypto")}</div>}
        </div>
        <span style={{fontSize:"0.65rem",color:"var(--text-3)",transition:"transform 0.22s",transform:open?"rotate(180deg)":"none"}}>▾</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,minWidth:210,background:"var(--drop-bg)",border:"1px solid var(--border-2)",borderRadius:14,boxShadow:"0 24px 70px rgba(0,0,0,0.8)",zIndex:500,overflow:"hidden"}}>
          {options.map(c=>(
            <div key={c.id} onClick={()=>{onSelect(c);setOpen(false)}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:selected.id===c.id?"var(--cyan-dim)":"transparent",transition:"background 0.15s"}}
              onMouseEnter={e=>{if(selected.id!==c.id)e.currentTarget.style.background="var(--cyan-dim)"}}
              onMouseLeave={e=>{if(selected.id!==c.id)e.currentTarget.style.background="transparent"}}>
              <CurrencyIcon method={c} size={28}/>
              <div>
                <div style={{fontSize:"0.85rem",fontWeight:700}}>{c.name}</div>
                {c.flag&&<div style={{fontSize:"0.6rem",color:"var(--text-3)"}}>{c.flag} {c.type==="egp"?t("curr_egp"):t("curr_crypto")}</div>}
              </div>
              {selected.id===c.id&&<span style={{marginRight:"auto",color:"var(--cyan)",fontSize:"0.8rem"}}>✓</span>}
            </div>
          ))}
        </div>
      )}
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
          <div style={{width:40,height:40,borderRadius:11,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>📋</div>
          <div style={{flex:1}}><div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"var(--cyan)",letterSpacing:1}}>{t("confirm_title")}</div></div>
          <button onClick={handleClose} style={{width:32,height:32,borderRadius:8,background:"transparent",border:"1px solid var(--border-1)",color:"var(--text-2)",fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,61,90,0.1)";e.currentTarget.style.color="var(--red)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--text-2)"}}>✕</button>
        </div>
        <div style={{padding:24,overflowY:"auto",display:"flex",flexDirection:"column",gap:16}}>
          {submitted?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(0,229,160,0.1)",border:"2px solid rgba(0,229,160,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:"2rem",animation:"popIn 0.5s ease"}}>✓</div>
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
                  <div style={{marginTop:8,fontSize:"0.7rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>⚠ {lang==="ar"?info.noteAr:info.noteEn}</div>
                </div>
                <div style={{marginTop:10,background:"rgba(200,168,75,0.06)",border:"1px dashed rgba(200,168,75,0.25)",borderRadius:9,padding:"9px 13px",fontSize:"0.78rem",color:"var(--gold)",display:"flex",alignItems:"center",gap:8}}><span>⏱</span><span>{t("confirm_timer")}</span></div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"var(--cyan-dim)",border:"1px solid var(--border-2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,color:"var(--cyan)",flexShrink:0}}>2</div>
                  <span style={{fontSize:"0.88rem",fontWeight:700}}>{t("confirm_step2")}</span>
                </div>
                <div onClick={()=>fileRef.current.click()} style={{border:`1.5px dashed ${receipt?"var(--green)":"var(--border-2)"}`,borderRadius:12,padding:receipt?10:20,textAlign:"center",cursor:"pointer",transition:"all 0.25s",background:receipt?"rgba(0,229,160,0.04)":"transparent"}}
                  onMouseEnter={e=>{if(!receipt)e.currentTarget.style.borderColor="var(--cyan)"}}
                  onMouseLeave={e=>{if(!receipt)e.currentTarget.style.borderColor="var(--border-2)"}}>
                  {preview?(<div><img src={preview} alt="receipt" style={{width:"100%",maxHeight:160,objectFit:"contain",borderRadius:8}}/><div style={{marginTop:8,fontSize:"0.75rem",color:"var(--green)",fontFamily:"'JetBrains Mono',monospace"}}>✓ {receipt.name}</div></div>):(<><div style={{fontSize:"2rem",marginBottom:8}}>📸</div><div style={{fontSize:"0.88rem",color:"var(--text-2)",marginBottom:4}}>{t("confirm_upload")}</div><div style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>{t("confirm_upload_hint")}</div></>)}
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

// ══ Exchange Form — مع صور ══
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
  const isEgp=sendMethod.type==="egp"
  const isUSDT=sendMethod.id==="usdt-trc"
  const baseRate=useMemo(()=>{const key=`${sendMethod.id}_${receiveMethod.id}`;return EXCHANGE_RATES[key]||1},[sendMethod,receiveMethod])
  const currentRate=baseRate*rateFactor
  const receiveAmount=useMemo(()=>{const amt=parseFloat(sendAmount)||0;return amt>0?(amt*currentRate).toFixed(4):""},[sendAmount,currentRate])
  useEffect(()=>{
    const timer=setInterval(()=>{const change=(Math.random()-0.5)*0.002;const dir=change>=0?"up":"dn";setRateFactor(prev=>Math.max(0.998,Math.min(1.002,prev+change)));setRateDir(dir);setTimeout(()=>setRateDir(null),800)},3500)
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
  const inp={width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border-1)",borderRadius:9,color:"var(--text-1)",fontFamily:"'Tajawal',sans-serif",fontSize:"0.88rem",outline:"none",textAlign:"right",transition:"border-color 0.22s, box-shadow 0.22s"}
  const focus=e=>{e.target.style.borderColor="var(--border-2)";e.target.style.boxShadow="0 0 0 3px rgba(0,210,255,0.05)"}
  const blur=e=>{e.target.style.borderColor="var(--border-1)";e.target.style.boxShadow="none"}
  return (
    <>
      <div style={{background:"var(--card)",border:"1px solid var(--border-1)",borderRadius:20,backdropFilter:"blur(16px)"}}>
        <div style={{padding:"17px 22px",borderBottom:"1px solid var(--border-1)",display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:33,height:33,borderRadius:9,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>💱</div>
          <h3 style={{fontSize:"0.92rem",fontWeight:700,flex:1}}>{t("ex_title")}</h3>
          <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.66rem",color:"var(--green)",background:"rgba(0,229,160,0.07)",border:"1px solid rgba(0,229,160,0.14)",padding:"2px 8px",borderRadius:20}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",animation:"blink 1.5s ease-in-out infinite",display:"inline-block"}}/>LIVE
          </div>
        </div>
        <div style={{padding:22}}>
          <div style={{background:"rgba(0,210,255,0.03)",border:"1px solid var(--border-1)",borderRadius:14,padding:15,marginBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}><span>{t("ex_send")}</span><span>MIN: 10</span></div>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <input type="number" value={sendAmount} onChange={e=>setSendAmount(e.target.value)} placeholder="0.00" style={{flex:1,background:"transparent",border:"none",outline:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:"1.55rem",fontWeight:700,color:"var(--text-1)",direction:"ltr",minWidth:0}}/>
              <CurrencyDropdown options={SEND_METHODS} selected={sendMethod} onSelect={handleSendMethodChange}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"5px 0"}}>
            <div style={{width:40,height:40,borderRadius:11,background:"rgba(0,210,255,0.07)",border:"1px solid var(--border-1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",color:"var(--cyan)"}}>↓</div>
          </div>
          <div style={{background:"rgba(0,210,255,0.03)",border:"1px solid var(--border-1)",borderRadius:14,padding:15,marginBottom:13}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}><span>{t("ex_recv")}</span><span style={{color:rateColor,transition:"color 0.4s"}}>1 {sendMethod.name} = {currentRate.toFixed(5)} {receiveMethod.name}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <input type="number" value={receiveAmount} readOnly placeholder="0.00" style={{flex:1,background:"transparent",border:"none",outline:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:"1.55rem",fontWeight:700,color:"var(--green)",direction:"ltr",minWidth:0}}/>
              <CurrencyDropdown options={RECEIVE_METHODS} selected={receiveMethod} onSelect={setReceiveMethod}/>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(200,168,75,0.05)",border:"1px dashed rgba(200,168,75,0.2)",borderRadius:9,padding:"9px 13px",marginBottom:18}}>
            <span style={{color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem"}}>{t("ex_rate")}</span>
            <span style={{color:rateColor,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:"0.82rem",transition:"color 0.4s"}}>1 {sendMethod.name} = {currentRate.toFixed(5)} {receiveMethod.name}</span>
          </div>
          <div style={{borderTop:"1px solid var(--border-1)",margin:"0 0 18px"}}/>
          <p style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,marginBottom:13}}>{t("ex_details")}</p>
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>{t("ex_email")}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("ex_email_ph")} style={inp} onFocus={focus} onBlur={blur}/>
          </div>
          {isEgp?(
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>{t("ex_phone_lbl")} ({sendMethod.name})</label>
              <input type="tel" value={userPhone} onChange={e=>setUserPhone(e.target.value)} placeholder={t("ex_phone_ph")} style={{...inp,direction:"ltr",textAlign:"left"}} onFocus={focus} onBlur={blur}/>
              <div style={{marginTop:6,fontSize:"0.7rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace"}}>{t("ex_phone_hint")}</div>
            </div>
          ):(
            <div style={{marginBottom:12,background:"rgba(0,210,255,0.03)",border:"1px solid var(--border-1)",borderRadius:9,padding:"10px 13px"}}>
              <div style={{fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>ℹ️ {isUSDT?"USDT TRC20":"MoneyGo USD"}</div>
              <div style={{fontSize:"0.8rem",color:"var(--text-2)",lineHeight:1.6}}>{isUSDT?t("ex_note_usdt"):t("ex_note_mgo")}</div>
            </div>
          )}
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:"0.72rem",color:"var(--text-3)",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>{recipientLabel}</label>
            <input type="text" value={recipientId} onChange={e=>setRecipientId(e.target.value)} placeholder={recipientPh} style={{...inp,direction:"ltr",textAlign:"left",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.8rem"}} onFocus={focus} onBlur={blur}/>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:8}}>
            <input type="checkbox" id="aml" checked={aml} onChange={e=>setAml(e.target.checked)} style={{width:15,height:15,marginTop:3,accentColor:"var(--cyan)",cursor:"pointer",flexShrink:0}}/>
            <label htmlFor="aml" style={{fontSize:"0.76rem",color:"var(--text-2)",lineHeight:1.55,cursor:"pointer"}}>{t("ex_aml")}</label>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:8}}>
            <input type="checkbox" id="tos" checked={tos} onChange={e=>setTos(e.target.checked)} style={{width:15,height:15,marginTop:3,accentColor:"var(--cyan)",cursor:"pointer",flexShrink:0}}/>
            <label htmlFor="tos" style={{fontSize:"0.76rem",color:"var(--text-2)",lineHeight:1.55,cursor:"pointer"}}>{t("ex_tos")}</label>
          </div>
          <button onClick={handleSubmit} style={{width:"100%",padding:13,marginTop:13,background:"linear-gradient(135deg,#009fc0,#006e9e)",border:"none",borderRadius:12,fontFamily:"'Tajawal',sans-serif",fontSize:"1.02rem",fontWeight:800,color:"#fff",cursor:"pointer",transition:"all 0.3s",boxShadow:"0 4px 22px rgba(0,159,192,0.22)"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 34px rgba(0,210,255,0.38)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 22px rgba(0,159,192,0.22)"}}>
            {t("ex_submit")}
          </button>
        </div>
      </div>
      <ConfirmModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} orderData={orderData}/>
    </>
  )
}

function FeatureCard({feature,lang}) {
  const [hov,setHov]=useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:"var(--card)",border:`1px solid ${hov?"rgba(0,210,255,0.2)":"var(--border-1)"}`,borderRadius:20,padding:"26px 22px",textAlign:"center",transition:"all 0.3s",transform:hov?"translateY(-5px)":"translateY(0)",boxShadow:hov?"0 20px 50px rgba(0,0,0,0.3)":"none",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:"25%",width:"50%",height:1,background:"linear-gradient(90deg,transparent,var(--cyan),transparent)",opacity:hov?1:0,transition:"opacity 0.3s"}}/>
      <div style={{width:62,height:62,borderRadius:18,background:"var(--cyan-dim)",border:"1px solid rgba(0,210,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 17px",fontSize:"1.6rem",transition:"transform 0.3s",transform:hov?"scale(1.1) rotate(4deg)":"none"}}>{feature.icon}</div>
      <h3 style={{fontSize:"0.92rem",fontWeight:800,marginBottom:8}}>{lang==="ar"?feature.titleAr:feature.titleEn}</h3>
      <p style={{fontSize:"0.8rem",color:"var(--text-2)",lineHeight:1.7}}>{lang==="ar"?feature.descAr:feature.descEn}</p>
    </div>
  )
}

function FeaturesSection() {
  const {t,lang}=useLang()
  const FEATURES=[
    {icon:"⚡",titleAr:"معاملات فورية",      titleEn:"Instant Transactions",  descAr:"تتم عمليات التبادل خلال ثوانٍ مع تأكيد فوري وإشعارات لحظية",               descEn:"Exchange operations complete in seconds with instant confirmation"},
    {icon:"🔐",titleAr:"أمان عالي المستوى",  titleEn:"High-Level Security",   descAr:"تشفير AES-256 وحماية متعددة الطبقات لضمان سلامة أموالك وبياناتك",         descEn:"AES-256 encryption and multi-layer protection for your funds"},
    {icon:"💬",titleAr:"دعم 24/7",            titleEn:"24/7 Support",          descAr:"فريق متخصص متاح على مدار الساعة عبر الدردشة والبريد والتيليجرام",          descEn:"Specialized team available around the clock via chat and Telegram"},
    {icon:"💰",titleAr:"أفضل الأسعار",        titleEn:"Best Rates",            descAr:"رسوم تنافسية تبدأ من 0.1% فقط مع أفضل أسعار الصرف في السوق",              descEn:"Competitive fees starting from just 0.1% with the best market rates"},
    {icon:"🌍",titleAr:"تغطية عالمية",        titleEn:"Global Coverage",       descAr:"خدماتنا متاحة في أكثر من 50 دولة مع دعم كامل للعملات الرقمية",             descEn:"Our services available in 50+ countries with full crypto support"},
    {icon:"📊",titleAr:"أزواج متنوعة",        titleEn:"Diverse Pairs",         descAr:"أكثر من 50 زوج تبادل متاح بين العملات الرقمية والمحافظ الإلكترونية",       descEn:"50+ trading pairs available between digital currencies and e-wallets"},
  ]
  return (
    <div style={{marginTop:60}}>
      <div style={{textAlign:"center",marginBottom:48}}>
        <div style={{display:"inline-block",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",letterSpacing:3,textTransform:"uppercase",color:"var(--cyan)",marginBottom:11,padding:"3px 11px",border:"1px solid rgba(0,210,255,0.14)",borderRadius:20,background:"rgba(0,210,255,0.04)"}}>{t("features_badge")}</div>
        <h2 style={{fontSize:"clamp(1.55rem,2.8vw,2.3rem)",fontWeight:900,marginBottom:9}}>{t("features_title")}</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
        {FEATURES.map((f,i)=><FeatureCard key={i} feature={f} lang={lang}/>)}
      </div>
    </div>
  )
}

function Footer({onNavigate}) {
  const {t}=useLang()
  return (
    <footer style={{background:"rgba(0,0,0,0.45)",borderTop:"1px solid var(--border-1)",padding:"50px 0 26px",marginTop:60}}>
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

function Home({onNavigate}) {
  return (
    <div style={{position:"relative",zIndex:2}}>
      <section style={{padding:"45px 0 0"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 22px"}}>
          <HeroSection onAbout={()=>onNavigate("about")}/>
          <PromoBanner/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:20,alignItems:"start"}}>
            <ExchangeForm/>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <ReviewsSidebar/>
              <LiveActivitySidebar/>
            </div>
          </div>
          <FeaturesSection/>
        </div>
      </section>
      <Footer onNavigate={onNavigate}/>
    </div>
  )
}

export default Home