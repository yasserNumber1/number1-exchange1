// src/pages/admin/settings/TabGeneral.jsx
import { S, Toggle, Field, SectionCard } from './SettingsShared'

export default function TabGeneral({ settings, set, togglePlatform }) {
  return (
    <div style={S.tabWrap}>

      {/* ── حالة المنصة ──────────────────────── */}
      <SectionCard title="حالة المنصة" icon="🟢">
        <Toggle
          label="تفعيل المنصة"
          desc="إيقاف هذا سيمنع جميع العمليات الجديدة"
          value={settings.platformEnabled}
          onChange={togglePlatform}
          color="#22c55e"
          danger={!settings.platformEnabled}
        />
        <Toggle
          label="وضع الصيانة"
          desc="يعرض رسالة صيانة للمستخدمين ويوقف الموقع مؤقتاً"
          value={settings.maintenanceMode}
          onChange={() => set('maintenanceMode', !settings.maintenanceMode)}
          color="#f59e0b"
          danger={settings.maintenanceMode}
        />
        <Toggle
          label="تسجيل مستخدمين جدد"
          desc="السماح بإنشاء حسابات جديدة على المنصة"
          value={settings.registrationEnabled}
          onChange={() => set('registrationEnabled', !settings.registrationEnabled)}
          color="#22c55e"
        />
      </SectionCard>

      {/* ── معلومات المنصة ───────────────────── */}
      <SectionCard title="معلومات المنصة" icon="ℹ️">
        <div style={S.fieldsGrid}>
          <Field label="اسم المنصة (عربي)">
            <input
              style={S.input}
              value={settings.platformNameAr || ''}
              onChange={e => set('platformNameAr', e.target.value)}
              placeholder="نمبر ون"
            />
          </Field>
          <Field label="اسم المنصة (إنجليزي)">
            <input
              style={S.input}
              value={settings.platformNameEn || ''}
              onChange={e => set('platformNameEn', e.target.value)}
              placeholder="Number1"
            />
          </Field>
          <Field label="رابط الموقع">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              value={settings.platformUrl || ''}
              onChange={e => set('platformUrl', e.target.value)}
              placeholder="https://number1exchange.com"
            />
          </Field>
          <Field label="إيميل الدعم">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              type="email"
              value={settings.supportEmail || ''}
              onChange={e => set('supportEmail', e.target.value)}
              placeholder="support@number1.com"
            />
          </Field>
          <Field label="Telegram الدعم">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              value={settings.supportTelegram || ''}
              onChange={e => set('supportTelegram', e.target.value)}
              placeholder="@number1support"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── بيانات التواصل ───────────────────── */}
      <SectionCard title="بيانات التواصل" icon="📞">
        <div style={S.fieldsGrid}>
          <Field label="Telegram">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              value={settings.contactTelegram || ''}
              onChange={e => set('contactTelegram', e.target.value)}
              placeholder="@Number1Exchange"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              value={settings.contactWhatsapp || ''}
              onChange={e => set('contactWhatsapp', e.target.value)}
              placeholder="+20XXXXXXXXXX"
            />
          </Field>
          <Field label="البريد الإلكتروني">
            <input
              style={{ ...S.input, direction: 'ltr', textAlign: 'left' }}
              type="email"
              value={settings.contactEmail || ''}
              onChange={e => set('contactEmail', e.target.value)}
              placeholder="support@number1exchange.com"
            />
          </Field>
        </div>
        <div style={S.hint}>
          💡 هذي البيانات تظهر في صفحة "تواصل معنا" للمستخدمين
        </div>
      </SectionCard>

    </div>
  )
}