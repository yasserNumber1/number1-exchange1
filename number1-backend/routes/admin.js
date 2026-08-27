// ============================================
// routes/admin.js — لوحة الأدمن + Telegram Webhook
// ============================================
const Setting = require("../models/Setting");
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const telegramService = require("../services/telegram");
const Rate = require("../models/Rate");
const SupportChat = require("../models/SupportChat");
const mongoose = require("mongoose");
const { completeOrder, processTransaction } = require("../services/balanceEngine");
const { logOrderEvent } = require("../services/auditService");

const SECRET_MASK = "••••••••";

router.use(protect, adminOnly);

const serializeSupportMessage = (message) => ({
  id: String(message._id),
  sender: message.sender,
  text: message.text,
  source: message.source,
  createdAt: message.createdAt,
});

const serializeSupportChat = (chat, includeMessages = false) => {
  const messages = chat.messages || [];
  const lastMessage = messages[messages.length - 1] || null;
  const lastReadAt = chat.lastReadByAdminAt ? new Date(chat.lastReadByAdminAt) : null;
  const unreadCount = messages.filter((message) => (
    message.sender === "customer"
    && (!lastReadAt || new Date(message.createdAt) > lastReadAt)
  )).length;

  return {
    id: String(chat._id),
    sessionId: chat.sessionId,
    lang: chat.lang,
    page: chat.page,
    status: chat.status,
    unreadCount,
    messageCount: messages.length,
    lastMessage: lastMessage ? serializeSupportMessage(lastMessage) : null,
    lastCustomerAt: chat.lastCustomerAt,
    lastAdminAt: chat.lastAdminAt,
    lastReadByAdminAt: chat.lastReadByAdminAt,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    ...(includeMessages && { messages: messages.map(serializeSupportMessage) }),
  };
};

