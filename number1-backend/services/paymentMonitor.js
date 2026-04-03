// services/paymentMonitor.js
// ═══════════════════════════════════════════════════════════
// مراقب المدفوعات — يعمل في الخلفية كل 30 ثانية
// يتحقق من عناوين USDT TRC20 الخاصة بالطلبات المعلقة
// عند اكتشاف دفع مطابق → يحدّث الطلب + يُشعر الأدمن
// ═══════════════════════════════════════════════════════════
const Order          = require('../models/Order')
const telegramService = require('./telegram')

// عقد USDT TRC20 على الشبكة الرئيسية
const USDT_CONTRACT_MAINNET = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const USDT_CONTRACT_TESTNET = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj' // Shasta
const USDT_CONTRACT = process.env.TRON_NETWORK === 'testnet'
  ? USDT_CONTRACT_TESTNET
  : USDT_CONTRACT_MAINNET

const TRONGRID_HOST = process.env.TRONGRID_HOST || 'https://api.trongrid.io'
const API_KEY       = process.env.TRONGRID_API_KEY || ''

// ── جلب معاملات TRC20 لعنوان معين ──────────────────
async function fetchTRC20Transactions(address) {
  const url = `${TRONGRID_HOST}/v1/accounts/${address}/transactions/trc20` +
    `?contract_address=${USDT_CONTRACT}&limit=10&only_confirmed=true`

  const res = await fetch(url, {
    headers: API_KEY ? { 'TRON-PRO-API-KEY': API_KEY } : {}
  })

  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

// ── فحص طلب واحد ───────────────────────────────────
async function checkOrder(order) {
  const { address, expiresAt } = order.depositAddress

  try {
    const txList = await fetchTRC20Transactions(address)

    for (const tx of txList) {
      // تجاهل المعاملات الصادرة
      if (tx.to.toLowerCase() !== address.toLowerCase()) continue

      // تحقق من أننا لم نعالج هذه المعاملة من قبل
      const alreadyUsed = await Order.findOne({ 'payment.txHash': tx.transaction_id })
      if (alreadyUsed) continue

      // المبلغ الفعلي (USDT له 6 decimals)
      const amountReceived = Number(tx.value) / 1_000_000

      // تحقق من المبلغ بهامش 1%
      const expected  = order.exchangeRate.finalAmountUSD
      const tolerance = expected * 0.01
      if (Math.abs(amountReceived - expected) > tolerance) {
        console.warn(
          `[Monitor] طلب ${order.orderNumber}: مبلغ غير متطابق` +
          ` | متوقع: ${expected} | وصل: ${amountReceived}`
        )
        continue
      }

      // ✅ دفع مطابق — حدّث الطلب
      await Order.findByIdAndUpdate(order._id, {
        status:                      'verified',
        'payment.txHash':            tx.transaction_id,
        'payment.usdtAmount':        amountReceived,
        'depositAddress.usedAt':     new Date(),
        'verification.isVerified':   true,
        'verification.verifiedAt':   new Date(),
        'verification.verificationMethod': 'auto',
        $push: {
          timeline: {
            status:    'verified',
            message:   `USDT تأكد تلقائياً | المبلغ: ${amountReceived} | TX: ${tx.transaction_id}`,
            by:        'system',
            timestamp: new Date(),
          }
        }
      })

      // إشعار الأدمن على Telegram
      const updatedOrder = await Order.findById(order._id)
      await telegramService.notifyOrderUpdate(
        updatedOrder,
        'verified',
        `✅ USDT وصل تلقائياً\nالمبلغ: ${amountReceived} USDT\nTX: ${tx.transaction_id}`
      )

      console.log(`[Monitor] ✅ طلب ${order.orderNumber} تأكد | ${amountReceived} USDT`)
      break
    }
  } catch (err) {
    console.error(`[Monitor] خطأ في فحص طلب ${order.orderNumber}:`, err.message)
  }
}

// ── الدورة الرئيسية — تفحص كل الطلبات المعلقة ─────
async function runCheck() {
  try {
    const pendingOrders = await Order.find({
      status:                      'pending',
      'payment.method':            'USDT_TRC20',
      'depositAddress.address':    { $exists: true, $ne: null },
      'depositAddress.expiresAt':  { $gt: new Date() },
      'depositAddress.usedAt':     null,
    })

    if (pendingOrders.length > 0) {
      console.log(`[Monitor] فحص ${pendingOrders.length} طلب معلق...`)
    }

    for (const order of pendingOrders) {
      await checkOrder(order)
    }
  } catch (err) {
    console.error('[Monitor] خطأ في الدورة الرئيسية:', err.message)
  }
}

// ── تشغيل المراقب ───────────────────────────────────
function startMonitor(intervalSeconds = 30) {
  console.log(`🔍 Payment Monitor شغّال — يفحص كل ${intervalSeconds} ثانية`)
  runCheck() // تشغيل فوري عند البدء
  setInterval(runCheck, intervalSeconds * 1000)
}

module.exports = { startMonitor }
