// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useLang from "../context/useLang"
import useAuth from "../context/useAuth"
import { GooeyText } from "../components/ui/gooey-text-morphing"

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Fetch full dynamic method objects from API ──────────────
function useActiveMethods() {
  const [activeSend, setActiveSend] = useState([])
  const [activeRecv, setActiveRecv] = useState([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    fetch(`${API}/api/public/exchange-methods`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) return
        // sendMethods/receiveMethods from public API are already filtered to enabled + sorted
        setActiveSend(data.sendMethods || [])
        setActiveRecv(data.receiveMethods || [])
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])
  return { activeSend, activeRecv, loaded }
}

function CurrencyIcon({ method, size = 36 }) {
  const [imgErr, setImgErr] = useState(false)
  const isWalletType = method.type === 'wallet'
  const showImg = method.img && !imgErr && !isWalletType
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: showImg ? "#fff" : method.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono',monospace", fontSize: size * 0.38 + "px",
      fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden",
      border: showImg ? "1.5px solid rgba(0,0,0,0.08)" : "none",
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
    }}>
      {showImg ? (
        <img src={method.img} alt={method.name} loading="lazy" onError={() => setImgErr(true)}
          style={{ width: "78%", height: "78%", objectFit: "contain" }} />
      ) : isWalletType ? (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
          <circle cx="17" cy="16" r="1.5" fill="#fff" stroke="none" />
        </svg>
      ) : method.symbol}
    </div>
  )
}

function LockBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span style={{ fontSize: '0.62rem', color: '#f59e0b', fontFamily: "'Cairo',sans-serif", fontWeight: 700, whiteSpace: 'nowrap' }}>تسجيل دخول</span>
    </div>
  )
}

// ── Dynamic compatibility using compatibleWith arrays from admin panel ──
function isCompatible(send, recv) {
  if (!send || !recv) return true
  // Same currency/symbol prevention
  if (send.symbol === recv.symbol && send.symbol !== 'USDT') return false
  // For USDT: prevent if both are same type (e.g. both crypto USDT)
  if (send.symbol === recv.symbol && send.type === recv.type) return false
  // Use compatibleWith arrays from database
  if (send.compatibleWith && send.compatibleWith.length > 0) {
    return send.compatibleWith.includes(recv.id)
  }
  if (recv.compatibleWith && recv.compatibleWith.length > 0) {
    return recv.compatibleWith.includes(send.id)
  }
  // Fallback: allow if different symbols
  return send.symbol !== recv.symbol
}

