// routes/public.js
// ═══════════════════════════════════════════════
// Routes عامة — بدون authentication
// ═══════════════════════════════════════════════
const express  = require('express');
const router   = express.Router();
const Rate     = require('../models/Rate');
const mongoose = require('mongoose');

// ─── ExchangeMethods Model ────────────────────
const ExchangeMethods = mongoose.models.ExchangeMethods ||
  mongoose.model('ExchangeMethods', new mongoose.Schema({
    sendMethods:    { type: Array, default: [] },
    receiveMethods: { type: Array, default: [] },
  }, { timestamps: true }))

const DEFAULT_SEND    = ['vodafone','instapay','fawry','orange','usdt-trc','mgo-send','wallet-usdt']
const DEFAULT_RECEIVE = ['mgo-recv','usdt-recv','wallet-recv']

// ─── GET /api/public/rates ────────────────────
router.get('/rates', async (req, res) => {
  try {
    const doc  = await Rate.getSingleton();
    const pairs = doc.pairs
      .filter(p => p.enabled)
      .map(p => ({ from: p.from, to: p.to, buyRate: p.buyRate, sellRate: p.sellRate, label: p.label }));

    const find = (from, to) => pairs.find(p => p.from === from && p.to === to);
    const vodafone = find('EGP_VODAFONE', 'USDT');
    const instapay = find('EGP_INSTAPAY', 'USDT');
    const fawry    = find('EGP_FAWRY',    'USDT');
    const orange   = find('EGP_ORANGE',   'USDT');
    const mgo      = find('USDT',         'MGO');

    res.json({
      success: true,
      pairs,
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
router.get('/rates/convert', async (req, res) => {
  try {
    const { from, to, type = 'buy', amount } = req.query;
    if (!from || !to || !amount)
      return res.status(400).json({ success: false, message: 'from, to, amount مطلوبة.' });
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
    const cryptos = (doc.cryptos || []).filter(c => c.enabled && c.address)
    const wallets = (doc.wallets || []).filter(w => w.enabled && w.number)
    res.json({ success: true, cryptos, wallets })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/public/wallet-deposit-addresses ─
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
      usdt: { address: s.depositUsdtAddress || '', network: s.depositUsdtNetwork || 'TRC20' },
      note: s.depositNote || '',
    })
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/public/settings ─────────────────
router.get('/settings', async (req, res) => {
  try {
    const Setting = require('../models/Setting')
    const s = await Setting.getSingleton()
    res.json({
      success:         true,
      platformName:    s.platformName,
      platformActive:  s.platformActive,
      maintenanceMode: s.maintenanceMode,
      contactTelegram: s.contactTelegram,
      contactWhatsapp: s.contactWhatsapp,
      contactEmail:    s.contactEmail,
      contactWebsite:  s.contactWebsite,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── GET /api/public/exchange-methods ─────────
router.get('/exchange-methods', async (req, res) => {
  try {
    let doc = await ExchangeMethods.findOne()
    if (!doc) {
      return res.json({
        success:        true,
        sendMethods:    DEFAULT_SEND.map(id    => ({ id, enabled: true })),
        receiveMethods: DEFAULT_RECEIVE.map(id => ({ id, enabled: true })),
      })
    }
    res.json({ success: true, sendMethods: doc.sendMethods, receiveMethods: doc.receiveMethods })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
})

module.exports = router;