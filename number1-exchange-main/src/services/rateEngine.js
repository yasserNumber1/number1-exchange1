// src/services/rateEngine.js
// Dynamic rate engine — supports both hardcoded IDs and dynamic methods from DB

// Fallback maps for backward compatibility
const FROM_KEY_MAP = {
  'vodafone':    'EGP_VODAFONE',
  'instapay':    'EGP_INSTAPAY',
  'usdt-trc':    'USDT',
  'usdt-bnb':    'USDT',
  'mgo-send':    'MGO',
  'wallet-usdt': 'INTERNAL',
};

const TO_KEY_MAP = {
  'usdt-trc':    'USDT',
  'usdt-bnb':    'USDT',
  'mgo-recv':    'MGO',
  'wallet-recv': 'INTERNAL',
};

const PAYMENT_METHOD_MAP = {
  'vodafone':    'VODAFONE_CASH',
  'instapay':    'INSTAPAY',
  'usdt-trc':    'USDT_TRC20',
  'usdt-bnb':    'USDT_BEP20',
  'mgo-send':    'MONEYGO',
  'wallet-usdt': 'WALLET',
};

const EGP_SENDERS = ['vodafone', 'instapay'];

// Get rateKey from method object or fallback to hardcoded map
// BNB is treated as USDT for rate purposes
function getFromKey(fromId, sendMethod) {
  if (sendMethod?.rateKey) {
    if (sendMethod.rateKey === 'BNB') return 'USDT';
    return sendMethod.rateKey;
  }
  return FROM_KEY_MAP[fromId] || fromId.toUpperCase();
}

function getToKey(toId, recvMethod) {
  if (recvMethod?.rateKey) {
    if (recvMethod.rateKey === 'BNB') return 'USDT';
    return recvMethod.rateKey;
  }
  return TO_KEY_MAP[toId] || toId.toUpperCase();
}

function isEgpSender(fromId, sendMethod) {
  if (sendMethod?.type === 'egp') return true;
  if (sendMethod?.symbol === 'EGP') return true;
  return EGP_SENDERS.includes(fromId);
}

function findPair(pairs, fromKey, toKey) {
  if (!pairs || !Array.isArray(pairs)) return null;
  return pairs.find(p => p.from === fromKey && p.to === toKey) || null;
}

// ════════════════════════════════════════════════════════════
// getRate — now accepts optional sendMethod/recvMethod objects
// ════════════════════════════════════════════════════════════
export function getRate(fromId, toId, ratesData, sendMethod, recvMethod) {
  const DEFAULT = { rate: 1, divide: false, pair: null };
  if (!fromId || !toId || !ratesData) return DEFAULT;

  const pairs   = ratesData.pairs || [];
  const fromKey = getFromKey(fromId, sendMethod);
  const toKey   = getToKey(toId, recvMethod);

  if (!fromKey || !toKey) {
    console.warn(`[rateEngine] Unknown IDs: "${fromId}" → "${toId}"`);
    return DEFAULT;
  }

  // MGO → USDT: user sends MGO, receives USDT → multiply by sellRate
  if (fromKey === 'MGO' && toKey === 'USDT') {
    const pair = findPair(pairs, 'USDT', 'MGO');
    if (!pair) return DEFAULT;
    return { rate: pair.sellRate, divide: false, pair };
  }

  // USDT → EGP (any EGP variant): user sends USDT, receives EGP → multiply by sellRate
  if (fromKey === 'USDT' && toKey.startsWith('EGP_')) {
    const pair = findPair(pairs, toKey, 'USDT');
    if (pair) return { rate: pair.sellRate, divide: false, pair };
  }

  // MGO → EGP (any EGP variant): user sends MGO, receives EGP → multiply by sellRate
  if (fromKey === 'MGO' && toKey.startsWith('EGP_')) {
    const pair = findPair(pairs, toKey, 'MGO');
    if (pair) return { rate: pair.sellRate, divide: false, pair };
  }

  // INTERNAL → USDT: wallet to USDT → multiply by buyRate
  if (fromKey === 'INTERNAL' && toKey === 'USDT') {
    const pair = findPair(pairs, 'INTERNAL', 'USDT');
    if (!pair) return { rate: 1, divide: false, pair: null };
    return { rate: pair.buyRate, divide: false, pair };
  }

  // MGO → INTERNAL: user sends MGO, receives wallet USDT → use sellRate (same logic as MGO→USDT)
  if (fromKey === 'MGO' && toKey === 'INTERNAL') {
    const pair = findPair(pairs, 'MGO', 'INTERNAL');
    if (!pair) {
      // fallback: use USDT→MGO sellRate
      const fallback = findPair(pairs, 'USDT', 'MGO');
      if (fallback) return { rate: fallback.sellRate, divide: false, pair: fallback };
      return DEFAULT;
    }
    return { rate: pair.sellRate, divide: false, pair };
  }

  // INTERNAL → MGO: user sends wallet USDT, receives MGO → use buyRate (same logic as USDT→MGO)
  if (fromKey === 'INTERNAL' && toKey === 'MGO') {
    const pair = findPair(pairs, 'INTERNAL', 'MGO');
    if (!pair) {
      // fallback: use USDT→MGO buyRate
      const fallback = findPair(pairs, 'USDT', 'MGO');
      if (fallback) return { rate: fallback.buyRate, divide: false, pair: fallback };
      return DEFAULT;
    }
    return { rate: pair.buyRate, divide: false, pair };
  }

  // General case
  const pair = findPair(pairs, fromKey, toKey);

  if (!pair) {
    // Fallback: if EGP→MGO not found, calculate via USDT
    if (isEgpSender(fromId, sendMethod) && toKey === 'MGO') {
      const egpUsdt = findPair(pairs, fromKey, 'USDT');
      const usdtMgo = findPair(pairs, 'USDT', 'MGO');
      if (egpUsdt && usdtMgo) {
        const combinedRate = egpUsdt.buyRate / usdtMgo.buyRate;
        return { rate: combinedRate, divide: true, pair: null };
      }
    }
    // Try reverse pair — if the reverse pair goes FROM EGP, we are in X→EGP direction: multiply
    const reversePair = findPair(pairs, toKey, fromKey);
    if (reversePair) {
      const origFromIsEgp = (reversePair.from || '').startsWith('EGP_');
      return { rate: reversePair.sellRate, divide: !origFromIsEgp, pair: reversePair };
    }
    console.warn(`[rateEngine] No pair found: "${fromKey}" → "${toKey}"`);
    return DEFAULT;
  }

  if (isEgpSender(fromId, sendMethod)) {
    // EGP → X: divide sendAmount by buyRate to get X amount
    return { rate: pair.buyRate, divide: true, pair };
  } else {
    // X → Y (both non-EGP): multiply sendAmount by buyRate
    return { rate: pair.buyRate, divide: false, pair };
  }
}

