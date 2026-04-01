// ============================================
// routes/admin.js — لوحة الأدمن + Telegram Webhook
// ============================================
const Setting = require('../models/Setting');
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const telegramService = require('../services/telegram');
const Rate = require('../models/Rate');
const mongoose = require('mongoose')

router.use(protect, adminOnly);

// ─── GET /api/admin/orders ────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { status, orderType, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);
    res.json({ success: true, orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/admin/orders/:id ────────────────
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/admin/orders/:id/status ─────────
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, note, transferId } = req.body;
    const validStatuses = ['verifying', 'verified', 'processing', 'completed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.status = status;
    if (note) order.adminNote = note;
    if (transferId) order.moneygo.transferId = transferId;
    if (status === 'completed') order.moneygo.transferStatus = 'sent';
    else if (status === 'rejected') order.moneygo.transferStatus = 'failed';
    order.addTimeline(status, note || `Status updated to ${status}`, `admin:${req.user.email}`);
    await order.save();
    await telegramService.notifyOrderUpdate(order, status, note);
    res.json({ success: true, message: 'Order status updated.', order: { orderNumber: order.orderNumber, status: order.status } });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/admin/stats ─────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, pendingOrders, completedOrders, rejectedOrders, totalUsers, todayOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'verifying', 'verified', 'processing'] } }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
    ]);
    const volumeResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalUSD: { $sum: '$exchangeRate.finalAmountUSD' } } }
    ]);
    res.json({ success: true, stats: { totalOrders, pendingOrders, completedOrders, rejectedOrders, totalUsers, todayOrders, totalVolumeUSD: (volumeResult[0]?.totalUSD || 0).toFixed(2) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/admin/users ─────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, users: users.map(u => u.toSafeObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/admin/telegram-webhook-internal ─
router.post('/telegram-webhook-internal', async (req, res) => {
  try {
    const { callback_query } = req.body;
    if (!callback_query) return res.json({ success: true });
    const { data, id: callbackQueryId } = callback_query;
    const [action, orderId] = data.split('_');
    const order = await Order.findById(orderId);
    if (!order) {
      await telegramService.answerCallbackQuery(callbackQueryId, '❌ الطلب غير موجود');
      return res.json({ success: true });
    }
    let newStatus, message;
    switch (action) {
      case 'approve': newStatus = 'verified';  message = '✅ تم الموافقة على الطلب'; break;
      case 'reject':  newStatus = 'rejected';  message = '❌ تم رفض الطلب';          break;
      case 'complete':newStatus = 'completed'; message = '🎉 تم إكمال الطلب';        break;
      default: return res.json({ success: true });
    }
    order.status = newStatus;
    order.addTimeline(newStatus, `${message} via Telegram`, 'admin:telegram');
    await order.save();
    await telegramService.answerCallbackQuery(callbackQueryId, message);
    await telegramService.notifyOrderUpdate(order, newStatus);
    res.json({ success: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.json({ success: true });
  }
});

// ─── GET /api/admin/rates ─────────────────────
router.get('/rates', async (req, res) => {
  try {
    const rates = await Rate.getSingleton();
    res.json({ success: true, ...rates.toObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/admin/rates ─────────────────────
router.put('/rates', async (req, res) => {
  try {
    const allowed = ['usdtBuyRate', 'usdtSellRate', 'moneygoRate', 'vodafoneBuyRate', 'instaPayRate', 'fawryRate', 'orangeRate', 'minOrderUsdt', 'maxOrderUsdt'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== '') updates[key] = parseFloat(req.body[key]);
    });
    updates.updatedBy = req.user.email;
    const rates = await Rate.findOneAndUpdate({}, { $set: updates }, { new: true, upsert: true });
    res.json({ success: true, message: 'Rates updated.', ...rates.toObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/admin/settings ──────────────────
router.get('/settings', async (req, res) => {
  try {
    const settings = await Setting.getSingleton()
    const safe = settings.toObject()
    if (safe.smtpPassword)     safe.smtpPassword     = safe.smtpPassword     ? '••••••••' : ''
    if (safe.telegramBotToken) safe.telegramBotToken = safe.telegramBotToken ? '••••••••' : ''
    res.json({ success: true, ...safe })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── PUT /api/admin/settings ──────────────────
// ✅ نسخة واحدة فقط — تحتوي على كل الحقول بما فيها الإيداع
router.put('/settings', async (req, res) => {
  try {
    const allowed = [
      // عام
      'platformName', 'platformActive', 'maintenanceMode',
      'platformNameAr', 'platformNameEn', 'platformUrl',
      'platformEnabled', 'registrationEnabled',
      'supportEmail', 'supportTelegram',

      // بيانات التواصل
      'contactTelegram', 'contactWhatsapp', 'contactEmail', 'contactWebsite',

      // إشعارات
      'telegramNotifications', 'emailNotifications',
      'telegramBotToken', 'telegramChatId',

      // SMTP
      'smtpHost', 'smtpPort', 'smtpEmail', 'smtpPassword',

      // الطلبات
      'minOrderUsdt', 'maxOrderUsdt', 'orderExpiryMins',
      'minOrderUsd', 'maxOrderUsd', 'orderExpiryMinutes',
      'usdtOrdersEnabled', 'walletOrdersEnabled',
      'bankTransferEnabled', 'maxDailyOrdersUser',

      // API
      'moneygoApiKey', 'moneygoApiUrl', 'cryptoApiKey',
      'webhookUrl', 'environment',

      // أمان
      'jwtRefreshEnabled', 'twoFactorAdmin', 'auditLogEnabled',
      'sessionExpireHours', 'maxLoginAttempts',
      'ipBanMinutes', 'maxConcurrentSessions',

      // ── بيانات الإيداع ── ✅ جديد
      'depositBankName', 'depositAccountName', 'depositAccountNumber',
      'depositUsdtAddress', 'depositUsdtNetwork', 'depositNote',
    ]

    const updates = {}
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        if (req.body[key] === '••••••••') return
        updates[key] = req.body[key]
      }
    })

    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true }
    )

    res.json({ success: true, message: 'Settings saved.', ...settings.toObject() })
  } catch (error) {
    console.error('Settings save error:', error)
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── Payment Methods ───────────────────────────
const paymentMethodSchema = new mongoose.Schema({
  cryptos: { type: Array, default: [] },
  wallets: { type: Array, default: [] },
}, { timestamps: true })

const PaymentMethod = mongoose.models.PaymentMethod ||
  mongoose.model('PaymentMethod', paymentMethodSchema)

router.get('/payment-methods', async (req, res) => {
  try {
    let doc = await PaymentMethod.findOne()
    if (!doc) doc = await PaymentMethod.create({ cryptos: [], wallets: [] })
    res.json({ success: true, cryptos: doc.cryptos, wallets: doc.wallets })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.put('/payment-methods', async (req, res) => {
  try {
    const { cryptos, wallets } = req.body
    const doc = await PaymentMethod.findOneAndUpdate(
      {},
      { $set: { cryptos: cryptos || [], wallets: wallets || [] } },
      { new: true, upsert: true }
    )
    res.json({ success: true, message: 'Saved.', cryptos: doc.cryptos, wallets: doc.wallets })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── PATCH /api/admin/users/:id/block ─────────
router.patch('/users/:id/block', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin users.' });
    user.isActive = !isBlocked;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: isBlocked ? 'User blocked.' : 'User unblocked.', user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── Wallet Admin Routes ───────────────────────
const Wallet      = require('../models/Wallet')
const Transaction = require('../models/Transaction')

router.get('/wallets', async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('user', 'name email').sort({ createdAt: -1 })
    res.json({ success: true, wallets })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.get('/wallets/:userId', async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.params.userId }).populate('user', 'name email')
    if (!wallet) {
      wallet = await Wallet.create({ user: req.params.userId })
      await wallet.populate('user', 'name email')
    }
    const transactions = await Transaction.find({ user: req.params.userId }).sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, wallet, transactions })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.post('/wallets/:userId/deposit', async (req, res) => {
  try {
    const { amount, note } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount.' })
    let wallet = await Wallet.findOne({ user: req.params.userId })
    if (!wallet) wallet = await Wallet.create({ user: req.params.userId })
    if (!wallet.isActive) return res.status(400).json({ success: false, message: 'Wallet is inactive.' })
    const balanceBefore = wallet.balance
    wallet.balance        += parseFloat(amount)
    wallet.totalDeposited += parseFloat(amount)
    await wallet.save()
    const transaction = await Transaction.create({
      user: req.params.userId, wallet: wallet._id, type: 'deposit',
      amount: parseFloat(amount), balanceBefore, balanceAfter: wallet.balance,
      status: 'completed', performedBy: `admin:${req.user.email}`, note: note || 'Admin deposit'
    })
    res.json({ success: true, message: `تم إيداع ${amount} USDT بنجاح.`, balance: wallet.balance, transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.patch('/wallets/:userId/toggle', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.params.userId })
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found.' })
    wallet.isActive = !wallet.isActive
    await wallet.save()
    res.json({ success: true, message: wallet.isActive ? 'Wallet activated.' : 'Wallet deactivated.', isActive: wallet.isActive })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── Deposit Admin Routes (N1 Credit) ─────────
const Deposit = require('../models/Deposit')

router.get('/deposits', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (type)   filter.type   = type
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [deposits, total] = await Promise.all([
      Deposit.find(filter).populate('user', 'name email').populate('processedBy', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Deposit.countDocuments(filter)
    ])
    res.json({ success: true, deposits, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.post('/deposits/:id/approve', async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id).populate('user', 'name email')
    if (!deposit) return res.status(404).json({ success: false, message: 'طلب الإيداع غير موجود.' })
    if (deposit.status !== 'pending') return res.status(400).json({ success: false, message: 'هذا الطلب تمت معالجته مسبقاً.' })

    deposit.status      = 'approved'
    deposit.processedBy = req.user._id
    deposit.processedAt = new Date()
    await deposit.save()

    let wallet = await Wallet.findOne({ user: deposit.user._id })
    if (!wallet) wallet = await Wallet.create({ user: deposit.user._id })

    const balanceBefore = wallet.n1Balance
    wallet.n1Balance        += deposit.amount
    wallet.totalN1Deposited += deposit.amount
    await wallet.save()

    await Transaction.create({
      user: deposit.user._id, wallet: wallet._id, type: 'deposit',
      amount: deposit.amount, balanceBefore, balanceAfter: wallet.n1Balance,
      status: 'completed', performedBy: `admin:${req.user.email}`,
      note: `N1 Deposit approved — ${deposit.type} — ${deposit.currency}`
    })

    res.json({ success: true, message: `تمت الموافقة. تم إضافة ${deposit.amount} N1 للمستخدم.`, deposit, n1Balance: wallet.n1Balance })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.post('/deposits/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason || !reason.trim()) return res.status(400).json({ success: false, message: 'يرجى إدخال سبب الرفض.' })
    const deposit = await Deposit.findById(req.params.id)
    if (!deposit) return res.status(404).json({ success: false, message: 'طلب الإيداع غير موجود.' })
    if (deposit.status !== 'pending') return res.status(400).json({ success: false, message: 'هذا الطلب تمت معالجته مسبقاً.' })
    deposit.status          = 'rejected'
    deposit.rejectionReason = reason.trim()
    deposit.processedBy     = req.user._id
    deposit.processedAt     = new Date()
    await deposit.save()
    res.json({ success: true, message: 'تم رفض طلب الإيداع.', deposit })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

module.exports = router;