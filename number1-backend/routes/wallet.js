// ============================================
// routes/wallet.js — API المحفظة + N1 Credit
// ============================================
const express     = require('express')
const router      = express.Router()
const Wallet      = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const Deposit     = require('../models/Deposit')
const { protect } = require('../middleware/auth')
const cloudinary  = require('../services/cloudinary')
const multer      = require('multer')

// إعداد multer للرفع في الذاكرة
const upload = multer({ storage: multer.memoryStorage() })

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
        _id:              wallet._id,
        balance:          wallet.balance,        // USDT (أدمن)
        n1Balance:        wallet.n1Balance,      // N1 Credit
        currency:         wallet.currency,
        totalDeposited:   wallet.totalDeposited,
        totalWithdrawn:   wallet.totalWithdrawn,
        totalN1Deposited: wallet.totalN1Deposited,
        totalN1Withdrawn: wallet.totalN1Withdrawn,
        isActive:         wallet.isActive,
        createdAt:        wallet.createdAt
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
// POST /api/wallet/deposit
// المستخدم يطلب إيداع N1 Credit
// ══════════════════════════════════════════════
router.post('/deposit', upload.single('receipt'), async (req, res) => {
  try {
    const { type, amount, currency, txid } = req.body

    // ─── Validation ───────────────────────────
    if (!type || !['bank_transfer', 'usdt'].includes(type)) {
      return res.status(400).json({ success: false, message: 'نوع الإيداع غير صحيح.' })
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'المبلغ غير صحيح.' })
    }
    if (!currency || !['EGP', 'USDT'].includes(currency)) {
      return res.status(400).json({ success: false, message: 'العملة غير صحيحة.' })
    }

    // bank_transfer يحتاج إيصال
    if (type === 'bank_transfer' && !req.file) {
      return res.status(400).json({ success: false, message: 'يرجى رفع إيصال التحويل.' })
    }

    // usdt يحتاج TXID
    if (type === 'usdt' && !txid) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رقم المعاملة (TXID).' })
    }

    let receiptUrl = null

    // ─── رفع الإيصال لـ Cloudinary ────────────
    if (type === 'bank_transfer' && req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64')
      const dataURI = `data:${req.file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'number1/deposits',
      })
      receiptUrl = result.secure_url
    }

    // ─── إنشاء طلب الإيداع ────────────────────
    const deposit = await Deposit.create({
      user:       req.user._id,
      type,
      amount:     Number(amount),
      currency,
      receiptUrl,
      txid:       txid || null,
    })

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
// POST /api/wallet/withdraw
// طلب سحب USDT من المستخدم (موجود — محسّن)
// ══════════════════════════════════════════════
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, note } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'المبلغ غير صحيح.' })
    }

    const wallet = await Wallet.findOne({ user: req.user._id })
    if (!wallet || !wallet.isActive) {
      return res.status(400).json({ success: false, message: 'المحفظة غير موجودة أو معطلة.' })
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: `رصيد غير كافٍ. رصيدك الحالي: ${wallet.balance} USDT`
      })
    }

    const balanceBefore   = wallet.balance
    wallet.balance        -= amount
    wallet.totalWithdrawn += amount
    await wallet.save()

    const transaction = await Transaction.create({
      user:          req.user._id,
      wallet:        wallet._id,
      type:          'withdraw',
      amount,
      balanceBefore,
      balanceAfter:  wallet.balance,
      status:        'completed',
      performedBy:   'user',
      note:          note || null
    })

    res.json({
      success: true,
      message: 'تم طلب السحب بنجاح.',
      balance: wallet.balance,
      transaction
    })

  } catch (error) {
    console.error('Withdraw error:', error)
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

module.exports = router