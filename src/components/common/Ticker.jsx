// src/components/Ticker.jsx
import { useState, useEffect } from 'react'
import { TICKER_DATA } from '../../data/currencies'

function TickerItem({ item }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:'0.77rem', whiteSpace:'nowrap' }}>
      <span style={{ color:'var(--text-3)', fontWeight:700 }}>{item.symbol}</span>
      <span style={{ color:'var(--text-3)' }}>·</span>
      <span style={{ color:'var(--text-1)' }}>${item.price}</span>
      <span style={{ color: item.up ? 'var(--green)' : 'var(--red)' }}>{item.change}</span>
    </div>
  )
}

function Ticker() {
  const [prices, setPrices] = useState(TICKER_DATA)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(item => {
        const change = (Math.random() - 0.5) * 0.01
        const oldPrice = parseFloat(item.price.replace(',', ''))
        const newPrice = Math.max(0.0001, oldPrice * (1 + change))
        const up = change >= 0
        return {
          ...item,
          price: newPrice >= 1 ? newPrice.toLocaleString('en', { maximumFractionDigits:2 }) : newPrice.toFixed(4),
          change: `${up ? '+' : '-'}${(Math.abs(change) * 100).toFixed(2)}%`,
          up,
        }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background:'rgba(0,210,255,0.03)', borderBottom:'1px solid var(--border-1)', position:'sticky', top:0, zIndex:101, padding:'8px 0', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, right:0, height:'100%', width:80, zIndex:2, background:'linear-gradient(to left, var(--bg), transparent)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, left:0, height:'100%', width:80, zIndex:2, background:'linear-gradient(to right, var(--bg), transparent)', pointerEvents:'none' }} />
      <div style={{ direction:'ltr', overflow:'hidden' }}>
        <div style={{ display:'inline-flex', gap:48, whiteSpace:'nowrap', animation:'ticker-scroll 25s linear infinite' }}>
          {prices.map((item, i) => <TickerItem key={`a-${i}`} item={item} />)}
          {prices.map((item, i) => <TickerItem key={`b-${i}`} item={item} />)}
        </div>
      </div>
    </div>
  )
}

export default Ticker
