// src/pages/admin/settings/TabOrders.jsx
import { S, Toggle, Field, SectionCard, NumberField } from './SettingsShared'

export default function TabOrders({ settings, set }) {
  return (
    <div style={S.tabWrap}>

      {/* ── أنواع الطلبات ────────────────────── */}
      <SectionCard title="أنواع الطلبات المقبولة" icon="💱">
        <Toggle
          label="طلبات USDT / TRC20"
          desc="قبول طلبات الدفع بالعملات الرقمية"
          value={settings.usdtOrdersEnabled}
          onChange={() => set('usdtOrdersEnabled', !settings.usdtOrdersEnabled)}
          color="#22c55e"
        />
        <Toggle
          label="طلبات المحافظ الإلكترونية"
          desc="قبول طلبات Vodafone Cash / InstaPay وغيرها"
          value={settings.walletOrdersEnabled}
          onChange={() => set('walletOrdersEnabled', !settings.walletOrdersEnabled)}
          color="#22c55e"
        />
        <Toggle
          label="التحويل البنكي"
          desc="قبول طلبات التحويل البنكي المباشر"
          value={settings.bankTransferEnabled}
          onChange={() => set('bankTransferEnabled', !settings.bankTransferEnabled)}
          color="#22c55e"
          badge="جديد"
        />
      </SectionCard>

      {/* ── حدود الطلبات ─────────────────────── */}
      <SectionCard title="حدود الطلبات" icon="📊">
        <div style={S.fieldsGrid}>
          <NumberField
            label="الحد الأدنى للطلب (USD)"
            value={settings.minOrderUsd}
            onChange={v => set('minOrderUsd', v)}
            min={1} placeholder="10"
          />
          <NumberField
            label="الحد الأقصى للطلب (USD)"
            value={settings.maxOrderUsd}
            onChange={v => set('maxOrderUsd', v)}
            min={1} placeholder="10000"
          />
          <NumberField
            label="مدة انتهاء الطلب (دقيقة)"
            value={settings.orderExpiryMins}
            onChange={v => set('orderExpiryMins', v)}
            min={1} placeholder="30"
          />
          <NumberField
            label="أقصى طلبات يومية للمستخدم"
            value={settings.maxDailyOrdersUser}
            onChange={v => set('maxDailyOrdersUser', v)}
            min={1} placeholder="5"
          />
        </div>
      </SectionCard>

    </div>
  )
}