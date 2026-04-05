// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useLang from "../context/useLang"
import { GooeyText } from "../components/ui/gooey-text-morphing"
import { SEND_METHODS, RECEIVE_METHODS } from "../data/currencies"

// ══ أيقونة العملة / المحفظة ══
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
        <img src={method.img} alt={method.name} loading="lazy"
          onError={() => setImgErr(true)}
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

// ══ قواعد التوافق ══
function isCompatible(send, recv) {
  if (!send || !recv) return true
  if (send.id === 'mgo-send')    return recv.id === 'usdt-recv'
  if (send.id === 'wallet-usdt') return recv.id === 'mgo-recv' || recv.id === 'usdt-recv'
  if (send.id === 'usdt-trc' && recv.id === 'usdt-recv') return false
  return true
}

// ══ بطاقة طريقة واحدة (ديسكتوب) ══
function MethodCard({ method, selected, disabled, onClick }) {
  const [hov, setHov] = useState(false)
  const isSelected = selected?.id === method.id
  return (
    <div
      onClick={() => !disabled && onClick(method)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 16px", borderRadius: 14, cursor: disabled ? "not-allowed" : "pointer",
        background: isSelected
          ? "linear-gradient(135deg,rgba(0,210,255,0.12),rgba(124,92,252,0.10))"
          : hov && !disabled ? "rgba(255,255,255,0.04)" : "transparent",
        border: `1.5px solid ${isSelected
          ? "rgba(0,210,255,0.45)"
          : hov && !disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
        opacity: disabled ? 0.38 : 1,
        transition: "all 0.2s",
        position: "relative", overflow: "hidden",
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--cyan),transparent)"
        }} />
      )}
      <CurrencyIcon method={method} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "0.9rem", fontWeight: 800,
          color: isSelected ? "var(--cyan)" : "var(--text-1)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          transition: "color 0.2s"
        }}>
          {method.name}
        </div>
        <div style={{
          fontSize: "0.68rem", color: "var(--text-3)",
          fontFamily: "'JetBrains Mono',monospace", marginTop: 2
        }}>
          {method.type === 'egp' ? 'EGP · جنيه مصري'
            : method.type === 'wallet' ? 'محفظة داخلية'
            : `${method.symbol} · رقمي`}
        </div>
      </div>
      {isSelected && (
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "var(--cyan)", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ══ لوحة الإرسال (ديسكتوب) ══
function SendPanel({ sendMethod, recvMethod, onSelect }) {
  const { lang } = useLang()
  const regularMethods = SEND_METHODS.filter(m => !m.walletOnly)
  const walletMethod   = SEND_METHODS.find(m => m.id === 'wallet-usdt')
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border-1)",
      borderRadius: 22, overflow: "hidden", flex: 1,
    }}>
      <div style={{
        padding: "18px 20px 14px", borderBottom: "1px solid var(--border-1)",
        background: "linear-gradient(135deg,rgba(0,210,255,0.05),rgba(124,92,252,0.03))"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--cyan-dim)", border: "1px solid rgba(0,210,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)" }}>
              {lang === "ar" ? "أنت ترسل" : "You Send"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>
              {lang === "ar" ? "اختر وسيلة الدفع" : "Select payment method"}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {regularMethods.map(m => (
          <MethodCard key={m.id} method={m} selected={sendMethod} disabled={false} onClick={onSelect} />
        ))}
        {walletMethod && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 2px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
              <span style={{
                fontSize: "0.6rem", color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace",
                letterSpacing: 1, padding: "2px 8px", border: "1px solid rgba(0,210,255,0.2)",
                borderRadius: 20, background: "rgba(0,210,255,0.05)", whiteSpace: "nowrap"
              }}>
                {lang === "ar" ? "محفظة داخلية" : "Internal Wallet"}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
            </div>
            <MethodCard method={walletMethod} selected={sendMethod} disabled={false} onClick={onSelect} />
          </>
        )}
      </div>
    </div>
  )
}

// ══ لوحة الاستلام (ديسكتوب) ══
function ReceivePanel({ sendMethod, recvMethod, onSelect }) {
  const { lang } = useLang()
  const regularMethods = RECEIVE_METHODS.filter(m => m.id !== 'wallet-recv')
  const walletMethod   = RECEIVE_METHODS.find(m => m.id === 'wallet-recv')
  const showWallet = sendMethod?.id === 'usdt-trc'
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border-1)",
      borderRadius: 22, overflow: "hidden", flex: 1,
    }}>
      <div style={{
        padding: "18px 20px 14px", borderBottom: "1px solid var(--border-1)",
        background: "linear-gradient(135deg,rgba(0,229,160,0.05),rgba(0,210,255,0.03))"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)" }}>
              {lang === "ar" ? "أنت تستقبل" : "You Receive"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'JetBrains Mono',monospace" }}>
              {lang === "ar" ? "اختر وجهة الاستلام" : "Select receive method"}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {regularMethods.map(m => {
          const incompat = sendMethod && !isCompatible(sendMethod, m)
          return (
            <MethodCard key={m.id} method={m} selected={recvMethod}
              disabled={incompat} onClick={onSelect} />
          )
        })}
        {showWallet && walletMethod && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 2px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
              <span style={{
                fontSize: "0.6rem", color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace",
                letterSpacing: 1, padding: "2px 8px", border: "1px solid rgba(0,210,255,0.2)",
                borderRadius: 20, background: "rgba(0,210,255,0.05)", whiteSpace: "nowrap"
              }}>
                {lang === "ar" ? "محفظة داخلية" : "Internal Wallet"}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
            </div>
            <MethodCard method={walletMethod} selected={recvMethod} disabled={false} onClick={onSelect} />
          </>
        )}
      </div>
    </div>
  )
}

// ══ هوك كشف الموبايل ══
function useIsMobile(bp = 640) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth <= bp
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`)
    const cb = () => setMobile(mq.matches)
    mq.addEventListener("change", cb)
    return () => mq.removeEventListener("change", cb)
  }, [bp])
  return mobile
}

