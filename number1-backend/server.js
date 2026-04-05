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

// ─── CORS — يجب أن يكون أول شيء قبل كل شيء ──
app.options('*', cors({ origin: '*', credentials: false }))
app.use(cors({ origin: '*', credentials: false }))

// ─── Helmet — بعد CORS وبدون crossOriginResourcePolicy ──
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

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

// ─── Telegram Webhook ─────────────────────────
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const { callback_query } = req.body;
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

    if (action === 'dep-approve' || action === 'dep-reject') {
      const Deposit     = require('./models/Deposit')
      const Wallet      = require('./models/Wallet')
      const Transaction = require('./models/Transaction')
      const mongoose    = require('mongoose')

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
          await telegramService.answerCallbackQuery(
            callbackQueryId,
            `⚠️ تم معالجة هذا الطلب مسبقاً (${deposit.status})`
          )
          return res.json({ ok: true })
        }

        if (action === 'dep-approve') {
          deposit.status      = 'approved'
          deposit.processedAt = new Date()
          await deposit.save()

          let wallet = await Wallet.findOne({ user: deposit.user })
          if (!wallet) wallet = await Wallet.create({ user: deposit.user })

          const balanceBefore   = wallet.balance
          wallet.balance        += deposit.amount
          wallet.totalDeposited += deposit.amount
          await wallet.save()

          await Transaction.create({
            user:          deposit.user,
            wallet:        wallet._id,
            type:          'deposit',
            amount:        deposit.amount,
            balanceBefore,
            balanceAfter:  wallet.balance,
            status:        'completed',
            performedBy:   'admin:telegram',
            note:          `TXID: ${deposit.txid}`
          })

          await telegramService.answerCallbackQuery(
            callbackQueryId,
            `✅ تمت الموافقة — رصيد المحفظة: ${wallet.balance} USDT`
          )
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

    const Order = require('./models/Order');
    const order = await Order.findById(orderId);
    if (!order) {
      await telegramService.answerCallbackQuery(callbackQueryId, '❌ الطلب غير موجود');
      return res.json({ ok: true });
    }

    const finalStatuses = ['completed', 'rejected', 'cancelled'];
    if (finalStatuses.includes(order.status)) {
      await telegramService.answerCallbackQuery(
        callbackQueryId,
        `⚠️ الطلب ${order.status === 'completed' ? 'مكتمل' : order.status === 'rejected' ? 'مرفوض' : 'ملغي'} مسبقاً`
      );
      return res.json({ ok: true });
    }

    const statusMap = {
      approve:  { status: 'verified',  msg: '✅ تمت الموافقة — جاري المراجعة' },
      reject:   { status: 'rejected',  msg: '❌ تم رفض الطلب'                 },
      complete: { status: 'completed', msg: '🎉 تم إتمام الطلب بنجاح'          },
    };

    const action_data = statusMap[action];
    if (!action_data) return res.json({ ok: true });

    order.status = action_data.status;
    order.addTimeline(action_data.status, `${action_data.msg} via Telegram`, 'admin:telegram');

    if (action_data.status === 'completed') order.moneygo.transferStatus = 'sent';
    if (action_data.status === 'rejected')  order.moneygo.transferStatus = 'failed';

    await order.save();

    // ── الرد على الأدمن + تعديل الرسالة ────────
    await telegramService.answerCallbackQuery(callbackQueryId, action_data.msg);
    await telegramService.editOrderMessage(cbMessage?.message_id, order, action);

    res.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.json({ ok: true });
  }
});

// ─── Admin Routes ─────────────────────────────
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success:   true,
    message:   'Number1 Backend is running 🚀',
    version:   '1.0.0',
    timestamp: new Date().toISOString()
  });
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

  // ─── Cron Job: حذف الطلبات المنتهية كل دقيقة ──
  setInterval(async () => {
    try {
      const Order = require('./models/Order');
      const result = await Order.deleteMany({
        expiresAt: { $lt: new Date() },
        status:    { $in: ['pending'] }
      });
      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired pending orders`);
      }
    } catch (err) {
      console.error('Cleanup job error:', err.message);
    }
  }, 60 * 1000); // كل دقيقة

  if (process.env.BACKEND_URL) {
    try {
      const telegramService = require('./services/telegram')
      const Setting = require('./models/Setting')
      const s = await Setting.getSingleton()
      const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN

      if (token) {
        const webhookUrl = `${process.env.BACKEND_URL}/api/telegram/webhook`
        const axios = require('axios')
        const result = await axios.post(
          `https://api.telegram.org/bot${token}/setWebhook`,
          { url: webhookUrl, drop_pending_updates: false }
        )
        if (result.data.ok) {
          console.log(`✅ Telegram Webhook registered: ${webhookUrl}`)
        } else {
          console.warn('⚠️ Telegram Webhook registration failed:', result.data.description)
        }
      }
    } catch (e) {
      console.warn('⚠️ Telegram Webhook auto-setup error:', e.message)
    }
  } else {
    console.warn('⚠️ BACKEND_URL not set — Telegram Webhook not auto-registered.')
  }
});