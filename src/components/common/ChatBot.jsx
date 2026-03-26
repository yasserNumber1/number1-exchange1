// src/components/ChatBot.jsx
import { useState, useRef, useEffect } from 'react'
import { ROBOT_IMG } from '../RobotImg'

const WHATSAPP_NUMBER = '9647XXXXXXXXX'
const TELEGRAM_USER   = 'Number1Exchange'

const BOT_QS = [
  { id: 'q1', text: '💱 كيف أبدأ عملية التبادل؟' },
  { id: 'q2', text: '💰 ما هي الرسوم؟' },
  { id: 'q3', text: '⏱️ كم يستغرق التحويل؟' },
  { id: 'q4', text: '🔐 هل بياناتي آمنة؟' },
  { id: 'q5', text: '📋 ما هي العملات المدعومة؟' },
  { id: 'q6', text: '🧑‍💼 التحدث مع الدعم البشري' },
]
const BOT_ANS = {
  q1: 'اختر العملة التي تريد إرسالها، أدخل المبلغ، ثم أدخل بيانات المحفظة والبريد الإلكتروني واضغط "إرسال طلب التبادل". ستصلك تأكيد فوري! 🚀',
  q2: 'رسومنا تبدأ من **0.1%** فقط — من أقل الرسوم في السوق مع أفضل أسعار الصرف المتاحة. 💚',
  q3: 'معظم العمليات تتم خلال **1 إلى 5 دقائق** بعد تأكيد التحويل من طرفك. ⚡',
  q4: 'نعم! نستخدم تشفير **AES-256** مع حماية متعددة الطبقات. بياناتك محمية بأعلى معايير الأمان. 🔐',
  q5: 'ندعم: **فودافون كاش، إنستا باي، اتصالات كاش** ↔ **USDT TRC20 وMoneyGo USD**. نعمل على إضافة المزيد! 💱',
  q6: 'support',
}

// ── Animated Robot ──────────────────────────────────────────
function RobotAvatar({ size = 44, animate = 'idle' }) {
  // animate: 'idle' | 'wave' | 'wink' | 'talking'
  return (
    <div style={{
      width: size, height: size,
      position: 'relative', flexShrink: 0,
    }}>
      <img
        src={ROBOT_IMG}
        alt="bot"
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(0,210,255,0.5))',
          animation:
            animate === 'wave'    ? 'robotWave 0.6s ease-in-out 3' :
            animate === 'wink'    ? 'robotWink 0.4s ease-in-out 2' :
            animate === 'talking' ? 'robotTalk 0.5s ease-in-out infinite' :
                                    'robotIdle 3s ease-in-out infinite',
          transformOrigin: 'bottom center',
        }}
      />
      {/* Glow ring */}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%',
        transform: 'translateX(-50%)',
        width: size * 0.7, height: 6,
        background: 'radial-gradient(ellipse,rgba(0,210,255,0.5),transparent 70%)',
        borderRadius: '50%',
        animation: 'robotGlow 2s ease-in-out infinite',
      }} />
    </div>
  )
}

