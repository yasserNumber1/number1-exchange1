// ============================================
// services/orderSession.js
// إدارة جلسة تتبع الطلب (Cookie + localStorage)
// ============================================

const COOKIE_NAME  = 'n1_order_session'
const STORAGE_KEY  = 'n1_order_session'
const LIFETIME_MIN = 30

// ── حفظ الجلسة ─────────────────────────────────
export function saveOrderSession({ sessionToken, orderNumber, expiresAt }) {
  if (!sessionToken || !orderNumber) return

  const data = JSON.stringify({ sessionToken, orderNumber, expiresAt })

  // localStorage (للبقاء بعد الإغلاق)
  try {
    localStorage.setItem(STORAGE_KEY, data)
  } catch (_) {}

  // Cookie (صلاحية 30 دقيقة)
  const expires = new Date(expiresAt || Date.now() + LIFETIME_MIN * 60 * 1000)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

// ── قراءة الجلسة ────────────────────────────────
export function readOrderSession() {
  // أولاً: من localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // التحقق من الصلاحية
      if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
        return parsed
      }
      // انتهت الصلاحية — حذف
      clearOrderSession()
      return null
    }
  } catch (_) {}

  // ثانياً: من Cookie
  try {
    const match = document.cookie
      .split('; ')
      .find(row => row.startsWith(COOKIE_NAME + '='))
    if (match) {
      const raw = decodeURIComponent(match.split('=').slice(1).join('='))
      const parsed = JSON.parse(raw)
      if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
        // حفظ في localStorage للمرة القادمة
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)) } catch (_) {}
        return parsed
      }
      clearOrderSession()
    }
  } catch (_) {}

  return null
}

// ── حذف الجلسة ──────────────────────────────────
export function clearOrderSession() {
  try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// ── حساب الوقت المتبقي بالثواني ─────────────────
export function getTimeRemaining(expiresAt) {
  if (!expiresAt) return 0
  return Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000))
}
