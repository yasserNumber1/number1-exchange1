// models/Rate.js
const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
  {
    // ── USDT ↔ جنيه مصري ─────────────────────────────────
    usdtBuyRate:  { type: Number, default: 50.00 }, // كم جنيه يدفع العميل ليحصل على 1 USDT
    usdtSellRate: { type: Number, default: 49.00 }, // كم جنيه يحصل العميل مقابل 1 USDT

    // ── MoneyGo ──────────────────────────────────────────
    // سعر شراء MoneyGo — العميل يرسل MoneyGo ويستلم USDT
    // مثال: 1.005 يعني 1 MoneyGo = 1.005 USDT
    moneygoRate:     { type: Number, default: 1.00 },

    // سعر بيع MoneyGo — العميل يرسل USDT ويستلم MoneyGo
    // مثال: 0.995 يعني 1 USDT = 0.995 MoneyGo
    moneygoSellRate: { type: Number, default: 1.00 },

    // ── محافظ إلكترونية مصرية ────────────────────────────
    vodafoneBuyRate: { type: Number, default: 50.00 },
    instaPayRate:    { type: Number, default: 50.10 },
    fawryRate:       { type: Number, default: 49.80 },
    orangeRate:      { type: Number, default: 49.90 },

    // ── حدود المعاملات ────────────────────────────────────
    minOrderUsdt: { type: Number, default: 10   },
    maxOrderUsdt: { type: Number, default: 5000 },

    updatedBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

rateSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Rate', rateSchema);