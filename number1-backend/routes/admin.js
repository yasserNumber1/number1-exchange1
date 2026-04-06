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

    const { data, id: callbackQueryId, message } = callback_query;

    // ── استخرج الـ action والـ orderId ──────────────
    const underscoreIdx = data.indexOf('_')
    const action  = data.substring(0, underscoreIdx)
    const orderId = data.substring(underscoreIdx + 1)

    const order = await Order.findById(orderId);
    if (!order) {
      await telegramService.answerCallbackQuery(callbackQueryId, '❌ الطلب غير موجود');
      return res.json({ success: true });
    }

    // ── التحقق من المنطق الإجباري ───────────────────
    // approve → فقط من pending/verifying
    // complete → فقط بعد approve (verified/processing)
    // reject → فقط من pending/verifying
    const allowedTransitions = {
      approve:  ['pending', 'verifying'],
      reject:   ['pending', 'verifying'],
      complete: ['verified', 'processing'],
    }

    if (!allowedTransitions[action]?.includes(order.status)) {
      await telegramService.answerCallbackQuery(
        callbackQueryId,
        `⚠️ لا يمكن تنفيذ هذا الإجراء — الحالة الحالية: ${order.status}`
      )
      return res.json({ success: true });
    }

    let newStatus, message_text;
    switch (action) {
      case 'approve':  newStatus = 'verified';  message_text = '✅ تم الموافقة على الطلب'; break;
      case 'reject':   newStatus = 'rejected';  message_text = '❌ تم رفض الطلب';          break;
      case 'complete': newStatus = 'completed'; message_text = '🎉 تم إكمال الطلب';        break;
      default: return res.json({ success: true });
    }

    order.status = newStatus;
    order.addTimeline(newStatus, `${message_text} via Telegram`, 'admin:telegram');
    await order.save();

    // ── رد فوري على الأدمن ───────────────────────────
    await telegramService.answerCallbackQuery(callbackQueryId, message_text);

    // ── تحديث رسالة التليجرام بالأزرار الصحيحة ──────
    const msgId = order.telegramMessageId || message?.message_id
    if (msgId) {
      await telegramService.editOrderMessage(msgId, order, action)
    }

    // ── بث التحديث عبر SSE للعميل ───────────────────
    const sseService = require('../services/sse') // إذا عندك SSE service
    sseService.broadcast(order._id.toString(), {
      type: 'STATUS_UPDATE',
      status: newStatus,
      updatedAt: new Date()
    })

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
router.put('/settings', async (req, res) => {
  try {
    const allowed = [
      'platformName', 'platformActive', 'maintenanceMode',
      'platformNameAr', 'platformNameEn', 'platformUrl',
      'platformEnabled', 'registrationEnabled',
      'supportEmail', 'supportTelegram',
      'contactTelegram', 'contactWhatsapp', 'contactEmail', 'contactWebsite',
      'telegramNotifications', 'emailNotifications',
      'telegramBotToken', 'telegramChatId',
      'smtpHost', 'smtpPort', 'smtpEmail', 'smtpPassword',
      'minOrderUsdt', 'maxOrderUsdt', 'orderExpiryMins',
      'minOrderUsd', 'maxOrderUsd', 'orderExpiryMinutes',
      'usdtOrdersEnabled', 'walletOrdersEnabled',
      'bankTransferEnabled', 'maxDailyOrdersUser',
      'moneygoApiKey', 'moneygoApiUrl', 'cryptoApiKey',
      'webhookUrl', 'environment',
      'jwtRefreshEnabled', 'twoFactorAdmin', 'auditLogEnabled',
      'sessionExpireHours', 'maxLoginAttempts',
      'ipBanMinutes', 'maxConcurrentSessions',
      // بيانات إيداع USDT
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

// ─── Wallet Deposit Addresses (separate from payment methods) ──
const walletDepositSchema = new mongoose.Schema({
  cryptos: { type: Array, default: [] },
}, { timestamps: true })

const WalletDeposit = mongoose.models.WalletDeposit ||
  mongoose.model('WalletDeposit', walletDepositSchema)

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

// ─── Wallet Deposit Addresses routes ──────────
router.get('/wallet-deposit-addresses', async (req, res) => {
  try {
    let doc = await WalletDeposit.findOne()
    if (!doc) doc = await WalletDeposit.create({ cryptos: [] })
    res.json({ success: true, cryptos: doc.cryptos })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.put('/wallet-deposit-addresses', async (req, res) => {
  try {
    const { cryptos } = req.body
    const doc = await WalletDeposit.findOneAndUpdate(
      {},
      { $set: { cryptos: cryptos || [] } },
      { new: true, upsert: true }
    )
    res.json({ success: true, message: 'Saved.', cryptos: doc.cryptos })
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

// ─── إيداع يدوي من الأدمن ─────────────────────
router.post('/wallets/:userId/deposit', async (req, res) => {
  try {
    const { amount, note } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount.' })
    let wallet = await Wallet.findOne({ user: req.params.userId })
    if (!wallet) wallet = await Wallet.create({ user: req.params.userId })
    if (!wallet.isActive) return res.status(400).json({ success: false, message: 'Wallet is inactive.' })
    const balanceBefore     = wallet.balance
    wallet.balance          += parseFloat(amount)
    wallet.totalDeposited   += parseFloat(amount)
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

// ─── تعديل يدوي من الأدمن (زيادة أو نقص) ─────
router.post('/wallets/:userId/adjust', async (req, res) => {
  try {
    const { amount, note } = req.body
    // amount يمكن أن يكون موجباً (زيادة) أو سالباً (نقص)
    if (amount === undefined || amount === null || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' })
    }
    let wallet = await Wallet.findOne({ user: req.params.userId })
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found.' })
    if (!wallet.isActive) return res.status(400).json({ success: false, message: 'Wallet is inactive.' })

    const newBalance = wallet.balance + parseFloat(amount)
    if (newBalance < 0) {
      return res.status(400).json({ success: false, message: 'الرصيد لا يمكن أن يكون سالباً.' })
    }

    const balanceBefore = wallet.balance
    wallet.balance = newBalance
    if (parseFloat(amount) > 0) wallet.totalDeposited += parseFloat(amount)
    else wallet.totalWithdrawn += Math.abs(parseFloat(amount))
    await wallet.save()

    await Transaction.create({
      user: req.params.userId, wallet: wallet._id, type: 'admin_adjust',
      amount: Math.abs(parseFloat(amount)), balanceBefore, balanceAfter: wallet.balance,
      status: 'completed', performedBy: `admin:${req.user.email}`,
      note: note || `Admin adjust: ${amount > 0 ? '+' : ''}${amount} USDT`
    })

    res.json({ success: true, message: 'تم تعديل الرصيد بنجاح.', balance: wallet.balance })
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

// ─── Deposit Admin Routes ──────────────────────
const Deposit = require('../models/Deposit')

router.get('/deposits', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [deposits, total] = await Promise.all([
      Deposit.find(filter)
        .populate('user', 'name email')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Deposit.countDocuments(filter)
    ])
    res.json({ success: true, deposits, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── موافقة الأدمن → يضيف الرصيد على balance ──
router.post('/deposits/:id/approve', async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id).populate('user', 'name email')
    if (!deposit)                    return res.status(404).json({ success: false, message: 'طلب الإيداع غير موجود.' })
    if (deposit.status !== 'pending') return res.status(400).json({ success: false, message: 'هذا الطلب تمت معالجته مسبقاً.' })

    deposit.status      = 'approved'
    deposit.processedBy = req.user._id
    deposit.processedAt = new Date()
    await deposit.save()

    // ─── إضافة الرصيد على balance (USDT) ─────
    let wallet = await Wallet.findOne({ user: deposit.user._id })
    if (!wallet) wallet = await Wallet.create({ user: deposit.user._id })

    const balanceBefore     = wallet.balance
    wallet.balance          += deposit.amount
    wallet.totalDeposited   += deposit.amount
    await wallet.save()

    await Transaction.create({
      user: deposit.user._id, wallet: wallet._id, type: 'deposit',
      amount: deposit.amount, balanceBefore, balanceAfter: wallet.balance,
      status: 'completed', performedBy: `admin:${req.user.email}`,
      note: `USDT deposit approved — TXID: ${deposit.txid}`
    })

    res.json({
      success: true,
      message: `تمت الموافقة. تم إضافة ${deposit.amount} USDT للمستخدم.`,
      deposit,
      balance: wallet.balance
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.post('/deposits/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason || !reason.trim()) return res.status(400).json({ success: false, message: 'يرجى إدخال سبب الرفض.' })
    const deposit = await Deposit.findById(req.params.id)
    if (!deposit)                    return res.status(404).json({ success: false, message: 'طلب الإيداع غير موجود.' })
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

// ─── POST /api/admin/telegram/set-webhook ─────
// تسجيل Telegram Webhook يدوياً (مرة واحدة بعد النشر)
router.post('/telegram/set-webhook', async (req, res) => {
  try {
    const backendUrl = req.body.backendUrl || process.env.BACKEND_URL
    if (!backendUrl) {
      return res.status(400).json({ success: false, message: 'أرسل backendUrl في الـ body أو اضبط BACKEND_URL في .env' })
    }
    const s = await Setting.getSingleton()
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN
    if (!token) return res.status(400).json({ success: false, message: 'Telegram bot token غير مضبوط' })

    const axios = require('axios')
    const webhookUrl = `${backendUrl}/api/telegram/webhook`
    const result = await axios.post(
      `https://api.telegram.org/bot${token}/setWebhook`,
      { url: webhookUrl, drop_pending_updates: false }
    )
    res.json({ success: result.data.ok, webhookUrl, telegram: result.data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─── GET /api/admin/telegram/webhook-info ─────
// عرض معلومات الـ Webhook الحالي
router.get('/telegram/webhook-info', async (req, res) => {
  try {
    const s = await Setting.getSingleton()
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN
    if (!token) return res.status(400).json({ success: false, message: 'Token غير مضبوط' })
    const axios = require('axios')
    const result = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`)
    res.json({ success: true, webhook: result.data.result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ─── POST /api/admin/telegram/register-webhook ───────────────
// يسجّل الـ Webhook في تليجرام يدوياً من لوحة التحكم
router.post('/telegram/register-webhook', async (req, res) => {
  try {
    const { backendUrl } = req.body;
    const s     = await Setting.getSingleton();
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return res.status(400).json({ success: false, message: 'لم يتم إعداد Bot Token. أضفه في الإعدادات أولاً.' });
    }

    // استخدم الـ URL المُرسَل من الفرونت، أو BACKEND_URL من .env
    const base = (backendUrl || process.env.BACKEND_URL || '').replace(/\/$/, '');
    if (!base) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رابط السيرفر (BACKEND_URL).' });
    }

    const webhookUrl = `${base}/api/telegram/webhook`;
    const axios = require('axios');

    const response = await axios.post(
      `https://api.telegram.org/bot${token}/setWebhook`,
      { url: webhookUrl, drop_pending_updates: true }
    );

    if (response.data.ok) {
      return res.json({ success: true, message: `✅ تم تسجيل Webhook بنجاح: ${webhookUrl}`, webhookUrl });
    } else {
      return res.status(400).json({ success: false, message: response.data.description || 'فشل التسجيل' });
    }
  } catch (err) {
    console.error('register-webhook error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/telegram/webhook-info ────────────────────
// يعرض معلومات الـ Webhook المسجَّل حالياً
router.get('/telegram/webhook-info', async (req, res) => {
  try {
    const s     = await Setting.getSingleton();
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.json({ success: false, message: 'Bot Token غير مُعدّ' });

    const axios = require('axios');
    const response = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    res.json({ success: true, info: response.data.result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;