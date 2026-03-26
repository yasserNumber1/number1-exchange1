import useLang from '../../context/useLang'

function LegalLayout({ title, children }) {
  const { lang } = useLang()

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: 900,
      margin: 'auto'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: 20
      }}>
        {title}
      </h1>

      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-1)',
        borderRadius: 12,
        padding: 25,
        lineHeight: 1.8,
        color: 'var(--text-2)'
      }}>
        {children}
      </div>
    </div>
  )
}

export default LegalLayout