function MethodCard({ method, selected, disabled, onClick, locked, onLockedClick }) {
  const [hov, setHov] = useState(false)
  const isSelected = selected?.id === method.id
  return (
    <div
      onClick={() => { if (locked) { onLockedClick?.(); return } if (!disabled) onClick(method) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 16px", borderRadius: 14,
        cursor: locked ? "pointer" : disabled ? "not-allowed" : "pointer",
        background: isSelected
          ? "linear-gradient(135deg,rgba(0,210,255,0.12),rgba(124,92,252,0.10))"
          : locked ? "rgba(245,158,11,0.04)"
          : hov && !disabled ? "rgba(255,255,255,0.04)" : "transparent",
        border: `1.5px solid ${isSelected
          ? "rgba(0,210,255,0.45)"
          : locked ? "rgba(245,158,11,0.2)"
          : hov && !disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
        opacity: disabled ? 0.38 : 1,
        transition: "all 0.2s", position: "relative", overflow: "hidden",
      }}
    >
      {isSelected && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--cyan),transparent)" }} />
      )}
      <CurrencyIcon method={method} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 800, color: isSelected ? "var(--cyan)" : locked ? "#f59e0b" : "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.2s" }}>
          {method.name}
        </div>
        <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
          {method.type === 'egp' ? 'EGP · جنيه مصري' : method.type === 'wallet' ? 'محفظة داخلية' : method.type === 'moneygo' ? 'MoneyGo USD' : `${method.symbol} · رقمي`}
        </div>
      </div>
      {locked ? <LockBadge /> : isSelected && (
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      )}
    </div>
  )
}

function SendPanel({ sendMethod, recvMethod, onSelect, activeSend, user, onLockedClick }) {
  const { lang } = useLang()
  // Dynamically separate wallet-type methods from regular methods
  const regularMethods = activeSend.filter(m => m.type !== 'wallet')
  const walletMethods  = activeSend.filter(m => m.type === 'wallet')
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border-1)", borderRadius: 22, overflow: "hidden", flex: 1 }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border-1)", background: "linear-gradient(135deg,rgba(0,210,255,0.05),rgba(124,92,252,0.03))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--cyan-dim)", border: "1px solid rgba(0,210,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)" }}>{lang === "ar" ? "أنت ترسل" : "You Send"}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>{lang === "ar" ? "اختر وسيلة الدفع" : "Select payment method"}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {regularMethods.map(m => (
          <MethodCard key={m.id} method={m} selected={sendMethod} disabled={false} onClick={onSelect} />
        ))}
        {walletMethods.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 2px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
              <span style={{ fontSize: "0.6rem", color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: "2px 8px", border: "1px solid rgba(0,210,255,0.2)", borderRadius: 20, background: "rgba(0,210,255,0.05)", whiteSpace: "nowrap" }}>
                {lang === "ar" ? "محفظة داخلية" : "Internal Wallet"}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
            </div>
            {walletMethods.map(wm => (
              <MethodCard
                key={wm.id}
                method={wm}
                selected={sendMethod}
                disabled={false}
                onClick={onSelect}
                locked={!user}
                onLockedClick={onLockedClick}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ── ReceivePanel — dynamically hides wallet-type methods for guest users ──
function ReceivePanel({ sendMethod, recvMethod, onSelect, activeRecv, user }) {
  const { lang } = useLang()
  const regularMethods = activeRecv.filter(m => m.type !== 'wallet')
  // Wallet-type receive methods: only show if user is logged in AND send method is compatible
  const walletMethods  = activeRecv.filter(m => m.type === 'wallet')
  const showWallets = !!user && walletMethods.length > 0
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border-1)", borderRadius: 22, overflow: "hidden", flex: 1 }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border-1)", background: "linear-gradient(135deg,rgba(0,229,160,0.05),rgba(0,210,255,0.03))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)" }}>{lang === "ar" ? "أنت تستقبل" : "You Receive"}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>{lang === "ar" ? "اختر وجهة الاستلام" : "Select receive method"}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {regularMethods.map(m => (
          <MethodCard key={m.id} method={m} selected={recvMethod} disabled={sendMethod && !isCompatible(sendMethod, m)} onClick={onSelect} />
        ))}
        {showWallets && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 2px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
              <span style={{ fontSize: "0.6rem", color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: "2px 8px", border: "1px solid rgba(0,210,255,0.2)", borderRadius: 20, background: "rgba(0,210,255,0.05)", whiteSpace: "nowrap" }}>
                {lang === "ar" ? "محفظة داخلية" : "Internal Wallet"}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
            </div>
            {walletMethods.map(wm => (
              <MethodCard key={wm.id} method={wm} selected={recvMethod} disabled={sendMethod && !isCompatible(sendMethod, wm)} onClick={onSelect} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function useIsMobile(bp = 640) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= bp)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`)
    const cb = () => setMobile(mq.matches)
    mq.addEventListener("change", cb)
    return () => mq.removeEventListener("change", cb)
  }, [bp])
  return mobile
}

