// src/components/common/SupportFAB.jsx — N1 AI Assistant + Direct Support
import { useState, useRef, useEffect, useCallback } from 'react'
import useLang from '../../context/useLang'

/* ─── constants ─────────────────────────────────────────── */
const WA_NUMBER  = '9647XXXXXXXXX'
const TG_USER    = 'Number1Exchange'

const BOT_QS = {
  ar: [
    { id:'q1', text:'كيف أبدأ عملية التبادل؟' },
    { id:'q2', text:'ما هي الرسوم؟' },
    { id:'q3', text:'كم يستغرق التحويل؟' },
    { id:'q4', text:'هل بياناتي آمنة؟' },
    { id:'q5', text:'ما هي العملات المدعومة؟' },
  ],
  en: [
    { id:'q1', text:'How do I start an exchange?' },
    { id:'q2', text:'What are the fees?' },
    { id:'q3', text:'How long does it take?' },
    { id:'q4', text:'Is my data safe?' },
    { id:'q5', text:'Which currencies are supported?' },
  ],
}
const BOT_ANS = {
  ar: {
    q1: 'اختر العملة التي تريد إرسالها، أدخل المبلغ، ثم أدخل بيانات المحفظة والبريد الإلكتروني واضغط **"إرسال طلب التبادل"**. ستصلك تأكيد فوري!',
    q2: 'رسومنا تبدأ من **0.1% فقط** — من أقل الرسوم في السوق مع أفضل أسعار الصرف المتاحة.',
    q3: 'معظم العمليات تتم خلال **1 إلى 5 دقائق** بعد تأكيد التحويل من طرفك.',
    q4: 'نعم! نستخدم تشفير **AES-256** مع حماية متعددة الطبقات. بياناتك محمية بأعلى معايير الأمان.',
    q5: 'ندعم: **فودافون كاش، إنستا باي، اتصالات كاش** ↔ **USDT TRC20 وMoneyGo USD**.',
  },
  en: {
    q1: 'Choose the currency to send, enter the amount, fill in wallet details and email, then click **"Submit Exchange Request"**.',
    q2: 'Our fees start from just **0.1%** — among the lowest in the market with the best exchange rates.',
    q3: 'Most operations complete within **1 to 5 minutes** after you confirm the transfer.',
    q4: 'Yes! We use **AES-256** encryption with multi-layer protection. Your data is secured to the highest standards.',
    q5: 'We support: **Vodafone Cash, Instapay, Etisalat Cash** ↔ **USDT TRC20 and MoneyGo USD**.',
  },
}

/* ─── CSS ────────────────────────────────────────────────── */
const FAB_CSS = `
@keyframes n1FabPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,210,255,.6)}70%{box-shadow:0 0 0 18px rgba(0,210,255,0)}}
@keyframes n1FabFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes n1SlideUp{from{opacity:0;transform:translateY(22px) scale(.95)}to{opacity:1;transform:none}}
@keyframes n1MsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes n1Dot{0%,80%,100%{transform:scale(.5);opacity:.35}40%{transform:scale(1);opacity:1}}
@keyframes n1RobotIdle{0%,100%{transform:translateY(0) rotate(0)}40%{transform:translateY(-4px) rotate(-4deg)}70%{transform:translateY(-2px) rotate(3deg)}}
@keyframes n1RobotWave{0%{transform:rotate(0) scale(1)}20%{transform:rotate(-18deg) scale(1.12)}45%{transform:rotate(12deg) scale(1.06)}65%{transform:rotate(-10deg) scale(1.09)}85%{transform:rotate(7deg) scale(1.04)}100%{transform:rotate(0) scale(1)}}
@keyframes n1RobotBlink{0%,90%,100%{transform:scale(1)}95%{transform:scale(1.04)}}
@keyframes n1RobotTalk{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.05) translateY(-3px)}}
@keyframes n1GlowRing{0%,100%{opacity:.3;transform:translateX(-50%) scaleX(1)}50%{opacity:.8;transform:translateX(-50%) scaleX(1.35)}}
@keyframes n1Particle{from{opacity:.7;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-50px) scale(.3)}}
@keyframes n1TooltipIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes n1BtnIn{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
@keyframes n1ScanLine{0%{top:0}100%{top:100%}}

.n1-chat-sb::-webkit-scrollbar{width:3px}
.n1-chat-sb::-webkit-scrollbar-thumb{background:rgba(0,210,255,0.15);border-radius:3px}
.n1-chat-sb{scrollbar-width:thin;scrollbar-color:rgba(0,210,255,0.15) transparent}
`

