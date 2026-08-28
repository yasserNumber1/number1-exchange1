// services/balanceEngine.js
// ═══════════════════════════════════════════════════════════════
// Single source of truth for balance/liquidity updates.
// ═══════════════════════════════════════════════════════════════

const Rate = require('../models/Rate')

// ── Order type → currency mapping ─────────────────────────────
const ORDER_TYPE_CURRENCIES = {
  EGP_TO_USDT:           { currencySent: 'EGP',  currencyRecv: 'USDT' },
  EGP_TO_MONEYGO:        { currencySent: 'EGP',  currencyRecv: 'MGO'  },
  EGP_WALLET_TO_MONEYGO: { currencySent: 'EGP',  currencyRecv: 'MGO'  },
  USDT_TO_MONEYGO:       { currencySent: 'USDT', currencyRecv: 'MGO'  },
  USDT_TO_WALLET:        { currencySent: 'USDT', currencyRecv: null   },
  WALLET_TO_USDT:        { currencySent: null,   currencyRecv: 'USDT' },
  WALLET_TO_MONEYGO:     { currencySent: null,   currencyRecv: 'MGO'  },
  MONEYGO_TO_USDT:       { currencySent: 'MGO',  currencyRecv: 'USDT' },
  MONEYGO_TO_WALLET:     { currencySent: 'MGO',  currencyRecv: null   },
  USDT_TO_EGP:           { currencySent: 'USDT', currencyRecv: 'EGP'  },
  MONEYGO_TO_EGP:        { currencySent: 'MGO',  currencyRecv: 'EGP'  },
}

function getCurrencies(order) {
  const ot = order.orderType || ''
  const mapped = ORDER_TYPE_CURRENCIES[ot]
  if (mapped) return mapped
  const currencySent = order.payment?.currencySent || 'USDT'
  console.warn(`[BalanceEngine] Unknown orderType "${ot}" — fallback: ${currencySent} → USDT`)
  return { currencySent, currencyRecv: 'USDT' }
}



