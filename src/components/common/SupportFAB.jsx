// src/components/SupportFAB.jsx
import { useState, useRef, useEffect } from 'react'
import useLang from '../../context/useLang'

const BOT_REPLIES = {
  ar: {
    default: 'شكراً! للمساعدة التفصيلية تواصل معنا عبر تيليجرام أو واتساب 🙏',
    تبادل:   'اختر العملة، أدخل المبلغ والمحفظة، وافق على الشروط ثم اضغط إرسال ✅',
    ابدأ:    'اختر العملة، أدخل المبلغ والمحفظة، وافق على الشروط ثم اضغط إرسال ✅',
    رسوم:    'رسومنا تبدأ من 0.1% فقط — من أقل الرسوم في السوق',
    أدنى:    'الحد الأدنى 10 وحدة من العملة المرسلة',
    آمن:     'نعم! نستخدم تشفير AES-256 وشهادة ISO 27001',
    وقت:     '1-5 دقائق لمعظم العمليات',
    شكر:     'العفو! يسعدني مساعدتك دائماً 😊',
    مرحب:    'أهلاً! كيف يمكنني مساعدتك؟ 👋',
  },
  en: {
    default:   'Thanks! For detailed help contact us via Telegram or WhatsApp 🙏',
    exchange:  'Choose currency, enter amount and wallet, agree to terms then click Submit ✅',
    start:     'Choose currency, enter amount and wallet, agree to terms then click Submit ✅',
    fees:      'Our fees start from just 0.1% — among the lowest in the market',
    minimum:   'Minimum is 10 units of the sending currency',
    safe:      'Yes! We use AES-256 encryption and ISO 27001 certification',
    time:      '1-5 minutes for most operations',
    thanks:    'You\'re welcome! Happy to help 😊',
    hello:     'Hello! How can I help you? 👋',
  }
}

const QUICK_QUESTIONS = {
  ar: ['كيف أبدأ التبادل؟','ما هي الرسوم؟','الحد الأدنى','هل الموقع آمن؟'],
  en: ['How to start?','What are the fees?','Minimum amount','Is it safe?'],
}

// ── رسالة واحدة في الشات ──
function ChatMessage({ msg }) {
  const isBot = msg.from === 'bot'
  return (
    <div style={{
      maxWidth:'85%', padding:'9px 13px', borderRadius:14,
      fontSize:'0.82rem', lineHeight:1.55,
      animation:'pageIn 0.3s ease',
      alignSelf: isBot ? 'flex-start' : 'flex-end',
      background: isBot
        ? 'rgba(0,210,255,0.08)'
        : 'linear-gradient(135deg,#005a7a,#003d5c)',
      border: isBot ? '1px solid rgba(0,210,255,0.12)' : 'none',
      color: isBot ? 'var(--text-1)' : '#fff',
      borderRadius: isBot ? '4px 14px 14px 14px' : '14px 14px 4px 14px',
    }}>
      {msg.text}
    </div>
  )
}

// ── نقاط الكتابة ──
function TypingDots() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'9px 13px', background:'rgba(0,210,255,0.06)', borderRadius:'4px 14px 14px 14px', width:'fit-content', alignSelf:'flex-start' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', display:'inline-block', animation:`typing 0.9s ease-in-out infinite`, animationDelay:`${i*0.2}s` }} />
      ))}
    </div>
  )
}

