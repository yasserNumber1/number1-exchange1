// routes/public.js
// ═══════════════════════════════════════════════
// Routes عامة — بدون authentication
// للمستخدمين العاديين (ExchangeForm, etc.)
// ═══════════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const Rate    = require('../models/Rate');
const mongoose = require('mongoose')

// ─── GET /api/public/rates ────────────────────
// جلب الأسعار الحالية للمستخدمين
router.get('/rates', async (req, res) => {
  try {
    const Rate = require('../models/Rate');
    const doc  = await Rate.getSingleton();
 
    // نرجع فقط الأزواج المفعّلة
    const pairs = doc.pairs
      .filter(p => p.enabled)
      .map(p => ({
        from:     p.from,
        to:       p.to,
        buyRate:  p.buyRate,
        sellRate: p.sellRate,
        label:    p.label,
      }));
 
    // للتوافق مع الكود القديم — نرجع أيضاً الحقول الفردية
    const find = (from, to) => pairs.find(p => p.from === from && p.to === to);
 
    const vodafone = find('EGP_VODAFONE', 'USDT');
    const instapay = find('EGP_INSTAPAY', 'USDT');
    const fawry    = find('EGP_FAWRY',    'USDT');
    const orange   = find('EGP_ORANGE',   'USDT');
    const mgo      = find('USDT',         'MGO');
 
    res.json({
      success:  true,
      pairs,
      // حقول للتوافق مع الكود القديم
      usdtBuyRate:     vodafone?.buyRate  || 50,
      usdtSellRate:    vodafone?.sellRate || 49,
      moneygoRate:     mgo?.sellRate      || 1,
      moneygoSellRate: mgo?.buyRate       || 1,
      vodafoneBuyRate: vodafone?.buyRate  || 50,
      instaPayRate:    instapay?.buyRate  || 50,
      fawryRate:       fawry?.buyRate     || 50,
      orangeRate:      orange?.buyRate    || 50,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error('Public rates error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});
 
// ─── GET /api/public/rates/convert ───────────
// ?from=EGP_VODAFONE&to=USDT&type=buy&amount=100
router.get('/rates/convert', async (req, res) => {
  try {
    const Rate  = require('../models/Rate');
    const { from, to, type = 'buy', amount } = req.query;
 
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, message: 'from, to, amount مطلوبة.' });
    }
 
    const { rate, result } = await Rate.convert(from, to, parseFloat(amount), type);
    res.json({ success: true, from, to, type, amount: parseFloat(amount), rate, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── GET /api/public/payment-methods ──────────
router.get('/payment-methods', async (req, res) => {
  try {
    const PaymentMethod = mongoose.model('PaymentMethod')
    let doc = await PaymentMethod.findOne()
    if (!doc) return res.json({ success: true, cryptos: [], wallets: [] })

    // فقط المفعّلة والمكتملة
    const cryptos = (doc.cryptos || []).filter(c => c.enabled && c.address)
    const wallets = (doc.wallets || []).filter(w => w.enabled && w.number)

    res.json({ success: true, cryptos, wallets })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/public/wallet-deposit-addresses ─
// عناوين إيداع المحفظة (منفصلة عن وسائل الدفع)
router.get('/wallet-deposit-addresses', async (req, res) => {
  try {
    const WalletDeposit = mongoose.model('WalletDeposit')
    let doc = await WalletDeposit.findOne()
    if (!doc) return res.json({ success: true, cryptos: [] })
    const cryptos = (doc.cryptos || []).filter(c => c.enabled && c.address)
    res.json({ success: true, cryptos })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/public/deposit-info ─────────────
// معلومات الإيداع للمستخدمين
router.get('/deposit-info', async (req, res) => {
  try {
    const Setting = require('../models/Setting')
    const s = await Setting.getSingleton()
    res.json({
      success: true,
      bank: {
        bankName:      s.depositBankName      || '',
        accountName:   s.depositAccountName   || '',
        accountNumber: s.depositAccountNumber || '',
      },
      usdt: {
        address: s.depositUsdtAddress || '',
        network: s.depositUsdtNetwork || 'TRC20',
      },
      note: s.depositNote || '',
    })
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/public/settings ─────────────────
// إعدادات عامة للمستخدمين
router.get('/settings', async (req, res) => {
  try {
    const Setting = require('../models/Setting')
    const s = await Setting.getSingleton()
    res.json({
      success:          true,
      platformName:     s.platformName,
      platformActive:   s.platformActive,
      maintenanceMode:  s.maintenanceMode,
      contactTelegram:  s.contactTelegram,
      contactWhatsapp:  s.contactWhatsapp,
      contactEmail:     s.contactEmail,
      contactWebsite:   s.contactWebsite,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})
module.exports = router;