
// models/Order.js — نموذج الطلب


const mongoose = require('mongoose');

// ── Counter لضمان عدم تكرار الرقم ────────────
const counterSchema = new mongoose.Schema({
  _id:  { type: String, required: true },
  seq:  { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'orderNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(5, '0');
  return `N1-${padded}`;
}

const orderSchema = new mongoose.Schema({

  orderNumber: {
    type: String,
    unique: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

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

  orderType: {
    type: String,
    enum: [
      'USDT_TO_MONEYGO',
      'EGP_WALLET_TO_MONEYGO',
      'EGP_TO_MONEYGO',
      'EGP_TO_USDT',
      'USDT_TO_WALLET',
      'WALLET_TO_USDT',
      'WALLET_TO_MONEYGO',
      'MONEYGO_TO_USDT',
    ],
    required: true
  },

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
    amountSent:          { type: Number, required: true },
    currencySent: {
      type: String,
      enum: ['USDT', 'EGP', 'MGO'],
      required: true
    }
  },

  moneygo: {
    recipientName:  { type: String, required: true },
    recipientPhone: { type: String, default: '' },
    amountUSD:      { type: Number, required: true },
    transferId:     { type: String, default: null },
    transferStatus: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed'],
      default: 'pending'
    },
    transferNote: { type: String, default: null }
  },

  exchangeRate: {
    usdtToUSD:      { type: Number, default: null },
    egpToUSD:       { type: Number, default: null },
    appliedRate:    { type: Number, required: true },
    fee:            { type: Number, default: 0 },
    finalAmountUSD: { type: Number, required: true }
  },

  status: {
    type: String,
    enum: ['pending', 'verifying', 'verified', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },

  verification: {
    isVerified:         { type: Boolean, default: false },
    verifiedAt:         { type: Date,    default: null },
    verificationMethod: { type: String,  enum: ['auto', 'manual'], default: 'auto' },
    verificationNote:   { type: String,  default: null }
  },

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
    type:    Date,
    default: null,
    index:   { expireAfterSeconds: 0 }
  }

}, { timestamps: true });

// ── رقم الطلب — atomic counter لضمان عدم التكرار ──
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      this.orderNumber = await getNextOrderNumber();
    } catch (err) {
      // fallback: timestamp + random
      this.orderNumber = `N1-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
    }
  }
  next();
});

orderSchema.methods.addTimeline = function(status, message, by = 'system') {
  this.timeline.push({ status, message, by });
};

module.exports = mongoose.model('Order', orderSchema);