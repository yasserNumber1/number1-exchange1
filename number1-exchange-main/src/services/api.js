// src/services/api.js
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'

// ─── Helper ───────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('n1_token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong')
    error.response = { data }
    throw error
  }

  return { data }
}

// ─── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/auth/me'),
}

// ─── Orders ───────────────────────────────────────────────────
export const ordersAPI = {
  create:     (body)       => request('/orders',                   { method: 'POST', body: JSON.stringify(body) }),
  track:      (orderNum)   => request(`/orders/track/${orderNum}`),
  myOrders:   ()           => request('/orders/my'),
  verifyUSDT: (id, txHash) => request(`/orders/${id}/verify-usdt`, { method: 'POST', body: JSON.stringify({ txHash }) }),
}

// ─── Public Payment Methods (للمستخدم) ───────────────────────
// يُستخدم في صفحة الـ Exchange عشان يعرض الوسائل المفعّلة فقط
export const paymentAPI = {
getMethods: () => request('/public/payment-methods'),   // GET — بدون auth
}

// ─── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  // Orders
  getOrders:    (params = {}) => request(`/admin/orders?${new URLSearchParams(params)}`),
  getOrder:     (id)          => request(`/admin/orders/${id}`),
  updateStatus: (id, body)    => request(`/admin/orders/${id}/status`, { method: 'PUT',  body: JSON.stringify(body) }),

  // Stats
  getStats: () => request('/admin/stats'),

  // Users
  getUsers:    (params = {}) => request(`/admin/users?${new URLSearchParams(params)}`),
  blockUser:   (id, body)    => request(`/admin/users/${id}/block`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Rates
  getRates: ()     => request('/admin/rates'),
  saveRates: (body) => request('/admin/rates', { method: 'PUT', body: JSON.stringify(body) }),

  // Settings
  getSettings: ()     => request('/admin/settings'),
  saveSettings: (body) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // ── Payment Methods ─────────────────────────────────────────
  // الأدمن يتحكم في وسائل الدفع وأرقام الاستلام
  getPaymentMethods:  ()     => request('/admin/payment-methods'),
  savePaymentMethods: (body) => request('/admin/payment-methods', { method: 'PUT', body: JSON.stringify(body) }),

  // ── Wallet Deposit Addresses (منفصلة عن وسائل الدفع) ───────
  getWalletDepositAddresses:  ()     => request('/admin/wallet-deposit-addresses'),
  saveWalletDepositAddresses: (body) => request('/admin/wallet-deposit-addresses', { method: 'PUT', body: JSON.stringify(body) }),
}

// ─── Wallet ───────────────────────────────────────────────
export const walletAPI = {
  // جلب الرصيد + آخر المعاملات
  getWallet: () =>
    request('/wallet'),

  // كل المعاملات
  getTransactions: (params = {}) =>
    request(`/wallet/transactions?${new URLSearchParams(params)}`),

  // طلب سحب
  withdraw: (body) =>
    request('/wallet/withdraw', { method: 'POST', body: JSON.stringify(body) }),

  // ── Admin ────────────────────────────────────
  getAllWallets: () =>
    request('/admin/wallets'),

  getUserWallet: (userId) =>
    request(`/admin/wallets/${userId}`),

  adminDeposit: (userId, body) =>
    request(`/admin/wallets/${userId}/deposit`, { method: 'POST', body: JSON.stringify(body) }),

  toggleWallet: (userId) =>
    request(`/admin/wallets/${userId}/toggle`, { method: 'PATCH' }),
}