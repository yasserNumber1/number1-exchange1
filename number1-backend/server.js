// ============================================
// server.js
// ============================================

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

// ─── App ──────────────────────────────────────
const app = express();

app.set('trust proxy', 1);

app.options('*', cors({ origin: '*', credentials: false }))
app.use(cors({ origin: '*', credentials: false }))

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/public/', publicLimiter);
app.use('/api/auth/',   strictLimiter);
app.use('/api/orders/', strictLimiter);
app.use('/api/admin/',  strictLimiter);

// ─── Database ─────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected — Number1DB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ─── Routes ───────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/public', require('./routes/public'));
app.use('/api/wallet', require('./routes/wallet'));

// ─── Balance Engine (central liquidity service) ──
const { completeOrder, processTransaction } = require('./services/balanceEngine');
const { logOrderEvent } = require('./services/auditService');

// ─── Telegram Webhook ─────────────────────────
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const { callback_query, message } = req.body;

    if (message && !callback_query) {
      if (message.from?.is_bot) return res.json({ ok: true });

      const replyToMessageId = message.reply_to_message?.message_id;
      const replyText = String(message.text || message.caption || '').trim();

      if (!replyToMessageId || !replyText) return res.json({ ok: true });

      const SupportChat = require('./models/SupportChat');
      const chat = await SupportChat.findOne({ telegramMessageIds: replyToMessageId });
      if (!chat) return res.json({ ok: true });

      chat.messages.push({ sender: 'admin', text: replyText, source: 'telegram' });
      chat.lastAdminAt = new Date();
      chat.status = 'open';
      await chat.save();

      const telegramService = require('./services/telegram');
      await telegramService.sendMessage(
        `<b>Support reply delivered</b>\nSession: <code>${chat.sessionId}</code>`,
        { reply_to_message_id: message.message_id }
      );

      return res.json({ ok: true });
    }

    if (!callback_query) return res.json({ ok: true });

    const { data, id: callbackQueryId, message: cbMessage } = callback_query;
    const telegramService = require('./services/telegram');

    const underscoreIndex = data.indexOf('_');
    if (underscoreIndex === -1) {
      await telegramService.answerCallbackQuery(callbackQueryId, '✅ تم التسجيل');
      return res.json({ ok: true });
    }

    const action  = data.substring(0, underscoreIndex);
    const orderId = data.substring(underscoreIndex + 1);

    // ── معالجة طلبات الإيداع ──────────────────
    if (action === 'dep-approve' || action === 'dep-reject') {
      const Deposit     = require('./models/Deposit')
      const Wallet      = require('./models/Wallet')
      const Transaction = require('./models/Transaction')

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        console.error(`[Deposit Webhook] Invalid ObjectId: "${orderId}"`)
        await telegramService.answerCallbackQuery(callbackQueryId, '❌ معرّف طلب غير صالح')
        return res.json({ ok: true })
      }

      try {
        const deposit = await Deposit.findById(orderId).populate('user', 'name email')
        if (!deposit) {
          await telegramService.answerCallbackQuery(callbackQueryId, '❌ الطلب غير موجود')
          return res.json({ ok: true })
        }
        if (deposit.status !== 'pending') {
          await telegramService.answerCallbackQuery(callbackQueryId, `⚠️ تم معالجة هذا الطلب مسبقاً (${deposit.status})`)
          return res.json({ ok: true })
        }

        if (action === 'dep-approve') {
          deposit.status      = 'approved'
          deposit.processedAt = new Date()
          await deposit.save()

          let wallet = await Wallet.findOne({ user: deposit.user })
          if (!wallet) wallet = await Wallet.create({ user: deposit.user })

          const balanceBefore    = wallet.balance
          wallet.balance        += deposit.amount
          wallet.totalDeposited += deposit.amount
          await wallet.save()

          await Transaction.create({
            user: deposit.user, wallet: wallet._id,
            type: 'deposit', amount: deposit.amount,
            balanceBefore, balanceAfter: wallet.balance,
            status: 'completed', performedBy: 'admin:telegram',
            note: `TXID: ${deposit.txid}`
          })

          await telegramService.answerCallbackQuery(callbackQueryId, `✅ تمت الموافقة — رصيد المحفظة: ${wallet.balance} USDT`)
          await telegramService.editDepositMessage(cbMessage?.message_id, deposit, 'approved')
        } else {
          deposit.status      = 'rejected'
          deposit.processedAt = new Date()
          await deposit.save()
          await telegramService.answerCallbackQuery(callbackQueryId, '❌ تم رفض طلب الإيداع')
          await telegramService.editDepositMessage(cbMessage?.message_id, deposit, 'rejected')
        }
      } catch (depErr) {
        console.error('[Deposit Webhook] Error:', depErr.message, depErr.stack)
        await telegramService.answerCallbackQuery(callbackQueryId, '⚠️ خطأ في معالجة الطلب، راجع السيرفر')
      }
      return res.json({ ok: true })
    }

    // ══════════════════════════════════════════════
    // ── معالجة طلبات التبادل ─────────────────────
    // ══════════════════════════════════════════════
    const Order = require('./models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      await telegramService.answerCallbackQuery(callbackQueryId, '❌ الطلب غير موجود');
      return res.json({ ok: true });
    }

    // ── Guard: already in a final status ──────────
    const finalStatuses = ['completed', 'rejected', 'cancelled'];
    if (finalStatuses.includes(order.status)) {
      await telegramService.answerCallbackQuery(
        callbackQueryId,
        `⚠️ الطلب ${order.status === 'completed' ? 'مكتمل' : order.status === 'rejected' ? 'مرفوض' : 'ملغي'} مسبقاً`
      );
      return res.json({ ok: true });
    }

    // ── Handle "complete" action — uses DB transaction via balanceEngine ──
    if (action === 'complete') {
      const result = await completeOrder(order, 'admin:telegram', '🎉 تم إتمام الطلب بنجاح via Telegram');

      if (!result.success) {
        await telegramService.answerCallbackQuery(
          callbackQueryId,
          result.error === 'already_completed'
            ? '⚠️ الطلب مكتمل مسبقاً'
            : `⚠️ فشل إتمام الطلب: ${result.error}`
        );
        return res.json({ ok: true });
      }

      // Build response message
      let responseMsg = '🎉 تم إتمام الطلب بنجاح';
      if (result.walletResult?.success) {
        responseMsg += `\n💰 تم إضافة ${result.walletResult.amountAdded} USDT للمحفظة`;
      } else if (result.walletResult && !result.walletResult.success) {
        const reasonMessages = {
          already_credited: '⚠️ تم الإيداع مسبقاً',
          no_user_linked:   '⚠️ الطلب غير مرتبط بمستخدم',
          wallet_inactive:  '⚠️ المحفظة غير نشطة',
          invalid_amount:   '⚠️ مبلغ غير صالح',
        };
        responseMsg += `\n${reasonMessages[result.walletResult.reason] || '⚠️ فشل الإيداع التلقائي'}`;
      }

      console.log('💰 Telegram Balance Update:', {
        order:      order.orderNumber,
        send:       order.payment?.method,
        receive:    order.orderType,
        status:     'completed',
        walletResult: result.walletResult || null,
      });

      // Update Telegram message (single call, no duplicate)
      const msgId = cbMessage?.message_id;
      if (msgId) await telegramService.editOrderMessage(msgId, order, 'complete');
      await telegramService.answerCallbackQuery(callbackQueryId, responseMsg);
      await logOrderEvent(order, 'admin:telegram', '🎉 تم إتمام الطلب via Telegram');

      return res.json({ ok: true });
    }

    // ── Handle "approve" and "reject" actions (no balance change) ──
    const statusMap = {
      approve: { status: 'verified',  msg: '✅ تمت الموافقة — جاري المراجعة' },
      reject:  { status: 'rejected',  msg: '❌ تم رفض الطلب'                 },
    };

    const action_data = statusMap[action];
    if (!action_data) return res.json({ ok: true });

    const wasReserved = order.liquidityReserved;
    order.status = action_data.status;
    order.addTimeline(action_data.status, `${action_data.msg} via Telegram`, 'admin:telegram');
    if (action_data.status === 'rejected') {
      order.moneygo.transferStatus = 'failed';
      order.liquidityReserved = false;
    }
    await order.save();

    // إعادة السيولة المحجوزة عند الرفض
    if (wasReserved && action_data.status === 'rejected') {
      try {
        const { releaseLiquidity } = require('./services/balanceEngine');
        await releaseLiquidity(order);
      } catch (e) { console.error('releaseLiquidity on telegram reject failed:', e.message); }
    }

    await logOrderEvent(order, 'admin:telegram', `${action_data.msg} via Telegram`);

    // Update Telegram message (single call — fixed duplicate)
    const msgId = cbMessage?.message_id;
    if (msgId) await telegramService.editOrderMessage(msgId, order, action);
    await telegramService.answerCallbackQuery(callbackQueryId, action_data.msg);

    res.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.json({ ok: true });
  }
});