// ════════════════════════════════════════════════════════════
// calcReceiveAmount
// ════════════════════════════════════════════════════════════
export function calcReceiveAmount(sendAmount, fromId, toId, ratesData, sendMethod, recvMethod) {
  const amt = parseFloat(sendAmount) || 0;
  if (amt <= 0) return '';
  const { rate, divide } = getRate(fromId, toId, ratesData, sendMethod, recvMethod);
  if (!rate || rate <= 0) return '';
  const result = divide ? amt / rate : amt * rate;
  return result.toFixed(4);
}

// ════════════════════════════════════════════════════════════
// getRateDisplay
// ════════════════════════════════════════════════════════════
export function getRateDisplay(fromId, toId, ratesData, fromSymbol, toSymbol, sendMethod, recvMethod) {
  if (!ratesData) return '...';
  const { rate, divide } = getRate(fromId, toId, ratesData, sendMethod, recvMethod);
  if (!rate) return '...';
  const fs = fromSymbol || sendMethod?.symbol || fromId;
  const ts = toSymbol   || recvMethod?.symbol || toId;
  if (divide) return `${rate.toFixed(2)} ${fs} = 1 ${ts}`;
  return `1 ${fs} = ${rate.toFixed(4)} ${ts}`;
}

// ════════════════════════════════════════════════════════════
// toOrderType — supports dynamic methods
// ════════════════════════════════════════════════════════════
export function toOrderType(fromId, toId, sendMethod, recvMethod) {
  const MAP = {
    'usdt-trc:wallet-recv':  'USDT_TO_WALLET',
    'usdt-trc:mgo-recv':     'USDT_TO_MONEYGO',
    'usdt-bnb:wallet-recv':  'USDT_TO_WALLET',
    'usdt-bnb:mgo-recv':     'USDT_TO_MONEYGO',
    'wallet-usdt:usdt-trc':  'WALLET_TO_USDT',
    'wallet-usdt:usdt-bnb':  'WALLET_TO_USDT',
    'wallet-usdt:mgo-recv':  'WALLET_TO_MONEYGO',
    'mgo-send:usdt-trc':     'MONEYGO_TO_USDT',
    'mgo-send:usdt-bnb':     'MONEYGO_TO_USDT',
    'mgo-send:wallet-recv':  'MONEYGO_TO_WALLET',
  };

  const key = `${fromId}:${toId}`;
  if (MAP[key]) return MAP[key];

  // EGP → USDT
  if (isEgpSender(fromId, sendMethod) && (toId === 'usdt-trc' || toId === 'usdt-bnb' || recvMethod?.symbol === 'USDT')) return 'EGP_TO_USDT';
  // EGP → MoneyGo
  if (isEgpSender(fromId, sendMethod) && (toId === 'mgo-recv' || recvMethod?.symbol === 'MGO')) return 'EGP_TO_MONEYGO';

  // Dynamic fallback based on method symbols
  if (sendMethod && recvMethod) {
    const from = sendMethod.symbol;
    const to   = recvMethod.symbol;
    if (from === 'USDT' && to === 'MGO')                              return 'USDT_TO_MONEYGO';
    if (from === 'USDT' && to === 'USDT' && recvMethod.type === 'wallet') return 'USDT_TO_WALLET';
    if (from === 'USDT' && to === 'EGP')                              return 'USDT_TO_EGP';
    if (from === 'MGO'  && to === 'USDT')                             return 'MONEYGO_TO_USDT';
    if (from === 'MGO'  && to === 'EGP')                              return 'MONEYGO_TO_EGP';
    if (from === 'EGP'  && to === 'USDT')                             return 'EGP_TO_USDT';
    if (from === 'EGP'  && to === 'MGO')                              return 'EGP_TO_MONEYGO';
    return `${from}_TO_${to}`;
  }

  return 'EGP_TO_USDT';
}