// ══ بطاقة موبايل ══
function MobileMethodCard({ method, selected, disabled, onClick }) {
  const isSelected = selected?.id === method.id
  const subtitle = method.type === "egp"
    ? `EGP · ${method.network || "محفظة"}`
    : method.type === "wallet"
    ? "داخلي"
    : `${method.symbol}${method.network ? " · " + method.network : ""}`

  return (
    <div
      onClick={() => !disabled && onClick(method)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 6, padding: "12px 6px", borderRadius: 14,
        cursor: disabled ? "not-allowed" : "pointer", textAlign: "center",
        background: isSelected
          ? "linear-gradient(135deg,rgba(0,210,255,0.12),rgba(124,92,252,0.10))"
          : "transparent",
        border: `1.5px solid ${isSelected ? "rgba(0,210,255,0.45)" : "rgba(255,255,255,0.06)"}`,
        opacity: disabled ? 0.38 : 1,
        transition: "all 0.2s",
        position: "relative", overflow: "hidden",
        minHeight: 100,
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,var(--cyan),transparent)"
        }} />
      )}
      <CurrencyIcon method={method} size={40} />
      <div style={{
        fontSize: "0.78rem", fontWeight: 800, lineHeight: 1.3,
        color: isSelected ? "var(--cyan)" : "var(--text-1)",
        whiteSpace: "normal", wordBreak: "break-word",
      }}>
        {method.name}
      </div>
      <div style={{
        fontSize: "0.58rem", color: "var(--text-3)",
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        {subtitle}
      </div>
      {isSelected && (
        <div style={{
          position: "absolute", top: 5, left: 5,
          width: 16, height: 16, borderRadius: "50%",
          background: "var(--cyan)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
            stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ══ تخطيط الموبايل: عمودان جنباً لجنب ══
function MobileExchangeSelector({ sendMethod, recvMethod, onSend, onRecv, bothReady, lang }) {
  const sendMethods = [
    ...SEND_METHODS.filter(m => !m.walletOnly),
    SEND_METHODS.find(m => m.id === "wallet-usdt"),
  ].filter(Boolean)

  const recvMethods = RECEIVE_METHODS.filter(
    m => m.id !== "wallet-recv" || sendMethod?.id === "usdt-trc"
  )

  return (
    <>
      {/* ── الحاوية الرئيسية: صف أفقي ── */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border-1)",
        borderRadius: 22, padding: "14px 8px",
        display: "flex", flexDirection: "row",
        gap: 0, alignItems: "flex-start",
      }}>

        {/* ── العمود الأيمن: ترسل ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 800, letterSpacing: 1.2,
            color: "var(--cyan)", fontFamily: "'JetBrains Mono',monospace",
            padding: "0 2px 8px", textAlign: "right",
          }}>
            ترسل · SEND
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {sendMethods.map(m => (
              <MobileMethodCard key={m.id} method={m}
                selected={sendMethod} disabled={false} onClick={onSend} />
            ))}
          </div>
        </div>

        {/* ── الفاصل: سهمان ── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "flex-start", gap: 5,
          padding: "26px 5px 0", flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 014-4h14"/>
          </svg>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
        </div>

        {/* ── العمود الأيسر: تستلم ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{
            fontSize: "0.68rem", fontWeight: 800, letterSpacing: 1.2,
            color: "var(--green)", fontFamily: "'JetBrains Mono',monospace",
            padding: "0 2px 8px", textAlign: "right",
          }}>
            تستلم · RECV
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {recvMethods.map(m => (
              <MobileMethodCard key={m.id} method={m}
                selected={recvMethod}
                disabled={sendMethod ? !isCompatible(sendMethod, m) : false}
                onClick={onRecv} />
            ))}
          </div>
        </div>

      </div>

      {/* ── مؤشر الانتقال ── */}
      {bothReady && (
        <div style={{
          marginTop: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          animation: "n1FadeIn 0.3s ease",
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(0,210,255,0.2)",
            borderTopColor: "var(--cyan)",
            animation: "n1Spin 0.7s linear infinite",
          }} />
          <span style={{ fontSize: "0.78rem", color: "var(--cyan)", fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
            {lang === "ar" ? "جاري الانتقال..." : "Redirecting..."}
          </span>
        </div>
      )}
    </>
  )
}

// ══ قسم الاختيار الكامل ══
function ExchangeSelector() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [sendMethod, setSendMethod] = useState(null)
  const [recvMethod, setRecvMethod] = useState(null)
  const navigating = useRef(false)

  const handleSelectSend = (method) => {
    navigating.current = false
    setSendMethod(method)
    if (recvMethod && !isCompatible(method, recvMethod)) setRecvMethod(null)
  }

  const handleSelectRecv = (method) => {
    navigating.current = false
    setRecvMethod(method)
  }

  useEffect(() => {
    if (sendMethod && recvMethod && isCompatible(sendMethod, recvMethod) && !navigating.current) {
      navigating.current = true
      const t = setTimeout(() => {
        navigate(`/exchange/form?from=${sendMethod.id}&to=${recvMethod.id}`)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [sendMethod, recvMethod, navigate])

  const bothReady = sendMethod && recvMethod && isCompatible(sendMethod, recvMethod)

  const hint = (
    <div style={{
      textAlign: "center", marginBottom: 16,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "10px 20px", background: "rgba(0,210,255,0.04)",
      border: "1px solid rgba(0,210,255,0.12)", borderRadius: 12,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={{ fontSize: "0.78rem", color: "var(--text-2)", fontFamily: "'Tajawal',sans-serif" }}>
        {lang === "ar"
          ? "اختر وسيلة الإرسال والاستلام — سيتم الانتقال تلقائياً"
          : "Select send & receive — you'll be redirected automatically"}
      </span>
    </div>
  )

  const styles = (
    <style>{`
      @keyframes n1FadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      @keyframes n1Spin   { to { transform:rotate(360deg); } }
      @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }
    `}</style>
  )

  /* ── موبايل ≤640px ── */
  if (isMobile) {
    return (
      <div>
        {hint}
        <MobileExchangeSelector
          sendMethod={sendMethod}
          recvMethod={recvMethod}
          onSend={handleSelectSend}
          onRecv={handleSelectRecv}
          bothReady={bothReady}
          lang={lang}
        />
        {styles}
      </div>
    )
  }

  /* ── ديسكتوب ── */
  return (
    <div>
      {hint}
      <div style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "stretch" }}>
        <SendPanel sendMethod={sendMethod} recvMethod={recvMethod} onSelect={handleSelectSend} />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", flexShrink: 0, gap: 6, paddingTop: 60,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: bothReady ? "linear-gradient(135deg,var(--cyan),var(--purple))" : "var(--card)",
            border: `1.5px solid ${bothReady ? "transparent" : "var(--border-1)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.35s",
            boxShadow: bothReady ? "0 0 28px rgba(0,210,255,0.45)" : "none",
          }}>
            {bothReady ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            )}
          </div>
        </div>
        <ReceivePanel sendMethod={sendMethod} recvMethod={recvMethod} onSelect={handleSelectRecv} />
      </div>

      {bothReady && (
        <div style={{
          marginTop: 20, textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          animation: "n1FadeIn 0.3s ease"
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            border: "2px solid rgba(0,210,255,0.2)",
            borderTopColor: "var(--cyan)",
            animation: "n1Spin 0.7s linear infinite"
          }} />
          <span style={{ fontSize: "0.82rem", color: "var(--cyan)", fontFamily: "'Tajawal',sans-serif", fontWeight: 700 }}>
            {lang === "ar" ? "جاري الانتقال إلى تفاصيل الطلب..." : "Redirecting to order details..."}
          </span>
        </div>
      )}
      {styles}
    </div>
  )
}

// ══ قسم البطل ══
const HERO_GOOEY_AR = ["بشكل آمن", "وسهل", "وفوري"]
const HERO_GOOEY_EN = ["Securely", "Easily", "Instantly"]

function HeroSection({ onAbout }) {
  const { t, lang } = useLang()
  const gooeyTexts = lang === "ar" ? HERO_GOOEY_AR : HERO_GOOEY_EN
  return (
    <div className="n1-hero-block" style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 14px", border: "1px solid rgba(0,210,255,0.2)",
        borderRadius: 30, background: "rgba(0,210,255,0.05)", fontSize: "0.73rem",
        color: "var(--cyan)", letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace", marginBottom: 22
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)",
          animation: "blink 1.5s ease-in-out infinite",
          boxShadow: "0 0 8px var(--cyan)", display: "inline-block"
        }} />
        {t("hero_badge")}
      </div>
      <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 900, marginBottom: 0, lineHeight: 1.15 }}>
        {lang === "ar" ? "تبادل العملات" : "Exchange Currencies"}
      </h1>
      <div style={{ position: "relative", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <GooeyText texts={gooeyTexts} morphTime={1.2} cooldownTime={1.5} style={{ width: "100%" }} textClassName="hero-gooey-text" />
      </div>
      <p style={{ color: "var(--text-2)", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto 18px", lineHeight: 1.75 }}>
        {t("hero_desc")}
      </p>
      <button
        onClick={onAbout}
        style={{
          background: "transparent", border: "1px solid var(--border-1)",
          color: "var(--text-2)", padding: "13px 30px", borderRadius: 12,
          fontFamily: "'Tajawal',sans-serif", fontSize: "1rem", fontWeight: 700,
          cursor: "pointer", transition: "all 0.22s"
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--cyan-dim)" }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-1)"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent" }}
      >
        {t("hero_btn")}
      </button>
    </div>
  )
}

// ══ الصفحة الرئيسية ══
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