/* ─── Robot SVG Avatar ───────────────────────────────────── */
function RobotAvatar({ size = 48, anim = 'idle', glow = true }) {
  const css = {
    idle:    'n1RobotIdle 3.5s ease-in-out infinite',
    wave:    'n1RobotWave .7s ease-in-out 3',
    blink:   'n1RobotBlink .35s ease-in-out 2',
    talking: 'n1RobotTalk .5s ease-in-out infinite',
  }
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox="0 0 64 64"
        style={{ animation:css[anim]||css.idle, transformOrigin:'bottom center', filter:'drop-shadow(0 4px 14px rgba(0,210,255,0.55))' }}>
        {/* antenna */}
        <line x1="32" y1="9" x2="32" y2="3" stroke="#00d2ff" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="32" cy="2.5" r="2.8" fill="#00d2ff"/>
        {/* head */}
        <rect x="12" y="10" width="40" height="28" rx="9" fill="#081828" stroke="#1a4a6e" strokeWidth="1.2"/>
        {/* scan line */}
        <rect x="12" y="14" width="40" height="1.5" rx="1" fill="rgba(0,210,255,0.12)" style={{animation:'n1ScanLine 2.5s linear infinite'}}/>
        {/* eye sockets */}
        <rect x="17" y="17" width="12" height="12" rx="3.5" fill="#030c18"/>
        <rect x="35" y="17" width="12" height="12" rx="3.5" fill="#030c18"/>
        {/* eyes glow */}
        <rect x="19" y="19" width="8" height="8" rx="2.5" fill="#00d2ff" opacity=".85"/>
        <rect x="37" y="19" width="8" height="8" rx="2.5" fill="#00d2ff" opacity=".85"/>
        {/* pupils */}
        <circle cx="23" cy="23" r="2.5" fill="white" opacity=".95"/>
        <circle cx="41" cy="23" r="2.5" fill="white" opacity=".95"/>
        {/* shine */}
        <circle cx="24.5" cy="21.5" r="1" fill="white" opacity=".7"/>
        <circle cx="42.5" cy="21.5" r="1" fill="white" opacity=".7"/>
        {/* mouth */}
        <path d="M22 33 Q32 39 42 33" stroke="#00d2ff" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* body */}
        <rect x="16" y="40" width="32" height="22" rx="7" fill="#081828" stroke="#1a4a6e" strokeWidth="1.2"/>
        {/* chest panel */}
        <rect x="23" y="44" width="18" height="6" rx="3" fill="rgba(0,210,255,0.08)" stroke="rgba(0,210,255,0.3)" strokeWidth=".8"/>
        <rect x="26" y="45.5" width="12" height="3" rx="1.5" fill="#00d2ff" opacity=".6"/>
        <circle cx="26" cy="47" r="1" fill="#00d2ff" opacity=".9"/>
        <circle cx="30" cy="47" r="1" fill="#00d2ff" opacity=".9"/>
        <circle cx="34" cy="47" r="1" fill="#00d2ff" opacity=".9"/>
        <circle cx="38" cy="47" r="1" fill="#00d2ff" opacity=".9"/>
        {/* status dots */}
        <circle cx="21" cy="56" r="2" fill="#00e5a0" opacity=".8"/>
        <circle cx="27" cy="56" r="2" fill="rgba(0,210,255,0.5)" opacity=".6"/>
        {/* arms */}
        <rect x="5" y="42" width="10" height="16" rx="5" fill="#081828" stroke="#1a4a6e" strokeWidth="1.2"/>
        <rect x="49" y="42" width="10" height="16" rx="5" fill="#081828" stroke="#1a4a6e" strokeWidth="1.2"/>
        {/* hand */}
        <circle cx="10" cy="60" r="4" fill="#0d2035" stroke="#1a4a6e" strokeWidth="1"/>
        <circle cx="54" cy="60" r="4" fill="#0d2035" stroke="#1a4a6e" strokeWidth="1"/>
      </svg>
      {glow && (
        <div style={{ position:'absolute', bottom:-5, left:'50%', width:size*.65, height:6, background:'radial-gradient(ellipse,rgba(0,210,255,0.5),transparent 70%)', borderRadius:'50%', filter:'blur(3px)', animation:'n1GlowRing 2.2s ease-in-out infinite', transform:'translateX(-50%)' }}/>
      )}
    </div>
  )
}

