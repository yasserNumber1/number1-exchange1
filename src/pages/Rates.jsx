// src/pages/Rates.jsx
import { useState, useEffect } from 'react'
import useLang from '../context/useLang'
import { RATES_DATA } from '../data/currencies'

const COLORS = { BTC:'#f7931a',ETH:'#627eea',USDT:'#26a17b',MGO:'#e91e63',BNB:'#f0b90b',TON:'#0098ea',LTC:'#bfbbbb',XRP:'#00aae4',SOL:'#9945ff',ADA:'#0033ad' }

export function Rates() {
  const { t } = useLang()
  const [rates, setRates] = useState(RATES_DATA.map(r=>({...r,color:COLORS[r.symbol]||'#00d2ff'})))
  const [flashing, setFlashing] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      setRates(prev => prev.map(r => {
        const d = (Math.random()-0.5)*r.price*0.006
        return { ...r, price:Math.max(0.0001,r.price+d), change:Math.abs(d/r.price*100), up:d>=0 }
      }))
      const newFlash = {}
      RATES_DATA.forEach(r => { newFlash[r.symbol] = true })
      setFlashing(newFlash)
      setTimeout(()=>setFlashing({}),500)
    }, 3500)
    return ()=>clearInterval(timer)
  }, [])

  return (
    <div style={{ position:'relative',zIndex:2 }}>
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'55px 22px' }}>
        <div style={{ textAlign:'center',marginBottom:48 }}>
          <div style={{ display:'inline-block',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',letterSpacing:3,textTransform:'uppercase',color:'var(--cyan)',marginBottom:11,padding:'3px 11px',border:'1px solid rgba(0,210,255,0.14)',borderRadius:20,background:'rgba(0,210,255,0.04)' }}>{t('rates_badge')}</div>
          <h2 style={{ fontSize:'clamp(1.55rem,2.8vw,2.3rem)',fontWeight:900,marginBottom:9 }}>{t('rates_title')}</h2>
          <p style={{ color:'var(--text-2)',fontSize:'0.93rem' }}>{t('rates_desc')}</p>
        </div>
        <div style={{ background:'var(--card)',border:'1px solid var(--border-1)',borderRadius:20,overflow:'hidden',backdropFilter:'blur(16px)' }}>
          <div style={{ padding:'17px 22px',borderBottom:'1px solid var(--border-1)',display:'flex',alignItems:'center',gap:11 }}>
            <div style={{ width:33,height:33,borderRadius:9,background:'var(--cyan-dim)',border:'1px solid rgba(0,210,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    </div>
            <h3 style={{ fontSize:'0.92rem',fontWeight:700,flex:1 }}>{t('rates_table')}</h3>
            <div style={{ display:'flex',alignItems:'center',gap:5,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.66rem',color:'var(--green)',background:'rgba(0,229,160,0.07)',border:'1px solid rgba(0,229,160,0.14)',padding:'2px 8px',borderRadius:20 }}>
              <span style={{ width:5,height:5,borderRadius:'50%',background:'var(--green)',animation:'blink 1.5s ease-in-out infinite',display:'inline-block' }} />LIVE
            </div>
          </div>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead>
              <tr>{[t('rates_col1'),t('rates_col2'),t('rates_col3'),t('rates_col4')].map((h,i)=>(
                <th key={i} style={{ padding:'12px 16px',borderBottom:'1px solid var(--border-1)',textAlign:'right',fontSize:'0.78rem',color:'var(--text-3)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:0.5,textTransform:'uppercase',fontWeight:700 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rates.map(r=>(
                <tr key={r.symbol} style={{ background: flashing[r.symbol]?'rgba(0,210,255,0.05)':'transparent',transition:'background 0.5s' }}>
                  <td style={{ padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:'50%',background:r.color,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.7rem',fontWeight:700,color:'#fff',flexShrink:0 }}>{r.symbol[0]}</div>
                      <div><div style={{ fontWeight:700,fontSize:'0.9rem' }}>{r.name}</div><div style={{ fontSize:'0.7rem',color:'var(--text-3)',fontFamily:"'JetBrains Mono',monospace" }}>{r.symbol}</div></div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:'0.9rem',direction:'ltr',textAlign:'left' }}>
                    ${r.price>=1?r.price.toLocaleString('en',{maximumFractionDigits:2}):r.price.toFixed(4)}
                  </td>
                  <td style={{ padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.85rem' }}>
                    <span style={{ color: r.up?'var(--green)':'var(--red)',fontWeight:700 }}>{r.up?'+':'-'}{Math.abs(r.change).toFixed(2)}%</span>
                  </td>
                  <td style={{ padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ padding:'3px 10px',borderRadius:20,fontSize:'0.72rem',fontFamily:"'JetBrains Mono',monospace",background:'rgba(0,229,160,0.1)',color:'var(--green)',border:'1px solid rgba(0,229,160,0.2)' }}>ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginTop:28 }}>
          {[{icon:'trend-up',label: t('rates_col3').replace('24h','').trim()+' ↑',value:'BTC +4.2%',color:'var(--green)'},{icon:'trend-down',label:t('rates_col3').replace('24h','').trim()+' ↓',value:'ETH -1.8%',color:'var(--red)'},{icon:'volume',label:'Vol 24h',value:'$2.4B',color:'var(--cyan)'}].map((s,i)=>(
            <div key={i} style={{ background:'var(--card)',border:'1px solid var(--border-1)',borderRadius:16,padding:'20px 22px',display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ fontSize:'1.8rem' }}>{s.icon==='trend-up'?<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'><polyline points='23 6 13.5 15.5 8.5 10.5 1 18'/><polyline points='17 6 23 6 23 12'/></svg>:s.icon==='trend-down'?<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'><polyline points='23 18 13.5 8.5 8.5 13.5 1 6'/><polyline points='17 18 23 18 23 12'/></svg>:<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='1' y='3' width='15' height='13' rx='2'/><path d='M16 8h5'/><path d='M16 12h5'/><path d='M19 3v18'/></svg>}</div>
              <div><div style={{ fontSize:'0.75rem',color:'var(--text-3)',fontFamily:"'JetBrains Mono',monospace",marginBottom:4 }}>{s.label}</div><div style={{ fontSize:'1.1rem',fontWeight:800,color:s.color,fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