// ═══════════════════════════════════════════════════════════════
// processTransaction — updates availableEgp/Usdt/Mgo via $inc
// ═══════════════════════════════════════════════════════════════
async function processTransaction(order) {
  try {
    const { currencySent, currencyRecv } = getCurrencies(order)

    const amountSent = Math.round((parseFloat(order.payment?.amountSent) || 0) * 1e6) / 1e6
    const amountRecv = Math.round(
      (parseFloat(order.moneygo?.amountUSD) || parseFloat(order.exchangeRate?.finalAmountUSD) || 0) * 1e6
    ) / 1e6

    const effectiveSent = currencySent ? amountSent : 0
    const effectiveRecv = currencyRecv ? amountRecv : 0

    if (effectiveSent <= 0 && effectiveRecv <= 0) {
      console.log(`[BalanceEngine] ${order.orderNumber} (${order.orderType}): no liquidity change needed.`)
      return { success: true, inc: {} }
    }

    const inc = {}

    // Customer sends → platform gets it → balance UP
    if (currencySent === 'EGP'  && effectiveSent > 0) inc.availableEgp  = (inc.availableEgp  || 0) + effectiveSent
    if (currencySent === 'USDT' && effectiveSent > 0) inc.availableUsdt = (inc.availableUsdt || 0) + effectiveSent
    if (currencySent === 'MGO'  && effectiveSent > 0) inc.availableMgo  = (inc.availableMgo  || 0) + effectiveSent

    // Customer receives → platform pays it → balance DOWN
    if (currencyRecv === 'EGP'  && effectiveRecv > 0) inc.availableEgp  = (inc.availableEgp  || 0) - effectiveRecv
    if (currencyRecv === 'USDT' && effectiveRecv > 0) inc.availableUsdt = (inc.availableUsdt || 0) - effectiveRecv
    if (currencyRecv === 'MGO'  && effectiveRecv > 0) inc.availableMgo  = (inc.availableMgo  || 0) - effectiveRecv

    if (Object.keys(inc).length === 0) {
      console.log(`[BalanceEngine] ${order.orderNumber}: inc empty, skipping.`)
      return { success: true, inc: {} }
    }

    await Rate.findOneAndUpdate({}, { $inc: inc }, { new: true })

    console.log(
      `[BalanceEngine] ✅ ${order.orderNumber} (${order.orderType}) |`,
      currencySent ? `+${effectiveSent} ${currencySent}` : '',
      currencyRecv ? `-${effectiveRecv} ${currencyRecv}` : '',
      '| $inc:', JSON.stringify(inc)
    )

    return { success: true, inc }
  } catch (err) {
    console.error(`[BalanceEngine] ❌ processTransaction failed for ${order.orderNumber}:`, err.message)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// completeOrder — the main function called from everywhere
//   1. Mark order as completed + save
//   2. Update liquidity (Rate.$inc)
//   3. Credit wallet if USDT_TO_WALLET / MONEYGO_TO_WALLET
// ═══════════════════════════════════════════════════════════════
async function completeOrder(order, completedBy = 'system', note = '') {
  // Guard: already completed
  if (order.status === 'completed') {
    console.warn(`[BalanceEngine] Order ${order.orderNumber} already completed — skipping.`)
    return { success: false, error: 'already_completed' }
  }

  try {
    // ── Step 1: Update order status ──────────────
    order.status = 'completed'
    order.moneygo.transferStatus = 'sent'
    order.addTimeline(
      'completed',
      note || `🎉 تم إتمام الطلب بنجاح via ${completedBy}`,
      completedBy
    )
    await order.save()
    console.log(`[BalanceEngine] ✅ Step 1: Order ${order.orderNumber} status → completed`)

    // ── Step 2: Update liquidity ─────────────────
    // Ensure Rate doc exists and availableXxx fields are initialized before $inc
    try { await Rate.getSingleton() } catch (e) { console.warn('[BalanceEngine] Rate pre-init warning:', e.message) }

    // If liquidity was pre-reserved at creation, release it first so
    // processTransaction can apply the full transaction (both sides) cleanly.
    if (order.liquidityReserved) {
      await releaseLiquidity(order)
      order.liquidityReserved = false
      await order.save()
    }

    const balanceResult = await processTransaction(order)
    if (!balanceResult.success) {
      console.error(`[BalanceEngine] ⚠️ Step 2 failed for ${order.orderNumber}: ${balanceResult.error}`)
    } else {
      console.log(`[BalanceEngine] ✅ Step 2: Liquidity updated for ${order.orderNumber}`)
    }

    // ── Step 3: Credit wallet (if applicable) ────
    let walletResult = null
    if (order.orderType === 'USDT_TO_WALLET' || order.orderType === 'MONEYGO_TO_WALLET') {
      walletResult = await creditWallet(order)
      console.log(`[BalanceEngine] ✅ Step 3: Wallet credit for ${order.orderNumber}:`, walletResult)
    }

    // ── تسجيل الإتمام في AuditLog ────────────────
    try {
      const { logOrderEvent } = require('./auditService')
      await logOrderEvent(order, completedBy, note || `🎉 تم إتمام الطلب via ${completedBy}`)
    } catch (auditErr) {
      console.error('[BalanceEngine] AuditLog failed:', auditErr.message)
    }

    console.log(`[BalanceEngine] 🔥 Order ${order.orderNumber} completed by ${completedBy}`)
    return { success: true, order, walletResult }
  } catch (err) {
    console.error(`[BalanceEngine] ❌ completeOrder FAILED for ${order.orderNumber}:`, err.message, err.stack)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// creditWallet — credit user's internal wallet on completion
// ═══════════════════════════════════════════════════════════════
async function creditWallet(order) {
  try {
    const Wallet      = require('../models/Wallet')
    const Transaction = require('../models/Transaction')

    if (!order.user) return { success: false, reason: 'no_user_linked' }

    const alreadyCredited = await Transaction.findOne({
      order: order._id, type: 'deposit', status: 'completed'
    })
    if (alreadyCredited) return { success: false, reason: 'already_credited' }

    const amountToAdd = parseFloat(order.exchangeRate?.finalAmountUSD)
    if (!amountToAdd || amountToAdd <= 0) return { success: false, reason: 'invalid_amount' }

    let wallet = await Wallet.findOne({ user: order.user })
    if (!wallet) wallet = await Wallet.create({ user: order.user })
    if (!wallet.isActive) return { success: false, reason: 'wallet_inactive' }

    const balanceBefore = wallet.balance
    wallet.balance += amountToAdd
    wallet.totalDeposited += amountToAdd
    await wallet.save()

    await Transaction.create({
      user: order.user, wallet: wallet._id, type: 'deposit',
      amount: amountToAdd, balanceBefore, balanceAfter: wallet.balance,
      status: 'completed', performedBy: 'admin:telegram', order: order._id,
      note: `إيداع تلقائي — طلب ${order.orderNumber} — TXID: ${order.payment?.txHash || 'N/A'}`
    })

    console.log(`[BalanceEngine] 💰 Wallet +${amountToAdd} USDT → user ${order.user} | balance: ${wallet.balance}`)
    return { success: true, amountAdded: amountToAdd, newBalance: wallet.balance }
  } catch (err) {
    console.error(`[BalanceEngine] ❌ creditWallet failed:`, err.message)
    return { success: false, reason: err.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// reserveLiquidity — called at order CREATION
//   Immediately decreases the available outbound currency so
//   other clients see the updated limit right away.
// ═══════════════════════════════════════════════════════════════
async function reserveLiquidity(order) {
  try {
    const { currencyRecv } = getCurrencies(order)
    if (!currencyRecv) return false // no outbound (e.g., TO_WALLET types)

    const amountRecv = Math.round(
      (parseFloat(order.moneygo?.amountUSD) || parseFloat(order.exchangeRate?.finalAmountUSD) || 0) * 1e6
    ) / 1e6
    if (amountRecv <= 0) return false

    const inc = {}
    let balanceField = null
    if (currencyRecv === 'USDT') { inc.availableUsdt = -amountRecv; balanceField = 'availableUsdt' }
    if (currencyRecv === 'MGO')  { inc.availableMgo  = -amountRecv; balanceField = 'availableMgo' }
    if (currencyRecv === 'EGP')  { inc.availableEgp  = -amountRecv; balanceField = 'availableEgp' }
    if (!balanceField) return false

    try { await Rate.getSingleton() } catch (e) {}
    const reserved = await Rate.findOneAndUpdate(
      { [balanceField]: { $gte: amountRecv } },
      { $inc: inc },
    )
    if (!reserved) return false

    console.log(`[BalanceEngine] 🔒 Reserved ${amountRecv} ${currencyRecv} for order ${order.orderNumber}`)
    return true
  } catch (err) {
    console.error(`[BalanceEngine] ❌ reserveLiquidity failed for ${order.orderNumber}:`, err.message)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════
// releaseLiquidity — called at CANCEL / REJECT / EXPIRY
//   Restores the reserved amount back to available.
// ═══════════════════════════════════════════════════════════════
async function releaseLiquidity(order) {
  try {
    const { currencyRecv } = getCurrencies(order)
    if (!currencyRecv) return false

    const amountRecv = Math.round(
      (parseFloat(order.moneygo?.amountUSD) || parseFloat(order.exchangeRate?.finalAmountUSD) || 0) * 1e6
    ) / 1e6
    if (amountRecv <= 0) return false

    const inc = {}
    if (currencyRecv === 'USDT') inc.availableUsdt = +amountRecv
    if (currencyRecv === 'MGO')  inc.availableMgo  = +amountRecv
    if (currencyRecv === 'EGP')  inc.availableEgp  = +amountRecv

    await Rate.findOneAndUpdate({}, { $inc: inc })

    console.log(`[BalanceEngine] 🔓 Released ${amountRecv} ${currencyRecv} for order ${order.orderNumber}`)
    return true
  } catch (err) {
    console.error(`[BalanceEngine] ❌ releaseLiquidity failed for ${order.orderNumber}:`, err.message)
    return false
  }
}

// Read-only validation used before creating an internal-wallet order. The real
// deduction still performs its own atomic balance check to handle concurrency.
async function checkWalletBalance(order) {
  const Wallet = require('../models/Wallet')
  const userId = order.user?._id || order.user
  const amount = Math.round((parseFloat(order.payment?.amountSent) || 0) * 1e6) / 1e6

  if (!userId) return { success: false, reason: 'no_user_linked' }
  if (amount <= 0) return { success: false, reason: 'invalid_amount' }

  try {
    const wallet = await Wallet.findOne({ user: userId })
    if (!wallet) return { success: false, reason: 'wallet_not_found' }
    if (!wallet.isActive) return { success: false, reason: 'wallet_inactive' }
    if (wallet.balance < amount) {
      return { success: false, reason: 'insufficient_balance', balance: wallet.balance }
    }
    return { success: true, balance: wallet.balance }
  } catch (err) {
    console.error('[BalanceEngine] checkWalletBalance failed:', err.message)
    return { success: false, reason: err.message }
  }
}

// Atomically deduct an internal wallet once for a real order. The wallet update
// is compensated if the corresponding audit transaction cannot be persisted.
async function debitWallet(order) {
  const Wallet      = require('../models/Wallet')
  const Transaction = require('../models/Transaction')
  const userId      = order.user?._id || order.user
  const orderId     = order._id
  const amount      = Math.round((parseFloat(order.payment?.amountSent) || 0) * 1e6) / 1e6

  if (!userId) return { success: false, reason: 'no_user_linked' }
  if (!orderId) return { success: false, reason: 'order_required' }
  if (amount <= 0) return { success: false, reason: 'invalid_amount' }

  const idempotencyKey = `wallet-debit:${orderId}`

  try {
    const existingDebit = await Transaction.findOne({
      $or: [
        { idempotencyKey },
        { order: orderId, type: 'exchange_debit', status: 'completed' },
      ],
    })
    if (existingDebit) {
      return {
        success: true,
        alreadyDebited: true,
        amountDebited: existingDebit.amount,
        newBalance: existingDebit.balanceAfter,
      }
    }

    const wallet = await Wallet.findOneAndUpdate(
      { user: userId, isActive: true, balance: { $gte: amount } },
      { $inc: { balance: -amount, totalWithdrawn: amount } },
      { new: true },
    )

    if (!wallet) {
      const currentWallet = await Wallet.findOne({ user: userId })
      if (!currentWallet) return { success: false, reason: 'wallet_not_found' }
      if (!currentWallet.isActive) return { success: false, reason: 'wallet_inactive' }
      return {
        success: false,
        reason: 'insufficient_balance',
        balance: currentWallet.balance,
      }
    }

    const balanceAfter = wallet.balance
    const balanceBefore = balanceAfter + amount

    try {
      await Transaction.create({
        user: userId,
        wallet: wallet._id,
        type: 'exchange_debit',
        amount,
        balanceBefore,
        balanceAfter,
        status: 'completed',
        performedBy: 'system',
        order: orderId,
        idempotencyKey,
        note: `Automatic wallet debit - order ${order.orderNumber} (${order.orderType})`,
      })
    } catch (transactionErr) {
      await Wallet.updateOne(
        { _id: wallet._id },
        { $inc: { balance: amount, totalWithdrawn: -amount } },
      )

      if (transactionErr?.code === 11000) {
        const concurrentDebit = await Transaction.findOne({
          $or: [{ idempotencyKey }, { order: orderId, type: 'exchange_debit' }],
        })
        if (concurrentDebit) {
          return {
            success: true,
            alreadyDebited: true,
            amountDebited: concurrentDebit.amount,
            newBalance: concurrentDebit.balanceAfter,
          }
        }
      }

      throw transactionErr
    }

    console.log(`[BalanceEngine] Wallet -${amount} USDT -> user ${userId} | balance: ${balanceAfter}`)
    return { success: true, amountDebited: amount, newBalance: balanceAfter }
  } catch (err) {
    console.error('[BalanceEngine] debitWallet failed:', err.message)
    return { success: false, reason: err.message }
  }
}

// Return an internal-wallet debit once. A refund is allowed only when the order
// has a completed debit transaction, which prevents creating wallet funds.
async function refundWallet(order) {
  const Wallet      = require('../models/Wallet')
  const Transaction = require('../models/Transaction')
  const userId      = order.user?._id || order.user
  const orderId     = order._id
  const amount      = Math.round((parseFloat(order.payment?.amountSent) || 0) * 1e6) / 1e6

  if (!userId) return { success: false, reason: 'no_user_linked' }
  if (!orderId) return { success: false, reason: 'order_required' }
  if (amount <= 0) return { success: false, reason: 'invalid_amount' }

  const idempotencyKey = `wallet-refund:${orderId}`

  try {
    const alreadyRefunded = await Transaction.findOne({
      $or: [
        { idempotencyKey },
        { order: orderId, type: 'refund', status: 'completed' },
      ],
    })
    if (alreadyRefunded) {
      return {
        success: true,
        alreadyRefunded: true,
        amountRefunded: alreadyRefunded.amount,
        newBalance: alreadyRefunded.balanceAfter,
      }
    }

    const originalDebit = await Transaction.findOne({
      order: orderId,
      type: 'exchange_debit',
      status: 'completed',
    })
    if (!originalDebit) return { success: false, reason: 'debit_not_found' }

    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { balance: amount, totalWithdrawn: -amount } },
      { new: true },
    )
    if (!wallet) return { success: false, reason: 'wallet_not_found' }

    const balanceAfter = wallet.balance
    const balanceBefore = balanceAfter - amount

    try {
      await Transaction.create({
        user: userId,
        wallet: wallet._id,
        type: 'refund',
        amount,
        balanceBefore,
        balanceAfter,
        status: 'completed',
        performedBy: 'system',
        order: orderId,
        idempotencyKey,
        note: `Automatic wallet refund - order ${order.orderNumber} (${order.orderType})`,
      })
    } catch (transactionErr) {
      await Wallet.updateOne(
        { _id: wallet._id },
        { $inc: { balance: -amount, totalWithdrawn: amount } },
      )

      if (transactionErr?.code === 11000) {
        const concurrentRefund = await Transaction.findOne({
          $or: [{ idempotencyKey }, { order: orderId, type: 'refund' }],
        })
        if (concurrentRefund) {
          return {
            success: true,
            alreadyRefunded: true,
            amountRefunded: concurrentRefund.amount,
            newBalance: concurrentRefund.balanceAfter,
          }
        }
      }

      throw transactionErr
    }

    console.log(`[BalanceEngine] Wallet refund +${amount} USDT -> user ${userId} | balance: ${balanceAfter}`)
    return { success: true, amountRefunded: amount, newBalance: balanceAfter }
  } catch (err) {
    console.error('[BalanceEngine] refundWallet failed:', err.message)
    return { success: false, reason: err.message }
  }
}

module.exports = {
  processTransaction,
  completeOrder,
  reserveLiquidity,
  releaseLiquidity,
  checkWalletBalance,
  debitWallet,
  refundWallet,
  getCurrencies,
  ORDER_TYPE_CURRENCIES,
}
