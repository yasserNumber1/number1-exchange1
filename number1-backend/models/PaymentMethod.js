// models/PaymentMethod.js
// Per-method limits + addresses

const mongoose = require("mongoose");

const methodSchema = new mongoose.Schema(
  {
    methodId: { type: String, required: true }, // 'vodafone', 'instapay'
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    icon: String,
    color: String,
    address: String, // for crypto
    number: String, // for wallets
    note: String,
    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number, default: 0 }, // 0 = no limit (fallback to Rate)
  },
  { _id: false },
);

const paymentMethodSchema = new mongoose.Schema(
  {
    cryptos: [methodSchema],
    wallets: [methodSchema],
  },
  { timestamps: true },
);

paymentMethodSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ cryptos: [], wallets: [] });
  return doc;
};

paymentMethodSchema.statics.getLimits = async function (methodId, currency) {
  const doc = await this.getSingleton();
  const method = [...doc.cryptos, ...doc.wallets].find(
    (m) => m.methodId === methodId && m.enabled,
  );
  if (!method || method.maxAmount <= 0) {
    // Fallback only supplies the inbound minimum. Platform liquidity belongs
    // to the receive side and must not cap what a customer is sending us.
    const Rate = require("./Rate");
    const rateDoc = await Rate.getSingleton();
    if (currency === "EGP")
      return { min: rateDoc.minEgp,  max: 0 };
    if (currency === "USDT")
      return { min: rateDoc.minUsdt, max: 0 };
    if (currency === "MGO")
      return { min: rateDoc.minMgo,  max: 0 };
    return { min: 0, max: 0 };
  }
  return { min: method.minAmount, max: method.maxAmount };
};

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