// ─── Support chat inbox ───────────────────────
router.get("/support-chats", async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const search = String(req.query.search || "").trim().slice(0, 120);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const filter = { "messages.source": { $ne: "contact-form" } };

    if (["open", "closed"].includes(status)) filter.status = status;
    if (search) filter.sessionId = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

    const [chats, total] = await Promise.all([
      SupportChat.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      SupportChat.countDocuments(filter),
    ]);

    res.json({
      success: true,
      chats: chats.map((chat) => serializeSupportChat(chat)),
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error("Support chat list error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/support-chats/:sessionId", async (req, res) => {
  try {
    const chat = await SupportChat.findOne({ sessionId: req.params.sessionId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat session not found." });
    res.json({ success: true, chat: serializeSupportChat(chat, true) });
  } catch (error) {
    console.error("Support chat load error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/support-chats/:sessionId/messages", async (req, res) => {
  try {
    const text = String(req.body?.message || "").trim();
    if (!text) return res.status(400).json({ success: false, message: "Message is required." });
    if (text.length > 1500) return res.status(400).json({ success: false, message: "Message is too long." });

    const chat = await SupportChat.findOne({ sessionId: req.params.sessionId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat session not found." });

    chat.messages.push({ sender: "admin", text, source: "admin-web" });
    chat.lastAdminAt = new Date();
    chat.lastReadByAdminAt = new Date();
    chat.status = "open";
    await chat.save();

    res.json({
      success: true,
      message: serializeSupportMessage(chat.messages[chat.messages.length - 1]),
      chat: serializeSupportChat(chat),
    });
  } catch (error) {
    console.error("Support chat reply error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.patch("/support-chats/:sessionId/read", async (req, res) => {
  try {
    const chat = await SupportChat.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { $set: { lastReadByAdminAt: new Date() } },
      { new: true },
    );
    if (!chat) return res.status(404).json({ success: false, message: "Chat session not found." });
    res.json({ success: true, chat: serializeSupportChat(chat) });
  } catch (error) {
    console.error("Support chat read error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.patch("/support-chats/:sessionId/status", async (req, res) => {
  try {
    const status = String(req.body?.status || "").trim();
    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid chat status." });
    }

    const chat = await SupportChat.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { $set: { status, lastReadByAdminAt: new Date() } },
      { new: true },
    );
    if (!chat) return res.status(404).json({ success: false, message: "Chat session not found." });
    res.json({ success: true, chat: serializeSupportChat(chat) });
  } catch (error) {
    console.error("Support chat status error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/admin/orders ────────────────────
router.get("/orders", async (req, res) => {
  try {
    const { status, orderType, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/admin/orders/:id ────────────────
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PUT /api/admin/orders/:id/status ─────────
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status, note, transferId } = req.body;
    const validStatuses = ["verifying","verified","processing","completed","rejected","cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    // ── "completed" uses the balanceEngine for atomic transaction ──
    if (status === "completed") {
      if (order.status === "completed") {
        return res.status(400).json({ success: false, message: "Order already completed." });
      }
      if (note) order.adminNote = note;
      if (transferId) order.moneygo.transferId = transferId;

      const result = await completeOrder(order, `admin:${req.user.email}`, note || 'Status updated to completed');
      if (!result.success) {
        return res.status(500).json({ success: false, message: `Failed to complete: ${result.error}` });
      }

      await telegramService.notifyOrderUpdate(order, status, note);
      await logOrderEvent(order, `admin:${req.user.email}`, note || 'تم إتمام الطلب');
      return res.json({
        success: true,
        message: "Order completed with balance update.",
        order: { orderNumber: order.orderNumber, status: order.status },
        walletResult: result.walletResult || null,
      });
    }

    // ── Non-completion status updates ─────────────
    const wasReserved = order.liquidityReserved
    order.status = status;
    if (note) order.adminNote = note;
    if (transferId) order.moneygo.transferId = transferId;
    if (status === "rejected" || status === "cancelled") {
      order.moneygo.transferStatus = "failed";
      order.liquidityReserved = false;
    }
    order.addTimeline(status, note || `Status updated to ${status}`, `admin:${req.user.email}`);
    await order.save();

    // إعادة السيولة المحجوزة عند الرفض أو الإلغاء
    if (wasReserved && (status === "rejected" || status === "cancelled")) {
      try {
        const { releaseLiquidity } = require("../services/balanceEngine");
        await releaseLiquidity(order);
      } catch (e) { console.error("releaseLiquidity on reject failed:", e.message); }
    }

    await logOrderEvent(order, `admin:${req.user.email}`, note || `تم تغيير الحالة إلى ${status}`);
    await telegramService.notifyOrderUpdate(order, status, note);
    res.json({
      success: true,
      message: "Order status updated.",
      order: { orderNumber: order.orderNumber, status: order.status },
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/admin/stats ─────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [totalOrders, pendingOrders, completedOrders, rejectedOrders, totalUsers, todayOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending","verifying","verified","processing"] } }),
      Order.countDocuments({ status: "completed" }),
      Order.countDocuments({ status: "rejected" }),
      User.countDocuments({ role: "user" }),
      Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    ]);
    const volumeResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalUSD: { $sum: "$exchangeRate.finalAmountUSD" } } },
    ]);
    res.json({
      success: true,
      stats: { totalOrders, pendingOrders, completedOrders, rejectedOrders, totalUsers, todayOrders, totalVolumeUSD: (volumeResult[0]?.totalUSD || 0).toFixed(2) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/admin/users ─────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, users: users.map((u) => u.toSafeObject()) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── POST /api/admin/telegram-webhook-internal ─
router.post("/telegram-webhook-internal", async (req, res) => {
  try {
    const { callback_query } = req.body;
    if (!callback_query) return res.json({ success: true });

    const { data, id: callbackQueryId, message } = callback_query;
    const underscoreIdx = data.indexOf("_");
    const action = data.substring(0, underscoreIdx);
    const orderId = data.substring(underscoreIdx + 1);

    const order = await Order.findById(orderId);
    if (!order) {
      await telegramService.answerCallbackQuery(callbackQueryId, "❌ الطلب غير موجود");
      return res.json({ success: true });
    }

    const allowedTransitions = {
      approve: ["pending","verifying"],
      reject:  ["pending","verifying"],
      complete: ["verified","processing"],
    };

    if (!allowedTransitions[action]?.includes(order.status)) {
      await telegramService.answerCallbackQuery(callbackQueryId, `⚠️ لا يمكن تنفيذ هذا الإجراء — الحالة الحالية: ${order.status}`);
      return res.json({ success: true });
    }

    // ── Handle "complete" via balanceEngine (atomic transaction) ──
    if (action === "complete") {
      const result = await completeOrder(order, 'admin:telegram', '🎉 تم إكمال الطلب via Telegram (internal)');

      if (!result.success) {
        await telegramService.answerCallbackQuery(
          callbackQueryId,
          result.error === 'already_completed'
            ? '⚠️ الطلب مكتمل مسبقاً'
            : `⚠️ فشل إتمام الطلب: ${result.error}`
        );
        return res.json({ success: true });
      }

      let message_text = '🎉 تم إكمال الطلب';
      if (result.walletResult?.success) {
        message_text += `\n💰 تم إضافة ${result.walletResult.amountAdded} USDT للمحفظة`;
      } else if (result.walletResult && !result.walletResult.success) {
        const reasonMessages = {
          already_credited: '⚠️ تم الإيداع مسبقاً',
          no_user_linked:   '⚠️ الطلب غير مرتبط بمستخدم',
          wallet_inactive:  '⚠️ المحفظة غير نشطة',
          invalid_amount:   '⚠️ مبلغ غير صالح',
        };
        message_text += `\n${reasonMessages[result.walletResult.reason] || '⚠️ فشل الإيداع التلقائي'}`;
      }

      console.log('💰 Internal Webhook Balance Update:', {
        order:   order.orderNumber,
        send:    order.payment?.method,
        receive: order.orderType,
        status:  'completed'
      });

      await telegramService.answerCallbackQuery(callbackQueryId, message_text);
      const msgId = order.telegramMessageId || message?.message_id;
      if (msgId) await telegramService.editOrderMessage(msgId, order, 'complete');

      try {
        const sseService = require("../services/sse");
        sseService.broadcast(order._id.toString(), { type: "STATUS_UPDATE", status: "completed", updatedAt: new Date() });
      } catch (sseErr) {
        console.warn("SSE broadcast failed:", sseErr.message);
      }

      return res.json({ success: true });
    }

    // ── Handle "approve" / "reject" (no balance change) ──
    let newStatus, message_text;
    switch (action) {
      case "approve": newStatus = "verified"; message_text = "✅ تم الموافقة على الطلب"; break;
      case "reject":  newStatus = "rejected"; message_text = "❌ تم رفض الطلب";          break;
      default: return res.json({ success: true });
    }

    const wasReserved = order.liquidityReserved;
    order.status = newStatus;
    if (newStatus === "rejected") {
      order.moneygo.transferStatus = "failed";
      order.liquidityReserved = false;
    }
    order.addTimeline(newStatus, `${message_text} via Telegram`, "admin:telegram");
    await order.save();

    // إعادة السيولة المحجوزة عند الرفض
    if (wasReserved && newStatus === "rejected") {
      try {
        const { releaseLiquidity } = require("../services/balanceEngine");
        await releaseLiquidity(order);
      } catch (e) { console.error("releaseLiquidity on internal reject failed:", e.message); }
    }

    await telegramService.answerCallbackQuery(callbackQueryId, message_text);
    const msgId = order.telegramMessageId || message?.message_id;
    if (msgId) await telegramService.editOrderMessage(msgId, order, action);

    try {
      const sseService = require("../services/sse");
      sseService.broadcast(order._id.toString(), { type: "STATUS_UPDATE", status: newStatus, updatedAt: new Date() });
    } catch (sseErr) {
      console.warn("SSE broadcast failed:", sseErr.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.json({ success: true });
  }
});

// ─── GET /api/admin/rates ─────────────────────
router.get("/rates", async (req, res) => {
  try {
    const doc = await Rate.getSingleton();
    res.json({
      success: true,
      pairs: doc.pairs,
      minEgp:  doc.minEgp  || 0,
      maxEgp:  doc.maxEgp  || 0,
      minUsdt: doc.minUsdt || doc.minOrderUsdt || 0,
      maxUsdt: doc.maxUsdt || doc.maxOrderUsdt || 0,
      minMgo:  doc.minMgo  || 0,
      maxMgo:  doc.maxMgo  || 0,
      availableEgp:  doc.availableEgp  ?? doc.maxEgp  ?? 0,
      availableUsdt: doc.availableUsdt ?? doc.maxUsdt ?? 0,
      availableMgo:  doc.availableMgo  ?? doc.maxMgo  ?? 0,
      minOrderUsdt: doc.minOrderUsdt || doc.minUsdt || 0,
      maxOrderUsdt: doc.maxOrderUsdt || doc.maxUsdt || 0,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PUT /api/admin/rates ─────────────────────
router.put("/rates", async (req, res) => {
  try {
    const { pairs, minEgp, maxEgp, minUsdt, maxUsdt, minMgo, maxMgo, minOrderUsdt, maxOrderUsdt, availableEgp, availableUsdt, availableMgo } = req.body;

    if (!Array.isArray(pairs))
      return res.status(400).json({ success: false, message: "pairs must be an array." });

    for (const p of pairs) {
      if (!p.from || !p.to)
        return res.status(400).json({ success: false, message: "كل زوج يجب أن يحتوي على from و to." });
      if (p.buyRate < 0 || p.sellRate < 0)
        return res.status(400).json({ success: false, message: "الأسعار لا يمكن أن تكون سالبة." });
    }

    const parsedMaxEgp  = parseFloat(maxEgp)  || 0;
    const parsedMaxUsdt = parseFloat(maxUsdt)  || parseFloat(maxOrderUsdt) || 0;
    const parsedMaxMgo  = parseFloat(maxMgo)   || 0;

    const updateData = {
      pairs, updatedBy: req.user.email,
      minEgp:  parseFloat(minEgp)  || 0, maxEgp:  parsedMaxEgp,
      minUsdt: parseFloat(minUsdt) || parseFloat(minOrderUsdt) || 0, maxUsdt: parsedMaxUsdt,
      minMgo:  parseFloat(minMgo)  || 0, maxMgo:  parsedMaxMgo,
      minOrderUsdt: parseFloat(minUsdt) || parseFloat(minOrderUsdt) || 0,
      maxOrderUsdt: parsedMaxUsdt,
      ...(availableEgp  !== undefined && { availableEgp:  parseFloat(availableEgp)  ?? parsedMaxEgp  }),
      ...(availableUsdt !== undefined && { availableUsdt: parseFloat(availableUsdt) ?? parsedMaxUsdt }),
      ...(availableMgo  !== undefined && { availableMgo:  parseFloat(availableMgo)  ?? parsedMaxMgo  }),
    };

    const doc = await Rate.findOneAndUpdate({}, { $set: updateData }, { new: true, upsert: true });
    res.json({ success: true, message: "تم حفظ الأسعار والسيولة.", pairs: doc.pairs });
  } catch (error) {
    console.error("Rates save error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/admin/settings ──────────────────
router.get("/settings", async (req, res) => {
  try {
    const settings = await Setting.getSingleton();
    const safe = settings.toObject();
    if (safe.smtpPassword)     safe.smtpPassword     = SECRET_MASK;
    if (safe.telegramBotToken) safe.telegramBotToken = SECRET_MASK;
    if (safe.resendApiKey)     safe.resendApiKey     = SECRET_MASK;
    res.json({ success: true, ...safe });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PUT /api/admin/settings ──────────────────
router.put("/settings", async (req, res) => {
  try {
    const allowed = [
      "platformName","platformActive","maintenanceMode","platformNameAr","platformNameEn","platformUrl",
      "platformEnabled","registrationEnabled","supportEmail","supportTelegram","contactTelegram",
      "contactWhatsapp","contactEmail","contactWebsite","telegramNotifications","emailNotifications",
      "telegramBotToken","telegramChatId","smtpHost","smtpPort","smtpEmail","smtpPassword",
      "resendApiKey","resendFromEmail",
      "minOrderUsdt","maxOrderUsdt","orderExpiryMins","minOrderUsd","maxOrderUsd","orderExpiryMinutes",
      "usdtOrdersEnabled","walletOrdersEnabled","bankTransferEnabled","maxDailyOrdersUser",
      "moneygoApiKey","moneygoApiUrl","cryptoApiKey","webhookUrl","environment","jwtRefreshEnabled",
      "twoFactorAdmin","auditLogEnabled","sessionExpireHours","maxLoginAttempts","ipBanMinutes",
      "maxConcurrentSessions","depositUsdtAddress","depositUsdtNetwork","depositNote",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (req.body[key] === SECRET_MASK) return;
        updates[key] = req.body[key];
      }
    });
    const settings = await Setting.findOneAndUpdate({}, { $set: updates }, { new: true, upsert: true });
    const safe = settings.toObject();
    if (safe.smtpPassword)     safe.smtpPassword     = SECRET_MASK;
    if (safe.telegramBotToken) safe.telegramBotToken = SECRET_MASK;
    if (safe.resendApiKey)     safe.resendApiKey     = SECRET_MASK;
    res.json({ success: true, message: "Settings saved.", ...safe });
  } catch (error) {
    console.error("Settings save error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Payment Methods ───────────────────────────
const PaymentMethod = require("../models/PaymentMethod");

router.get("/payment-methods", async (req, res) => {
  try {
    const doc = await PaymentMethod.getSingleton();
    res.json({ success: true, cryptos: doc.cryptos || [], wallets: doc.wallets || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.put("/payment-methods", async (req, res) => {
  try {
    const { cryptos, wallets } = req.body;
    const doc = await PaymentMethod.findOneAndUpdate(
      {}, { $set: { cryptos: cryptos || [], wallets: wallets || [] } }, { new: true, upsert: true },
    );
    res.json({ success: true, message: "Saved.", cryptos: doc.cryptos, wallets: doc.wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/wallet-deposit-addresses", async (req, res) => {
  try {
    const WalletDeposit = mongoose.model("WalletDeposit");
    let doc = await WalletDeposit.findOne();
    if (!doc) doc = await WalletDeposit.create({ cryptos: [] });
    res.json({ success: true, cryptos: doc.cryptos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.put("/wallet-deposit-addresses", async (req, res) => {
  try {
    const WalletDeposit = mongoose.model("WalletDeposit");
    const { cryptos } = req.body;
    const doc = await WalletDeposit.findOneAndUpdate(
      {}, { $set: { cryptos: cryptos || [] } }, { new: true, upsert: true },
    );
    res.json({ success: true, message: "Saved.", cryptos: doc.cryptos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PATCH /api/admin/users/:id/block ─────────
router.patch("/users/:id/block", async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.role === "admin") return res.status(400).json({ success: false, message: "Cannot block admin users." });
    user.isActive = !isBlocked;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: isBlocked ? "User blocked." : "User unblocked.", user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Wallet Admin Routes ───────────────────────
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

router.get("/wallets", async (req, res) => {
  try {
    const wallets = await Wallet.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/wallets/:userId", async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.params.userId }).populate("user", "name email");
    if (!wallet) {
      wallet = await Wallet.create({ user: req.params.userId });
      await wallet.populate("user", "name email");
    }
    const transactions = await Transaction.find({ user: req.params.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, wallet, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/wallets/:userId/deposit", async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount." });
    let wallet = await Wallet.findOne({ user: req.params.userId });
    if (!wallet) wallet = await Wallet.create({ user: req.params.userId });
    if (!wallet.isActive) return res.status(400).json({ success: false, message: "Wallet is inactive." });
    const balanceBefore = wallet.balance;
    wallet.balance += parseFloat(amount);
    wallet.totalDeposited += parseFloat(amount);
    await wallet.save();
    const transaction = await Transaction.create({
      user: req.params.userId, wallet: wallet._id, type: "deposit",
      amount: parseFloat(amount), balanceBefore, balanceAfter: wallet.balance,
      status: "completed", performedBy: `admin:${req.user.email}`, note: note || "Admin deposit",
    });
    res.json({ success: true, message: `تم إيداع ${amount} USDT بنجاح.`, balance: wallet.balance, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/wallets/:userId/adjust", async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (amount === undefined || amount === null || isNaN(amount))
      return res.status(400).json({ success: false, message: "Invalid amount." });
    let wallet = await Wallet.findOne({ user: req.params.userId });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found." });
    if (!wallet.isActive) return res.status(400).json({ success: false, message: "Wallet is inactive." });
    const newBalance = wallet.balance + parseFloat(amount);
    if (newBalance < 0) return res.status(400).json({ success: false, message: "الرصيد لا يمكن أن يكون سالباً." });
    const balanceBefore = wallet.balance;
    wallet.balance = newBalance;
    if (parseFloat(amount) > 0) wallet.totalDeposited += parseFloat(amount);
    else wallet.totalWithdrawn += Math.abs(parseFloat(amount));
    await wallet.save();
    await Transaction.create({
      user: req.params.userId, wallet: wallet._id, type: "admin_adjust",
      amount: Math.abs(parseFloat(amount)), balanceBefore, balanceAfter: wallet.balance,
      status: "completed", performedBy: `admin:${req.user.email}`,
      note: note || `Admin adjust: ${amount > 0 ? "+" : ""}${amount} USDT`,
    });
    res.json({ success: true, message: "تم تعديل الرصيد بنجاح.", balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.patch("/wallets/:userId/toggle", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.params.userId });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found." });
    wallet.isActive = !wallet.isActive;
    await wallet.save();
    res.json({ success: true, message: wallet.isActive ? "Wallet activated." : "Wallet deactivated.", isActive: wallet.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Deposit Admin Routes ──────────────────────
const Deposit = require("../models/Deposit");

router.get("/deposits", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [deposits, total] = await Promise.all([
      Deposit.find(filter).populate("user","name email").populate("processedBy","name email").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Deposit.countDocuments(filter),
    ]);
    res.json({ success: true, deposits, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total/parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/deposits/:id/approve", async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id).populate("user","name email");
    if (!deposit) return res.status(404).json({ success: false, message: "طلب الإيداع غير موجود." });
    if (deposit.status !== "pending") return res.status(400).json({ success: false, message: "هذا الطلب تمت معالجته مسبقاً." });
    deposit.status = "approved";
    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();
    await deposit.save();
    let wallet = await Wallet.findOne({ user: deposit.user._id });
    if (!wallet) wallet = await Wallet.create({ user: deposit.user._id });
    const balanceBefore = wallet.balance;
    wallet.balance += deposit.amount;
    wallet.totalDeposited += deposit.amount;
    await wallet.save();
    await Transaction.create({
      user: deposit.user._id, wallet: wallet._id, type: "deposit",
      amount: deposit.amount, balanceBefore, balanceAfter: wallet.balance,
      status: "completed", performedBy: `admin:${req.user.email}`,
      note: `USDT deposit approved — TXID: ${deposit.txid}`,
    });
    res.json({ success: true, message: `تمت الموافقة. تم إضافة ${deposit.amount} USDT للمستخدم.`, deposit, balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/deposits/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ success: false, message: "يرجى إدخال سبب الرفض." });
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ success: false, message: "طلب الإيداع غير موجود." });
    if (deposit.status !== "pending") return res.status(400).json({ success: false, message: "هذا الطلب تمت معالجته مسبقاً." });
    deposit.status = "rejected";
    deposit.rejectionReason = reason.trim();
    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();
    await deposit.save();
    res.json({ success: true, message: "تم رفض طلب الإيداع.", deposit });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Telegram Routes ───────────────────────────
router.post("/telegram/set-webhook", async (req, res) => {
  try {
    const backendUrl = req.body.backendUrl || process.env.BACKEND_URL;
    if (!backendUrl) return res.status(400).json({ success: false, message: "أرسل backendUrl في الـ body أو اضبط BACKEND_URL في .env" });
    const s = await Setting.getSingleton();
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(400).json({ success: false, message: "Telegram bot token غير مضبوط" });
    const axios = require("axios");
    const webhookUrl = `${backendUrl}/api/telegram/webhook`;
    const result = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, { url: webhookUrl, drop_pending_updates: false });
    res.json({ success: result.data.ok, webhookUrl, telegram: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/telegram/register-webhook", async (req, res) => {
  try {
    const { backendUrl } = req.body;
    const s = await Setting.getSingleton();
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(400).json({ success: false, message: "لم يتم إعداد Bot Token. أضفه في الإعدادات أولاً." });
    const base = (backendUrl || process.env.BACKEND_URL || "").replace(/\/$/, "");
    if (!base) return res.status(400).json({ success: false, message: "يرجى إدخال رابط السيرفر (BACKEND_URL)." });
    const webhookUrl = `${base}/api/telegram/webhook`;
    const axios = require("axios");
    const response = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, { url: webhookUrl, drop_pending_updates: true });
    if (response.data.ok) return res.json({ success: true, message: `✅ تم تسجيل Webhook بنجاح: ${webhookUrl}`, webhookUrl });
    return res.status(400).json({ success: false, message: response.data.description || "فشل التسجيل" });
  } catch (err) {
    console.error("register-webhook error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/telegram/webhook-info", async (req, res) => {
  try {
    const s = await Setting.getSingleton();
    const token = s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.json({ success: false, message: "Bot Token غير مُعدّ" });
    const axios = require("axios");
    const response = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    res.json({ success: true, info: response.data.result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Exchange Methods (Dynamic) ──────────────────
const ExchangeMethod = require("../models/ExchangeMethod");

router.get("/exchange-methods", async (req, res) => {
  try {
    const doc = await ExchangeMethod.getSingleton();
    res.json({ success: true, sendMethods: doc.sendMethods, receiveMethods: doc.receiveMethods });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.put("/exchange-methods", async (req, res) => {
  try {
    const { sendMethods, receiveMethods } = req.body;
    const sendIds = (sendMethods || []).map((m) => m.id);
    const recvIds = (receiveMethods || []).map((m) => m.id);
    if (new Set(sendIds).size !== sendIds.length) return res.status(400).json({ success: false, message: "Duplicate send method IDs." });
    if (new Set(recvIds).size !== recvIds.length) return res.status(400).json({ success: false, message: "Duplicate receive method IDs." });

    const allMethods = [...(sendMethods||[]).map(m=>({...m,_dir:"send"})), ...(receiveMethods||[]).map(m=>({...m,_dir:"receive"}))];
    for (const m of allMethods) {
      if (!m.id?.trim()) return res.status(400).json({ success: false, message: `وسيلة بدون معرّف (ID)` });
      if (!m.name?.trim()) return res.status(400).json({ success: false, message: `الوسيلة "${m.id}" بدون اسم` });
      if (!m.symbol?.trim()) return res.status(400).json({ success: false, message: `الوسيلة "${m.id}" بدون رمز عملة` });
      if (m.minAmount > 0 && m.maxAmount > 0 && m.minAmount > m.maxAmount)
        return res.status(400).json({ success: false, message: `الوسيلة "${m.name}": الحد الأدنى أكبر من الأقصى` });
    }

    const doc = await ExchangeMethod.findOneAndUpdate(
      {}, { $set: { sendMethods: sendMethods||[], receiveMethods: receiveMethods||[] } }, { new: true, upsert: true },
    );
    res.json({ success: true, message: "تم الحفظ.", sendMethods: doc.sendMethods, receiveMethods: doc.receiveMethods });
  } catch (error) {
    console.error("Exchange methods save error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/exchange-methods/reset", async (req, res) => {
  try {
    await ExchangeMethod.deleteMany({});
    const doc = await ExchangeMethod.getSingleton();
    res.json({ success: true, message: "تم إعادة تعيين وسائل التبادل للافتراضيات.", sendMethods: doc.sendMethods, receiveMethods: doc.receiveMethods });
  } catch (error) {
    console.error("Exchange methods reset error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