/* ─── Typing dots ────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display:'flex', gap:5, padding:'4px 2px', alignItems:'center' }}>
      {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--cyan)', animation:`n1Dot 1.1s ease-in-out ${i*.18}s infinite` }}/>)}
    </div>
  )
}

/* ─── Message bubble ─────────────────────────────────────── */
function Msg({ text, isUser, time, anim }) {
  const html = (text||'').replace(/\*\*(.*?)\*\*/g,'<strong style="color:var(--cyan)">$1</strong>').replace(/\n/g,'<br/>')
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, justifyContent:isUser?'flex-start':'flex-end', marginBottom:10, animation:'n1MsgIn .22s ease' }}>
      {!isUser && <RobotAvatar size={30} anim={anim||'idle'} glow={false}/>}
      <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:isUser?'18px 4px 18px 18px':'4px 18px 18px 18px', background:isUser?'linear-gradient(135deg,rgba(0,210,255,0.14),rgba(0,130,170,0.18))':'rgba(255,255,255,0.045)', border:`1px solid ${isUser?'rgba(0,210,255,0.28)':'rgba(255,255,255,0.07)'}`, fontSize:'.83rem', color:'var(--text-1)', lineHeight:1.6, direction:'rtl' }}>
        <div dangerouslySetInnerHTML={{ __html:html }}/>
        {time && <div style={{ fontSize:'.58rem', color:'var(--text-3)', marginTop:4, fontFamily:"'JetBrains Mono',monospace", textAlign:isUser?'right':'left' }}>{time}</div>}
      </div>
    </div>
  )
}

/* ─── Support links ──────────────────────────────────────── */
function SupportLinks({ ar }) {
  const items = [
    { href:`https://wa.me/${WA_NUMBER}`, bg:'linear-gradient(135deg,rgba(37,211,102,.13),rgba(18,140,126,.09))', border:'rgba(37,211,102,0.38)', iconBg:'#25d366', name:ar?'واتساب':'WhatsApp', sub:ar?'تواصل فوري · 24/7':'Instant chat · 24/7', col:'#25d366',
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.495 2 12.05c0 1.86.484 3.61 1.332 5.131L2 22l4.948-1.298A9.953 9.953 0 0012.05 22C17.605 22 22 17.505 22 11.95 22 6.495 17.505 2 12.05 2zm0 18.1a8.048 8.048 0 01-4.104-1.126l-.294-.175-3.056.802.817-2.977-.192-.306A8.053 8.053 0 013.9 11.95C3.9 7.54 7.54 3.9 12.05 3.9c4.41 0 8.05 3.64 8.05 8.05 0 4.41-3.64 8.15-8.05 8.15z"/></svg> },
    { href:`https://t.me/${TG_USER}`, bg:'linear-gradient(135deg,rgba(0,136,204,.13),rgba(0,100,180,.09))', border:'rgba(0,136,204,0.38)', iconBg:'#0088cc', name:ar?'تيليجرام':'Telegram', sub:`@${TG_USER}`, col:'#0088cc',
      icon:<svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
  ]
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, animation:'n1MsgIn .3s ease' }}>
      <div style={{ fontSize:'.7rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center', marginBottom:2 }}>
        {ar ? '— تواصل مباشر مع الفريق —' : '— Direct team contact —'}
      </div>
      {items.map((l,i) => (
        <a key={i} href={l.href} target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, background:l.bg, border:`1px solid ${l.border}`, textDecoration:'none', transition:'all .22s' }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 22px ${l.col}25`}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
          <div style={{ width:40, height:40, borderRadius:12, background:l.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 14px ${l.col}50` }}>{l.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:'.88rem', color:l.col }}>{l.name}</div>
            <div style={{ fontSize:'.7rem', color:'var(--text-3)', marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>{l.sub}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={l.col} strokeWidth="2.5" strokeLinecap="round" opacity=".6"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      ))}
    </div>
  )
}

