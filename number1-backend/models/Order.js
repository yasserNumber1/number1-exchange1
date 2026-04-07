// ============================================
// models/Order.js — نموذج الطلب
// ============================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  // ─── رقم الطلب (يُنشأ تلقائياً) ──────────
  orderNumber: {
    type: String,
    unique: true,
  },

  // ─── المستخدم ─────────────────────────────
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ─── معلومات العميل ───────────────────────
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },

  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true
  },

  customerPhone: {
    type: String,
    trim: true,
    default: null
  },

  // ─── نوع الطلب ────────────────────────────
  orderType: {
    type: String,
    enum: [
      'USDT_TO_MONEYGO',        // USDT → MoneyGo
      'EGP_WALLET_TO_MONEYGO',  // EGP (محافظ) → MoneyGo (القديم)
      'EGP_TO_MONEYGO',         // EGP (محافظ) → MoneyGo (الجديد)
      'EGP_TO_USDT',            // EGP (محافظ) → USDT
      'USDT_TO_WALLET',         // USDT → محفظة داخلية
      'WALLET_TO_USDT',         // محفظة داخلية → USDT
      'WALLET_TO_MONEYGO',      // محفظة داخلية → MoneyGo
      'MONEYGO_TO_USDT',        // MoneyGo → USDT
    ],
    required: true
  },

  // ─── بيانات الدفع (من العميل) ─────────────
  payment: {
    method: {
      type: String,
      enum: ['USDT_TRC20', 'VODAFONE_CASH', 'ORANGE_CASH', 'FAWRY', 'WE_PAY', 'MEEZA', 'INSTAPAY', 'WALLET', 'MONEYGO'],
      required: true
    },

    senderWalletAddress: { type: String, default: null },
    txHash:              { type: String, default: null },
    usdtAmount:          { type: Number, default: null },
    receiptImageUrl:     { type: String, default: null },
    senderPhoneNumber:   { type: String, default: null },

    amountSent: {
      type: Number,
      required: true
    },
    currencySent: {
      type: String,
      enum: ['USDT', 'EGP', 'MGO'],  // أضفنا MGO
      required: true
    }
  },

  // ─── بيانات الاستلام ──────────────────────
  moneygo: {
    recipientName:  { type: String, required: true },
    recipientPhone: { type: String, default: '' },   // غير مطلوب للـ USDT_TO_WALLET
    amountUSD:      { type: Number, required: true },
    transferId:     { type: String, default: null },
    transferStatus: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed'],
      default: 'pending'
    },
    transferNote: { type: String, default: null }
  },

  // ─── سعر الصرف المُطبَّق ──────────────────
  exchangeRate: {
    usdtToUSD:      { type: Number, default: null },
    egpToUSD:       { type: Number, default: null },
    appliedRate:    { type: Number, required: true },
    fee:            { type: Number, default: 0 },
    finalAmountUSD: { type: Number, required: true }
  },

  // ─── حالة الطلب ───────────────────────────
  status: {
    type: String,
    enum: ['pending', 'verifying', 'verified', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },

  // ─── التحقق من USDT ───────────────────────
  verification: {
    isVerified:          { type: Boolean, default: false },
    verifiedAt:          { type: Date,    default: null },
    verificationMethod:  { type: String,  enum: ['auto', 'manual'], default: 'auto' },
    verificationNote:    { type: String,  default: null }
  },

  // ─── سجل الأحداث ──────────────────────────
  timeline: [{
    status:    String,
    message:   String,
    timestamp: { type: Date, default: Date.now },
    by:        { type: String, default: 'system' }
  }],

  adminNote:         { type: String, default: null },
  telegramMessageId: { type: Number, default: null },
  clientIp:          { type: String, default: null },

  sessionToken: {
    type:  String,
    default: null,
    index: true
  },

  expiresAt: {
    type:  Date,
    default: null,
    index: { expireAfterSeconds: 0 }
  }

}, { timestamps: true });

// ─── Auto-generate Order Number ──────────────
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count  = await mongoose.model('Order').countDocuments() + 1;
    const padded = String(count).padStart(5, '0');
    this.orderNumber = `N1-${padded}`;
  }
  next();
});

// ─── Method: إضافة حدث للـ Timeline ─────────
orderSchema.methods.addTimeline = function(status, message, by = 'system') {
  this.timeline.push({ status, message, by });
};

module.exports = mongoose.model('Order', orderSchema);