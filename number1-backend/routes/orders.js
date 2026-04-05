// ============================================
// routes/orders.js — API الطلبات
// ============================================

const express        = require('express')
const router         = express.Router()
const crypto         = require('crypto')
const Order          = require('../models/Order')
const { protect, optionalProtect } = require('../middleware/auth')
const { upload }     = require('../services/cloudinary')
const telegramService = require('../services/telegram')

const ORDER_LIFETIME_MS = 30 * 60 * 1000  // 30 دقيقة

// ══════════════════════════════════════════════
// ⚠ Routes الثابتة لازم تكون قبل Routes الـ :id
// ══════════════════════════════════════════════

// ─── GET /api/orders/by-session/:token ────────
// استرجاع الطلب عبر Session Token
router.get('/by-session/:token', async (req, res) => {
  try {
    const order = await Order.findOne({ sessionToken: req.params.token })
      .select('-clientIp -telegramMessageId -adminNote')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Session not found or expired.' })
    }

    // التحقق من انتهاء الوقت
    if (order.expiresAt && new Date() > order.expiresAt) {
      return res.status(410).json({ success: false, message: 'Order session expired.', expired: true })
    }

    const timeRemaining = order.expiresAt
      ? Math.max(0, Math.floor((order.expiresAt - new Date()) / 1000))
      : 0

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
        timeline:      order.timeline,
        createdAt:     order.createdAt,
        updatedAt:     order.updatedAt,
        expiresAt:     order.expiresAt,
        timeRemaining  // ثواني متبقية
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/orders/sse/:token ───────────────
// Server-Sent Events — تحديث الحالة تلقائياً
router.get('/sse/:token', async (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection',    'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  let lastStatus = null
  let interval   = null

  const sendUpdate = async () => {
    try {
      const order = await Order.findOne({ sessionToken: req.params.token })
        .select('status orderNumber expiresAt updatedAt')

      if (!order) {
        res.write(`data: ${JSON.stringify({ type: 'NOT_FOUND' })}\n\n`)
        clearInterval(interval)
        return res.end()
      }

      if (order.expiresAt && new Date() > order.expiresAt) {
        res.write(`data: ${JSON.stringify({ type: 'EXPIRED' })}\n\n`)
        clearInterval(interval)
        return res.end()
      }

      const timeRemaining = Math.max(0, Math.floor((order.expiresAt - new Date()) / 1000))

      // إرسال تحديث الحالة إذا تغيرت
      if (order.status !== lastStatus) {
        lastStatus = order.status
        res.write(`data: ${JSON.stringify({
          type:          'STATUS_UPDATE',
          status:        order.status,
          orderNumber:   order.orderNumber,
          timeRemaining,
          updatedAt:     order.updatedAt
        })}\n\n`)
      } else {
        // إرسال ping مع الوقت المتبقي فقط
        res.write(`data: ${JSON.stringify({ type: 'TICK', timeRemaining })}\n\n`)
      }
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: 'ERROR' })}\n\n`)
    }
  }

  // إرسال أول تحديث فوراً
  await sendUpdate()

  // ثم كل 5 ثواني
  interval = setInterval(sendUpdate, 5000)

  // تنظيف عند إغلاق الاتصال
  req.on('close', () => {
    clearInterval(interval)
    res.end()
  })
})

// ─── DELETE /api/orders/cleanup ───────────────
// حذف الطلبات المنتهية (يُستدعى من Cron)
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await Order.deleteMany({
      expiresAt: { $lt: new Date() },
      status:    { $in: ['pending'] } // حذف فقط طلبات pending المنتهية
    })
    res.json({ success: true, deleted: result.deletedCount })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})


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
    const isInternalWallet = ['USDT_TO_WALLET', 'WALLET_TO_USDT', 'WALLET_TO_MONEYGO', 'EGP_WALLET_TO_MONEYGO'].includes(orderType)
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
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt    = new Date(Date.now() + ORDER_LIFETIME_MS)

    const order = await Order.create({
      user: req.user?._id || null,
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      payment,
      moneygo,
      exchangeRate,
      clientIp:     req.ip,
      sessionToken,
      expiresAt,
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
        _id:          order._id,
        orderNumber:  order.orderNumber,
        status:       order.status,
        sessionToken: order.sessionToken,
        expiresAt:    order.expiresAt,
        createdAt:    order.createdAt,
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

// ─── POST /api/orders/:orderNumber/cancel ────
// إلغاء الطلب من قبل العميل
router.post('/:orderNumber/cancel', async (req, res) => {
  try {
    const { sessionToken, reason } = req.body
    const orderNumber = req.params.orderNumber.toUpperCase()

    const order = await Order.findOne({ orderNumber })
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود.' })
    }

    // التحقق من الـ session token (أمان)
    if (sessionToken && order.sessionToken !== sessionToken) {
      return res.status(403).json({ success: false, message: 'غير مصرح.' })
    }

    // السماح بالإلغاء فقط في مرحلة pending أو verifying
    if (!['pending', 'verifying'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء الطلب بعد بدء المعالجة.'
      })
    }

    order.status = 'cancelled'
    order.moneygo.transferStatus = 'failed'
    order.addTimeline('cancelled', reason ? `إلغاء العميل: ${reason}` : 'إلغاء العميل', 'customer')
    await order.save()

    // إشعار التليغرام بالإلغاء
    try {
      await telegramService.notifyOrderCancelled(order, reason || '')
      // تعديل الرسالة الأصلية إذا كانت موجودة
      if (order.telegramMessageId) {
        await telegramService.editOrderMessage(order.telegramMessageId, order, 'cancel')
      }
    } catch (tgErr) {
      console.error('Telegram cancel notify failed:', tgErr.message)
    }

    res.json({ success: true, message: 'تم إلغاء الطلب.' })

  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

module.exports = router