// ============================================
// routes/wallet.js — API المحفظة
// ============================================
const express     = require('express')
const router      = express.Router()
const Wallet      = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const Deposit     = require('../models/Deposit')
const Setting     = require('../models/Setting')
const { protect } = require('../middleware/auth')

// كل routes المحفظة تحتاج تسجيل دخول
router.use(protect)

// ─── مساعد: جلب أو إنشاء محفظة ──────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId })
  if (!wallet) {
    wallet = await Wallet.create({ user: userId })
  }
  return wallet
}

// ══════════════════════════════════════════════
// GET /api/wallet
// جلب رصيد المستخدم + آخر المعاملات
// ══════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id)

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      success: true,
      wallet: {
        _id:            wallet._id,
        walletId:       wallet.walletId,
        balance:        wallet.balance,
        currency:       wallet.currency,
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        isActive:       wallet.isActive,
        createdAt:      wallet.createdAt
      },
      transactions
    })

  } catch (error) {
    console.error('Get wallet error:', error)
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ══════════════════════════════════════════════
// GET /api/wallet/transactions
// كل المعاملات مع pagination
// ══════════════════════════════════════════════
router.get('/transactions', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ user: req.user._id })
    ])

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ══════════════════════════════════════════════
// GET /api/wallet/deposit-info
// جلب عنوان USDT للإيداع (من إعدادات الأدمن)
// ══════════════════════════════════════════════
router.get('/deposit-info', async (req, res) => {
  try {
    const settings = await Setting.getSingleton()
    res.json({
      success: true,
      depositInfo: {
        usdtAddress: settings.depositUsdtAddress || '',
        usdtNetwork: settings.depositUsdtNetwork || 'TRC20',
        note:        settings.depositNote        || ''
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ══════════════════════════════════════════════
// POST /api/wallet/deposit
// المستخدم يرسل طلب إيداع USDT (TXID فقط)
// ══════════════════════════════════════════════
router.post('/deposit', async (req, res) => {
  try {
    const { amount, txid } = req.body

    // ─── Validation ───────────────────────────
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'المبلغ غير صحيح.' })
    }
    if (!txid || !txid.trim()) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رقم المعاملة (TXID).' })
    }

    // ─── منع التكرار: نفس الـ TXID ────────────
    const existing = await Deposit.findOne({ txid: txid.trim() })
    if (existing) {
      return res.status(400).json({ success: false, message: 'هذا الـ TXID مستخدم مسبقاً.' })
    }

    // ─── إنشاء طلب الإيداع ────────────────────
    const deposit = await Deposit.create({
      user:   req.user._id,
      type:   'usdt',
      amount: Number(amount),
      txid:   txid.trim(),
    })

    // ─── إشعار التيليجرام ──────────────────────
    try {
      const telegramService = require('../services/telegram')
      await telegramService.notifyDepositRequest(deposit, req.user)
    } catch (tgErr) {
      console.warn('Telegram deposit notify error:', tgErr.message)
    }

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب الإيداع. سيتم مراجعته قريباً.',
      deposit
    })

  } catch (error) {
    console.error('Deposit request error:', error)
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ══════════════════════════════════════════════
// GET /api/wallet/deposits
// المستخدم يشوف طلبات الإيداع الخاصة به
// ══════════════════════════════════════════════
router.get('/deposits', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit

    const [deposits, total] = await Promise.all([
      Deposit.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Deposit.countDocuments({ user: req.user._id })
    ])

    res.json({
      success: true,
      deposits,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ══════════════════════════════════════════════
// POST /api/wallet/transfer-to-moneygo
// تحويل من رصيد المحفظة إلى MoneyGo
// ══════════════════════════════════════════════
router.post('/transfer-to-moneygo', async (req, res) => {
  try {
    const { amount, recipientId, recipientName } = req.body

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'المبلغ غير صحيح.' })
    }
    if (!recipientId || recipientId.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال معرف MoneyGo.' })
    }

    const wallet = await getOrCreateWallet(req.user._id)

    if (wallet.balance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: `رصيدك غير كافٍ. رصيدك الحالي: ${wallet.balance} USDT`
      })
    }

    // ─── خصم الرصيد فوراً ────────────────────
    const balanceBefore = wallet.balance
    wallet.balance      -= Number(amount)
    wallet.totalWithdrawn += Number(amount)
    await wallet.save()

    // ─── تسجيل المعاملة ──────────────────────
    await Transaction.create({
      user:          req.user._id,
      wallet:        wallet._id,
      type:          'exchange_debit',
      amount:        Number(amount),
      balanceBefore,
      balanceAfter:  wallet.balance,
      status:        'completed',
      performedBy:   'user',
      note:          `تحويل إلى MoneyGo: ${recipientId.trim()}`
    })

    // ─── إشعار التيليجرام ────────────────────
    try {
      const telegramService = require('../services/telegram')
      await telegramService.notifyWalletTransfer({
        amount:        Number(amount),
        recipientId:   recipientId.trim(),
        recipientName: recipientName || '',
        user:          req.user,
        newBalance:    wallet.balance
      })
    } catch (tgErr) {
      console.warn('Telegram wallet transfer notify error:', tgErr.message)
    }

    res.json({
      success:    true,
      message:    'تم إرسال طلب التحويل بنجاح. سيُرسَل المبلغ على MoneyGo قريباً.',
      newBalance: wallet.balance
    })

  } catch (error) {
    console.error('Wallet transfer error:', error)
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ══════════════════════════════════════════════
// GET /api/wallet/withdraw-info
// جلب بيانات التواصل للسحب (واتساب + تيليجرام)
// ══════════════════════════════════════════════
router.get('/withdraw-info', async (req, res) => {
  try {
    const settings = await Setting.getSingleton()
    res.json({
      success: true,
      withdrawInfo: {
        whatsapp: settings.whatsappEnabled !== false ? (settings.contactWhatsapp || '') : '',
        whatsappEnabled: settings.whatsappEnabled !== false,
        whatsappUnavailableMessageAr: settings.whatsappUnavailableMessageAr || 'متاح قريبًا',
        whatsappUnavailableMessageEn: settings.whatsappUnavailableMessageEn || 'Coming soon',
        telegram:  settings.contactTelegram  || '',
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

module.exports = router
