// ============================================
// models/Deposit.js — طلبات إيداع N1 Credit
// ============================================
const mongoose = require('mongoose')

const depositSchema = new mongoose.Schema(
  {
    // ─── المستخدم ───────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── نوع الإيداع ────────────────────────
    type: {
      type: String,
      enum: ['bank_transfer', 'usdt'],
      required: true,
    },

    // ─── المبلغ المطلوب ──────────────────────
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // ─── العملة ──────────────────────────────
    currency: {
      type: String,
      enum: ['EGP', 'USDT'],
      required: true,
    },

    // ─── التحويل البنكي — إيصال Cloudinary ──
    receiptUrl: {
      type: String,
      default: null,
    },

    // ─── USDT — رقم المعاملة ─────────────────
    txid: {
      type: String,
      default: null,
    },

    // ─── الحالة ──────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // ─── سبب الرفض ───────────────────────────
    rejectionReason: {
      type: String,
      default: null,
    },

    // ─── الأدمن اللي عالج الطلب ──────────────
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Deposit', depositSchema)