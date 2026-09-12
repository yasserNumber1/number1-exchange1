const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()

const isValidMeasurementId = /^G-[A-Z0-9]+$/i.test(measurementId || '')

export function initializeGoogleAnalytics() {
  if (typeof window === 'undefined' || !isValidMeasurementId) return false
  if (document.getElementById('google-analytics-tag')) return true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId)

  const script = document.createElement('script')
  script.id = 'google-analytics-tag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)

  return true
}
