const test = require('node:test')
const assert = require('node:assert/strict')

const telegramService = require('../services/telegram')

test('auto-accepted wallet-to-MoneyGo notification requests payout completion', async () => {
  const originalSendMessage = telegramService.sendMessage
  let captured

  telegramService.sendMessage = async (text, options) => {
    captured = { text, options }
    return { success: true, messageId: 123 }
  }

  try {
    const result = await telegramService.notifyNewOrder({
      _id: '507f1f77bcf86cd799439013',
      orderNumber: 'N1-00001',
      orderType: 'WALLET_TO_MONEYGO',
      status: 'processing',
      customerName: 'Customer',
      customerEmail: 'customer@example.com',
      payment: { method: 'WALLET', amountSent: 50, currencySent: 'USDT' },
      moneygo: { recipientPhone: 'U-123456' },
      exchangeRate: { appliedRate: 1, finalAmountUSD: 49.5 },
      createdAt: new Date('2026-08-28T10:00:00Z'),
    })

    assert.equal(result.success, true)
    assert.match(captured.text, /Automatically accepted/)
    assert.deepEqual(
      captured.options.reply_markup.inline_keyboard[0].map((button) => button.callback_data),
      [
        'complete_507f1f77bcf86cd799439013',
        'reject_507f1f77bcf86cd799439013',
      ],
    )
  } finally {
    telegramService.sendMessage = originalSendMessage
  }
})
