const BASE_URL = (import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com') + '/api'

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

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/auth/me'),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword:  (body) => request('/auth/reset-password',  { method: 'POST', body: JSON.stringify(body) }),
}

export const ordersAPI = {
  create:     (body)       => request('/orders',                   { method: 'POST', body: JSON.stringify(body) }),
  track:      (orderNum)   => request(`/orders/track/${orderNum}`),
  myOrders:   ()           => request('/orders/my'),
  verifyUSDT: (id, txHash) => request(`/orders/${id}/verify-usdt`, { method: 'POST', body: JSON.stringify({ txHash }) }),
}

export const paymentAPI = {
  getMethods: () => request('/public/payment-methods'),
}

export const adminAPI = {
  getOrders:    (params = {}) => request(`/admin/orders?${new URLSearchParams(params)}`),
  getOrder:     (id)          => request(`/admin/orders/${id}`),
  updateStatus: (id, body)    => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  getStats:     ()            => request('/admin/stats'),
  getUsers:     (params = {}) => request(`/admin/users?${new URLSearchParams(params)}`),
  blockUser:    (id, body)    => request(`/admin/users/${id}/block`, { method: 'PATCH', body: JSON.stringify(body) }),
  getRates:     ()            => request('/admin/rates'),
  saveRates:    (body)        => request('/admin/rates',    { method: 'PUT', body: JSON.stringify(body) }),
  getSettings:  ()            => request('/admin/settings'),
  saveSettings: (body)        => request('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
  getPaymentMethods:           ()     => request('/admin/payment-methods'),
  savePaymentMethods:          (body) => request('/admin/payment-methods',          { method: 'PUT', body: JSON.stringify(body) }),
  getWalletDepositAddresses:   ()     => request('/admin/wallet-deposit-addresses'),
  saveWalletDepositAddresses:  (body) => request('/admin/wallet-deposit-addresses', { method: 'PUT', body: JSON.stringify(body) }),
  getExchangeMethods:          ()     => request('/admin/exchange-methods'),
  saveExchangeMethods:         (body) => request('/admin/exchange-methods',         { method: 'PUT', body: JSON.stringify(body) }),
  getSupportChats: (params = {}) => request(`/admin/support-chats?${new URLSearchParams(params)}`),
  getSupportChat:  (sessionId)   => request(`/admin/support-chats/${encodeURIComponent(sessionId)}`),
  sendSupportReply: (sessionId, message) => request(`/admin/support-chats/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST', body: JSON.stringify({ message }),
  }),
  markSupportChatRead: (sessionId) => request(`/admin/support-chats/${encodeURIComponent(sessionId)}/read`, { method: 'PATCH' }),
  updateSupportChatStatus: (sessionId, status) => request(`/admin/support-chats/${encodeURIComponent(sessionId)}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
}

export const walletAPI = {
  getWallet:       ()               => request('/wallet'),
  getTransactions: (params = {})    => request(`/wallet/transactions?${new URLSearchParams(params)}`),
  withdraw:        (body)           => request('/wallet/withdraw', { method: 'POST', body: JSON.stringify(body) }),
  getAllWallets:    ()               => request('/admin/wallets'),
  getUserWallet:   (userId)         => request(`/admin/wallets/${userId}`),
  adminDeposit:    (userId, body)   => request(`/admin/wallets/${userId}/deposit`, { method: 'POST', body: JSON.stringify(body) }),
  toggleWallet:    (userId)         => request(`/admin/wallets/${userId}/toggle`,  { method: 'PATCH' }),
}
