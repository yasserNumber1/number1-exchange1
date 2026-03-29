// ============================================
// server.js — نقطة الدخول الرئيسية
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ✅ FIX: Railway يستخدم proxy — لازم نخبر Express يثق فيه
app.set('trust proxy', 1);

// ─── Middleware ───────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
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

// ─── Database Connection ──────────────────────
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

// ⚠️ Telegram Webhook — قبل /api/admin عشان مش محتاج auth
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const { callback_query } = req.body;
    if (!callback_query) return res.json({ ok: true });

    const { data, id: callbackQueryId } = callback_query;
    const [action, orderId] = data.split('_');

    const Order           = require('./models/Order');
    const telegramService = require('./services/telegram');

    const order = await Order.findById(orderId);
    if (!order) {
      await telegramService.answerCallbackQuery(callbackQueryId, '❌ الطلب غير موجود');
      return res.json({ ok: true });
    }

    const statusMap = {
      approve:  { status: 'verified',  msg: '✅ تمت الموافقة' },
      reject:   { status: 'rejected',  msg: '❌ تم الرفض'     },
      complete: { status: 'completed', msg: '🎉 تم الإكمال'   },
    };

    const action_data = statusMap[action];
    if (!action_data) return res.json({ ok: true });

    order.status = action_data.status;
    order.addTimeline(action_data.status, `${action_data.msg} via Telegram`, 'admin:telegram');
    await order.save();

    await telegramService.answerCallbackQuery(callbackQueryId, action_data.msg);
    await telegramService.notifyOrderUpdate(order, action_data.status);

    res.json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.json({ ok: true }); // دائماً 200 للتليغرام
  }
});

app.use('/api/admin',  require('./routes/admin'));

// ─── Health Check ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Number1 Backend is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ──────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Number1 Server running on port ${PORT}`);
});

