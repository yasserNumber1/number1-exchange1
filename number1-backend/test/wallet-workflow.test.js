const test = require('node:test')
const assert = require('node:assert/strict')

const Wallet = require('../models/Wallet')
const Transaction = require('../models/Transaction')
const {
  checkWalletBalance,
  debitWallet,
  refundWallet,
} = require('../services/balanceEngine')

const originalWalletMethods = {
  findOne: Wallet.findOne,
  findOneAndUpdate: Wallet.findOneAndUpdate,
  updateOne: Wallet.updateOne,
}

const originalTransactionMethods = {
  findOne: Transaction.findOne,
  create: Transaction.create,
}

const order = {
  _id: '507f1f77bcf86cd799439013',
  user: '507f1f77bcf86cd799439011',
  orderNumber: 'N1-00001',
  orderType: 'WALLET_TO_MONEYGO',
  payment: { amountSent: 30 },
}

let walletState
let transactions

function matches(transaction, condition) {
  return Object.entries(condition).every(([key, value]) => {
    return String(transaction[key]) === String(value)
  })
}

test.beforeEach(() => {
  walletState = {
    _id: '507f1f77bcf86cd799439012',
    user: order.user,
    balance: 100,
    totalWithdrawn: 0,
    isActive: true,
  }
  transactions = []

  Wallet.findOne = async ({ user }) => {
    return String(user) === String(walletState.user) ? { ...walletState } : null
  }

  Wallet.findOneAndUpdate = async (filter, update) => {
    if (String(filter.user) !== String(walletState.user)) return null
    if (filter.isActive !== undefined && filter.isActive !== walletState.isActive) return null
    if (filter.balance?.$gte !== undefined && walletState.balance < filter.balance.$gte) return null

    walletState.balance += update.$inc?.balance || 0
    walletState.totalWithdrawn += update.$inc?.totalWithdrawn || 0
    return { ...walletState }
  }

  Wallet.updateOne = async (filter, update) => {
    if (String(filter._id) !== String(walletState._id)) return { modifiedCount: 0 }
    walletState.balance += update.$inc?.balance || 0
    walletState.totalWithdrawn += update.$inc?.totalWithdrawn || 0
    return { modifiedCount: 1 }
  }

  Transaction.findOne = async (query) => {
    if (query.$or) {
      return transactions.find((transaction) => {
        return query.$or.some((condition) => matches(transaction, condition))
      }) || null
    }
    return transactions.find((transaction) => matches(transaction, query)) || null
  }

  Transaction.create = async (data) => {
    transactions.push({ ...data })
    return { ...data }
  }
})

test.after(() => {
  Object.assign(Wallet, originalWalletMethods)
  Object.assign(Transaction, originalTransactionMethods)
})

test('balance check is read-only', async () => {
  const result = await checkWalletBalance(order)

  assert.equal(result.success, true)
  assert.equal(walletState.balance, 100)
  assert.equal(transactions.length, 0)
})

test('wallet debit is atomic and idempotent for an order', async () => {
  const first = await debitWallet(order)
  const second = await debitWallet(order)

  assert.equal(first.success, true)
  assert.equal(first.newBalance, 70)
  assert.equal(second.success, true)
  assert.equal(second.alreadyDebited, true)
  assert.equal(walletState.balance, 70)
  assert.equal(walletState.totalWithdrawn, 30)
  assert.equal(transactions.filter((item) => item.type === 'exchange_debit').length, 1)
})

test('insufficient wallet balance cannot create a debit', async () => {
  walletState.balance = 20

  const result = await debitWallet(order)

  assert.equal(result.success, false)
  assert.equal(result.reason, 'insufficient_balance')
  assert.equal(walletState.balance, 20)
  assert.equal(transactions.length, 0)
})

test('failed transaction logging compensates the wallet debit', async () => {
  Transaction.create = async () => {
    throw new Error('audit write failed')
  }

  const result = await debitWallet(order)

  assert.equal(result.success, false)
  assert.equal(walletState.balance, 100)
  assert.equal(walletState.totalWithdrawn, 0)
})

test('refund restores a recorded debit exactly once', async () => {
  await debitWallet(order)

  const first = await refundWallet(order)
  const second = await refundWallet(order)

  assert.equal(first.success, true)
  assert.equal(first.newBalance, 100)
  assert.equal(second.success, true)
  assert.equal(second.alreadyRefunded, true)
  assert.equal(walletState.balance, 100)
  assert.equal(walletState.totalWithdrawn, 0)
  assert.equal(transactions.filter((item) => item.type === 'refund').length, 1)
})

test('refund cannot create funds without a recorded debit', async () => {
  const result = await refundWallet(order)

  assert.equal(result.success, false)
  assert.equal(result.reason, 'debit_not_found')
  assert.equal(walletState.balance, 100)
  assert.equal(transactions.length, 0)
})

test('refund transaction is valid in the transaction schema', () => {
  const transaction = new Transaction({
    user: order.user,
    wallet: walletState._id,
    order: order._id,
    type: 'refund',
    amount: 30,
    balanceBefore: 70,
    balanceAfter: 100,
    idempotencyKey: `wallet-refund:${order._id}`,
  })

  assert.equal(transaction.validateSync(), undefined)
})
