import { useContext } from 'react'
import { PublicSettingsContext } from './PublicSettingsContext'

export default function usePublicSettings() {
  return useContext(PublicSettingsContext)
}
