// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://www.yasser-number1.com').replace(/\/+$/, '')

  return {
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'replace-site-url-placeholder',
        transformIndexHtml(html) {
          return html.replaceAll('__SITE_URL__', siteUrl)
        },
      },
      vitePrerenderPlugin({
        renderTarget: '#root',
        prerenderScript: path.resolve(__dirname, 'src/prerender.jsx'),
        additionalPrerenderRoutes: [
          '/about',
          '/faq',
          '/how-it-works',
          '/contact',
          '/reviews',
          '/rates',
        ],
      }),
    ],
  }
})
