const FALLBACK_SITE_URL = 'https://www.yasser-number1.com'

function normalizeSiteUrl(rawUrl) {
  return (rawUrl || FALLBACK_SITE_URL).replace(/\/+$/, '')
}

export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL)
export const SITE_NAME = 'Number1 Exchange'
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/images/N1.jpg`

export function toAbsoluteUrl(path = '/') {
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
