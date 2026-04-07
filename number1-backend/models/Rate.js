// models/Rate.js
const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
  from:     { type: String, required: true },
  to:       { type: String, required: true },
  buyRate:  { type: Number, required: true, min: 0 },
  sellRate: { type: Number, required: true, min: 0 },
  label:    { type: String, default: '' },
  enabled:  { type: Boolean, default: true },
}, { _id: false });

const rateSchema = new mongoose.Schema({
  pairs:     { type: [pairSchema], default: [] },
  updatedBy: { type: String, default: 'system' },

  // ── حدود لكل عملة ──────────────────────────
  minEgp:  { type: Number, default: 100   },
  maxEgp:  { type: Number, default: 300000},
  minUsdt: { type: Number, default: 10    },
  maxUsdt: { type: Number, default: 10000 },
  minMgo:  { type: Number, default: 10    },
  maxMgo:  { type: Number, default: 10000 },

  // backward compat
  minOrderUsdt: { type: Number, default: 10   },
  maxOrderUsdt: { type: Number, default: 10000},

}, { timestamps: true });

const DEFAULT_PAIRS = [
  { from: 'EGP_VODAFONE', to: 'USDT',     buyRate: 50,     sellRate: 49,     label: 'فودافون كاش ↔ USDT'     },
  { from: 'EGP_INSTAPAY', to: 'USDT',     buyRate: 50.1,   sellRate: 49.1,   label: 'إنستا باي ↔ USDT'      },
  { from: 'EGP_FAWRY',    to: 'USDT',     buyRate: 49.8,   sellRate: 48.8,   label: 'فاوري ↔ USDT'           },
  { from: 'EGP_ORANGE',   to: 'USDT',     buyRate: 49.9,   sellRate: 48.9,   label: 'أورنج كاش ↔ USDT'      },
  { from: 'USDT',         to: 'MGO',      buyRate: 0.995,  sellRate: 1.005,  label: 'USDT ↔ MoneyGo'         },
  { from: 'EGP_VODAFONE', to: 'MGO',      buyRate: 49.75,  sellRate: 48.75,  label: 'فودافون كاش ↔ MoneyGo' },
  { from: 'EGP_INSTAPAY', to: 'MGO',      buyRate: 49.75,  sellRate: 48.75,  label: 'إنستا باي ↔ MoneyGo'   },
  { from: 'EGP_FAWRY',    to: 'MGO',      buyRate: 49.75,  sellRate: 48.75,  label: 'فاوري ↔ MoneyGo'        },
  { from: 'EGP_ORANGE',   to: 'MGO',      buyRate: 49.75,  sellRate: 48.75,  label: 'أورنج كاش ↔ MoneyGo'   },
  { from: 'USDT',         to: 'INTERNAL', buyRate: 1,      sellRate: 1,      label: 'USDT ↔ محفظة داخلية'   },
  { from: 'INTERNAL',     to: 'USDT',     buyRate: 1,      sellRate: 1,      label: 'محفظة داخلية ↔ USDT'   },
  { from: 'INTERNAL',     to: 'MGO',      buyRate: 0.995,  sellRate: 1.005,  label: 'محفظة داخلية ↔ MoneyGo'},
];

rateSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ pairs: DEFAULT_PAIRS });
  if (doc.pairs.length === 0) { doc.pairs = DEFAULT_PAIRS; await doc.save(); }
  return doc;
};

rateSchema.statics.convert = async function (from, to, amount, type = 'buy') {
  const doc  = await this.getSingleton();
  const pair = doc.pairs.find(p => p.from === from && p.to === to && p.enabled);
  if (!pair) throw new Error(`No rate found for ${from} → ${to}`);
  const rate   = type === 'buy' ? pair.buyRate : pair.sellRate;
  const isEgp  = from.startsWith('EGP_');
  const result = isEgp ? amount / rate : amount * rate;
  return { rate, result: parseFloat(result.toFixed(6)), pair };
};

module.exports = mongoose.model('Rate', rateSchema);