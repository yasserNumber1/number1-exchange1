// models/Setting.js
// ═══════════════════════════════════════════════
// إعدادات المنصة — سجل واحد فقط في DB
// ═══════════════════════════════════════════════
const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({

  // ── عام ──────────────────────────────────────
  platformName:        { type: String,  default: 'Number1 Exchange' },
  platformActive:      { type: Boolean, default: true  },
  maintenanceMode:     { type: Boolean, default: false },
  platformNameAr:      { type: String,  default: 'نمبر ون' },
  platformNameEn:      { type: String,  default: 'Number1' },
  platformUrl:         { type: String,  default: '' },
  supportEmail:        { type: String,  default: '' },
  supportTelegram:     { type: String,  default: '' },
  platformEnabled:     { type: Boolean, default: true },
  registrationEnabled: { type: Boolean, default: true },

  // ── بيانات التواصل ────────────────────────────
  contactTelegram: { type: String, default: '@Number1Exchange' },
  contactWhatsapp: { type: String, default: '' },
  contactEmail:    { type: String, default: 'support@number1exchange.com' },
  contactWebsite:  { type: String, default: '' },

  // ── إشعارات ──────────────────────────────────
  telegramNotifications: { type: Boolean, default: true  },
  emailNotifications:    { type: Boolean, default: false },

  // ── Telegram ─────────────────────────────────
  telegramBotToken: { type: String, default: '' },
  telegramChatId:   { type: String, default: '' },

  // ── SMTP ─────────────────────────────────────
  smtpHost:     { type: String, default: '' },
  smtpPort:     { type: Number, default: 587 },
  smtpEmail:    { type: String, default: '' },
  smtpPassword: { type: String, default: '' },

  // ── الطلبات ───────────────────────────────────
  minOrderUsdt:    { type: Number, default: 10   },
  maxOrderUsdt:    { type: Number, default: 5000 },
  orderExpiryMins: { type: Number, default: 30   },

  // ── API Keys ──────────────────────────────────
  moneygoApiKey: { type: String, default: '' },
  moneygoApiUrl: { type: String, default: '' },
  cryptoApiKey:  { type: String, default: '' },

  // ── بيانات الإيداع ────────────────────────────
  depositBankName:      { type: String, default: '' },
  depositAccountName:   { type: String, default: '' },
  depositAccountNumber: { type: String, default: '' },
  depositUsdtAddress:   { type: String, default: '' },
  depositUsdtNetwork:   { type: String, default: 'TRC20' },
  depositNote:          { type: String, default: '' },

}, { timestamps: true })

// ── جلب السجل الوحيد أو إنشاؤه ──────────────────
settingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne()
  if (!doc) doc = await this.create({})
  return doc
}

module.exports = mongoose.model('Setting', settingSchema)