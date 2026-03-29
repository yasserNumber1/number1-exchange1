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
    const rates = await Rate.getSingleton();

    // نرجع فقط ما يحتاجه المستخدم
    res.json({
      success: true,
      usdtBuyRate:     rates.usdtBuyRate,
      usdtSellRate:    rates.usdtSellRate,
      moneygoRate:     rates.moneygoRate,
      vodafoneBuyRate: rates.vodafoneBuyRate,
      instaPayRate:    rates.instaPayRate,
      fawryRate:       rates.fawryRate,
      orangeRate:      rates.orangeRate,
      minOrderUsdt:    rates.minOrderUsdt,
      maxOrderUsdt:    rates.maxOrderUsdt,
      updatedAt:       rates.updatedAt,
    });
  } catch (error) {
    console.error('Public rates error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
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