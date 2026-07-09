import fs from 'node:fs'
import path from 'node:path'

const siteUrl = (process.env.VITE_SITE_URL || 'https://www.yasser-number1.com').replace(/\/+$/, '')
const repoRoot = process.cwd()
const publicDir = path.join(repoRoot, 'public')

const routes = [
  '/',
  '/about',
  '/faq',
  '/how-it-works',
  '/contact',
  '/reviews',
  '/rates',
  '/services',
  '/blog',
  '/terms',
  '/privacy',
  '/aml',
  '/cookies',
]

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /wallet
Disallow: /my-orders

Sitemap: ${siteUrl}/sitemap.xml
`

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    const loc = route === '/' ? `${siteUrl}/` : `${siteUrl}${route}`
    return `  <url><loc>${loc}</loc></url>`
  })
  .join('\n')}
</urlset>
`

function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) {
    return
  }
  fs.writeFileSync(filePath, content, 'utf8')
}

writeIfChanged(path.join(publicDir, 'robots.txt'), robotsTxt)
writeIfChanged(path.join(publicDir, 'sitemap.xml'), sitemapXml)
