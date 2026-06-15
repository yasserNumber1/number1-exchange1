import { Helmet } from 'react-helmet-async'
import { DEFAULT_SOCIAL_IMAGE } from '../seo/site'

function Seo({
  title,
  description,
  canonical,
  robots = 'index,follow',
  lang = 'ar',
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_SOCIAL_IMAGE,
  schema,
}) {
  const schemaList = Array.isArray(schema) ? schema : schema ? [schema] : []

  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Number1 Exchange" />
      <meta property="og:locale" content={lang === 'ar' ? 'ar_EG' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {schemaList.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}

export default Seo
