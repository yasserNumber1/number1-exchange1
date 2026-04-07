// models/Rate.js
// ═══════════════════════════════════════════════
// نموذج الأسعار الديناميكي — كل زوج له شراء وبيع
// ═══════════════════════════════════════════════
const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
  from:     { type: String, required: true }, // USDT, EGP_VODAFONE, EGP_INSTAPAY, MGO, INTERNAL
  to:       { type: String, required: true }, // USDT, EGP, MGO, INTERNAL
  buyRate:  { type: Number, required: true, min: 0 }, // المنصة تبيع "to" — العميل يدفع "from"
  sellRate: { type: Number, required: true, min: 0 }, // المنصة تشتري "to" — العميل يستلم "from"
  label:    { type: String, default: '' },
  enabled:  { type: Boolean, default: true },
}, { _id: false });

const rateSchema = new mongoose.Schema({
  pairs:     { type: [pairSchema], default: [] },
  updatedBy: { type: String, default: 'system' },
}, { timestamps: true });

// ── الأسعار الافتراضية عند الإنشاء ──
const DEFAULT_PAIRS = [
  { from: 'EGP_VODAFONE', to: 'USDT',     buyRate: 50,    sellRate: 49,    label: 'فودافون كاش → USDT'    },
  { from: 'EGP_INSTAPAY', to: 'USDT',     buyRate: 50.1,  sellRate: 49.1,  label: 'إنستا باي → USDT'      },
  { from: 'EGP_FAWRY',    to: 'USDT',     buyRate: 49.8,  sellRate: 48.8,  label: 'فاوري → USDT'           },
  { from: 'EGP_ORANGE',   to: 'USDT',     buyRate: 49.9,  sellRate: 48.9,  label: 'أورنج كاش → USDT'      },
  { from: 'USDT',         to: 'MGO',      buyRate: 0.995, sellRate: 1.005, label: 'USDT ↔ MoneyGo'         },
  { from: 'USDT',         to: 'INTERNAL', buyRate: 1,     sellRate: 1,     label: 'USDT → محفظة داخلية'   },
  { from: 'INTERNAL',     to: 'USDT',     buyRate: 1,     sellRate: 1,     label: 'محفظة داخلية → USDT'   },
  { from: 'INTERNAL',     to: 'MGO',      buyRate: 0.995, sellRate: 1.005, label: 'محفظة داخلية → MoneyGo' },
];

rateSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ pairs: DEFAULT_PAIRS });
  // أضف الأزواج الناقصة تلقائياً
  if (doc.pairs.length === 0) {
    doc.pairs = DEFAULT_PAIRS;
    await doc.save();
  }
  return doc;
};

// ── دالة الحساب ──
rateSchema.statics.convert = async function (from, to, amount, type = 'buy') {
  const doc = await this.getSingleton();
  const pair = doc.pairs.find(p => p.from === from && p.to === to && p.enabled);
  if (!pair) throw new Error(`No rate found for ${from} → ${to}`);
  const rate = type === 'buy' ? pair.buyRate : pair.sellRate;
  // buy  → العميل يدفع from ويستلم to → amount / rate (إذا from=EGP) أو amount * rate
  // منطق: buyRate = كم من "from" يساوي 1 وحدة من "to"
  // مثال: EGP_VODAFONE→USDT buyRate=50 → 100 EGP / 50 = 2 USDT
  const isEgp = from.startsWith('EGP_');
  const result = isEgp ? amount / rate : amount * rate;
  return { rate, result: parseFloat(result.toFixed(6)), pair };
};

module.exports = mongoose.model('Rate', rateSchema);