// services/telegram.js
// ═══════════════════════════════════════════════
const axios = require('axios')

// ── جلب الإعدادات: DB أولاً ثم .env كـ fallback ──
const getConfig = async () => {
  try {
    const Setting = require('../models/Setting')
    const s = await Setting.getSingleton()
    return {
      token:  s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN,
      chatId: s.telegramChatId   || process.env.TELEGRAM_CHAT_ID,
    }
  } catch {
    return {
      token:  process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    }
  }
}

// ─── إرسال رسالة نصية ────────────────────────
exports.sendMessage = async (text, options = {}) => {
  try {
    const { token, chatId } = await getConfig()
    if (!token || !chatId) {
      console.warn('Telegram not configured')
      return { success: false, error: 'Not configured' }
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML', ...options }
    )
    return { success: true, messageId: response.data.result.message_id }
  } catch (error) {
    console.error('Telegram sendMessage error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

// ─── إرسال إشعار طلب جديد ────────────────────
exports.notifyNewOrder = async (order) => {
  const methodEmojis = {
    USDT_TRC20: '₮', VODAFONE_CASH: '📱', ORANGE_CASH: '🟠',
    FAWRY: '🏪', WE_PAY: '💳', MEEZA: '🏦', INSTAPAY: '⚡'
  }
  const methodLabels = {
    USDT_TRC20: 'USDT TRC20', VODAFONE_CASH: 'Vodafone Cash',
    ORANGE_CASH: 'Orange Cash', FAWRY: 'Fawry', WE_PAY: 'WE Pay',
    MEEZA: 'Meeza', INSTAPAY: 'InstaPay'
  }

  const emoji   = methodEmojis[order.payment.method] || '💸'
  const method  = methodLabels[order.payment.method]  || order.payment.method.replace(/_/g, ' ')
  const isUSDT  = order.payment.method === 'USDT_TRC20'

  // Format rate cleanly — avoid floating point garbage like 0.026500000000000003
  const rate    = parseFloat(order.exchangeRate.appliedRate)
  const rateStr = rate >= 1
    ? rate.toFixed(4).replace(/\.?0+$/, '')       // e.g. 37.74
    : rate.toPrecision(4).replace(/\.?0+$/, '')   // e.g. 0.02650

  // الـ label يعتمد على نوع الطلب (receive method) وليس على طريقة الدفع
  const isReceiveMoneyGo = order.orderType === 'USDT_TO_MONEYGO' || order.orderType === 'EGP_WALLET_TO_MONEYGO'
  const recipientLabel = isReceiveMoneyGo ? '🎯 معرّف MoneyGo للاستلام' : '🔑 عنوان USDT للاستلام'

  const text = `
🆕 <b>طلب جديد — Number1</b>
━━━━━━━━━━━━━━━━━━━
📋 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
📧 <b>الإيميل:</b> ${order.customerEmail}
${order.customerPhone ? `📞 <b>هاتف الإرسال:</b> <code>${order.customerPhone}</code>` : ''}
━━━━━━━━━━━━━━━━━━━
${emoji} <b>طريقة الدفع:</b> ${method}
💵 <b>المبلغ المُرسَل:</b> ${order.payment.amountSent} ${order.payment.currencySent}
${isUSDT && order.payment.txHash ? `🔗 <b>TX Hash:</b> <code>${order.payment.txHash}</code>` : ''}
💚 <b>المبلغ النهائي:</b> $${order.exchangeRate.finalAmountUSD} USD
📈 <b>السعر المُطبَّق:</b> ${rateStr} ${order.payment.currencySent}/USD
━━━━━━━━━━━━━━━━━━━
${recipientLabel}: <code>${order.moneygo.recipientPhone || '—'}</code>
⏰ ${new Date(order.createdAt).toLocaleString('ar-EG')}
  `.trim()

  const inline_keyboard = [
    [
      { text: '✅ موافقة',      callback_data: `approve_${order._id}`  },
      { text: '❌ رفض',         callback_data: `reject_${order._id}`   },
    ],
    [
      { text: '🎉 إتمام الطلب', callback_data: `complete_${order._id}` },
    ]
  ]

  return await exports.sendMessage(text, { reply_markup: { inline_keyboard } })
}

// ─── إشعار تحديث حالة الطلب ──────────────────
exports.notifyOrderUpdate = async (order, newStatus, note = '') => {
  const statusText = {
    verified:   '✅ تم التحقق من الدفع',
    processing: '⚙️ جاري المعالجة',
    completed:  '🎉 مكتمل — تم التحويل',
    rejected:   '❌ مرفوض',
    cancelled:  '🚫 ملغي'
  }

  const text = `
📊 <b>تحديث طلب — Number1</b>
━━━━━━━━━━━━
📋 <b>الطلب:</b> <code>${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
🔄 <b>الحالة:</b> ${statusText[newStatus] || newStatus}
${note ? `📝 <b>ملاحظة:</b> ${note}` : ''}
━━━━━━━━━━━━
⏰ ${new Date().toLocaleString('ar-EG')}
  `.trim()

  return await exports.sendMessage(text)
}

// ─── إرسال صورة إيصال ────────────────────────
exports.sendReceiptPhoto = async (photoUrl, caption = '') => {
  try {
    const { token, chatId } = await getConfig()
    if (!token || !chatId) return { success: false }

    const response = await axios.post(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' }
    )
    return { success: true, messageId: response.data.result.message_id }
  } catch (error) {
    console.error('Telegram sendPhoto error:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

// ─── الرد على callback_query ──────────────────
exports.answerCallbackQuery = async (callbackQueryId, text) => {
  try {
    const { token } = await getConfig()
    await axios.post(
      `https://api.telegram.org/bot${token}/answerCallbackQuery`,
      { callback_query_id: callbackQueryId, text, show_alert: false }
    )
  } catch (error) {
    console.error('answerCallbackQuery error:', error.message)
  }
}

// ─── إشعار طلب إيداع محفظة ───────────────────
exports.notifyDepositRequest = async (deposit, user) => {
  const text = `
💰 <b>طلب إيداع محفظة — Number1</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${user.name}
📧 <b>الإيميل:</b> ${user.email}
━━━━━━━━━━━━━━━━━━━
💵 <b>المبلغ:</b> <code>${deposit.amount}</code> USDT
🔗 <b>TXID:</b> <code>${deposit.txid}</code>
━━━━━━━━━━━━━━━━━━━
⏰ ${new Date().toLocaleString('ar-EG')}
  `.trim()

  const inline_keyboard = [
    [
      { text: '✅ قبول — إضافة للمحفظة', callback_data: `dep-approve_${deposit._id}` },
      { text: '❌ رفض',                   callback_data: `dep-reject_${deposit._id}`  }
    ]
  ]

  return await exports.sendMessage(text, { reply_markup: { inline_keyboard } })
}

// ─── إشعار تحويل من المحفظة إلى MoneyGo ──────
exports.notifyWalletTransfer = async ({ amount, recipientId, recipientName, user, newBalance }) => {
  const text = `
🔄 <b>طلب تحويل من المحفظة — Number1</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${user.name}
📧 <b>الإيميل:</b> ${user.email}
━━━━━━━━━━━━━━━━━━━
💵 <b>المبلغ:</b> <code>${amount}</code> USDT
🎯 <b>MoneyGo ID:</b> <code>${recipientId}</code>
${recipientName ? `👤 <b>اسم المستلم:</b> ${recipientName}` : ''}
━━━━━━━━━━━━━━━━━━━
💼 <b>الرصيد بعد الخصم:</b> ${newBalance} USDT
⏰ ${new Date().toLocaleString('ar-EG')}
  `.trim()

  const inline_keyboard = [
    [
      { text: '✅ تم الإرسال على MoneyGo', callback_data: 'transfer-done' },
      { text: '❌ رفض ورد الرصيد',          callback_data: 'transfer-done' }
    ]
  ]

  return await exports.sendMessage(text, { reply_markup: { inline_keyboard } })
}

// ─── تعديل رسالة موجودة ──────────────────────
exports.editMessage = async (messageId, newText) => {
  try {
    const { token, chatId } = await getConfig()
    await axios.post(
      `https://api.telegram.org/bot${token}/editMessageText`,
      { chat_id: chatId, message_id: messageId, text: newText, parse_mode: 'HTML' }
    )
  } catch (error) {
    console.error('editMessage error:', error.message)
  }
}

// ─── تحديث رسالة الطلب بعد قرار الأدمن ──────
exports.editOrderMessage = async (messageId, order, action) => {
  if (!messageId) return
  const stamps = {
    approve:  '✅ <b>تمت الموافقة</b> — الطلب قيد المراجعة',
    reject:   '❌ <b>تم الرفض</b> — تم إخطار العميل',
    complete: '🎉 <b>تم إتمام الطلب</b> — اكتملت العملية بنجاح',
    cancel:   '🚫 <b>تم الإلغاء من العميل</b>',
  }
  const stamp  = stamps[action] || `🔄 ${action}`
  const method = (order.payment?.method || '').replace(/_/g, ' ')
  try {
    const { token, chatId } = await getConfig()
    if (!token || !chatId) return
    const newText = `
📋 <b>طلب — Number1</b>
━━━━━━━━━━━━━━━━━━━
🔢 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
📧 <b>الإيميل:</b> ${order.customerEmail}
━━━━━━━━━━━━━━━━━━━
💳 <b>الدفع:</b> ${method}
💵 <b>المبلغ:</b> ${order.payment?.amountSent} ${order.payment?.currencySent}
💚 <b>النهائي:</b> $${order.exchangeRate?.finalAmountUSD} USD
━━━━━━━━━━━━━━━━━━━
${stamp}
⏰ ${new Date().toLocaleString('ar-EG')}
    `.trim()
    await axios.post(`https://api.telegram.org/bot${token}/editMessageText`, {
      chat_id: chatId, message_id: messageId,
      text: newText, parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [] }
    })
  } catch (e) {
    if (!e.response?.data?.description?.includes('message is not modified'))
      console.error('editOrderMessage error:', e.response?.data || e.message)
  }
}

// ─── إشعار إلغاء الطلب من العميل ─────────────
exports.notifyOrderCancelled = async (order, reason = '') => {
  const method = (order.payment?.method || '').replace(/_/g, ' ')
  const text = `
🚫 <b>إلغاء من العميل — Number1</b>
━━━━━━━━━━━━━━━━━━━
📋 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
📧 <b>الإيميل:</b> ${order.customerEmail}
${order.customerPhone ? `📞 <b>الهاتف:</b> <code>${order.customerPhone}</code>` : ''}
━━━━━━━━━━━━━━━━━━━
💳 <b>طريقة الدفع:</b> ${method}
💵 <b>المبلغ:</b> ${order.payment?.amountSent} ${order.payment?.currencySent}
💚 <b>كان سيستلم:</b> $${order.exchangeRate?.finalAmountUSD} USD
🎯 <b>معرّف الاستلام:</b> <code>${order.moneygo?.recipientPhone || '—'}</code>
━━━━━━━━━━━━━━━━━━━
${reason ? `📝 <b>سبب الإلغاء:</b> ${reason}\n` : ''}🚫 <b>قام العميل بإلغاء العملية</b>
⏰ ${new Date().toLocaleString('ar-EG')}
  `.trim()
  return await exports.sendMessage(text)
}

// ─── تحديث رسالة طلب الإيداع بعد القرار ─────
exports.editDepositMessage = async (messageId, deposit, status) => {
  if (!messageId) return

  try {
    const { token, chatId } = await getConfig()
    if (!token || !chatId) return

    const userName  = deposit.user?.name  || '—'
    const userEmail = deposit.user?.email || '—'

    const statusStamp = status === 'approved'
      ? `\n✅ <b>تمت الموافقة</b> — تم إضافة <b>${deposit.amount} USDT</b> للمحفظة`
      : `\n❌ <b>تم الرفض</b> — لم يُضَف أي رصيد`

    const newText = `
💰 <b>طلب إيداع محفظة — Number1</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>المستخدم:</b> ${userName}
📧 <b>الإيميل:</b> ${userEmail}
━━━━━━━━━━━━━━━━━━━
💵 <b>المبلغ:</b> <code>${deposit.amount}</code> USDT
🔗 <b>TXID:</b> <code>${deposit.txid}</code>
━━━━━━━━━━━━━━━━━━━${statusStamp}
⏰ ${new Date().toLocaleString('ar-EG')}
    `.trim()

    await axios.post(
      `https://api.telegram.org/bot${token}/editMessageText`,
      {
        chat_id:      chatId,
        message_id:   messageId,
        text:         newText,
        parse_mode:   'HTML',
        reply_markup: { inline_keyboard: [] },
      }
    )
  } catch (error) {
    if (!error.response?.data?.description?.includes('message is not modified')) {
      console.error('editDepositMessage error:', error.response?.data || error.message)
    }
  }
}