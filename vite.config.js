// vite.config.js
// هذا الملف يضبط إعدادات Vite (أداة البناء)
// أضفنا Tailwind كـ plugin هنا لأن الإصدار الجديد يعمل بهذه الطريقة

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // ← Tailwind v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // ← أضف هذا السطر
  ],
})