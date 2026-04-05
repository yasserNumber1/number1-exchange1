// src/pages/admin/settings/TabIntegrations.jsx
import { useState } from 'react'
import { S, Field, SectionCard } from './SettingsShared'

// ── SecretInput ────────────────────────────────────────────
function SecretInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={{ ...S.input, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, paddingLeft: 80 }}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
        <button style={S.eyeBtn} onClick={() => setShow(v => !v)} title={show ? 'إخفاء' : 'إظهار'}>
          {show ? '🙈' : '👁'}
        </button>
        <button style={{ ...S.eyeBtn, color: copied ? '#22c55e' : '#64748b' }} onClick={handleCopy} title="نسخ">
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  )
}

export default function TabIntegrations({ settings, set }) {
  return (
    <div style={S.tabWrap}>

      {/* ── بيئة التشغيل ─────────────────────── */}
      <SectionCard title="بيئة التشغيل" icon="🌐">
        <div style={{ display: 'flex', gap: 10 }}>
          {['sandbox', 'live'].map(env => (
            <button
              key={env}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 10,
                border: `2px solid ${settings.environment === env
                  ? env === 'live' ? '#22c55e' : '#f59e0b'
                  : '#334155'}`,
                background: settings.environment === env
                  ? env === 'live' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)'
                  : 'transparent',
                color: settings.environment === env
                  ? env === 'live' ? '#22c55e' : '#f59e0b'
                  : '#64748b',
                cursor: 'pointer', fontWeight: 800, fontSize: 14,
                fontFamily: "'Cairo','Tajawal',sans-serif",
                transition: 'all 0.2s',
              }}
              onClick={() => set('environment', env)}
            >
              {env === 'live' ? '🟢 Live — إنتاج' : '🟡 Sandbox — اختبار'}
            </button>
          ))}
        </div>
        {settings.environment === 'live' && (
          <div style={{ ...S.hint, color: '#f87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
            ⚠ أنت في بيئة الإنتاج — التغييرات تؤثر على المستخدمين الحقيقيين
          </div>
        )}
      </SectionCard>

      {/* ── API Keys ──────────────────────────── */}
      <SectionCard title="مفاتيح API" icon="🔑">
        <div style={S.fieldsGrid}>
          <Field label="MoneyGo API Key">
            <SecretInput
              value={settings.moneygoApiKey}
              onChange={v => set('moneygoApiKey', v)}
              placeholder="U-XXXXXXXXXXXXXXXXXXXX"
            />
          </Field>
          <Field label="Crypto Provider API Key">
            <SecretInput
              value={settings.cryptoApiKey}
              onChange={v => set('cryptoApiKey', v)}
              placeholder="sk-XXXXXXXXXXXXXXXXXXXX"
            />
          </Field>
        </div>
        <div style={S.hint}>
          🔒 المفاتيح مخزّنة بشكل مشفّر ولا تُعرض كاملةً في الـ logs
        </div>
      </SectionCard>

      {/* ── Webhook ───────────────────────────── */}
      <SectionCard title="Webhook URL" icon="🔗">
        <Field label="Webhook URL للإشعارات الخارجية">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left', flex: 1 }}
              value={settings.webhookUrl}
              onChange={e => set('webhookUrl', e.target.value)}
              placeholder="https://your-server.com/webhook"
            />
            {settings.webhookUrl && (
              <button
                style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#3b82f6', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: "'Cairo',sans-serif" }}
                onClick={() => navigator.clipboard.writeText(settings.webhookUrl)}
              >
                نسخ
              </button>
            )}
          </div>
        </Field>
        <div style={S.hint}>
          يُرسل POST request لهذا الرابط عند كل حدث مهم (طلب جديد، تأكيد دفع...)
        </div>
      </SectionCard>

    </div>
  )
}