// ─── Audit Log Routes ─────────────────────────
app.use('/api/audit-logs', require('./routes/auditLogs'));

// ─── Admin Routes ─────────────────────────────
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Number1 Backend is running 🚀', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── 404 ──────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Number1 Server running on port ${PORT}`);

  // ─── Cron Job: تحويل الطلبات المنتهية إلى expired كل دقيقة ──
  setInterval(async () => {
    try {
      const Order = require('./models/Order');
      const { releaseLiquidity } = require('./services/balanceEngine');

      const expiredOrders = await Order.find({
        expiresAt: { $lt: new Date() },
        status: { $in: ['pending'] }
      });

      for (const expOrder of expiredOrders) {
        try {
          // أعد السيولة المحجوزة إن وجدت
          if (expOrder.liquidityReserved) {
            await releaseLiquidity(expOrder);
            expOrder.liquidityReserved = false;
          }
          expOrder.status = 'expired';
          await expOrder.save();
          await logOrderEvent(expOrder, 'system', 'انتهت صلاحية الطلب تلقائياً');
        } catch (e) { console.error('expire order error:', e.message); }
      }

      if (expiredOrders.length > 0) console.log(`🕐 Marked ${expiredOrders.length} orders as expired`);
    } catch (err) {
      console.error('Cleanup job error:', err.message);
    }
  }, 60 * 1000);

  if (process.env.BACKEND_URL) {
    try {
      const telegramService = require('./services/telegram')
      const Setting = require('./models/Setting')
      const s = await Setting.getSingleton()
      const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN
      if (token) {
        const webhookUrl = `${process.env.BACKEND_URL}/api/telegram/webhook`
        const axios = require('axios')
        const result = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, { url: webhookUrl, drop_pending_updates: false })
        if (result.data.ok) console.log(`✅ Telegram Webhook registered: ${webhookUrl}`)
        else console.warn('⚠️ Telegram Webhook registration failed:', result.data.description)
      }
    } catch (e) {
      console.warn('⚠️ Telegram Webhook auto-setup error:', e.message)
    }
  } else {
    console.warn('⚠️ BACKEND_URL not set — Telegram Webhook not auto-registered.')
  }
});
