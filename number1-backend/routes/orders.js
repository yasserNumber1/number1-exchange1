// ============================================
// routes/orders.js — API الطلبات
// ============================================

const express        = require('express')
const router         = express.Router()
const Order          = require('../models/Order')
const { protect, optionalProtect } = require('../middleware/auth')
const { upload }     = require('../services/cloudinary')
const telegramService = require('../services/telegram')

// ══════════════════════════════════════════════
// ⚠ Routes الثابتة لازم تكون قبل Routes الـ :id
// ══════════════════════════════════════════════

// ─── POST /api/orders/upload-receipt ──────────
// رفع صورة الإيصال — بدون auth
router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم إرفاق صورة.'
      })
    }

    res.json({
      success:  true,
      url:      req.file.path,
      publicId: req.file.filename,
    })

  } catch (error) {
    console.error('Upload receipt error:', error)
    res.status(500).json({
      success:  false,
      message:  error.message || 'فشل رفع الصورة.'
    })
  }
})

// ─── GET /api/orders/track/:orderNumber ───────
// تتبع طلب بالرقم (بدون تسجيل دخول)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber.toUpperCase()
    }).select('-clientIp -telegramMessageId -adminNote')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    res.json({
      success: true,
      order: {
        orderNumber:  order.orderNumber,
        status:       order.status,
        orderType:    order.orderType,
        payment: {
          method:       order.payment.method,
          amountSent:   order.payment.amountSent,
          currencySent: order.payment.currencySent
        },
        moneygo: {
          recipientName:  order.moneygo.recipientName,
          amountUSD:      order.moneygo.amountUSD,
          transferStatus: order.moneygo.transferStatus
        },
        exchangeRate: {
          finalAmountUSD: order.exchangeRate.finalAmountUSD
        },
        timeline:  order.timeline,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/orders/my ───────────────────────
// طلبات المستخدم الحالي
router.get('/my', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const orders = await Order.find({ user: req.user._id })
      .select('-clientIp -telegramMessageId -adminNote')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments({ user: req.user._id })

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── POST /api/orders ─────────────────────────
// إنشاء طلب جديد
router.post('/', optionalProtect, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      payment,
      moneygo,
      exchangeRate
    } = req.body

    // ── التحقق من البيانات الأساسية ───────────
    if (!customerName || !customerEmail || !orderType || !payment || !moneygo || !exchangeRate) {
      return res.status(400).json({ success: false, message: 'البيانات المطلوبة غير مكتملة.' })
    }
    if (!moneygo.amountUSD) {
      return res.status(400).json({ success: false, message: 'المبلغ مطلوب.' })
    }
    if (!payment.method || !payment.amountSent || !payment.currencySent) {
      return res.status(400).json({ success: false, message: 'بيانات الدفع غير مكتملة.' })
    }

    // ── التحقق من صحة البريد الإلكتروني ──────
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRx.test(customerEmail)) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صحيح.' })
    }

    // ── التحقق من رقم الهاتف (إذا وُجد) — يقبل أرقام دولية ──
    if (payment.senderPhoneNumber) {
      const phoneRx = /^\+?[0-9\s\-]{7,20}$/
      if (!phoneRx.test(payment.senderPhoneNumber.trim())) {
        return res.status(400).json({ success: false, message: 'رقم الهاتف غير صحيح.' })
      }
    }

    // ── التحقق من معرّف الاستلام (ليس مطلوباً للحساب الداخلي) ──
    const isInternalWallet = orderType === 'USDT_TO_WALLET' || orderType === 'WALLET_TO_USDT' || orderType === 'EGP_WALLET_TO_MONEYGO'
    if (!isInternalWallet && (!moneygo.recipientPhone || moneygo.recipientPhone.trim().length < 5)) {
      return res.status(400).json({ success: false, message: 'معرّف المستلم مطلوب.' })
    }

    // ── التحقق من TXID إذا أرسله المستخدم ────
    if (payment.method === 'USDT_TRC20' && payment.txHash) {
      // منع استخدام نفس الـ TXID مرتين
      const duplicate = await Order.findOne({ 'payment.txHash': payment.txHash })
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'رقم المعاملة (TXID) مستخدم مسبقاً في طلب آخر.'
        })
      }
      // التحقق من وجود الـ TXID على شبكة TRON
      if (process.env.TRONGRID_API_KEY) {
        try {
          const tronRes = await fetch(
            `https://api.trongrid.io/v1/transactions/${payment.txHash}`,
            { headers: { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY } }
          )
          const tronData = await tronRes.json()
          if (!tronData?.data?.[0]) {
            return res.status(400).json({
              success: false,
              message: 'رقم المعاملة (TXID) غير موجود على شبكة TRON — تأكد من نسخه بشكل صحيح.'
            })
          }
        } catch (tronErr) {
          console.warn('TronGrid check failed:', tronErr.message)
          // لا نوقف الطلب لو فشل الاتصال بـ TronGrid
        }
      }
    }

    // ── إنشاء الطلب ───────────────────────────
    const order = await Order.create({
      user: req.user?._id || null,
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      payment,
      moneygo,
      exchangeRate,
      clientIp: req.ip,
      timeline: [{ status: 'pending', message: 'Order created successfully.', by: 'system' }]
    })

    // ── إشعار التليغرام ───────────────────────
    try {
      const tgResult = await telegramService.notifyNewOrder(order)
      if (tgResult.success) {
        order.telegramMessageId = tgResult.messageId
        await order.save()
      }
    } catch (tgError) {
      console.error('Telegram notification failed:', tgError.message)
    }

    // ── إرسال صورة الإيصال للتليغرام ──────────
    if (payment.receiptImageUrl) {
      try {
        await telegramService.sendReceiptPhoto(
          payment.receiptImageUrl,
          `📎 إيصال الطلب: ${order.orderNumber}`
        )
      } catch (err) {
        console.error('Failed to send receipt photo:', err.message)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: {
        _id:         order._id,
        orderNumber: order.orderNumber,
        status:      order.status,
        createdAt:   order.createdAt,
      }
    })

  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ success: false, message: 'Server error creating order.' })
  }
})

