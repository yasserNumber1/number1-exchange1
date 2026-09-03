import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'

const DEFAULT_SETTINGS = {
  contactTelegram: '',
  contactWhatsapp: '',
  contactEmail: '',
  whatsappEnabled: true,
  whatsappUnavailableMessageAr: 'متاح قريبًا',
  whatsappUnavailableMessageEn: 'Coming soon',
  maintenanceMode: false,
}

const PublicSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshPublicSettings: async () => {},
  applyPublicSettings: () => {},
})

function getSettingsPayload(data) {
  return data?.data || data || {}
}

export function PublicSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const applyPublicSettings = useCallback((data) => {
    const next = getSettingsPayload(data)
    setSettings(current => ({ ...current, ...next }))
  }, [])

  const refreshPublicSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/public/settings`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not load public settings')
      applyPublicSettings(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [applyPublicSettings])

  useEffect(() => {
    refreshPublicSettings().catch(() => {})
  }, [refreshPublicSettings])

  const value = useMemo(() => ({
    settings,
    loading,
    refreshPublicSettings,
    applyPublicSettings,
  }), [settings, loading, refreshPublicSettings, applyPublicSettings])

  return (
    <PublicSettingsContext.Provider value={value}>
      {children}
    </PublicSettingsContext.Provider>
  )
}

export { PublicSettingsContext }
