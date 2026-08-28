// ============================================
// models/Transaction.js — سجل المعاملات
// ============================================
const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({

  // ─── المستخدم ─────────────────────────────
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ─── المحفظة ──────────────────────────────
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },

  // ─── نوع المعاملة ─────────────────────────
  type: {
    type: String,
    enum: ['deposit', 'withdraw', 'exchange_debit', 'refund', 'admin_adjust'],
    // deposit        = إيداع أدمن بعد موافقته على طلب USDT
    // withdraw       = سحب (يدوي عبر واتساب/تيليجرام)
    // exchange_debit = خصم عند استخدام الرصيد في طلب تحويل
    // admin_adjust   = تعديل يدوي من الأدمن (زيادة أو نقص)
    required: true
  },

  // ─── المبلغ ───────────────────────────────
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be positive']
  },

  // ─── الرصيد قبل وبعد ──────────────────────
  balanceBefore: { type: Number, required: true },
  balanceAfter:  { type: Number, required: true },

  // ─── الحالة ───────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'completed'
  },

  // ─── مرجع الطلب (اختياري) ─────────────────
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },

  // Unique key for financial operations that must only happen once per order.
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  },

  // ─── من نفّذ العملية ──────────────────────
  performedBy: {
    type: String, // 'user' | 'admin:email@...' | 'system'
    default: 'system'
  },

  // ─── ملاحظة ───────────────────────────────
  note: {
    type: String,
    default: null
  }

}, { timestamps: true })

// Index للبحث السريع
transactionSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Transaction', transactionSchema)