// ─── POST /api/orders/:id/verify-usdt ─────────
// التحقق من معاملة USDT
router.post('/:id/verify-usdt', async (req, res) => {
  try {
    const { txHash } = req.body

    if (!txHash) {
      return res.status(400).json({ success: false, message: 'TX Hash is required.' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }
    if (order.payment.method !== 'USDT_TRC20') {
      return res.status(400).json({ success: false, message: 'Order is not USDT type.' })
    }
    if (order.verification.isVerified) {
      return res.status(400).json({ success: false, message: 'Order already verified.' })
    }

    const verificationResult = await trongridService.verifyUSDTTransaction({
      txHash,
      expectedAddress: process.env.USDT_RECEIVING_ADDRESS,
      expectedAmount:  order.payment.amountSent
    })

    if (!verificationResult.success) {
      return res.status(400).json({ success: false, message: verificationResult.message })
    }

    order.payment.txHash              = txHash
    order.status                      = 'verified'
    order.verification.isVerified     = true
    order.verification.verifiedAt     = new Date()
    order.verification.verificationMethod = 'auto'
    order.addTimeline('verified', `USDT verified automatically. TX: ${txHash}`, 'system')
    await order.save()

    await telegramService.notifyOrderUpdate(order, 'verified', `TX: ${txHash}`)

    res.json({
      success: true,
      message: 'USDT transaction verified successfully.',
      order: { orderNumber: order.orderNumber, status: order.status }
    })

  } catch (error) {
    console.error('USDT verify error:', error)
    res.status(500).json({ success: false, message: 'Verification error.' })
  }
})

module.exports = router