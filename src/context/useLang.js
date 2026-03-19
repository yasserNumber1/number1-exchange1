// src/context/useLang.js
// Hook للوصول للغة في أي Component

import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'

function useLang() {
  return useContext(LanguageContext)
}

export default useLang