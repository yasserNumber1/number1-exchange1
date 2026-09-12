// models/Order.js — نموذج الطلب

const mongoose = require("mongoose");

// ── Counter لضمان عدم تكرار الرقم ────────────
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  const padded = String(counter.seq).padStart(5, "0");
  return `N1-${padded}`;
}

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      trim: true,
      default: null,
    },

    orderType: {
      type: String,
      enum: [
        "USDT_TO_MONEYGO",
        "EGP_WALLET_TO_MONEYGO",
        "EGP_TO_MONEYGO",
        "EGP_TO_USDT",
        "USDT_TO_WALLET",
        "USDT_TO_EGP",
        "WALLET_TO_USDT",
        "WALLET_TO_MONEYGO",
        "MONEYGO_TO_USDT",
        "MONEYGO_TO_EGP",
        "MONEYGO_TO_WALLET",
      ],
      required: true,
    },

    payment: {
      method: {
        type: String,
        enum: [
          "USDT_TRC20",
          "USDT_BEP20",
          "VODAFONE_CASH",
          "ORANGE_CASH",
          "FAWRY",
          "WE_PAY",
          "MEEZA",
          "INSTAPAY",
          "WALLET",
          "MONEYGO",
        ],
        required: true,
      },
      senderWalletAddress: { type: String, default: null },
      txHash: { type: String, default: null },
      usdtAmount: { type: Number, default: null },
      receiptImageUrl: { type: String, default: null },
      senderPhoneNumber: { type: String, default: null },
      amountSent: { type: Number, required: true },
      currencySent: {
        type: String,
        enum: ["USDT", "EGP", "MGO"],
        required: true,
      },
      destination: {
        methodName: { type: String, default: "" },
        address: { type: String, default: "" },
        network: { type: String, default: "" },
        type: { type: String, default: "" },
      },
    },

    moneygo: {
      recipientName: { type: String, required: true },
      recipientPhone: { type: String, default: "" },
      amountUSD: { type: Number, required: true },
      transferId: { type: String, default: null },
      transferStatus: {
        type: String,
        enum: ["pending", "processing", "sent", "failed"],
        default: "pending",
      },
      transferNote: { type: String, default: null },
    },

    exchangeRate: {
      usdtToUSD: { type: Number, default: null },
      egpToUSD: { type: Number, default: null },
      appliedRate: { type: Number, required: true },
      fee: { type: Number, default: 0 },
      finalAmountUSD: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "verifying",
        "verified",
        "processing",
        "completed",
        "rejected",
        "cancelled",
        "expired",
      ],
      default: "pending",
    },

    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      verificationMethod: {
        type: String,
        enum: ["auto", "manual"],
        default: "auto",
      },
      verificationNote: { type: String, default: null },
    },

    timeline: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        by: { type: String, default: "system" },
      },
    ],

    adminNote: { type: String, default: null },
    cancelledBy: { type: String, enum: ["customer", "admin", "system"], default: null },
    telegramMessageId: { type: Number, default: null },
    liquidityReserved: { type: Boolean, default: false },
    clientIp: { type: String, default: null },

    sessionToken: {
      type: String,
      default: null,
      index: true,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

// ── رقم الطلب + Limit Validation ──
orderSchema.pre("save", async function (next) {
  // Only pending orders have a payment deadline. Verification and final states do not.
  if (this.status !== 'pending' && this.expiresAt !== null) {
    this.expiresAt = null;
  }

  if (this.isNew && !this.orderNumber) {
    try {
      this.orderNumber = await getNextOrderNumber();
    } catch (err) {
      this.orderNumber = `N1-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    }
  }

  // ── Validate amount against per-method limits ──
  if (this.isNew) {
    try {
      const PaymentMethod = require("./PaymentMethod");
      const { min, max } = await PaymentMethod.getLimits(
        this.payment.method,
        this.payment.currencySent,
      );
      const amount = parseFloat(this.payment.amountSent);
      if (min > 0 && amount < min)
        throw new Error(
          `المبلغ أقل من الحد الأدنى (${min} ${this.payment.currencySent}) لـ ${this.payment.method}`,
        );
      if (max > 0 && amount > max)
        throw new Error(
          `المبلغ أعلى من الحد الأقصى (${max} ${this.payment.currencySent}) لـ ${this.payment.method}`,
        );
    } catch (limitErr) {
      // If it's a validation error (our own throw), re-throw it
      if (limitErr.message.includes('الحد الأدنى') || limitErr.message.includes('الحد الأقصى')) {
        throw limitErr;
      }
      // Otherwise log and continue — don't block order creation
      console.warn(`[Order] PaymentMethod.getLimits failed for ${this.payment.method}:`, limitErr.message);
    }
  }

  next();
});

orderSchema.methods.addTimeline = function (status, message, by = "system") {
  this.timeline.push({ status, message, by });
};

module.exports = mongoose.model("Order", orderSchema);
