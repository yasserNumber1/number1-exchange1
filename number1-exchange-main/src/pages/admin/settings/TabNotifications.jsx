// src/pages/admin/settings/TabNotifications.jsx
import { useState } from 'react'
import { S, Toggle, Field, SectionCard } from './SettingsShared'

// Helper: call the register-webhook endpoint (not yet in adminAPI, so use fetch via api.js pattern)
const registerWebhook = (backendUrl) =>
  fetch((import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com') + '/api/admin/telegram/register-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('n1_token')}`,
    },
    body: JSON.stringify({ backendUrl }),
  }).then(r => r.json())

const getWebhookInfo = () =>
  fetch((import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com') + '/api/admin/telegram/webhook-info', {
    headers: { Authorization: `Bearer ${localStorage.getItem('n1_token')}` },
  }).then(r => r.json())

export default function TabNotifications({ settings, set }) {
  const [showSmtpPass,  setShowSmtpPass]  = useState(false)
  const [showResendKey, setShowResendKey] = useState(false)
  const [showBotToken,  setShowBotToken]  = useState(false)
  const [backendUrl,    setBackendUrl]    = useState(import.meta.env.VITE_API_URL || '')
  const [webhookStatus, setWebhookStatus] = useState(null)   // { ok, message }
  const [webhookInfo,   setWebhookInfo]   = useState(null)
  const [registering,   setRegistering]   = useState(false)
  const [checking,      setChecking]      = useState(false)

  const handleRegister = async () => {
    setRegistering(true)
    setWebhookStatus(null)
    try {
      const res = await registerWebhook(backendUrl.trim())
      setWebhookStatus({ ok: res.success, message: res.message })
    } catch (e) {
      setWebhookStatus({ ok: false, message: e.message })
    } finally {
      setRegistering(false)
    }
  }

  const handleCheckWebhook = async () => {
    setChecking(true)
    setWebhookInfo(null)
    try {
      const res = await getWebhookInfo()
      setWebhookInfo(res.success ? res.info : { url: res.message })
    } catch (e) {
      setWebhookInfo({ url: 'خطأ: ' + e.message })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div style={S.tabWrap}>

      {/* ── قنوات الإشعارات ──────────────────────── */}
      <SectionCard title="قنوات الإشعارات" icon="🔔">
        <Toggle
          label="إشعارات Telegram"
          desc="إرسال تنبيهات للطلبات الجديدة عبر Telegram Bot"
          value={settings.telegramNotifications}
          onChange={() => set('telegramNotifications', !settings.telegramNotifications)}
          color="#3b82f6"
        />
        <Toggle
          label="إشعارات البريد الإلكتروني"
          desc="إرسال تأكيدات الطلبات عبر البريد (SMTP)"
          value={settings.emailNotifications}
          onChange={() => set('emailNotifications', !settings.emailNotifications)}
          color="#3b82f6"
        />
      </SectionCard>

      {/* ── Telegram Bot ─────────────────────────── */}
      <SectionCard title="إعدادات Telegram Bot" icon="✈️">
        <div style={S.fieldsGrid}>
          <Field label="Bot Token">
            <div style={S.secretField}>
              <input
                style={{ ...S.input, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace', fontSize: 12 }}
                type={showBotToken ? 'text' : 'password'}
                value={settings.telegramBotToken}
                onChange={e => set('telegramBotToken', e.target.value)}
                placeholder="123456789:AAF..."
              />
              <button style={S.eyeBtn} onClick={() => setShowBotToken(v => !v)}>
                {showBotToken ? '🙈' : '👁'}
              </button>
            </div>
          </Field>
          <Field label="Chat ID">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}
              value={settings.telegramChatId}
              onChange={e => set('telegramChatId', e.target.value)}
              placeholder="-100XXXXXXXXXX"
            />
          </Field>
        </div>
        <div style={S.hint}>
          💡 ابحث عن @BotFather في Telegram لإنشاء Bot جديد والحصول على التوكن
        </div>
      </SectionCard>

      {/* ── Telegram Webhook ─────────────────────── */}
      <SectionCard title="تسجيل Telegram Webhook" icon="🔗">
        <div style={{ marginBottom: 12, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
          الـ Webhook هو الرابط الذي يُرسل إليه تليجرام الـ callback عند الضغط على أزرار الموافقة/الرفض.
          يجب أن يكون الرابط <strong style={{ color: '#f59e0b' }}>HTTPS عام</strong> (ليس localhost).
        </div>

        <Field label="رابط السيرفر (BACKEND_URL)">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left', flex: 1 }}
              value={backendUrl}
              onChange={e => setBackendUrl(e.target.value)}
              placeholder="https://your-server.com"
            />
            <button
              style={{
                padding: '9px 16px', borderRadius: 8, border: 'none',
                background: registering ? '#1e3a5f' : '#2563eb',
                color: '#fff', cursor: registering ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                fontFamily: "'Cairo',sans-serif", opacity: registering ? 0.7 : 1,
              }}
              onClick={handleRegister}
              disabled={registering || !backendUrl.trim()}
            >
              {registering ? '⏳ جاري التسجيل...' : '🔗 تسجيل Webhook'}
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#475569', direction: 'ltr' }}>
            سيُسجَّل: <code style={{ color: '#60a5fa' }}>{backendUrl.replace(/\/$/, '')}/api/telegram/webhook</code>
          </div>
        </Field>

        {/* نتيجة التسجيل */}
        {webhookStatus && (
          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: webhookStatus.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${webhookStatus.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: webhookStatus.ok ? '#4ade80' : '#f87171',
          }}>
            {webhookStatus.message}
          </div>
        )}

        {/* زر فحص الـ Webhook الحالي */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            style={{ ...S.outlineBtn, fontSize: 12 }}
            onClick={handleCheckWebhook}
            disabled={checking}
          >
            {checking ? '⏳ جاري الفحص...' : '🔍 فحص الـ Webhook الحالي'}
          </button>
        </div>

        {webhookInfo && (
          <div style={{ marginTop: 10, background: '#0d1117', borderRadius: 8, padding: '10px 14px', fontSize: 12, direction: 'ltr', color: '#94a3b8', border: '1px solid #21262d' }}>
            <div><span style={{ color: '#6e7681' }}>URL: </span><span style={{ color: webhookInfo.url ? '#60a5fa' : '#f87171' }}>{webhookInfo.url || '❌ لا يوجد Webhook مسجَّل'}</span></div>
            {webhookInfo.pending_update_count !== undefined && (
              <div style={{ marginTop: 4 }}><span style={{ color: '#6e7681' }}>Pending updates: </span><span style={{ color: webhookInfo.pending_update_count > 0 ? '#f59e0b' : '#4ade80' }}>{webhookInfo.pending_update_count}</span></div>
            )}
            {webhookInfo.last_error_message && (
              <div style={{ marginTop: 4 }}><span style={{ color: '#f87171' }}>Last error: </span>{webhookInfo.last_error_message}</div>
            )}
          </div>
        )}

        <div style={{ ...S.hint, marginTop: 12 }}>
          ⚠️ إذا كنت تعمل محلياً (localhost)، استخدم <strong>ngrok</strong> أو ارفع السيرفر على استضافة حقيقية أولاً.
        </div>
      </SectionCard>

      {/* ── Resend ───────────────────────────────── */}
      <SectionCard title="إعدادات Resend للبريد" icon="📧">
        <div style={S.fieldsGrid}>
          <Field label="Resend API Key">
            <div style={S.secretField}>
              <input
                style={{ ...S.input, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}
                type={showResendKey ? 'text' : 'password'}
                value={settings.resendApiKey || ''}
                onChange={e => set('resendApiKey', e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxxx"
              />
              <button type="button" style={S.eyeBtn} onClick={() => setShowResendKey(v => !v)}>
                {showResendKey ? '🙈' : '👁'}
              </button>
            </div>
          </Field>
          <Field label="From Email">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              value={settings.resendFromEmail || ''}
              onChange={e => set('resendFromEmail', e.target.value)}
                placeholder="Number1 Exchange <no-reply@yasser-number1.com>"
            />
          </Field>
        </div>
        <div style={S.hint}>
          استخدم onboarding@resend.dev للاختبار إلى بريد حساب Resend فقط. للإرسال إلى أي بريد آخر، استخدم نطاقاً موثقاً في Resend.
        </div>
      </SectionCard>

      {/* ── SMTP fallback ────────────────────────── */}
      <SectionCard title="إعدادات SMTP الاحتياطية (Railway Pro فقط)" icon="📨">
        <div style={S.fieldsGrid}>
          <Field label="SMTP Host">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              value={settings.smtpHost}
              onChange={e => set('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </Field>
          <Field label="SMTP Port">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              type="number"
              value={settings.smtpPort}
              onChange={e => set('smtpPort', Number(e.target.value))}
              placeholder="587"
            />
          </Field>
          <Field label="SMTP Email">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              type="email"
              value={settings.smtpEmail}
              onChange={e => set('smtpEmail', e.target.value)}
              placeholder="noreply@number1.com"
            />
          </Field>
          <Field label="SMTP Password">
            <div style={S.secretField}>
              <input
                style={{ ...S.input, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}
                type={showSmtpPass ? 'text' : 'password'}
                value={settings.smtpPassword}
                onChange={e => set('smtpPassword', e.target.value)}
                placeholder="••••••••••••"
              />
              <button style={S.eyeBtn} onClick={() => setShowSmtpPass(v => !v)}>
                {showSmtpPass ? '🙈' : '👁'}
              </button>
            </div>
          </Field>
        </div>
      </SectionCard>

    </div>
  )
}
