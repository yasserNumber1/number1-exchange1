import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { parseLinks } from 'vite-prerender-plugin/parse'

import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { PRERENDER_ROUTES } from './seo/routes'
import { getRouteSeo } from './seo/routes'
import { BREADCRUMB_LABELS } from './seo/routes'
import { buildOrganizationSchema, buildFaqSchema, buildBreadcrumbSchema } from './seo/schema'
import { FAQ_DATA } from './pages/FAQ'
import { toAbsoluteUrl } from './seo/site'

export async function prerender({ url }) {
  const html = renderToString(
    <StaticRouter location={url}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </StaticRouter>,
  )
  const seo = getRouteSeo(url)
  const headElements = new Set()
  headElements.add({ type: 'meta', props: { name: 'description', content: seo.description } })
  headElements.add({ type: 'meta', props: { name: 'robots', content: seo.robots } })
  headElements.add({ type: 'link', props: { rel: 'canonical', href: seo.canonical } })
  headElements.add({ type: 'meta', props: { property: 'og:type', content: 'website' } })
  headElements.add({ type: 'meta', props: { property: 'og:title', content: seo.ogTitle || seo.title } })
  headElements.add({ type: 'meta', props: { property: 'og:description', content: seo.ogDescription || seo.description } })
  headElements.add({ type: 'meta', props: { property: 'og:url', content: seo.canonical } })
  headElements.add({ type: 'meta', props: { property: 'og:image', content: seo.ogImage } })
  headElements.add({ type: 'meta', props: { property: 'og:site_name', content: 'Number1 Exchange' } })
  headElements.add({ type: 'meta', props: { property: 'og:locale', content: 'ar_EG' } })
  headElements.add({ type: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' } })
  headElements.add({ type: 'meta', props: { name: 'twitter:title', content: seo.ogTitle || seo.title } })
  headElements.add({ type: 'meta', props: { name: 'twitter:description', content: seo.ogDescription || seo.description } })
  headElements.add({ type: 'meta', props: { name: 'twitter:image', content: seo.ogImage } })
  headElements.add({
    type: 'script',
    props: {
      type: 'application/ld+json',
      children: JSON.stringify(buildOrganizationSchema()),
    },
  })

  if (url === '/faq') {
    const faqItems = FAQ_DATA.flatMap((section) =>
      section.items.map((item) => ({
        question: item.qAr,
        answer: item.aAr,
      })),
    )

    headElements.add({
      type: 'script',
      props: {
        type: 'application/ld+json',
        children: JSON.stringify(buildFaqSchema(faqItems)),
      },
    })
  }

  if (BREADCRUMB_LABELS[url]) {
    headElements.add({
      type: 'script',
      props: {
        type: 'application/ld+json',
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: 'الرئيسية', url: toAbsoluteUrl('/') },
            { name: BREADCRUMB_LABELS[url], url: seo.canonical },
          ]),
        ),
      },
    })
  }

  return {
    html,
    links: new Set([...PRERENDER_ROUTES, ...parseLinks(html)]),
    head: {
      title: seo.title,
      lang: 'ar',
      elements: headElements,
    },
  }
}
