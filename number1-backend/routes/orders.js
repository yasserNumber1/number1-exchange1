// ============================================
// routes/orders.js — API الطلبات
// ============================================

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const ExchangeMethod = require("../models/ExchangeMethod");
const Rate = require("../models/Rate");
const { protect, optionalProtect } = require("../middleware/auth");
const { upload } = require("../services/cloudinary");
const telegramService = require("../services/telegram");
const { logOrderEvent } = require("../services/auditService");
const { getCurrencies } = require("../services/balanceEngine");

const ORDER_LIFETIME_MS = 30 * 60 * 1000; // 30 دقيقة

// ══════════════════════════════════════════════
// ⚠ Routes الثابتة لازم تكون قبل Routes الـ :id
// ══════════════════════════════════════════════

// ─── GET /api/orders/by-session/:token ────────
// استرجاع الطلب عبر Session Token
router.get("/by-session/:token", async (req, res) => {
  try {
    const order = await Order.findOne({
      sessionToken: req.params.token,
    }).select("-clientIp -telegramMessageId -adminNote");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found or expired." });
    }

    // التحقق من انتهاء الوقت — لا ننهي الطلبات المكتملة/المرفوضة/الملغاة
    const FINAL_STATUSES = ['completed', 'rejected', 'cancelled', 'expired'];
    if (!FINAL_STATUSES.includes(order.status) && order.expiresAt && new Date() > order.expiresAt) {
      return res
        .status(410)
        .json({
          success: false,
          message: "Order session expired.",
          expired: true,
        });
    }

    const timeRemaining = order.expiresAt
      ? Math.max(0, Math.floor((order.expiresAt - new Date()) / 1000))
      : 0;

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        payment: {
          method: order.payment.method,
          amountSent: order.payment.amountSent,
          currencySent: order.payment.currencySent,
        },
        moneygo: {
          recipientName: order.moneygo.recipientName,
          amountUSD: order.moneygo.amountUSD,
          transferStatus: order.moneygo.transferStatus,
        },
        exchangeRate: {
          finalAmountUSD: order.exchangeRate.finalAmountUSD,
        },
        timeline: order.timeline,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        expiresAt: order.expiresAt,
        timeRemaining, // ثواني متبقية
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/orders/sse/:token ───────────────
// Server-Sent Events — تحديث الحالة تلقائياً
router.get("/sse/:token", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  let lastStatus = null;
  let interval = null;

  const sendUpdate = async () => {
    try {
      const order = await Order.findOne({
        sessionToken: req.params.token,
      }).select("status orderNumber expiresAt updatedAt");

      if (!order) {
        res.write(`data: ${JSON.stringify({ type: "NOT_FOUND" })}\n\n`);
        clearInterval(interval);
        return res.end();
      }

      // لا نُرسل EXPIRED للطلبات المكتملة/المرفوضة/الملغاة حتى لو انتهى expiresAt
      const FINAL_STATUSES_SSE = ['completed', 'rejected', 'cancelled', 'expired'];
      if (!FINAL_STATUSES_SSE.includes(order.status) && order.expiresAt && new Date() > order.expiresAt) {
        res.write(`data: ${JSON.stringify({ type: "EXPIRED" })}\n\n`);
        clearInterval(interval);
        return res.end();
      }

      const timeRemaining = Math.max(
        0,
        Math.floor((order.expiresAt - new Date()) / 1000),
      );

      // إرسال تحديث الحالة إذا تغيرت
      if (order.status !== lastStatus) {
        lastStatus = order.status;
        res.write(
          `data: ${JSON.stringify({
            type: "STATUS_UPDATE",
            status: order.status,
            orderNumber: order.orderNumber,
            timeRemaining,
            updatedAt: order.updatedAt,
          })}\n\n`,
        );
      } else {
        // إرسال ping مع الوقت المتبقي فقط
        res.write(
          `data: ${JSON.stringify({ type: "TICK", timeRemaining })}\n\n`,
        );
      }
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: "ERROR" })}\n\n`);
    }
  };

  // إرسال أول تحديث فوراً
  await sendUpdate();

  // ثم كل 5 ثواني
  interval = setInterval(sendUpdate, 5000);

  // تنظيف عند إغلاق الاتصال
  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

// ─── POST /api/orders/cleanup ─────────────────
// تحديث الطلبات المنتهية إلى حالة expired (لا حذف أبداً)
router.post("/cleanup", async (req, res) => {
  try {
    const result = await Order.updateMany(
      { expiresAt: { $lt: new Date() }, status: { $in: ["pending"] } },
      {
        $set: { status: "expired" },
        $push: {
          timeline: {
            status: "expired",
            message: "انتهت صلاحية الطلب تلقائياً",
            by: "system",
            createdAt: new Date(),
          },
        },
      },
    );
    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/upload-receipt", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "لم يتم إرفاق صورة.",
      });
    }

    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload receipt error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "فشل رفع الصورة.",
    });
  }
});

// ─── GET /api/orders/track/:orderNumber ───────
// تتبع طلب بالرقم (بدون تسجيل دخول)
router.get("/track/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber.toUpperCase(),
    }).select("-clientIp -telegramMessageId -adminNote");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        orderType: order.orderType,
        payment: {
          method: order.payment.method,
          amountSent: order.payment.amountSent,
          currencySent: order.payment.currencySent,
        },
        moneygo: {
          recipientName: order.moneygo.recipientName,
          amountUSD: order.moneygo.amountUSD,
          transferStatus: order.moneygo.transferStatus,
        },
        exchangeRate: {
          finalAmountUSD: order.exchangeRate.finalAmountUSD,
        },
        timeline: order.timeline,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/orders/my ───────────────────────
// طلبات المستخدم الحالي
router.get("/my", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .select("-clientIp -telegramMessageId -adminNote")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── POST /api/orders ─────────────────────────
// إنشاء طلب جديد
router.post("/", optionalProtect, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      payment,
      moneygo,
      exchangeRate,
    } = req.body;

    // ── التحقق من البيانات الأساسية ───────────
    if (
      !customerName ||
      !customerEmail ||
      !orderType ||
      !payment ||
      !moneygo ||
      !exchangeRate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "البيانات المطلوبة غير مكتملة." });
    }
    if (!moneygo.amountUSD) {
      return res.status(400).json({ success: false, message: "المبلغ مطلوب." });
    }
    if (!payment.method || !payment.amountSent || !payment.currencySent) {
      return res
        .status(400)
        .json({ success: false, message: "بيانات الدفع غير مكتملة." });
    }

    // ── التحقق من صحة البريد الإلكتروني ──────
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRx.test(customerEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "البريد الإلكتروني غير صحيح." });
    }

    // ── التحقق من رقم الهاتف (إذا وُجد) — يقبل أرقام دولية ──
    if (payment.senderPhoneNumber) {
      const phoneRx = /^\+?[0-9\s\-]{7,20}$/;
      if (!phoneRx.test(payment.senderPhoneNumber.trim())) {
        return res
          .status(400)
          .json({ success: false, message: "رقم الهاتف غير صحيح." });
      }
    }

    // ═══════════════════════════════════════════════════════
    // Dynamic Exchange Method Validation
    // ═══════════════════════════════════════════════════════

    // Step 1: fetch data — DB failure is a hard error (500)
    let emDoc, rateDoc;
    try {
      emDoc = await ExchangeMethod.getSingleton();
      rateDoc = await Rate.getSingleton();
    } catch (fetchErr) {
      console.error("Validation data fetch failed:", fetchErr.message);
      return res
        .status(500)
        .json({
          success: false,
          message: "فشل في التحقق من البيانات، حاول مجدداً.",
        });
    }

    // Step 2: validate — errors here are real business-rule violations
    {
      // ── Find the send and receive methods by paymentMethodKey or fallback ──
      const sendMethodObj = emDoc.sendMethods.find(
        (m) => m.paymentMethodKey === payment.method || m.id === payment.method,
      );
      // Determine receive method from orderType
      const recvMethodObj = emDoc.receiveMethods.find((m) => {
        if (orderType === "USDT_TO_WALLET" && m.type === "wallet") return true;
        if (orderType === "MONEYGO_TO_WALLET" && m.type === "wallet")
          return true;
        if (orderType === "WALLET_TO_MONEYGO" && m.type === "moneygo")
          return true;
        if (
          orderType === "MONEYGO_TO_USDT" &&
          m.type === "crypto" &&
          m.symbol === "USDT"
        )
          return true;
        if (
          orderType === "WALLET_TO_USDT" &&
          m.type === "crypto" &&
          m.symbol === "USDT"
        )
          return true;
        if (orderType.endsWith("_TO_MONEYGO") && m.type === "moneygo")
          return true;
        if (
          orderType.endsWith("_TO_USDT") &&
          m.type === "crypto" &&
          m.symbol === "USDT"
        )
          return true;
        if (orderType.endsWith("_TO_EGP") && m.type === "egp")
          return true;
        return false;
      });

      // ── Validate send method is enabled ──
      if (sendMethodObj && !sendMethodObj.enabled) {
        return res.status(400).json({
          success: false,
          message: `وسيلة الإرسال "${sendMethodObj.name}" معطّلة حالياً.`,
        });
      }

      // ── Validate receive method is enabled ──
      if (recvMethodObj && !recvMethodObj.enabled) {
        return res.status(400).json({
          success: false,
          message: `وسيلة الاستلام "${recvMethodObj.name}" معطّلة حالياً.`,
        });
      }

      // ── Validate compatibility ──
      if (
        sendMethodObj &&
        recvMethodObj &&
        sendMethodObj.compatibleWith?.length > 0
      ) {
        if (!sendMethodObj.compatibleWith.includes(recvMethodObj.id)) {
          return res.status(400).json({
            success: false,
            message: `لا يمكن التحويل من "${sendMethodObj.name}" إلى "${recvMethodObj.name}" — هذا الزوج غير متاح.`,
          });
        }
      }

      // ── Validate amount ──
      const sendAmt = parseFloat(payment.amountSent);
      if (isNaN(sendAmt) || sendAmt <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "المبلغ يجب أن يكون أكبر من صفر." });
      }

      // Per-method limits (0 max = no explicit inbound ceiling)
      const sendMin = sendMethodObj?.minAmount || 0;
      const sendMax = sendMethodObj?.maxAmount || 0;

      const currency = payment.currencySent || "EGP";

      // The platform receives the sent currency, so its current liquidity must
      // never cap an inbound customer payment. Only an explicit per-method max
      // may limit the sent amount; platform liquidity is checked on the payout.
      const globalMinimums = {
        EGP: rateDoc.minEgp || 100,
        USDT: rateDoc.minUsdt || 10,
        MGO: rateDoc.minMgo || 10,
      };

      const effectiveMin =
        sendMin > 0 ? sendMin : globalMinimums[currency] || 0;
      const effectiveMax =
        sendMax > 0 ? sendMax : Infinity;

      if (effectiveMin > 0 && sendAmt < effectiveMin) {
        return res.status(400).json({
          success: false,
          message: `الحد الأدنى للمبلغ هو ${effectiveMin.toLocaleString()} ${currency}`,
        });
      }
      if (
        effectiveMax > 0 &&
        effectiveMax < Infinity &&
        sendAmt > effectiveMax
      ) {
        return res.status(400).json({
          success: false,
          message: `الحد الأقصى للمبلغ هو ${effectiveMax.toLocaleString()} ${currency}`,
        });
      }

      // ── Validate available liquidity for the RECEIVE currency ──
      const recvAmt = parseFloat(
        moneygo.amountUSD || exchangeRate.finalAmountUSD || 0,
      );
      const { currencyRecv } = getCurrencies({ orderType, payment });
      if (currencyRecv && recvAmt > 0) {
        const recvAvailable = {
          EGP: rateDoc.availableEgp ?? rateDoc.maxEgp ?? 300000,
          USDT: rateDoc.availableUsdt ?? rateDoc.maxUsdt ?? 10000,
          MGO: rateDoc.availableMgo ?? rateDoc.maxMgo ?? 10000,
        }[currencyRecv];

        if (recvAvailable !== undefined && recvAmt > recvAvailable) {
          return res.status(400).json({
            success: false,
            message: `الرصيد المتاح من ${currencyRecv} غير كافٍ. المتاح: ${recvAvailable.toLocaleString()} ${currencyRecv}`,
          });
        }
      }
    }

    // ══════════════════════════════════════════════════════════
    // التحقق من رصيد المحفظة لطلبات WALLET_* outflow
    // ══════════════════════════════════════════════════════════
    const WALLET_OUTFLOW_TYPES = [
      "WALLET_TO_USDT",
      "WALLET_TO_MONEYGO",
      "EGP_WALLET_TO_MONEYGO",
    ];
    if (WALLET_OUTFLOW_TYPES.includes(orderType)) {
      if (!req.user) {
        return res
          .status(401)
          .json({
            success: false,
            message: "يجب تسجيل الدخول لاستخدام المحفظة الداخلية.",
          });
      }
      const { debitWallet } = require("../services/balanceEngine");
      const mockOrderData = {
        user: req.user._id,
        payment: { amountSent: payment.amountSent },
        orderType,
      };
      const debitResult = await debitWallet({ ...mockOrderData, _id: "temp" }); // Use full debit logic early
      if (!debitResult.success) {
        return res.status(400).json({
          success: false,
          message:
            debitResult.reason === "insufficient_balance"
              ? `رصيد المحفظة غير كافٍ. رصيدك الحالي: ${debitResult.balance || 0} USDT`
              : debitResult.reason === "wallet_inactive"
                ? "المحفظة الداخلية معطّلة."
                : "خطأ في المحفظة.",
        });
      }
      // Note: Actual debit will be re-called after Order.create, but this prevents invalid creation
    }

    // ── التحقق من معرّف الاستلام (ليس مطلوباً للحساب الداخلي) ──
    const NO_RECIPIENT_TYPES = [
      "USDT_TO_WALLET",
      "WALLET_TO_USDT",
      "WALLET_TO_MONEYGO",
      "MONEYGO_TO_WALLET",
      "EGP_WALLET_TO_MONEYGO", // القديم — يمكن إزالته لاحقاً
    ];

    // ── التحقق من معرّف الاستلام ──
    const requiresRecipient = !NO_RECIPIENT_TYPES.includes(orderType);
    if (
      requiresRecipient &&
      (!moneygo.recipientPhone || moneygo.recipientPhone.trim().length < 3)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "معرّف المستلم مطلوب." });
    }
    // ── التحقق من TXID إذا أرسله المستخدم ────
    if (
      (payment.method === "USDT_TRC20" || payment.method === "USDT_BEP20") &&
      payment.txHash
    ) {
      // منع استخدام نفس الـ TXID مرتين
      const duplicate = await Order.findOne({
        "payment.txHash": payment.txHash,
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "رقم المعاملة (TXID) مستخدم مسبقاً في طلب آخر.",
        });
      }
      // التحقق من وجود الـ TXID على شبكة TRON
      if (process.env.TRONGRID_API_KEY) {
        try {
          const tronRes = await fetch(
            `https://api.trongrid.io/v1/transactions/${payment.txHash}`,
            { headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY } },
          );
          const tronData = await tronRes.json();
          if (!tronData?.data?.[0]) {
            return res.status(400).json({
              success: false,
              message:
                "رقم المعاملة (TXID) غير موجود على شبكة TRON — تأكد من نسخه بشكل صحيح.",
            });
          }
        } catch (tronErr) {
          console.warn("TronGrid check failed:", tronErr.message);
          // لا نوقف الطلب لو فشل الاتصال بـ TronGrid
        }
      }
    }

    // ── إنشاء الطلب ───────────────────────────
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + ORDER_LIFETIME_MS);

    console.log(
      "[Order] Creating order:",
      JSON.stringify({
        orderType,
        "payment.method": payment.method,
        "payment.currencySent": payment.currencySent,
        "payment.amountSent": payment.amountSent,
        "moneygo.amountUSD": moneygo?.amountUSD,
        "exchangeRate.appliedRate": exchangeRate?.appliedRate,
        "exchangeRate.finalAmountUSD": exchangeRate?.finalAmountUSD,
      }),
    );

    const order = await Order.create({
      user: req.user?._id || null,
      customerName,
      customerEmail,
      customerPhone,
      orderType,
      payment,
      moneygo,
      exchangeRate,
      clientIp: req.ip,
      sessionToken,
      expiresAt,
      timeline: [
        {
          status: "pending",
          message: "Order created successfully.",
          by: "system",
        },
      ],
    });

    // ── إشعار التليغرام ───────────────────────
    let telegramMessageId = null;
    try {
      const tgResult = await telegramService.notifyNewOrder(order);
      if (tgResult.success) telegramMessageId = tgResult.messageId;
    } catch (tgError) {
      console.error("Telegram notification failed:", tgError.message);
    }

    // ── خصم رصيد المحفظة فوراً لطلبات WALLET_TO_* ──
    if (orderType === "WALLET_TO_USDT" || orderType === "WALLET_TO_MONEYGO") {
      try {
        const { debitWallet } = require("../services/balanceEngine");
        const debitResult = await debitWallet(order);
        if (!debitResult.success) {
          // إلغاء الطلب فوراً لو فشل الخصم (race condition)
          order.status = "cancelled";
          order.addTimeline(
            "cancelled",
            "فشل خصم رصيد المحفظة — رصيد غير كافٍ",
            "system",
          );
          await order.save();
          return res.status(400).json({
            success: false,
            message: `رصيد المحفظة غير كافٍ. رصيدك الحالي: ${debitResult.balance ?? 0} USDT`,
          });
        }
      } catch (debitErr) {
        console.error("Wallet debit failed:", debitErr.message);
      }
    }

    // ── حجز السيولة فوراً عند إنشاء الطلب ──
    let liquidityReserved = false;
    try {
      const { reserveLiquidity } = require("../services/balanceEngine");
      liquidityReserved = await reserveLiquidity(order);
    } catch (reserveErr) {
      console.error("Liquidity reservation failed:", reserveErr.message);
    }

    // حفظ telegramMessageId و liquidityReserved دفعة واحدة
    if (telegramMessageId || liquidityReserved) {
      if (telegramMessageId) order.telegramMessageId = telegramMessageId;
      if (liquidityReserved) order.liquidityReserved = true;
      try {
        await order.save();
      } catch (saveErr) {
        console.error("Order post-create save failed:", saveErr.message);
      }
    }

    // ── إرسال صورة الإيصال للتليغرام ──────────
    if (payment.receiptImageUrl) {
      try {
        await telegramService.sendReceiptPhoto(
          payment.receiptImageUrl,
          `📎 إيصال الطلب: ${order.orderNumber}`,
        );
      } catch (err) {
        console.error("Failed to send receipt photo:", err.message);
      }
    }

    // ── تسجيل الإنشاء في AuditLog ────────────────
    await logOrderEvent(order, req.user ? `user:${req.user.email}` : 'guest', 'تم إنشاء الطلب', 'CREATED');

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        sessionToken: order.sessionToken,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error.name,
      error.message,
      error.stack?.split("\n").slice(0, 5).join("\n"),
    );
    // Surface Mongoose validation errors to the client
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res
        .status(400)
        .json({ success: false, message: msg || "بيانات الطلب غير صالحة." });
    }
    // Surface pre-save hook errors (they throw plain Error)
    if (error.message && !error.message.includes("Server error")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error creating order." });
  }
});

