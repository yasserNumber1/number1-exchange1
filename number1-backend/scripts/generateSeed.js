// scripts/generateSeed.js
// ═══════════════════════════════════════════════════════════
// سكريبت لتحويل Seed Phrase → Master Seed
// شغّله مرة واحدة فقط واحفظ الناتج في .env
//
// الاستخدام:
//   node scripts/generateSeed.js "word1 word2 word3 ... word12"
//
// ⚠️  لا تشارك الناتج مع أي أحد
// ⚠️  شغّله على جهازك المحلي فقط — ليس على السيرفر
// ═══════════════════════════════════════════════════════════
const bip39  = require('bip39')
const HDKey  = require('hdkey')
const TronWeb = require('tronweb')

const mnemonic = process.argv[2]

if (!mnemonic) {
  console.error('❌ أدخل الـ Seed Phrase كـ argument:')
  console.error('   node scripts/generateSeed.js "word1 word2 ... word12"')
  process.exit(1)
}

if (!bip39.validateMnemonic(mnemonic)) {
  console.error('❌ الـ Seed Phrase غير صحيح — تحقق من الكلمات')
  process.exit(1)
}

const masterSeed = bip39.mnemonicToSeedSync(mnemonic).toString('hex')

// تحقق بعرض أول عنوان سيُشتق
const root    = HDKey.fromMasterSeed(Buffer.from(masterSeed, 'hex'))
const child   = root.derive("m/44'/195'/0'/0/0")
const tronWeb = new TronWeb({ fullHost: 'https://api.shasta.trongrid.io' })
const address = tronWeb.address.fromPrivateKey(child.privateKey.toString('hex'))

console.log('\n✅ ناجح! أضف هذا السطر في ملف .env:\n')
console.log(`HD_MASTER_SEED=${masterSeed}`)
console.log('\n📍 أول عنوان سيُولَّد (للتحقق):')
console.log(`   العنوان [0]: ${address}`)
console.log('\n⚠️  احتفظ بالـ Seed Phrase في مكان آمن offline')
console.log('⚠️  لا ترفع الـ .env على GitHub أبداً\n')
