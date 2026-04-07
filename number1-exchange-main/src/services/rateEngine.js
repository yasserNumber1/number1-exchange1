// src/services/rateEngine.js
// ═══════════════════════════════════════════════════════════════
// محرك الأسعار الديناميكي — يقرأ من API فقط، لا hardcode
// ═══════════════════════════════════════════════════════════════

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

const EGP_SENDERS = ['vodafone', 'instapay', 'fawry', 'orange'];

function findPair(pairs, fromKey, toKey) {
  if (!pairs || !Array.isArray(pairs)) return null;
  return pairs.find(p => p.from === fromKey && p.to === toKey) || null;
}

// ════════════════════════════════════════════════════════════
// getRate
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

  // ── MGO → USDT ────────────────────────────────────────────
  if (fromKey === 'MGO' && toKey === 'USDT') {
    const pair = findPair(pairs, 'USDT', 'MGO');
    if (!pair) return DEFAULT;
    return { rate: pair.sellRate, divide: false, pair };
  }

  // ── INTERNAL → USDT ───────────────────────────────────────
  if (fromKey === 'INTERNAL' && toKey === 'USDT') {
    const pair = findPair(pairs, 'INTERNAL', 'USDT');
    if (!pair) return { rate: 1, divide: false, pair: null };
    return { rate: pair.buyRate, divide: false, pair };
  }

  // ── الحالة العامة (تشمل EGP→USDT و EGP→MGO) ──────────────
  const pair = findPair(pairs, fromKey, toKey);

  if (!pair) {
    // fallback: إذا EGP→MGO غير موجود، احسب عبر USDT
    if (EGP_SENDERS.includes(fromId) && toKey === 'MGO') {
      const egpUsdt = findPair(pairs, fromKey, 'USDT');
      const usdtMgo = findPair(pairs, 'USDT', 'MGO');
      if (egpUsdt && usdtMgo) {
        const combinedRate = egpUsdt.buyRate / usdtMgo.buyRate;
        return { rate: combinedRate, divide: true, pair: null };
      }
    }
    console.warn(`[rateEngine] No pair found: "${fromKey}" → "${toKey}"`);
    return DEFAULT;
  }

  const isEgp = EGP_SENDERS.includes(fromId);
  if (isEgp) {
    return { rate: pair.buyRate, divide: true, pair };
  } else {
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
// getRateDisplay
// ════════════════════════════════════════════════════════════
export function getRateDisplay(fromId, toId, ratesData, fromSymbol, toSymbol) {
  if (!ratesData) return '...';
  const { rate, divide } = getRate(fromId, toId, ratesData);
  if (!rate) return '...';
  const fs = fromSymbol || fromId;
  const ts = toSymbol   || toId;
  if (divide) return `${rate.toFixed(2)} ${fs} = 1 ${ts}`;
  return `1 ${fs} = ${rate.toFixed(4)} ${ts}`;
}

// ════════════════════════════════════════════════════════════
// toOrderType — مصحح لـ EGP→MGO
// ════════════════════════════════════════════════════════════
export function toOrderType(fromId, toId) {
  const MAP = {
    'usdt-trc:wallet-recv':  'USDT_TO_WALLET',
    'usdt-trc:mgo-recv':     'USDT_TO_MONEYGO',
    'wallet-usdt:usdt-recv': 'WALLET_TO_USDT',
    'wallet-usdt:mgo-recv':  'WALLET_TO_MONEYGO',
    'mgo-send:usdt-recv':    'MONEYGO_TO_USDT',
  };

  const key = `${fromId}:${toId}`;
  if (MAP[key]) return MAP[key];

  // EGP → USDT
  if (EGP_SENDERS.includes(fromId) && toId === 'usdt-recv') return 'EGP_TO_USDT';
  // EGP → MoneyGo (الجديد)
  if (EGP_SENDERS.includes(fromId) && toId === 'mgo-recv')  return 'EGP_TO_MONEYGO';

  return 'EGP_TO_USDT';
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