// ── نافذة الشات ──
function ChatWindow({ onClose }) {
  const { lang, t } = useLang()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const msgsRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    setTimeout(() => {
      addBotMsg(lang === 'ar'
        ? 'مرحباً! أنا مساعد Number 1 الذكي\nكيف يمكنني مساعدتك اليوم؟'
        : 'Hello! I\'m Number 1 AI Assistant\nHow can I help you today?'
      )
    }, 500)
  }, [])

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages, typing])

  const addBotMsg = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), from:'bot', text }])
  }

  const getBotReply = (text) => {
    const replies = BOT_REPLIES[lang] || BOT_REPLIES.ar
    const lower = text.toLowerCase()
    for (const [key, val] of Object.entries(replies)) {
      if (key !== 'default' && lower.includes(key)) return val
    }
    return replies.default
  }

  const sendMessage = (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), from:'user', text }])
    setInput('')
    setShowQuick(false)
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addBotMsg(getBotReply(text))
    }, 900 + Math.random() * 600)
  }

  return (
    <div style={{
      position:'absolute', bottom:62, left:0,
      width:320, background:'var(--card)',
      border:'1px solid var(--border-2)', borderRadius:20,
      boxShadow:'0 24px 70px rgba(0,0,0,0.7)',
      display:'flex', flexDirection:'column',
      overflow:'hidden', animation:'pageIn 0.35s ease',
    }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,rgba(0,210,255,0.1),rgba(124,92,252,0.08))', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--cyan),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 14px rgba(0,210,255,0.4)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M9 11V9a3 3 0 016 0v2"/><circle cx="9" cy="15" r="1" fill="white"/><circle cx="15" cy="15" r="1" fill="white"/><line x1="12" y1="3" x2="12" y2="5"/></svg>
    </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.88rem', fontWeight:800, color:'var(--cyan)' }}>Number 1 Bot</div>
          <div style={{ fontSize:'0.65rem', color:'var(--green)', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', animation:'blink 1.2s ease-in-out infinite', display:'inline-block' }} />
            {lang === 'ar' ? 'متصل الآن' : 'Online'}
          </div>
        </div>
        <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid var(--border-1)', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,61,90,0.12)';e.currentTarget.style.color='var(--red)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='var(--text-2)'}}>
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={msgsRef} style={{ height:220, overflowY:'auto', padding:14, display:'flex', flexDirection:'column', gap:10 }}>
        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
        {typing && <TypingDots />}
      </div>

      {/* Quick questions */}
      {showQuick && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', padding:'8px 14px', borderTop:'1px solid var(--border-1)' }}>
          {(QUICK_QUESTIONS[lang] || QUICK_QUESTIONS.ar).map((q,i) => (
            <button key={i} onClick={() => sendMessage(q)}
              style={{ padding:'5px 11px', borderRadius:20, background:'rgba(0,210,255,0.07)', border:'1px solid rgba(0,210,255,0.15)', color:'var(--cyan)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.75rem', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--cyan-dim)';e.currentTarget.style.borderColor='var(--border-2)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,210,255,0.07)';e.currentTarget.style.borderColor='rgba(0,210,255,0.15)'}}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display:'flex', gap:8, padding:'10px 14px', borderTop:'1px solid var(--border-1)' }}>
        <button onClick={() => sendMessage(input)}
          style={{ width:36, height:36, borderRadius:10, background:'var(--cyan)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.background='#00aacc';e.currentTarget.style.transform='scale(1.05)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='var(--cyan)';e.currentTarget.style.transform='scale(1)'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter') sendMessage(input) }}
          placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
          style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid var(--border-1)', borderRadius:10, padding:'8px 12px', color:'var(--text-1)', fontFamily:"'Tajawal',sans-serif", fontSize:'0.85rem', outline:'none', direction: lang==='ar'?'rtl':'ltr', transition:'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor='var(--border-2)'}
          onBlur={e  => e.target.style.borderColor='var(--border-1)'}
        />
      </div>
    </div>
  )
}

// ══ الزر العائم الرئيسي ══
function SupportFAB() {
  const { lang } = useLang()
  const [menuOpen, setMenuOpen]  = useState(false)
  const [chatOpen, setChatOpen]  = useState(false)
  const fabRef = useRef(null)

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const fn = e => { if(fabRef.current && !fabRef.current.contains(e.target)) { setMenuOpen(false) } }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const openChat = () => { setChatOpen(true); setMenuOpen(false) }

  const menuItems = [
    { icon:<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='bm' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stopColor='#00d2ff'/><stop offset='100%' stopColor='#7c5cfc'/></linearGradient></defs><rect x='3' y='10' width='18' height='11' rx='3' fill='url(#bm)' opacity='0.8'/><path d='M9 10V8a3 3 0 016 0v2' fill='none' stroke='var(--cyan)' strokeWidth='1.8' strokeLinecap='round'/><circle cx='9.5' cy='15.5' r='1.5' fill='var(--cyan)'/><circle cx='14.5' cy='15.5' r='1.5' fill='var(--cyan)'/><line x1='9.5' y1='19' x2='14.5' y2='19' stroke='rgba(0,210,255,0.5)' strokeWidth='1.5' strokeLinecap='round'/></svg>, title: lang==='ar'?'المساعد الذكي':'AI Assistant',   sub: lang==='ar'?'دردشة فورية · 24/7':'Instant chat · 24/7',      bg:'linear-gradient(135deg,rgba(0,210,255,0.2),rgba(124,92,252,0.2))', border:'rgba(0,210,255,0.2)',  onClick: openChat },
    { icon:'✈️', title: lang==='ar'?'تيليجرام':'Telegram',             sub:'@Number1Exchange',                                            bg:'linear-gradient(135deg,rgba(0,136,204,0.25),rgba(0,180,216,0.15))', border:'rgba(0,136,204,0.2)', onClick:()=>window.open('https://t.me/Number1Exchange','_blank') },
    { icon:<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#25D366' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'/></svg>, title: lang==='ar'?'واتساب':'WhatsApp',                sub: lang==='ar'?'دعم مباشر · 24/7':'Direct support · 24/7',      bg:'linear-gradient(135deg,rgba(37,211,102,0.15),rgba(18,140,126,0.15))', border:'rgba(37,211,102,0.2)', onClick:()=>window.open('https://wa.me/967700000001','_blank') },
  ]

  return (
    <div ref={fabRef} style={{ position:'fixed', bottom:26, left:22, zIndex:200 }}>

      {/* القائمة المنبثقة */}
      <div style={{
        position:'absolute', bottom:62, left:0,
        display:'flex', flexDirection:'column', gap:10,
        pointerEvents: menuOpen?'all':'none',
        opacity: menuOpen?1:0,
        transform: menuOpen?'translateY(0) scale(1)':'translateY(16px) scale(0.95)',
        transition:'all 0.3s var(--ease)',
        minWidth:220,
      }}>
        {menuItems.map((item, i) => (
          <div key={i} onClick={item.onClick}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:14, border:`1px solid ${item.border}`, background:'#050e1c', cursor:'pointer', transition:'all 0.22s', boxShadow:'0 8px 28px rgba(0,0,0,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateX(4px)'; e.currentTarget.style.borderColor=item.border.replace('0.2','0.5'); e.currentTarget.style.background='rgba(0,210,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateX(0)'; e.currentTarget.style.borderColor=item.border; e.currentTarget.style.background='#050e1c' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:item.bg, border:`1px solid ${item.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-1)', lineHeight:1.2 }}>{item.title}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace" }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة الشات */}
      {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} />}

      {/* الزر الرئيسي */}
      <button
        onClick={() => { setMenuOpen(!menuOpen); if(chatOpen) setChatOpen(false) }}
        style={{
          width:52, height:52, borderRadius:16,
          background:'linear-gradient(135deg,var(--cyan),#0077a8)',
          border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 6px 24px rgba(0,210,255,0.35)',
          transition:'all 0.3s var(--ease)',
          position:'relative', overflow:'hidden',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.08) translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(0,210,255,0.5)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(0,210,255,0.35)' }}
      >
        {/* نبضة */}
        <div style={{ position:'absolute', inset:-4, borderRadius:20, border:'2px solid rgba(0,210,255,0.4)', animation:'ringPulse 2s ease-in-out infinite', pointerEvents:'none' }} />
        {/* أيقونة */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition:'transform 0.3s', transform: menuOpen?'rotate(45deg)':'rotate(0deg)' }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

    </div>
  )
}

export default SupportFAB