/* ─── Panel ──────────────────────────────────────────────── */
function Panel({ onClose, lang }) {
  const ar = lang === 'ar'
  const [tab, setTab]           = useState('chat')
  const [messages, setMessages] = useState([])
  const [showOpts, setShowOpts] = useState(false)
  const [showSup, setShowSup]   = useState(false)
  const [typing, setTyping]     = useState(false)
  const [input, setInput]       = useState('')
  const [robAnim, setRobAnim]   = useState('idle')
  const [greeted, setGreeted]   = useState(false)
  const [faqOpen,  setFaqOpen]   = useState(false)
  const bottomRef = useRef(null)
  const qs = BOT_QS[ar?'ar':'en']

  const now = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
  const addMsg = useCallback((text,isUser,anim)=>{ setMessages(p=>[...p,{id:Date.now()+Math.random(),text,isUser,time:now(),anim}]) },[])

  useEffect(()=>{
    if(greeted||tab!=='chat') return
    setGreeted(true); setRobAnim('wave'); setTyping(true)
    setTimeout(()=>{
      setTyping(false)
      addMsg(ar?'مرحباً! أنا **N1-BOT** مساعدك الذكي في Number 1 Exchange.\nكيف يمكنني مساعدتك اليوم؟':'Hello! I\'m **N1-BOT**, your smart assistant at Number 1 Exchange.\nHow can I help you today?',false,'wave')
      setRobAnim('blink')
      setTimeout(()=>{ setRobAnim('idle') },700)
    },1100)
  },[tab])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) },[messages,typing,showOpts,showSup])

  useEffect(()=>{
    const t=setInterval(()=>{ if(robAnim==='idle'){setRobAnim('blink');setTimeout(()=>setRobAnim('idle'),380)} },3500+Math.random()*2500)
    return ()=>clearInterval(t)
  },[robAnim])

  const pickQ=(id,text)=>{
    setShowOpts(false);setShowSup(false);setFaqOpen(false);addMsg(text,true)
    setTyping(true);setRobAnim('talking')
    setTimeout(()=>{
      setTyping(false); const ans=BOT_ANS[ar?'ar':'en'][id]; setRobAnim('idle'); addMsg(ans,false,'idle')
      setTimeout(()=>{ addMsg(ar?'هل هناك شيء آخر أقدر أساعدك به؟':'Anything else I can help you with?',false,'blink') },600)
    },900+Math.random()*400)
  }

  const sendFree=()=>{
    if(!input.trim())return
    const txt=input.trim();setInput('');setShowOpts(false);setShowSup(false);setFaqOpen(false);addMsg(txt,true)
    setTyping(true);setRobAnim('talking')
    setTimeout(()=>{
      setTyping(false);setRobAnim('wave')
      addMsg(ar?'شكراً! يمكنك التواصل مع فريق الدعم البشري مباشرة:':'Thanks! You can reach our support team directly:',false,'wave')
      setTimeout(()=>{ setShowSup(true);setRobAnim('idle') },300)
    },900)
  }

  const TABS=[
    {id:'chat',   labelAr:'المساعد الذكي', labelEn:'AI Chat',
     icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>},
    {id:'support',labelAr:'الدعم المباشر',  labelEn:'Live Support',
     icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>},
  ]

  return (
    <div style={{ position:'fixed', bottom:92, left:22, zIndex:500, width:355, maxHeight:580, background:'var(--card)', border:'1px solid rgba(0,210,255,0.18)', borderRadius:24, overflow:'hidden', boxShadow:'0 28px 70px rgba(0,0,0,.7), 0 0 0 1px rgba(0,210,255,0.06)', display:'flex', flexDirection:'column', animation:'n1SlideUp .28s cubic-bezier(.22,1,.36,1)' }}>

      {/* top accent */}
      <div style={{ position:'absolute', top:0, left:20, right:20, height:2, background:'linear-gradient(90deg,transparent,#00d2ff 40%,#7c5cfc,transparent)', borderRadius:2 }}/>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#001d33,#002e50)', padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexShrink:0, position:'relative', overflow:'hidden' }}>
        {[...Array(5)].map((_,i)=>(
          <div key={i} style={{ position:'absolute', width:4,height:4, borderRadius:'50%', background:'rgba(0,210,255,0.55)', left:`${15+i*18}%`, bottom:0, animation:`n1Particle ${1.4+i*.35}s ease-out ${i*.25}s infinite`, pointerEvents:'none' }}/>
        ))}
        <RobotAvatar size={52} anim={robAnim} glow/>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:'.95rem', color:'#fff', letterSpacing:.5, fontFamily:"'Orbitron',sans-serif" }}>N1-BOT</div>
          <div style={{ fontSize:'.67rem', color:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
            <div style={{ width:6,height:6, borderRadius:'50%', background:'#00e5a0', boxShadow:'0 0 8px #00e5a0', animation:'n1FabPulse 2s infinite' }}/>
            {ar ? 'مساعد ذكي · متاح 24/7' : 'AI Assistant · Online 24/7'}
          </div>
        </div>
        <div style={{ fontSize:'.58rem', color:'rgba(255,255,255,.5)', fontFamily:"'JetBrains Mono',monospace", background:'rgba(255,255,255,0.08)', padding:'3px 8px', borderRadius:7 }}>NUMBER 1</div>
        <button onClick={onClose} style={{ width:30, height:30, borderRadius:9, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,60,60,0.2)';e.currentTarget.style.color='#ff5050'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.color='rgba(255,255,255,.6)'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'rgba(0,210,255,0.04)', borderBottom:'1px solid rgba(0,210,255,0.1)', flexShrink:0 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1, padding:'10px 0', background:'transparent', border:'none', borderBottom:`2px solid ${tab===t.id?'var(--cyan)':'transparent'}`, color:tab===t.id?'var(--cyan)':'var(--text-3)', cursor:'pointer', fontSize:'.78rem', fontWeight:700, fontFamily:"'Tajawal',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all .2s' }}>
            {t.icon}{ar?t.labelAr:t.labelEn}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab==='chat' && (
        <>
          <div className="n1-chat-sb" style={{ flex:1, overflowY:'auto', padding:'14px 14px 6px', display:'flex', flexDirection:'column', minHeight:0, background:'var(--bg)' }}>
            {messages.map(m=><Msg key={m.id} text={m.text} isUser={m.isUser} time={m.time} anim={m.anim}/>)}
            {typing && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, justifyContent:'flex-end', marginBottom:10, animation:'n1MsgIn .22s ease' }}>
                <RobotAvatar size={30} anim="talking" glow={false}/>
                <div style={{ padding:'10px 14px', borderRadius:'4px 18px 18px 18px', background:'rgba(255,255,255,0.045)', border:'1px solid rgba(255,255,255,0.07)' }}><TypingDots/></div>
              </div>
            )}
            {/* FAQ options shown only when faqOpen — rendered above input bar */}
            {showSup && !typing && (
              <div style={{ marginBottom:10 }}>
                <SupportLinks ar={ar}/>
                <button onClick={()=>{setShowSup(false);setShowOpts(true)}} style={{ marginTop:10, width:'100%', padding:'8px', background:'transparent', border:'1px solid var(--border-1)', borderRadius:10, color:'var(--text-3)', fontSize:'.78rem', cursor:'pointer', fontFamily:"'Tajawal',sans-serif" }}>
                  {ar?'← العودة للأسئلة':'← Back to questions'}
                </button>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          {/* ── FAQ dropdown — pops above input bar ── */}
          {faqOpen && (
            <div style={{ borderTop:'1px solid rgba(0,210,255,0.1)', background:'var(--card)', padding:'10px 12px', display:'flex', flexDirection:'column', gap:6, animation:'n1BtnIn .18s ease' }}>
              <div style={{ fontSize:'.6rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, marginBottom:2, paddingRight:2 }}>
                {ar ? '— أسئلة شائعة —' : '— FAQ —'}
              </div>
              {qs.map((q,i)=>(
                <button key={q.id} onClick={()=>pickQ(q.id,q.text)}
                  style={{ padding:'8px 12px', borderRadius:10, background:'rgba(0,210,255,0.04)', border:'1px solid rgba(0,210,255,0.14)', color:'var(--text-1)', fontSize:'.8rem', cursor:'pointer', textAlign:'right', fontFamily:"'Tajawal',sans-serif", transition:'all .17s', display:'flex', alignItems:'center', gap:8 }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,210,255,0.1)';e.currentTarget.style.borderColor='rgba(0,210,255,0.35)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,210,255,0.04)';e.currentTarget.style.borderColor='rgba(0,210,255,0.14)'}}>
                  <span style={{ color:'var(--cyan)', fontSize:'.68rem', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>?</span>
                  {q.text}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding:'10px 12px', borderTop:'1px solid rgba(0,210,255,0.1)', display:'flex', gap:7, alignItems:'center', background:'var(--card)', flexShrink:0 }}>
            {/* FAQ toggle button */}
            <button
              onClick={()=>setFaqOpen(v=>!v)}
              title={ar?'أسئلة شائعة':'FAQ'}
              style={{ width:35, height:35, borderRadius:10, flexShrink:0, background:faqOpen?'rgba(0,210,255,0.15)':'rgba(0,210,255,0.06)', border:`1px solid ${faqOpen?'rgba(0,210,255,0.4)':'rgba(0,210,255,0.15)'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s', color:faqOpen?'var(--cyan)':'rgba(0,210,255,0.45)' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,210,255,0.12)';e.currentTarget.style.color='var(--cyan)'}}
              onMouseLeave={e=>{ if(!faqOpen){e.currentTarget.style.background='rgba(0,210,255,0.06)';e.currentTarget.style.color='rgba(0,210,255,0.45)'} }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </button>

            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendFree()}
              onFocus={()=>setFaqOpen(false)}
              placeholder={ar?'اكتب رسالتك...':'Type your message...'}
              style={{ flex:1, padding:'9px 12px', background:'rgba(0,210,255,0.04)', border:'1px solid rgba(0,210,255,0.12)', borderRadius:11, color:'var(--text-1)', fontSize:'.84rem', outline:'none', fontFamily:"'Tajawal',sans-serif", direction:ar?'rtl':'ltr', transition:'border-color .2s' }}
              onFocus={e=>{e.target.style.borderColor='rgba(0,210,255,0.4)';setFaqOpen(false)}}
              onBlur={e=>e.target.style.borderColor='rgba(0,210,255,0.12)'}/>
            <button onClick={sendFree} style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,#00c2ec,#007ec7)', border:'none', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', boxShadow:'0 3px 12px rgba(0,210,255,0.3)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,210,255,0.5)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 3px 12px rgba(0,210,255,0.3)'}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </>
      )}

      {/* Support Tab */}
      {tab==='support' && (
        <div style={{ flex:1, padding:'20px 16px', overflowY:'auto', background:'var(--bg)' }}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,rgba(0,210,255,0.1),rgba(124,92,252,0.07))', border:'1px solid rgba(0,210,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div style={{ fontWeight:800, fontSize:'.92rem', color:'var(--text-1)', marginBottom:4 }}>{ar?'فريق الدعم البشري':'Human Support Team'}</div>
            <div style={{ fontSize:'.76rem', color:'var(--text-3)', lineHeight:1.6, maxWidth:240, margin:'0 auto' }}>
              {ar?'فريقنا متاح على مدار الساعة للإجابة على جميع استفساراتك':'Our team is available 24/7 to answer all your inquiries'}
            </div>
          </div>
          <SupportLinks ar={ar}/>
          <div style={{ marginTop:16, padding:'12px 14px', borderRadius:12, background:'rgba(0,210,255,0.04)', border:'1px solid rgba(0,210,255,0.1)', display:'flex', alignItems:'center', gap:10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div style={{ fontSize:'.75rem', color:'var(--text-2)' }}>{ar?'متوسط وقت الرد: أقل من 5 دقائق':'Average response time: under 5 minutes'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── FAB ────────────────────────────────────────────────── */
export default function SupportFAB() {
  const { lang } = useLang()
  const ar = lang === 'ar'
  const [open, setOpen]       = useState(false)
  const [unread, setUnread]   = useState(1)
  const [tooltip, setTooltip] = useState(true)

  useEffect(()=>{ const t=setTimeout(()=>setTooltip(false),5000); return()=>clearTimeout(t) },[])

  const toggle=()=>{ setOpen(o=>!o); setUnread(0); setTooltip(false) }

  return (
    <>
      <style>{FAB_CSS}</style>

      {!open && tooltip && (
        <div style={{ position:'fixed', bottom:100, left:24, zIndex:499, background:'var(--card)', border:'1px solid rgba(0,210,255,0.25)', borderRadius:14, padding:'10px 14px', fontSize:'.8rem', color:'var(--text-1)', whiteSpace:'nowrap', boxShadow:'0 8px 28px rgba(0,0,0,.5)', animation:'n1TooltipIn .35s ease', display:'flex', alignItems:'center', gap:8 }}>
          <RobotAvatar size={26} anim="wave" glow={false}/>
          <span>{ar?'مرحباً! هل تحتاج مساعدة؟':'Hello! Need help?'}</span>
        </div>
      )}

      {open && <Panel onClose={toggle} lang={lang}/>}

      <div className="support-fab-anchor" style={{ position:'fixed', bottom:24, left:22, zIndex:500 }}>
        <button type="button" onClick={toggle} className="support-fab-btn" style={{ width:62, height:62, borderRadius:'50%', background:open?'linear-gradient(135deg,#ff3d5a,#b0002a)':'linear-gradient(135deg,#00d2ff,#005fa3)', border:'2px solid rgba(255,255,255,0.18)', cursor:'pointer', padding:0, overflow:'hidden', boxShadow:open?'0 6px 24px rgba(255,61,90,.6)':'0 6px 24px rgba(0,210,255,.6)', animation:!open?'n1FabPulse 2.5s infinite':'none', transition:'background .3s, box-shadow .3s', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          {open
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <div style={{ animation:'n1FabFloat 2.8s ease-in-out infinite' }}><RobotAvatar size={50} anim="idle" glow={false}/></div>
          }
          {!open && unread>0 && (
            <div className="support-fab-badge" style={{ position:'absolute', top:-2, right:-2, width:20, height:20, borderRadius:'50%', background:'#ff3d5a', color:'#fff', fontSize:'.63rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg)', fontFamily:"'JetBrains Mono',monospace" }}>{unread}</div>
          )}
        </button>
      </div>
    </>
  )
}
