// models/Rate.js
// ═══════════════════════════════════════════════
// نموذج الأسعار — يُخزّن كل أسعار الصرف
// يكون دائماً سجل واحد فقط في قاعدة البيانات
// ═══════════════════════════════════════════════
const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
  {
    // ── USDT ↔ جنيه مصري ─────────────────────
    // سعر بيع USDT: العميل يدفع جنيه ويستلم USDT
    // مثال: 50 يعني العميل يدفع 50 جنيه ليحصل على 1 USDT
    usdtBuyRate:  { type: Number, default: 50.00 },

    // سعر شراء USDT: العميل يرسل USDT ويستلم جنيه
    // مثال: 49.5 يعني العميل يرسل 1 USDT ويحصل على 49.5 جنيه
    usdtSellRate: { type: Number, default: 49.50 },

    // ── MoneyGo ↔ جنيه مصري ──────────────────
    // سعر بيع MoneyGo: العميل يدفع جنيه ويستلم MoneyGo
    // مثال: 52 يعني العميل يدفع 52 جنيه ليحصل على 1 MoneyGo
    moneygoEgpBuyRate:  { type: Number, default: 52.00 },

    // سعر شراء MoneyGo: العميل يرسل MoneyGo ويستلم جنيه
    // مثال: 51 يعني العميل يرسل 1 MoneyGo ويحصل على 51 جنيه
    moneygoEgpSellRate: { type: Number, default: 51.00 },

    // ── MoneyGo ↔ USDT ────────────────────────
    // كم USDT يساوي 1 MoneyGo
    // مثال: 1.002 يعني 1 MoneyGo = 1.002 USDT
    moneygoRate: { type: Number, default: 1.00 },

    // ── سعر الجنيه الموحد للمحافظ الإلكترونية ─
    // يُطبق على: فودافون كاش / إنستا باي / فاوري / أورنج كاش
    // مثال: 50 يعني العميل يدفع 50 جنيه ليحصل على 1 USDT
    egpWalletBuyRate:  { type: Number, default: 50.00 },

    // سعر بيع الجنيه للمحافظ
    // مثال: 49.5 يعني العميل يرسل 1 USDT ويحصل على 49.5 جنيه
    egpWalletSellRate: { type: Number, default: 49.50 },

    // ── الحقول القديمة (للتوافق مع الكود القديم) ─
    // سيتم تجاهلها تدريجياً
    vodafoneBuyRate: { type: Number, default: 50.00 },
    instaPayRate:    { type: Number, default: 50.10 },
    fawryRate:       { type: Number, default: 49.80 },
    orangeRate:      { type: Number, default: 49.90 },

    // ── حدود المعاملات ────────────────────────
    minOrderUsdt: { type: Number, default: 10   },
    maxOrderUsdt: { type: Number, default: 5000 },

    // آخر من عدّل
    updatedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

// ── دالة مساعدة: جلب السجل الوحيد أو إنشاؤه ──
rateSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Rate', rateSchema);