// ─── POST /api/orders/:id/verify-usdt ─────────
// التحقق من معاملة USDT
router.post("/:id/verify-usdt", async (req, res) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res
        .status(400)
        .json({ success: false, message: "TX Hash is required." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    if (
      order.payment.method !== "USDT_TRC20" &&
      order.payment.method !== "USDT_BEP20"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Order is not USDT type." });
    }
    if (order.verification.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Order already verified." });
    }

    const verificationResult = await trongridService.verifyUSDTTransaction({
      txHash,
      expectedAddress: process.env.USDT_RECEIVING_ADDRESS,
      expectedAmount: order.payment.amountSent,
    });

    if (!verificationResult.success) {
      return res
        .status(400)
        .json({ success: false, message: verificationResult.message });
    }

    order.payment.txHash = txHash;
    order.status = "verified";
    order.verification.isVerified = true;
    order.verification.verifiedAt = new Date();
    order.verification.verificationMethod = "auto";
    order.addTimeline(
      "verified",
      `USDT verified automatically. TX: ${txHash}`,
      "system",
    );
    await order.save();

    await telegramService.notifyOrderUpdate(order, "verified", `TX: ${txHash}`);

    res.json({
      success: true,
      message: "USDT transaction verified successfully.",
      order: { orderNumber: order.orderNumber, status: order.status },
    });
  } catch (error) {
    console.error("USDT verify error:", error);
    res.status(500).json({ success: false, message: "Verification error." });
  }
});