// ════════════════════════════════════════════════════════════
// toPaymentMethod
// ════════════════════════════════════════════════════════════
export function toPaymentMethod(fromId, sendMethod) {
  if (sendMethod?.paymentMethodKey) return sendMethod.paymentMethodKey;
  return PAYMENT_METHOD_MAP[fromId] || 'VODAFONE_CASH';
}

// ════════════════════════════════════════════════════════════
// getCurrencySent
// ════════════════════════════════════════════════════════════
export function getCurrencySent(fromId, sendMethod) {
  if (sendMethod?.symbol) return sendMethod.symbol;
  if (isEgpSender(fromId)) return 'EGP';
  if (fromId === 'mgo-send') return 'MGO';
  return 'USDT';
}

// ════════════════════════════════════════════════════════════
// getDynamicLimits — calculate limits based on send/receive direction
// ════════════════════════════════════════════════════════════
export function getDynamicLimits(sendMethod, recvMethod, ratesData) {
  if (!ratesData || !sendMethod) return { sendMin: 0, sendMax: Infinity };

  const sendSymbol = sendMethod.symbol;
  const recvSymbol = recvMethod?.symbol;

  // Get available balances from rates data
  const available = {
    EGP: ratesData.availableEgp ?? ratesData.maxEgp ?? 300000,
    USDT: ratesData.availableUsdt ?? ratesData.maxUsdt ?? 10000,
    MGO: ratesData.availableMgo ?? ratesData.maxMgo ?? 10000,
  };

  const limits = {
    EGP: { min: ratesData.minEgp || 100, max: available.EGP },
    USDT: { min: ratesData.minUsdt || 10, max: available.USDT },
    MGO: { min: ratesData.minMgo || 10, max: available.MGO },
  };

  // Use per-method limits if set, otherwise global
  const sendMin = sendMethod.limits?.min || sendMethod.minAmount || limits[sendSymbol]?.min || 0;
  const explicitSendMax = sendMethod.limits?.max || sendMethod.maxAmount || 0;
  let sendMax = explicitSendMax > 0 ? explicitSendMax : Infinity;

  // Dynamic max adjustment:
  // When sending (withdrawal from platform's perspective for recv currency):
  //   - The receive currency's available balance limits how much can be sent
  if (recvMethod && recvSymbol && available[recvSymbol] !== undefined) {
    const recvAvailable = available[recvSymbol];
    // Convert recv available back to send currency using rate
    const rateInfo = getRate(sendMethod.id, recvMethod.id, ratesData, sendMethod, recvMethod);
    if (rateInfo && rateInfo.rate > 0) {
      const maxFromRecv = rateInfo.divide
        ? recvAvailable * rateInfo.rate  // EGP = recvAmount * rate
        : recvAvailable / rateInfo.rate; // USDT = recvAmount / rate
      sendMax = Math.min(sendMax, maxFromRecv);
    }
  }

  return {
    sendMin: Math.max(0, sendMin),
    sendMax: Math.max(0, Math.floor(sendMax * 100) / 100),
  };
}
