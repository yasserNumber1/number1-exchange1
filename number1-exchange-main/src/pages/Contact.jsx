// src/pages/Contact.jsx — Professional redesign
import { useState, useEffect } from 'react'
import useLang from '../context/useLang'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'

// ── SVG Icons ─────────────────────────────────────────────
const IcTg = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
const IcWa = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.495 2 12.05c0 1.86.484 3.61 1.332 5.131L2 22l4.948-1.298A9.953 9.953 0 0012.05 22C17.605 22 22 17.505 22 11.95 22 6.495 17.505 2 12.05 2zm0 18.1a8.048 8.048 0 01-4.104-1.126l-.294-.175-3.056.802.817-2.977-.192-.306A8.053 8.053 0 013.9 11.95C3.9 7.54 7.54 3.9 12.05 3.9c4.41 0 8.05 3.64 8.05 8.05 0 4.41-3.64 8.15-8.05 8.15z"/></svg>
const IcMail = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
const IcCheck = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
const IcSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IcClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>

export default function Contact() {
  const { lang } = useLang()
  const isEn = lang === 'en'
  const [form, setForm]       = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState(null)
  const [focused, setFocused] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetch(`${API}/api/public/settings`)
      .then(r => r.json())
      .then(d => { if (d.success) setContacts(d) })
      .catch(() => {})
  }, [])

  const CHANNELS = [
    {
      key: 'telegram',
      icon: <IcTg/>,
      bg: '#0088cc',
      glow: 'rgba(0,136,204,0.35)',
      border: 'rgba(0,136,204,0.3)',
      cardBg: 'rgba(0,136,204,0.07)',
      name: isEn ? 'Telegram' : 'تيليجرام',
      value: contacts?.contactTelegram || '@nimber1',
      link: `https://t.me/${(contacts?.contactTelegram || 'nimber1').replace('@','')}`,
      badge: isEn ? 'Reply within minutes' : 'رد خلال دقائق',
      badgeCol: '#0088cc',
    },
    {
      key: 'whatsapp',
      icon: <IcWa/>,
      bg: '#25d366',
      glow: 'rgba(37,211,102,0.35)',
      border: 'rgba(37,211,102,0.3)',
      cardBg: 'rgba(37,211,102,0.07)',
      name: isEn ? 'WhatsApp' : 'واتساب',
      value: contacts?.contactWhatsapp || '+XXX XXX XXXX',
      link: `https://wa.me/${(contacts?.contactWhatsapp||'').replace(/\D/g,'')}`,
      badge: isEn ? 'Quick inquiries' : 'استفسارات سريعة',
      badgeCol: '#25d366',
    },
    {
      key: 'email',
      icon: <IcMail/>,
      bg: '#00b8d9',
      glow: 'rgba(0,184,217,0.35)',
      border: 'rgba(0,184,217,0.3)',
      cardBg: 'rgba(0,184,217,0.07)',
      name: isEn ? 'Email' : 'البريد الإلكتروني',
      value: contacts?.contactEmail || 'number1.yaser@gmail.com',
      link: `mailto:${contacts?.contactEmail || 'number1.yaser@gmail.com'}`,
      badge: isEn ? 'Reply within 24 hours' : 'رد خلال 24 ساعة',
      badgeCol: '#00b8d9',
    },
  ]

  const handle = () => {
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1300)
  }

  const fieldStyle = (name) => ({
    width:'100%', padding:'11px 14px',
    background: focused===name ? 'rgba(0,210,255,0.04)' : 'rgba(255,255,255,0.025)',
    border: `1px solid ${focused===name ? 'rgba(0,210,255,0.45)' : 'var(--border-1)'}`,
    borderRadius: 12, color:'var(--text-1)',
    fontFamily:"'Tajawal',sans-serif", fontSize:'.9rem',
    outline:'none', transition:'all .2s',
    boxSizing:'border-box', textAlign: isEn ? 'left' : 'right',
    boxShadow: focused===name ? '0 0 0 3px rgba(0,210,255,0.08)' : 'none',
  })

  return (
    <div style={{ minHeight:'80vh', padding:'60px 24px', maxWidth:920, margin:'0 auto', direction: isEn ? 'ltr' : 'rtl' }}>

      {/* ── Header ── */}
      <div style={{ textAlign:'center', marginBottom:56 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 18px', borderRadius:20, border:'1px solid rgba(0,212,255,0.3)', background:'rgba(0,212,255,0.06)', marginBottom:18 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 6px var(--cyan)' }}/>
          <span style={{ fontSize:'.68rem', color:'var(--cyan)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2 }}>CONTACT US</span>
        </div>
        <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:900, color:'var(--text-1)', margin:'0 0 14px' }}>
          {isEn ? 'Contact Us' : 'تواصل معنا'}
        </h1>
        <p style={{ fontSize:'.98rem', color:'var(--text-3)', maxWidth:420, margin:'0 auto', fontFamily:"'Tajawal',sans-serif", lineHeight:1.85 }}>
          {isEn ? 'Our support team is available around the clock to answer your inquiries' : 'فريق الدعم متاح على مدار الساعة للإجابة على استفساراتك'}
        </p>
      </div>

      {/* ── Channel Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:44 }}>
        {CHANNELS.map(ch => (
          <a key={ch.key} href={ch.link} target="_blank" rel="noopener noreferrer"
            style={{ background:'var(--card)', border:`1px solid ${ch.border}`, borderRadius:20, padding:'24px 20px', textDecoration:'none', display:'flex', flexDirection:'column', gap:14, transition:'all .22s', position:'relative', overflow:'hidden' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${ch.glow}` }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>

            {/* top gradient */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${ch.bg},transparent)` }}/>
            {/* bg glow */}
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:ch.cardBg, filter:'blur(20px)', pointerEvents:'none' }}/>

            {/* icon */}
            <div style={{ width:52, height:52, borderRadius:16, background:ch.bg, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 20px ${ch.glow}`, position:'relative' }}>
              {ch.icon}
            </div>

            {/* info */}
            <div>
              <div style={{ fontFamily:"'Tajawal',sans-serif", fontWeight:800, fontSize:'.95rem', color:'var(--text-1)', marginBottom:4 }}>{ch.name}</div>
              <div style={{ fontSize:'.8rem', color:ch.bg, fontFamily:"'JetBrains Mono',monospace", fontWeight:600, marginBottom:8, wordBreak:'break-all' }}>{ch.value}</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, background:`${ch.bg}15`, border:`1px solid ${ch.bg}30` }}>
                <IcClock/>
                <span style={{ fontSize:'.65rem', color:ch.badgeCol, fontFamily:"'Tajawal',sans-serif" }}>{ch.badge}</span>
              </div>
            </div>

            {/* arrow */}
            <div style={{ position:'absolute', bottom:18, left:18, color:ch.bg, opacity:.5 }}><IcArrow/></div>
          </a>
        ))}
      </div>

      {/* ── Form Card ── */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:22, overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--cyan) 40%,#7c5cfc,transparent)' }}/>

        <div style={{ padding:'32px 28px' }}>
          {/* form header */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'var(--cyan-dim)', border:'1px solid rgba(0,210,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--cyan)' }}>
              <IcSend/>
            </div>
            <div>
              <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:'.9rem', fontWeight:700, color:'var(--text-1)', letterSpacing:.5 }}>{isEn ? 'Send a Direct Message' : 'أرسل رسالة مباشرة'}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", marginTop:3 }}>{isEn ? 'We will reply as soon as possible' : 'سنرد عليك في أقرب وقت ممكن'}</div>
            </div>
          </div>

          {sent ? (
            <div style={{ textAlign:'center', padding:'44px 20px' }}>
              <div style={{ color:'var(--green)', marginBottom:16, display:'flex', justifyContent:'center' }}><IcCheck/></div>
              <h3 style={{ fontFamily:"'Tajawal',sans-serif", color:'var(--text-1)', margin:'0 0 8px', fontSize:'1.1rem' }}>{isEn ? 'Message Sent!' : 'تم إرسال رسالتك!'}</h3>
              <p style={{ color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", fontSize:'.88rem', lineHeight:1.7, maxWidth:320, margin:'0 auto 20px' }}>
                {isEn ? 'We will reply within 24 hours at most. Thank you for reaching out.' : 'سنرد عليك خلال 24 ساعة على أقصى تقدير. شكراً لتواصلك معنا.'}
              </p>
              <button onClick={()=>{ setSent(false); setForm({name:'',email:'',subject:'',message:''}) }}
                style={{ padding:'10px 26px', borderRadius:12, border:'1px solid rgba(0,210,255,0.3)', background:'var(--cyan-dim)', color:'var(--cyan)', fontFamily:"'Tajawal',sans-serif", fontSize:'.9rem', cursor:'pointer', fontWeight:700, transition:'all .2s' }}>
                {isEn ? 'Send Another Message' : 'إرسال رسالة أخرى'}
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {/* Row 1 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:7, letterSpacing:1 }}>{isEn ? 'Name *' : 'الاسم *'}</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                    placeholder={isEn ? 'Your full name' : 'اسمك الكامل'} style={fieldStyle('name')}
                    onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)}/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:7, letterSpacing:1 }}>{isEn ? 'Email *' : 'البريد الإلكتروني *'}</label>
                  <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                    placeholder="email@example.com" style={{...fieldStyle('email'), direction:'ltr', textAlign:'left'}}
                    onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)}/>
                </div>
              </div>
              {/* Subject */}
              <div>
                <label style={{ display:'block', fontSize:'.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:7, letterSpacing:1 }}>{isEn ? 'Subject' : 'الموضوع'}</label>
                <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                  placeholder={isEn ? 'Message subject' : 'موضوع رسالتك'} style={fieldStyle('subject')}
                  onFocus={()=>setFocused('subject')} onBlur={()=>setFocused(null)}/>
              </div>
              {/* Message */}
              <div>
                <label style={{ display:'block', fontSize:'.68rem', color:'var(--text-3)', fontFamily:"'JetBrains Mono',monospace", marginBottom:7, letterSpacing:1 }}>{isEn ? 'Message *' : 'الرسالة *'}</label>
                <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                  placeholder={isEn ? 'Write your message here...' : 'اكتب رسالتك هنا...'} rows={4}
                  style={{...fieldStyle('message'), resize:'vertical', minHeight:110}}
                  onFocus={()=>setFocused('message')} onBlur={()=>setFocused(null)}/>
              </div>
              {/* Submit */}
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <button onClick={handle} disabled={loading || !form.name || !form.email || !form.message}
                  style={{ flex:1, padding:'13px', background:'linear-gradient(135deg,#009fc0,#0077a0)', border:'none', borderRadius:13, color:'#fff', fontFamily:"'Tajawal',sans-serif", fontSize:'.95rem', fontWeight:700, cursor:(!form.name||!form.email||!form.message)?'not-allowed':'pointer', opacity:(!form.name||!form.email||!form.message)?0.5:1, transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(0,159,192,0.3)' }}
                  onMouseEnter={e=>{ if(!e.currentTarget.disabled) e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  {loading ? (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin .8s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> {isEn ? 'Sending...' : 'جاري الإرسال...'}</>
                  ) : (
                    <><IcSend/> {isEn ? 'Send Message' : 'إرسال الرسالة'}</>
                  )}
                </button>
                <div style={{ fontSize:'.72rem', color:'var(--text-3)', fontFamily:"'Tajawal',sans-serif", textAlign:'center', lineHeight:1.5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}><IcClock/> {isEn ? 'Reply within 24 hours' : 'رد خلال 24 ساعة'}</div>
                </div>
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