// ── Typing dots ─────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 2px' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--cyan)',
          animation: `botDot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

// ── Message ─────────────────────────────────────────────────
function Msg({ text, isUser, time, robAnim }) {
  const parsed = (text || '').replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--cyan)">$1</strong>')
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 8,
      justifyContent: isUser ? 'flex-start' : 'flex-end',
      marginBottom: 10,
      animation: 'msgIn 0.25s ease',
    }}>
      {!isUser && <RobotAvatar size={34} animate={robAnim || 'idle'} />}
      <div style={{
        maxWidth: '72%',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isUser
          ? 'linear-gradient(135deg,rgba(0,210,255,0.15),rgba(0,134,179,0.2))'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isUser ? 'rgba(0,210,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
        fontSize: '0.84rem', color: 'var(--text-1)', lineHeight: 1.6, direction: 'rtl',
      }}>
        <div dangerouslySetInnerHTML={{ __html: parsed }} />
        {time && (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', marginTop: 4, fontFamily: "'JetBrains Mono',monospace", textAlign: isUser ? 'right' : 'left' }}>{time}</div>
        )}
      </div>
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen]         = useState(false)
  const [greeted, setGreeted]   = useState(false)
  const [messages, setMessages] = useState([])
  const [showOpts, setShowOpts] = useState(false)
  const [showSup, setShowSup]   = useState(false)
  const [typing, setTyping]     = useState(false)
  const [input, setInput]       = useState('')
  const [unread, setUnread]     = useState(1)
  const [robAnim, setRobAnim]   = useState('idle')
  const [fabAnim, setFabAnim]   = useState(true)
  const bottomRef = useRef(null)

  const now = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  // greeting
  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true); setUnread(0); setFabAnim(false)
      setRobAnim('wave')
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMessages([{
          id: 1, text: 'مرحباً بك في **Number 1 Exchange**! 👋\nأنا N1-BOT مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟',
          isUser: false, time: now(), robAnim: 'wave',
        }])
        setRobAnim('wink')
        setTimeout(() => { setRobAnim('idle'); setShowOpts(true) }, 800)
      }, 1200)
    }
  }, [open])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing, showOpts, showSup])

  // random blink every 3-6s
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      if (robAnim === 'idle') {
        setRobAnim('wink')
        setTimeout(() => setRobAnim('idle'), 500)
      }
    }, 3000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [open, robAnim])

  const addMsg = (text, isUser, anim) => {
    setMessages(prev => [...prev, { id: Date.now(), text, isUser, time: now(), robAnim: anim || 'idle' }])
  }

  const pickQ = (id, text) => {
    setShowOpts(false); setShowSup(false)
    addMsg(text, true)
    setTyping(true); setRobAnim('talking')
    setTimeout(() => {
      setTyping(false)
      const ans = BOT_ANS[id]
      if (ans === 'support') {
        setRobAnim('wave')
        addMsg('يسعدني توصيلك بفريق الدعم! 😊\nاختر طريقة التواصل المفضلة:', false, 'wave')
        setTimeout(() => { setShowSup(true); setRobAnim('idle') }, 300)
      } else {
        setRobAnim('idle')
        addMsg(ans, false, 'idle')
        setTimeout(() => {
          addMsg('هل هناك شيء آخر يمكنني مساعدتك به؟ 😊', false, 'wink')
          setTimeout(() => setShowOpts(true), 300)
        }, 700)
      }
    }, 900 + Math.random() * 500)
  }

  const sendFree = () => {
    if (!input.trim()) return
    const txt = input.trim(); setInput('')
    setShowOpts(false); setShowSup(false)
    addMsg(txt, true)
    setTyping(true); setRobAnim('talking')
    setTimeout(() => {
      setTyping(false); setRobAnim('wave')
      addMsg('شكراً على رسالتك! 😊 للمساعدة الفورية تواصل مع فريق الدعم:', false, 'wave')
      setTimeout(() => { setShowSup(true); setRobAnim('idle') }, 300)
    }, 1000)
  }

  return (
    <>
      <style>{`
        @keyframes botDot{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fabPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,210,255,.7)}70%{box-shadow:0 0 0 14px rgba(0,210,255,0)}}
        @keyframes fabBounce{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-6px) rotate(-5deg)}75%{transform:translateY(-3px) rotate(5deg)}}
        @keyframes robotIdle{0%,100%{transform:translateY(0) rotate(0deg) scale(1)}33%{transform:translateY(-3px) rotate(-3deg) scale(1.03)}66%{transform:translateY(-1px) rotate(2deg) scale(1.01)}}
        @keyframes robotWave{0%{transform:rotate(0deg) scale(1)}20%{transform:rotate(-15deg) scale(1.1)}40%{transform:rotate(10deg) scale(1.05)}60%{transform:rotate(-10deg) scale(1.08)}80%{transform:rotate(8deg) scale(1.04)}100%{transform:rotate(0deg) scale(1)}}
        @keyframes robotWink{0%,100%{transform:scale(1) scaleY(1)}30%{transform:scale(1.05) scaleY(0.95)}50%{transform:scale(1.08) scaleY(1.05)}70%{transform:scale(1.04) scaleY(0.98)}}
        @keyframes robotTalk{0%,100%{transform:scale(1)}50%{transform:scale(1.04) translateY(-2px)}}
        @keyframes robotGlow{0%,100%{opacity:.4;transform:translateX(-50%) scaleX(1)}50%{opacity:.9;transform:translateX(-50%) scaleX(1.3)}}
        @keyframes tooltipIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* ── FAB button ── */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>

        {/* Tooltip bubble */}
        {!open && fabAnim && (
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border-2)',
            borderRadius: 14, padding: '10px 14px',
            fontSize: '0.8rem', color: 'var(--text-1)',
            whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,.5)',
            animation: 'tooltipIn .35s ease',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RobotAvatar size={28} animate="wave" />
            <span>مرحباً! هل تحتاج مساعدة؟ 👋</span>
          </div>
        )}

        <button onClick={() => setOpen(o => !o)} style={{
          width: 62, height: 62, borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg,#ff3d5a,#c0002a)'
            : 'linear-gradient(135deg,#00d2ff,#0077b6)',
          border: '2px solid rgba(255,255,255,0.2)',
          cursor: 'pointer', padding: 0, overflow: 'hidden',
          boxShadow: open
            ? '0 6px 24px rgba(255,61,90,.6)'
            : '0 6px 24px rgba(0,210,255,.6)',
          animation: !open && fabAnim ? 'fabPulse 2.2s infinite, fabBounce 2.5s ease-in-out infinite' : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {open
            ? <span style={{ fontSize: '1.4rem', color: '#fff' }}>✕</span>
            : <RobotAvatar size={48} animate={fabAnim ? 'wave' : 'idle'} />
          }
          {!open && unread > 0 && (
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 20, height: 20, borderRadius: '50%',
              background: '#ff3d5a', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg)', fontFamily: "'JetBrains Mono',monospace",
            }}>{unread}</div>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, left: 24, zIndex: 998,
          width: 340, height: 530,
          background: 'var(--card)', border: '1px solid var(--border-2)',
          borderRadius: 22, boxShadow: '0 24px 60px rgba(0,0,0,.65)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp .25s ease',
        }}>
          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--cyan),var(--purple),transparent)' }} />

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#00b8d9 0%,#0055a5 100%)',
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <RobotAvatar size={46} animate={robAnim} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', letterSpacing: 0.5 }}>N1-BOT المساعد الذكي</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 6px #00e5a0', animation: 'fabPulse 2s infinite' }} />
                متاح الآن · 24/7
              </div>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono',monospace", background: 'rgba(255,255,255,0.12)', padding: '3px 8px', borderRadius: 8 }}>
              NUMBER 1
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
            {messages.map(m => (
              <Msg key={m.id} text={m.text} isUser={m.isUser} time={m.time} robAnim={m.robAnim} />
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'flex-end', marginBottom: 10, animation: 'msgIn .25s ease' }}>
                <RobotAvatar size={34} animate="talking" />
                <div style={{ padding: '10px 14px', borderRadius: '4px 18px 18px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Quick options */}
            {showOpts && !typing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10, animation: 'msgIn .3s ease' }}>
                {BOT_QS.map(q => (
                  <button key={q.id} onClick={() => pickQ(q.id, q.text)}
                    style={{
                      padding: '9px 14px', borderRadius: 12,
                      background: 'transparent',
                      border: '1px solid rgba(0,210,255,0.3)',
                      color: 'var(--cyan)', fontSize: '0.82rem',
                      cursor: 'pointer', textAlign: 'right',
                      transition: 'all 0.2s', fontFamily: "'Tajawal',sans-serif",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,210,255,0.1)'; e.currentTarget.style.borderColor = 'var(--cyan)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,210,255,0.3)' }}>
                    {q.text}
                  </button>
                ))}
              </div>
            )}

            {/* Support links */}
            {showSup && !typing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10, animation: 'msgIn .3s ease' }}>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(37,211,102,0.12),rgba(18,140,126,0.08))', border: '1px solid rgba(37,211,102,0.4)', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.495 2 12.05c0 1.86.484 3.61 1.332 5.131L2 22l4.948-1.298A9.953 9.953 0 0012.05 22C17.605 22 22 17.505 22 11.95 22 6.495 17.505 2 12.05 2zm0 18.1a8.048 8.048 0 01-4.104-1.126l-.294-.175-3.056.802.817-2.977-.192-.306A8.053 8.053 0 013.9 11.95C3.9 7.54 7.54 3.9 12.05 3.9c4.41 0 8.05 3.64 8.05 8.05 0 4.41-3.64 8.15-8.05 8.15z"/></svg>
                  </div>
                  <div><div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#25d366' }}>واتساب</div><div style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>تواصل فوري مع الدعم</div></div>
                  <span style={{ marginRight: 'auto', color: 'var(--text-3)' }}>←</span>
                </a>

                <a href={`https://t.me/${TELEGRAM_USER}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(0,136,204,0.12),rgba(0,100,180,0.08))', border: '1px solid rgba(0,136,204,0.4)', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0088cc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,136,204,0.4)' }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </div>
                  <div><div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0088cc' }}>تيليجرام</div><div style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>@{TELEGRAM_USER}</div></div>
                  <span style={{ marginRight: 'auto', color: 'var(--text-3)' }}>←</span>
                </a>

                <button onClick={() => { setShowSup(false); setShowOpts(true) }}
                  style={{ padding: '8px', background: 'transparent', border: '1px solid var(--border-1)', borderRadius: 10, color: 'var(--text-3)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Tajawal',sans-serif" }}>
                  ← العودة للأسئلة
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-1)', display: 'flex', gap: 8, alignItems: 'center', background: 'var(--card)', flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendFree()}
              placeholder="اكتب رسالتك..."
              style={{ flex: 1, padding: '9px 13px', background: 'var(--row-bg)', border: '1px solid var(--border-1)', borderRadius: 12, color: 'var(--text-1)', fontSize: '0.85rem', outline: 'none', fontFamily: "'Tajawal',sans-serif", direction: 'rtl', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-2)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-1)'}
            />
            <button onClick={sendFree}
              style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#00b8d9,#0077b6)', border: 'none', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,210,255,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
