// ============================================
// models/Order.js — نموذج الطلب
// ============================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  // ─── رقم الطلب (يُنشأ تلقائياً) ──────────
  orderNumber: {
    type: String,
    unique: true,
    // مثال: N1-20240101-0001
  },

  // ─── المستخدم ─────────────────────────────
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // يمكن الطلب بدون تسجيل (Guest)
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
  // USDT → MoneyGo USD
  // EGP_WALLET → MoneyGo USD (محافظ مصرية)
  orderType: {
    type: String,
    enum: ['USDT_TO_MONEYGO', 'EGP_WALLET_TO_MONEYGO'],
    required: true
  },

  // ─── بيانات الدفع (من العميل) ─────────────
  payment: {
    method: {
      type: String,
      enum: ['USDT_TRC20', 'VODAFONE_CASH', 'ORANGE_CASH', 'FAWRY', 'WE_PAY', 'MEEZA', 'INSTAPAY'],
      required: true
    },

    // للـ USDT
    senderWalletAddress: { type: String, default: null },
    txHash: { type: String, default: null },          // رقم المعاملة على البلوكتشين
    usdtAmount: { type: Number, default: null },

    // للمحافظ المصرية
    receiptImageUrl: { type: String, default: null },  // صورة الإيصال
    senderPhoneNumber: { type: String, default: null },

    // المبلغ المُرسل (بالعملة المدفوعة)
    amountSent: { type: Number, required: true },
    currencySent: {
      type: String,
      enum: ['USDT', 'EGP'],
      required: true
    }
  },

  // ─── بيانات الاستلام (MoneyGo) ────────────
  moneygo: {
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },

    // المبلغ المطلوب استلامه بالـ USD
    amountUSD: { type: Number, required: true },

    // بعد التحويل
    transferId: { type: String, default: null },       // رقم تحويل MoneyGo
    transferStatus: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed'],
      default: 'pending'
    },
    transferNote: { type: String, default: null }
  },

  // ─── سعر الصرف المُطبَّق ──────────────────
  exchangeRate: {
    usdtToUSD: { type: Number, default: null },        // سعر USDT بالـ USD
    egpToUSD: { type: Number, default: null },         // سعر الجنيه بالـ USD
    appliedRate: { type: Number, required: true },     // السعر المُطبَّق فعلاً
    fee: { type: Number, default: 0 },                 // العمولة
    finalAmountUSD: { type: Number, required: true }   // المبلغ النهائي بعد العمولة
  },

  // ─── حالة الطلب ───────────────────────────
  status: {
    type: String,
    enum: [
      'pending',      // ← في الانتظار
      'verifying',    // ← جاري التحقق من الدفع
      'verified',     // ← تم التحقق
      'processing',   // ← جاري معالجة MoneyGo
      'completed',    // ← مكتمل
      'rejected',     // ← مرفوض
      'cancelled'     // ← ملغي
    ],
    default: 'pending'
  },

  // ─── التحقق من USDT (TronGrid) ────────────
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    verificationMethod: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto'
    },
    verificationNote: { type: String, default: null }
  },

  // ─── سجل الأحداث (Timeline) ───────────────
  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    by: { type: String, default: 'system' } // 'system' أو 'admin'
  }],

  // ─── ملاحظات الأدمن ───────────────────────
  adminNote: {
    type: String,
    default: null
  },

  // ─── Telegram Message ID ──────────────────
  telegramMessageId: {
    type: Number,
    default: null
  },

  // ─── IP العميل ────────────────────────────
  clientIp: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});

// ─── Auto-generate Order Number ──────────────
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments() + 1;
    const padded = String(count).padStart(4, '0');
    this.orderNumber = `N1-${dateStr}-${padded}`;
  }
  next();
});

// ─── Method: إضافة حدث للـ Timeline ─────────
orderSchema.methods.addTimeline = function(status, message, by = 'system') {
  this.timeline.push({ status, message, by });
};

module.exports = mongoose.model('Order', orderSchema);
