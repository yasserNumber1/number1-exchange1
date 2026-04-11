// services/liquidity.js
const Rate = require('../models/Rate')

const ORDER_TYPE_CURRENCIES = {
  EGP_TO_USDT:           { currencySent: 'EGP',  currencyRecv: 'USDT' },
  EGP_TO_MONEYGO:        { currencySent: 'EGP',  currencyRecv: 'MGO'  },
  USDT_TO_MONEYGO:       { currencySent: 'USDT', currencyRecv: 'MGO'  },
  USDT_TO_WALLET:        { currencySent: 'USDT', currencyRecv: null   }, // داخلي فقط — لا تغيير سيولة
  WALLET_TO_USDT:        { currencySent: null,   currencyRecv: 'USDT' }, // نرسل USDT للعميل
  WALLET_TO_MONEYGO:     { currencySent: null,   currencyRecv: 'MGO'  }, // نرسل MGO للعميل
  MONEYGO_TO_USDT:       { currencySent: 'MGO',  currencyRecv: 'USDT' },
  MONEYGO_TO_WALLET:     { currencySent: 'MGO',  currencyRecv: null   }, // داخلي فقط
  EGP_WALLET_TO_MONEYGO: { currencySent: 'EGP',  currencyRecv: 'MGO'  },
}

function getCurrenciesForOrder(order) {
  const ot = order.orderType || ''
  const mapped = ORDER_TYPE_CURRENCIES[ot]
  if (mapped) return mapped

  const currencySent = order.payment?.currencySent || 'USDT'
  console.warn(
    `[Liquidity] Unknown orderType "${ot}" for order ${order.orderNumber}. ` +
    `Falling back to currencySent=${currencySent}, currencyRecv=USDT. ` +
    `Add this type to ORDER_TYPE_CURRENCIES.`
  )
  return { currencySent, currencyRecv: 'USDT' }
}

async function applyLiquidity(order) {
  try {
    const { currencySent, currencyRecv } = getCurrenciesForOrder(order)

    // amountSent = ما أرسله العميل لنا
    const amountSent = parseFloat(order.payment?.amountSent) || 0

    // amountRecv = ما أرسلناه نحن للعميل
    // نحاول نقرأ من أكثر من حقل حسب نوع الطلب
    const amountRecv =
      parseFloat(order.moneygo?.amountUSD) ||
      parseFloat(order.exchangeRate?.finalAmountUSD) ||
      parseFloat(order.payment?.amountReceived) ||
      0

    // لو currencySent أو currencyRecv = null، معناه عملية داخلية لا تؤثر على السيولة الخارجية
    const effectiveSent = currencySent ? amountSent : 0
    const effectiveRecv = currencyRecv ? amountRecv : 0

    if (effectiveSent <= 0 && effectiveRecv <= 0) {
      console.log(`[Liquidity] Order ${order.orderNumber} (${order.orderType}): no external liquidity change needed.`)
      return true
    }

    // نبني inc object يدوياً لدعم null
    const inc = {}

    if (currencySent === 'EGP'  && effectiveSent > 0) inc.availableEgp  = (inc.availableEgp  || 0) + effectiveSent
    if (currencySent === 'USDT' && effectiveSent > 0) inc.availableUsdt = (inc.availableUsdt || 0) + effectiveSent
    if (currencySent === 'MGO'  && effectiveSent > 0) inc.availableMgo  = (inc.availableMgo  || 0) + effectiveSent

    if (currencyRecv === 'EGP'  && effectiveRecv > 0) inc.availableEgp  = (inc.availableEgp  || 0) - effectiveRecv
    if (currencyRecv === 'USDT' && effectiveRecv > 0) inc.availableUsdt = (inc.availableUsdt || 0) - effectiveRecv
    if (currencyRecv === 'MGO'  && effectiveRecv > 0) inc.availableMgo  = (inc.availableMgo  || 0) - effectiveRecv

    if (Object.keys(inc).length === 0) {
      console.log(`[Liquidity] Order ${order.orderNumber}: inc is empty, skipping DB update.`)
      return true
    }

    await Rate.findOneAndUpdate({}, { $inc: inc }, { new: true })

    console.log(
      `[Liquidity] ✅ Order ${order.orderNumber} (${order.orderType}):`,
      currencySent ? `+${effectiveSent} ${currencySent}` : '',
      currencyRecv ? `-${effectiveRecv} ${currencyRecv}` : '',
      '| DB inc:', inc
    )
    return true
  } catch (err) {
    console.error(`[Liquidity] ❌ Failed for order ${order.orderNumber}:`, err.message)
    return false
  }
}

module.exports = { applyLiquidity, getCurrenciesForOrder, ORDER_TYPE_CURRENCIES }