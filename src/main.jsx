// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

import { ThemeProvider }    from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider }     from './context/AuthContext'      // ← أضف هذا

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>                                       {/* ← أضف هذا */}
            <App />
          </AuthProvider>                                      {/* ← أضف هذا */}
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)