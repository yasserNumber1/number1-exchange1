const MIN_PHONE_DIGITS = 7

export function normalizeWhatsappNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= MIN_PHONE_DIGITS ? digits : ''
}

export function isWhatsappAvailable(settings) {
  return settings?.whatsappEnabled !== false
    && Boolean(normalizeWhatsappNumber(settings?.contactWhatsapp))
}

export function getWhatsappHref(settings, message = '') {
  if (!isWhatsappAvailable(settings)) return ''

  const number = normalizeWhatsappNumber(settings.contactWhatsapp)
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${query}`
}

export function getWhatsappUnavailableText(settings, lang = 'en') {
  const key = lang === 'ar'
    ? 'whatsappUnavailableMessageAr'
    : 'whatsappUnavailableMessageEn'
  const fallback = lang === 'ar' ? 'متاح قريبًا' : 'Coming soon'
  return String(settings?.[key] || fallback).trim() || fallback
}

export function getWhatsappDisplayText(settings, lang = 'en') {
  return isWhatsappAvailable(settings)
    ? String(settings.contactWhatsapp).trim()
    : getWhatsappUnavailableText(settings, lang)
}