// ─── POST /api/orders/:orderNumber/cancel ────
// إلغاء الطلب من قبل العميل
router.post("/:orderNumber/cancel", async (req, res) => {
  try {
    const { sessionToken, reason } = req.body;
    const orderNumber = req.params.orderNumber.toUpperCase();

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود." });
    }

    // التحقق من الـ session token (أمان)
    if (sessionToken && order.sessionToken !== sessionToken) {
      return res.status(403).json({ success: false, message: "غير مصرح." });
    }

    // السماح بالإلغاء فقط في مرحلة pending أو verifying
    if (!["pending", "verifying"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن إلغاء الطلب بعد بدء المعالجة.",
      });
    }

    const wasReserved = order.liquidityReserved;
    order.status = "cancelled";
    order.moneygo.transferStatus = "failed";
    order.liquidityReserved = false;
    order.addTimeline(
      "cancelled",
      reason ? `إلغاء العميل: ${reason}` : "إلغاء العميل",
      "customer",
    );
    await order.save();

    // إعادة السيولة المحجوزة عند الإلغاء
    if (wasReserved) {
      try {
        const { releaseLiquidity } = require("../services/balanceEngine");
        await releaseLiquidity(order);
      } catch (e) {
        console.error("releaseLiquidity on cancel failed:", e.message);
      }
    }

    // إعادة رصيد المحفظة عند إلغاء طلبات WALLET_TO_*
    if (
      order.orderType === "WALLET_TO_USDT" ||
      order.orderType === "WALLET_TO_MONEYGO"
    ) {
      try {
        const { refundWallet } = require("../services/balanceEngine");
        await refundWallet(order);
      } catch (e) {
        console.error("refundWallet on cancel failed:", e.message);
      }
    }

    // إشعار التليغرام بالإلغاء
    try {
      await telegramService.notifyOrderCancelled(order, reason || "");
      // تعديل الرسالة الأصلية إذا كانت موجودة
      if (order.telegramMessageId) {
        await telegramService.editOrderMessage(
          order.telegramMessageId,
          order,
          "cancel",
        );
      }
    } catch (tgErr) {
      console.error("Telegram cancel notify failed:", tgErr.message);
    }

    // ── تسجيل الإلغاء في AuditLog ─────────────────
    await logOrderEvent(order, 'customer', reason ? `إلغاء العميل: ${reason}` : 'إلغاء العميل');

    res.json({ success: true, message: "تم إلغاء الطلب." });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
