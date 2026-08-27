// routes/public.js
const express        = require("express");
const router         = express.Router();
const Rate           = require("../models/Rate");
const ExchangeMethod = require("../models/ExchangeMethod");
const mongoose       = require("mongoose");
const crypto         = require("crypto");
const rateLimit      = require("express-rate-limit");

const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.body?.source !== "contact-form",
  message: { success: false, message: "Too many contact messages. Please try again later." },
});

const escapeTelegramHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


// ─── GET /api/public/rates ────────────────────
router.get("/rates", async (req, res) => {
  try {
    const doc = await Rate.getSingleton();
    const pairs = doc.pairs
      .filter((p) => p.enabled)
      .map((p) => ({
        from:     p.from,
        to:       p.to,
        buyRate:  p.buyRate,
        sellRate: p.sellRate,
        label:    p.label,
      }));

    const find = (from, to) =>
      pairs.find((p) => p.from === from && p.to === to);
    const vodafone    = find("EGP_VODAFONE", "USDT");
    const instapay    = find("EGP_INSTAPAY", "USDT");
    const mgo         = find("USDT", "MGO");
    const internal    = find("USDT", "INTERNAL");
    const walletToMgo = find("INTERNAL", "MGO");

    // ── الحدود الدنيا ─────────────────────────
    const minEgp  = doc.minEgp  || 100;
    const minUsdt = doc.minUsdt || doc.minOrderUsdt || 10;
    const minMgo  = doc.minMgo  || 10;

    // ── الرصيد المتاح = الحد الأقصى (يتحدث تلقائياً مع كل طلب مكتمل) ──
    const availableEgp  = doc.availableEgp  ?? doc.maxEgp  ?? 300000;
    const availableUsdt = doc.availableUsdt ?? doc.maxUsdt ?? 10000;
    const availableMgo  = doc.availableMgo  ?? doc.maxMgo  ?? 10000;

    // الحد الأقصى = الرصيد المتاح مباشرةً — لا حاجة لسقف منفصل
    const maxEgp  = availableEgp;
    const maxUsdt = availableUsdt;
    const maxMgo  = availableMgo;

    res.json({
      success: true,
      pairs,

      minEgp,  maxEgp,
      minUsdt, maxUsdt,
      minMgo,  maxMgo,

      availableEgp,
      availableUsdt,
      availableMgo,

      // backward compat
      minOrderUsdt: minUsdt,
      maxOrderUsdt: maxUsdt,

      // EGP <-> USDT
      usdtBuyRate:     vodafone?.buyRate  || 50,   // EGP→USDT: client sends EGP, divide
      usdtSellRate:    vodafone?.sellRate || 49,   // USDT→EGP: client sends USDT, multiply
      vodafoneBuyRate: vodafone?.buyRate  || 50,
      instaPayRate:    instapay?.buyRate  || 50,

      // USDT <-> MGO
      // moneygoRate: client buys MGO (sends USDT) → pair.buyRate
      // moneygoSellRate: client sells MGO (sends MGO, receives USDT) → pair.sellRate
      moneygoRate:     mgo?.buyRate  || 1,
      moneygoSellRate: mgo?.sellRate || 1,

      // USDT <-> INTERNAL wallet
      internalUsdtBuyRate:  internal?.buyRate  || 1,
      internalUsdtSellRate: internal?.sellRate || 1,

      // INTERNAL wallet <-> MGO
      internalUsdtToMoneyGoRate:  walletToMgo?.buyRate  || 1,
      moneyGoToInternalUsdtRate:  walletToMgo?.sellRate || 1,

      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error("Public rates error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});


// ─── GET /api/public/rates/convert ───────────
router.get("/rates/convert", async (req, res) => {
  try {
    const { from, to, type = "buy", amount } = req.query;
    if (!from || !to || !amount)
      return res.status(400).json({ success: false, message: "from, to, amount مطلوبة." });
    const { rate, result } = await Rate.convert(from, to, parseFloat(amount), type);
    res.json({ success: true, from, to, type, amount: parseFloat(amount), rate, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── GET /api/public/payment-methods ──────────
router.get("/payment-methods", async (req, res) => {
  try {
    const PaymentMethod = require("../models/PaymentMethod");
    const doc     = await PaymentMethod.getSingleton();
    const cryptos = (doc.cryptos || []).filter((c) => c.enabled && c.address);
    const wallets = (doc.wallets || []).filter((w) => w.enabled && w.number);
    res.json({ success: true, cryptos, wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/public/wallet-deposit-addresses ─
router.get("/wallet-deposit-addresses", async (req, res) => {
  try {
    const WalletDeposit = mongoose.model("WalletDeposit");
    let doc = await WalletDeposit.findOne();
    if (!doc) return res.json({ success: true, cryptos: [] });
    const cryptos = (doc.cryptos || []).filter((c) => c.enabled && c.address);
    res.json({ success: true, cryptos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/public/deposit-info ─────────────
router.get("/deposit-info", async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    const s = await Setting.getSingleton();
    res.json({
      success: true,
      bank: {
        bankName:      s.depositBankName      || "",
        accountName:   s.depositAccountName   || "",
        accountNumber: s.depositAccountNumber || "",
      },
      usdt: {
        address: s.depositUsdtAddress || "",
        network: s.depositUsdtNetwork || "TRC20",
      },
      note: s.depositNote || "",
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/public/settings ─────────────────
router.get("/settings", async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    const s = await Setting.getSingleton();
    res.json({
      success:         true,
      platformName:    s.platformName,
      platformActive:  s.platformActive,
      maintenanceMode: s.maintenanceMode,
      contactTelegram: s.contactTelegram,
      contactWhatsapp: s.contactWhatsapp,
      contactEmail:    s.contactEmail,
      contactWebsite:  s.contactWebsite,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── POST /api/public/support-message ─────────
router.post("/support-message", contactFormLimiter, async (req, res) => {
  try {
    const rawMessage = String(req.body?.message || "").trim();
    const lang       = String(req.body?.lang || "en").slice(0, 8);
    const page       = String(req.body?.page || "").slice(0, 300);
    const sessionId  = String(req.body?.sessionId || "").trim();
    const isContactForm = req.body?.source === "contact-form";
    const contactName = String(req.body?.name || "").trim();
    const contactEmail = String(req.body?.email || "").trim();
    const contactSubject = String(req.body?.subject || "").trim();

    if (!rawMessage) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }
    if (rawMessage.length > 1500) {
      return res.status(400).json({ success: false, message: "Message is too long." });
    }
    if (isContactForm) {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
      if (!contactName || contactName.length > 120) {
        return res.status(400).json({ success: false, message: "A valid name is required." });
      }
      if (!validEmail || contactEmail.length > 254) {
        return res.status(400).json({ success: false, message: "A valid email is required." });
      }
      if (contactSubject.length > 200) {
        return res.status(400).json({ success: false, message: "Subject is too long." });
      }
    }

    const SupportChat = require("../models/SupportChat");
    const telegramService = require("../services/telegram");
    const emailService = isContactForm ? require("../services/email") : null;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    let chat = sessionId ? await SupportChat.findOne({ sessionId }) : null;
    if (!chat) {
      chat = await SupportChat.create({
        sessionId: crypto.randomUUID(),
        lang,
        page,
        ip,
        messages: [],
      });
    }

    chat.lang = lang;
    chat.page = page || chat.page;
    chat.ip = ip || chat.ip;
    chat.status = "open";
    chat.lastCustomerAt = new Date();
    const storedMessage = isContactForm
      ? [
          `Name: ${contactName}`,
          `Email: ${contactEmail}`,
          `Subject: ${contactSubject || "Not provided"}`,
          "",
          rawMessage,
        ].join("\n")
      : rawMessage;
    chat.messages.push({ sender: "customer", text: storedMessage, source: isContactForm ? "contact-form" : "web" });
    await chat.save();
    const savedCustomerMessage = chat.messages[chat.messages.length - 1];

    const text = [
      "<b>New support chat message</b>",
      `<b>Session:</b> <code>${escapeTelegramHtml(chat.sessionId)}</code>`,
      "",
      `<b>Message:</b>\n${escapeTelegramHtml(storedMessage)}`,
      "",
      `<b>Language:</b> ${escapeTelegramHtml(lang)}`,
      page ? `<b>Page:</b> ${escapeTelegramHtml(page)}` : "",
      `<b>IP:</b> ${escapeTelegramHtml(ip)}`,
      `<b>Time:</b> ${escapeTelegramHtml(new Date().toISOString())}`,
      "",
      isContactForm
        ? "<i>Reply to the customer using the email address above.</i>"
        : "<i>Reply to this Telegram message to answer the customer in the website chat.</i>",
    ].filter(Boolean).join("\n");

    const [telegramResult, emailResult] = await Promise.all([
      telegramService.sendMessage(text),
      isContactForm
        ? emailService.sendContactMessage({
            name: contactName,
            email: contactEmail,
            subject: contactSubject,
            message: rawMessage,
            lang,
            page,
            ip,
            idempotencyKey: chat.sessionId,
          })
        : Promise.resolve({ success: true, skipped: true }),
    ]);
    if (!emailResult.success) {
      return res.status(502).json({
        success: false,
        message: "Email delivery failed.",
      });
    }

    if (telegramResult.success && telegramResult.messageId) {
      chat.telegramMessageIds.addToSet(telegramResult.messageId);
      await chat.save();
    } else if (!telegramResult.success) {
      console.warn("Support message saved to inbox, but Telegram notification failed:", telegramResult.error);
    }

    res.json({
      success: true,
      sessionId: chat.sessionId,
      message: {
        id: String(savedCustomerMessage._id),
        sender: savedCustomerMessage.sender,
        text: savedCustomerMessage.text,
        createdAt: savedCustomerMessage.createdAt,
      },
      deliveries: { inbox: true, telegram: telegramResult.success, email: isContactForm },
    });
  } catch (error) {
    console.error("Support message error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/support-messages/:sessionId", async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId || "").trim();
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session is required." });
    }

    const SupportChat = require("../models/SupportChat");
    const chat = await SupportChat.findOne({ sessionId }).select("sessionId messages status updatedAt");
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    res.json({
      success: true,
      sessionId: chat.sessionId,
      status: chat.status,
      messages: chat.messages.map(m => ({
        id: String(m._id),
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt,
      })),
      updatedAt: chat.updatedAt,
    });
  } catch (error) {
    console.error("Support messages error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/public/exchange-methods ─────────
router.get("/exchange-methods", async (req, res) => {
  try {
    const doc     = await ExchangeMethod.getSingleton();
    const rateDoc = await Rate.getSingleton();

    const availableEgp  = rateDoc.availableEgp  ?? rateDoc.maxEgp  ?? 300000;
    const availableUsdt = rateDoc.availableUsdt ?? rateDoc.maxUsdt ?? 10000;
    const availableMgo  = rateDoc.availableMgo  ?? rateDoc.maxMgo  ?? 10000;

    const limitsMap = {
      EGP:  { min: rateDoc.minEgp  || 100, max: availableEgp,  available: availableEgp  },
      USDT: { min: rateDoc.minUsdt || 10,  max: availableUsdt, available: availableUsdt },
      MGO:  { min: rateDoc.minMgo  || 10,  max: availableMgo,  available: availableMgo  },
    };

    const enrichMethod = (m) => {
      const g = limitsMap[m.symbol] || { min: 0, max: 0, available: 0 };
      return {
        ...(m.toObject ? m.toObject() : m),
        limits: {
          min:       m.minAmount > 0 ? m.minAmount : g.min,
          max:       m.maxAmount > 0 ? m.maxAmount : g.max,
          available: g.available,
        },
      };
    };

    const sendMethods    = doc.sendMethods.filter(m => m.enabled).sort((a,b) => (a.sortOrder||0)-(b.sortOrder||0)).map(enrichMethod);
    const receiveMethods = doc.receiveMethods.filter(m => m.enabled).sort((a,b) => (a.sortOrder||0)-(b.sortOrder||0)).map(enrichMethod);

    res.json({
      success:           true,
      sendMethods,
      receiveMethods,
      allSendMethods:    doc.sendMethods.map(enrichMethod),
      allReceiveMethods: doc.receiveMethods.map(enrichMethod),
      limitsMap,
    });
  } catch (error) {
    console.error("Exchange methods error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/public/bestchange.xml ──────────
router.get("/bestchange.xml", async (req, res) => {
  try {
    const doc = await Rate.getSingleton();
    const { buildBestChangeXML } = require("../services/bestChangeXmlBuilder");
    const xml = buildBestChangeXML(doc);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (error) {
    console.error("BestChange XML feed error:", error);
    res.status(500).send("<error>Server error</error>");
  }
});

module.exports = router;
