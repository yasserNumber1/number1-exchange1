// src/services/rateEngine.js
// ═══════════════════════════════════════════════════════════════
// محرك الأسعار الديناميكي — يقرأ من API فقط، لا hardcode
// ═══════════════════════════════════════════════════════════════

// ── خريطة تحويل fromId → from key في DB ──────────────────────
const FROM_KEY_MAP = {
  'vodafone':    'EGP_VODAFONE',
  'instapay':    'EGP_INSTAPAY',
  'fawry':       'EGP_FAWRY',
  'orange':      'EGP_ORANGE',
  'usdt-trc':    'USDT',
  'mgo-send':    'MGO',
  'wallet-usdt': 'INTERNAL',
};

const TO_KEY_MAP = {
  'usdt-recv':   'USDT',
  'mgo-recv':    'MGO',
  'wallet-recv': 'INTERNAL',
};

// ── هل المُرسِل يدفع جنيه مصري؟ ─────────────────────────────
const EGP_SENDERS = ['vodafone', 'instapay', 'fawry', 'orange'];

// ════════════════════════════════════════════════════════════
// findPair — إيجاد الزوج في مصفوفة الأسعار
// ════════════════════════════════════════════════════════════
function findPair(pairs, fromKey, toKey) {
  if (!pairs || !Array.isArray(pairs)) return null;
  return pairs.find(p => p.from === fromKey && p.to === toKey) || null;
}

// ════════════════════════════════════════════════════════════
// getRate — حساب السعر من مصفوفة الأزواج
//
// المنطق:
//   EGP → USDT/MGO : العميل يدفع جنيه (from) ويستلم USDT/MGO (to)
//                    → نستخدم buyRate ونقسم
//                    مثال: 100 EGP ÷ 50 = 2 USDT
//
//   USDT → MGO     : العميل يدفع USDT ويستلم MGO
//                    → نستخدم buyRate ونضرب
//                    مثال: 10 USDT × 0.995 = 9.95 MGO
//
//   MGO → USDT     : العميل يدفع MGO ويستلم USDT
//                    → نستخدم sellRate للزوج USDT/MGO ونضرب
//                    مثال: 10 MGO × 1.005 = 10.05 USDT
// ════════════════════════════════════════════════════════════
export function getRate(fromId, toId, ratesData) {
  const DEFAULT = { rate: 1, divide: false, pair: null };

  if (!fromId || !toId || !ratesData) return DEFAULT;

  const pairs   = ratesData.pairs || [];
  const fromKey = FROM_KEY_MAP[fromId];
  const toKey   = TO_KEY_MAP[toId];

  if (!fromKey || !toKey) {
    console.warn(`[rateEngine] Unknown IDs: "${fromId}" → "${toId}"`);
    return DEFAULT;
  }

  // ── حالة خاصة: MGO → USDT ────────────────────────────────
  // نبحث عن زوج USDT/MGO ونستخدم sellRate (نحن نشتري MGO)
  if (fromKey === 'MGO' && toKey === 'USDT') {
    const pair = findPair(pairs, 'USDT', 'MGO');
    if (!pair) return DEFAULT;
    return { rate: pair.sellRate, divide: false, pair };
  }

  // ── حالة خاصة: INTERNAL → USDT ──────────────────────────
  if (fromKey === 'INTERNAL' && toKey === 'USDT') {
    const pair = findPair(pairs, 'INTERNAL', 'USDT');
    if (!pair) return { rate: 1, divide: false, pair: null };
    return { rate: pair.buyRate, divide: false, pair };
  }

  // ── الحالة العامة: بحث مباشر ─────────────────────────────
  const pair = findPair(pairs, fromKey, toKey);

  if (!pair) {
    console.warn(`[rateEngine] No pair found: "${fromKey}" → "${toKey}"`);
    return DEFAULT;
  }

  const isEgp = EGP_SENDERS.includes(fromId);

  if (isEgp) {
    // العميل يدفع جنيه → نقسم على buyRate
    return { rate: pair.buyRate, divide: true, pair };
  } else {
    // العميل يدفع USDT/INTERNAL → نضرب في buyRate
    return { rate: pair.buyRate, divide: false, pair };
  }
}

// ════════════════════════════════════════════════════════════
// calcReceiveAmount
// ════════════════════════════════════════════════════════════
export function calcReceiveAmount(sendAmount, fromId, toId, ratesData) {
  const amt = parseFloat(sendAmount) || 0;
  if (amt <= 0) return '';

  const { rate, divide } = getRate(fromId, toId, ratesData);
  if (!rate || rate <= 0) return '';

  const result = divide ? amt / rate : amt * rate;
  return result.toFixed(4);
}

// ════════════════════════════════════════════════════════════
// getRateDisplay — نص السعر للواجهة
// ════════════════════════════════════════════════════════════
export function getRateDisplay(fromId, toId, ratesData, fromSymbol, toSymbol) {
  if (!ratesData) return '...';

  const { rate, divide, pair } = getRate(fromId, toId, ratesData);
  if (!rate) return '...';

  const fs = fromSymbol || fromId;
  const ts = toSymbol   || toId;

  if (divide) {
    return `${rate.toFixed(2)} ${fs} = 1 ${ts}`;
  }
  return `1 ${fs} = ${rate.toFixed(4)} ${ts}`;
}

// ════════════════════════════════════════════════════════════
// toOrderType
// ════════════════════════════════════════════════════════════
export function toOrderType(fromId, toId) {
  const MAP = {
    'usdt-trc:wallet-recv':  'USDT_TO_WALLET',
    'usdt-trc:mgo-recv':     'USDT_TO_MONEYGO',
    'wallet-usdt:usdt-recv': 'WALLET_TO_USDT',
    'wallet-usdt:mgo-recv':  'WALLET_TO_MONEYGO',
    'mgo-send:usdt-recv':    'MONEYGO_TO_USDT',
  };
  const result = MAP[`${fromId}:${toId}`];
  if (!result) {
    if (EGP_SENDERS.includes(fromId)) return 'EGP_WALLET_TO_MONEYGO';
    return 'EGP_WALLET_TO_MONEYGO';
  }
  return result;
}

// ════════════════════════════════════════════════════════════
// toPaymentMethod
// ════════════════════════════════════════════════════════════
export function toPaymentMethod(fromId) {
  const MAP = {
    'vodafone':    'VODAFONE_CASH',
    'instapay':    'INSTAPAY',
    'fawry':       'FAWRY',
    'orange':      'ORANGE_CASH',
    'usdt-trc':    'USDT_TRC20',
    'mgo-send':    'MONEYGO',
    'wallet-usdt': 'WALLET',
  };
  return MAP[fromId] || 'VODAFONE_CASH';
}

// ════════════════════════════════════════════════════════════
// getCurrencySent
// ════════════════════════════════════════════════════════════
export function getCurrencySent(fromId) {
  if (EGP_SENDERS.includes(fromId)) return 'EGP';
  if (fromId === 'mgo-send')        return 'MGO';
  return 'USDT';
}