function MobileMethodCard({ method, selected, disabled, onClick, locked, onLockedClick }) {
  const [hov, setHov] = useState(false)
  const isSelected = selected?.id === method.id
  const subtitle = method.type === "egp" ? `EGP · ${method.network || "محفظة"}`
    : method.type === "wallet" ? "داخلي"
    : method.type === "moneygo" ? "MoneyGo USD"
    : `${method.symbol}${method.network ? " · " + method.network : ""}`

  return (
    <div
      onClick={() => { if (locked) { onLockedClick?.(); return } if (!disabled) onClick(method) }}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 5, padding: "10px 6px", borderRadius: 12,
        cursor: locked || !disabled ? "pointer" : "not-allowed",
        textAlign: "center",
        background: isSelected
          ? "linear-gradient(135deg,rgba(0,210,255,0.13),rgba(124,92,252,0.09))"
          : locked ? "rgba(245,158,11,0.04)"
          : hov ? "rgba(255,255,255,0.05)" : "transparent",
        border: `1.5px solid ${
          isSelected ? "rgba(0,210,255,0.5)"
          : locked ? "rgba(245,158,11,0.25)"
          : hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        opacity: disabled ? 0.32 : 1,
        transition: "all 0.18s ease",
        position: "relative", overflow: "hidden",
        width: "100%", boxSizing: "border-box", userSelect: "none",
      }}
    >
      {isSelected && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--cyan),transparent)" }} />
      )}
      <CurrencyIcon method={method} size={30} />
      <div style={{ fontSize: "0.7rem", fontWeight: 800, lineHeight: 1.25, color: isSelected ? "var(--cyan)" : locked ? "#f59e0b" : "var(--text-1)", whiteSpace: "normal", wordBreak: "break-word" }}>
        {method.name}
      </div>
      <div style={{ fontSize: "0.55rem", color: isSelected ? "rgba(0,210,255,0.6)" : "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>
        {subtitle}
      </div>
      {locked && (
        <div style={{ position: "absolute", top: 4, left: 4, width: 16, height: 16, borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
      )}
      {isSelected && !locked && (
        <div style={{ position: "absolute", top: 5, right: 5, width: 13, height: 13, borderRadius: "50%", background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </div>
  )
}

// ── MobileExchangeSelector — dynamically hides wallet-type methods for guests ──
function MobileExchangeSelector({ sendMethod, recvMethod, onSend, onRecv, bothReady, lang, activeSend, activeRecv, user, onLockedClick }) {
  // Wallet-type receive methods hidden for guests
  const recvMethods = activeRecv.filter(m =>
    m.type !== 'wallet' || !!user
  )
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: 0, position: "relative" }}>
        {/* SEND */}
        <div style={{ flex: 1, minWidth: 0, background: "var(--card)", border: "1px solid var(--border-1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 10px 6px", borderBottom: "1px solid var(--border-1)", background: "linear-gradient(135deg,rgba(0,210,255,0.07),transparent)", textAlign: "center" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: 1, color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace" }}>SEND · ترسل</span>
          </div>
          <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {activeSend.map(m => (
              <MobileMethodCard
                key={m.id} method={m} selected={sendMethod} disabled={false}
                onClick={onSend}
                locked={m.type === 'wallet' && !user}
                onLockedClick={onLockedClick}
              />
            ))}
          </div>
        </div>

        {/* سهم */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 32, zIndex: 1 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--bg)", border: "1.5px solid var(--border-1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </div>
        </div>

        {/* RECV */}
        <div style={{ flex: 1, minWidth: 0, background: "var(--card)", border: "1px solid var(--border-1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 10px 6px", borderBottom: "1px solid var(--border-1)", background: "linear-gradient(135deg,rgba(0,229,160,0.07),transparent)", textAlign: "center" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: 1, color: "var(--green)", fontFamily: "'JetBrains Mono',monospace" }}>RECV · تستلم</span>
          </div>
          <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {recvMethods.map(m => (
              <MobileMethodCard key={m.id} method={m} selected={recvMethod} disabled={sendMethod ? !isCompatible(sendMethod, m) : false} onClick={onRecv} />
            ))}
          </div>
        </div>
      </div>

      {bothReady && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animation: "n1FadeIn 0.3s ease" }}>
          <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(0,210,255,0.2)", borderTopColor: "var(--cyan)", animation: "n1Spin 0.7s linear infinite" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--cyan)", fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
            {lang === "ar" ? "جاري الانتقال..." : "Redirecting..."}
          </span>
        </div>
      )}
    </>
  )
}

function ExchangeSelector() {
  const { lang } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { activeSend, activeRecv, loaded } = useActiveMethods()

  const [sendMethod, setSendMethod] = useState(null)
  const [recvMethod, setRecvMethod] = useState(null)
  const [loginAlert, setLoginAlert] = useState(false)
  const navigating = useRef(false)

  useEffect(() => {
    if (loaded && activeSend.length > 0 && !sendMethod) {
      const usdt = activeSend.find(m => m.id === 'usdt-trc')
      setSendMethod(usdt ?? activeSend[0])
    }
  }, [activeSend, loaded])

  // إذا تغيّر user وكان recvMethod محفظة وغير مسجل — امسحه
  useEffect(() => {
    if (!user && recvMethod?.type === 'wallet') setRecvMethod(null)
  }, [user])

  const handleLockedClick = () => {
    setLoginAlert(true)
    setTimeout(() => setLoginAlert(false), 3500)
  }

  const handleSelectSend = (method) => {
    if (method.type === 'wallet' && !user) { handleLockedClick(); return }
    navigating.current = false
    setSendMethod(method)
    if (recvMethod && !isCompatible(method, recvMethod)) setRecvMethod(null)
    setLoginAlert(false)
  }

  const handleSelectRecv = (method) => {
    navigating.current = false
    setRecvMethod(method)
  }

  useEffect(() => {
    if (sendMethod && recvMethod && isCompatible(sendMethod, recvMethod) && !navigating.current) {
      navigating.current = true
      const t = setTimeout(() => navigate(`/exchange/form?from=${sendMethod.id}&to=${recvMethod.id}`), 300)
      return () => clearTimeout(t)
    }
  }, [sendMethod, recvMethod, navigate])

  const bothReady = sendMethod && recvMethod && isCompatible(sendMethod, recvMethod)

  const hint = (
    <div style={{ textAlign: "center", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px", background: "rgba(0,210,255,0.04)", border: "1px solid rgba(0,210,255,0.12)", borderRadius: 12 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style={{ fontSize: "0.78rem", color: "var(--text-2)", fontFamily: "'Tajawal',sans-serif" }}>
        {lang === "ar" ? "اختر وسيلة الإرسال والاستلام — سيتم الانتقال تلقائياً" : "Select send & receive — you'll be redirected automatically"}
      </span>
    </div>
  )

  const styles = <style>{`@keyframes n1FadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes n1Spin{to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes alertIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

  const lockAlert = loginAlert && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: 14, fontFamily: "'Cairo','Tajawal',sans-serif", fontSize: '0.87rem', color: '#f59e0b', animation: 'alertIn 0.2s ease' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <span style={{ flex: 1 }}>المحفظة الداخلية تتطلب <strong>تسجيل الدخول</strong> أولاً</span>
    </div>
  )

  if (isMobile) {
    return (
      <div>
        {hint}
        {lockAlert}
        <MobileExchangeSelector
          sendMethod={sendMethod} recvMethod={recvMethod}
          onSend={handleSelectSend} onRecv={handleSelectRecv}
          bothReady={bothReady} lang={lang}
          activeSend={activeSend} activeRecv={activeRecv}
          user={user} onLockedClick={handleLockedClick}
        />
        {styles}
      </div>
    )
  }

  return (
    <div>
      {hint}
      {lockAlert}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "stretch" }}>
        <SendPanel sendMethod={sendMethod} recvMethod={recvMethod} onSelect={handleSelectSend} activeSend={activeSend} user={user} onLockedClick={handleLockedClick} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 6, paddingTop: 60 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: bothReady ? "linear-gradient(135deg,var(--cyan),var(--purple))" : "var(--card)", border: `1.5px solid ${bothReady ? "transparent" : "var(--border-1)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.35s", boxShadow: bothReady ? "0 0 28px rgba(0,210,255,0.45)" : "none" }}>
            {bothReady ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
            )}
          </div>
        </div>
        {/* ← نمرر user لـ ReceivePanel */}
        <ReceivePanel sendMethod={sendMethod} recvMethod={recvMethod} onSelect={handleSelectRecv} activeRecv={activeRecv} user={user} />
      </div>
      {bothReady && (
        <div style={{ marginTop: 20, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animation: "n1FadeIn 0.3s ease" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,210,255,0.2)", borderTopColor: "var(--cyan)", animation: "n1Spin 0.7s linear infinite" }} />
          <span style={{ fontSize: "0.82rem", color: "var(--cyan)", fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
            {lang === "ar" ? "جاري الانتقال إلى تفاصيل الطلب..." : "Redirecting to order details..."}
          </span>
        </div>
      )}
      {styles}
    </div>
  )
}

const HERO_GOOEY_AR = ["بشكل آمن", "وسهل", "وفوري"]
const HERO_GOOEY_EN = ["Securely", "Easily", "Instantly"]

function HeroSection({ onAbout }) {
  const { t, lang } = useLang()
  const gooeyTexts = lang === "ar" ? HERO_GOOEY_AR : HERO_GOOEY_EN
  return (
    <div className="n1-hero-block" style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", border: "1px solid rgba(0,210,255,0.2)", borderRadius: 30, background: "rgba(0,210,255,0.05)", fontSize: "0.73rem", color: "var(--cyan)", letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace", marginBottom: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", animation: "blink 1.5s ease-in-out infinite", boxShadow: "0 0 8px var(--cyan)", display: "inline-block" }} />
        {t("hero_badge")}
      </div>
      <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 900, marginBottom: 0, lineHeight: 1.15 }}>
        {lang === "ar" ? "تبادل العملات" : "Exchange Currencies"}
      </h1>
      <div style={{ position: "relative", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <GooeyText texts={gooeyTexts} morphTime={1.2} cooldownTime={1.5} style={{ width: "100%" }} textClassName="hero-gooey-text" />
      </div>
      <p style={{ color: "var(--text-2)", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto 18px", lineHeight: 1.75 }}>{t("hero_desc")}</p>
      <button onClick={onAbout}
        style={{ background: "transparent", border: "1px solid var(--border-1)", color: "var(--text-2)", padding: "13px 30px", borderRadius: 12, fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer", transition: "all 0.22s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--cyan-dim)" }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-1)"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent" }}>
        {t("hero_btn")}
      </button>
    </div>
  )
}

function Home({ onOpenAuth }) {
  const navigate = useNavigate()
  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <section style={{ padding: '45px 0 60px' }}>
        <div className="mobile-home-root n1-home-shell" style={{ maxWidth: 920, margin: '0 auto', padding: '0 22px' }}>
          <HeroSection onAbout={() => navigate("/about")} />
          <ExchangeSelector />
        </div>
      </section>
    </div>
  )
}

export default Home