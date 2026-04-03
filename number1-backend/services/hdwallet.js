// services/hdwallet.js
// ═══════════════════════════════════════════════════
// خدمة HD Wallet لتوليد عناوين TRON فريدة لكل طلب
// المسار: m/44'/195'/0'/0/{index}  (معيار TRON BIP44)
// ═══════════════════════════════════════════════════
const bip39  = require('bip39')
const HDKey  = require('hdkey')
const TronWeb = require('tronweb')

const TRON_PATH = "m/44'/195'/0'/0"

// TronWeb instance للتحويل فقط (لا يحتاج private key هنا)
const tronWeb = new TronWeb({
  fullHost: process.env.TRONGRID_HOST || 'https://api.trongrid.io',
  headers: process.env.TRONGRID_API_KEY
    ? { 'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY }
    : {},
})

// ── اشتقاق عنوان من Master Seed + index ────────────
function deriveAddress(masterSeedHex, index) {
  if (!masterSeedHex) throw new Error('HD_MASTER_SEED غير موجود في .env')

  const root       = HDKey.fromMasterSeed(Buffer.from(masterSeedHex, 'hex'))
  const child      = root.derive(`${TRON_PATH}/${index}`)
  const privateKey = child.privateKey.toString('hex')
  const address    = tronWeb.address.fromPrivateKey(privateKey)

  return { index, address, privateKey }
}

// ── توليد عنوان جديد (للاستخدام في orders.js) ──────
function generateDepositAddress(index) {
  const seed = process.env.HD_MASTER_SEED
  return deriveAddress(seed, index)
}

// ── وقت انتهاء الصلاحية (30 دقيقة من الآن) ─────────
function depositExpiresAt(minutes = 30) {
  return new Date(Date.now() + minutes * 60 * 1000)
}

module.exports = { generateDepositAddress, deriveAddress, depositExpiresAt }
